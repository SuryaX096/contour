# FalkorDB Graph Schema Specification

## 1. Node Types & Properties

### 1.1 `:Service`
Represents an architectural service or release artifact.
- `id` (STRING, Unique Index): E.g. `service:payment-service:v2.4.0`
- `name` (STRING): E.g. `payment-service`
- `version` (STRING): E.g. `2.4.0`
- `critical` (BOOLEAN): Flag indicating tier-1 critical status
- `metadata` (STRING, JSON-serialized): Additional repository or tier details

### 1.2 `:Evidence`
Discrete factual record of verification or test execution.
- `id` (STRING, Unique Index): E.g. `ev:payment:unit-tests-01`
- `title` (STRING): Descriptive summary
- `source_id` (STRING): Originating service or test runner
- `source_type` (STRING): `unit_test`, `integration_test`, `security_scan`, `compat_check`, `perf_check`
- `timestamp` (STRING): ISO-8601 UTC timestamp
- `version` (STRING): Release version targeted
- `status` (STRING): `PASSED`, `FAILED`, `COMPATIBLE`, `INCOMPATIBLE`, `UNKNOWN`
- `payload` (STRING, JSON-serialized): Concrete metrics, test counts, coverage, breaking changes
- `validity_status` (STRING): `VALID`, `STALE`, `DISPUTED`, `INVALID`
- `metadata` (STRING, JSON-serialized): Target entity IDs, severity flags

### 1.3 `:Claim`
Assertion made by agents or services regarding compatibility or compliance.
- `id` (STRING, Unique Index): E.g. `claim:payment:compat-auth`
- `statement` (STRING): Natural language assertion
- `subject` (STRING): Subject entity ID
- `predicate` (STRING): Relationship or predicate name
- `object` (STRING): Object entity ID
- `status` (STRING): `ACTIVE`, `DISPUTED`, `REFUTED`
- `version` (STRING): Claim version
- `confidence` (FLOAT): Confidence score $[0.0, 1.0]$

### 1.4 `:Rule`
Explicit policy constraint governing release decisions.
- `id` (STRING, Unique Index): E.g. `RULE_CRIT_DEP_COMPAT`
- `name` (STRING): Human-readable name
- `description` (STRING): Detailed rule statement
- `policy_version` (STRING): E.g. `1.0.0`
- `severity` (STRING): `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`
- `mandatory` (BOOLEAN): Whether violation triggers mandatory BLOCK
- `enabled` (BOOLEAN): Rule active flag

### 1.5 `:Decision`
Auditable record of a policy evaluation result.
- `id` (STRING, Unique Index): E.g. `dec-7f28a9b1c3e4`
- `subject` (STRING): Target entity evaluated
- `outcome` (STRING): `APPROVE`, `BLOCK`, `INSUFFICIENT_EVIDENCE`
- `policy_version` (STRING): Version of policy evaluated
- `created_at` (STRING): ISO-8601 evaluation timestamp
- `evaluation_status` (STRING): `COMPLETED`, `REVISED`
- `context_hash` (STRING): SHA-256 hash of evaluated context

### 1.6 `:Scenario`
Declared counterexample scenario in bounded search space.
- `id` (STRING, Unique Index): E.g. `SCN_HIDDEN_DEP_INCOMPAT`
- `name` (STRING): Scenario title
- `scenario_type` (STRING): `hidden_dependency`, `stale_evidence`, `test_failure`
- `parameters` (STRING, JSON-serialized): Injected properties
- `validation_status` (STRING): `VALIDATED`, `REJECTED`
- `search_method` (STRING): Search algorithm applied

### 1.7 `:Certificate`
Cryptographically auditable verification certificate node.
- `id` (STRING, Unique Index): E.g. `cert-9a8b7c6d5e4f`
- `decision_id` (STRING): Reference to `:Decision`
- `policy_version` (STRING): Version applied
- `verification_level` (STRING): Verification tier
- `status` (STRING): Certificate outcome
- `context_hash` (STRING): Context hash
- `created_at` (STRING): ISO timestamp
- `limitations` (STRING, JSON-serialized): Array of declared boundaries

---

## 2. Relationships

| Relationship Type | Source Node | Target Node | Semantics & Properties |
|---|---|---|---|
| `DEPENDS_ON` | `:Service` | `:Service` | Architectural service dependency (`critical: bool`, `min_version: str`) |
| `SUPPORTS` | `:Evidence` / `:Claim` | `:Service` / `:Decision` | Factual record supporting approval or compatibility |
| `CONTRADICTS` | `:Evidence` / `:Claim` | `:Service` / `:Decision` | Record refuting compatibility or blocking release (`reason: str`) |
| `GOVERNED_BY` | `:Decision` | `:Rule` / `:Policy` | Links decision to governing policy rules |
| `TESTED_UNDER` | `:Evidence` | `:Service` | Documents runtime test environment (`environment: str`) |
| `REPAIRS` | `:Scenario` | `:Decision` | Tracks counterexample-guided context repair (`iteration: int`) |
| `PRODUCES` | `:Decision` | `:Certificate` | Associates audit certificate with decision |

---

## 3. Graph Integrity Rules

1. **Parameterized Cypher Execution**: All mutations and queries use parameterized variables ($id, $title, etc.) to guarantee prevention of injection.
2. **Idempotent Merge**: Nodes and relationships use Cypher `MERGE` on unique IDs to prevent duplicate nodes.
3. **No Silent Overwrites**: When conflicting evidence is ingested, it is preserved as an explicit contradictory edge rather than overwriting existing records.
