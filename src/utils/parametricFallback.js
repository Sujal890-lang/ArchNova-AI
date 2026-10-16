// Client-side parametric fallback engine
// Matches backend logic identically for high responsiveness

export function calculatePlanningMetrics(plot, constraints, requirements) {
  const plotAreaSqm = Math.round(plot.plot_width * plot.plot_length * 100) / 100;
  const plotAreaSqft = Math.round(plotAreaSqm * 10.7639 * 100) / 100;

  const buildableWidth = Math.max(2, Math.round((plot.plot_width - (constraints.left_setback + constraints.right_setback)) * 100) / 100);
  const buildableDepth = Math.max(2, Math.round((plot.plot_length - (constraints.front_setback + constraints.rear_setback)) * 100) / 100);

  const maxTheoreticalFootprint = Math.round(buildableWidth * buildableDepth * 100) / 100;
  const maxCoverageFootprint = Math.round(plotAreaSqm * (constraints.max_site_coverage / 100) * 100) / 100;
  const effectiveMaxFootprint = Math.min(maxTheoreticalFootprint, maxCoverageFootprint);

  const proposedFootprint = requirements.preferred_footprint && requirements.preferred_footprint > 0
    ? requirements.preferred_footprint
    : Math.round(effectiveMaxFootprint * 0.72 * 100) / 100;

  const siteCoveragePct = Math.round((proposedFootprint / plotAreaSqm) * 10000) / 100;
  const coverageCompliant = siteCoveragePct <= (constraints.max_site_coverage + 0.1);

  const proposedFloors = requirements.num_floors;
  const proposedTotalFloorArea = Math.round(proposedFootprint * proposedFloors * 100) / 100;
  const maxPermittedFloorArea = Math.round(plotAreaSqm * constraints.max_far * 100) / 100;
  const proposedFar = Math.round((proposedTotalFloorArea / plotAreaSqm) * 100) / 100;
  const farCompliant = proposedTotalFloorArea <= (maxPermittedFloorArea + 0.5);

  const proposedHeight = Math.round((proposedFloors * 3.2 + 1.0) * 100) / 100;
  const heightCompliant = proposedHeight <= constraints.max_height;
  const floorsCompliant = proposedFloors <= constraints.max_floors;
  const parkingCompliant = requirements.parking_spaces >= constraints.parking_spaces_required;
  const setbacksCompliant = (plot.plot_width > (constraints.left_setback + constraints.right_setback)) &&
                           (plot.plot_length > (constraints.front_setback + constraints.rear_setback));

  const warnings = [];
  const recommendations = [];

  if (!setbacksCompliant) {
    warnings.push(`Setbacks exceed plot boundaries! Buildable envelope is infeasible.`);
  }
  if (!coverageCompliant) {
    warnings.push(`Site Coverage Exceeded: ${siteCoveragePct}% vs max permitted ${constraints.max_site_coverage}%.`);
    recommendations.push(`Reduce ground footprint to under ${maxCoverageFootprint} m².`);
  }
  if (!farCompliant) {
    warnings.push(`FAR Limit Exceeded: Total floor area ${proposedTotalFloorArea} m² exceeds allowable ${maxPermittedFloorArea} m².`);
    recommendations.push(`Reduce building footprint or reduce number of floors by 1.`);
  }
  if (!heightCompliant) {
    warnings.push(`Height Limit Exceeded: Building height ${proposedHeight}m exceeds permitted ${constraints.max_height}m.`);
  }
  if (!parkingCompliant) {
    warnings.push(`Parking Deficit: Provided ${requirements.parking_spaces} bay(s), require minimum ${constraints.parking_spaces_required}.`);
  }

  const isValid = setbacksCompliant && coverageCompliant && farCompliant && heightCompliant && floorsCompliant;

  return {
    is_valid: isValid,
    status: isValid && warnings.length === 0 ? "Fully Compliant" : (isValid ? "Advisory Warnings" : "Non-Compliant Constraints"),
    plot_area_sqm: plotAreaSqm,
    plot_area_sqft: plotAreaSqft,
    buildable_width: buildableWidth,
    buildable_depth: buildableDepth,
    max_theoretical_footprint_sqm: maxTheoreticalFootprint,
    max_coverage_footprint_sqm: maxCoverageFootprint,
    effective_max_footprint_sqm: effectiveMaxFootprint,
    proposed_footprint_sqm: proposedFootprint,
    site_coverage_pct: siteCoveragePct,
    max_site_coverage_pct: constraints.max_site_coverage,
    coverage_compliant: coverageCompliant,
    proposed_total_floor_area_sqm: proposedTotalFloorArea,
    max_permitted_floor_area_sqm: maxPermittedFloorArea,
    proposed_far: proposedFar,
    max_far: constraints.max_far,
    far_compliant: farCompliant,
    proposed_height_m: proposedHeight,
    max_permitted_height_m: constraints.max_height,
    height_compliant: heightCompliant,
    proposed_floors: proposedFloors,
    max_floors: constraints.max_floors,
    floors_compliant: floorsCompliant,
    parking_provided: requirements.parking_spaces,
    parking_required: constraints.parking_spaces_required,
    parking_compliant: parkingCompliant,
    setbacks_compliant: setbacksCompliant,
    warnings,
    recommendations,
    disclaimer: "LEGAL & PLANNING DISCLAIMER: Provided calculations are mathematical estimates. Verify with municipal building codes and licensed professionals."
  };
}

