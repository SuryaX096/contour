from fastapi import APIRouter
from app.models.api import HealthResponse
from app.graph.repository import GraphRepository

router = APIRouter()
repo = GraphRepository()

@router.get("/health", response_model=HealthResponse)
def get_health():
    is_connected = repo.is_connected()
    stats = repo.get_graph_stats() if is_connected else {"node_count": 0, "edge_count": 0, "graph_name": "unknown"}
    return HealthResponse(
        status="HEALTHY" if is_connected else "DEGRADED",
        graph_db_connected=is_connected,
        graph_name=stats.get("graph_name", "contour_release_graph"),
        node_count=stats.get("node_count", 0),
        edge_count=stats.get("edge_count", 0),
        version="1.0.0"
    )
