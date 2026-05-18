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
import { SCHEDULE_SLOTS, SHOP_DISPLAYS } from './level5Data';

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
    dirRef.current.intensity += (slot.sunlight * 1.2 * wf - dirRef.current.intensity) * 0.04;
    ambRef.current.intensity += (0.35 + slot.sunlight * 0.15 * wf - ambRef.current.intensity) * 0.04;
  });
  return (<>
    <directionalLight ref={dirRef} position={[15, 20, -8]} intensity={1.0} color="#ffd699" />
    <ambientLight ref={ambRef} intensity={0.45} color="#ffe8cc" />
    <hemisphereLight intensity={0.35} color="#ffecd2" groundColor="#3a7a3a" />
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
function RoofPanels({ weatherFactor, showAged, isNear, roofVisited }) {
  const panelRefs = useRef([]);
  const slots = [[-2, -1.5], [0, -1.5], [2, -1.5], [-2, 0.5], [0, 0.5], [2, 0.5]];
  const tiltRad = (25 * Math.PI) / 180;
  const aged = showAged;

  useFrame(() => {
    panelRefs.current.forEach(ref => {
      if (ref) {
        const wf = weatherFactor || 1.0;
        const targetIntensity = aged ? 0.04 : 0.15 * wf;
        ref.material.emissiveIntensity += (targetIntensity - ref.material.emissiveIntensity) * 0.05;
      }
    });
  });

  return (<group>
    {slots.map((s, i) => (
      <group key={i} position={[s[0], 5.5, s[1] + 1]}>
        <mesh rotation={[-tiltRad, 0, 0]} position={[0, 0.05, 0]}><boxGeometry args={[1.5, 0.08, 1.0]} /><meshStandardMaterial color={aged ? '#3a3a2a' : '#1a2a5a'} metalness={0.8} roughness={aged ? 0.6 : 0.2} /></mesh>
        <mesh ref={el => panelRefs.current[i] = el} rotation={[-tiltRad, 0, 0]} position={[0, 0.1, 0]}><boxGeometry args={[1.4, 0.02, 0.9]} /><meshStandardMaterial color={aged ? '#445566' : '#2244aa'} metalness={aged ? 0.5 : 0.9} roughness={aged ? 0.5 : 0.1} emissive={aged ? '#222' : '#112255'} emissiveIntensity={aged ? 0.04 : 0.15} /></mesh>
        {/* Weathering lines on aged panels */}
        {aged && <mesh rotation={[-tiltRad, 0, 0]} position={[0, 0.12, 0]}><boxGeometry args={[1.3, 0.005, 0.005]} /><meshBasicMaterial color="#8a8a6a" transparent opacity={0.4} /></mesh>}
        {aged && <mesh rotation={[-tiltRad, 0, 0]} position={[0.3, 0.12, 0.2]}><boxGeometry args={[0.005, 0.005, 0.6]} /><meshBasicMaterial color="#8a8a6a" transparent opacity={0.3} /></mesh>}
      </group>
    ))}
    {/* Aged label on roof */}
    {aged && <Html position={[0, 7.5, 0]} center>
      <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'4px',pointerEvents:'none'}}>
        <div style={{background:'rgba(249,115,22,0.9)',color:'#fff',padding:'5px 14px',borderRadius:'10px',fontSize:'12px',fontWeight:700,whiteSpace:'nowrap',fontFamily:'Nunito',boxShadow:'0 2px 12px rgba(249,115,22,0.4)'}}>
          {'\u2600\uFE0F'} 25-Year-Old Solar Panels
        </div>
        {roofVisited && <div style={{color:'#22c55e',fontSize:'18px',filter:'drop-shadow(0 0 4px rgba(34,197,94,0.5))'}}>{'✅'}</div>}
      </div>
    </Html>}
    {/* Ground-level interaction point near house front */}
    {aged && !roofVisited && (
      <group position={[0, 0.5, -12]}>
        <mesh position={[0, 0, 0]}><cylinderGeometry args={[0.6, 0.6, 0.05, 16]} /><meshStandardMaterial color="#f97316" emissive="#f97316" emissiveIntensity={0.3} transparent opacity={0.3} /></mesh>
        <Html position={[0, 1.5, 0]} center>
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'4px',pointerEvents:'none'}}>
            <div style={{background:'rgba(249,115,22,0.9)',color:'#fff',padding:'5px 14px',borderRadius:'10px',fontSize:'12px',fontWeight:700,whiteSpace:'nowrap',fontFamily:'Nunito',boxShadow:'0 2px 12px rgba(249,115,22,0.4)'}}>
              {'\u2600\uFE0F'} Inspect Roof Panels
            </div>
            {isNear && <div style={{background:'rgba(245,158,11,0.95)',color:'#fff',padding:'5px 14px',borderRadius:'8px',fontSize:'12px',fontWeight:700,whiteSpace:'nowrap',fontFamily:'Nunito',boxShadow:'0 2px 12px rgba(245,158,11,0.4)',animation:'l5-pulse-glow 2s ease infinite'}}>
              Press <span style={{background:'rgba(255,255,255,0.3)',padding:'2px 7px',borderRadius:'4px',fontWeight:800}}>E</span> to inspect
            </div>}
          </div>
        </Html>
      </group>
    )}
  </group>);
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

