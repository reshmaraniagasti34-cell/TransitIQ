import json
import os
import pandas as pd
import numpy as np

WAYPOINTS = {
    "SEHORE_TO_VIT": [
        "Sehore Bus Stand",
        "Kubreshwar Dham",
        "Amlaha",
        "Toll Plaza",
        "VIT Bhopal Outer Highway"
    ],
    "VIT_TO_SEHORE": [
        "VIT Bhopal Outer Highway",
        "Amlaha",
        "Kubreshwar Dham",
        "Indore Naka",
        "Nadi/Hospital Chauraha",
        "Sehore Bus Stand"
    ]
}

TIME_BUCKET_MAP = {"morning": 0, "afternoon": 1, "evening": 2}
DAY_MAP = {"weekday": 0, "weekend": 1}
DIRECTION_MAP = {"SEHORE_TO_VIT": 0, "VIT_TO_SEHORE": 1}

def load_raw_trips(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        return json.load(f)

def build_training_dataset(trips_json_path):
    raw_trips = load_raw_trips(trips_json_path)
    rows = []

    for trip in raw_trips:
        data_origin = trip.get("data_origin", "simulated")
        route_id = trip.get("route_id", "SH-VIT-01")
        direction = trip.get("direction")
        day_of_week = trip.get("day_of_week")
        time_bucket = trip.get("time_of_day_bucket")
        segment_durations = trip.get("segment_durations_minutes", {})
        waypoints = WAYPOINTS.get(direction, [])

        # For every possible current stop -> target stop pair along the route
        for i in range(len(waypoints) - 1):
            for j in range(i + 1, len(waypoints)):
                # Calculate actual remaining travel time from waypoint i to target waypoint j
                remaining_time = 0
                valid_pair = True
                for k in range(i, j):
                    seg_key = f"{waypoints[k]}__{waypoints[k+1]}"
                    if seg_key in segment_durations:
                        remaining_time += segment_durations[seg_key]
                    else:
                        valid_pair = False
                        break

                if valid_pair:
                    rows.append({
                        "trip_record_id": trip.get("trip_record_id"),
                        "data_origin": data_origin,
                        "route_id": route_id,
                        "direction": direction,
                        "direction_encoded": DIRECTION_MAP[direction],
                        "current_waypoint_idx": i,
                        "target_waypoint_idx": j,
                        "remaining_segments_count": j - i,
                        "time_bucket_encoded": TIME_BUCKET_MAP[time_bucket],
                        "day_encoded": DAY_MAP[day_of_week],
                        "target_remaining_minutes": remaining_time
                    })

    df = pd.DataFrame(rows)
    return df

FEATURE_COLUMNS = [
    "direction_encoded",
    "current_waypoint_idx",
    "target_waypoint_idx",
    "remaining_segments_count",
    "time_bucket_encoded",
    "day_encoded"
]
TARGET_COLUMN = "target_remaining_minutes"
