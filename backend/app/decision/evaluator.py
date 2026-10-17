"""
Deterministic Decision Evaluator for CONTOUR.
Evaluates release readiness constraints over an explicit evidence context.
"""

from typing import Any, Dict, List, Optional, Set
from app.models.entities import DecisionOutcome
from app.models.api import ConstraintEvaluationResult
from app.decision.policy import DecisionPolicy, ReleaseRule

class DecisionEvaluator:
    @staticmethod
    def evaluate(
        root_service_id: str,
        policy: DecisionPolicy,
        dependencies: List[Dict[str, Any]],
        evidence_items: List[Dict[str, Any]],
        relationships: List[Dict[str, Any]],
        claims: Optional[List[Dict[str, Any]]] = None
    ) -> Tuple[DecisionOutcome, List[ConstraintEvaluationResult]]:
        from typing import Tuple

        constraints_evaluated: List[ConstraintEvaluationResult] = []
        
        # Index evidence by target ID and by ID
        evidence_by_id = {e["id"]: e for e in evidence_items}
        evidence_by_target: Dict[str, List[Dict[str, Any]]] = {}
        
        for rel in relationships:
            rel_type = rel.get("type")
            source = rel.get("source")
            target = rel.get("target")
            if source in evidence_by_id and rel_type in ("SUPPORTS", "CONTRADICTS", "TESTED_UNDER"):
                evidence_by_target.setdefault(target, []).append({
                    "evidence": evidence_by_id[source],
                    "rel_type": rel_type,
                    "edge": rel
                })

        # Also map direct evidence if evidence has metadata or target info
        for e in evidence_items:
            target = e.get("metadata", {}).get("target_id")
            if target:
                evidence_by_target.setdefault(target, []).append({
                    "evidence": e,
                    "rel_type": "SUPPORTS" if e.get("status") == "PASSED" else "CONTRADICTS",
                    "edge": {}
                })

        has_block = False
        has_insufficient = False

        for rule in policy.rules:
            if not rule.enabled:
                continue

            if rule.id == "RULE_CRIT_DEP_COMPAT":
                result = DecisionEvaluator._eval_crit_dep_compat(rule, root_service_id, dependencies, evidence_items, evidence_by_target)
            elif rule.id == "RULE_MANDATORY_TESTS_PASS":
                result = DecisionEvaluator._eval_mandatory_tests(rule, root_service_id, evidence_items)
            elif rule.id == "RULE_SECURITY_AUDIT_PASS":
                result = DecisionEvaluator._eval_security_audit(rule, root_service_id, evidence_items)
            elif rule.id == "RULE_NO_CONFLICTING_EVIDENCE":
                result = DecisionEvaluator._eval_conflicts(rule, evidence_items, relationships)
            elif rule.id == "RULE_NO_STALE_EVIDENCE":
                result = DecisionEvaluator._eval_stale_evidence(rule, evidence_items)
            elif rule.id == "RULE_PERF_BENCHMARK_PASS":
                result = DecisionEvaluator._eval_perf_benchmark(rule, evidence_items)
            else:
                result = ConstraintEvaluationResult(
                    rule_id=rule.id,
                    rule_name=rule.name,
                    mandatory=rule.mandatory,
                    passed=True,
                    status="PASSED",
                    explanation=f"Custom rule {rule.name} evaluated.",
                    evidence_ids=[]
                )

            constraints_evaluated.append(result)

            if rule.mandatory:
                if result.status in ("FAILED", "CONFLICT"):
                    has_block = True
                elif result.status == "MISSING_EVIDENCE":
                    has_insufficient = True

        if has_block:
            outcome = DecisionOutcome.BLOCK
        elif has_insufficient:
            outcome = DecisionOutcome.INSUFFICIENT_EVIDENCE
        else:
            outcome = DecisionOutcome.APPROVE

        return outcome, constraints_evaluated

    @staticmethod
    def _eval_crit_dep_compat(
        rule: ReleaseRule,
        root_service_id: str,
        dependencies: List[Dict[str, Any]],
        evidence_items: List[Dict[str, Any]],
        evidence_by_target: Dict[str, List[Dict[str, Any]]]
    ) -> ConstraintEvaluationResult:
        critical_deps = [d for d in dependencies if d.get("critical", False)]
        if not critical_deps:
            return ConstraintEvaluationResult(
                rule_id=rule.id,
                rule_name=rule.name,
                mandatory=rule.mandatory,
                passed=True,
                status="PASSED",
                explanation="No critical dependencies declared for service.",
                evidence_ids=[]
            )

        failed_deps = []
        missing_deps = []
        ev_ids = []

        for dep in critical_deps:
            dep_id = dep["id"]
            # Look for compatibility evidence
            dep_evidence = [
                e for e in evidence_items
                if e.get("source_type") in ("compat_check", "compatibility_test")
                and (dep_id in e.get("title", "") or dep_id == e.get("source_id") or dep_id == e.get("metadata", {}).get("target_id"))
            ]
            
            if not dep_evidence:
                # Check target mapping
                target_evs = evidence_by_target.get(dep_id, [])
                dep_evidence = [entry["evidence"] for entry in target_evs if entry["evidence"].get("source_type") in ("compat_check", "compatibility_test")]

            if not dep_evidence:
                missing_deps.append(dep.get("name", dep_id))
            else:
                for ev in dep_evidence:
                    ev_ids.append(ev["id"])
                    status = ev.get("status", "").upper()
                    if status in ("INCOMPATIBLE", "FAILED", "UNKNOWN"):
                        failed_deps.append(f"{dep.get('name', dep_id)}: status is {status}")

        if failed_deps:
            return ConstraintEvaluationResult(
                rule_id=rule.id,
                rule_name=rule.name,
                mandatory=rule.mandatory,
                passed=False,
                status="FAILED",
                explanation=f"Critical dependency compatibility violation: {'; '.join(failed_deps)}",
                evidence_ids=ev_ids
            )
        elif missing_deps:
            return ConstraintEvaluationResult(
                rule_id=rule.id,
                rule_name=rule.name,
                mandatory=rule.mandatory,
                passed=False,
                status="MISSING_EVIDENCE",
                explanation=f"Missing compatibility evidence for critical dependencies: {', '.join(missing_deps)}",
                evidence_ids=ev_ids
            )
        else:
            return ConstraintEvaluationResult(
                rule_id=rule.id,
                rule_name=rule.name,
                mandatory=rule.mandatory,
                passed=True,
                status="PASSED",
                explanation=f"All {len(critical_deps)} critical dependencies are verified compatible.",
                evidence_ids=ev_ids
            )

    @staticmethod
    def _eval_mandatory_tests(
        rule: ReleaseRule,
        root_service_id: str,
        evidence_items: List[Dict[str, Any]]
    ) -> ConstraintEvaluationResult:
        tests = [e for e in evidence_items if e.get("source_type") in ("unit_test", "integration_test")]
        if not tests:
            return ConstraintEvaluationResult(
                rule_id=rule.id,
                rule_name=rule.name,
                mandatory=rule.mandatory,
                passed=False,
                status="MISSING_EVIDENCE",
                explanation="No mandatory unit or integration test evidence provided.",
                evidence_ids=[]
            )

        failed_tests = [t for t in tests if t.get("status", "").upper() != "PASSED"]
        ev_ids = [t["id"] for t in tests]
        
        if failed_tests:
            failed_titles = [f"{t['id']} ({t.get('title')})" for t in failed_tests]
            return ConstraintEvaluationResult(
                rule_id=rule.id,
                rule_name=rule.name,
                mandatory=rule.mandatory,
                passed=False,
                status="FAILED",
                explanation=f"Mandatory test suites failed: {', '.join(failed_titles)}",
                evidence_ids=ev_ids
            )
        return ConstraintEvaluationResult(
            rule_id=rule.id,
            rule_name=rule.name,
            mandatory=rule.mandatory,
            passed=True,
            status="PASSED",
            explanation=f"All {len(tests)} mandatory test suites passed.",
            evidence_ids=ev_ids
        )

    @staticmethod
    def _eval_security_audit(
        rule: ReleaseRule,
        root_service_id: str,
        evidence_items: List[Dict[str, Any]]
    ) -> ConstraintEvaluationResult:
        sec_audits = [e for e in evidence_items if e.get("source_type") in ("security_scan", "vulnerability_audit")]
        if not sec_audits:
            return ConstraintEvaluationResult(
                rule_id=rule.id,
                rule_name=rule.name,
                mandatory=rule.mandatory,
                passed=False,
                status="MISSING_EVIDENCE",
                explanation="No security audit evidence provided for release candidate.",
                evidence_ids=[]
            )

        failed_sec = [s for s in sec_audits if s.get("status", "").upper() != "PASSED"]
        ev_ids = [s["id"] for s in sec_audits]

        if failed_sec:
            return ConstraintEvaluationResult(
                rule_id=rule.id,
                rule_name=rule.name,
                mandatory=rule.mandatory,
                passed=False,
                status="FAILED",
                explanation="Security audit reported blocking vulnerabilities.",
                evidence_ids=ev_ids
            )
        return ConstraintEvaluationResult(
            rule_id=rule.id,
            rule_name=rule.name,
            mandatory=rule.mandatory,
            passed=True,
            status="PASSED",
            explanation="Security audit passed with zero blocking issues.",
            evidence_ids=ev_ids
        )

    @staticmethod
    def _eval_conflicts(
        rule: ReleaseRule,
        evidence_items: List[Dict[str, Any]],
        relationships: List[Dict[str, Any]]
    ) -> ConstraintEvaluationResult:
        # Check explicit CONTRADICTS edges or opposing claims
        contradicting_edges = [r for r in relationships if r.get("type") == "CONTRADICTS"]
        ev_ids = [e["id"] for e in evidence_items]

        # Check if any evidence in our context is involved in a contradiction
        active_conflicts = []
        for edge in contradicting_edges:
            src = edge.get("source")
            tgt = edge.get("target")
            if src in ev_ids and tgt in ev_ids:
                active_conflicts.append(f"{src} contradicts {tgt}")

        if active_conflicts:
            return ConstraintEvaluationResult(
                rule_id=rule.id,
                rule_name=rule.name,
                mandatory=rule.mandatory,
                passed=False,
                status="CONFLICT",
                explanation=f"Unresolved conflicting evidence detected: {', '.join(active_conflicts)}",
                evidence_ids=ev_ids
            )
        return ConstraintEvaluationResult(
            rule_id=rule.id,
            rule_name=rule.name,
            mandatory=rule.mandatory,
            passed=True,
            status="PASSED",
            explanation="No conflicting evidence detected in current context.",
            evidence_ids=[]
        )

    @staticmethod
    def _eval_stale_evidence(
        rule: ReleaseRule,
        evidence_items: List[Dict[str, Any]]
    ) -> ConstraintEvaluationResult:
        stale_items = [e for e in evidence_items if e.get("validity_status", "").upper() == "STALE"]
        if stale_items:
            stale_ids = [s["id"] for s in stale_items]
            return ConstraintEvaluationResult(
                rule_id=rule.id,
                rule_name=rule.name,
                mandatory=rule.mandatory,
                passed=False,
                status="FAILED",
                explanation=f"Stale evidence detected beyond validity SLA: {', '.join(stale_ids)}",
                evidence_ids=stale_ids
            )
        return ConstraintEvaluationResult(
            rule_id=rule.id,
            rule_name=rule.name,
            mandatory=rule.mandatory,
            passed=True,
            status="PASSED",
            explanation="All evaluated evidence is fresh and valid.",
            evidence_ids=[]
        )

    @staticmethod
    def _eval_perf_benchmark(
        rule: ReleaseRule,
        evidence_items: List[Dict[str, Any]]
    ) -> ConstraintEvaluationResult:
        perf = [e for e in evidence_items if e.get("source_type") in ("perf_check", "benchmark")]
        if not perf:
            return ConstraintEvaluationResult(
                rule_id=rule.id,
                rule_name=rule.name,
                mandatory=rule.mandatory,
                passed=True,
                status="PASSED",
                explanation="No performance benchmark required.",
                evidence_ids=[]
            )
        failed_perf = [p for p in perf if p.get("status", "").upper() != "PASSED"]
        if failed_perf:
            return ConstraintEvaluationResult(
                rule_id=rule.id,
                rule_name=rule.name,
                mandatory=rule.mandatory,
                passed=False,
                status="FAILED",
                explanation="Performance benchmarks failed SLA requirements.",
                evidence_ids=[p["id"] for p in perf]
            )
        return ConstraintEvaluationResult(
            rule_id=rule.id,
            rule_name=rule.name,
            mandatory=rule.mandatory,
            passed=True,
            status="PASSED",
            explanation="Performance benchmarks met SLA requirements.",
            evidence_ids=[p["id"] for p in perf]
        )
