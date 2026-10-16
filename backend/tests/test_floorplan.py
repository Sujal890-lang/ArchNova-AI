import pytest
from app.services.floorplan_engine import FloorPlanEngine

def test_floorplan_generation_and_rooms():
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
    assert plan["total_floors"] == 2
    assert len(plan["floors"]) == 2
    assert plan["can_fit_program"] is True

    # Ground floor checks
    g_floor = plan["floors"][0]
    g_rooms = g_floor["rooms"]
    room_names = [r["name"] for r in g_rooms]
    assert any("Living" in name for name in room_names)
    assert any("Kitchen" in name for name in room_names)

    # Upper floor checks
    f1_floor = plan["floors"][1]
    f1_rooms = f1_floor["rooms"]
    f1_names = [r["name"] for r in f1_rooms]
    assert any("Master Bedroom" in name for name in f1_names)
    assert any("Balcony" in name for name in f1_names)

    # Check non-overlapping rooms in ground floor
    for i, r1 in enumerate(g_rooms):
        for j, r2 in enumerate(g_rooms):
            if i >= j:
                continue
            # Check bounding box overlap (strictly inside)
            r1_x2 = r1["x"] + r1["width"]
            r1_y2 = r1["y"] + r1["depth"]
            r2_x2 = r2["x"] + r2["width"]
            r2_y2 = r2["y"] + r2["depth"]
            # Overlap condition:
            # Overlap occurs if (r1.x1 < r2.x2 and r1.x2 > r2.x1 and r1.y1 < r2.y2 and r1.y2 > r2.y1)
            # Sharing an edge is allowed, but strictly interior area overlap is not
            x_overlap = max(0, min(r1_x2, r2_x2) - max(r1["x"], r2["x"]))
            y_overlap = max(0, min(r1_y2, r2_y2) - max(r1["y"], r2["y"]))
            interior_overlap = (x_overlap > 0.05 and y_overlap > 0.05)
            assert not interior_overlap, f"Room overlap between {r1['name']} and {r2['name']}"

def test_svg_generation():
    plan = FloorPlanEngine.generate_floorplans(
        building_width=14.0,
        building_depth=11.0,
        num_floors=2,
        num_bedrooms=3,
        num_bathrooms=2,
        has_balcony=True,
        has_staircase=True,
        plot_width=22.0,
        plot_length=28.0,
        front_setback=3.0,
        rear_setback=2.5,
        left_setback=2.0,
        right_setback=2.0
    )
    svg = FloorPlanEngine.generate_svg(plan, floor_index=0)
    assert "<svg" in svg
    assert "</svg>" in svg
    assert "ARCHNOVA AI" in svg
    assert "Living" in svg
    assert "scale" in svg.lower()
