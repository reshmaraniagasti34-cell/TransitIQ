import os
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, root_mean_squared_error

from dataset import build_training_dataset, FEATURE_COLUMNS, TARGET_COLUMN

DATASET_PATH = os.path.join(os.path.dirname(__file__), "..", "backend", "data", "historicalTrips.json")
MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")

def calculate_historical_baseline_sample(row, df_full):
    # Match route_id + direction + day_of_week + time_of_day_bucket
    matching = df_full[
        (df_full["route_id"] == row["route_id"]) &
        (df_full["direction"] == row["direction"]) &
        (df_full["current_waypoint_idx"] == row["current_waypoint_idx"]) &
        (df_full["target_waypoint_idx"] == row["target_waypoint_idx"]) &
        (df_full["day_encoded"] == row["day_encoded"]) &
        (df_full["time_bucket_encoded"] == row["time_bucket_encoded"])
    ]
    if len(matching) == 0:
        # Fallback to route + direction + segment indices
        matching = df_full[
            (df_full["route_id"] == row["route_id"]) &
            (df_full["direction"] == row["direction"]) &
            (df_full["current_waypoint_idx"] == row["current_waypoint_idx"]) &
            (df_full["target_waypoint_idx"] == row["target_waypoint_idx"])
        ]
    if len(matching) == 0:
        return row[TARGET_COLUMN] # Fallback if no records match
    return float(matching[TARGET_COLUMN].mean())

def train_and_evaluate(dataset_path=DATASET_PATH, seed=42):
    os.makedirs(MODEL_DIR, exist_ok=True)
    df = build_training_dataset(dataset_path)

    X = df[FEATURE_COLUMNS]
    y = df[TARGET_COLUMN]

    # Reproducible 80/20 train/test split (Exact same split across all models)
    X_train, X_test, y_train, y_test, df_train, df_test = train_test_split(
        X, y, df, test_size=0.20, random_state=seed
    )

    # 1. Primary Point Predictor: RandomForestRegressor
    rf_model = RandomForestRegressor(n_estimators=50, max_depth=6, random_state=seed)
    rf_model.fit(X_train, y_train)

    rf_preds = rf_model.predict(X_test)
    ml_mae = float(mean_absolute_error(y_test, rf_preds))
    ml_rmse = float(root_mean_squared_error(y_test, rf_preds))

    # 2. Lower & Upper Quantile Models
    gb_lower = GradientBoostingRegressor(loss="quantile", alpha=0.10, n_estimators=50, max_depth=3, random_state=seed)
    gb_lower.fit(X_train, y_train)
    lower_preds = gb_lower.predict(X_test)

    gb_upper = GradientBoostingRegressor(loss="quantile", alpha=0.90, n_estimators=50, max_depth=3, random_state=seed)
    gb_upper.fit(X_train, y_train)
    upper_preds = gb_upper.predict(X_test)

    # 3. Evaluate Historical Baseline on Held-out Test Set
    historical_preds = np.array([
        calculate_historical_baseline_sample(row, df_train)
        for _, row in df_test.iterrows()
    ])
    hist_mae = float(mean_absolute_error(y_test, historical_preds))
    hist_rmse = float(root_mean_squared_error(y_test, historical_preds))

    # 4. Evaluate Hybrid Model on Held-out Test Set
    # Using LIVE state prototype weights (0.70 ML + 0.30 Historical) for live performance comparison
    hybrid_preds = 0.70 * rf_preds + 0.30 * historical_preds
    hybrid_mae = float(mean_absolute_error(y_test, hybrid_preds))
    hybrid_rmse = float(root_mean_squared_error(y_test, hybrid_preds))

    # 5. Evaluate Interval Coverage and Average Width for ML Quantiles
    y_test_arr = y_test.to_numpy()
    coverage_mask = (y_test_arr >= lower_preds) & (y_test_arr <= upper_preds)
    coverage = float(np.mean(coverage_mask) * 100.0)
    avg_width = float(np.mean(upper_preds - lower_preds))

    # Save models
    joblib.dump(rf_model, os.path.join(MODEL_DIR, "rf_model.joblib"))
    joblib.dump(gb_lower, os.path.join(MODEL_DIR, "gb_lower.joblib"))
    joblib.dump(gb_upper, os.path.join(MODEL_DIR, "gb_upper.joblib"))

    metrics = {
        "dataset_total_samples": len(df),
        "train_samples": len(X_train),
        "test_samples": len(X_test),
        "observed_records_in_dataset": int((df["data_origin"] == "observed").sum()),
        "simulated_records_in_dataset": int((df["data_origin"] == "simulated").sum()),
        "historical_baseline": {
            "mae": round(hist_mae, 4),
            "rmse": round(hist_rmse, 4)
        },
        "ml": {
            "mae": round(ml_mae, 4),
            "rmse": round(ml_rmse, 4)
        },
        "hybrid": {
            "mae": round(hybrid_mae, 4),
            "rmse": round(hybrid_rmse, 4)
        },
        "mae": round(ml_mae, 4),
        "rmse": round(ml_rmse, 4),
        "interval_coverage_percent": round(coverage, 2),
        "avg_interval_width": round(avg_width, 2),
        "model_type": "RandomForestRegressor",
        "quantile_model_type": "GradientBoostingRegressor (10th & 90th percentile)",
        "evaluation_note": "Controlled historical/simulated prototype evaluation on held-out 20% test set."
    }

    with open(os.path.join(MODEL_DIR, "metrics.json"), "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)

    return metrics

if __name__ == "__main__":
    res = train_and_evaluate()
    print("--- ML & Hybrid Training/Evaluation Summary ---")
    print(json.dumps(res, indent=2))
