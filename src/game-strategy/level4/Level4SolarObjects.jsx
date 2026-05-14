// ═══════════════════════════════════════════════════════════
//  LEVEL 4: SOLAR-SPECIFIC 3D OBJECTS
//  Premium animated objects for solar education
// ═══════════════════════════════════════════════════════════
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { SOLAR_OBJECT_POSITIONS } from '../applianceData';

// ═══ SOLAR INVERTER BOX (left outer wall) ═══
function SolarInverter() {
  const p = SOLAR_OBJECT_POSITIONS.solar_inverter;
  const ledRef = useRef();
  useFrame(() => {
    if (ledRef.current) {
      const t = performance.now() * 0.003;
      ledRef.current.material.emissiveIntensity = 0.5 + Math.sin(t) * 0.4;
    }
  });
  return (
    <group position={p.pos} rotation={p.rot}>
      {/* Main box */}
      <mesh castShadow><boxGeometry args={[0.8, 1.0, 0.3]}/><meshStandardMaterial color="#7a7a7a" metalness={0.7} roughness={0.3}/></mesh>
      {/* Front panel */}
      <mesh position={[0, 0, 0.16]}><boxGeometry args={[0.72, 0.92, 0.02]}/><meshStandardMaterial color="#e0e0e0" metalness={0.4} roughness={0.4}/></mesh>
      {/* Ventilation grills */}
      {[-0.2, 0, 0.2].map((y, i) => (
        <mesh key={i} position={[0, y - 0.15, 0.18]}><boxGeometry args={[0.5, 0.03, 0.01]}/><meshStandardMaterial color="#555"/></mesh>
      ))}
      {/* Green power LED */}
      <mesh ref={ledRef} position={[0.25, 0.35, 0.18]}>
        <sphereGeometry args={[0.03, 8, 8]}/><meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.5}/>
      </mesh>
      {/* Label */}
      <mesh position={[0, 0.2, 0.18]}><boxGeometry args={[0.4, 0.08, 0.01]}/><meshStandardMaterial color="#1a5276" emissive="#1a5276" emissiveIntensity={0.2}/></mesh>
    </group>
  );
}

// ═══ NET METER / SMART METER (right outer wall) ═══
function SolarMeter() {
  const p = SOLAR_OBJECT_POSITIONS.solar_meter;
  const discRef = useRef();
  const lcdRef = useRef();
  useFrame(() => {
    if (discRef.current) discRef.current.rotation.z += 0.02;
    if (lcdRef.current) {
      const t = performance.now() * 0.002;
      lcdRef.current.material.emissiveIntensity = 0.4 + Math.sin(t) * 0.2;
    }
  });
  return (
    <group position={p.pos} rotation={p.rot}>
      {/* Meter housing */}
      <mesh castShadow><boxGeometry args={[0.6, 0.8, 0.2]}/><meshStandardMaterial color="#ddd" metalness={0.3} roughness={0.5}/></mesh>
      {/* LCD display */}
      <mesh ref={lcdRef} position={[0, 0.15, 0.11]}><boxGeometry args={[0.4, 0.15, 0.01]}/><meshStandardMaterial color="#0a4a0a" emissive="#22ff44" emissiveIntensity={0.4}/></mesh>
      {/* Spinning disc */}
      <mesh ref={discRef} position={[0, -0.1, 0.11]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.02, 16]}/><meshStandardMaterial color="#333" metalness={0.8}/>
      </mesh>
      {/* Arrows (bidirectional) */}
      <mesh position={[-0.15, -0.3, 0.11]}><boxGeometry args={[0.12, 0.04, 0.01]}/><meshStandardMaterial color="#e74c3c" emissive="#e74c3c" emissiveIntensity={0.3}/></mesh>
      <mesh position={[0.15, -0.3, 0.11]}><boxGeometry args={[0.12, 0.04, 0.01]}/><meshStandardMaterial color="#27ae60" emissive="#27ae60" emissiveIntensity={0.3}/></mesh>
    </group>
  );
}

