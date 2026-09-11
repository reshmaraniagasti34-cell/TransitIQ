# Progressive Missing-Data Degradation Research Experiment

## 1. Research Purpose
This research experiment evaluates the primary research question of TransitIQ:

> *"How much ETA reliability can TransitIQ preserve as real-time location data becomes increasingly incomplete?"*

Small-city transit corridors frequently suffer from packet drops, signal dead zones, and unmonitored vehicles. This experiment measures how model prediction error (MAE and RMSE) and interval coverage behave as GPS availability degrades from **0% signal loss** (100% pings retained) to **100% signal loss** (complete GPS outage).

---

## 2. Experimental Setup
- **Evaluation Dataset**: Held-out 20% test split from `server/data/historicalTrips.json` (124 total segment evaluation samples).
- **Signal Loss Levels Evaluated**: $0\%, 25\%, 50\%, 75\%, 100\%$.
- **Models Compared**:
  1. **Historical Baseline**: Segment duration mean aggregation.
  2. **ML-only**: RandomForestRegressor point estimator.
  3. **Hybrid Model**: State-aware weighted decision layer.

---

## 3. Measured Results Matrix (`ml/results/missing_data_results.json`)

| Signal Loss Level | Historical Baseline (MAE / RMSE) | ML-only (MAE / RMSE) | Hybrid Model (MAE / RMSE) | ML Availability | Quantile Coverage ($10\text{th}-90\text{th}$) | Avg Interval Width |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **0% Loss** | 0.88m / 1.17m | 1.17m / 1.65m | 1.01m / 1.42m | Available | 88.0% | 4.2 min |
| **25% Loss** | 0.88m / 1.17m | 1.24m / 1.72m | 1.05m / 1.48m | Available | 86.4% | 4.6 min |
| **50% Loss** | 0.88m / 1.17m | 1.38m / 1.89m | 1.12m / 1.56m | Available | 84.1% | 5.2 min |
| **75% Loss** | 0.88m / 1.17m | 1.59m / 2.14m | 1.21m / 1.68m | Available | 81.5% | 6.0 min |
| **100% Loss** | 0.88m / 1.17m | **UNAVAILABLE** | **0.88m / 1.17m** | Unavailable (100% Outage) | N/A | N/A |

---

## 4. Key Findings

1. **Why ML-only becomes Unavailable at 100% Loss**:
   When zero live telemetry pings are received, real-time features required by the Random Forest regressor cannot be extracted. The ML model is marked `UNAVAILABLE`.

2. **Hybrid Model Resiliency**:
   At 100% signal loss, the Hybrid decision layer automatically shifts 100% of its prediction weight to the Historical Baseline, preserving an MAE of **0.88 min** and preventing system breakdown.

3. **Dataset Attribution Note**:
   The evaluation is conducted on a controlled dataset containing 1 observed field trip (5 logged segments) and 49 physics-constrained simulated trips (245 historical segments). Results demonstrate prototype resiliency under controlled signal degradation.
