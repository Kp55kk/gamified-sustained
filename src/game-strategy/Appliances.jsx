import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { APPLIANCE_POSITIONS, APPLIANCE_DATA, INTERACTABLE_IDS, IDLE_CHATTER } from './applianceData';
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

// ─── Animated Face (eyes + mouth) for talking appliances ───
function AnimatedFace({ active, offset = [0, 0.4, 0.3] }) {
  const leftEyeRef = useRef();
  const rightEyeRef = useRef();
  const mouthRef = useRef();
  const groupRef = useRef();
  const scaleRef = useRef(0);

  useFrame(() => {
    if (!groupRef.current) return;
    const target = active ? 1 : 0;
    scaleRef.current = THREE.MathUtils.lerp(scaleRef.current, target, 0.1);
    groupRef.current.scale.setScalar(scaleRef.current);
    groupRef.current.visible = scaleRef.current > 0.01;

    if (active) {
      const t = performance.now() * 0.003;
      // Blink
      const blink = Math.sin(t * 2) > 0.95 ? 0.1 : 1;
      if (leftEyeRef.current) leftEyeRef.current.scale.y = blink;
      if (rightEyeRef.current) rightEyeRef.current.scale.y = blink;
      // Mouth animation (talking)
      if (mouthRef.current) {
        mouthRef.current.scale.y = 0.5 + Math.abs(Math.sin(t * 4)) * 0.8;
        mouthRef.current.scale.x = 0.8 + Math.sin(t * 3) * 0.2;
      }
    }
  });

  return (
    <group ref={groupRef} position={offset} visible={false}>
      {/* Left eye */}
      <mesh ref={leftEyeRef} position={[-0.12, 0.05, 0]}>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshStandardMaterial color="#fff" />
      </mesh>
      <mesh position={[-0.12, 0.05, 0.05]}>
        <sphereGeometry args={[0.035, 8, 8]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      {/* Right eye */}
      <mesh ref={rightEyeRef} position={[0.12, 0.05, 0]}>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshStandardMaterial color="#fff" />
      </mesh>
      <mesh position={[0.12, 0.05, 0.05]}>
        <sphereGeometry args={[0.035, 8, 8]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      {/* Mouth */}
      <mesh ref={mouthRef} position={[0, -0.08, 0.02]}>
        <boxGeometry args={[0.12, 0.04, 0.02]} />
        <meshStandardMaterial color="#e74c3c" />
      </mesh>
    </group>
  );
}

// ─── Glow Effect Wrapper ───
function GlowAppliance({ children, id, activeId, interacted }) {
  const glowRef = useRef();
  const emotionRef = useRef();
  const scaleRef = useRef(1);
  const [chatter, setChatter] = useState(null);
  const chatterTimerRef = useRef(0);
  const lastChatterRef = useRef(0);
  const recentlyInteractedRef = useRef(false);
  const interactTimeRef = useRef(0);

  const isNear = playerState.nearestAppliance === id;
  const isActive = activeId === id;
  const isInteracted = interacted?.has(id);

  // Track room visits
  const appRoom = getApplianceRoom(id);
  
  useFrame((_, delta) => {
    if (!glowRef.current) return;
    const t = performance.now() * 0.003;
    const now = performance.now();

    // Track room visits for emotional state
    const currentRoom = playerState.x < 0 && playerState.z < 0 ? 'Living Room'
      : playerState.x >= 0 && playerState.z < 0 ? 'Bedroom'
      : playerState.x < 4 && playerState.z >= 0 ? 'Kitchen' : 'Bathroom';
    trackRoomVisit(currentRoom);

    // Emotional state: sad if room visited 3+ times but not interacted
    const isSad = !isInteracted && roomVisitTracker[appRoom] >= 3;
    const isHappy = isInteracted && (now - interactTimeRef.current < 10000);

    // Glow pulsing — enhanced with emotion colors
    if (isNear && !isActive) {
      glowRef.current.visible = true;
      const baseGlow = 0.3 + Math.sin(t * 2) * 0.15;
      glowRef.current.material.emissiveIntensity = baseGlow;
      glowRef.current.material.color.set(isSad ? '#f59e0b' : '#22c55e');
      glowRef.current.material.emissive.set(isSad ? '#f59e0b' : '#22c55e');
    } else if (isSad) {
      // Subtle sad glow when not near
      glowRef.current.visible = true;
      glowRef.current.material.emissiveIntensity = 0.08 + Math.sin(t) * 0.04;
      glowRef.current.material.color.set('#f59e0b');
      glowRef.current.material.emissive.set('#f59e0b');
    } else if (isHappy) {
      // Happy pulse after interaction
      glowRef.current.visible = true;
      const fadeOut = Math.max(0, 1 - (now - interactTimeRef.current) / 10000);
      glowRef.current.material.emissiveIntensity = (0.15 + Math.sin(t * 3) * 0.1) * fadeOut;
      glowRef.current.material.color.set('#22c55e');
      glowRef.current.material.emissive.set('#22c55e');
    } else {
      glowRef.current.visible = false;
    }

    // Detect newly interacted (to trigger happy state)
    if (isInteracted && !recentlyInteractedRef.current) {
      recentlyInteractedRef.current = true;
      interactTimeRef.current = now;
    }

    // Idle chatter for unvisited appliances
    if (!isInteracted && !isNear && !isActive) {
      chatterTimerRef.current += delta;
      if (chatterTimerRef.current > 15 + Math.random() * 20 && now - lastChatterRef.current > 30000) {
        const dist = Math.sqrt(
          (playerState.x - (APPLIANCE_POSITIONS[id]?.pos[0] || 0)) ** 2 +
          (playerState.z - (APPLIANCE_POSITIONS[id]?.pos[2] || 0)) ** 2
        );
        if (dist < 5) {
          // Sad appliances have different chatter
          const lines = isSad 
            ? ["\u{1F622} You keep passing me by...", "\u{1F622} Don't you want to learn about me?", "\u{1F622} I feel so ignored..."]
            : IDLE_CHATTER;
          setChatter(lines[Math.floor(Math.random() * lines.length)]);
          lastChatterRef.current = now;
          chatterTimerRef.current = 0;
          setTimeout(() => setChatter(null), 3000);
        }
      }
    }
  });

  const pos = APPLIANCE_POSITIONS[id]?.pos || [0, 0, 0];
  const appRoom2 = getApplianceRoom(id);
  const isSadNow = !isInteracted && roomVisitTracker[appRoom2] >= 3;

  return (
    <group>
      {children}
      {/* Glow sphere around appliance */}
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
      {/* Emotional emoji indicator */}
      {isSadNow && !isNear && !isActive && (
        <Html position={[pos[0], pos[1] + 0.6, pos[2]]} center>
          <div className="emotion-indicator sad">{"\u{1F622}"}</div>
        </Html>
      )}
      {/* "Press E" prompt */}
      {isNear && !isActive && (
        <Html position={[pos[0], pos[1] + 0.8, pos[2]]} center>
          <div className="press-e-prompt">
            Press <span className="key-e">E</span> to interact
          </div>
        </Html>
      )}
      {/* Idle chatter */}
      {chatter && (
        <Html position={[pos[0], pos[1] + 1.2, pos[2]]} center>
          <div className="idle-chatter">{chatter}</div>
        </Html>
      )}
    </group>
  );
}

// ─── Individual 3D Models ───

function TV({ onClick, active }) {
  const p = APPLIANCE_POSITIONS.tv_smart;
  return (
    <group position={p.pos} rotation={p.rot} onClick={onClick}>
      <mesh position={[0, -0.55, 0]} castShadow>
        <boxGeometry args={[0.6, 0.04, 0.25]} />
        <meshStandardMaterial color="#222" metalness={0.5} roughness={0.3} />
      </mesh>
      <mesh position={[0, -0.35, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.06, 0.4]} />
        <meshStandardMaterial color="#333" metalness={0.4} />
      </mesh>
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[1.8, 1.0, 0.07]} />
        <meshStandardMaterial color="#111" roughness={0.3} />
      </mesh>
      <mesh position={[0, 0, 0.04]}>
        <planeGeometry args={[1.65, 0.88]} />
        <meshStandardMaterial color="#1a2a4a" emissive="#1a2a4a" emissiveIntensity={0.4} />
      </mesh>
      <AnimatedFace active={active} offset={[0, 0.1, 0.06]} />
    </group>
  );
}

function AC({ onClick, active }) {
  const p = APPLIANCE_POSITIONS.ac_1_5ton;
  return (
    <group position={p.pos} rotation={p.rot} onClick={onClick}>
      <mesh castShadow>
        <boxGeometry args={[1.3, 0.32, 0.22]} />
        <meshStandardMaterial color="#f5f5f5" roughness={0.4} />
      </mesh>
      <mesh position={[0, -0.08, 0.12]}>
        <boxGeometry args={[1.1, 0.1, 0.01]} />
        <meshStandardMaterial color="#e0e0e0" roughness={0.5} />
      </mesh>
      <mesh position={[0.5, 0.1, 0.12]}>
        <sphereGeometry args={[0.02]} />
        <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={2} />
      </mesh>
      <AnimatedFace active={active} offset={[0, 0, 0.14]} />
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
        <meshStandardMaterial color="#888" metalness={0.6} />
      </mesh>
      <mesh>
        <cylinderGeometry args={[0.12, 0.12, 0.08, 16]} />
        <meshStandardMaterial color="#ddd" metalness={0.3} />
      </mesh>
      <group ref={bladeRef}>
        {[0, 72, 144, 216, 288].map((deg) => (
          <mesh key={deg}
            position={[Math.cos(deg * Math.PI / 180) * 0.5, -0.02, Math.sin(deg * Math.PI / 180) * 0.5]}
            rotation={[0, -deg * Math.PI / 180, 0]}>
            <boxGeometry args={[0.8, 0.02, 0.15]} />
            <meshStandardMaterial color="#8B6914" roughness={0.6} />
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

function Fridge({ onClick, active }) {
  const p = APPLIANCE_POSITIONS.fridge;
  return (
    <group position={p.pos} rotation={p.rot} onClick={onClick}>
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[0.7, 1.8, 0.65]} />
        <meshStandardMaterial color="#e8e8e8" roughness={0.4} metalness={0.2} />
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
      <AnimatedFace active={active} offset={[0, 0.6, 0.35]} />
    </group>
  );
}

function InductionStove({ onClick, active }) {
  const p = APPLIANCE_POSITIONS.induction;
  return (
    <group position={p.pos} rotation={p.rot} onClick={onClick}>
      <mesh castShadow>
        <boxGeometry args={[0.5, 0.05, 0.4]} />
        <meshStandardMaterial color="#111" roughness={0.2} metalness={0.3} />
      </mesh>
      <mesh position={[0, 0.03, -0.02]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.08, 0.14, 24]} />
        <meshStandardMaterial color="#c0392b" emissive="#c0392b" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0, 0.03, 0.13]}>
        <boxGeometry args={[0.3, 0.01, 0.08]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      <AnimatedFace active={active} offset={[0, 0.15, 0]} />
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
      <AnimatedFace active={active} offset={[-0.05, 0.05, 0.2]} />
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
        <meshStandardMaterial color="#e0e0e0" roughness={0.3} metalness={0.2} />
      </mesh>
      {/* Jar */}
      <mesh position={[0, 0.22, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.1, 0.3, 12]} />
        <meshStandardMaterial color="#ddd" transparent opacity={0.7} roughness={0.1} />
      </mesh>
      {/* Lid */}
      <mesh position={[0, 0.38, 0]}>
        <cylinderGeometry args={[0.09, 0.08, 0.04, 12]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      {/* Speed dial */}
      <mesh position={[0.1, 0.03, 0.11]}>
        <cylinderGeometry args={[0.02, 0.02, 0.02, 8]} />
        <meshStandardMaterial color="#e74c3c" />
      </mesh>
      <AnimatedFace active={active} offset={[0, 0.3, 0.1]} />
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
      <AnimatedFace active={active} offset={[0, 0.1, 0.1]} />
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
      <AnimatedFace active={active} offset={[0, 0.08, 0.1]} />
    </group>
  );
}

function Geyser({ onClick, active }) {
  const p = APPLIANCE_POSITIONS.geyser;
  return (
    <group position={p.pos} rotation={p.rot} onClick={onClick}>
      <mesh castShadow>
        <cylinderGeometry args={[0.2, 0.2, 0.6, 16]} />
        <meshStandardMaterial color="#f0f0f0" roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.1, 0.21]}>
        <sphereGeometry args={[0.03]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={1} />
      </mesh>
      <mesh position={[0, -0.4, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.25]} />
        <meshStandardMaterial color="#aaa" metalness={0.7} />
      </mesh>
      <AnimatedFace active={active} offset={[0, 0.15, 0.22]} />
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
        <meshStandardMaterial color="#eee" roughness={0.4} metalness={0.2} />
      </mesh>
      {/* Door - round glass */}
      <mesh position={[0, -0.05, 0.31]}>
        <cylinderGeometry args={[0.2, 0.2, 0.02, 24]} />
        <meshStandardMaterial color="#aaddee" transparent opacity={0.5} roughness={0.1} />
      </mesh>
      {/* Door ring */}
      <mesh position={[0, -0.05, 0.32]}>
        <ringGeometry args={[0.18, 0.22, 24]} />
        <meshStandardMaterial color="#999" metalness={0.5} side={THREE.DoubleSide} />
      </mesh>
      {/* Drum visible through glass */}
      <mesh ref={drumRef} position={[0, -0.05, 0.28]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.02, 12]} />
        <meshStandardMaterial color="#ccc" metalness={0.3} />
      </mesh>
      {/* Control panel */}
      <mesh position={[0, 0.35, 0.28]}>
        <boxGeometry args={[0.55, 0.15, 0.02]} />
        <meshStandardMaterial color="#ddd" />
      </mesh>
      {/* Dial */}
      <mesh position={[0.15, 0.35, 0.3]}>
        <cylinderGeometry args={[0.04, 0.04, 0.02, 12]} />
        <meshStandardMaterial color="#444" />
      </mesh>
      <AnimatedFace active={active} offset={[0, 0.15, 0.34]} />
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
      <AnimatedFace active={active} offset={[0, -0.2, 0.1]} />
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
      <AnimatedFace active={active} offset={[0, 0.25, 0.1]} />
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
    <group position={pos} rotation={rot} onClick={onClick}>
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
      <AnimatedFace active={active} offset={[0, 0.55, 0.15]} />
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

// ─── Proximity-Based Label System ───
const LABEL_OFFSETS = {
  ceiling_fan: 0.3, tv_smart: 0.7, ac_1_5ton: 0.35, fridge: 1.1,
  washing_machine: 0.65, geyser: 0.5, wifi_router: 0.3, set_top_box: 0.2,
  phone_charger: 0.4, induction: 0.3, microwave: 0.35, mixer_grinder: 0.5,
  led_tube: 0.3, table_fan: 0.55, led_bulb: 0.2,
};

function getL1ProximityLevels(px, pz) {
  const distances = [];
  for (const id of INTERACTABLE_IDS) {
    const ap = APPLIANCE_POSITIONS[id];
    if (!ap) continue;
    const dx = px - ap.pos[0], dz = pz - ap.pos[2];
    const dist = Math.sqrt(dx * dx + dz * dz);
    distances.push({ id, dist });
  }
  distances.sort((a, b) => a.dist - b.dist);
  const levels = {};
  for (const { id, dist } of distances) {
    if (dist > 3.5) { levels[id] = 'hidden'; continue; }
    const shown = Object.values(levels).filter(l => l !== 'hidden').length;
    if (shown >= 2) { levels[id] = 'hidden'; continue; }
    if (shown === 0 && dist < 2.8) { levels[id] = 'interact'; }
    else { levels[id] = 'name'; }
  }
  return levels;
}

function ProximityLabel({ id, showLevel, activeId }) {
  const pos = APPLIANCE_POSITIONS[id]?.pos;
  if (!pos || !showLevel || showLevel === 'hidden') return null;
  const data = APPLIANCE_DATA[id];
  if (!data) return null;
  const yOffset = LABEL_OFFSETS[id] || 0.5;
  const isActive = activeId === id;

  return (
    <Html position={[pos[0], pos[1] + yOffset, pos[2]]} center>
      <div className={`l1-prox-label ${showLevel}`}>
        {(showLevel === 'name' || showLevel === 'interact') && (
          <div className="l1-prox-name">
            {data.icon} {data.name}
            <span className="l1-prox-watt" style={{ fontSize: '10px', color: '#94a3b8' }}> {data.wattage}W</span>
          </div>
        )}
        {showLevel === 'interact' && !isActive && (
          <div className="l1-prox-interact">Press <span className="key-e">E</span> to interact</div>
        )}
      </div>
    </Html>
  );
}

function ProximityLabels({ activeId }) {
  const [levels, setLevels] = useState({});
  useFrame(() => {
    const newLevels = getL1ProximityLevels(playerState.x, playerState.z);
    setLevels(newLevels);
  });
  return (
    <group>
      {INTERACTABLE_IDS.map(id => (
        <ProximityLabel key={id} id={id} showLevel={levels[id]} activeId={activeId} />
      ))}
    </group>
  );
}

// ─── Main Appliances Component ───
export default function Appliances({ onApplianceClick, activeApplianceId, interactedAppliances }) {
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

      {/* Guidance Arrow */}
      <GuidanceArrow interacted={interactedAppliances} />

      {/* Proximity-based labels (Fix 3) */}
      <ProximityLabels activeId={activeApplianceId} />
    </group>
  );
}
