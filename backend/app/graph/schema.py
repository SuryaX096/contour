"""
FalkorDB Graph Schema Definitions and Constraints for CONTOUR.
"""

NODE_LABELS = {
    "Evidence": "Evidence",
    "Claim": "Claim",
    "Rule": "Rule",
    "Inference": "Inference",
    "Decision": "Decision",
    "Scenario": "Scenario",
    "Certificate": "Certificate",
    "Service": "Service"
}

RELATIONSHIP_TYPES = [
    "SUPPORTS",
    "CONTRADICTS",
    "DEPENDS_ON",
    "GOVERNED_BY",
    "DERIVED_FROM",
    "TESTED_UNDER",
    "INVALIDATES",
    "REQUIRES",
    "PRODUCES",
    "REPAIRS"
]

INDEX_QUERIES = [
    "CREATE INDEX FOR (e:Evidence) ON (e.id)",
    "CREATE INDEX FOR (c:Claim) ON (c.id)",
    "CREATE INDEX FOR (r:Rule) ON (r.id)",
    "CREATE INDEX FOR (d:Decision) ON (d.id)",
    "CREATE INDEX FOR (s:Scenario) ON (s.id)",
    "CREATE INDEX FOR (cert:Certificate) ON (cert.id)",
    "CREATE INDEX FOR (svc:Service) ON (svc.id)"
]