// ═══ BATTERY STORAGE UNIT (back-left outside) ═══
function SolarBattery() {
  const p = SOLAR_OBJECT_POSITIONS.solar_battery;
  const barsRef = useRef([]);
  useFrame(() => {
    const t = performance.now() * 0.001;
    barsRef.current.forEach((bar, i) => {
      if (bar) {
        const fill = (Math.sin(t + i * 0.5) + 1) / 2;
        bar.material.emissiveIntensity = fill > 0.3 ? 0.6 : 0.1;
      }
    });
  });
  return (
    <group position={p.pos} rotation={p.rot}>
      {/* Cabinet body */}
      <mesh castShadow><boxGeometry args={[0.7, 1.2, 0.5]}/><meshStandardMaterial color="#2d5016" metalness={0.4} roughness={0.5}/></mesh>
      {/* Front panel */}
      <mesh position={[0, 0, 0.26]}><boxGeometry args={[0.62, 1.12, 0.02]}/><meshStandardMaterial color="#3a6b1e" metalness={0.3}/></mesh>
      {/* Charge level bars (5 bars) */}
      {[0, 1, 2, 3, 4].map(i => (
        <mesh key={i} ref={el => barsRef.current[i] = el} position={[0, -0.3 + i * 0.15, 0.28]}>
          <boxGeometry args={[0.35, 0.08, 0.01]}/>
          <meshStandardMaterial color={i < 2 ? '#e74c3c' : i < 4 ? '#f39c12' : '#27ae60'} emissive={i < 2 ? '#e74c3c' : i < 4 ? '#f39c12' : '#27ae60'} emissiveIntensity={0.3}/>
        </mesh>
      ))}
      {/* Lightning bolt icon */}
      <mesh position={[0, 0.4, 0.28]}><boxGeometry args={[0.06, 0.15, 0.01]}/><meshStandardMaterial color="#f1c40f" emissive="#f1c40f" emissiveIntensity={0.5}/></mesh>
    </group>
  );
}

// ═══ INFO BOARD (reusable — 3 variants) ═══
function InfoBoard({ id, frameColor, icon }) {
  const p = SOLAR_OBJECT_POSITIONS[id];
  if (!p) return null;
  const glowRef = useRef();
  useFrame(() => {
    if (glowRef.current) {
      const t = performance.now() * 0.002;
      glowRef.current.material.emissiveIntensity = 0.2 + Math.sin(t) * 0.15;
    }
  });
  return (
    <group position={p.pos} rotation={p.rot}>
      {/* Post */}
      <mesh position={[0, -0.4, 0]} castShadow><cylinderGeometry args={[0.04, 0.05, 1.2, 8]}/><meshStandardMaterial color="#5a3a1a" roughness={0.7}/></mesh>
      {/* Sign board */}
      <mesh ref={glowRef} position={[0, 0.3, 0]} castShadow>
        <boxGeometry args={[0.9, 0.6, 0.06]}/>
        <meshStandardMaterial color={frameColor} emissive={frameColor} emissiveIntensity={0.2} metalness={0.3}/>
      </mesh>
      {/* Inner panel (white) */}
      <mesh position={[0, 0.3, 0.035]}><boxGeometry args={[0.78, 0.48, 0.01]}/><meshStandardMaterial color="#f5f5f0" roughness={0.8}/></mesh>
      {/* Base */}
      <mesh position={[0, -1.0, 0]}><cylinderGeometry args={[0.15, 0.18, 0.05, 8]}/><meshStandardMaterial color="#555" metalness={0.5}/></mesh>
    </group>
  );
}

// ═══ EV CHARGING STATION (driveway) ═══
function EVCharger() {
  const p = SOLAR_OBJECT_POSITIONS.solar_ev_charger;
  const ringRef = useRef();
  useFrame(() => {
    if (ringRef.current) {
      const t = performance.now() * 0.003;
      const hue = (t % 1);
      ringRef.current.material.color.setHSL(hue, 0.8, 0.5);
      ringRef.current.material.emissive.setHSL(hue, 0.8, 0.3);
    }
  });
  return (
    <group position={p.pos} rotation={p.rot}>
      {/* Post */}
      <mesh castShadow position={[0, 0.5, 0]}><boxGeometry args={[0.3, 1.6, 0.2]}/><meshStandardMaterial color="#2c3e50" metalness={0.5} roughness={0.3}/></mesh>
      {/* Screen */}
      <mesh position={[0, 0.9, 0.11]}><boxGeometry args={[0.22, 0.15, 0.01]}/><meshStandardMaterial color="#0a2a0a" emissive="#22ff44" emissiveIntensity={0.3}/></mesh>
      {/* LED ring */}
      <mesh ref={ringRef} position={[0, 0.6, 0.12]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.08, 0.015, 8, 24]}/><meshStandardMaterial color="#3498db" emissive="#3498db" emissiveIntensity={0.4}/>
      </mesh>
      {/* Cable (hanging) */}
      <mesh position={[0.12, 0.15, 0.1]} rotation={[0, 0, 0.3]}><cylinderGeometry args={[0.015, 0.015, 0.6, 8]}/><meshStandardMaterial color="#222"/></mesh>
      {/* Plug end */}
      <mesh position={[0.3, -0.05, 0.1]}><boxGeometry args={[0.06, 0.08, 0.04]}/><meshStandardMaterial color="#333" metalness={0.6}/></mesh>
      {/* Base plate */}
      <mesh position={[0, -0.28, 0]}><boxGeometry args={[0.5, 0.04, 0.35]}/><meshStandardMaterial color="#444" metalness={0.6}/></mesh>
    </group>
  );
}

