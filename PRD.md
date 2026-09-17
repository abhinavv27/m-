# PRODUCT REQUIREMENTS DOCUMENT (PRD)

## Project Sentinel • Institutional Public Procurement Audit Suite (India)
**High-Density Forensic Anomaly Detection, Bid-Rigging Cartel Triage & Active Learning Cockpit**  
*Aligned with UN SDG 16: Peace, Justice, and Strong Institutions*

---

### Document Control

| Property | Value |
| :--- | :--- |
| **Product Name** | Project Sentinel (India Edition) |
| **Document Version** | v1.4.0-PROD |
| **Target Jurisdiction** | Republic of India (Central, State & Municipal Procurement) |
| **Primary Statutory Bodies** | Competition Commission of India (CCI), Central Vigilance Commission (CVC), Comptroller & Auditor General (CAG), Enforcement Directorate (ED) |
| **Procurement Regimes** | GeM (Government e-Marketplace), CPPP (Central Public Procurement Portal), State Portals (e.g. MahaTenders) |
| **Technical Core** | Python 3.10+, FastAPI, DuckDB Vectorized OLAP, React 18, TypeScript, Tailwind CSS, OCDS v1.4 |
| **Classification** | Restricted / Institutional Forensic Tooling |
| **Status** | Approved & Production-Verified |

---

## 1. Executive Summary & Problem Formulation

### 1.1 Problem Statement
Public procurement accounts for approximately **20% to 30% of India's GDP**, spanning critical national infrastructure (NHAI highway construction), state-level utilities (MSRDC, BMC civil works), premier healthcare technology (AIIMS medical acquisitions), defense avionics (DRDO), and social welfare supply chains (PM-POSHAN).

Manual audit procedures face three systemic vulnerabilities:
1. **The Volume Trap**: Tens of thousands of tenders and bids overwhelm manual vigilance officers, causing critical cartels to hide in plain sight.
2. **The Context Trap (False Positives)**: Naive rule-based engines or generic machine learning systems indiscriminately flag high-value, single-bidder tenders as corrupt—failing to recognize legitimate statutory sole-source patent monopolies (e.g., specialized medical devices or defense equipment).
3. **The Shell Cartel Camouflage**: Sophisticated bidding cartels conceal collusive relationships through legal webs of sister corporations, rotating bidding winners, submitting synthetic "cover bids" within razor-thin margins, and sharing physical addresses or registered directorships.

### 1.2 Core Mission & The Non-Defamation Mandate
Project Sentinel provides authorized government investigative officers with an **explainable, deterministic, and legally defensible forensic triage engine**. 

> [!IMPORTANT]
> **The Non-Defamation Mandate**: In strict compliance with administrative law and ethical auditing standards, Project Sentinel **never generates subjective or defamatory labels** such as "fraud" or "corrupt." Instead, the system outputs an empirical, calibrated **Investigation Priority Index (0–100)** accompanied by verifiable mathematical deviations, graph topology linkages, and cross-referenced public records.

---

## 2. Statutory Legal & Regulatory Framework (India)

The system is hard-coded and calibrated against the statutory legal framework of India:

```
                                  INDIAN STATUTORY PROCUREMENT AUDIT ARCHITECTURE
                                                        │
         ┌──────────────────────────────────────────────┼──────────────────────────────────────────────┐
         ▼                                              ▼                                              ▼
Competition Act, 2002                         General Financial Rules (GFR) 2017              CVC Act, 2003 & Evidence Act 65B
  • Section 3(3)(a): Price fixing               • Rule 166: Proprietary Article                 • Special CVC Vigilance Guidelines
  • Section 3(3)(b): Output restriction           Certificate (PAC) exemption                   • MCA-21 Director Interlocks
  • Section 3(3)(c): Market / geographic        • 80% automated priority dampening              • Electronic Chain of Custody Hash
    allocation                                    for authorized sole OEM monopolies              (SHA-256 deterministic seals)
  • Section 3(3)(d): Bid rigging & cover bids
```

