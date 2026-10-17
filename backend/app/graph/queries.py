"""
Parameterized Cypher Queries for CONTOUR Graph Operations.
All queries strictly use parameters to prevent Cypher injection.
"""

# Node creation / upsert
UPSERT_SERVICE = """
MERGE (s:Service {id: $id})
SET s.name = $name,
    s.version = $version,
    s.critical = $critical,
    s.metadata = $metadata
RETURN s
"""

UPSERT_EVIDENCE = """
MERGE (e:Evidence {id: $id})
SET e.title = $title,
    e.source_id = $source_id,
    e.source_type = $source_type,
    e.timestamp = $timestamp,
    e.version = $version,
    e.status = $status,
    e.payload = $payload,
    e.validity_status = $validity_status,
    e.metadata = $metadata
RETURN e
"""

UPSERT_CLAIM = """
MERGE (c:Claim {id: $id})
SET c.statement = $statement,
    c.subject = $subject,
    c.predicate = $predicate,
    c.object = $object,
    c.status = $status,
    c.version = $version,
    c.confidence = $confidence,
    c.metadata = $metadata
RETURN c
"""

UPSERT_RULE = """
MERGE (r:Rule {id: $id})
SET r.name = $name,
    r.description = $description,
    r.policy_version = $policy_version,
    r.severity = $severity,
    r.mandatory = $mandatory,
    r.enabled = $enabled
RETURN r
"""

UPSERT_DECISION = """
MERGE (d:Decision {id: $id})
SET d.subject = $subject,
    d.outcome = $outcome,
    d.policy_version = $policy_version,
    d.created_at = $created_at,
    d.evaluation_status = $evaluation_status,
    d.context_hash = $context_hash
RETURN d
"""

UPSERT_SCENARIO = """
MERGE (s:Scenario {id: $id})
SET s.name = $name,
    s.scenario_type = $scenario_type,
    s.parameters = $parameters,
    s.validation_status = $validation_status,
    s.search_method = $search_method
RETURN s
"""

UPSERT_CERTIFICATE = """
MERGE (cert:Certificate {id: $id})
SET cert.decision_id = $decision_id,
    cert.policy_version = $policy_version,
    cert.verification_level = $verification_level,
    cert.status = $status,
    cert.context_hash = $context_hash,
    cert.created_at = $created_at,
    cert.limitations = $limitations
RETURN cert
"""

# Dynamic relationship upsert
# Note: Cypher doesn't allow parameterizing relationship types directly, so we map known types securely
RELATIONSHIP_QUERY_TEMPLATES = {
    "SUPPORTS": "MATCH (a {id: $source_id}), (b {id: $target_id}) MERGE (a)-[r:SUPPORTS]->(b) SET r.created_at = $created_at RETURN r",
    "CONTRADICTS": "MATCH (a {id: $source_id}), (b {id: $target_id}) MERGE (a)-[r:CONTRADICTS]->(b) SET r.created_at = $created_at, r.reason = $reason RETURN r",
    "DEPENDS_ON": "MATCH (a {id: $source_id}), (b {id: $target_id}) MERGE (a)-[r:DEPENDS_ON]->(b) SET r.critical = $critical, r.min_version = $min_version RETURN r",
    "GOVERNED_BY": "MATCH (a {id: $source_id}), (b {id: $target_id}) MERGE (a)-[r:GOVERNED_BY]->(b) SET r.created_at = $created_at RETURN r",
    "DERIVED_FROM": "MATCH (a {id: $source_id}), (b {id: $target_id}) MERGE (a)-[r:DERIVED_FROM]->(b) SET r.created_at = $created_at RETURN r",
    "TESTED_UNDER": "MATCH (a {id: $source_id}), (b {id: $target_id}) MERGE (a)-[r:TESTED_UNDER]->(b) SET r.environment = $environment RETURN r",
    "INVALIDATES": "MATCH (a {id: $source_id}), (b {id: $target_id}) MERGE (a)-[r:INVALIDATES]->(b) SET r.created_at = $created_at RETURN r",
    "REQUIRES": "MATCH (a {id: $source_id}), (b {id: $target_id}) MERGE (a)-[r:REQUIRES]->(b) SET r.constraint = $constraint RETURN r",
    "PRODUCES": "MATCH (a {id: $source_id}), (b {id: $target_id}) MERGE (a)-[r:PRODUCES]->(b) SET r.created_at = $created_at RETURN r",
    "REPAIRS": "MATCH (a {id: $source_id}), (b {id: $target_id}) MERGE (a)-[r:REPAIRS]->(b) SET r.iteration = $iteration RETURN r"
}

# Graph Querying
GET_ALL_NODES = """
MATCH (n)
RETURN labels(n) as labels, properties(n) as properties
"""

GET_ALL_EDGES = """
MATCH (a)-[r]->(b)
RETURN a.id as source, b.id as target, type(r) as type, properties(r) as properties
"""

GET_SERVICE_DEPENDENCIES = """
MATCH (svc:Service {id: $service_id})-[r:DEPENDS_ON*1..4]->(dep:Service)
RETURN svc.id as source, dep.id as dependency, dep.name as name, dep.version as version, dep.critical as critical
"""

GET_EVIDENCE_FOR_SERVICE = """
MATCH (e:Evidence)-[r:SUPPORTS|CONTRADICTS|TESTED_UNDER]->(target)
WHERE target.id = $target_id OR target.id STARTS WITH $target_prefix
RETURN e, type(r) as rel_type, target.id as target_id
"""

FIND_DEPENDENCY_PATHS = """
MATCH path = (root:Service {id: $root_id})-[r:DEPENDS_ON*1..4]->(dep:Service)
OPTIONAL MATCH (e:Evidence)-[er:SUPPORTS|CONTRADICTS]->(dep)
RETURN path, dep.id as dep_id, collect(e) as evidence_list
"""

CHECK_CONFLICTING_EVIDENCE = """
MATCH (e1:Evidence)-[:SUPPORTS]->(target), (e2:Evidence)-[:CONTRADICTS]->(target)
RETURN target.id as target_id, e1.id as supporting_id, e2.id as contradicting_id, e1.status as s1, e2.status as s2
"""
