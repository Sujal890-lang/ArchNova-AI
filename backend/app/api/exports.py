from fastapi import APIRouter, HTTPException, Response, Query
from typing import Dict, Any, Optional
from pydantic import BaseModel
from app.services.floorplan_engine import FloorPlanEngine
from app.services.export_engine import ExportEngine
from app.api.floorplans import FloorplanRequest

router = APIRouter()

class ExportProjectRequest(BaseModel):
    design_data: Dict[str, Any]

@router.post("/dxf")
def export_dxf_endpoint(req: FloorplanRequest, floor: int = Query(default=0)):
    try:
        plan_data = FloorPlanEngine.generate_floorplans(
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
        dxf_str = ExportEngine.generate_dxf(plan_data, floor_index=floor)
        return Response(
            content=dxf_str,
            media_type="application/dxf",
            headers={"Content-Disposition": f"attachment; filename=archnova_level_{floor + 1}.dxf"}
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"DXF generation failed: {str(e)}")

@router.post("/svg")
def export_svg_endpoint(req: FloorplanRequest, floor: int = Query(default=0)):
    try:
        plan_data = FloorPlanEngine.generate_floorplans(
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
        svg_content = FloorPlanEngine.generate_svg(plan_data, floor_index=floor)
        return Response(
            content=svg_content,
            media_type="image/svg+xml",
            headers={"Content-Disposition": f"attachment; filename=archnova_level_{floor + 1}.svg"}
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"SVG generation failed: {str(e)}")

@router.post("/json")
def export_json_endpoint(req: ExportProjectRequest):
    try:
        json_str = ExportEngine.export_json(req.design_data)
        return Response(
            content=json_str,
            media_type="application/json",
            headers={"Content-Disposition": "attachment; filename=archnova_project.json"}
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"JSON export failed: {str(e)}")