// ═══ ELECTRICITY METER (right wall) ═══
function ElectricityMeter({ isNear, visited }) {
  const glowRef = useRef();
  useFrame(() => { if (glowRef.current) glowRef.current.material.emissiveIntensity = visited ? 0.05 : 0.2 + Math.sin(performance.now() * 0.004) * 0.15; });
  return (
    <group position={[10.3, 1.2, -3]}>
      <mesh><boxGeometry args={[0.3, 0.6, 0.4]} /><meshStandardMaterial color="#2a2a3a" metalness={0.6} roughness={0.3} /></mesh>
      <mesh ref={glowRef} position={[0.16, 0.1, 0]}><boxGeometry args={[0.02, 0.2, 0.25]} /><meshStandardMaterial color={visited ? '#22c55e' : '#ef4444'} emissive={visited ? '#22c55e' : '#ef4444'} emissiveIntensity={0.2} /></mesh>
      <mesh position={[0.16, -0.1, 0]}><boxGeometry args={[0.02, 0.15, 0.2]} /><meshStandardMaterial color="#333" /></mesh>
      {isNear && !visited && <Html position={[0.3, 0.6, 0]} center><div style={{background:'rgba(239,68,68,0.9)',color:'#fff',padding:'4px 12px',borderRadius:'8px',fontSize:'12px',fontWeight:700,whiteSpace:'nowrap',fontFamily:'Nunito'}}>Press <span style={{background:'rgba(255,255,255,0.3)',padding:'1px 5px',borderRadius:'3px'}}>E</span> to check meter</div></Html>}
    </group>
  );
}

// ═══ NEWSPAPER (front yard) ═══
function Newspaper({ isNear, visible, pickedUp }) {
  const ref = useRef();
  useFrame(() => { if (ref.current && !pickedUp) ref.current.position.y = 0.3 + Math.sin(performance.now() * 0.003) * 0.05; });
  if (!visible || pickedUp) return null;
  return (
    <group>
      <mesh ref={ref} position={[-5, 0.3, -10]} rotation={[-0.3, 0.2, 0]}>
        <boxGeometry args={[0.6, 0.02, 0.4]} /><meshStandardMaterial color="#f5f0e0" />
      </mesh>
      <mesh position={[-5, 0.32, -10]} rotation={[-0.3, 0.2, 0]}>
        <boxGeometry args={[0.5, 0.01, 0.35]} /><meshStandardMaterial color="#1a1a2e" />
      </mesh>
      {isNear && <Html position={[-5, 0.8, -10]} center><div style={{background:'rgba(245,158,11,0.9)',color:'#fff',padding:'4px 12px',borderRadius:'8px',fontSize:'12px',fontWeight:700,whiteSpace:'nowrap',fontFamily:'Nunito'}}>Press <span style={{background:'rgba(255,255,255,0.3)',padding:'1px 5px',borderRadius:'3px'}}>E</span> to pick up</div></Html>}
    </group>
  );
}

