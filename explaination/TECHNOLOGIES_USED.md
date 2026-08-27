# 🛠️ TrafficIQ — Comprehensive Technologies Used & Tech Stack Guide

> **TrafficIQ (v2.0)** is an enterprise-grade, predictive, and explainable traffic intelligence and navigation engine. This document provides an exhaustive, component-by-component breakdown of all technologies, frameworks, programming languages, machine learning models, external APIs, databases, testing suites, and devops tooling used across the entire platform.

---

## 📑 Table of Contents

1. [📐 Technology Stack Overview](#-technology-stack-overview)
2. [🖥️ Frontend Web Application (`web-react/`)](#️-frontend-web-application-web-react)
3. [📱 Mobile Application (`mobile/`)](#-mobile-application-mobile)
4. [⚙️ Backend Core & Microservices (`backend/`)](#️-backend-core--microservices-backend)
5. [🔮 Machine Learning & Time-Series Forecasting Engine](#-machine-learning--time-series-forecasting-engine)
6. [🧠 AI Reasoning, Local LLMs & Deterministic Safety Guardrails](#-ai-reasoning-local-llms--deterministic-safety-guardrails)
7. [🗺️ Geospatial, Routing & Traffic Telemetry Services](#️-geospatial-routing--traffic-telemetry-services)
8. [💾 Database, Caching & Persistence Layer](#-database-caching--persistence-layer)
9. [🧪 Testing, Benchmarking & Quality Assurance](#-testing-benchmarking--quality-assurance)
10. [🚀 DevOps, Automation, Packaging & Deployment](#-devops-automation-packaging--deployment)
11. [📊 Summary Tech Stack Matrix](#-summary-tech-stack-matrix)

---

## 📐 Technology Stack Overview

```
┌───────────────────────────────────────────────────────────────────────────────────┐
│                             CLIENT ECOSYSTEM                                     │
│  ┌──────────────────────────────────────┐  ┌───────────────────────────────────┐  │
│  │    Web App (React 18 + Vite 6)       │  │  Mobile App (React Native + Expo) │  │
│  │    • Leaflet 1.9 + OpenStreetMap     │  │  • Android APK & iOS Ready        │  │
│  │    • Web Speech API (Voice Copilot)  │  │  • Zustand Navigation Store       │  │
│  │    • Tailwind CSS + Lucide Icons     │  │  • SVG HUD & Offline Storage      │  │
│  └──────────────────┬───────────────────┘  └─────────────────┬─────────────────┘  │
└─────────────────────┼────────────────────────────────────────┼────────────────────┘
                      │                 REST / HTTP            │
                      ▼                                        ▼
┌───────────────────────────────────────────────────────────────────────────────────┐
│                         BACKEND & INTELLIGENCE ENGINE                             │
│  ┌─────────────────────────────────────────────────────────────────────────────┐  │
│  │ FastAPI 0.115+ (ASGI Server: Uvicorn, Python 3.11+)                          │  │
│  │ • Pydantic v2 Schema Validation & Settings Management                       │  │
│  │ • SlowAPI Rate Limiter & Token-Bucket Controls                              │  │
│  └──────────────┬──────────────────┬──────────────────────┬────────────────────┘  │
│                 │                  │                      │                       │
│  ┌──────────────▼────────┐  ┌──────▼───────────────┐  ┌───▼────────────────────┐  │
│  │ Geospatial Routing    │  │ Chronos-2 ML Model   │  │ AI Explainability      │  │
│  │ • 3-Tier OSRM Client  │  │ • Probabilistic P10/ │  │ • Ollama (Phi-4-mini)  │  │
│  │ • OpenStreetMap Data  │  │   P50/P90 Forecaster │  │ • Google Gemini Cloud  │  │
│  │ • TomTom/HERE Feeds   │  │ • PyTorch + NumPy    │  │ • 3-Layer Guardrail    │  │
│  └──────────────┬────────┘  └──────┬───────────────┘  └───┬────────────────────┘  │
│                 │                  │                      │                       │
│                 └──────────────────┼──────────────────────┘                       │
│                                    ▼                                              │
│  ┌─────────────────────────────────────────────────────────────────────────────┐  │
│  │ Multi-Objective Route Scoring (⚡ Fastest vs ⭐ Best Pareto Engine)          │  │
│  │ SQLite Database (WAL Mode) • Alembic Migrations • Time-Series History       │  │
│  └─────────────────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🖥️ Frontend Web Application (`web-react/`)

The web platform delivers an interactive driving simulator, live AI voice copilot, and analytical traffic cockpit.

| Technology | Version | Purpose & Technical Implementation |
|---|---|---|
| **React** | `^18.3.1` | Core UI library. Utilizes functional components, hooks (`useState`, `useEffect`, `useCallback`, `useRef`), and concurrent rendering for smooth 60fps UI updates. |
| **Vite** | `^6.0.5` | Next-generation frontend build tool providing instant Hot Module Replacement (HMR), optimized Rollup bundling, and sub-second cold starts. |
| **Tailwind CSS** | `^3.4.17` | Utility-first CSS framework enabling a sleek dark-mode aesthetic, glassmorphism cards, responsive grids, and micro-interactions. |
| **PostCSS & Autoprefixer** | `^8.4.49` / `^10.4.20` | CSS transformation pipeline adding vendor prefixes to ensure flawless cross-browser compatibility across Chrome, Safari, Edge, and Firefox. |
| **React Router DOM** | `^6.28.0` | Declarative client-side routing managing navigation across `/` (Home), `/demo` (Map Simulator), `/copilot` (AI Voice HUD), and `/features`. |
| **Leaflet** | `^1.9.4` | Open-source JavaScript mapping library rendering interactive map tiles, colored route polylines, animated markers, and dynamic traffic heatmaps. |
| **OpenStreetMap (OSM)** | *Standard Tiles* | Free, global cartographic tile provider providing tile layers for the interactive route visualization engine. |
| **Lucide React** | `^1.34.0` | High-quality SVG icon library providing uniform, lightweight icons for navigation alerts, metrics, speedometers, and control buttons. |
| **Web Speech API** | *Browser Native* | Native browser voice engine implementing `webkitSpeechRecognition` (voice-to-text queries) and `SpeechSynthesisUtterance` (spoken driving instructions). |

---

## 📱 Mobile Application (`mobile/`)

The mobile client is an enterprise-grade, cross-platform driving HUD optimized for smartphone cockpits and real-world in-vehicle navigation.

| Technology | Version | Purpose & Technical Implementation |
|---|---|---|
| **React Native** | `0.76.9` | High-performance mobile framework rendering native UI components on Android and iOS devices. |
| **Expo SDK** | `~52.0.28` | Managed native runtime and toolchain for streamlined asset compilation, device APIs, and rapid deployment. |
| **TypeScript** | `^5.3.3` | Strongly typed JavaScript for compile-time safety across route payloads, navigation states, and telemetry data models. |
| **Zustand** | `^5.0.3` | Minimalist, fast, hook-based state management store governing active GPS coordinates, selected routes, real-time recalculations, and telemetry. |
| **React Native Web** | `~0.19.13` | Universal component adapter allowing the React Native mobile codebase to run directly within modern web browsers for instant previews. |
| **React Native WebView** | `13.12.5` | Secure, hardware-accelerated web view wrapper bridging high-performance Leaflet map visualizations inside native iOS/Android screens. |
| **React Native SVG** | `15.8.0` | Scalable Vector Graphics renderer powering custom speedometers, turn-by-turn direction arrows, and route confidence dials. |
| **AsyncStorage** | `1.23.1` | Local persistent key-value storage engine caching user route bookmarks, offline maps, and personalized driving preferences. |
| **Lucide React Native** | `^0.475.0` | Native-optimized vector icons for mobile turn indicators, traffic incident warnings, and settings controls. |
| **Expo Constants & Status Bar** | `~17.0.8` / `~2.0.1` | Device metadata extraction and dynamic status bar styling for seamless immersive driving mode. |
| **Vitest** | `^4.1.11` | Blazing-fast unit testing framework verifying mobile helper functions, formatting utilities, and Zustand state mutations. |
| **Expo EAS & Gradle** | *EAS CLI / Gradle 8* | Automated cloud and local build systems compiling native Android Application Packages (`TrafficIQ_v2.0_release.apk`). |
| **Ngrok / Expo Tunnel** | `^4.1.3` | Secure HTTP/WebSocket reverse proxy allowing mobile devices on real 4G/5G mobile networks to connect to local development backends. |

---

## ⚙️ Backend Core & Microservices (`backend/`)

The backend is an asynchronous, high-throughput intelligence engine written in modern Python.

| Technology | Version | Purpose & Technical Implementation |
|---|---|---|
| **Python** | `3.11 / 3.12 / 3.13` | Core asynchronous backend runtime utilizing modern language features (type annotations, `asyncio`, pattern matching). |
| **FastAPI** | `>=0.115.0` | Asynchronous REST API framework featuring auto-generated OpenAPI (Swagger) documentation, dependency injection, and native async handlers. |
| **Uvicorn** | `>=0.30.0` | Blazing-fast ASGI web server built on `uvloop` (high-performance asyncio loop) and `httptools`. |
| **Pydantic** | `>=2.8.0` | Data validation and parsing library enforcing strict type safety and JSON serialization for all API request/response contracts. |
| **Pydantic Settings** | `>=2.0.0` | Environment configuration manager reading `.env` variables with type casting, validation, and sensible defaults. |
| **HTTPX** | `>=0.27.0` | Async HTTP client enabling non-blocking calls to external APIs (OSRM routing servers, TomTom telemetry, Ollama, Gemini). |
| **Requests** | `>=2.31.0` | Synchronous HTTP fallback client for legacy network requests and diagnostic health checks. |
| **SlowAPI** | `>=0.1.9` | Rate limiting engine implementing token-bucket and IP-based rate limiting (`60 req/min` default, `10 req/min` for LLM explain endpoints). |
| **Python-dotenv** | `>=1.0.0` | Secure environment variable isolation separating local development secrets from production configurations. |
| **Alembic** | `>=1.13.0` | Database schema migration tool maintaining versioned schema revisions for the SQLite database. |
| **CORS Middleware** | *FastAPI Native* | Fine-grained Cross-Origin Resource Sharing handler securing API access across localhost, mobile ports, and cloud web origins. |

---

## 🔮 Machine Learning & Time-Series Forecasting Engine

TrafficIQ replaces outdated static velocity metrics with deep probabilistic time-series foundation forecasting.

| Technology / Model | Source / Package | Purpose & Technical Implementation |
|---|---|---|
| **Amazon Chronos-2** | `amazon/chronos-2` (Hugging Face) | Pretrained time-series foundation model based on transformer architecture. Performs zero-shot univariate and multivariate probabilistic traffic speed forecasting. |
| **Probabilistic Quantiles ($P_{10}, P_{50}, P_{90}$)** | `numpy` & Chronos Engine | Generates full uncertainty envelopes: $P_{10}$ (optimistic clear flow), $P_{50}$ (median expectation), and $P_{90}$ (worst-case bottleneck delay) across a 20-minute forward horizon. |
| **PyTorch** | `>=2.0.0` | Tensor computational framework powering Chronos-2 transformer forward passes with automatic hardware acceleration on CPU and CUDA GPUs. |
| **NumPy** | `>=1.26.0` | High-speed vectorized numerical library computing standard deviations, confidence intervals, rolling moving averages, and travel time distributions. |
| **Momentum Forecaster** | `backend/forecasting/baseline_forecaster.py` | High-speed baseline forecaster applying rate-of-change derivatives to recent traffic speed vectors to capture immediate congestion velocity. |
| **Historical Profile Engine** | `backend/forecasting/evaluation.py` | Statistical corridor database matching current time-of-day and day-of-week against historical congestion distributions. |

---

## 🧠 AI Reasoning, Local LLMs & Deterministic Safety Guardrails

To prevent hallucinations, TrafficIQ couples generative language models with a mathematical verification pipeline.

```
┌──────────────────────────────────────────────────────────────────────────┐
│                 3-LAYER ZERO-HALLUCINATION GUARDRAIL                     │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  [Verified Route Matrix] ───> [Prompt Builder] ───> [Ollama / Gemini]   │
│                                                              │           │
│                                                       (Raw AI Text)      │
│                                                              │           │
│                                                              ▼           │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │ Layer 1: JSON Structural Parser & Regex Extraction                 │  │
│  └──────────────────────────────────┬─────────────────────────────────┘  │
│                                     ▼                                    │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │ Layer 2: Mathematical Fact-Checker vs Routing Ground Truth         │  │
│  │ • Validates: ETA delta minutes, speed km/h, corridor names         │  │
│  └──────────────────────────────────┬─────────────────────────────────┘  │
│                                     ▼                                    │
│                       Is Output 100% Factually Sound?                    │
│                                 /        \                               │
│                           [YES]            [NO]                          │
│                             │                │                           │
│                             ▼                ▼                           │
│                    [Deliver Output]    ┌──────────────────────────────┐  │
│                                        │ Layer 3: Rule-Based Fallback │  │
│                                        │ (100% Deterministic Engine)  │  │
│                                        └──────────────┬───────────────┘  │
│                                                       ▼                  │
│                                                [Deliver Output]          │
└──────────────────────────────────────────────────────────────────────────┘
```

| Technology | Implementation | Role in System |
|---|---|---|
| **Ollama** | `http://localhost:11434` | Local AI runner enabling privacy-preserving, zero-cloud-cost inference on edge hardware. |
| **Phi-4-mini (Microsoft)** | `3.8B Parameters` | Default local LLM optimized for reasoning, concise technical explanations, and structured JSON output. |
| **Google Gemini API** | `gemini-2.0-flash` | Ultra-low latency cloud LLM fallback activated when Ollama is offline or when high throughput is required. |
| **Prompt Builder** | `backend/explanation/prompt_builder.py` | Constructs strict zero-shot system prompts injecting only mathematical telemetry (speeds, confidence scores, corridor IDs). |
| **Fact-Checking Validator** | `backend/explanation/validator.py` | Verifies that all numerical claims made by the LLM match ground-truth routing matrix facts within a strict $\pm 10\%$ tolerance. |
| **Deterministic Explainer** | `backend/explanation/deterministic_fallback.py` | Template-free rule-based natural language generator guaranteeing mathematically flawless explanations if the LLM fails. |

---

## 🗺️ Geospatial, Routing & Traffic Telemetry Services

TrafficIQ utilizes a multi-tiered routing infrastructure ensuring 100% uptime even during complete network or upstream API outages.

| Technology | Architecture Tier | Purpose & Implementation |
|---|---|---|
| **OSRM (Open Source Routing Machine)** | *Tier 1: Local Server* | Local C++ routing engine running Contraction Hierarchies (CH) for sub-5ms route calculations. |
| **Public OSRM API** | *Tier 2: Public Proxy* | Fallback routing endpoint (`https://router.project-osrm.org`) querying global road networks. |
| **Geospatial Route Presets** | *Tier 3: Offline Matrix* | Built-in offline road coordinate database with pre-computed polylines across major urban corridors. |
| **OpenStreetMap (OSM)** | *Data Foundation* | Open vector road network defining road classifications, speed limits, lane counts, and junction topology. |
| **TomTom Traffic Flow API** | *Live Telemetry* | Real-time traffic flow segments, congestion percentages, and current speeds. |
| **HERE Traffic API** | *Telemetry Redundancy* | Secondary real-time traffic feed for cross-verifying incident alerts and road closures. |
| **Synthetic Traffic Simulator** | *Engine Simulator* | Deterministic multi-corridor wave simulation modeling dynamic bottleneck formation and clearance for testing and demos. |

---

## 💾 Database, Caching & Persistence Layer

| Technology | Configuration | Purpose & Implementation |
|---|---|---|
| **SQLite 3** | `traffic_history.db` | High-performance embedded relational database storing historical corridor speeds, route evaluations, and incident telemetry. |
| **WAL Mode (Write-Ahead Logging)** | `PRAGMA journal_mode=WAL;` | Enables concurrent reads and writes without database locking, allowing simultaneous analytics queries and background ingestion. |
| **Synchronous Normal** | `PRAGMA synchronous=NORMAL;` | Optimizes disk I/O throughput while guaranteeing data durability across sudden power disruptions. |
| **Alembic** | `alembic/` | Database migration framework maintaining version-controlled schema definitions. |
| **Ephemeral Serverless Fallback** | `/tmp/traffic_history.db` | Automatic detection for stateless serverless platforms (Vercel Serverless / AWS Lambda). |

---

## 🧪 Testing, Benchmarking & Quality Assurance

| Tool | Scope | Purpose & Commands |
|---|---|---|
| **PyTest** | Backend Unit & Integration | Automated test suite validating scoring engines, routing clients, and API endpoints (`pytest backend/tests/ -v`). |
| **PyTest-Asyncio** | Asynchronous Tests | Enables coroutine testing for async FastAPI handlers and HTTPX clients. |
| **Pipeline Verification Suite** | End-to-End Test | Comprehensive integration verification running full end-to-end routing, forecasting, and explanation passes (`python -m backend.test_pipeline`). |
| **Vitest** | Mobile Unit Tests | Fast TypeScript unit testing for mobile state stores and utilities (`npm --prefix mobile run test`). |
| **Benchmarking Suite** | Performance Validation | Verifies MAE accuracy, quantile coverage ($P_{10}-P_{90}$), and sub-second scoring latency. |

---

## 🚀 DevOps, Automation, Packaging & Deployment

| Technology | Implementation | Purpose & Implementation |
|---|---|---|
| **Vercel** | Serverless Cloud Hosting | Hosts the production React web application (`web-react`) and serverless Python backend (`api/index.py`). |
| **Vercel Configuration** | `vercel.json` | Configures rewrites, routing rules, and serverless Python runtime builds. |
| **Android APK Build System** | `build_apk.bat` / Gradle | 1-click batch script automating local Gradle builds to compile standalone Android APKs (`TrafficIQ_v2.0_release.apk`). |
| **Automated Launcher Scripts** | Windows Batch (`.bat`) | Zero-config 1-click scripts (`start_all.bat`, `start_local_ai_copilot.bat`, `start_public_tunnel.bat`) orchestrating Node, Python, and Ollama services. |
| **PowerShell & Bash Scripts** | `scripts/` | Cross-platform orchestration scripts (`start_all.ps1`, `start_all.sh`) for macOS, Linux, and Windows environments. |
| **Procfile** | Production PaaS | Process configuration for deploying backend services to platforms like Render, Heroku, or Railway. |
| **Git & GitHub Actions** | Version Control & CI | Git repository tracking with `.gitignore` rules isolating environments, build artifacts, and database files. |

---

## 📊 Summary Tech Stack Matrix

```
┌─────────────────────────┬────────────────────────────────────────────────────────────────────────┐
│ DOMAIN                  │ TECHNOLOGIES & TOOLS USED                                              │
├─────────────────────────┼────────────────────────────────────────────────────────────────────────┤
│ Web Frontend            │ React 18, Vite 6, Tailwind CSS 3, PostCSS, Leaflet 1.9, Lucide React,  │
│                         │ Web Speech API (Voice-to-Text & Speech Synthesis), React Router DOM 6  │
├─────────────────────────┼────────────────────────────────────────────────────────────────────────┤
│ Mobile App              │ React Native 0.76, Expo SDK 52, TypeScript 5, Zustand 5, SVG HUD,       │
│                         │ React Native WebView, AsyncStorage, Expo EAS Cloud & Gradle Build      │
├─────────────────────────┼────────────────────────────────────────────────────────────────────────┤
│ Backend API             │ Python 3.11-3.13, FastAPI 0.115, Uvicorn ASGI, Pydantic v2, HTTPX,     │
│                         │ SlowAPI Rate Limiting, Python-dotenv, Alembic Migrations               │
├─────────────────────────┼────────────────────────────────────────────────────────────────────────┤
│ ML & Forecasting        │ Amazon Chronos-2 (T5 Time-Series Foundation Transformer), PyTorch 2.0, │
│                         │ NumPy Vectorized Quantile Bounds (P10, P50, P90), Momentum Baselines   │
├─────────────────────────┼────────────────────────────────────────────────────────────────────────┤
│ AI & Explainability     │ Local Ollama (Phi-4-mini 3.8B), Cloud Google Gemini (gemini-2.0-flash), │
│                         │ 3-Layer Zero-Hallucination Mathematical Verification Pipeline          │
├─────────────────────────┼────────────────────────────────────────────────────────────────────────┤
│ Geospatial & Routing    │ 3-Tier OSRM (Local C++ CH Engine / Public Proxy / Offline Presets),    │
│                         │ OpenStreetMap (OSM), TomTom Traffic API, HERE Traffic API              │
├─────────────────────────┼────────────────────────────────────────────────────────────────────────┤
│ Database & Persistence  │ SQLite 3 with Write-Ahead Logging (WAL), Connection Pooling, /tmp Pool │
├─────────────────────────┼────────────────────────────────────────────────────────────────────────┤
│ Testing & Verification  │ PyTest 8, PyTest-Asyncio, Vitest, Pipeline Verification Suite          │
├─────────────────────────┼────────────────────────────────────────────────────────────────────────┤
│ DevOps & Deployment     │ Vercel Serverless, Gradle Android Packager, Ngrok Tunneling, Batch/PS1 │
└─────────────────────────┴────────────────────────────────────────────────────────────────────────┘
```
