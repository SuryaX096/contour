import pytest
from app.graph.repository import GraphRepository
from app.ingestion.loader import GraphLoader
from pathlib import Path

def test_graph_seeding_and_duplicate_protection():
    repo = GraphRepository()
    loader = GraphLoader(repo)
    data_file = Path(__file__).resolve().parent.parent.parent / "data" / "synthetic_release_data.json"
    
    # First seed
    nodes1, edges1 = loader.load_from_file(data_file, reset_first=True)
    assert nodes1 > 0
    assert edges1 > 0

    # Second seed without reset: MERGE prevents duplicate node creation
    nodes2, edges2 = loader.load_from_file(data_file, reset_first=False)
    stats = repo.get_graph_stats()
    # Total nodes should match initial nodes1 because MERGE upserts identically
    assert stats["node_count"] == nodes1

def test_schema_node_labels_and_properties():
    repo = GraphRepository()
    all_nodes = repo.get_all_nodes()
    labels = {n["type"] for n in all_nodes}
    assert "Service" in labels
    assert "Evidence" in labels
    assert "Rule" in labels
