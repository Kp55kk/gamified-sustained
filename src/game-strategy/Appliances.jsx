import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { APPLIANCE_POSITIONS, APPLIANCE_DATA, INTERACTABLE_IDS, IDLE_CHATTER } from './applianceData';
import { WINDOW_POSITIONS } from './House';
import { playerState } from './Player';
import * as THREE from 'three';

const GLOW_RADIUS = 2.8;

// Track room visits globally for emotional states
const roomVisitTracker = { 'Living Room': 0, 'Bedroom': 0, 'Kitchen': 0, 'Bathroom': 0 };
let lastTrackedRoom = '';

function trackRoomVisit(room) {
  if (room !== lastTrackedRoom) {
    lastTrackedRoom = room;
    if (roomVisitTracker[room] !== undefined) {
      roomVisitTracker[room]++;
    }
  }
}

function getApplianceRoom(id) {
  return APPLIANCE_DATA[id]?.room || 'Living Room';
}

// ─── Watt color helper (used in labels) ───
function getWattColor(wattage) {
  const w = typeof wattage === 'string' ? parseInt(wattage) : wattage;
  if (isNaN(w)) return '#fff';
  if (w < 100) return '#22c55e';   // Green
  if (w <= 500) return '#f59e0b';  // Amber
  return '#ef4444';                 // Red
}


