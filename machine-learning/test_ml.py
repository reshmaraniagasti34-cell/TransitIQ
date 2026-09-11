import unittest
import os
import json
import pandas as pd
import numpy as np
from fastapi.testclient import TestClient

from dataset import build_training_dataset, WAYPOINTS
from train import train_and_evaluate, MODEL_DIR
from service import app

DATASET_PATH = os.path.join(os.path.dirname(__file__), "..", "backend", "data", "historicalTrips.json")

class TestPhase5ML(unittest.TestCase):

    def test_1_historical_data_loading(self):
        self.assertTrue(os.path.exists(DATASET_PATH), "historicalTrips.json path exists")
        df = build_training_dataset(DATASET_PATH)
        self.assertGreater(len(df), 0, "Dataset contains rows")

    def test_2_feature_construction(self):
        df = build_training_dataset(DATASET_PATH)
        expected_cols = [
            "direction_encoded",
            "current_waypoint_idx",
            "target_waypoint_idx",
            "remaining_segments_count",
            "time_bucket_encoded",
            "day_encoded",
            "target_remaining_minutes"
        ]
        for col in expected_cols:
            self.assertIn(col, df.columns, f"Feature column {col} present in dataset")

    def test_3_target_construction(self):
        df = build_training_dataset(DATASET_PATH)
        # Check target is positive integer/float
        self.assertTrue((df["target_remaining_minutes"] > 0).all(), "Target remaining minutes are positive")

    def test_4_train_test_split_reproducibility(self):
        metrics1 = train_and_evaluate(DATASET_PATH, seed=42)
        metrics2 = train_and_evaluate(DATASET_PATH, seed=42)
        self.assertEqual(metrics1["mae"], metrics2["mae"], "Train/test split MAE reproducible")
        self.assertEqual(metrics1["rmse"], metrics2["rmse"], "Train/test split RMSE reproducible")

    def test_5_random_forest_training(self):
        rf_path = os.path.join(MODEL_DIR, "rf_model.joblib")
        self.assertTrue(os.path.exists(rf_path), "RandomForest model file generated")

    def test_6_prediction_generation(self):
        client = TestClient(app)
        res = client.post("/predict", json={
            "route_id": "SH-VIT-01",
            "direction": "SEHORE_TO_VIT",
            "current_waypoint_index": 0,
            "target_waypoint_index": 4,
            "time_of_day_bucket": "morning",
            "day_of_week": "weekday"
        })
        self.assertEqual(res.status_code, 200, "/predict status 200")
        data = res.json()
        self.assertIn("prediction_minutes", data)
        self.assertIsInstance(data["prediction_minutes"], int)

    def test_7_mae_calculation(self):
        with open(os.path.join(MODEL_DIR, "metrics.json"), "r") as f:
            metrics = json.load(f)
        self.assertIn("mae", metrics)
        self.assertIsInstance(metrics["mae"], float)

    def test_8_rmse_calculation(self):
        with open(os.path.join(MODEL_DIR, "metrics.json"), "r") as f:
            metrics = json.load(f)
        self.assertIn("rmse", metrics)
        self.assertIsInstance(metrics["rmse"], float)

    def test_9_lower_quantile_prediction(self):
        client = TestClient(app)
        res = client.post("/predict", json={
            "route_id": "SH-VIT-01",
            "direction": "SEHORE_TO_VIT",
            "current_waypoint_index": 0,
            "target_waypoint_index": 4,
            "time_of_day_bucket": "morning",
            "day_of_week": "weekday"
        })
        data = res.json()
        self.assertIn("lower_minutes", data)
        self.assertIsInstance(data["lower_minutes"], int)

    def test_10_upper_quantile_prediction(self):
        client = TestClient(app)
        res = client.post("/predict", json={
            "route_id": "SH-VIT-01",
            "direction": "SEHORE_TO_VIT",
            "current_waypoint_index": 0,
            "target_waypoint_index": 4,
            "time_of_day_bucket": "morning",
            "day_of_week": "weekday"
        })
        data = res.json()
        self.assertIn("upper_minutes", data)
        self.assertIsInstance(data["upper_minutes"], int)

    def test_11_lower_le_point_le_upper(self):
        client = TestClient(app)
        res = client.post("/predict", json={
            "route_id": "SH-VIT-01",
            "direction": "SEHORE_TO_VIT",
            "current_waypoint_index": 2, # Amlaha -> VIT
            "target_waypoint_index": 4,
            "time_of_day_bucket": "morning",
            "day_of_week": "weekday"
        })
        data = res.json()
        self.assertTrue(data["lower_minutes"] <= data["prediction_minutes"] <= data["upper_minutes"],
                        f"Order check: {data['lower_minutes']} <= {data['prediction_minutes']} <= {data['upper_minutes']}")

    def test_12_interval_coverage_calculation(self):
        with open(os.path.join(MODEL_DIR, "metrics.json"), "r") as f:
            metrics = json.load(f)
        self.assertIn("interval_coverage_percent", metrics)
        self.assertGreater(metrics["interval_coverage_percent"], 0.0)

    def test_13_avg_interval_width_calculation(self):
        with open(os.path.join(MODEL_DIR, "metrics.json"), "r") as f:
            metrics = json.load(f)
        self.assertIn("avg_interval_width", metrics)
        self.assertGreater(metrics["avg_interval_width"], 0.0)

    def test_14_predict_service_response_structure(self):
        client = TestClient(app)
        res = client.post("/predict", json={
            "route_id": "SH-VIT-01",
            "direction": "SEHORE_TO_VIT",
            "current_waypoint_index": 0,
            "target_waypoint_index": 4,
            "time_of_day_bucket": "morning",
            "day_of_week": "weekday"
        })
        data = res.json()
        self.assertEqual(data["model"], "random_forest")
        self.assertEqual(data["interval"], "10th-90th percentile")

if __name__ == "__main__":
    unittest.main()
