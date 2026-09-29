"""
=============================================================================
Circular Electronics Decision Engine - FastAPI Backend
=============================================================================
Author: Expert FastAPI Backend & ML Engineer
Stack: FastAPI, Pydantic, Scikit-Learn, Joblib, Pandas

Endpoints:
    - POST /api/assess : Evaluates a smartphone and recommends Repaired,
                         Refurbished, or Recycled with repair costs and
                         estimated lifecycle carbon savings.
    - GET  /api/health : Returns service and model operational health.
"""

import os
import re
import logging
from typing import Dict, Any, Optional, Tuple
from contextlib import asynccontextmanager

import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# ---------------------------------------------------------------------------
# Logging Setup
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger("EcoAIApi")

# ---------------------------------------------------------------------------
# Paths and Constants
# ---------------------------------------------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "device_recommendation_model.joblib")
DATASETS_DIR = os.path.join(BASE_DIR, "data sets")
REPAIR_CSV_PATH = os.path.join(DATASETS_DIR, "DS-12_India_Mobile_Repair_Cost_5000.csv")

# Baseline embodied carbon footprint (manufacturing + transport) per tier (kg CO2e)
BASELINE_CARBON_BY_BRAND = {
    "apple": 72.0,
    "google": 65.0,
    "samsung": 62.0,
    "oneplus": 58.0,
    "xiaomi": 52.0,
    "iqoo": 50.0,
    "realme": 48.0,
    "vivo": 48.0,
    "oppo": 48.0,
    "motorola": 46.0,
    "poco": 46.0,
}
DEFAULT_BASELINE_CARBON = 55.0  # kg CO2e for average smartphone

# ---------------------------------------------------------------------------
# Global Application State
# ---------------------------------------------------------------------------
ml_assets: Dict[str, Any] = {
    "pipeline": None,
    "classes": None,
    "feature_names": None,
    "repair_lookup": {},
    "brand_repair_lookup": {},
    "global_median_repair": 2850.0,
}


def load_repair_cost_benchmarks():
    """Builds fast in-memory lookup table from DS-12 repair cost dataset."""
    if not os.path.exists(REPAIR_CSV_PATH):
        logger.warning(f"DS-12 CSV not found at {REPAIR_CSV_PATH}. Using fallback cost defaults.")
        return

    try:
        df = pd.read_csv(REPAIR_CSV_PATH)
        df["repair_cost_inr"] = pd.to_numeric(df["repair_cost_inr"], errors="coerce")
        df = df.dropna(subset=["repair_cost_inr"])

        # Normalize keys: (model_lower, repair_type_lower) -> median cost
        model_type_medians = df.groupby(
            [df["model"].str.lower().str.strip(), df["repair_type"].str.lower().str.strip()]
        )["repair_cost_inr"].median().to_dict()

        brand_type_medians = df.groupby(
            [df["brand"].str.lower().str.strip(), df["repair_type"].str.lower().str.strip()]
        )["repair_cost_inr"].median().to_dict()

        ml_assets["repair_lookup"] = model_type_medians
        ml_assets["brand_repair_lookup"] = brand_type_medians
        ml_assets["global_median_repair"] = float(df["repair_cost_inr"].median())
        logger.info(f"Loaded {len(model_type_medians)} empirical model/repair cost combinations.")
    except Exception as e:
        logger.error(f"Error loading DS-12 repair schedule: {e}")


def load_ml_model():
    """Loads the serialized Scikit-Learn pipeline from joblib."""
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(
            f"Trained model artifact not found at {MODEL_PATH}. "
            f"Please run train_device_recommendation.py first."
        )

    bundle = joblib.load(MODEL_PATH)
    ml_assets["pipeline"] = bundle["pipeline"]
    ml_assets["classes"] = bundle["metadata"]["classes"]
    ml_assets["feature_names"] = bundle["metadata"]["feature_names"]
    logger.info("Successfully loaded ML pipeline and metadata bundle.")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """FastAPI lifespan hook to initialize and warm up model & datasets."""
    logger.info("Starting Circular Electronics API...")
    load_repair_cost_benchmarks()
    load_ml_model()
    yield
    logger.info("Shutting down Circular Electronics API...")


