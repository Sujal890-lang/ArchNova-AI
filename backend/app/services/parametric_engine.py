import math
import uuid
from typing import Dict, Any, List
from app.schemas.architecture import (
    FullDesignRequest,
    DesignResponse,
    GeometryMetadata,
    ValidationResult
)
from app.services.validation_engine import validate_planning_constraints

FLOOR_HEIGHT = 3.2
SLAB_THICKNESS = 0.25

def generate_parametric_design(request: FullDesignRequest) -> DesignResponse:
    plot = request.plot
    constraints = request.constraints
    reqs = request.requirements
    prefs = request.preferences

    # Validate planning constraints first
    validation = validate_planning_constraints(plot, constraints, reqs)

    # 1. Coordinate frames and plot bounds
    # Center plot at (0, 0) on the XZ plane. X = width, Z = length/depth
    half_pw = plot.plot_width / 2.0
    half_pl = plot.plot_length / 2.0

    plot_boundary = {
        "width": plot.plot_width,
        "length": plot.plot_length,
        "x_min": -half_pw,
        "x_max": half_pw,
        "z_min": -half_pl,
        "z_max": half_pl,
        "vertices": [
            [-half_pw, 0, -half_pl],
            [half_pw, 0, -half_pl],
            [half_pw, 0, half_pl],
            [-half_pw, 0, half_pl]
        ]
    }

    # Setbacks rectangle
    # Assuming South is +Z, North is -Z, West is -X, East is +X
    # Road facing side mapping
    road_side = plot.road_facing_side.lower()
    if road_side == "south":
        front_z = half_pl - constraints.front_setback
        rear_z = -half_pl + constraints.rear_setback
        left_x = -half_pw + constraints.left_setback
        right_x = half_pw - constraints.right_setback
    elif road_side == "north":
        front_z = -half_pl + constraints.front_setback
        rear_z = half_pl - constraints.rear_setback
        left_x = half_pw - constraints.left_setback
        right_x = -half_pw + constraints.right_setback
    elif road_side == "east":
        front_z = half_pl - constraints.left_setback
        rear_z = -half_pl + constraints.right_setback
        left_x = -half_pw + constraints.rear_setback
        right_x = half_pw - constraints.front_setback
    else:  # west
        front_z = half_pl - constraints.left_setback
        rear_z = -half_pl + constraints.right_setback
        left_x = -half_pw + constraints.front_setback
        right_x = half_pw - constraints.rear_setback

    buildable_min_x = min(left_x, right_x)
    buildable_max_x = max(left_x, right_x)
    buildable_min_z = min(rear_z, front_z)
    buildable_max_z = max(rear_z, front_z)

    avail_w = max(buildable_max_x - buildable_min_x, 2.0)
    avail_d = max(buildable_max_z - buildable_min_z, 2.0)

    # 2. Building footprint dimensions and placement
    target_footprint = validation.proposed_footprint_sqm
    # Target aspect ratio close to available envelope aspect ratio (or ~1.2)
    aspect_ratio = avail_w / avail_d if avail_d > 0 else 1.0
    aspect_ratio = max(0.6, min(1.6, aspect_ratio))

    # b_width * b_depth = target_footprint, b_width / b_depth = aspect_ratio
    calc_depth = math.sqrt(target_footprint / aspect_ratio)
    calc_width = calc_depth * aspect_ratio

    # Constrain building dimensions within buildable envelope
    b_width = min(calc_width, avail_w * 0.95)
    b_depth = min(calc_depth, avail_d * 0.95)

    # Re-normalize if squeezed
    b_width = max(4.0, round(b_width, 2))
    b_depth = max(5.0, round(b_depth, 2))

    # Center building inside buildable zone
    center_x = round((buildable_min_x + buildable_max_x) / 2.0, 2)
    center_z = round((buildable_min_z + buildable_max_z) / 2.0, 2)

    # 3. Floors and levels generation
    floor_count = reqs.num_floors
    total_building_height = round(floor_count * FLOOR_HEIGHT, 2)

    levels: List[Dict[str, Any]] = []
    balcony_data: List[Dict[str, Any]] = []
    window_data: List[Dict[str, Any]] = []
    door_data: List[Dict[str, Any]] = []

    # Material theme setup
    material_theme = get_material_palette(prefs.exterior_material, prefs.exterior_color)

    for floor_idx in range(floor_count):
        y_base = round(floor_idx * FLOOR_HEIGHT, 2)
        floor_name = "Ground Floor" if floor_idx == 0 else f"Level {floor_idx + 1}"
        
        # Subtle architectural articulation: upper floors can have subtle cantilever or setback
        f_width = b_width
        f_depth = b_depth
        f_offset_z = 0.0
        
        if floor_idx > 0 and prefs.architectural_style in ["modern", "contemporary"]:
            # Feature overhang / cantilever of 0.6m towards the front
            f_offset_z = 0.3

        level = {
            "floor_index": floor_idx,
            "name": floor_name,
            "y_base": y_base,
            "height": FLOOR_HEIGHT,
            "slab": {
                "width": round(f_width + 0.3, 2),
                "depth": round(f_depth + 0.3, 2),
                "thickness": SLAB_THICKNESS,
                "y": y_base
            },
            "walls": {
                "width": f_width,
                "depth": f_depth,
                "height": round(FLOOR_HEIGHT - SLAB_THICKNESS, 2),
                "thickness": 0.25,
                "center_x": center_x,
                "center_z": round(center_z + f_offset_z, 2),
                "y": round(y_base + SLAB_THICKNESS, 2)
            }
        }
        levels.append(level)

        # Windows generation
        # Add windows on front facade (+Z direction) and side facades
        window_y = round(y_base + 0.9, 2)
        window_height = 1.6
        if prefs.window_style == "floor_to_ceiling":
            window_y = round(y_base + 0.2, 2)
            window_height = 2.4
        elif prefs.window_style == "ribbon":
            window_y = round(y_base + 1.2, 2)
            window_height = 1.0

        # Front windows (e.g. 2 bay rhythm)
        bay_spacing = f_width / 3.0
        for i in [-1, 1]:
            window_data.append({
                "floor": floor_idx,
                "facade": "front",
                "x": round(center_x + (i * bay_spacing * 0.7), 2),
                "y": window_y,
                "z": round(center_z + f_offset_z + (f_depth / 2.0) + 0.05, 2),
                "width": round(min(2.2, bay_spacing * 0.75), 2),
                "height": window_height,
                "style": prefs.window_style
            })
            # Rear windows
            window_data.append({
                "floor": floor_idx,
                "facade": "rear",
                "x": round(center_x + (i * bay_spacing * 0.7), 2),
                "y": window_y,
                "z": round(center_z + f_offset_z - (f_depth / 2.0) - 0.05, 2),
                "width": round(min(1.8, bay_spacing * 0.65), 2),
                "height": window_height,
                "style": prefs.window_style
            })

        # Doors
        if floor_idx == 0:
            # Main entrance door at front center
            door_data.append({
                "floor": 0,
                "type": "main_entrance",
                "x": center_x,
                "y": SLAB_THICKNESS,
                "z": round(center_z + (f_depth / 2.0) + 0.05, 2),
                "width": 1.4,
                "height": 2.4,
                "facade": "front"
            })
        
        # Balcony on upper floors
        if floor_idx >= 1 and reqs.balcony_requirement:
            balcony_width = round(f_width * 0.6, 2)
            balcony_depth = 1.5
            balcony_z = round(center_z + f_offset_z + (f_depth / 2.0) + (balcony_depth / 2.0), 2)
            balcony_data.append({
                "floor": floor_idx,
                "x": center_x,
                "y": y_base,
                "z": balcony_z,
                "width": balcony_width,
                "depth": balcony_depth,
                "railing_height": 1.05,
                "style": prefs.balcony_style
            })
            # Balcony door from interior
            door_data.append({
                "floor": floor_idx,
                "type": "balcony_door",
                "x": center_x,
                "y": round(y_base + SLAB_THICKNESS, 2),
                "z": round(center_z + f_offset_z + (f_depth / 2.0) + 0.05, 2),
                "width": 1.6,
                "height": 2.3,
                "facade": "front"
            })

    # 4. Roof specification
    top_y = total_building_height
    roof_data = {
        "type": prefs.roof_type,
        "width": round(b_width + 0.6, 2),
        "depth": round(b_depth + 0.6, 2),
        "center_x": center_x,
        "center_z": center_z,
        "y_base": top_y,
        "overhang": 0.4,
        "parapet_height": 0.9 if prefs.roof_type in ["flat", "terrace"] else 0.0,
        "pitch_height": 1.8 if prefs.roof_type in ["sloped", "gabled"] else 0.0,
        "pergola": True if prefs.roof_type == "terrace" else False
    }

    # 5. Site and Landscaping
    road_width = 6.0
    road_rect = {
        "x": 0,
        "z": half_pl + (road_width / 2.0),
        "width": plot.plot_width + 8.0,
        "depth": road_width,
        "orientation": road_side
    }

    parking_bays: List[Dict[str, Any]] = []
    for p_idx in range(reqs.parking_spaces):
        # Place parking in front yard
        p_x = round(buildable_min_x + (p_idx * 3.0), 2)
        p_z = round(half_pl - (constraints.front_setback / 2.0), 2)
        parking_bays.append({
            "bay_number": p_idx + 1,
            "x": p_x,
            "z": p_z,
            "width": 2.6,
            "length": 5.0
        })

    landscaping = {
        "style": prefs.landscaping_style,
        "garden": reqs.garden_requirement,
        "road": road_rect,
        "parking_bays": parking_bays,
        "trees": [
            {"x": round(-half_pw + 2.5, 2), "z": round(half_pl - 2.5, 2), "radius": 1.2, "height": 4.5},
            {"x": round(half_pw - 2.5, 2), "z": round(half_pl - 2.5, 2), "radius": 1.0, "height": 4.0},
            {"x": round(-half_pw + 2.0, 2), "z": round(-half_pl + 2.0, 2), "radius": 1.4, "height": 5.0},
            {"x": round(half_pw - 2.0, 2), "z": round(-half_pl + 2.0, 2), "radius": 1.3, "height": 4.8}
        ]
    }

    geometry = GeometryMetadata(
        building_width=b_width,
        building_depth=b_depth,
        building_height=total_building_height,
        floor_height=FLOOR_HEIGHT,
        floor_count=floor_count,
        origin_x=center_x,
        origin_z=center_z,
        levels=levels,
        roof_data=roof_data,
        balcony_data=balcony_data,
        window_data=window_data,
        door_data=door_data,
        materials=material_theme,
        plot_boundary=plot_boundary,
        setbacks_rect={
            "min_x": buildable_min_x,
            "max_x": buildable_max_x,
            "min_z": buildable_min_z,
            "max_z": buildable_max_z,
            "width": avail_w,
            "depth": avail_d
        }
    )

    floorplan_summary = {
        "building_footprint_sqm": validation.proposed_footprint_sqm,
        "floor_count": floor_count,
        "bedrooms_allocated": reqs.num_bedrooms,
        "bathrooms_allocated": reqs.num_bathrooms,
        "has_balconies": reqs.balcony_requirement,
        "parking_stalls": reqs.parking_spaces
    }

    return DesignResponse(
        design_id=f"arch-{uuid.uuid4().hex[:8]}",
        project_name=plot.project_name,
        timestamp=str(uuid.uuid1()),
        plot=plot,
        constraints=constraints,
        requirements=reqs,
        preferences=prefs,
        validation=validation,
        geometry=geometry,
        floorplan_summary=floorplan_summary,
        disclaimer=validation.disclaimer
    )

