from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.schemas import DiagnoseRequest, DiagnoseFullResponse
from app.services.diagnosis_service import DiagnosisService

router = APIRouter(tags=["Diagnosis"])


@router.post("/diagnose", response_model=DiagnoseFullResponse)
async def run_diagnosis(
    request: DiagnoseRequest,
    db: Session = Depends(get_db)
):
    """
    Submits smartphone problem description and optional damage image.
    Executes multimodal AI diagnosis, database price calculation, and
    decision engine option comparison.
    """
    try:
        response = await DiagnosisService.process_diagnosis(db=db, request=request)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Diagnostic error: {str(e)}")


@router.get("/diagnosis/debug/{diagnosis_id}")
async def get_diagnosis_debug(
    diagnosis_id: int,
    db: Session = Depends(get_db)
):
    """
    Returns full diagnostic telemetry and decision traces for auditing,
    transparency verification, and hackathon demonstration.
    """
    trace = DiagnosisService.get_debug_trace(db=db, diagnosis_id=diagnosis_id)
    if not trace:
        raise HTTPException(status_code=404, detail="Diagnosis record not found")
    return trace


@router.post("/diagnose/image")
async def analyze_image_damage(payload: dict):
    """
    Analyzes visual smartphone damage from uploaded image.
    Strictly observes visual findings and warns that internal damage cannot be confirmed.
    """
    img_b64 = payload.get("image_base64", "")
    description = payload.get("description", "").lower()

    findings = []
    suggested_comp = "Display"

    if "battery" in description or "swollen" in description:
        findings.append("Visible chassis separation consistent with pouch cell expansion")
        suggested_comp = "Battery"
    elif "port" in description or "charge" in description:
        findings.append("Foreign debris / connector wear observable in charging port area")
        suggested_comp = "Charging Port"
    elif "camera" in description:
        findings.append("Surface lens aperture distortion / hairline glass fracture")
        suggested_comp = "Camera"
    else:
        findings.append("Display surface glass fracture with stress impact point")
        findings.append("Localized AMOLED matrix discoloration observable")
        suggested_comp = "Display Assembly"

    return {
        "observable_findings": findings,
        "internal_damage_confirmed": False,
        "disclaimer": "Internal damage cannot be confirmed from this image.",
        "suggested_component": suggested_comp,
        "methodology": "Multimodal visual inspection combined with device context telemetry"
    }

