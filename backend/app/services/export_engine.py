import io
import json
from typing import Dict, Any
import ezdxf

class ExportEngine:
    @staticmethod
    def generate_dxf(floorplan_data: Dict[str, Any], floor_index: int = 0) -> str:
        """
        Generates standard AutoCAD R2010 DXF document with organized layers:
        - WALLS (color 7 / white-black)
        - DOORS (color 30 / orange)
        - WINDOWS (color 140 / cyan-blue)
        - ROOMS (color 8 / grey text labels)
        - DIMENSIONS (color 1 / red)
        - PLOT_BOUNDARY (color 3 / green)
        - SETBACKS (color 40 / dash-dot orange)
        """
        doc = ezdxf.new("R2010", setup=True)
        msp = doc.modelspace()

        # Define layers with colors
        layers = [
            ("WALLS", 7),
            ("DOORS", 30),
            ("WINDOWS", 140),
            ("ROOMS", 8),
            ("DIMENSIONS", 1),
            ("PLOT_BOUNDARY", 3),
            ("SETBACKS", 40)
        ]
        for layer_name, color in layers:
            if layer_name not in doc.layers:
                doc.layers.new(name=layer_name, dxfattribs={"color": color})

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

        # Plot & Setbacks context if available
        plot_ctx = floorplan_data.get("plot_context", {})
        pw = plot_ctx.get("plot_width", b_width + 8.0)
        pl = plot_ctx.get("plot_length", b_depth + 8.0)
        fs = plot_ctx.get("front_setback", 3.0)
        rs = plot_ctx.get("rear_setback", 2.5)
        ls = plot_ctx.get("left_setback", 2.0)
        rts = plot_ctx.get("right_setback", 2.0)

        # Plot boundary (centered around building or with offset)
        plot_x0 = -ls
        plot_y0 = -fs
        plot_x1 = plot_x0 + pw
        plot_y1 = plot_y0 + pl

        msp.add_lwpolyline(
            [(plot_x0, plot_y0), (plot_x1, plot_y0), (plot_x1, plot_y1), (plot_x0, plot_y1)],
            close=True,
            dxfattribs={"layer": "PLOT_BOUNDARY"}
        )

        # Setback envelope
        msp.add_lwpolyline(
            [(0, 0), (b_width, 0), (b_width, b_depth), (0, b_depth)],
            close=True,
            dxfattribs={"layer": "SETBACKS"}
        )

        # Walls
        for w in walls:
            msp.add_line(
                (w["x1"], w["y1"]),
                (w["x2"], w["y2"]),
                dxfattribs={"layer": "WALLS"}
            )

        # Rooms (rectangles + text annotations)
        for r in rooms:
            rx = r["x"]
            ry = r["y"]
            rw = r["width"]
            rd = r["depth"]
            msp.add_lwpolyline(
                [(rx, ry), (rx + rw, ry), (rx + rw, ry + rd), (rx, ry + rd)],
                close=True,
                dxfattribs={"layer": "ROOMS"}
            )
            # Add room text label
            cx = rx + (rw / 2.0)
            cy = ry + (rd / 2.0)
            label = f"{r['name']}\n{r['width']}x{r['depth']}m ({r['area_sqm']}m2)"
            msp.add_text(
                label,
                dxfattribs={
                    "layer": "ROOMS",
                    "height": 0.35,
                    "insert": (cx - (rw * 0.3), cy)
                }
            )

        # Doors
        for d in doors:
            dx = d["x"]
            dy = d["y"]
            dw = d["width"]
            msp.add_line((dx - dw / 2, dy), (dx + dw / 2, dy), dxfattribs={"layer": "DOORS"})
            msp.add_arc(
                center=(dx - dw / 2, dy),
                radius=dw,
                start_angle=0,
                end_angle=90,
                dxfattribs={"layer": "DOORS"}
            )

        # Windows
        for win in windows:
            wx = win["x"]
            wy = win["y"]
            ww = win["width"]
            if win.get("orientation") == "horizontal":
                msp.add_line((wx - ww / 2, wy), (wx + ww / 2, wy), dxfattribs={"layer": "WINDOWS"})
            else:
                msp.add_line((wx, wy - ww / 2), (wx, wy + ww / 2), dxfattribs={"layer": "WINDOWS"})

        # Dimensions
        dim_y = -1.2
        msp.add_line((0, dim_y), (b_width, dim_y), dxfattribs={"layer": "DIMENSIONS"})
        msp.add_text(
            f"WIDTH: {b_width:.2f} m",
            dxfattribs={"layer": "DIMENSIONS", "height": 0.3, "insert": (b_width / 2 - 1.0, dim_y - 0.5)}
        )

        dim_x = -1.2
        msp.add_line((dim_x, 0), (dim_x, b_depth), dxfattribs={"layer": "DIMENSIONS"})
        msp.add_text(
            f"DEPTH: {b_depth:.2f} m",
            dxfattribs={"layer": "DIMENSIONS", "height": 0.3, "insert": (dim_x - 1.5, b_depth / 2)}
        )

        # Write to string stream
        stream = io.StringIO()
        doc.write(stream)
        return stream.getvalue()

    @staticmethod
    def export_json(project_data: Dict[str, Any]) -> str:
        return json.dumps(project_data, indent=2, default=str)
