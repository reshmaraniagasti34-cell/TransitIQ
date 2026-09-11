# Express Backend API Reference

Base URL: `http://localhost:5000`

---

## 1. System Health

### `GET /api/health`
Checks backend service health and active trip count.

- **Request Method**: `GET`
- **Response `200 OK`**:
```json
{
  "status": "ok",
  "service": "TransitIQ Backend API",
  "timestamp": "2026-09-11T11:00:00.000Z",
  "activeTripsCount": 1
}
```

---

## 2. Telemetry & Location Ingestion

### `POST /api/trips/:id/location`
Ingests real-time position pings from conductors or simulators.

- **Request Method**: `POST`
- **Parameters**: `id` (e.g., `TRIP-101`)
- **Request Body**:
```json
{
  "latitude": 23.118575,
  "longitude": 76.903982,
  "accuracy": 5.0,
  "timestamp": "2026-09-11T11:00:00.000Z",
  "source": "conductor" // "conductor" or "simulator"
}
```
- **Response `200 OK`**:
```json
{
  "message": "Location update processed successfully.",
  "storedLocation": { ... },
  "signalStatus": {
    "trip_id": "TRIP-101",
    "data_state": "LIVE",
    "last_ping_age_seconds": 0,
    "source": "conductor"
  }
}
```

### `POST /api/trips/:id/end`
Ends an active trip and clears in-memory tracking.

- **Request Method**: `POST`
- **Response `200 OK`**:
```json
{
  "message": "Trip TRIP-101 state cleared.",
  "trip_id": "TRIP-101"
}
```

---

## 3. Signal Status & Arrival Predictions

### `GET /api/trips/:id/signal-status`
Returns real-time telemetry freshness and signal state for a trip.

- **Request Method**: `GET`
- **Response `200 OK`**:
```json
{
  "trip_id": "TRIP-101",
  "data_state": "LIVE", // "LIVE", "PARTIAL", "HISTORICAL", or "NO_DATA"
  "last_ping_age_seconds": 12,
  "source": "conductor"
}
```

### `GET /api/trips/:id/eta`
Returns calculated remaining ETA, expected range, confidence level, and current segment.

- **Request Method**: `GET`
- **Query Parameters**:
  - `mode`: `hybrid` (default), `ml`, or `historical`
  - `direction`: `SEHORE_TO_VIT` or `VIT_TO_SEHORE`
  - `targetStop`: Target stop name (e.g., `VIT Bhopal Outer Highway`)
- **Response `200 OK`**:
```json
{
  "trip_id": "TRIP-101",
  "data_state": "LIVE",
  "eta_minutes": 14,
  "eta_range": "11 - 18 min",
  "confidence_level": "Normal",
  "current_segment": "Amlaha ➔ Toll Plaza",
  "explanation": "Calculated via Hybrid model (70% ML + 30% Historical Baseline) based on LIVE GPS telemetry."
}
```

---

## 4. Model Benchmarks & Research Experiments

### `GET /api/metrics`
Returns evaluation benchmarks comparing Historical Baseline, ML-only, and Hybrid models on held-out test data.

- **Request Method**: `GET`
- **Response `200 OK`**:
```json
{
  "historical_baseline": { "mae": 0.88, "rmse": 1.17 },
  "ml": { "mae": 1.17, "rmse": 1.65 },
  "hybrid": { "mae": 1.01, "rmse": 1.42 },
  "evaluation_note": "Controlled historical/simulated prototype evaluation on held-out 20% test set."
}
```

### `GET /api/research/missing-data`
Returns precomputed progressive missing-data experiment benchmarks across 5 signal loss levels ($0\%, 25\%, 50\%, 75\%, 100\%$).

- **Request Method**: `GET`
- **Response `200 OK`**: Serves content from `ml/results/missing_data_results.json`.
