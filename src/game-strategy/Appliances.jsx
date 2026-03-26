import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { APPLIANCE_POSITIONS } from './applianceData';

/* ─── Individual Appliance 3D Models ─── */

function TV({ onClick }) {
  const p = APPLIANCE_POSITIONS.tv;
  return (
    <group position={p.pos} rotation={p.rot} onClick={onClick}>
      {/* Stand base */}
      <mesh position={[0, -0.55, 0]} castShadow>
        <boxGeometry args={[0.6, 0.04, 0.25]} />
        <meshStandardMaterial color="#222" metalness={0.5} roughness={0.3} />
      </mesh>
      {/* Stand neck */}
      <mesh position={[0, -0.35, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.06, 0.4]} />
        <meshStandardMaterial color="#333" metalness={0.4} />
      </mesh>
      {/* Screen bezel */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[1.8, 1.0, 0.07]} />
        <meshStandardMaterial color="#111" roughness={0.3} />
      </mesh>
      {/* Screen display */}
      <mesh position={[0, 0, 0.04]}>
        <planeGeometry args={[1.65, 0.88]} />
        <meshStandardMaterial color="#1a2a4a" emissive="#1a2a4a" emissiveIntensity={0.4} />
      </mesh>
      <Html position={[0, 0.7, 0]} center><div className="appliance-label">📺 TV</div></Html>
    </group>
  );
}

function AC({ id, onClick }) {
  const p = APPLIANCE_POSITIONS[id];
  return (
    <group position={p.pos} rotation={p.rot} onClick={onClick}>
      <mesh castShadow>
        <boxGeometry args={[1.3, 0.32, 0.22]} />
        <meshStandardMaterial color="#f5f5f5" roughness={0.4} />
      </mesh>
      {/* Vent panel */}
      <mesh position={[0, -0.08, 0.12]}>
        <boxGeometry args={[1.1, 0.1, 0.01]} />
        <meshStandardMaterial color="#e0e0e0" roughness={0.5} />
      </mesh>
      {/* LED */}
      <mesh position={[0.5, 0.1, 0.12]}>
        <sphereGeometry args={[0.02]} />
        <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={2} />
      </mesh>
      <Html position={[0, 0.35, 0]} center><div className="appliance-label">❄️ AC</div></Html>
    </group>
  );
}

function CeilingFan({ id, onClick }) {
  const p = APPLIANCE_POSITIONS[id];
  const bladeRef = useRef();

  useFrame((_, delta) => {
    if (bladeRef.current) bladeRef.current.rotation.y += delta * 4;
  });

  return (
    <group position={p.pos} onClick={onClick}>
      {/* Rod from ceiling */}
      <mesh position={[0, 0.07, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.15]} />
        <meshStandardMaterial color="#888" metalness={0.6} />
      </mesh>
      {/* Motor hub */}
      <mesh>
        <cylinderGeometry args={[0.12, 0.12, 0.08, 16]} />
        <meshStandardMaterial color="#ddd" metalness={0.3} />
      </mesh>
      {/* Blades */}
      <group ref={bladeRef}>
        {[0, 72, 144, 216, 288].map((deg) => (
          <mesh key={deg} position={[Math.cos(deg * Math.PI / 180) * 0.5, -0.02, Math.sin(deg * Math.PI / 180) * 0.5]}
                rotation={[0, -deg * Math.PI / 180, 0]}>
            <boxGeometry args={[0.8, 0.02, 0.15]} />
            <meshStandardMaterial color="#8B6914" roughness={0.6} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function Light({ id, onClick }) {
  const p = APPLIANCE_POSITIONS[id];
  return (
    <group position={p.pos} onClick={onClick}>
      <mesh>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#fffbe6" emissive="#fffbe6" emissiveIntensity={1.5} />
      </mesh>
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.04, 0.06, 0.05]} />
        <meshStandardMaterial color="#ccc" />
      </mesh>
      <pointLight position={[0, -0.2, 0]} intensity={0.8} distance={6} color="#fff5e0" />
    </group>
  );
}

function ChargingPort({ id, onClick }) {
  const p = APPLIANCE_POSITIONS[id];
  return (
    <group position={p.pos} rotation={p.rot} onClick={onClick}>
      <mesh castShadow>
        <boxGeometry args={[0.15, 0.15, 0.04]} />
        <meshStandardMaterial color="#f0f0f0" roughness={0.5} />
      </mesh>
      {/* Socket holes */}
      <mesh position={[-0.03, 0.02, 0.025]}>
        <cylinderGeometry args={[0.015, 0.015, 0.02, 8]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[0.03, 0.02, 0.025]}>
        <cylinderGeometry args={[0.015, 0.015, 0.02, 8]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[0, -0.03, 0.025]}>
        <cylinderGeometry args={[0.015, 0.015, 0.02, 8]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <Html position={[0, 0.2, 0]} center><div className="appliance-label">🔌 Plug</div></Html>
    </group>
  );
}

function Fridge({ onClick }) {
  const p = APPLIANCE_POSITIONS.fridge;
  return (
    <group position={p.pos} rotation={p.rot} onClick={onClick}>
      {/* Body */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[0.7, 1.8, 0.65]} />
        <meshStandardMaterial color="#e8e8e8" roughness={0.4} metalness={0.2} />
      </mesh>
      {/* Door line */}
      <mesh position={[0, 0.2, 0.33]}>
        <boxGeometry args={[0.62, 0.02, 0.01]} />
        <meshStandardMaterial color="#ccc" />
      </mesh>
      {/* Handle */}
      <mesh position={[0.28, 0.5, 0.35]} castShadow>
        <boxGeometry args={[0.03, 0.4, 0.04]} />
        <meshStandardMaterial color="#aaa" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0.28, -0.3, 0.35]} castShadow>
        <boxGeometry args={[0.03, 0.4, 0.04]} />
        <meshStandardMaterial color="#aaa" metalness={0.6} roughness={0.3} />
      </mesh>
      <Html position={[0, 1.1, 0]} center><div className="appliance-label">🧊 Fridge</div></Html>
    </group>
  );
}

function InductionStove({ onClick }) {
  const p = APPLIANCE_POSITIONS.induction;
  return (
    <group position={p.pos} rotation={p.rot} onClick={onClick}>
      {/* Base */}
      <mesh castShadow>
        <boxGeometry args={[0.5, 0.05, 0.4]} />
        <meshStandardMaterial color="#111" roughness={0.2} metalness={0.3} />
      </mesh>
      {/* Heating circle */}
      <mesh position={[0, 0.03, -0.02]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.08, 0.14, 24]} />
        <meshStandardMaterial color="#c0392b" emissive="#c0392b" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0, 0.03, -0.02]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.03, 0.06, 24]} />
        <meshStandardMaterial color="#e74c3c" emissive="#e74c3c" emissiveIntensity={0.2} />
      </mesh>
      {/* Control panel */}
      <mesh position={[0, 0.03, 0.13]}>
        <boxGeometry args={[0.3, 0.01, 0.08]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      <Html position={[0, 0.3, 0]} center><div className="appliance-label">🍳 Stove</div></Html>
    </group>
  );
}

