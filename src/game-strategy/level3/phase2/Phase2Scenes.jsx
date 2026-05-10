// ═══════════════════════════════════════════════════════════
//  LEVEL 3 PHASE 2 — Unified House-Centric 3D Scene
//  All segments share the SAME house environment
// ═══════════════════════════════════════════════════════════
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function lerpC(a, b, t) {
  const ca = new THREE.Color(a), cb = new THREE.Color(b);
  ca.lerp(cb, Math.max(0, Math.min(1, t)));
  return ca;
}

// ─── THE HOUSE — Import the REAL house from Level 1 for visual continuity ───
import RealHouse from '../../House';

// Wrapper that renders the real house + opaque roof for aerial view
export function House({ damageLevel = 0.8 }) {
  return (
    <group>
      <RealHouse />
      {/* Opaque flat roof overlay — visible from Phase 2's aerial camera */}
      <mesh position={[0, 3.15, 0]}>
        <boxGeometry args={[20.5, 0.12, 16.5]} />
        <meshStandardMaterial color="#8B4513" roughness={0.7} />
      </mesh>
      {/* Roof edge trim */}
      <mesh position={[0, 3.25, -8.2]}><boxGeometry args={[20.8, 0.2, 0.15]} /><meshStandardMaterial color="#6b4520" roughness={0.6} /></mesh>
      <mesh position={[0, 3.25, 8.2]}><boxGeometry args={[20.8, 0.2, 0.15]} /><meshStandardMaterial color="#6b4520" roughness={0.6} /></mesh>
      <mesh position={[-10.3, 3.25, 0]}><boxGeometry args={[0.15, 0.2, 16.8]} /><meshStandardMaterial color="#6b4520" roughness={0.6} /></mesh>
      <mesh position={[10.3, 3.25, 0]}><boxGeometry args={[0.15, 0.2, 16.8]} /><meshStandardMaterial color="#6b4520" roughness={0.6} /></mesh>
    </group>
  );
}

// ─── ENVIRONMENT — sky dome + lighting (ground provided by House.jsx) ───
export function HouseEnvironment({ greenLevel = 0, segment = 'trees' }) {
  const skyColor = useMemo(() => lerpC('#a07050', '#87CEEB', greenLevel), [greenLevel]);

  return (
    <group>
      {/* Sky dome */}
      <mesh><sphereGeometry args={[100, 16, 16]} /><meshBasicMaterial color={skyColor} side={THREE.BackSide} /></mesh>
      {/* STRONG lighting — must be visible */}
      <ambientLight intensity={1.0 + greenLevel * 0.5} color="#ffe8cc" />
      <directionalLight position={[8, 12, 5]} intensity={1.8 + greenLevel * 0.8} color="#ffd699" />
      <directionalLight position={[-6, 10, -4]} intensity={0.6} color="#ffeedd" />
      <hemisphereLight args={['#ffecd2', '#4a6a3a', 0.6]} />
      <pointLight position={[0, 6, 8]} intensity={0.8} distance={30} color="#ffcc88" />
      <pointLight position={[0, 3, -8]} intensity={0.4} distance={25} color="#ffeedd" />
    </group>
  );
}

