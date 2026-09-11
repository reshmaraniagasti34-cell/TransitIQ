# TransitIQ — Resilient Transit Intelligence

TransitIQ is a resilient public transport arrival prediction system built for small-city and suburban transit corridors. It maintains reliable arrival time estimates (ETAs) and prediction intervals even when real-time GPS telemetry is degraded or lost.

---

## 1. What is TransitIQ?
TransitIQ is a full-stack, signal-aware public transit tracking and prediction web application. It combines live conductor phone GPS streaming, historical trip segment baselines, and machine learning models to provide reliable arrival times to passengers.

---

## 2. Problem Statement
In Tier-2 and Tier-3 Indian cities, public buses frequently suffer from packet drops, poor cellular coverage, and signal dead zones. Existing transit applications break or display inaccurate ETAs when live GPS is lost.

---

## 3. Key Idea
> *"No live signal does not mean no useful information."*

TransitIQ continuously measures GPS ping freshness and dynamically transitions between prediction strategies:
- **LIVE State ($\le 30\text{s}$)**: Blends live Machine Learning predictions with historical baselines.
- **PARTIAL State ($30\text{s}-300\text{s}$)**: Shifts weight to historical segment averages.
- **HISTORICAL State ($>300\text{s}$)**: Relies 100% on historical trip baselines to ensure reliable predictions during complete GPS outages.

---

## 4. How the System Works

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

## 5. Project Structure

```text
TransitIQ/
├── frontend/                         # React Application & Vite Config
│   ├── src/                          # Application source code
│   │   ├── components/               # UI components (Navbar, CorridorVisualizer, etc.)
│   │   ├── data/                     # Frontend constants & demo utilities
│   │   └── pages/                    # View pages (HomePage, DashboardPage, etc.)
│   ├── index.html                    # HTML template
│   ├── package.json                  # Frontend dependencies
│   ├── package-lock.json             # Lockfile
│   ├── vite.config.js                # Vite bundler config
│   ├── tailwind.config.js            # Tailwind CSS config
│   └── postcss.config.js             # PostCSS config
├── backend/                          # Node.js Express Server & WebSockets
│   ├── data/                         # Historical dataset (historicalTrips.json)
│   ├── index.js                      # Express server entry point (Port 5000)
│   ├── etaService.js                 # Signal evaluator & Hybrid ETA engine
│   ├── testPhase4Eta.js              # Node.js ETA integration tests
│   └── testSignalEvaluator.js       # Node.js signal state unit tests
├── machine-learning/                 # Python Machine Learning Microservice
│   ├── models/                       # Trained model binaries & metrics JSON
│   ├── results/                      # Missing-data experiment benchmark output
│   ├── dataset.py                    # Dataset loader & feature engineering
│   ├── train.py                      # Model training pipeline
│   ├── service.py                    # FastAPI REST microservice (Port 8000)
│   ├── missing_data_experiment.py    # Degradation experiment benchmark script
│   └── test_ml.py                    # Python unit & API test suite
├── docs/                             # Detailed technical documentation
│   ├── PROJECT_OVERVIEW.md
│   ├── SYSTEM_ARCHITECTURE.md
│   ├── DATA_AND_ROUTES.md
│   ├── ML_AND_ETA.md
│   ├── API_REFERENCE.md
│   └── RESEARCH_EXPERIMENT.md
├── README.md                         # Main repository guide
└── .gitignore                        # Git exclusion rules
```

---

## 6. Frontend
Located in `frontend/`. Built using **React (v18)**, **Vite**, **Tailwind CSS**, and **Socket.IO Client**.
- **`DashboardPage.jsx`**: Passenger journey search, remaining ETA, expected range, and signal status badge.
- **`ConductorPage.jsx`**: Conductor phone GPS logger using `navigator.geolocation.watchPosition()`.
- **`SimulatorPage.jsx`**: Controlled demo GPS ping simulator.
- **`InsightsPage.jsx`**: Research portal presenting progressive missing-data experiment results.

---

