from fastapi import APIRouter, HTTPException, Depends
from app.schemas.architecture import (
    FullDesignRequest,
    DesignResponse,
    ValidationResult,
    CopilotQuery,
    CopilotResponse
)
from app.services.parametric_engine import generate_parametric_design
from app.services.validation_engine import validate_planning_constraints
from app.services.ai_assistant import run_ai_copilot

router = APIRouter()

@router.post("/generate", response_model=DesignResponse)
def generate_design_endpoint(request: FullDesignRequest):
    try:
        response = generate_parametric_design(request)
        return response
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Parametric generation failed: {str(e)}")

@router.post("/validate", response_model=ValidationResult)
def validate_constraints_endpoint(request: FullDesignRequest):
    try:
        result = validate_planning_constraints(
            request.plot,
            request.constraints,
            request.requirements
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Validation failed: {str(e)}")

@router.post("/copilot", response_model=CopilotResponse)
def copilot_query_endpoint(query: CopilotQuery):
    try:
        return run_ai_copilot(query.prompt, query.current_design)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Copilot inference failed: {str(e)}")
