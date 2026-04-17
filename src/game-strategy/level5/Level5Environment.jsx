// ═══════════════════════════════════════════════════════════
//  LEVEL 5 — 3D Environment (Evolving: Normal → Smart → Green)
//  Rooftop: Solar panels    Side: Battery unit
//  Store appliances appear ONLY after purchase + placement
//  Task-responsive visuals: weather overlay, standby glow, etc.
// ═══════════════════════════════════════════════════════════
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { SCHEDULE_SLOTS, STORE_APPLIANCE_MAP } from './level5Data';

// ═══ SKY (weather-responsive) ═══
function Sky({ timeOfDay, weatherFactor }) {
  const ref = useRef();
  const colors = { dawn:'#ff9966', morning:'#87CEEB', noon:'#4a9eda', afternoon:'#6bb3d9', evening:'#cc6633', night:'#0a1628' };
  useFrame(() => {
    if (!ref.current) return;
    let target = new THREE.Color(colors[timeOfDay] || '#4a9eda');
    // Darken sky when cloudy
    if (weatherFactor < 0.7) {
      const gray = new THREE.Color('#5a5a6a');
      target.lerp(gray, 1 - weatherFactor);
    }
    ref.current.material.color.lerp(target, 0.03);
  });
  return (<mesh ref={ref}><sphereGeometry args={[80, 24, 24]} /><meshBasicMaterial color="#4a9eda" side={THREE.BackSide} /></mesh>);
}

// ═══ SUN (dims when cloudy) ═══
function SunOrb({ timeOfDay, weatherFactor }) {
  const ref = useRef();
  useFrame(() => {
    if (!ref.current) return;
    const slot = SCHEDULE_SLOTS.find(s => s.id === timeOfDay) || SCHEDULE_SLOTS[2];
    const angle = ((slot.hour - 6) / 12) * Math.PI;
    const x = Math.cos(angle) * 45, y = Math.sin(angle) * 45 + 8;
    ref.current.position.lerp(new THREE.Vector3(x, Math.max(y, -10), -30), 0.03);
    ref.current.material.opacity = slot.sunlight > 0.05 ? (0.9 * (weatherFactor || 1.0)) : 0;
  });
  return (<mesh ref={ref} position={[10, 30, -30]}><sphereGeometry args={[4, 16, 16]} /><meshBasicMaterial color="#ffee55" transparent opacity={0.9} /></mesh>);
}

// ═══ CLOUDS (visible when weather factor < 1) ═══
function CloudLayer({ weatherFactor }) {
  const groupRef = useRef();
  const clouds = useMemo(() => [
    { pos: [-15, 28, -10], scale: [8, 1.5, 4] },
    { pos: [10, 30, -20], scale: [10, 1.2, 5] },
    { pos: [-5, 26, -5], scale: [12, 1.8, 6] },
    { pos: [20, 29, -15], scale: [7, 1.0, 3.5] },
    { pos: [-20, 27, -25], scale: [9, 1.4, 4.5] },
    { pos: [5, 31, 5], scale: [6, 1.0, 3] },
  ], []);

  useFrame(() => {
    if (!groupRef.current) return;
    const targetOpacity = weatherFactor < 0.7 ? (1 - weatherFactor) * 0.8 : 0;
    groupRef.current.children.forEach(c => {
      if (c.material) {
        c.material.opacity += (targetOpacity - c.material.opacity) * 0.05;
      }
    });
  });

  return (
    <group ref={groupRef}>
      {clouds.map((c, i) => (
        <mesh key={i} position={c.pos}>
          <boxGeometry args={c.scale} />
          <meshBasicMaterial color="#8a8a9a" transparent opacity={0} />
        </mesh>
      ))}
    </group>
  );
}

