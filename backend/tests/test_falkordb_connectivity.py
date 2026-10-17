import pytest
from app.graph.repository import GraphRepository

def test_falkordb_connection():
    repo = GraphRepository()
    assert repo.is_connected() is True

def test_falkordb_query_execution():
    repo = GraphRepository()
    res = repo.query("RETURN 1 + 1 AS sum")
    assert res is not None
    assert res.result_set[0][0] == 2
