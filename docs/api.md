# ArchNova AI — REST API Documentation

Base URL: `http://localhost:8000/api`

Interactive Swagger OpenAPI documentation is available live at `http://localhost:8000/docs`.

---

## 1. Authentication Endpoints

### Register User
- **POST** `/auth/register`
- **Body**:
  ```json
  {
    "email": "architect@studio.com",
    "password": "SecurePassword123!",
    "full_name": "Elena Vance"
  }
  ```
- **Response**: `201 Created`
  ```json
  {
    "access_token": "eyJhbGciOi...",
    "token_type": "bearer",
    "user": { "id": 1, "email": "architect@studio.com", "full_name": "Elena Vance" }
  }
  ```

### Login
- **POST** `/auth/login`
- **Body**: `{ "email": "architect@studio.com", "password": "SecurePassword123!" }`
- **Response**: `200 OK`

---

## 2. Parametric Design Endpoints

### Generate Parametric Design
- **POST** `/designs/generate`
- **Body**:
  ```json
  {
    "plot": {
      "project_name": "Modern Urban Villa",
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
      "balcony_requirement": true
    },
    "preferences": {
      "architectural_style": "modern",
      "roof_type": "flat",
      "window_style": "ribbon",
      "exterior_material": "concrete_white_stucco",
      "exterior_color": "warm_offwhite"
    }
  }
  ```
- **Response**: `200 OK` (Returns `design_id`, `geometry`, `validation`, and `floorplan_summary`)

### Validate Constraints Only
- **POST** `/designs/validate`
- **Response**: `200 OK` (Returns `ValidationResult` with FAR, site coverage, height, and advisory warnings)

### ArchNova Copilot AI Query
- **POST** `/designs/copilot`
- **Body**: `{ "prompt": "Design a 2-storey 3-bedroom villa with parking on a 25x30m lot" }`
- **Response**: `200 OK` (Returns `interpreted_intent`, `extracted_parameters`, `suggested_design`, and `explanation`)

---

## 3. Floor Plans & CAD Exports

### Generate 2D Floor Plan Layouts
- **POST** `/floorplans/generate`
- **Body**: Floor dimensions, setbacks, and room counts.
- **Response**: `200 OK` (JSON of non-overlapping room partitions, doors, windows, and circulation cores)

### Export Vector SVG Blueprint
- **POST** `/floorplans/svg?floor=0`
- **Response**: `200 OK` (`Content-Type: image/svg+xml`)

### Export AutoCAD DXF
- **POST** `/exports/dxf?floor=0`
- **Response**: `200 OK` (`Content-Type: application/dxf`) with layers:
  - `WALLS`
  - `DOORS`
  - `WINDOWS`
  - `ROOMS`
  - `DIMENSIONS`
  - `PLOT_BOUNDARY`
  - `SETBACKS`

---

## 4. Project Persistence Endpoints

- **GET** `/projects`: List saved studio projects for authenticated user
- **POST** `/projects`: Save new architectural project configuration
- **GET** `/projects/{id}`: Retrieve saved project by ID
- **PUT** `/projects/{id}`: Update project attributes
- **DELETE** `/projects/{id}`: Remove saved project
- **POST** `/projects/{id}/duplicate`: Clone an existing project
