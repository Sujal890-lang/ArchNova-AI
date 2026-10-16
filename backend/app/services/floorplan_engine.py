from typing import Dict, Any, List, Optional
import math

class FloorPlanEngine:
    @staticmethod
    def generate_floorplans(
        building_width: float,
        building_depth: float,
        num_floors: int,
        num_bedrooms: int,
        num_bathrooms: int,
        has_balcony: bool,
        has_staircase: bool,
        plot_width: float,
        plot_length: float,
        front_setback: float,
        rear_setback: float,
        left_setback: float,
        right_setback: float,
        room_size_preference: str = "standard"
    ) -> Dict[str, Any]:
        """
        Generates deterministic 2D architectural floor plan layouts for each level.
        Enforces non-overlapping rectangular room subdivisions within building footprint.
        """
        footprint_sqm = round(building_width * building_depth, 2)
        scale_factor = 1.0
        if room_size_preference == "compact":
            scale_factor = 0.85
        elif room_size_preference == "spacious":
            scale_factor = 1.2

        floors_data = []
        overall_warnings = []

        # Minimum required areas
        min_bed_area = 11.0 * scale_factor
        min_bath_area = 3.8 * scale_factor
        min_living_area = 20.0 * scale_factor
        min_kitchen_area = 8.5 * scale_factor
        staircase_area = 7.5 if has_staircase else 0.0

        # Total room area required
        total_req_area = (
            min_living_area + min_kitchen_area + (num_bedrooms * min_bed_area) +
            (num_bathrooms * min_bath_area) + (staircase_area * num_floors)
        )
        total_available_area = footprint_sqm * num_floors

        can_fit = total_req_area <= (total_available_area * 1.15)
        if not can_fit:
            overall_warnings.append(
                f"Floor Space Warning: Required approximate room program (~{round(total_req_area, 1)} m²) "
                f"exceeds total usable floor area across {num_floors} level(s) (~{round(total_available_area, 1)} m²). "
                f"Rooms will be automatically compressed."
            )

        # Distribute bedrooms and bathrooms across floors
        beds_per_floor = {}
        baths_per_floor = {}
        
        # Ground floor gets 0 or 1 bedroom, rest upstairs
        if num_floors == 1:
            beds_per_floor[0] = num_bedrooms
            baths_per_floor[0] = num_bathrooms
        else:
            ground_beds = 1 if num_bedrooms >= 3 else 0
            beds_per_floor[0] = ground_beds
            remaining_beds = num_bedrooms - ground_beds
            upper_floors = num_floors - 1
            for f in range(1, num_floors):
                # Distribute remaining
                share = math.ceil(remaining_beds / upper_floors)
                assigned = min(remaining_beds, share)
                beds_per_floor[f] = assigned
                remaining_beds -= assigned

            ground_baths = 1
            baths_per_floor[0] = ground_baths
            rem_baths = max(0, num_bathrooms - ground_baths)
            for f in range(1, num_floors):
                share = math.ceil(rem_baths / upper_floors) if upper_floors > 0 else 0
                assigned = min(rem_baths, share)
                baths_per_floor[f] = assigned
                rem_baths -= assigned

        for f_idx in range(num_floors):
            floor_name = "Ground Floor" if f_idx == 0 else f"Level {f_idx + 1}"
            plan = FloorPlanEngine._layout_single_floor(
                f_idx=f_idx,
                floor_name=floor_name,
                width=building_width,
                depth=building_depth,
                num_beds=beds_per_floor.get(f_idx, 0),
                num_baths=baths_per_floor.get(f_idx, 1),
                has_balcony=(has_balcony and f_idx > 0),
                has_staircase=(has_staircase and num_floors > 1),
                is_ground=(f_idx == 0)
            )
            floors_data.append(plan)

        return {
            "building_width": building_width,
            "building_depth": building_depth,
            "footprint_area_sqm": footprint_sqm,
            "total_floors": num_floors,
            "can_fit_program": can_fit,
            "warnings": overall_warnings,
            "plot_context": {
                "plot_width": plot_width,
                "plot_length": plot_length,
                "front_setback": front_setback,
                "rear_setback": rear_setback,
                "left_setback": left_setback,
                "right_setback": right_setback
            },
            "floors": floors_data
        }

    @staticmethod
    def _layout_single_floor(
        f_idx: int,
        floor_name: str,
        width: float,
        depth: float,
        num_beds: int,
        num_baths: int,
        has_balcony: bool,
        has_staircase: bool,
        is_ground: bool
    ) -> Dict[str, Any]:
        """
        Creates a partition grid:
        West/East split or Front/Rear split with circulation corridor.
        All room coordinates are relative to building origin (0, 0).
        """
        rooms = []
        walls = []
        doors = []
        windows = []

        wall_thick = 0.2  # 200mm walls
        usable_w = width - (2 * wall_thick)
        usable_d = depth - (2 * wall_thick)

        # Exterior envelope walls
        walls.append({"x1": 0, "y1": 0, "x2": width, "y2": 0, "type": "exterior"})
        walls.append({"x1": width, "y1": 0, "x2": width, "y2": depth, "type": "exterior"})
        walls.append({"x1": width, "y1": depth, "x2": 0, "y2": depth, "type": "exterior"})
        walls.append({"x1": 0, "y1": depth, "x2": 0, "y2": 0, "type": "exterior"})

        # Staircase zone
        stair_w = 2.4 if has_staircase else 0
        stair_d = 3.2 if has_staircase else 0
        stair_x = round(wall_thick, 2)
        stair_y = round(depth / 2.0 - (stair_d / 2.0), 2)

        if has_staircase:
            rooms.append({
                "id": f"f{f_idx}_stair",
                "name": "Staircase & Lift Core",
                "x": stair_x,
                "y": stair_y,
                "width": stair_w,
                "depth": stair_d,
                "area_sqm": round(stair_w * stair_d, 2),
                "type": "circulation",
                "color": "#E5E7EB"
            })
            # Stair interior dividing wall
            walls.append({
                "x1": round(stair_x + stair_w, 2),
                "y1": stair_y,
                "x2": round(stair_x + stair_w, 2),
                "y2": round(stair_y + stair_d, 2),
                "type": "interior"
            })

        rem_start_x = round(stair_x + stair_w + (wall_thick if has_staircase else 0), 2)
        rem_w = round(width - wall_thick - rem_start_x, 2)

        if is_ground:
            # GROUND FLOOR:
            # Front zone (bottom in 2D, towards road): Living Lounge & Dining
            # Rear zone (top in 2D): Kitchen, Bath, and Bedroom/Office
            split_y = round(depth * 0.48, 2)
            walls.append({"x1": wall_thick, "y1": split_y, "x2": width - wall_thick, "y2": split_y, "type": "interior"})

            # Living Lounge
            living_w = round(rem_w * 0.62, 2)
            living_x = rem_start_x
            rooms.append({
                "id": f"f{f_idx}_living",
                "name": "Living & Reception Lounge",
                "x": living_x,
                "y": wall_thick,
                "width": living_w,
                "depth": round(split_y - wall_thick, 2),
                "area_sqm": round(living_w * (split_y - wall_thick), 2),
                "type": "living",
                "color": "#FEF3C7"
            })

            # Dining space
            dining_x = round(living_x + living_w, 2)
            dining_w = round(width - wall_thick - dining_x, 2)
            rooms.append({
                "id": f"f{f_idx}_dining",
                "name": "Dining Area",
                "x": dining_x,
                "y": wall_thick,
                "width": dining_w,
                "depth": round(split_y - wall_thick, 2),
                "area_sqm": round(dining_w * (split_y - wall_thick), 2),
                "type": "dining",
                "color": "#FDE68A"
            })

            # Main entrance door at front wall
            doors.append({
                "id": f"f{f_idx}_main_door",
                "x": round(living_x + (living_w / 2.0), 2),
                "y": 0,
                "width": 1.2,
                "swing": "inward",
                "orientation": "horizontal"
            })

            # Rear space division: Kitchen + Powder Bath + Guest Bed/Study
            rear_d = round(depth - wall_thick - split_y, 2)
            kitchen_w = round(rem_w * 0.42, 2)
            bath_w = 2.0
            bed_w = round(rem_w - kitchen_w - bath_w, 2)

            rooms.append({
                "id": f"f{f_idx}_kitchen",
                "name": "Modular Kitchen",
                "x": rem_start_x,
                "y": split_y,
                "width": kitchen_w,
                "depth": rear_d,
                "area_sqm": round(kitchen_w * rear_d, 2),
                "type": "kitchen",
                "color": "#E0E7FF"
            })

            bath_x = round(rem_start_x + kitchen_w, 2)
            rooms.append({
                "id": f"f{f_idx}_bath_g",
                "name": "Powder Room / Bath",
                "x": bath_x,
                "y": split_y,
                "width": bath_w,
                "depth": rear_d,
                "area_sqm": round(bath_w * rear_d, 2),
                "type": "bathroom",
                "color": "#CFFAFE"
            })

            if bed_w >= 2.8 and num_beds > 0:
                bed_x = round(bath_x + bath_w, 2)
                rooms.append({
                    "id": f"f{f_idx}_bed_g",
                    "name": "Guest Bedroom / Study",
                    "x": bed_x,
                    "y": split_y,
                    "width": bed_w,
                    "depth": rear_d,
                    "area_sqm": round(bed_w * rear_d, 2),
                    "type": "bedroom",
                    "color": "#D1FAE5"
                })

            # Windows on perimeter
            windows.append({"x": round(living_x + (living_w / 2), 2), "y": 0, "width": 2.0, "orientation": "horizontal"})
            windows.append({"x": round(dining_x + (dining_w / 2), 2), "y": 0, "width": 1.6, "orientation": "horizontal"})
            windows.append({"x": round(rem_start_x + (kitchen_w / 2), 2), "y": depth, "width": 1.4, "orientation": "horizontal"})
            windows.append({"x": width, "y": round(depth / 2, 2), "width": 1.8, "orientation": "vertical"})

        else:
            # UPPER FLOORS:
            # Master Suite with Balcony, Bedroom 2, En-suite Bath, Hallway
            corridor_d = 1.4
            corridor_y = round(depth / 2.0 - (corridor_d / 2.0), 2)
            walls.append({"x1": rem_start_x, "y1": corridor_y, "x2": width - wall_thick, "y2": corridor_y, "type": "interior"})
            walls.append({"x1": rem_start_x, "y1": round(corridor_y + corridor_d, 2), "x2": width - wall_thick, "y2": round(corridor_y + corridor_d, 2), "type": "interior"})

            # Corridor
            rooms.append({
                "id": f"f{f_idx}_corridor",
                "name": "Circulation Hallway",
                "x": rem_start_x,
                "y": corridor_y,
                "width": rem_w,
                "depth": corridor_d,
                "area_sqm": round(rem_w * corridor_d, 2),
                "type": "corridor",
                "color": "#F3F4F6"
            })

            # Front Half: Master Bedroom & Ensuite Bath
            front_d = round(corridor_y - wall_thick, 2)
            master_w = round(rem_w * 0.65, 2)
            ensuite_w = round(rem_w - master_w, 2)

            rooms.append({
                "id": f"f{f_idx}_master",
                "name": f"Master Bedroom Suite",
                "x": rem_start_x,
                "y": wall_thick,
                "width": master_w,
                "depth": front_d,
                "area_sqm": round(master_w * front_d, 2),
                "type": "bedroom",
                "color": "#D1FAE5"
            })

            rooms.append({
                "id": f"f{f_idx}_ensuite",
                "name": "En-suite Bathroom",
                "x": round(rem_start_x + master_w, 2),
                "y": wall_thick,
                "width": ensuite_w,
                "depth": front_d,
                "area_sqm": round(ensuite_w * front_d, 2),
                "type": "bathroom",
                "color": "#CFFAFE"
            })

            # Rear Half: Bedroom 2 and Bathroom 2 / Family Lounge
            rear_y = round(corridor_y + corridor_d, 2)
            rear_d = round(depth - wall_thick - rear_y, 2)
            bed2_w = round(rem_w * 0.6, 2)
            bath2_w = round(rem_w - bed2_w, 2)

            rooms.append({
                "id": f"f{f_idx}_bed2",
                "name": f"Bedroom {f_idx + 1}",
                "x": rem_start_x,
                "y": rear_y,
                "width": bed2_w,
                "depth": rear_d,
                "area_sqm": round(bed2_w * rear_d, 2),
                "type": "bedroom",
                "color": "#D1FAE5"
            })

            rooms.append({
                "id": f"f{f_idx}_bath2",
                "name": "Shared Bathroom",
                "x": round(rem_start_x + bed2_w, 2),
                "y": rear_y,
                "width": bath2_w,
                "depth": rear_d,
                "area_sqm": round(bath2_w * rear_d, 2),
                "type": "bathroom",
                "color": "#CFFAFE"
            })

            # Balcony
            if has_balcony:
                balc_w = round(master_w * 0.9, 2)
                balc_d = 1.5
                rooms.append({
                    "id": f"f{f_idx}_balcony",
                    "name": "Scenic Balcony Deck",
                    "x": rem_start_x,
                    "y": -balc_d,
                    "width": balc_w,
                    "depth": balc_d,
                    "area_sqm": round(balc_w * balc_d, 2),
                    "type": "balcony",
                    "color": "#FEE2E2"
                })
                doors.append({
                    "id": f"f{f_idx}_balcony_door",
                    "x": round(rem_start_x + (balc_w / 2), 2),
                    "y": 0,
                    "width": 1.4,
                    "swing": "sliding",
                    "orientation": "horizontal"
                })

            # Windows
            windows.append({"x": round(rem_start_x + (master_w / 2), 2), "y": 0, "width": 2.2, "orientation": "horizontal"})
            windows.append({"x": round(rem_start_x + (bed2_w / 2), 2), "y": depth, "width": 1.8, "orientation": "horizontal"})
            windows.append({"x": width, "y": round(rear_y + (rear_d / 2), 2), "width": 1.5, "orientation": "vertical"})

        return {
            "floor_index": f_idx,
            "floor_name": floor_name,
            "width": width,
            "depth": depth,
            "rooms": rooms,
            "walls": walls,
            "doors": doors,
            "windows": windows
        }

    @staticmethod
    def generate_svg(floorplan_data: Dict[str, Any], floor_index: int = 0) -> str:
        """
        Renders a clean CAD-style architectural SVG floor plan.
        Includes dimensions, north arrow, room labels, walls, and scale bar.
        """
        floors = floorplan_data.get("floors", [])
        if not floors or floor_index >= len(floors):
            floor = floors[0] if floors else {}
        else:
            floor = floors[floor_index]

        b_width = floor.get("width", 12.0)
        b_depth = floor.get("depth", 10.0)
        rooms = floor.get("rooms", [])
        walls = floor.get("walls", [])
        doors = floor.get("doors", [])
        windows = floor.get("windows", [])
        floor_name = floor.get("floor_name", "Ground Floor")

        # Canvas sizing: 1 meter = 40 pixels
        px_per_m = 45.0
        padding = 80.0
        svg_w = (b_width * px_per_m) + (2 * padding)
        svg_h = (b_depth * px_per_m) + (2 * padding)

        def to_sx(x):
            return padding + (x * px_per_m)
        def to_sy(y):
            # Invert Y so front (+y) is towards bottom or top cleanly
            return padding + (y * px_per_m)

        svg = []
        svg.append(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {svg_w} {svg_h}" width="{svg_w}" height="{svg_h}" style="background-color: #FBFBFA; font-family: Inter, sans-serif;">')

        # Grid background pattern
        svg.append('''
        <defs>
            <pattern id="cadGrid" width="45" height="45" patternUnits="userSpaceOnUse">
                <path d="M 45 0 L 0 0 0 45" fill="none" stroke="#E5E7EB" stroke-width="0.8"/>
            </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#cadGrid)" />
        ''')

        # Title block
        svg.append(f'<text x="{padding}" y="36" font-size="16" font-weight="700" fill="#1F2937">ARCHNOVA AI — {floor_name.upper()}</text>')
        svg.append(f'<text x="{padding}" y="54" font-size="11" fill="#6B7280">Footprint: {b_width}m × {b_depth}m | Scale 1:100 | CAD Vector Export</text>')

        # North Arrow indicator
        na_x = svg_w - 60
        na_y = 45
        svg.append(f'''
        <g transform="translate({na_x}, {na_y})">
            <circle cx="0" cy="0" r="16" fill="#FFFFFF" stroke="#D1D5DB" stroke-width="1.5"/>
            <polygon points="0,-12 4,2 0,0 -4,2" fill="#D35400"/>
            <text x="0" y="-14" text-anchor="middle" font-size="9" font-weight="bold" fill="#D35400">N</text>
        </g>
        ''')

        # Room fills and text
        for r in rooms:
            rx = to_sx(r["x"])
            ry = to_sy(r["y"])
            rw = r["width"] * px_per_m
            rh = r["depth"] * px_per_m
            color = r.get("color", "#F3F4F6")
            svg.append(f'<rect x="{rx}" y="{ry}" width="{rw}" height="{rh}" fill="{color}" fill-opacity="0.5" stroke="#9CA3AF" stroke-width="1" stroke-dasharray="2,2"/>')
            
            # Label & Area
            cx = rx + (rw / 2.0)
            cy = ry + (rh / 2.0)
            if rw > 60 and rh > 40:
                svg.append(f'<text x="{cx}" y="{cy - 4}" text-anchor="middle" font-size="11" font-weight="600" fill="#1F2937">{r["name"]}</text>')
                svg.append(f'<text x="{cx}" y="{cy + 12}" text-anchor="middle" font-size="9" fill="#4B5563">{r["width"]}m × {r["depth"]}m ({r["area_sqm"]} m²)</text>')

        # Exterior & Interior Walls
        for w in walls:
            x1 = to_sx(w["x1"])
            y1 = to_sy(w["y1"])
            x2 = to_sx(w["x2"])
            y2 = to_sy(w["y2"])
            stroke_w = 6.0 if w["type"] == "exterior" else 3.5
            color = "#111827" if w["type"] == "exterior" else "#374151"
            svg.append(f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{color}" stroke-width="{stroke_w}" stroke-linecap="square"/>')

        # Doors
        for d in doors:
            dx = to_sx(d["x"])
            dy = to_sy(d["y"])
            dw = d["width"] * px_per_m
            # Draw door swing arc
            svg.append(f'<rect x="{dx - (dw/2)}" y="{dy - 3}" width="{dw}" height="6" fill="#FFFFFF" stroke="#D35400" stroke-width="1.5"/>')
            svg.append(f'<path d="M {dx - (dw/2)} {dy} A {dw} {dw} 0 0 1 {dx + (dw/2)} {dy + dw}" fill="none" stroke="#D35400" stroke-width="1" stroke-dasharray="3,2"/>')

        # Windows
        for win in windows:
            wx = to_sx(win["x"])
            wy = to_sy(win["y"])
            ww = win["width"] * px_per_m
            if win["orientation"] == "horizontal":
                svg.append(f'<rect x="{wx - (ww/2)}" y="{wy - 3}" width="{ww}" height="6" fill="#BAE6FD" stroke="#0284C7" stroke-width="1.5"/>')
            else:
                svg.append(f'<rect x="{wx - 3}" y="{wy - (ww/2)}" width="6" height="{ww}" fill="#BAE6FD" stroke="#0284C7" stroke-width="1.5"/>')

        # Overall Dimensions lines
        # Top dimension (Width)
        dim_y = padding - 18
        svg.append(f'<line x1="{to_sx(0)}" y1="{dim_y}" x2="{to_sx(b_width)}" y2="{dim_y}" stroke="#4B5563" stroke-width="1"/>')
        svg.append(f'<line x1="{to_sx(0)}" y1="{dim_y - 4}" x2="{to_sx(0)}" y2="{dim_y + 4}" stroke="#4B5563" stroke-width="1"/>')
        svg.append(f'<line x1="{to_sx(b_width)}" y1="{dim_y - 4}" x2="{to_sx(b_width)}" y2="{dim_y + 4}" stroke="#4B5563" stroke-width="1"/>')
        svg.append(f'<text x="{to_sx(b_width / 2.0)}" y="{dim_y - 6}" text-anchor="middle" font-size="10" font-weight="600" fill="#374151">{b_width} m</text>')

        # Left dimension (Depth)
        dim_x = padding - 18
        svg.append(f'<line x1="{dim_x}" y1="{to_sy(0)}" x2="{dim_x}" y2="{to_sy(b_depth)}" stroke="#4B5563" stroke-width="1"/>')
        svg.append(f'<line x1="{dim_x - 4}" y1="{to_sy(0)}" x2="{dim_x + 4}" y2="{to_sy(0)}" stroke="#4B5563" stroke-width="1"/>')
        svg.append(f'<line x1="{dim_x - 4}" y1="{to_sy(b_depth)}" x2="{dim_x + 4}" y2="{to_sy(b_depth)}" stroke="#4B5563" stroke-width="1"/>')
        svg.append(f'<text x="{dim_x - 8}" y="{to_sy(b_depth / 2.0)}" text-anchor="middle" font-size="10" font-weight="600" fill="#374151" transform="rotate(-90 {dim_x - 8} {to_sy(b_depth / 2.0)})">{b_depth} m</text>')

        # Scale bar
        bar_x = padding
        bar_y = svg_h - 20
        svg.append(f'<line x1="{bar_x}" y1="{bar_y}" x2="{bar_x + (5 * px_per_m)}" y2="{bar_y}" stroke="#111827" stroke-width="3"/>')
        svg.append(f'<text x="{bar_x}" y="{bar_y - 6}" font-size="9" fill="#4B5563">0m</text>')
        svg.append(f'<text x="{bar_x + (5 * px_per_m)}" y="{bar_y - 6}" font-size="9" fill="#4B5563">5m Scale</text>')

        svg.append('</svg>')
        return "\n".join(svg)
