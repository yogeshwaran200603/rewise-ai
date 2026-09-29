from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.schemas import DecisionComparison, DiagnoseRequest
from app.services.repair_service import RepairService
from app.services.resale_service import ResaleService
from app.services.recycling_service import RecyclingService
from app.services.decision_engine import DecisionEngine

router = APIRouter(tags=["Decision Engine"])


@router.post("/decision", response_model=DecisionComparison)
def evaluate_decision(
    request: DiagnoseRequest,
    category: str = "Display",
    severity: str = "Moderate",
    db: Session = Depends(get_db)
):
    """Executes transparent circular decision logic comparing Repair, Resell, and Recycle."""
    repair_summary = RepairService.get_repair_estimate(
        db=db,
        brand=request.brand,
        model_name=request.model,
        problem_category=category
    )
    resale_summary = ResaleService.calculate_resale_estimate(
        db=db,
        brand=request.brand,
        model_name=request.model,
        age_years=request.age_years,
        storage_gb=request.storage_gb,
        battery_condition=request.battery_condition,
        damage_severity=severity
    )
    recycle_summary = RecyclingService.get_recycling_options()

    return DecisionEngine.evaluate(
        repair_summary=repair_summary,
        resale_summary=resale_summary,
        recycle_summary=recycle_summary,
        age_years=request.age_years,
        damage_severity=severity
    )
