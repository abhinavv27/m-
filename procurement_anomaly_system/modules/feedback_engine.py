"""
Module: feedback_engine.py
Concrete Module Build Specification (Table 7 & Section 8):
Human-in-the-Loop Active Learning:
When an auditor marks a case as "Legitimate Business Variance", the feature signature
is committed to an exclusion embedding index. Future cases matching this cosine profile
have their alert weights discounted.
Also manages auditor dispositions (Escalate: Subpoena File, Flag for Peer Review, Dismiss).
"""

import json
import os
import math
import numpy as np
from datetime import datetime

class ActiveLearningFeedbackEngine:
    def __init__(self, storage_path: str = None):
        if not storage_path:
            storage_path = os.path.join(
                os.path.dirname(__file__), "..", "data", "exclusion_index.json"
            )
        self.storage_path = storage_path
        self.exclusions = [] # list of {"vector": [...], "tender_id": str, "timestamp": str, "reason": str}
        self.audit_log = []  # list of disposition actions taken
        self.load()

    def load(self):
        if os.path.exists(self.storage_path):
            try:
                with open(self.storage_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self.exclusions = data.get("exclusions", [])
                    self.audit_log = data.get("audit_log", [])
            except Exception as e:
                print(f"Failed to load exclusion index: {e}")

        # Seed initial realistic forensic logs if empty
        if not self.audit_log:
            self.audit_log = [
                {
                    "tracking_id": "AUD-INIT-0001",
                    "tender_id": "T-8841",
                    "officer_name": "Insp. R. Venkatesh",
                    "agency": "CCI (Antitrust Taskforce)",
                    "action": "BENEFICIAL_OWNERSHIP",
                    "auditor_notes": "Flagged shared beneficial ownership and identical registered MIDC Bhosari address between Apex Infra and Vardhan Paving. Transferred to Section 3(3) Cartel Inquest Desk.",
                    "timestamp": "2026-09-17T14:22:00Z"
                },
                {
                    "tracking_id": "AUD-INIT-0002",
                    "tender_id": "T-8841",
                    "officer_name": "Adv. S. Ramanathan",
                    "agency": "CVC (Vigilance Audit Cell)",
                    "action": "BID_ROTATION",
                    "auditor_notes": "Historical bid-rotation analysis demonstrates 100% win-rate alternation across MSRDC highway tenders over 6 consecutive cycles. Recommended for formal subpoena.",
                    "timestamp": "2026-09-17T15:45:00Z"
                },
                {
                    "tracking_id": "AUD-INIT-0003",
                    "tender_id": "T-4401",
                    "officer_name": "Dr. K. Swaminathan",
                    "agency": "CVC (Medical Technical Panel)",
                    "action": "PAC_VERIFIED",
                    "auditor_notes": "Verified GFR 2017 Rule 166 Proprietary Articles Certificate for AIIMS 3.0T MRI. Legitimate sole OEM manufacturer Wipro GE Healthcare Pvt Ltd. Dampening confirmed.",
                    "timestamp": "2026-09-16T11:30:00Z"
                }
            ]
            self.save()

    def save(self):
        os.makedirs(os.path.dirname(self.storage_path), exist_ok=True)
        with open(self.storage_path, "w", encoding="utf-8") as f:
            json.dump({
                "exclusions": self.exclusions,
                "audit_log": self.audit_log
            }, f, indent=2)

    def _cosine_similarity(self, v1, v2) -> float:
        a = np.array(v1, dtype=float)
        b = np.array(v2, dtype=float)
        norm_a = np.linalg.norm(a)
        norm_b = np.linalg.norm(b)
        if norm_a == 0 or norm_b == 0:
            return 0.0
        return float(np.dot(a, b) / (norm_a * norm_b))

    def record_disposition(self, tender_id: str, action: str, auditor_notes: str, feature_vector: list = None, officer_name: str = "Forensic Investigator", agency: str = "CVC / CCI Audit Unit") -> dict:
        """
        Record auditor action:
        - ESCALATE: Subpoena File
        - INQUEST: Request Agency Inquest
        - DISMISS: Valid Market Monopoly (Commits to active learning exclusion index)
        """
        timestamp = datetime.utcnow().isoformat() + "Z"
        tracking_id = f"AUD-{action}-{tender_id.replace('T-', '')}-{len(self.audit_log)+1:04d}"

        entry = {
            "tracking_id": tracking_id,
            "tender_id": tender_id,
            "officer_name": officer_name,
            "agency": agency,
            "action": action,
            "auditor_notes": auditor_notes,
            "timestamp": timestamp
        }

        if action == "DISMISS" and feature_vector:
            self.exclusions.append({
                "tender_id": tender_id,
                "vector": feature_vector,
                "reason": auditor_notes or "Auditor confirmed legitimate market variance (GFR 2017 Rule 166 / PAC)",
                "timestamp": timestamp
            })
            entry["exclusion_committed"] = True

        self.audit_log.insert(0, entry) # Most recent first
        self.save()
        return entry

    def add_audit_note(self, tender_id: str, officer_name: str, agency: str, notes: str, action: str = "NOTE") -> dict:
        """Add a timestamped audit log note from an officer."""
        timestamp = datetime.utcnow().isoformat() + "Z"
        tracking_id = f"NOTE-{tender_id.replace('T-', '')}-{len(self.audit_log)+1:04d}"

        entry = {
            "tracking_id": tracking_id,
            "tender_id": tender_id,
            "officer_name": officer_name or "Forensic Investigator",
            "agency": agency or "CCI / CVC Taskforce",
            "action": action,
            "auditor_notes": notes,
            "timestamp": timestamp
        }
        self.audit_log.insert(0, entry)
        self.save()
        return entry

    def get_audit_trail(self, tender_id: str = None) -> list:
        """Retrieve audit log entries, optionally filtered by tender_id."""
        if tender_id:
            return [log for log in self.audit_log if log.get("tender_id") == tender_id]
        return self.audit_log

    def check_exclusion_match(self, feature_vector: list, tender_id: str = None) -> tuple[float, str]:
        """
        Compare feature_vector with learned exclusion profiles.
        If cosine similarity >= 0.96, return discount factor (e.g. 0.35) and matched reason.
        """
        if not self.exclusions:
            return 1.0, None

        best_sim = 0.0
        best_reason = None
        for item in self.exclusions:
            if item.get("tender_id") == tender_id:
                # Same tender that was already dismissed -> full dampening
                return 0.10, "Explicitly dismissed by investigator"

            sim = self._cosine_similarity(feature_vector, item["vector"])
            if sim > best_sim:
                best_sim = sim
                best_reason = item.get("reason", "Legitimate market variance profile")

        if best_sim >= 0.96:
            # High cosine similarity match to legitimate variance profile
            return 0.35, f"Cosine profile match: {best_sim:.2f}"
        elif best_sim >= 0.90:
            return 0.65, f"Moderate profile match: {best_sim:.2f}"

        return 1.0, None