// ─── Glow Effect Wrapper ───
function GlowAppliance({ children, id, activeId, interacted }) {
  const glowRef = useRef();
  const isNear = playerState.nearestAppliance === id;
  const isActive = activeId === id;

  useFrame(() => {
    if (!glowRef.current) return;
    const t = performance.now() * 0.003;
    if (isNear && !isActive) {
      glowRef.current.visible = true;
      glowRef.current.material.emissiveIntensity = 0.25 + Math.sin(t * 2) * 0.1;
    } else {
      glowRef.current.visible = false;
    }
  });

  const pos = APPLIANCE_POSITIONS[id]?.pos || [0, 0, 0];

  return (
    <group>
      {children}
      <mesh ref={glowRef} position={pos} visible={false}>
        <sphereGeometry args={[0.6, 16, 16]} />
        <meshStandardMaterial
          color="#22c55e"
          emissive="#22c55e"
          emissiveIntensity={0}
          transparent
          opacity={0.12}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

// ─── Window Glow Effect ───
function WindowGlow({ windowId, position }) {
  const glowRef = useRef();

  useFrame(() => {
    if (!glowRef.current) return;
    const dx = playerState.x - position[0];
    const dz = playerState.z - position[2];
    const dist = Math.sqrt(dx * dx + dz * dz);
    const t = performance.now() * 0.003;

    if (dist < 2.5) {
      glowRef.current.visible = true;
      glowRef.current.material.emissiveIntensity = 0.2 + Math.sin(t * 2) * 0.1;
    } else {
      glowRef.current.visible = false;
    }
  });

  return (
    <mesh ref={glowRef} position={position} visible={false}>
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshStandardMaterial
        color="#87CEEB"
        emissive="#87CEEB"
        emissiveIntensity={0}
        transparent
        opacity={0.1}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// ─── Individual 3D Models ───

function TV({ onClick, active }) {
  const p = APPLIANCE_POSITIONS.tv_smart;
  return (
    <group position={p.pos} rotation={p.rot} onClick={onClick}>
      <mesh position={[0, -0.55, 0]} castShadow>
        <boxGeometry args={[0.6, 0.04, 0.25]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.6} roughness={0.2} />
      </mesh>
      <mesh position={[0, -0.35, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.06, 0.4]} />
        <meshStandardMaterial color="#2c2c2c" metalness={0.5} />
      </mesh>
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[1.8, 1.0, 0.07]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.15} metalness={0.3} />
      </mesh>
      <mesh position={[0, 0, 0.04]}>
        <planeGeometry args={[1.65, 0.88]} />
        <meshStandardMaterial color="#0d1b3e" emissive="#1e3a6e" emissiveIntensity={0.5} />
      </mesh>

    </group>
  );
}

function AC({ onClick, active }) {
  const p = APPLIANCE_POSITIONS.ac_1_5ton;
  return (
    <group position={p.pos} rotation={p.rot} onClick={onClick}>
      <mesh castShadow>
        <boxGeometry args={[1.3, 0.32, 0.22]} />
        <meshStandardMaterial color="#f0f0f0" roughness={0.3} metalness={0.15} />
      </mesh>
      <mesh position={[0, -0.08, 0.12]}>
        <boxGeometry args={[1.1, 0.1, 0.01]} />
        <meshStandardMaterial color="#d4d4d4" roughness={0.4} />
      </mesh>
      <mesh position={[0.5, 0.1, 0.12]}>
        <sphereGeometry args={[0.02]} />
        <meshStandardMaterial color="#00e676" emissive="#00e676" emissiveIntensity={2.5} />
      </mesh>

    </group>
  );
}

function CeilingFan({ onClick, active }) {
  const p = APPLIANCE_POSITIONS.ceiling_fan;
  const bladeRef = useRef();
  useFrame((_, delta) => {
    if (bladeRef.current) bladeRef.current.rotation.y += delta * 4;
  });

  return (
    <group position={p.pos} onClick={onClick}>
      <mesh position={[0, 0.07, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.15]} />
        <meshStandardMaterial color="#b8860b" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh>
        <cylinderGeometry args={[0.12, 0.12, 0.08, 16]} />
        <meshStandardMaterial color="#cd853f" metalness={0.4} roughness={0.3} />
      </mesh>
      <group ref={bladeRef}>
        {[0, 72, 144, 216, 288].map((deg) => (
          <mesh key={deg}
            position={[Math.cos(deg * Math.PI / 180) * 0.5, -0.02, Math.sin(deg * Math.PI / 180) * 0.5]}
            rotation={[0, -deg * Math.PI / 180, 0]}>
            <boxGeometry args={[0.8, 0.02, 0.15]} />
            <meshStandardMaterial color="#5c3317" roughness={0.5} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function LEDBulb({ onClick, active }) {
  const p = APPLIANCE_POSITIONS.led_bulb;
  return (
    <group position={p.pos} onClick={onClick}>
      {/* Screw base */}
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.04, 0.05, 0.08, 12]} />
        <meshStandardMaterial color="#b0b0b0" metalness={0.7} roughness={0.2} />
      </mesh>
      {/* Base collar */}
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.055, 0.04, 0.03, 12]} />
        <meshStandardMaterial color="#a0a0a0" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Bulb body - pear/teardrop shape using multiple segments */}
      <mesh position={[0, 0.03, 0]}>
        <cylinderGeometry args={[0.06, 0.09, 0.08, 12]} />
        <meshStandardMaterial color="#fff8dc" emissive="#ffdd57" emissiveIntensity={1.2} transparent opacity={0.9} />
      </mesh>
      <mesh position={[0, -0.04, 0]}>
        <sphereGeometry args={[0.1, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#fff8dc" emissive="#ffdd57" emissiveIntensity={1.5} transparent opacity={0.9} />
      </mesh>
      <mesh position={[0, -0.04, 0]}>
        <sphereGeometry args={[0.1, 16, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
        <meshStandardMaterial color="#fff8dc" emissive="#ffdd57" emissiveIntensity={1.8} transparent opacity={0.85} />
      </mesh>
      {/* Internal filament glow */}
      <mesh position={[0, -0.02, 0]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color="#ffcc00" emissive="#ffaa00" emissiveIntensity={3.0} />
      </mesh>
      <pointLight position={[0, -0.1, 0]} intensity={1.0} distance={7} color="#ffe4a0" />
    </group>
  );
}

function Fridge({ onClick, active }) {
  const p = APPLIANCE_POSITIONS.fridge;
  return (
    <group position={p.pos} rotation={p.rot} onClick={onClick}>
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[0.7, 1.8, 0.65]} />
        <meshStandardMaterial color="#c0c0c0" roughness={0.25} metalness={0.35} />
      </mesh>
      <mesh position={[0, 0.2, 0.33]}>
        <boxGeometry args={[0.62, 0.02, 0.01]} />
        <meshStandardMaterial color="#a0a0a0" metalness={0.4} />
      </mesh>
      <mesh position={[0.28, 0.5, 0.35]} castShadow>
        <boxGeometry args={[0.03, 0.4, 0.04]} />
        <meshStandardMaterial color="#888" metalness={0.7} roughness={0.2} />
      </mesh>
      <mesh position={[0.28, -0.3, 0.35]} castShadow>
        <boxGeometry args={[0.03, 0.4, 0.04]} />
        <meshStandardMaterial color="#888" metalness={0.7} roughness={0.2} />
      </mesh>

    </group>
  );
}

function InductionStove({ onClick, active }) {
  const p = APPLIANCE_POSITIONS.induction;
  return (
    <group position={p.pos} rotation={p.rot} onClick={onClick}>
      <mesh castShadow>
        <boxGeometry args={[0.5, 0.05, 0.4]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.15} metalness={0.4} />
      </mesh>
      <mesh position={[0, 0.03, -0.02]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.08, 0.14, 24]} />
        <meshStandardMaterial color="#e74c3c" emissive="#ff4500" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0, 0.03, 0.13]}>
        <boxGeometry args={[0.3, 0.01, 0.08]} />
        <meshStandardMaterial color="#333" metalness={0.3} />
      </mesh>

    </group>
  );
}

function Microwave({ onClick, active }) {
  const p = APPLIANCE_POSITIONS.microwave;
  return (
    <group position={p.pos} rotation={p.rot} onClick={onClick}>
      <mesh castShadow>
        <boxGeometry args={[0.5, 0.35, 0.35]} />
        <meshStandardMaterial color="#2d2d2d" roughness={0.3} metalness={0.3} />
      </mesh>
      {/* Door */}
      <mesh position={[-0.05, 0, 0.18]}>
        <boxGeometry args={[0.3, 0.25, 0.01]} />
        <meshStandardMaterial color="#111" roughness={0.1} />
      </mesh>
      {/* Handle */}
      <mesh position={[0.18, 0, 0.19]}>
        <boxGeometry args={[0.02, 0.2, 0.03]} />
        <meshStandardMaterial color="#666" metalness={0.5} />
      </mesh>
      {/* Clock display */}
      <mesh position={[0.18, 0.08, 0.18]}>
        <boxGeometry args={[0.08, 0.04, 0.01]} />
        <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.5} />
      </mesh>

    </group>
  );
}

function MixerGrinder({ onClick, active }) {
  const p = APPLIANCE_POSITIONS.mixer_grinder;
  return (
    <group position={p.pos} rotation={p.rot} onClick={onClick}>
      {/* Base */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[0.25, 0.12, 0.2]} />
        <meshStandardMaterial color="#b22222" roughness={0.35} metalness={0.2} />
      </mesh>
      {/* Jar */}
      <mesh position={[0, 0.22, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.1, 0.3, 12]} />
        <meshStandardMaterial color="#e8e8e8" transparent opacity={0.75} roughness={0.08} />
      </mesh>
      {/* Lid */}
      <mesh position={[0, 0.38, 0]}>
        <cylinderGeometry args={[0.09, 0.08, 0.04, 12]} />
        <meshStandardMaterial color="#2c2c2c" metalness={0.3} />
      </mesh>
      {/* Speed dial */}
      <mesh position={[0.1, 0.03, 0.11]}>
        <cylinderGeometry args={[0.02, 0.02, 0.02, 8]} />
        <meshStandardMaterial color="#ff6347" />
      </mesh>

    </group>
  );
}

function WifiRouter({ onClick, active }) {
  const p = APPLIANCE_POSITIONS.wifi_router;
  const ledRef = useRef();
  useFrame(() => {
    if (ledRef.current) {
      ledRef.current.material.emissiveIntensity = 0.5 + Math.sin(performance.now() * 0.005) * 0.5;
    }
  });

  return (
    <group position={p.pos} rotation={p.rot} onClick={onClick}>
      <mesh castShadow>
        <boxGeometry args={[0.25, 0.04, 0.18]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.3} />
      </mesh>
      {/* Antennas */}
      <mesh position={[-0.08, 0.12, -0.06]}>
        <cylinderGeometry args={[0.008, 0.008, 0.2]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[0.08, 0.12, -0.06]}>
        <cylinderGeometry args={[0.008, 0.008, 0.2]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      {/* Status LED */}
      <mesh ref={ledRef} position={[0, 0.025, 0.08]}>
        <sphereGeometry args={[0.012, 8, 8]} />
        <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={1} />
      </mesh>

    </group>
  );
}

function SetTopBox({ onClick, active }) {
  const p = APPLIANCE_POSITIONS.set_top_box;
  const ledRef = useRef();
  useFrame(() => {
    if (ledRef.current) {
      ledRef.current.material.emissiveIntensity = 1.0;
    }
  });

  return (
    <group position={p.pos} rotation={p.rot} onClick={onClick}>
      <mesh castShadow>
        <boxGeometry args={[0.3, 0.06, 0.2]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.3} metalness={0.2} />
      </mesh>
      {/* Standby LED (always on - the hidden consumer!) */}
      <mesh ref={ledRef} position={[0.12, 0.035, 0.09]}>
        <sphereGeometry args={[0.012, 8, 8]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={1} />
      </mesh>
      {/* IR receiver */}
      <mesh position={[-0.1, 0.035, 0.1]}>
        <sphereGeometry args={[0.015, 8, 8]} />
        <meshStandardMaterial color="#222" />
      </mesh>

    </group>
  );
}

function Geyser({ onClick, active }) {
  const p = APPLIANCE_POSITIONS.geyser;
  return (
    <group position={p.pos} rotation={p.rot} onClick={onClick}>
      <mesh castShadow>
        <cylinderGeometry args={[0.2, 0.2, 0.6, 16]} />
        <meshStandardMaterial color="#f5ebe0" roughness={0.35} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0.1, 0.21]}>
        <sphereGeometry args={[0.03]} />
        <meshStandardMaterial color="#ff3333" emissive="#ff3333" emissiveIntensity={1.5} />
      </mesh>
      <mesh position={[0, -0.4, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.25]} />
        <meshStandardMaterial color="#b87333" metalness={0.8} roughness={0.2} />
      </mesh>

    </group>
  );
}

function WashingMachine({ onClick, active }) {
  const p = APPLIANCE_POSITIONS.washing_machine;
  const drumRef = useRef();
  useFrame((_, delta) => {
    if (drumRef.current) drumRef.current.rotation.z += delta * 2;
  });

  return (
    <group position={p.pos} rotation={p.rot} onClick={onClick}>
      {/* Body */}
      <mesh castShadow>
        <boxGeometry args={[0.65, 0.9, 0.6]} />
        <meshStandardMaterial color="#e8e8e8" roughness={0.3} metalness={0.25} />
      </mesh>
      {/* Door - round glass */}
      <mesh position={[0, -0.05, 0.31]}>
        <cylinderGeometry args={[0.2, 0.2, 0.02, 24]} />
        <meshStandardMaterial color="#87ceeb" transparent opacity={0.55} roughness={0.08} />
      </mesh>
      {/* Door ring */}
      <mesh position={[0, -0.05, 0.32]}>
        <ringGeometry args={[0.18, 0.22, 24]} />
        <meshStandardMaterial color="#a0a0a0" metalness={0.6} side={THREE.DoubleSide} />
      </mesh>
      {/* Drum visible through glass */}
      <mesh ref={drumRef} position={[0, -0.05, 0.28]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.02, 12]} />
        <meshStandardMaterial color="#b0b0b0" metalness={0.4} />
      </mesh>
      {/* Control panel */}
      <mesh position={[0, 0.35, 0.28]}>
        <boxGeometry args={[0.55, 0.15, 0.02]} />
        <meshStandardMaterial color="#4a90d9" roughness={0.3} />
      </mesh>
      {/* Dial */}
      <mesh position={[0.15, 0.35, 0.3]}>
        <cylinderGeometry args={[0.04, 0.04, 0.02, 12]} />
        <meshStandardMaterial color="#333" metalness={0.5} />
      </mesh>

    </group>
  );
}

// ─── LED Tube Light ───
function LEDTubeLight({ onClick, active }) {
  const pos = APPLIANCE_POSITIONS.led_tube?.pos || [-7, 2.85, 4];
  const rot = APPLIANCE_POSITIONS.led_tube?.rot || [0, 0, 0];
  const glowRef = useRef();

  useFrame(() => {
    if (glowRef.current) {
      const t = performance.now() * 0.001;
      glowRef.current.material.emissiveIntensity = 0.6 + Math.sin(t) * 0.1;
    }
  });

  return (
    <group position={pos} rotation={rot} onClick={onClick}>
      {/* Tube housing */}
      <mesh castShadow>
        <boxGeometry args={[1.2, 0.06, 0.06]} />
        <meshStandardMaterial color="#e0e0e0" metalness={0.4} roughness={0.3} />
      </mesh>
      {/* Glowing tube */}
      <mesh ref={glowRef} position={[0, -0.04, 0]}>
        <boxGeometry args={[1.0, 0.03, 0.04]} />
        <meshStandardMaterial color="#fff" emissive="#ffe0b0" emissiveIntensity={0.6} />
      </mesh>
      {/* End caps */}
      <mesh position={[-0.55, 0, 0]}><boxGeometry args={[0.05, 0.08, 0.08]} /><meshStandardMaterial color="#999" /></mesh>
      <mesh position={[0.55, 0, 0]}><boxGeometry args={[0.05, 0.08, 0.08]} /><meshStandardMaterial color="#999" /></mesh>

    </group>
  );
}

// ─── Phone Charger ───
function PhoneCharger({ onClick, active }) {
  const pos = APPLIANCE_POSITIONS.phone_charger?.pos || [5, 0.55, -7.5];
  const rot = APPLIANCE_POSITIONS.phone_charger?.rot || [0, 0, 0];
  const ledRef = useRef();

  useFrame(() => {
    if (ledRef.current) {
      const t = performance.now() * 0.003;
      ledRef.current.material.emissiveIntensity = 0.4 + Math.sin(t * 2) * 0.3;
    }
  });

  return (
    <group position={pos} rotation={rot} onClick={onClick}>
      {/* Charger body */}
      <mesh castShadow>
        <boxGeometry args={[0.12, 0.06, 0.08]} />
        <meshStandardMaterial color="#f5f5f5" />
      </mesh>
      {/* USB port */}
      <mesh position={[0.06, 0, 0]}>
        <boxGeometry args={[0.02, 0.03, 0.05]} />
        <meshStandardMaterial color="#555" />
      </mesh>
      {/* Cable */}
      <mesh position={[0.08, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.008, 0.008, 0.3]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      {/* LED indicator */}
      <mesh ref={ledRef} position={[0, 0.035, 0]}>
        <sphereGeometry args={[0.01, 8, 8]} />
        <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.5} />
      </mesh>

    </group>
  );
}

// ─── Table Fan ───
function TableFan({ onClick, active }) {
  const pos = APPLIANCE_POSITIONS.table_fan?.pos || [3, 0.55, -5];
  const rot = APPLIANCE_POSITIONS.table_fan?.rot || [0, Math.PI / 4, 0];
  const bladeRef = useRef();
  const headRef = useRef();

  useFrame(() => {
    if (bladeRef.current) {
      bladeRef.current.rotation.z += 0.15; // spinning blades
    }
    if (headRef.current) {
      // Gentle oscillation
      const t = performance.now() * 0.001;
      headRef.current.rotation.y = Math.sin(t * 0.5) * 0.4;
    }
  });

  return (
    <group position={pos} rotation={rot} onClick={onClick} scale={[1.8, 1.8, 1.8]}>
      {/* Base */}
      <mesh castShadow position={[0, 0, 0]}>
        <cylinderGeometry args={[0.15, 0.17, 0.05, 16]} />
        <meshStandardMaterial color="#1e3a5f" />
      </mesh>
      {/* Stem */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.025, 0.03, 0.25]} />
        <meshStandardMaterial color="#2a5082" />
      </mesh>
      {/* Fan head */}
      <group ref={headRef} position={[0, 0.3, 0]}>
        {/* Motor housing */}
        <mesh position={[0, 0, 0.05]}>
          <sphereGeometry args={[0.06, 12, 12]} />
          <meshStandardMaterial color="#1e3a5f" metalness={0.3} />
        </mesh>
        {/* Guard ring */}
        <mesh position={[0, 0, 0.1]}>
          <torusGeometry args={[0.14, 0.008, 8, 24]} />
          <meshStandardMaterial color="#ccc" metalness={0.5} />
        </mesh>
        {/* Blades */}
        <group ref={bladeRef} position={[0, 0, 0.08]}>
          {[0, 1, 2].map(i => (
            <mesh key={i} rotation={[0, 0, (i * Math.PI * 2) / 3]}>
              <boxGeometry args={[0.12, 0.03, 0.005]} />
              <meshStandardMaterial color="#4a90d9" />
            </mesh>
          ))}
        </group>
      </group>

    </group>
  );
}

// ─── Guidance Arrow (points to nearest unvisited appliance) ───
function GuidanceArrow({ interacted }) {
  const arrowRef = useRef();

  useFrame(() => {
    if (!arrowRef.current) return;

    // Find nearest unvisited appliance
    let target = null;
    let minDist = Infinity;
    for (const id of INTERACTABLE_IDS) {
      if (interacted?.has(id)) continue;
      const ap = APPLIANCE_POSITIONS[id];
      if (!ap) continue;
      const dx = playerState.x - ap.pos[0];
      const dz = playerState.z - ap.pos[2];
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < minDist) {
        minDist = dist;
        target = ap.pos;
      }
    }

    if (target && minDist > 3) {
      arrowRef.current.visible = true;
      // Position arrow above player
      arrowRef.current.position.set(playerState.x, 2.5, playerState.z);
      // Point toward target
      const angle = Math.atan2(target[0] - playerState.x, target[2] - playerState.z);
      arrowRef.current.rotation.y = angle;
      // Bob animation
      arrowRef.current.position.y = 2.5 + Math.sin(performance.now() * 0.003) * 0.15;
    } else {
      arrowRef.current.visible = false;
    }
  });

  return (
    <group ref={arrowRef}>
      {/* Arrow body */}
      <mesh position={[0, 0, -0.3]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.4]} />
        <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.5} transparent opacity={0.7} />
      </mesh>
      {/* Arrow head */}
      <mesh position={[0, 0, -0.55]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.1, 0.2, 8]} />
        <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.5} transparent opacity={0.7} />
      </mesh>
    </group>
  );
}