// ═══ LIGHTING (responds to weather) ═══
function Lighting({ timeOfDay, weatherFactor }) {
  const dirRef = useRef(), ambRef = useRef();
  useFrame(() => {
    if (!dirRef.current || !ambRef.current) return;
    const slot = SCHEDULE_SLOTS.find(s => s.id === timeOfDay) || SCHEDULE_SLOTS[2];
    const angle = ((slot.hour - 6) / 12) * Math.PI;
    dirRef.current.position.lerp(new THREE.Vector3(Math.cos(angle) * 25, Math.max(Math.sin(angle) * 25 + 3, 1), -8), 0.03);
    const wf = weatherFactor || 1.0;
    dirRef.current.intensity += (slot.sunlight * 3.0 * wf - dirRef.current.intensity) * 0.04;
    ambRef.current.intensity += (0.5 + slot.sunlight * 0.5 * wf - ambRef.current.intensity) * 0.04;
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

// ═══ TREES ═══
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

// ═══ SOLAR PANELS ON ROOF ═══
function RoofPanels({ weatherFactor }) {
  const panelRefs = useRef([]);
  const slots = [[-2, -1.5], [0, -1.5], [2, -1.5], [-2, 0.5], [0, 0.5], [2, 0.5]];
  const tiltRad = (25 * Math.PI) / 180;

  useFrame(() => {
    panelRefs.current.forEach(ref => {
      if (ref) {
        const wf = weatherFactor || 1.0;
        ref.material.emissiveIntensity += (0.15 * wf - ref.material.emissiveIntensity) * 0.05;
      }
    });
  });

  return slots.map((s, i) => (
    <group key={i} position={[s[0], 5.5, s[1] + 1]}>
      <mesh rotation={[-tiltRad, 0, 0]} position={[0, 0.05, 0]}><boxGeometry args={[1.5, 0.08, 1.0]} /><meshStandardMaterial color="#1a2a5a" metalness={0.8} roughness={0.2} /></mesh>
      <mesh ref={el => panelRefs.current[i] = el} rotation={[-tiltRad, 0, 0]} position={[0, 0.1, 0]}><boxGeometry args={[1.4, 0.02, 0.9]} /><meshStandardMaterial color="#2244aa" metalness={0.9} roughness={0.1} emissive="#112255" emissiveIntensity={0.15} /></mesh>
    </group>
  ));
}

// ═══ BATTERY UNIT ═══
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
      <mesh><boxGeometry args={[1.0, 2.0, 0.8]} /><meshStandardMaterial color="#2a3a4a" metalness={0.6} roughness={0.3} /></mesh>
      <mesh ref={glowRef} position={[0, 0.6, 0.42]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0, -0.6, 0.42]}>
        <boxGeometry args={[0.6, 0.15, 0.01]} /><meshStandardMaterial color="#1a1a2e" />
      </mesh>
      <mesh position={[0, -0.2 + (batteryPct / 100) * 0.6, 0.42]}>
        <boxGeometry args={[0.7, (batteryPct / 100) * 1.2, 0.02]} />
        <meshStandardMaterial color={batteryPct > 50 ? '#22c55e' : batteryPct > 20 ? '#f5a623' : '#ef4444'} transparent opacity={0.7} />
      </mesh>
    </group>
  );
}

// ═══ EV CHARGING STATION (only shown after purchase) ═══
function EVStation({ isCharging }) {
  const lightRef = useRef();
  useFrame(() => {
    if (lightRef.current) {
      lightRef.current.material.emissiveIntensity = isCharging ? (0.3 + Math.sin(performance.now() * 0.005) * 0.2) : 0.05;
    }
  });
  return (
    <group position={[0, 0, 12]}>
      {/* Charging post */}
      <mesh position={[0, 1.5, 0]}><cylinderGeometry args={[0.12, 0.15, 3, 8]} /><meshStandardMaterial color="#555" metalness={0.7} /></mesh>
      <mesh position={[0, 2.5, -0.15]}><boxGeometry args={[0.6, 0.8, 0.3]} /><meshStandardMaterial color="#1a2a4a" metalness={0.5} /></mesh>
      <mesh ref={lightRef} position={[0, 2.9, -0.32]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color={isCharging ? '#22c55e' : '#666'} emissive={isCharging ? '#22c55e' : '#333'} emissiveIntensity={0.1} />
      </mesh>
      {/* Cable */}
      <mesh position={[0.3, 1.8, -0.3]} rotation={[0, 0, -0.5]}>
        <cylinderGeometry args={[0.03, 0.03, 1.5, 6]} /><meshStandardMaterial color="#222" />
      </mesh>
      {/* Car parking pad */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 2]}><planeGeometry args={[4, 3]} /><meshStandardMaterial color="#555" /></mesh>
    </group>
  );
}

