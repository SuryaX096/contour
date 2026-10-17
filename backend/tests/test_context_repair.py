import pytest
from app.models.entities import DecisionOutcome
from app.models.api import EvaluateDecisionRequest
from app.services.decision_service import decision_service
from app.services.repair_service import repair_service

def test_context_repair_transitions_decision():
    # 1. Evaluate baseline with shallow budget
    eval_req = EvaluateDecisionRequest(
        root_entity="service:payment-service:v2.4.0",
        policy_id="policy:release-readiness:v1",
        policy_version="1.0.0",
        context_budget=5
    )
    baseline_res = decision_service.evaluate_decision(eval_req)
    assert baseline_res.outcome == DecisionOutcome.APPROVE

    # 2. Repair context using the hidden dependency counterexample
    repair_res = repair_service.repair_context(
        decision_id=baseline_res.decision_id,
        counterexample_id="SCN_HIDDEN_DEP_INCOMPAT"
    )

    assert repair_res.previous_outcome == DecisionOutcome.APPROVE
    assert repair_res.revised_outcome == DecisionOutcome.BLOCK
    assert len(repair_res.added_evidence_ids) > 0
    assert len(repair_res.repair_trace) >= 3
    assert repair_res.certificate_id is not None
