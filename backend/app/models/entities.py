from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

class DecisionOutcome(str, Enum):
    APPROVE = "APPROVE"
    BLOCK = "BLOCK"
    INSUFFICIENT_EVIDENCE = "INSUFFICIENT_EVIDENCE"

class VerificationLevel(str, Enum):
    LEVEL_1_DECISION_AGREEMENT = "LEVEL_1_DECISION_AGREEMENT"
    LEVEL_2_BOUNDED_SEARCH = "LEVEL_2_BOUNDED_SEARCH"
    LEVEL_3_FORMAL_VERIFICATION = "LEVEL_3_FORMAL_VERIFICATION"

class CertificateStatus(str, Enum):
    VERIFIED_WITHIN_DECLARED_SCOPE = "VERIFIED_WITHIN_DECLARED_SCOPE"
    COUNTEREXAMPLE_FOUND = "COUNTEREXAMPLE_FOUND"
    INSUFFICIENT_EVIDENCE = "INSUFFICIENT_EVIDENCE"
    INCONCLUSIVE = "INCONCLUSIVE"
    VERIFICATION_FAILED = "VERIFICATION_FAILED"

class SearchOutcome(str, Enum):
    COUNTEREXAMPLE_FOUND = "COUNTEREXAMPLE_FOUND"
    NO_COUNTEREXAMPLE_FOUND_WITHIN_SCOPE = "NO_COUNTEREXAMPLE_FOUND_WITHIN_SCOPE"
    SEARCH_LIMIT_REACHED = "SEARCH_LIMIT_REACHED"
    VERIFICATION_ERROR = "VERIFICATION_ERROR"

class RelationshipType(str, Enum):
    SUPPORTS = "SUPPORTS"
    CONTRADICTS = "CONTRADICTS"
    DEPENDS_ON = "DEPENDS_ON"
    GOVERNED_BY = "GOVERNED_BY"
    DERIVED_FROM = "DERIVED_FROM"
    TESTED_UNDER = "TESTED_UNDER"
    INVALIDATES = "INVALIDATES"
    REQUIRES = "REQUIRES"
    PRODUCES = "PRODUCES"
    REPAIRS = "REPAIRS"

# Graph Node Models

class EvidenceNode(BaseModel):
    id: str
    title: str
    source_id: str
    source_type: str  # e.g., "unit_test", "integration_test", "security_scan", "compat_check", "perf_check"
    timestamp: str
    version: str
    status: str  # e.g., "PASSED", "FAILED", "COMPATIBLE", "INCOMPATIBLE", "UNKNOWN"
    payload: Dict[str, Any] = Field(default_factory=dict)
    validity_status: str = "VALID"  # "VALID", "STALE", "DISPUTED", "INVALID"
    metadata: Dict[str, Any] = Field(default_factory=dict)

class ClaimNode(BaseModel):
    id: str
    statement: str
    subject: str
    predicate: str
    object: str
    status: str  # "ACTIVE", "DISPUTED", "REFUTED"
    version: str
    confidence: float = 1.0
    metadata: Dict[str, Any] = Field(default_factory=dict)

class RuleNode(BaseModel):
    id: str
    name: str
    description: str
    policy_version: str
    severity: str = "CRITICAL"  # "CRITICAL", "HIGH", "MEDIUM", "LOW"
    mandatory: bool = True
    enabled: bool = True

class InferenceNode(BaseModel):
    id: str
    conclusion: str
    method: str
    status: str
    created_at: str
    context_hash: str

class DecisionNode(BaseModel):
    id: str
    subject: str
    outcome: DecisionOutcome
    policy_version: str
    created_at: str
    evaluation_status: str

class ScenarioNode(BaseModel):
    id: str
    name: str
    scenario_type: str  # "hidden_dependency", "test_failure_injection", "stale_evidence", "version_drift"
    parameters: Dict[str, Any] = Field(default_factory=dict)
    validation_status: str  # "VALIDATED", "REJECTED", "PENDING"
    search_method: str  # "BOUNDED_ENUMERATION", "Z3_SMT"

class CertificateNode(BaseModel):
    id: str
    decision_id: str
    policy_version: str
    verification_level: VerificationLevel
    status: CertificateStatus
    context_hash: str
    created_at: str
    limitations: List[str] = Field(default_factory=list)

class GraphEdge(BaseModel):
    source: str
    target: str
    type: RelationshipType
    properties: Dict[str, Any] = Field(default_factory=dict)
