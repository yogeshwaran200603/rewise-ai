"""
=============================================================================
Smartphone Circular Economy Disposition Model
Recommending: Repaired vs Refurbished vs Recycled
=============================================================================
Author: Expert Machine Learning Engineer
Stack: Python 3.12+, Pandas, Scikit-Learn, Joblib

Objective:
    Loads and cleans smartphone datasets (including ifixit_devices.csv,
    DS-12_India_Mobile_Repair_Cost_5000.csv, and used_smartphone_price_dataset_3000.csv),
    preprocesses missing values, engineers features, and trains a classification
    pipeline to recommend whether a smartphone should be:
        1. Repaired    - Low age, healthy battery, economical repair
        2. Refurbished - Mid-age/degraded battery, economically viable for resale
        3. Recycled    - Obsolete age, severe battery decay, prohibitive repair cost

    Saves the final trained pipeline and metadata artifact using joblib.
"""

import os
import sys
import logging
from datetime import datetime
from typing import Tuple, Dict, Any

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
import joblib

# ---------------------------------------------------------------------------
# Logging Configuration
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger("DeviceDispositionML")

# ---------------------------------------------------------------------------
# File Path Resolution Helper
# ---------------------------------------------------------------------------
def resolve_file_path(filename: str, candidate_dirs: list[str]) -> str:
    """Finds the absolute path of a file across candidate directories."""
    for directory in candidate_dirs:
        candidate = os.path.join(directory, filename)
        if os.path.isfile(candidate):
            return os.path.abspath(candidate)
    raise FileNotFoundError(f"Could not locate '{filename}' in candidate dirs: {candidate_dirs}")


# ---------------------------------------------------------------------------
# 1. Dataset Ingestion & Cleaning
# ---------------------------------------------------------------------------
def load_and_clean_datasets(base_dir: str = ".") -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """
    Loads and cleans:
      - ifixit_devices.csv: Repairability scores
      - DS-12_India_Mobile_Repair_Cost_5000.csv: Empirical repair price schedules
      - used_smartphone_price_dataset_3000.csv: Device condition, age, battery health
    """
    candidate_dirs = [
        base_dir,
        os.path.join(base_dir, "data sets"),
        os.path.join(base_dir, "datasets"),
    ]

    ifixit_path = resolve_file_path("ifixit_devices.csv", candidate_dirs)
    repair_path = resolve_file_path("DS-12_India_Mobile_Repair_Cost_5000.csv", candidate_dirs)
    used_path = resolve_file_path("used_smartphone_price_dataset_3000.csv", candidate_dirs)

    logger.info(f"Loading iFixit dataset from: {ifixit_path}")
    df_ifixit = pd.read_csv(ifixit_path)

    logger.info(f"Loading India Repair Cost dataset from: {repair_path}")
    df_repair = pd.read_csv(repair_path)

    logger.info(f"Loading Used Smartphone dataset from: {used_path}")
    df_used = pd.read_csv(used_path)

    # -----------------------------------------------------------------------
    # Cleaning 1: iFixit Dataset
    # -----------------------------------------------------------------------
    # Handle duplicate or misaligned entries, coerce repairability score to numeric
    df_ifixit["repairability_score"] = pd.to_numeric(df_ifixit["repairability_score"], errors="coerce")
    
    # Impute missing repairability scores with brand median, then global median (~6.0)
    brand_ifixit_median = df_ifixit.groupby("brand")["repairability_score"].transform("median")
    df_ifixit["repairability_score"] = df_ifixit["repairability_score"].fillna(brand_ifixit_median)
    global_ifixit_median = df_ifixit["repairability_score"].median()
    df_ifixit["repairability_score"] = df_ifixit["repairability_score"].fillna(
        global_ifixit_median if pd.notna(global_ifixit_median) else 6.0
    )
    df_ifixit["brand"] = df_ifixit["brand"].fillna("Unknown").astype(str).str.strip()
    df_ifixit["name"] = df_ifixit["name"].fillna("Unknown").astype(str).str.strip()
    df_ifixit = df_ifixit.drop_duplicates(subset=["name", "brand"])

    # -----------------------------------------------------------------------
    # Cleaning 2: DS-12 Repair Cost Dataset
    # -----------------------------------------------------------------------
    # Clean numeric repair costs
    df_repair["repair_cost_inr"] = pd.to_numeric(df_repair["repair_cost_inr"], errors="coerce")
    df_repair = df_repair.dropna(subset=["repair_cost_inr"])
    df_repair = df_repair[df_repair["repair_cost_inr"] > 0]
    
    # Drop columns that are completely unpopulated in DS-12 (original_price_inr, mrp_inr)
    df_repair = df_repair.drop(columns=[col for col in ["original_price_inr", "mrp_inr"] if col in df_repair.columns])
    df_repair["brand"] = df_repair["brand"].astype(str).str.strip()
    df_repair["model"] = df_repair["model"].astype(str).str.strip()

    # -----------------------------------------------------------------------
    # Cleaning 3: Used Smartphone Dataset
    # -----------------------------------------------------------------------
    # Validate and clean core features: age_years and battery_health_pct
    df_used["age_years"] = pd.to_numeric(df_used["age_years"], errors="coerce")
    df_used["age_years"] = df_used["age_years"].fillna(df_used["age_years"].median()).clip(lower=0.0, upper=10.0)

    df_used["battery_health_pct"] = pd.to_numeric(df_used["battery_health_pct"], errors="coerce")
    df_used["battery_health_pct"] = df_used["battery_health_pct"].fillna(df_used["battery_health_pct"].median()).clip(lower=20.0, upper=100.0)

    # Fill categorical missing values
    if "scratches" in df_used.columns:
        df_used["scratches"] = df_used["scratches"].fillna("None")
    if "repair_history" in df_used.columns:
        df_used["repair_history"] = df_used["repair_history"].fillna("None")

    logger.info(
        f"Cleaned datasets: iFixit={len(df_ifixit)} rows, "
        f"DS-12 Repair={len(df_repair)} rows, "
        f"Used Phones={len(df_used)} rows"
    )

    return df_ifixit, df_repair, df_used