// ═══ WEATHER STATION (garden right) ═══
function WeatherStation() {
  const p = SOLAR_OBJECT_POSITIONS.solar_weather;
  const vaneRef = useRef();
  useFrame(() => {
    if (vaneRef.current) vaneRef.current.rotation.y += 0.015;
  });
  return (
    <group position={p.pos} rotation={p.rot}>
      {/* Pole */}
      <mesh position={[0, 0.4, 0]}><cylinderGeometry args={[0.03, 0.04, 1.4, 8]}/><meshStandardMaterial color="#888" metalness={0.6}/></mesh>
      {/* Wind vane (spinning) */}
      <group ref={vaneRef} position={[0, 1.1, 0]}>
        <mesh><boxGeometry args={[0.4, 0.02, 0.06]}/><meshStandardMaterial color="#e74c3c"/></mesh>
        <mesh position={[0.22, 0, 0]}><coneGeometry args={[0.04, 0.1, 4]}/><meshStandardMaterial color="#e74c3c"/></mesh>
      </group>
      {/* Rain gauge */}
      <mesh position={[0.12, 0.6, 0]}><cylinderGeometry args={[0.04, 0.03, 0.15, 8]}/><meshStandardMaterial color="#ddd" transparent opacity={0.6}/></mesh>
      {/* Temp display */}
      <mesh position={[0, 0.5, 0.05]}><boxGeometry args={[0.15, 0.1, 0.02]}/><meshStandardMaterial color="#0a0a2a" emissive="#ff8800" emissiveIntensity={0.3}/></mesh>
      {/* Base */}
      <mesh position={[0, -0.25, 0]}><cylinderGeometry args={[0.12, 0.15, 0.05, 8]}/><meshStandardMaterial color="#666" metalness={0.5}/></mesh>
    </group>
  );
}

// ═══ LADDER (on left wall — climb to roof) ═══
function SolarLadder() {
  const p = SOLAR_OBJECT_POSITIONS.solar_ladder;
  return (
    <group position={p.pos} rotation={p.rot}>
      {/* Side rails */}
      <mesh position={[-0.2, 1.5, 0]}><boxGeometry args={[0.06, 4.0, 0.06]}/><meshStandardMaterial color="#8B4513" roughness={0.7}/></mesh>
      <mesh position={[0.2, 1.5, 0]}><boxGeometry args={[0.06, 4.0, 0.06]}/><meshStandardMaterial color="#8B4513" roughness={0.7}/></mesh>
      {/* Rungs */}
      {[0, 0.4, 0.8, 1.2, 1.6, 2.0, 2.4, 2.8].map((y, i) => (
        <mesh key={i} position={[0, y, 0]}><boxGeometry args={[0.4, 0.04, 0.06]}/><meshStandardMaterial color="#A0522D" roughness={0.6}/></mesh>
      ))}
    </group>
  );
}

// ═══ ROOF PANEL (interactable on rooftop) ═══
function RoofPanel() {
  const p = SOLAR_OBJECT_POSITIONS.solar_roof_panel;
  const shimmerRef = useRef();
  useFrame(() => {
    if (shimmerRef.current) {
      const t = performance.now() * 0.001;
      shimmerRef.current.material.emissiveIntensity = 0.15 + Math.sin(t * 2) * 0.1;
    }
  });
  return (
    <group position={p.pos} rotation={p.rot}>
      {/* Panel frame */}
      <mesh rotation={[-0.4, 0, 0]} castShadow><boxGeometry args={[1.8, 0.08, 1.2]}/><meshStandardMaterial color="#1a2a5a" metalness={0.8} roughness={0.2}/></mesh>
      {/* PV cells overlay */}
      <mesh ref={shimmerRef} rotation={[-0.4, 0, 0]} position={[0, 0.05, 0]}>
        <boxGeometry args={[1.7, 0.02, 1.1]}/>
        <meshStandardMaterial color="#2244aa" metalness={0.9} roughness={0.1} emissive="#112255" emissiveIntensity={0.15}/>
      </mesh>
      {/* Mounting legs */}
      <mesh position={[-0.6, -0.2, 0]}><cylinderGeometry args={[0.02, 0.02, 0.5, 4]}/><meshStandardMaterial color="#888"/></mesh>
      <mesh position={[0.6, -0.2, 0]}><cylinderGeometry args={[0.02, 0.02, 0.5, 4]}/><meshStandardMaterial color="#888"/></mesh>
      {/* Tilt gauge arc */}
      <mesh position={[0.95, 0, 0]} rotation={[0, 0, -0.4]}>
        <torusGeometry args={[0.15, 0.01, 4, 12, Math.PI / 2]}/>
        <meshStandardMaterial color="#f39c12" emissive="#f39c12" emissiveIntensity={0.3}/>
      </mesh>
    </group>
  );
}

