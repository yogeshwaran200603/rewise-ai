# ReWise AI — Circular Economy Platform for Damaged Electronic Devices

> **"Don't Discard. ReWise. Repair. Reuse. Resell. Recycle."**  
> *AI-powered hardware fault diagnosis and verified multi-source circular decision engine for smartphones (2020–2026).*

---

## 🌟 Executive Summary

**ReWise AI** is an AI-powered circular electronics platform engineered to combat the global e-waste crisis. Rather than treating hardware damage as a death sentence for smartphones, ReWise guides users through the four circular disposition pillars:

1. **REPAIR:** Extend primary device lifespan by replacing only the failed screen, battery, or charging port.
2. **REUSE:** Repurpose functional older devices locally into dedicated webcams, dashcams, security monitors, or smart displays without spending money.
3. **RESELL:** Facilitate secondary market trade-in arbitrage with transparent "potential value after repair" calculations.
4. **RECYCLE:** Route irreparable electronics to CPCB-authorized recyclers for zero-landfill urban mining (Gold, Silver, Copper, Rare Earths).

### Strict Architectural Principles:
- **🌱 ECO FIRST, 🤖 AI SECOND, 📱 ELECTRONICS THIRD.**
- **Multimodal AI & NLP Clinical Reasoning:** Identifies symptoms, causal events, and safety risks from photos and free-text (including Tanglish/colloquial phrasing). Enforces strict distinction between *Confirmed*, *Likely*, *Possible*, and *Cannot Confirm*.
- **Zero Hallucination Pricing:** All repair parts, technician labor, and trade-in valuations are computed strictly from normalized database schedules. AI is never permitted to invent prices.
- **Scientific Environmental LCA:** Avoided CO₂e, diverted e-waste, and material recovery are calculated using ITU-T L.1410 and WEEE Forum life-cycle assessment standards.
- **Anti-Farming Rewards Ledger:** Verified circular actions credit ReWise green points with built-in 30-minute rate limiting to prevent gamification farming.

---

## 🏛️ System Architecture

```
                                  USER (Web Browser)
                                          │
                                          ▼
                React 19 + TypeScript + Vite + Tailwind CSS v4
               ├── 10-Section Landing Page (Hero, Crisis, Matrix, LCA)
               ├── Multimodal Diagnosis Intake (Photo Upload + NLP Input)
               ├── 4-Pillar Decision Dashboard (Repair | Reuse | Resell | Recycle)
               ├── Interactive ReWise AI Assistant Chat Widget
               ├── Pan-India Service & CPCB Recycler Interactive Map
               ├── Impact & Rewards Dashboard (Recharts Visualizations)
               └── Admin Analytics & Circular Ledger Audit View
                                          │
                                          ▼  (REST API calls)
                               FastAPI Python Backend
                 (CORS-enabled, strict Pydantic v2 schemas, SQLite/PostgreSQL)
                                          │
         ┌────────────────────────┬───────┴────────────────────────┐
         ▼                        ▼                                ▼
Google Gemini 2.5 Flash   Rule-Based NLP &          Decision Engine & LCA Calculator
& Vision Damage Analyzer  Heuristic Reasoner        ├── Repair Part & Labor Engine
├── Multimodal Visual     ├── Entity extraction     ├── Secondary Resale Valuation
├── Battery Swelling Flag ├── Negation handler      ├── Second-Life Repurpose Ideas
└── Restraint Disclaimer  └── Tanglish support      └── CPCB Statutory Recyclers
         │                        │                                │
         └────────────────────────┼────────────────────────────────┘
                                  ▼
                        Normalized SQLite Database
                    ├── 93 Smartphone Models (2020–2026)
                    ├── Verified Repair Schedules & Labor Rates
                    ├── Resale Trade-In Data & ROI Benchmarks
                    ├── 27+ CPCB Authorized Recyclers & Service Hubs
                    ├── Transactions & Anti-Farming Circular Ledger
                    └── Registered Data Sources & Provenance Metadata
```

---

## 🔄 The 4 Circular Pillars

| Circular Pillar | Primary Goal | Economic Model | Lifespan Extension | Avoided Footprint | ReWise Reward |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1. REPAIR** | Keep device in primary active service | Low–Moderate (₹1,500–₹5,000) | +18 to 36 Months | ~48.5 kg CO₂e | **+50 Pts** |
| **2. REUSE** | Repurpose locally without new purchases | ₹0 (Zero financial outlay) | +24+ Months (2nd life) | ~42.0 kg CO₂e | **+40 Pts** |
| **3. RESELL** | Secondary market trade-in circulation | Positive cash inflow (Arbitrage) | Extends secondary market | ~39.0 kg CO₂e | **+75 Pts** |
| **4. RECYCLE** | Accredited zero-landfill urban mining | ₹0 (Free CPCB drop-off) | Recovers elemental metals | ~14.5 kg CO₂e | **+100 Pts** |

---

