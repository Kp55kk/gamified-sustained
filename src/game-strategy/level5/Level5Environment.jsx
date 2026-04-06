// ═══════════════════════════════════════════════════════════
//  LEVEL 5 — 3D Environment (Fully Green + Zones)
//  Rooftop: Solar panels    Side: Battery unit    Front: EV charger
// ═══════════════════════════════════════════════════════════
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SCHEDULE_SLOTS } from './level5Data';

// ═══ SKY ═══
function Sky({ timeOfDay }) {
  const ref = useRef();
  const colors = { dawn:'#ff9966', morning:'#87CEEB', noon:'#4a9eda', afternoon:'#6bb3d9', evening:'#cc6633', night:'#0a1628' };
  useFrame(() => {
    if (!ref.current) return;
    const target = new THREE.Color(colors[timeOfDay] || '#4a9eda');
    ref.current.material.color.lerp(target, 0.03);
  });
  return (<mesh ref={ref}><sphereGeometry args={[80, 24, 24]} /><meshBasicMaterial color="#4a9eda" side={THREE.BackSide} /></mesh>);
}

// ═══ SUN ═══
function SunOrb({ timeOfDay }) {
  const ref = useRef();
  useFrame(() => {
    if (!ref.current) return;
    const slot = SCHEDULE_SLOTS.find(s => s.id === timeOfDay) || SCHEDULE_SLOTS[2];
    const angle = ((slot.hour - 6) / 12) * Math.PI;
    const x = Math.cos(angle) * 45, y = Math.sin(angle) * 45 + 8;
    ref.current.position.lerp(new THREE.Vector3(x, Math.max(y, -10), -30), 0.03);
    ref.current.material.opacity = slot.sunlight > 0.05 ? 0.9 : 0;
  });
  return (<mesh ref={ref} position={[10, 30, -30]}><sphereGeometry args={[4, 16, 16]} /><meshBasicMaterial color="#ffee55" transparent opacity={0.9} /></mesh>);
}

// ═══ LIGHTING ═══
function Lighting({ timeOfDay }) {
  const dirRef = useRef(), ambRef = useRef();
  useFrame(() => {
    if (!dirRef.current || !ambRef.current) return;
    const slot = SCHEDULE_SLOTS.find(s => s.id === timeOfDay) || SCHEDULE_SLOTS[2];
    const angle = ((slot.hour - 6) / 12) * Math.PI;
    dirRef.current.position.lerp(new THREE.Vector3(Math.cos(angle) * 25, Math.max(Math.sin(angle) * 25 + 3, 1), -8), 0.03);
    dirRef.current.intensity += (slot.sunlight * 3.0 - dirRef.current.intensity) * 0.04;
    ambRef.current.intensity += (0.5 + slot.sunlight * 0.5 - ambRef.current.intensity) * 0.04;
  });
  return (<>
    <directionalLight ref={dirRef} position={[15, 20, -8]} intensity={2.5} color="#ffeedd" />
    <ambientLight ref={ambRef} intensity={0.8} color="#ffeedd" />
    <hemisphereLight intensity={0.7} color="#87ceeb" groundColor="#3a7a3a" />
  </>);
}

// ═══ GROUND (lush green) ═══
function Ground() {
  return (<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
    <planeGeometry args={[120, 120]} /><meshStandardMaterial color="#3a7a3a" /></mesh>);
}

// ═══ TREES (green, healthy) ═══
function Trees() {
  const treeData = useMemo(() => {
    const positions = [
      [-14, 0, -6], [-14, 0, 0], [-14, 0, 6],
      [14, 0, -6], [14, 0, 0], [14, 0, 6],
      [-8, 0, -12], [-3, 0, -14], [3, 0, -14], [8, 0, -12],
      [-6, 0, 12], [0, 0, 14], [6, 0, 12],
      [-22, 0, -10], [-20, 0, 5], [22, 0, -10], [20, 0, 5],
      [0, 0, 22], [-10, 0, 20], [10, 0, 20],
    ];
    return positions.map((p, i) => ({ pos: p, id: i, scale: 0.7 + Math.random() * 0.6 }));
  }, []);
  return treeData.map(t => (
    <group key={t.id} position={t.pos}>
      <mesh position={[0, t.scale, 0]}><cylinderGeometry args={[0.18, 0.25, t.scale * 2, 6]} /><meshStandardMaterial color="#5a3a1a" /></mesh>
      <mesh position={[0, t.scale * 2 + 0.5, 0]}><sphereGeometry args={[t.scale * 1.2, 8, 6]} /><meshStandardMaterial color="#1abf2a" /></mesh>
      <mesh position={[0, t.scale * 2 + 1.2, 0]}><sphereGeometry args={[t.scale * 0.8, 8, 6]} /><meshStandardMaterial color="#15a520" /></mesh>
    </group>
  ));
}

