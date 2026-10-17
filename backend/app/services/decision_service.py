"""
Decision Service for CONTOUR.
Coordinates context compilation, deterministic evaluation, and decision persistence.
"""

import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from app.core.logging import logger
from app.models.entities import DecisionOutcome
from app.models.api import DecisionResponse, EvaluateDecisionRequest
from app.decision.policy import policy_registry
from app.decision.evaluator import DecisionEvaluator
from app.compiler.context import ContextCompiler, CompiledContext
from app.graph.repository import GraphRepository
from app.verification.certificate import CertificateEngine

class DecisionService:
    def __init__(self, repo: Optional[GraphRepository] = None):
        self.repo = repo or GraphRepository()
        self.compiler = ContextCompiler(self.repo)
        self.certificate_engine = CertificateEngine(self.repo)
        # In-memory storage for quick session lookup
        self._decision_cache: Dict[str, Dict[str, Any]] = {}

    def evaluate_decision(self, req: EvaluateDecisionRequest) -> DecisionResponse:
        policy = policy_registry.get_policy(req.policy_id, req.policy_version)
        if not policy:
            raise ValueError(f"Policy {req.policy_id} version {req.policy_version} not found in registry.")

        # 1. Compile context
        compiled: CompiledContext = self.compiler.compile(
            root_id=req.root_entity,
            policy=policy,
            context_budget=req.context_budget,
            include_optional=req.include_optional
        )

        # 2. Evaluate decision deterministically
        outcome, constraints = DecisionEvaluator.evaluate(
            root_service_id=req.root_entity,
            policy=policy,
            dependencies=compiled.dependencies,
            evidence_items=compiled.selected_evidence,
            relationships=compiled.selected_edges
        )

        decision_id = f"dec-{uuid.uuid4().hex[:12]}"
        now_iso = datetime.now(timezone.utc).isoformat()

        # Build evidence paths
        evidence_paths = []
        for ev in compiled.selected_evidence:
            evidence_paths.append({
                "evidence_id": ev["id"],
                "title": ev.get("title"),
                "status": ev.get("status"),
                "source_type": ev.get("source_type"),
                "selection_reason": compiled.selection_reasons.get(ev["id"], "Context dependency")
            })

        selected_ev_ids = [e["id"] for e in compiled.selected_evidence]
        omitted_ev_ids = [e["id"] for e in compiled.omitted_evidence]

        # 3. Persist decision to FalkorDB
        try:
            self.repo.upsert_decision({
                "id": decision_id,
                "subject": req.root_entity,
                "outcome": outcome.value,
                "policy_version": req.policy_version,
                "created_at": now_iso,
                "evaluation_status": "COMPLETED",
                "context_hash": compiled.context_hash
            })
            self.repo.upsert_relationship("GOVERNED_BY", decision_id, policy.id)
            for ev_id in selected_ev_ids:
                self.repo.upsert_relationship("SUPPORTS" if outcome == DecisionOutcome.APPROVE else "CONTRADICTS", ev_id, decision_id)
        except Exception as e:
            logger.warning(f"Could not persist decision node in FalkorDB: {e}")

        # 4. Generate initial verification certificate
        initial_cert = self.certificate_engine.generate_certificate(
            decision_id=decision_id,
            policy_id=policy.id,
            policy_version=policy.version,
            baseline_decision=outcome,
            final_decision=outcome,
            selected_evidence_ids=selected_ev_ids,
            omitted_evidence_ids=omitted_ev_ids,
            dependency_paths=evidence_paths,
            counterexamples_tested=0,
            counterexamples_found=0,
            context_repair_iterations=0,
            search_complete=False
        )

        # Store in decision cache for counterexample / repair workflow
        decision_data = {
            "decision_id": decision_id,
            "subject": req.root_entity,
            "policy": policy,
            "outcome": outcome,
            "compiled_context": compiled,
            "constraints": constraints,
            "certificate": initial_cert,
            "created_at": now_iso
        }
        self._decision_cache[decision_id] = decision_data

        return DecisionResponse(
            decision_id=decision_id,
            subject=req.root_entity,
            policy_id=policy.id,
            policy_version=policy.version,
            outcome=outcome,
            evaluation_status="EVALUATED",
            constraints=constraints,
            selected_evidence_ids=selected_ev_ids,
            omitted_evidence_ids=omitted_ev_ids,
            evidence_paths=evidence_paths,
            context_cost=compiled.context_cost,
            context_hash=compiled.context_hash,
            selection_reasons=compiled.selection_reasons,
            created_at=now_iso
        )

    def get_decision(self, decision_id: str) -> Optional[Dict[str, Any]]:
        return self._decision_cache.get(decision_id)

decision_service = DecisionService()