function ExhaustFan({ onClick }) {
  const p = APPLIANCE_POSITIONS.exhaust;
  const bladeRef = useRef();
  useFrame((_, delta) => {
    if (bladeRef.current) bladeRef.current.rotation.z += delta * 6;
  });

  return (
    <group position={p.pos} rotation={p.rot} onClick={onClick}>
      {/* Frame */}
      <mesh castShadow>
        <boxGeometry args={[0.5, 0.5, 0.1]} />
        <meshStandardMaterial color="#888" metalness={0.4} />
      </mesh>
      {/* Blades */}
      <group ref={bladeRef} position={[0, 0, 0.06]}>
        {[0, 90, 180, 270].map((deg) => (
          <mesh key={deg} rotation={[0, 0, deg * Math.PI / 180]}>
            <boxGeometry args={[0.35, 0.06, 0.02]} />
            <meshStandardMaterial color="#666" />
          </mesh>
        ))}
      </group>
      <Html position={[0, 0.4, 0]} center><div className="appliance-label">💨 Exhaust</div></Html>
    </group>
  );
}

function Geyser({ onClick }) {
  const p = APPLIANCE_POSITIONS.geyser;
  return (
    <group position={p.pos} rotation={p.rot} onClick={onClick}>
      {/* Body */}
      <mesh castShadow>
        <cylinderGeometry args={[0.2, 0.2, 0.6, 16]} />
        <meshStandardMaterial color="#f0f0f0" roughness={0.4} />
      </mesh>
      {/* Red indicator */}
      <mesh position={[0, 0.1, 0.21]}>
        <sphereGeometry args={[0.03]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={1} />
      </mesh>
      {/* Pipe */}
      <mesh position={[0, -0.4, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.25]} />
        <meshStandardMaterial color="#aaa" metalness={0.7} />
      </mesh>
      <Html position={[0, 0.5, 0]} center><div className="appliance-label">🚿 Geyser</div></Html>
    </group>
  );
}

/* ─── Main Appliances Component ─── */
export default function Appliances({ onApplianceClick }) {
  const handleClick = (applianceId) => (e) => {
    e.stopPropagation();
    onApplianceClick(applianceId);
  };

  return (
    <group>
      {/* Living Room */}
      <TV onClick={handleClick('tv')} />
      <AC id="ac_living" onClick={handleClick('ac_living')} />
      <CeilingFan id="fan_living" onClick={handleClick('fan_living')} />
      <Light id="light_living" onClick={handleClick('light_living')} />
      <ChargingPort id="charging_living" onClick={handleClick('charging_living')} />

      {/* Bedroom */}
      <AC id="ac_bedroom" onClick={handleClick('ac_bedroom')} />
      <CeilingFan id="fan_bedroom" onClick={handleClick('fan_bedroom')} />
      <Light id="light_bedroom" onClick={handleClick('light_bedroom')} />
      <ChargingPort id="charging_bedroom" onClick={handleClick('charging_bedroom')} />

      {/* Kitchen */}
      <Fridge onClick={handleClick('fridge')} />
      <InductionStove onClick={handleClick('induction')} />
      <Light id="light_kitchen" onClick={handleClick('light_kitchen')} />
      <ExhaustFan onClick={handleClick('exhaust')} />

      {/* Bathroom */}
      <Geyser onClick={handleClick('geyser')} />
      <Light id="light_bathroom" onClick={handleClick('light_bathroom')} />
    </group>
  );
}
