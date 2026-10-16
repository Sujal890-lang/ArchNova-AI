import React, { useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { BuildingGeometry } from './BuildingGeometry';
import { GroundAndPlot } from './GroundAndPlot';
import { Landscaping } from './Landscaping';
import { 
  Sun, Moon, Sunset, Eye, Grid, Maximize2, Camera, Layers, 
  RotateCcw, Compass, Sparkles 
} from 'lucide-react';

export function BuildingScene({
  designData,
  onScreenshot,
  className = ""
}) {
  const [daylight, setDaylight] = useState('golden_hour'); // morning, noon, golden_hour, night
  const [explodedOffset, setExplodedOffset] = useState(0);
  const [showGrid, setShowGrid] = useState(true);
  const [showBoundary, setShowBoundary] = useState(true);
  const [showSetbacks, setShowSetbacks] = useState(true);
  const [showLandscaping, setShowLandscaping] = useState(true);
  const [showDimensions, setShowDimensions] = useState(true);
  const [cameraPreset, setCameraPreset] = useState('perspective');

  const canvasRef = useRef(null);
  const controlsRef = useRef(null);

  const geometry = designData?.geometry;
  const plotBoundary = geometry?.plot_boundary;
  const setbacksRect = geometry?.setbacks_rect;
  const parkingCount = designData?.requirements?.parking_spaces || 2;

  // Handle camera preset positions
  useEffect(() => {
    if (!controlsRef.current) return;
    const controls = controlsRef.current;
    
    if (cameraPreset === 'top') {
      controls.object.position.set(0, 42, 0.01);
      controls.target.set(0, 0, 0);
    } else if (cameraPreset === 'front') {
      controls.object.position.set(0, 8, 35);
      controls.target.set(0, 4, 0);
    } else if (cameraPreset === 'isometric') {
      controls.object.position.set(30, 25, 30);
      controls.target.set(0, 3, 0);
    } else {
      // Perspective default
      controls.object.position.set(24, 18, 28);
      controls.target.set(0, 4, 0);
    }
    controls.update();
  }, [cameraPreset]);

  // Capture canvas screenshot
  const handleTakeScreenshot = () => {
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      if (onScreenshot) {
        onScreenshot(dataUrl);
      } else {
        const link = document.createElement('a');
        link.download = `archnova_${designData?.project_name || 'concept'}.png`;
        link.href = dataUrl;
        link.click();
      }
    }
  };

  // Lighting parameters based on daylight
  const lightConfig = {
    morning: {
      ambient: '#FDE047',
      ambientIntensity: 0.6,
      sunColor: '#FFFBEB',
      sunIntensity: 1.4,
      sunPos: [-25, 20, 20],
      bg: '#E0F2FE'
    },
    noon: {
      ambient: '#FFFFFF',
      ambientIntensity: 0.7,
      sunColor: '#FFFFFF',
      sunIntensity: 1.6,
      sunPos: [10, 40, 10],
      bg: '#BAE6FD'
    },
    golden_hour: {
      ambient: '#FED7AA',
      ambientIntensity: 0.5,
      sunColor: '#EA580C',
      sunIntensity: 1.8,
      sunPos: [35, 12, 25],
      bg: '#FED7AA'
    },
    night: {
      ambient: '#1E293B',
      ambientIntensity: 0.3,
      sunColor: '#38BDF8',
      sunIntensity: 0.4,
      sunPos: [20, 30, -20],
      bg: '#0F172A'
    }
  }[daylight];

  return (
    <div className={`relative w-full h-full min-h-[480px] bg-[#E8E6E1] rounded-2xl overflow-hidden border border-[#D5D3CC] shadow-inner select-none ${className}`}>
      
      {/* 3D Canvas */}
      <Canvas
        shadows
        gl={{ preserveDrawingBuffer: true, antialias: true }}
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      >
        <PerspectiveCamera makeDefault position={[24, 18, 28]} fov={40} />
        <OrbitControls
          ref={controlsRef}
          enableDamping
          dampingFactor={0.06}
          minDistance={6}
          maxDistance={120}
          maxPolarAngle={Math.PI / 2 - 0.02} // don't dip under ground
        />

        {/* Environmental Lighting */}
        <color attach="background" args={[lightConfig.bg]} />
        <ambientLight color={lightConfig.ambient} intensity={lightConfig.ambientIntensity} />
        <directionalLight
          position={lightConfig.sunPos}
          intensity={lightConfig.sunIntensity}
          color={lightConfig.sunColor}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-near={0.5}
          shadow-camera-far={140}
          shadow-camera-left={-30}
          shadow-camera-right={30}
          shadow-camera-top={30}
          shadow-camera-bottom={-30}
          shadow-bias={-0.0005}
        />
        {/* Soft fill light */}
        <directionalLight position={[-lightConfig.sunPos[0], 10, -lightConfig.sunPos[2]]} intensity={0.3} color="#94A3B8" />

        {/* Ground and Plot representation */}
        <GroundAndPlot
          plotBoundary={plotBoundary}
          setbacksRect={setbacksRect}
          showBoundary={showBoundary}
          showSetbacks={showSetbacks}
          showGrid={showGrid}
          showDimensions={showDimensions}
        />

        {/* Parametric Building Model */}
        <BuildingGeometry
          geometryData={geometry}
          explodedOffset={explodedOffset}
        />

        {/* Landscaping & Vehicles */}
        {showLandscaping && (
          <Landscaping
            plotBoundary={plotBoundary}
            setbacksRect={setbacksRect}
            parkingCount={parkingCount}
          />
        )}
      </Canvas>

      {/* Floating Toolbar Controls */}
      <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-10">
        {/* View Camera Presets */}
        <div className="glass-panel rounded-xl px-2 py-1.5 flex items-center gap-1 shadow-sm border border-[#E6E4DE]">
          <span className="text-[11px] font-semibold text-[#5C626F] px-1 uppercase tracking-wider">View</span>
          <button
            onClick={() => setCameraPreset('perspective')}
            className={`px-2 py-1 text-xs rounded-lg font-medium transition ${cameraPreset === 'perspective' ? 'bg-[#D35400] text-white shadow-sm' : 'text-[#2C3E50] hover:bg-black/5'}`}
            title="Perspective View"
          >
            3D Iso
          </button>
          <button
            onClick={() => setCameraPreset('top')}
            className={`px-2 py-1 text-xs rounded-lg font-medium transition ${cameraPreset === 'top' ? 'bg-[#D35400] text-white shadow-sm' : 'text-[#2C3E50] hover:bg-black/5'}`}
            title="Top CAD Plan View"
          >
            Top / CAD
          </button>
          <button
            onClick={() => setCameraPreset('front')}
            className={`px-2 py-1 text-xs rounded-lg font-medium transition ${cameraPreset === 'front' ? 'bg-[#D35400] text-white shadow-sm' : 'text-[#2C3E50] hover:bg-black/5'}`}
            title="Front Elevation"
          >
            Front Elevation
          </button>
        </div>

        {/* Daylight Previews */}
        <div className="glass-panel rounded-xl px-2 py-1.5 flex items-center gap-1 shadow-sm border border-[#E6E4DE]">
          <button
            onClick={() => setDaylight('morning')}
            className={`p-1.5 rounded-lg transition ${daylight === 'morning' ? 'bg-amber-100 text-amber-800' : 'text-[#5C626F] hover:bg-black/5'}`}
            title="Morning Light"
          >
            <Sun className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDaylight('noon')}
            className={`p-1.5 rounded-lg transition ${daylight === 'noon' ? 'bg-sky-100 text-sky-800' : 'text-[#5C626F] hover:bg-black/5'}`}
            title="High Noon"
          >
            <Sun className="w-4 h-4 text-amber-500 fill-amber-400" />
          </button>
          <button
            onClick={() => setDaylight('golden_hour')}
            className={`p-1.5 rounded-lg transition ${daylight === 'golden_hour' ? 'bg-orange-100 text-orange-800' : 'text-[#5C626F] hover:bg-black/5'}`}
            title="Golden Hour"
          >
            <Sunset className="w-4 h-4 text-orange-600" />
          </button>
          <button
            onClick={() => setDaylight('night')}
            className={`p-1.5 rounded-lg transition ${daylight === 'night' ? 'bg-slate-800 text-slate-100' : 'text-[#5C626F] hover:bg-black/5'}`}
            title="Night Simulation"
          >
            <Moon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Floating Top Right Tools */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        <button
          onClick={handleTakeScreenshot}
          className="glass-panel px-3 py-1.5 rounded-xl text-xs font-medium text-[#1C2028] hover:text-[#D35400] flex items-center gap-1.5 shadow-sm transition active:scale-95"
          title="Export high-resolution screenshot"
        >
          <Camera className="w-3.5 h-3.5 text-[#D35400]" />
          <span>Screenshot</span>
        </button>
      </div>

      {/* Bottom Floating Control Bar (Exploded View & Layer Toggles) */}
      <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3 pointer-events-none z-10">
        {/* Exploded View Slider */}
        <div className="glass-panel pointer-events-auto rounded-xl px-3.5 py-2 flex items-center gap-3 shadow-md border border-[#E6E4DE]">
          <Layers className="w-4 h-4 text-[#D35400]" />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-[#5C626F] uppercase tracking-wider">Exploded Floor View</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={explodedOffset}
              onChange={(e) => setExplodedOffset(parseFloat(e.target.value))}
              className="w-28 sm:w-36 h-1.5 accent-[#D35400] bg-gray-200 rounded-lg cursor-pointer"
            />
          </div>
          <span className="text-xs font-mono font-semibold text-[#1C2028]">{Math.round(explodedOffset * 100)}%</span>
        </div>

        {/* Toggle Badges */}
        <div className="glass-panel pointer-events-auto rounded-xl px-2 py-1.5 flex items-center gap-1.5 shadow-md border border-[#E6E4DE] text-xs font-medium">
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`px-2.5 py-1 rounded-lg transition ${showGrid ? 'bg-[#1C2028] text-white' : 'text-[#5C626F] hover:bg-black/5'}`}
          >
            Grid
          </button>
          <button
            onClick={() => setShowBoundary(!showBoundary)}
            className={`px-2.5 py-1 rounded-lg transition ${showBoundary ? 'bg-[#1C2028] text-white' : 'text-[#5C626F] hover:bg-black/5'}`}
          >
            Boundary
          </button>
          <button
            onClick={() => setShowSetbacks(!showSetbacks)}
            className={`px-2.5 py-1 rounded-lg transition ${showSetbacks ? 'bg-[#D35400] text-white' : 'text-[#5C626F] hover:bg-black/5'}`}
          >
            Setbacks
          </button>
          <button
            onClick={() => setShowLandscaping(!showLandscaping)}
            className={`px-2.5 py-1 rounded-lg transition ${showLandscaping ? 'bg-[#1C2028] text-white' : 'text-[#5C626F] hover:bg-black/5'}`}
          >
            Trees
          </button>
        </div>
      </div>
    </div>
  );
}