// ─── Single-Appliance Label System (with watt color-coding) ───
const LABEL_OFFSETS = {
  ceiling_fan: 0.3, tv_smart: 0.7, ac_1_5ton: 0.35, fridge: 1.1,
  washing_machine: 0.65, geyser: 0.5, wifi_router: 0.3, set_top_box: 0.2,
  phone_charger: 0.4, induction: 0.3, microwave: 0.35, mixer_grinder: 0.5,
  led_tube: 0.3, table_fan: 0.55, led_bulb: 0.2,
};

function SingleApplianceLabel({ activeId, onWindowInteract }) {
  const [nearestId, setNearestId] = useState(null);
  const [nearestType, setNearestType] = useState('appliance'); // 'appliance' or 'window'

  useFrame(() => {
    let best = null, bestDist = 2.5, bestType = 'appliance';

    // Check appliances
    for (const id of INTERACTABLE_IDS) {
      const ap = APPLIANCE_POSITIONS[id];
      if (!ap) continue;
      const dx = playerState.x - ap.pos[0], dz = playerState.z - ap.pos[2];
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < bestDist) { bestDist = dist; best = id; bestType = 'appliance'; }
    }

    // Check windows
    if (WINDOW_POSITIONS) {
      for (const [wid, wp] of Object.entries(WINDOW_POSITIONS)) {
        const dx = playerState.x - wp.pos[0], dz = playerState.z - wp.pos[2];
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < bestDist) { bestDist = dist; best = wid; bestType = 'window'; }
      }
    }

    setNearestId(best);
    setNearestType(bestType);

    // Update playerState for window nearest tracking
    if (bestType === 'window') {
      playerState.nearestWindow = best;
    } else {
      playerState.nearestWindow = null;
    }
  });

  if (!nearestId) return null;

  // Window label
  if (nearestType === 'window') {
    const wp = WINDOW_POSITIONS[nearestId];
    if (!wp) return null;
    return (
      <Html position={[wp.pos[0], wp.pos[1] + 0.8, wp.pos[2]]} center>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', pointerEvents: 'none' }}>
          <div style={{ background: 'rgba(0,0,0,0.7)', color: '#fff', padding: '4px 12px', borderRadius: '8px', fontSize: '12px', fontFamily: 'Nunito, sans-serif', fontWeight: 600, whiteSpace: 'nowrap' }}>
            🪟 {wp.label}
          </div>
          <div style={{ background: 'rgba(34,197,94,0.85)', color: '#fff', padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontFamily: 'Nunito, sans-serif', fontWeight: 600, whiteSpace: 'nowrap' }}>
            Press <span style={{ background: 'rgba(255,255,255,0.3)', padding: '1px 5px', borderRadius: '3px', fontWeight: 700 }}>E</span> to learn
          </div>
        </div>
      </Html>
    );
  }

  // Appliance label
  if (activeId === nearestId) return null;
  const pos = APPLIANCE_POSITIONS[nearestId]?.pos;
  const data = APPLIANCE_DATA[nearestId];
  if (!pos || !data) return null;
  const yOffset = LABEL_OFFSETS[nearestId] || 0.5;
  const wattColor = getWattColor(data.wattage);

  return (
    <Html position={[pos[0], pos[1] + yOffset, pos[2]]} center>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', pointerEvents: 'none' }}>
        <div style={{ background: 'rgba(0,0,0,0.7)', color: '#fff', padding: '4px 12px', borderRadius: '8px', fontSize: '12px', fontFamily: 'Nunito, sans-serif', fontWeight: 600, whiteSpace: 'nowrap' }}>
          {data.icon} {data.name} <span style={{ color: wattColor, fontWeight: 700 }}>{data.wattage}W</span>
        </div>
        <div style={{ background: 'rgba(34,197,94,0.85)', color: '#fff', padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontFamily: 'Nunito, sans-serif', fontWeight: 600, whiteSpace: 'nowrap' }}>
          Press <span style={{ background: 'rgba(255,255,255,0.3)', padding: '1px 5px', borderRadius: '3px', fontWeight: 700 }}>E</span>
        </div>
      </div>
    </Html>
  );
}

