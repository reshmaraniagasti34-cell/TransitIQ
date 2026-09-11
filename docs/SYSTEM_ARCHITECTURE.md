# System Architecture

## 1. Architecture Overview
TransitIQ is built as a microservice-oriented web application consisting of three distinct layers:
1. **React Single Page Application (SPA)** for passenger display, conductor tracking, and research controls.
2. **Node.js / Express Web & Telemetry Server** for real-time WebSocket broadcasting and signal evaluation.
3. **Python FastAPI Machine Learning Microservice** for Random Forest point predictions and Gradient Boosting quantile intervals.

---

## 2. Text Architecture Diagram

```text
       +-------------------------------------------------------------+
       |                     PASSENGER / DRIVER                      |
       |                   React Single Page App                     |
       +-------------------------------------------------------------+
               │                                      ▲
               │ 1. HTTP Search /                     │ 5. Real-Time Socket
               │    Conductor GPS Pings               │    Location Broadcast
               ▼                                      │
       +-------------------------------------------------------------+
       |                  EXPRESS BACKEND SERVER                     |
       |                       (Port 5000)                           |
       |                                                             |
       |  • Telemetry Ingestion (POST /api/trips/:id/location)       |
       |  • Signal State Evaluator (LIVE / PARTIAL / HISTORICAL)     |
       |  • Historical Baseline Calculator                           |
       |  • Hybrid Decision Strategy Layer                           |
       +-------------------------------------------------------------+
               │                                      ▲
               │ 2. Read Historical                   │ 4. Return ML Point
               │    Segments                          │    & Quantile ETA
               ▼                                      │
       +-----------------------+              +----------------------+
       |   HISTORICAL DATA     |              |  PYTHON ML SERVICE   |
       |  historicalTrips.json |              |     (Port 8000)      |
       +-----------------------+              |                      |
                                              | • RandomForest Point |
                                              | • Quantile GB Bounds |
                                              +----------------------+
```

---

## 3. Data Flow Steps

### Step 1: Telemetry Ingestion (Conductor / Simulator → Backend)
- The conductor's phone browser calls `navigator.geolocation.watchPosition()` or the simulator generates interpolated route points.
- Coordinates are posted to `POST /api/trips/:id/location` containing `{ latitude, longitude, accuracy, timestamp, source }`.

### Step 2: Signal State Evaluation
The backend records `serverReceivedAt = Date.now()` and computes age in seconds:
$$\text{ageSeconds} = \lfloor(\text{now} - \text{serverReceivedAt}) / 1000\rfloor$$

| Ping Age (Seconds) | Data State | Meaning |
| :--- | :--- | :--- |
| $\le 30\text{s}$ | `LIVE` | Active high-confidence GPS stream |
| $30\text{s} - 300\text{s}$ | `PARTIAL` | Degraded signal; using last-known position |
| $> 300\text{s}$ | `HISTORICAL` | Signal lost; relying 100% on historical trip baselines |
| No pings recorded | `NO_DATA` | Bus has not started or trip inactive |

### Step 3: Real-Time Broadcasting via Socket.IO
- The backend emits two WebSocket events to subscribed room `trip:TRIP-101`:
  - `trip:location-updated`: Broadcasts latest position payload.
  - `trip:signal-status-updated`: Broadcasts updated signal state.

### Step 4: ETA Calculation & Hybrid Blending
When a passenger requests ETA (`GET /api/trips/:id/eta?mode=hybrid`):
1. Backend calculates remaining segment baseline ETA and range from `server/data/historicalTrips.json`.
2. Backend queries Python ML Service (`POST http://127.0.0.1:8000/predict`).
3. Backend applies the Hybrid Decision Layer to blend ML and Baseline predictions based on signal state.

---

## 4. Component Responsibilities

### React Frontend (`src/`)
- Handles tab navigation (`App.jsx`).
- Listens to Socket.IO events for live position updates without page refreshes.
- Formats ETA outputs and renders signal badges (`LIVE`, `PARTIAL`, `HISTORICAL`, `NO_DATA`).

### Express Backend Server (`server/`)
- Main server entry point (`server/index.js`).
- Holds active trips in an in-memory `Map` (`activeTripsStore`).
- Runs a 5-second interval ticker to degrade trip signal status over time.
- Implements segment matching and range calculation (`server/etaService.js`).

### Python ML Service (`ml/`)
- FastAPI app (`ml/service.py`) running on Port 8000.
- Loads pre-trained `RandomForestRegressor` and `GradientBoostingRegressor` models.
- Accepts route features and returns point prediction + 10th/90th percentile bounds.
