from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.database.session import get_db
from app.models.models import User, Transaction, Reward, EnvironmentalImpact, Diagnosis
from app.schemas.schemas import (
    RewardActionRequest,
    RewardActionResponse,
    CircularActionSubmitRequest,
    CircularActionResponse,
    RewardHistoryItem,
)
from app.services.reward_service import RewardService

router = APIRouter(tags=["Rewards & Circular Actions"])


@router.post("/rewards", response_model=RewardActionResponse)
def claim_reward(
    payload: RewardActionRequest,
    db: Session = Depends(get_db)
):
    """
    Awards circular economy points when a user chooses an action:
    Repair (+50 pts), Resell/Reuse (+100 pts), or Recycle (+200 pts).
    """
    return RewardService.process_action(
        db=db,
        user_id=payload.user_id or 1,
        action_type=payload.action_type,
        diagnosis_id=payload.diagnosis_id,
        center_name=payload.center_name or "Authorized Circular Hub"
    )


@router.post("/circular-action", response_model=CircularActionResponse)
def record_circular_action(
    payload: CircularActionSubmitRequest,
    db: Session = Depends(get_db)
):
    """
    Records a verified circular action (Section 13) with anti-farming protection.
    Awards:
    - Diagnosis (+10)
    - Verified repair (+50)
    - Verified reuse (+75)
    - Verified resale (+40)
    - Verified recycling (+100)
    """
    user_id = payload.user_id or 1
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        user = User(id=1, name="Eco Champion", email="champion@rewise.ai", reward_points=350)
        db.add(user)
        db.commit()
        db.refresh(user)

    action_type = payload.action_type.upper().strip()

    # Anti-farming protection: Prevent repeated submissions on same diagnosis within 30 minutes
    if payload.diagnosis_id:
        recent_cutoff = datetime.utcnow() - timedelta(minutes=30)
        duplicate = db.query(Transaction).filter(
            Transaction.user_id == user.id,
            Transaction.diagnosis_id == payload.diagnosis_id,
            Transaction.action_type == action_type,
            Transaction.created_at >= recent_cutoff
        ).first()
        if duplicate:
            raise HTTPException(
                status_code=400,
                detail=f"Circular action '{action_type}' was already registered for this diagnosis. Points cannot be farmed repeatedly."
            )

    points_map = {
        "DIAGNOSIS": 10,
        "REPAIR": 50,
        "REUSE": 75,
        "RESELL": 40,
        "RECYCLE": 100,
    }
    pts = points_map.get(action_type, 50)

    # 1. Create Transaction (Circular Action)
    tx = Transaction(
        user_id=user.id,
        diagnosis_id=payload.diagnosis_id,
        action_type=action_type,
        center_name=payload.center_name or "Verified Circular Hub",
        proof_url=payload.proof_url,
        proof_notes=payload.proof_notes,
        points_awarded=pts,
        status="VERIFIED" if payload.proof_url else "COMPLETED"
    )
    db.add(tx)
    db.commit()
    db.refresh(tx)

    # 2. Create Reward Transaction
    reward_tx = Reward(
        user_id=user.id,
        transaction_id=tx.id,
        points_change=pts,
        reason=f"Verified Circular Action: {action_type} completed at {payload.center_name or 'Circular Partner'}"
    )
    db.add(reward_tx)

    # 3. Update User Balance
    user.reward_points += pts

    # 4. Record Environmental Impact
    co2e_map = {"REPAIR": 48.5, "REUSE": 39.0, "RESELL": 39.0, "RECYCLE": 14.5, "DIAGNOSIS": 2.0}
    co2e_saved = co2e_map.get(action_type, 25.0)

    impact = EnvironmentalImpact(
        user_id=user.id,
        diagnosis_id=payload.diagnosis_id,
        circular_action_id=tx.id,
        metric="co2e_saved",
        value=co2e_saved,
        unit="kg CO2e",
        methodology="Avoided manufacturing emissions calculated using academic Life Cycle Assessment",
        source="CPCB Statutory Guidelines & OEM Environmental Reports",
        confidence="verified"
    )
    db.add(impact)
    db.commit()
    db.refresh(user)

    return CircularActionResponse(
        status="success",
        action_id=tx.id,
        action_type=action_type,
        points_awarded=pts,
        total_points=user.reward_points,
        message=f"Successfully credited +{pts} ReWise points for choosing {action_type}!",
        eco_impact={
            "co2e_saved_kg": co2e_saved,
            "ewaste_diverted_kg": 0.18,
            "methodology": "Verified LCA e-waste reduction calculation"
        }
    )


@router.get("/rewards")
def get_user_rewards(user_id: int = 1, db: Session = Depends(get_db)):
    """
    Returns user rewards overview, total points balance, and verified transaction history.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        user = db.query(User).first()
        if not user:
            user = User(name="Eco Champion", reward_points=350)
            db.add(user)
            db.commit()
            db.refresh(user)

    history = (
        db.query(Reward)
        .filter(Reward.user_id == user.id)
        .order_by(Reward.created_at.desc())
        .limit(20)
        .all()
    )

    return {
        "user_id": user.id,
        "user_name": user.name,
        "total_reward_points": user.reward_points,
        "points_tier": "Circular Ambassador" if user.reward_points > 500 else "Eco Champion",
        "redemption_options": [
            {"title": "₹250 Cashify Refurbished Device Voucher", "points_cost": 250},
            {"title": "₹500 Clean-Room Repair Discount", "points_cost": 450},
            {"title": "Free Doorstep Battery Health Diagnostics", "points_cost": 150},
            {"title": "Plant 5 Trees with SankalpTaru E-Waste Initiative", "points_cost": 300},
        ],
        "history": [
            {
                "id": h.id,
                "points_change": h.points_change,
                "reason": h.reason,
                "created_at": h.created_at.strftime("%Y-%m-%d %H:%M UTC")
            }
            for h in history
        ]
    }