// ─── Main Appliances Component ───
export default function Appliances({ onApplianceClick, onWindowClick, activeApplianceId, interactedAppliances, hideLabels }) {
  const handleClick = (applianceId) => (e) => {
    e.stopPropagation();
    onApplianceClick(applianceId);
  };

  return (
    <group>
      {/* Living Room */}
      <GlowAppliance id="tv_smart" activeId={activeApplianceId} interacted={interactedAppliances}>
        <TV onClick={handleClick('tv_smart')} active={activeApplianceId === 'tv_smart'} />
      </GlowAppliance>

      <GlowAppliance id="ceiling_fan" activeId={activeApplianceId} interacted={interactedAppliances}>
        <CeilingFan onClick={handleClick('ceiling_fan')} active={activeApplianceId === 'ceiling_fan'} />
      </GlowAppliance>

      <GlowAppliance id="led_bulb" activeId={activeApplianceId} interacted={interactedAppliances}>
        <LEDBulb onClick={handleClick('led_bulb')} active={activeApplianceId === 'led_bulb'} />
      </GlowAppliance>

      <GlowAppliance id="wifi_router" activeId={activeApplianceId} interacted={interactedAppliances}>
        <WifiRouter onClick={handleClick('wifi_router')} active={activeApplianceId === 'wifi_router'} />
      </GlowAppliance>

      <GlowAppliance id="set_top_box" activeId={activeApplianceId} interacted={interactedAppliances}>
        <SetTopBox onClick={handleClick('set_top_box')} active={activeApplianceId === 'set_top_box'} />
      </GlowAppliance>

      {/* Bedroom */}
      <GlowAppliance id="ac_1_5ton" activeId={activeApplianceId} interacted={interactedAppliances}>
        <AC onClick={handleClick('ac_1_5ton')} active={activeApplianceId === 'ac_1_5ton'} />
      </GlowAppliance>

      {/* Kitchen */}
      <GlowAppliance id="fridge" activeId={activeApplianceId} interacted={interactedAppliances}>
        <Fridge onClick={handleClick('fridge')} active={activeApplianceId === 'fridge'} />
      </GlowAppliance>

      <GlowAppliance id="induction" activeId={activeApplianceId} interacted={interactedAppliances}>
        <InductionStove onClick={handleClick('induction')} active={activeApplianceId === 'induction'} />
      </GlowAppliance>

      <GlowAppliance id="microwave" activeId={activeApplianceId} interacted={interactedAppliances}>
        <Microwave onClick={handleClick('microwave')} active={activeApplianceId === 'microwave'} />
      </GlowAppliance>

      <GlowAppliance id="mixer_grinder" activeId={activeApplianceId} interacted={interactedAppliances}>
        <MixerGrinder onClick={handleClick('mixer_grinder')} active={activeApplianceId === 'mixer_grinder'} />
      </GlowAppliance>

      <GlowAppliance id="led_tube" activeId={activeApplianceId} interacted={interactedAppliances}>
        <LEDTubeLight onClick={handleClick('led_tube')} active={activeApplianceId === 'led_tube'} />
      </GlowAppliance>

      {/* Bathroom */}
      <GlowAppliance id="geyser" activeId={activeApplianceId} interacted={interactedAppliances}>
        <Geyser onClick={handleClick('geyser')} active={activeApplianceId === 'geyser'} />
      </GlowAppliance>

      <GlowAppliance id="washing_machine" activeId={activeApplianceId} interacted={interactedAppliances}>
        <WashingMachine onClick={handleClick('washing_machine')} active={activeApplianceId === 'washing_machine'} />
      </GlowAppliance>

      {/* Bedroom — new appliances */}
      <GlowAppliance id="phone_charger" activeId={activeApplianceId} interacted={interactedAppliances}>
        <PhoneCharger onClick={handleClick('phone_charger')} active={activeApplianceId === 'phone_charger'} />
      </GlowAppliance>

      <GlowAppliance id="table_fan" activeId={activeApplianceId} interacted={interactedAppliances}>
        <TableFan onClick={handleClick('table_fan')} active={activeApplianceId === 'table_fan'} />
      </GlowAppliance>

      {/* Window Glow Effects */}
      {WINDOW_POSITIONS && Object.entries(WINDOW_POSITIONS).map(([wid, wp]) => (
        <WindowGlow key={wid} windowId={wid} position={wp.pos} />
      ))}

      {/* Guidance Arrow */}
      <GuidanceArrow interacted={interactedAppliances} />

      {/* Single appliance label — only nearest within 2.5 units (includes windows) */}
      {!hideLabels && <SingleApplianceLabel activeId={activeApplianceId} onWindowInteract={onWindowClick} />}
    </group>
  );
}