// ═══ WALKPATH ═══
function WalkPath() {
  return (<group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-5, -0.03, -10]}><planeGeometry args={[3, 6]} /><meshStandardMaterial color="#8a7a6a" /></mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-12, -0.03, 0]}><planeGeometry args={[2, 18]} /><meshStandardMaterial color="#7a6a5a" /></mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[12, -0.03, 0]}><planeGeometry args={[2, 18]} /><meshStandardMaterial color="#7a6a5a" /></mesh>
    {/* Path to utility zone */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[14, -0.03, -6]}><planeGeometry args={[6, 2]} /><meshStandardMaterial color="#7a6a5a" /></mesh>
  </group>);
}

// ═══ SOLAR PANELS ON ROOF (pre-installed) ═══
function RoofPanels() {
  const slots = [[-2, -1.5], [0, -1.5], [2, -1.5], [-2, 0.5], [0, 0.5], [2, 0.5]];
  const tiltRad = (25 * Math.PI) / 180;
  return slots.map((s, i) => (
    <group key={i} position={[s[0], 5.5, s[1] + 1]}>
      <mesh rotation={[-tiltRad, 0, 0]} position={[0, 0.05, 0]}><boxGeometry args={[1.5, 0.08, 1.0]} /><meshStandardMaterial color="#1a2a5a" metalness={0.8} roughness={0.2} /></mesh>
      <mesh rotation={[-tiltRad, 0, 0]} position={[0, 0.1, 0]}><boxGeometry args={[1.4, 0.02, 0.9]} /><meshStandardMaterial color="#2244aa" metalness={0.9} roughness={0.1} emissive="#112255" emissiveIntensity={0.15} /></mesh>
    </group>
  ));
}

// ═══ BATTERY UNIT (side wall) ═══
function BatteryUnit({ batteryPct }) {
  const glowRef = useRef();
  useFrame(() => {
    if (glowRef.current) {
      const g = batteryPct / 100;
      glowRef.current.material.emissiveIntensity = 0.1 + g * 0.4;
    }
  });
  return (
    <group position={[11.5, 1.2, 2]}>
      {/* Battery box */}
      <mesh><boxGeometry args={[1.0, 2.0, 0.8]} /><meshStandardMaterial color="#2a3a4a" metalness={0.6} roughness={0.3} /></mesh>
      {/* Status light */}
      <mesh ref={glowRef} position={[0, 0.6, 0.42]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.3} />
      </mesh>
      {/* Battery label */}
      <mesh position={[0, -0.6, 0.42]}>
        <boxGeometry args={[0.6, 0.15, 0.01]} /><meshStandardMaterial color="#1a1a2e" />
      </mesh>
      {/* Fill indicator */}
      <mesh position={[0, -0.2 + (batteryPct / 100) * 0.6, 0.42]}>
        <boxGeometry args={[0.7, (batteryPct / 100) * 1.2, 0.02]} />
        <meshStandardMaterial color={batteryPct > 50 ? '#22c55e' : batteryPct > 20 ? '#f5a623' : '#ef4444'} transparent opacity={0.7} />
      </mesh>
    </group>
  );
}

