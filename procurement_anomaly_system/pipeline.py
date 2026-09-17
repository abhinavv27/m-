"""
Orchestrated End-to-End Pipeline for Project Sentinel: Public Procurement Audit Suite
Executes the 3 Layers of Truth:
Layer 1: Context Filter & Ingestion (OCDS + DuckDB + Market Baselines)
Layer 2: Collusion Graph & Entity Mining (Entity Clustering + Cartel Network)
Layer 3: Explainable Audit Triage (Scoring Ensembles + Natural-Language Dossiers)
"""

import os
import sys
import json
import time

# Ensure project root is in python path
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from procurement_anomaly_system.modules.ingest_ocds import OCDSIngestor
from procurement_anomaly_system.modules.entity_cluster import EntityClusterEngine
from procurement_anomaly_system.modules.market_baseline import MarketBaselineEngine
from procurement_anomaly_system.modules.cartel_network import CartelNetworkEngine
from procurement_anomaly_system.modules.scoring_engine import ScoringEngine
from procurement_anomaly_system.modules.explainable_dossier import ExplainableDossierEngine
from procurement_anomaly_system.modules.feedback_engine import ActiveLearningFeedbackEngine

class SentinelPipeline:
    def __init__(self, db_path: str = None):
        base_dir = os.path.dirname(__file__)
        if not db_path:
            db_path = os.path.join(base_dir, "data", "sentinel.duckdb")

        self.db_path = db_path
        self.ingestor = OCDSIngestor(db_path)
        self.entity_engine = EntityClusterEngine()
        self.market_engine = MarketBaselineEngine()
        self.cartel_engine = CartelNetworkEngine()
        self.scoring_engine = ScoringEngine()
        self.dossier_engine = ExplainableDossierEngine()
        self.feedback_engine = ActiveLearningFeedbackEngine()

        self.processed_tenders = {}
        self.tenders_summary_list = []
        self.stats = {}

    def run_full_pipeline(self, ocds_json_path: str = None):
        """Run all 3 layers of truth across the dataset."""
        t0 = time.time()
        base_dir = os.path.dirname(__file__)
        if not ocds_json_path:
            ocds_json_path = os.path.join(base_dir, "data", "raw", "ocds_releases.json")

        print("=== STEP 1: Ingesting OCDS into DuckDB ===")
        # Check if table already populated, if not, ingest
        count_existing = self.ingestor.query("SELECT count(*) FROM tenders")[0][0]
        if count_existing == 0 and os.path.exists(ocds_json_path):
            self.ingestor.load_ocds_json(ocds_json_path)

        print("=== STEP 2: Entity Clustering & Shell Cartels ===")
        self.entity_engine.build_clusters(self.ingestor)

        print("=== STEP 3: Computing CPV Market Baselines & ECOD ===")
        self.market_engine.compute_baselines(self.ingestor)

        print("=== STEP 4: Mining Cartel Network & Co-Bidding Matrices ===")
        self.cartel_engine.build_network(self.ingestor)

        print("=== STEP 5: Scoring Ensembles & Natural-Language Dossiers ===")
        tenders_raw = self.ingestor.query("""
            SELECT id, ocid, title, status, cpv_code, cpv_description,
                   amount, budget, currency, start_date, end_date, duration_days,
                   bidder_count, award_criteria, region, buyer_id, buyer_name,
                   winning_vendor_id, winning_vendor_name, award_date
            FROM tenders
            ORDER BY id
        """)

        cols = [c[0] for c in self.ingestor.conn.description]
        self.processed_tenders = {}
        self.tenders_summary_list = []

        total_capital_at_risk = 0.0
        high_priority_count = 0
        med_priority_count = 0
        dampened_count = 0

        for row in tenders_raw:
            t_dict = dict(zip(cols, row))
            t_id = t_dict["id"]

            # Layer 1: Market evaluation
            market_eval = self.market_engine.evaluate_tender_market_anomalies(t_dict)
            if market_eval.get("dampening_applied"):
                dampened_count += 1

            # Layer 2: Graph & Cartel evaluation
            graph_eval = self.cartel_engine.evaluate_tender_cartel_signals(t_id, self.entity_engine)

            # Layer 3: Priority Scoring
            scoring_res = self.scoring_engine.compute_priority_index(
                graph_eval, market_eval, self.feedback_engine, t_id
            )

            # Build Natural-Language Dossier
            dossier = self.dossier_engine.build_dossier(t_dict, scoring_res, graph_eval, market_eval)

            # Track stats
            pri_score = scoring_res["priority_score"]
            if pri_score >= 80.0:
                high_priority_count += 1
                total_capital_at_risk += t_dict["amount"]
            elif pri_score >= 50.0:
                med_priority_count += 1

            # Store in memory
            full_record = {
                "tender": t_dict,
                "scoring": scoring_res,
                "dossier": dossier,
                "graph_eval": graph_eval,
                "market_eval": market_eval
            }
            self.processed_tenders[t_id] = full_record

            self.tenders_summary_list.append({
                "id": t_id,
                "title": t_dict["title"],
                "buyer_name": t_dict["buyer_name"],
                "winner_name": t_dict["winning_vendor_name"],
                "amount": t_dict["amount"],
                "budget": t_dict["budget"],
                "cpv_code": t_dict["cpv_code"],
                "cpv_description": t_dict["cpv_description"],
                "priority_score": scoring_res["priority_score"],
                "category": scoring_res["category"],
                "color_token": scoring_res["color_token"],
                "status_label": scoring_res["status_label"],
                "decomposition": scoring_res["decomposition"],
                "duration_days": t_dict["duration_days"],
                "bidder_count": t_dict["bidder_count"],
                "region": t_dict["region"],
                "has_cartel_ring": (graph_eval.get("max_joint_count", 0) >= 5 or graph_eval.get("shared_address", False)),
                "dampened": market_eval.get("dampening_applied", False)
            })

        # Sort summary list by priority score descending
        self.tenders_summary_list.sort(key=lambda x: x["priority_score"], reverse=True)

        elapsed = time.time() - t0
        self.stats = {
            "total_tenders": len(self.processed_tenders),
            "high_priority_count": high_priority_count,
            "med_priority_count": med_priority_count,
            "low_priority_count": len(self.processed_tenders) - high_priority_count - med_priority_count,
            "active_collusion_rings": len(self.entity_engine.cluster_details),
            "capital_at_risk": round(total_capital_at_risk, 2),
            "false_positive_dampened_count": dampened_count,
            "dampened_rate_pct": round((dampened_count / max(1, len(self.processed_tenders))) * 100, 1),
            "pipeline_runtime_sec": round(elapsed, 2)
        }

        print(f"=== Pipeline Complete in {elapsed:.2f}s ===")
        print(f"Stats: {self.stats}")
        return self.stats

    def get_tender_detail(self, tender_id: str):
        return self.processed_tenders.get(tender_id)

    def get_tender_graph(self, tender_id: str):
        t_data = self.processed_tenders.get(tender_id)
        if not t_data:
            return None
        return t_data["graph_eval"].get("subgraph")

    def get_price_distribution(self, tender_id: str):
        t_data = self.processed_tenders.get(tender_id)
        if not t_data:
            return None
        cpv = t_data["tender"]["cpv_code"]
        amount = t_data["tender"]["amount"]
        baseline = self.market_engine.baselines.get(cpv, {})
        dist = baseline.get("amounts_distribution", [])

        # Create histogram buckets
        if dist:
            min_val = min(dist) * 0.9
            max_val = max(dist) * 1.1
            bins = 15
            step = (max_val - min_val) / bins
            histogram = []
            for i in range(bins):
                b_start = min_val + i * step
                b_end = b_start + step
                count = sum(1 for v in dist if b_start <= v < b_end)
                histogram.append({
                    "bin_start": round(b_start, 2),
                    "bin_end": round(b_end, 2),
                    "bin_label": f"${b_start/1e6:.1f}M-${b_end/1e6:.1f}M" if max_val >= 1e6 else f"${b_start/1e3:.0f}k-${b_end/1e3:.0f}k",
                    "count": count
                })
        else:
            histogram = []

        return {
            "cpv_code": cpv,
            "cpv_name": baseline.get("description", ""),
            "current_bid": amount,
            "mean": baseline.get("amount_mean", 0.0),
            "median": baseline.get("amount_median", 0.0),
            "q25": baseline.get("amount_q25", 0.0),
            "q75": baseline.get("amount_q75", 0.0),
            "std": baseline.get("amount_std", 0.0),
            "histogram": histogram
        }

if __name__ == "__main__":
    p = SentinelPipeline()
    p.run_full_pipeline()