## 🧠 Multimodal AI & Clinical Diagnostic Logic

ReWise enforces strict cognitive boundaries to eliminate diagnostic overconfidence:

1. **Free-Text & Tanglish Entity Extraction:**
   - Detects causal drop events (`keela vizhunthuchu`, `phone fell down`)
   - Parses active symptoms (`display line varuthu`, `touch failure`, `battery draining fast`)
   - Accurately parses intact symptoms and negations (`display is fine but touch not working` correctly preserves display integrity and targets the digitizer/connector).
2. **Camera vs Display Disambiguation:**
   - Statements like *"Camera open panna black screen varuthu"* correctly diagnose camera hardware/sensor failure rather than mistaking it for a broken OLED display.
3. **Certainty Calibration & Visual Disclaimer:**
   - **Confirmed:** Only externally observable physical damage (e.g. shattered front glass).
   - **Likely / Probable:** Subsystem inferences based on acute symptoms.
   - **Cannot Confirm:** "The exact internal component failure (e.g. flex cable detachment vs burned logic board trace) cannot be determined without physical bench inspection."

---

## 📊 Scientific Environmental Methodology

All environmental calculations reject arbitrary greenwashing and follow standard life-cycle assessment (LCA) methodologies:

$$\text{CO}_2\text{e Avoided} = \text{LCA}_{\text{New Device Manufacturing}} (\sim 65\,\text{kg}) - \text{LCA}_{\text{Replacement Part}} (\sim 6.5\,\text{kg}) \approx 48.5\,\text{kg CO}_2\text{e}$$

- **Avoided E-Waste:** $0.18\,\text{kg}$ per smartphone based on average curb weight across 93 models.
- **Urban Mining Recovery:** $\sim 14\,\text{g}$ pure elemental metals recovered per unit (Copper $\sim 12\,\text{g}$, Silver $\sim 0.3\,\text{g}$, Gold $\sim 0.03\,\text{g}$, and Cobalt/Rare Earths).
- **Standards Aligned:** ITU-T L.1410 (ICT LCA methodology), WEEE Forum Benchmark 2023, and CPCB E-Waste Management Rules 2022.

---

## ⚡ Setup & Quickstart

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm
- (Optional) Google Gemini API Key

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (optional but recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install fastapi uvicorn sqlalchemy pydantic pydantic-settings python-dotenv python-multipart google-generativeai pytest

# Seed the database (creates 93 smartphone models, repair pricing, partners)
python seed_demo_data.py

# Start the FastAPI server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

The backend will be live at `http://127.0.0.1:8000` with interactive Swagger docs at `http://127.0.0.1:8000/docs`.

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install npm dependencies
npm install

# Run Vite development server
npm run dev
```

Open `http://localhost:5173` in your web browser.

---

## 🧪 Automated Testing

All diagnostic NLP scenarios and circular logic are validated via automated pytest suites:

```bash
cd backend
python -m pytest tests/ -v
```

**Test Coverage:**
- `test_1_drop_display_lines` (Drop + lines symptom mapping)
- `test_2_drop_touch_failure` (Digitizer failure mapping)
- `test_3_battery_drain` (Chronic battery health degradation)
- `test_4_charging_overheating` (Charging port/thermal risk)
- `test_5_water_damage` (Liquid submersion corrosion)
- `test_6_camera_failure` (Black camera disambiguation)
- `test_7_tanglish_input` (Colloquial Tamil-English linguistic parsing)
- `test_8_negation_display_fine_touch_broken` (Strict negation boundary handling)

---

## 📡 Key API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/devices/brands` | List all smartphone brands with device counts |
| `GET` | `/api/devices/models?brand=Samsung` | Get models for a selected brand from database |
| `POST` | `/api/diagnose` | Run multimodal NLP + image diagnosis pipeline |
| `POST` | `/api/assistant` | Contextual grounded AI assistant for device inquiries |
| `POST` | `/api/circular-action` | Record circular action with anti-farming rate protection |
| `GET` | `/api/admin/analytics` | Platform audit metrics, action breakdowns, and ledger |
| `GET` | `/api/partners` | Verified repair hubs and CPCB e-waste recyclers |
| `GET` | `/api/rewards` | User points balance, tiers, and transaction history |
| `GET` | `/api/dashboard` | User environmental impact, CO₂e avoided, e-waste diverted |

---

## 👥 Hackathon Track Alignment

- **🌍 Sustainability & Climate Action:** Directly targets electronic waste, the fastest growing waste stream globally, reducing carbon emissions by up to 80% per repaired unit.
- **🤖 Responsible & Grounded AI:** Rejects hallucinated numbers by strictly decoupling clinical symptom diagnosis from empirical database pricing. Enforces explicit limits on visual diagnostic capabilities.
- **📱 Practical Circular Economy:** Provides actionable, localized pathways with walk-in repair hubs and statutory CPCB accredited recyclers across major Indian metros.