## 7. Backend
Located in `backend/`. Built using **Node.js** and **Express (v5)** with **Socket.IO (Port 5000)**.
- Telemetry ingestion at `POST /api/trips/:id/location`.
- Signal state evaluation ticker running every 5 seconds.
- Historical segment baseline calculation and hybrid weighting engine (`backend/etaService.js`).

---

## 8. Machine Learning
Located in `machine-learning/`. Built using **Python 3.14**, **FastAPI (Port 8000)**, and **Scikit-Learn**.
- **Point Estimator**: `RandomForestRegressor` predicting segment travel duration.
- **Quantile Intervals**: `GradientBoostingRegressor` predicting 10th and 90th percentile bounds.

---

## 9. Dataset
Stored in **`backend/data/historicalTrips.json`**. Contains 50 total trips (1 observed field trip + 49 physics-constrained simulated trips) comprising 245 historical segment records.

---

## 10. Pilot Route
Verified on the **Bhopal–Sehore Pilot Transit Corridor**:
- **Outbound**: Sehore Bus Stand $\rightarrow$ Kubreshwar Dham $\rightarrow$ Amlaha $\rightarrow$ Toll Plaza $\rightarrow$ VIT Bhopal Outer Highway
- **Return**: VIT Bhopal Outer Highway $\rightarrow$ Amlaha $\rightarrow$ Kubreshwar Dham $\rightarrow$ Indore Naka $\rightarrow$ Nadi/Hospital Chauraha $\rightarrow$ Sehore Bus Stand

---

## 11. ETA and Signal Logic
- **Ping Age $\le 30\text{s}$**: `LIVE` ($70\%\text{ ML} + 30\%\text{ Historical Baseline}$)
- **Ping Age $30\text{s}-300\text{s}$**: `PARTIAL` ($30\%\text{ ML} + 70\%\text{ Historical Baseline}$)
- **Ping Age $> 300\text{s}$**: `HISTORICAL` ($0\%\text{ ML} + 100\%\text{ Historical Baseline}$)

---

## 12. Running the Project

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)

### Step 1: Install & Build Frontend
```bash
cd frontend
npm install
npm run build
```

### Step 2: Start Python ML Microservice (Port 8000)
```bash
python machine-learning/service.py
```

### Step 3: Start Node.js Backend Server (Port 5000)
```bash
node backend/index.js
```

### Step 4: Start React Frontend Development Server
```bash
cd frontend
npm run dev
```

Open `http://localhost:3000` or `http://localhost:5173` in your browser.

---

## 13. Testing

### Run Python ML Tests
```bash
python machine-learning/test_ml.py
```

### Run Backend Telemetry & ETA Tests
```bash
node backend/testSignalEvaluator.js
node backend/testPhase4Eta.js
```

### Run Frontend Production Build Test
```bash
cd frontend
npm run build
```

---

## 14. Research Experiment
The missing-data degradation benchmark evaluates model resilience across 5 signal loss levels ($0\%, 25\%, 50\%, 75\%, 100\%$).
- At $0\%$ signal loss: Hybrid MAE is **1.01 min**.
- At $100\%$ signal loss: ML becomes `UNAVAILABLE`, and the Hybrid model falls back 100% to the Historical Baseline (**0.88 min MAE**), preserving system reliability.

See [docs/RESEARCH_EXPERIMENT.md](file:///c:/Users/Rakhi%20Tyagi/Downloads/TransitIQ-main/TransitIQ-main/docs/RESEARCH_EXPERIMENT.md) for full benchmark details.

---

## 15. Known Limitations
- Verified exclusively on the pilot Sehore $\leftrightarrow$ VIT Bhopal corridor.
- Historical dataset consists of 1 observed pilot trip and 49 simulated corridor trips.
- ML models require live pings to extract real-time features; complete outage defaults to historical baseline fallback.

---

## 16. Team Development Notes
- Detailed architectural documentation is located in the [docs/](file:///c:/Users/Rakhi%20Tyagi/Downloads/TransitIQ-main/TransitIQ-main/docs/) directory.
- Do not commit generated build outputs (`frontend/dist/`), Python cache (`__pycache__/`), or `node_modules/`.
