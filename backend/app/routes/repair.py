from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.schemas import RepairEstimate
from app.services.repair_service import RepairService

router = APIRouter(tags=["Repair"])


@router.get("/repair-estimate", response_model=RepairEstimate)
def get_repair_estimate(
    brand: str = Query(..., examples=["Samsung"]),
    model: str = Query(..., examples=["Galaxy S22"]),
    category: str = Query("Display", examples=["Display"]),
    db: Session = Depends(get_db)
):
    """Returns database repair pricing broken down into part, labor, and service fees."""
    return RepairService.get_repair_estimate(
        db=db,
        brand=brand,
        model_name=model,
        problem_category=category
    )


@router.get("/repair-estimate/{diagnosis_id}", response_model=RepairEstimate)
def get_repair_estimate_by_id(
    diagnosis_id: int,
    db: Session = Depends(get_db)
):
    """Returns repair estimate for a specific diagnosis record."""
    from fastapi import HTTPException
    from app.models.models import Diagnosis
    diag = db.query(Diagnosis).filter(Diagnosis.id == diagnosis_id).first()
    if not diag:
        raise HTTPException(status_code=404, detail="Diagnosis not found")
    return RepairService.get_repair_estimate(
        db=db,
        brand=diag.brand,
        model_name=diag.model,
        problem_category=diag.problem_category or "Display"
    )