// ═══ STORE APPLIANCES 3D MODELS (appear only after placement) ═══
function AirCoolerModel() {
  const ref = useRef();
  useFrame(() => { if (ref.current) ref.current.rotation.y += 0.002; });
  return (
    <group position={[-3, 0, -4]}>
      {/* Cooler body */}
      <mesh position={[0, 0.6, 0]}><boxGeometry args={[0.7, 1.1, 0.5]} /><meshStandardMaterial color="#e8e8e8" metalness={0.3} roughness={0.5} /></mesh>
      {/* Fan grille */}
      <mesh ref={ref} position={[0, 0.7, 0.26]}><cylinderGeometry args={[0.25, 0.25, 0.02, 16]} /><meshStandardMaterial color="#4488cc" metalness={0.6} /></mesh>
      {/* Indicator */}
      <mesh position={[0, 1.05, 0.26]}><sphereGeometry args={[0.04, 8, 8]} /><meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.3} /></mesh>
    </group>
  );
}

function SmartPowerStripModel() {
  return (
    <group position={[-8, 0.3, -3.5]}>
      {/* Strip body */}
      <mesh><boxGeometry args={[0.8, 0.08, 0.15]} /><meshStandardMaterial color="#f0f0f0" /></mesh>
      {/* Outlets */}
      {[-0.25, 0, 0.25].map((x, i) => (
        <mesh key={i} position={[x, 0.045, 0]}><boxGeometry args={[0.12, 0.02, 0.08]} /><meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.2} /></mesh>
      ))}
      {/* LED indicator */}
      <mesh position={[0.35, 0.045, 0]}><sphereGeometry args={[0.02, 8, 8]} /><meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.5} /></mesh>
    </group>
  );
}

function LEDSmartModel() {
  const ref = useRef();
  useFrame(() => {
    if (ref.current) ref.current.material.emissiveIntensity = 0.2 + Math.sin(performance.now() * 0.002) * 0.1;
  });
  return (
    <group position={[3, 2.8, -5]}>
      {/* Smart bulb */}
      <mesh><sphereGeometry args={[0.15, 12, 12]} /><meshStandardMaterial color="#ffffcc" /></mesh>
      <mesh ref={ref} position={[0, -0.05, 0]}><sphereGeometry args={[0.18, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color="#ffee88" emissive="#ffcc44" emissiveIntensity={0.3} transparent opacity={0.8} /></mesh>
      {/* Fixture */}
      <mesh position={[0, 0.2, 0]}><cylinderGeometry args={[0.06, 0.08, 0.12, 8]} /><meshStandardMaterial color="#888" metalness={0.8} /></mesh>
    </group>
  );
}

function SolarWaterHeaterModel() {
  const glowRef = useRef();
  useFrame(() => { if (glowRef.current) glowRef.current.material.emissiveIntensity = 0.1 + Math.sin(performance.now() * 0.003) * 0.08; });
  return (
    <group position={[9.0, 1.5, 3]}>
      {/* Tank */}
      <mesh rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.25, 0.25, 0.8, 12]} /><meshStandardMaterial color="#cc4444" metalness={0.4} roughness={0.5} /></mesh>
      {/* Collector panel */}
      <mesh ref={glowRef} position={[0, -0.4, 0.3]} rotation={[-0.5, 0, 0]}><boxGeometry args={[0.7, 0.5, 0.04]} /><meshStandardMaterial color="#1a2a5a" metalness={0.8} roughness={0.2} emissive="#112255" emissiveIntensity={0.1} /></mesh>
      {/* Pipes */}
      <mesh position={[-0.4, -0.2, 0.15]} rotation={[0, 0, 0.3]}><cylinderGeometry args={[0.02, 0.02, 0.5, 6]} /><meshStandardMaterial color="#888" metalness={0.7} /></mesh>
      <mesh position={[0.4, -0.2, 0.15]} rotation={[0, 0, -0.3]}><cylinderGeometry args={[0.02, 0.02, 0.5, 6]} /><meshStandardMaterial color="#888" metalness={0.7} /></mesh>
    </group>
  );
}

