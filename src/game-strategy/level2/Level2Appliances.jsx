import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { APPLIANCE_POSITIONS } from '../applianceData';
import { playerState } from '../Player';
import { LEVEL2_APPLIANCES, L2_APPLIANCE_MAP } from './level2Data';
import * as THREE from 'three';

const GLOW_RADIUS = 2.8;

// ─── Glow + Proximity Prompt Wrapper ───
function ToggleGlow({ id, isOn, isNear, isTaskTarget, children }) {
  const glowRef = useRef();

  useFrame(() => {
    if (!glowRef.current) return;
    const t = performance.now() * 0.003;

    if (isNear || isTaskTarget) {
      glowRef.current.visible = true;
      const pulse = 0.25 + Math.sin(t * 2) * 0.12;
      glowRef.current.material.emissiveIntensity = pulse;
      const glowColor = isTaskTarget ? '#3b82f6' : (isOn ? '#f59e0b' : '#22c55e');
      glowRef.current.material.color.set(glowColor);
      glowRef.current.material.emissive.set(glowColor);
    } else {
      glowRef.current.visible = false;
    }
  });

  const pos = APPLIANCE_POSITIONS[id]?.pos || [0, 0, 0];
  const appliance = L2_APPLIANCE_MAP[id];

  return (
    <group>
      {children}
      {/* Glow sphere */}
      <mesh ref={glowRef} position={pos} visible={false}>
        <sphereGeometry args={[0.6, 16, 16]} />
        <meshStandardMaterial
          color="#22c55e"
          emissive="#22c55e"
          emissiveIntensity={0}
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* ON/OFF status indicator dot */}
      <Html position={[pos[0], pos[1] + 0.55, pos[2]]} center>
        <div className={`l2-status-dot ${isOn ? 'on' : 'off'}`}>
          {isOn ? '\u{26A1}' : '\u{25CF}'}
        </div>
      </Html>
      {/* "Press E to Toggle" prompt */}
      {isNear && (
        <Html position={[pos[0], pos[1] + 0.85, pos[2]]} center>
          <div className={`l2-toggle-prompt ${isTaskTarget ? 'task-highlight' : ''}`}>
            Press <span className="key-e">E</span> to {isOn ? 'Turn OFF' : 'Turn ON'}
            <div className="l2-toggle-watt">{appliance?.wattage}W</div>
          </div>
        </Html>
      )}
    </group>
  );
}

// ════════════════════════════════════════════════════════════
//  INDIVIDUAL APPLIANCE MODELS WITH ON/OFF STATES
// ════════════════════════════════════════════════════════════