// ═══ SOLAR LABEL (shows "Press E" when near) ═══
function SolarLabel({ id, label, showLevel }) {
  const p = SOLAR_OBJECT_POSITIONS[id];
  if (!p || !showLevel || showLevel === 'hidden') return null;
  const yOffset = id === 'solar_roof_panel' ? 0.8 : (id.includes('board') ? 1.0 : 0.9);
  return (
    <Html position={[p.pos[0], p.pos[1] + yOffset, p.pos[2]]} center>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', pointerEvents: 'none' }}>
        <div style={{ background: 'rgba(0,0,0,0.85)', color: '#ffd700', padding: '5px 14px', borderRadius: '10px', fontSize: '12px', fontFamily: 'Nunito, sans-serif', fontWeight: 700, whiteSpace: 'nowrap', border: '1px solid rgba(255,215,0,0.4)', boxShadow: '0 0 12px rgba(255,215,0,0.2)' }}>
          ☀️ {label}
        </div>
        <div style={{ background: 'rgba(255,165,0,0.9)', color: '#fff', padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontFamily: 'Nunito, sans-serif', fontWeight: 600, whiteSpace: 'nowrap' }}>
          Press <span style={{ background: 'rgba(255,255,255,0.3)', padding: '1px 5px', borderRadius: '3px', fontWeight: 700 }}>E</span> to learn
        </div>
      </div>
    </Html>
  );
}

// ═══ PROXIMITY FOR SOLAR OBJECTS ═══
export function getSolarProximity(px, pz, isOnRoof = false) {
  const levels = {};
  let nearestId = null, minDist = 3.0;
  for (const [id, obj] of Object.entries(SOLAR_OBJECT_POSITIONS)) {
    // Skip roof panel if player is on ground, skip ground objects if on roof
    if (id === 'solar_roof_panel' && !isOnRoof) { levels[id] = 'hidden'; continue; }
    if (id !== 'solar_roof_panel' && id !== 'solar_ladder' && isOnRoof) { levels[id] = 'hidden'; continue; }
    const dx = px - obj.pos[0], dz = pz - obj.pos[2];
    const dist = Math.sqrt(dx * dx + dz * dz);
    if (dist < minDist) { minDist = dist; nearestId = id; }
    levels[id] = 'hidden';
  }
  if (nearestId) levels[nearestId] = 'interact';
  return { levels, nearest: nearestId };
}

// ═══ SOLAR OBJECT LABELS ═══
const SOLAR_LABELS = {
  solar_inverter: 'Inverter Box',
  solar_meter: 'Net Meter',
  solar_battery: 'Battery Unit',
  solar_board_1: 'Info Board ☀️',
  solar_board_2: 'Info Board 🔋',
  solar_board_3: 'Info Board 💰',
  solar_ev_charger: 'EV Charger',
  solar_weather: 'Weather Station',
  solar_roof_panel: 'Solar Panel',
  solar_ladder: 'Ladder 🪜',
};

// ═══ MAIN EXPORT ═══
export default function Level4SolarObjects({ solarProximity, phaseIdx }) {
  const levels = solarProximity || {};
  return (
    <group>
      <SolarInverter />
      <SolarMeter />
      <SolarBattery />
      <InfoBoard id="solar_board_1" frameColor="#2980b9" icon="☀️" />
      <InfoBoard id="solar_board_2" frameColor="#27ae60" icon="🔋" />
      <InfoBoard id="solar_board_3" frameColor="#e67e22" icon="💰" />
      <EVCharger />
      <WeatherStation />
      <SolarLadder />
      {/* Roof panel only visible from phase 1 onwards */}
      {phaseIdx >= 1 && <RoofPanel />}
      {/* Labels for nearby solar objects */}
      {Object.entries(SOLAR_LABELS).map(([id, label]) => (
        <SolarLabel key={id} id={id} label={label} showLevel={levels[id]} />
      ))}
    </group>
  );
}
