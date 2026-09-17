# Project Sentinel • Institutional Public Procurement Audit Suite (India)
> **UN SDG 16: Peace, Justice, and Strong Institutions**  
> High-Density Forensic Procurement Anomaly Detection & Bid-Rigging Cartel Triage Engine

[![Target Jurisdiction](https://img.shields.io/badge/Jurisdiction-Republic%20of%20India-orange.svg)](#)
[![Statutory Acts](https://img.shields.io/badge/Statutes-CCI%20%2F%20CVC%20%2F%20GFR%202017-blue.svg)](#)
[![Standard](https://img.shields.io/badge/Schema-OCDS%20v1.4%20IN-emerald.svg)](#)
[![License](https://img.shields.io/badge/License-MIT-gray.svg)](#)

---

## 🏛️ Executive Summary

**Project Sentinel** is an institutional-grade, high-density public procurement auditing cockpit designed for forensic accountants, the **Central Vigilance Commission (CVC)**, and the **Competition Commission of India (CCI)**.

Unlike naive anomaly detectors that flag high values or single bidders as corruption, Sentinel distinguishes meaningful collusive patterns from legitimate specialized market monopolies in strict compliance with the **Non-Defamation Mandate**. Every transaction is assigned a deterministic, calibrated **Investigation Priority Index (0–100)** anchored in verifiable mathematical evidence.

---

## ⚖️ Indian Statutory Alignment

1. **Section 3(3) of the Competition Act, 2002**:
   - Algorithmic detection of horizontal bid-rigging agreements, rotational bidding schedules, and geographical market allocation.
2. **General Financial Rules (GFR) 2017 Rule 166 (Proprietary Articles Certificate - PAC)**:
   - Automated **80% alert dampening** for authorized single-OEM equipment acquisitions (e.g. AIIMS 3.0T MRI scanners) to prevent false-positive harassment.
3. **Central Vigilance Commission (CVC) Act, 2003 & CPPP/GeM Guidelines**:
   - Forensic cross-referencing across 15-character GSTINs, MCA-21 Director Identification Numbers (DINs), and registered industrial cluster premises (MIDC Pune/Mumbai).

---

## 🔍 The 3 Layers of Truth

### Layer 1: Context Filter & Market Baselines
- **CPV Taxonomy Stratification**: Normalizes parameters strictly within CPV classification codes (Roads, Healthcare, IT, Defense, Catering, Office Supplies).
- **ECOD (Empirical Cumulative Outlier Detection)**: Non-parametric tail outlier scoring calculated on price distributions.
- **GFR 2017 Rule 166 Dampening**: Dampens single-bidder flags by 80% when market structure exhibits valid patent monopolies.

### Layer 2: Collusion Graph & Entity Mining
- **Entity Clustering**: Fuzzy address matching ($>0.88$) and GSTIN root prefix correlation (`27AABCA488*`) to uncover shell companies sharing common directorship.
- **Bipartite Projections**: Bipartite vendor-tender graphs $V_i \xrightarrow{BID} T_k$ projected into homogeneous vendor co-bidding matrices:
  $$J(V_i, V_j) = \frac{|T(V_i) \cap T(V_j)|}{|T(V_i) \cup T(V_j)|}$$
- **Cartel Mechanics**: Identifies tight cover-bid margins ($<2\%$) and 100% win-rate alternation over sequential procurement cycles.

### Layer 3: Explainable Audit Triage & Active Learning
- **Investigation Priority Index**:
  $$S(T) = 100 \times [0.40 \cdot S_{graph}(T) + 0.35 \cdot S_{price}(T) + 0.25 \cdot S_{rule}(T)]$$
- **Investigator Audit Trail**: Persistent, timestamped evidentiary log where officers record findings and track case history.
- **Closed-Loop Active Learning**: Auditor dismissals commit feature signature vectors into an exclusion embedding index, adapting future priority weights.

---

## 💻 Tech Stack

- **Backend**: Python 3.10+, FastAPI, DuckDB (in-process vectorized SQL OLAP), NumPy, Scikit-learn.
- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite, Lucide Icons.
- **Data Standard**: Open Contracting Data Standard (OCDS v1.4) localized for India (INR ₹, GSTIN, PAN, CPPP/GeM).

---

## 🚀 Quick Start Guide

### 1. Backend Setup

```bash
# Navigate to the backend directory
cd procurement_anomaly_system

# Install Python dependencies
pip install fastapi uvicorn duckdb numpy pydantic pytest requests

# Run end-to-end pipeline (ingests OCDS releases into DuckDB & computes scores)
python pipeline.py

# Start the FastAPI server
python server.py
# Server runs on http://127.0.0.1:8000
```

### 2. Frontend Setup

```bash
# Navigate to UI directory
cd sentinel_ui

# Install dependencies
npm install

# Build or start development server
npm run dev
# Or preview production bundle:
npm run build && npm run preview
# UI opens on http://localhost:5173
```

### 3. Running Automated Tests

```bash
python -m pytest procurement_anomaly_system/tests/test_api.py
```

---

## 📁 Repository Structure

```
.
├── .gitignore
├── README.md
├── procurement_anomaly_system/
│   ├── data/
│   │   ├── raw/
│   │   │   └── ocds_releases.json        # 500 OCDS releases for Indian procurement
│   │   ├── reference/
│   │   │   └── cpv_reference.json        # Indian CPV sector definitions & baselines
│   │   └── exclusion_index.json          # Active learning exclusion profiles & audit logs
│   ├── modules/
│   │   ├── ingest_ocds.py                # OCDS parser & DuckDB loader
│   │   ├── entity_cluster.py             # GSTIN & MIDC address clustering
│   │   ├── market_baseline.py            # CPV statistics & GFR 2017 PAC dampening
│   │   ├── cartel_network.py             # Co-bidding network & Jaccard matrices
│   │   ├── scoring_engine.py             # Priority index calculation (0-100)
│   │   ├── explainable_dossier.py        # Natural-language audit cards
│   │   └── feedback_engine.py            # Active learning & investigator note logs
│   ├── pipeline.py                       # Unified 3-layer execution pipeline
│   ├── server.py                         # FastAPI REST API & legal subpoena dossier export
│   └── tests/
│       └── test_api.py                   # Automated integration tests
└── sentinel_ui/
    ├── src/
    │   ├── components/
    │   │   ├── CommandHeader.tsx         # Global institutional header & split metrics
    │   │   ├── TriageTable.tsx           # Virtualized triage ledger with INR figures
    │   │   ├── CollusionGraph.tsx        # Subgraph canvas with relational inspector
    │   │   ├── PriceDistributionCurve.tsx# CPV histogram with Z-score tooltips
    │   │   ├── EvidenceDossier.tsx       # Score decomposition & institutional actions
    │   │   ├── AuditTrailDrawer.tsx      # Slide-over investigator notes drawer
    │   │   ├── SubpoenaModal.tsx         # Formal Section 3(3) summons modal
    │   │   └── DismissModal.tsx          # GFR 2017 PAC override modal
    │   ├── api.ts                        # Client API endpoints
    │   ├── types.ts                      # TypeScript interfaces
    │   └── index.css                     # Institutional theme tokens
    ├── tailwind.config.js
    └── package.json
```

---

## 📄 License

Distributed under the MIT License. Developed for UN SDG 16 public procurement integrity.
