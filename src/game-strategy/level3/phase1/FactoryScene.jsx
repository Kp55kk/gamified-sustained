// ═══════════════════════════════════════════════════════════
//  FACTORY 3D SCENE — Coal Power Plant with Interior
//  Shows: Coal conveyor, furnace, turbine, smokestacks
// ═══════════════════════════════════════════════════════════
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

// ─── Coal Block (animated along conveyor) ───
function CoalBlock({ startX, speed, furnaceX }) {
  const ref = useRef();
  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.position.x += speed * delta;
    if (ref.current.position.x > furnaceX) {
      ref.current.position.x = startX;
    }
    // Slight bobbing
    ref.current.position.y = 0.55 + Math.sin(performance.now() * 0.005 + startX) * 0.03;
  });
  return (
    <mesh ref={ref} position={[startX, 0.55, 0]} castShadow>
      <boxGeometry args={[0.3, 0.25, 0.25]} />
      <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
    </mesh>
  );
}

// ─── Fire Particles (inside furnace) ───
function FireParticles({ position }) {
  const groupRef = useRef();
  const particles = useMemo(() =>
    Array.from({ length: 15 }, () => ({
      x: (Math.random() - 0.5) * 1.5,
      z: (Math.random() - 0.5) * 1.5,
      speed: 1 + Math.random() * 2,
      size: 0.08 + Math.random() * 0.15,
      startY: Math.random() * 0.5,
      hue: Math.random() > 0.5 ? '#ff4400' : '#ff8800',
    })), []);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.children.forEach((child, i) => {
      const p = particles[i];
      if (!p) return;
      child.position.y += p.speed * delta;
      if (child.position.y > 3) {
        child.position.y = p.startY;
        child.position.x = (Math.random() - 0.5) * 1.5;
        child.position.z = (Math.random() - 0.5) * 1.5;
      }
      const fade = 1 - child.position.y / 3;
      child.material.opacity = fade * 0.7;
    });
  });

  return (
    <group ref={groupRef} position={position}>
      {particles.map((p, i) => (
        <mesh key={i} position={[p.x, p.startY, p.z]}>
          <sphereGeometry args={[p.size, 6, 6]} />
          <meshBasicMaterial color={p.hue} transparent opacity={0.7} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

// ─── Smoke Rising from Stacks ───
function StackSmoke({ position }) {
  const groupRef = useRef();
  const particles = useMemo(() =>
    Array.from({ length: 10 }, () => ({
      x: (Math.random() - 0.5) * 0.6,
      z: (Math.random() - 0.5) * 0.6,
      speed: 0.5 + Math.random() * 1.0,
      size: 0.3 + Math.random() * 0.5,
      startY: Math.random() * 2,
    })), []);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.children.forEach((child, i) => {
      const p = particles[i];
      if (!p) return;
      child.position.y += p.speed * delta;
      if (child.position.y > 8) {
        child.position.y = 0;
        child.position.x = (Math.random() - 0.5) * 0.6;
      }
      child.material.opacity = Math.max(0, 0.35 - child.position.y * 0.04);
      child.scale.setScalar(1 + child.position.y * 0.15);
    });
  });

  return (
    <group ref={groupRef} position={position}>
      {particles.map((p, i) => (
        <mesh key={i} position={[p.x, p.startY, p.z]}>
          <sphereGeometry args={[p.size, 6, 6]} />
          <meshBasicMaterial color="#555" transparent opacity={0.3} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

// ─── Spinning Turbine ───
function Turbine({ position }) {
  const ref = useRef();
  useFrame(() => {
    if (ref.current) ref.current.rotation.z += 0.03;
  });
  return (
    <group position={position}>
      {/* Turbine housing */}
      <mesh>
        <cylinderGeometry args={[1.2, 1.2, 0.4, 16]} />
        <meshStandardMaterial color="#4a5568" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Spinning blades */}
      <group ref={ref} rotation={[Math.PI / 2, 0, 0]}>
        {[0, 1, 2, 3, 4, 5].map(i => (
          <mesh key={i} rotation={[0, 0, (i * Math.PI) / 3]} position={[0, 0, 0.22]}>
            <boxGeometry args={[0.15, 1.0, 0.05]} />
            <meshStandardMaterial color="#718096" metalness={0.7} roughness={0.2} />
          </mesh>
        ))}
      </group>
      {/* Center hub */}
      <mesh position={[0, 0, 0.3]}>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshStandardMaterial color="#e53e3e" metalness={0.5} roughness={0.3} />
      </mesh>
    </group>
  );
}

// ═══════════════════════════════════════════════════════════
//  FACTORY EXTERIOR (visible from outside)
// ═══════════════════════════════════════════════════════════
export function FactoryExterior({ position = [-25, 0, 0], isTarget = false }) {
  const glowRef = useRef();
  useFrame(() => {
    if (glowRef.current && isTarget) {
      const t = performance.now() * 0.003;
      glowRef.current.emissiveIntensity = 0.5 + Math.sin(t) * 0.3;
    }
  });

  return (
    <group position={position}>
      {/* Main factory building */}
      <mesh position={[0, 3, 0]} castShadow>
        <boxGeometry args={[8, 6, 6]} />
        <meshStandardMaterial color="#4a4a4a" roughness={0.8} />
      </mesh>
      {/* Roof */}
      <mesh position={[0, 6.2, 0]} castShadow>
        <boxGeometry args={[8.5, 0.4, 6.5]} />
        <meshStandardMaterial color="#333" roughness={0.7} />
      </mesh>
      {/* Smokestack 1 */}
      <mesh position={[-2, 6, -2]} castShadow>
        <cylinderGeometry args={[0.5, 0.6, 6, 8]} />
        <meshStandardMaterial color="#555" roughness={0.7} />
      </mesh>
      <StackSmoke position={[-2, 9, -2]} />
      {/* Smokestack 2 */}
      <mesh position={[2, 5, -2]} castShadow>
        <cylinderGeometry args={[0.4, 0.5, 4, 8]} />
        <meshStandardMaterial color="#555" roughness={0.7} />
      </mesh>
      <StackSmoke position={[2, 7, -2]} />
      {/* Windows (orange glow) */}
      {[-2, 0, 2].map((x, i) => (
        <mesh key={i} position={[x, 3, 3.01]}>
          <planeGeometry args={[1.2, 1.5]} />
          <meshStandardMaterial color="#ff6600" emissive="#ff4400" emissiveIntensity={0.6} />
        </mesh>
      ))}
      {/* Entrance (right side, facing house) */}
      <mesh position={[4.01, 1.5, 0]}>
        <planeGeometry args={[2.5, 3]} />
        <meshStandardMaterial color="#2d1810" roughness={0.6} />
      </mesh>
      {/* "ENTER" sign */}
      {isTarget && (
        <Html position={[4.5, 4, 0]} center>
          <div style={{
            background: 'rgba(220,38,38,0.95)',
            border: '2px solid #fbbf24',
            borderRadius: '10px',
            padding: '6px 14px',
            fontFamily: "'Fredoka',sans-serif",
            fontSize: '13px',
            fontWeight: 700,
            color: '#fff',
            textAlign: 'center',
            animation: 'l3p1-doorpulse 1.5s ease infinite',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
          }}>
            <div style={{ fontSize: '18px' }}>🏭</div>
            <div>Power Plant</div>
            <div style={{ fontSize: '11px', color: '#fbbf24' }}>Walk inside →</div>
          </div>
        </Html>
      )}
      {/* Factory internal glow */}
      <pointLight position={[0, 2, 0]} intensity={0.8} distance={10} color="#ff4400" />
      {/* Fire glow visible through windows */}
      <pointLight position={[0, 3, 3]} intensity={0.4} distance={5} color="#ff6600" />
      {/* Glowing entrance frame when target */}
      {isTarget && (
        <mesh position={[4.01, 1.5, 0]}>
          <planeGeometry args={[2.8, 3.3]} />
          <meshStandardMaterial
            ref={glowRef}
            color="#22c55e"
            emissive="#22c55e"
            emissiveIntensity={0.5}
            transparent
            opacity={0.3}
          />
        </mesh>
      )}
    </group>
  );
}

// ═══════════════════════════════════════════════════════════
//  FACTORY INTERIOR OVERLAY (full-screen 3D experience)
//  Shows: conveyor → furnace → turbine → grid → emissions
// ═══════════════════════════════════════════════════════════
export const FACTORY_STATIONS = [
  {
    id: 'coal_arrival',
    title: 'Station 1: Coal Arrival',
    description: 'Trains bring thousands of tons of coal from mines across India. This coal was formed over 300 MILLION years — we burn it in hours.',
    fact: 'India mines 900 million tons of coal per year — the 2nd highest in the world!',
    icon: '⛏️',
  },
  {
    id: 'conveyor',
    title: 'Station 2: Coal Conveyor Belt',
    description: 'Coal is crushed into fine powder and carried by conveyor belts to the massive furnace. Watch the coal blocks move toward the fire...',
    fact: 'A power plant burns 230 kg of coal EVERY SECOND — that\'s 20,000 tons per day!',
    icon: '⚙️',
  },
  {
    id: 'furnace',
    title: 'Station 3: The Burning Furnace 🔥',
    description: 'Coal powder is blown into a furnace at 1,500°C. Look at the flames! Every watt of YOUR electricity starts here — with FIRE.',
    fact: 'For every 1 kWh of electricity, 0.71 kg of CO₂ is released into the sky!',
    icon: '🔥',
  },
  {
    id: 'turbine',
    title: 'Station 4: Steam Turbine',
    description: 'The heat boils water into super-heated steam which spins turbine blades at 3,000 RPM, generating electricity.',
    fact: 'Only 33% of coal energy becomes electricity — TWO-THIRDS is WASTED as heat!',
    icon: '⚡',
  },
  {
    id: 'emissions',
    title: 'Station 5: The CO₂ Cloud ☁️',
    description: 'Look up! That thick gray smoke pouring from the stacks? That\'s CO₂, SO₂, and toxic particles — going directly into the air YOU breathe.',
    fact: 'YOUR appliances right now are burning coal at this rate:',
    icon: '💨',
    showAppliances: true,
  },
];

// ─── Outdoor Path (walkway from house to factory) ───
export function OutdoorPath() {
  return (
    <group>
      {/* Concrete path from door to outside */}
      <mesh position={[-12, 0.01, -2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4, 2]} />
        <meshStandardMaterial color="#8a8a7a" roughness={0.9} />
      </mesh>
      {/* Path to factory */}
      <mesh position={[-18, 0.01, -1]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12, 2.5]} />
        <meshStandardMaterial color="#6a6a5a" roughness={0.9} />
      </mesh>
      {/* Arrow markers on path */}
      {[-14, -17, -20].map((x, i) => (
        <mesh key={i} position={[x, 0.02, -1]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
          <planeGeometry args={[0.5, 0.8]} />
          <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.3} transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  );
}

// ─── Indian EB Meter 3D (outside left wall) ───
export function IndianEBMeter3D({ isTarget = false }) {
  const glowRef = useRef();
  useFrame(() => {
    if (glowRef.current && isTarget) {
      const t = performance.now() * 0.003;
      glowRef.current.emissiveIntensity = 1.0 + Math.sin(t) * 0.5;
    }
  });

  return (
    <group position={[-10.8, 0, -2]}>
      {/* Pole */}
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 3, 6]} />
        <meshStandardMaterial color="#777" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* Meter box */}
      <mesh position={[0, 2.2, 0.15]} castShadow>
        <boxGeometry args={[0.6, 0.8, 0.15]} />
        <meshStandardMaterial color="#d4d4d4" metalness={0.3} roughness={0.5} />
      </mesh>
      {/* Glass window */}
      <mesh position={[0, 2.3, 0.24]}>
        <planeGeometry args={[0.45, 0.4]} />
        <meshStandardMaterial color="#1a2332" metalness={0.1} roughness={0.2} transparent opacity={0.8} />
      </mesh>
      {/* Spinning disc (red indicator) */}
      <mesh position={[0, 2.1, 0.24]}>
        <circleGeometry args={[0.06, 12]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.5} />
      </mesh>
      {/* Wires going to house */}
      <mesh position={[0.3, 3, 0]} rotation={[0, 0, -0.3]}>
        <cylinderGeometry args={[0.015, 0.015, 1.5, 4]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      <mesh position={[-0.3, 3, 0]} rotation={[0, 0, 0.3]}>
        <cylinderGeometry args={[0.015, 0.015, 1.5, 4]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      {/* Glowing indicator when target */}
      {isTarget && (
        <>
          <mesh position={[0, 2.2, 0.25]}>
            <boxGeometry args={[0.7, 0.9, 0.02]} />
            <meshStandardMaterial
              ref={glowRef}
              color="#8b5cf6"
              emissive="#8b5cf6"
              emissiveIntensity={1.0}
              transparent
              opacity={0.25}
            />
          </mesh>
          <pointLight position={[0, 2.2, 0.5]} intensity={0.6} distance={3} color="#8b5cf6" />
          <Html position={[0, 3.2, 0]} center>
            <div style={{
              background: 'rgba(139,92,246,0.95)',
              border: '2px solid #fbbf24',
              borderRadius: '8px',
              padding: '4px 10px',
              fontFamily: "'Fredoka',sans-serif",
              fontSize: '11px',
              fontWeight: 700,
              color: '#fff',
              textAlign: 'center',
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
            }}>
              <div>📊 EB Meter</div>
              <div style={{ fontSize: '10px' }}>Press <span style={{ background: '#22c55e', color: '#000', padding: '1px 6px', borderRadius: '3px' }}>E</span></div>
            </div>
          </Html>
        </>
      )}
    </group>
  );
}
