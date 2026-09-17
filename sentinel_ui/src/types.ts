export interface TenderSummary {
  id: string;
  title: string;
  buyer_name: string;
  winner_name: string;
  amount: number;
  budget: number;
  cpv_code: string;
  cpv_description: string;
  priority_score: number;
  category: "HIGH_PRIORITY" | "MEDIUM_PRIORITY" | "LOW_PRIORITY";
  color_token: string;
  status_label: string;
  decomposition: {
    relational_density: { weight: number; score: number; weighted_contribution: number; label: string };
    price_outlier: { weight: number; score: number; weighted_contribution: number; label: string };
    procedural_irregularity: { weight: number; score: number; weighted_contribution: number; label: string };
  };
  duration_days: number;
  bidder_count: number;
  region: string;
  has_cartel_ring: boolean;
  dampened: boolean;
}

export interface SubgraphNode {
  id: string;
  type: "buyer" | "winner" | "co_bidder";
  label: string;
  shape: "hexagon" | "circle";
  fill: string;
  stroke: string;
  data: {
    role?: string;
    region?: string;
    award_amount?: number;
    bid_amount?: number;
    status?: string;
    tax_id?: string;
    address?: string;
    director?: string;
  };
  x?: number;
  y?: number;
}

export interface SubgraphEdge {
  id: string;
  source: string;
  target: string;
  type: "award" | "submission" | "collusion_link";
  color: string;
  style: "solid" | "dotted" | "dashed";
  label: string;
  meta_pill?: string;
  jaccard?: number;
  joint_bids?: number;
  entity_flags?: Array<{ type: string; description: string; severity: string }>;
  weight: number;
}

export interface PriceDistribution {
  cpv_code: string;
  cpv_name: string;
  current_bid: number;
  mean: number;
  median: number;
  q25: number;
  q75: number;
  std: number;
  histogram: Array<{
    bin_start: number;
    bin_end: number;
    bin_label: string;
    count: number;
  }>;
}

export interface TenderDetail {
  tender: {
    id: string;
    ocid: string;
    title: string;
    status: string;
    cpv_code: string;
    cpv_description: string;
    amount: number;
    budget: number;
    currency: string;
    start_date: string;
    end_date: string;
    duration_days: number;
    bidder_count: number;
    award_criteria: string;
    region: string;
    buyer_id: string;
    buyer_name: string;
    winning_vendor_id: string;
    winning_vendor_name: string;
    award_date: string;
  };
  scoring: {
    priority_score: number;
    category: string;
    color_token: string;
    status_label: string;
    active_learning_note?: string;
    decomposition: {
      relational_density: { weight: number; score: number; weighted_contribution: number; label: string };
      price_outlier: { weight: number; score: number; weighted_contribution: number; label: string };
      procedural_irregularity: { weight: number; score: number; weighted_contribution: number; label: string };
    };
  };
  dossier: {
    dossier_id: string;
    case_identifier: string;
    tender_id: string;
    title: string;
    buyer: string;
    winner: string;
    award_amount: number;
    budget_cap: number;
    cpv_code: string;
    cpv_description: string;
    submission_duration_hours: number;
    priority_score: number;
    category: string;
    color_token: string;
    status_label: string;
    active_learning_note?: string;
    score_decomposition: {
      relational_density: { score: number; weight: number; text: string };
      price_outlier: { score: number; weight: number; text: string };
      procedural_irregularity: { score: number; weight: number; text: string };
    };
    verified_evidence_findings: string[];
    audit_disposition_options: Array<{
      action: string;
      label: string;
      variant: string;
    }>;
  };
  graph_eval: {
    graph_score: number;
    max_jaccard: number;
    max_joint_count: number;
    shared_address: boolean;
    ring_symmetry: boolean;
    cover_margin: boolean;
    findings: string[];
    subgraph: {
      nodes: SubgraphNode[];
      edges: SubgraphEdge[];
    };
  };
  market_eval: {
    price_score: number;
    rule_score: number;
    std_deviation_distance: number;
    ceiling_proximity: number;
    dampening_applied: boolean;
    findings: string[];
  };
}

export interface OperationalStats {
  total_tenders: number;
  high_priority_count: number;
  med_priority_count: number;
  low_priority_count: number;
  active_collusion_rings: number;
  capital_at_risk: number;
  false_positive_dampened_count: number;
  dampened_rate_pct: number;
  pipeline_runtime_sec: number;
}

export interface AuditLogEntry {
  tracking_id: string;
  tender_id: string;
  officer_name?: string;
  agency?: string;
  action: string;
  auditor_notes: string;
  timestamp: string;
  exclusion_committed?: boolean;
}

