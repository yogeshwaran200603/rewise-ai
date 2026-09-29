from typing import Tuple
from sqlalchemy.orm import Session
from app.models.models import User, Transaction, Reward
from app.schemas.schemas import RewardActionResponse


class RewardService:
    @staticmethod
    def process_action(
        db: Session,
        user_id: int,
        action_type: str,
        diagnosis_id: int = None,
        center_name: str = "Authorized ReWise Partner"
    ) -> RewardActionResponse:
        """
        Awards ReWise circular economy points based on user action:
          - Repair: +50 points
          - Resell / Reuse: +100 points
          - Responsible Recycling: +200 points
        """
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            user = db.query(User).first()
            if not user:
                user = User(name="Eco Champion", email="champion@rewise.ai", reward_points=0)
                db.add(user)
                db.flush()

        action = action_type.upper().strip()
        if "REPAIR" in action:
            points = 50
            co2e = 48.5
            ewaste = 0.18
            msg = "Awesome! You chose to repair your phone, extending its active lifespan and preventing immediate e-waste."
            reason = f"Completed Smartphone Repair via {center_name}"
        elif "RESELL" in action or "REUSE" in action:
            points = 100
            co2e = 39.0
            ewaste = 0.18
            msg = "Great circular move! Reusing or reselling keeps working devices in active secondary circulation."
            reason = f"Trade-In & Secondary Reuse via {center_name}"
        else:  # RECYCLE
            points = 200
            co2e = 14.5
            ewaste = 0.18
            msg = "Outstanding! Responsible recycling ensures precious metals are recovered and hazardous toxins stay out of landfills."
            reason = f"E-Waste Material Recycling via {center_name}"

        # 1. Update user points
        user.reward_points += points

        # 2. Record transaction
        tx = Transaction(
            user_id=user.id,
            diagnosis_id=diagnosis_id,
            action_type=action,
            center_name=center_name,
            points_awarded=points,
            status="COMPLETED"
        )
        db.add(tx)
        db.flush()

        # 3. Record reward history
        rw = Reward(
            user_id=user.id,
            transaction_id=tx.id,
            points_change=points,
            reason=reason
        )
        db.add(rw)
        db.commit()

        return RewardActionResponse(
            success=True,
            action_type=action,
            points_awarded=points,
            total_user_points=user.reward_points,
            message=msg,
            co2e_saved_kg=co2e,
            ewaste_diverted_kg=ewaste
        )
