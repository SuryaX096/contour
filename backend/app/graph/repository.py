import json
from typing import Any, Dict, List, Optional, Tuple
from falkordb import FalkorDB
from app.core.config import settings
from app.core.logging import logger
from app.graph.schema import INDEX_QUERIES
from app.graph.queries import (
    UPSERT_SERVICE,
    UPSERT_EVIDENCE,
    UPSERT_CLAIM,
    UPSERT_RULE,
    UPSERT_DECISION,
    UPSERT_SCENARIO,
    UPSERT_CERTIFICATE,
    RELATIONSHIP_QUERY_TEMPLATES,
    GET_ALL_NODES,
    GET_ALL_EDGES,
    GET_SERVICE_DEPENDENCIES,
    GET_EVIDENCE_FOR_SERVICE,
    FIND_DEPENDENCY_PATHS,
    CHECK_CONFLICTING_EVIDENCE
)

class GraphRepository:
    def __init__(self, host: Optional[str] = None, port: Optional[int] = None, graph_name: Optional[str] = None):
        self.host = host or settings.falkordb_host
        self.port = port or settings.falkordb_port
        self.graph_name = graph_name or settings.falkordb_graph_name
        self._client: Optional[FalkorDB] = None
        self._graph = None

    def get_client(self) -> FalkorDB:
        if self._client is None:
            self._client = FalkorDB(host=self.host, port=self.port)
        return self._client

    def get_graph(self):
        if self._graph is None:
            client = self.get_client()
            self._graph = client.select_graph(self.graph_name)
        return self._graph

    def is_connected(self) -> bool:
        try:
            client = self.get_client()
            client.connection.ping()
            return True
        except Exception as e:
            logger.warning(f"FalkorDB connectivity check failed: {e}")
            return False

    def reset_graph(self) -> None:
        """Deletes the graph and recreates necessary indices."""
        try:
            g = self.get_graph()
            try:
                g.delete()
            except Exception:
                pass  # Graph might not exist yet
            self._graph = None
            g = self.get_graph()
            for idx_query in INDEX_QUERIES:
                try:
                    g.query(idx_query)
                except Exception as e:
                    logger.debug(f"Index query info: {e}")
            logger.info(f"Graph '{self.graph_name}' reset and indices initialized successfully.")
        except Exception as e:
            logger.error(f"Error resetting graph: {e}")
            raise

    def query(self, cypher: str, params: Optional[Dict[str, Any]] = None):
        g = self.get_graph()
        return g.query(cypher, params or {})

    def upsert_service(self, service_id: str, name: str, version: str, critical: bool = False, metadata: Optional[Dict[str, Any]] = None):
        params = {
            "id": service_id,
            "name": name,
            "version": version,
            "critical": critical,
            "metadata": json.dumps(metadata or {})
        }
        return self.query(UPSERT_SERVICE, params)

    def upsert_evidence(self, evidence: Dict[str, Any]):
        params = {
            "id": evidence["id"],
            "title": evidence.get("title", ""),
            "source_id": evidence.get("source_id", ""),
            "source_type": evidence.get("source_type", "test"),
            "timestamp": evidence.get("timestamp", ""),
            "version": evidence.get("version", "1.0.0"),
            "status": evidence.get("status", "PASSED"),
            "payload": json.dumps(evidence.get("payload", {})),
            "validity_status": evidence.get("validity_status", "VALID"),
            "metadata": json.dumps(evidence.get("metadata", {}))
        }
        return self.query(UPSERT_EVIDENCE, params)

    def upsert_claim(self, claim: Dict[str, Any]):
        params = {
            "id": claim["id"],
            "statement": claim.get("statement", ""),
            "subject": claim.get("subject", ""),
            "predicate": claim.get("predicate", ""),
            "object": claim.get("object", ""),
            "status": claim.get("status", "ACTIVE"),
            "version": claim.get("version", "1.0.0"),
            "confidence": float(claim.get("confidence", 1.0)),
            "metadata": json.dumps(claim.get("metadata", {}))
        }
        return self.query(UPSERT_CLAIM, params)

    def upsert_rule(self, rule: Dict[str, Any]):
        params = {
            "id": rule["id"],
            "name": rule.get("name", ""),
            "description": rule.get("description", ""),
            "policy_version": rule.get("policy_version", "1.0.0"),
            "severity": rule.get("severity", "CRITICAL"),
            "mandatory": bool(rule.get("mandatory", True)),
            "enabled": bool(rule.get("enabled", True))
        }
        return self.query(UPSERT_RULE, params)

    def upsert_decision(self, decision: Dict[str, Any]):
        params = {
            "id": decision["id"],
            "subject": decision.get("subject", ""),
            "outcome": decision.get("outcome", "BLOCK"),
            "policy_version": decision.get("policy_version", "1.0.0"),
            "created_at": decision.get("created_at", ""),
            "evaluation_status": decision.get("evaluation_status", "EVALUATED"),
            "context_hash": decision.get("context_hash", "")
        }
        return self.query(UPSERT_DECISION, params)

    def upsert_scenario(self, scenario: Dict[str, Any]):
        params = {
            "id": scenario["id"],
            "name": scenario.get("name", ""),
            "scenario_type": scenario.get("scenario_type", "hidden_dependency"),
            "parameters": json.dumps(scenario.get("parameters", {})),
            "validation_status": scenario.get("validation_status", "VALIDATED"),
            "search_method": scenario.get("search_method", "BOUNDED_ENUMERATION")
        }
        return self.query(UPSERT_SCENARIO, params)

    def upsert_certificate(self, cert: Dict[str, Any]):
        params = {
            "id": cert["id"],
            "decision_id": cert.get("decision_id", ""),
            "policy_version": cert.get("policy_version", "1.0.0"),
            "verification_level": cert.get("verification_level", "LEVEL_1_DECISION_AGREEMENT"),
            "status": cert.get("status", "VERIFIED_WITHIN_DECLARED_SCOPE"),
            "context_hash": cert.get("context_hash", ""),
            "created_at": cert.get("created_at", ""),
            "limitations": json.dumps(cert.get("limitations", []))
        }
        return self.query(UPSERT_CERTIFICATE, params)

    def upsert_relationship(self, rel_type: str, source_id: str, target_id: str, properties: Optional[Dict[str, Any]] = None):
        if rel_type not in RELATIONSHIP_QUERY_TEMPLATES:
            raise ValueError(f"Unsupported relationship type: {rel_type}")
        template = RELATIONSHIP_QUERY_TEMPLATES[rel_type]
        params: Dict[str, Any] = {
            "source_id": source_id,
            "target_id": target_id,
            "created_at": "",
            "reason": "",
            "critical": False,
            "min_version": "1.0.0",
            "environment": "production",
            "constraint": "",
            "iteration": 1
        }
        if properties:
            params.update(properties)
        return self.query(template, params)

    def get_all_nodes(self) -> List[Dict[str, Any]]:
        res = self.query(GET_ALL_NODES)
        nodes = []
        if not res or not res.result_set:
            return nodes
        for row in res.result_set:
            labels = row[0]
            props = row[1]
            # Deserialize json fields if necessary
            cleaned_props = dict(props)
            for k in ("payload", "metadata", "parameters", "limitations"):
                if k in cleaned_props and isinstance(cleaned_props[k], str):
                    try:
                        cleaned_props[k] = json.loads(cleaned_props[k])
                    except Exception:
                        pass
            node_id = cleaned_props.get("id", "")
            primary_label = labels[0] if labels else "Unknown"
            nodes.append({
                "id": node_id,
                "label": cleaned_props.get("name") or cleaned_props.get("title") or node_id,
                "type": primary_label,
                "properties": cleaned_props
            })
        return nodes

    def get_all_edges(self) -> List[Dict[str, Any]]:
        res = self.query(GET_ALL_EDGES)
        edges = []
        if not res or not res.result_set:
            return edges
        for idx, row in enumerate(res.result_set):
            source = row[0]
            target = row[1]
            rel_type = row[2]
            props = dict(row[3]) if len(row) > 3 and row[3] else {}
            edges.append({
                "id": f"e_{source}_{rel_type}_{target}_{idx}",
                "source": source,
                "target": target,
                "type": rel_type,
                "properties": props
            })
        return edges

    def get_graph_stats(self) -> Dict[str, Any]:
        node_res = self.query("MATCH (n) RETURN count(n)")
        edge_res = self.query("MATCH ()-[r]->() RETURN count(r)")
        node_count = node_res.result_set[0][0] if node_res and node_res.result_set else 0
        edge_count = edge_res.result_set[0][0] if edge_res and edge_res.result_set else 0
        return {
            "node_count": node_count,
            "edge_count": edge_count,
            "graph_name": self.graph_name,
            "connected": True
        }

    def get_dependencies_for_root(self, root_id: str, max_depth: int = 4) -> List[Dict[str, Any]]:
        query = f"""
        MATCH path = (root:Service {{id: $root_id}})-[r:DEPENDS_ON*1..{max_depth}]->(dep:Service)
        RETURN dep.id as id, dep.name as name, dep.version as version, dep.critical as critical, length(path) as depth
        """
        res = self.query(query, {"root_id": root_id})
        deps = []
        if res and res.result_set:
            for row in res.result_set:
                deps.append({
                    "id": row[0],
                    "name": row[1],
                    "version": row[2],
                    "critical": bool(row[3]),
                    "depth": row[4]
                })
        return deps

    def get_evidence_for_service(self, service_id: str) -> List[Dict[str, Any]]:
        res = self.query(GET_EVIDENCE_FOR_SERVICE, {"target_id": service_id, "target_prefix": f"{service_id}:"})
        evidence_list = []
        if res and res.result_set:
            for row in res.result_set:
                node = row[0]
                rel_type = row[1]
                target_id = row[2]
                props = dict(node.properties)
                for k in ("payload", "metadata"):
                    if k in props and isinstance(props[k], str):
                        try:
                            props[k] = json.loads(props[k])
                        except Exception:
                            pass
                evidence_list.append({
                    "evidence": props,
                    "rel_type": rel_type,
                    "target_id": target_id
                })
        return evidence_list

    def check_conflicts(self) -> List[Dict[str, Any]]:
        res = self.query(CHECK_CONFLICTING_EVIDENCE)
        conflicts = []
        if res and res.result_set:
            for row in res.result_set:
                conflicts.append({
                    "target_id": row[0],
                    "supporting_id": row[1],
                    "contradicting_id": row[2],
                    "supporting_status": row[3],
                    "contradicting_status": row[4]
                })
        return conflicts
