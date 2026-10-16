import React, { useState, useEffect } from 'react';
import { 
  FolderKanban, Plus, Trash2, Copy, FileText, Check, X, Calendar, 
  ArrowRight, Sparkles 
} from 'lucide-react';
import api from '../../services/api';

export function ProjectManagerModal({ currentDesign, isOpen, onLoadProject, onClose }) {
  if (isOpen !== undefined && !isOpen) return null;
  const [projects, setProjects] = useState([]);
  const [projectName, setProjectName] = useState(currentDesign?.plot?.project_name || 'My Architecture Project');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    loadProjectsList();
  }, []);

  const loadProjectsList = async () => {
    try {
      const list = await api.getProjects();
      setProjects(list || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveCurrent = async () => {
    if (!currentDesign) return;
    setIsSaving(true);
    try {
      const payload = {
        name: projectName,
        description: description,
        plot_data: currentDesign.plot,
        constraints_data: currentDesign.constraints,
        requirements_data: currentDesign.requirements,
        preferences_data: currentDesign.preferences,
        design_output: currentDesign,
        validation_output: currentDesign.validation
      };
      await api.saveProject(payload);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
      await loadProjectsList();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this saved project?")) return;
    await api.deleteProject(id);
    await loadProjectsList();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-[#E6E4DE] shadow-2xl max-w-2xl w-full overflow-hidden animate-scaleUp max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-[#1C2028] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <FolderKanban className="w-5 h-5 text-[#D35400]" />
            <h3 className="font-bold text-sm">ArchNova Project Studio Manager</h3>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-white rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Save Current Project Section */}
          <div className="p-4 rounded-xl bg-[#FBFBFA] border border-[#E6E4DE] space-y-3">
            <span className="font-bold text-[#1C2028] text-xs block">Save Current Working Concept</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-[#5C626F] block mb-1">Project Name</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-[#D5D3CC] focus:outline-none focus:border-[#D35400] bg-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-[#5C626F] block mb-1">Brief Description / Notes</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Client presentation draft v1"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-[#D5D3CC] focus:outline-none focus:border-[#D35400] bg-white"
                />
              </div>
            </div>
            <div className="flex justify-end pt-1">
              <button
                onClick={handleSaveCurrent}
                disabled={isSaving}
                className="px-4 py-2 rounded-xl bg-[#D35400] hover:bg-[#B84700] text-white font-bold flex items-center gap-1.5 transition shadow-sm disabled:opacity-50"
              >
                {saveSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Saved Successfully!</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isSaving ? "Saving..." : "Save Project"}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Saved Projects List */}
          <div className="space-y-3">
            <span className="font-bold text-[#1C2028] text-xs block">
              Saved Studio Projects ({projects.length})
            </span>

            {projects.length === 0 ? (
              <p className="text-gray-400 italic py-4 text-center">No projects saved yet. Save your current design above!</p>
            ) : (
              <div className="space-y-2">
                {projects.map((proj) => (
                  <div
                    key={proj.id}
                    className="p-3.5 rounded-xl border border-[#E6E4DE] hover:border-[#D35400] bg-white flex items-center justify-between gap-3 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center font-bold text-[#1C2028]">
                        <FileText className="w-4 h-4 text-[#5C626F]" />
                      </div>
                      <div>
                        <h4 className="font-bold text-[#1C2028]">{proj.name}</h4>
                        <p className="text-[11px] text-[#8E95A5]">
                          {proj.description || "Parametric Architecture Model"} • {proj.plot_data?.plot_width}m × {proj.plot_data?.plot_length}m
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (proj.design_output) {
                            onLoadProject(proj.design_output);
                            onClose();
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#1C2028] text-white font-semibold hover:bg-[#2E3543] flex items-center gap-1 transition"
                      >
                        <span>Open</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDelete(proj.id)}
                        className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                        title="Delete project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#F4F2EC] border-t border-[#E6E4DE] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-xs font-bold text-gray-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
