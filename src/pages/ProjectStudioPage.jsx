import React, { useState, useEffect } from 'react';
import { 
  Building2, Compass, ShieldCheck, Sparkles, Layers, Download, 
  FolderKanban, User, ArrowLeft, RefreshCw, Eye, AlertTriangle, 
  CheckCircle2, Bot 
} from 'lucide-react';
import { BuildingScene } from '../three/BuildingScene';
import { PropertyInputWizard } from '../features/property/PropertyInputWizard';
import { FloorPlanViewer } from '../features/floorplan/FloorPlanViewer';
import { PlanningValidationDashboard } from '../features/validation/PlanningValidationDashboard';
import { ArchNovaCopilot } from '../features/copilot/ArchNovaCopilot';
import { ExportModal } from '../features/exports/ExportModal';
import { ProjectManagerModal } from '../features/projects/ProjectManagerModal';
import { AuthModal } from '../components/AuthModal';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export function ProjectStudioPage({ onBackToLanding }) {
  const { user } = useAuth();

  // Active workspace view tab: '3d', 'floorplan', 'validation'
  const [activeTab, setActiveTab] = useState('3d');
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isProjectManagerOpen, setIsProjectManagerOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    plot: {
      project_name: "ArchNova Villa Horizon",
      plot_width: 22.0,
      plot_length: 30.0,
      plot_shape: "rectangular",
      road_facing_side: "south",
      num_road_facing_sides: 1,
      north_direction: 0,
      site_location: "Eco Urban District",
      terrain: "flat"
    },
    constraints: {
      max_height: 12.0,
      front_setback: 3.5,
      rear_setback: 3.0,
      left_setback: 2.0,
      right_setback: 2.0,
      max_far: 1.8,
      max_site_coverage: 60.0,
      max_floors: 3,
      parking_spaces_required: 2
    },
    requirements: {
      building_type: "residential",
      num_bedrooms: 3,
      num_bathrooms: 3,
      num_floors: 2,
      preferred_footprint: null,
      approx_room_sizes: "standard",
      parking_spaces: 2,
      balcony_requirement: true,
      garden_requirement: true,
      terrace_requirement: true,
      staircase_requirement: true,
      lift_requirement: false
    },
    preferences: {
      architectural_style: "modern",
      roof_type: "flat",
      window_style: "ribbon",
      exterior_material: "concrete_white_stucco",
      exterior_color: "warm_offwhite",
      balcony_style: "cantilever_glass",
      landscaping_style: "geometric_courtyard"
    }
  });

  // Current Generated Design State
  const [currentDesign, setCurrentDesign] = useState(null);

  // Initial generation on load
  useEffect(() => {
    handleGenerateDesign();
  }, []);

  const handleGenerateDesign = async () => {
    setIsGenerating(true);
    try {
      const design = await api.generateDesign(formData);
      setCurrentDesign(design);
    } catch (e) {
      console.error("Design generation failed:", e);
    } finally {
      setIsGenerating(false);
    }
  };

  // When user applies a design from Copilot
  const handleApplyCopilotDesign = async (suggested) => {
    if (!suggested) return;
    const merged = {
      plot: { ...formData.plot, ...suggested.plot },
      constraints: { ...formData.constraints, ...suggested.constraints },
      requirements: { ...formData.requirements, ...suggested.requirements },
      preferences: { ...formData.preferences, ...suggested.preferences }
    };
    setFormData(merged);
    setIsGenerating(true);
    try {
      const design = await api.generateDesign(merged);
      setCurrentDesign(design);
    } finally {
      setIsGenerating(false);
    }
  };

  // When user loads a project from Project Manager
  const handleLoadSavedProject = (loadedDesign) => {
    if (!loadedDesign) return;
    setCurrentDesign(loadedDesign);
    setFormData({
      plot: loadedDesign.plot || formData.plot,
      constraints: loadedDesign.constraints || formData.constraints,
      requirements: loadedDesign.requirements || formData.requirements,
      preferences: loadedDesign.preferences || formData.preferences
    });
  };

  const validation = currentDesign?.validation;

  return (
    <div className="h-screen w-screen bg-[#F9F8F5] flex flex-col overflow-hidden text-[#1C2028]">
      
      {/* Studio Header Bar */}
      <header className="h-14 border-b border-[#E6E4DE] bg-white px-4 flex items-center justify-between shrink-0 z-20">
        {/* Left: Brand & Project Name */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToLanding}
            className="p-1.5 rounded-xl hover:bg-gray-100 text-[#5C626F] hover:text-[#1C2028] transition"
            title="Return to Home"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#D35400] flex items-center justify-center text-white">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-xs text-[#1C2028] block leading-tight">
                {formData.plot.project_name || "Untitled Concept"}
              </span>
              <span className="text-[10px] text-[#8E95A5]">
                {formData.plot.plot_width}m × {formData.plot.plot_length}m • {formData.requirements.num_floors} Levels
              </span>
            </div>
          </div>
        </div>

        {/* Center: Workspace View Switcher Tabs */}
        <div className="flex items-center gap-1 bg-[#F4F2EC] p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('3d')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === '3d'
                ? 'bg-white text-[#1C2028] shadow-sm'
                : 'text-[#5C626F] hover:text-[#1C2028]'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-[#D35400]" />
            <span>3D Viewport</span>
          </button>

          <button
            onClick={() => setActiveTab('floorplan')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'floorplan'
                ? 'bg-white text-[#1C2028] shadow-sm'
                : 'text-[#5C626F] hover:text-[#1C2028]'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-blue-600" />
            <span>CAD Floor Plans</span>
          </button>

          <button
            onClick={() => setActiveTab('validation')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'validation'
                ? 'bg-white text-[#1C2028] shadow-sm'
                : 'text-[#5C626F] hover:text-[#1C2028]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Planning & FAR</span>
            {validation && (
              <span className={`w-2 h-2 rounded-full ${validation.is_valid ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            )}
          </button>
        </div>

        {/* Right: Studio Actions & User */}
        <div className="flex items-center gap-2">
          {/* ArchNova Copilot Toggle */}
          <button
            onClick={() => setIsCopilotOpen(!isCopilotOpen)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border shadow-sm ${
              isCopilotOpen
                ? 'bg-[#1C2028] text-white border-[#1C2028]'
                : 'bg-white border-[#D5D3CC] hover:border-[#D35400] text-[#1C2028]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D35400]" />
            <span className="hidden sm:inline">ArchNova Copilot</span>
          </button>

          {/* Export CAD */}
          <button
            onClick={() => setIsExportOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-[#D35400] hover:bg-[#B84700] text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CAD</span>
          </button>

          {/* Project Manager */}
          <button
            onClick={() => setIsProjectManagerOpen(true)}
            className="p-1.5 rounded-xl border border-[#D5D3CC] hover:border-[#1C2028] text-[#5C626F] hover:text-[#1C2028] transition"
            title="Projects & Save"
          >
            <FolderKanban className="w-4 h-4" />
          </button>

          {/* User Profile */}
          <button
            onClick={() => setIsAuthOpen(true)}
            className="flex items-center gap-1.5 p-1.5 rounded-xl hover:bg-gray-100 text-xs font-medium text-[#1C2028]"
          >
            <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center font-bold text-[11px] text-[#5C626F]">
              {user?.full_name ? user.full_name[0].toUpperCase() : <User className="w-3.5 h-3.5" />}
            </div>
          </button>
        </div>
      </header>

      {/* Main Workbench Body (Split View) */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Left Drawer / Panel: Multi-Step Land Property Input Form */}
        <div className="w-full sm:w-[380px] lg:w-[420px] shrink-0 h-full border-r border-[#E6E4DE] bg-[#FBFBFA] z-10">
          <PropertyInputWizard
            formData={formData}
            onChange={setFormData}
            onGenerate={handleGenerateDesign}
            isGenerating={isGenerating}
            validationResult={validation}
          />
        </div>

        {/* Center Canvas / Content Area */}
        <div className="flex-1 h-full p-4 overflow-hidden relative bg-[#F4F2EC]">
          {activeTab === '3d' && (
            <BuildingScene
              designData={currentDesign}
              className="w-full h-full"
            />
          )}

          {activeTab === 'floorplan' && (
            <div className="w-full h-full">
              <FloorPlanViewer designData={currentDesign} />
            </div>
          )}

          {activeTab === 'validation' && (
            <div className="w-full h-full overflow-y-auto">
              <PlanningValidationDashboard
                validationResult={validation}
                designData={currentDesign}
              />
            </div>
          )}
        </div>

        {/* Right Floating / Slide-out Copilot Panel */}
        {isCopilotOpen && (
          <div className="absolute top-4 right-4 bottom-4 w-96 z-30 shadow-2xl animate-slideLeft">
            <ArchNovaCopilot
              currentDesign={currentDesign}
              onApplyDesign={handleApplyCopilotDesign}
              onClose={() => setIsCopilotOpen(false)}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      <ExportModal
        designData={currentDesign}
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />

      {isProjectManagerOpen && (
        <ProjectManagerModal
          currentDesign={currentDesign}
          onLoadProject={handleLoadSavedProject}
          onClose={() => setIsProjectManagerOpen(false)}
        />
      )}

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />
    </div>
  );
}
