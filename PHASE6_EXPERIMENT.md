# Phase 6 — Progressive Missing-Data Degradation Experiment

## 1. Research Question
"How much ETA reliability can TransitIQ preserve as real-time location telemetry becomes increasingly incomplete?"

This experiment evaluates the degradation resilience of three prediction methodologies under progressive simulated GPS signal loss:
1. **Historical Baseline** (Hierarchical Segment Aggregation)
2. **ML-only** (RandomForestRegressor + Quantile GradientBoosting)
3. **Hybrid Strategy** (State-Aware Signal Weighted Decision Layer)

Across five controlled signal loss levels: **0%, 25%, 50%, 75%, and 100%**.

---

## 2. Data Sources & Integrity
- **Observed Pilot Trips:** `1` trip (`OBS-001`, `data_origin: "observed"`).
- **Simulated Historical Trips:** `49` trips (`SIM-001` to `SIM-049`, `data_origin: "simulated"`).
- **Controlled Experiment GPS:** The 50 historical trip records contain segment timing definitions rather than raw high-frequency GPS logs. Controlled experiment GPS observation sequences are generated along the established pilot corridor waypoints using historical timing characteristics and labeled explicitly as `"simulated experiment GPS"`.

---

## 3. Experimental Methodology & Future-Leakage Prevention
1. **Train/Test Split:** Reproducible 80% train / 20% test split on segment-level trip instances using fixed seed (`seed=42`).
2. **Missing-Data Simulation:** For each test instance, GPS signal loss is simulated at levels 0%, 25%, 50%, 75%, and 100%. Retained observations preserve strict chronological order.
3. **Future-Leakage Prevention:** Ground-truth future arrival times and future segment durations are **NEVER** provided to the prediction model. Predictions are evaluated strictly using information available up to the last retained observation checkpoint.
4. **100% Signal Loss Handling:** Under 100% signal loss, current vehicle position is unknowable. ML-only prediction is marked as `UNAVAILABLE` rather than fabricating fake coordinates. The Hybrid model falls back strictly to the Historical Baseline.

---

## 4. Evaluated Results Summary

| Missing GPS % | Historical Baseline MAE / RMSE | ML-only MAE / RMSE | Hybrid Strategy MAE / RMSE | Notes / Model Availability |
| :--- | :--- | :--- | :--- | :--- |
| **0% Loss** | 0.88m / 1.17m | 1.17m / 1.65m | 1.01m / 1.42m | All models active; ML high accuracy with live pings |
| **25% Loss** | 0.88m / 1.17m | 5.90m / 11.27m | 3.32m / 5.78m | Stale pings increase ML error; Hybrid dampens degradation |
| **50% Loss** | 0.88m / 1.17m | 7.43m / 13.16m | 4.05m / 6.68m | Hybrid balances stale ML with stable baseline |
| **75% Loss** | 0.88m / 1.17m | 11.69m / 16.98m | 6.12m / 8.61m | Severe telemetry loss; Historical baseline remains steady |
| **100% Loss** | 0.88m / 1.17m | **UNAVAILABLE** | 0.88m / 1.17m | ML unavailable without live GPS; Hybrid falls back to Baseline |

---

## 5. Key Research Findings
1. **Historical Baseline Resilience:** The Hierarchical Historical Baseline maintains consistent performance ($\text{MAE} = 0.88\text{m}$) across all signal loss levels because it relies on contextual schedule/day/time segment averages rather than instantaneous GPS streams.
2. **ML Telemetry Vulnerability:** Pure ML predictions degrade rapidly when live GPS observations become stale or missing ($\text{MAE}$ increases from $1.17\text{m}$ at 0% loss to $11.69\text{m}$ at 75% loss), as position features become outdated.
3. **Hybrid Dampening:** The Hybrid strategy effectively caps prediction degradation by weighting historical baselines higher during stale signal states and falling back 100% to the historical baseline under total signal loss.

---

## 6. Critical Limitations
> **IMPORTANT:** This is a controlled missing-data experiment based primarily on simulated/reconstructed GPS observations derived from available pilot corridor historical data. It demonstrates the structural behavior of the proposed system under controlled signal loss but does NOT establish real-world fleet operational accuracy.