# ---------------------------------------------------------------------------
# 2. Feature Merging & Ground Truth Labeling
# ---------------------------------------------------------------------------
def build_feature_dataset(
    df_ifixit: pd.DataFrame,
    df_repair: pd.DataFrame,
    df_used: pd.DataFrame,
    random_state: int = 42
) -> pd.DataFrame:
    """
    Merges repair cost distributions and ifixit scores with used smartphone
    profiles, and assigns standard circular economy recommendations:
      - 'Repaired'
      - 'Refurbished'
      - 'Recycled'
    """
    rng = np.random.default_rng(random_state)

    # Compute repair cost statistics per model and brand
    model_repair_median = df_repair.groupby(["brand", "model"])["repair_cost_inr"].median().to_dict()
    brand_repair_median = df_repair.groupby("brand")["repair_cost_inr"].median().to_dict()
    global_repair_median = float(df_repair["repair_cost_inr"].median())

    # Map estimated repair costs to each used smartphone record
    estimated_repair_costs = []
    for _, row in df_used.iterrows():
        b = str(row["brand"]).strip()
        m = str(row["model"]).strip()
        
        # Exact (brand, model) lookup, fallback to brand median, then global median
        base_cost = model_repair_median.get((b, m), brand_repair_median.get(b, global_repair_median))
        
        # Adjust repair cost dynamically based on actual physical device condition
        condition = str(row.get("condition", "Good")).strip().lower()
        has_crack = str(row.get("screen_crack", "No")).strip().lower() == "yes"

        if has_crack:
            multiplier = rng.uniform(1.6, 2.2)  # Screen replacement required
        elif condition == "poor":
            multiplier = rng.uniform(1.3, 1.7)  # Multiple component fixes
        elif condition == "fair":
            multiplier = rng.uniform(1.0, 1.3)  # Moderate wear/tear
        else:
            multiplier = rng.uniform(0.65, 1.0)  # Minor tune-up / single small part

        estimated_repair_costs.append(round(float(base_cost * multiplier), 2))

    df_processed = pd.DataFrame({
        "device_age": df_used["age_years"].astype(float),
        "battery_health": df_used["battery_health_pct"].astype(float),
        "estimated_repair_cost": estimated_repair_costs,
        "brand": df_used["brand"].astype(str),
        "model": df_used["model"].astype(str),
    })

    # -----------------------------------------------------------------------
    # Decision Engine: Ground Truth Labeling for Circular Economy
    # -----------------------------------------------------------------------
    def determine_recommendation(age: float, battery: float, cost: float) -> str:
        """
        Circular Economy Recommendation Rules:
          - Recycled: Obsolete age (>= 4.0 yrs), severely degraded battery (<65% with high cost),
                      or prohibitive repair cost (>= 7000 INR).
          - Repaired: Modern device (<= 2.0 yrs), healthy battery (>= 78%), economical repair (<= 4500 INR).
          - Refurbished: Intermediate lifecycle (2-4 yrs, or 65-78% battery needing cell renewal,
                         or moderate refurbishing costs 4500-7000 INR).
        """
        # 1. End-of-Life / Severe Degradation -> Recycle
        if (
            age >= 4.0 or
            (age >= 3.0 and battery < 70.0) or
            cost >= 7000.0 or
            (battery < 65.0 and cost >= 4500.0)
        ):
            return "Recycled"
        
        # 2. Healthy Prime Life / Quick Economic Fix -> Repair
        elif (
            age <= 2.0 and
            battery >= 78.0 and
            cost <= 4500.0
        ):
            return "Repaired"
        
        # 3. Mid-lifecycle Renewal / Secondary Market -> Refurbish
        else:
            return "Refurbished"

    df_processed["recommendation"] = [
        determine_recommendation(a, b, c)
        for a, b, c in zip(
            df_processed["device_age"],
            df_processed["battery_health"],
            df_processed["estimated_repair_cost"]
        )
    ]

    logger.info("Dataset feature engineering completed successfully.")
    logger.info("Recommendation Class Distribution:\n" + str(df_processed["recommendation"].value_counts()))

    return df_processed


