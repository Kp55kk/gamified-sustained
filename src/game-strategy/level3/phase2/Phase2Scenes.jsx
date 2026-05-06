// ═══════════════════════════════════════════════════════════
//  LEVEL 3 PHASE 2 — 3D Scene Components
//  Trees, Solar Panels, Wind Turbines
// ═══════════════════════════════════════════════════════════
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ─── Color helper ───
function lerpC(a, b, t) {
  const ca = new THREE.Color(a), cb = new THREE.Color(b);
  ca.lerp(cb, Math.max(0, Math.min(1, t)));
  return ca;
}

// ═══════════════════════════════════════════════════════════
//  TREE SEGMENT — Barren land → Green plantation
// ═══════════════════════════════════════════════════════════

// Single interactive tree with growth animation
export function GrowingTree({ position, growthPhase = 0, absorbing = false }) {
  const canopyRef = useRef();
  const glowRef = useRef();
  // growthPhase: 0=hole, 1=sapling, 2=small, 3=medium, 4=full
  const scale = growthPhase <= 0 ? 0 : growthPhase * 0.25;
  const canopySize = Math.max(0.1, growthPhase * 0.3);
  const trunkH = Math.max(0.1, growthPhase * 0.5);

  useFrame(() => {
    if (canopyRef.current && growthPhase > 0) {
      const t = performance.now() * 0.001;
      canopyRef.current.rotation.y = Math.sin(t * 0.5) * 0.02;
      if (absorbing && glowRef.current) {
        glowRef.current.material.emissiveIntensity = 0.3 + Math.sin(t * 2) * 0.2;
      }
    }
  });

  return (
    <group position={position}>
      {/* Planting hole */}
      {growthPhase === 0 && (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.3, 12]} />
          <meshStandardMaterial color="#3a2510" roughness={1} />
        </mesh>
      )}
      {/* Trunk */}
      {growthPhase > 0 && (
        <mesh position={[0, trunkH / 2, 0]}>
          <cylinderGeometry args={[0.05 + growthPhase * 0.02, 0.08 + growthPhase * 0.03, trunkH, 8]} />
          <meshStandardMaterial color="#8B4513" roughness={0.8} />
        </mesh>
      )}
      {/* Canopy */}
      {growthPhase >= 2 && (
        <mesh ref={canopyRef} position={[0, trunkH + canopySize * 0.6, 0]}>
          <sphereGeometry args={[canopySize, 10, 10]} />
          <meshStandardMaterial color={growthPhase >= 4 ? '#228B22' : '#6B8E23'} roughness={0.7} />
        </mesh>
      )}
      {/* Sapling leaves */}
      {growthPhase === 1 && (
        <mesh position={[0, 0.3, 0]}>
          <coneGeometry args={[0.08, 0.2, 6]} />
          <meshStandardMaterial color="#4CAF50" roughness={0.7} />
        </mesh>
      )}
      {/* Absorption glow */}
      {absorbing && growthPhase >= 3 && (
        <mesh ref={glowRef} position={[0, trunkH + canopySize * 0.6, 0]}>
          <sphereGeometry args={[canopySize + 0.3, 8, 8]} />
          <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.3} transparent opacity={0.15} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}

