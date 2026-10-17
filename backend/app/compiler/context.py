"""
Dependency-Aware Context Compiler for CONTOUR.
Extracts a decision-relevant subgraph, enforces budget constraints, and tracks omitted nodes.
"""

import hashlib
import json
from typing import Any, Dict, List, Optional, Set, Tuple
from app.core.logging import logger
from app.graph.repository import GraphRepository
from app.decision.policy import DecisionPolicy
from app.compiler.cost import CostCalculator
from app.models.api import ContextCostMetrics

class CompiledContext:
    def __init__(
        self,
        root_id: str,
        selected_nodes: List[Dict[str, Any]],
        selected_edges: List[Dict[str, Any]],
        selected_evidence: List[Dict[str, Any]],
        omitted_evidence: List[Dict[str, Any]],
        omitted_nodes: List[Dict[str, Any]],
        dependencies: List[Dict[str, Any]],
        selection_reasons: Dict[str, str],
        context_cost: ContextCostMetrics,
        context_hash: str
    ):
        self.root_id = root_id
        self.selected_nodes = selected_nodes
        self.selected_edges = selected_edges
        self.selected_evidence = selected_evidence
        self.omitted_evidence = omitted_evidence
        self.omitted_nodes = omitted_nodes
        self.dependencies = dependencies
        self.selection_reasons = selection_reasons
        self.context_cost = context_cost
        self.context_hash = context_hash

