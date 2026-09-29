import logging
from typing import Optional, List
from fastapi import APIRouter, Depends, Path, Query, Body, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.schemas import (
    DataSyncRequest,
    DataSyncResponse,
    DataSyncStatusResponse,
    DeviceSyncStatsResponse,
)
from app.services.apify_service import ApifyDataPipelineService

logger = logging.getLogger("DataSyncRoute")

router = APIRouter(prefix="/data-sync", tags=["Data Sync"])

# Global pipeline instance
pipeline_service = ApifyDataPipelineService()

ALLOWED_DATA_TYPES = ["devices", "repair", "resale", "service-centers", "recycling"]


@router.post("/devices", response_model=DeviceSyncStatsResponse)
def sync_devices_endpoint(
    payload: Optional[DataSyncRequest] = Body(default=None),
    db: Session = Depends(get_db)
):
    """
    Dedicated smartphone device catalog synchronization endpoint:
    Runs configured Apify device Actor, normalizes brands/models, prevents duplicates,
    and returns exact sync statistics (received, valid, inserted, updated, invalid).
    """
    actor_id = payload.actor_id if payload else None
    max_items = payload.max_items if payload else 100
    stats = pipeline_service.sync_devices(db=db, actor_id=actor_id, max_items=max_items)
    return stats


@router.post("/{data_type}", response_model=DataSyncResponse)
def trigger_data_sync(
    data_type: str = Path(..., description="Target dataset type (devices, repair, resale, service-centers, recycling)"),
    payload: Optional[DataSyncRequest] = Body(default=None),
    db: Session = Depends(get_db)
):
    """
    Triggers Apify Actor synchronization for specified dataset domain.
    Enforces server-side security: Apify API token is never exposed to the client.
    Validates and normalizes records, enforcing source provenance (source_url, source_name, retrieved_at).
    """
    dt_clean = data_type.strip().lower()
    if dt_clean not in ALLOWED_DATA_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid data_type '{data_type}'. Allowed types: {', '.join(ALLOWED_DATA_TYPES)}"
        )

    actor_id = payload.actor_id if payload else None
    keywords = payload.search_keywords if payload else None
    max_items = payload.max_items if payload else 50
    dry_run = payload.dry_run if payload else False

    result = pipeline_service.execute_actor_sync(
        db=db,
        data_type=dt_clean,
        custom_actor_id=actor_id,
        search_keywords=keywords,
        max_items=max_items,
        dry_run=dry_run
    )
    return result


@router.get("/status", response_model=DataSyncStatusResponse)
def get_data_sync_status(db: Session = Depends(get_db)):
    """
    Returns telemetry for recent Apify sync runs, configured actor mappings,
    token status, and database record source counts.
    """
    return pipeline_service.get_status_summary(db=db)
