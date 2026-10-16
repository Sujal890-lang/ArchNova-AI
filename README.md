# ArchNova AI — Intelligent Parametric Architecture & 3D Building Design Platform

ArchNova AI is a modern generative architecture, computational design, and 3D visualization platform. It empowers architects, urban planners, and developers to input land property dimensions, establish zoning setbacks, synthesize responsive 3D parametric buildings, evaluate municipal FAR/site coverage compliance, and export production-ready AutoCAD DXF blueprints and SVG floor plans.

---

## 🌟 Key Features

1. **Parametric 3D Building Generator (Three.js & WebGL)**:
   - Real-time procedural massing responding to plot width, length, road access orientation, and storeys.
   - Interactive camera controls: 3D Isometric, Top-Down CAD, Front Elevation, and Perspective.
   - **Exploded Floor View Slider**: Elevates floor slabs and roof along the Y-axis to inspect floor plates.
   - **Daylight Simulation**: Simulates sun angle and shadow dynamics for Morning, High Noon, Golden Hour, and Night.
   - Toggles for Site Boundary, Setback Envelopes, Architectural Grid, and Landscaping.

2. **5-Step Property & Planning Wizard**:
   - **Step 1: Property Details**: Plot width, length, road access side, north angle, and automated $\text{m}^2$ & $\text{ft}^2$ area calculation.
   - **Step 2: Planning Limits**: Front/rear/side setbacks, maximum permitted FAR/FSI, site coverage %, and height constraints.
   - **Step 3: Program & Requirements**: Building type (residential, commercial, mixed-use, apartment, office), storeys, bedrooms, bathrooms, and parking bays.
   - **Step 4: Design Aesthetics**: Architectural styles (modern, minimalist, contemporary, traditional, industrial, tropical), roof typologies (flat parapet, sloped shed, gabled pitch, rooftop terrace with pergola), and fenestration styles.
   - **Step 5: Review & Synthesis**: Real-time constraint validation report and design generation.

3. **Planning & Compliance Dashboard**:
   - Evaluates user-defined criteria against proposed geometry:
     - Site Coverage % vs Limit
     - Floor Area Ratio (FAR/FSI) vs Max Permitted
     - Building Height vs Height Restriction
     - Parking stalls provided vs required
   - Visual spatial budget comparison bar charts powered by Recharts.
   - Color-coded advisory warnings and actionable spatial recommendations.

4. **ArchNova Copilot (AI Design Assistant)**:
   - Natural-language generative design prompt interface.
   - Converts natural requests (e.g. *"Design a modern two-floor home on a 30 m by 20 m plot with parking"*) into validated parametric JSON models.
   - Explains architectural trade-offs, massing logic, and planning caveats.
   - One-click application of synthesized parameters into the active 3D model.

5. **2D CAD Floor Plan Synthesizer & Exports**:
   - Algorithmic non-overlapping rectangular room zoning (Living, Dining, Kitchen, Bedrooms, Bathrooms, Corridors, Staircases, Balconies).
   - Multi-floor level switcher (Ground Floor, Level 1, Level 2...).
   - **AutoCAD DXF Export** using `ezdxf` with organized CAD layers (`WALLS`, `DOORS`, `WINDOWS`, `ROOMS`, `DIMENSIONS`, `PLOT_BOUNDARY`, `SETBACKS`).
   - **Vector SVG Blueprint Export** with dimension annotations and North indicator.
   - **Project JSON Metadata Export** with complete geometry coordinates.

6. **Project Persistence & Authentication**:
   - JWT authentication and bcrypt password hashing.
   - Save, open, duplicate, and delete architectural projects.
   - SQLite for local development and PostgreSQL compatibility for production.

---

## 🏗️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, Three.js, React Three Fiber, Drei, Tailwind CSS, Lucide React, Recharts |
| **Backend** | Python 3.11+, FastAPI, Uvicorn, Pydantic v2, NumPy, Shapely, ezdxf |
| **Database** | SQLite (dev) / PostgreSQL (prod), SQLAlchemy ORM |
| **CAD & Graphics** | ezdxf (AutoCAD R2010), SVG 2D Vector Rendering, WebGL / Three.js Shaders |
| **Testing** | pytest, FastAPI TestClient, Vite Oxlint / Build |
| **Deployment** | Docker Compose, Vercel (Frontend), Render / Railway (Backend) |

---

## 🚀 Quickstart & Local Installation

### Prerequisites
- Node.js (v18+ or v20+)
- Python (v3.10+ or v3.13+)

### 1. Clone the Repository
```bash
cd archnova-ai
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
The backend API is now live at `http://127.0.0.1:8000` with Swagger docs at `http://127.0.0.1:8000/docs`.

### 3. Frontend Setup
In a new terminal:
```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🧪 Automated Testing

Run the Python backend test suite:
```bash
cd backend
python -m pytest tests/
```
Output:
```
============================= test session starts =============================
collected 13 items

tests\test_api.py .....                                                  [ 38%]
tests\test_calculations.py ....                                          [ 69%]
tests\test_exports.py ..                                                 [ 84%]
tests\test_floorplan.py ..                                               [100%]
======================= 13 passed in 4.40s ========================
```

Validate frontend production build:
```bash
cd frontend
npm run build
```

---

## 🐳 Docker Deployment

Run both frontend and backend using Docker Compose:
```bash
docker-compose up --build
```

---

## ⚠️ Limitations & Responsible Use

> **Planning & Legal Disclaimer**: ArchNova AI is a computational conceptual design tool. All planning calculations (FAR, site coverage, height, setbacks) evaluate user-specified inputs and rules-of-thumb. ArchNova AI does not certify statutory building compliance or structural load engineering. Always consult licensed architects and professional engineers before construction.
