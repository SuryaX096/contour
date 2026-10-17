"""
Context Cost Metrics Calculator for CONTOUR.
Measures context size, graph reduction, and estimated token usage.
"""

import json
from typing import Any, Dict, List
from app.models.api import ContextCostMetrics

class CostCalculator:
    @staticmethod
    def calculate(
        selected_evidence: List[Dict[str, Any]],
        all_evidence: List[Dict[str, Any]],
        selected_nodes: List[Dict[str, Any]],
        all_nodes: List[Dict[str, Any]],
        selected_edges: List[Dict[str, Any]],
        all_edges: List[Dict[str, Any]]
    ) -> ContextCostMetrics:
        sel_ev_count = len(selected_evidence)
        tot_ev_count = len(all_evidence)
        sel_node_count = len(selected_nodes)
        tot_node_count = len(all_nodes)
        sel_edge_count = len(selected_edges)
        tot_edge_count = len(all_edges)

        # Context reduction based on evidence or overall nodes
        if tot_node_count > 0:
            reduction = max(0.0, round((1.0 - (sel_node_count / tot_node_count)) * 100.0, 2))
        else:
            reduction = 0.0

        # Token estimate: approx 1 token per 4 characters of JSON serialized context
        serialized_context = json.dumps({
            "nodes": [n.get("id") for n in selected_nodes],
            "evidence": selected_evidence,
            "edges": selected_edges
        })
        token_count = max(10, len(serialized_context) // 4)

        return ContextCostMetrics(
            selected_evidence_count=sel_ev_count,
            total_graph_evidence_count=tot_ev_count,
            selected_node_count=sel_node_count,
            total_graph_node_count=tot_node_count,
            selected_edge_count=sel_edge_count,
            total_graph_edge_count=tot_edge_count,
            reduction_percentage=reduction,
            estimated_token_count=token_count
        )