// ─── Ceiling Fan ───
function CeilingFanL2({ isOn }) {
  const p = APPLIANCE_POSITIONS.ceiling_fan;
  const bladeRef = useRef();
  const speedRef = useRef(0);

  useFrame((_, delta) => {
    // Smooth spin up/down
    const target = isOn ? 4 : 0;
    speedRef.current = THREE.MathUtils.lerp(speedRef.current, target, delta * 2);
    if (bladeRef.current) bladeRef.current.rotation.y += speedRef.current * delta;
  });

  return (
    <group position={p.pos}>
      <mesh position={[0, 0.07, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.15]} />
        <meshStandardMaterial color="#888" metalness={0.6} />
      </mesh>
      <mesh>
        <cylinderGeometry args={[0.12, 0.12, 0.08, 16]} />
        <meshStandardMaterial color={isOn ? '#ddd' : '#999'} metalness={0.3} />
      </mesh>
      <group ref={bladeRef}>
        {[0, 72, 144, 216, 288].map((deg) => (
          <mesh key={deg}
            position={[Math.cos(deg * Math.PI / 180) * 0.5, -0.02, Math.sin(deg * Math.PI / 180) * 0.5]}
            rotation={[0, -deg * Math.PI / 180, 0]}>
            <boxGeometry args={[0.8, 0.02, 0.15]} />
            <meshStandardMaterial color={isOn ? '#8B6914' : '#665020'} roughness={0.6} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// ─── Smart TV ───
function TVL2({ isOn }) {
  const p = APPLIANCE_POSITIONS.tv_smart;
  const screenRef = useRef();

  useFrame(() => {
    if (screenRef.current) {
      const target = isOn ? 0.6 : 0;
      screenRef.current.material.emissiveIntensity = THREE.MathUtils.lerp(
        screenRef.current.material.emissiveIntensity, target, 0.05
      );
    }
  });

  return (
    <group position={p.pos} rotation={p.rot}>
      <mesh position={[0, -0.55, 0]} castShadow>
        <boxGeometry args={[0.6, 0.04, 0.25]} />
        <meshStandardMaterial color="#222" metalness={0.5} roughness={0.3} />
      </mesh>
      <mesh position={[0, -0.35, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.06, 0.4]} />
        <meshStandardMaterial color="#333" metalness={0.4} />
      </mesh>
      <mesh castShadow>
        <boxGeometry args={[1.8, 1.0, 0.07]} />
        <meshStandardMaterial color="#111" roughness={0.3} />
      </mesh>
      <mesh ref={screenRef} position={[0, 0, 0.04]}>
        <planeGeometry args={[1.65, 0.88]} />
        <meshStandardMaterial
          color={isOn ? '#1a4a8a' : '#0a0a0a'}
          emissive={isOn ? '#1a4a8a' : '#000000'}
          emissiveIntensity={0}
        />
      </mesh>
      {isOn && (
        <pointLight position={[0, 0, 0.3]} intensity={0.3} distance={3} color="#4488cc" />
      )}
    </group>
  );
}

// ─── AC ───
function ACL2({ isOn }) {
  const p = APPLIANCE_POSITIONS.ac_1_5ton;
  const airRef = useRef();

  useFrame(() => {
    if (airRef.current) {
      const t = performance.now() * 0.01;
      airRef.current.visible = isOn;
      if (isOn) {
        airRef.current.position.y = -0.2 + Math.sin(t) * 0.05;
        airRef.current.material.opacity = 0.15 + Math.sin(t * 2) * 0.05;
      }
    }
  });

  return (
    <group position={p.pos} rotation={p.rot}>
      <mesh castShadow>
        <boxGeometry args={[1.3, 0.32, 0.22]} />
        <meshStandardMaterial color={isOn ? '#f5f5f5' : '#ddd'} roughness={0.4} />
      </mesh>
      <mesh position={[0, -0.08, 0.12]}>
        <boxGeometry args={[1.1, 0.1, 0.01]} />
        <meshStandardMaterial color="#e0e0e0" roughness={0.5} />
      </mesh>
      {/* Power LED */}
      <mesh position={[0.5, 0.1, 0.12]}>
        <sphereGeometry args={[0.02]} />
        <meshStandardMaterial
          color={isOn ? '#22c55e' : '#555'}
          emissive={isOn ? '#22c55e' : '#000'}
          emissiveIntensity={isOn ? 2 : 0}
        />
      </mesh>
      {/* Airflow particles when ON */}
      <mesh ref={airRef} position={[0, -0.2, 0.15]} visible={false}>
        <planeGeometry args={[1.0, 0.15]} />
        <meshStandardMaterial
          color="#aaddff"
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
        />
      </mesh>
      {isOn && (
        <pointLight position={[0, -0.3, 0.2]} intensity={0.15} distance={2} color="#aaddff" />
      )}
    </group>
  );
}

// ─── Wi-Fi Router ───
function WifiRouterL2({ isOn }) {
  const p = APPLIANCE_POSITIONS.wifi_router;
  const ledRef = useRef();

  useFrame(() => {
    if (ledRef.current) {
      if (isOn) {
        ledRef.current.material.emissiveIntensity = 0.5 + Math.sin(performance.now() * 0.005) * 0.5;
      } else {
        ledRef.current.material.emissiveIntensity = 0;
      }
    }
  });

  return (
    <group position={p.pos} rotation={p.rot}>
      <mesh castShadow>
        <boxGeometry args={[0.25, 0.04, 0.18]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.3} />
      </mesh>
      <mesh position={[-0.08, 0.12, -0.06]}>
        <cylinderGeometry args={[0.008, 0.008, 0.2]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[0.08, 0.12, -0.06]}>
        <cylinderGeometry args={[0.008, 0.008, 0.2]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh ref={ledRef} position={[0, 0.025, 0.08]}>
        <sphereGeometry args={[0.012, 8, 8]} />
        <meshStandardMaterial
          color={isOn ? '#22c55e' : '#555'}
          emissive={isOn ? '#22c55e' : '#000'}
          emissiveIntensity={0}
        />
      </mesh>
    </group>
  );
}

// ─── Set-Top Box ───
function SetTopBoxL2({ isOn }) {
  const p = APPLIANCE_POSITIONS.set_top_box;

  return (
    <group position={p.pos} rotation={p.rot}>
      <mesh castShadow>
        <boxGeometry args={[0.3, 0.06, 0.2]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.3} metalness={0.2} />
      </mesh>
      <mesh position={[0.12, 0.035, 0.09]}>
        <sphereGeometry args={[0.012, 8, 8]} />
        <meshStandardMaterial
          color={isOn ? '#ef4444' : '#555'}
          emissive={isOn ? '#ef4444' : '#000'}
          emissiveIntensity={isOn ? 1 : 0}
        />
      </mesh>
    </group>
  );
}

// ─── Phone Charger ───
function PhoneChargerL2({ isOn }) {
  const pos = APPLIANCE_POSITIONS.phone_charger?.pos || [5, 0.55, -7.5];
  const rot = APPLIANCE_POSITIONS.phone_charger?.rot || [0, 0, 0];
  const ledRef = useRef();

  useFrame(() => {
    if (ledRef.current) {
      if (isOn) {
        const t = performance.now() * 0.003;
        ledRef.current.material.emissiveIntensity = 0.4 + Math.sin(t * 2) * 0.3;
      } else {
        ledRef.current.material.emissiveIntensity = 0;
      }
    }
  });

  return (
    <group position={pos} rotation={rot}>
      <mesh castShadow>
        <boxGeometry args={[0.12, 0.06, 0.08]} />
        <meshStandardMaterial color="#f5f5f5" />
      </mesh>
      <mesh position={[0.06, 0, 0]}>
        <boxGeometry args={[0.02, 0.03, 0.05]} />
        <meshStandardMaterial color="#555" />
      </mesh>
      <mesh position={[0.08, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.008, 0.008, 0.3]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh ref={ledRef} position={[0, 0.035, 0]}>
        <sphereGeometry args={[0.01, 8, 8]} />
        <meshStandardMaterial
          color={isOn ? '#22c55e' : '#555'}
          emissive={isOn ? '#22c55e' : '#000'}
          emissiveIntensity={0}
        />
      </mesh>
    </group>
  );
}

// ─── Fridge ───
function FridgeL2({ isOn }) {
  const p = APPLIANCE_POSITIONS.fridge;
  const humRef = useRef();

  useFrame(() => {
    if (humRef.current) {
      if (isOn) {
        const t = performance.now() * 0.001;
        humRef.current.material.emissiveIntensity = 0.3 + Math.sin(t * 4) * 0.1;
      } else {
        humRef.current.material.emissiveIntensity = 0;
      }
    }
  });

  return (
    <group position={p.pos} rotation={p.rot}>
      <mesh castShadow>
        <boxGeometry args={[0.7, 1.8, 0.65]} />
        <meshStandardMaterial color={isOn ? '#e8e8e8' : '#d0d0d0'} roughness={0.4} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0.2, 0.33]}>
        <boxGeometry args={[0.62, 0.02, 0.01]} />
        <meshStandardMaterial color="#ccc" />
      </mesh>
      <mesh position={[0.28, 0.5, 0.35]} castShadow>
        <boxGeometry args={[0.03, 0.4, 0.04]} />
        <meshStandardMaterial color="#aaa" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0.28, -0.3, 0.35]} castShadow>
        <boxGeometry args={[0.03, 0.4, 0.04]} />
        <meshStandardMaterial color="#aaa" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Compressor hum indicator */}
      <mesh ref={humRef} position={[-0.28, 0.7, 0.35]}>
        <sphereGeometry args={[0.02]} />
        <meshStandardMaterial
          color={isOn ? '#22c55e' : '#555'}
          emissive={isOn ? '#22c55e' : '#000'}
          emissiveIntensity={0}
        />
      </mesh>
    </group>
  );
}

// ─── Induction Cooktop ───
function InductionL2({ isOn }) {
  const p = APPLIANCE_POSITIONS.induction;
  const ringRef = useRef();

  useFrame(() => {
    if (ringRef.current) {
      const target = isOn ? 1.2 : 0;
      ringRef.current.material.emissiveIntensity = THREE.MathUtils.lerp(
        ringRef.current.material.emissiveIntensity, target, 0.05
      );
    }
  });

  return (
    <group position={p.pos} rotation={p.rot}>
      <mesh castShadow>
        <boxGeometry args={[0.5, 0.05, 0.4]} />
        <meshStandardMaterial color="#111" roughness={0.2} metalness={0.3} />
      </mesh>
      <mesh ref={ringRef} position={[0, 0.03, -0.02]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.08, 0.14, 24]} />
        <meshStandardMaterial
          color={isOn ? '#ff4400' : '#333'}
          emissive={isOn ? '#c0392b' : '#000'}
          emissiveIntensity={0}
        />
      </mesh>
      <mesh position={[0, 0.03, 0.13]}>
        <boxGeometry args={[0.3, 0.01, 0.08]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      {isOn && (
        <pointLight position={[0, 0.1, -0.02]} intensity={0.4} distance={1.5} color="#ff4400" />
      )}
    </group>
  );
}

// ─── Microwave ───
function MicrowaveL2({ isOn }) {
  const p = APPLIANCE_POSITIONS.microwave;
  const interiorRef = useRef();

  useFrame(() => {
    if (interiorRef.current) {
      const target = isOn ? 0.8 : 0;
      interiorRef.current.material.emissiveIntensity = THREE.MathUtils.lerp(
        interiorRef.current.material.emissiveIntensity, target, 0.05
      );
    }
  });

  return (
    <group position={p.pos} rotation={p.rot}>
      <mesh castShadow>
        <boxGeometry args={[0.5, 0.35, 0.35]} />
        <meshStandardMaterial color="#2d2d2d" roughness={0.3} metalness={0.3} />
      </mesh>
      <mesh ref={interiorRef} position={[-0.05, 0, 0.18]}>
        <boxGeometry args={[0.3, 0.25, 0.01]} />
        <meshStandardMaterial
          color={isOn ? '#ffcc00' : '#111'}
          emissive={isOn ? '#ffaa00' : '#000'}
          emissiveIntensity={0}
          roughness={0.1}
        />
      </mesh>
      <mesh position={[0.18, 0, 0.19]}>
        <boxGeometry args={[0.02, 0.2, 0.03]} />
        <meshStandardMaterial color="#666" metalness={0.5} />
      </mesh>
      <mesh position={[0.18, 0.08, 0.18]}>
        <boxGeometry args={[0.08, 0.04, 0.01]} />
        <meshStandardMaterial
          color={isOn ? '#22c55e' : '#333'}
          emissive={isOn ? '#22c55e' : '#000'}
          emissiveIntensity={isOn ? 0.5 : 0}
        />
      </mesh>
    </group>
  );
}

// ─── Mixer Grinder ───
function MixerGrinderL2({ isOn }) {
  const p = APPLIANCE_POSITIONS.mixer_grinder;
  const jarRef = useRef();
  const speedRef = useRef(0);

  useFrame((_, delta) => {
    const target = isOn ? 15 : 0;
    speedRef.current = THREE.MathUtils.lerp(speedRef.current, target, delta * 3);
    if (jarRef.current) {
      jarRef.current.rotation.y += speedRef.current * delta;
    }
  });

  return (
    <group position={p.pos} rotation={p.rot}>
      <mesh castShadow>
        <boxGeometry args={[0.25, 0.12, 0.2]} />
        <meshStandardMaterial color="#e0e0e0" roughness={0.3} metalness={0.2} />
      </mesh>
      <mesh ref={jarRef} position={[0, 0.22, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.1, 0.3, 12]} />
        <meshStandardMaterial color="#ddd" transparent opacity={0.7} roughness={0.1} />
      </mesh>
      <mesh position={[0, 0.38, 0]}>
        <cylinderGeometry args={[0.09, 0.08, 0.04, 12]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[0.1, 0.03, 0.11]}>
        <cylinderGeometry args={[0.02, 0.02, 0.02, 8]} />
        <meshStandardMaterial color={isOn ? '#22c55e' : '#e74c3c'} />
      </mesh>
    </group>
  );
}

// ─── Geyser ───
function GeyserL2({ isOn }) {
  const p = APPLIANCE_POSITIONS.geyser;
  const ledRef = useRef();

  useFrame(() => {
    if (ledRef.current) {
      if (isOn) {
        const t = performance.now() * 0.003;
        ledRef.current.material.emissiveIntensity = 0.8 + Math.sin(t) * 0.4;
      } else {
        ledRef.current.material.emissiveIntensity = 0;
      }
    }
  });

  return (
    <group position={p.pos} rotation={p.rot}>
      <mesh castShadow>
        <cylinderGeometry args={[0.2, 0.2, 0.6, 16]} />
        <meshStandardMaterial color={isOn ? '#f0f0f0' : '#d8d8d8'} roughness={0.4} />
      </mesh>
      <mesh ref={ledRef} position={[0, 0.1, 0.21]}>
        <sphereGeometry args={[0.03]} />
        <meshStandardMaterial
          color={isOn ? '#ef4444' : '#555'}
          emissive={isOn ? '#ef4444' : '#000'}
          emissiveIntensity={0}
        />
      </mesh>
      <mesh position={[0, -0.4, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.25]} />
        <meshStandardMaterial color="#aaa" metalness={0.7} />
      </mesh>
      {isOn && (
        <pointLight position={[0, 0, 0.25]} intensity={0.3} distance={1.5} color="#ff6644" />
      )}
    </group>
  );
}

// ─── Washing Machine ───
function WashingMachineL2({ isOn }) {
  const p = APPLIANCE_POSITIONS.washing_machine;
  const drumRef = useRef();
  const speedRef = useRef(0);

  useFrame((_, delta) => {
    const target = isOn ? 4 : 0;
    speedRef.current = THREE.MathUtils.lerp(speedRef.current, target, delta * 2);
    if (drumRef.current) drumRef.current.rotation.z += speedRef.current * delta;
  });

  return (
    <group position={p.pos} rotation={p.rot}>
      <mesh castShadow>
        <boxGeometry args={[0.65, 0.9, 0.6]} />
        <meshStandardMaterial color={isOn ? '#eee' : '#d8d8d8'} roughness={0.4} metalness={0.2} />
      </mesh>
      <mesh position={[0, -0.05, 0.31]}>
        <cylinderGeometry args={[0.2, 0.2, 0.02, 24]} />
        <meshStandardMaterial color={isOn ? '#88ccee' : '#aaddee'} transparent opacity={0.5} roughness={0.1} />
      </mesh>
      <mesh position={[0, -0.05, 0.32]}>
        <ringGeometry args={[0.18, 0.22, 24]} />
        <meshStandardMaterial color="#999" metalness={0.5} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={drumRef} position={[0, -0.05, 0.28]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.02, 12]} />
        <meshStandardMaterial color="#ccc" metalness={0.3} />
      </mesh>
      <mesh position={[0, 0.35, 0.28]}>
        <boxGeometry args={[0.55, 0.15, 0.02]} />
        <meshStandardMaterial color="#ddd" />
      </mesh>
      <mesh position={[0.15, 0.35, 0.3]}>
        <cylinderGeometry args={[0.04, 0.04, 0.02, 12]} />
        <meshStandardMaterial color={isOn ? '#22c55e' : '#444'} />
      </mesh>
    </group>
  );
}

// ─── LED Tube Light ───
function LEDTubeL2({ isOn }) {
  const p = APPLIANCE_POSITIONS.led_tube;
  const tubeRef = useRef();

  useFrame(() => {
    if (tubeRef.current) {
      const target = isOn ? 1.5 : 0;
      tubeRef.current.material.emissiveIntensity = THREE.MathUtils.lerp(
        tubeRef.current.material.emissiveIntensity, target, 0.08
      );
    }
  });

  return (
    <group position={p.pos} rotation={p.rot}>
      {/* Mounting bracket */}
      <mesh position={[0, 0.03, 0]}>
        <boxGeometry args={[0.8, 0.04, 0.06]} />
        <meshStandardMaterial color="#ddd" />
      </mesh>
      {/* Tube */}
      <mesh ref={tubeRef} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.025, 0.025, 0.75, 12]} />
        <meshStandardMaterial
          color={isOn ? '#fffff0' : '#e0e0e0'}
          emissive={isOn ? '#fffff0' : '#000000'}
          emissiveIntensity={0}
        />
      </mesh>
      {/* End caps */}
      <mesh position={[-0.38, 0, 0]}>
        <cylinderGeometry args={[0.028, 0.028, 0.03, 8]} />
        <meshStandardMaterial color="#aaa" metalness={0.5} />
      </mesh>
      <mesh position={[0.38, 0, 0]}>
        <cylinderGeometry args={[0.028, 0.028, 0.03, 8]} />
        <meshStandardMaterial color="#aaa" metalness={0.5} />
      </mesh>
      {isOn && (
        <pointLight position={[0, -0.2, 0]} intensity={1.2} distance={5} color="#fffff0" />
      )}
    </group>
  );
}