### 2.1 Section 3(3) of the Competition Act, 2002
Prohibits horizontal anti-competitive agreements between enterprises engaged in identical or similar trade of goods or services:
- **Sec 3(3)(a)**: Direct or indirect determination of purchase or sale prices.
- **Sec 3(3)(b)**: Limiting, controlling, or restraining supply, markets, or technical provision.
- **Sec 3(3)(c)**: Allocation of geographical areas, types of goods, or customer quotas.
- **Sec 3(3)(d)**: **Bid rigging or collusive bidding**, specifically cover bidding, bid rotation, and bid suppression.

### 2.2 General Financial Rules (GFR) 2017 — Rule 166 (PAC Exemption)
Rule 166 permits single-tender procurement strictly under a **Proprietary Article Certificate (PAC)** when:
> *(i) It is in the knowledge of the user department that only a particular firm is the manufacturer of the required goods.*

*Algorithmic Handling*: Sentinel recognizes CPV codes designated as natural or legal patent monopolies (e.g., `33115100-3` for 3.0T High-Field MRI scanners). When a valid PAC profile is detected, the price and procedural outlier scores are automatically dampened by **80%**, clearing legitimate procurement and reducing vigilance officer fatigue.

### 2.3 Evidence Act Section 65B & CVC Vigilance Directives
All dossiers generated by Sentinel contain an immutable **SHA-256 data lineage hash**, timestamps in Indian Standard Time (`IST / UTC+05:30`), and deterministic feature contribution vectors admissible under Section 65B of the Indian Evidence Act as computer-generated forensic audit trails.

---

## 3. Mathematical & Algorithmic Formulation

Project Sentinel organizes forensic audit intelligence into **The 3 Layers of Truth**:

```
 ┌────────────────────────────────────────────────────────────────────────────────────────┐
 │ LAYER 1: CONTEXT FILTER & MARKET BASELINES                                             │
 │ • Stratified CPV baseline distributions (NHAI Roads, AIIMS Medical, MeitY IT, DRDO)   │
 │ • ECOD (Empirical Cumulative Outlier Detection) on normalized unit prices              │
 │ • GFR 2017 Rule 166 PAC Sole-Source Dampening (-80% discount on single-bidder flags)   │
 └───────────────────────────────────────────┬────────────────────────────────────────────┘
                                             │
                                             ▼
 ┌────────────────────────────────────────────────────────────────────────────────────────┐
 │ LAYER 2: COLLUSION GRAPH & ENTITY MINING                                               │
 │ • Multi-entity clustering: Jaro-Winkler address matching (>0.88) & GSTIN root prefix   │
 │ • Bipartite Vendor-Tender network projections: Jaccard co-occurrence J(V_i, V_j)       │
 │ • Cartel structural signals: Win-rate rotation symmetry & cover-bid spread (<2.0%)     │
 └───────────────────────────────────────────┬────────────────────────────────────────────┘
                                             │
                                             ▼
 ┌────────────────────────────────────────────────────────────────────────────────────────┐
 │ LAYER 3: EXPLAINABLE AUDIT TRIAGE & ACTIVE LEARNING                                    │
 │ • Calibrated Investigation Priority Index: S(T) = 100 * [0.40*S_G + 0.35*S_P + 0.25*S_R│
 │ • Closed-loop Active Learning exclusion vector embeddings (cosine similarity >= 0.96)  │
 │ • One-click CVC/CCI Subpoena Dossier Generator with SHA-256 electronic seals           │
 └────────────────────────────────────────────────────────────────────────────────────────┘
```

### 3.1 Layer 1: Context Filter & Market Baselines
Tender amounts are never evaluated in isolation. Every procurement $T$ is stratified into its sector taxonomy code $C \in \text{CPV}$.

