"""
Module: scoring_engine.py
Concrete Module Build Specification (Table 7 & Section 6):
Investigation Priority Index Formulation:
S(T) = 100 * [ w_G * S_graph(T) + w_P * S_price(T) + w_R * S_rule(T) ]
Weights:
- w_G = 0.40 (Relational Density)
- w_P = 0.35 (Price Outlier)
- w_R = 0.25 (Procedural Irregularity)
"""

class ScoringEngine:
    def __init__(self, w_G: float = 0.40, w_P: float = 0.35, w_R: float = 0.25):
        self.w_G = w_G
        self.w_P = w_P
        self.w_R = w_R

    def compute_priority_index(self, graph_eval: dict, market_eval: dict, exclusion_engine=None, tender_id: str = None) -> dict:
        """
        Compute calibrated 0-100 Investigation Priority Index.
        """
        s_graph = float(graph_eval.get("graph_score", 0.0))
        s_price = float(market_eval.get("price_score", 0.0))
        s_rule = float(market_eval.get("rule_score", 0.0))

        # Raw weighted score
        raw_score = (self.w_G * s_graph) + (self.w_P * s_price) + (self.w_R * s_rule)
        priority_index = min(100.0, max(0.0, raw_score))

        # Check Active Learning Exclusion discount
        discount_factor = 1.0
        active_learning_note = None
        if exclusion_engine:
            feature_vector = [s_graph / 100.0, s_price / 100.0, s_rule / 100.0]
            discount_factor, match_reason = exclusion_engine.check_exclusion_match(feature_vector, tender_id)
            if discount_factor < 1.0:
                priority_index *= discount_factor
                active_learning_note = f"Active Learning: Discounted by {(1.0 - discount_factor)*100:.0f}% due to matching exclusion profile ({match_reason})"

        # Determine Priority Category and Color Token
        if priority_index >= 80.0:
            category = "HIGH_PRIORITY"
            color_token = "#DC2626" # Crimson Alert - Critical Cartel
            status_label = "Critical Cartel Alert"
        elif priority_index >= 50.0:
            category = "MEDIUM_PRIORITY"
            color_token = "#D97706" # Muted Amber - Elevated Risk
            status_label = "Elevated Risk Caution"
        else:
            category = "LOW_PRIORITY"
            color_token = "#059669" # Forest Emerald - Legitimate Baseline
            status_label = "Verified Baseline" if market_eval.get("dampening_applied") else "Normal Variance"

        return {
            "priority_score": round(priority_index, 1),
            "category": category,
            "color_token": color_token,
            "status_label": status_label,
            "decomposition": {
                "relational_density": {
                    "weight": self.w_G,
                    "score": round(s_graph, 1),
                    "weighted_contribution": round(self.w_G * s_graph, 1),
                    "label": "Relational Density (40% weight)"
                },
                "price_outlier": {
                    "weight": self.w_P,
                    "score": round(s_price, 1),
                    "weighted_contribution": round(self.w_P * s_price, 1),
                    "label": "Price Outlier (35% weight)"
                },
                "procedural_irregularity": {
                    "weight": self.w_R,
                    "score": round(s_rule, 1),
                    "weighted_contribution": round(self.w_R * s_rule, 1),
                    "label": "Procedural Irregularity (25% weight)"
                }
            },
            "active_learning_note": active_learning_note
        }
