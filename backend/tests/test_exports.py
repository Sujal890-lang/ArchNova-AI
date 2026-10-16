import pytest
from app.services.floorplan_engine import FloorPlanEngine
from app.services.export_engine import ExportEngine

def test_dxf_export_and_layers():
    plan = FloorPlanEngine.generate_floorplans(
        building_width=12.0,
        building_depth=10.0,
        num_floors=2,
        num_bedrooms=3,
        num_bathrooms=2,
        has_balcony=True,
        has_staircase=True,
        plot_width=20.0,
        plot_length=25.0,
        front_setback=3.0,
        rear_setback=2.5,
        left_setback=2.0,
        right_setback=2.0
    )
    dxf_content = ExportEngine.generate_dxf(plan, floor_index=0)
    assert isinstance(dxf_content, str)
    assert len(dxf_content) > 500
    # Check that required layers are in DXF
    assert "WALLS" in dxf_content
    assert "DOORS" in dxf_content
    assert "WINDOWS" in dxf_content
    assert "ROOMS" in dxf_content
    assert "DIMENSIONS" in dxf_content
    assert "PLOT_BOUNDARY" in dxf_content
    assert "SETBACKS" in dxf_content

def test_json_export():
    sample_data = {
        "project_name": "Test Villa",
        "plot_width": 20.0,
        "plot_length": 30.0,
        "levels": 2
    }
    json_out = ExportEngine.export_json(sample_data)
    assert '"project_name": "Test Villa"' in json_out
    assert '"levels": 2' in json_out
