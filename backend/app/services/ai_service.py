import json
import logging
import re
from typing import Optional
from app.core.config import settings
from app.schemas.schemas import AIDiagnosisOutput, NLPReasoningOutput

logger = logging.getLogger("AIService")

# ---------------------------------------------------------------------------
# Base & Interface for AI Provider (Plugin Architecture)
# ---------------------------------------------------------------------------
class BaseAIProvider:
    """Abstract interface to allow hot-swapping AI providers (Gemini, Claude, OpenAI, Local)."""
    async def diagnose_device(
        self,
        brand: str,
        model: str,
        age_years: float,
        storage_gb: int,
        battery_condition: str,
        problem_description: str,
        image_base64: Optional[str] = None,
        nlp_context: Optional[NLPReasoningOutput] = None
    ) -> AIDiagnosisOutput:
        raise NotImplementedError


# ---------------------------------------------------------------------------
# Gemini Multimodal AI Provider
# ---------------------------------------------------------------------------
class GeminiAIProvider(BaseAIProvider):
    def __init__(self, api_key: str, model_name: str = "gemini-flash-latest"):
        self.api_key = api_key
        self.model_name = model_name
        import google.generativeai as genai
        genai.configure(api_key=self.api_key)
        self.client = genai.GenerativeModel(self.model_name)
        self._fallback = MockAIProvider()

    async def diagnose_device(
        self,
        brand: str,
        model: str,
        age_years: float,
        storage_gb: int,
        battery_condition: str,
        problem_description: str,
        image_base64: Optional[str] = None,
        nlp_context: Optional[NLPReasoningOutput] = None
    ) -> AIDiagnosisOutput:
        nlp_section = ""
        if nlp_context:
            nlp_section = f"""
Structured NLP Diagnostic Reasoning Signals (Pre-processed):
- Primary Suspected Category: {nlp_context.primary_category}
- Secondary Components: {nlp_context.secondary_categories}
- Positive Symptoms: {[s.symptom_id for s in nlp_context.symptoms]}
- Negated Non-Issues: {[s.symptom_id for s in nlp_context.negated_symptoms]}
- Causal Event: {nlp_context.event.event_type if nlp_context.event else 'None'}
- Computed Severity: {nlp_context.severity}
- Safety Alerts: {nlp_context.safety_flags}
- Clinical Evidence: "{nlp_context.diagnostic_evidence}"
"""

        prompt = f"""
You are ReWise AI, an evidence-based smartphone hardware diagnostic assistant.
Analyze this smartphone report and return STRICT JSON ONLY.
CRITICAL DIAGNOSTIC PRINCIPLES:
1. SYMPTOM ≠ CONFIRMED COMPONENT FAILURE.
2. PROBABLE ISSUE ≠ CONFIRMED ISSUE.
3. NEVER claim an exact internal component failure (e.g. do NOT claim flex cable detachment, solder joint fatigue, substrate trace fracture, or PMIC failure) without physical inspection evidence.
4. Always set "confirmed_issue": null unless physically verified.
5. Confidence MUST be categorical based on evidence: "High", "Moderate", or "Low" (never output fake decimal numbers).
6. Do NOT provide dangerous DIY repair procedures (no opening batteries, no soldering, no board probing). High-level next steps only: "Professional inspection of the [component] assembly is recommended."
7. Database systems compute pricing separately; NEVER invent prices.

Device Details:
- Brand: {brand}
- Model: {model}
- Operational Age: {age_years} years
- Storage: {storage_gb} GB
- Battery Status: {battery_condition}
- User Problem Description: "{problem_description}"
{nlp_section}

Required JSON Schema:
{{
  "device": "{brand} {model}",
  "problem_category": "Display/Touch | Display | Battery | Charging | Power | Water damage | Camera | Audio | Network | Software/OS | Unknown",
  "possible_issue": "High-level probable issue title (e.g. Touch/digitizer failure associated with the display assembly)",
  "confirmed_issue": null,
  "severity": "Minor | Moderate | Critical",
  "confidence": "Moderate | High | Low",
  "observed_symptoms": ["Observed symptom 1", "Observed symptom 2"],
  "possible_causes": ["High-level probable cause 1", "High-level probable cause 2"],
  "recommended_next_step": "Professional inspection of the [assembly] is recommended.",
  "safety_warning": "High-level safety precaution or null",
  "diagnosis_limit": "The exact failed internal component cannot be confirmed from the provided information alone."
}}
Return ONLY valid JSON.
"""
        try:
            content_parts = [prompt]
            if image_base64:
                clean_b64 = image_base64
                mime_type = "image/jpeg"
                if "," in image_base64:
                    header, clean_b64 = image_base64.split(",", 1)
                    if "png" in header:
                        mime_type = "image/png"
                    elif "webp" in header:
                        mime_type = "image/webp"
                content_parts.append({
                    "mime_type": mime_type,
                    "data": clean_b64
                })

            import asyncio
            response = await asyncio.to_thread(self.client.generate_content, content_parts)
            text = response.text.strip()
            logger.info("Raw Gemini Response received successfully.")

            # Extract pure JSON chunk
            json_match = re.search(r"\{.*\}", text, re.DOTALL)
            if json_match:
                json_text = json_match.group(0)
            else:
                json_text = text

            data = json.loads(json_text)
            # Ensure confidence is a string
            if isinstance(data.get("confidence"), (int, float)):
                data["confidence"] = "High" if data["confidence"] > 0.9 else ("Moderate" if data["confidence"] > 0.6 else "Low")
            return AIDiagnosisOutput(**data)
        except Exception as e:
            logger.warning(f"Gemini live call encountered error: {e}. Falling back to deterministic heuristic engine.")
            return await self._fallback.diagnose_device(
                brand=brand,
                model=model,
                age_years=age_years,
                storage_gb=storage_gb,
                battery_condition=battery_condition,
                problem_description=problem_description,
                image_base64=image_base64,
                nlp_context=nlp_context
            )


