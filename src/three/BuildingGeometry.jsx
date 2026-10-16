import React, { useMemo } from 'react';
import * as THREE from 'three';

export function BuildingGeometry({ geometryData, explodedOffset = 0, styleOptions = {} }) {
  if (!geometryData) return null;

  const {
    building_width = 12,
    building_depth = 10,
    floor_height = 3.2,
    floor_count = 2,
    origin_x = 0,
    origin_z = 0,
    levels = [],
    roof_data = {},
    balcony_data = [],
    window_data = [],
    door_data = [],
    materials = {}
  } = geometryData;

  const wallColor = styleOptions.wallColor || materials.wall_color || '#F9F8F5';
  const slabColor = styleOptions.slabColor || materials.slab_color || '#E5E3DF';
  const glassColor = styleOptions.glassColor || materials.glass_color || '#82B1B8';
  const frameColor = materials.frame_color || '#1F2421';
  const roofColor = materials.roof_color || '#333A42';
  const accentColor = materials.accent_color || '#D35400';
  const woodColor = materials.wood_color || '#9C6644';

  return (
    <group position={[origin_x, 0, origin_z]}>
      {/* Levels and Floors */}
      {levels.map((level, idx) => {
        const floorY = level.y_base + (explodedOffset * (idx + 1) * 2.5);
        const slab = level.slab;
        const walls = level.walls;

        return (
          <group key={`level-${idx}`}>
            {/* Slab Plate */}
            <mesh position={[0, floorY + slab.thickness / 2, 0]} castShadow receiveShadow>
              <boxGeometry args={[slab.width, slab.thickness, slab.depth]} />
              <meshStandardMaterial color={slabColor} roughness={0.7} metalness={0.05} />
            </mesh>

            {/* Level Walls Block */}
            <mesh position={[0, floorY + slab.thickness + (walls.height / 2), 0]} castShadow receiveShadow>
              <boxGeometry args={[walls.width, walls.height, walls.depth]} />
              <meshStandardMaterial color={wallColor} roughness={0.8} />
            </mesh>

            {/* Floor Level Label Indicator if exploded */}
            {explodedOffset > 0.2 && (
              <group position={[-(walls.width / 2) - 1.5, floorY + 1.2, 0]}>
                <mesh>
                  <sphereGeometry args={[0.2, 16, 16]} />
                  <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={0.5} />
                </mesh>
              </group>
            )}
          </group>
        );
      })}

      {/* Windows */}
      {window_data.map((win, idx) => {
        const winY = win.y + (explodedOffset * (win.floor + 1) * 2.5);
        const isRibbon = win.style === 'ribbon';

        return (
          <group key={`win-${idx}`} position={[win.x - origin_x, winY + (win.height / 2), win.z - origin_z]}>
            {/* Window Glass Pane */}
            <mesh castShadow>
              <boxGeometry args={[win.width, win.height, 0.08]} />
              <meshPhysicalMaterial
                color={glassColor}
                transparent={true}
                opacity={0.65}
                roughness={0.1}
                transmission={0.6}
                ior={1.5}
                reflectivity={0.9}
              />
            </mesh>
            {/* Window Outer Mullion Frame */}
            <mesh>
              <boxGeometry args={[win.width + 0.1, win.height + 0.1, 0.04]} />
              <meshStandardMaterial color={frameColor} roughness={0.5} />
            </mesh>
            {/* Mullion divider bars */}
            <mesh>
              <boxGeometry args={[0.04, win.height, 0.09]} />
              <meshStandardMaterial color={frameColor} roughness={0.4} />
            </mesh>
          </group>
        );
      })}

      {/* Doors */}
      {door_data.map((door, idx) => {
        const doorY = door.y + (explodedOffset * (door.floor + 1) * 2.5);
        return (
          <group key={`door-${idx}`} position={[door.x - origin_x, doorY + (door.height / 2), door.z - origin_z]}>
            <mesh castShadow>
              <boxGeometry args={[door.width, door.height, 0.1]} />
              <meshStandardMaterial
                color={door.type === 'main_entrance' ? woodColor : glassColor}
                roughness={door.type === 'main_entrance' ? 0.6 : 0.2}
                transparent={door.type !== 'main_entrance'}
                opacity={door.type === 'main_entrance' ? 1.0 : 0.75}
              />
            </mesh>
            {/* Door Frame */}
            <mesh>
              <boxGeometry args={[door.width + 0.12, door.height + 0.1, 0.06]} />
              <meshStandardMaterial color={frameColor} />
            </mesh>
            {/* Entrance Canopy for Ground Floor */}
            {door.floor === 0 && (
              <mesh position={[0, (door.height / 2) + 0.15, 0.6]} castShadow>
                <boxGeometry args={[door.width + 1.2, 0.12, 1.4]} />
                <meshStandardMaterial color={accentColor} roughness={0.4} />
              </mesh>
            )}
          </group>
        );
      })}

      {/* Balconies */}
      {balcony_data.map((balc, idx) => {
        const balcY = balc.y + (explodedOffset * (balc.floor + 1) * 2.5);
        return (
          <group key={`balc-${idx}`} position={[balc.x - origin_x, balcY, balc.z - origin_z]}>
            {/* Balcony Cantilever Slab */}
            <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
              <boxGeometry args={[balc.width, 0.24, balc.depth]} />
              <meshStandardMaterial color={slabColor} roughness={0.7} />
            </mesh>
            {/* Balcony Glass/Metal Railing Front */}
            <mesh position={[0, 0.24 + (balc.railing_height / 2), balc.depth / 2]} castShadow>
              <boxGeometry args={[balc.width, balc.railing_height, 0.05]} />
              <meshPhysicalMaterial
                color={glassColor}
                transparent={true}
                opacity={0.5}
                roughness={0.1}
                transmission={0.7}
              />
            </mesh>
            {/* Left Railing */}
            <mesh position={[-balc.width / 2, 0.24 + (balc.railing_height / 2), 0]}>
              <boxGeometry args={[0.05, balc.railing_height, balc.depth]} />
              <meshPhysicalMaterial color={glassColor} transparent opacity={0.5} />
            </mesh>
            {/* Right Railing */}
            <mesh position={[balc.width / 2, 0.24 + (balc.railing_height / 2), 0]}>
              <boxGeometry args={[0.05, balc.railing_height, balc.depth]} />
              <meshPhysicalMaterial color={glassColor} transparent opacity={0.5} />
            </mesh>
            {/* Handrail Trim */}
            <mesh position={[0, 0.24 + balc.railing_height, balc.depth / 2]}>
              <boxGeometry args={[balc.width + 0.05, 0.06, 0.08]} />
              <meshStandardMaterial color={frameColor} roughness={0.3} metalness={0.8} />
            </mesh>
          </group>
        );
      })}

      {/* Roof Structure */}
      <RoofMesh
        roofData={roof_data}
        explodedOffset={explodedOffset}
        floorCount={floor_count}
        roofColor={roofColor}
        wallColor={wallColor}
        accentColor={accentColor}
      />
    </group>
  );
}

