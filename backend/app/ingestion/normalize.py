"""
Data Normalization and Validation for CONTOUR Evidence Ingestion.
Ensures stable IDs, schema validation, and provenance preservation.
"""

from typing import Any, Dict, List, Tuple
from app.core.logging import logger

REQUIRED_SERVICE_FIELDS = ["id", "name", "version"]
REQUIRED_EVIDENCE_FIELDS = ["id", "title", "source_id", "source_type", "status"]

def normalize_service(data: Dict[str, Any]) -> Dict[str, Any]:
    for field in REQUIRED_SERVICE_FIELDS:
        if field not in data:
            raise ValueError(f"Service missing required field: {field}")
    return {
        "id": str(data["id"]).strip(),
        "name": str(data["name"]).strip(),
        "version": str(data["version"]).strip(),
        "critical": bool(data.get("critical", False)),
        "metadata": data.get("metadata", {})
    }

def normalize_evidence(data: Dict[str, Any]) -> Dict[str, Any]:
    for field in REQUIRED_EVIDENCE_FIELDS:
        if field not in data:
            raise ValueError(f"Evidence missing required field: {field}")
    return {
        "id": str(data["id"]).strip(),
        "title": str(data["title"]).strip(),
        "source_id": str(data["source_id"]).strip(),
        "source_type": str(data["source_type"]).strip(),
        "timestamp": str(data.get("timestamp", "2026-10-17T00:00:00Z")),
        "version": str(data.get("version", "1.0.0")),
        "status": str(data["status"]).strip().upper(),
        "payload": data.get("payload", {}),
        "validity_status": str(data.get("validity_status", "VALID")).upper(),
        "metadata": data.get("metadata", {})
    }

def normalize_claim(data: Dict[str, Any]) -> Dict[str, Any]:
    if "id" not in data or "statement" not in data:
        raise ValueError("Claim missing id or statement")
    return {
        "id": str(data["id"]).strip(),
        "statement": str(data["statement"]).strip(),
        "subject": str(data.get("subject", "")).strip(),
        "predicate": str(data.get("predicate", "")).strip(),
        "object": str(data.get("object", "")).strip(),
        "status": str(data.get("status", "ACTIVE")).upper(),
        "version": str(data.get("version", "1.0.0")),
        "confidence": float(data.get("confidence", 1.0)),
        "metadata": data.get("metadata", {})
    }

def normalize_rule(data: Dict[str, Any]) -> Dict[str, Any]:
    if "id" not in data or "name" not in data:
        raise ValueError("Rule missing id or name")
    return {
        "id": str(data["id"]).strip(),
        "name": str(data["name"]).strip(),
        "description": str(data.get("description", "")).strip(),
        "policy_version": str(data.get("policy_version", "1.0.0")),
        "severity": str(data.get("severity", "CRITICAL")).upper(),
        "mandatory": bool(data.get("mandatory", True)),
        "enabled": bool(data.get("enabled", True))
    }

def normalize_relationship(data: Dict[str, Any]) -> Dict[str, Any]:
    if "source" not in data or "target" not in data or "type" not in data:
        raise ValueError("Relationship missing source, target, or type")
    return {
        "source": str(data["source"]).strip(),
        "target": str(data["target"]).strip(),
        "type": str(data["type"]).strip().upper(),
        "properties": data.get("properties", {})
    }