1. **Stratified Parametric & Non-Parametric Metrics**:
   - Sample Mean $\mu_C$, Sample Standard Deviation $\sigma_C$
   - Median $\tilde{M}_C$, First Quartile $Q_1(C)$, Third Quartile $Q_3(C)$
   - Interquartile Range $\text{IQR}_C = Q_3(C) - Q_1(C)$
2. **Empirical Standard Deviation Distance ($Z$-Score)**:
   $$Z(T) = \frac{\text{Amount}(T) - \mu_C}{\sigma_C}$$
3. **ECOD (Empirical Cumulative Outlier Detection)**:
   Estimates empirical tail probabilities $P(\text{Amount} \ge \text{Amount}(T))$ to compute non-parametric extremity scores:
   $$S_{price\_raw}(T) = \min\left(100, \; \max\left(0, \; (Z(T) - 1.0) \times 35\right)\right)$$
4. **GFR 2017 Rule 166 PAC Dampening Factor**:
   $$\text{If } C \in \text{PAC\_EXEMPT} \land \text{Bidders}(T) = 1 \implies S_{price}(T) = S_{price\_raw}(T) \times 0.20$$

### 3.2 Layer 2: Collusion Graph & Entity Mining
A major vulnerability in public procurement is the submission of token bids by sister entities to satisfy minimum bid quotas.

1. **Entity Clustering (Fuzzy Address & Shared GSTIN/PAN Root)**:
   - Indian GSTIN syntax: `[State Code (2)][PAN (10)][Entity (1)][Z][Check (1)]`
   - Two vendors $V_a$ and $V_b$ with identical first 10 alphanumeric characters share the same PAN entity root:
     $$\text{PAN\_Root}(V_a) = \text{PAN\_Root}(V_b) \implies \text{Shared\_PAN\_Entity} = \text{True}$$
   - Address fuzzy distance via Jaro-Winkler similarity on normalized MIDC industrial estate strings:
     $$\text{Sim}_{JW}(\text{Addr}_a, \text{Addr}_b) \ge 0.88 \implies \text{Shared\_Premises} = \text{True}$$
2. **Bipartite Projection & Jaccard Co-Bidding Coefficient**:
   Projecting the bipartite buyer-vendor-tender graph into a vendor co-occurrence matrix:
   $$J(V_i, V_j) = \frac{|T(V_i) \cap T(V_j)|}{|T(V_i) \cup T(V_j)|}$$
   Where $T(V_k)$ is the set of all tenders where vendor $V_k$ submitted a bid. A Jaccard coefficient $J \ge 0.70$ over $\ge 5$ joint bids constitutes a high-probability cartel ring under Section 3(3)(d).
3. **Cover-Bidding Margin & Win-Rate Rotation**:
   - Measures price spread between winning bid $B_1$ and runner-up cover bid $B_2$:
     $$\Delta_{\text{cover}} = \frac{B_2 - B_1}{B_1} \times 100\%$$
     If $\Delta_{\text{cover}} \le 2.0\%$ across joint bids, cover bidding coordination is flagged.
   - Sequential win alternation across $N \ge 4$ regional cycles flags rotational ring symmetry.

### 3.3 Layer 3: Investigation Priority Index (IPI) Formulation
The overall Investigation Priority Index $S(T) \in [0, 100]$ combines graph relational density, price anomalies, and procedural compression:

$$S(T) = 100 \times \left[ w_G \cdot S_{graph}(T) + w_P \cdot S_{price}(T) + w_R \cdot S_{rule}(T) \right]$$

**Calibrated Empirical Weights**:
- $w_G = 0.40$ (**Relational Density Weight**): Structural collusion, co-bidding matrices, shared GSTIN/address.
- $w_P = 0.35$ (**Price Outlier Weight**): Budget ceiling proximity, $Z$-score deviation, ECOD tail extremity.
- $w_R = 0.25$ (**Procedural Irregularity Weight**): Compressed submission windows ($\le 48$ hours), single-bidder anomalies.

