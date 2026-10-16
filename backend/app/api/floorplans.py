from fastapi import APIRouter, HTTPException, Response, Query
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field
from app.services.floorplan_engine import FloorPlanEngine

router = APIRouter()

class FloorplanRequest(BaseModel):
    building_width: float = Field(default=12.0, gt=0)
    building_depth: float = Field(default=10.0, gt=0)
    num_floors: int = Field(default=2, ge=1, le=10)
    num_bedrooms: int = Field(default=3, ge=1, le=20)
    num_bathrooms: int = Field(default=2, ge=1, le=20)
    has_balcony: bool = Field(default=True)
    has_staircase: bool = Field(default=True)
    plot_width: float = Field(default=20.0, gt=0)
    plot_length: float = Field(default=30.0, gt=0)
    front_setback: float = Field(default=3.5, ge=0)
    rear_setback: float = Field(default=3.0, ge=0)
    left_setback: float = Field(default=2.0, ge=0)
    right_setback: float = Field(default=2.0, ge=0)
    room_size_preference: str = Field(default="standard")

@router.post("/generate")
def generate_floorplans_endpoint(req: FloorplanRequest):
    try:
        data = FloorPlanEngine.generate_floorplans(
            building_width=req.building_width,
            building_depth=req.building_depth,
            num_floors=req.num_floors,
            num_bedrooms=req.num_bedrooms,
            num_bathrooms=req.num_bathrooms,
            has_balcony=req.has_balcony,
            has_staircase=req.has_staircase,
            plot_width=req.plot_width,
            plot_length=req.plot_length,
            front_setback=req.front_setback,
            rear_setback=req.rear_setback,
            left_setback=req.left_setback,
            right_setback=req.right_setback,
            room_size_preference=req.room_size_preference
        )
        return data
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Floorplan generation failed: {str(e)}")

@router.post("/svg")
def get_floorplan_svg(
    req: FloorplanRequest,
    floor: int = Query(default=0, ge=0, description="Floor index (0=Ground, 1=Level 1...)")
):
    try:
        data = FloorPlanEngine.generate_floorplans(
            building_width=req.building_width,
            building_depth=req.building_depth,
            num_floors=req.num_floors,
            num_bedrooms=req.num_bedrooms,
            num_bathrooms=req.num_bathrooms,
            has_balcony=req.has_balcony,
            has_staircase=req.has_staircase,
            plot_width=req.plot_width,
            plot_length=req.plot_length,
            front_setback=req.front_setback,
            rear_setback=req.rear_setback,
            left_setback=req.left_setback,
            right_setback=req.right_setback,
            room_size_preference=req.room_size_preference
        )
        svg_content = FloorPlanEngine.generate_svg(data, floor_index=floor)
        return Response(content=svg_content, media_type="image/svg+xml")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"SVG generation failed: {str(e)}")
