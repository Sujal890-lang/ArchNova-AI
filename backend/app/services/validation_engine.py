from typing import Dict, Any, List
from app.schemas.architecture import (
    PlotInput,
    PlanningConstraintsInput,
    BuildingRequirementsInput,
    ValidationResult,
    ValidationMetric
)

SQM_TO_SQFT = 10.7639
FLOOR_TO_FLOOR_HEIGHT = 3.2  # meters per level
ROOF_STRUCTURE_HEIGHT = 1.0  # meters parapet or pitch

def validate_planning_constraints(
    plot: PlotInput,
    constraints: PlanningConstraintsInput,
    requirements: BuildingRequirementsInput
) -> ValidationResult:
    warnings: List[str] = []
    recommendations: List[str] = []
    metrics: List[ValidationMetric] = []

    # 1. Plot area calculations
    plot_area_sqm = round(plot.plot_width * plot.plot_length, 2)
    plot_area_sqft = round(plot_area_sqm * SQM_TO_SQFT, 2)

    # 2. Buildable boundaries after setbacks
    buildable_width = round(plot.plot_width - (constraints.left_setback + constraints.right_setback), 2)
    buildable_depth = round(plot.plot_length - (constraints.front_setback + constraints.rear_setback), 2)

    setbacks_compliant = True
    if buildable_width <= 0 or buildable_depth <= 0:
        setbacks_compliant = False
        warnings.append(
            f"Setbacks exceed plot boundaries! Left ({constraints.left_setback}m) + Right ({constraints.right_setback}m) vs Width ({plot.plot_width}m); "
            f"Front ({constraints.front_setback}m) + Rear ({constraints.rear_setback}m) vs Length ({plot.plot_length}m). Buildable space is negative or zero."
        )
        buildable_width = max(buildable_width, 2.0)
        buildable_depth = max(buildable_depth, 2.0)

    # 3. Footprint limits
    max_theoretical_footprint = round(buildable_width * buildable_depth, 2)
    max_coverage_footprint = round(plot_area_sqm * (constraints.max_site_coverage / 100.0), 2)
    effective_max_footprint = round(min(max_theoretical_footprint, max_coverage_footprint), 2)

    # Determine proposed footprint
    if requirements.preferred_footprint and requirements.preferred_footprint > 0:
        proposed_footprint = requirements.preferred_footprint
    else:
        # Balanced architectural default: ~70% of effective maximum footprint
        proposed_footprint = round(effective_max_footprint * 0.72, 2)

    # Site coverage calculation
    site_coverage_pct = round((proposed_footprint / plot_area_sqm) * 100.0, 2)
    coverage_compliant = site_coverage_pct <= (constraints.max_site_coverage + 0.01)

    if not coverage_compliant:
        warnings.append(
            f"Site Coverage Violation: Proposed footprint ({proposed_footprint} m²) represents {site_coverage_pct}% of the plot, "
            f"exceeding the user-specified maximum coverage limit of {constraints.max_site_coverage}% ({max_coverage_footprint} m²)."
        )
        recommendations.append(
            f"Reduce ground footprint to under {max_coverage_footprint} m² or distribute rooms across additional upper floors."
        )

    if proposed_footprint > max_theoretical_footprint:
        warnings.append(
            f"Setback Encroachment: Proposed footprint ({proposed_footprint} m²) exceeds the maximum buildable envelope ({max_theoretical_footprint} m²) defined by setbacks."
        )

    # 4. Total floor area and FAR/FSI
    proposed_floors = requirements.num_floors
    proposed_total_floor_area = round(proposed_footprint * proposed_floors, 2)
    max_permitted_floor_area = round(plot_area_sqm * constraints.max_far, 2)
    proposed_far = round(proposed_total_floor_area / plot_area_sqm, 2)

    far_compliant = proposed_total_floor_area <= (max_permitted_floor_area + 0.5)
    if not far_compliant:
        excess_area = round(proposed_total_floor_area - max_permitted_floor_area, 2)
        warnings.append(
            f"FAR/FSI Limit Exceeded: Proposed total floor area ({proposed_total_floor_area} m², FAR {proposed_far}) "
            f"exceeds the maximum permitted floor area of {max_permitted_floor_area} m² (FAR {constraints.max_far}) by {excess_area} m²."
        )
        recommendations.append(
            f"Consider trimming upper floor area or reducing floor count by 1 to satisfy the {constraints.max_far} FAR threshold."
        )
    else:
        headroom = round(max_permitted_floor_area - proposed_total_floor_area, 2)
        if headroom > 50:
            recommendations.append(
                f"You have approximately {headroom} m² of permissible FAR headroom remaining. You could add an additional studio, office, or amenity level."
            )

    # 5. Building height check
    proposed_height = round(proposed_floors * FLOOR_TO_FLOOR_HEIGHT + ROOF_STRUCTURE_HEIGHT, 2)
    height_compliant = proposed_height <= constraints.max_height

    if not height_compliant:
        warnings.append(
            f"Height Limit Exceeded: Calculated building height of {proposed_height}m ({proposed_floors} storeys) "
            f"exceeds user-defined height restriction of {constraints.max_height}m."
        )
        recommendations.append("Reduce the number of floors or adjust floor-to-floor ceiling clearances.")

    # 6. Floor count check
    floors_compliant = proposed_floors <= constraints.max_floors
    if not floors_compliant:
        warnings.append(
            f"Floor Count Limit Exceeded: Requested {proposed_floors} floors, but maximum permissible limit is {constraints.max_floors}."
        )

    # 7. Parking compliance
    parking_provided = requirements.parking_spaces
    parking_required = constraints.parking_spaces_required
    parking_compliant = parking_provided >= parking_required
    if not parking_compliant:
        warnings.append(
            f"Parking Shortage: Project provides {parking_provided} parking stalls, while planning criteria requires at least {parking_required} stalls."
        )
        recommendations.append(f"Allocate an additional {parking_required - parking_provided} parking space(s) within the front yard or driveway.")

    # Build metric items
    metrics.append(ValidationMetric(
        name="Site Coverage",
        value=site_coverage_pct,
        unit="%",
        permitted_limit=constraints.max_site_coverage,
        status="compliant" if coverage_compliant else "violation",
        explanation=f"{site_coverage_pct}% of plot occupied (limit {constraints.max_site_coverage}%)"
    ))
    metrics.append(ValidationMetric(
        name="Floor Area Ratio (FAR)",
        value=proposed_far,
        unit="ratio",
        permitted_limit=constraints.max_far,
        status="compliant" if far_compliant else "violation",
        explanation=f"Proposed FAR is {proposed_far} vs max permitted {constraints.max_far}"
    ))
    metrics.append(ValidationMetric(
        name="Building Height",
        value=proposed_height,
        unit="m",
        permitted_limit=constraints.max_height,
        status="compliant" if height_compliant else "violation",
        explanation=f"Calculated height is {proposed_height}m (limit {constraints.max_height}m)"
    ))
    metrics.append(ValidationMetric(
        name="Number of Floors",
        value=float(proposed_floors),
        unit="floors",
        permitted_limit=float(constraints.max_floors),
        status="compliant" if floors_compliant else "violation",
        explanation=f"{proposed_floors} storeys (limit {constraints.max_floors})"
    ))
    metrics.append(ValidationMetric(
        name="Parking Spaces",
        value=float(parking_provided),
        unit="bays",
        permitted_limit=float(parking_required),
        status="compliant" if parking_compliant else "warning",
        explanation=f"{parking_provided} spaces provided (requirement: {parking_required})"
    ))

    # Overall validity and status
    is_valid = setbacks_compliant and coverage_compliant and far_compliant and height_compliant and floors_compliant
    if is_valid and not warnings:
        status = "Fully Compliant"
    elif is_valid and warnings:
        status = "Advisory Warnings"
    else:
        status = "Non-Compliant Constraints"

    disclaimer = (
        "LEGAL & PLANNING DISCLAIMER: The planning constraints evaluation performed by ArchNova AI is "
        "strictly based on user-supplied assumptions, rules-of-thumb, and geometric calculations. ArchNova AI "
        "does not independently access, verify, or guarantee compliance with municipal statutory development control rules (DCR), "
        "local zoning bylaws, environmental setbacks, or structural engineering standards. "
        "Always engage certified architects and registered civil engineers before construction or permit filing."
    )

    return ValidationResult(
        is_valid=is_valid,
        status=status,
        plot_area_sqm=plot_area_sqm,
        plot_area_sqft=plot_area_sqft,
        buildable_width=buildable_width,
        buildable_depth=buildable_depth,
        max_theoretical_footprint_sqm=max_theoretical_footprint,
        max_coverage_footprint_sqm=max_coverage_footprint,
        effective_max_footprint_sqm=effective_max_footprint,
        proposed_footprint_sqm=proposed_footprint,
        site_coverage_pct=site_coverage_pct,
        max_site_coverage_pct=constraints.max_site_coverage,
        coverage_compliant=coverage_compliant,
        proposed_total_floor_area_sqm=proposed_total_floor_area,
        max_permitted_floor_area_sqm=max_permitted_floor_area,
        proposed_far=proposed_far,
        max_far=constraints.max_far,
        far_compliant=far_compliant,
        proposed_height_m=proposed_height,
        max_permitted_height_m=constraints.max_height,
        height_compliant=height_compliant,
        proposed_floors=proposed_floors,
        max_floors=constraints.max_floors,
        floors_compliant=floors_compliant,
        parking_provided=parking_provided,
        parking_required=parking_required,
        parking_compliant=parking_compliant,
        setbacks_compliant=setbacks_compliant,
        metrics=metrics,
        warnings=warnings,
        recommendations=recommendations,
        disclaimer=disclaimer
    )