### 3.4 Active Learning Feedback Loop
When an authorized officer reviews an alert and logs a **"False Positive Override"** (e.g., GFR 2017 PAC confirmation), the system extracts the 3-dimensional feature vector:
$$\mathbf{f}(T) = \left[ \frac{S_{graph}(T)}{100}, \; \frac{S_{price}(T)}{100}, \; \frac{S_{rule}(T)}{100} \right]$$
The vector $\mathbf{f}(T)$ is committed to an in-memory and persistent exclusion index. Future cases are evaluated via cosine similarity:
$$\text{CosSim}(\mathbf{f}_{\text{new}}, \mathbf{f}_{\text{excl}}) = \frac{\mathbf{f}_{\text{new}} \cdot \mathbf{f}_{\text{excl}}}{\|\mathbf{f}_{\text{new}}\| \|\mathbf{f}_{\text{excl}}\|}$$
- If $\text{CosSim} \ge 0.96 \implies$ priority score discounted by **65%** (factor $0.35$).
- If $\text{CosSim} \ge 0.90 \implies$ priority score discounted by **35%** (factor $0.65$).

---

## 4. Institutional Design Tokens & Aesthetic Specifications

To eradicate the "AI-generated sci-fi console" look, Sentinel adheres to strict institutional visual standards:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ INSTITUTIONAL PALETTE: NO NEON • NO GLOW • HIGH-DENSITY AUDIT WORKSPACE                 │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ Base Canvas:        #0B0F17   Deep Void Slate (terminal base canvas)                   │
│ Surface Base:       #111827   Charcoal Surface (cards, panels, header, drawers)         │
│ Surface Hover:      #1A2234   Elevated Focus Fill (subtle row highlight)               │
│ Neutral Track:      #1E293B   Neutral Track Fill (monotone progress meter background)  │
│ Dividing Borders:   #1F2937   Subtle Contrast Divider (clean 1px structural borders)   │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ SEMANTIC SIGNAL TOKENS:                                                                │
│ Critical Cartel:    #DC2626   Crimson (Reserved strictly for >=80 Priority Alerts)     │
│ Elevated Risk:      #D97706   Muted Amber (Priority 50-79 Vigilance Inquests)          │
│ Normal Baseline:    #059669   Forest Emerald (GFR 166 Dampened / Verified Baseline)    │
│ Interactive/Focus:  #2563EB   Cobalt Blue (Active Node, Selected Tab, Focus Line)      │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ TYPOGRAPHY:                                                                            │
│ Interface Sans:     Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif     │
│ Financial / Hashes: JetBrains Mono, Roboto Mono, monospace (Strict tabular figures)    │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Functional Requirements & Component Hierarchy

The user interface is engineered as a **3-Pane High-Density Cockpit** with full keyboard accessibility.

```
┌────────────────────────────────────────────────────────────────────────────────────────────────┐
│ GLOBAL COMMAND HEADER: Brand | Dataset: GeM_CAG_Sync_2026Q3 | Agency Selector | Date | Audit Trail | Export │
│ SPLIT METRICS: Capital Under Review (₹ Cr) | Critical Signals | Cartel Rings | FP Rate | Entities     │
├───────────────────────────────┬────────────────────────────────────────┬───────────────────────┤
│ PANE 1: TRIAGE LEDGER (25%)   │ PANE 2: CENTRAL VISUAL ANCHOR (45%)   │ PANE 3: DOSSIER (30%) │
│ • Multi-field instant search  │ • Collusion Subgraph Canvas            │ • IPI Decomposition   │
│ • Indian CPV sector pills     │   - Bipartite vs Radial layout toggle  │   (Proportional bars) │
│ • Priority tabs (All, >=80,   │   - 1-Hop vs 2-Hop depth slider        │ • Verified Findings   │
│   50-79, Cleared)             │   - Zoom / Pan / Re-center controls    │ • Contract Particulars│
│ • Formatted amounts in INR    │   - Structured Relational Inspector    │ • Institutional CTAs: │
│   (₹ Cr / ₹ Lakhs)            │ • Market Baseline Distribution Curve   │   [Initiate Subpoena] │
│ • Vendor & Buyer indicators   │   - CPV histogram with IQR band        │   [Request Inquest]   │
│ • Keyboard J/K navigation     │   - Z-score & Delta-median tooltips    │   [Log Override]      │
└───────────────────────────────┴────────────────────────────────────────┴───────────────────────┘
```

