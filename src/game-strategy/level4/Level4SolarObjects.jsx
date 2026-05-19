// Level 4: Solar-Specific 3D Objects with Name Labels
// Premium animated objects for solar education
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { SOLAR_OBJECT_POSITIONS } from '../applianceData';

// --- ALWAYS-VISIBLE NAME PLATE (like previous levels) ---
function NamePlate({ position, name, icon, color = '#ffd700' }) {
  return (
    <Html position={position} center>
      <div style={{
        background: 'rgba(0,0,0,0.82)', color, padding: '4px 12px',
        borderRadius: '8px', fontSize: '12px', fontFamily: "'Nunito',sans-serif",
        fontWeight: 700, whiteSpace: 'nowrap', border: `1px solid ${color}33`,
        boxShadow: `0 0 10px ${color}22`, pointerEvents: 'none',
        textAlign: 'center', letterSpacing: '0.5px',
      }}>
        {icon} {name}
      </div>
    </Html>
  );
}

// --- SOLAR INVERTER BOX (wall-mounted) ---
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
      {/* Brand label */}
      <mesh position={[0, 0.2, 0.18]}><boxGeometry args={[0.4, 0.08, 0.01]}/><meshStandardMaterial color="#1a5276" emissive="#1a5276" emissiveIntensity={0.2}/></mesh>
      {/* Name plate */}
      <NamePlate position={[0, 0.9, 0]} name="Solar Inverter" icon={'\uD83D\uDD0C'} color="#4fc3f7"/>
    </group>
  );
}

// --- NET METER / SMART METER (wall-mounted) ---
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
      {/* Name plate */}
      <NamePlate position={[0, 0.7, 0]} name="Net Meter" icon={'\uD83D\uDCCA'} color="#66bb6a"/>
    </group>
  );
}

// --- BATTERY STORAGE UNIT ---
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
      {/* Name plate */}
      <NamePlate position={[0, 1.0, 0]} name="Battery Storage" icon={'\uD83D\uDD0B'} color="#81c784"/>
    </group>
  );
}

// --- INFO BOARD (reusable - 3 variants) ---
function InfoBoard({ id, frameColor, icon, label }) {
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
      {/* Name plate */}
      <NamePlate position={[0, 1.0, 0]} name={label} icon={icon} color="#ffb74d"/>
    </group>
  );
}

// --- EV CHARGING STATION ---
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
      {/* Name plate */}
      <NamePlate position={[0, 1.5, 0]} name="EV Charger" icon={'\uD83D\uDE97'} color="#ce93d8"/>
    </group>
  );
}

// --- WEATHER STATION ---
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
      {/* Name plate */}
      <NamePlate position={[0, 1.5, 0]} name="Weather Station" icon={'\uD83C\uDF24\uFE0F'} color="#90caf9"/>
    </group>
  );
}

// --- LADDER (leaning on left wall - climb to roof) ---
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
      {/* Name plate */}
      <NamePlate position={[0, 3.5, 0]} name="Ladder (Climb to Roof)" icon={'\uD83E\uDE9C'} color="#ffcc80"/>
    </group>
  );
}

// --- ROOF PANEL (interactable on rooftop) ---
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
      {/* Name plate */}
      <NamePlate position={[0, 0.8, 0]} name="Solar Panel" icon={'\u2600\uFE0F'} color="#ffd54f"/>
    </group>
  );
}

// --- PROXIMITY DETECTION FOR SOLAR OBJECTS ---
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

