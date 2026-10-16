import pytest
from app.schemas.architecture import (
    PlotInput,
    PlanningConstraintsInput,
    BuildingRequirementsInput,
    DesignPreferencesInput,
    FullDesignRequest
)
from app.services.validation_engine import validate_planning_constraints
from app.services.parametric_engine import generate_parametric_design

def test_plot_area_and_setback_calculations():
    plot = PlotInput(plot_width=20.0, plot_length=30.0)
    constraints = PlanningConstraintsInput(
        front_setback=4.0,
        rear_setback=3.0,
        left_setback=2.0,
        right_setback=2.0,
        max_site_coverage=60.0,
        max_far=1.8,
        max_height=12.0
    )
    reqs = BuildingRequirementsInput(num_floors=2, num_bedrooms=3, parking_spaces=2)
    
    result = validate_planning_constraints(plot, constraints, reqs)
    
    assert result.plot_area_sqm == 600.0
    assert result.buildable_width == 16.0  # 20 - (2 + 2)
    assert result.buildable_depth == 23.0  # 30 - (4 + 3)
    assert result.max_theoretical_footprint_sqm == 368.0  # 16 * 23
    assert result.max_coverage_footprint_sqm == 360.0     # 600 * 0.60
    assert result.effective_max_footprint_sqm == 360.0
    assert result.site_coverage_pct <= 60.0
    assert result.coverage_compliant is True
    assert result.far_compliant is True
    assert result.height_compliant is True
    assert result.is_valid is True

def test_infeasible_setbacks():
    # Setbacks greater than plot
    plot = PlotInput(plot_width=10.0, plot_length=15.0)
    constraints = PlanningConstraintsInput(
        left_setback=6.0,
        right_setback=6.0,  # 12m total > 10m
        front_setback=10.0,
        rear_setback=10.0
    )
    reqs = BuildingRequirementsInput(num_floors=2)
    result = validate_planning_constraints(plot, constraints, reqs)
    assert result.setbacks_compliant is False
    assert result.is_valid is False
    assert any("Setbacks exceed plot boundaries" in w for w in result.warnings)

def test_far_and_coverage_violations():
    plot = PlotInput(plot_width=15.0, plot_length=20.0) # 300 sqm
    constraints = PlanningConstraintsInput(
        max_site_coverage=40.0,  # max 120 sqm
        max_far=0.8,             # max 240 sqm
        max_height=8.0
    )
    reqs = BuildingRequirementsInput(
        preferred_footprint=200.0, # exceeds 120 sqm!
        num_floors=3               # 600 sqm total > 240 max FAR!
    )
    result = validate_planning_constraints(plot, constraints, reqs)
    assert result.coverage_compliant is False
    assert result.far_compliant is False
    assert result.is_valid is False
    assert any("Site Coverage Violation" in w for w in result.warnings)
    assert any("FAR/FSI Limit Exceeded" in w for w in result.warnings)

def test_parametric_geometry_generation():
    req = FullDesignRequest(
        plot=PlotInput(plot_width=25.0, plot_length=35.0),
        constraints=PlanningConstraintsInput(max_floors=3),
        requirements=BuildingRequirementsInput(num_floors=3, num_bedrooms=4, balcony_requirement=True),
        preferences=DesignPreferencesInput(roof_type="gabled", architectural_style="modern")
    )
    res = generate_parametric_design(req)
    assert res.geometry.floor_count == 3
    assert len(res.geometry.levels) == 3
    assert res.geometry.roof_data["type"] == "gabled"
    assert len(res.geometry.balcony_data) >= 1
    assert len(res.geometry.window_data) > 0
    assert res.geometry.building_width > 0
    assert res.geometry.building_depth > 0