// ─── Table Fan (NEW) ───
function TableFanL2({ isOn }) {
  const p = APPLIANCE_POSITIONS.table_fan;
  const bladeGroupRef = useRef();
  const headRef = useRef();
  const speedRef = useRef(0);
  const oscillateRef = useRef(0);

  useFrame((_, delta) => {
    // Spin blades
    const target = isOn ? 12 : 0;
    speedRef.current = THREE.MathUtils.lerp(speedRef.current, target, delta * 3);
    if (bladeGroupRef.current) {
      bladeGroupRef.current.rotation.z += speedRef.current * delta;
    }
    // Oscillate head
    if (headRef.current && isOn) {
      oscillateRef.current += delta * 0.8;
      headRef.current.rotation.y = Math.sin(oscillateRef.current) * 0.4;
    }
  });

  return (
    <group position={p.pos} rotation={p.rot}>
      {/* Base */}
      <mesh castShadow>
        <cylinderGeometry args={[0.15, 0.18, 0.04, 16]} />
        <meshStandardMaterial color="#2a2a3a" roughness={0.4} metalness={0.3} />
      </mesh>
      {/* Stem */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.3]} />
        <meshStandardMaterial color="#444" metalness={0.5} />
      </mesh>
      {/* Head group (oscillates) */}
      <group ref={headRef} position={[0, 0.32, 0]}>
        {/* Motor housing */}
        <mesh position={[0, 0, 0.04]}>
          <cylinderGeometry args={[0.06, 0.06, 0.08, 12]} />
          <meshStandardMaterial color={isOn ? '#3a3a5a' : '#2a2a3a'} metalness={0.4} roughness={0.3} />
        </mesh>
        {/* Guard cage (front ring) */}
        <mesh position={[0, 0, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.14, 0.008, 8, 24]} />
          <meshStandardMaterial color="#666" metalness={0.6} />
        </mesh>
        {/* Guard cage (back ring) */}
        <mesh position={[0, 0, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.14, 0.006, 8, 24]} />
          <meshStandardMaterial color="#555" metalness={0.5} />
        </mesh>
        {/* Spinning blades */}
        <group ref={bladeGroupRef} position={[0, 0, 0.06]}>
          {[0, 90, 180, 270].map((deg) => (
            <mesh key={deg}
              rotation={[0, 0, (deg * Math.PI) / 180]}
              position={[Math.cos((deg * Math.PI) / 180) * 0.06, Math.sin((deg * Math.PI) / 180) * 0.06, 0]}>
              <boxGeometry args={[0.12, 0.04, 0.005]} />
              <meshStandardMaterial color={isOn ? '#88aacc' : '#667788'} roughness={0.5} />
            </mesh>
          ))}
          {/* Center hub */}
          <mesh>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshStandardMaterial color="#999" metalness={0.6} />
          </mesh>
        </group>
      </group>
      {/* Power button */}
      <mesh position={[0.06, 0.04, 0.12]}>
        <cylinderGeometry args={[0.015, 0.015, 0.02, 8]} />
        <meshStandardMaterial
          color={isOn ? '#22c55e' : '#e74c3c'}
          emissive={isOn ? '#22c55e' : '#000'}
          emissiveIntensity={isOn ? 0.5 : 0}
        />
      </mesh>
    </group>
  );
}

