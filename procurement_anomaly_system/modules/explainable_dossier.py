"""
Module: explainable_dossier.py
Concrete Module Build Specification (Table 7 & Section 8):
Convert feature contribution vectors into plain-language audit explanations
and structured evidence cards matching Zone 3 Evidence Dossier format.
"""

class ExplainableDossierEngine:
    def __init__(self):
        pass

    def build_dossier(self, tender: dict, scoring_res: dict, graph_eval: dict, market_eval: dict) -> dict:
        """
        Assemble the complete Natural-Language Evidence Dossier for a tender.
        """
        tender_id = tender.get("id")
        title = tender.get("title", "Untitled Procurement")
        buyer_name = tender.get("buyer_name", "Procuring Authority")
        winner_name = tender.get("winning_vendor_name", "Winning Contractor")
        award_amount = float(tender.get("amount", 0.0))
        budget_cap = float(tender.get("budget", award_amount))
        cpv_code = tender.get("cpv_code", "")
        cpv_desc = tender.get("cpv_description", "")
        duration_days = int(tender.get("duration_days", 14))

        decomp = scoring_res.get("decomposition", {})
        rd = decomp.get("relational_density", {})
        po = decomp.get("price_outlier", {})
        pi = decomp.get("procedural_irregularity", {})

        # Plain language summary tags for decomposition
        rd_text = "Standard co-occurrence baseline"
        if rd.get("score", 0) >= 80:
            rd_text = "High vendor co-occurrence; shell cartel indicators"
        elif rd.get("score", 0) >= 40:
            rd_text = "Moderate co-bidding overlap"

        po_text = "Consistent with sector price distribution"
        if po.get("score", 0) >= 80:
            po_text = f"{market_eval.get('std_deviation_distance', 0):.1f}x CPV standard deviation anomaly"
        elif po.get("score", 0) >= 40:
            po_text = "Elevated pricing relative to CPV median"

        pi_text = "Standard statutory timeline"
        if duration_days <= 2:
            pi_text = f"{duration_days * 24}-hour submission window"
        elif duration_days <= 5:
            pi_text = f"Compressed {duration_days}-day submission window"

        # Combine verified evidence findings
        all_findings = []
        all_findings.extend(graph_eval.get("findings", []))
        all_findings.extend(market_eval.get("findings", []))

        # Filter duplicates while preserving order
        unique_findings = []
        seen = set()
        for f in all_findings:
            if f not in seen:
                seen.add(f)
                unique_findings.append(f)

        if not unique_findings:
            unique_findings.append("No structural procurement anomalies or cartel patterns detected.")

        # Dossier Identifier
        dossier_id = f"DOSSIER-IN-{tender_id.replace('T-', '')}-{cpv_code[:4]}"

        return {
            "dossier_id": dossier_id,
            "case_identifier": f"CASE-IN-CVC-CCI-{tender_id}",
            "tender_id": tender_id,
            "title": title,
            "buyer": buyer_name,
            "winner": winner_name,
            "award_amount": award_amount,
            "budget_cap": budget_cap,
            "cpv_code": cpv_code,
            "cpv_description": cpv_desc,
            "submission_duration_hours": duration_days * 24,
            "priority_score": scoring_res.get("priority_score", 0.0),
            "category": scoring_res.get("category", "LOW_PRIORITY"),
            "color_token": scoring_res.get("color_token", "#059669"),
            "status_label": scoring_res.get("status_label", "Normal Variance"),
            "active_learning_note": scoring_res.get("active_learning_note"),
            "score_decomposition": {
                "relational_density": {
                    "score": rd.get("score", 0.0),
                    "weight": rd.get("weight", 0.40),
                    "text": rd_text
                },
                "price_outlier": {
                    "score": po.get("score", 0.0),
                    "weight": po.get("weight", 0.35),
                    "text": po_text
                },
                "procedural_irregularity": {
                    "score": pi.get("score", 0.0),
                    "weight": pi.get("weight", 0.25),
                    "text": pi_text
                }
            },
            "verified_evidence_findings": unique_findings,
            "audit_disposition_options": [
                {"action": "ESCALATE", "label": "Initiate Subpoena Draft", "variant": "danger"},
                {"action": "INQUEST", "label": "Request Agency Inquest", "variant": "warning"},
                {"action": "DISMISS", "label": "Log False Positive Override", "variant": "secondary"}
            ]
        }