// ─── DUST PARTICLES (pollution effect) ───
export function DustParticles({ intensity = 1 }) {
  const groupRef = useRef();
  const particles = useMemo(() =>
    Array.from({ length: 25 }, () => ({
      x: (Math.random() - 0.5) * 40, y: Math.random() * 8, z: (Math.random() - 0.5) * 40,
      speed: 0.2 + Math.random() * 0.5, size: 0.3 + Math.random() * 0.8,
    })), []);

  useFrame((_, delta) => {
    if (!groupRef.current || intensity < 0.1) return;
    groupRef.current.children.forEach((child, i) => {
      const p = particles[i]; if (!p) return;
      child.position.y += p.speed * delta;
      child.position.x += Math.sin(performance.now() * 0.0005 + i) * 0.01;
      if (child.position.y > 12) { child.position.y = 0; child.position.x = (Math.random() - 0.5) * 40; }
      child.material.opacity = Math.min(0.25, intensity * 0.3);
    });
  });

  if (intensity < 0.1) return null;
  return (
    <group ref={groupRef}>
      {particles.map((p, i) => (
        <mesh key={i} position={[p.x, p.y, p.z]}>
          <sphereGeometry args={[p.size, 6, 6]} />
          <meshBasicMaterial color="#997755" transparent opacity={0.2} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

// ─── GROWING TREE ───
export function GrowingTree({ position, growthPhase = 0, absorbing = false }) {
  const canopyRef = useRef();
  const glowRef = useRef();
  const canopySize = Math.max(0.1, growthPhase * 0.35);
  const trunkH = Math.max(0.1, growthPhase * 0.6);

  useFrame(() => {
    if (canopyRef.current && growthPhase > 0) {
      const t = performance.now() * 0.001;
      canopyRef.current.rotation.y = Math.sin(t * 0.5) * 0.02;
      if (absorbing && glowRef.current) glowRef.current.material.emissiveIntensity = 0.3 + Math.sin(t * 2) * 0.2;
    }
  });

  return (
    <group position={position}>
      {growthPhase === 0 && (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.3, 12]} /><meshStandardMaterial color="#3a2510" roughness={1} />
        </mesh>
      )}
      {growthPhase > 0 && (
        <mesh position={[0, trunkH / 2, 0]}>
          <cylinderGeometry args={[0.05 + growthPhase * 0.02, 0.08 + growthPhase * 0.03, trunkH, 8]} />
          <meshStandardMaterial color="#8B4513" roughness={0.8} />
        </mesh>
      )}
      {growthPhase >= 2 && (
        <mesh ref={canopyRef} position={[0, trunkH + canopySize * 0.6, 0]}>
          <sphereGeometry args={[canopySize, 10, 10]} />
          <meshStandardMaterial color={growthPhase >= 4 ? '#228B22' : '#6B8E23'} roughness={0.7} />
        </mesh>
      )}
      {growthPhase === 1 && (
        <mesh position={[0, 0.3, 0]}><coneGeometry args={[0.08, 0.2, 6]} /><meshStandardMaterial color="#4CAF50" roughness={0.7} /></mesh>
      )}
      {absorbing && growthPhase >= 3 && (
        <mesh ref={glowRef} position={[0, trunkH + canopySize * 0.6, 0]}>
          <sphereGeometry args={[canopySize + 0.3, 8, 8]} />
          <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.3} transparent opacity={0.15} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}

// ─── CO2 / O2 PARTICLES ───
export function CO2Particles({ active, treePositions = [] }) {
  const groupRef = useRef();
  const particles = useMemo(() =>
    Array.from({ length: 30 }, () => ({
      x: (Math.random() - 0.5) * 20, y: 1 + Math.random() * 4, z: (Math.random() - 0.5) * 20,
      speed: 0.5 + Math.random() * 1,
      targetIdx: Math.floor(Math.random() * Math.max(1, treePositions.length)),
    })), [treePositions.length]);

  useFrame((_, delta) => {
    if (!groupRef.current || !active) return;
    groupRef.current.children.forEach((child, i) => {
      const p = particles[i]; if (!p || !treePositions[p.targetIdx]) return;
      const target = treePositions[p.targetIdx];
      const dx = target[0] - child.position.x, dy = (target[1] || 2) - child.position.y, dz = target[2] - child.position.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (dist < 0.5) child.position.set((Math.random() - 0.5) * 20, 1 + Math.random() * 4, (Math.random() - 0.5) * 20);
      else { child.position.x += (dx / dist) * p.speed * delta; child.position.y += (dy / dist) * p.speed * delta; child.position.z += (dz / dist) * p.speed * delta; }
      child.material.opacity = Math.min(0.6, dist * 0.1);
    });
  });

  if (!active) return null;
  return (
    <group ref={groupRef}>
      {particles.map((p, i) => (
        <mesh key={i} position={[p.x, p.y, p.z]}><sphereGeometry args={[0.12, 6, 6]} /><meshBasicMaterial color="#888" transparent opacity={0.4} depthWrite={false} /></mesh>
      ))}
    </group>
  );
}

export function O2Particles({ active, treePositions = [] }) {
  const groupRef = useRef();
  const particles = useMemo(() =>
    Array.from({ length: 15 }, () => ({
      srcIdx: Math.floor(Math.random() * Math.max(1, treePositions.length)),
      offsetX: (Math.random() - 0.5) * 2, speed: 0.3 + Math.random() * 0.5, phase: Math.random() * Math.PI * 2,
    })), [treePositions.length]);

  useFrame((_, delta) => {
    if (!groupRef.current || !active) return;
    groupRef.current.children.forEach((child, i) => {
      const p = particles[i]; if (!p) return;
      child.position.y += p.speed * delta;
      child.position.x += Math.sin(performance.now() * 0.001 + p.phase) * 0.01;
      if (child.position.y > 8) { const src = treePositions[p.srcIdx] || [0, 3, 0]; child.position.set(src[0] + p.offsetX, src[1] || 3, src[2] + (Math.random() - 0.5)); }
    });
  });

  if (!active) return null;
  return (
    <group ref={groupRef}>
      {particles.map((p, i) => {
        const src = treePositions[p.srcIdx] || [0, 3, 0];
        return (<mesh key={i} position={[src[0], src[1] || 3, src[2]]}><sphereGeometry args={[0.08, 6, 6]} /><meshBasicMaterial color="#4ade80" transparent opacity={0.5} depthWrite={false} /></mesh>);
      })}
    </group>
  );
}

export function PlantSpot({ position, active = false }) {
  const meshRef = useRef();
  useFrame(() => {
    if (meshRef.current && active) {
      meshRef.current.material.emissiveIntensity = 0.5 + Math.sin(performance.now() * 0.003) * 0.3;
    }
  });
  return (
    <group position={position}>
      <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[0.25, 0.35, 16]} />
        <meshStandardMaterial color={active ? '#22c55e' : '#666'} emissive={active ? '#22c55e' : '#000'} emissiveIntensity={active ? 0.5 : 0} side={THREE.DoubleSide} />
      </mesh>
      {active && (<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}><ringGeometry args={[0.4, 0.42, 16]} /><meshBasicMaterial color="#22c55e" transparent opacity={0.3} depthWrite={false} side={THREE.DoubleSide} /></mesh>)}
    </group>
  );
}

// ─── REALISTIC SOLAR PANEL (Level 4 quality) ───
export function SolarPanel({ position, placed = false, glowing = false, angle = 0 }) {
  const flowRef = useRef();
  useFrame(() => { if (flowRef.current && glowing) { flowRef.current.material.emissiveIntensity = 0.5 + Math.sin(performance.now() * 0.006) * 0.3; } });

  if (!placed) return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}><planeGeometry args={[1.4, 0.9]} /><meshStandardMaterial color="#ddd" transparent opacity={0.3} side={THREE.DoubleSide} /></mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}><ringGeometry args={[0.5, 0.55, 4]} /><meshBasicMaterial color="#f59e0b" transparent opacity={0.5} side={THREE.DoubleSide} /></mesh>
    </group>
  );

  return (
    <group position={position} rotation={[0, (angle * Math.PI) / 180, 0]}>
      {/* Aluminum frame */}
      <mesh position={[0, 0.14, 0]} rotation={[-0.44, 0, 0]}>
        <boxGeometry args={[1.35, 0.05, 0.85]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.8} roughness={0.25} />
      </mesh>
      {/* Dark photovoltaic surface */}
      <mesh position={[0, 0.17, 0]} rotation={[-0.44, 0, 0]}>
        <boxGeometry args={[1.25, 0.02, 0.75]} />
        <meshStandardMaterial color="#0d1b3e" metalness={0.6} roughness={0.2} />
      </mesh>
      {/* Cell grid lines (silver strips) */}
      {[-0.4, -0.2, 0, 0.2, 0.4].map((offX, i) => (
        <mesh key={`h${i}`} position={[offX, 0.185, 0]} rotation={[-0.44, 0, 0]}>
          <boxGeometry args={[0.008, 0.005, 0.72]} />
          <meshStandardMaterial color="#888" metalness={0.9} roughness={0.2} />
        </mesh>
      ))}
      {[-0.2, 0, 0.2].map((offZ, i) => (
        <mesh key={`v${i}`} position={[0, 0.185, offZ]} rotation={[-0.44, 0, 0]}>
          <boxGeometry args={[1.22, 0.005, 0.008]} />
          <meshStandardMaterial color="#888" metalness={0.9} roughness={0.2} />
        </mesh>
      ))}
      {/* Glass surface overlay */}
      <mesh position={[0, 0.19, 0]} rotation={[-0.44, 0, 0]}>
        <boxGeometry args={[1.24, 0.005, 0.74]} />
        <meshStandardMaterial color="#1a237e" transparent opacity={0.15} metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Mounting bracket legs */}
      <mesh position={[-0.3, 0.06, 0.25]}><cylinderGeometry args={[0.02, 0.02, 0.12, 6]} /><meshStandardMaterial color="#999" metalness={0.7} roughness={0.3} /></mesh>
      <mesh position={[0.3, 0.06, 0.25]}><cylinderGeometry args={[0.02, 0.02, 0.12, 6]} /><meshStandardMaterial color="#999" metalness={0.7} roughness={0.3} /></mesh>
      <mesh position={[-0.3, 0.12, -0.15]}><cylinderGeometry args={[0.02, 0.02, 0.24, 6]} /><meshStandardMaterial color="#999" metalness={0.7} roughness={0.3} /></mesh>
      <mesh position={[0.3, 0.12, -0.15]}><cylinderGeometry args={[0.02, 0.02, 0.24, 6]} /><meshStandardMaterial color="#999" metalness={0.7} roughness={0.3} /></mesh>
      {/* Energy glow when active */}
      {glowing && (<mesh ref={flowRef} position={[0, 0.22, 0]} rotation={[-0.44, 0, 0]}><boxGeometry args={[1.4, 0.1, 0.9]} /><meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={0.5} transparent opacity={0.15} depthWrite={false} /></mesh>)}
    </group>
  );
}

