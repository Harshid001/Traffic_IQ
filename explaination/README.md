# 📚 TrafficIQ — System Explanation & Technical Documentation

Welcome to the **TrafficIQ Explanation & Technology Guides** directory. This folder contains comprehensive, in-depth documentation detailing the architectural design, technologies used, machine learning models, and safety guardrails powering the TrafficIQ navigation engine.

---

## 📑 Documentation Index

| Document | Description | Key Focus Areas |
|---|---|---|
| 🛠️ [**Technologies Used**](file:///d:/NewVolumeE/Traffic_IQ%20code/explaination/TECHNOLOGIES_USED.md) | Exhaustive inventory of every library, framework, tool, and service across Web, Mobile, and Backend. | React 18, Vite, React Native, Expo, FastAPI, Python, PyTorch, Chronos-2, SQLite, OSRM, Ollama, Gemini |
| 🏗️ [**System Architecture**](file:///d:/NewVolumeE/Traffic_IQ%20code/explaination/SYSTEM_ARCHITECTURE.md) | Complete end-to-end architectural blueprints and request lifecycle flows. | Client Ecosystem, API Gateway, 3-Tier Routing, Ingestion Pipeline, SQLite WAL Mode |
| 🔮 [**AI & ML Pipeline**](file:///d:/NewVolumeE/Traffic_IQ%20code/explaination/AI_AND_ML_PIPELINE.md) | Deep dive into predictive time-series models, Pareto scoring, and AI safety guardrails. | Amazon Chronos-2, $P_{10}/P_{50}/P_{90}$ Quantiles, Multi-Objective Scoring, 3-Layer Zero-Hallucination Guardrail |

---

## 🚀 Quick Navigation to Key Code Components

- **Web Frontend**: [`web-react/`](file:///d:/NewVolumeE/Traffic_IQ%20code/web-react)
  - Map Simulator: [`web-react/src/pages/Demo.jsx`](file:///d:/NewVolumeE/Traffic_IQ%20code/web-react/src/pages/Demo.jsx)
  - AI Voice Copilot: [`web-react/src/pages/Copilot.jsx`](file:///d:/NewVolumeE/Traffic_IQ%20code/web-react/src/pages/Copilot.jsx)
- **Mobile Application**: [`mobile/`](file:///d:/NewVolumeE/Traffic_IQ%20code/mobile)
  - Main App Entry: [`mobile/App.tsx`](file:///d:/NewVolumeE/Traffic_IQ%20code/mobile/App.tsx)
  - Navigation State Store: [`mobile/src/store/navigationStore.ts`](file:///d:/NewVolumeE/Traffic_IQ%20code/mobile/src/store/navigationStore.ts)
- **Backend API & Engine**: [`backend/`](file:///d:/NewVolumeE/Traffic_IQ%20code/backend)
  - Main FastAPI Application: [`backend/main.py`](file:///d:/NewVolumeE/Traffic_IQ%20code/backend/main.py)
  - Chronos-2 Forecaster: [`backend/forecasting/chronos_service.py`](file:///d:/NewVolumeE/Traffic_IQ%20code/backend/forecasting/chronos_service.py)
  - 3-Layer AI Guardrail: [`backend/explanation/validator.py`](file:///d:/NewVolumeE/Traffic_IQ%20code/backend/explanation/validator.py)
  - Multi-Objective Scorer: [`backend/scoring/scoring_engine.py`](file:///d:/NewVolumeE/Traffic_IQ%20code/backend/scoring/scoring_engine.py)
