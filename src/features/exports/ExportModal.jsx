import React from 'react';
import { 
  Download, FileCode, FileText, Image, X, CheckCircle, Sparkles, Layers 
} from 'lucide-react';
import api from '../../services/api';

export function ExportModal({ designData, isOpen, onClose }) {
  if (!isOpen || !designData) return null;

  const { plot, geometry, validation } = designData;

  const handleDownloadDxf = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/exports/dxf?floor=0`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          building_width: geometry.building_width,
          building_depth: geometry.building_depth,
          num_floors: geometry.floor_count,
          plot_width: plot.plot_width,
          plot_length: plot.plot_length,
          front_setback: 3.5,
          rear_setback: 3.0,
          left_setback: 2.0,
          right_setback: 2.0
        })
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${plot.project_name || 'archnova'}_plan.dxf`;
        link.click();
        URL.revokeObjectURL(url);
      }
    } catch (e) {
      alert("DXF export requires backend running on port 8000");
    }
  };

  const handleDownloadSvg = async () => {
    try {
      const svgText = await api.getFloorplanSvg({
        building_width: geometry.building_width,
        building_depth: geometry.building_depth,
        num_floors: geometry.floor_count,
        plot_width: plot.plot_width,
        plot_length: plot.plot_length
      }, 0);
      if (svgText) {
        const blob = new Blob([svgText], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${plot.project_name || 'archnova'}_plan.svg`;
        link.click();
        URL.revokeObjectURL(url);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownloadJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(designData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${plot.project_name || 'archnova'}_metadata.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-[#E6E4DE] shadow-2xl max-w-lg w-full overflow-hidden animate-scaleUp">
        {/* Header */}
        <div className="px-6 py-4 bg-[#1C2028] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-[#D35400]" />
            <h3 className="font-bold text-sm">Export CAD & Project Deliverables</h3>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-white rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Export Options */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-[#5C626F]">
            Export verified architectural drawing data generated directly from your parametric spatial calculations.
          </p>

          <div className="space-y-3">
            {/* Option 1: DXF */}
            <div className="p-4 rounded-xl border border-[#E6E4DE] hover:border-[#D35400] transition flex items-center justify-between gap-4 bg-[#FBFBFA]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <FileCode className="w-5 h-5 text-amber-800" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#1C2028]">AutoCAD Drawing Exchange (.DXF)</h4>
                  <p className="text-[11px] text-[#5C626F]">Layers: WALLS, DOORS, WINDOWS, ROOMS, SETBACKS, DIMENSIONS</p>
                </div>
              </div>
              <button
                onClick={handleDownloadDxf}
                className="px-3.5 py-2 rounded-xl bg-[#1C2028] hover:bg-[#2E3543] text-white text-xs font-semibold flex items-center gap-1.5 shrink-0 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export DXF</span>
              </button>
            </div>

            {/* Option 2: SVG */}
            <div className="p-4 rounded-xl border border-[#E6E4DE] hover:border-[#D35400] transition flex items-center justify-between gap-4 bg-[#FBFBFA]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-sky-800" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#1C2028]">Vector Floor Plan (.SVG)</h4>
                  <p className="text-[11px] text-[#5C626F]">Scalable 2D architectural drawing with dimensions & North indicator</p>
                </div>
              </div>
              <button
                onClick={handleDownloadSvg}
                className="px-3.5 py-2 rounded-xl bg-[#D35400] hover:bg-[#B84700] text-white text-xs font-semibold flex items-center gap-1.5 shrink-0 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export SVG</span>
              </button>
            </div>

            {/* Option 3: JSON Config */}
            <div className="p-4 rounded-xl border border-[#E6E4DE] hover:border-[#D35400] transition flex items-center justify-between gap-4 bg-[#FBFBFA]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-purple-800" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#1C2028]">Project Metadata (.JSON)</h4>
                  <p className="text-[11px] text-[#5C626F]">Complete geometry vertices, levels, materials, and constraint reports</p>
                </div>
              </div>
              <button
                onClick={handleDownloadJson}
                className="px-3.5 py-2 rounded-xl border border-[#D5D3CC] hover:bg-gray-100 text-[#1C2028] text-xs font-semibold flex items-center gap-1.5 shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON</span>
              </button>
            </div>
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