### 5.1 Global Command Header
- **Active Dataset Indicator**: Live indicator showing `GeM_CAG_Sync_2026Q3` with green pulse dot and schema badge `OCDS v1.4 IN`.
- **Data Lineage Badge**: Displays verifiable `SHA-256: 7f8a92b10dc9...` cryptographic hash.
- **Agency Selector**: Interactive dropdown supporting `CCI (Competition Commission of India)`, `CVC (Central Vigilance Commission)`, `CAG (Forensic Audit Wing)`, and `ED (Special Investigation Desk)`.
- **Date Range Picker**: Financial year selector supporting `FY 2024-25 (Q1–Q4)`, `FY 2024-25 (H2)`, and historical audited years.
- **Split Operational Metrics**:
  1. *Capital Under Review*: Formatted in ₹ Crores (e.g. `₹ 51.39 Cr`).
  2. *Critical Cartel Signals*: Count of active $\ge 80$ priority alerts.
  3. *Identified Cartel Rings*: Total count of shell clusters discovered.
  4. *False-Positive Suppression Rate*: Percentage of tenders dampened via GFR 2017 PAC (`25.0%`).
  5. *Active Entities Monitored*: Total verified contractors across 500 tenders (`19 Vendors`).

### 5.2 Pane 1: Triage Ledger (Feed & Filter)
- **SectorFacetFilter**: One-click CPV category pills with live outlier badges:
  - `NHAI Roads` (`45233120-6`)
  - `AIIMS Healthcare` (`33115100-3`)
  - `MeitY IT` (`72200000-7`)
  - `DRDO Defense` (`35610000-8`)
  - `PM-POSHAN Meals` (`55524000-9`)
  - `GeM Supplies` (`30192000-1`)
- **Quick Priority Tabs**: Instant filtering by severity: `All`, `≥80 (Crimson)`, `50–79 (Amber)`, `Cleared (Emerald)`.
- **Currency Presentation**: Tabular numeric representation formatting values $\ge 1\text{ Cr}$ as `₹ X.XX Cr` and values below as `₹ X.X L`.

### 5.3 Pane 2: Collusion Subgraph Canvas & Relational Inspector
- **Graph Controls**:
  - *Layout Mode*: Toggle between **Bipartite** (hierarchical Buyer-to-Vendor projection) and **Radial** (force-directed cluster view).
  - *Depth Slider*: Toggle between **1-Hop** (immediate tender participants) and **2-Hop** (extended cartel shell ring).
  - *Viewport Controls*: Zoom In (+), Zoom Out (-), and Re-center / Reset.
- **Zero Canvas Clutter**: Overlapping raw label pills (such as `FLAG: SHARED CORPORATE ADDRESS`) have been removed from intersecting edges. Edges render clean dashed crimson lines with directional arrows.
- **Structured Relational Inspector**: An interactive bottom panel that dynamically renders upon clicking any node or edge:
  - Corporate Name & Entity Type (`WINNER`, `CO-BIDDER`, `PROCURING AUTHORITY`).
  - 15-character verified GSTIN and state registration.
  - Registered industrial address (e.g., *Plot 42, MIDC Bhosari, Pune, MH 411026*).
  - Board of Directors (MCA-21 DIN cross-reference).
  - Joint Bidding Count (`15 Joint Tenders`) and Jaccard Co-Occurrence (`1.00`).