def get_material_palette(material_choice: str, color_choice: str) -> Dict[str, Any]:
    # Architectural color themes
    wall_colors = {
        "warm_offwhite": "#F9F8F5",
        "charcoal_slate": "#24282F",
        "sand_terracotta": "#DFD3C3",
        "monochrome": "#EDEDED"
    }
    
    wall_base = wall_colors.get(color_choice, "#F9F8F5")
    
    palettes = {
        "concrete_white_stucco": {
            "wall_color": wall_base,
            "accent_color": "#D35400",  # Architectural orange
            "slab_color": "#E5E3DF",
            "glass_color": "#82B1B8",
            "frame_color": "#1F2421",
            "roof_color": "#333A42",
            "wood_color": "#9C6644",
            "roughness": 0.85,
            "metalness": 0.1
        },
        "warm_timber_brick": {
            "wall_color": wall_base,
            "accent_color": "#C0392B",
            "slab_color": "#C89666",
            "glass_color": "#90B8C0",
            "frame_color": "#2C3E50",
            "roof_color": "#4A3B32",
            "wood_color": "#8B5A2B",
            "roughness": 0.7,
            "metalness": 0.05
        },
        "exposed_concrete": {
            "wall_color": "#7F8C8D" if color_choice == "warm_offwhite" else wall_base,
            "accent_color": "#E67E22",
            "slab_color": "#5D6D7E",
            "glass_color": "#5DADE2",
            "frame_color": "#17202A",
            "roof_color": "#34495E",
            "wood_color": "#784212",
            "roughness": 0.95,
            "metalness": 0.2
        },
        "glass_steel": {
            "wall_color": "#EAEDED",
            "accent_color": "#D35400",
            "slab_color": "#2C3E50",
            "glass_color": "#3498DB",
            "frame_color": "#1B2631",
            "roof_color": "#212F3D",
            "wood_color": "#A04000",
            "roughness": 0.3,
            "metalness": 0.8
        },
        "stone_slate": {
            "wall_color": "#BFC9CA",
            "accent_color": "#E59866",
            "slab_color": "#566573",
            "glass_color": "#85C1E9",
            "frame_color": "#1C2833",
            "roof_color": "#2C3E50",
            "wood_color": "#6E2C00",
            "roughness": 0.9,
            "metalness": 0.15
        }
    }
    return palettes.get(material_choice, palettes["concrete_white_stucco"])
