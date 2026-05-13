// ═══════════════════════════════════════════════════════════
//  LEVEL 3 — PHASE 1 CORE: Audio, 3D Scene, Shared Components
//  "Understand the Consequences of Energy Use"
// ═══════════════════════════════════════════════════════════
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import House from '../../House';
import Player from '../../Player';
import Level2Appliances from '../../level2/Level2Appliances';
import Level3Environment from '../Level3Environment';
import { L2_APPLIANCE_IDS } from './phase1Data';
import { FactoryExterior, OutdoorPath } from './FactoryScene';

// ═══════════════════════════════════════════════════════════
//  AUDIO SYSTEM — Immersive sound feedback
// ═══════════════════════════════════════════════════════════
let audioCtx = null;
function getCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

export function playToggleOn() {
  try {
    const ctx = getCtx();
    // Click sound
    const click = ctx.createOscillator();
    const clickGain = ctx.createGain();
    click.connect(clickGain);
    clickGain.connect(ctx.destination);
    click.frequency.setValueAtTime(800, ctx.currentTime);
    clickGain.gain.setValueAtTime(0.15, ctx.currentTime);
    clickGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    click.start(ctx.currentTime);
    click.stop(ctx.currentTime + 0.1);
    // Power-up hum
    const hum = ctx.createOscillator();
    const humGain = ctx.createGain();
    hum.connect(humGain);
    humGain.connect(ctx.destination);
    hum.type = 'sine';
    hum.frequency.setValueAtTime(200, ctx.currentTime + 0.05);
    hum.frequency.linearRampToValueAtTime(400, ctx.currentTime + 0.3);
    humGain.gain.setValueAtTime(0.08, ctx.currentTime + 0.05);
    humGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    hum.start(ctx.currentTime + 0.05);
    hum.stop(ctx.currentTime + 0.5);
  } catch (e) {}
}

export function playToggleOff() {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(150, ctx.currentTime + 0.25);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.35);
  } catch (e) {}
}

export function playCorrectSound() {
  try {
    const ctx = getCtx();
    [523, 659, 784].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);
      gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.3);
      osc.start(ctx.currentTime + i * 0.1);
      osc.stop(ctx.currentTime + i * 0.1 + 0.3);
    });
  } catch (e) {}
}

export function playWrongSound() {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
  } catch (e) {}
}

export function playMilestoneSound() {
  try {
    const ctx = getCtx();
    [523, 659, 784, 1047].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12);
      gain.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.4);
      osc.start(ctx.currentTime + i * 0.12);
      osc.stop(ctx.currentTime + i * 0.12 + 0.4);
    });
  } catch (e) {}
}

export function playWarningSound() {
  try {
    const ctx = getCtx();
    [0, 0.3, 0.6].forEach(t => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(400, ctx.currentTime + t);
      osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + t + 0.15);
      gain.gain.setValueAtTime(0.06, ctx.currentTime + t);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.3);
      osc.start(ctx.currentTime + t);
      osc.stop(ctx.currentTime + t + 0.3);
    });
  } catch (e) {}
}

export function playHeavyHum() {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(55, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(45, ctx.currentTime + 1.5);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 2);
  } catch (e) {}
}

export function playBreathingSound() {
  try {
    const ctx = getCtx();
    // Inhale
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    const filter1 = ctx.createBiquadFilter();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(80, ctx.currentTime);
    filter1.type = 'lowpass';
    filter1.frequency.setValueAtTime(400, ctx.currentTime);
    osc1.connect(filter1);
    filter1.connect(gain1);
    gain1.connect(ctx.destination);
    gain1.gain.setValueAtTime(0, ctx.currentTime);
    gain1.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 0.8);
    gain1.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.6);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 1.6);
    // Exhale
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    const filter2 = ctx.createBiquadFilter();
    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(60, ctx.currentTime + 1.8);
    filter2.type = 'lowpass';
    filter2.frequency.setValueAtTime(300, ctx.currentTime + 1.8);
    osc2.connect(filter2);
    filter2.connect(gain2);
    gain2.connect(ctx.destination);
    gain2.gain.setValueAtTime(0, ctx.currentTime + 1.8);
    gain2.gain.linearRampToValueAtTime(0.03, ctx.currentTime + 2.4);
    gain2.gain.linearRampToValueAtTime(0, ctx.currentTime + 3.2);
    osc2.start(ctx.currentTime + 1.8);
    osc2.stop(ctx.currentTime + 3.2);
  } catch (e) {}
}