// ─── LED Bulb (NEW) ───
function LEDBulbL2({ isOn }) {
  const p = APPLIANCE_POSITIONS.led_bulb;
  const bulbRef = useRef();
  const glowRef = useRef();

  useFrame(() => {
    if (bulbRef.current) {
      const target = isOn ? 2.0 : 0;
      bulbRef.current.material.emissiveIntensity = THREE.MathUtils.lerp(
        bulbRef.current.material.emissiveIntensity, target, 0.08
      );
    }
    if (glowRef.current) {
      if (isOn) {
        const t = performance.now() * 0.002;
        glowRef.current.material.opacity = 0.08 + Math.sin(t) * 0.03;
        glowRef.current.visible = true;
      } else {
        glowRef.current.visible = false;
      }
    }
  });

  return (
    <group position={p.pos} rotation={p.rot}>
      {/* Ceiling mount */}
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.06, 8]} />
        <meshStandardMaterial color="#888" metalness={0.5} />
      </mesh>
      {/* Wire */}
      <mesh position={[0, -0.02, 0]}>
        <cylinderGeometry args={[0.005, 0.005, 0.12]} />
        <meshStandardMaterial color="#444" />
      </mesh>
      {/* Base (screw part) */}
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[0.03, 0.035, 0.04, 12]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.7} roughness={0.2} />
      </mesh>
      {/* Bulb body */}
      <mesh ref={bulbRef} position={[0, -0.17, 0]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial
          color={isOn ? '#fff8e1' : '#e8e8e0'}
          emissive={isOn ? '#fff8e1' : '#000000'}
          emissiveIntensity={0}
          transparent
          opacity={isOn ? 0.95 : 0.8}
        />
      </mesh>
      {/* Glow sphere (ambient light effect) */}
      <mesh ref={glowRef} position={[0, -0.17, 0]} visible={false}>
        <sphereGeometry args={[0.15, 12, 12]} />
        <meshStandardMaterial
          color="#fff8e1"
          transparent
          opacity={0.08}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      {/* Point light when ON */}
      {isOn && (
        <pointLight position={[0, -0.17, 0]} intensity={0.8} distance={4} color="#fff8e1" />
      )}
    </group>
  );
}

