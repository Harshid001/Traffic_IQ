# 🏗️ TrafficIQ — System Architecture & Engineering Deep-Dive

> This document details the end-to-end technical architecture of **TrafficIQ**, illustrating how data flows from geospatial ingestion and time-series forecasting through multi-objective scoring to the client applications.

---

## 🏛️ High-Level System Architecture

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                                CLIENT ECOSYSTEM TIER                                 │
├──────────────────────────────────────────┬───────────────────────────────────────────┤
│ 🌐 Web Simulator & Analytics Cockpit     │ 📱 Mobile Driving Cockpit (React Native)  │
│ • React 18 + Vite 6 + Tailwind CSS       │ • Expo SDK 52 + TypeScript + Zustand 5    │
│ • Interactive Leaflet 1.9 Map Layers     │ • Hardware-Accelerated WebView Map HUD    │
│ • Real-time Web Speech Voice Copilot     │ • Local AsyncStorage Route Caching        │
└────────────────────────────────────┬─────┴───────────────────────────────────────────┘
                                     │ REST / JSON (HTTPX & Axios)
                                     ▼
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                            API GATEWAY & SECURITY TIER                               │
├──────────────────────────────────────────────────────────────────────────────────────┤
│ • FastAPI 0.115+ (Asynchronous ASGI Server on Uvicorn)                              │
│ • Pydantic v2 Strict Request/Response Serialization                                  │
│ • SlowAPI Rate Limiting (Token Bucket: 60 req/min general, 10 req/min LLM)          │
│ • CORS Security Middleware (Cross-Origin Policy Enforcement)                         │
└────────────────────────────────────┬─────────────────────────────────────────────────┘
                                     │
         ┌───────────────────────────┼───────────────────────────┐
         ▼                           ▼                           ▼
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│ GEOSPATIAL TIER │         │ FORECASTING ML  │         │ SCORING ENGINE  │
├─────────────────┤         ├─────────────────┤         ├─────────────────┤
│ • 3-Tier OSRM   │         │ • Amazon        │         │ • ⚡ Fastest vs  │
│   (Local /      │         │   Chronos-2     │         │   ⭐ Best Pareto │
│    Public /     │         │ • PyTorch +     │         │ • Delay Penalty │
│    Presets)     │         │   NumPy         │         │ • Volatility &  │
│ • OpenStreetMap │         │ • P10, P50, P90 │         │   Reliability   │
│ • TomTom / HERE │         │   Quantile Envs │         │   Coefficients  │
└────────┬────────┘         └────────┬────────┘         └────────┬────────┘
         │                           │                           │
         └───────────────────────────┼───────────────────────────┘
                                     ▼
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                         AI EXPLAINABILITY & GUARDRAILS TIER                          │
├──────────────────────────────────────────────────────────────────────────────────────┤
│ 1. Zero-Shot Context Builder (Strict Ground-Truth Telemetry Payload)                │
│ 2. Dual-Engine LLM Inference (Local Ollama Phi-4-mini ↔ Cloud Google Gemini Flash)   │
│ 3. 3-Layer Zero-Hallucination Guardrail:                                             │
│    ├── Layer 1: Structural JSON & Markdown Sanitization                              │
│    ├── Layer 2: Mathematical Fact-Checking Engine (Cross-Reference Matrix)           │
│    └── Layer 3: Deterministic Rule-Based Fallback (100% Mathematical Precision)      │
└────────────────────────────────────┬─────────────────────────────────────────────────┘
                                     │
                                     ▼
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                             PERSISTENCE & STORAGE TIER                               │
├──────────────────────────────────────────────────────────────────────────────────────┤
│ • SQLite 3 with Write-Ahead Logging (WAL Mode: PRAGMA journal_mode=WAL)              │
│ • Thread-Safe Connection Pool & Alembic Database Migrations                          │
│ • Ephemeral `/tmp` Storage for Stateless Cloud Serverless Deployments (Vercel/Lambda)│
└──────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 End-to-End Request Lifecycle

```
[Driver / Simulator] Requests Route: Origin -> Destination
       │
       ▼
1. FastAPI Router (`/api/routes/evaluate`)
       │
       ▼
2. 3-Tier OSRM Routing Resolution
       ├── Try Tier 1: Local OSRM C++ Instance (Sub-5ms)
       ├── Failover Tier 2: Public OSRM API (router.project-osrm.org)
       └── Failover Tier 3: Deterministic Geospatial Presets (100% Offline)
       │
       ▼
3. Ingest Telemetry & Corridors
       ├── TomTom Live Traffic API / HERE Traffic Ingestion
       └── SQLite Historical Velocity Distributions
       │
       ▼
4. Time-Series Probabilistic Forecasting
       ├── Amazon Chronos-2 Foundation Model (PyTorch)
       └── Generate 20-min forward distributions: P10 (Optimistic), P50 (Median), P90 (Pessimistic)
       │
       ▼
5. Multi-Objective Scoring Engine
       ├── Compute Nominal ETA ($T_{\text{nominal}}$)
       ├── Compute Risk Penalty ($\alpha \cdot (P_{90} - P_{50})$)
       ├── Compute Corridor Volatility & Reliability Index ($R \in [0, 100]$)
       └── Classify: ⚡ Fastest Route vs ⭐ Best Balanced Route
       │
       ▼
6. AI Explainability Pipeline
       ├── Extract Ground-Truth Verification Matrix
       ├── Query Ollama (Phi-4-mini) / Google Gemini Cloud
       ├── Execute 3-Layer Fact-Checking Guardrail
       └── Fallback to Deterministic Explainer if Hallucination Detected
       │
       ▼
7. Deliver Verified JSON Payload to Client (HUD / Map Simulator / AI Voice Copilot)
```

---

## 🛡️ Resilient 3-Tier Routing Architecture

TrafficIQ ensures navigation never fails even during upstream API outages or spotty network conditions:

| Tier | Provider | Latency | Redundancy Role |
|---|---|---|---|
| **Tier 1: Local OSRM** | Self-hosted C++ OSRM Engine | `< 5 ms` | Primary high-throughput production engine. |
| **Tier 2: Public OSRM** | `router.project-osrm.org` | `~200 ms` | Automatic secondary proxy for global maps. |
| **Tier 3: Offline Presets** | `backend/routing/geo_presets.py` | `< 1 ms` | Guaranteed offline fallback with pre-calculated vector topologies across major urban corridors. |