// ═══════════════════════════════════════════════════════════
//  3D SCENE COMPONENTS
// ═══════════════════════════════════════════════════════════

export function CameraRefForwarder({ cameraRef }) {
  const { camera } = useThree();
  useEffect(() => { cameraRef.current = camera; }, [camera, cameraRef]);
  return null;
}

// ═══════════════════════════════════════════════════════════
//  3D EB METER — Indian-style electricity meter on wall
// ═══════════════════════════════════════════════════════════
function EBMeter3D({ damageLevel, isTarget = false }) {
  const dialRef = useRef();
  const ledRef = useRef();
  const glowRef = useRef();

  useFrame(() => {
    // Spinning dial based on power usage
    if (dialRef.current) {
      dialRef.current.rotation.z -= 0.02 + damageLevel * 0.08;
    }
    // Blinking LED
    if (ledRef.current) {
      const t = performance.now() * 0.005;
      ledRef.current.material.emissiveIntensity = 0.5 + Math.sin(t * (2 + damageLevel * 5)) * 0.5;
    }
    // Glow when target
    if (glowRef.current && isTarget) {
      const t = performance.now() * 0.003;
      glowRef.current.emissiveIntensity = 1.0 + Math.sin(t) * 0.5;
    }
  });

  return (
    <group position={[-10.35, 1.6, -1]}>
      {/* Meter board (wooden backing) */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.08, 1.2, 0.8]} />
        <meshStandardMaterial color="#5a3a20" roughness={0.7} />
      </mesh>
      {/* Meter box (grey metal) */}
      <mesh position={[-0.06, 0.1, 0]}>
        <boxGeometry args={[0.12, 0.7, 0.55]} />
        <meshStandardMaterial color="#707070" metalness={0.5} roughness={0.3} />
      </mesh>
      {/* Glass window on meter */}
      <mesh position={[-0.13, 0.15, 0]}>
        <boxGeometry args={[0.02, 0.35, 0.3]} />
        <meshStandardMaterial color="#a8d4e6" transparent opacity={0.4} roughness={0.1} />
      </mesh>
      {/* Spinning dial (aluminum disc) */}
      <mesh ref={dialRef} position={[-0.15, 0.15, 0]} rotation={[0, Math.PI / 2, 0]}>
        <circleGeometry args={[0.08, 16]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.8} roughness={0.15} side={THREE.DoubleSide} />
      </mesh>
      {/* Dial mark */}
      <mesh position={[-0.155, 0.15, 0]}>
        <boxGeometry args={[0.005, 0.06, 0.01]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      {/* Counter display */}
      <mesh position={[-0.13, -0.05, 0]}>
        <boxGeometry args={[0.02, 0.1, 0.25]} />
        <meshStandardMaterial color="#111" roughness={0.2} />
      </mesh>
      {/* LED indicator */}
      <mesh ref={ledRef} position={[-0.13, 0.35, 0.15]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.5} />
      </mesh>
      {/* Second LED */}
      <mesh position={[-0.13, 0.35, -0.15]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={0.3} />
      </mesh>
      {/* Wires coming from top */}
      <mesh position={[-0.06, 0.55, -0.1]}>
        <cylinderGeometry args={[0.01, 0.01, 0.3, 6]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      <mesh position={[-0.06, 0.55, 0.1]}>
        <cylinderGeometry args={[0.01, 0.01, 0.3, 6]} />
        <meshStandardMaterial color="#c00" />
      </mesh>
      {/* MCB switch panel below */}
      <mesh position={[-0.06, -0.35, 0]}>
        <boxGeometry args={[0.1, 0.3, 0.45]} />
        <meshStandardMaterial color="#e8e0d0" roughness={0.6} />
      </mesh>
      {/* MCB switches */}
      {[-0.12, -0.04, 0.04, 0.12].map((z, i) => (
        <mesh key={i} position={[-0.12, -0.35, z]}>
          <boxGeometry args={[0.02, 0.08, 0.06]} />
          <meshStandardMaterial color={i < 2 ? '#2563eb' : '#888'} roughness={0.3} />
        </mesh>
      ))}
      {/* "EB" label */}
      <mesh position={[-0.13, 0.5, 0]}>
        <boxGeometry args={[0.01, 0.08, 0.2]} />
        <meshStandardMaterial color="#fff" roughness={0.5} />
      </mesh>
      {/* Glow overlay + interaction label when target */}
      {isTarget && (
        <>
          <mesh position={[-0.08, 0.1, 0]}>
            <boxGeometry args={[0.15, 0.75, 0.6]} />
            <meshStandardMaterial
              ref={glowRef}
              color="#8b5cf6"
              emissive="#8b5cf6"
              emissiveIntensity={1.0}
              transparent
              opacity={0.2}
            />
          </mesh>
          <pointLight position={[-0.2, 0.1, 0]} intensity={0.8} distance={3} color="#8b5cf6" />
          <Html position={[-0.3, 0.9, 0]} center>
            <div style={{
              background: 'rgba(139,92,246,0.95)',
              border: '2px solid #fbbf24',
              borderRadius: '10px',
              padding: '6px 12px',
              fontFamily: "'Fredoka',sans-serif",
              fontSize: '12px',
              fontWeight: 700,
              color: '#fff',
              textAlign: 'center',
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
              boxShadow: '0 0 15px rgba(139,92,246,0.5)',
            }}>
              <div>📊 EB Meter</div>
              <div style={{ fontSize: '10px', color: '#fbbf24', marginTop: '2px' }}>Press <span style={{ background: '#22c55e', color: '#000', padding: '1px 6px', borderRadius: '3px' }}>E</span></div>
            </div>
          </Html>
        </>
      )}
    </group>
  );
}

// ═══════════════════════════════════════════════════════════
//  REALISTIC CURTAIN — Same as Level 1 (folding animation)
// ═══════════════════════════════════════════════════════════
function RealisticCurtain({ isOpen, centerX = 5, centerZ = -7.84, rotY = 0 }) {
  const leftPanels = useRef([]); const rightPanels = useRef([]);
  const FOLDS = 5;
  const CURTAIN_WIDTH = 0.7;
  const foldWidth = CURTAIN_WIDTH / FOLDS;

  useFrame(() => {
    for (let i = 0; i < FOLDS; i++) {
      const leftPanel = leftPanels.current[i];
      const rightPanel = rightPanels.current[i];
      if (!leftPanel || !rightPanel) continue;
      if (isOpen) {
        const leftTarget = -0.85 - i * 0.04;
        const rightTarget = 0.85 + i * 0.04;
        leftPanel.position.x += (leftTarget - leftPanel.position.x) * 0.04;
        rightPanel.position.x += (rightTarget - rightPanel.position.x) * 0.04;
        const scaleTarget = 0.3 + i * 0.05;
        leftPanel.scale.x += (scaleTarget - leftPanel.scale.x) * 0.04;
        rightPanel.scale.x += (scaleTarget - rightPanel.scale.x) * 0.04;
      } else {
        const leftTarget = -CURTAIN_WIDTH / 2 + i * foldWidth;
        const rightTarget = i * foldWidth;
        leftPanel.position.x += (leftTarget - leftPanel.position.x) * 0.04;
        rightPanel.position.x += (rightTarget - rightPanel.position.x) * 0.04;
        leftPanel.scale.x += (1 - leftPanel.scale.x) * 0.04;
        rightPanel.scale.x += (1 - rightPanel.scale.x) * 0.04;
      }
    }
  });

  return (
    <group position={[centerX, 0, centerZ]} rotation={[0, rotY, 0]}>
      {/* Curtain rod */}
      <mesh position={[0, 2.58, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.025, 0.025, 1.9, 8]} />
        <meshStandardMaterial color="#b8860b" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Rod finials */}
      <mesh position={[-0.95, 2.58, 0]}><sphereGeometry args={[0.04, 8, 8]} /><meshStandardMaterial color="#b8860b" metalness={0.8} roughness={0.2} /></mesh>
      <mesh position={[0.95, 2.58, 0]}><sphereGeometry args={[0.04, 8, 8]} /><meshStandardMaterial color="#b8860b" metalness={0.8} roughness={0.2} /></mesh>
      {/* Left curtain folds */}
      {Array.from({ length: FOLDS }).map((_, i) => (
        <mesh key={`l${i}`} ref={el => { leftPanels.current[i] = el; }}
          position={[-CURTAIN_WIDTH / 2 + i * foldWidth, 1.82, 0]}>
          <boxGeometry args={[foldWidth - 0.01, 1.5, 0.03]} />
          <meshStandardMaterial color={i % 2 === 0 ? '#8B2500' : '#A0522D'} roughness={0.85} side={THREE.DoubleSide} />
        </mesh>
      ))}
      {/* Right curtain folds */}
      {Array.from({ length: FOLDS }).map((_, i) => (
        <mesh key={`r${i}`} ref={el => { rightPanels.current[i] = el; }}
          position={[i * foldWidth, 1.82, 0]}>
          <boxGeometry args={[foldWidth - 0.01, 1.5, 0.03]} />
          <meshStandardMaterial color={i % 2 === 0 ? '#8B2500' : '#A0522D'} roughness={0.85} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

// ═══════════════════════════════════════════════════════════
//  ANIMATED DOOR — Same as Level 1 (hinge rotation)
// ═══════════════════════════════════════════════════════════
function AnimatedDoor({ position, rotation = [0, 0, 0], isClosed, hingeOffset = 0.5, isTarget, doorLabel }) {
  const doorRef = useRef();
  const glowRef = useRef();
  const targetAngle = isClosed ? 0 : Math.PI / 2;

  useFrame(() => {
    if (!doorRef.current) return;
    doorRef.current.rotation.y += (targetAngle - doorRef.current.rotation.y) * 0.04;
    // Pulsing glow for target door
    if (glowRef.current && isTarget && !isClosed) {
      const t = performance.now() * 0.003;
      glowRef.current.emissiveIntensity = 1.5 + Math.sin(t) * 0.8;
    }
  });

  return (
    <group position={position} rotation={rotation}>
      <group ref={doorRef} position={[-hingeOffset, 0, 0]}>
        <mesh position={[hingeOffset, 1.1, 0]}>
          <boxGeometry args={[1.0, 2.1, 0.08]} />
          <meshStandardMaterial color="#7a5c3a" roughness={0.7} />
        </mesh>
        {/* Door handle */}
        <mesh position={[hingeOffset + 0.35, 1.0, 0.06]}>
          <boxGeometry args={[0.08, 0.14, 0.06]} />
          <meshStandardMaterial color="#b8860b" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Glowing frame edges when this is the target */}
        {isTarget && !isClosed && (
          <>
            {/* Top frame glow */}
            <mesh position={[hingeOffset, 2.18, 0]}>
              <boxGeometry args={[1.1, 0.06, 0.12]} />
              <meshStandardMaterial ref={glowRef} color="#22c55e" emissive="#22c55e" emissiveIntensity={1.5} transparent opacity={0.9} />
            </mesh>
            {/* Bottom frame glow */}
            <mesh position={[hingeOffset, 0.02, 0]}>
              <boxGeometry args={[1.1, 0.06, 0.12]} />
              <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={1.5} transparent opacity={0.9} />
            </mesh>
            {/* Left frame glow */}
            <mesh position={[hingeOffset - 0.52, 1.1, 0]}>
              <boxGeometry args={[0.06, 2.2, 0.12]} />
              <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={1.5} transparent opacity={0.9} />
            </mesh>
            {/* Right frame glow */}
            <mesh position={[hingeOffset + 0.52, 1.1, 0]}>
              <boxGeometry args={[0.06, 2.2, 0.12]} />
              <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={1.5} transparent opacity={0.9} />
            </mesh>
            {/* Point light for visibility */}
            <pointLight position={[hingeOffset, 1.1, 0.3]} intensity={2} distance={4} color="#22c55e" />
          </>
        )}
        {/* "Closed" indicator — red frame when door is closed */}
        {isClosed && (
          <>
            <mesh position={[hingeOffset, 2.18, 0]}>
              <boxGeometry args={[1.1, 0.04, 0.1]} />
              <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.8} transparent opacity={0.7} />
            </mesh>
          </>
        )}
      </group>
      {/* Floating label above the door when it's the target */}
      {isTarget && !isClosed && (
        <Html position={[0, 2.8, 0]} center>
          <div style={{
            background: 'rgba(5,10,5,0.95)',
            border: '2px solid #22c55e',
            borderRadius: '12px',
            padding: '8px 16px',
            textAlign: 'center',
            minWidth: '160px',
            boxShadow: '0 0 20px rgba(34,197,94,0.5)',
            animation: 'l3p1-doorpulse 1.5s ease infinite',
            pointerEvents: 'none',
          }}>
            <div style={{ fontSize: '20px', marginBottom: '4px' }}>🚪</div>
            <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: '13px', fontWeight: 700, color: '#4ade80' }}>
              {doorLabel || 'Close Door'}
            </div>
            <div style={{ fontSize: '11px', color: '#fff', marginTop: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              Press <span style={{ background: '#22c55e', color: '#000', padding: '2px 8px', borderRadius: '4px', fontWeight: 800, fontSize: '12px' }}>E</span> to Close
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

// Extended appliance list including door interaction targets
const EXTENDED_IDS = [...L2_APPLIANCE_IDS, '__door__bedroom_living', '__door__bedroom_bathroom'];

// ─── Window Pane (glass that visually opens/closes) ───
function WindowPane({ position, isOpen, width = 0.8, height = 1.0 }) {
  const ref = useRef();
  const targetAngle = isOpen ? -Math.PI / 3 : 0;
  useFrame(() => {
    if (!ref.current) return;
    ref.current.rotation.y += (targetAngle - ref.current.rotation.y) * 0.06;
  });
  return (
    <group position={position}>
      <group ref={ref} position={[-width / 2, 0, 0]}>
        <mesh position={[width / 2, 0, 0]}>
          <planeGeometry args={[width, height]} />
          <meshStandardMaterial
            color={isOpen ? '#a8d8ea' : '#c8e6f0'}
            transparent
            opacity={isOpen ? 0.3 : 0.5}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>
    </group>
  );
}

export function SceneContent({
  applianceStates, nearestAppliance, highlightIds,
  onRoomChange, onNearestChange, onInteract,
  cameraRef, proximityLevels, damageLevel,
  windowOpen, curtainOpen, door1Closed, door2Closed, showDoors, currentDoorStep,
  allowOutside, showFactory, showEBMeterOutside
}) {
  return (
    <>
      <CameraRefForwarder cameraRef={cameraRef} />
      <Level3Environment damageLevel={damageLevel} />
      <House />
      <Level2Appliances
        applianceStates={applianceStates}
        nearestAppliance={nearestAppliance}
        taskTargetIds={highlightIds}
        proximityLevels={proximityLevels}
      />
      {/* EB Meter — with target glow for eb_meter task */}
      <EBMeter3D damageLevel={damageLevel} isTarget={showEBMeterOutside} />
      {/* Window panes — visual open/close */}
      <WindowPane position={[-5, 2, -7.84]} isOpen={windowOpen} />
      <WindowPane position={[2.5, 2, -7.84]} isOpen={windowOpen} />
      <WindowPane position={[5, 2, -7.84]} isOpen={windowOpen} />
      {/* Bedroom curtains */}
      <RealisticCurtain isOpen={curtainOpen} centerX={5} centerZ={-7.84} />
      <RealisticCurtain isOpen={curtainOpen} centerX={2.5} centerZ={-7.84} />
      {/* Living room curtain */}
      <RealisticCurtain isOpen={curtainOpen} centerX={-5} centerZ={-7.84} />
      {/* TWO Animated bedroom doors */}
      {showDoors && (
        <>
          <AnimatedDoor
            position={[0, 0, -4]}
            rotation={[0, Math.PI / 2, 0]}
            isClosed={door1Closed}
            isTarget={currentDoorStep === 'close_door_1'}
            doorLabel="Living → Bedroom Door"
          />
          <AnimatedDoor
            position={[5, 0, 0]}
            isClosed={door2Closed}
            isTarget={currentDoorStep === 'close_door_2'}
            doorLabel="Bedroom → Bathroom Door"
          />
        </>
      )}
      {/* ══ OUTDOOR ELEMENTS ══ */}
      {allowOutside && (
        <>
          <OutdoorPath />
          <FactoryExterior isTarget={showFactory} />
        </>
      )}

      <Player
        onRoomChange={onRoomChange}
        onNearestApplianceChange={onNearestChange}
        onInteract={onInteract}
        applianceIdList={EXTENDED_IDS}
        allowOutside={allowOutside}
      />
    </>
  );
}

// ═══════════════════════════════════════════════════════════
//  UI HELPER COMPONENTS
// ═══════════════════════════════════════════════════════════

// Animated counter with smooth interpolation
export function AnimatedValue({ value, prefix = '', suffix = '', decimals = 0 }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let cur = display;
    let raf;
    const step = () => {
      const diff = value - cur;
      if (Math.abs(diff) < (decimals > 0 ? 0.01 : 1)) {
        setDisplay(value);
        return;
      }
      cur += diff * 0.12;
      setDisplay(decimals > 0 ? Math.round(cur * 100) / 100 : Math.round(cur));
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => { if (raf) cancelAnimationFrame(raf); };
  }, [value]);
  return (
    <span>
      {prefix}
      {decimals > 0 ? display.toFixed(decimals) : display.toLocaleString()}
      {suffix}
    </span>
  );
}

// Floating text notification
export function FloatingText({ text, type, id, onDone }) {
  useEffect(() => {
    const timer = setTimeout(() => onDone(id), 2000);
    return () => clearTimeout(timer);
  }, [id, onDone]);
  return <div className={`l3p1-float-text ${type}`}>{text}</div>;
}

// Dashboard metric card
export function DashboardMetric({ icon, value, label, color, pulse }) {
  return (
    <div className={`l3p1-metric ${pulse ? 'pulse' : ''}`}>
      <div className="l3p1-metric-icon">{icon}</div>
      <div className="l3p1-metric-value" style={{ color }}>{value}</div>
      <div className="l3p1-metric-label">{label}</div>
    </div>
  );
}

// Step checklist item
export function StepItem({ label, done, active }) {
  return (
    <div className={`l3p1-step-item ${done ? 'done' : ''} ${active ? 'active' : ''}`}>
      <div className="l3p1-step-check">{done ? '✓' : active ? '→' : ''}</div>
      <span>{label}</span>
    </div>
  );
}
