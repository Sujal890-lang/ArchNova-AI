import React from 'react';
import { 
  Building2, Compass, ShieldCheck, Sparkles, Layers, ArrowRight, 
  Download, Eye, CheckCircle2, AlertTriangle, Code, Cpu, Boxes 
} from 'lucide-react';
import { BuildingScene } from '../three/BuildingScene';

export function LandingPage({ onStartDesigning, onOpenAuth }) {
  // Demo building setup for the Hero Three.js viewport
  const heroDemoDesign = {
    project_name: "ArchNova Hero Pavilion",
    plot: { plot_width: 24, plot_length: 32, road_facing_side: "south" },
    constraints: { front_setback: 4, rear_setback: 3, left_setback: 2.5, right_setback: 2.5, max_height: 12, max_far: 1.8, max_site_coverage: 60, max_floors: 3, parking_spaces_required: 2 },
    requirements: { num_floors: 3, num_bedrooms: 4, parking_spaces: 2, balcony_requirement: true, garden_requirement: true },
    preferences: { architectural_style: "modern", roof_type: "terrace", window_style: "ribbon", exterior_material: "concrete_white_stucco", exterior_color: "warm_offwhite" },
    geometry: {
      building_width: 14,
      building_depth: 12,
      building_height: 9.6,
      floor_height: 3.2,
      floor_count: 3,
      origin_x: 0,
      origin_z: 0,
      levels: [
        { floor_index: 0, name: "Ground Floor", y_base: 0, height: 3.2, slab: { width: 14.3, depth: 12.3, thickness: 0.25 }, walls: { width: 14, depth: 12, height: 2.95 } },
        { floor_index: 1, name: "Level 1", y_base: 3.2, height: 3.2, slab: { width: 14.3, depth: 12.3, thickness: 0.25 }, walls: { width: 14, depth: 12, height: 2.95 } },
        { floor_index: 2, name: "Level 2", y_base: 6.4, height: 3.2, slab: { width: 14.3, depth: 12.3, thickness: 0.25 }, walls: { width: 14, depth: 12, height: 2.95 } }
      ],
      roof_data: { type: "terrace", width: 14.6, depth: 12.6, y_base: 9.6, parapet_height: 0.9, pergola: true },
      balcony_data: [
        { floor: 1, x: 0, y: 3.2, z: 6.75, width: 9, depth: 1.5, railing_height: 1.05, style: "cantilever_glass" },
        { floor: 2, x: 0, y: 6.4, z: 6.75, width: 7, depth: 1.5, railing_height: 1.05, style: "cantilever_glass" }
      ],
      window_data: [
        { floor: 0, facade: "front", x: -3.5, y: 1.1, z: 6.05, width: 2.2, height: 1.6, style: "ribbon" },
        { floor: 0, facade: "front", x: 3.5, y: 1.1, z: 6.05, width: 2.2, height: 1.6, style: "ribbon" },
        { floor: 1, facade: "front", x: -3.5, y: 4.3, z: 6.05, width: 2.2, height: 1.6, style: "ribbon" },
        { floor: 1, facade: "front", x: 3.5, y: 4.3, z: 6.05, width: 2.2, height: 1.6, style: "ribbon" },
        { floor: 2, facade: "front", x: -3, y: 7.5, z: 6.05, width: 2.0, height: 1.6, style: "ribbon" },
        { floor: 2, facade: "front", x: 3, y: 7.5, z: 6.05, width: 2.0, height: 1.6, style: "ribbon" }
      ],
      door_data: [
        { floor: 0, type: "main_entrance", x: 0, y: 0.25, z: 6.05, width: 1.6, height: 2.4, facade: "front" },
        { floor: 1, type: "balcony_door", x: 0, y: 3.45, z: 6.05, width: 1.6, height: 2.3, facade: "front" }
      ],
      materials: {
        wall_color: "#F9F8F5",
        accent_color: "#D35400",
        slab_color: "#E5E3DF",
        glass_color: "#82B1B8",
        frame_color: "#1F2421",
        roof_color: "#333A42",
        wood_color: "#9C6644"
      },
      plot_boundary: { width: 24, length: 32, x_min: -12, x_max: 12, z_min: -16, z_max: 16 },
      setbacks_rect: { min_x: -9.5, max_x: 9.5, min_z: -13, max_z: 12, width: 19, depth: 25 }
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F8F5] text-[#1C2028] flex flex-col selection:bg-[#D35400] selection:text-white">
      
      {/* Top Architectural Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#F9F8F5]/90 backdrop-blur-md border-b border-[#E6E4DE] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#D35400] flex items-center justify-center shadow-md">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-base font-black tracking-tight text-[#1C2028]">
                ARCHNOVA <span className="text-[#D35400]">AI</span>
              </span>
              <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-widest text-[#8E95A5] ml-2">
                Parametric Architecture Platform
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-4 text-xs font-semibold">
            <a href="#features" className="hidden md:inline-block text-[#5C626F] hover:text-[#1C2028] transition">Features</a>
            <a href="#how-it-works" className="hidden md:inline-block text-[#5C626F] hover:text-[#1C2028] transition">Workflow</a>
            <a href="#technology" className="hidden md:inline-block text-[#5C626F] hover:text-[#1C2028] transition">Tech Stack</a>
            
            <button
              onClick={onOpenAuth}
              className="px-3.5 py-2 rounded-xl text-[#1C2028] hover:bg-black/5 transition"
            >
              Sign In
            </button>
            <button
              onClick={onStartDesigning}
              className="px-4 py-2 rounded-xl bg-[#D35400] hover:bg-[#B84700] text-white transition shadow-sm flex items-center gap-1.5"
            >
              <span>Launch Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 pt-12 pb-20 max-w-7xl mx-auto w-full flex flex-col lg:flex-row items-center gap-12">
        {/* Left Content */}
        <div className="lg:w-1/2 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#DFD3C3]/40 border border-[#DFD3C3] text-xs font-bold text-[#1C2028]">
            <Sparkles className="w-3.5 h-3.5 text-[#D35400]" />
            <span>Generative 3D Computational Architecture</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#1C2028] tracking-tight leading-[1.1]">
            Transform Any Plot Into an <span className="text-[#D35400]">Intelligent Building</span> Design
          </h1>

          <p className="text-sm sm:text-base text-[#5C626F] leading-relaxed max-w-xl">
            Input land dimensions, zoning setbacks, and room requirements. ArchNova AI generates 
            real-time parametric 3D models, verifies FAR/coverage planning compliance, and creates 
            downloadable AutoCAD DXF and SVG floor plans.
          </p>

          <div className="flex flex-wrap items-center gap-3.5 pt-2">
            <button
              onClick={onStartDesigning}
              className="px-6 py-3.5 rounded-xl bg-[#D35400] hover:bg-[#B84700] text-white font-bold text-sm flex items-center gap-2 shadow-lg hover:shadow-orange-500/25 transition active:scale-[0.98]"
            >
              <span>Start Designing Free</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#features"
              className="px-5 py-3.5 rounded-xl bg-white border border-[#D5D3CC] hover:border-[#1C2028] text-[#1C2028] font-bold text-sm transition"
            >
              Explore Features
            </a>
          </div>

          {/* Quick Stats */}
          <div className="pt-6 border-t border-[#E6E4DE] grid grid-cols-3 gap-4">
            <div>
              <span className="text-2xl font-black text-[#1C2028]">100%</span>
              <span className="block text-[11px] font-medium text-[#5C626F]">Parametric Engine</span>
            </div>
            <div>
              <span className="text-2xl font-black text-[#1C2028]">CAD DXF</span>
              <span className="block text-[11px] font-medium text-[#5C626F]">Organized Layers</span>
            </div>
            <div>
              <span className="text-2xl font-black text-[#1C2028]">FAR & Site</span>
              <span className="block text-[11px] font-medium text-[#5C626F]">Automated Check</span>
            </div>
          </div>
        </div>

        {/* Right Interactive 3D Hero Viewport */}
        <div className="lg:w-1/2 w-full h-[460px] sm:h-[520px]">
          <BuildingScene
            designData={heroDemoDesign}
            className="border-2 border-[#D5D3CC] shadow-2xl"
          />
        </div>
      </section>

      {/* Feature Cards Section */}
      <section id="features" className="px-6 py-20 bg-white border-y border-[#E6E4DE]">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold text-[#D35400] uppercase tracking-widest">
              Core Capabilities
            </span>
            <h2 className="text-3xl font-black text-[#1C2028]">
              Architectural Intelligence Built for Precision
            </h2>
            <p className="text-xs sm:text-sm text-[#5C626F]">
              ArchNova AI replaces guesswork with deterministic geometric calculations, interactive 3D WebGL visualization, and exportable engineering assets.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-[#FBFBFA] border border-[#E6E4DE] hover:border-[#D35400] transition space-y-3">
              <div className="w-11 h-11 rounded-xl bg-orange-100 flex items-center justify-center">
                <Compass className="w-6 h-6 text-[#D35400]" />
              </div>
              <h3 className="text-base font-bold text-[#1C2028]">Parametric 3D Generation</h3>
              <p className="text-xs text-[#5C626F] leading-relaxed">
                Generate dynamic 3D building envelopes responsive to plot width, length, road access side, storeys, roof typologies, and setbacks.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-[#FBFBFA] border border-[#E6E4DE] hover:border-[#D35400] transition space-y-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-emerald-700" />
              </div>
              <h3 className="text-base font-bold text-[#1C2028]">Planning Constraint Validator</h3>
              <p className="text-xs text-[#5C626F] leading-relaxed">
                Calculates site coverage %, Floor Area Ratio (FAR/FSI), maximum permissible height, and parking deficits with visual charts.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-[#FBFBFA] border border-[#E6E4DE] hover:border-[#D35400] transition space-y-3">
              <div className="w-11 h-11 rounded-xl bg-purple-100 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-purple-700" />
              </div>
              <h3 className="text-base font-bold text-[#1C2028]">ArchNova Copilot</h3>
              <p className="text-xs text-[#5C626F] leading-relaxed">
                Parse natural-language building requests ("Design a modern 2-floor villa on a 25x30m plot") into structured design parameters.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-[#FBFBFA] border border-[#E6E4DE] hover:border-[#D35400] transition space-y-3">
              <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-blue-700" />
              </div>
              <h3 className="text-base font-bold text-[#1C2028]">CAD Floor Plan Synthesis</h3>
              <p className="text-xs text-[#5C626F] leading-relaxed">
                Generates multi-floor spatial partitions with living areas, bedrooms, kitchen, bathrooms, corridors, and dimension lines.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl bg-[#FBFBFA] border border-[#E6E4DE] hover:border-[#D35400] transition space-y-3">
              <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center">
                <Download className="w-6 h-6 text-amber-700" />
              </div>
              <h3 className="text-base font-bold text-[#1C2028]">CAD & Vector Exports</h3>
              <p className="text-xs text-[#5C626F] leading-relaxed">
                Export real AutoCAD DXF files with layers (WALLS, DOORS, WINDOWS, ROOMS, SETBACKS), vector SVG floor plans, and JSON metadata.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl bg-[#FBFBFA] border border-[#E6E4DE] hover:border-[#D35400] transition space-y-3">
              <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center">
                <Layers className="w-6 h-6 text-slate-800" />
              </div>
              <h3 className="text-base font-bold text-[#1C2028]">Exploded View & Daylight</h3>
              <p className="text-xs text-[#5C626F] leading-relaxed">
                Separate floor plates with an interactive exploded view slider and simulate sun paths from morning through sunset and twilight.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="px-6 py-20 max-w-7xl mx-auto w-full space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold text-[#D35400] uppercase tracking-widest">
            Design Process
          </span>
          <h2 className="text-3xl font-black text-[#1C2028]">
            From Boundary to Blueprint in 4 Steps
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { step: "01", title: "Enter Land Plot", desc: "Define width, length, road access side, orientation angle, and site location." },
            { step: "02", title: "Set Planning Limits", desc: "Input front, rear, and side setbacks, maximum FAR/FSI, and maximum site coverage %." },
            { step: "03", title: "Specify Program", desc: "Choose bedrooms, storeys, bathrooms, parking bays, balconies, and exterior style." },
            { step: "04", title: "Generate & Export", desc: "Review real-time 3D geometry, check compliance metrics, and download AutoCAD DXF." }
          ].map((item, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-white border border-[#E6E4DE] shadow-sm relative">
              <span className="text-3xl font-black text-[#D35400]/25 absolute top-4 right-4">
                {item.step}
              </span>
              <h3 className="text-sm font-bold text-[#1C2028] mt-4 mb-2">{item.title}</h3>
              <p className="text-xs text-[#5C626F] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Technology Showcase Section */}
      <section id="technology" className="px-6 py-16 bg-[#1C2028] text-white">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">Engine Architecture</span>
            <h2 className="text-2xl font-black">Modern Computational Stack</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 text-center">
            {[
              { name: "React 19 & Vite", role: "UI Foundation" },
              { name: "Three.js & R3F", role: "3D WebGL Graphics" },
              { name: "FastAPI & Python", role: "Geometry Backend" },
              { name: "ezdxf", role: "CAD DXF Generation" },
              { name: "Shapely & NumPy", role: "Geometric Mathematics" },
              { name: "Tailwind CSS", role: "Architectural Theme" }
            ].map((tech, i) => (
              <div key={i} className="p-4 rounded-xl bg-[#252A34] border border-[#353B47]">
                <h4 className="font-bold text-xs text-white">{tech.name}</h4>
                <span className="text-[10px] text-gray-400">{tech.role}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Responsible-Use Disclaimer Banner */}
      <section className="px-6 py-8 bg-[#F4F2EC] border-b border-[#E6E4DE]">
        <div className="max-w-4xl mx-auto flex items-start gap-3 text-xs text-[#5C626F] leading-relaxed">
          <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <p>
            <strong>Responsible Use & Legal Disclaimer:</strong> ArchNova AI is a conceptual generative design and spatial planning platform. Calculations and floor plan models are based on user-supplied parameters and mathematical approximations. ArchNova AI does not independently verify municipal building codes, local development control regulations (DCR), environmental setback mandates, or structural load engineering. Always consult licensed architects and professional engineers prior to building permit filing or physical construction.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 bg-white border-t border-[#E6E4DE] text-xs text-[#5C626F]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#D35400]" />
            <span className="font-bold text-[#1C2028]">ArchNova AI</span>
            <span>— Intelligent Parametric Architecture</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-[#1C2028]">GitHub</a>
            <a href="#features" className="hover:text-[#1C2028]">Documentation</a>
            <button onClick={onStartDesigning} className="text-[#D35400] font-bold hover:underline">Launch Studio</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
