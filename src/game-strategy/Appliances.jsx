import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { APPLIANCE_POSITIONS, APPLIANCE_DATA, INTERACTABLE_IDS, IDLE_CHATTER } from './applianceData';
import { playerState } from './Player';
import * as THREE from 'three';

const GLOW_RADIUS = 2.8;

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
  const scaleRef = useRef(1);
  const [chatter, setChatter] = useState(null);
  const chatterTimerRef = useRef(0);
  const lastChatterRef = useRef(0);

  const isNear = playerState.nearestAppliance === id;
  const isActive = activeId === id;
  const isInteracted = interacted?.has(id);

  useFrame((_, delta) => {
    if (!glowRef.current) return;
    const t = performance.now() * 0.003;

    // Glow pulsing
    const glowIntensity = isNear && !isActive ? (0.3 + Math.sin(t * 2) * 0.15) : 0;
    glowRef.current.material.emissiveIntensity = glowIntensity;
    glowRef.current.visible = isNear && !isActive;

    // Pop effect when activated
    const targetScale = isActive ? 1.0 : 1.0;
    scaleRef.current = THREE.MathUtils.lerp(scaleRef.current, targetScale, 0.1);

    // Idle chatter for unvisited appliances
    if (!isInteracted && !isNear && !isActive) {
      chatterTimerRef.current += delta;
      const now = performance.now();
      if (chatterTimerRef.current > 15 + Math.random() * 20 && now - lastChatterRef.current > 30000) {
        const dist = Math.sqrt(
          (playerState.x - (APPLIANCE_POSITIONS[id]?.pos[0] || 0)) ** 2 +
          (playerState.z - (APPLIANCE_POSITIONS[id]?.pos[2] || 0)) ** 2
        );
        if (dist < 5) {
          setChatter(IDLE_CHATTER[Math.floor(Math.random() * IDLE_CHATTER.length)]);
          lastChatterRef.current = now;
          chatterTimerRef.current = 0;
          setTimeout(() => setChatter(null), 3000);
        }
      }
    }
  });

  const pos = APPLIANCE_POSITIONS[id]?.pos || [0, 0, 0];

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
      <Html position={[0, 0.7, 0]} center><div className="appliance-label">📺 Smart TV</div></Html>
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
      <Html position={[0, 0.35, 0]} center><div className="appliance-label">❄️ AC 1.5T</div></Html>
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
      <Html position={[0, 1.1, 0]} center><div className="appliance-label">🧊 Fridge</div></Html>
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
      <Html position={[0, 0.3, 0]} center><div className="appliance-label">🍳 Induction</div></Html>
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
      <Html position={[0, 0.35, 0]} center><div className="appliance-label">📡 Microwave</div></Html>
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
      <Html position={[0, 0.5, 0]} center><div className="appliance-label">⚡ Mixer</div></Html>
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
      <Html position={[0, 0.3, 0]} center><div className="appliance-label">📶 Router</div></Html>
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
      <Html position={[0, 0.2, 0]} center><div className="appliance-label">📦 Set-Top Box</div></Html>
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
      <Html position={[0, 0.5, 0]} center><div className="appliance-label">🚿 Geyser</div></Html>
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
      <Html position={[0, 0.65, 0]} center><div className="appliance-label">👕 Washer</div></Html>
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

      {/* Bathroom */}
      <GlowAppliance id="geyser" activeId={activeApplianceId} interacted={interactedAppliances}>
        <Geyser onClick={handleClick('geyser')} active={activeApplianceId === 'geyser'} />
      </GlowAppliance>

      <GlowAppliance id="washing_machine" activeId={activeApplianceId} interacted={interactedAppliances}>
        <WashingMachine onClick={handleClick('washing_machine')} active={activeApplianceId === 'washing_machine'} />
      </GlowAppliance>

      {/* Guidance Arrow */}
      <GuidanceArrow interacted={interactedAppliances} />
    </group>
  );
}
