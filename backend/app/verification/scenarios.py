"""
Deterministic Scenario Space and Generators for CONTOUR.
Defines explicit counterexample scenarios including hidden dependencies,
stale evidence, test failures, and version drift.
"""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel

class ScenarioDefinition(BaseModel):
    id: str
    name: str
    scenario_type: str
    description: str
    parameters: Dict[str, Any]
    target_dependency_id: Optional[str] = None
    target_evidence_id: Optional[str] = None

PREDEFINED_SCENARIOS: List[ScenarioDefinition] = [
    ScenarioDefinition(
        id="SCN_HIDDEN_DEP_INCOMPAT",
        name="Hidden Incompatible Critical Dependency",
        scenario_type="hidden_dependency",
        description="Critical dependency omitted from initial context is discovered to be incompatible.",
        parameters={
            "service_id": "service:fraud-detection:v1.5.0",
            "service_name": "fraud-detection",
            "critical": True,
            "evidence_id": "ev:fraud-detection:compat-fail",
            "evidence_status": "INCOMPATIBLE",
            "source_type": "compat_check"
        },
        target_dependency_id="service:fraud-detection:v1.5.0",
        target_evidence_id="ev:fraud-detection:compat-fail"
    ),
    ScenarioDefinition(
        id="SCN_STALE_SECURITY_AUDIT",
        name="Security Audit Validity Expiration",
        scenario_type="stale_evidence",
        description="Security vulnerability scan timestamp exceeds freshness SLA, marking evidence STALE.",
        parameters={
            "evidence_id": "ev:payment:sec-audit-01",
            "validity_status": "STALE"
        },
        target_evidence_id="ev:payment:sec-audit-01"
    ),
    ScenarioDefinition(
        id="SCN_TEST_FAILURE_INJECTION",
        name="Mandatory Integration Test Failure",
        scenario_type="test_failure",
        description="Core integration test suite encounters an unhandled regression and fails.",
        parameters={
            "evidence_id": "ev:payment:integration-01",
            "status": "FAILED"
        },
        target_evidence_id="ev:payment:integration-01"
    ),
    ScenarioDefinition(
        id="SCN_TRANSITIVE_CONFLICT",
        name="Contradictory Compatibility Records",
        scenario_type="conflict",
        description="A secondary compatibility check directly contradicts an earlier passing claim.",
        parameters={
            "target_service": "service:ledger-db:v3.1.0",
            "conflicting_evidence_id": "ev:ledger-db:conflict-01",
            "status": "FAILED"
        },
        target_dependency_id="service:ledger-db:v3.1.0"
    ),
    ScenarioDefinition(
        id="SCN_UNKNOWN_DEP_COMPAT",
        name="Unverified Critical Dependency Compatibility",
        scenario_type="unknown_state",
        description="Critical dependency compatibility status is UNKNOWN, which policy forbids treating as compatible.",
        parameters={
            "service_id": "service:auth-service:v1.2.0",
            "status": "UNKNOWN"
        },
        target_dependency_id="service:auth-service:v1.2.0"
    ),
    ScenarioDefinition(
        id="SCN_NO_CHANGE_BASELINE",
        name="Nominal Passing Scenario",
        scenario_type="no_change",
        description="All evidence and dependencies remain compliant with release policy.",
        parameters={}
    )
]

class ScenarioRegistry:
    @staticmethod
    def get_all() -> List[ScenarioDefinition]:
        return PREDEFINED_SCENARIOS

    @staticmethod
    def get_by_id(scenario_id: str) -> Optional[ScenarioDefinition]:
        for s in PREDEFINED_SCENARIOS:
            if s.id == scenario_id:
                return s
        return None