// CO2 particles drifting toward trees
export function CO2Particles({ active, treePositions = [] }) {
  const groupRef = useRef();
  const particles = useMemo(() =>
    Array.from({ length: 30 }, () => ({
      x: (Math.random() - 0.5) * 20,
      y: 1 + Math.random() * 4,
      z: (Math.random() - 0.5) * 20,
      speed: 0.5 + Math.random() * 1,
      targetIdx: Math.floor(Math.random() * Math.max(1, treePositions.length)),
    })), [treePositions.length]);

  useFrame((_, delta) => {
    if (!groupRef.current || !active) return;
    groupRef.current.children.forEach((child, i) => {
      const p = particles[i];
      if (!p || !treePositions[p.targetIdx]) return;
      const target = treePositions[p.targetIdx];
      const dx = target[0] - child.position.x;
      const dy = (target[1] || 2) - child.position.y;
      const dz = target[2] - child.position.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (dist < 0.5) {
        child.position.set((Math.random() - 0.5) * 20, 1 + Math.random() * 4, (Math.random() - 0.5) * 20);
      } else {
        child.position.x += (dx / dist) * p.speed * delta;
        child.position.y += (dy / dist) * p.speed * delta;
        child.position.z += (dz / dist) * p.speed * delta;
      }
      child.material.opacity = Math.min(0.6, dist * 0.1);
    });
  });

  if (!active) return null;
  return (
    <group ref={groupRef}>
      {particles.map((p, i) => (
        <mesh key={i} position={[p.x, p.y, p.z]}>
          <sphereGeometry args={[0.12, 6, 6]} />
          <meshBasicMaterial color="#888" transparent opacity={0.4} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

// O2 particles emitting from trees
export function O2Particles({ active, treePositions = [] }) {
  const groupRef = useRef();
  const particles = useMemo(() =>
    Array.from({ length: 15 }, () => ({
      srcIdx: Math.floor(Math.random() * Math.max(1, treePositions.length)),
      offsetX: (Math.random() - 0.5) * 2,
      speed: 0.3 + Math.random() * 0.5,
      phase: Math.random() * Math.PI * 2,
    })), [treePositions.length]);

  useFrame((_, delta) => {
    if (!groupRef.current || !active) return;
    groupRef.current.children.forEach((child, i) => {
      const p = particles[i];
      if (!p) return;
      child.position.y += p.speed * delta;
      child.position.x += Math.sin(performance.now() * 0.001 + p.phase) * 0.01;
      if (child.position.y > 8) {
        const src = treePositions[p.srcIdx] || [0, 3, 0];
        child.position.set(src[0] + p.offsetX, src[1] || 3, src[2] + (Math.random() - 0.5));
      }
    });
  });

  if (!active) return null;
  return (
    <group ref={groupRef}>
      {particles.map((p, i) => {
        const src = treePositions[p.srcIdx] || [0, 3, 0];
        return (
          <mesh key={i} position={[src[0], src[1] || 3, src[2]]}>
            <sphereGeometry args={[0.08, 6, 6]} />
            <meshBasicMaterial color="#4ade80" transparent opacity={0.5} depthWrite={false} />
          </mesh>
        );
      })}
    </group>
  );
}

// Planting spot marker
export function PlantSpot({ position, active = false }) {
  const ref = useRef();
  useFrame(() => {
    if (ref.current && active) {
      const t = performance.now() * 0.003;
      ref.current.material.emissiveIntensity = 0.5 + Math.sin(t) * 0.3;
    }
  });
  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[0.25, 0.35, 16]} />
        <meshStandardMaterial ref={ref} color={active ? '#22c55e' : '#666'} emissive={active ? '#22c55e' : '#000'} emissiveIntensity={active ? 0.5 : 0} side={THREE.DoubleSide} />
      </mesh>
      {active && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
          <ringGeometry args={[0.4, 0.42, 16]} />
          <meshBasicMaterial color="#22c55e" transparent opacity={0.3} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

// Tree environment (barren → green ground)
export function TreeEnvironment({ greenLevel = 0 }) {
  const groundColor = useMemo(() => lerpC('#8B7355', '#3a7a3a', greenLevel), [greenLevel]);
  const skyColor = useMemo(() => lerpC('#aa6020', '#87CEEB', greenLevel), [greenLevel]);
  return (
    <group>
      <mesh><sphereGeometry args={[60, 12, 12]} /><meshBasicMaterial color={skyColor} side={THREE.BackSide} /></mesh>
      <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[80, 80]} /><meshStandardMaterial color={groundColor} roughness={1} /></mesh>
      <ambientLight intensity={0.4 + greenLevel * 0.2} color="#ffe8cc" />
      <directionalLight position={[8, 10, 5]} intensity={0.6 + greenLevel * 0.4} color="#ffd699" castShadow />
      <hemisphereLight args={['#ffecd2', '#3a5a2a', 0.3]} />
    </group>
  );
}

// ═══════════════════════════════════════════════════════════
//  SOLAR SEGMENT — House rooftop with panels
// ═══════════════════════════════════════════════════════════

export function SolarPanel({ position, placed = false, glowing = false, angle = 0 }) {
  const panelRef = useRef();
  const flowRef = useRef();
  useFrame(() => {
    if (flowRef.current && glowing) {
      const t = performance.now() * 0.003;
      flowRef.current.material.emissiveIntensity = 0.5 + Math.sin(t * 2) * 0.3;
    }
  });

  if (!placed) {
    return (
      <group position={position}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <planeGeometry args={[1.2, 0.8]} />
          <meshStandardMaterial color="#ddd" transparent opacity={0.3} side={THREE.DoubleSide} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
          <ringGeometry args={[0.5, 0.55, 4]} />
          <meshBasicMaterial color="#f59e0b" transparent opacity={0.5} side={THREE.DoubleSide} />
        </mesh>
      </group>
    );
  }

  return (
    <group position={position} rotation={[0, (angle * Math.PI) / 180, 0]}>
      {/* Panel frame */}
      <mesh ref={panelRef} position={[0, 0.15, 0]} rotation={[-0.5, 0, 0]}>
        <boxGeometry args={[1.1, 0.04, 0.7]} />
        <meshStandardMaterial color="#1a237e" metalness={0.5} roughness={0.3} />
      </mesh>
      {/* Solar cells grid */}
      {[-0.3, 0, 0.3].map((offX, xi) =>
        [-0.15, 0.15].map((offZ, zi) => (
          <mesh key={`${xi}-${zi}`} position={[offX, 0.18, offZ]} rotation={[-0.5, 0, 0]}>
            <boxGeometry args={[0.3, 0.01, 0.25]} />
            <meshStandardMaterial color="#0d47a1" metalness={0.7} roughness={0.2} />
          </mesh>
        ))
      )}
      {/* Support stand */}
      <mesh position={[0, 0.07, 0.2]}>
        <boxGeometry args={[0.05, 0.14, 0.05]} />
        <meshStandardMaterial color="#888" metalness={0.6} />
      </mesh>
      {/* Energy glow when generating */}
      {glowing && (
        <mesh ref={flowRef} position={[0, 0.2, 0]} rotation={[-0.5, 0, 0]}>
          <boxGeometry args={[1.2, 0.08, 0.8]} />
          <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={0.5} transparent opacity={0.2} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}

// Animated sun moving across sky
export function AnimatedSun({ progress = 0 }) {
  const sunRef = useRef();
  const angle = -Math.PI * 0.8 + progress * Math.PI * 1.6;
  const x = Math.cos(angle) * 25;
  const y = Math.sin(angle) * 20 + 5;

  useFrame(() => {
    if (sunRef.current) {
      const t = performance.now() * 0.001;
      sunRef.current.material.emissiveIntensity = 1.5 + Math.sin(t) * 0.3;
    }
  });

  return (
    <group>
      <mesh ref={sunRef} position={[x, Math.max(2, y), -10]}>
        <sphereGeometry args={[2, 12, 12]} />
        <meshStandardMaterial color="#ffd700" emissive="#ff8c00" emissiveIntensity={1.5} />
      </mesh>
      <pointLight position={[x, Math.max(2, y), -10]} intensity={Math.max(0, y / 20)} distance={60} color="#ffd699" />
    </group>
  );
}

// Energy flow lines from panels to house
export function EnergyFlowLines({ active, panelPositions = [] }) {
  const groupRef = useRef();
  useFrame(() => {
    if (!groupRef.current || !active) return;
    groupRef.current.children.forEach((child) => {
      const t = performance.now() * 0.005;
      child.material.opacity = 0.3 + Math.sin(t + child.position.x) * 0.2;
    });
  });
  if (!active) return null;
  return (
    <group ref={groupRef}>
      {panelPositions.map((pos, i) => (
        <mesh key={i} position={[pos[0], pos[1] - 0.5, pos[2]]}>
          <cylinderGeometry args={[0.02, 0.02, 1, 6]} />
          <meshBasicMaterial color="#ffd700" transparent opacity={0.4} />
        </mesh>
      ))}
    </group>
  );
}

// Solar rooftop environment
export function SolarEnvironment({ sunProgress = 0 }) {
  const skyColor = useMemo(() => {
    if (sunProgress < 0.2) return lerpC('#1a1a3a', '#87CEEB', sunProgress / 0.2);
    if (sunProgress < 0.8) return '#87CEEB';
    return lerpC('#87CEEB', '#ff6b35', (sunProgress - 0.8) / 0.2);
  }, [sunProgress]);

  return (
    <group>
      <mesh><sphereGeometry args={[60, 12, 12]} /><meshBasicMaterial color={skyColor} side={THREE.BackSide} /></mesh>
      <ambientLight intensity={0.3 + sunProgress * 0.4} color="#ffe8cc" />
      <hemisphereLight args={['#87CEEB', '#3a5a2a', 0.3]} />
      {/* Rooftop base */}
      <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12, 8]} />
        <meshStandardMaterial color="#c4b09a" roughness={0.9} />
      </mesh>
      {/* Roof edge walls */}
      <mesh position={[0, 0.15, -4]}><boxGeometry args={[12, 0.3, 0.1]} /><meshStandardMaterial color="#a08060" roughness={0.8} /></mesh>
      <mesh position={[0, 0.15, 4]}><boxGeometry args={[12, 0.3, 0.1]} /><meshStandardMaterial color="#a08060" roughness={0.8} /></mesh>
      <mesh position={[-6, 0.15, 0]}><boxGeometry args={[0.1, 0.3, 8]} /><meshStandardMaterial color="#a08060" roughness={0.8} /></mesh>
      <mesh position={[6, 0.15, 0]}><boxGeometry args={[0.1, 0.3, 8]} /><meshStandardMaterial color="#a08060" roughness={0.8} /></mesh>
      {/* House body below */}
      <mesh position={[0, -1.5, 0]}><boxGeometry args={[12, 3, 8]} /><meshStandardMaterial color="#d4c4b0" roughness={0.8} /></mesh>
    </group>
  );
}

// ═══════════════════════════════════════════════════════════
//  WIND SEGMENT — Open land with turbine
// ═══════════════════════════════════════════════════════════

export function WindTurbine({ position, installed = false, windSpeed = 0 }) {
  const bladeGroupRef = useRef();
  useFrame((_, delta) => {
    if (bladeGroupRef.current && installed) {
      bladeGroupRef.current.rotation.z += windSpeed * 0.15 * delta;
    }
  });

  if (!installed) {
    return (
      <group position={position}>
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[1, 16]} />
          <meshStandardMaterial color="#555" transparent opacity={0.3} />
        </mesh>
        {/* Platform base */}
        <mesh position={[0, 0.1, 0]}>
          <cylinderGeometry args={[0.8, 1, 0.2, 12]} />
          <meshStandardMaterial color="#777" roughness={0.6} />
        </mesh>
      </group>
    );
  }

  return (
    <group position={position}>
      {/* Foundation */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[1, 1.2, 0.3, 12]} />
        <meshStandardMaterial color="#888" roughness={0.5} />
      </mesh>
      {/* Tower */}
      <mesh position={[0, 4, 0]}>
        <cylinderGeometry args={[0.15, 0.3, 7.5, 8]} />
        <meshStandardMaterial color="#e0e0e0" roughness={0.4} metalness={0.3} />
      </mesh>
      {/* Nacelle (housing) */}
      <mesh position={[0, 7.8, 0.3]}>
        <boxGeometry args={[0.5, 0.4, 1.2]} />
        <meshStandardMaterial color="#ddd" roughness={0.3} metalness={0.4} />
      </mesh>
      {/* Hub */}
      <mesh position={[0, 7.8, 0.9]}>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshStandardMaterial color="#ccc" metalness={0.5} />
      </mesh>
      {/* Blades */}
      <group ref={bladeGroupRef} position={[0, 7.8, 1]}>
        {[0, 120, 240].map((angle, i) => (
          <mesh key={i} rotation={[0, 0, (angle * Math.PI) / 180]} position={[0, 1.8, 0]}>
            <boxGeometry args={[0.12, 3.5, 0.03]} />
            <meshStandardMaterial color="#f5f5f5" roughness={0.3} />
          </mesh>
        ))}
      </group>
      {/* Power indicator */}
      {windSpeed > 3 && (
        <pointLight position={[0, 8, 0]} intensity={windSpeed * 0.1} distance={8} color="#4ade80" />
      )}
    </group>
  );
}

// Wind particles
export function WindParticles({ windSpeed = 0 }) {
  const groupRef = useRef();
  const particles = useMemo(() =>
    Array.from({ length: 40 }, () => ({
      x: (Math.random() - 0.5) * 40,
      y: 0.5 + Math.random() * 8,
      z: (Math.random() - 0.5) * 40,
    })), []);

  useFrame((_, delta) => {
    if (!groupRef.current || windSpeed < 1) return;
    groupRef.current.children.forEach((child, i) => {
      child.position.x += windSpeed * 0.8 * delta;
      if (child.position.x > 20) {
        child.position.x = -20;
        child.position.y = 0.5 + Math.random() * 8;
        child.position.z = (Math.random() - 0.5) * 40;
      }
      child.material.opacity = Math.min(0.4, windSpeed * 0.05);
    });
  });

  return (
    <group ref={groupRef}>
      {particles.map((p, i) => (
        <mesh key={i} position={[p.x, p.y, p.z]}>
          <boxGeometry args={[0.3, 0.02, 0.02]} />
          <meshBasicMaterial color="#fff" transparent opacity={0.2} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

// Wind environment
export function WindEnvironment() {
  return (
    <group>
      <mesh><sphereGeometry args={[60, 12, 12]} /><meshBasicMaterial color="#87CEEB" side={THREE.BackSide} /></mesh>
      <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[80, 80]} /><meshStandardMaterial color="#5a8a3a" roughness={1} /></mesh>
      {/* Hills */}
      <mesh position={[-15, 1.5, -15]}><sphereGeometry args={[8, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color="#4a7a2a" roughness={0.9} /></mesh>
      <mesh position={[20, 1, -20]}><sphereGeometry args={[6, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color="#5a8a3a" roughness={0.9} /></mesh>
      <ambientLight intensity={0.5} color="#ffe8cc" />
      <directionalLight position={[8, 10, 5]} intensity={0.8} color="#ffd699" castShadow />
      <hemisphereLight args={['#87CEEB', '#3a5a2a', 0.3]} />
    </group>
  );
}