// ─── Appliance Labels (proximity-based — only show when near) ───
function ApplianceLabel({ id, isOn, showLevel }) {
  const pos = APPLIANCE_POSITIONS[id]?.pos;
  if (!pos) return null;
  if (!showLevel || showLevel === 'hidden') return null;
  const appliance = L2_APPLIANCE_MAP[id];
  if (!appliance) return null;

  const labelOffsets = {
    ceiling_fan: 0.3, tv_smart: 0.7, ac_1_5ton: 0.35, fridge: 1.1,
    washing_machine: 0.65, geyser: 0.5, wifi_router: 0.3, set_top_box: 0.2,
    phone_charger: 0.4, induction: 0.3, microwave: 0.35, mixer_grinder: 0.5,
    led_tube: 0.3, table_fan: 0.55, led_bulb: 0.2,
  };
  const yOffset = labelOffsets[id] || 0.5;

  return (
    <Html position={[pos[0], pos[1] + yOffset, pos[2]]} center>
      <div className={`l2-appliance-label-prox ${showLevel}`}>
        {showLevel === 'arrow' && (
          <div className="l2-prox-arrow">▼</div>
        )}
        {(showLevel === 'name' || showLevel === 'interact') && (
          <div className={`l2-prox-name ${isOn ? 'label-on' : 'label-off'}`}>
            {appliance.icon} {appliance.name}
            {isOn && <span className="label-watt">{appliance.wattage}W</span>}
          </div>
        )}
        {showLevel === 'interact' && (
          <div className="l2-prox-interact">Press <span className="key-e">E</span> to {isOn ? 'Turn OFF' : 'Turn ON'}</div>
        )}
      </div>
    </Html>
  );
}

