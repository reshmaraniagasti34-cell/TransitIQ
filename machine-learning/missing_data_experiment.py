import os
import json
import random
import numpy as np
import pandas as pd
from sklearn.metrics import mean_absolute_error, root_mean_squared_error

from dataset import build_training_dataset, WAYPOINTS, DIRECTION_MAP, TIME_BUCKET_MAP, DAY_MAP, FEATURE_COLUMNS, TARGET_COLUMN
from train import train_and_evaluate, calculate_historical_baseline_sample

DATASET_PATH = os.path.join(os.path.dirname(__file__), "..", "backend", "data", "historicalTrips.json")
RESULTS_DIR = os.path.join(os.path.dirname(__file__), "results")
RESULTS_JSON_PATH = os.path.join(RESULTS_DIR, "missing_data_results.json")

def load_models_for_experiment():
    import joblib
    model_dir = os.path.join(os.path.dirname(__file__), "models")
    rf_path = os.path.join(model_dir, "rf_model.joblib")
    gb_lower_path = os.path.join(model_dir, "gb_lower.joblib")
    gb_upper_path = os.path.join(model_dir, "gb_upper.joblib")

    if not (os.path.exists(rf_path) and os.path.exists(gb_lower_path) and os.path.exists(gb_upper_path)):
        train_and_evaluate(DATASET_PATH, seed=42)

    rf_model = joblib.load(rf_path)
    gb_lower = joblib.load(gb_lower_path)
    gb_upper = joblib.load(gb_upper_path)
    return rf_model, gb_lower, gb_upper

def run_missing_data_experiment(seed=42):
    os.makedirs(RESULTS_DIR, exist_ok=True)
    random.seed(seed)
    np.random.seed(seed)

    # 1. Load full evaluation dataset & models
    df = build_training_dataset(DATASET_PATH)
    rf_model, gb_lower, gb_upper = load_models_for_experiment()

    # Reproducible train/test split matching Phase 5 & 5.5
    from sklearn.model_selection import train_test_split
    X = df[FEATURE_COLUMNS]
    y = df[TARGET_COLUMN]
    X_train, X_test, y_train, y_test, df_train, df_test = train_test_split(
        X, y, df, test_size=0.20, random_state=seed
    )

    missing_levels = [0, 25, 50, 75, 100]
    experiment_summary = {
        "seed": seed,
        "test_samples": len(df_test),
        "observed_trips_count": int((df["data_origin"] == "observed").sum()),
        "simulated_trips_count": int((df["data_origin"] == "simulated").sum()),
        "levels": {}
    }

    # Evaluate each missing data level
    for pct in missing_levels:
        hist_preds = []
        ml_preds = []
        hybrid_preds = []
        actuals = []

        ml_lower_list = []
        ml_upper_list = []

        for idx, row in df_test.iterrows():
            true_rem_time = row[TARGET_COLUMN]
            actuals.append(true_rem_time)

            # Determine signal retention for this observation point
            is_missing = (random.random() * 100.0) < pct if pct < 100 else True
            is_retained = not is_missing

            # 1. Historical Baseline (Always available from context/origin)
            hist_val = calculate_historical_baseline_sample(row, df_train)
            hist_preds.append(hist_val)

            # Feature vector for true position
            feature_row = pd.DataFrame([row[FEATURE_COLUMNS]])

            if pct == 100:
                # 100% missing: ML position is unknowable without live GPS
                ml_val = None
                hybrid_val = hist_val # Historical fallback
            elif is_retained:
                # Retained live signal: ML model receives current position features
                ml_val = float(rf_model.predict(feature_row)[0])
                ml_lower = float(gb_lower.predict(feature_row)[0])
                ml_upper = float(gb_upper.predict(feature_row)[0])
                ml_lower_list.append(ml_lower)
                ml_upper_list.append(ml_upper)
                ml_preds.append(ml_val)
                # Hybrid uses LIVE weight (0.70 ML + 0.30 Historical)
                hybrid_val = 0.70 * ml_val + 0.30 * hist_val
            else:
                # Missing/Stale signal: ML relies on last known position (origin/previous waypoint)
                # Simulate stale position by falling back to origin index 0
                stale_row = feature_row.copy()
                stale_row["current_waypoint_idx"] = 0
                stale_row["remaining_segments_count"] = row["target_waypoint_idx"]
                ml_val = float(rf_model.predict(stale_row)[0])
                ml_lower = float(gb_lower.predict(stale_row)[0])
                ml_upper = float(gb_upper.predict(stale_row)[0])
                ml_lower_list.append(ml_lower)
                ml_upper_list.append(ml_upper)
                ml_preds.append(ml_val)
                # Hybrid uses PARTIAL weight (0.50 ML + 0.50 Historical)
                hybrid_val = 0.50 * ml_val + 0.50 * hist_val

            hybrid_preds.append(hybrid_val)

        # Compute metrics for this level
        actuals_np = np.array(actuals)
        hist_preds_np = np.array(hist_preds)
        hybrid_preds_np = np.array(hybrid_preds)

        hist_mae = float(mean_absolute_error(actuals_np, hist_preds_np))
        hist_rmse = float(root_mean_squared_error(actuals_np, hist_preds_np))

        hybrid_mae = float(mean_absolute_error(actuals_np, hybrid_preds_np))
        hybrid_rmse = float(root_mean_squared_error(actuals_np, hybrid_preds_np))

        if len(ml_preds) > 0:
            ml_preds_np = np.array(ml_preds)
            ml_mae = float(mean_absolute_error(actuals_np, ml_preds_np))
            ml_rmse = float(root_mean_squared_error(actuals_np, ml_preds_np))
            ml_available = True
            ml_reason = "Evaluated on retained/stale GPS observations"

            if len(ml_lower_list) > 0:
                ml_lower_np = np.array(ml_lower_list)
                ml_upper_np = np.array(ml_upper_list)
                cov_mask = (actuals_np >= ml_lower_np) & (actuals_np <= ml_upper_np)
                coverage = float(np.mean(cov_mask) * 100.0)
                avg_width = float(np.mean(ml_upper_np - ml_lower_np))
            else:
                coverage = None
                avg_width = None
        else:
            ml_mae = None
            ml_rmse = None
            ml_available = False
            ml_reason = "Current position unavailable without live GPS"
            coverage = None
            avg_width = None

        experiment_summary["levels"][f"{pct}%"] = {
            "missing_percentage": pct,
            "retained_percentage": 100 - pct,
            "historical_baseline": {
                "mae": round(hist_mae, 4),
                "rmse": round(hist_rmse, 4),
                "available": True
            },
            "ml": {
                "mae": round(ml_mae, 4) if ml_mae is not None else None,
                "rmse": round(ml_rmse, 4) if ml_rmse is not None else None,
                "available": ml_available,
                "reason": ml_reason,
                "interval_coverage_percent": round(coverage, 2) if coverage is not None else None,
                "avg_interval_width": round(avg_width, 2) if avg_width is not None else None
            },
            "hybrid": {
                "mae": round(hybrid_mae, 4),
                "rmse": round(hybrid_rmse, 4),
                "available": True,
                "fallback_active": pct == 100
            }
        }

    with open(RESULTS_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(experiment_summary, f, indent=2)

    return experiment_summary

if __name__ == "__main__":
    res = run_missing_data_experiment()
    print("--- Missing-Data Degradation Experiment Summary ---")
    print(json.dumps(res, indent=2))