# ---------------------------------------------------------------------------
# 3. Model Training & Evaluation
# ---------------------------------------------------------------------------
def train_and_evaluate_model(
    df: pd.DataFrame,
    random_state: int = 42
) -> Tuple[Pipeline, Dict[str, Any]]:
    """
    Trains a Scikit-Learn Pipeline on (device_age, battery_health, estimated_repair_cost).
    Computes cross-validation, test-set metrics, confusion matrix, and feature importances.
    """
    feature_cols = ["device_age", "battery_health", "estimated_repair_cost"]
    target_col = "recommendation"

    X = df[feature_cols]
    y = df[target_col]

    # Stratified Train/Test Split (80% train, 20% test)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y,
        test_size=0.20,
        random_state=random_state,
        stratify=y
    )

    logger.info(f"Training set: {X_train.shape[0]} samples | Test set: {X_test.shape[0]} samples")

    # Scikit-Learn Classification Pipeline
    pipeline = Pipeline([
        ("scaler", StandardScaler()),
        ("classifier", RandomForestClassifier(
            n_estimators=120,
            max_depth=7,
            min_samples_split=4,
            min_samples_leaf=2,
            random_state=random_state,
            n_jobs=-1
        ))
    ])

    # 5-Fold Stratified Cross-Validation
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=random_state)
    cv_scores = cross_val_score(pipeline, X_train, y_train, cv=cv, scoring="accuracy")
    logger.info(f"5-Fold CV Accuracy: {cv_scores.mean():.4f} (+/- {cv_scores.std():.4f})")

    # Fit Pipeline on Training Data
    pipeline.fit(X_train, y_train)

    # Evaluate on Unseen Test Set
    y_pred = pipeline.predict(X_test)
    test_acc = accuracy_score(y_test, y_pred)
    report = classification_report(y_test, y_pred, digits=4)
    c_matrix = confusion_matrix(y_test, y_pred, labels=pipeline.classes_)

    logger.info(f"Test Set Accuracy: {test_acc:.4f}")
    logger.info(f"\nClassification Report:\n{report}")

    # Extract Feature Importances
    rf_model: RandomForestClassifier = pipeline.named_steps["classifier"]
    importances = dict(zip(feature_cols, rf_model.feature_importances_))
    logger.info("Feature Importances:")
    for feat, imp in sorted(importances.items(), key=lambda x: x[1], reverse=True):
        logger.info(f"  - {feat:22s}: {imp * 100:.2f}%")

    metrics_bundle = {
        "feature_names": feature_cols,
        "classes": list(pipeline.classes_),
        "cv_accuracy_mean": float(cv_scores.mean()),
        "cv_accuracy_std": float(cv_scores.std()),
        "test_accuracy": float(test_acc),
        "confusion_matrix": c_matrix.tolist(),
        "feature_importances": importances,
        "classification_report": report,
        "trained_timestamp": datetime.now().isoformat()
    }

    return pipeline, metrics_bundle


