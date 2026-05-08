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

// ─── SOLAR PANEL (on rooftop) ───
export function SolarPanel({ position, placed = false, glowing = false, angle = 0 }) {
  const flowRef = useRef();
  useFrame(() => { if (flowRef.current && glowing) { flowRef.current.material.emissiveIntensity = 0.5 + Math.sin(performance.now() * 0.006) * 0.3; } });

  if (!placed) return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}><planeGeometry args={[1.2, 0.8]} /><meshStandardMaterial color="#ddd" transparent opacity={0.3} side={THREE.DoubleSide} /></mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}><ringGeometry args={[0.5, 0.55, 4]} /><meshBasicMaterial color="#f59e0b" transparent opacity={0.5} side={THREE.DoubleSide} /></mesh>
    </group>
  );

  return (
    <group position={position} rotation={[0, (angle * Math.PI) / 180, 0]}>
      <mesh position={[0, 0.15, 0]} rotation={[-0.5, 0, 0]}><boxGeometry args={[1.1, 0.04, 0.7]} /><meshStandardMaterial color="#1a237e" metalness={0.5} roughness={0.3} /></mesh>
      {[-0.3, 0, 0.3].map((offX, xi) => [-0.15, 0.15].map((offZ, zi) => (
        <mesh key={`${xi}-${zi}`} position={[offX, 0.18, offZ]} rotation={[-0.5, 0, 0]}><boxGeometry args={[0.3, 0.01, 0.25]} /><meshStandardMaterial color="#0d47a1" metalness={0.7} roughness={0.2} /></mesh>
      )))}
      <mesh position={[0, 0.07, 0.2]}><boxGeometry args={[0.05, 0.14, 0.05]} /><meshStandardMaterial color="#888" metalness={0.6} /></mesh>
      {glowing && (<mesh ref={flowRef} position={[0, 0.2, 0]} rotation={[-0.5, 0, 0]}><boxGeometry args={[1.2, 0.08, 0.8]} /><meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={0.5} transparent opacity={0.2} depthWrite={false} /></mesh>)}
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

// ─── WIND TURBINE (small rooftop) ───
export function WindTurbine({ position, installed = false, windSpeed = 0 }) {
  const bladeGroupRef = useRef();
  useFrame((_, delta) => { if (bladeGroupRef.current && installed) bladeGroupRef.current.rotation.z += windSpeed * 0.15 * delta; });

  if (!installed) return (
    <group position={position}>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.5, 16]} /><meshStandardMaterial color="#555" transparent opacity={0.3} /></mesh>
      <mesh position={[0, 0.1, 0]}><cylinderGeometry args={[0.4, 0.5, 0.15, 12]} /><meshStandardMaterial color="#777" roughness={0.6} /></mesh>
    </group>
  );

  return (
    <group position={position}>
      <mesh position={[0, 0.1, 0]}><cylinderGeometry args={[0.4, 0.5, 0.15, 12]} /><meshStandardMaterial color="#888" roughness={0.5} /></mesh>
      <mesh position={[0, 2, 0]}><cylinderGeometry args={[0.08, 0.15, 3.5, 8]} /><meshStandardMaterial color="#e0e0e0" roughness={0.4} metalness={0.3} /></mesh>
      <mesh position={[0, 3.8, 0.15]}><boxGeometry args={[0.3, 0.25, 0.6]} /><meshStandardMaterial color="#ddd" roughness={0.3} metalness={0.4} /></mesh>
      <mesh position={[0, 3.8, 0.45]}><sphereGeometry args={[0.1, 8, 8]} /><meshStandardMaterial color="#ccc" metalness={0.5} /></mesh>
      <group ref={bladeGroupRef} position={[0, 3.8, 0.5]}>
        {[0, 120, 240].map((a, i) => (
          <mesh key={i} rotation={[0, 0, (a * Math.PI) / 180]} position={[0, 0.9, 0]}>
            <boxGeometry args={[0.06, 1.8, 0.02]} /><meshStandardMaterial color="#f5f5f5" roughness={0.3} />
          </mesh>
        ))}
      </group>
      {windSpeed > 3 && <pointLight position={[0, 4, 0]} intensity={windSpeed * 0.08} distance={5} color="#4ade80" />}
    </group>
  );
}

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

// ─── FIELD WIND TURBINE (larger, placed in open field) ───
export function FieldWindTurbine({ position, installed = false, windSpeed = 0 }) {
  const bladeRef = useRef();
  useFrame((_, delta) => { if (bladeRef.current && installed) bladeRef.current.rotation.z += windSpeed * 0.12 * delta; });

  if (!installed) return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}><circleGeometry args={[1.2, 16]} /><meshStandardMaterial color="#555" transparent opacity={0.25} /></mesh>
      <mesh position={[0, 0.3, 0]}><cylinderGeometry args={[0.8, 1.0, 0.3, 12]} /><meshStandardMaterial color="#777" roughness={0.6} /></mesh>
    </group>
  );

  return (
    <group position={position}>
      {/* Foundation */}
      <mesh position={[0, 0.15, 0]}><cylinderGeometry args={[0.8, 1.0, 0.3, 12]} /><meshStandardMaterial color="#888" roughness={0.5} /></mesh>
      {/* Tower */}
      <mesh position={[0, 4, 0]}><cylinderGeometry args={[0.12, 0.25, 7.5, 8]} /><meshStandardMaterial color="#e8e8e8" roughness={0.3} metalness={0.4} /></mesh>
      {/* Nacelle */}
      <mesh position={[0, 7.8, 0.25]}><boxGeometry args={[0.5, 0.4, 1.0]} /><meshStandardMaterial color="#ddd" roughness={0.3} metalness={0.4} /></mesh>
      <mesh position={[0, 7.8, 0.8]}><sphereGeometry args={[0.18, 8, 8]} /><meshStandardMaterial color="#ccc" metalness={0.5} /></mesh>
      {/* Blades */}
      <group ref={bladeRef} position={[0, 7.8, 0.9]}>
        {[0, 120, 240].map((a, i) => (
          <mesh key={i} rotation={[0, 0, (a * Math.PI) / 180]} position={[0, 1.8, 0]}>
            <boxGeometry args={[0.1, 3.6, 0.03]} /><meshStandardMaterial color="#f5f5f5" roughness={0.3} />
          </mesh>
        ))}
      </group>
      {/* Light on top */}
      {windSpeed > 3 && <pointLight position={[0, 8.2, 0]} intensity={windSpeed * 0.06} distance={8} color="#4ade80" />}
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
      {/* Battery box */}
      <mesh position={[0, 0.5, 0]}><boxGeometry args={[0.8, 1.0, 0.5]} /><meshStandardMaterial color="#374151" roughness={0.4} metalness={0.5} /></mesh>
      {/* Charge indicator */}
      <mesh position={[0, 0.5, 0.26]}><boxGeometry args={[0.6, 0.8 * chargeLevel, 0.02]} /><meshStandardMaterial color={chargeLevel > 0.6 ? '#22c55e' : chargeLevel > 0.3 ? '#f59e0b' : '#ef4444'} emissive={chargeLevel > 0.6 ? '#22c55e' : '#f59e0b'} emissiveIntensity={0.3} /></mesh>
      {/* Glow when active */}
      {active && <mesh ref={glowRef} position={[0, 0.5, 0]}><boxGeometry args={[0.9, 1.1, 0.6]} /><meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.3} transparent opacity={0.1} depthWrite={false} /></mesh>}
    </group>
  );
}
