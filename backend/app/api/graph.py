from fastapi import APIRouter, HTTPException
from app.models.api import GraphDataResponse, GraphNodeView, GraphEdgeView
from app.graph.repository import GraphRepository
from app.core.logging import logger

router = APIRouter()
repo = GraphRepository()

@router.get("", response_model=GraphDataResponse)
def get_graph():
    try:
        nodes_raw = repo.get_all_nodes()
        edges_raw = repo.get_all_edges()

        nodes_view = [
            GraphNodeView(
                id=n["id"],
                label=n["label"],
                type=n["type"],
                properties=n["properties"]
            )
            for n in nodes_raw
        ]

        edges_view = [
            GraphEdgeView(
                id=e["id"],
                source=e["source"],
                target=e["target"],
                type=e["type"],
                properties=e.get("properties", {})
            )
            for e in edges_raw
        ]

        return GraphDataResponse(
            nodes=nodes_view,
            edges=edges_view,
            total_nodes=len(nodes_view),
            total_edges=len(edges_view)
        )
    except Exception as e:
        logger.error(f"Error fetching graph data: {e}")
        raise HTTPException(status_code=500, detail=str(e))
