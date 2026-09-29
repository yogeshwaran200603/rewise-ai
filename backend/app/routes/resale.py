from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.schemas import ResaleEstimate
from app.services.resale_service import ResaleService

router = APIRouter(tags=["Resale"])


@router.get("/resale-estimate", response_model=ResaleEstimate)
def get_resale_estimate(
    brand: str = Query(..., examples=["Samsung"]),
    model: str = Query(..., examples=["Galaxy S22"]),
    age_years: float = Query(1.5, examples=[1.5]),
    storage_gb: int = Query(128, examples=[128]),
    battery_condition: str = Query("Normal (~85%)", examples=["Normal (~85%)"]),
    severity: str = Query("Moderate", examples=["Moderate"]),
    db: Session = Depends(get_db)
):
    """Calculates structured resale valuation range based on depreciation and condition."""
    return ResaleService.calculate_resale_estimate(
        db=db,
        brand=brand,
        model_name=model,
        age_years=age_years,
        storage_gb=storage_gb,
        battery_condition=battery_condition,
        damage_severity=severity
    )


@router.get("/resale-estimate/{diagnosis_id}", response_model=ResaleEstimate)
def get_resale_estimate_by_id(
    diagnosis_id: int,
    db: Session = Depends(get_db)
):
    """Returns resale estimate for a specific diagnosis record."""
    from fastapi import HTTPException
    from app.models.models import Diagnosis
    diag = db.query(Diagnosis).filter(Diagnosis.id == diagnosis_id).first()
    if not diag:
        raise HTTPException(status_code=404, detail="Diagnosis not found")
    return ResaleService.calculate_resale_estimate(
        db=db,
        brand=diag.brand,
        model_name=diag.model,
        age_years=diag.age_years or 1.5,
        storage_gb=diag.storage_gb or 128,
        battery_condition=diag.battery_condition or "Normal (~85%)",
        damage_severity=diag.severity or "Moderate"
    )


@router.get("/market-prices")
def get_live_market_prices(
    brand: str = Query(..., examples=["Apple"]),
    model: str = Query(..., examples=["iPhone 13"]),
    storage_gb: int = Query(128, examples=[128]),
):
    """
    Fetches real-time multi-platform secondary market intelligence powered by Apify scraper
    across Amazon Renewed, Flipkart Re-New, Cashify Buyback, and OLX P2P.
    """
    from app.services.apify_service import ApifyMarketService
    return ApifyMarketService.get_market_intelligence(
        brand=brand,
        model=model,
        storage_gb=storage_gb
    )
