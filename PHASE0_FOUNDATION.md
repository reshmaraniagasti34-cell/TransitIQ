# TransitIQ Phase 0 — Environment & Project Foundation Document

## 1. Environment Status

- **Node.js**: Installed (`v24.20.0`)
- **npm**: Installed (`v11.19.0`)
- **Python**: Installed (`3.14.4`)
- **PostgreSQL / `psql`**: Not detected in system PATH or running services.
- **Docker**: Not detected in system PATH.

---

## 2. Current Frontend Status

- **Framework**: React `18.2.0` with Vite `5.1.4` bundler.
- **Styling**: Tailwind CSS `3.4.1` with Lucide React `0.344.0` icons.
- **UI Structure**:
  - `Navbar.jsx`: Multi-tab switcher (Passenger Dashboard, Insights, Route Comparison, About).
  - `DashboardPage.jsx`: Passenger-facing destination lookup (`FROM` / `TO`), route stop strip, and bus service list.
  - `InsightsPage.jsx`: Missing-data simulation controls (0%-100%), uncertainty card, and MAE/RMSE model comparison grid.
  - `RouteComparisonPage.jsx`: Route option cards with reliability and delay risk indicators.
  - `AboutPage.jsx`: Project objectives and scope documentation.
- **Data Source**: Centralized mock dataset [`src/data/demoData.js`](file:///c:/Users/Rakhi%20Tyagi/Downloads/TransitIQ-main/TransitIQ-main/src/data/demoData.js).
- **Backend / Realtime Integration**: No live Express server, Socket.IO, or database connection is currently active.

---

## 3. Reusable Frontend Files & Components

- [`src/components/Navbar.jsx`](file:///c:/Users/Rakhi%20Tyagi/Downloads/TransitIQ-main/TransitIQ-main/src/components/Navbar.jsx): Clean navigation bar ready to support Passenger, Conductor, Owner, and Research views.
- [`src/pages/DashboardPage.jsx`](file:///c:/Users/Rakhi%20Tyagi/Downloads/TransitIQ-main/TransitIQ-main/src/pages/DashboardPage.jsx): Clean passenger interface for selecting routes and inspecting service schedules.
- [`src/components/DataAvailabilityControl.jsx`](file:///c:/Users/Rakhi%20Tyagi/Downloads/TransitIQ-main/TransitIQ-main/src/components/DataAvailabilityControl.jsx): Simulator control buttons (0%, 25%, 50%, 75%, 100%) for research evaluation.
- [`src/components/PredictionCard.jsx`](file:///c:/Users/Rakhi%20Tyagi/Downloads/TransitIQ-main/TransitIQ-main/src/components/PredictionCard.jsx): Point ETA, confidence interval, and dynamic range presentation component.
- [`src/components/ModelComparisonCard.jsx`](file:///c:/Users/Rakhi%20Tyagi/Downloads/TransitIQ-main/TransitIQ-main/src/components/ModelComparisonCard.jsx): Benchmark comparison presentation (Historical Baseline vs. ML vs. Hybrid Model).
- [`src/data/demoData.js`](file:///c:/Users/Rakhi%20Tyagi/Downloads/TransitIQ-main/TransitIQ-main/src/data/demoData.js): Pilot corridor stop list (`Sehore → Bhopal`) and baseline fleet structures.

---

## 4. Problems & Gaps Found

1. **No Live Backend/DB**: No Express server, Socket.IO stream, or database exists yet to receive real GPS pings from conductors or opt-in passengers.
2. **Missing Geolocation Stream**: Conductor tracking using `navigator.geolocation.watchPosition()` is not yet implemented.
3. **Missing Geo-Coordinates**: Transit stops currently have linear `distanceKm` metrics rather than exact `(latitude, longitude)` coordinates.
4. **Standalone Frontend State**: Frontend runs on static demo objects rather than API endpoints.

---

## 5. Recommended Next Phase (Phase 1)

Create a lightweight **Node.js + Express + Socket.IO Backend Foundation** in a `server/` directory, containing:
- Express HTTP server with Socket.IO server initialization.
- In-memory data store for live bus tracking (preparing for PostgreSQL/PostGIS integration).
- Socket events for `conductor:location-update` and `passenger:subscribe-corridor`.
- Connection test script to verify frontend-backend real-time communication.