// --- PRESS-E PROMPT (shows when near) ---
function InteractPrompt({ id, showLevel }) {
  const p = SOLAR_OBJECT_POSITIONS[id];
  if (!p || !showLevel || showLevel === 'hidden') return null;
  const yOffset = id === 'solar_roof_panel' ? 1.4 : (id.includes('board') ? 1.6 : 1.5);
  return (
    <Html position={[p.pos[0], p.pos[1] + yOffset, p.pos[2]]} center>
      <div style={{
        background: 'rgba(245,166,35,0.92)', color: '#fff', padding: '4px 12px',
        borderRadius: '8px', fontSize: '12px', fontFamily: "'Nunito',sans-serif",
        fontWeight: 700, whiteSpace: 'nowrap', animation: 'pulse 1.5s infinite',
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
      }}>
        Press <span style={{ background: 'rgba(255,255,255,0.3)', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>E</span> to learn
      </div>
    </Html>
  );
}

// --- GOVERNMENT OFFICE BUILDING (detailed, realistic) ---
function GovOffice({ visible }) {
  const p = SOLAR_OBJECT_POSITIONS.gov_office;
  const glowRef = useRef();
  useFrame(() => {
    if (glowRef.current) {
      glowRef.current.material.emissiveIntensity = 0.3 + Math.sin(performance.now() * 0.002) * 0.15;
    }
  });
  if (!visible) return null;
  return (
    <group position={p.pos}>
      {/* === FOUNDATION & STEPS === */}
      <mesh position={[0, 0.1, 3]}>
        <boxGeometry args={[14, 0.2, 2]}/>
        <meshStandardMaterial color="#c4b090" roughness={0.9}/>
      </mesh>
      {/* Entry steps (3 steps) */}
      {[0, 1, 2].map(i => (
        <mesh key={i} position={[0, 0.1 + i * 0.15, 4.5 - i * 0.4]}>
          <boxGeometry args={[5 - i * 0.3, 0.15, 0.8]}/>
          <meshStandardMaterial color="#d4c4a0" roughness={0.8}/>
        </mesh>
      ))}

      {/* === MAIN BUILDING === */}
      {/* Back wall */}
      <mesh position={[0, 2.5, 0]}>
        <boxGeometry args={[13, 5, 0.3]}/>
        <meshStandardMaterial color="#f5ecd7" roughness={0.7}/>
      </mesh>
      {/* Left wall */}
      <mesh position={[-6.5, 2.5, 2]}>
        <boxGeometry args={[0.3, 5, 4.3]}/>
        <meshStandardMaterial color="#efe4cc" roughness={0.7}/>
      </mesh>
      {/* Right wall */}
      <mesh position={[6.5, 2.5, 2]}>
        <boxGeometry args={[0.3, 5, 4.3]}/>
        <meshStandardMaterial color="#efe4cc" roughness={0.7}/>
      </mesh>
      {/* Front wall left */}
      <mesh position={[-4.25, 2.5, 4]}>
        <boxGeometry args={[4.8, 5, 0.3]}/>
        <meshStandardMaterial color="#f5ecd7" roughness={0.7}/>
      </mesh>
      {/* Front wall right */}
      <mesh position={[4.25, 2.5, 4]}>
        <boxGeometry args={[4.8, 5, 0.3]}/>
        <meshStandardMaterial color="#f5ecd7" roughness={0.7}/>
      </mesh>
      {/* Above door */}
      <mesh position={[0, 4.2, 4]}>
        <boxGeometry args={[3.5, 1.6, 0.3]}/>
        <meshStandardMaterial color="#f5ecd7" roughness={0.7}/>
      </mesh>

      {/* === DOOR (dark wood, arched look) === */}
      <mesh position={[0, 1.7, 4.1]}>
        <boxGeometry args={[2.2, 3.4, 0.15]}/>
        <meshStandardMaterial color="#5a3520" roughness={0.5} metalness={0.1}/>
      </mesh>
      {/* Door frame */}
      <mesh position={[0, 1.7, 4.15]}>
        <boxGeometry args={[2.4, 3.6, 0.05]}/>
        <meshStandardMaterial color="#3d2010" roughness={0.4}/>
      </mesh>
      {/* Door handles */}
      <mesh position={[-0.4, 1.5, 4.2]}>
        <sphereGeometry args={[0.06, 8, 8]}/>
        <meshStandardMaterial color="#c4a030" metalness={0.8} roughness={0.2}/>
      </mesh>
      <mesh position={[0.4, 1.5, 4.2]}>
        <sphereGeometry args={[0.06, 8, 8]}/>
        <meshStandardMaterial color="#c4a030" metalness={0.8} roughness={0.2}/>
      </mesh>

      {/* === WINDOWS (6 windows, 3 per side) === */}
      {[-5, -3, -1.5, 1.5, 3, 5].map((x, i) => {
        if (Math.abs(x) < 1.8) return null; // skip door area
        const onFront = true;
        return (
          <group key={i} position={[x, 2.5, onFront ? 4.12 : 0.15]}>
            {/* Window glass */}
            <mesh><boxGeometry args={[1, 1.8, 0.05]}/><meshStandardMaterial color="#87CEEB" transparent opacity={0.4} metalness={0.1}/></mesh>
            {/* Window frame */}
            <mesh position={[0, 0, 0.03]}><boxGeometry args={[1.15, 1.95, 0.03]}/><meshStandardMaterial color="#5a3a1a" roughness={0.5}/></mesh>
            {/* Cross bars */}
            <mesh position={[0, 0, 0.05]}><boxGeometry args={[0.04, 1.8, 0.02]}/><meshStandardMaterial color="#5a3a1a"/></mesh>
            <mesh position={[0, 0, 0.05]}><boxGeometry args={[1, 0.04, 0.02]}/><meshStandardMaterial color="#5a3a1a"/></mesh>
          </group>
        );
      })}

      {/* === PILLARS (4 decorative columns) === */}
      {[-3.5, -1.5, 1.5, 3.5].map((x, i) => (
        <group key={i} position={[x, 0, 4.5]}>
          {/* Base */}
          <mesh position={[0, 0.15, 0]}><boxGeometry args={[0.5, 0.3, 0.5]}/><meshStandardMaterial color="#d4c4a0" roughness={0.6}/></mesh>
          {/* Column */}
          <mesh position={[0, 2.5, 0]}><cylinderGeometry args={[0.15, 0.18, 4.4, 8]}/><meshStandardMaterial color="#f0e8d0" roughness={0.5}/></mesh>
          {/* Capital */}
          <mesh position={[0, 4.75, 0]}><boxGeometry args={[0.5, 0.3, 0.5]}/><meshStandardMaterial color="#d4c4a0" roughness={0.6}/></mesh>
        </group>
      ))}

      {/* === ROOF / PARAPET === */}
      <mesh position={[0, 5.1, 2]}>
        <boxGeometry args={[14, 0.3, 5]}/>
        <meshStandardMaterial color="#c4a882" roughness={0.6}/>
      </mesh>
      {/* Parapet wall */}
      <mesh position={[0, 5.5, 2]}>
        <boxGeometry args={[14, 0.5, 0.15]}/>
        <meshStandardMaterial color="#e0d4bc" roughness={0.7}/>
      </mesh>

      {/* === SIGNBOARD === */}
      <mesh position={[0, 4.8, 4.3]}>
        <boxGeometry args={[5, 0.8, 0.1]}/>
        <meshStandardMaterial color="#1a3a6e" roughness={0.4}/>
      </mesh>
      <NamePlate position={[0, 5.2, 4.5]} name="PM Surya Ghar Office" icon={'\u{1F3DB}'} color="#fbbf24"/>

      {/* === FLAG POLE === */}
      <group position={[5.5, 0, 5]}>
        <mesh position={[0, 3.5, 0]}><cylinderGeometry args={[0.04, 0.06, 7, 8]}/><meshStandardMaterial color="#888" metalness={0.8}/></mesh>
        {/* Indian flag (tricolor) */}
        <mesh position={[0.5, 6.5, 0]}><boxGeometry args={[1.0, 0.2, 0.02]}/><meshStandardMaterial color="#FF9933"/></mesh>
        <mesh position={[0.5, 6.3, 0]}><boxGeometry args={[1.0, 0.2, 0.02]}/><meshStandardMaterial color="#FFFFFF"/></mesh>
        <mesh position={[0.5, 6.1, 0]}><boxGeometry args={[1.0, 0.2, 0.02]}/><meshStandardMaterial color="#138808"/></mesh>
      </group>

      {/* === INTERIOR GLOW (visible through door) === */}
      <pointLight position={[0, 2.5, 2]} intensity={1.2} color="#fff5e0" distance={8}/>
      <mesh ref={glowRef} position={[0, 2.5, 2]}>
        <sphereGeometry args={[0.2, 8, 8]}/>
        <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={0.3} transparent opacity={0.3}/>
      </mesh>

      {/* === FLOOR (interior tile) === */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 2]}>
        <planeGeometry args={[13, 4]}/>
        <meshStandardMaterial color="#d4c8b0" roughness={0.8}/>
      </mesh>

      {/* === COMPOUND WALL & GATE === */}
      {/* Left compound wall */}
      <mesh position={[-6.5, 0.5, 6]}><boxGeometry args={[0.2, 1, 4]}/><meshStandardMaterial color="#d4c090" roughness={0.8}/></mesh>
      {/* Right compound wall */}
      <mesh position={[6.5, 0.5, 6]}><boxGeometry args={[0.2, 1, 4]}/><meshStandardMaterial color="#d4c090" roughness={0.8}/></mesh>
      {/* Gate pillars */}
      <mesh position={[-1.5, 0.75, 8]}><boxGeometry args={[0.4, 1.5, 0.4]}/><meshStandardMaterial color="#c4a070" roughness={0.6}/></mesh>
      <mesh position={[1.5, 0.75, 8]}><boxGeometry args={[0.4, 1.5, 0.4]}/><meshStandardMaterial color="#c4a070" roughness={0.6}/></mesh>
    </group>
  );
}

// --- ROAD (connecting house to office) ---
function RoadToOffice({ visible }) {
  if (!visible) return null;
  return (
    <group>
      {/* Main road */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -16]}>
        <planeGeometry args={[4, 14]}/>
        <meshStandardMaterial color="#444" roughness={0.95}/>
      </mesh>
      {/* Road center line */}
      {[-12, -14, -16, -18, -20].map((z, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, z]}>
          <planeGeometry args={[0.15, 1]}/>
          <meshStandardMaterial color="#fbbf24" roughness={0.8}/>
        </mesh>
      ))}
      {/* Footpath left */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-2.5, 0.015, -16]}>
        <planeGeometry args={[1, 14]}/>
        <meshStandardMaterial color="#999" roughness={0.9}/>
      </mesh>
      {/* Footpath right */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[2.5, 0.015, -16]}>
        <planeGeometry args={[1, 14]}/>
        <meshStandardMaterial color="#999" roughness={0.9}/>
      </mesh>
    </group>
  );
}

