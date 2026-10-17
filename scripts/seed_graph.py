"""
Standalone CLI script to seed the FalkorDB database with deterministic synthetic release data.
"""

import sys
from pathlib import Path

# Add backend to python path
root_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(root_dir / "backend"))

from app.graph.repository import GraphRepository
from app.ingestion.loader import GraphLoader
from app.core.logging import logger

def main():
    repo = GraphRepository()
    if not repo.is_connected():
        logger.error(f"Cannot connect to FalkorDB at {repo.host}:{repo.port}. Is the container running?")
        sys.exit(1)

    data_file = root_dir / "data" / "synthetic_release_data.json"
    if not data_file.exists():
        logger.error(f"Data file not found at {data_file}")
        sys.exit(1)

    loader = GraphLoader(repo)
    nodes, edges = loader.load_from_file(data_file, reset_first=True)
    logger.info(f"Successfully seeded graph '{repo.graph_name}' with {nodes} nodes and {edges} edges.")

if __name__ == "__main__":
    main()