function RoofMesh({ roofData, explodedOffset, floorCount, roofColor, wallColor, accentColor }) {
  if (!roofData) return null;

  const {
    type = 'flat',
    width = 12.6,
    depth = 10.6,
    y_base = 6.4,
    parapet_height = 0.9,
    pitch_height = 1.8,
    pergola = false
  } = roofData;

  const roofY = y_base + (explodedOffset * (floorCount + 1) * 2.5);

  if (type === 'sloped') {
    // Single-pitch shed roof
    return (
      <group position={[0, roofY, 0]}>
        {/* Sloped Plane */}
        <mesh position={[0, pitch_height / 2, 0]} rotation={[0.18, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[width + 0.8, 0.25, depth + 1.0]} />
          <meshStandardMaterial color={roofColor} roughness={0.6} />
        </mesh>
        {/* Triangular sidewalls */}
        <mesh position={[-width / 2, (pitch_height / 2) - 0.2, 0]}>
          <boxGeometry args={[0.2, pitch_height, depth]} />
          <meshStandardMaterial color={wallColor} roughness={0.8} />
        </mesh>
        <mesh position={[width / 2, (pitch_height / 2) - 0.2, 0]}>
          <boxGeometry args={[0.2, pitch_height, depth]} />
          <meshStandardMaterial color={wallColor} roughness={0.8} />
        </mesh>
      </group>
    );
  }

  if (type === 'gabled') {
    // Double-pitch gable roof
    return (
      <group position={[0, roofY, 0]}>
        {/* Left pitch slope */}
        <mesh position={[-width / 4, pitch_height / 2, 0]} rotation={[0, 0, 0.45]} castShadow>
          <boxGeometry args={[(width / 2) * 1.25, 0.22, depth + 0.8]} />
          <meshStandardMaterial color={roofColor} roughness={0.6} />
        </mesh>
        {/* Right pitch slope */}
        <mesh position={[width / 4, pitch_height / 2, 0]} rotation={[0, 0, -0.45]} castShadow>
          <boxGeometry args={[(width / 2) * 1.25, 0.22, depth + 0.8]} />
          <meshStandardMaterial color={roofColor} roughness={0.6} />
        </mesh>
        {/* Ridge cap */}
        <mesh position={[0, pitch_height + 0.05, 0]}>
          <boxGeometry args={[0.3, 0.15, depth + 0.9]} />
          <meshStandardMaterial color={accentColor} metalness={0.7} />
        </mesh>
      </group>
    );
  }

  // Flat / Rooftop Terrace
  return (
    <group position={[0, roofY, 0]}>
      {/* Roof Ceiling Slab */}
      <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, 0.24, depth]} />
        <meshStandardMaterial color={roofColor} roughness={0.7} />
      </mesh>
      {/* Parapet Walls surrounding roof terrace */}
      {parapet_height > 0 && (
        <>
          {/* Front parapet */}
          <mesh position={[0, 0.24 + (parapet_height / 2), depth / 2 - 0.1]} castShadow>
            <boxGeometry args={[width, parapet_height, 0.2]} />
            <meshStandardMaterial color={wallColor} roughness={0.8} />
          </mesh>
          {/* Rear parapet */}
          <mesh position={[0, 0.24 + (parapet_height / 2), -depth / 2 + 0.1]} castShadow>
            <boxGeometry args={[width, parapet_height, 0.2]} />
            <meshStandardMaterial color={wallColor} roughness={0.8} />
          </mesh>
          {/* Left parapet */}
          <mesh position={[-width / 2 + 0.1, 0.24 + (parapet_height / 2), 0]} castShadow>
            <boxGeometry args={[0.2, parapet_height, depth - 0.4]} />
            <meshStandardMaterial color={wallColor} roughness={0.8} />
          </mesh>
          {/* Right parapet */}
          <mesh position={[width / 2 - 0.1, 0.24 + (parapet_height / 2), 0]} castShadow>
            <boxGeometry args={[0.2, parapet_height, depth - 0.4]} />
            <meshStandardMaterial color={wallColor} roughness={0.8} />
          </mesh>
        </>
      )}
      {/* Rooftop Pergola Feature if terrace */}
      {pergola && (
        <group position={[0, 0.25, 0]}>
          {[-2, 0, 2].map((xOffset) => (
            <mesh key={`pergola-${xOffset}`} position={[xOffset, 2.2, 0]} castShadow>
              <boxGeometry args={[0.15, 0.15, depth * 0.7]} />
              <meshStandardMaterial color={accentColor} roughness={0.5} />
            </mesh>
          ))}
          {/* Pergola vertical posts */}
          {[-2.5, 2.5].map((xP) =>
            [-depth * 0.3, depth * 0.3].map((zP, pIdx) => (
              <mesh key={`post-${xP}-${pIdx}`} position={[xP, 1.1, zP]}>
                <boxGeometry args={[0.15, 2.2, 0.15]} />
                <meshStandardMaterial color="#2C3E50" roughness={0.4} />
              </mesh>
            ))
          )}
        </group>
      )}
    </group>
  );
}