// --- MAIN EXPORT ---
export default function Level4SolarObjects({ solarProximity, phaseIdx }) {
  const levels = solarProximity || {};
  const showOffice = phaseIdx >= 3; // Show office from PM Surya Ghar phase onwards
  return (
    <group>
      <SolarInverter />
      <SolarMeter />
      <SolarBattery />
      <InfoBoard id="solar_board_1" frameColor="#2980b9" icon={'\u2600\uFE0F'} label="Solar Info" />
      <InfoBoard id="solar_board_2" frameColor="#27ae60" icon={'\uD83D\uDD0B'} label="Energy Info" />
      <InfoBoard id="solar_board_3" frameColor="#e67e22" icon={'\uD83D\uDCB0'} label="Cost Info" />
      <EVCharger />
      <WeatherStation />
      <SolarLadder />
      {/* Roof panel visible from phase 1 onwards */}
      {phaseIdx >= 1 && <RoofPanel />}
      {/* Government office building + road (phase 4+) */}
      <RoadToOffice visible={showOffice}/>
      <GovOffice visible={showOffice}/>
      {/* Press E prompts - only show for nearest */}
      {Object.keys(SOLAR_OBJECT_POSITIONS).map(id => (
        <InteractPrompt key={id} id={id} showLevel={levels[id]} />
      ))}
    </group>
  );
}

