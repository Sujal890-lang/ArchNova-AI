import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_endpoint():
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"

def test_designs_generate_api():
    payload = {
        "plot": {
            "project_name": "API Test Villa",
            "plot_width": 20.0,
            "plot_length": 30.0,
            "road_facing_side": "south"
        },
        "constraints": {
            "max_height": 12.0,
            "front_setback": 3.5,
            "rear_setback": 3.0,
            "left_setback": 2.0,
            "right_setback": 2.0,
            "max_far": 1.8,
            "max_site_coverage": 60.0,
            "max_floors": 3
        },
        "requirements": {
            "building_type": "residential",
            "num_bedrooms": 3,
            "num_bathrooms": 2,
            "num_floors": 2,
            "parking_spaces": 2,
            "balcony_requirement": True
        },
        "preferences": {
            "architectural_style": "modern",
            "roof_type": "flat",
            "exterior_material": "concrete_white_stucco",
            "exterior_color": "warm_offwhite"
        }
    }
    res = client.post("/api/designs/generate", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "design_id" in data
    assert "geometry" in data
    assert data["geometry"]["floor_count"] == 2
    assert "validation" in data
    assert data["validation"]["is_valid"] is True

def test_designs_validate_api():
    payload = {
        "plot": {"plot_width": 15.0, "plot_length": 25.0},
        "constraints": {"max_site_coverage": 50.0, "max_far": 1.5, "max_height": 10.0, "max_floors": 2},
        "requirements": {"num_floors": 2, "num_bedrooms": 3, "parking_spaces": 1},
        "preferences": {}
    }
    res = client.post("/api/designs/validate", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "is_valid" in data
    assert "metrics" in data
    assert len(data["metrics"]) > 0

def test_copilot_endpoint():
    res = client.post("/api/designs/copilot", json={"prompt": "Design a modern 2-floor villa with 3 bedrooms and parking on a 25 by 30 plot"})
    assert res.status_code == 200
    data = res.json()
    assert "suggested_design" in data
    assert data["suggested_design"]["requirements"]["num_floors"] == 2
    assert data["suggested_design"]["requirements"]["num_bedrooms"] == 3

def test_floorplan_svg_api():
    payload = {
        "building_width": 12.0,
        "building_depth": 10.0,
        "num_floors": 2,
        "num_bedrooms": 3,
        "num_bathrooms": 2,
        "has_balcony": True,
        "has_staircase": True,
        "plot_width": 20.0,
        "plot_length": 25.0,
        "front_setback": 3.0,
        "rear_setback": 2.5,
        "left_setback": 2.0,
        "right_setback": 2.0
    }
    res = client.post("/api/floorplans/svg?floor=0", json=payload)
    assert res.status_code == 200
    assert "image/svg+xml" in res.headers["content-type"]
    assert "<svg" in res.text