class ContextCompiler:
    def __init__(self, repo: Optional[GraphRepository] = None):
        self.repo = repo or GraphRepository()

    def compile(
        self,
        root_id: str,
        policy: DecisionPolicy,
        context_budget: Optional[int] = None,
        include_optional: bool = True
    ) -> CompiledContext:
        all_nodes = self.repo.get_all_nodes()
        all_edges = self.repo.get_all_edges()
        all_nodes_by_id = {n["id"]: n for n in all_nodes}

        # 1. Fetch dependencies of root service
        all_deps = self.repo.get_dependencies_for_root(root_id, max_depth=4)

        # 2. Collect all candidate evidence
        all_evidence = [n["properties"] for n in all_nodes if n["type"] == "Evidence"]

        selected_evidence_ids: List[str] = []
        selection_reasons: Dict[str, str] = {}

        # Priority 1: Mandatory tests and security scan for root entity
        for ev in all_evidence:
            ev_id = ev["id"]
            src_type = ev.get("source_type", "")
            target_id = ev.get("metadata", {}).get("target_id", "")
            if root_id in ev.get("title", "") or target_id == root_id or ev.get("source_id") == root_id:
                if src_type in ("unit_test", "integration_test"):
                    selected_evidence_ids.append(ev_id)
                    selection_reasons[ev_id] = "Mandatory test suite for release candidate"
                elif src_type in ("security_scan", "vulnerability_audit"):
                    selected_evidence_ids.append(ev_id)
                    selection_reasons[ev_id] = "Mandatory security vulnerability audit"

        # Priority 2: Direct critical dependencies compatibility evidence (Depth 1)
        direct_deps = [d for d in all_deps if d.get("depth", 1) == 1]
        for dep in direct_deps:
            if not dep.get("critical", False):
                continue
            dep_id = dep["id"]
            for ev in all_evidence:
                ev_id = ev["id"]
                if ev_id in selected_evidence_ids:
                    continue
                if ev.get("source_type") in ("compat_check", "compatibility_test") and (
                    dep_id in ev.get("title", "") or ev.get("metadata", {}).get("target_id") == dep_id or ev.get("source_id") == dep_id
                ):
                    selected_evidence_ids.append(ev_id)
                    selection_reasons[ev_id] = f"Critical dependency ({dep.get('name')}) compatibility proof"

        # Priority 3: Optional root evidence (perf checks, docs) if budget allows
        if include_optional:
            for ev in all_evidence:
                ev_id = ev["id"]
                if ev_id in selected_evidence_ids:
                    continue
                target_id = ev.get("metadata", {}).get("target_id", "")
                if root_id in ev.get("title", "") or target_id == root_id or ev.get("source_id") == root_id:
                    selected_evidence_ids.append(ev_id)
                    selection_reasons[ev_id] = f"Optional evidence ({ev.get('source_type')}) for release candidate"

        # Priority 4: Non-critical direct dependencies evidence
        for dep in direct_deps:
            if dep.get("critical", False):
                continue
            dep_id = dep["id"]
            for ev in all_evidence:
                ev_id = ev["id"]
                if ev_id in selected_evidence_ids:
                    continue
                if dep_id in ev.get("title", "") or ev.get("metadata", {}).get("target_id") == dep_id:
                    selected_evidence_ids.append(ev_id)
                    selection_reasons[ev_id] = f"Non-critical dependency ({dep.get('name')}) evidence"

        # Priority 5: Transitive dependencies evidence (Depth > 1) if budget allows
        transitive_deps = [d for d in all_deps if d.get("depth", 1) > 1]
        for dep in transitive_deps:
            dep_id = dep["id"]
            for ev in all_evidence:
                ev_id = ev["id"]
                if ev_id in selected_evidence_ids:
                    continue
                if dep_id in ev.get("title", "") or ev.get("metadata", {}).get("target_id") == dep_id:
                    if context_budget is not None and len(selected_evidence_ids) >= context_budget:
                        continue
                    selected_evidence_ids.append(ev_id)
                    selection_reasons[ev_id] = f"Transitive dependency ({dep.get('name')}) evidence"

        # Enforce context budget if provided
        if context_budget is not None and len(selected_evidence_ids) > context_budget:
            selected_evidence_ids = selected_evidence_ids[:context_budget]
            selection_reasons = {k: v for k, v in selection_reasons.items() if k in selected_evidence_ids}

        # Partition evidence into selected and omitted
        selected_evidence = [e for e in all_evidence if e["id"] in selected_evidence_ids]
        omitted_evidence = [e for e in all_evidence if e["id"] not in selected_evidence_ids]

        # Determine selected nodes and dependencies
        selected_node_ids = set(selected_evidence_ids)
        selected_node_ids.add(root_id)

        # Include services that are referenced by selected evidence or direct dependencies within context
        active_deps = []
        for dep in all_deps:
            # If evidence for this dep is in selected_evidence or it's a direct dep within budget
            has_dep_evidence = any(
                dep["id"] in e.get("title", "") or e.get("metadata", {}).get("target_id") == dep["id"]
                for e in selected_evidence
            )
            if has_dep_evidence or dep.get("depth", 1) == 1:
                selected_node_ids.add(dep["id"])
                active_deps.append(dep)

        # Include rules from policy
        for r in policy.rules:
            selected_node_ids.add(r.id)

        selected_nodes = [n for n in all_nodes if n["id"] in selected_node_ids]
        omitted_nodes = [n for n in all_nodes if n["id"] not in selected_node_ids]

        # Filter edges between selected nodes
        selected_edges = [
            e for e in all_edges
            if e["source"] in selected_node_ids and e["target"] in selected_node_ids
        ]

        # Calculate context cost
        cost_metrics = CostCalculator.calculate(
            selected_evidence=selected_evidence,
            all_evidence=all_evidence,
            selected_nodes=selected_nodes,
            all_nodes=all_nodes,
            selected_edges=selected_edges,
            all_edges=all_edges
        )

        # Compute deterministic SHA256 context hash
        sorted_ev_ids = sorted(selected_evidence_ids)
        hash_input = f"{root_id}:{policy.id}:{policy.version}:{','.join(sorted_ev_ids)}"
        context_hash = hashlib.sha256(hash_input.encode("utf-8")).hexdigest()

        return CompiledContext(
            root_id=root_id,
            selected_nodes=selected_nodes,
            selected_edges=selected_edges,
            selected_evidence=selected_evidence,
            omitted_evidence=omitted_evidence,
            omitted_nodes=omitted_nodes,
            dependencies=active_deps,
            selection_reasons=selection_reasons,
            context_cost=cost_metrics,
            context_hash=context_hash
        )