### 5.4 Pane 2 (Bottom): Market Baseline Distribution Curve
- **Historical CPV Histogram**: 10-bin frequency distribution representing historical pricing.
- **Contextual Benchmark Tooltips**: Hover inspection on individual bins showing sample count and price interval in ₹ Cr.
- **Empirical Indicators**:
  - **$Z$-Score Callout**: Real-time standard deviation distance from sector mean (e.g. `+0.18σ`, `+2.84σ`).
  - **$\Delta$ Median**: Percentage deviation from sector median price.
  - **IQR Confidence Band**: Visual shaded range between 25th percentile ($Q_1$) and 75th percentile ($Q_3$).

### 5.5 Pane 3: Natural-Language Evidence Dossier
- **IPI Score Decomposition**: Unified proportional meter system on `#1E293B` neutral tracks:
  - *Relational Density (40%)*: Monotone crimson fill with structural co-bidding summary.
  - *Price Outlier (35%)*: Monotone amber fill with CPV statistical benchmark summary.
  - *Procedural Irregularity (25%)*: Monotone cobalt fill with submission timeline duration.
- **Verified Forensic Findings**: Plain-language audit bullet points citing statutory provisions.
- **Compact Institutional Buttons**:
  - `[Initiate Subpoena Draft]`: Subtle filled crimson state; opens Section 3(3) summons modal.
  - `[Request Agency Inquest]`: Bordered neutral state; logs formal agency peer review.
  - `[Log False Positive Override]`: Ghost muted state; commits GFR 2017 PAC exclusion embedding.

### 5.6 Slide-Over Investigator Audit Trail & Note Drawer
- Accessible via `[Audit Trail]` in header or `[Log Note]` in dossier.
- Displays full chronological history of investigative findings with timestamps, officer name, investigating agency, and action tags.
- Includes an interactive recording form:
  - Fields: Officer Name, Agency (CCI / CVC / CAG / ED), Action Tag, and Evidence Note textarea.
  - Automatically persists new records to `procurement_anomaly_system/data/exclusion_index.json` via `/api/audit-logs`.

---

## 6. API & Data Contract Specifications

### 6.1 Backend REST API Endpoints

| Method | Endpoint | Description | Query / Body Parameters |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Service health & statutory jurisdiction | None |
| `GET` | `/api/stats` | Global operational KPI metrics | None |
| `GET` | `/api/tenders` | Paginated, filterable triage ledger | `q`, `cpv`, `category`, `min_score`, `limit`, `offset` |
| `GET` | `/api/tenders/{id}` | Complete tender record, scoring & dossier | `id` (e.g. `T-8841`) |
| `GET` | `/api/tenders/{id}/graph` | Subgraph nodes, edges & entity flags | `id` |
| `GET` | `/api/tenders/{id}/price-distribution` | CPV histogram, $Z$-score, IQR & median | `id` |
| `POST` | `/api/tenders/{id}/disposition` | Submit auditor action & update learning | `action`, `auditor_notes`, `officer_name`, `agency` |
| `GET` | `/api/tenders/{id}/export-dossier` | Formal printable HTML legal subpoena brief | `id` |
| `GET` | `/api/audit-logs` | Retrieve persistent investigator audit trail | `tender_id` (optional) |
| `POST` | `/api/audit-logs` | Record a new timestamped officer finding | `tender_id`, `officer_name`, `agency`, `action`, `notes` |