export function AnimatedSun({ progress = 0 }) {
  const sunRef = useRef();
  const angle = -Math.PI * 0.8 + progress * Math.PI * 1.6;
  const x = Math.cos(angle) * 25, y = Math.sin(angle) * 20 + 5;
  useFrame(() => { if (sunRef.current) sunRef.current.material.emissiveIntensity = 1.5 + Math.sin(performance.now() * 0.001) * 0.3; });
  return (
    <group>
      <mesh ref={sunRef} position={[x, Math.max(2, y), -10]}><sphereGeometry args={[2, 12, 12]} /><meshStandardMaterial color="#ffd700" emissive="#ff8c00" emissiveIntensity={1.5} /></mesh>
      <pointLight position={[x, Math.max(2, y), -10]} intensity={Math.max(0, y / 20)} distance={60} color="#ffd699" />
    </group>
  );
}

export function EnergyFlowLines({ active, panelPositions = [] }) {
  const groupRef = useRef();
  useFrame(() => { if (!groupRef.current || !active) return; groupRef.current.children.forEach(c => { c.material.opacity = 0.3 + Math.sin(performance.now() * 0.005 + c.position.x) * 0.2; }); });
  if (!active) return null;
  return (
    <group ref={groupRef}>
      {panelPositions.map((pos, i) => (<mesh key={i} position={[pos[0], pos[1] - 0.5, pos[2]]}><cylinderGeometry args={[0.02, 0.02, 1, 6]} /><meshBasicMaterial color="#ffd700" transparent opacity={0.4} /></mesh>))}
    </group>
  );
}

// ─── WindTurbine (rooftop) — REMOVED ───
// All turbines are now FieldWindTurbine in the open field.
// This export is kept as a no-op for any stale imports.
export function WindTurbine() { return null; }


export function WindParticles({ windSpeed = 0 }) {
  const groupRef = useRef();
  const particles = useMemo(() => Array.from({ length: 30 }, () => ({ x: (Math.random() - 0.5) * 30, y: 0.5 + Math.random() * 6, z: (Math.random() - 0.5) * 30 })), []);
  useFrame((_, delta) => {
    if (!groupRef.current || windSpeed < 1) return;
    groupRef.current.children.forEach(child => {
      child.position.x += windSpeed * 0.8 * delta;
      if (child.position.x > 15) { child.position.x = -15; child.position.y = 0.5 + Math.random() * 6; child.position.z = (Math.random() - 0.5) * 30; }
      child.material.opacity = Math.min(0.4, windSpeed * 0.05);
    });
  });
  return (
    <group ref={groupRef}>
      {particles.map((p, i) => (<mesh key={i} position={[p.x, p.y, p.z]}><boxGeometry args={[0.3, 0.02, 0.02]} /><meshBasicMaterial color="#fff" transparent opacity={0.2} depthWrite={false} /></mesh>))}
    </group>
  );
}

// ─── BIRDS (appear as greenLevel increases) ───
export function Birds({ count = 6, active = false }) {
  const groupRef = useRef();
  const birds = useMemo(() => Array.from({ length: count }, (_, i) => ({
    x: (Math.random() - 0.5) * 30, y: 8 + Math.random() * 6, z: (Math.random() - 0.5) * 30,
    speed: 1.5 + Math.random() * 2, wingPhase: Math.random() * Math.PI * 2, radius: 8 + Math.random() * 12,
    angleOffset: (i / count) * Math.PI * 2,
  })), [count]);

  useFrame(() => {
    if (!groupRef.current || !active) return;
    const t = performance.now() * 0.001;
    groupRef.current.children.forEach((bird, i) => {
      const b = birds[i]; if (!b) return;
      const angle = t * 0.2 * b.speed + b.angleOffset;
      bird.position.x = Math.cos(angle) * b.radius;
      bird.position.z = Math.sin(angle) * b.radius;
      bird.position.y = b.y + Math.sin(t * 1.5 + i) * 0.5;
      bird.rotation.y = -angle + Math.PI / 2;
      // Wing flap
      if (bird.children[0]) bird.children[0].rotation.z = Math.sin(t * 8 + b.wingPhase) * 0.4;
      if (bird.children[1]) bird.children[1].rotation.z = -Math.sin(t * 8 + b.wingPhase) * 0.4;
    });
  });

  if (!active) return null;
  return (
    <group ref={groupRef}>
      {birds.map((_, i) => (
        <group key={i}>
          <mesh position={[0.15, 0, 0]} rotation={[0, 0, 0]}><boxGeometry args={[0.3, 0.02, 0.12]} /><meshStandardMaterial color="#333" /></mesh>
          <mesh position={[-0.15, 0, 0]} rotation={[0, 0, 0]}><boxGeometry args={[0.3, 0.02, 0.12]} /><meshStandardMaterial color="#333" /></mesh>
          <mesh><sphereGeometry args={[0.06, 6, 6]} /><meshStandardMaterial color="#222" /></mesh>
        </group>
      ))}
    </group>
  );
}

