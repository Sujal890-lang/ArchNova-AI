from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class PlotInput(BaseModel):
    project_name: str = Field(default="ArchNova Modern Villa", description="Name of the project")
    plot_width: float = Field(default=20.0, gt=0, description="Plot width in meters")
    plot_length: float = Field(default=30.0, gt=0, description="Plot length in meters")
    plot_shape: str = Field(default="rectangular", description="Shape of the plot")
    road_facing_side: str = Field(default="south", description="Which side faces the primary access road")
    num_road_facing_sides: int = Field(default=1, ge=1, le=4, description="Number of road-facing sides")
    north_direction: float = Field(default=0.0, ge=0, le=360, description="North rotation angle in degrees")
    site_location: Optional[str] = Field(default="Sector 42, Eco Urban Zone", description="Optional location or coordinates")
    terrain: str = Field(default="flat", description="Terrain assumption: flat, gentle_slope, steep")

class PlanningConstraintsInput(BaseModel):
    max_height: float = Field(default=12.0, gt=0, description="Maximum permitted building height in meters")
    front_setback: float = Field(default=3.5, ge=0, description="Front setback distance from boundary in meters")
    rear_setback: float = Field(default=3.0, ge=0, description="Rear setback distance in meters")
    left_setback: float = Field(default=2.0, ge=0, description="Left setback distance in meters")
    right_setback: float = Field(default=2.0, ge=0, description="Right setback distance in meters")
    max_far: float = Field(default=1.8, gt=0, description="Maximum Floor Area Ratio (FAR / FSI)")
    max_site_coverage: float = Field(default=60.0, ge=10, le=100, description="Maximum site coverage percentage (10-100%)")
    max_floors: int = Field(default=3, ge=1, le=20, description="Maximum number of permissible floors")
    parking_spaces_required: int = Field(default=2, ge=0, description="Mandatory minimum parking spaces")

class BuildingRequirementsInput(BaseModel):
    building_type: str = Field(default="residential", description="residential, commercial, mixed_use, office, small_apartment")
    num_bedrooms: int = Field(default=3, ge=1, le=20)
    num_bathrooms: int = Field(default=3, ge=1, le=20)
    num_floors: int = Field(default=2, ge=1, le=20)
    preferred_footprint: Optional[float] = Field(default=None, description="Preferred ground footprint in sq meters")
    approx_room_sizes: str = Field(default="standard", description="compact, standard, spacious")
    parking_spaces: int = Field(default=2, ge=0)
    balcony_requirement: bool = Field(default=True)
    garden_requirement: bool = Field(default=True)
    terrace_requirement: bool = Field(default=True)
    staircase_requirement: bool = Field(default=True)
    lift_requirement: bool = Field(default=False)

class DesignPreferencesInput(BaseModel):
    architectural_style: str = Field(default="modern", description="modern, minimalist, contemporary, traditional, industrial, tropical")
    roof_type: str = Field(default="flat", description="flat, sloped, gabled, terrace")
    window_style: str = Field(default="ribbon", description="ribbon, floor_to_ceiling, punched_openings, industrial_grid")
    exterior_material: str = Field(default="warm_timber_brick", description="concrete_white_stucco, warm_timber_brick, exposed_concrete, glass_steel, stone_slate")
    exterior_color: str = Field(default="warm_offwhite", description="warm_offwhite, charcoal_slate, sand_terracotta, monochrome")
    balcony_style: str = Field(default="cantilever_glass", description="cantilever_glass, recessed_timber, steel_cable")
    landscaping_style: str = Field(default="geometric_courtyard", description="minimalist_zen, lush_tropical, geometric_courtyard, drought_tolerant")

class FullDesignRequest(BaseModel):
    plot: PlotInput = Field(default_factory=PlotInput)
    constraints: PlanningConstraintsInput = Field(default_factory=PlanningConstraintsInput)
    requirements: BuildingRequirementsInput = Field(default_factory=BuildingRequirementsInput)
    preferences: DesignPreferencesInput = Field(default_factory=DesignPreferencesInput)

class ValidationMetric(BaseModel):
    name: str
    value: float
    unit: str
    permitted_limit: Optional[float] = None
    status: str  # "compliant", "warning", "violation"
    explanation: str

class ValidationResult(BaseModel):
    is_valid: bool
    status: str  # "Fully Compliant", "Advisory Warnings", "Non-Compliant Constraints"
    plot_area_sqm: float
    plot_area_sqft: float
    buildable_width: float
    buildable_depth: float
    max_theoretical_footprint_sqm: float
    max_coverage_footprint_sqm: float
    effective_max_footprint_sqm: float
    proposed_footprint_sqm: float
    site_coverage_pct: float
    max_site_coverage_pct: float
    coverage_compliant: bool
    proposed_total_floor_area_sqm: float
    max_permitted_floor_area_sqm: float
    proposed_far: float
    max_far: float
    far_compliant: bool
    proposed_height_m: float
    max_permitted_height_m: float
    height_compliant: bool
    proposed_floors: int
    max_floors: int
    floors_compliant: bool
    parking_provided: int
    parking_required: int
    parking_compliant: bool
    setbacks_compliant: bool
    metrics: List[ValidationMetric]
    warnings: List[str]
    recommendations: List[str]
    disclaimer: str

class GeometryMetadata(BaseModel):
    building_width: float
    building_depth: float
    building_height: float
    floor_height: float
    floor_count: int
    origin_x: float
    origin_z: float
    levels: List[Dict[str, Any]]
    roof_data: Dict[str, Any]
    balcony_data: List[Dict[str, Any]]
    window_data: List[Dict[str, Any]]
    door_data: List[Dict[str, Any]]
    materials: Dict[str, Any]
    plot_boundary: Dict[str, Any]
    setbacks_rect: Dict[str, Any]

class DesignResponse(BaseModel):
    design_id: str
    project_name: str
    timestamp: str
    plot: PlotInput
    constraints: PlanningConstraintsInput
    requirements: BuildingRequirementsInput
    preferences: DesignPreferencesInput
    validation: ValidationResult
    geometry: GeometryMetadata
    floorplan_summary: Dict[str, Any]
    disclaimer: str

class CopilotQuery(BaseModel):
    prompt: str
    current_design: Optional[Dict[str, Any]] = None

class CopilotResponse(BaseModel):
    interpreted_intent: str
    extracted_parameters: Dict[str, Any]
    suggested_design: FullDesignRequest
    explanation: str
    tradeoffs_and_limitations: List[str]
    is_fallback: bool = False
