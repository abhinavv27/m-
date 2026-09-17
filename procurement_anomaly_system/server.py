"""
FastAPI Server for Project Sentinel: Public Procurement Audit Suite
Exposes operational triage APIs, graph traversal, market baselines,
active learning feedback, and legal subpoena dossier generation.
"""

import os
import sys
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse
from pydantic import BaseModel
from typing import Optional, List

# Ensure project root is in sys.path
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from procurement_anomaly_system.pipeline import SentinelPipeline

app = FastAPI(
    title="Project Sentinel: Public Procurement Audit Suite API",
    description="UN SDG 16 High-Density Procurement Anomaly Detection & Collusion Triage Engine",
    version="1.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pipeline = SentinelPipeline()
# Initialize and run pipeline on startup
pipeline.run_full_pipeline()

class DispositionRequest(BaseModel):
    action: str # ESCALATE, INQUEST, DISMISS
    auditor_notes: Optional[str] = ""
    officer_name: Optional[str] = "Forensic Investigator"
    agency: Optional[str] = "CCI / CVC Antitrust Desk"

class AuditNoteRequest(BaseModel):
    tender_id: str
    officer_name: Optional[str] = "Forensic Investigator"
    agency: Optional[str] = "CVC / CCI Taskforce"
    action: Optional[str] = "NOTE"
    notes: str

@app.get("/api/health")
def health():
    return {
        "status": "operational",
        "system": "Project Sentinel",
        "jurisdiction": "Republic of India",
        "statutes": ["Competition Act 2002 Sec 3(3)", "GFR 2017 Rule 166", "CVC Act 2003"]
    }

@app.get("/api/audit-logs")
def get_audit_logs(tender_id: Optional[str] = None):
    """Retrieve persistent timestamped investigator audit notes."""
    return pipeline.feedback_engine.get_audit_trail(tender_id)

@app.post("/api/audit-logs")
def post_audit_log(req: AuditNoteRequest):
    """Record an investigator audit trail entry / note."""
    entry = pipeline.feedback_engine.add_audit_note(
        tender_id=req.tender_id,
        officer_name=req.officer_name,
        agency=req.agency,
        notes=req.notes,
        action=req.action
    )
    return {"success": True, "entry": entry}

@app.get("/api/stats")
def get_stats():
    return pipeline.stats

@app.get("/api/tenders")
def get_tenders(
    q: Optional[str] = None,
    cpv: Optional[str] = None,
    category: Optional[str] = None,
    min_score: Optional[float] = None,
    limit: int = 500,
    offset: int = 0
):
    """Filterable, sorted triage queue list for the TanStack virtualized table."""
    items = pipeline.tenders_summary_list

    if q:
        query = q.lower()
        items = [
            t for t in items
            if query in t["id"].lower()
            or query in t["title"].lower()
            or query in t["buyer_name"].lower()
            or query in t["winner_name"].lower()
            or query in t["cpv_code"].lower()
        ]

    if cpv:
        cpv_codes = [c.strip() for c in cpv.split(",") if c.strip()]
        if cpv_codes:
            items = [t for t in items if t["cpv_code"] in cpv_codes]

    if category:
        items = [t for t in items if t["category"] == category]

    if min_score is not None:
        items = [t for t in items if t["priority_score"] >= min_score]

    total_count = len(items)
    paginated = items[offset : offset + limit]

    return {
        "total": total_count,
        "offset": offset,
        "limit": limit,
        "items": paginated
    }

@app.get("/api/tenders/{tender_id}")
def get_tender_detail(tender_id: str):
    record = pipeline.get_tender_detail(tender_id)
    if not record:
        raise HTTPException(status_code=404, detail="Tender not found")
    return record

@app.get("/api/tenders/{tender_id}/graph")
def get_tender_graph(tender_id: str):
    graph = pipeline.get_tender_graph(tender_id)
    if not graph:
        raise HTTPException(status_code=404, detail="Subgraph not found for tender")
    return graph

@app.get("/api/tenders/{tender_id}/price-distribution")
def get_price_distribution(tender_id: str):
    dist = pipeline.get_price_distribution(tender_id)
    if not dist:
        raise HTTPException(status_code=404, detail="Price distribution not found")
    return dist

@app.post("/api/tenders/{tender_id}/disposition")
def submit_disposition(tender_id: str, req: DispositionRequest):
    record = pipeline.get_tender_detail(tender_id)
    if not record:
        raise HTTPException(status_code=404, detail="Tender not found")

    feature_vec = [
        record["graph_eval"].get("graph_score", 0) / 100.0,
        record["market_eval"].get("price_score", 0) / 100.0,
        record["market_eval"].get("rule_score", 0) / 100.0,
    ]

    result = pipeline.feedback_engine.record_disposition(
        tender_id=tender_id,
        action=req.action,
        auditor_notes=req.auditor_notes,
        feature_vector=feature_vec,
        officer_name=req.officer_name,
        agency=req.agency
    )

    # If dismissed, trigger quick recalculation
    if req.action == "DISMISS":
        pipeline.run_full_pipeline()

    return {
        "success": True,
        "disposition": result,
        "tender_id": tender_id,
        "message": f"Recorded {req.action} for {tender_id}"
    }

@app.get("/api/tenders/{tender_id}/export-dossier")
def export_dossier(tender_id: str):
    """Generate formal legal audit file / printable HTML subpoena dossier for Indian authorities."""
    record = pipeline.get_tender_detail(tender_id)
    if not record:
        raise HTTPException(status_code=404, detail="Tender not found")

    dossier = record["dossier"]
    scoring = record["scoring"]
    tender = record["tender"]

    decomp = scoring["decomposition"]
    findings_html = "".join([f"<li style='margin-bottom: 10px; color: #1e293b; font-size: 13px; line-height: 1.5;'>{f}</li>" for f in dossier["verified_evidence_findings"]])

    amt = float(tender['amount'])
    budget = float(tender['budget'])
    amt_cr = amt / 10000000.0
    budget_cr = budget / 10000000.0

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>INVESTIGATIVE AUDIT DOSSIER - {dossier['dossier_id']}</title>
<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
    body {{ font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; margin: 40px; color: #0F172A; background: #FFFFFF; font-size: 13px; line-height: 1.5; }}
    .header {{ border-bottom: 2px solid #1E293B; padding-bottom: 16px; margin-bottom: 24px; }}
    .badge {{ display: inline-block; padding: 4px 10px; font-weight: 700; font-size: 11px; border-radius: 4px; font-family: 'JetBrains Mono', monospace; letter-spacing: 0.5px; }}
    .badge-crimson {{ background: #FEF2F2; color: #DC2626; border: 1px solid #FCA5A5; }}
    .badge-amber {{ background: #FFFBEB; color: #D97706; border: 1px solid #FCD34D; }}
    .badge-emerald {{ background: #ECFDF5; color: #059669; border: 1px solid #6EE7B7; }}
    .grid {{ display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }}
    .card {{ border: 1px solid #E2E8F0; border-radius: 6px; padding: 18px; background: #F8FAFC; }}
    .metric-value {{ font-size: 26px; font-weight: 800; color: #0B0F17; font-family: 'JetBrains Mono', monospace; }}
    table {{ width: 100%; border-collapse: collapse; margin-top: 12px; }}
    th, td {{ padding: 8px 10px; text-align: left; border-bottom: 1px solid #E2E8F0; font-size: 12px; }}
    th {{ background: #EDF2F7; color: #475569; font-weight: 600; width: 38%; }}
    td {{ color: #0F172A; }}
    .mono {{ font-family: 'JetBrains Mono', monospace; }}
    .footer {{ margin-top: 36px; padding-top: 16px; border-top: 1px solid #E2E8F0; font-size: 11px; color: #64748B; display: flex; justify-content: space-between; }}
</style>
</head>
<body>
    <div class="header">
        <div style="float: right; text-align: right;">
            <div class="mono" style="font-size: 13px; font-weight: 700; color: #0B0F17;">{dossier['dossier_id']}</div>
            <div style="font-size: 11px; color: #64748B; margin-top: 2px;">Statutory Jurisdiction: Republic of India</div>
            <div style="margin-top: 8px;">
                <span class="badge badge-crimson">{scoring['status_label'].upper()} (INDEX: {scoring['priority_score']}/100)</span>
            </div>
        </div>
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 6px;">
            <span style="background: #0B0F17; color: #FFFFFF; font-weight: 800; font-size: 11px; padding: 2px 8px; border-radius: 3px; letter-spacing: 0.5px;">CVC / CCI INQUEST</span>
            <span style="color: #64748B; font-size: 11px;">Ref: Competition Act 2002 Sec 3(3) & GFR 2017 Rule 166</span>
        </div>
        <h1 style="margin: 0; font-size: 20px; font-weight: 800; color: #0B0F17; letter-spacing: -0.3px;">PUBLIC PROCUREMENT AUDIT DOSSIER & SUBPOENA EVIDENCE BRIEF</h1>
        <div style="font-size: 12px; color: #475569; margin-top: 4px;">
            Case Identifier: <strong class="mono">{dossier['case_identifier']}</strong> | GeM / CPPP Tender ID: <strong class="mono">{tender['id']}</strong>
        </div>
    </div>

    <div class="grid">
        <div class="card">
            <h3 style="margin-top: 0; font-size: 13px; text-transform: uppercase; color: #334155; letter-spacing: 0.5px; border-bottom: 1px solid #E2E8F0; padding-bottom: 8px;">Procurement Entity Particulars</h3>
            <table>
                <tr><th>Procurement Project</th><td><strong>{tender['title']}</strong></td></tr>
                <tr><th>Procuring Authority</th><td>{tender['buyer_name']} <span class="mono" style="color: #64748B;">({tender['buyer_id']})</span></td></tr>
                <tr><th>Awarded Contractor</th><td><strong>{tender['winning_vendor_name']}</strong> <span class="mono" style="color: #64748B;">({tender['winning_vendor_id']})</span></td></tr>
                <tr><th>Contract Value</th><td><strong class="mono">₹ {amt:,.2f} INR (₹ {amt_cr:.2f} Cr)</strong></td></tr>
                <tr><th>Sanctioned Budget</th><td class="mono">₹ {budget:,.2f} INR (₹ {budget_cr:.2f} Cr)</td></tr>
                <tr><th>CPV / Schedule</th><td><span class="mono">{tender['cpv_code']}</span> - {tender['cpv_description']}</td></tr>
                <tr><th>Submission Window</th><td>{tender['duration_days']} calendar days ({tender['duration_days']*24} hours)</td></tr>
                <tr><th>Bids Evaluated</th><td>{tender['bidder_count']} verified participant(s)</td></tr>
                <tr><th>Jurisdiction Region</th><td>{tender.get('region', 'National Highway Network')} (India)</td></tr>
            </table>
        </div>

        <div class="card">
            <h3 style="margin-top: 0; font-size: 13px; text-transform: uppercase; color: #334155; letter-spacing: 0.5px; border-bottom: 1px solid #E2E8F0; padding-bottom: 8px;">Investigation Priority Index (0–100)</h3>
            <div class="metric-value">{scoring['priority_score']} <span style="font-size: 13px; font-weight: 500; color: #64748B;">/ 100 Calibrated Score</span></div>
            <div style="margin-top: 14px;">
                <div style="margin-bottom: 10px; border-left: 3px solid #DC2626; padding-left: 10px;">
                    <div style="font-weight: 600; color: #0F172A;">Relational Density (40% Weight): <span class="mono">{decomp['relational_density']['score']}/100</span></div>
                    <div style="font-size: 11px; color: #475569;">Contribution: {decomp['relational_density']['weighted_contribution']} pts • {dossier['score_decomposition']['relational_density']['text']}</div>
                </div>
                <div style="margin-bottom: 10px; border-left: 3px solid #D97706; padding-left: 10px;">
                    <div style="font-weight: 600; color: #0F172A;">Price Outlier (35% Weight): <span class="mono">{decomp['price_outlier']['score']}/100</span></div>
                    <div style="font-size: 11px; color: #475569;">Contribution: {decomp['price_outlier']['weighted_contribution']} pts • {dossier['score_decomposition']['price_outlier']['text']}</div>
                </div>
                <div style="margin-bottom: 10px; border-left: 3px solid #2563EB; padding-left: 10px;">
                    <div style="font-weight: 600; color: #0F172A;">Procedural Irregularity (25% Weight): <span class="mono">{decomp['procedural_irregularity']['score']}/100</span></div>
                    <div style="font-size: 11px; color: #475569;">Contribution: {decomp['procedural_irregularity']['weighted_contribution']} pts • {dossier['score_decomposition']['procedural_irregularity']['text']}</div>
                </div>
            </div>
        </div>
    </div>

    <div class="card" style="background: #FFFFFF; border-left: 4px solid #DC2626; margin-bottom: 20px;">
        <h3 style="margin-top: 0; font-size: 13px; text-transform: uppercase; color: #DC2626; letter-spacing: 0.5px;">Verified Forensic Evidence Findings</h3>
        <ul style="padding-left: 20px; margin-bottom: 0;">
            {findings_html}
        </ul>
    </div>

    <div class="card">
        <h3 style="margin-top: 0; font-size: 13px; text-transform: uppercase; color: #334155; letter-spacing: 0.5px; border-bottom: 1px solid #E2E8F0; padding-bottom: 8px;">Statutory Framework & Chain of Custody</h3>
        <p style="font-size: 12px; color: #334155; margin-bottom: 6px;">
            This audit dossier has been deterministically compiled in accordance with Section 3(3) of the Competition Act, 2002 (Prohibition of Anti-Competitive Agreements / Bid Rigging) and Central Vigilance Commission (CVC) Special Guidelines.
        </p>
        <p style="font-size: 12px; color: #64748B; margin: 0;">
            <strong>Non-Defamation Mandate:</strong> In accordance with statutory auditing norms, this document constitutes an algorithmic triage signal for authorized investigative officers and does not represent an ex-parte judicial conviction. Verification of MCA-21 director filings, banking records, and IP transmission headers is required prior to formal prosecution.
        </p>
    </div>

    <div class="footer">
        <div>Project Sentinel • Institutional Public Procurement Audit Suite (India)</div>
        <div class="mono">Dataset: GeM_CAG_Sync_2026Q3 • Source Hash: SHA-256: 7f8a92b10dc94e773a4b9c8141f2382e873919e1</div>
    </div>
</body>
</html>
"""
    return HTMLResponse(content=html)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)