# ---------------------------------------------------------------------------
# FastAPI App Initialization with CORS
# ---------------------------------------------------------------------------
app = FastAPI(
    title="Circular Electronics Decision Engine API",
    description="Recommends whether a smartphone should be Repaired, Refurbished, or Recycled based on age, battery health, and repair cost.",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for easy frontend integration
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Pydantic Schemas
# ---------------------------------------------------------------------------
class DeviceAssessmentRequest(BaseModel):
    brand: str = Field(..., example="Apple", description="Smartphone manufacturer/brand name")
    model: str = Field(..., example="iPhone 13", description="Specific smartphone model name")
    age_years: float = Field(..., ge=0.0, le=15.0, example=1.5, description="Device operational age in years")
    battery_health_pct: float = Field(..., ge=10.0, le=100.0, example=86.0, description="Battery health state in percentage (10-100)")
    reported_fault: str = Field(..., example="Screen Replacement", description="Reported problem or part repair need")


class DeviceAssessmentResponse(BaseModel):
    brand: str
    model: str
    recommended_lifecycle_action: str
    confidence_scores: Dict[str, float]
    estimated_repair_cost: float
    currency: str = "INR"
    estimated_carbon_saved: float
    carbon_unit: str = "kg CO2e"
    rationale: str
    carbon_breakdown: Dict[str, Any]


# ---------------------------------------------------------------------------
# Domain Logic: Fault Classification & Repair Cost Estimation
# ---------------------------------------------------------------------------
def map_fault_category(fault_str: str) -> str:
    """Classifies free-text reported fault into canonical DS-12 repair categories."""
    fault = fault_str.lower().strip()
    if re.search(r"screen|display|glass|touch|lcd|oled", fault):
        return "Screen Replacement"
    elif re.search(r"batt|drain|charge port|charging|power up", fault):
        return "Battery Replacement"
    elif re.search(r"motherboard|logic|board|ic|dead|restart", fault):
        return "Motherboard Repair"
    elif re.search(r"water|liquid|drop in water|moisture", fault):
        return "Water Damage Repair"
    elif re.search(r"cam|lens|focus|photo", fault):
        return "Camera Repair"
    elif re.search(r"speak|sound|audio|volume", fault):
        return "Speaker Repair"
    elif re.search(r"mic|voice|call", fault):
        return "Microphone Repair"
    elif re.search(r"port|jack|usb|connector", fault):
        return "Charging Port Repair"
    elif re.search(r"soft|os|update|hang|lag|slow", fault):
        return "Software Repair"
    return "Back Glass Replacement"


def estimate_repair_cost(brand: str, model: str, reported_fault: str) -> Tuple[float, str]:
    """Estimates repair cost (INR) using empirical DS-12 data or domain heuristics."""
    category = map_fault_category(reported_fault)
    m_clean = model.lower().strip()
    b_clean = brand.lower().strip()
    c_clean = category.lower().strip()

    # 1. Exact model + repair type lookup
    cost = ml_assets["repair_lookup"].get((m_clean, c_clean))
    if cost is not None:
        return float(cost), category

    # 2. Brand + repair type lookup
    cost = ml_assets["brand_repair_lookup"].get((b_clean, c_clean))
    if cost is not None:
        return float(cost), category

    # 3. Category median defaults (fallback)
    fallback_defaults = {
        "Screen Replacement": 5200.0,
        "Battery Replacement": 1950.0,
        "Motherboard Repair": 7800.0,
        "Water Damage Repair": 3900.0,
        "Camera Repair": 3100.0,
        "Charging Port Repair": 1400.0,
        "Speaker Repair": 950.0,
        "Microphone Repair": 850.0,
        "Software Repair": 950.0,
        "Back Glass Replacement": 2400.0,
    }
    return float(fallback_defaults.get(category, ml_assets["global_median_repair"])), category


# ---------------------------------------------------------------------------
# Domain Logic: Environmental Carbon Impact Estimation
# ---------------------------------------------------------------------------
def compute_carbon_savings(brand: str, action: str, category: str) -> Tuple[float, Dict[str, Any]]:
    """
    Computes greenhouse gas savings (kg CO2e) against virgin production baseline.
    References LCA standards (Apple environmental reports, academic LCA benchmarks).
    """
    baseline_embodied = BASELINE_CARBON_BY_BRAND.get(brand.lower().strip(), DEFAULT_BASELINE_CARBON)

    # Component replacement carbon footprint
    part_carbon_cost = {
        "Screen Replacement": 4.5,
        "Battery Replacement": 2.8,
        "Motherboard Repair": 6.2,
        "Camera Repair": 1.9,
    }.get(category, 1.5)

    if action == "Repaired":
        # Direct life extension preserves ~80% of manufacturing carbon, minus part footprint
        saved = round(baseline_embodied * 0.82 - part_carbon_cost, 2)
        desc = "Direct lifespan extension; avoids immediate virgin handset manufacturing."
    elif action == "Refurbished":
        # Displaces new unit purchase in secondary market (standard 70% displacement factor)
        saved = round(baseline_embodied * 0.70 - part_carbon_cost, 2)
        desc = "Secondary market circulation; displaces demand for newly manufactured smartphone."
    else:  # Recycled
        # Avoided extraction through urban mining (gold, cobalt, copper, rare earth recovery)
        saved = round(baseline_embodied * 0.22, 2)
        desc = "Urban mining material recovery; reduces primary metal extraction emissions."

    breakdown = {
        "baseline_embodied_co2e_kg": baseline_embodied,
        "repair_part_embodied_co2e_kg": part_carbon_cost if action in ["Repaired", "Refurbished"] else 0.0,
        "mechanism": desc
    }
    return max(0.0, saved), breakdown


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------
@app.get("/", tags=["General"])
async def root():
    return {
        "message": "Welcome to Circular Electronics Decision Engine API",
        "docs_url": "/docs",
        "endpoint": "POST /api/assess",
        "supported_actions": ["Repaired", "Refurbished", "Recycled"]
    }


@app.get("/api/health", tags=["General"])
async def health_check():
    model_loaded = ml_assets["pipeline"] is not None
    return {
        "status": "healthy" if model_loaded else "degraded",
        "model_loaded": model_loaded,
        "classes": ml_assets["classes"],
        "features": ml_assets["feature_names"],
    }


@app.post("/api/assess", response_model=DeviceAssessmentResponse, tags=["Assessment"])
async def assess_device(payload: DeviceAssessmentRequest):
    """
    Evaluates smartphone health and fault characteristics to recommend
    whether the device should be Repaired, Refurbished, or Recycled.
    """
    pipeline = ml_assets["pipeline"]
    classes = ml_assets["classes"]

    if pipeline is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Machine learning model is not loaded."
        )

    # 1. Estimate Repair Cost based on reported fault & model
    estimated_cost, normalized_fault = estimate_repair_cost(
        brand=payload.brand,
        model=payload.model,
        reported_fault=payload.reported_fault
    )

    # 2. Construct ML Input Vector
    input_df = pd.DataFrame([{
        "device_age": float(payload.age_years),
        "battery_health": float(payload.battery_health_pct),
        "estimated_repair_cost": float(estimated_cost)
    }])

    # 3. Model Prediction
    try:
        prediction = pipeline.predict(input_df)[0]
        probabilities = pipeline.predict_proba(input_df)[0]
        confidence_scores = {
            cls: round(float(prob), 4) for cls, prob in zip(classes, probabilities)
        }
    except Exception as e:
        logger.error(f"Inference error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error executing prediction: {str(e)}"
        )

    # 4. Carbon Impact Calculation
    carbon_saved, carbon_meta = compute_carbon_savings(
        brand=payload.brand,
        action=prediction,
        category=normalized_fault
    )

    # 5. Formulate Human-readable Rationale
    if prediction == "Repaired":
        rationale = (
            f"Device has viable age ({payload.age_years:.1f} yrs) and healthy battery ({payload.battery_health_pct:.0f}%). "
            f"Fixing the {normalized_fault.lower()} (estimated ₹{estimated_cost:,.0f}) is economically and environmentally optimal."
        )
    elif prediction == "Refurbished":
        rationale = (
            f"Device is mid-lifecycle ({payload.age_years:.1f} yrs). Refurbishment and certified secondary "
            f"resale maximizes residual economic value and displaces virgin production."
        )
    else:
        rationale = (
            f"Device has reached end-of-life status (age {payload.age_years:.1f} yrs or high repair cost ₹{estimated_cost:,.0f}). "
            f"Material recovery via authorized e-waste recyclers is recommended."
        )

    return DeviceAssessmentResponse(
        brand=payload.brand,
        model=payload.model,
        recommended_lifecycle_action=prediction,
        confidence_scores=confidence_scores,
        estimated_repair_cost=estimated_cost,
        currency="INR",
        estimated_carbon_saved=carbon_saved,
        carbon_unit="kg CO2e",
        rationale=rationale,
        carbon_breakdown=carbon_meta
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)