### 6.2 OCDS Indian Schema Extensions (JSON)
```json
{
  "id": "T-8841",
  "title": "MSRDC - Four Laning & Bituminous Concrete Paving of Pune-Solapur Highway",
  "status": "complete",
  "amount": 485000000.0,
  "currency": "INR",
  "cpv_code": "45233120-6",
  "buyer": {
    "id": "GOV-IN-MSRDC-01",
    "name": "Maharashtra State Road Development Corp (MSRDC)"
  },
  "awards": [{
    "suppliers": [{
      "id": "VEND-IN-APEX-01",
      "name": "Apex Infra Concessions India Pvt Ltd",
      "tax_id": "27AABCA4882R1ZM",
      "address": "Plot 42, MIDC Industrial Area, Bhosari, Pune, Maharashtra 411026",
      "director": "Arvind Vaidya (DIN: 07129481)"
    }]
  }]
}
```

---

## 7. Non-Functional & Security Requirements

1. **Deterministic Execution**: Given identical procurement records, the scoring engine and pipeline must produce identical numerical priority indices with 0.00% stochastic variation.
2. **Ultra-Low Latency In-Process OLAP**: End-to-end DuckDB pipeline execution across 500 procurement tenders must complete in under **45 seconds**; API read queries must return in under **15 milliseconds**.
3. **Electronic Admissibility (Section 65B)**: Every dossier generation incorporates an immutable SHA-256 hash stamp derived from the input OCDS dataset and the pipeline build version.
4. **Resilience & Concurrency**: DuckDB connection handles are isolated or serialized to prevent Windows file-locking race conditions during active learning re-indexing.
5. **Accessibility**: High-contrast ratios compliant with WCAG 2.2 AA; full keyboard navigation support (`J`, `K`, `E`, `A`, `Esc`).

---

## 8. Benchmark Test Suite & Verification Matrix

The platform is systematically verified via automated Python test suites and end-to-end browser subagent automation:

```
============================= test session starts =============================
platform win32 -- Python 3.14.5, pytest-9.1.1, pluggy-1.6.0
rootdir: D:\antigravity work\m#
collected 5 items

procurement_anomaly_system\tests\test_api.py .....                       [100%]

============================== 5 passed in 0.14s ==============================
```

| Test Case | Target Entity / Statute | Expected Behavior | Verification Status |
| :--- | :--- | :--- | :--- |
| **`test_health_and_stats`** | API Service & Statutes | Returns `operational` status with Indian jurisdiction (`Competition Act 2002`, `GFR 2017`, `CVC Act`). | **PASSED (100%)** |
| **`test_tenders_list`** | Triage Queue Filter | Returns 500 Indian tenders sorted by priority descending with INR figures. | **PASSED (100%)** |
| **`test_tender_8841_benchmark`** | Apex Infra / Sec 3(3) Cartel | Score $\ge 90.0$, shell clustering flags identical MIDC address and Jaccard 1.00. | **PASSED (100%)** |
| **`test_mri_dampening_benchmark`** | AIIMS / GFR 2017 Rule 166 PAC | Wipro GE sole bidder price anomaly is dampened by 80% to verified clearance. | **PASSED (100%)** |
| **`test_export_dossier`** | Legal Subpoena Export | Generates printable HTML audit dossier with CVC/CCI headers and ₹ Cr figures. | **PASSED (100%)** |
| **Browser UI Automation** | React 18 Frontend | Complete walkthrough of graph controls, audit trail drawer note logging, and modals. | **VERIFIED (Recorded)** |

---

## 9. Future Roadmap & Scalability

1. **GeM & CPPP Real-Time Streaming Ingestion**:
   - Integration of Apache Kafka / RabbitMQ consumer workers to ingest real-time tender releases via GeM API webhooks.
2. **Ministry of Corporate Affairs (MCA-21) Automated API Sync**:
   - Automated lookup of dynamic DIN director filings and Ultimate Beneficial Ownership (UBO) cross-holdings.
3. **National e-Governance Services (NeSL) Banking Flow Reconciliation**:
   - Integration of bank guarantee and earnest money deposit (EMD) transaction tracking to detect co-mingled bank accounts among ostensibly competing bidders.
4. **Multilingual Regionalization**:
   - Localization of dossier summaries into Hindi, Marathi, Tamil, and Bengali for district-level vigilance officers.