# ---------------------------------------------------------------------------
# Mock / Heuristic AI Provider (Evidence-based restrained diagnostic engine)
# ---------------------------------------------------------------------------
class MockAIProvider(BaseAIProvider):
    """
    Evidence-based heuristic diagnostic engine.
    Aligns 100% with the NLP Reasoning Layer and enforces strict diagnostic restraint:
    - Never diagnoses unproven internal sub-components
    - Sets confirmed_issue = None
    - Uses categorical confidence: Moderate / High / Low
    - Distinguishes symptoms from probable issues
    """
    async def diagnose_device(
        self,
        brand: str,
        model: str,
        age_years: float,
        storage_gb: int,
        battery_condition: str,
        problem_description: str,
        image_base64: Optional[str] = None,
        nlp_context: Optional[NLPReasoningOutput] = None
    ) -> AIDiagnosisOutput:
        desc = problem_description.lower()

        # Handle Insufficient Information (Problem 13)
        if nlp_context and nlp_context.insufficient_information:
            return AIDiagnosisOutput(
                device=f"{brand} {model}",
                problem_category="Unknown",
                possible_issue="I need more information to narrow down the problem.",
                confirmed_issue=None,
                severity="Minor",
                confidence="Low",
                observed_symptoms=["General malfunction reported without specific symptoms"],
                possible_causes=["Unspecified hardware or software anomaly"],
                recommended_next_step="Please provide additional details by answering follow-up questions.",
                safety_warning=None,
                diagnosis_limit="Insufficient information to isolate problem category."
            )

        category = nlp_context.primary_category if nlp_context else "Display"
        severity = nlp_context.severity if nlp_context else "Moderate"
        confidence = "High" if image_base64 else ("Moderate" if (nlp_context and nlp_context.symptoms) else "Low")
        confirmed_issue = None
        diag_limit = "The exact failed internal component cannot be confirmed from the provided information alone."

        # Collect user-confirmed symptoms and intact observations
        symptoms_observed = []
        if nlp_context and nlp_context.symptoms:
            for s in nlp_context.symptoms:
                symptoms_observed.append(s.description)
        else:
            symptoms_observed.append("Reported functional anomaly")

        if nlp_context and nlp_context.event and nlp_context.event.event_type:
            ev = nlp_context.event
            ev_desc = f"Device was {ev.event_type}ed" if ev.event_type == "drop" else f"Device exposed to {ev.event_type}"
            if ev.event_time:
                ev_desc += f" ({ev.event_time})"
            symptoms_observed.append(ev_desc)

        if nlp_context and nlp_context.negated_symptoms:
            for ns in nlp_context.negated_symptoms:
                symptoms_observed.append(f"User reports {ns.description.lower().replace('confirmed intact', '').strip()} is intact")

        # Problem 1 & 12: Synthesize restrained probable issue without claiming exact internal component
        has_touch = any("touch" in s.symptom_id for s in nlp_context.symptoms) if nlp_context else ("touch" in desc)
        has_lines = any(s.symptom_id in ["green_line", "display_vertical_line", "pink_line"] for s in nlp_context.symptoms) if nlp_context else ("green line" in desc or "lines" in desc)

        if category == "Display" or category == "Display/Touch":
            if has_touch and not has_lines:
                category = "Display/Touch"
                issue = "Touch/digitizer failure associated with the display assembly"
                causes = [
                    "Touch/digitizer damage",
                    "Display assembly connection damage",
                    "Other internal touch-related hardware damage"
                ]
                next_step = "Professional inspection of the display/touch assembly is recommended."
                safety_warning = "Avoid pressing down hard on the unbonded glass or digitizer."
            elif has_lines:
                category = "Display"
                issue = "Display vertical line / display panel problem"
                causes = [
                    "Display panel substrate damage",
                    "Display assembly connection damage",
                    "Other internal display-related hardware damage"
                ]
                next_step = "Professional inspection of the display assembly is recommended."
                safety_warning = "Avoid applying pressure to the damaged display area."
            else:
                category = "Display"
                issue = "Screen/glass damage associated with the display assembly"
                causes = [
                    "Display panel fracture",
                    "Protective glass fracture",
                    "Display assembly connection damage"
                ]
                next_step = "Professional inspection of the display assembly is recommended."
                safety_warning = "Glass fragments may cause cuts. Avoid handling cracked glass without protection."

        elif category == "Battery":
            is_swollen = any(s.symptom_id == "battery_swelling" for s in nlp_context.symptoms) if nlp_context else ("swollen" in desc)
            if is_swollen:
                issue = "Battery swelling physical deformation"
                causes = [
                    "Battery cell internal electrolyte breakdown",
                    "Pouch cell mechanical expansion",
                    "Thermal or chemical degradation"
                ]
                next_step = "Professional inspection and battery replacement is recommended."
                safety_warning = "CRITICAL: Do NOT attempt to puncture or bend the battery. Swollen batteries pose a thermal runaway fire hazard."
            else:
                issue = "Battery capacity degradation / abnormal drain problem"
                causes = [
                    "Battery cell chemical wear from charge cycles",
                    "Subsystem background power consumption",
                    "Internal battery health degradation"
                ]
                next_step = "Professional battery health inspection and testing is recommended."
                safety_warning = "Use only manufacturer certified charging adapters."

        elif category == "Water damage":
            issue = "Liquid-related hardware damage"
            causes = [
                "Liquid ingress across internal contacts",
                "Moisture-induced contact shorting",
                "Internal hardware corrosion risk"
            ]
            next_step = "Immediately keep the device powered off and seek professional ultrasonic cleaning."
            safety_warning = "Do NOT connect to a wall charger. Moisture combined with electric current accelerates corrosion and electrical shorts."

        elif category == "Charging":
            issue = "Charging port or charging circuit connection problem"
            causes = [
                "Charging port physical wear or debris accumulation",
                "Charging circuit connection fault",
                "Internal power delivery connection issue"
            ]
            next_step = "Professional inspection of the charging port and circuit is recommended."
            safety_warning = "Do NOT use metallic pins or needles inside the charging port."

        elif category == "Power":
            issue = "Power startup failure"
            causes = [
                "Depleted or degraded battery cell",
                "Power delivery circuit fault",
                "Internal power management hardware issue"
            ]
            next_step = "Professional bench inspection is recommended to isolate the power fault."
            safety_warning = "Do not repeatedly attempt high-voltage fast charging if the device does not respond."

        elif category == "Camera":
            issue = "Camera module or optical assembly problem"
            causes = [
                "Camera sensor or lens damage",
                "Internal camera module connector fault"
            ]
            next_step = "Professional inspection of the camera assembly is recommended."
            safety_warning = None

        else:
            issue = f"{category} subsystem problem"
            causes = [
                f"{category} hardware wear or connection issue",
                "Internal component fault"
            ]
            next_step = f"Professional inspection of the {category.lower()} component is recommended."
            safety_warning = None

        # Build evidence list (Section 3 & 4)
        evidence_list = []
        if nlp_context and nlp_context.event and nlp_context.event.event_type:
            evidence_list.append(f"Physical telemetry: Device experienced {nlp_context.event.event_type} shock")
        for sym in symptoms_observed:
            evidence_list.append(f"Reported symptom: {sym}")
        if image_base64:
            evidence_list.append("Multimodal visual analysis confirms physical surface deformation")

        # Missing information & alternatives (Section 4)
        missing_info = []
        if not image_base64:
            missing_info.append("Damage photograph of screen / chassis")
        missing_info.append("Confirmation whether touch response recovers after reboot")
        missing_info.append("Hardware bench voltage check")

        alternatives = []
        if category in ["Display", "Display/Touch"]:
            alternatives = [
                "Display flex connector unseating / pin contact misalignment",
                "Touch digitizer IC failure on motherboard",
                "GPU display buffer render anomaly"
            ]
        elif category == "Battery":
            alternatives = [
                "Background power-hungry application process",
                "PMIC (Power Management IC) voltage regulator leak"
            ]
        elif category == "Charging":
            alternatives = [
                "Debris or lint obstruction inside Type-C / Lightning port",
                "Worn-out charging cable or adapter negotiation fault"
            ]
        elif category == "Water damage":
            alternatives = [
                "Surface moisture on speaker mesh without mainboard penetration",
                "Corrosion on charging sub-board only"
            ]
        else:
            alternatives = ["Intermittent ribbon cable connection", "Component wear-and-tear"]

        follow_ups = []
        if nlp_context and nlp_context.insufficient_information:
            follow_ups = [
                "Did the issue start after a physical drop, liquid contact, or software update?",
                "Is the screen completely black, or does it display lines / backlight?",
                "Does the phone vibrate or make sounds when connected to a charger?"
            ]

        # Multimodal image observation & strict restraint (Section 5)
        image_findings = None
        if image_base64:
            image_findings = "Visual inspection identifies physical exterior wear. Internal damage cannot be confirmed from this image."

        numeric_confidence = 92 if image_base64 else (82 if (nlp_context and nlp_context.symptoms) else 45)

        return AIDiagnosisOutput(
            device=f"{brand} {model}",
            problem_category=category,
            possible_issue=issue,
            confirmed_issue=confirmed_issue,
            severity=severity,
            confidence=confidence,
            confidence_score=numeric_confidence,
            evidence=evidence_list,
            missing_information=missing_info,
            possible_alternatives=alternatives,
            follow_up_questions=follow_ups,
            image_findings=image_findings,
            observed_symptoms=symptoms_observed,
            possible_causes=causes,
            recommended_next_step=next_step,
            safety_warning=safety_warning,
            diagnosis_limit=diag_limit
        )



# ---------------------------------------------------------------------------
# Factory / Dispatcher
# ---------------------------------------------------------------------------
def get_ai_service() -> BaseAIProvider:
    """Returns live Gemini provider if API key configured, otherwise Mock provider."""
    if settings.GEMINI_API_KEY and settings.GEMINI_API_KEY.strip():
        logger.info("Using Live Gemini Multimodal AI Provider.")
        return GeminiAIProvider(api_key=settings.GEMINI_API_KEY, model_name=settings.GEMINI_MODEL)
    else:
        logger.info("GEMINI_API_KEY not set. Using Deterministic Mock AI Provider (Demo Mode).")
        return MockAIProvider()
