import React, { useState, useEffect } from 'react';
import { 
  Layers, Download, ZoomIn, ZoomOut, RotateCcw, Compass, 
  FileCode, Maximize2, Check, AlertCircle 
} from 'lucide-react';
import api from '../../services/api';

export function FloorPlanViewer({ designData }) {
  const [selectedFloor, setSelectedFloor] = useState(0);
  const [floorplanData, setFloorplanData] = useState(null);
  const [svgContent, setSvgContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  const geometry = designData?.geometry;
  const plot = designData?.plot;
  const constraints = designData?.constraints;
  const requirements = designData?.requirements;

  // Load floorplan data whenever designData changes
  useEffect(() => {
    if (!geometry) return;

    async function fetchFloorplan() {
      setIsLoading(true);
      const params = {
        building_width: geometry.building_width || 12,
        building_depth: geometry.building_depth || 10,
        num_floors: geometry.floor_count || 2,
        num_bedrooms: requirements?.num_bedrooms || 3,
        num_bathrooms: requirements?.num_bathrooms || 2,
        has_balcony: requirements?.balcony_requirement ?? true,
        has_staircase: requirements?.staircase_requirement ?? true,
        plot_width: plot?.plot_width || 20,
        plot_length: plot?.plot_length || 30,
        front_setback: constraints?.front_setback || 3.5,
        rear_setback: constraints?.rear_setback || 3.0,
        left_setback: constraints?.left_setback || 2.0,
        right_setback: constraints?.right_setback || 2.0,
        room_size_preference: requirements?.approx_room_sizes || 'standard'
      };

      try {
        const data = await api.generateFloorplans(params);
        setFloorplanData(data);

        const svg = await api.getFloorplanSvg(params, selectedFloor);
        if (svg) {
          setSvgContent(svg);
        }
      } catch (err) {
        console.error("Failed to load floor plans:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchFloorplan();
  }, [designData, selectedFloor]);

  const floors = floorplanData?.floors || [];
  const currentFloor = floors[selectedFloor] || floors[0];
  const rooms = currentFloor?.rooms || [];

  const handleDownloadSvg = () => {
    if (!svgContent) return;
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `archnova_floor_${selectedFloor + 1}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadDxf = async () => {
    if (!geometry) return;
    const params = {
      building_width: geometry.building_width,
      building_depth: geometry.building_depth,
      num_floors: geometry.floor_count,
      num_bedrooms: requirements?.num_bedrooms || 3,
      num_bathrooms: requirements?.num_bathrooms || 2,
      has_balcony: requirements?.balcony_requirement ?? true,
      has_staircase: requirements?.staircase_requirement ?? true,
      plot_width: plot?.plot_width || 20,
      plot_length: plot?.plot_length || 30,
      front_setback: constraints?.front_setback || 3.5,
      rear_setback: constraints?.rear_setback || 3.0,
      left_setback: constraints?.left_setback || 2.0,
      right_setback: constraints?.right_setback || 2.0
    };

    try {
      const res = await fetch(`http://localhost:8000/api/exports/dxf?floor=${selectedFloor}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `archnova_level_${selectedFloor + 1}.dxf`;
        link.click();
        URL.revokeObjectURL(url);
      }
    } catch (e) {
      alert("DXF export requires backend API running on localhost:8000");
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E6E4DE] shadow-sm overflow-hidden flex flex-col h-full">
      {/* Top Header & Floor Switcher Bar */}
      <div className="border-b border-[#E6E4DE] bg-[#FBFBFA] px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-[#D35400] uppercase tracking-wider block">
            Algorithmic 2D Layouts
          </span>
          <h3 className="text-base font-bold text-[#1C2028]">CAD Floor Plan Generator</h3>
        </div>

        {/* Floor Level Selector Tabs */}
        <div className="flex items-center gap-1.5 bg-[#EFECE6] p-1 rounded-xl">
          {floors.map((fl, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedFloor(idx)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                selectedFloor === idx
                  ? 'bg-white text-[#1C2028] shadow-sm'
                  : 'text-[#5C626F] hover:text-[#1C2028]'
              }`}
            >
              {fl.floor_name}
            </button>
          ))}
        </div>

        {/* Export & Zoom Actions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setZoomLevel(Math.max(0.6, zoomLevel - 0.15))}
              className="p-1 text-[#5C626F] hover:bg-white rounded"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono px-1">{Math.round(zoomLevel * 100)}%</span>
            <button
              onClick={() => setZoomLevel(Math.min(1.8, zoomLevel + 0.15))}
              className="p-1 text-[#5C626F] hover:bg-white rounded"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1 text-[#5C626F] hover:bg-white rounded"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          <button
            onClick={handleDownloadSvg}
            className="px-3 py-1.5 rounded-xl border border-[#D5D3CC] hover:border-[#D35400] text-xs font-semibold text-[#1C2028] hover:text-[#D35400] flex items-center gap-1.5 transition"
            title="Download architectural vector SVG"
          >
            <Download className="w-3.5 h-3.5 text-[#D35400]" />
            <span>SVG</span>
          </button>

          <button
            onClick={handleDownloadDxf}
            className="px-3 py-1.5 rounded-xl bg-[#1C2028] hover:bg-[#2E3543] text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
            title="Download standard AutoCAD DXF with layers"
          >
            <FileCode className="w-3.5 h-3.5 text-orange-400" />
            <span>AutoCAD DXF</span>
          </button>
        </div>
      </div>

      {/* Main Floor Plan SVG Canvas Area */}
      <div className="relative flex-1 bg-[#FBFBFA] architectural-grid overflow-auto p-6 flex items-center justify-center min-h-[420px]">
        {isLoading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-[#D35400] border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-semibold text-[#5C626F]">Generating architectural partitions...</span>
          </div>
        ) : svgContent ? (
          <div
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
            className="transition-transform duration-200 shadow-lg rounded-xl overflow-hidden border border-gray-300 bg-white"
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        ) : (
          <div className="text-center p-8">
            <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-xs text-gray-500">Generate a building design first to inspect 2D CAD floor plans.</p>
          </div>
        )}
      </div>

      {/* Room Program Breakdown Footer */}
      <div className="border-t border-[#E6E4DE] bg-white px-6 py-3.5">
        <span className="text-[10px] font-bold text-[#8E95A5] uppercase tracking-wider block mb-2">
          {currentFloor?.floor_name || 'Ground Floor'} Spatial Program & Areas
        </span>
        <div className="flex flex-wrap gap-2">
          {rooms.map((r, i) => (
            <div
              key={i}
              className="px-2.5 py-1 rounded-lg border border-[#E6E4DE] bg-[#FDFDFD] flex items-center gap-2 text-xs"
            >
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: r.color || '#94A3B8' }} />
              <span className="font-semibold text-[#1C2028]">{r.name}:</span>
              <span className="font-mono text-[#5C626F]">{r.width}m × {r.depth}m ({r.area_sqm} m²)</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
