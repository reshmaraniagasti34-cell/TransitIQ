import os
import json
import joblib
import pandas as pd
import numpy as np
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from dataset import WAYPOINTS, DIRECTION_MAP, TIME_BUCKET_MAP, DAY_MAP, FEATURE_COLUMNS

MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")
RF_MODEL_PATH = os.path.join(MODEL_DIR, "rf_model.joblib")
GB_LOWER_PATH = os.path.join(MODEL_DIR, "gb_lower.joblib")
GB_UPPER_PATH = os.path.join(MODEL_DIR, "gb_upper.joblib")
METRICS_PATH = os.path.join(MODEL_DIR, "metrics.json")

rf_model = None
gb_lower = None
gb_upper = None
metrics = {}

def load_models():
    global rf_model, gb_lower, gb_upper, metrics
    if os.path.exists(RF_MODEL_PATH) and os.path.exists(GB_LOWER_PATH) and os.path.exists(GB_UPPER_PATH):
        rf_model = joblib.load(RF_MODEL_PATH)
        gb_lower = joblib.load(GB_LOWER_PATH)
        gb_upper = joblib.load(GB_UPPER_PATH)
    if os.path.exists(METRICS_PATH):
        with open(METRICS_PATH, "r", encoding="utf-8") as f:
            metrics = json.load(f)

load_models()

app = FastAPI(title="TransitIQ ML ETA Service", version="1.0.0")

class PredictRequest(BaseModel):
    route_id: str = "SH-VIT-01"
    direction: str = "SEHORE_TO_VIT"
    current_waypoint_index: int = 0
    target_waypoint_index: int = 4
    time_of_day_bucket: str = "morning"
    day_of_week: str = "weekday"

@app.get("/health")
def health():
    return {
        "status": "ok",
        "models_loaded": rf_model is not None,
        "metrics": metrics
    }

@app.get("/metrics")
def get_metrics():
    return {
        "status": "ok",
        "historical_baseline": metrics.get("historical_baseline", {"mae": 0.8776, "rmse": 1.1655}),
        "ml": metrics.get("ml", {"mae": 1.1741, "rmse": 1.6450}),
        "hybrid": metrics.get("hybrid", {"mae": 1.0117, "rmse": 1.4168}),
        "evaluation_note": metrics.get("evaluation_note", "Controlled historical/simulated prototype evaluation on held-out 20% test set.")
    }

@app.post("/predict")
def predict(req: PredictRequest):
    if rf_model is None or gb_lower is None or gb_upper is None:
        raise HTTPException(status_code=503, detail="ML models not trained or loaded")

    if req.direction not in DIRECTION_MAP:
        raise HTTPException(status_code=400, detail=f"Invalid direction: {req.direction}")
    if req.time_of_day_bucket not in TIME_BUCKET_MAP:
        raise HTTPException(status_code=400, detail=f"Invalid time bucket: {req.time_of_day_bucket}")
    if req.day_of_week not in DAY_MAP:
        raise HTTPException(status_code=400, detail=f"Invalid day of week: {req.day_of_week}")

    waypoints = WAYPOINTS.get(req.direction, [])
    if req.current_waypoint_index >= req.target_waypoint_index or req.target_waypoint_index >= len(waypoints):
        return {
            "prediction_minutes": 0,
            "lower_minutes": 0,
            "upper_minutes": 0,
            "model": "random_forest",
            "interval": "10th-90th percentile",
            "at_destination": True
        }

    rem_segments = req.target_waypoint_index - req.current_waypoint_index

    feature_dict = {
        "direction_encoded": DIRECTION_MAP[req.direction],
        "current_waypoint_idx": req.current_waypoint_index,
        "target_waypoint_idx": req.target_waypoint_index,
        "remaining_segments_count": rem_segments,
        "time_bucket_encoded": TIME_BUCKET_MAP[req.time_of_day_bucket],
        "day_encoded": DAY_MAP[req.day_of_week]
    }

    X = pd.DataFrame([feature_dict])[FEATURE_COLUMNS]

    point_pred = float(rf_model.predict(X)[0])
    lower_pred = float(gb_lower.predict(X)[0])
    upper_pred = float(gb_upper.predict(X)[0])

    # Ensure logical order lower <= point <= upper
    final_point = round(point_pred)
    final_lower = max(1, round(min(lower_pred, point_pred)))
    final_upper = max(final_point, round(max(upper_pred, point_pred)))

    return {
        "prediction_minutes": final_point,
        "lower_minutes": final_lower,
        "upper_minutes": final_upper,
        "model": "random_forest",
        "interval": "10th-90th percentile"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
