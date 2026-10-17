import pytest
from app.models.entities import DecisionOutcome
from app.decision.policy import DEFAULT_RELEASE_POLICY
from app.decision.evaluator import DecisionEvaluator

def test_policy_approve_outcome():
    deps = [
        {"id": "dep:auth", "name": "auth", "critical": True, "depth": 1}
    ]
    evidence = [
        {"id": "e1", "title": "Unit tests", "source_type": "unit_test", "status": "PASSED", "validity_status": "VALID", "metadata": {"target_id": "svc:main"}},
        {"id": "e2", "title": "Security check", "source_type": "security_scan", "status": "PASSED", "validity_status": "VALID", "metadata": {"target_id": "svc:main"}},
        {"id": "e3", "title": "Auth compat", "source_type": "compat_check", "status": "PASSED", "validity_status": "VALID", "metadata": {"target_id": "dep:auth"}}
    ]
    relationships = [
        {"source": "e1", "target": "svc:main", "type": "SUPPORTS"},
        {"source": "e2", "target": "svc:main", "type": "SUPPORTS"},
        {"source": "e3", "target": "dep:auth", "type": "SUPPORTS"}
    ]

    outcome, constraints = DecisionEvaluator.evaluate(
        root_service_id="svc:main",
        policy=DEFAULT_RELEASE_POLICY,
        dependencies=deps,
        evidence_items=evidence,
        relationships=relationships
    )
    assert outcome == DecisionOutcome.APPROVE
    assert all(c.passed for c in constraints if c.mandatory)

def test_policy_block_outcome_on_failed_test():
    deps = [{"id": "dep:auth", "name": "auth", "critical": True, "depth": 1}]
    evidence = [
        {"id": "e1", "title": "Unit tests", "source_type": "unit_test", "status": "FAILED", "validity_status": "VALID", "metadata": {"target_id": "svc:main"}},
        {"id": "e2", "title": "Security check", "source_type": "security_scan", "status": "PASSED", "validity_status": "VALID", "metadata": {"target_id": "svc:main"}},
        {"id": "e3", "title": "Auth compat", "source_type": "compat_check", "status": "PASSED", "validity_status": "VALID", "metadata": {"target_id": "dep:auth"}}
    ]
    relationships = [{"source": "e1", "target": "svc:main", "type": "SUPPORTS"}]

    outcome, constraints = DecisionEvaluator.evaluate(
        root_service_id="svc:main",
        policy=DEFAULT_RELEASE_POLICY,
        dependencies=deps,
        evidence_items=evidence,
        relationships=relationships
    )
    assert outcome == DecisionOutcome.BLOCK

def test_policy_insufficient_evidence_on_missing_security_audit():
    deps = [{"id": "dep:auth", "name": "auth", "critical": True, "depth": 1}]
    evidence = [
        {"id": "e1", "title": "Unit tests", "source_type": "unit_test", "status": "PASSED", "validity_status": "VALID", "metadata": {"target_id": "svc:main"}},
        {"id": "e3", "title": "Auth compat", "source_type": "compat_check", "status": "PASSED", "validity_status": "VALID", "metadata": {"target_id": "dep:auth"}}
    ]
    relationships = [{"source": "e1", "target": "svc:main", "type": "SUPPORTS"}]

    outcome, constraints = DecisionEvaluator.evaluate(
        root_service_id="svc:main",
        policy=DEFAULT_RELEASE_POLICY,
        dependencies=deps,
        evidence_items=evidence,
        relationships=relationships
    )
    assert outcome == DecisionOutcome.INSUFFICIENT_EVIDENCE

def test_policy_stale_evidence_handling():
    deps = [{"id": "dep:auth", "name": "auth", "critical": True, "depth": 1}]
    evidence = [
        {"id": "e1", "title": "Unit tests", "source_type": "unit_test", "status": "PASSED", "validity_status": "STALE", "metadata": {"target_id": "svc:main"}},
        {"id": "e2", "title": "Security check", "source_type": "security_scan", "status": "PASSED", "validity_status": "VALID", "metadata": {"target_id": "svc:main"}},
        {"id": "e3", "title": "Auth compat", "source_type": "compat_check", "status": "PASSED", "validity_status": "VALID", "metadata": {"target_id": "dep:auth"}}
    ]
    relationships = []

    outcome, constraints = DecisionEvaluator.evaluate(
        root_service_id="svc:main",
        policy=DEFAULT_RELEASE_POLICY,
        dependencies=deps,
        evidence_items=evidence,
        relationships=relationships
    )
    assert outcome == DecisionOutcome.BLOCK
    stale_constraint = next(c for c in constraints if c.rule_id == "RULE_NO_STALE_EVIDENCE")
    assert not stale_constraint.passed
