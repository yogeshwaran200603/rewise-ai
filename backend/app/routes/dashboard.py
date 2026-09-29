from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import User, Diagnosis, Transaction, Reward
from app.schemas.schemas import DashboardSummary, RewardHistoryItem

router = APIRouter(tags=["Dashboard"])


@router.get("/dashboard", response_model=DashboardSummary)
def get_user_dashboard(user_id: int = 1, db: Session = Depends(get_db)):
    """Fetches user metrics, environmental impact stats, activity logs, and reward history."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        user = db.query(User).first()
        if not user:
            user = User(name="Alex Green", email="alex@rewise.ai", reward_points=350)
            db.add(user)
            db.commit()
            db.refresh(user)

    diagnoses_count = db.query(Diagnosis).count()
    txs = db.query(Transaction).all()

    repaired_count = sum(1 for t in txs if "REPAIR" in t.action_type.upper())
    reused_count = sum(1 for t in txs if "RESELL" in t.action_type.upper() or "REUSE" in t.action_type.upper())
    recycled_count = sum(1 for t in txs if "RECYCLE" in t.action_type.upper())

    # Add baseline demo impact if new
    repaired_count = max(2, repaired_count)
    reused_count = max(1, reused_count)
    recycled_count = max(3, recycled_count)
    diagnoses_count = max(7, diagnoses_count)

    ewaste_diverted = round((repaired_count + reused_count + recycled_count) * 0.18, 2)
    co2e_saved = round((repaired_count * 48.5) + (reused_count * 39.0) + (recycled_count * 14.5), 1)

    # Monthly impact progression for Recharts
    monthly_impact = [
        {"month": "May", "co2e_saved": 48.5, "ewaste_kg": 0.18, "points": 50},
        {"month": "Jun", "co2e_saved": 87.5, "ewaste_kg": 0.36, "points": 150},
        {"month": "Jul", "co2e_saved": 102.0, "ewaste_kg": 0.54, "points": 250},
        {"month": "Aug", "co2e_saved": 141.0, "ewaste_kg": 0.72, "points": 300},
        {"month": "Sep", "co2e_saved": co2e_saved, "ewaste_kg": ewaste_diverted, "points": user.reward_points},
    ]

    # Recent activity
    recent_activity = [
        {"action": "Recycled Old Phone", "device": "Xiaomi Redmi Note 10", "points": "+200", "date": "Yesterday"},
        {"action": "Screen Repaired", "device": "Samsung Galaxy S22", "points": "+50", "date": "3 days ago"},
        {"action": "Diagnosed Battery", "device": "Apple iPhone 12", "points": "+100", "date": "1 week ago"},
    ]

    rewards = db.query(Reward).order_by(Reward.created_at.desc()).limit(10).all()

    return DashboardSummary(
        user_name=user.name,
        reward_points=user.reward_points,
        devices_analyzed=diagnoses_count,
        devices_repaired=repaired_count,
        devices_reused=reused_count,
        devices_recycled=recycled_count,
        total_ewaste_diverted_kg=ewaste_diverted,
        total_co2e_saved_kg=co2e_saved,
        recent_activity=recent_activity,
        monthly_impact=monthly_impact,
        reward_history=[RewardHistoryItem.model_validate(r) for r in rewards]
    )
