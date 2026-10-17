from fastapi import APIRouter, HTTPException
from app.models.api import CounterexampleSearchRequest, CounterexampleSearchResponse
from app.services.decision_service import decision_service
from app.verification.counterexamples import CounterexampleEngine
from app.core.logging import logger

router = APIRouter()
engine = CounterexampleEngine()

@router.post("/search", response_model=CounterexampleSearchResponse)
def search_counterexamples(req: CounterexampleSearchRequest):
    cached_decision = decision_service.get_decision(req.decision_id)
    if not cached_decision:
        raise HTTPException(status_code=404, detail=f"Decision '{req.decision_id}' not found.")

    try:
        compiled = cached_decision["compiled_context"]
        policy = cached_decision["policy"]
        baseline_decision = cached_decision["outcome"]

        response = engine.search(
            root_service_id=cached_decision["subject"],
            policy=policy,
            baseline_decision=baseline_decision,
            current_dependencies=compiled.dependencies,
            current_evidence=compiled.selected_evidence,
            current_relationships=compiled.selected_edges,
            max_scenarios=req.max_scenarios,
            max_depth=req.max_depth,
            include_formal_solver=req.include_formal_solver
        )
        return response
    except Exception as e:
        logger.error(f"Error during counterexample search: {e}")
        raise HTTPException(status_code=500, detail=str(e))
