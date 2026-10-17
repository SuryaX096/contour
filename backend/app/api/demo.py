from pathlib import Path
from fastapi import APIRouter, HTTPException
from app.models.api import SeedResponse
from app.ingestion.loader import GraphLoader
from app.graph.repository import GraphRepository
from app.core.logging import logger

router = APIRouter()

@router.post("/seed", response_model=SeedResponse)
def seed_demo_data():
    try:
        repo = GraphRepository()
        loader = GraphLoader(repo)
        
        # Locate data file
        current_dir = Path(__file__).resolve().parent
        data_path = current_dir.parent.parent.parent / "data" / "synthetic_release_data.json"
        
        if not data_path.exists():
            raise HTTPException(status_code=404, detail=f"Synthetic data file not found at {data_path}")

        nodes, edges = loader.load_from_file(data_path, reset_first=True)
        return SeedResponse(
            status="SUCCESS",
            message=f"Seeded {nodes} nodes and {edges} edges into FalkorDB.",
            nodes_created=nodes,
            edges_created=edges,
            graph_name=repo.graph_name
        )
    except Exception as e:
        logger.error(f"Error seeding demo data: {e}")
        raise HTTPException(status_code=500, detail=str(e))