// ═══ TEACHER NPC ═══
function TeacherNPC({ visible }) {
  const bodyRef = useRef();
  useFrame(() => { if (bodyRef.current) bodyRef.current.position.y = Math.sin(performance.now() * 0.002) * 0.03; });
  if (!visible) return null;
  const skin='#c68642',coat='#1e40af',pants='#1a1a2e',hair='#333';
  return (
    <group position={[12, 0, -3]}>
      <group ref={bodyRef}>
        <mesh position={[0,0.4,0]}><cylinderGeometry args={[0.08,0.07,0.8,6]}/><meshStandardMaterial color={pants}/></mesh>
        <mesh position={[0,0.9,0]}><boxGeometry args={[0.5,0.6,0.28]}/><meshStandardMaterial color={coat}/></mesh>
        <mesh position={[0,1.35,0]}><sphereGeometry args={[0.2,12,12]}/><meshStandardMaterial color={skin}/></mesh>
        <mesh position={[0,1.48,0]}><sphereGeometry args={[0.21,12,8,0,Math.PI*2,0,Math.PI/2]}/><meshStandardMaterial color={hair}/></mesh>
        <mesh position={[-0.07,1.38,0.18]}><sphereGeometry args={[0.03,8,8]}/><meshStandardMaterial color="#fff"/></mesh>
        <mesh position={[0.07,1.38,0.18]}><sphereGeometry args={[0.03,8,8]}/><meshStandardMaterial color="#fff"/></mesh>
      </group>
      <Html position={[0, 2.0, 0]} center>
        <div style={{background:'rgba(30,64,175,0.9)',color:'#fff',padding:'3px 10px',borderRadius:'8px',fontSize:'11px',fontWeight:700,whiteSpace:'nowrap',fontFamily:'Nunito'}}>
          {'\u{1F9D1}\u200D\u{1F3EB}'} Energy Teacher
        </div>
      </Html>
    </group>
  );
}

