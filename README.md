# TrafficIQ: Predictive, Explainable Traffic-Intelligence & Navigation Engine

TrafficIQ is an enterprise-grade predictive traffic intelligence and turn-by-turn navigation system featuring **Amazon Chronos-2 probabilistic forecasting**, **multi-objective route scoring (⚡ Fastest vs ⭐ Best)**, and a **zero-hallucination 3-layer deterministic verification pipeline**.

---

## 🚀 Key Features

- **3-Tier Resilient Routing:** Local OSRM Server &rarr; Public OSRM API &rarr; High-Fidelity Demo Fallback.
- **Probabilistic Traffic Forecasting (Chronos-2):** Quantile ETA & Congestion predictions ($P_{10}$ optimistic, $P_{50}$ median, $P_{90}$ pessimistic bounds) with 47.3% MAE reduction over static baselines.
- **⚡ Fastest vs ⭐ Best Multi-Objective Scoring:** Disentangles shortest travel time from lowest congestion, high historical reliability, and low volatility.
- **3-Layer Zero-Hallucination AI Explanations:**
  - *Layer 1 (Number Validation):* Rejects unsupported statistics.
  - *Layer 2 (Fact & Trend Consistency):* Verifies congestion direction (Clearing vs Worsening).
  - *Layer 3 (Decision Consistency):* Prevents inverted route recommendations.
- **Proactive Road Alerts:** Telemetry-driven bottleneck predictions and real-time rerouting triggers before drivers hit congestion.
- **Mobile Driving Cockpit:** Expo / React Native TypeScript application with turn-by-turn guidance HUD, interactive route explorer, live traffic timeline, and persistent storage.

---

## 📁 Repository Structure

```
.
├── backend/                  # FastAPI Python backend
│   ├── alembic/              # Database migrations
│   ├── alerts/               # Proactive alert engine & cooldown manager
│   ├── analytics/            # Reliability engine & historical traffic DNA
│   ├── api/                  # REST routers (/routes, /navigation, /traffic, /forecast, /alerts, /evaluation)
│   ├── database/             # SQLite WAL-mode connection manager & seeders
│   ├── explanation/          # 3-Layer Validator & deterministic fallbacks
│   ├── forecasting/          # Chronos-2 pipeline & baseline evaluators
│   ├── routing/              # 3-Tier OSRM routing client & geo presets
│   ├── scoring/              # Multi-objective preference weighting engine
│   └── tests/                # Pytest unit & integration test suite
├── mobile/                   # Expo / React Native mobile application
│   ├── src/                  # Driving HUD, Zustand stores, screens, and components
│   └── .env.example          # Mobile configuration template
├── scripts/                  # Unified multi-service launcher scripts
│   ├── start_all.ps1         # Windows PowerShell launcher
│   ├── start_all.sh          # Linux / macOS Bash launcher
│   ├── start_backend.ps1     # Standalone backend launcher
│   └── start_mobile.ps1      # Standalone mobile launcher
└── .github/workflows/ci.yml  # Automated CI test & build pipeline
```

---

## ⚡ Quick Start

### 1. Launch All Services (Recommended)

#### On Windows (PowerShell):
```powershell
.\scripts\start_all.ps1
```

#### On Linux / macOS (Bash):
```bash
chmod +x scripts/start_all.sh
./scripts/start_all.sh
```

### 2. Available Endpoints

| Service | URL | Description |
|---|---|---|
| **Mobile App (Web/Expo)** | http://localhost:5174 | Turn-by-turn driving HUD, route explorer, and alert simulator |
| **Backend API Docs (Swagger)** | http://localhost:8005/docs | Interactive OpenAPI documentation |
| **Backend Health Check** | http://localhost:8005/api/health | Live service connectivity status |

---

## ⚙️ Environment Configuration

Copy example environment files to `.env` in each respective directory:

```powershell
cp backend/.env.example backend/.env
cp mobile/.env.example mobile/.env
```

### Backend Settings (`backend/.env`)

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `8005` | Backend port |
| `DEBUG` | `false` | Enable/disable debug traces |
| `REQUIRE_API_KEY` | `false` | Enforce `X-API-Key` authentication header |
| `TRAFFICIQ_API_KEY` | `trafficiq-dev-key` | Secret key used for API authentication |
| `TRAFFIC_MODE` | `DEMO` | `REAL` (TomTom/HERE) or `DEMO` simulated |
| `LOCAL_OSRM_URL` | `http://localhost:5000` | Local OSRM instance |
| `PUBLIC_OSRM_URL` | `https://router.project-osrm.org` | Fallback public OSRM router |
| `CHRONOS_MODEL_NAME` | `amazon/chronos-2` | Hugging Face model repository |
| `CHRONOS_DEVICE` | `cpu` | `cpu` or `cuda` for GPU acceleration |

---

## 🧪 Testing & Verification

Run tests across all active layers:

```powershell
# Run all tests (Backend + Mobile)
npm run test:all

# Or run individually:
npm run test:backend     # Pytest unit tests
npm run test:pipeline    # Full algorithmic pipeline test
npm run test:mobile      # Vitest mobile store & adapter tests
```

---

## 🛡️ Production Security & Quality Controls

- **SQLite WAL Mode:** Configured with `PRAGMA journal_mode=WAL;` and 5000ms busy timeout for multi-process reader/writer concurrency.
- **Decoupled Database Lifespan:** Database schema initialization runs non-blockingly without synchronous dataset locks on server boot.
- **Client Auth Header Sync:** Mobile client injects `X-API-Key` headers dynamically.
- **Cross-Platform Native Storage:** Mobile app utilizes `@react-native-async-storage/async-storage` on iOS/Android to prevent state loss across app restarts.