# ---------------------------------------------------------------------------
# 4. Model Persistence
# ---------------------------------------------------------------------------
def save_model(pipeline: Pipeline, metrics: Dict[str, Any], output_path: str = "device_recommendation_model.joblib"):
    """Serializes the pipeline and metadata dictionary using joblib."""
    payload = {
        "pipeline": pipeline,
        "metadata": metrics
    }
    joblib.dump(payload, output_path)
    logger.info(f"Trained model pipeline & metadata successfully saved to: {os.path.abspath(output_path)}")


# ---------------------------------------------------------------------------
# 5. Inference Predictor Helper
# ---------------------------------------------------------------------------
def predict_device_action(
    model_path: str,
    device_age: float,
    battery_health: float,
    estimated_repair_cost: float
) -> Dict[str, Any]:
    """
    Demonstrates model inference given device age, battery health, and estimated repair cost.
    Returns recommendation, class probabilities, and human-readable explanation.
    """
    saved = joblib.load(model_path)
    pipeline: Pipeline = saved["pipeline"]
    classes = saved["metadata"]["classes"]

    input_df = pd.DataFrame([{
        "device_age": float(device_age),
        "battery_health": float(battery_health),
        "estimated_repair_cost": float(estimated_repair_cost)
    }])

    prediction = pipeline.predict(input_df)[0]
    probabilities = pipeline.predict_proba(input_df)[0]
    prob_dict = {cls: round(float(prob), 4) for cls, prob in zip(classes, probabilities)}

    # Contextual explanation
    if prediction == "Repaired":
        reason = "Device has low operational age, high battery retention, and repair costs remain economical."
    elif prediction == "Refurbished":
        reason = "Device is mid-lifecycle with moderate battery decay or repair requirements; suitable for certified refurbishment and resale."
    else:
        reason = "Device is aged, has severe battery wear, or repair costs exceed economic viability; recommended for material recovery/recycling."

    return {
        "inputs": {
            "device_age_years": device_age,
            "battery_health_pct": battery_health,
            "estimated_repair_cost_inr": estimated_repair_cost
        },
        "recommendation": prediction,
        "probabilities": prob_dict,
        "rationale": reason
    }


# ---------------------------------------------------------------------------
# Main Execution Entrypoint
# ---------------------------------------------------------------------------
def main():
    print("=" * 78)
    print("      SMARTPHONE CIRCULAR LIFECYCLE CLASSIFICATION MODEL TRAINING")
    print("=" * 78)

    # 1. Load & Clean
    df_ifixit, df_repair, df_used = load_and_clean_datasets(base_dir=".")

    # 2. Build Unified Features & Labels
    df_features = build_feature_dataset(df_ifixit, df_repair, df_used, random_state=42)

    # 3. Train & Evaluate
    pipeline, metrics = train_and_evaluate_model(df_features, random_state=42)

    # 4. Save Model
    model_filename = "device_recommendation_model.joblib"
    save_model(pipeline, metrics, output_path=model_filename)

    # 5. Interactive / Demonstration Inference
    print("\n" + "=" * 78)
    print("                   SAMPLE INFERENCE DEMONSTRATIONS")
    print("=" * 78)

    test_scenarios = [
        {"title": "Scenario A: Nearly New Phone with Minor Defect", "age": 0.8, "battery": 94.0, "cost": 1800.0},
        {"title": "Scenario B: Mid-Life Phone Needing Overhaul",    "age": 2.8, "battery": 73.0, "cost": 4900.0},
        {"title": "Scenario C: Old Device with Motherboard Failure", "age": 4.8, "battery": 58.0, "cost": 8500.0},
    ]

    for scenario in test_scenarios:
        result = predict_device_action(
            model_path=model_filename,
            device_age=scenario["age"],
            battery_health=scenario["battery"],
            estimated_repair_cost=scenario["cost"]
        )
        print(f"\n[{scenario['title']}]")
        print(f"  Inputs        : Age={scenario['age']} yrs | Battery={scenario['battery']}% | Repair Cost=INR {scenario['cost']:,.2f}")
        print(f"  Recommendation: >>> {result['recommendation'].upper()} <<<")
        print(f"  Probabilities : {result['probabilities']}")
        print(f"  Rationale     : {result['rationale']}")

    print("\n" + "=" * 78)
    print(" Training and Verification Complete! Model artifact is ready for deployment.")
    print("=" * 78)


if __name__ == "__main__":
    main()