// ═══ APPLIANCE SHOP BUILDING ═══
function ApplianceShop({ visible, nearestAppliance, inspectedDisplays }) {
  const signRef = useRef();
  useFrame(() => { if (signRef.current) signRef.current.material.emissiveIntensity = 0.15 + Math.sin(performance.now() * 0.003) * 0.1; });
  if (!visible) return null;

  // Shop is centered at [24, 0, 0], extends from x=16 to x=32, z=-8 to z=8
  return (
    <group position={[24, 0, 0]}>
      {/* ─── Floor ─── */}
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,0.02,0]}><planeGeometry args={[16, 16]} /><meshStandardMaterial color="#c4a882" /></mesh>
      {/* Tiled floor pattern */}
      {[-6,-3,0,3,6].map(tx => [-6,-3,0,3,6].map(tz =>
        <mesh key={`${tx}_${tz}`} rotation={[-Math.PI/2,0,0]} position={[tx, 0.03, tz]}><planeGeometry args={[2.8, 2.8]} /><meshStandardMaterial color={((Math.abs(tx)+Math.abs(tz))%6===0)?'#b89a72':'#c4a882'} /></mesh>
      ))}

      {/* ─── Walls (3 sides, open front on -Z) ─── */}
      {/* Back wall (+Z) */}
      <mesh position={[0, 3.5, 8]}><boxGeometry args={[16.4, 7, 0.3]} /><meshStandardMaterial color="#e8e0d0" /></mesh>
      {/* Left wall (-X) */}
      <mesh position={[-8, 3.5, 0]}><boxGeometry args={[0.3, 7, 16]} /><meshStandardMaterial color="#e8e0d0" /></mesh>
      {/* Right wall (+X) */}
      <mesh position={[8, 3.5, 0]}><boxGeometry args={[0.3, 7, 16]} /><meshStandardMaterial color="#e8e0d0" /></mesh>
      {/* Front wall pieces (open entrance in center) */}
      <mesh position={[-5.5, 3.5, -8]}><boxGeometry args={[5, 7, 0.3]} /><meshStandardMaterial color="#e8e0d0" /></mesh>
      <mesh position={[5.5, 3.5, -8]}><boxGeometry args={[5, 7, 0.3]} /><meshStandardMaterial color="#e8e0d0" /></mesh>
      {/* Entrance beam */}
      <mesh position={[0, 6.7, -8]}><boxGeometry args={[6.5, 0.6, 0.4]} /><meshStandardMaterial color="#8B4513" /></mesh>

      {/* ─── Roof ─── */}
      <mesh position={[0, 7.2, 0]}><boxGeometry args={[17, 0.4, 17]} /><meshStandardMaterial color="#8B4513" /></mesh>

      {/* ─── Sign (above entrance) ─── */}
      <mesh ref={signRef} position={[0, 5.8, -8.2]}><boxGeometry args={[8, 1.5, 0.15]} /><meshStandardMaterial color="#1a3a6a" emissive="#1a3a6a" emissiveIntensity={0.15} /></mesh>
      <Html position={[0, 5.8, -8.4]} center>
        <div style={{color:'#f59e0b',fontSize:'18px',fontWeight:800,fontFamily:'Fredoka,sans-serif',textShadow:'0 0 10px rgba(245,158,11,0.5)',whiteSpace:'nowrap'}}>
          {'\u2B50'} BEE Star-Rated Appliance Shop {'\u2B50'}
        </div>
      </Html>

      {/* ─── Interior Lighting ─── */}
      <pointLight position={[0, 6, 0]} intensity={1.2} color="#fff5e0" distance={20} />
      <pointLight position={[-4, 6, -3]} intensity={0.6} color="#fff5e0" distance={12} />
      <pointLight position={[4, 6, 3]} intensity={0.6} color="#fff5e0" distance={12} />

      {/* ─── Wall Shelving (decoration along back & side walls) ─── */}
      {[-5, -2, 1, 4].map(sx => (
        <group key={`shelf_${sx}`}>
          <mesh position={[sx, 2.5, 7.7]}><boxGeometry args={[2.5, 0.12, 0.6]} /><meshStandardMaterial color="#8a6a4a" /></mesh>
          <mesh position={[sx, 4.0, 7.7]}><boxGeometry args={[2.5, 0.12, 0.6]} /><meshStandardMaterial color="#8a6a4a" /></mesh>
          {/* Small items on shelves */}
          <mesh position={[sx-0.5, 2.8, 7.7]}><boxGeometry args={[0.3, 0.4, 0.3]} /><meshStandardMaterial color="#aaa" /></mesh>
          <mesh position={[sx+0.5, 2.8, 7.6]}><boxGeometry args={[0.25, 0.35, 0.25]} /><meshStandardMaterial color="#88bbff" /></mesh>
          <mesh position={[sx, 4.3, 7.7]}><boxGeometry args={[0.4, 0.3, 0.3]} /><meshStandardMaterial color="#ccc" /></mesh>
        </group>
      ))}

      {/* ─── Counter/Register near entrance ─── */}
      <mesh position={[5, 0.6, -5]}><boxGeometry args={[2.5, 1.2, 1]} /><meshStandardMaterial color="#6a4a2a" /></mesh>
      <mesh position={[5, 1.3, -5]}><boxGeometry args={[2.6, 0.1, 1.1]} /><meshStandardMaterial color="#8a6a4a" /></mesh>

      {/* ─── DISPLAY STANDS (big, distinct per appliance) ─── */}
      {SHOP_DISPLAYS.map((d) => {
        const lp = [d.pos[0]-24, d.pos[1], d.pos[2]];
        const done = inspectedDisplays?.includes(d.id);
        const isNear = nearestAppliance === d.id;
        return (
          <group key={d.id} position={lp}>
            {/* Platform */}
            <mesh position={[0, -0.3, 0]}><boxGeometry args={[2.4, 0.15, 2.4]} /><meshStandardMaterial color={done ? '#1a5a2a' : '#555'} metalness={0.4} /></mesh>
            <mesh position={[0, -0.4, 0]}><boxGeometry args={[2.6, 0.1, 2.6]} /><meshStandardMaterial color={done ? '#0a3a1a' : '#444'} metalness={0.5} /></mesh>

            {/* Distinct appliance model per type */}
            {d.id === 'shop_fridge' && (<group>
              <mesh position={[0, 0.9, 0]}><boxGeometry args={[1.0, 1.8, 0.8]} /><meshStandardMaterial color={done ? '#a8d8b8' : '#ddd'} metalness={0.3} /></mesh>
              <mesh position={[0, 0.15, 0]}><boxGeometry args={[1.0, 0.7, 0.8]} /><meshStandardMaterial color={done ? '#88b898' : '#ccc'} metalness={0.3} /></mesh>
              <mesh position={[0.4, 0.9, -0.42]}><boxGeometry args={[0.08, 0.3, 0.02]} /><meshStandardMaterial color="#888" metalness={0.6} /></mesh>
              <mesh position={[0.4, 0.15, -0.42]}><boxGeometry args={[0.08, 0.2, 0.02]} /><meshStandardMaterial color="#888" metalness={0.6} /></mesh>
            </group>)}
            {d.id === 'shop_ac' && (<group>
              <mesh position={[0, 1.4, 0]}><boxGeometry args={[1.6, 0.5, 0.4]} /><meshStandardMaterial color={done ? '#a8d8f0' : '#eee'} metalness={0.2} /></mesh>
              <mesh position={[0, 1.2, 0.05]}><boxGeometry args={[1.4, 0.1, 0.3]} /><meshStandardMaterial color={done ? '#78b8d0' : '#ddd'} /></mesh>
              {/* Vents */}
              {[-0.5, -0.2, 0.1, 0.4].map((vx, i) => <mesh key={i} position={[vx, 1.1, 0.15]}><boxGeometry args={[0.2, 0.02, 0.05]} /><meshStandardMaterial color="#999" /></mesh>)}
              {/* Stand/pole */}
              <mesh position={[0, 0.5, 0]}><cylinderGeometry args={[0.06, 0.08, 1.0, 6]} /><meshStandardMaterial color="#888" metalness={0.5} /></mesh>
            </group>)}
            {d.id === 'shop_fan' && (<group>
              {/* Motor hub */}
              <mesh position={[0, 1.4, 0]}><cylinderGeometry args={[0.15, 0.15, 0.15, 12]} /><meshStandardMaterial color={done ? '#4a8a5a' : '#aaa'} metalness={0.5} /></mesh>
              {/* Blades */}
              {[0, 1.2, 2.4].map((a, i) => <mesh key={i} position={[Math.cos(a)*0.55, 1.4, Math.sin(a)*0.55]} rotation={[0, -a, 0]}><boxGeometry args={[0.8, 0.04, 0.15]} /><meshStandardMaterial color={done ? '#3a7a4a' : '#bbb'} /></mesh>)}
              {/* Rod */}
              <mesh position={[0, 1.8, 0]}><cylinderGeometry args={[0.03, 0.03, 0.6, 6]} /><meshStandardMaterial color="#888" /></mesh>
              {/* Display stand */}
              <mesh position={[0, 0.5, 0]}><cylinderGeometry args={[0.08, 0.12, 1.0, 8]} /><meshStandardMaterial color="#666" metalness={0.5} /></mesh>
            </group>)}
            {d.id === 'shop_washer' && (<group>
              {/* Washer drum */}
              <mesh position={[0, 0.6, 0]}><boxGeometry args={[1.0, 1.0, 0.8]} /><meshStandardMaterial color={done ? '#a8d8b8' : '#ddd'} metalness={0.2} /></mesh>
              {/* Door circle */}
              <mesh position={[0, 0.6, -0.42]}><cylinderGeometry args={[0.3, 0.3, 0.02, 16]} /><meshStandardMaterial color={done ? '#78b898' : '#bbb'} metalness={0.4} /></mesh>
              {/* Control panel */}
              <mesh position={[0, 1.15, -0.15]}><boxGeometry args={[0.9, 0.15, 0.4]} /><meshStandardMaterial color={done ? '#5a8a6a' : '#999'} /></mesh>
            </group>)}
            {d.id === 'shop_label' && (<group>
              {/* BEE Label display board */}
              <mesh position={[0, 1.2, 0]}><boxGeometry args={[1.2, 1.6, 0.15]} /><meshStandardMaterial color="#f5f0e0" /></mesh>
              <mesh position={[0, 1.2, -0.08]}><boxGeometry args={[1.0, 1.4, 0.02]} /><meshStandardMaterial color="#fff8e0" /></mesh>
              {/* Stars on label */}
              {[-0.3, -0.1, 0.1, 0.3].map((sx, i) => <mesh key={i} position={[sx, 1.6, -0.1]}><boxGeometry args={[0.12, 0.12, 0.03]} /><meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.3} /></mesh>)}
              {/* Stand */}
              <mesh position={[0, 0.3, 0]}><cylinderGeometry args={[0.06, 0.1, 0.6, 8]} /><meshStandardMaterial color="#666" metalness={0.5} /></mesh>
            </group>)}

            {/* Label */}
            <Html position={[0, 2.3, 0]} center>
              <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'4px',pointerEvents:'none'}}>
                <div style={{background:done?'rgba(34,197,94,0.9)':'rgba(0,0,0,0.85)',color:'#fff',padding:'4px 14px',borderRadius:'10px',fontSize:'12px',fontWeight:700,whiteSpace:'nowrap',fontFamily:'Nunito',boxShadow:'0 2px 8px rgba(0,0,0,0.3)'}}>
                  {d.icon} {d.name}
                </div>
                {isNear && !done && <div style={{background:'rgba(245,158,11,0.95)',color:'#fff',padding:'5px 14px',borderRadius:'8px',fontSize:'12px',fontWeight:700,whiteSpace:'nowrap',fontFamily:'Nunito',boxShadow:'0 2px 12px rgba(245,158,11,0.4)',animation:'l5-pulse-glow 2s ease infinite'}}>
                  Press <span style={{background:'rgba(255,255,255,0.3)',padding:'2px 7px',borderRadius:'4px',fontWeight:800}}>E</span> to inspect
                </div>}
                {done && <div style={{color:'#22c55e',fontSize:'18px',filter:'drop-shadow(0 0 4px rgba(34,197,94,0.5))'}}>{'✅'}</div>}
              </div>
            </Html>
          </group>
        );
      })}

      {/* ─── Path leading to shop entrance ─── */}
      <mesh rotation={[-Math.PI/2,0,0]} position={[0, -0.02, -12]}><planeGeometry args={[4, 8]} /><meshStandardMaterial color="#7a6a5a" /></mesh>
    </group>
  );
}

