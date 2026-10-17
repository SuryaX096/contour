import pytest
from app.models.entities import DecisionOutcome, SearchOutcome
from app.decision.policy import DEFAULT_RELEASE_POLICY
from app.verification.counterexamples import CounterexampleEngine
from app.graph.repository import GraphRepository

def test_counterexample_engine_discovers_hidden_dependency():
    repo = GraphRepository()
    engine = CounterexampleEngine(repo)

    # Initial context without fraud-detection
    deps = [
        {"id": "service:auth-service:v1.2.0", "name": "auth-service", "critical": True, "depth": 1},
        {"id": "service:ledger-db:v3.1.0", "name": "ledger-db", "critical": True, "depth": 1}
    ]
    evidence = [
        {"id": "ev:payment:unit-tests-01", "title": "Unit tests", "source_type": "unit_test", "status": "PASSED", "validity_status": "VALID", "metadata": {"target_id": "service:payment-service:v2.4.0"}},
        {"id": "ev:payment:sec-audit-01", "title": "Sec audit", "source_type": "security_scan", "status": "PASSED", "validity_status": "VALID", "metadata": {"target_id": "service:payment-service:v2.4.0"}},
        {"id": "ev:auth:compat-pass", "title": "Auth compat", "source_type": "compat_check", "status": "PASSED", "validity_status": "VALID", "metadata": {"target_id": "service:auth-service:v1.2.0"}},
        {"id": "ev:ledger:compat-pass", "title": "Ledger compat", "source_type": "compat_check", "status": "PASSED", "validity_status": "VALID", "metadata": {"target_id": "service:ledger-db:v3.1.0"}}
    ]
    rel = [
        {"source": "ev:payment:unit-tests-01", "target": "service:payment-service:v2.4.0", "type": "SUPPORTS"},
        {"source": "ev:payment:sec-audit-01", "target": "service:payment-service:v2.4.0", "type": "SUPPORTS"},
        {"source": "ev:auth:compat-pass", "target": "service:auth-service:v1.2.0", "type": "SUPPORTS"},
        {"source": "ev:ledger:compat-pass", "target": "service:ledger-db:v3.1.0", "type": "SUPPORTS"}
    ]

    res = engine.search(
        root_service_id="service:payment-service:v2.4.0",
        policy=DEFAULT_RELEASE_POLICY,
        baseline_decision=DecisionOutcome.APPROVE,
        current_dependencies=deps,
        current_evidence=evidence,
        current_relationships=rel,
        max_scenarios=10,
        include_formal_solver=True
    )

    assert res.search_status == SearchOutcome.COUNTEREXAMPLE_FOUND
    assert len(res.counterexamples_found) > 0
    hidden_dep_cex = next((c for c in res.counterexamples_found if c.scenario_id == "SCN_HIDDEN_DEP_INCOMPAT"), None)
    assert hidden_dep_cex is not None
    assert hidden_dep_cex.baseline_decision == DecisionOutcome.APPROVE
    assert hidden_dep_cex.scenario_decision == DecisionOutcome.BLOCK
    assert "RULE_CRIT_DEP_COMPAT" in hidden_dep_cex.policy_constraints_affected
