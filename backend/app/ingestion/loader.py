"""
Graph Data Loader for CONTOUR.
Parses normalized entities and populates FalkorDB with duplicate detection and provenance.
"""

import json
from pathlib import Path
from typing import Any, Dict, Optional, Tuple
from app.core.logging import logger
from app.graph.repository import GraphRepository
from app.ingestion.normalize import (
    normalize_service,
    normalize_evidence,
    normalize_claim,
    normalize_rule,
    normalize_relationship
)

class GraphLoader:
    def __init__(self, repo: Optional[GraphRepository] = None):
        self.repo = repo or GraphRepository()

    def load_dataset(self, data: Dict[str, Any], reset_first: bool = True) -> Tuple[int, int]:
        if reset_first:
            self.repo.reset_graph()

        nodes_created = 0
        edges_created = 0

        # Services
        for svc_data in data.get("services", []):
            try:
                norm_svc = normalize_service(svc_data)
                self.repo.upsert_service(
                    service_id=norm_svc["id"],
                    name=norm_svc["name"],
                    version=norm_svc["version"],
                    critical=norm_svc["critical"],
                    metadata=norm_svc["metadata"]
                )
                nodes_created += 1
            except Exception as e:
                logger.error(f"Failed to ingest service: {e}")

        # Rules
        for rule_data in data.get("rules", []):
            try:
                norm_rule = normalize_rule(rule_data)
                self.repo.upsert_rule(norm_rule)
                nodes_created += 1
            except Exception as e:
                logger.error(f"Failed to ingest rule: {e}")

        # Claims
        for claim_data in data.get("claims", []):
            try:
                norm_claim = normalize_claim(claim_data)
                self.repo.upsert_claim(norm_claim)
                nodes_created += 1
            except Exception as e:
                logger.error(f"Failed to ingest claim: {e}")

        # Evidence
        for ev_data in data.get("evidence", []):
            try:
                norm_ev = normalize_evidence(ev_data)
                self.repo.upsert_evidence(norm_ev)
                nodes_created += 1
            except Exception as e:
                logger.error(f"Failed to ingest evidence: {e}")

        # Scenarios
        for sc_data in data.get("scenarios", []):
            try:
                self.repo.upsert_scenario(sc_data)
                nodes_created += 1
            except Exception as e:
                logger.error(f"Failed to ingest scenario: {e}")

        # Relationships
        for rel_data in data.get("relationships", []):
            try:
                norm_rel = normalize_relationship(rel_data)
                self.repo.upsert_relationship(
                    rel_type=norm_rel["type"],
                    source_id=norm_rel["source"],
                    target_id=norm_rel["target"],
                    properties=norm_rel["properties"]
                )
                edges_created += 1
            except Exception as e:
                logger.error(f"Failed to ingest relationship {rel_data}: {e}")

        logger.info(f"Loaded dataset: {nodes_created} nodes, {edges_created} edges created.")
        return nodes_created, edges_created

    def load_from_file(self, file_path: Path, reset_first: bool = True) -> Tuple[int, int]:
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return self.load_dataset(data, reset_first=reset_first)
