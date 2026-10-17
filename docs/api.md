# CONTOUR REST API Documentation

All API endpoints are served by the FastAPI backend under `/api`.

---

## 1. System Health

### `GET /api/health`
Checks backend and FalkorDB connectivity.

**Response (200 OK):**
```json
{
  "status": "HEALTHY",
  "graph_db_connected": true,
  "graph_name": "contour_release_graph",
  "node_count": 28,
  "edge_count": 16,
  "version": "1.0.0"
}
```

---

## 2. Demo Seeding & Reset

### `POST /api/demo/seed`
Idempotently resets and populates FalkorDB with the deterministic synthetic software release dataset.

**Response (200 OK):**
```json
{
  "status": "SUCCESS",
  "message": "Seeded 28 nodes and 16 edges into FalkorDB.",
  "nodes_created": 28,
  "edges_created": 16,
  "graph_name": "contour_release_graph"
}
```

---

## 3. Evidence Graph Data

### `GET /api/graph`
Returns all nodes and relationships currently stored in FalkorDB.

**Response (200 OK):**
```json
{
  "nodes": [
    {
      "id": "service:payment-service:v2.4.0",
      "label": "payment-service",
      "type": "Service",
      "properties": { "version": "2.4.0", "critical": true }
    }
  ],
  "edges": [
    {
      "id": "e_0",
      "source": "service:payment-service:v2.4.0",
      "target": "service:auth-service:v1.2.0",
      "type": "DEPENDS_ON",
      "properties": { "critical": true }
    }
  ],
  "total_nodes": 28,
  "total_edges": 16
}
```

---

## 4. Decision Evaluation

### `POST /api/decisions/evaluate`
Compiles candidate context and evaluates release readiness.

**Request:**
```json
{
  "root_entity": "service:payment-service:v2.4.0",
  "policy_id": "policy:release-readiness:v1",
  "policy_version": "1.0.0",
  "context_budget": 5,
  "include_optional": true
}
```

**Response (200 OK):**
```json
{
  "decision_id": "dec-a74e2d3b",
  "subject": "service:payment-service:v2.4.0",
  "outcome": "APPROVE",
  "evaluation_status": "EVALUATED",
  "constraints": [
    {
      "rule_id": "RULE_CRIT_DEP_COMPAT",
      "rule_name": "Critical Dependency Compatibility",
      "mandatory": true,
      "passed": true,
      "status": "PASSED",
      "explanation": "All 2 critical dependencies are verified compatible."
    }
  ],
  "selected_evidence_ids": ["ev:payment:unit-tests-01", "ev:auth:compat-pass", "..."],
  "omitted_evidence_ids": ["ev:fraud-detection:compat-fail", "..."],
  "context_cost": {
    "selected_evidence_count": 5,
    "total_graph_evidence_count": 10,
    "reduction_percentage": 50.0,
    "estimated_token_count": 180
  },
  "context_hash": "a9f8...c1e"
}
```

---

## 5. Counterexample Search

### `POST /api/counterexamples/search`
Searches declared finite scenarios in isolated memory and verifies with Z3 SMT solver.

**Request:**
```json
{
  "decision_id": "dec-a74e2d3b",
  "max_scenarios": 20,
  "include_formal_solver": true
}
```

**Response (200 OK):**
```json
{
  "search_status": "COUNTEREXAMPLE_FOUND",
  "scenarios_tested": 6,
  "counterexamples_found": [
    {
      "scenario_id": "SCN_HIDDEN_DEP_INCOMPAT",
      "scenario_name": "Hidden Incompatible Critical Dependency",
      "scenario_type": "hidden_dependency",
      "baseline_decision": "APPROVE",
      "scenario_decision": "BLOCK",
      "policy_constraints_affected": ["RULE_CRIT_DEP_COMPAT"],
      "search_method": "BOUNDED_ENUMERATION + Z3_FORMAL_PROVED",
      "dependency_path": ["service:payment-service:v2.4.0", "service:fraud-detection:v1.5.0", "..."]
    }
  ],
  "duration_ms": 14.2
}
```

---

## 6. Context Repair

### `POST /api/context/repair`
Incorporates counterexample dependency path into context and re-evaluates decision.

**Request:**
```json
{
  "decision_id": "dec-a74e2d3b",
  "counterexample_id": "SCN_HIDDEN_DEP_INCOMPAT"
}
```

**Response (200 OK):**
```json
{
  "repair_id": "repair-31b4e2",
  "decision_id": "dec-a74e2d3b",
  "previous_outcome": "APPROVE",
  "revised_outcome": "BLOCK",
  "added_evidence_ids": ["ev:fraud-detection:compat-fail"],
  "certificate_id": "cert-8f92a1c"
}
```

---

## 7. Verification Certificate

### `GET /api/certificates/{certificate_id}`
Retrieves persisted audit certificate.
