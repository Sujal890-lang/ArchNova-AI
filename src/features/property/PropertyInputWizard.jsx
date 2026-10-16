import React, { useState, useMemo } from 'react';
import { 
  Building2, Compass, ShieldCheck, Sliders, CheckCircle2, AlertTriangle, 
  ChevronRight, ChevronLeft, Sparkles, Home, Layers, Trees, Car 
} from 'lucide-react';

export function PropertyInputWizard({
  formData,
  onChange,
  onGenerate,
  isGenerating = false,
  validationResult = null
}) {
  const [currentStep, setCurrentStep] = useState(1);

  const plot = formData.plot;
  const constraints = formData.constraints;
  const requirements = formData.requirements;
  const preferences = formData.preferences;

  // Real-time calculations for Step 1
  const plotAreaSqm = useMemo(() => {
    return Math.round((plot.plot_width || 0) * (plot.plot_length || 0) * 100) / 100;
  }, [plot.plot_width, plot.plot_length]);

  const plotAreaSqft = useMemo(() => {
    return Math.round(plotAreaSqm * 10.7639 * 100) / 100;
  }, [plotAreaSqm]);

  // Real-time buildable envelope
  const buildableW = Math.max(0, (plot.plot_width || 0) - ((constraints.left_setback || 0) + (constraints.right_setback || 0)));
  const buildableD = Math.max(0, (plot.plot_length || 0) - ((constraints.front_setback || 0) + (constraints.rear_setback || 0)));
  const maxFootprintBySetbacks = Math.round(buildableW * buildableD * 10) / 10;
  const maxFootprintByCoverage = Math.round(plotAreaSqm * ((constraints.max_site_coverage || 60) / 100) * 10) / 10;

  const handleUpdate = (section, field, value) => {
    onChange({
      ...formData,
      [section]: {
        ...formData[section],
        [field]: value
      }
    });
  };

  const steps = [
    { id: 1, title: "Property Details", icon: Compass },
    { id: 2, title: "Planning Limits", icon: ShieldCheck },
    { id: 3, title: "Requirements", icon: Building2 },
    { id: 4, title: "Aesthetics", icon: Sliders },
    { id: 5, title: "Review & Generate", icon: Sparkles },
  ];

  return (
    <div className="bg-white rounded-2xl border border-[#E6E4DE] shadow-sm overflow-hidden flex flex-col h-full">
      {/* Wizard Step Header */}
      <div className="border-b border-[#E6E4DE] bg-[#FBFBFA] px-6 py-4">
        <div className="flex items-center justify-between overflow-x-auto pb-1 gap-2">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            const isActive = currentStep === s.id;
            const isDone = currentStep > s.id;

            return (
              <button
                key={s.id}
                onClick={() => setCurrentStep(s.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  isActive
                    ? 'bg-[#1C2028] text-white shadow-sm'
                    : isDone
                    ? 'bg-amber-50 text-amber-900 border border-amber-200'
                    : 'text-[#5C626F] hover:bg-black/5'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  isActive ? 'bg-[#D35400] text-white' : isDone ? 'bg-amber-600 text-white' : 'bg-gray-200 text-gray-700'
                }`}>
                  {s.id}
                </span>
                <span>{s.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Wizard Form Body */}
      <div className="p-6 flex-1 overflow-y-auto space-y-6">
        
        {/* STEP 1: PROPERTY DETAILS */}
        {currentStep === 1 && (
          <div className="space-y-5 animate-fadeIn">
            <div>
              <h3 className="text-base font-bold text-[#1C2028]">Step 1: Plot & Land Dimensions</h3>
              <p className="text-xs text-[#5C626F]">Specify your land boundaries and orientation.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#1C2028] mb-1">Project Name</label>
                <input
                  type="text"
                  value={plot.project_name || ''}
                  onChange={(e) => handleUpdate('plot', 'project_name', e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#D5D3CC] focus:outline-none focus:border-[#D35400] bg-[#FDFDFD]"
                  placeholder="e.g. Modern Cascading Villa"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1C2028] mb-1">Site Location / Coordinates</label>
                <input
                  type="text"
                  value={plot.site_location || ''}
                  onChange={(e) => handleUpdate('plot', 'site_location', e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#D5D3CC] focus:outline-none focus:border-[#D35400] bg-[#FDFDFD]"
                  placeholder="e.g. Suburban Sector 42"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1C2028] mb-1">Plot Width (meters)</label>
                <input
                  type="number"
                  min="6"
                  max="200"
                  step="0.5"
                  value={plot.plot_width || ''}
                  onChange={(e) => handleUpdate('plot', 'plot_width', parseFloat(e.target.value) || 0)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#D5D3CC] focus:outline-none focus:border-[#D35400] bg-[#FDFDFD]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1C2028] mb-1">Plot Length (meters)</label>
                <input
                  type="number"
                  min="8"
                  max="300"
                  step="0.5"
                  value={plot.plot_length || ''}
                  onChange={(e) => handleUpdate('plot', 'plot_length', parseFloat(e.target.value) || 0)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#D5D3CC] focus:outline-none focus:border-[#D35400] bg-[#FDFDFD]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1C2028] mb-1">Road-Facing Side</label>
                <select
                  value={plot.road_facing_side}
                  onChange={(e) => handleUpdate('plot', 'road_facing_side', e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#D5D3CC] focus:outline-none focus:border-[#D35400] bg-[#FDFDFD]"
                >
                  <option value="south">South (Optimal Front Lighting)</option>
                  <option value="north">North (Diffused Ambient Light)</option>
                  <option value="east">East (Morning Sunrise)</option>
                  <option value="west">West (Afternoon Warmth)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1C2028] mb-1">Plot Shape</label>
                <select
                  value={plot.plot_shape}
                  onChange={(e) => handleUpdate('plot', 'plot_shape', e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#D5D3CC] focus:outline-none focus:border-[#D35400] bg-[#FDFDFD]"
                >
                  <option value="rectangular">Rectangular (Standard)</option>
                  <option value="square">Square</option>
                  <option value="corner">Corner Lot</option>
                </select>
              </div>
            </div>

            {/* Calculated Area Highlight Card */}
            <div className="p-4 rounded-xl bg-[#F4F2EC] border border-[#E6E4DE] flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold text-[#5C626F] uppercase tracking-wider block">Calculated Plot Area</span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-2xl font-black text-[#1C2028]">{plotAreaSqm}</span>
                  <span className="text-xs font-bold text-[#5C626F]">m²</span>
                  <span className="text-xs text-[#8E95A5]">({plotAreaSqft.toLocaleString()} sq ft)</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-[#5C626F] block">Aspect Ratio</span>
                <span className="text-sm font-bold text-[#D35400]">
                  {plot.plot_width && plot.plot_length ? `1 : ${(plot.plot_length / plot.plot_width).toFixed(2)}` : '1 : 1'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: PLANNING CONSTRAINTS */}
        {currentStep === 2 && (
          <div className="space-y-5 animate-fadeIn">
            <div>
              <h3 className="text-base font-bold text-[#1C2028]">Step 2: Planning Assumptions & Setbacks</h3>
              <p className="text-xs text-[#5C626F]">Enter user-supplied zoning benchmarks to validate your envelope.</p>
            </div>

            {/* Disclaimer Alert */}
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-900 leading-relaxed">
                <strong>Planning Notice:</strong> These constraints represent your user-defined design criteria. ArchNova AI checks geometry mathematically against these values but does not certify statutory municipal compliance.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#1C2028] mb-1">Front Setback (m)</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={constraints.front_setback || ''}
                  onChange={(e) => handleUpdate('constraints', 'front_setback', parseFloat(e.target.value) || 0)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-[#D5D3CC] focus:outline-none focus:border-[#D35400]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#1C2028] mb-1">Rear Setback (m)</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={constraints.rear_setback || ''}
                  onChange={(e) => handleUpdate('constraints', 'rear_setback', parseFloat(e.target.value) || 0)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-[#D5D3CC] focus:outline-none focus:border-[#D35400]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#1C2028] mb-1">Left Setback (m)</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={constraints.left_setback || ''}
                  onChange={(e) => handleUpdate('constraints', 'left_setback', parseFloat(e.target.value) || 0)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-[#D5D3CC] focus:outline-none focus:border-[#D35400]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#1C2028] mb-1">Right Setback (m)</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={constraints.right_setback || ''}
                  onChange={(e) => handleUpdate('constraints', 'right_setback', parseFloat(e.target.value) || 0)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-[#D5D3CC] focus:outline-none focus:border-[#D35400]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#1C2028] mb-1">Max Permitted FAR / FSI</label>
                <input
                  type="number"
                  min="0.5"
                  max="6"
                  step="0.1"
                  value={constraints.max_far || ''}
                  onChange={(e) => handleUpdate('constraints', 'max_far', parseFloat(e.target.value) || 1)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#D5D3CC] focus:outline-none focus:border-[#D35400]"
                />
                <span className="text-[10px] text-[#8E95A5] mt-1 block">Max floor area: {Math.round(plotAreaSqm * (constraints.max_far || 1.8))} m²</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1C2028] mb-1">Max Site Coverage (%)</label>
                <input
                  type="number"
                  min="10"
                  max="100"
                  step="5"
                  value={constraints.max_site_coverage || ''}
                  onChange={(e) => handleUpdate('constraints', 'max_site_coverage', parseFloat(e.target.value) || 60)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#D5D3CC] focus:outline-none focus:border-[#D35400]"
                />
                <span className="text-[10px] text-[#8E95A5] mt-1 block">Max ground footprint: {maxFootprintByCoverage} m²</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1C2028] mb-1">Max Height (meters)</label>
                <input
                  type="number"
                  min="3"
                  max="80"
                  step="0.5"
                  value={constraints.max_height || ''}
                  onChange={(e) => handleUpdate('constraints', 'max_height', parseFloat(e.target.value) || 12)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#D5D3CC] focus:outline-none focus:border-[#D35400]"
                />
              </div>
            </div>

            {/* Envelope Status Box */}
            <div className="p-3.5 rounded-xl bg-[#FBFBFA] border border-[#E6E4DE] text-xs space-y-1.5">
              <div className="flex justify-between font-medium">
                <span className="text-[#5C626F]">Buildable Width × Depth (after setbacks):</span>
                <span className="font-bold text-[#1C2028]">{buildableW.toFixed(1)}m × {buildableD.toFixed(1)}m</span>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-[#5C626F]">Theoretical Max Envelope Footprint:</span>
                <span className="font-bold text-[#1C2028]">{maxFootprintBySetbacks} m²</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: BUILDING REQUIREMENTS */}
        {currentStep === 3 && (
          <div className="space-y-5 animate-fadeIn">
            <div>
              <h3 className="text-base font-bold text-[#1C2028]">Step 3: Program & Functional Spaces</h3>
              <p className="text-xs text-[#5C626F]">Specify building type, room counts, and amenities.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#1C2028] mb-1">Building Type</label>
                <select
                  value={requirements.building_type}
                  onChange={(e) => handleUpdate('requirements', 'building_type', e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#D5D3CC] focus:outline-none focus:border-[#D35400]"
                >
                  <option value="residential">Residential Villa / Home</option>
                  <option value="small_apartment">Small Multi-Family Apartment</option>
                  <option value="commercial">Commercial / Retail Pavillion</option>
                  <option value="mixed_use">Mixed-Use (Retail + Living)</option>
                  <option value="office">Boutique Creative Office</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1C2028] mb-1">Number of Floors (Storeys)</label>
                <select
                  value={requirements.num_floors}
                  onChange={(e) => handleUpdate('requirements', 'num_floors', parseInt(e.target.value) || 1)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#D5D3CC] focus:outline-none focus:border-[#D35400]"
                >
                  <option value={1}>1 Floor (Bungalow)</option>
                  <option value={2}>2 Floors (G + 1 Duplex)</option>
                  <option value={3}>3 Floors (G + 2 Triplex)</option>
                  <option value={4}>4 Floors (Multi-level)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1C2028] mb-1">Bedrooms</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={requirements.num_bedrooms}
                  onChange={(e) => handleUpdate('requirements', 'num_bedrooms', parseInt(e.target.value) || 1)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#D5D3CC] focus:outline-none focus:border-[#D35400]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1C2028] mb-1">Bathrooms</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={requirements.num_bathrooms}
                  onChange={(e) => handleUpdate('requirements', 'num_bathrooms', parseInt(e.target.value) || 1)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#D5D3CC] focus:outline-none focus:border-[#D35400]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1C2028] mb-1">Parking Bays</label>
                <input
                  type="number"
                  min="0"
                  max="6"
                  value={requirements.parking_spaces}
                  onChange={(e) => handleUpdate('requirements', 'parking_spaces', parseInt(e.target.value) || 0)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#D5D3CC] focus:outline-none focus:border-[#D35400]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1C2028] mb-1">Room Size Target</label>
                <select
                  value={requirements.approx_room_sizes}
                  onChange={(e) => handleUpdate('requirements', 'approx_room_sizes', e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#D5D3CC] focus:outline-none focus:border-[#D35400]"
                >
                  <option value="compact">Compact / Efficient</option>
                  <option value="standard">Standard Architectural Proportions</option>
                  <option value="spacious">Spacious / Luxury Sizing</option>
                </select>
              </div>
            </div>

            {/* Architectural Amenities Toggles */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-[#1C2028] mb-2">Architectural Features & Amenities</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[
                  { key: 'balcony_requirement', label: 'Balcony Decks' },
                  { key: 'garden_requirement', label: 'Garden Landscaping' },
                  { key: 'terrace_requirement', label: 'Rooftop Terrace' },
                  { key: 'staircase_requirement', label: 'Circulation Staircase' },
                  { key: 'lift_requirement', label: 'Elevator Shaft' }
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleUpdate('requirements', item.key, !requirements[item.key])}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition ${
                      requirements[item.key]
                        ? 'bg-[#1C2028] text-white border-[#1C2028]'
                        : 'bg-white text-[#5C626F] border-[#D5D3CC] hover:bg-gray-50'
                    }`}
                  >
                    <div className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[10px] ${requirements[item.key] ? 'bg-[#D35400] text-white' : 'border border-gray-400'}`}>
                      {requirements[item.key] && '✓'}
                    </div>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: DESIGN PREFERENCES */}
        {currentStep === 4 && (
          <div className="space-y-5 animate-fadeIn">
            <div>
              <h3 className="text-base font-bold text-[#1C2028]">Step 4: Architectural Aesthetics & Materials</h3>
              <p className="text-xs text-[#5C626F]">Select style language, roof typology, and exterior finishes.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#1C2028] mb-1">Architectural Style</label>
                <select
                  value={preferences.architectural_style}
                  onChange={(e) => handleUpdate('preferences', 'architectural_style', e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#D5D3CC] focus:outline-none focus:border-[#D35400]"
                >
                  <option value="modern">Modern (Cantilevers, Pure Forms)</option>
                  <option value="minimalist">Minimalist (Restrained Volumes)</option>
                  <option value="contemporary">Contemporary (Dynamic Articulation)</option>
                  <option value="industrial">Industrial (Steel, Concrete & Glass)</option>
                  <option value="traditional">Traditional (Warm Masonry)</option>
                  <option value="tropical">Tropical (Overhangs & Terraces)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1C2028] mb-1">Roof Typology</label>
                <select
                  value={preferences.roof_type}
                  onChange={(e) => handleUpdate('preferences', 'roof_type', e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#D5D3CC] focus:outline-none focus:border-[#D35400]"
                >
                  <option value="flat">Flat Parapet Roof</option>
                  <option value="terrace">Rooftop Sky Terrace with Pergola</option>
                  <option value="sloped">Single-Pitch Sloped Shed Roof</option>
                  <option value="gabled">Dual-Pitch Gabled Roof</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1C2028] mb-1">Window & Fenestration Style</label>
                <select
                  value={preferences.window_style}
                  onChange={(e) => handleUpdate('preferences', 'window_style', e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#D5D3CC] focus:outline-none focus:border-[#D35400]"
                >
                  <option value="ribbon">Ribbon Windows (Horizontal Bands)</option>
                  <option value="floor_to_ceiling">Floor-to-Ceiling Panoramic Glazing</option>
                  <option value="punched_openings">Punched Openings (Deep Reveals)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1C2028] mb-1">Exterior Material Palette</label>
                <select
                  value={preferences.exterior_material}
                  onChange={(e) => handleUpdate('preferences', 'exterior_material', e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#D5D3CC] focus:outline-none focus:border-[#D35400]"
                >
                  <option value="concrete_white_stucco">White Stucco & Engineered Concrete</option>
                  <option value="warm_timber_brick">Warm Timber Slats & Earth Bricks</option>
                  <option value="exposed_concrete">Brutalist Exposed Board-Formed Concrete</option>
                  <option value="glass_steel">Curtain Wall Glass & Matte Black Steel</option>
                  <option value="stone_slate">Natural Ashlar Stone & Dark Slate</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1C2028] mb-1">Exterior Color Theme</label>
                <select
                  value={preferences.exterior_color}
                  onChange={(e) => handleUpdate('preferences', 'exterior_color', e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#D5D3CC] focus:outline-none focus:border-[#D35400]"
                >
                  <option value="warm_offwhite">Warm Off-White & Architectural Orange</option>
                  <option value="charcoal_slate">Charcoal & Slate Black</option>
                  <option value="sand_terracotta">Warm Sand & Terracotta</option>
                  <option value="monochrome">Modern High-Contrast Monochrome</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1C2028] mb-1">Landscaping Concept</label>
                <select
                  value={preferences.landscaping_style}
                  onChange={(e) => handleUpdate('preferences', 'landscaping_style', e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#D5D3CC] focus:outline-none focus:border-[#D35400]"
                >
                  <option value="geometric_courtyard">Geometric Paved Courtyard</option>
                  <option value="minimalist_zen">Minimalist Zen & Gravel</option>
                  <option value="lush_tropical">Lush Tropical Canopy</option>
                  <option value="drought_tolerant">Eco Drought-Tolerant Native</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: REVIEW & GENERATE */}
        {currentStep === 5 && (
          <div className="space-y-5 animate-fadeIn">
            <div>
              <h3 className="text-base font-bold text-[#1C2028]">Step 5: Synthesis & Review</h3>
              <p className="text-xs text-[#5C626F]">Confirm your parametric constraints and generate your 3D building.</p>
            </div>

            {/* Parameter Summary Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-[#FBFBFA] border border-[#E6E4DE]">
                <span className="text-[10px] font-bold text-[#8E95A5] uppercase">Plot</span>
                <p className="text-xs font-bold text-[#1C2028] mt-0.5">{plot.plot_width}m × {plot.plot_length}m ({plotAreaSqm} m²)</p>
              </div>
              <div className="p-3 rounded-xl bg-[#FBFBFA] border border-[#E6E4DE]">
                <span className="text-[10px] font-bold text-[#8E95A5] uppercase">Program</span>
                <p className="text-xs font-bold text-[#1C2028] mt-0.5">{requirements.num_floors} Floors, {requirements.num_bedrooms} Beds</p>
              </div>
              <div className="p-3 rounded-xl bg-[#FBFBFA] border border-[#E6E4DE]">
                <span className="text-[10px] font-bold text-[#8E95A5] uppercase">Style & Roof</span>
                <p className="text-xs font-bold text-[#1C2028] mt-0.5">{preferences.architectural_style.toUpperCase()} • {preferences.roof_type}</p>
              </div>
              <div className="p-3 rounded-xl bg-[#FBFBFA] border border-[#E6E4DE]">
                <span className="text-[10px] font-bold text-[#8E95A5] uppercase">Max FAR / FSI</span>
                <p className="text-xs font-bold text-[#1C2028] mt-0.5">{constraints.max_far} ratio</p>
              </div>
              <div className="p-3 rounded-xl bg-[#FBFBFA] border border-[#E6E4DE]">
                <span className="text-[10px] font-bold text-[#8E95A5] uppercase">Site Coverage</span>
                <p className="text-xs font-bold text-[#1C2028] mt-0.5">Max {constraints.max_site_coverage}%</p>
              </div>
              <div className="p-3 rounded-xl bg-[#FBFBFA] border border-[#E6E4DE]">
                <span className="text-[10px] font-bold text-[#8E95A5] uppercase">Road Access</span>
                <p className="text-xs font-bold text-[#1C2028] mt-0.5">{plot.road_facing_side.toUpperCase()} facing</p>
              </div>
            </div>

            {/* Validation Warnings if any */}
            {validationResult?.warnings?.length > 0 && (
              <div className="p-3.5 rounded-xl bg-orange-50 border border-orange-200 space-y-1.5">
                <span className="text-xs font-bold text-orange-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-orange-600" />
                  Planning Advisory Warnings
                </span>
                {validationResult.warnings.map((w, idx) => (
                  <p key={idx} className="text-[11px] text-orange-800 leading-snug">• {w}</p>
                ))}
              </div>
            )}

            {/* Main Action Button */}
            <button
              onClick={onGenerate}
              disabled={isGenerating}
              className="w-full py-3.5 px-4 rounded-xl bg-[#D35400] hover:bg-[#B84700] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition active:scale-[0.99] disabled:opacity-60"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Computing Parametric Geometry...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate My Design</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Wizard Footer Navigation */}
      <div className="border-t border-[#E6E4DE] bg-[#FBFBFA] px-6 py-3.5 flex items-center justify-between">
        <button
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
          className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[#5C626F] hover:bg-black/5 disabled:opacity-30 flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <span className="text-xs font-mono text-[#8E95A5]">
          Step {currentStep} of {steps.length}
        </span>

        {currentStep < 5 ? (
          <button
            onClick={() => setCurrentStep(Math.min(5, currentStep + 1))}
            className="px-4 py-1.5 rounded-xl text-xs font-bold bg-[#1C2028] text-white hover:bg-[#2E3543] flex items-center gap-1 shadow-sm"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={onGenerate}
            disabled={isGenerating}
            className="px-4 py-1.5 rounded-xl text-xs font-bold bg-[#D35400] text-white hover:bg-[#B84700] flex items-center gap-1 shadow-sm disabled:opacity-50"
          >
            <span>Generate</span>
            <Sparkles className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
