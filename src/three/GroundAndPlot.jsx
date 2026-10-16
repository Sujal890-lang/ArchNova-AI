import React, { useMemo } from 'react';
import * as THREE from 'three';

export function GroundAndPlot({
  plotBoundary,
  setbacksRect,
  showBoundary = true,
  showSetbacks = true,
  showGrid = true,
  showDimensions = true
}) {
  const pw = plotBoundary?.width || 20;
  const pl = plotBoundary?.length || 30;

  // Ground grid helper size
  const gridSize = Math.max(pw, pl) * 2.2;

  // Setback box coordinates
  const sbMinX = setbacksRect?.min_x ?? -6;
  const sbMaxX = setbacksRect?.max_x ?? 6;
  const sbMinZ = setbacksRect?.min_z ?? -10;
  const sbMaxZ = setbacksRect?.max_z ?? 10;
  const sbWidth = Math.max(1, sbMaxX - sbMinX);
  const sbDepth = Math.max(1, sbMaxZ - sbMinZ);
  const sbCenterX = (sbMinX + sbMaxX) / 2;
  const sbCenterZ = (sbMinZ + sbMaxZ) / 2;

  return (
    <group position={[0, 0, 0]}>
      {/* Infinite/Extended Ground Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[180, 180]} />
        <meshStandardMaterial color="#EFECE6" roughness={0.9} />
      </mesh>

      {/* Plot Site Turf / Foundation Plate */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[pw, pl]} />
        <meshStandardMaterial color="#DFDDD7" roughness={0.8} />
      </mesh>

      {/* Access Road on +Z side */}
      <group position={[0, -0.005, (pl / 2) + 3.5]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[pw + 16, 7]} />
          <meshStandardMaterial color="#2B303A" roughness={0.7} />
        </mesh>
        {/* Road center dash stripe */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
          <planeGeometry args={[pw + 14, 0.2]} />
          <meshStandardMaterial color="#F9FAFB" />
        </mesh>
        {/* Curbs */}
        <mesh position={[0, 0.08, -3.5]}>
          <boxGeometry args={[pw + 16, 0.16, 0.3]} />
          <meshStandardMaterial color="#9CA3AF" roughness={0.8} />
        </mesh>
      </group>

      {/* Plot Boundary Line Indicator */}
      {showBoundary && (
        <group position={[0, 0.02, 0]}>
          {/* North curb */}
          <mesh position={[0, 0.04, -pl / 2]}>
            <boxGeometry args={[pw, 0.08, 0.15]} />
            <meshStandardMaterial color="#1E293B" />
          </mesh>
          {/* South curb */}
          <mesh position={[0, 0.04, pl / 2]}>
            <boxGeometry args={[pw, 0.08, 0.15]} />
            <meshStandardMaterial color="#1E293B" />
          </mesh>
          {/* West curb */}
          <mesh position={[-pw / 2, 0.04, 0]}>
            <boxGeometry args={[0.15, 0.08, pl]} />
            <meshStandardMaterial color="#1E293B" />
          </mesh>
          {/* East curb */}
          <mesh position={[pw / 2, 0.04, 0]}>
            <boxGeometry args={[0.15, 0.08, pl]} />
            <meshStandardMaterial color="#1E293B" />
          </mesh>
          {/* Corner Boundary Markers */}
          {[
            [-pw / 2, -pl / 2],
            [pw / 2, -pl / 2],
            [pw / 2, pl / 2],
            [-pw / 2, pl / 2]
          ].map(([cx, cz], i) => (
            <mesh key={`corner-${i}`} position={[cx, 0.25, cz]}>
              <cylinderGeometry args={[0.15, 0.15, 0.5, 16]} />
              <meshStandardMaterial color="#D35400" />
            </mesh>
          ))}
        </group>
      )}

      {/* Setbacks Envelope Guide */}
      {showSetbacks && (
        <group position={[sbCenterX, 0.03, sbCenterZ]}>
          {/* North setback line */}
          <mesh position={[0, 0.02, -sbDepth / 2]}>
            <boxGeometry args={[sbWidth, 0.04, 0.08]} />
            <meshStandardMaterial color="#D35400" roughness={0.3} emissive="#D35400" emissiveIntensity={0.2} />
          </mesh>
          {/* South setback line */}
          <mesh position={[0, 0.02, sbDepth / 2]}>
            <boxGeometry args={[sbWidth, 0.04, 0.08]} />
            <meshStandardMaterial color="#D35400" roughness={0.3} emissive="#D35400" emissiveIntensity={0.2} />
          </mesh>
          {/* West setback line */}
          <mesh position={[-sbWidth / 2, 0.02, 0]}>
            <boxGeometry args={[0.08, 0.04, sbDepth]} />
            <meshStandardMaterial color="#D35400" roughness={0.3} emissive="#D35400" emissiveIntensity={0.2} />
          </mesh>
          {/* East setback line */}
          <mesh position={[sbWidth / 2, 0.02, 0]}>
            <boxGeometry args={[0.08, 0.04, sbDepth]} />
            <meshStandardMaterial color="#D35400" roughness={0.3} emissive="#D35400" emissiveIntensity={0.2} />
          </mesh>
        </group>
      )}

      {/* North Arrow on Ground */}
      <group position={[(pw / 2) + 3, 0.05, -pl / 2]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.0, 1.15, 32]} />
          <meshStandardMaterial color="#475569" />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <coneGeometry args={[0.5, 1.2, 3]} />
          <meshStandardMaterial color="#D35400" />
        </mesh>
      </group>

      {/* Dimensions Callouts along edge */}
      {showDimensions && (
        <group position={[0, 0.1, 0]}>
          {/* Width Dimension bar along South */}
          <mesh position={[0, 0.02, (pl / 2) + 0.8]}>
            <boxGeometry args={[pw, 0.03, 0.03]} />
            <meshStandardMaterial color="#475569" />
          </mesh>
          {/* Depth Dimension bar along West */}
          <mesh position={[-(pw / 2) - 0.8, 0.02, 0]}>
            <boxGeometry args={[0.03, 0.03, pl]} />
            <meshStandardMaterial color="#475569" />
          </mesh>
        </group>
      )}

      {/* Architectural Ground Grid Lines */}
      {showGrid && (
        <gridHelper
          args={[gridSize, Math.round(gridSize / 2), "#9CA3AF", "#D1D5DB"]}
          position={[0, 0.01, 0]}
        />
      )}
    </group>
  );
}
