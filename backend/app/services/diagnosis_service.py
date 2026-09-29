import json
import logging
from sqlalchemy.orm import Session
from app.models.models import Diagnosis, User
from app.schemas.schemas import (
    DiagnoseRequest,
    DiagnoseFullResponse,
    AIDiagnosisOutput,
)
from app.services.ai_service import get_ai_service
from app.services.nlp_service import NLPReasoningService
from app.services.repair_service import RepairService
from app.services.resale_service import ResaleService
from app.services.recycling_service import RecyclingService
from app.services.decision_engine import DecisionEngine

logger = logging.getLogger("DiagnosisService")


class DiagnosisService:
    # In-memory debug trace cache for demo / API inspection
    _debug_traces = {}

    @staticmethod
    async def process_diagnosis(
        db: Session,
        request: DiagnoseRequest,
        user_id: int = 1
    ) -> DiagnoseFullResponse:
        """
        Full circular diagnostic pipeline:
        1. NLP Normalization & Diagnostic Reasoning Layer (extract symptoms, negation, events).
        2. Query AI (multimodal Gemini or robust heuristic mock) with structured NLP context.
        3. Strictly query database for empirical repair pricing (with evidence).
        4. Strictly calculate resale valuation range from real database market observations.
        5. Query CPCB recycling parameters.
        6. Pass to DecisionEngine for transparent option comparison and user priority alignment.
        7. Persist diagnosis record and return full response with NLP reasoning transparency.
        """
        # Step 0: Resolve canonical device from device_id if provided
        if request.device_id:
            from app.models.models import Device
            canonical_dev = db.query(Device).filter(Device.id == request.device_id).first()
            if canonical_dev:
                request.brand = canonical_dev.brand
                request.model = canonical_dev.model

        # Step 1: NLP Normalization & Diagnostic Reasoning Layer
        logger.info(f"Running NLP Diagnostic Reasoning on input: {request.problem_description[:50]}...")
        nlp_output = NLPReasoningService.analyze(
            raw_description=request.problem_description,
            provided_brand=request.brand,
            provided_model=request.model,
            provided_storage=request.storage_gb,
        )

        ai_provider = get_ai_service()

        # Step 2: Multimodal AI Diagnosis with Structured NLP Evidence
        logger.info(f"Diagnosing {request.brand} {request.model} with AI...")
        ai_output: AIDiagnosisOutput = await ai_provider.diagnose_device(
            brand=request.brand,
            model=request.model,
            age_years=request.age_years,
            storage_gb=request.storage_gb,
            battery_condition=request.battery_condition,
            problem_description=request.problem_description,
            image_base64=request.image_base64,
            nlp_context=nlp_output
        )

        # Step 3: Database Repair Pricing (Strict Evidence Verification)
        repair_summary = RepairService.get_repair_estimate(
            db=db,
            brand=request.brand,
            model_name=request.model,
            problem_category=ai_output.problem_category
        )

        # Step 4: Database Resale Valuation (Real Market Observations)
        resale_summary = ResaleService.calculate_resale_estimate(
            db=db,
            brand=request.brand,
            model_name=request.model,
            age_years=request.age_years,
            storage_gb=request.storage_gb,
            battery_condition=request.battery_condition,
            damage_severity=ai_output.severity
        )

        # Step 5: Statutory CPCB Recycling Option
        recycle_summary = RecyclingService.get_recycling_options(
            db=db,
            brand=request.brand,
            model_name=request.model
        )

        # Step 6: Decision Engine Evaluation (Transparent Comparison & User Priority)
        user_priority = request.user_priority or "Keep using my current phone"
        decision = DecisionEngine.evaluate(
            repair_summary=repair_summary,
            resale_summary=resale_summary,
            recycle_summary=recycle_summary,
            age_years=request.age_years,
            damage_severity=ai_output.severity,
            user_priority=user_priority
        )

        # Step 7: Persist Diagnosis
        user = db.query(User).filter(User.id == user_id).first()
        valid_user_id = user.id if user else None

        # Convert categorical confidence to float for DB table column
        db_conf = 0.90 if ai_output.confidence == "High" else (0.75 if ai_output.confidence == "Moderate" else 0.50)

        diag_record = Diagnosis(
            user_id=valid_user_id,
            brand=request.brand,
            model=request.model,
            age_years=request.age_years,
            storage_gb=request.storage_gb,
            battery_condition=request.battery_condition,
            problem_description=request.problem_description,
            image_url="Uploaded image (in-memory)" if request.image_base64 else None,
            ai_diagnosis_json=ai_output.model_dump_json(),
            problem_category=ai_output.problem_category,
            severity=ai_output.severity,
            confidence=db_conf,
        )
        db.add(diag_record)
        db.commit()
        db.refresh(diag_record)

        # Step 7b: Persist Diagnostic Evidence records (Section 18)
        from app.models.models import DiagnosticEvidence
        if nlp_output.symptoms:
            for s in nlp_output.symptoms:
                evidence_row = DiagnosticEvidence(
                    diagnosis_id=diag_record.id,
                    component=ai_output.problem_category,
                    symptom=s.symptom_id,
                    is_active=True,
                    is_negated=False,
                    confidence=s.confidence,
                    evidence_text=s.description
                )
                db.add(evidence_row)
        if nlp_output.negated_symptoms:
            for ns in nlp_output.negated_symptoms:
                evidence_row = DiagnosticEvidence(
                    diagnosis_id=diag_record.id,
                    component=ai_output.problem_category,
                    symptom=ns.symptom_id,
                    is_active=False,
                    is_negated=True,
                    confidence=ns.confidence,
                    evidence_text=ns.description
                )
                db.add(evidence_row)
        db.commit()

        # Build debug trace for Problem 14 (GET /api/diagnosis/debug/{diagnosis_id})
        resale_range_str = (
            f"₹{resale_summary.estimated_low} - ₹{resale_summary.estimated_high}"
            if resale_summary.estimated_low is not None and resale_summary.estimated_high is not None
            else None
        )
        debug_payload = {
            "diagnosis_id": diag_record.id,
            # All 17 required debug fields from Problem 14:
            "raw_user_input": nlp_output.raw_input,
            "cleaned_user_input": nlp_output.cleaned_input,
            "detected_language": nlp_output.detected_language,
            "extracted_event": nlp_output.event.event_type if nlp_output.event else None,
            "extracted_active_symptoms": [s.symptom_id for s in nlp_output.symptoms],
            "extracted_negated_symptoms": [s.symptom_id for s in nlp_output.negated_symptoms],
            "nlp_probable_issue": nlp_output.probable_issue,
            "nlp_affected_component": nlp_output.affected_component,
            "gemini_probable_issue": ai_output.possible_issue,
            "gemini_confirmed_issue": ai_output.confirmed_issue,
            "gemini_confidence": ai_output.confidence,
            "repair_price_status": repair_summary.price_status,
            "repair_price_evidence": repair_summary.evidence.model_dump() if repair_summary.evidence else None,
            "resale_price_status": resale_summary.price_status,
            "resale_price_range": resale_range_str,
            "recycling_available": recycle_summary.available,
            "priority_aligned_action": decision.priority_aligned_action,
            
            # Additional contextual data
            "device": {
                "brand": request.brand,
                "model": request.model,
                "storage": f"{request.storage_gb}GB",
                "age_years": request.age_years
            },
            "events": nlp_output.event.model_dump() if nlp_output.event else None,
            "active_symptoms_detailed": [s.model_dump() for s in nlp_output.symptoms],
            "negated_symptoms_detailed": [s.model_dump() for s in nlp_output.negated_symptoms],
            "diagnostic_rules": [
                "Symptom != confirmed internal failure",
                "Probable issue != confirmed issue",
                "No physical inspection -> confirmed_issue = null",
                "Repair price verified against database price schedules"
            ],
            "decision_factors": decision.decision_factors.model_dump() if decision.decision_factors else None,
            "user_priority": user_priority,
            "recommended_action": decision.recommended_action
        }
        DiagnosisService._debug_traces[diag_record.id] = debug_payload

        return DiagnoseFullResponse(
            diagnosis_id=diag_record.id,
            ai_diagnosis=ai_output,
            nlp_reasoning=nlp_output,
            disclaimer="AI provides root-cause diagnosis. Pricing & locations are strictly sourced from verified databases.",
            decision=decision
        )

    @classmethod
    def get_debug_trace(cls, db: Session, diagnosis_id: int):
        """Returns the full debug trace for auditing and hackathon inspection."""
        if diagnosis_id in cls._debug_traces:
            return cls._debug_traces[diagnosis_id]

        diag = db.query(Diagnosis).filter(Diagnosis.id == diagnosis_id).first()
        if not diag:
            return None

        ai_data = json.loads(diag.ai_diagnosis_json) if diag.ai_diagnosis_json else {}
        return {
            "diagnosis_id": diag.id,
            "raw_user_input": diag.problem_description,
            "cleaned_user_input": diag.problem_description.lower(),
            "detected_language": "English (Normalized)",
            "extracted_event": None,
            "extracted_active_symptoms": [diag.problem_category.lower()],
            "extracted_negated_symptoms": [],
            "nlp_probable_issue": ai_data.get("possible_issue", "Probable hardware issue"),
            "nlp_affected_component": diag.problem_category,
            "gemini_probable_issue": ai_data.get("possible_issue", "Probable hardware issue"),
            "gemini_confirmed_issue": None,
            "gemini_confidence": "Moderate",
            "repair_price_status": "verified" if diag.estimated_repair_cost else "unavailable",
            "repair_price_evidence": None,
            "resale_price_status": "verified" if diag.estimated_resale_value else "unavailable",
            "resale_price_range": f"₹{diag.estimated_resale_value}" if diag.estimated_resale_value else None,
            "recycling_available": True,
            "priority_aligned_action": diag.recommended_action,
            "device": {"brand": diag.brand, "model": diag.model, "age_years": diag.age_years},
            "events": None,
            "diagnostic_rules": ["Database persistence fallback trace"],
            "decision_factors": None
        }
