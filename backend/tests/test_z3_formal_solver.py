import pytest
from app.verification.solver import Z3ReleaseSolver

def test_z3_solver_proves_counterexample_incompatibility():
    scenario_params = {
        "service_id": "service:fraud-detection:v1.5.0",
        "evidence_status": "INCOMPATIBLE",
        "scenario_type": "hidden_dependency"
    }
    res = Z3ReleaseSolver.verify_scenario_counterexample(
        baseline_decision="APPROVE",
        scenario_params=scenario_params,
        dependencies=[],
        evidence_items=[]
    )
    assert res.status == "SAT"
    assert "formally verified" in res.proof_statement.lower()
    assert res.counterexample_model is not None
    assert res.counterexample_model["approve"] is False

def test_z3_solver_no_violation_on_nominal_scenario():
    scenario_params = {
        "scenario_type": "no_change"
    }
    res = Z3ReleaseSolver.verify_scenario_counterexample(
        baseline_decision="APPROVE",
        scenario_params=scenario_params,
        dependencies=[],
        evidence_items=[]
    )
    assert res.status == "UNSAT"
    assert "does not violate" in res.proof_statement.lower()
