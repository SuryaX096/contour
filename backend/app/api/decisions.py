from fastapi import APIRouter, HTTPException
from app.models.api import EvaluateDecisionRequest, DecisionResponse
from app.services.decision_service import decision_service
from app.core.logging import logger

router = APIRouter()

@router.post("/evaluate", response_model=DecisionResponse)
def evaluate_decision(req: EvaluateDecisionRequest):
    try:
        return decision_service.evaluate_decision(req)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logger.error(f"Error evaluating decision: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{decision_id}")
def get_decision(decision_id: str):
    dec = decision_service.get_decision(decision_id)
    if not dec:
        raise HTTPException(status_code=404, detail=f"Decision '{decision_id}' not found.")
    
    # Serialize safely
    compiled = dec["compiled_context"]
    return {
        "decision_id": dec["decision_id"],
        "subject": dec["subject"],
        "outcome": dec["outcome"].value,
        "policy_id": dec["policy"].id,
        "policy_version": dec["policy"].version,
        "constraints": [c.dict() for c in dec["constraints"]],
        "selected_evidence_ids": [e["id"] for e in compiled.selected_evidence],
        "context_cost": compiled.context_cost.dict(),
        "created_at": dec["created_at"],
        "certificate_id": dec["certificate"].certificate_id if dec.get("certificate") else None
    }