// ─── GRASS PATCHES (growing with greenLevel) ───
export function GrassPatches({ greenLevel = 0 }) {
  const patches = useMemo(() => Array.from({ length: 40 }, () => ({
    x: (Math.random() - 0.5) * 35, z: (Math.random() - 0.5) * 35,
    scale: 0.3 + Math.random() * 0.5, rot: Math.random() * Math.PI,
  })), []);

  if (greenLevel < 0.1) return null;
  return (
    <group>
      {patches.map((p, i) => (
        <mesh key={i} position={[p.x, greenLevel * p.scale * 0.3, p.z]} rotation={[0, p.rot, 0]} scale={[1, greenLevel, 1]}>
          <coneGeometry args={[0.08 * p.scale, 0.4 * p.scale, 4]} />
          <meshStandardMaterial color={greenLevel > 0.5 ? '#2d8a3e' : '#6b8e23'} roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

// ─── DEBRIS OBJECTS (for cleanup task) ───
export function DebrisObjects({ positions = [], cleared = [] }) {
  return (
    <group>
      {positions.map((pos, i) => {
        if (cleared.includes(i)) return null;
        const type = i % 3;
        return (
          <group key={i} position={pos}>
            {type === 0 && <mesh rotation={[0.3, 0.5, 0]}><boxGeometry args={[0.4, 0.15, 0.3]} /><meshStandardMaterial color="#8B7355" roughness={0.9} /></mesh>}
            {type === 1 && <mesh rotation={[0.1, 0.8, 0.2]}><cylinderGeometry args={[0.1, 0.12, 0.25, 6]} /><meshStandardMaterial color="#666" roughness={0.5} metalness={0.3} /></mesh>}
            {type === 2 && <mesh><sphereGeometry args={[0.12, 6, 6]} /><meshStandardMaterial color="#9CA3AF" roughness={0.4} transparent opacity={0.7} /></mesh>}
            {/* Glow ring for interaction */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
              <ringGeometry args={[0.2, 0.28, 12]} />
              <meshBasicMaterial color="#f59e0b" transparent opacity={0.4 + Math.sin(Date.now() * 0.003) * 0.2} side={THREE.DoubleSide} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

// ─── ENHANCED FIELD WIND TURBINE ───
export function FieldWindTurbine({ position, installed = false, windSpeed = 0 }) {
  const bladeRef = useRef();
  const lightRef = useRef();
  useFrame((_, delta) => {
    if (bladeRef.current && installed) bladeRef.current.rotation.z += windSpeed * 0.12 * delta;
    if (lightRef.current && installed) {
      lightRef.current.material.emissiveIntensity = Math.sin(performance.now() * 0.003) > 0 ? 1.5 : 0;
    }
  });

  if (!installed) return (
    <group position={position}>
      {/* Octagonal foundation pad placeholder */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}><circleGeometry args={[1.5, 8]} /><meshStandardMaterial color="#555" transparent opacity={0.25} /></mesh>
      <mesh position={[0, 0.15, 0]}><cylinderGeometry args={[0.8, 1.0, 0.3, 8]} /><meshStandardMaterial color="#777" roughness={0.6} /></mesh>
    </group>
  );

  return (
    <group position={position}>
      {/* Octagonal concrete foundation */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}><circleGeometry args={[1.5, 8]} /><meshStandardMaterial color="#9ca3af" roughness={0.9} /></mesh>
      <mesh position={[0, 0.15, 0]}><cylinderGeometry args={[0.8, 1.0, 0.3, 8]} /><meshStandardMaterial color="#888" roughness={0.5} /></mesh>
      {/* Tapered tower */}
      <mesh position={[0, 4, 0]}><cylinderGeometry args={[0.1, 0.3, 7.5, 8]} /><meshStandardMaterial color="#e8e8e8" roughness={0.3} metalness={0.5} /></mesh>
      {/* Nacelle — rounded housing */}
      <mesh position={[0, 7.8, 0.2]}><boxGeometry args={[0.45, 0.35, 0.9]} /><meshStandardMaterial color="#ddd" roughness={0.3} metalness={0.4} /></mesh>
      <mesh position={[0, 7.8, 0.7]}><sphereGeometry args={[0.18, 8, 8]} /><meshStandardMaterial color="#ccc" metalness={0.5} /></mesh>
      {/* Tapered blades */}
      <group ref={bladeRef} position={[0, 7.8, 0.85]}>
        {[0, 120, 240].map((a, i) => (
          <group key={i} rotation={[0, 0, (a * Math.PI) / 180]}>
            <mesh position={[0, 1.0, 0]}><boxGeometry args={[0.14, 1.2, 0.025]} /><meshStandardMaterial color="#f5f5f5" roughness={0.3} /></mesh>
            <mesh position={[0, 2.3, 0]}><boxGeometry args={[0.09, 1.4, 0.02]} /><meshStandardMaterial color="#f5f5f5" roughness={0.3} /></mesh>
            <mesh position={[0, 3.3, 0]}><boxGeometry args={[0.05, 0.6, 0.015]} /><meshStandardMaterial color="#fafafa" roughness={0.3} /></mesh>
          </group>
        ))}
      </group>
      {/* Red aviation warning light */}
      <mesh ref={lightRef} position={[0, 8.05, 0]}>
        <sphereGeometry args={[0.06, 6, 6]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={1.5} />
      </mesh>
      {/* Power cable running toward house */}
      <mesh position={[position[0] > 0 ? -2 : 2, 0.05, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.02, 0.02, 4, 4]} />
        <meshStandardMaterial color="#333" roughness={0.8} />
      </mesh>
      {windSpeed > 3 && <pointLight position={[0, 8.2, 0]} intensity={windSpeed * 0.06} distance={10} color="#4ade80" />}
    </group>
  );
}

// ─── HOTSPOT MARKER (glowing interactive point) ───
export function HotspotMarker({ position, active = false, color = '#f59e0b' }) {
  const ref = useRef();
  useFrame(() => {
    if (ref.current && active) {
      const t = performance.now() * 0.003;
      ref.current.scale.setScalar(1 + Math.sin(t) * 0.15);
      ref.current.material.emissiveIntensity = 0.5 + Math.sin(t * 2) * 0.3;
    }
  });
  if (!active) return null;
  return (
    <group position={position}>
      <mesh ref={ref}><sphereGeometry args={[0.25, 12, 12]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} transparent opacity={0.6} /></mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]}><ringGeometry args={[0.3, 0.5, 16]} /><meshBasicMaterial color={color} transparent opacity={0.3} side={THREE.DoubleSide} /></mesh>
    </group>
  );
}

// ─── BATTERY UNIT (on ground near house) ───
export function BatteryUnit({ position = [5, 0, 4], chargeLevel = 0, active = false }) {
  const glowRef = useRef();
  useFrame(() => {
    if (glowRef.current && active) glowRef.current.material.emissiveIntensity = 0.3 + Math.sin(performance.now() * 0.004) * 0.2;
  });
  return (
    <group position={position}>
      <mesh position={[0, 0.5, 0]}><boxGeometry args={[0.8, 1.0, 0.5]} /><meshStandardMaterial color="#374151" roughness={0.4} metalness={0.5} /></mesh>
      <mesh position={[0, 0.5, 0.26]}><boxGeometry args={[0.6, 0.8 * Math.max(0.01, chargeLevel), 0.02]} /><meshStandardMaterial color={chargeLevel > 0.6 ? '#22c55e' : chargeLevel > 0.3 ? '#f59e0b' : '#ef4444'} emissive={chargeLevel > 0.6 ? '#22c55e' : '#f59e0b'} emissiveIntensity={0.3} /></mesh>
      {active && <mesh ref={glowRef} position={[0, 0.5, 0]}><boxGeometry args={[0.9, 1.1, 0.6]} /><meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.3} transparent opacity={0.1} depthWrite={false} /></mesh>}
    </group>
  );
}

// ─── INVERTER BOX (wall-mounted) ───
export function InverterBox({ position = [5, 1.8, -8] }) {
  const ledRef = useRef();
  useFrame(() => {
    if (ledRef.current) ledRef.current.material.emissiveIntensity = 0.5 + Math.sin(performance.now() * 0.005) * 0.3;
  });
  return (
    <group position={position}>
      <mesh><boxGeometry args={[0.6, 0.8, 0.2]} /><meshStandardMaterial color="#4b5563" roughness={0.4} metalness={0.6} /></mesh>
      {/* LED indicators */}
      <mesh ref={ledRef} position={[-0.15, 0.2, 0.11]}><sphereGeometry args={[0.03, 6, 6]} /><meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.5} /></mesh>
      <mesh position={[0, 0.2, 0.11]}><sphereGeometry args={[0.03, 6, 6]} /><meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.3} /></mesh>
      <mesh position={[0.15, 0.2, 0.11]}><sphereGeometry args={[0.03, 6, 6]} /><meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.3} /></mesh>
      {/* Label */}
      <mesh position={[0, -0.1, 0.11]}><boxGeometry args={[0.4, 0.15, 0.01]} /><meshStandardMaterial color="#1f2937" roughness={0.5} /></mesh>
    </group>
  );
}

// ─── POWER CABLE (visible connection line) ───
export function PowerCable({ from = [0, 3, 0], to = [5, 1.5, 4] }) {
  const ref = useRef();
  useFrame(() => {
    if (ref.current) ref.current.material.opacity = 0.4 + Math.sin(performance.now() * 0.004) * 0.2;
  });
  const midX = (from[0] + to[0]) / 2, midY = Math.max(from[1], to[1]) + 0.5, midZ = (from[2] + to[2]) / 2;
  return (
    <group>
      {/* Simple line segments from → mid → to */}
      <mesh ref={ref} position={[(from[0] + midX) / 2, (from[1] + midY) / 2, (from[2] + midZ) / 2]}>
        <boxGeometry args={[0.03, 0.03, 3]} />
        <meshBasicMaterial color="#ffd700" transparent opacity={0.5} />
      </mesh>
    </group>
  );
}

// ─── ARJUN CHARACTER (animated per task) ───
export function ArjunCharacter({ position = [0, 0, 0], action = 'idle', facingAngle = 0, scale = 1 }) {
  const groupRef = useRef();
  const bodyRef = useRef();
  const leftArmRef = useRef();
  const rightArmRef = useRef();
  const leftLegRef = useRef();
  const rightLegRef = useRef();
  const targetPos = useRef(new THREE.Vector3(...position));

  useFrame(() => {
    if (!groupRef.current) return;
    // Smooth position interpolation (walk to target)
    targetPos.current.set(position[0], position[1], position[2]);
    groupRef.current.position.lerp(targetPos.current, 0.04);
    // Smooth rotation
    const targetRot = facingAngle;
    const cur = groupRef.current.rotation.y;
    groupRef.current.rotation.y += (targetRot - cur) * 0.06;

    const t = performance.now() * 0.001;
    if (!bodyRef.current) return;

    if (action === 'walk') {
      bodyRef.current.position.y = Math.sin(t * 8) * 0.06;
      if (leftArmRef.current) leftArmRef.current.rotation.x = Math.sin(t * 8) * 0.6;
      if (rightArmRef.current) rightArmRef.current.rotation.x = Math.sin(t * 8 + Math.PI) * 0.6;
      if (leftLegRef.current) leftLegRef.current.rotation.x = Math.sin(t * 8 + Math.PI) * 0.5;
      if (rightLegRef.current) rightLegRef.current.rotation.x = Math.sin(t * 8) * 0.5;
    } else if (action === 'dig') {
      bodyRef.current.position.y = -0.15;
      bodyRef.current.rotation.x = 0.3;
      if (rightArmRef.current) rightArmRef.current.rotation.x = -1.2 + Math.sin(t * 5) * 0.6;
      if (leftArmRef.current) leftArmRef.current.rotation.x = -0.8 + Math.sin(t * 5 + 1) * 0.4;
      if (leftLegRef.current) leftLegRef.current.rotation.x = -0.3;
      if (rightLegRef.current) rightLegRef.current.rotation.x = 0.1;
    } else if (action === 'sweep') {
      if (rightArmRef.current) rightArmRef.current.rotation.x = -0.5 + Math.sin(t * 6) * 0.8;
      if (leftArmRef.current) leftArmRef.current.rotation.x = -0.3 + Math.sin(t * 6 + 0.5) * 0.5;
      if (rightArmRef.current) rightArmRef.current.rotation.z = Math.sin(t * 6) * 0.3;
      bodyRef.current.rotation.y = Math.sin(t * 3) * 0.15;
    } else if (action === 'plant') {
      bodyRef.current.position.y = -0.2;
      bodyRef.current.rotation.x = 0.5;
      if (rightArmRef.current) rightArmRef.current.rotation.x = -1.5 + Math.sin(t * 3) * 0.3;
      if (leftArmRef.current) leftArmRef.current.rotation.x = -1.5 + Math.sin(t * 3 + 1) * 0.3;
      if (leftLegRef.current) leftLegRef.current.rotation.x = -0.6;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -0.2;
    } else if (action === 'water') {
      if (rightArmRef.current) rightArmRef.current.rotation.x = -0.8;
      if (rightArmRef.current) rightArmRef.current.rotation.z = Math.sin(t * 2) * 0.3;
      if (leftArmRef.current) leftArmRef.current.rotation.x = -0.3;
    } else if (action === 'climb') {
      bodyRef.current.position.y = Math.sin(t * 4) * 0.08;
      if (rightArmRef.current) rightArmRef.current.rotation.x = -2.0 + Math.sin(t * 4) * 0.4;
      if (leftArmRef.current) leftArmRef.current.rotation.x = -2.0 + Math.sin(t * 4 + Math.PI) * 0.4;
      if (leftLegRef.current) leftLegRef.current.rotation.x = Math.sin(t * 4 + Math.PI) * 0.5;
      if (rightLegRef.current) rightLegRef.current.rotation.x = Math.sin(t * 4) * 0.5;
    } else if (action === 'install') {
      if (rightArmRef.current) rightArmRef.current.rotation.x = -1.8 + Math.sin(t * 6) * 0.3;
      if (leftArmRef.current) leftArmRef.current.rotation.x = -1.5 + Math.sin(t * 6 + 1) * 0.2;
      bodyRef.current.position.y = Math.sin(t * 2) * 0.02;
    } else if (action === 'scan') {
      if (rightArmRef.current) rightArmRef.current.rotation.x = -1.2;
      if (rightArmRef.current) rightArmRef.current.rotation.z = Math.sin(t * 1.5) * 0.15;
      bodyRef.current.rotation.y = Math.sin(t * 0.8) * 0.3;
    } else if (action === 'observe') {
      bodyRef.current.position.y = Math.sin(t * 1.5) * 0.02;
      if (rightArmRef.current) rightArmRef.current.rotation.x = 0;
      if (leftArmRef.current) leftArmRef.current.rotation.x = 0;
      bodyRef.current.rotation.y = Math.sin(t * 0.3) * 0.1;
    } else {
      // idle: gentle breathing
      bodyRef.current.position.y = Math.sin(t * 2) * 0.02;
      bodyRef.current.rotation.x = 0;
      if (leftArmRef.current) { leftArmRef.current.rotation.x = 0; leftArmRef.current.rotation.z = -0.05; }
      if (rightArmRef.current) { rightArmRef.current.rotation.x = 0; rightArmRef.current.rotation.z = 0.05; }
      if (leftLegRef.current) leftLegRef.current.rotation.x = 0;
      if (rightLegRef.current) rightLegRef.current.rotation.x = 0;
    }
  });

  const skin = '#c68642', shirt = '#22c55e', pants = '#2563eb', hair = '#1a1a2e', shoe = '#333';
  return (
    <group ref={groupRef} position={position} scale={[scale, scale, scale]}>
      <group ref={bodyRef}>
        {/* Legs */}
        <group ref={leftLegRef} position={[-0.12, 0.6, 0]}>
          <mesh position={[0, -0.13, 0]}><cylinderGeometry args={[0.08, 0.07, 0.25]} /><meshStandardMaterial color={pants} /></mesh>
          <mesh position={[0, -0.35, 0]}><cylinderGeometry args={[0.065, 0.055, 0.25]} /><meshStandardMaterial color={pants} /></mesh>
          <mesh position={[0, -0.5, 0.04]}><boxGeometry args={[0.12, 0.1, 0.2]} /><meshStandardMaterial color={shoe} /></mesh>
        </group>
        <group ref={rightLegRef} position={[0.12, 0.6, 0]}>
          <mesh position={[0, -0.13, 0]}><cylinderGeometry args={[0.08, 0.07, 0.25]} /><meshStandardMaterial color={pants} /></mesh>
          <mesh position={[0, -0.35, 0]}><cylinderGeometry args={[0.065, 0.055, 0.25]} /><meshStandardMaterial color={pants} /></mesh>
          <mesh position={[0, -0.5, 0.04]}><boxGeometry args={[0.12, 0.1, 0.2]} /><meshStandardMaterial color={shoe} /></mesh>
        </group>
        {/* Torso */}
        <mesh position={[0, 0.85, 0]}><boxGeometry args={[0.45, 0.55, 0.25]} /><meshStandardMaterial color={shirt} /></mesh>
        {/* Arms */}
        <group ref={leftArmRef} position={[-0.3, 1.0, 0]}>
          <mesh position={[0, -0.12, 0]}><cylinderGeometry args={[0.055, 0.05, 0.25]} /><meshStandardMaterial color={shirt} /></mesh>
          <mesh position={[0, -0.32, 0]}><cylinderGeometry args={[0.045, 0.04, 0.2]} /><meshStandardMaterial color={skin} /></mesh>
        </group>
        <group ref={rightArmRef} position={[0.3, 1.0, 0]}>
          <mesh position={[0, -0.12, 0]}><cylinderGeometry args={[0.055, 0.05, 0.25]} /><meshStandardMaterial color={shirt} /></mesh>
          <mesh position={[0, -0.32, 0]}><cylinderGeometry args={[0.045, 0.04, 0.2]} /><meshStandardMaterial color={skin} /></mesh>
        </group>
        {/* Neck + Head */}
        <mesh position={[0, 1.15, 0]}><cylinderGeometry args={[0.06, 0.06, 0.08]} /><meshStandardMaterial color={skin} /></mesh>
        <group position={[0, 1.38, 0]}>
          <mesh><sphereGeometry args={[0.2, 16, 16]} /><meshStandardMaterial color={skin} /></mesh>
          <mesh position={[0, 0.08, -0.02]}><sphereGeometry args={[0.21, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color={hair} /></mesh>
          <mesh position={[-0.07, 0.02, 0.18]}><sphereGeometry args={[0.035, 8, 8]} /><meshStandardMaterial color="#fff" /></mesh>
          <mesh position={[-0.07, 0.02, 0.2]}><sphereGeometry args={[0.018, 8, 8]} /><meshStandardMaterial color="#1a1a2e" /></mesh>
          <mesh position={[0.07, 0.02, 0.18]}><sphereGeometry args={[0.035, 8, 8]} /><meshStandardMaterial color="#fff" /></mesh>
          <mesh position={[0.07, 0.02, 0.2]}><sphereGeometry args={[0.018, 8, 8]} /><meshStandardMaterial color="#1a1a2e" /></mesh>
        </group>
        {/* Shadow */}
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.3, 16]} /><meshBasicMaterial color="#000" transparent opacity={0.15} />
        </mesh>
      </group>
    </group>
  );
}

// ─── WORKER CHARACTER (smaller, different colors) ───
export function WorkerCharacter({ position = [0, 0, 0], action = 'idle', facingAngle = 0 }) {
  const groupRef = useRef();
  const bodyRef = useRef();
  const lArmRef = useRef();
  const rArmRef = useRef();

  useFrame(() => {
    if (!groupRef.current || !bodyRef.current) return;
    const t = performance.now() * 0.001;
    if (action === 'work') {
      if (rArmRef.current) rArmRef.current.rotation.x = -1.5 + Math.sin(t * 5) * 0.4;
      if (lArmRef.current) lArmRef.current.rotation.x = -1.2 + Math.sin(t * 5 + 1) * 0.3;
      bodyRef.current.position.y = Math.sin(t * 3) * 0.03;
    } else {
      bodyRef.current.position.y = Math.sin(t * 2) * 0.02;
      if (rArmRef.current) rArmRef.current.rotation.x = 0;
      if (lArmRef.current) lArmRef.current.rotation.x = 0;
    }
  });

  const skin = '#b5651d', vest = '#f97316', pants = '#374151', helmet = '#fbbf24';
  return (
    <group ref={groupRef} position={position} rotation={[0, facingAngle, 0]} scale={[0.9, 0.9, 0.9]}>
      <group ref={bodyRef}>
        <mesh position={[0, 0.35, 0]}><cylinderGeometry args={[0.07, 0.06, 0.5, 6]} /><meshStandardMaterial color={pants} /></mesh>
        <mesh position={[0, 0.75, 0]}><boxGeometry args={[0.4, 0.45, 0.22]} /><meshStandardMaterial color={vest} /></mesh>
        <group ref={lArmRef} position={[-0.26, 0.9, 0]}>
          <mesh position={[0, -0.15, 0]}><cylinderGeometry args={[0.04, 0.035, 0.3]} /><meshStandardMaterial color={vest} /></mesh>
          <mesh position={[0, -0.3, 0]}><cylinderGeometry args={[0.035, 0.03, 0.15]} /><meshStandardMaterial color={skin} /></mesh>
        </group>
        <group ref={rArmRef} position={[0.26, 0.9, 0]}>
          <mesh position={[0, -0.15, 0]}><cylinderGeometry args={[0.04, 0.035, 0.3]} /><meshStandardMaterial color={vest} /></mesh>
          <mesh position={[0, -0.3, 0]}><cylinderGeometry args={[0.035, 0.03, 0.15]} /><meshStandardMaterial color={skin} /></mesh>
        </group>
        <mesh position={[0, 1.1, 0]}><sphereGeometry args={[0.16, 12, 12]} /><meshStandardMaterial color={skin} /></mesh>
        {/* Hard hat */}
        <mesh position={[0, 1.26, 0]}><sphereGeometry args={[0.18, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color={helmet} /></mesh>
        <mesh position={[0, 1.2, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.22, 12]} /><meshStandardMaterial color={helmet} side={THREE.DoubleSide} /></mesh>
      </group>
    </group>
  );
}

// ─── CONSTRUCTION VEHICLE (truck that arrives for wind turbine) ───
export function ConstructionVehicle({ position = [0, 0, 0], visible = false, arriving = false }) {
  const groupRef = useRef();
  const startX = position[0] + 40;

  useFrame(() => {
    if (!groupRef.current || !visible) return;
    if (arriving) {
      const targetX = position[0];
      groupRef.current.position.x += (targetX - groupRef.current.position.x) * 0.02;
    }
  });

  if (!visible) return null;
  return (
    <group ref={groupRef} position={[arriving ? startX : position[0], position[1], position[2]]}>
      {/* Truck cab */}
      <mesh position={[-1.5, 0.8, 0]}><boxGeometry args={[1.2, 1.2, 1.4]} /><meshStandardMaterial color="#f59e0b" roughness={0.4} /></mesh>
      {/* Windshield */}
      <mesh position={[-1.0, 1.0, 0]}><boxGeometry args={[0.05, 0.6, 1.0]} /><meshStandardMaterial color="#87ceeb" transparent opacity={0.6} metalness={0.8} /></mesh>
      {/* Flatbed */}
      <mesh position={[0.8, 0.4, 0]}><boxGeometry args={[3.0, 0.2, 1.6]} /><meshStandardMaterial color="#6b7280" roughness={0.6} /></mesh>
      {/* Side rails */}
      <mesh position={[0.8, 0.7, 0.75]}><boxGeometry args={[3.0, 0.4, 0.05]} /><meshStandardMaterial color="#4b5563" /></mesh>
      <mesh position={[0.8, 0.7, -0.75]}><boxGeometry args={[3.0, 0.4, 0.05]} /><meshStandardMaterial color="#4b5563" /></mesh>
      {/* Wheels */}
      {[[-1.8, 0.2, 0.8], [-1.8, 0.2, -0.8], [0.3, 0.2, 0.8], [0.3, 0.2, -0.8], [1.6, 0.2, 0.8], [1.6, 0.2, -0.8]].map((wp, i) => (
        <mesh key={i} position={wp} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.2, 0.2, 0.15, 12]} /><meshStandardMaterial color="#1a1a1a" /></mesh>
      ))}
      {/* Turbine blade on the flatbed */}
      <mesh position={[0.8, 0.6, 0]} rotation={[0, 0, Math.PI / 2]}><boxGeometry args={[0.1, 2.5, 0.03]} /><meshStandardMaterial color="#f5f5f5" /></mesh>
      {/* Warning light */}
      <mesh position={[-1.5, 1.5, 0]}><sphereGeometry args={[0.08, 8, 8]} /><meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={1.0} /></mesh>
    </group>
  );
}

// ─── LADDER (for rooftop access) ───
export function Ladder({ position = [-10.5, 0, -3], visible = false }) {
  if (!visible) return null;
  const rungs = 10;
  return (
    <group position={position} rotation={[0, 0, -0.15]}>
      {/* Side rails */}
      <mesh position={[-0.15, 1.6, 0]}><boxGeometry args={[0.05, 3.4, 0.05]} /><meshStandardMaterial color="#d97706" roughness={0.5} /></mesh>
      <mesh position={[0.15, 1.6, 0]}><boxGeometry args={[0.05, 3.4, 0.05]} /><meshStandardMaterial color="#d97706" roughness={0.5} /></mesh>
      {/* Rungs */}
      {Array.from({ length: rungs }, (_, i) => (
        <mesh key={i} position={[0, 0.2 + i * 0.3, 0]}><boxGeometry args={[0.28, 0.03, 0.05]} /><meshStandardMaterial color="#b45309" roughness={0.6} /></mesh>
      ))}
    </group>
  );
}

// ─── ACTION PARTICLES (dust/dirt/water/sparks per action type) ───
export function ActionParticles({ position = [0, 0, 0], type = 'none', active = false }) {
  const groupRef = useRef();
  const particles = useMemo(() =>
    Array.from({ length: 20 }, () => ({
      vx: (Math.random() - 0.5) * 2, vy: Math.random() * 3 + 1, vz: (Math.random() - 0.5) * 2,
      life: Math.random(), size: 0.04 + Math.random() * 0.08,
    })), []);

  useFrame((_, delta) => {
    if (!groupRef.current || !active) return;
    groupRef.current.children.forEach((child, i) => {
      const p = particles[i]; if (!p) return;
      p.life -= delta * 1.5;
      if (p.life <= 0) {
        p.life = 1;
        child.position.set(0, 0.1, 0);
        p.vx = (Math.random() - 0.5) * 2;
        p.vy = Math.random() * 3 + 1;
        p.vz = (Math.random() - 0.5) * 2;
      }
      child.position.x += p.vx * delta;
      child.position.y += p.vy * delta - 3 * delta;
      child.position.z += p.vz * delta;
      child.material.opacity = Math.max(0, p.life * 0.6);
      child.scale.setScalar(p.size * p.life * 3);
    });
  });

  if (!active) return null;
  const color = type === 'dig' ? '#8B7355' : type === 'sweep' ? '#9CA3AF' : type === 'water' ? '#60a5fa'
    : type === 'sparks' ? '#fbbf24' : type === 'concrete' ? '#9ca3af' : '#887766';
  return (
    <group ref={groupRef} position={position}>
      {particles.map((p, i) => (
        <mesh key={i} position={[0, 0.1, 0]}>
          <sphereGeometry args={[p.size, 6, 6]} />
          <meshBasicMaterial color={color} transparent opacity={0.5} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

// ─── IRRIGATION DRIP LINES (visible connecting to trees) ───
export function IrrigationSystem({ treePositions = [], visible = false }) {
  if (!visible || treePositions.length === 0) return null;
  const pipeRef = useRef();
  useFrame(() => {
    if (pipeRef.current) {
      pipeRef.current.children.forEach(c => {
        if (c.material && c.material.emissive) c.material.emissiveIntensity = 0.2 + Math.sin(performance.now() * 0.003) * 0.15;
      });
    }
  });
  return (
    <group ref={pipeRef}>
      {treePositions.map((pos, i) => (
        <group key={i}>
          <mesh position={[pos[0] / 2, 0.03, pos[2] / 2]} rotation={[0, Math.atan2(pos[0], pos[2]), 0]}>
            <boxGeometry args={[0.04, 0.04, Math.sqrt(pos[0] * pos[0] + pos[2] * pos[2])]} />
            <meshStandardMaterial color="#1e40af" emissive="#3b82f6" emissiveIntensity={0.2} />
          </mesh>
          <mesh position={pos} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.1, 0.15, 8]} /><meshStandardMaterial color="#2563eb" emissive="#60a5fa" emissiveIntensity={0.3} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ─── PLANTING HOLE — visible dug hole in the ground ───
export function PlantingHole({ position, hasSeed = false }) {
  return (
    <group position={position}>
      {/* Dark circular depression — the hole */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[0.5, 16]} />
        <meshStandardMaterial color="#2a1a0a" roughness={1} />
      </mesh>
      {/* Inner deeper pit */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <circleGeometry args={[0.3, 12]} />
        <meshStandardMaterial color="#1a0e04" roughness={1} />
      </mesh>
      {/* Soil ring around the hole (dug-up earth) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <ringGeometry args={[0.45, 0.7, 16]} />
        <meshStandardMaterial color="#6b4520" roughness={0.9} />
      </mesh>
      {/* Small mound of dug-up soil */}
      {[0, 1.2, 2.4, 3.6, 4.8].map((a, i) => (
        <mesh key={i} position={[Math.cos(a) * 0.55, 0.06, Math.sin(a) * 0.55]}>
          <sphereGeometry args={[0.08 + Math.random() * 0.04, 6, 6]} />
          <meshStandardMaterial color="#8B6914" roughness={0.9} />
        </mesh>
      ))}
      {/* Glow ring when active and no seed yet */}
      {!hasSeed && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
          <ringGeometry args={[0.6, 0.65, 16]} />
          <meshBasicMaterial color="#22c55e" transparent opacity={0.4} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

// ─── SEED IN HOLE — small seeds visible inside a planting hole ───
export function SeedInHole({ position }) {
  return (
    <group position={position}>
      {/* 3-4 small seeds scattered inside the hole */}
      {[
        [0.05, 0.03, 0.02],
        [-0.06, 0.03, 0.04],
        [0.02, 0.03, -0.05],
        [-0.03, 0.03, -0.02],
      ].map((off, i) => (
        <mesh key={i} position={off}>
          <sphereGeometry args={[0.04, 6, 6]} />
          <meshStandardMaterial color="#5c3d1a" roughness={0.8} />
        </mesh>
      ))}
      {/* Tiny seedling sprout emerging */}
      <mesh position={[0, 0.06, 0]}>
        <coneGeometry args={[0.03, 0.1, 4]} />
        <meshStandardMaterial color="#4CAF50" roughness={0.7} />
      </mesh>
      {/* Green glow indicating planted */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <ringGeometry args={[0.25, 0.35, 12]} />
        <meshBasicMaterial color="#4ade80" transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}
