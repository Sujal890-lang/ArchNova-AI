import React from 'react';

export function Landscaping({ plotBoundary, setbacksRect, parkingCount = 2 }) {
  const pw = plotBoundary?.width || 20;
  const pl = plotBoundary?.length || 30;

  // Tree locations around perimeter setbacks
  const trees = [
    { x: -(pw / 2) + 2.5, z: (pl / 2) - 2.5, scale: 1.1, leavesColor: "#3F6212" },
    { x: (pw / 2) - 2.5, z: (pl / 2) - 2.5, scale: 0.9, leavesColor: "#4D7C0F" },
    { x: -(pw / 2) + 2.0, z: -(pl / 2) + 2.5, scale: 1.2, leavesColor: "#365314" },
    { x: (pw / 2) - 2.0, z: -(pl / 2) + 2.5, scale: 1.0, leavesColor: "#3F6212" },
    { x: -(pw / 2) + 1.5, z: 0, scale: 0.85, leavesColor: "#4D7C0F" }
  ];

  return (
    <group>
      {/* Trees */}
      {trees.map((t, idx) => (
        <group key={`tree-${idx}`} position={[t.x, 0, t.z]} scale={t.scale}>
          {/* Trunk */}
          <mesh position={[0, 1.2, 0]} castShadow>
            <cylinderGeometry args={[0.15, 0.22, 2.4, 8]} />
            <meshStandardMaterial color="#5C3D2E" roughness={0.9} />
          </mesh>
          {/* Canopy / Foliage Layer 1 */}
          <mesh position={[0, 2.5, 0]} castShadow>
            <coneGeometry args={[1.5, 2.2, 7]} />
            <meshStandardMaterial color={t.leavesColor} roughness={0.7} />
          </mesh>
          {/* Canopy Layer 2 */}
          <mesh position={[0, 3.6, 0]} castShadow>
            <coneGeometry args={[1.1, 1.8, 7]} />
            <meshStandardMaterial color={t.leavesColor} roughness={0.7} />
          </mesh>
        </group>
      ))}

      {/* Parking Stall & Minimalist Car */}
      {Array.from({ length: Math.min(3, parkingCount) }).map((_, pIdx) => {
        const stallX = -(pw / 2) + 4.5 + (pIdx * 3.2);
        const stallZ = (pl / 2) - 3.5;

        return (
          <group key={`parking-${pIdx}`} position={[stallX, 0.01, stallZ]}>
            {/* Pavement bay */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
              <planeGeometry args={[2.7, 5.2]} />
              <meshStandardMaterial color="#475569" roughness={0.6} />
            </mesh>
            {/* Parking line marking */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-1.3, 0.005, 0]}>
              <planeGeometry args={[0.1, 5.2]} />
              <meshStandardMaterial color="#F8FAFC" />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[1.3, 0.005, 0]}>
              <planeGeometry args={[0.1, 5.2]} />
              <meshStandardMaterial color="#F8FAFC" />
            </mesh>

            {/* Stylized Modern Car model */}
            {pIdx === 0 && (
              <group position={[0, 0.35, 0]} rotation={[0, Math.PI, 0]}>
                {/* Car lower chassis */}
                <mesh position={[0, 0.25, 0]} castShadow>
                  <boxGeometry args={[1.9, 0.5, 4.2]} />
                  <meshStandardMaterial color="#1E293B" metalness={0.7} roughness={0.3} />
                </mesh>
                {/* Car cabin glasshouse */}
                <mesh position={[0, 0.72, -0.2]} castShadow>
                  <boxGeometry args={[1.6, 0.55, 2.3]} />
                  <meshPhysicalMaterial color="#38BDF8" transparent opacity={0.65} roughness={0.1} />
                </mesh>
                {/* Wheels */}
                {[-0.95, 0.95].map((wx, wIdx) =>
                  [-1.3, 1.3].map((wz, zIdx) => (
                    <mesh key={`wheel-${wIdx}-${zIdx}`} position={[wx, 0.1, wz]} rotation={[0, 0, Math.PI / 2]}>
                      <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
                      <meshStandardMaterial color="#0F172A" roughness={0.8} />
                    </mesh>
                  ))
                )}
                {/* Headlights */}
                <mesh position={[0.6, 0.3, 2.11]}>
                  <boxGeometry args={[0.4, 0.1, 0.05]} />
                  <meshStandardMaterial color="#FEF08A" emissive="#FEF08A" emissiveIntensity={0.8} />
                </mesh>
                <mesh position={[-0.6, 0.3, 2.11]}>
                  <boxGeometry args={[0.4, 0.1, 0.05]} />
                  <meshStandardMaterial color="#FEF08A" emissive="#FEF08A" emissiveIntensity={0.8} />
                </mesh>
              </group>
            )}
          </group>
        );
      })}
    </group>
  );
}
