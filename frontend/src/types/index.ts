export type DecisionOutcome = 'APPROVE' | 'BLOCK' | 'INSUFFICIENT_EVIDENCE';

export type CertificateStatus = 
  | 'VERIFIED_WITHIN_DECLARED_SCOPE'
  | 'COUNTEREXAMPLE_FOUND'
  | 'INSUFFICIENT_EVIDENCE'
  | 'INCONCLUSIVE'
  | 'VERIFICATION_FAILED';

export type SearchOutcome = 
  | 'COUNTEREXAMPLE_FOUND'
  | 'NO_COUNTEREXAMPLE_FOUND_WITHIN_SCOPE'
  | 'SEARCH_LIMIT_REACHED'
  | 'VERIFICATION_ERROR';

export interface HealthData {
  status: string;
  graph_db_connected: boolean;
  graph_name: string;
  node_count: number;
  edge_count: number;
  version: string;
}

export interface GraphNodeView {
  id: string;
  label: string;
  type: string;
  properties: Record<string, any>;
}

export interface GraphEdgeView {
  id: string;
  source: string;
  target: string;
  type: string;
  properties?: Record<string, any>;
}

export interface GraphData {
  nodes: GraphNodeView[];
  edges: GraphEdgeView[];
  total_nodes: number;
  total_edges: number;
}

export interface ConstraintEvaluationResult {
  rule_id: string;
  rule_name: string;
  mandatory: boolean;
  passed: boolean;
  status: 'PASSED' | 'FAILED' | 'MISSING_EVIDENCE' | 'CONFLICT';
  explanation: string;
  evidence_ids: string[];
}

export interface ContextCostMetrics {
  selected_evidence_count: number;
  total_graph_evidence_count: number;
  selected_node_count: number;
  total_graph_node_count: number;
  selected_edge_count: number;
  total_graph_edge_count: number;
  reduction_percentage: number;
  estimated_token_count: number;
}

export interface DecisionResponse {
  decision_id: string;
  subject: string;
  policy_id: string;
  policy_version: string;
  outcome: DecisionOutcome;
  evaluation_status: string;
  constraints: ConstraintEvaluationResult[];
  selected_evidence_ids: string[];
  omitted_evidence_ids: string[];
  evidence_paths: Array<{
    evidence_id: string;
    title: string;
    status: string;
    source_type: string;
    selection_reason: string;
  }>;
  context_cost: ContextCostMetrics;
  context_hash: string;
  selection_reasons: Record<string, string>;
  created_at: string;
}

export interface CounterexampleCandidate {
  scenario_id: string;
  scenario_name: string;
  scenario_type: string;
  changed_assumptions: Record<string, any>;
  supporting_evidence_ids: string[];
  dependency_path: string[];
  baseline_decision: DecisionOutcome;
  scenario_decision: DecisionOutcome;
  policy_constraints_affected: string[];
  validation_status: string;
  search_method: string;
  search_completeness: string;
}

export interface CounterexampleSearchResponse {
  search_status: SearchOutcome;
  scenarios_tested: number;
  counterexamples_found: CounterexampleCandidate[];
  completeness_metadata: Record<string, any>;
  duration_ms: number;
}

export interface RepairStepTrace {
  step: number;
  action: string;
  added_nodes: string[];
  added_edges: string[];
  reason: string;
}

export interface ContextRepairResponse {
  repair_id: string;
  decision_id: string;
  previous_outcome: DecisionOutcome;
  revised_outcome: DecisionOutcome;
  added_evidence_ids: string[];
  expanded_context_cost: ContextCostMetrics;
  repair_trace: RepairStepTrace[];
  revised_constraints: ConstraintEvaluationResult[];
  certificate_id: string;
}

export interface VerificationCertificate {
  certificate_id: string;
  decision_id: string;
  created_at: string;
  policy_id: string;
  policy_version: string;
  baseline_decision: DecisionOutcome;
  final_decision: DecisionOutcome;
  selected_evidence_ids: string[];
  omitted_evidence_summary: Record<string, any>;
  selected_context_hash: string;
  graph_version_or_snapshot_reference: string;
  dependency_paths: any[];
  counterexamples_tested: number;
  counterexamples_found: number;
  context_repair_iterations: number;
  verification_method: string;
  solver_status: string;
  search_scope: Record<string, any>;
  search_limit: number;
  search_complete: boolean;
  assumptions: string[];
  unresolved_conflicts: string[];
  unverified_conditions: string[];
  limitations: string[];
  status: CertificateStatus;
}
