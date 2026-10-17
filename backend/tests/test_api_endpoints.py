import pytest
from starlette.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_api_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert "status" in data
    assert data["graph_db_connected"] is True

def test_api_seed():
    res = client.post("/api/demo/seed")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "SUCCESS"
    assert data["nodes_created"] > 0

def test_api_graph():
    res = client.get("/api/graph")
    assert res.status_code == 200
    data = res.json()
    assert "nodes" in data
    assert "edges" in data
    assert len(data["nodes"]) > 0

def test_api_evaluate_and_counterexample_search():
    # 1. Evaluate
    eval_res = client.post("/api/decisions/evaluate", json={
        "root_entity": "service:payment-service:v2.4.0",
        "policy_id": "policy:release-readiness:v1",
        "policy_version": "1.0.0",
        "context_budget": 5
    })
    assert eval_res.status_code == 200
    eval_data = eval_res.json()
    decision_id = eval_data["decision_id"]
    assert eval_data["outcome"] == "APPROVE"

    # 2. Counterexample search
    cex_res = client.post("/api/counterexamples/search", json={
        "decision_id": decision_id,
        "max_scenarios": 10,
        "include_formal_solver": True
    })
    assert cex_res.status_code == 200
    cex_data = cex_res.json()
    assert cex_data["search_status"] == "COUNTEREXAMPLE_FOUND"
    assert len(cex_data["counterexamples_found"]) > 0
    candidate = cex_data["counterexamples_found"][0]

    # 3. Repair context
    repair_res = client.post("/api/context/repair", json={
        "decision_id": decision_id,
        "counterexample_id": candidate["scenario_id"]
    })
    assert repair_res.status_code == 200
    repair_data = repair_res.json()
    assert repair_data["previous_outcome"] == "APPROVE"
    assert repair_data["revised_outcome"] == "BLOCK"
    cert_id = repair_data["certificate_id"]

    # 4. Get certificate
    cert_res = client.get(f"/api/certificates/{cert_id}")
    assert cert_res.status_code == 200
    cert_data = cert_res.json()
    assert cert_data["certificate_id"] == cert_id
    assert cert_data["final_decision"] == "BLOCK"
