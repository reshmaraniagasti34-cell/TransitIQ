# ML and ETA Prediction Engine

## 1. ETA Prediction Components

TransitIQ uses three prediction layers to compute arrival times:
1. **Historical Baseline**: Calculates segment travel times directly from historical trip averages.
2. **Machine Learning Model**: Uses scikit-learn regressors to predict travel time based on trip features.
3. **State-Aware Hybrid Strategy**: Dynamically weights the Baseline and ML predictions based on telemetry freshness.

---

## 2. Historical Baseline Calculation

When a bus is at waypoint $i$ and heading to destination waypoint $j$, the remaining ETA is calculated by summing the historical segment averages for all remaining segments between $i$ and $j$:

$$\text{Baseline ETA} = \sum_{k=i}^{j-1} \text{AvgDuration}(k, k+1)$$

### Remaining Range Variation
The uncertainty range is computed from the historical minimum and maximum durations of the **relevant remaining segments**:

$$\text{ETA Range} = \left[\sum_{k=i}^{j-1} \text{MinDuration}(k, k+1),\ \sum_{k=i}^{j-1} \text{MaxDuration}(k, k+1)\right]$$

This ensures that as a bus moves closer to its target, its estimated range contracts accurately.

---

## 3. Machine Learning Architecture

The Python ML service (`ml/service.py`) trains and executes two complementary model types:

### A. Point Prediction: `RandomForestRegressor`
- **Model**: `RandomForestRegressor(n_estimators=100, random_state=42)`
- **Input Features**: `direction_encoded`, `current_waypoint_idx`, `target_waypoint_idx`, `remaining_segments_count`, `time_bucket_encoded`, `day_encoded`.
- **Target Variable**: Total remaining travel time in minutes (`rem_duration_minutes`).
- **Output**: Point estimate of remaining arrival time.

### B. Uncertainty Intervals: `GradientBoostingRegressor` (Quantiles)
- **Lower Bound Model**: `GradientBoostingRegressor(loss='quantile', alpha=0.10)` $\rightarrow$ Predicts 10th percentile arrival bound.
- **Upper Bound Model**: `GradientBoostingRegressor(loss='quantile', alpha=0.90)` $\rightarrow$ Predicts 90th percentile arrival bound.
- **Output**: 80% statistical confidence interval $[Q_{10}, Q_{90}]$.

---

## 4. State-Aware Hybrid Strategy

The Hybrid ETA layer dynamically adjusts the influence of ML vs. Historical Baseline depending on real-time signal state:

| Signal State | Ping Age | Weighting Formula | Rationale |
| :--- | :--- | :--- | :--- |
| `LIVE` | $\le 30\text{s}$ | $70\%\text{ ML} + 30\%\text{ Historical Baseline}$ | High confidence in live telemetry; leverage ML feature patterns. |
| `PARTIAL` | $30\text{s} - 300\text{s}$ | $30\%\text{ ML} + 70\%\text{ Historical Baseline}$ | Signal degrading; shift primary reliance to historical segment timing. |
| `HISTORICAL` | $> 300\text{s}$ | $0\%\text{ ML} + 100\%\text{ Historical Baseline}$ | Live signal lost; fall back completely to historical averages to prevent overconfident ML errors. |
| `NO_DATA` | No pings | $0\%\text{ ML} + 100\%\text{ Historical Baseline}$ | Standby fallback state. |

---

## 5. Handling GPS Outages & Conductor Actions

### What Happens When GPS Signal is Lost?
1. The 5-second backend ticker detects ping age exceeding 300s.
2. Signal status shifts automatically from `PARTIAL` $\rightarrow$ `HISTORICAL`.
3. The Hybrid ETA engine drops ML weight to $0\%$ and uses $100\%$ Historical Baseline.
4. The frontend updates the signal status badge: *"No recent live location"*.
5. Prediction bounds expand to reflect increased uncertainty.

### What Conductor "Start Trip" Does
- Activates browser geolocation (`watchPosition`) on the conductor's phone.
- Streams live coordinates to Express backend (`POST /api/trips/:id/location`).
- Sets signal state to `LIVE`, causing the Hybrid engine to incorporate live ML predictions.
