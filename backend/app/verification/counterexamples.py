"""
Bounded Counterexample Search Engine for CONTOUR.
Searches for decision-changing scenarios within a finite declared scenario space.
Uses isolated evaluation states and validates results deterministically.
"""

import time
from typing import Any, Dict, List, Optional, Tuple
from app.core.logging import logger
from app.models.entities import DecisionOutcome, SearchOutcome
from app.models.api import CounterexampleCandidate, CounterexampleSearchResponse
from app.decision.policy import DecisionPolicy
from app.decision.evaluator import DecisionEvaluator
from app.graph.repository import GraphRepository
from app.verification.scenarios import ScenarioRegistry, ScenarioDefinition
from app.verification.solver import Z3ReleaseSolver

class CounterexampleEngine:
    def __init__(self, repo: Optional[GraphRepository] = None):
        self.repo = repo or GraphRepository()

    def search(
        self,
        root_service_id: str,
        policy: DecisionPolicy,
        baseline_decision: DecisionOutcome,
        current_dependencies: List[Dict[str, Any]],
        current_evidence: List[Dict[str, Any]],
        current_relationships: List[Dict[str, Any]],
        max_scenarios: int = 50,
        max_depth: int = 5,
        include_formal_solver: bool = True
    ) -> CounterexampleSearchResponse:
        start_time = time.perf_counter()
        scenarios = ScenarioRegistry.get_all()
        
        counterexamples: List[CounterexampleCandidate] = []
        scenarios_tested = 0
        search_limit_reached = False

        for sc in scenarios:
            if scenarios_tested >= max_scenarios:
                search_limit_reached = True
                break

            scenarios_tested += 1
            is_cex, candidate = self._evaluate_scenario_candidate(
                scenario=sc,
                root_service_id=root_service_id,
                policy=policy,
                baseline_decision=baseline_decision,
                current_dependencies=current_dependencies,
                current_evidence=current_evidence,
                current_relationships=current_relationships,
                include_formal_solver=include_formal_solver
            )

            if is_cex and candidate:
                counterexamples.append(candidate)

        duration_ms = round((time.perf_counter() - start_time) * 1000.0, 2)

        if counterexamples:
            status = SearchOutcome.COUNTEREXAMPLE_FOUND
        elif search_limit_reached:
            status = SearchOutcome.SEARCH_LIMIT_REACHED
        else:
            status = SearchOutcome.NO_COUNTEREXAMPLE_FOUND_WITHIN_SCOPE

        completeness_metadata = {
            "search_complete": not search_limit_reached and (scenarios_tested == len(scenarios)),
            "total_predefined_scenarios": len(scenarios),
            "scenarios_evaluated": scenarios_tested,
            "max_depth": max_depth,
            "search_scope": "Finite enumerated scenario space + graph omission analysis",
            "formal_solver_applied": include_formal_solver
        }

        return CounterexampleSearchResponse(
            search_status=status,
            scenarios_tested=scenarios_tested,
            counterexamples_found=counterexamples,
            completeness_metadata=completeness_metadata,
            duration_ms=duration_ms
        )

    def _evaluate_scenario_candidate(
        self,
        scenario: ScenarioDefinition,
        root_service_id: str,
        policy: DecisionPolicy,
        baseline_decision: DecisionOutcome,
        current_dependencies: List[Dict[str, Any]],
        current_evidence: List[Dict[str, Any]],
        current_relationships: List[Dict[str, Any]],
        include_formal_solver: bool = True
    ) -> Tuple[bool, Optional[CounterexampleCandidate]]:
        # Create an isolated scenario evaluation state without mutating FalkorDB
        sim_deps = [dict(d) for d in current_dependencies]
        sim_evidence = [dict(e) for e in current_evidence]
        sim_rel = [dict(r) for r in current_relationships]
        
        changed_assumptions = dict(scenario.parameters)
        supporting_evidence_ids: List[str] = []
        dependency_path: List[str] = [root_service_id]

        if scenario.id == "SCN_HIDDEN_DEP_INCOMPAT":
            # Omitted critical dependency exists in FalkorDB
            dep_id = scenario.parameters["service_id"]
            dep_name = scenario.parameters["service_name"]
            ev_id = scenario.parameters["evidence_id"]
            
            # Check if it was already in current_dependencies
            if not any(d["id"] == dep_id for d in sim_deps):
                sim_deps.append({
                    "id": dep_id,
                    "name": dep_name,
                    "version": "1.5.0",
                    "critical": True,
                    "depth": 2
                })

            # Check if FalkorDB contains real evidence for this dependency
            db_ev = self.repo.get_evidence_for_service(dep_id)
            if db_ev:
                for entry in db_ev:
                    sim_evidence.append(entry["evidence"])
                    sim_rel.append({
                        "source": entry["evidence"]["id"],
                        "target": dep_id,
                        "type": entry["rel_type"]
                    })
                    supporting_evidence_ids.append(entry["evidence"]["id"])
            else:
                # Add synthetic scenario evidence into isolated simulation
                sim_ev = {
                    "id": ev_id,
                    "title": f"Compatibility Verification: {dep_name}",
                    "source_id": dep_id,
                    "source_type": "compat_check",
                    "status": "INCOMPATIBLE",
                    "validity_status": "VALID",
                    "metadata": {"target_id": dep_id}
                }
                sim_evidence.append(sim_ev)
                supporting_evidence_ids.append(ev_id)
                sim_rel.append({
                    "source": ev_id,
                    "target": dep_id,
                    "type": "CONTRADICTS"
                })

            dependency_path.extend(["service:payment-service:v2.4.0", dep_id, supporting_evidence_ids[0] if supporting_evidence_ids else ev_id])

        elif scenario.id == "SCN_STALE_SECURITY_AUDIT":
            ev_id = scenario.parameters["evidence_id"]
            for e in sim_evidence:
                if e["id"] == ev_id:
                    e["validity_status"] = "STALE"
                    supporting_evidence_ids.append(ev_id)
            dependency_path.append(ev_id)

        elif scenario.id == "SCN_TEST_FAILURE_INJECTION":
            ev_id = scenario.parameters["evidence_id"]
            for e in sim_evidence:
                if e["id"] == ev_id:
                    e["status"] = "FAILED"
                    supporting_evidence_ids.append(ev_id)
            dependency_path.append(ev_id)

        elif scenario.id == "SCN_UNKNOWN_DEP_COMPAT":
            dep_id = scenario.parameters["service_id"]
            for e in sim_evidence:
                if dep_id in e.get("title", "") or e.get("source_id") == dep_id:
                    e["status"] = "UNKNOWN"
                    supporting_evidence_ids.append(e["id"])
            dependency_path.extend([root_service_id, dep_id])

        elif scenario.id == "SCN_TRANSITIVE_CONFLICT":
            tgt_id = scenario.parameters["target_service"]
            conf_id = scenario.parameters["conflicting_evidence_id"]
            sim_evidence.append({
                "id": conf_id,
                "title": f"Conflicting audit report for {tgt_id}",
                "source_id": tgt_id,
                "source_type": "integration_test",
                "status": "FAILED",
                "validity_status": "VALID",
                "metadata": {"target_id": tgt_id}
            })
            supporting_evidence_ids.append(conf_id)
            sim_rel.append({"source": conf_id, "target": tgt_id, "type": "CONTRADICTS"})
            dependency_path.extend([root_service_id, tgt_id, conf_id])

        # Evaluate decision in isolated state
        scenario_outcome, constraints = DecisionEvaluator.evaluate(
            root_service_id=root_service_id,
            policy=policy,
            dependencies=sim_deps,
            evidence_items=sim_evidence,
            relationships=sim_rel
        )

        # Check if decision changed
        if scenario_outcome != baseline_decision:
            affected_rules = [c.rule_id for c in constraints if not c.passed]
            
            # Formal verification check via Z3 if enabled
            search_method = "BOUNDED_ENUMERATION"
            if include_formal_solver:
                z3_res = Z3ReleaseSolver.verify_scenario_counterexample(
                    baseline_decision=baseline_decision.value,
                    scenario_params=changed_assumptions,
                    dependencies=sim_deps,
                    evidence_items=sim_evidence
                )
                if z3_res.status == "SAT":
                    search_method = "BOUNDED_ENUMERATION + Z3_FORMAL_PROVED"

            candidate = CounterexampleCandidate(
                scenario_id=scenario.id,
                scenario_name=scenario.name,
                scenario_type=scenario.scenario_type,
                changed_assumptions=changed_assumptions,
                supporting_evidence_ids=supporting_evidence_ids,
                dependency_path=dependency_path,
                baseline_decision=baseline_decision,
                scenario_decision=scenario_outcome,
                policy_constraints_affected=affected_rules,
                validation_status="VALIDATED",
                search_method=search_method,
                search_completeness="DECISION_CHANGING_REPRODUCED"
            )
            return True, candidate

        return False, None
