"""
Verification Certificate Engine for CONTOUR.
Generates auditable, machine-readable JSON certificates capturing decision provenance,
formal solver verification boundaries, and explicit limitations.
"""

import hashlib
import json
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from app.core.logging import logger
from app.models.entities import DecisionOutcome, CertificateStatus, VerificationLevel
from app.models.api import VerificationCertificate
from app.graph.repository import GraphRepository

class CertificateEngine:
    def __init__(self, repo: Optional[GraphRepository] = None):
        self.repo = repo or GraphRepository()

    def generate_certificate(
        self,
        decision_id: str,
        policy_id: str,
        policy_version: str,
        baseline_decision: DecisionOutcome,
        final_decision: DecisionOutcome,
        selected_evidence_ids: List[str],
        omitted_evidence_ids: List[str],
        dependency_paths: List[Dict[str, Any]],
        counterexamples_tested: int,
        counterexamples_found: int,
        context_repair_iterations: int,
        solver_status: str = "SAT_FORMALLY_VERIFIED",
        verification_method: str = "COUNTEREXAMPLE_GUIDED_CONTEXT_REPAIR_AND_Z3_SOLVER",
        search_limit: int = 50,
        search_complete: bool = True,
        unresolved_conflicts: Optional[List[str]] = None,
        unverified_conditions: Optional[List[str]] = None
    ) -> VerificationCertificate:
        cert_id = f"cert-{uuid.uuid4().hex[:12]}"
        now_iso = datetime.now(timezone.utc).isoformat()

        # Context hash
        sorted_ev_ids = sorted(selected_evidence_ids)
        hash_input = f"{decision_id}:{policy_id}:{policy_version}:{','.join(sorted_ev_ids)}"
        context_hash = hashlib.sha256(hash_input.encode("utf-8")).hexdigest()

        # Determine certificate status
        if counterexamples_found > 0 and final_decision == DecisionOutcome.BLOCK:
            status = CertificateStatus.COUNTEREXAMPLE_FOUND
        elif final_decision == DecisionOutcome.APPROVE and search_complete:
            status = CertificateStatus.VERIFIED_WITHIN_DECLARED_SCOPE
        elif final_decision == DecisionOutcome.INSUFFICIENT_EVIDENCE:
            status = CertificateStatus.INSUFFICIENT_EVIDENCE
        else:
            status = CertificateStatus.INCONCLUSIVE

        limitations = [
            "Verification is strictly valid only within the explicitly declared policy, dependency graph, and scenario space.",
            "Verification does not prove absence of unforeseen real-world runtime anomalies or unmodeled zero-day defects.",
            "Heuristic context reduction minimizes evidence footprint but does not guarantee global information-theoretic optimality.",
            "Synthetic software environment evidence does not constitute production release sign-off without human engineering review."
        ]

        assumptions = [
            "All ingested test and audit payloads reflect authentic test execution outcomes.",
            "Dependency specifications are acyclic and bounded by maximum graph traversal depth.",
            "Policy rules operate deterministically under classical first-order logic."
        ]

        cert = VerificationCertificate(
            certificate_id=cert_id,
            decision_id=decision_id,
            created_at=now_iso,
            policy_id=policy_id,
            policy_version=policy_version,
            baseline_decision=baseline_decision,
            final_decision=final_decision,
            selected_evidence_ids=selected_evidence_ids,
            omitted_evidence_summary={
                "omitted_count": len(omitted_evidence_ids),
                "omitted_sample": omitted_evidence_ids[:5]
            },
            selected_context_hash=context_hash,
            graph_version_or_snapshot_reference="falkordb:snapshot:active",
            dependency_paths=dependency_paths,
            counterexamples_tested=counterexamples_tested,
            counterexamples_found=counterexamples_found,
            context_repair_iterations=context_repair_iterations,
            verification_method=verification_method,
            solver_status=solver_status,
            search_scope={
                "search_depth_limit": 5,
                "scenarios_modeled": counterexamples_tested,
                "formal_solver": "Z3 SMT Solver v4.13+"
            },
            search_limit=search_limit,
            search_complete=search_complete,
            assumptions=assumptions,
            unresolved_conflicts=unresolved_conflicts or [],
            unverified_conditions=unverified_conditions or [],
            limitations=limitations,
            status=status
        )

        # Persist certificate node in FalkorDB
        try:
            self.repo.upsert_certificate({
                "id": cert.certificate_id,
                "decision_id": cert.decision_id,
                "policy_version": cert.policy_version,
                "verification_level": VerificationLevel.LEVEL_3_FORMAL_VERIFICATION.value,
                "status": cert.status.value,
                "context_hash": cert.selected_context_hash,
                "created_at": cert.created_at,
                "limitations": cert.limitations
            })
            # Connect certificate to decision
            self.repo.upsert_relationship("PRODUCES", cert.decision_id, cert.certificate_id)
        except Exception as e:
            logger.warning(f"Could not persist certificate to FalkorDB: {e}")

        return cert