// ─── Compute proximity levels for all appliances ───
function getProximityLevels(px, pz) {
  const distances = [];
  for (const a of LEVEL2_APPLIANCES) {
    const ap = APPLIANCE_POSITIONS[a.id];
    if (!ap) continue;
    const dx = px - ap.pos[0], dz = pz - ap.pos[2];
    const dist = Math.sqrt(dx * dx + dz * dz);
    distances.push({ id: a.id, dist });
  }
  distances.sort((a, b) => a.dist - b.dist);
  const levels = {};
  let shown = 0;
  for (const { id, dist } of distances) {
    if (shown >= 3) { levels[id] = 'hidden'; continue; }
    if (dist <= 2) { levels[id] = 'interact'; shown++; }
    else if (dist <= 3) { levels[id] = 'name'; shown++; }
    else if (dist <= 5) { levels[id] = 'arrow'; shown++; }
    else { levels[id] = 'hidden'; }
  }
  return levels;
}

// ─── Model mapping ───
const MODEL_MAP = {
  ceiling_fan: CeilingFanL2,
  tv_smart: TVL2,
  ac_1_5ton: ACL2,
  wifi_router: WifiRouterL2,
  set_top_box: SetTopBoxL2,
  phone_charger: PhoneChargerL2,
  fridge: FridgeL2,
  induction: InductionL2,
  microwave: MicrowaveL2,
  mixer_grinder: MixerGrinderL2,
  geyser: GeyserL2,
  washing_machine: WashingMachineL2,
  led_tube: LEDTubeL2,
  table_fan: TableFanL2,
  led_bulb: LEDBulbL2,
};

// ════════════════════════════════════════════════════════════
//  MAIN EXPORT — Level2Appliances
// ════════════════════════════════════════════════════════════

export { getProximityLevels };

export default function Level2Appliances({ applianceStates, nearestAppliance, taskTargetIds, proximityLevels }) {
  return (
    <group>
      {LEVEL2_APPLIANCES.map((appliance) => {
        const Model = MODEL_MAP[appliance.id];
        if (!Model) return null;

        const isOn = !!applianceStates[appliance.id];
        const isNear = nearestAppliance === appliance.id;
        const isTaskTarget = taskTargetIds && taskTargetIds.includes(appliance.id);
        const showLevel = proximityLevels ? proximityLevels[appliance.id] : 'hidden';

        return (
          <ToggleGlow key={appliance.id} id={appliance.id} isOn={isOn} isNear={isNear} isTaskTarget={isTaskTarget}>
            <Model isOn={isOn} />
            <ApplianceLabel id={appliance.id} isOn={isOn} showLevel={showLevel} />
          </ToggleGlow>
        );
      })}
    </group>
  );
}
