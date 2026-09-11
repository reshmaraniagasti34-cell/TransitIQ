# TransitIQ Project Overview

## 1. What is TransitIQ?
TransitIQ is a resilient public transport arrival prediction system specifically built for small-city and suburban transit corridors. In many Tier-2 and Tier-3 Indian cities, public buses frequently suffer from intermittent GPS loss, poor network connectivity, or unmonitored route segments.

TransitIQ addresses this real-world problem by combining live location streaming, historical segment timings, and machine learning models to deliver reliable arrival time estimates (ETAs) and uncertainty bounds—even when live GPS pings are completely lost.

---

## 2. Core Problem Solved
Traditional transit apps break or display misleading ETAs when a bus enters a GPS dead zone. They either freeze, display blank screens, or continue extrapolating unrealistic speeds.

TransitIQ introduces a **Signal-Aware Hybrid ETA Engine** that automatically detects signal degradation and dynamically adjusts prediction logic:
- **LIVE State (0–30s ping age)**: Uses live position and blends Random Forest ML predictions with historical baselines.
- **PARTIAL State (30s–300s ping age)**: Uses last-known position and shifts higher weight to historical segment baselines.
- **HISTORICAL State (>300s ping age)**: Relies 100% on historical trip baselines and expands prediction range bounds.

---

## 3. Main Target Users
1. **Passengers**: Search routes, track bus position on corridor stops, view estimated arrival time (ETA), ETA range, and real-time signal reliability badges.
2. **Bus Conductors**: Stream live phone GPS coordinates (`latitude`, `longitude`, `accuracy`) using browser Geolocation (`watchPosition`) via the Conductor Portal.
3. **Transit Administrators & Researchers**: Test signal loss degradation benchmarks ($0\% \rightarrow 100\%$) and inspect model comparison metrics (MAE, RMSE, Quantile intervals).

---

## 4. Main Application Pages
- **Home (`/`)**: Landing page introducing the pilot corridor and system value proposition.
- **Find a Bus (`/dashboard`)**: Primary passenger search view with real-time ETA, ETA range, signal state badge, and corridor progress bar.
- **Routes (`/routes`)**: Detailed view of verified pilot corridor waypoints (Sehore $\leftrightarrow$ VIT Bhopal).
- **Research (`/insights`)**: Interactive research portal for missing-data benchmarks and model accuracy metrics.
- **Conductor Portal (`/conductor`)**: Mobile-friendly page for conductors to start/end trips and stream live phone pings.
- **Demo Simulator (`/simulator`)**: Controlled GPS simulator to test live telemetry streaming and signal loss scenarios.
- **About (`/about`)**: Simple explanation of system principles and technical pipeline.

---

## 5. Technology Stack
- **Frontend**: React (v18), Vite, Tailwind CSS, Lucide React icons, Socket.IO Client.
- **Backend**: Node.js, Express (v5), Socket.IO server (Port 5000).
- **Machine Learning Service**: Python 3.14, FastAPI, Uvicorn (Port 8000), Scikit-Learn, Pandas, NumPy, Joblib.
- **Storage**: File-based JSON dataset (`server/data/historicalTrips.json`) storing observed and physics-constrained simulated trip segments.

---

## 6. How Frontend, Backend, and ML Service Work Together
```text
  +----------------------+             +-----------------------+             +----------------------+
  |    React Frontend    | <==HTTP===> |    Express Backend    | <==HTTP===> |   Python ML Service  |
  |     (Vite Port)      | <==WS=====> |      (Port 5000)      |             |     (Port 8000)      |
  +----------------------+             +-----------------------+             +----------------------+
```
1. **Conductor/Simulator** posts location pings to Express (`POST /api/trips/:id/location`).
2. **Express Backend** stores telemetry, evaluates signal state (`LIVE`/`PARTIAL`/`HISTORICAL`), and broadcasts location via **Socket.IO**.
3. **Passenger Query** hits Express (`GET /api/trips/:id/eta?mode=hybrid`).
4. **Express Backend** queries Python ML API (`POST http://127.0.0.1:8000/predict`) and combines ML output with historical baseline metrics from `historicalTrips.json`.
5. **React Frontend** renders remaining ETA, expected range, and signal status badge.
