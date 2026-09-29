from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import ServiceCenter, RecyclingCenter
from app.schemas.schemas import ServiceCenterResponse, RecyclingCenterResponse

router = APIRouter(tags=["Centers"])


@router.get("/service-centers", response_model=List[ServiceCenterResponse])
def get_service_centers(
    city: Optional[str] = Query(None, description="Filter by city"),
    db: Session = Depends(get_db)
):
    """Fetches verified authorized repair service centers with rating and contact."""
    query = db.query(ServiceCenter)
    if city:
        query = query.filter(ServiceCenter.city.ilike(f"%{city}%"))
    return query.all()


@router.get("/recycling-centers", response_model=List[RecyclingCenterResponse])
def get_recycling_centers(
    city: Optional[str] = Query(None, description="Filter by city"),
    db: Session = Depends(get_db)
):
    """Fetches CPCB-authorized e-waste recycling facilities."""
    query = db.query(RecyclingCenter)
    if city:
        query = query.filter(RecyclingCenter.city.ilike(f"%{city}%"))
    return query.all()