// ═══ ZONE MARKERS ═══
function ZoneMarkers() {
  return (<group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}><ringGeometry args={[11, 11.2, 32]} /><meshBasicMaterial color="#3b82f6" transparent opacity={0.15} /></mesh>
  </group>);
}

// ═══ NEIGHBOR HOUSES ═══
function Neighbors() {
  const houses = [
    { pos: [-22, 0, -15], rot: 0.3 }, { pos: [-25, 0, 10], rot: 0.5 },
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

// ═══ BIOGAS PLANT ═══
function BiogasPlant({ visible, isNear, visited }) {
  if (!visible) return null;
  return (
    <group position={[-8, 0, 12]}>
      {/* Underground dome */}
      <mesh position={[0, -0.3, 0]}><sphereGeometry args={[1.8, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color="#2a5a3a" metalness={0.3} roughness={0.7} /></mesh>
      {/* Dome cap above ground */}
      <mesh position={[0, 0.6, 0]}><sphereGeometry args={[1.2, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color="#1a4a2a" metalness={0.4} roughness={0.5} /></mesh>
      {/* Inlet pipe */}
      <mesh position={[-2.2, 0.2, 0]} rotation={[0, 0, Math.PI / 6]}><cylinderGeometry args={[0.12, 0.12, 1.5, 8]} /><meshStandardMaterial color="#22c55e" /></mesh>
      {/* Outlet pipe */}
      <mesh position={[2.2, 0.2, 0]} rotation={[0, 0, -Math.PI / 6]}><cylinderGeometry args={[0.12, 0.12, 1.5, 8]} /><meshStandardMaterial color="#f97316" /></mesh>
      {/* Gas pipe going up */}
      <mesh position={[0, 1.2, 0]}><cylinderGeometry args={[0.08, 0.08, 1.0, 8]} /><meshStandardMaterial color="#f59e0b" /></mesh>
      {/* Gas valve */}
      <mesh position={[0, 1.7, 0]}><boxGeometry args={[0.3, 0.15, 0.15]} /><meshStandardMaterial color="#f59e0b" metalness={0.6} /></mesh>
      {/* Ground ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}><ringGeometry args={[1.9, 2.2, 24]} /><meshStandardMaterial color="#22c55e" transparent opacity={0.2} /></mesh>
      {/* Label */}
      <Html position={[0, 2.5, 0]} center>
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'4px',pointerEvents:'none'}}>
          <div style={{background:'rgba(34,197,94,0.9)',color:'#fff',padding:'5px 14px',borderRadius:'10px',fontSize:'12px',fontWeight:700,whiteSpace:'nowrap',fontFamily:'Nunito',boxShadow:'0 2px 12px rgba(34,197,94,0.4)'}}>
            {'\u267B\uFE0F'} Biogas Plant
          </div>
          {isNear && !visited && <div style={{background:'rgba(34,197,94,0.95)',color:'#fff',padding:'5px 14px',borderRadius:'8px',fontSize:'12px',fontWeight:700,whiteSpace:'nowrap',fontFamily:'Nunito',boxShadow:'0 2px 12px rgba(34,197,94,0.4)',animation:'l5-pulse-glow 2s ease infinite'}}>
            Press <span style={{background:'rgba(255,255,255,0.3)',padding:'2px 7px',borderRadius:'4px',fontWeight:800}}>E</span> to inspect
          </div>}
          {visited && <div style={{color:'#22c55e',fontSize:'18px',filter:'drop-shadow(0 0 4px rgba(34,197,94,0.5))'}}>{'✅'}</div>}
        </div>
      </Html>
    </group>
  );
}

// ═══ MAIN ENVIRONMENT ═══
export default function Level5Environment({ timeOfDay = 'noon', batteryPct = 50, weatherFactor = 1.0, nearestAppliance = null, storyStage = 'discover', meterVisited = false, newspaperPickedUp = false, shopVisible = false, inspectedDisplays = [], roofVisited = false, biogasVisited = false }) {
  const showAgedPanels = ['roof','phase2','biogas','phase3','quiz'].includes(storyStage);
  const showBiogas = ['biogas','phase3','quiz'].includes(storyStage);
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
    <RoofPanels weatherFactor={weatherFactor} showAged={showAgedPanels} isNear={nearestAppliance === 'roof_panels'} roofVisited={roofVisited} />
    <BatteryUnit batteryPct={batteryPct} />
    <ZoneMarkers />
    {/* Story objects */}
    <ElectricityMeter isNear={nearestAppliance === 'electricity_meter'} visited={meterVisited} />
    <Newspaper isNear={nearestAppliance === 'newspaper'} visible={storyStage === 'newspaper' || newspaperPickedUp} pickedUp={newspaperPickedUp} />
    <TeacherNPC visible={meterVisited && (storyStage === 'discover' || storyStage === 'teacher' || storyStage === 'newspaper')} />
    <ApplianceShop visible={shopVisible} nearestAppliance={nearestAppliance} inspectedDisplays={inspectedDisplays} />
    <BiogasPlant visible={showBiogas} isNear={nearestAppliance === 'biogas_plant'} visited={biogasVisited} />
  </>);
}
