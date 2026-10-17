# CONTOUR — Application Security & Privacy Specification

This document details the security architecture, threat model, input validation, and privacy controls implemented in **CONTOUR** (Graph-native Decision Reliability Compiler).

---

## 1. Threat Model & Security Posture

CONTOUR operates as an analytical reliability compiler evaluating decision graphs. Its primary security boundaries are:

1. **Graph Query Engine (FalkorDB)**: Protection against Cypher injection, unauthorized graph mutations, and denial-of-service via unbounded traversals.
2. **REST API Interface (FastAPI)**: Strict Pydantic v2 schema enforcement, input sanitization, and controlled CORS boundaries.
3. **Formal Solver Execution (Z3 SMT)**: Bounded logic evaluation preventing infinite solver loop conditions.
4. **Data Privacy & Telemetry**: Zero leakage of sensitive environment variables, tokens, or customer data.

---

## 2. Cypher Injection Prevention

### Strict Parameterization
All graph queries executed against FalkorDB strictly use parameterized variables (`$id`, `$target_id`, `$root_id`, etc.) via the native FalkorDB Python driver dictionary parameters. No user or dynamic string interpolation is permitted in Cypher query templates.

### Whitelisted Relationship Semantics
Because Cypher syntax does not natively allow parameterizing relationship types, dynamic relationship insertion uses a static, strictly whitelisted lookup table:

```python
RELATIONSHIP_QUERY_TEMPLATES = {
    "SUPPORTS": "MATCH (a {id: $source_id}), (b {id: $target_id}) MERGE (a)-[r:SUPPORTS]->(b) SET r.created_at = $created_at RETURN r",
    "CONTRADICTS": "MATCH (a {id: $source_id}), (b {id: $target_id}) MERGE (a)-[r:CONTRADICTS]->(b) SET r.created_at = $created_at, r.reason = $reason RETURN r",
    "DEPENDS_ON": "MATCH (a {id: $source_id}), (b {id: $target_id}) MERGE (a)-[r:DEPENDS_ON]->(b) SET r.critical = $critical, r.min_version = $min_version RETURN r",
    ...
}
```

Any relationship type not explicitly defined in the enum is rejected before reaching the database.

---

## 3. Network Boundaries & Port Hardening

### Local Loopback Isolation
In `docker-compose.yml`, the FalkorDB database port is bound to the loopback interface (`127.0.0.1:6379:6379`), preventing unauthorized external access from untrusted local area networks (LAN / Wi-Fi).

### CORS Policy
The FastAPI backend enforces explicit origin validation for local development and containerized frontends:
* `http://localhost:5173` (Vite dev server)
* `http://127.0.0.1:5173`
* `http://localhost:8000` (FastAPI backend / Swagger UI)
* `http://127.0.0.1:8000`

---

## 4. Input Validation & Execution Boundaries

* **Pydantic v2 Schema Enforcement**: Every HTTP request body (`EvaluateDecisionRequest`, `CounterexampleSearchRequest`, `ContextRepairRequest`) is strictly validated. Unrecognized or malformed inputs return standard HTTP 422 Unprocessable Entity responses.
* **Zero Arbitrary Execution**: Ingested JSON release payloads, claims, and policy rules are strictly parsed as declarative data structures. No `eval()`, `exec()`, or dynamic subprocess execution exists in the decision pipeline.
* **Bounded SMT Solver Execution**: The Microsoft Z3 Theorem Prover evaluates bounded first-order propositional constraints with explicit timeout and iteration ceilings.

---

## 5. Secret Hygiene & Privacy Compliance

* **Tracked File Scanning**: Automated regex scans across all tracked files confirm **zero** committed API keys, passwords, bearer tokens, or private certificates.
* **Git History Cleanliness**: Diff inspection across all Git commits verifies no credentials or `.env` files were committed in previous revisions.
* **Synthetic Data Verification**: The primary demonstration dataset (`data/synthetic_release_data.json`) contains fictional microservice architectures (`payment-service`, `auth-service`, `fraud-detection`). No real corporate identities, customer PII, or proprietary codebases are present.
* **Structured JSON Logging**: Logs emitted via `backend/app/core/logging.py` are structured in JSON format and omit request authorization tokens or raw credential strings.