// ═══ EV CHARGING STATION (front yard) ═══
function EVStation({ isCharging }) {
  const lightRef = useRef();
  useFrame(() => {
    if (lightRef.current) {
      lightRef.current.material.emissiveIntensity = isCharging ? (0.3 + Math.sin(performance.now() * 0.005) * 0.2) : 0.05;
    }
  });
  return (
    <group position={[16, 0, -8]}>
      {/* Charging pole */}
      <mesh position={[0, 1.5, 0]}><cylinderGeometry args={[0.12, 0.15, 3, 8]} /><meshStandardMaterial color="#555" metalness={0.7} /></mesh>
      {/* Charger box */}
      <mesh position={[0, 2.5, 0.15]}><boxGeometry args={[0.6, 0.8, 0.3]} /><meshStandardMaterial color="#1a2a4a" metalness={0.5} /></mesh>
      {/* Status light */}
      <mesh ref={lightRef} position={[0, 2.9, 0.32]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color={isCharging ? '#22c55e' : '#666'} emissive={isCharging ? '#22c55e' : '#333'} emissiveIntensity={0.1} />
      </mesh>
      {/* Cable */}
      <mesh position={[0.3, 1.8, 0.3]} rotation={[0, 0, -0.5]}>
        <cylinderGeometry args={[0.03, 0.03, 1.5, 6]} /><meshStandardMaterial color="#222" />
      </mesh>
      {/* EV car shape */}
      <mesh position={[1.5, 0.5, 0]}><boxGeometry args={[2.5, 0.8, 1.2]} /><meshStandardMaterial color="#3b82f6" metalness={0.6} roughness={0.3} /></mesh>
      <mesh position={[1.5, 1.0, 0]}><boxGeometry args={[1.8, 0.5, 1.1]} /><meshStandardMaterial color="#60a5fa" metalness={0.5} roughness={0.3} /></mesh>
      {/* Wheels */}
      <mesh position={[0.6, 0.15, 0.65]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.2, 0.2, 0.1, 12]} /><meshStandardMaterial color="#222" /></mesh>
      <mesh position={[2.4, 0.15, 0.65]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.2, 0.2, 0.1, 12]} /><meshStandardMaterial color="#222" /></mesh>
      {/* Ground pad */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[1, -0.02, 0]}><planeGeometry args={[4, 3]} /><meshStandardMaterial color="#555" /></mesh>
    </group>
  );
}

// ═══ ZONE MARKERS ═══
function ZoneMarkers() {
  return (<group>
    {/* Indoor zone */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}><ringGeometry args={[11, 11.2, 32]} /><meshBasicMaterial color="#3b82f6" transparent opacity={0.15} /></mesh>
    {/* Utility zone marker */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[15, 0.02, -3]}><ringGeometry args={[5, 5.2, 32]} /><meshBasicMaterial color="#f5a623" transparent opacity={0.15} /></mesh>
  </group>);
}

// ═══ NEIGHBOR HOUSES ═══
function Neighbors() {
  const houses = [
    { pos: [-22, 0, -15], rot: 0.3 }, { pos: [22, 0, -15], rot: -0.3 },
    { pos: [-25, 0, 10], rot: 0.5 }, { pos: [25, 0, 10], rot: -0.5 },
  ];
  return houses.map((h, i) => (
    <group key={i} position={h.pos} rotation={[0, h.rot, 0]}>
      <mesh position={[0, 1.5, 0]}><boxGeometry args={[4, 3, 5]} /><meshStandardMaterial color="#b08060" /></mesh>
      <mesh position={[0, 3.3, 0]}><coneGeometry args={[3.5, 1.5, 4]} /><meshStandardMaterial color="#8B4513" /></mesh>
    </group>
  ));
}

// ═══ GARDEN (bushes + flowers) ═══
function Garden() {
  const bushes = [[-12, 0, -4], [-12, 0, 4], [12, 0, -4], [12, 0, 4], [-6, 0, -10], [6, 0, -10]];
  return bushes.map((p, i) => (
    <mesh key={i} position={[p[0], 0.5, p[2]]}><sphereGeometry args={[0.7, 8, 6]} /><meshStandardMaterial color="#1a8a2a" /></mesh>
  ));
}

// ═══ MAIN ENVIRONMENT ═══
export default function Level5Environment({ timeOfDay = 'noon', batteryPct = 50, isEVCharging = false }) {
  return (<>
    <Sky timeOfDay={timeOfDay} />
    <Lighting timeOfDay={timeOfDay} />
    <SunOrb timeOfDay={timeOfDay} />
    <Ground />
    <WalkPath />
    <Trees />
    <Garden />
    <Neighbors />
    <RoofPanels />
    <BatteryUnit batteryPct={batteryPct} />
    <EVStation isCharging={isEVCharging} />
    <ZoneMarkers />
  </>);
}
