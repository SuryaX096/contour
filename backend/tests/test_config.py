import pytest
from app.core.config import Settings

def test_config_defaults():
    s = Settings()
    assert s.falkordb_host == "localhost"
    assert s.falkordb_port == 6379
    assert s.falkordb_graph_name == "contour_release_graph"
    assert s.api_port == 8000
    assert s.default_search_budget >= 10
