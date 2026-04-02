// ═══════════════════════════════════════════════════════════
//  LEVEL 3 — Reactive Outside Environment (3D)
//  Renders sky, trees, smoke, fire, neighbor houses
//  All driven by a single `damageLevel` prop (0.0 → 1.0)
// ═══════════════════════════════════════════════════════════
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ─── Color interpolation helper ───
function lerpColor(a, b, t) {
  const ca = new THREE.Color(a);
  const cb = new THREE.Color(b);
  ca.lerp(cb, Math.max(0, Math.min(1, t)));
  return ca;
}

// ─── Tree positions around the house ───
const TREE_POSITIONS = [
  [-16, 0, -12], [-18, 0, 2], [-15, 0, 12],
  [0, 0, -14], [0, 0, 14],
  [16, 0, -12], [18, 0, 2], [15, 0, 12],
  [-12, 0, -16], [12, 0, -16],
];

// ─── Neighbor house positions ───
const NEIGHBOR_POSITIONS = [
  { pos: [-22, 0, -14], rot: 0.3 },
  { pos: [22, 0, -14], rot: -0.3 },
  { pos: [-22, 0, 14], rot: 0.2 },
  { pos: [22, 0, 14], rot: -0.2 },
];

// ─── Single Tree ───
function EnvironmentTree({ position, damageLevel }) {
  const canopyRef = useRef();
  const fireRef = useRef();

  const canopyColor = useMemo(() => {
    if (damageLevel < 0.25) return lerpColor('#228B22', '#6B8E23', damageLevel / 0.25);
    if (damageLevel < 0.5) return lerpColor('#6B8E23', '#DAA520', (damageLevel - 0.25) / 0.25);
    if (damageLevel < 0.75) return lerpColor('#DAA520', '#8B4513', (damageLevel - 0.5) / 0.25);
    return lerpColor('#8B4513', '#2a1a0a', (damageLevel - 0.75) / 0.25);
  }, [damageLevel]);

  const canopyScale = damageLevel > 0.6 ? Math.max(0.2, 1 - (damageLevel - 0.6) * 1.8) : 1;
  const trunkColor = damageLevel > 0.5 ? '#4a2a10' : '#8B4513';

  useFrame(() => {
    if (fireRef.current && damageLevel > 0.7) {
      const t = performance.now() * 0.005;
      fireRef.current.material.emissiveIntensity = 0.8 + Math.sin(t * 3) * 0.4;
      fireRef.current.scale.y = 0.8 + Math.sin(t * 5) * 0.3;
    }
  });

  return (
    <group position={position}>
      {/* Trunk */}
      <mesh position={[0, 1, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.25, 2, 8]} />
        <meshStandardMaterial color={trunkColor} roughness={0.8} />
      </mesh>
      {/* Canopy */}
      <mesh position={[0, 2.8, 0]} scale={[canopyScale, canopyScale, canopyScale]}>
        <sphereGeometry args={[1.2, 10, 10]} />
        <meshStandardMaterial color={canopyColor} roughness={0.7} />
      </mesh>
      {/* Fire glow when damage > 0.7 */}
      {damageLevel > 0.7 && (
        <>
          <mesh ref={fireRef} position={[0, 2.5, 0]}>
            <sphereGeometry args={[0.6, 8, 8]} />
            <meshStandardMaterial
              color="#ff4400"
              emissive="#ff4400"
              emissiveIntensity={0.8}
              transparent
              opacity={0.25}
              depthWrite={false}
            />
          </mesh>
          <pointLight position={[0, 2.5, 0]} intensity={0.5} distance={5} color="#ff4400" />
        </>
      )}
    </group>
  );
}

