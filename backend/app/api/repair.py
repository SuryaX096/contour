from fastapi import APIRouter, HTTPException
from app.models.api import ContextRepairRequest, ContextRepairResponse
from app.services.repair_service import repair_service
from app.core.logging import logger

router = APIRouter()

@router.post("/repair", response_model=ContextRepairResponse)
def repair_context(req: ContextRepairRequest):
    try:
        return repair_service.repair_context(
            decision_id=req.decision_id,
            counterexample_id=req.counterexample_id
        )
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        logger.error(f"Error repairing context: {e}")
        raise HTTPException(status_code=500, detail=str(e))
