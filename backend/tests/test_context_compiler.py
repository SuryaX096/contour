import pytest
from app.graph.repository import GraphRepository
from app.compiler.context import ContextCompiler
from app.decision.policy import DEFAULT_RELEASE_POLICY

def test_context_compiler_reduces_graph():
    repo = GraphRepository()
    compiler = ContextCompiler(repo)
    
    # Compile with budget
    compiled = compiler.compile(
        root_id="service:payment-service:v2.4.0",
        policy=DEFAULT_RELEASE_POLICY,
        context_budget=5
    )
    
    assert len(compiled.selected_evidence) <= 5
    assert len(compiled.omitted_evidence) > 0
    assert compiled.context_cost.reduction_percentage > 0.0
    assert len(compiled.context_hash) == 64  # SHA-256
    assert "ev:payment:unit-tests-01" in [e["id"] for e in compiled.selected_evidence]