// ═══ FLOATING LABEL FOR STORE APPLIANCES ═══
const L5_LABEL_POSITIONS = {
  air_cooler:         { pos: [-3, 1.6, -4],    name: 'Air Cooler',          icon: '🌀' },
  smart_power_strip:  { pos: [-8, 0.9, -3.5],  name: 'Smart Power Strip',   icon: '🔌' },
  led_smart_system:   { pos: [3, 3.4, -5],     name: 'LED Smart Light',     icon: '💡' },
  solar_water_heater: { pos: [9.0, 2.2, 3],    name: 'Solar Water Heater',  icon: '☕' },
  ev_charger:         { pos: [0, 3.5, 12],     name: 'EV Charger',          icon: '⚡' },
};

function StoreApplianceLabel({ id, isNear }) {
  const info = L5_LABEL_POSITIONS[id];
  if (!info) return null;
  return (
    <Html position={info.pos} center>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', pointerEvents: 'none' }}>
        <div style={{ background: 'rgba(0,0,0,0.7)', color: '#fff', padding: '3px 10px', borderRadius: '8px', fontSize: '11px', fontFamily: 'Nunito, sans-serif', fontWeight: 600, whiteSpace: 'nowrap' }}>
          {info.icon} {info.name}
        </div>
        {isNear && (
          <div style={{ background: 'rgba(34,197,94,0.85)', color: '#fff', padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontFamily: 'Nunito, sans-serif', fontWeight: 600, whiteSpace: 'nowrap' }}>
            Press <span style={{ background: 'rgba(255,255,255,0.3)', padding: '1px 5px', borderRadius: '3px', fontWeight: 700 }}>E</span> to interact
          </div>
        )}
      </div>
    </Html>
  );
}

function Level5StoreAppliances({ homeAppliances, nearestAppliance }) {
  return (
    <>
      {homeAppliances.includes('air_cooler') && <><AirCoolerModel /><StoreApplianceLabel id="air_cooler" isNear={nearestAppliance === 'air_cooler'} /></>}
      {homeAppliances.includes('smart_power_strip') && <><SmartPowerStripModel /><StoreApplianceLabel id="smart_power_strip" isNear={nearestAppliance === 'smart_power_strip'} /></>}
      {homeAppliances.includes('led_smart_system') && <><LEDSmartModel /><StoreApplianceLabel id="led_smart_system" isNear={nearestAppliance === 'led_smart_system'} /></>}
      {homeAppliances.includes('solar_water_heater') && <><SolarWaterHeaterModel /><StoreApplianceLabel id="solar_water_heater" isNear={nearestAppliance === 'solar_water_heater'} /></>}
    </>
  );
}

// ═══ ZONE MARKERS ═══
function ZoneMarkers() {
  return (<group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}><ringGeometry args={[11, 11.2, 32]} /><meshBasicMaterial color="#3b82f6" transparent opacity={0.15} /></mesh>
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

// ═══ GARDEN ═══
function Garden() {
  const bushes = [[-12, 0, -4], [-12, 0, 4], [12, 0, -4], [12, 0, 4], [-6, 0, -10], [6, 0, -10]];
  return bushes.map((p, i) => (
    <mesh key={i} position={[p[0], 0.5, p[2]]}><sphereGeometry args={[0.7, 8, 6]} /><meshStandardMaterial color="#1a8a2a" /></mesh>
  ));
}

// ═══ MAIN ENVIRONMENT ═══
export default function Level5Environment({ timeOfDay = 'noon', batteryPct = 50, isEVCharging = false, weatherFactor = 1.0, homeAppliances = [], nearestAppliance = null }) {
  const showEV = homeAppliances.includes('ev_charger');
  return (<>
    <Sky timeOfDay={timeOfDay} weatherFactor={weatherFactor} />
    <Lighting timeOfDay={timeOfDay} weatherFactor={weatherFactor} />
    <SunOrb timeOfDay={timeOfDay} weatherFactor={weatherFactor} />
    <CloudLayer weatherFactor={weatherFactor} />
    <Ground />
    <WalkPath />
    <Trees />
    <Garden />
    <Neighbors />
    <RoofPanels weatherFactor={weatherFactor} />
    <BatteryUnit batteryPct={batteryPct} />
    {showEV && <><EVStation isCharging={isEVCharging} /><StoreApplianceLabel id="ev_charger" isNear={nearestAppliance === 'ev_charger'} /></>}
    <Level5StoreAppliances homeAppliances={homeAppliances} nearestAppliance={nearestAppliance} />
    <ZoneMarkers />
  </>);
}