export function generateLocalParametricDesign(plot, constraints, requirements, preferences) {
  const validation = calculatePlanningMetrics(plot, constraints, requirements);
  
  const halfPw = plot.plot_width / 2.0;
  const halfPl = plot.plot_length / 2.0;

  const leftX = -halfPw + constraints.left_setback;
  const rightX = halfPw - constraints.right_setback;
  const rearZ = -halfPl + constraints.rear_setback;
  const frontZ = halfPl - constraints.front_setback;

  const availW = Math.max(2, rightX - leftX);
  const availD = Math.max(2, frontZ - rearZ);

  const targetFootprint = validation.proposed_footprint_sqm;
  let aspect = availW / availD;
  aspect = Math.max(0.6, Math.min(1.6, aspect));

  const calcDepth = Math.sqrt(targetFootprint / aspect);
  const calcWidth = calcDepth * aspect;

  const bWidth = Math.max(4.0, Math.round(Math.min(calcWidth, availW * 0.95) * 100) / 100);
  const bDepth = Math.max(5.0, Math.round(Math.min(calcDepth, availD * 0.95) * 100) / 100);

  const centerX = Math.round(((leftX + rightX) / 2.0) * 100) / 100;
  const centerZ = Math.round(((rearZ + frontZ) / 2.0) * 100) / 100;

  const floorCount = requirements.num_floors;
  const floorHeight = 3.2;
  const slabThickness = 0.25;

  const levels = [];
  const windowData = [];
  const doorData = [];
  const balconyData = [];

  for (let f = 0; f < floorCount; f++) {
    const yBase = f * floorHeight;
    const fOffsetZ = (f > 0 && (preferences.architectural_style === 'modern' || preferences.architectural_style === 'contemporary')) ? 0.3 : 0;

    levels.push({
      floor_index: f,
      name: f === 0 ? "Ground Floor" : `Level ${f + 1}`,
      y_base: yBase,
      height: floorHeight,
      slab: {
        width: bWidth + 0.3,
        depth: bDepth + 0.3,
        thickness: slabThickness,
        y: yBase
      },
      walls: {
        width: bWidth,
        depth: bDepth,
        height: floorHeight - slabThickness,
        thickness: 0.25,
        center_x: centerX,
        center_z: centerZ + fOffsetZ,
        y: yBase + slabThickness
      }
    });

    // Windows
    const winY = preferences.window_style === 'floor_to_ceiling' ? yBase + 0.2 : yBase + 0.9;
    const winH = preferences.window_style === 'floor_to_ceiling' ? 2.4 : (preferences.window_style === 'ribbon' ? 1.0 : 1.6);
    const baySpacing = bWidth / 3.0;

    for (const i of [-1, 1]) {
      windowData.push({
        floor: f,
        facade: "front",
        x: centerX + (i * baySpacing * 0.7),
        y: winY,
        z: centerZ + fOffsetZ + (bDepth / 2.0) + 0.05,
        width: Math.min(2.2, baySpacing * 0.75),
        height: winH,
        style: preferences.window_style
      });
      windowData.push({
        floor: f,
        facade: "rear",
        x: centerX + (i * baySpacing * 0.7),
        y: winY,
        z: centerZ + fOffsetZ - (bDepth / 2.0) - 0.05,
        width: Math.min(1.8, baySpacing * 0.65),
        height: winH,
        style: preferences.window_style
      });
    }

    if (f === 0) {
      doorData.push({
        floor: 0,
        type: "main_entrance",
        x: centerX,
        y: slabThickness,
        z: centerZ + (bDepth / 2.0) + 0.05,
        width: 1.4,
        height: 2.4,
        facade: "front"
      });
    }

    if (f >= 1 && requirements.balcony_requirement) {
      const balcW = Math.round(bWidth * 0.6 * 100) / 100;
      const balcD = 1.5;
      balconyData.push({
        floor: f,
        x: centerX,
        y: yBase,
        z: centerZ + fOffsetZ + (bDepth / 2.0) + (balcD / 2.0),
        width: balcW,
        depth: balcD,
        railing_height: 1.05,
        style: preferences.balcony_style
      });
      doorData.push({
        floor: f,
        type: "balcony_door",
        x: centerX,
        y: yBase + slabThickness,
        z: centerZ + fOffsetZ + (bDepth / 2.0) + 0.05,
        width: 1.6,
        height: 2.3,
        facade: "front"
      });
    }
  }

  const materials = {
    wall_color: preferences.exterior_color === 'charcoal_slate' ? '#24282F' : '#F9F8F5',
    accent_color: '#D35400',
    slab_color: '#E5E3DF',
    glass_color: '#82B1B8',
    frame_color: '#1F2421',
    roof_color: '#333A42',
    wood_color: '#9C6644'
  };

  return {
    design_id: `arch-local-${Date.now().toString(36)}`,
    project_name: plot.project_name || "ArchNova Villa Concept",
    timestamp: new Date().toISOString(),
    plot,
    constraints,
    requirements,
    preferences,
    validation,
    geometry: {
      building_width: bWidth,
      building_depth: bDepth,
      building_height: floorCount * floorHeight,
      floor_height: floorHeight,
      floor_count: floorCount,
      origin_x: centerX,
      origin_z: centerZ,
      levels,
      roof_data: {
        type: preferences.roof_type,
        width: bWidth + 0.6,
        depth: bDepth + 0.6,
        center_x: centerX,
        center_z: centerZ,
        y_base: floorCount * floorHeight,
        overhang: 0.4,
        parapet_height: ['flat', 'terrace'].includes(preferences.roof_type) ? 0.9 : 0.0,
        pitch_height: ['sloped', 'gabled'].includes(preferences.roof_type) ? 1.8 : 0.0
      },
      balcony_data: balconyData,
      window_data: windowData,
      door_data: doorData,
      materials,
      plot_boundary: {
        width: plot.plot_width,
        length: plot.plot_length,
        x_min: -halfPw,
        x_max: halfPw,
        z_min: -halfPl,
        z_max: halfPl
      },
      setbacks_rect: {
        min_x: leftX,
        max_x: rightX,
        min_z: rearZ,
        max_z: frontZ,
        width: availW,
        depth: availD
      }
    },
    disclaimer: validation.disclaimer
  };
}
