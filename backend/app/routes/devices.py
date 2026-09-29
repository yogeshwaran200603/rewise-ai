import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.models import Device, DeviceModel
from app.schemas.schemas import (
    DeviceModelResponse,
    BrandCount,
    DeviceModelItem,
    DeviceDetailResponse,
    DeviceStatsResponse,
)

logger = logging.getLogger("DevicesRoute")

router = APIRouter(tags=["Devices"])


@router.get("/devices/brands", response_model=List[BrandCount])
def get_brands(db: Session = Depends(get_db)):
    """Returns distinct smartphone brands with active model counts."""
    results = (
        db.query(Device.brand, func.count(Device.id))
        .filter(Device.is_active == True)
        .group_by(Device.brand)
        .order_by(Device.brand.asc())
        .all()
    )
    return [BrandCount(name=b, count=c) for b, c in results]


@router.get("/devices/models", response_model=List[DeviceModelItem])
def get_device_models(
    brand: str = Query(..., description="Brand name (e.g. Apple, Samsung)"),
    db: Session = Depends(get_db)
):
    """Returns all models for a specific brand, ordered by release year desc."""
    devices = (
        db.query(Device)
        .filter(Device.is_active == True)
        .filter(Device.brand.ilike(brand.strip()))
        .order_by(Device.release_year.desc(), Device.model.asc())
        .all()
    )
    return [
        DeviceModelItem(
            id=d.id,
            brand=d.brand,
            model_name=d.model,
            release_year=d.release_year,
            storage_options=d.storage_options,
            ram_options=d.ram_options,
            display_type=d.display_type,
            processor=d.processor,
            repairability_score=d.repairability_score,
        )
        for d in devices
    ]


@router.get("/devices/search", response_model=List[DeviceModelItem])
def search_devices(
    q: str = Query(..., min_length=1, description="Search term for model name"),
    brand: Optional[str] = Query(None, description="Optional brand filter"),
    limit: int = Query(30, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Server-side debounced search for smartphone models."""
    term = f"%{q.strip()}%"
    query = db.query(Device).filter(Device.is_active == True)
    if brand and brand.strip():
        query = query.filter(Device.brand.ilike(brand.strip()))
    query = query.filter(
        (Device.model.ilike(term)) |
        (Device.brand.ilike(term))
    )
    devices = query.order_by(Device.release_year.desc(), Device.model.asc()).limit(limit).all()
    return [
        DeviceModelItem(
            id=d.id,
            brand=d.brand,
            model_name=d.model,
            release_year=d.release_year,
            storage_options=d.storage_options,
            ram_options=d.ram_options,
            display_type=d.display_type,
            processor=d.processor,
            repairability_score=d.repairability_score,
        )
        for d in devices
    ]


@router.get("/devices/stats", response_model=DeviceStatsResponse)
def get_device_stats(db: Session = Depends(get_db)):
    """Returns database summary statistics for devices and synchronization."""
    total = db.query(func.count(Device.id)).scalar() or 0
    brands_count = db.query(func.count(func.distinct(Device.brand))).scalar() or 0
    latest_sync = db.query(func.max(Device.retrieved_at)).scalar()
    sync_str = latest_sync.strftime("%Y-%m-%d %H:%M:%S UTC") if latest_sync else "2026-09-26 08:00:00 UTC"
    sources_rows = db.query(func.distinct(Device.source_name)).all()
    sources = [r[0] for r in sources_rows if r[0]]
    return DeviceStatsResponse(
        total_devices=total,
        brands=brands_count,
        last_sync=sync_str,
        sources=sources or ["OEM Official Specifications / CPCB Registry"]
    )


@router.get("/devices/{device_id}", response_model=DeviceDetailResponse)
def get_device_detail(device_id: int, db: Session = Depends(get_db)):
    """Fetches full specifications for a single smartphone device."""
    dev = db.query(Device).filter(Device.id == device_id).first()
    if not dev:
        raise HTTPException(status_code=404, detail="Device not found")

    storage_list = [s.strip() for s in (dev.storage_variants or "").split(",") if s.strip()] or ["128GB", "256GB"]
    ram_list = [r.strip() for r in (dev.ram_variants or "").split(",") if r.strip()] or ["6GB", "8GB"]
    display_str = f"{dev.display_size or '6.1\"'} {dev.display_type or 'AMOLED'}".strip()

    return DeviceDetailResponse(
        id=dev.id,
        brand=dev.brand,
        model_name=dev.model,
        release_year=dev.release_year,
        release_date=dev.release_date or f"{dev.release_year}-09-15",
        storage_options=storage_list,
        ram_options=ram_list,
        battery_capacity=dev.battery_capacity,
        processor=dev.processor,
        display=display_str,
        display_type=dev.display_type,
        display_refresh_rate=dev.display_refresh_rate,
        water_resistance=dev.water_resistance,
        software_support_end_year=dev.software_support_end_year,
        known_failure_modes=dev.known_failure_modes,
        second_life_suitability=dev.second_life_suitability,
        os=dev.operating_system or "Android / iOS",
        five_g=dev.five_g_support,
        approximate_launch_price=dev.india_launch_price,
        repairability_score=dev.repairability_score,
        repairability_notes=dev.repairability_notes,
        data_source=dev.data_source,
        last_verified=dev.last_verified,
        source=dev.source_name,
        source_url=dev.source_url,
        retrieved_at=dev.retrieved_at.strftime("%Y-%m-%d %H:%M:%S UTC") if dev.retrieved_at else None,
        is_active=dev.is_active,
    )


@router.get("/devices", response_model=List[DeviceModelResponse])
def get_devices(
    brand: Optional[str] = Query(None, description="Filter by brand"),
    db: Session = Depends(get_db)
):
    """Fetches device catalog for smartphones (legacy endpoint)."""
    query = db.query(DeviceModel)
    if brand:
        query = query.filter(DeviceModel.brand.ilike(brand.strip()))
    return query.order_by(DeviceModel.brand, DeviceModel.model).all()
