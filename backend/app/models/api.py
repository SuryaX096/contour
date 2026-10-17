from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field
from app.models.entities import (
    DecisionOutcome,
    VerificationLevel,
    CertificateStatus,
    SearchOutcome,
    RelationshipType
)

class HealthResponse(BaseModel):
    status: str
    graph_db_connected: bool
    graph_name: str
    node_count: int
    edge_count: int
    version: str = "1.0.0"

class SeedResponse(BaseModel):
    status: str
    message: str
    nodes_created: int
    edges_created: int
    graph_name: str

class GraphNodeView(BaseModel):
    id: str
    label: str
    type: str  # "Evidence", "Claim", "Rule", "Inference", "Decision", "Scenario", "Certificate", "Service"
    properties: Dict[str, Any]

class GraphEdgeView(BaseModel):
    id: str
    source: str
    target: str
    type: str
    properties: Dict[str, Any] = Field(default_factory=dict)

class GraphDataResponse(BaseModel):
    nodes: List[GraphNodeView]
    edges: List[GraphEdgeView]
    total_nodes: int
    total_edges: int

class EvaluateDecisionRequest(BaseModel):
    root_entity: str = Field(default="service:payment-service:v2.4.0", description="Root subject or release target")
    policy_id: str = Field(default="policy:release-readiness:v1", description="Policy identifier")
    policy_version: str = Field(default="1.0.0", description="Policy version")
    context_budget: Optional[int] = Field(default=None, description="Maximum number of evidence nodes to select")
    include_optional: bool = Field(default=True, description="Whether to include non-critical optional evidence")

class ConstraintEvaluationResult(BaseModel):
    rule_id: str
    rule_name: str
    mandatory: bool
    passed: bool
    status: str  # "PASSED", "FAILED", "MISSING_EVIDENCE", "CONFLICT"
    explanation: str
    evidence_ids: List[str] = Field(default_factory=list)

class ContextCostMetrics(BaseModel):
    selected_evidence_count: int
    total_graph_evidence_count: int
    selected_node_count: int
    total_graph_node_count: int
    selected_edge_count: int
    total_graph_edge_count: int
    reduction_percentage: float
    estimated_token_count: int

class DecisionResponse(BaseModel):
    decision_id: str
    subject: str
    policy_id: str
    policy_version: str
    outcome: DecisionOutcome
    evaluation_status: str
    constraints: List[ConstraintEvaluationResult]
    selected_evidence_ids: List[str]
    omitted_evidence_ids: List[str]
    evidence_paths: List[Dict[str, Any]]
    context_cost: ContextCostMetrics
    context_hash: str
    selection_reasons: Dict[str, str]
    created_at: str

class CounterexampleCandidate(BaseModel):
    scenario_id: str
    scenario_name: str
    scenario_type: str
    changed_assumptions: Dict[str, Any]
    supporting_evidence_ids: List[str]
    dependency_path: List[str]
    baseline_decision: DecisionOutcome
    scenario_decision: DecisionOutcome
    policy_constraints_affected: List[str]
    validation_status: str
    search_method: str
    search_completeness: str

class CounterexampleSearchRequest(BaseModel):
    decision_id: str
    max_scenarios: int = Field(default=50, ge=1, le=500)
    max_depth: int = Field(default=5, ge=1, le=10)
    include_formal_solver: bool = Field(default=True)

class CounterexampleSearchResponse(BaseModel):
    search_status: SearchOutcome
    scenarios_tested: int
    counterexamples_found: List[CounterexampleCandidate]
    completeness_metadata: Dict[str, Any]
    duration_ms: float

class ContextRepairRequest(BaseModel):
    decision_id: str
    counterexample_id: str

class RepairStepTrace(BaseModel):
    step: int
    action: str
    added_nodes: List[str]
    added_edges: List[str]
    reason: str

class ContextRepairResponse(BaseModel):
    repair_id: str
    decision_id: str
    previous_outcome: DecisionOutcome
    revised_outcome: DecisionOutcome
    added_evidence_ids: List[str]
    expanded_context_cost: ContextCostMetrics
    repair_trace: List[RepairStepTrace]
    revised_constraints: List[ConstraintEvaluationResult]
    certificate_id: str

class VerificationCertificate(BaseModel):
    certificate_id: str
    decision_id: str
    created_at: str
    policy_id: str
    policy_version: str
    baseline_decision: DecisionOutcome
    final_decision: DecisionOutcome
    selected_evidence_ids: List[str]
    omitted_evidence_summary: Dict[str, Any]
    selected_context_hash: str
    graph_version_or_snapshot_reference: str
    dependency_paths: List[Dict[str, Any]]
    counterexamples_tested: int
    counterexamples_found: int
    context_repair_iterations: int
    verification_method: str
    solver_status: str
    search_scope: Dict[str, Any]
    search_limit: int
    search_complete: bool
    assumptions: List[str]
    unresolved_conflicts: List[str]
    unverified_conditions: List[str]
    limitations: List[str]
    status: CertificateStatus