// ─── Smoke Particles ───
function SmokeParticles({ damageLevel }) {
  const groupRef = useRef();

  const particles = useMemo(() => {
    return Array.from({ length: 20 }, () => ({
      x: (Math.random() - 0.5) * 50,
      z: (Math.random() - 0.5) * 50,
      speed: 0.3 + Math.random() * 0.8,
      size: 0.8 + Math.random() * 2,
      startY: Math.random() * 5,
    }));
  }, []);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.children.forEach((child, i) => {
      const p = particles[i];
      if (!p) return;
      child.position.y += p.speed * delta;
      if (child.position.y > 25) {
        child.position.y = 0;
        child.position.x = (Math.random() - 0.5) * 50;
        child.position.z = (Math.random() - 0.5) * 50;
      }
      const fade = 1 - child.position.y / 25;
      child.material.opacity = Math.min((damageLevel - 0.4) * 0.6, 0.35) * fade;
    });
  });

  if (damageLevel < 0.4) return null;

  return (
    <group ref={groupRef}>
      {particles.map((p, i) => (
        <mesh key={i} position={[p.x, p.startY, p.z]}>
          <sphereGeometry args={[p.size, 6, 6]} />
          <meshBasicMaterial color="#555" transparent opacity={0.1} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

// ─── Neighbor House ───
function NeighborHouse({ position, rotation, damageLevel }) {
  const smokeRef = useRef();

  useFrame(() => {
    if (smokeRef.current && damageLevel > 0.5) {
      const t = performance.now() * 0.003;
      smokeRef.current.position.y = 5 + Math.sin(t) * 0.5;
      smokeRef.current.material.opacity = Math.min((damageLevel - 0.5) * 0.4, 0.25);
    }
  });

  const wallColor = damageLevel > 0.6 ? '#5a4a3a' : '#d4c4b0';
  const roofColor = damageLevel > 0.6 ? '#3a2a1a' : '#8B4513';

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* House body */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <boxGeometry args={[4, 3, 3]} />
        <meshStandardMaterial color={wallColor} roughness={0.8} />
      </mesh>
      {/* Roof */}
      <mesh position={[0, 3.3, 0]} castShadow>
        <boxGeometry args={[4.5, 0.6, 3.5]} />
        <meshStandardMaterial color={roofColor} roughness={0.7} />
      </mesh>
      {/* Window */}
      <mesh position={[0, 1.5, 1.51]}>
        <planeGeometry args={[1.2, 0.8]} />
        <meshStandardMaterial
          color={damageLevel > 0.5 ? '#ff6600' : '#87CEEB'}
          emissive={damageLevel > 0.5 ? '#ff4400' : '#000'}
          emissiveIntensity={damageLevel > 0.5 ? 0.5 : 0}
        />
      </mesh>
      {/* Door */}
      <mesh position={[1.2, 0.9, 1.51]}>
        <planeGeometry args={[0.7, 1.8]} />
        <meshStandardMaterial color="#6b4520" roughness={0.6} />
      </mesh>
      {/* Smoke from chimney */}
      {damageLevel > 0.5 && (
        <mesh ref={smokeRef} position={[-1, 5, 0]}>
          <sphereGeometry args={[0.8, 6, 6]} />
          <meshBasicMaterial color="#444" transparent opacity={0.15} depthWrite={false} />
        </mesh>
      )}
      {/* Fire glow at extreme damage */}
      {damageLevel > 0.75 && (
        <pointLight position={[0, 2, 2]} intensity={0.8} distance={6} color="#ff4400" />
      )}
    </group>
  );
}

// ═══════════════════════════════════════════════════════════
//  MAIN ENVIRONMENT COMPONENT
// ═══════════════════════════════════════════════════════════
export default function Level3Environment({ damageLevel }) {
  // ─── Sky color interpolation ───
  const skyColor = useMemo(() => {
    if (damageLevel < 0.25) return lerpColor('#87CEEB', '#e6a030', damageLevel / 0.25);
    if (damageLevel < 0.5) return lerpColor('#e6a030', '#aa3020', (damageLevel - 0.25) / 0.25);
    if (damageLevel < 0.75) return lerpColor('#aa3020', '#3a0e0e', (damageLevel - 0.5) / 0.25);
    return lerpColor('#3a0e0e', '#0a0505', (damageLevel - 0.75) / 0.25);
  }, [damageLevel]);

  // ─── Ground color ───
  const groundColor = useMemo(() => {
    if (damageLevel < 0.3) return lerpColor('#3a5a3a', '#7a6a30', damageLevel / 0.3);
    if (damageLevel < 0.6) return lerpColor('#7a6a30', '#5a3a20', (damageLevel - 0.3) / 0.3);
    return lerpColor('#5a3a20', '#1a0e05', (damageLevel - 0.6) / 0.4);
  }, [damageLevel]);

  // ─── Ambient light intensity (dims with damage) ───
  const ambientIntensity = 0.5 - damageLevel * 0.35;
  const sunIntensity = 1.0 - damageLevel * 0.7;
  const sunColor = useMemo(() => {
    return lerpColor('#ffd699', '#ff4400', damageLevel);
  }, [damageLevel]);

  return (
    <group>
      {/* ─── Sky Dome ─── */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[80, 16, 16]} />
        <meshBasicMaterial color={skyColor} side={THREE.BackSide} />
      </mesh>

      {/* ─── Ground (overrides house ground) ─── */}
      <mesh position={[0, -0.005, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial color={groundColor} roughness={1} />
      </mesh>

      {/* ─── Dynamic Lighting ─── */}
      <ambientLight intensity={ambientIntensity} color="#ffe8cc" />
      <directionalLight
        position={[8, 10, 10]}
        intensity={sunIntensity}
        color={sunColor}
        castShadow
      />
      <hemisphereLight args={['#ffecd2', '#3a2010', 0.2 + (1 - damageLevel) * 0.2]} />
      <pointLight position={[-8, 4, -5]} intensity={0.2} color="#ffeedd" distance={20} />

      {/* ─── Ominous red light at high damage ─── */}
      {damageLevel > 0.5 && (
        <pointLight
          position={[0, 8, 0]}
          intensity={damageLevel * 0.8}
          distance={30}
          color="#ff2200"
        />
      )}

      {/* ─── Trees ─── */}
      {TREE_POSITIONS.map((pos, i) => (
        <EnvironmentTree key={i} position={pos} damageLevel={damageLevel} />
      ))}

      {/* ─── Smoke Particles ─── */}
      <SmokeParticles damageLevel={damageLevel} />

      {/* ─── Neighbor Houses ─── */}
      {NEIGHBOR_POSITIONS.map((n, i) => (
        <NeighborHouse key={i} position={n.pos} rotation={n.rot} damageLevel={damageLevel} />
      ))}

      {/* ─── Heat shimmer plane at medium damage ─── */}
      {damageLevel > 0.3 && (
        <mesh position={[0, 3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[60, 60]} />
          <meshBasicMaterial
            color="#ff8800"
            transparent
            opacity={Math.min((damageLevel - 0.3) * 0.08, 0.05)}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
}
