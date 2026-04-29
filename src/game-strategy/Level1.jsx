import React, { useState, useCallback, Suspense, useEffect, useRef } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import House from './House';
import Player, { cameraMode, playerState } from './Player';
import Appliances from './Appliances';
import { LEVEL1_TASK_POSITIONS, LEVEL1_QUIZ_QUESTIONS, QUIZ_QUESTIONS, APPLIANCE_DATA, INTERACTABLE_IDS } from './applianceData';
import { WINDOW_POSITIONS } from './House';
import { useGame } from '../context/GameContext';
import { getTranslation, getVoiceLocale } from '../translations/index';
import LevelIntro from './LevelIntro';
import {
  PHASE1_TASKS, PHASE1_TASK_POSITIONS, AC_TEMP_OPTIONS, MICRO_FEEDBACK,
  calculateIndoorTemp, isComfortable, calculatePerformance, CUTSCENE_DATA, LEARNING_OUTCOMES
} from './level1Phase1Data';
import './Level1.css';

// ─── Speech Engine ───
let isSpeakingGlobal = false;
function speak(text, langCode = 'en', rate = 0.9, pitch = 1.05, onEnd) {
  if (langCode !== 'en') { if (onEnd) onEnd(); return; }
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = rate; u.pitch = pitch;
    u.lang = getVoiceLocale(langCode);
    isSpeakingGlobal = true;
    u.onend = () => { isSpeakingGlobal = false; if (onEnd) onEnd(); };
    u.onerror = () => { isSpeakingGlobal = false; if (onEnd) onEnd(); };
    window.speechSynthesis.speak(u);
  }
}
function stopSpeech() {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  isSpeakingGlobal = false;
}

// ─── Audio System ───
let audioCtx = null;
function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}
function playInteractSound() {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator(); const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(523, ctx.currentTime);
    osc.frequency.setValueAtTime(659, ctx.currentTime + 0.08);
    osc.frequency.setValueAtTime(784, ctx.currentTime + 0.16);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.4);
  } catch (e) { }
}
function playCorrectSound() {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator(); const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(523, ctx.currentTime);
    osc.frequency.setValueAtTime(784, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.5);
  } catch (e) { }
}
function playWrongSound() {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator(); const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.setValueAtTime(150, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.4);
  } catch (e) { }
}
function playTaskCompleteSound() {
  try {
    const ctx = getAudioCtx();
    [523, 659, 784].forEach((freq, i) => {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12);
      gain.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.4);
      osc.start(ctx.currentTime + i * 0.12); osc.stop(ctx.currentTime + i * 0.12 + 0.4);
    });
  } catch (e) { }
}
function playLevelCompleteSound() {
  try {
    const ctx = getAudioCtx();
    [523, 659, 784, 1047].forEach((freq, i) => {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.15);
      gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 0.5);
      osc.start(ctx.currentTime + i * 0.15); osc.stop(ctx.currentTime + i * 0.15 + 0.5);
    });
  } catch (e) { }
}

// ─── Icons ───
const ICONS = {
  bulb: '\u{1F4A1}', brain: '\u{1F9E0}', check: '\u{2705}', cross: '\u{274C}',
  star: '\u{2B50}', fire: '\u{1F525}', trophy: '\u{1F3C6}', party: '\u{1F389}',
  thumbsUp: '\u{1F44D}', muscle: '\u{1F4AA}', zap: '\u{26A1}', leaf: '\u{1F33F}',
  house: '\u{1F3E0}', sun: '\u{2600}\u{FE0F}', moon: '\u{1F319}',
  wind: '\u{1F32C}\u{FE0F}', thermometer: '\u{1F321}\u{FE0F}',
  teacher: '\u{1F468}\u{200D}\u{1F3EB}', sparkles: '\u{2728}',
};

// ─── Task Definitions (Phase 1) — 7-Task Decision System ───
const TASKS = PHASE1_TASKS.map(t => ({
  id: t.id,
  title: t.title,
  icon: t.icon,
  shortTitle: t.shortTitle,
  objective: t.systemPrompt,
  markerId: `phase1_task_${t.id}`,
  popup: {
    title: t.comfortableResult?.title || t.correctResult?.title || t.sufficientResult?.title || `✅ Task ${t.id} Complete`,
    message: t.comfortableResult?.message || t.correctResult?.message || t.sufficientResult?.message || t.learning || '',
    learning: t.comfortableResult?.learning || t.correctResult?.learning || t.sufficientResult?.learning || t.learning || '',
  },
  data: t, // full task data for multi-step logic
}));

// ═══ 3D TASK MARKER ═══
function TaskMarker3D({ position, label, isActive, isCompleted, taskNumber, hideLabel }) {
  const markerRef = useRef();
  const ringRef = useRef();
  useFrame(() => {
    if (!markerRef.current) return;
    const t = performance.now() * 0.003;
    markerRef.current.position.y = position[1] + Math.sin(t) * 0.15;
    if (ringRef.current) { ringRef.current.scale.setScalar(1 + Math.sin(t * 2) * 0.15); ringRef.current.rotation.y += 0.02; }
  });
  if (isCompleted || !isActive) return null;
  return (
    <group ref={markerRef} position={position}>
      <mesh><sphereGeometry args={[0.2, 16, 16]} /><meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={1.5} transparent opacity={0.8} /></mesh>
      <mesh ref={ringRef}><torusGeometry args={[0.35, 0.03, 8, 32]} /><meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.8} transparent opacity={0.5} /></mesh>
      <pointLight intensity={0.8} distance={4} color="#22c55e" />
      {!hideLabel && (
        <Html position={[0, 0.8, 0]} center>
          <div className="task-marker-label">
            <div className="task-marker-number">Task {taskNumber}</div>
            <div className="task-marker-text">{label}</div>
            <div className="task-marker-hint">Press <span className="task-key">E</span></div>
          </div>
        </Html>
      )}
    </group>
  );
}

// ═══ AIRFLOW PARTICLES ═══
function AirflowParticles({ visible }) {
  const groupRef = useRef();
  const particlesRef = useRef([]);
  useEffect(() => {
    if (visible) particlesRef.current = Array.from({ length: 20 }, () => ({ x: -9.5 + Math.random() * 0.5, y: 1.0 + Math.random() * 1.5, z: -6 + Math.random() * 4, speed: 0.02 + Math.random() * 0.03 }));
  }, [visible]);
  useFrame(() => {
    if (!visible || !groupRef.current) return;
    const ch = groupRef.current.children;
    particlesRef.current.forEach((p, i) => { p.x += p.speed; if (p.x > -3) p.x = -9.5; if (ch[i]) ch[i].position.set(p.x, p.y + Math.sin(performance.now() * 0.002 + i) * 0.1, p.z); });
  });
  if (!visible) return null;
  return (<group ref={groupRef}>{Array.from({ length: 20 }).map((_, i) => (<mesh key={i} position={[-9.5, 1.5, -4]}><sphereGeometry args={[0.04, 6, 6]} /><meshStandardMaterial color="#87CEEB" emissive="#87CEEB" emissiveIntensity={0.8} transparent opacity={0.5} /></mesh>))}</group>);
}

// ═══ CURTAIN MESH (legacy) ═══
function CurtainMesh({ isOpen }) {
  const leftRef = useRef(); const rightRef = useRef();
  useFrame(() => {
    if (leftRef.current && rightRef.current) {
      const tl = isOpen ? 4.0 : 4.65; leftRef.current.position.x += (tl - leftRef.current.position.x) * 0.05;
      const tr = isOpen ? 6.0 : 5.35; rightRef.current.position.x += (tr - rightRef.current.position.x) * 0.05;
      const sc = isOpen ? 0.3 : 1; leftRef.current.scale.x += (sc - leftRef.current.scale.x) * 0.05; rightRef.current.scale.x += (sc - rightRef.current.scale.x) * 0.05;
    }
  });
  return (<group>
    <mesh ref={leftRef} position={[4.65, 1.8, -7.85]}><boxGeometry args={[0.7, 1.4, 0.05]} /><meshStandardMaterial color="#8B4513" roughness={0.8} side={THREE.DoubleSide} /></mesh>
    <mesh ref={rightRef} position={[5.35, 1.8, -7.85]}><boxGeometry args={[0.7, 1.4, 0.05]} /><meshStandardMaterial color="#8B4513" roughness={0.8} side={THREE.DoubleSide} /></mesh>
    <mesh position={[5, 2.55, -7.85]}><cylinderGeometry args={[0.02, 0.02, 1.8, 8]} /><meshStandardMaterial color="#b8860b" metalness={0.7} roughness={0.3} /></mesh>
  </group>);
}

// ═══ REALISTIC CURTAIN ═══
function RealisticCurtain({ isOpen }) {
  const leftPanels = useRef([]); const rightPanels = useRef([]);
  const FOLDS = 5; // number of fold segments per side
  const CURTAIN_WIDTH = 0.7; // total width of each curtain panel
  const foldWidth = CURTAIN_WIDTH / FOLDS;

  useFrame(() => {
    // Smooth animation — panels slide to sides and bunch up when open
    for (let i = 0; i < FOLDS; i++) {
      const leftPanel = leftPanels.current[i];
      const rightPanel = rightPanels.current[i];
      if (!leftPanel || !rightPanel) continue;

      // Calculate target positions
      const centerX = 5; // window center X
      const spreadClosed = (i - FOLDS / 2 + 0.5) * foldWidth;

      if (isOpen) {
        // Bunch up to the sides
        const leftTarget = centerX - 0.85 - i * 0.04;
        const rightTarget = centerX + 0.85 + i * 0.04;
        leftPanel.position.x += (leftTarget - leftPanel.position.x) * 0.04;
        rightPanel.position.x += (rightTarget - rightPanel.position.x) * 0.04;
        // Scrunch scale
        const scaleTarget = 0.3 + i * 0.05;
        leftPanel.scale.x += (scaleTarget - leftPanel.scale.x) * 0.04;
        rightPanel.scale.x += (scaleTarget - rightPanel.scale.x) * 0.04;
      } else {
        // Spread evenly across window
        const leftTarget = centerX - CURTAIN_WIDTH / 2 + i * foldWidth;
        const rightTarget = centerX + i * foldWidth;
        leftPanel.position.x += (leftTarget - leftPanel.position.x) * 0.04;
        rightPanel.position.x += (rightTarget - rightPanel.position.x) * 0.04;
        leftPanel.scale.x += (1 - leftPanel.scale.x) * 0.04;
        rightPanel.scale.x += (1 - rightPanel.scale.x) * 0.04;
      }
    }
  });

  return (
    <group>
      {/* Curtain rod */}
      <mesh position={[5, 2.58, -7.84]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.025, 0.025, 1.9, 8]} />
        <meshStandardMaterial color="#b8860b" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Rod finials */}
      <mesh position={[4.05, 2.58, -7.84]}><sphereGeometry args={[0.04, 8, 8]} /><meshStandardMaterial color="#b8860b" metalness={0.8} roughness={0.2} /></mesh>
      <mesh position={[5.95, 2.58, -7.84]}><sphereGeometry args={[0.04, 8, 8]} /><meshStandardMaterial color="#b8860b" metalness={0.8} roughness={0.2} /></mesh>

      {/* Left curtain folds */}
      {Array.from({ length: FOLDS }).map((_, i) => (
        <mesh
          key={`l${i}`}
          ref={el => { leftPanels.current[i] = el; }}
          position={[5 - CURTAIN_WIDTH / 2 + i * foldWidth, 1.82, -7.84]}
        >
          <boxGeometry args={[foldWidth - 0.01, 1.5, 0.03]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? '#8B2500' : '#A0522D'}
            roughness={0.85}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      {/* Right curtain folds */}
      {Array.from({ length: FOLDS }).map((_, i) => (
        <mesh
          key={`r${i}`}
          ref={el => { rightPanels.current[i] = el; }}
          position={[5 + i * foldWidth, 1.82, -7.84]}
        >
          <boxGeometry args={[foldWidth - 0.01, 1.5, 0.03]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? '#8B2500' : '#A0522D'}
            roughness={0.85}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

// ═══ WALL COVER ═══
function WallCover({ position, size, visible }) {
  const ref = useRef();
  useFrame(() => { if (!ref.current) return; const t = visible ? 1 : 0; ref.current.material.opacity += (t - ref.current.material.opacity) * 0.05; ref.current.visible = ref.current.material.opacity > 0.01; });
  return (<mesh ref={ref} position={position}><boxGeometry args={size} /><meshStandardMaterial color="#f5f0e8" roughness={0.85} transparent opacity={1} /></mesh>);
}

// ═══ WINDOW FRAME — Appears when window is installed ═══
function WindowFrame({ position, visible }) {
  const groupRef = useRef();
  useFrame(() => {
    if (!groupRef.current) return;
    const t = visible ? 1 : 0;
    groupRef.current.scale.y += (t - groupRef.current.scale.y) * 0.06;
    groupRef.current.visible = groupRef.current.scale.y > 0.01;
  });
  return (
    <group ref={groupRef} position={position} scale={[1, 0, 1]}>
      {/* Glass pane — transparent blue */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.3, 1.2, 0.04]} />
        <meshStandardMaterial color="#b8d4e8" transparent opacity={0.25} roughness={0.1} metalness={0.3} />
      </mesh>
      {/* Horizontal divider */}
      <mesh position={[0, 0, 0.02]}>
        <boxGeometry args={[1.3, 0.04, 0.04]} />
        <meshStandardMaterial color="#8B6914" roughness={0.6} />
      </mesh>
      {/* Vertical divider */}
      <mesh position={[0, 0, 0.02]}>
        <boxGeometry args={[0.04, 1.2, 0.04]} />
        <meshStandardMaterial color="#8B6914" roughness={0.6} />
      </mesh>
      {/* Frame — top */}
      <mesh position={[0, 0.62, 0.01]}><boxGeometry args={[1.4, 0.06, 0.06]} /><meshStandardMaterial color="#8B6914" roughness={0.5} /></mesh>
      {/* Frame — bottom */}
      <mesh position={[0, -0.62, 0.01]}><boxGeometry args={[1.4, 0.06, 0.06]} /><meshStandardMaterial color="#8B6914" roughness={0.5} /></mesh>
      {/* Frame — left */}
      <mesh position={[-0.67, 0, 0.01]}><boxGeometry args={[0.06, 1.3, 0.06]} /><meshStandardMaterial color="#8B6914" roughness={0.5} /></mesh>
      {/* Frame — right */}
      <mesh position={[0.67, 0, 0.01]}><boxGeometry args={[0.06, 1.3, 0.06]} /><meshStandardMaterial color="#8B6914" roughness={0.5} /></mesh>
    </group>
  );
}

// ═══ ANIMATED DOOR — Rotates closed on command ═══
function AnimatedDoor({ position, rotation = [0, 0, 0], isClosed, hingeOffset = 0.5 }) {
  const doorRef = useRef();
  const targetAngle = isClosed ? Math.PI / 2 : 0; // 90° rotation = closed

  useFrame(() => {
    if (!doorRef.current) return;
    doorRef.current.rotation.y += (targetAngle - doorRef.current.rotation.y) * 0.04;
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
      </group>
    </group>
  );
}

// ═══ SUNLIGHT BEAM ═══
function SunlightBeam({ position, visible }) {
  const ref = useRef();
  useFrame(() => { if (!ref.current) return; const t = visible ? 0.15 : 0; ref.current.material.opacity += (t - ref.current.material.opacity) * 0.03; ref.current.visible = ref.current.material.opacity > 0.005; });
  if (!visible && (!ref.current || ref.current.material.opacity < 0.01)) return null;
  return (<mesh ref={ref} position={position} rotation={[-0.3, 0, 0]}><coneGeometry args={[1.5, 3, 16, 1, true]} /><meshBasicMaterial color="#fffde0" transparent opacity={0} side={THREE.DoubleSide} /></mesh>);
}

// ═══ DYNAMIC LIGHTING ═══
function DynamicLighting({ windowsInstalled, curtainsOpen, timeOfDay }) {
  const ambientRef = useRef(); const sunRef = useRef(); const hemiRef = useRef(); const windowLightRef = useRef();
  useFrame(() => {
    const isDay = timeOfDay === 'day'; const hasW = windowsInstalled > 0; const hasC = curtainsOpen;
    let tA = 0.15; if (hasW && isDay) tA = 0.35; if (hasC && isDay) tA = 0.5; if (!isDay) tA = 0.12;
    let tS = 0.3; if (hasW && isDay) tS = 0.8; if (hasC && isDay) tS = 1.2; if (!isDay) tS = 0.05;
    if (ambientRef.current) { ambientRef.current.intensity += (tA - ambientRef.current.intensity) * 0.03; ambientRef.current.color.set(isDay ? '#ffe8cc' : '#1a1a3e'); }
    if (sunRef.current) { sunRef.current.intensity += (tS - sunRef.current.intensity) * 0.03; }
    if (hemiRef.current) hemiRef.current.intensity = tA * 0.7;
    if (windowLightRef.current) { const tw = hasW && isDay ? 1.5 : 0; windowLightRef.current.intensity += (tw - windowLightRef.current.intensity) * 0.03; }
  });
  return (<>
    <ambientLight ref={ambientRef} intensity={0.15} color="#ffe8cc" />
    <directionalLight ref={sunRef} position={[8, 10, 10]} intensity={0.3} color="#ffd699" />
    <hemisphereLight ref={hemiRef} args={['#ffecd2', '#b97a20', 0.1]} />
    <pointLight ref={windowLightRef} position={[-5, 2, -6]} intensity={0} distance={15} color="#fffbe6" />
    <pointLight position={[-8, 4, -5]} intensity={0.15} color="#ffeedd" distance={20} />
  </>);
}

// ═══ ARTIFICIAL LIGHTS ═══
function ArtificialLights({ lightsOn }) {
  return (<>
    <pointLight position={[-3, 2.9, -6]} intensity={lightsOn ? 1.0 : 0} distance={7} color="#ffe4a0" />
    <pointLight position={[-7, 2.85, 4]} intensity={lightsOn ? 0.6 : 0} distance={6} color="#ffe0b0" />
    <pointLight position={[5, 2.8, -5]} intensity={lightsOn ? 0.8 : 0} distance={6} color="#ffe4a0" />
  </>);
}

// ═══ Camera Ref Forwarder ═══
function CameraRefForwarder({ cameraRef }) {
  const { camera } = useThree();
  useEffect(() => { cameraRef.current = camera; }, [camera, cameraRef]);
  return null;
}

// ═══ CINEMATIC DRONE CAMERA ═══
function CinematicCamera({ active, onComplete }) {
  const { camera } = useThree();
  const progress = useRef(0);
  const startPos = new THREE.Vector3(0, 45, 45);
  const endPos = new THREE.Vector3(-12, 8, -2);
  const lookTarget = new THREE.Vector3(0, 1, 0);
  const completed = useRef(false);

  useEffect(() => {
    if (active) {
      progress.current = 0;
      completed.current = false;
      camera.position.copy(startPos);
      camera.lookAt(lookTarget);
    }
  }, [active]);

  useFrame((_, delta) => {
    if (!active || completed.current) return;
    progress.current += delta / 10;
    const t = Math.min(progress.current, 1);
    const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    camera.position.lerpVectors(startPos, endPos, ease);
    camera.lookAt(lookTarget);
    if (t >= 1 && !completed.current) {
      completed.current = true;
      onComplete();
    }
  });
  return null;
}

// ═══ ENVIRONMENT TREES ═══
function EnvironmentTrees() {
  const trees = React.useMemo(() => [
    [-16, 0, -12], [-20, 0, -5], [-18, 0, 5], [-22, 0, 10],
    [-15, 0, 14], [15, 0, -14], [18, 0, -8], [20, 0, 3],
    [16, 0, 12], [22, 0, 8], [-12, 0, -16], [12, 0, -16],
    [-14, 0, 16], [14, 0, 16], [0, 0, 18],
  ], []);
  return (
    <group>
      {trees.map((pos, i) => {
        const s = 0.8 + (i % 5) * 0.15;
        return (
          <group key={i} position={pos} scale={[s, s, s]}>
            <mesh position={[0, 1.2, 0]}>
              <cylinderGeometry args={[0.15, 0.25, 2.4, 6]} />
              <meshStandardMaterial color="#5a3a1a" roughness={0.9} />
            </mesh>
            <mesh position={[0, 3.0, 0]}>
              <coneGeometry args={[1.5, 2.5, 6]} />
              <meshStandardMaterial color="#2d5a1e" roughness={0.8} />
            </mesh>
            <mesh position={[0, 3.8, 0]}>
              <coneGeometry args={[1.1, 2.0, 6]} />
              <meshStandardMaterial color="#3a7a2a" roughness={0.8} />
            </mesh>
            <mesh position={[0, 4.4, 0]}>
              <coneGeometry args={[0.7, 1.5, 6]} />
              <meshStandardMaterial color="#4a8a3a" roughness={0.8} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

// ═══ CINEMATIC OVERLAY ═══
function CinematicOverlay({ visible, textPhase }) {
  if (!visible) return null;
  return (
    <div className="cinematic-overlay">
      <div className={`cinematic-text ${textPhase}`}>
        {textPhase === 'welcome' && (
          <div className="cinematic-welcome">
            <div className="cinematic-emoji">🏠</div>
            <h1 className="cinematic-title">Welcome Home</h1>
            <p className="cinematic-subtitle">Your sustainable journey begins here</p>
          </div>
        )}
        {textPhase === 'entering' && (
          <div className="cinematic-entering">
            <p className="cinematic-entering-text">Entering your home…</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══ CATEGORY COLOR HELPER ═══
function getCategoryColor(cat) {
  const c = { 'Cooling': '#0ea5e9', 'Lighting': '#f59e0b', 'Electronics': '#8b5cf6', 'Heating': '#ef4444', 'Heating/Cooking': '#f97316', 'Motors/Cooking': '#ec4899', 'Motors/Laundry': '#6366f1', 'Electronics/Comms': '#14b8a6', 'Electronics/Entertainment': '#a855f7', 'Electronics/Charging': '#22c55e', 'Cooling/Preservation': '#06b6d4' };
  return c[cat] || '#6366f1';
}

// ═══ TRACKER ROOM GROUPS ═══
const TRACKER_ROOMS = [
  { name: 'Living Room', icon: '🛋️', ids: ['ceiling_fan', 'led_bulb', 'tv_smart', 'wifi_router', 'set_top_box'] },
  { name: 'Bedroom', icon: '🛏️', ids: ['ac_1_5ton', 'phone_charger', 'table_fan'] },
  { name: 'Kitchen', icon: '🍳', ids: ['fridge', 'induction', 'microwave', 'mixer_grinder', 'led_tube'] },
  { name: 'Bathroom', icon: '🚿', ids: ['geyser', 'washing_machine'] },
];

// ═══ 3D SCENE CONTENT ═══
function SceneContent({
  cameraRef, onInteract, onRoomChange, onNearestChange,
  currentTask, completedTasks, windowsInstalled, curtainsOpen, timeOfDay,
  showAirflow, lightsOn, hideLabels, phase, activeApplianceId, interactedAppliances,
  onApplianceClick, onWindowClick, taskSubPhase, taskStep, door1Closed, door2Closed
}) {
  // During 'steps' phase, use the step-specific marker ID so the marker moves to the step location
  const taskIdList = React.useMemo(() => {
    if (phase !== 'building' || currentTask > 7) return [];
    const activeTask = TASKS.find(t => t.id === currentTask);
    if (!activeTask) return [];

    // If in steps phase and the step has a position, use step-specific ID
    if (taskSubPhase === 'steps') {
      const stepKey = `phase1_task_${currentTask}_step_${taskStep}`;
      if (PHASE1_TASK_POSITIONS[stepKey]) return [stepKey];
    }
    return [activeTask.markerId];
  }, [currentTask, phase, taskSubPhase, taskStep]);

  // In appliance phase, use the full interactable IDs list
  const applianceIdList = phase === 'appliances' ? INTERACTABLE_IDS : taskIdList;

  // Determine the active marker position (step-specific or main task)
  const getMarkerPos = (task) => {
    if (task.id === currentTask && taskSubPhase === 'steps') {
      const stepKey = `phase1_task_${currentTask}_step_${taskStep}`;
      const stepPos = PHASE1_TASK_POSITIONS[stepKey];
      if (stepPos) return stepPos.pos;
    }
    const pos = PHASE1_TASK_POSITIONS[task.markerId];
    return pos ? pos.pos : null;
  };

  return (
    <>
      <DynamicLighting windowsInstalled={windowsInstalled} curtainsOpen={curtainsOpen} timeOfDay={timeOfDay} />
      <ArtificialLights lightsOn={lightsOn} />
      <CameraRefForwarder cameraRef={cameraRef} />
      <House />
      <EnvironmentTrees />

      {/* Window covers — disappear when windows are opened */}
      <WallCover position={[-5, 1.8, -7.95]} size={[1.5, 1.4, 0.2]} visible={windowsInstalled < 1} />

      {/* Window frames — appear when windows are installed */}
      <WindowFrame position={[-5, 1.8, -7.9]} visible={windowsInstalled >= 1} />

      <SunlightBeam position={[-5, 1, -6]} visible={windowsInstalled > 0 && timeOfDay === 'day'} />
      <SunlightBeam position={[-8, 1, -4]} visible={windowsInstalled > 1 && timeOfDay === 'day'} />
      <SunlightBeam position={[5, 1, -6]} visible={curtainsOpen && timeOfDay === 'day'} />
      <RealisticCurtain isOpen={curtainsOpen} />
      <AirflowParticles visible={showAirflow} />

      {/* Bedroom doors — animate closed during AC task */}
      <AnimatedDoor position={[5, 0, 0.05]} isClosed={door1Closed} />
      <AnimatedDoor position={[0.05, 0, -4]} rotation={[0, Math.PI / 2, 0]} isClosed={door2Closed} />

      {/* Phase 1: Task markers — position follows current step */}
      {phase === 'building' && TASKS.map(task => {
        const markerPos = getMarkerPos(task);
        if (!markerPos) return null;
        const stepLabel = (task.id === currentTask && taskSubPhase === 'steps')
          ? task.data?.steps?.[taskStep]?.instruction || task.objective
          : task.objective;
        return <TaskMarker3D key={task.id} position={markerPos} label={stepLabel} isActive={currentTask === task.id} isCompleted={completedTasks.has(task.id)} taskNumber={task.id} hideLabel={hideLabels} />;
      })}

      {/* Phase 2: Appliances */}
      {phase === 'appliances' && (
        <Appliances
          onApplianceClick={onApplianceClick}
          onWindowClick={onWindowClick}
          activeApplianceId={activeApplianceId}
          interactedAppliances={interactedAppliances}
          hideLabels={hideLabels}
        />
      )}

      <Player onRoomChange={onRoomChange} onNearestApplianceChange={onNearestChange} onInteract={onInteract} applianceIdList={applianceIdList} />
    </>
  );
}

// ═══ HUD COMPONENTS ═══
function BuildingTaskHUD({ currentTask, completedTasks }) {
  return (
    <div className="building-task-hud">
      {TASKS.map(task => (
        <div key={task.id} className={`task-step ${completedTasks.has(task.id) ? 'done' : ''} ${currentTask === task.id ? 'active' : ''}`}>
          <div className="task-step-circle">{completedTasks.has(task.id) ? '✓' : task.id}</div>
          <div className="task-step-label">{task.icon}</div>
        </div>
      ))}
    </div>
  );
}

function TaskObjective({ task }) {
  if (!task) return null;
  return (
    <div className="task-objective-banner">
      <div className="task-objective-icon">{task.icon}</div>
      <div className="task-objective-info">
        <div className="task-objective-title">{task.title}</div>
        <div className="task-objective-text">{task.objective}</div>
      </div>
    </div>
  );
}

function EnergyMeter({ energyLevel }) {
  const pct = Math.max(0, Math.min(100, energyLevel));
  const color = pct > 70 ? '#ef4444' : pct > 40 ? '#f59e0b' : '#22c55e';
  return (
    <div className="energy-meter">
      <div className="energy-meter-label">⚡ Energy Usage</div>
      <div className="energy-meter-bar"><div className="energy-meter-fill" style={{ width: `${pct}%`, background: color }} /></div>
      <div className="energy-meter-value" style={{ color }}>{pct}%</div>
    </div>
  );
}

function TemperatureDisplay({ visible, indoor, outdoor }) {
  if (!visible) return null;
  return (
    <div className="temp-display">
      <div className="temp-badge outdoor"><span className="temp-icon">🌡️</span><span className="temp-label">Outside</span><span className="temp-value">{outdoor}°C</span></div>
      <div className="temp-badge indoor"><span className="temp-icon">🏠</span><span className="temp-label">Inside</span><span className="temp-value">{indoor}°C</span></div>
    </div>
  );
}

// ═══ APPLIANCE DISCOVERY HUD (Phase 2) ═══
function ApplianceDiscoveryHUD({ found, total, points, stars }) {
  return (
    <>
      {/* Star rating - top left */}
      <div className="ad-stars-badge">
        {[1, 2, 3, 4, 5].map(s => (
          <span key={s} className={`ad-star ${s <= stars ? 'earned' : 'empty'}`}>⭐</span>
        ))}
        <span className="ad-stars-count">{stars}</span>
      </div>

      {/* Points + Found counter - top center */}
      <div className="ad-score-pill">
        <span className="ad-coin-icon">🪙</span>
        <div className="ad-score-section">
          <span className="ad-score-value">{points}</span>
          <span className="ad-score-label">POINTS</span>
        </div>
        <div className="ad-score-divider" />
        <div className="ad-score-section">
          <span className="ad-score-value">{found}/{total}</span>
          <span className="ad-score-label">FOUND</span>
        </div>
      </div>
    </>
  );
}

// ═══ APPLIANCE BOTTOM INFO TOAST (Phase 2) ═══
function ApplianceInfoToast({ applianceId }) {
  if (!applianceId) return null;
  const data = APPLIANCE_DATA[applianceId];
  if (!data) return null;
  return (
    <div className="appliance-toast">
      <div className="appliance-toast-icon">{data.icon}</div>
      <div className="appliance-toast-content">
        <div className="appliance-toast-name">{data.name}</div>
        <div className="appliance-toast-stats">{data.wattage}W ⚡ {data.annualKwh} kWh/yr</div>
        <div className="appliance-toast-tip">💡 {data.funFact}</div>
      </div>
    </div>
  );
}

// ═══ APPLIANCE INFO POPUP (Phase 2) — Redesigned Premium UI ═══
function ApplianceInfoPopup({ applianceId, onClose, langCode, interactedCount, totalCount }) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    if (applianceId) {
      const data = APPLIANCE_DATA[applianceId];
      if (data && data.description) {
        speak(`${data.name}. ${data.description}`, langCode || 'en', data.voiceRate || 0.9, data.voicePitch || 1.05, () => setIsSpeaking(false));
        setIsSpeaking(true);
      }
    }
    return () => { stopSpeech(); setIsSpeaking(false); };
  }, [applianceId, langCode]);

  if (!applianceId) return null;
  const data = APPLIANCE_DATA[applianceId];
  if (!data) return null;

  const annualKwh = typeof data.annualKwh === 'string' ? parseInt(data.annualKwh) : (data.annualKwh || 0);
  const co2 = typeof data.co2PerYear === 'string' ? data.co2PerYear : (data.co2PerYear || '—');
  const monthlyKwh = typeof data.monthlyKwh === 'string' ? data.monthlyKwh : (data.monthlyKwh || '—');
  const progressPct = totalCount > 0 ? Math.round((interactedCount / totalCount) * 100) : 0;
  const wattVal = typeof data.wattage === 'string' ? parseInt(data.wattage) : data.wattage;
  const wattColor = isNaN(wattVal) ? '#f59e0b' : wattVal < 100 ? '#22c55e' : wattVal <= 500 ? '#f59e0b' : '#ef4444';
  const wattBg = isNaN(wattVal) ? 'rgba(245,158,11,0.08)' : wattVal < 100 ? 'rgba(34,197,94,0.08)' : wattVal <= 500 ? 'rgba(245,158,11,0.08)' : 'rgba(239,68,68,0.08)';

  const handleClose = () => { stopSpeech(); setIsSpeaking(false); onClose(); };
  const toggleSpeak = () => {
    if (isSpeaking) { stopSpeech(); setIsSpeaking(false); }
    else { speak(`${data.name}. ${data.description}`, langCode || 'en', data.voiceRate || 0.9, data.voicePitch || 1.05, () => setIsSpeaking(false)); setIsSpeaking(true); }
  };

  return (
    <div className="aip-overlay" onClick={handleClose}>
      <div className="aip-card" onClick={e => e.stopPropagation()}>
        <button className="aip-close" onClick={handleClose}>✕</button>

        {/* ── Header: Icon + Name + Category ── */}
        <div className="aip-header">
          <div className="aip-icon-wrap"><span className="aip-icon">{data.icon}</span></div>
          <div className="aip-header-info">
            <h2 className="aip-name">{data.name}</h2>
            <div className="aip-category" style={{ background: getCategoryColor(data.category) }}>{data.category}</div>
          </div>
        </div>

        {/* ── Wattage + Usage Row ── */}
        <div className="aip-power-row" style={{ borderColor: wattColor + '30', background: wattBg }}>
          <div className="aip-wattage" style={{ color: wattColor }}>⚡ {data.wattage}W</div>
          <div className="aip-usage">{data.usePerDay || '—'} • {data.daysPerYear ? `${data.daysPerYear} days/yr` : '365 days/yr'}</div>
        </div>

        {/* ── Stats grid ── */}
        <div className="aip-stats">
          <div className="aip-stat">
            <div className="aip-stat-icon">📊</div>
            <div className="aip-stat-value">{monthlyKwh}</div>
            <div className="aip-stat-label">KWH/MO</div>
          </div>
          <div className="aip-stat">
            <div className="aip-stat-icon">📅</div>
            <div className="aip-stat-value">{annualKwh}</div>
            <div className="aip-stat-label">KWH/YR</div>
          </div>
          <div className="aip-stat">
            <div className="aip-stat-icon">🌍</div>
            <div className="aip-stat-value">{co2}</div>
            <div className="aip-stat-label">KG CO₂/YR</div>
          </div>
        </div>

        {/* ── About This Appliance ── */}
        <div className="aip-section">
          <div className="aip-section-title">📖 About</div>
          <p className="aip-desc-text">{data.description}</p>
        </div>

        {/* ── Energy Saving Tip ── */}
        {(data.energySavingTip || data.funFact) && (
          <div className="aip-tip-box">
            <div className="aip-tip-header">
              <span className="aip-tip-icon">💡</span>
              <span className="aip-tip-title">Energy Saving Tip</span>
            </div>
            <p className="aip-tip-text">{data.energySavingTip || data.funFact}</p>
          </div>
        )}



        {/* ── Fun Fact (separate from tip) ── */}
        {data.funFact && data.energySavingTip && (
          <div className="aip-funfact">
            <span className="aip-funfact-icon">🎯</span>
            <span className="aip-funfact-text">{data.funFact}</span>
          </div>
        )}

        {/* ── Progress ── */}
        <div className="aip-progress-section">
          <span className="aip-progress-label">Discovery Progress: {interactedCount}/{totalCount}</span>
          <div className="aip-progress"><div className="aip-progress-fill" style={{ width: `${progressPct}%` }} /></div>
        </div>

        {/* ── Bottom Row ── */}
        <div className="aip-bottom-row">
          <button className={`aip-speaker ${isSpeaking ? 'speaking' : ''}`} onClick={toggleSpeak}>
            {isSpeaking ? '🔊 Speaking...' : '🔈 Listen'}
          </button>
          <button className="aip-btn" onClick={handleClose}>Got it! →</button>
        </div>
      </div>
    </div>
  );
}

// ═══ APPLIANCE SIDE TRACKER (Phase 2 HUD — Always visible table) ═══
function ApplianceSideTracker({ interactedAppliances }) {
  const [collapsed, setCollapsed] = useState(false);
  const found = interactedAppliances.size;
  const total = INTERACTABLE_IDS.length;
  return (
    <div className={`side-tracker ${collapsed ? 'collapsed' : ''}`}>
      <button className="side-tracker-toggle" onClick={() => setCollapsed(c => !c)}>
        {collapsed ? '◀' : '▶'} <span className="side-tracker-toggle-label">📋 {found}/{total}</span>
      </button>
      {!collapsed && (
        <div className="side-tracker-body">
          <div className="side-tracker-header">
            <span className="side-tracker-title">Appliance Checklist</span>
            <span className="side-tracker-count">{found}/{total}</span>
          </div>
          <div className="side-tracker-progress"><div className="side-tracker-progress-fill" style={{ width: `${(found / total) * 100}%` }} /></div>
          {TRACKER_ROOMS.map(room => {
            const roomFound = room.ids.filter(id => interactedAppliances.has(id)).length;
            return (
              <div key={room.name} className="side-tracker-room">
                <div className="side-tracker-room-header">
                  <span>{room.icon} {room.name}</span>
                  <span className="side-tracker-room-count">{roomFound}/{room.ids.length}</span>
                </div>
                <table className="side-tracker-table">
                  <tbody>
                    {room.ids.map(id => {
                      const d = APPLIANCE_DATA[id];
                      const done = interactedAppliances.has(id);
                      return (
                        <tr key={id} className={done ? 'found' : ''}>
                          <td className="st-icon">{d?.icon || '❓'}</td>
                          <td className="st-name">{d?.name?.split('(')[0]?.trim() || id}</td>
                          <td className="st-status">{done ? '✅' : '⬜'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ═══ POPUP OVERLAYS ═══
function TaskPopup({ visible, popup, onClose, langCode }) {
  // Voiceover: speak popup message when visible
  useEffect(() => {
    if (visible && popup) {
      speak(`${popup.title}. ${popup.message}. ${popup.learning}`, langCode || 'en', 0.9, 1.05);
    }
    return () => { if (!visible) stopSpeech(); };
  }, [visible, popup, langCode]);

  if (!visible || !popup) return null;
  return (
    <div className="task-popup-overlay" onClick={() => { stopSpeech(); onClose(); }}>
      <div className="task-popup-card" onClick={e => e.stopPropagation()}>
        <div className="task-popup-sparkle">✨</div>
        <h2 className="task-popup-title">{popup.title}</h2>
        <p className="task-popup-message">{popup.message}</p>
        <div className="task-popup-learning">
          <span className="task-popup-learning-icon">🧠</span>
          <span className="task-popup-learning-text">{popup.learning}</span>
        </div>
        <button className="task-popup-btn" onClick={() => { stopSpeech(); onClose(); }}>Continue →</button>
      </div>
    </div>
  );
}

function TeacherMessage({ visible, title, message, onClose }) {
  if (!visible) return null;
  return (
    <div className="teacher-overlay">
      <div className="teacher-card">
        <div className="teacher-avatar">{ICONS.teacher}</div>
        <div className="teacher-content"><h3 className="teacher-title">{title}</h3><p className="teacher-text">{message}</p></div>
        <button className="teacher-btn" onClick={onClose}>Got it! →</button>
      </div>
    </div>
  );
}

function ECBCPopup({ visible, onClose }) {
  if (!visible) return null;
  return (
    <div className="task-popup-overlay" onClick={onClose}>
      <div className="task-popup-card ecbc-card" onClick={e => e.stopPropagation()}>
        <div className="task-popup-sparkle">🏗️</div>
        <h2 className="task-popup-title">🏗️ ECBC — Smart Building Design</h2>
        <p className="task-popup-message"><strong>Energy Conservation Building Code</strong><br /><br />Good building design saves energy without extra cost:</p>
        <div className="ecbc-points">
          <div className="ecbc-point">🪟 Windows bring natural light</div>
          <div className="ecbc-point">🌬️ Airflow reduces fan usage</div>
          <div className="ecbc-point">☀️ Sunlight replaces electricity</div>
          <div className="ecbc-point">🌡️ Ventilation reduces AC need</div>
        </div>
        <div className="task-popup-learning"><span className="task-popup-learning-icon">💡</span><span className="task-popup-learning-text">"Windows, airflow, and sunlight reduce electricity use"</span></div>
        <button className="task-popup-btn" onClick={onClose}>Continue →</button>
      </div>
    </div>
  );
}

function BeforeAfterCutscene({ visible, onComplete }) {
  const [phase, setPhase] = useState('before');
  useEffect(() => {
    if (!visible) { setPhase('before'); return; }
    const t1 = setTimeout(() => setPhase('after'), 3500);
    const t2 = setTimeout(() => setPhase('done'), 7000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [visible]);
  useEffect(() => { if (phase === 'done' && visible) onComplete(); }, [phase, visible, onComplete]);
  if (!visible) return null;
  return (
    <div className="cutscene-overlay">
      <div className={`cutscene-content ${phase}`}>
        {phase === 'before' && (<div className="cutscene-panel before"><div className="cutscene-label">❌ BEFORE</div><div className="cutscene-items"><div className="cutscene-item">🌑 Dark house</div><div className="cutscene-item">🚫 No airflow</div><div className="cutscene-item">💡 Lights always ON</div><div className="cutscene-item">📈 High energy usage</div></div></div>)}
        {phase === 'after' && (<div className="cutscene-panel after"><div className="cutscene-label">✅ AFTER</div><div className="cutscene-items"><div className="cutscene-item">☀️ Bright house</div><div className="cutscene-item">🌬️ Natural airflow</div><div className="cutscene-item">💡 Lights OFF</div><div className="cutscene-item">📉 Comfortable & efficient</div></div></div>)}
      </div>
    </div>
  );
}

// ═══ WINDOW INFO POPUP (Phase 2) ═══
const WINDOW_INFO = {
  bedroom_window_back: {
    title: 'Bedroom Window (Back)',
    message: "This window faces the back of the house. During daytime, it lets in natural light so you don't need electric lights. At night, keep curtains closed for privacy and insulation.",
    learning: 'Windows provide free lighting during the day, reducing electricity usage by up to 30%.',
    tip: 'Opening this window with one on the opposite wall creates cross ventilation — natural cooling without a fan!',
  },
  bedroom_window_front: {
    title: 'Bedroom Window (Front)',
    message: 'This front-facing window brings in morning or afternoon sunlight depending on your house orientation. Together with the back window, it enables cross ventilation.',
    learning: 'Cross ventilation through opposite windows can reduce indoor temperature by 2-4 degrees C naturally.',
    tip: 'Use light-colored curtains to filter harsh sunlight while still keeping the room bright.',
  },
  kitchen_window_back: {
    title: 'Kitchen Window',
    message: "The kitchen window is essential for removing cooking heat, smoke, and odors naturally. It also brings in light so you don't need tube lights during the day.",
    learning: 'A well-ventilated kitchen reduces the need for exhaust fans and keeps the cooking area comfortable.',
    tip: 'Keep the kitchen window open while cooking to let hot air and smoke escape naturally.',
  },
  bathroom_window: {
    title: 'Bathroom Window',
    message: 'This frosted glass window provides privacy while letting in diffused light and allowing moisture to escape. It prevents mold growth and reduces the need for exhaust fans.',
    learning: 'Natural ventilation in bathrooms saves electricity on exhaust fans and prevents moisture damage.',
    tip: 'Keep the bathroom window slightly open after showers to let steam escape naturally.',
  },
};

function WindowInfoPopup({ windowId, onClose }) {
  if (!windowId) return null;
  const info = WINDOW_INFO[windowId];
  if (!info) return null;

  return (
    <div className="aip-overlay" onClick={onClose}>
      <div className="aip-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        <button className="aip-close" onClick={onClose}>&#x2715;</button>

        <div className="aip-header">
          <div className="aip-icon-wrap" style={{ background: 'linear-gradient(135deg, #e0f2fe, #bae6fd, #e0f7fa)' }}>
            <span className="aip-icon">&#x1FA9F;</span>
          </div>
          <div className="aip-header-info">
            <h2 className="aip-name">{info.title}</h2>
            <div className="aip-category" style={{ background: '#0ea5e9' }}>Building Design</div>
          </div>
        </div>

        <div className="aip-section">
          <div className="aip-section-title">&#x1F4D6; About This Window</div>
          <p className="aip-desc-text">{info.message}</p>
        </div>

        <div className="aip-tip-box">
          <div className="aip-tip-header">
            <span className="aip-tip-icon">&#x1F9E0;</span>
            <span className="aip-tip-title">What You Should Know</span>
          </div>
          <p className="aip-tip-text">{info.learning}</p>
        </div>

        <div className="aip-funfact">
          <span className="aip-funfact-icon">&#x1F4A1;</span>
          <span className="aip-funfact-text">{info.tip}</span>
        </div>

        <div className="aip-bottom-row">
          <button className="aip-btn" onClick={onClose}>Got it! &#x2192;</button>
        </div>
      </div>
    </div>
  );
}

// ═══ PHASE TRANSITION (Building → Appliances) ═══
function PhaseTransition({ visible, onStart }) {
  if (!visible) return null;
  return (
    <div className="phase-transition-overlay">
      <div className="phase-transition-card">
        <div className="phase-transition-icon">&#x1F50D;</div>
        <h2 className="phase-transition-title">Phase 2: Discover Your Appliances</h2>
        <p className="phase-transition-text">
          Your house is now well-designed! Next, walk around and discover all the appliances in your home.
          Press E near each appliance to learn its wattage, usage, and saving tips.
        </p>
        <button className="phase-transition-btn" onClick={onStart}>Start Exploring &#x2192;</button>
      </div>
    </div>
  );
}

// ═══ QUIZ WITH NEXT BUTTON ═══
function BuildingQuizModal({ questions, title, onComplete }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [orderedQuestions] = useState(() => [...questions].sort((a, b) => (a.difficulty || 1) - (b.difficulty || 1)));
  if (orderedQuestions.length === 0) return null;
  const question = orderedQuestions[currentIdx];
  if (!question) return null;
  const total = orderedQuestions.length;
  const handleAnswer = (idx) => { if (answered) return; setSelectedIndex(idx); setAnswered(true); if (idx === question.correctIndex) { playCorrectSound(); setScore(s => s + 1); } else playWrongSound(); };
  const handleNext = () => { if (currentIdx + 1 >= total) onComplete(score + (selectedIndex === question.correctIndex ? 0 : 0), total); else { setAnswered(false); setSelectedIndex(null); setCurrentIdx(i => i + 1); } };
  return (
    <div className="quiz-overlay">
      <div className="quiz-modal full-quiz">
        <div className="quiz-header"><span className="quiz-icon">{ICONS.brain}</span><h3>{title || 'Knowledge Quiz'}</h3></div>
        <div className="quiz-progress-bar"><div className="quiz-progress-fill" style={{ width: `${((currentIdx + 1) / total) * 100}%` }} /><span className="quiz-progress-text">Question {currentIdx + 1} / {total}</span></div>
        <p className="quiz-question">{question.question}</p>
        <div className="quiz-options">
          {question.options.map((opt, i) => {
            let cls = 'quiz-option';
            if (answered) { if (i === question.correctIndex) cls += ' correct'; else if (i === selectedIndex) cls += ' wrong'; }
            return <button key={i} className={cls} onClick={() => handleAnswer(i)} disabled={answered}>{String.fromCharCode(65 + i)}. {opt}</button>;
          })}
        </div>
        {answered && (<div className={`quiz-feedback ${selectedIndex === question.correctIndex ? 'correct' : 'wrong'}`}>{selectedIndex === question.correctIndex ? `${ICONS.check} Correct!` : `${ICONS.cross} Wrong! The answer is ${String.fromCharCode(65 + question.correctIndex)}.`}<p className="quiz-explanation">{question.explanation}</p></div>)}
        {answered && <button className="quiz-next-btn" onClick={handleNext}>{currentIdx + 1 >= total ? 'Finish Quiz →' : 'Next Question →'}</button>}
      </div>
    </div>
  );
}

// ═══ LEVEL COMPLETE SCREEN ═══
function LevelCompleteScreen({ score, total, stars, appliancesFound, onContinue }) {
  const pct = Math.round((score / total) * 100);
  return (
    <div className="level-complete-overlay">
      <div className="level-complete-modal">
        <div className="confetti-container">{Array.from({ length: 30 }).map((_, i) => (<div key={i} className="confetti-piece" style={{ '--delay': `${Math.random() * 2}s`, '--x': `${Math.random() * 100}%`, '--rotation': `${Math.random() * 360}deg`, '--color': ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'][i % 6] }} />))}</div>
        <div className="lc-celebration">{ICONS.party}</div>
        <h2 className="lc-title">Level 1 Complete!</h2>
        <p className="lc-subtitle">Building & Natural Design + Appliance Discovery</p>
        <div className="lc-stars">{[1, 2, 3].map(s => (<span key={s} className={`lc-star ${s <= stars ? 'earned' : 'empty'}`} style={{ animationDelay: `${s * 0.3}s` }}>{ICONS.star}</span>))}</div>
        <div className="lc-score"><div className="lc-score-number">{score}/{total}</div><div className="lc-score-label">Quiz Answers ({pct}%)</div></div>
        <div className="lc-rating-label">{stars === 3 ? `${ICONS.trophy} Outstanding!` : stars === 2 ? `${ICONS.thumbsUp} Great Work!` : `${ICONS.muscle} Good effort!`}</div>
        <div className="lc-learning-summary"><h4>🧠 What You Learned:</h4><ul>
          <li>House design affects energy consumption</li>
          <li>Natural light reduces electricity need</li>
          <li>Ventilation reduces fan and AC usage</li>
          <li>Discovered {appliancesFound} home appliances & their wattage</li>
        </ul></div>
        <button className="lc-continue-btn" onClick={onContinue}>Continue →</button>
      </div>
    </div>
  );
}

// ═══ CONTROLS HELP ═══
function L1ControlsHelp() {
  const [show, setShow] = useState(false);
  const [auto, setAuto] = useState(false);
  useEffect(() => { if (!auto) { setShow(true); setAuto(true); const t = setTimeout(() => setShow(false), 3000); return () => clearTimeout(t); } }, []);
  return (
    <>
      <button className="l1-help-btn" onClick={() => setShow(true)}>?</button>
      {show && (
        <div className="l1-controls-overlay" onClick={() => setShow(false)}>
          <div className="l1-controls-card" onClick={e => e.stopPropagation()}>
            <div className="l1-controls-title">{ICONS.star} Controls</div>
            <div className="l1-controls-list">
              <div className="l1-ctrl-row"><span className="l1-ctrl-keys"><span className="l1-key">W</span> / <span className="l1-key">↑</span></span><span>Move Forward</span></div>
              <div className="l1-ctrl-row"><span className="l1-ctrl-keys"><span className="l1-key">S</span> / <span className="l1-key">↓</span></span><span>Move Backward</span></div>
              <div className="l1-ctrl-row"><span className="l1-ctrl-keys"><span className="l1-key">A</span> / <span className="l1-key">←</span></span><span>Turn Left</span></div>
              <div className="l1-ctrl-row"><span className="l1-ctrl-keys"><span className="l1-key">D</span> / <span className="l1-key">→</span></span><span>Turn Right</span></div>
              <div className="l1-ctrl-row"><span className="l1-ctrl-keys"><span className="l1-key">E</span></span><span>Interact</span></div>
            </div>
            <button className="l1-controls-got-it" onClick={() => setShow(false)}>Got it!</button>
          </div>
        </div>
      )}
    </>
  );
}

// ═══ SYSTEM PROMPT (Decision Interrupt) ═══
function SystemPrompt({ visible, message, onDismiss }) {
  if (!visible) return null;
  return (
    <div className="system-prompt-overlay" onClick={onDismiss}>
      <div className="system-prompt-card" onClick={e => e.stopPropagation()}>
        <div className="system-prompt-icon">🧠</div>
        <div className="system-prompt-text">{message}</div>
        <button className="system-prompt-btn" onClick={onDismiss}>I understand →</button>
      </div>
    </div>
  );
}

// ═══ TASK STEP INDICATOR ═══
function TaskStepIndicator({ steps, currentStep, taskTitle }) {
  if (!steps || steps.length === 0) return null;
  return (
    <div className="task-step-indicator">
      <div className="task-step-title">{taskTitle}</div>
      <div className="task-step-list">
        {steps.map((step, i) => (
          <div key={step.id} className={`task-step-item ${i < currentStep ? 'done' : i === currentStep ? 'active' : ''}`}>
            <div className="task-step-num">{i < currentStep ? '✓' : i + 1}</div>
            <div className="task-step-text">{step.icon} {step.instruction}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══ AC TEMPERATURE DIAL ═══
function ACTemperatureDial({ visible, onSelect }) {
  if (!visible) return null;
  return (
    <div className="ac-dial-overlay">
      <div className="ac-dial-card">
        <div className="ac-dial-header">
          <span className="ac-dial-icon">❄️</span>
          <h3 className="ac-dial-title">Set AC Temperature</h3>
          <p className="ac-dial-subtitle">Choose wisely — temperature setting affects energy consumption!</p>
        </div>
        <div className="ac-dial-options">
          {AC_TEMP_OPTIONS.map(opt => (
            <button key={opt.temp} className={`ac-dial-option ac-dial-${opt.status}`}
              style={{ borderColor: opt.borderColor, background: opt.bgColor }}
              onClick={() => onSelect(opt)}>
              <div className="ac-dial-opt-temp">{opt.label}</div>
              <div className="ac-dial-opt-icon">{opt.icon}</div>
              <div className="ac-dial-opt-impact" style={{ color: opt.color }}>{opt.energyImpact}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══ MICRO FEEDBACK TOAST ═══
function MicroFeedbackToast({ feedback, visible }) {
  if (!visible || !feedback) return null;
  const typeClass = feedback.type === 'success' ? 'mf-success' : feedback.type === 'warning' ? 'mf-warning' : feedback.type === 'error' ? 'mf-error' : 'mf-info';
  return (
    <div className={`micro-feedback-toast ${typeClass}`}>
      <span className="mf-text">{feedback.text}</span>
    </div>
  );
}

// ═══ DECISION POINT MODAL ═══
function DecisionPointModal({ visible, resultData, onContinue }) {
  if (!visible || !resultData) return null;
  return (
    <div className="task-popup-overlay" onClick={onContinue}>
      <div className="task-popup-card decision-result-card" onClick={e => e.stopPropagation()}>
        <div className="task-popup-sparkle">✨</div>
        <h2 className="task-popup-title">{resultData.title}</h2>
        <p className="task-popup-message">{resultData.message}</p>
        <div className="task-popup-learning">
          <span className="task-popup-learning-icon">🧠</span>
          <span className="task-popup-learning-text">{resultData.learning}</span>
        </div>
        {resultData.scoreDisplay !== undefined && (
          <div className="decision-score-badge">+{resultData.scoreDisplay} points</div>
        )}
        <button className="task-popup-btn" onClick={onContinue}>Continue →</button>
      </div>
    </div>
  );
}

// ═══ TEMPERATURE STRATEGY UI (Task 5) ═══
function TemperatureStrategyUI({ visible, cases, currentCase, onAction, result }) {
  if (!visible) return null;
  const c = cases?.[currentCase];
  if (!c && !result) return null;

  if (result) {
    return (
      <div className="task-popup-overlay">
        <div className="task-popup-card" onClick={e => e.stopPropagation()}>
          <div className="task-popup-sparkle">{result.correct ? '✅' : '⚠️'}</div>
          <h2 className="task-popup-title">{result.correct ? 'Correct Decision!' : 'Not the Best Choice'}</h2>
          <p className="task-popup-message">{result.explanation}</p>
          <div className="task-popup-learning">
            <span className="task-popup-learning-icon">🧠</span>
            <span className="task-popup-learning-text">{result.correct ? 'Great thinking!' : 'Remember: compare temperatures first!'}</span>
          </div>
          <button className="task-popup-btn" onClick={result.onContinue}>Continue →</button>
        </div>
      </div>
    );
  }

  return (
    <div className="temp-strategy-overlay">
      <div className="temp-strategy-card">
        <h3 className="temp-strategy-title">🌡️ {c.label}</h3>
        <div className="temp-strategy-temps">
          <div className="temp-strategy-badge indoor">🏠 Indoor: <strong>{c.indoorTemp}°C</strong></div>
          <div className="temp-strategy-badge outdoor">🌡️ Outdoor: <strong>{c.outdoorTemp}°C</strong></div>
        </div>
        <p className="temp-strategy-question">What's the best action?</p>
        <div className="temp-strategy-actions">
          <button className="temp-strategy-btn window" onClick={() => onAction('openWindow')}>
            🪟 Open Window
          </button>
          <button className="temp-strategy-btn ac" onClick={() => onAction('useAC')}>
            ❄️ Use AC
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══ COMBINED CHALLENGE UI (Task 6) ═══
function CombinedChallengeUI({ visible, decisions, answers, onAnswer, onSubmit, submitted, result }) {
  if (!visible) return null;

  if (submitted && result) {
    return (
      <div className="task-popup-overlay">
        <div className="task-popup-card" onClick={e => e.stopPropagation()}>
          <div className="task-popup-sparkle">{result.icon}</div>
          <h2 className="task-popup-title">{result.label}</h2>
          <p className="task-popup-message">{result.feedback}</p>
          <div className="decision-score-badge">+{result.score} points</div>
          <button className="task-popup-btn" onClick={onSubmit}>Continue →</button>
        </div>
      </div>
    );
  }

  return (
    <div className="combined-challenge-overlay">
      <div className="combined-challenge-card">
        <h3 className="combined-challenge-title">🔥 Combined Decision Challenge</h3>
        <p className="combined-challenge-desc">Daytime • Medium heat (30°C) • Medium room • Outdoor: 28°C</p>
        <div className="combined-challenge-questions">
          {decisions.map((d, i) => (
            <div key={d.id} className="combined-q">
              <div className="combined-q-text">{d.question}</div>
              <div className="combined-q-options">
                {d.options.map(opt => (
                  <button key={opt} className={`combined-q-btn ${answers[d.id] === opt ? 'selected' : ''}`}
                    onClick={() => onAnswer(d.id, opt)}>
                    {opt === 'yes' ? '✅ Yes' : opt === 'no' ? '❌ No' : '🔄 Optional'}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <button className="combined-submit-btn" onClick={onSubmit}
          disabled={Object.keys(answers).length < decisions.length}>
          Submit Decisions →
        </button>
      </div>
    </div>
  );
}

// ═══ HABIT REINFORCEMENT UI (Task 7) ═══
function HabitReinforcementUI({ visible, situation, onAction, result }) {
  if (!visible) return null;

  if (result) {
    return (
      <div className="task-popup-overlay">
        <div className="task-popup-card" onClick={e => e.stopPropagation()}>
          <div className="task-popup-sparkle">{result.correct ? '✅' : '⚠️'}</div>
          <h2 className="task-popup-title">{result.correct ? 'Correct!' : 'Think Again!'}</h2>
          <p className="task-popup-message">{result.explanation}</p>
          <button className="task-popup-btn" onClick={result.onContinue}>Next →</button>
        </div>
      </div>
    );
  }

  if (!situation) return null;
  return (
    <div className="habit-overlay">
      <div className="habit-card">
        <div className="habit-header">
          <span className="habit-icon">{situation.icon}</span>
          <h3 className="habit-title">{situation.title}</h3>
        </div>
        <p className="habit-desc">{situation.description}</p>
        <div className="habit-actions">
          <button className="habit-btn correct" onClick={() => onAction(situation.correctAction)}>
            {situation.correctLabel}
          </button>
          <button className="habit-btn wrong" onClick={() => onAction(situation.wrongAction)}>
            {situation.wrongLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══ DAY/NIGHT CYCLE UI (Task 4) ═══
function DayNightCycleUI({ visible, phase, cycle, totalCycles, actions, onAction }) {
  if (!visible) return null;
  const isDay = phase === 'day';
  const data = isDay ? actions?.dayActions : actions?.nightActions;
  if (!data) return null;

  return (
    <div className="daynight-overlay">
      <div className={`daynight-card ${isDay ? 'day' : 'night'}`}>
        <div className="daynight-header">
          <span className="daynight-icon">{isDay ? '🌞' : '🌙'}</span>
          <h3 className="daynight-title">{data.title}</h3>
          <span className="daynight-cycle">Cycle {cycle}/{totalCycles}</span>
        </div>
        <div className="daynight-instructions">
          {data.instructions.map((inst, i) => (
            <div key={i} className="daynight-inst">{inst}</div>
          ))}
        </div>
        <button className="daynight-btn" onClick={onAction}>
          {isDay ? 'Apply Day Actions →' : 'Apply Night Actions →'}
        </button>
      </div>
    </div>
  );
}

// ═══ PERFORMANCE SUMMARY ═══
function PerformanceSummary({ visible, data, onContinue }) {
  if (!visible || !data) return null;
  return (
    <div className="performance-overlay">
      <div className="performance-card">
        <div className="performance-header">
          <span className="performance-icon">📊</span>
          <h2 className="performance-title">Phase 1 Performance</h2>
          <p className="performance-rating">{data.rating}</p>
        </div>
        <div className="performance-stars">
          {[1, 2, 3].map(s => (
            <span key={s} className={`performance-star ${s <= data.stars ? 'earned' : 'empty'}`}>⭐</span>
          ))}
        </div>
        <div className="performance-metrics">
          <div className="perf-metric">
            <div className="perf-metric-label">🌿 Natural Usage</div>
            <div className="perf-metric-bar"><div className="perf-metric-fill natural" style={{ width: `${data.naturalUsage}%` }} /></div>
            <div className="perf-metric-value">{data.naturalUsage}%</div>
          </div>
          <div className="perf-metric">
            <div className="perf-metric-label">⚡ Appliance Usage</div>
            <div className="perf-metric-bar"><div className="perf-metric-fill appliance" style={{ width: `${data.applianceUsage}%` }} /></div>
            <div className="perf-metric-value">{data.applianceUsage}%</div>
          </div>
          <div className="perf-metric">
            <div className="perf-metric-label">🎯 Efficiency Score</div>
            <div className="perf-metric-bar"><div className="perf-metric-fill efficiency" style={{ width: `${data.efficiencyScore}%` }} /></div>
            <div className="perf-metric-value">{data.efficiencyScore}%</div>
          </div>
        </div>
        <div className="performance-score">Score: {data.totalScore}/{data.maxScore}</div>
        <div className="performance-learnings">
          <h4>🧠 What You Learned:</h4>
          <ul>{LEARNING_OUTCOMES.map((l, i) => <li key={i}>{l}</li>)}</ul>
        </div>
        <button className="performance-btn" onClick={onContinue}>Continue to Quiz →</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
//  MAIN LEVEL 1 COMPONENT
// ═══════════════════════════════════════════════════
export default function Level1() {
  const navigate = useNavigate();
  const { selectedLanguage, completeLevel, unlockLevel, addCarbonCoins } = useGame();
  const cameraRef = useRef(null);

  // ─── PHASE: 'intro' → 'cinematic' → 'building' → 'transition' → 'appliances' → 'quiz' → 'complete' ───
  const [showLevelIntro, setShowLevelIntro] = useState(true);
  const [showCinematic, setShowCinematic] = useState(false);
  const [cinematicText, setCinematicText] = useState('none');
  const [showTeacherIntro, setShowTeacherIntro] = useState(false);
  const [phase, setPhase] = useState('building'); // 'building' | 'appliances'

  // Phase 1: Building Tasks state — NEW 7-task decision system
  const [currentTask, setCurrentTask] = useState(1);
  const [completedTasks, setCompletedTasks] = useState(new Set());
  const [showTaskPopup, setShowTaskPopup] = useState(false);
  const [currentPopup, setCurrentPopup] = useState(null);
  const [showECBC, setShowECBC] = useState(false);
  const [showCutscene, setShowCutscene] = useState(false);
  const [showTeacherEnd, setShowTeacherEnd] = useState(false);

  // Phase 1: Multi-step task state
  const [taskSubPhase, setTaskSubPhase] = useState('idle'); // 'idle' | 'prompt' | 'steps' | 'ac_dial' | 'decision' | 'special'
  const [taskStep, setTaskStep] = useState(0);
  const [indoorTemp, setIndoorTemp] = useState(29);
  const [outdoorTemp, setOutdoorTemp] = useState(27);
  const [windowOpen, setWindowOpen] = useState(false);
  const [curtainOpenState, setCurtainOpenState] = useState(false);
  const [fanOn, setFanOn] = useState(false);
  const [acOn, setAcOn] = useState(false);
  const [acTemp, setAcTemp] = useState(null);
  const [taskScores, setTaskScores] = useState([]);
  const [microFeedback, setMicroFeedback] = useState(null);
  const [showMicroFeedback, setShowMicroFeedback] = useState(false);
  const [showPerformance, setShowPerformance] = useState(false);
  const [performanceData, setPerformanceData] = useState(null);

  // Phase 1: Special task UIs
  const [showACDial, setShowACDial] = useState(false);
  const [showTempStrategy, setShowTempStrategy] = useState(false);
  const [tempStrategyCase, setTempStrategyCase] = useState(0);
  const [tempStrategyResult, setTempStrategyResult] = useState(null);
  const [showCombinedChallenge, setShowCombinedChallenge] = useState(false);
  const [combinedAnswers, setCombinedAnswers] = useState({});
  const [combinedSubmitted, setCombinedSubmitted] = useState(false);
  const [combinedResult, setCombinedResult] = useState(null);
  const [showHabitUI, setShowHabitUI] = useState(false);
  const [habitSitIdx, setHabitSitIdx] = useState(0);
  const [habitResult, setHabitResult] = useState(null);
  const [showDayNightCycle, setShowDayNightCycle] = useState(false);
  const [dayNightPhase, setDayNightPhase] = useState('day');
  const [dayNightCycle, setDayNightCycle] = useState(1);
  const [showSystemPrompt, setShowSystemPrompt] = useState(false);
  const [systemPromptMsg, setSystemPromptMsg] = useState('');

  // Phase 2: Appliance Discovery state
  const [showPhaseTransition, setShowPhaseTransition] = useState(false);
  const [activeApplianceId, setActiveApplianceId] = useState(null);
  const [interactedAppliances, setInteractedAppliances] = useState(new Set());
  const [showApplianceInfo, setShowApplianceInfo] = useState(false);
  const [nearbyApplianceId, setNearbyApplianceId] = useState(null);
  const [showWindowInfo, setShowWindowInfo] = useState(false);
  const [activeWindowId, setActiveWindowId] = useState(null);

  // Track nearest appliance for bottom toast
  useEffect(() => {
    if (phase !== 'appliances') return;
    const interval = setInterval(() => {
      const nearest = playerState.nearestAppliance;
      setNearbyApplianceId(nearest && !nearest.startsWith('__window__') ? nearest : null);
    }, 200);
    return () => clearInterval(interval);
  }, [phase]);

  // End state — separate quizzes for Phase 1 and Phase 2
  const [showPhase1Quiz, setShowPhase1Quiz] = useState(false);
  const [showPhase2Quiz, setShowPhase2Quiz] = useState(false);
  const [showLevelComplete, setShowLevelComplete] = useState(false);
  const [phase1Score, setPhase1Score] = useState(0);
  const [phase1Total, setPhase1Total] = useState(0);
  const [phase2Score, setPhase2Score] = useState(0);
  const [phase2Total, setPhase2Total] = useState(0);
  const [finalStars, setFinalStars] = useState(0);

  // House state
  const [windowsInstalled, setWindowsInstalled] = useState(0);
  const [curtainsOpen, setCurtainsOpen] = useState(false);
  const [timeOfDay, setTimeOfDay] = useState('day');
  const [showAirflow, setShowAirflow] = useState(false);
  const [lightsOn, setLightsOn] = useState(true);
  const [energyLevel, setEnergyLevel] = useState(100);
  const [currentRoom, setCurrentRoom] = useState('Living Room');
  const [door1Closed, setDoor1Closed] = useState(false);
  const [door2Closed, setDoor2Closed] = useState(false);

  // Teacher intro after cinematic completes
  useEffect(() => {
    if (!showLevelIntro && !showCinematic && !showTeacherIntro && currentTask === 1 && completedTasks.size === 0) setShowTeacherIntro(true);
  }, [showLevelIntro, showCinematic]);

  // Cinematic text sequence
  useEffect(() => {
    if (!showCinematic) { setCinematicText('none'); return; }
    setCinematicText('welcome');
    const t1 = setTimeout(() => setCinematicText('entering'), 4500);
    const t2 = setTimeout(() => setCinematicText('none'), 8500);
    // Play ambient chime
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      [262, 330, 392, 523].forEach((freq, i) => {
        const osc = ctx.createOscillator(); const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.4);
        gain.gain.setValueAtTime(0.04, ctx.currentTime + i * 0.4);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.4 + 1.5);
        osc.start(ctx.currentTime + i * 0.4); osc.stop(ctx.currentTime + i * 0.4 + 1.5);
      });
    } catch (e) { }
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [showCinematic]);

  // Update energy from completed tasks (7 tasks)
  useEffect(() => {
    let e = 100;
    if (completedTasks.has(1)) e -= 15;
    if (completedTasks.has(2)) e -= 15;
    if (completedTasks.has(3)) e -= 12;
    if (completedTasks.has(4)) e -= 12;
    if (completedTasks.has(5)) e -= 10;
    if (completedTasks.has(6)) e -= 10;
    if (completedTasks.has(7)) e -= 8;
    setEnergyLevel(Math.max(15, e));
  }, [completedTasks]);

  // Update lights
  useEffect(() => {
    if (timeOfDay === 'day' && (windowsInstalled > 0 || curtainsOpen)) setLightsOn(false);
    else if (timeOfDay === 'night') setLightsOn(true);
  }, [windowsInstalled, curtainsOpen, timeOfDay]);
  // Micro feedback helper
  const showMicroFeedbackBrief = useCallback((fb) => {
    setMicroFeedback(fb);
    setShowMicroFeedback(true);
    setTimeout(() => setShowMicroFeedback(false), 3000);
  }, []);

  // Advance to next task
  const advanceTask = useCallback((score) => {
    setTaskScores(prev => [...prev, score]);
    setCompletedTasks(prev => { const next = new Set(prev); next.add(currentTask); return next; });
    setTaskSubPhase('idle');
    setTaskStep(0);
    setWindowOpen(false);
    setCurtainOpenState(false);
    if (currentTask < 7) {
      setCurrentTask(t => t + 1);
      // Set scenario for next task
      const nextData = PHASE1_TASKS.find(t => t.id === currentTask + 1);
      if (nextData?.scenario) {
        if (nextData.scenario.indoorTemp) setIndoorTemp(nextData.scenario.indoorTemp);
        if (nextData.scenario.outdoorTemp) setOutdoorTemp(nextData.scenario.outdoorTemp);
      }
    } else {
      // All 7 tasks done → show performance then cutscene
      const allScores = [...taskScores, score];
      const perfData = calculatePerformance(allScores);
      setPerformanceData(perfData);
      setShowPerformance(true);
    }
  }, [currentTask, taskScores]);

  // ─── PHASE 1: BUILDING TASK INTERACTION (MULTI-STEP) ───
  const handleBuildingInteract = useCallback((interactedId) => {
    if (showTaskPopup || showECBC || showCutscene || showTeacherIntro || showTeacherEnd ||
        showSystemPrompt || showACDial || showTempStrategy || showCombinedChallenge ||
        showHabitUI || showDayNightCycle || showPerformance) return;

    const activeTask = TASKS.find(t => t.id === currentTask);
    if (!activeTask) return;
    // Accept both main task marker and step-specific markers
    const stepKey = `phase1_task_${currentTask}_step_${taskStep}`;
    const validId = interactedId === activeTask.markerId || interactedId === stepKey;
    if (!validId) return;
    const taskData = activeTask.data;

    playInteractSound();

    // Tasks 1-3: Multi-step action tasks (prompt → steps → decision)
    if (currentTask <= 3) {
      if (taskSubPhase === 'idle') {
        // Show system prompt first
        setSystemPromptMsg(taskData.systemPrompt);
        setShowSystemPrompt(true);
        setTaskSubPhase('prompt');
        // Set scenario temps
        if (taskData.scenario?.indoorTemp) setIndoorTemp(taskData.scenario.indoorTemp);
        if (taskData.scenario?.outdoorTemp) setOutdoorTemp(taskData.scenario.outdoorTemp);
        if (taskData.scenario?.windowStart === 'open') setWindowOpen(true);
        if (taskData.scenario?.curtainStart === 'open') { setCurtainOpenState(true); setCurtainsOpen(true); }
        // Reset doors for AC task
        if (currentTask === 2) { setDoor1Closed(false); setDoor2Closed(false); }
        return;
      }
      if (taskSubPhase === 'steps') {
        const steps = taskData.steps || [];
        if (taskStep < steps.length) {
          const step = steps[taskStep];
          // Execute action
          if (step.action === 'openWindow') { setWindowOpen(true); setWindowsInstalled(w => w + 1); setShowAirflow(true); }
          if (step.action === 'closeWindow') { setWindowOpen(false); }
          if (step.action === 'openCurtain') { setCurtainOpenState(true); setCurtainsOpen(true); }
          if (step.action === 'closeCurtain') { setCurtainOpenState(false); setCurtainsOpen(false); }
          if (step.action === 'closeDoor1') { setDoor1Closed(true); }
          if (step.action === 'closeDoor2') { setDoor2Closed(true); }
          playTaskCompleteSound();
          setTaskStep(s => s + 1);

          // If all steps done → evaluate decision
          if (taskStep + 1 >= steps.length) {
            if (currentTask === 2 && taskData.acTempRequired) {
              // AC task → show temp dial
              setShowACDial(true);
              setTaskSubPhase('ac_dial');
            } else {
              // Evaluate result
              setTimeout(() => {
                const newTemp = calculateIndoorTemp(
                  taskData.scenario.indoorTemp || indoorTemp,
                  taskData.scenario.outdoorTemp || outdoorTemp,
                  windowOpen || steps.some(s => s.action === 'openWindow'),
                  curtainOpenState || steps.some(s => s.action === 'openCurtain'),
                  taskData.scenario.roomSize || 'medium'
                );
                setIndoorTemp(newTemp);
                const comfortable = isComfortable(newTemp);

                let resultData;
                if (currentTask === 3) {
                  // Daylight task
                  resultData = taskData.sufficientResult || taskData.insufficientResult;
                  resultData = { ...resultData, message: resultData.message, scoreDisplay: resultData.score || 15 };
                } else if (comfortable) {
                  resultData = { ...taskData.comfortableResult, message: taskData.comfortableResult.message.replace('{{temp}}', newTemp), scoreDisplay: taskData.comfortableResult.score };
                } else {
                  resultData = { ...taskData.warmResult, message: taskData.warmResult.message.replace('{{temp}}', newTemp), scoreDisplay: taskData.warmResult.score };
                }
                showMicroFeedbackBrief(resultData.feedback || MICRO_FEEDBACK.efficientDecision);
                setCurrentPopup(resultData);
                setShowTaskPopup(true);
                setTaskSubPhase('decision');
              }, 500);
            }
          }
        }
        return;
      }
      return;
    }

    // Task 4: Day/Night Cycle
    if (currentTask === 4) {
      if (taskSubPhase === 'idle') {
        setSystemPromptMsg(taskData.systemPrompt);
        setShowSystemPrompt(true);
        setTaskSubPhase('prompt');
        return;
      }
      return;
    }

    // Task 5: Temperature Strategy
    if (currentTask === 5) {
      if (taskSubPhase === 'idle') {
        setShowTempStrategy(true);
        setTempStrategyCase(0);
        setTempStrategyResult(null);
        setTaskSubPhase('special');
        return;
      }
      return;
    }

    // Task 6: Combined Challenge
    if (currentTask === 6) {
      if (taskSubPhase === 'idle') {
        setShowCombinedChallenge(true);
        setCombinedAnswers({});
        setCombinedSubmitted(false);
        setCombinedResult(null);
        setTaskSubPhase('special');
        return;
      }
      return;
    }

    // Task 7: Habit Reinforcement
    if (currentTask === 7) {
      if (taskSubPhase === 'idle') {
        setShowHabitUI(true);
        setHabitSitIdx(0);
        setHabitResult(null);
        setTaskSubPhase('special');
        return;
      }
      return;
    }
  }, [currentTask, taskSubPhase, taskStep, showTaskPopup, showECBC, showCutscene, showTeacherIntro,
      showTeacherEnd, showSystemPrompt, showACDial, showTempStrategy, showCombinedChallenge,
      showHabitUI, showDayNightCycle, showPerformance, indoorTemp, outdoorTemp, windowOpen,
      curtainOpenState, showMicroFeedbackBrief]);

  // System prompt dismiss → start steps
  const handleSystemPromptDismiss = useCallback(() => {
    setShowSystemPrompt(false);
    const taskData = PHASE1_TASKS.find(t => t.id === currentTask);
    if (currentTask <= 3) {
      setTaskSubPhase('steps');
      setTaskStep(0);
    } else if (currentTask === 4) {
      // Start day/night cycle
      setShowDayNightCycle(true);
      setDayNightPhase('day');
      setDayNightCycle(1);
      setTimeOfDay('day');
      setTaskSubPhase('special');
    }
  }, [currentTask]);

  // AC dial selection
  const handleACTempSelect = useCallback((opt) => {
    setShowACDial(false);
    setAcTemp(opt.temp);
    setAcOn(true);
    const taskData = PHASE1_TASKS.find(t => t.id === currentTask);
    let resultData;
    if (windowOpen) {
      // Player didn't close windows — wasted!
      resultData = { ...taskData.ignoreResult, scoreDisplay: 0 };
      showMicroFeedbackBrief(MICRO_FEEDBACK.coolingWasted);
    } else {
      resultData = {
        ...taskData.correctResult,
        message: taskData.correctResult.message.replace('{{acTemp}}', opt.temp),
        scoreDisplay: (taskData.correctResult.score || 15) + opt.score,
      };
      showMicroFeedbackBrief(opt.status === 'good' ? MICRO_FEEDBACK.efficientCooling : MICRO_FEEDBACK.correctSetting);
    }
    setCurrentPopup(resultData);
    setShowTaskPopup(true);
    setTaskSubPhase('decision');
  }, [currentTask, windowOpen, showMicroFeedbackBrief]);

  // Day/Night cycle action handler
  const handleDayNightAction = useCallback(() => {
    const taskData = PHASE1_TASKS.find(t => t.id === 4);
    if (dayNightPhase === 'day') {
      setWindowsInstalled(w => Math.max(w, 1)); setCurtainsOpen(true); setLightsOn(false);
      showMicroFeedbackBrief(MICRO_FEEDBACK.sunlightUsed);
      setTimeOfDay('night'); setDayNightPhase('night');
    } else {
      setCurtainsOpen(false); setLightsOn(true);
      showMicroFeedbackBrief(MICRO_FEEDBACK.efficientDecision);
      if (dayNightCycle >= 2) {
        setShowDayNightCycle(false);
        setTimeOfDay('day');
        advanceTask(taskData.score || 15);
      } else {
        setDayNightCycle(c => c + 1); setTimeOfDay('day'); setDayNightPhase('day');
      }
    }
  }, [dayNightPhase, dayNightCycle, advanceTask, showMicroFeedbackBrief]);

  // Temperature strategy action
  const handleTempStrategyAction = useCallback((action) => {
    const taskData = PHASE1_TASKS.find(t => t.id === 5);
    const c = taskData.cases[tempStrategyCase];
    const correct = action === c.bestAction;
    setTempStrategyResult({
      correct,
      explanation: c.explanation,
      onContinue: () => {
        setTempStrategyResult(null);
        if (tempStrategyCase + 1 < taskData.cases.length) {
          setTempStrategyCase(i => i + 1);
        } else {
          setShowTempStrategy(false);
          advanceTask(correct ? taskData.correctScore : taskData.wrongScore);
        }
      },
    });
    showMicroFeedbackBrief(correct ? c.feedback : MICRO_FEEDBACK.energyWasted);
  }, [tempStrategyCase, advanceTask, showMicroFeedbackBrief]);

  // Combined challenge handlers
  const handleCombinedAnswer = useCallback((id, val) => {
    setCombinedAnswers(prev => ({ ...prev, [id]: val }));
  }, []);

  const handleCombinedSubmit = useCallback(() => {
    if (combinedSubmitted && combinedResult) {
      setShowCombinedChallenge(false);
      advanceTask(combinedResult.score);
      return;
    }
    const taskData = PHASE1_TASKS.find(t => t.id === 6);
    let correctCount = 0;
    taskData.decisions.forEach(d => {
      if (combinedAnswers[d.id] === d.correct) correctCount++;
    });
    const ratio = correctCount / taskData.decisions.length;
    let result;
    if (ratio >= 1) result = { ...taskData.scoring.perfect, icon: '🌟' };
    else if (ratio >= 0.75) result = { ...taskData.scoring.good, icon: '👍' };
    else if (ratio >= 0.5) result = { ...taskData.scoring.average, icon: '⚠️' };
    else result = { ...taskData.scoring.poor, icon: '❌' };
    setCombinedResult(result);
    setCombinedSubmitted(true);
  }, [combinedAnswers, combinedSubmitted, combinedResult, advanceTask]);

  // Habit reinforcement handler
  const handleHabitAction = useCallback((action) => {
    const taskData = PHASE1_TASKS.find(t => t.id === 7);
    const sit = taskData.situations[habitSitIdx];
    const correct = action === sit.correctAction;
    setHabitResult({
      correct,
      explanation: sit.explanation,
      onContinue: () => {
        setHabitResult(null);
        if (habitSitIdx + 1 < taskData.situations.length) {
          setHabitSitIdx(i => i + 1);
        } else {
          setShowHabitUI(false);
          advanceTask(correct ? taskData.correctScore : taskData.wrongScore);
        }
      },
    });
    showMicroFeedbackBrief(correct ? MICRO_FEEDBACK.efficientDecision : MICRO_FEEDBACK.energyWasted);
  }, [habitSitIdx, advanceTask, showMicroFeedbackBrief]);

  // ─── PHASE 2: APPLIANCE INTERACTION ───
  const handleApplianceInteract = useCallback((applianceId) => {
    if (showApplianceInfo || showPhase2Quiz || showLevelComplete || showWindowInfo) return;
    if (applianceId.startsWith('__window__')) {
      const windowId = applianceId.replace('__window__', '');
      const windowData = WINDOW_POSITIONS[windowId];
      if (windowData) { playInteractSound(); setActiveWindowId(windowId); setShowWindowInfo(true); }
      return;
    }
    playInteractSound();
    setActiveApplianceId(applianceId);
    setShowApplianceInfo(true);
    setInteractedAppliances(prev => { const next = new Set(prev); next.add(applianceId); return next; });
  }, [showApplianceInfo, showPhase2Quiz, showLevelComplete, showWindowInfo]);

  // Main interaction dispatcher
  const handleInteract = useCallback((id) => {
    if (phase === 'building') handleBuildingInteract(id);
    else if (phase === 'appliances') handleApplianceInteract(id);
  }, [phase, handleBuildingInteract, handleApplianceInteract]);

  // ─── FLOW HANDLERS ───
  const handleTaskPopupClose = useCallback(() => {
    setShowTaskPopup(false); setCurrentPopup(null);
    // For decision tasks (1-3), advance via the score
    if (currentTask <= 3) {
      const score = currentPopup?.scoreDisplay || currentPopup?.score || 15;
      advanceTask(score);
    }
  }, [currentTask, currentPopup, advanceTask]);

  // Performance summary → cutscene
  const handlePerformanceContinue = useCallback(() => {
    setShowPerformance(false);
    setShowCutscene(true);
  }, []);

  const handleECBCClose = useCallback(() => { setShowECBC(false); setShowCutscene(true); }, []);

  // Updated cutscene: After cutscene → teacher end → quiz
  const handleCutsceneComplete = useCallback(() => { setShowCutscene(false); setShowTeacherEnd(true); }, []);

  // After building tasks → show Phase 1 quiz
  const handleTeacherEndClose = useCallback(() => {
    setShowTeacherEnd(false);
    setShowPhase1Quiz(true);
  }, []);

  // After Phase 1 quiz → show phase transition
  const handlePhase1QuizComplete = useCallback((score, total) => {
    setPhase1Score(score); setPhase1Total(total);
    setShowPhase1Quiz(false);
    setTimeout(() => setShowPhaseTransition(true), 500);
  }, []);

  const handlePhaseStart = useCallback(() => {
    setShowPhaseTransition(false);
    setPhase('appliances');
  }, []);

  const handleApplianceInfoClose = useCallback(() => {
    setShowApplianceInfo(false);
    setActiveApplianceId(null);
    if (interactedAppliances.size >= INTERACTABLE_IDS.length) {
      setTimeout(() => setShowPhase2Quiz(true), 500);
    }
  }, [interactedAppliances]);

  // After Phase 2 quiz → level complete
  const handlePhase2QuizComplete = useCallback((score, total) => {
    setPhase2Score(score); setPhase2Total(total);
    setShowPhase2Quiz(false);
    const totalScore = phase1Score + score;
    const totalQuestions = phase1Total + total;
    const pct = (totalScore / totalQuestions) * 100;
    setFinalStars(pct >= 90 ? 3 : pct >= 60 ? 2 : 1);
    playLevelCompleteSound();
    setTimeout(() => setShowLevelComplete(true), 500);
  }, [phase1Score, phase1Total]);

  const handleRoomChange = useCallback((room) => setCurrentRoom(room), []);
  const handleNearestChange = useCallback(() => { }, []);
  const handleApplianceClick = useCallback((id) => handleApplianceInteract(id), [handleApplianceInteract]);

  // Determine if any overlay is active (for hiding 3D labels)
  const anyOverlayActive = showCinematic || showTeacherIntro || showTeacherEnd || showTaskPopup ||
    showPhase1Quiz || showPhase2Quiz || showLevelComplete || showCutscene || showECBC ||
    showPhaseTransition || showApplianceInfo || showWindowInfo || showSystemPrompt ||
    showACDial || showTempStrategy || showCombinedChallenge || showHabitUI || showDayNightCycle || showPerformance;

  // ─── LEVEL INTRO ───
  if (showLevelIntro) {
    return (
      <LevelIntro
        levelNumber={1} levelTitle="Building & Natural Design" levelIcon="🏠"
        objective="Improve a dark, poorly ventilated house using natural methods — then discover all your home appliances."
        learningOutcome="You will understand how smart house design saves energy, then learn about every appliance's wattage and saving tips."
        terms={[
          { icon: '🪟', name: 'Natural Light', definition: 'Sunlight entering through windows replaces the need for artificial electric lights.', example: 'Opening a window during daytime lights up the room without electricity' },
          { icon: '🌬️', name: 'Cross Ventilation', definition: 'Natural air flow by placing openings on opposite sides of a room.', example: 'Window + door on opposite walls = fresh air flows through' },
          { icon: '🏗️', name: 'ECBC', definition: 'Energy Conservation Building Code — design buildings that use less energy.', example: 'A well-designed house needs less AC, fans, and lights' },
        ]}
        onComplete={() => { setShowLevelIntro(false); setShowCinematic(true); }}
      />
    );
  }

  const activeTask = TASKS.find(t => t.id === currentTask);
  const activeTaskData = activeTask?.data;

  return (
    <div className="level1-container">
      <div className="canvas-wrapper">
        <Canvas
          camera={{ position: [-5, 6, 1], fov: 50 }} gl={{ antialias: false }}
          onCreated={({ gl }) => { gl.setClearColor('#1a1a2e'); gl.toneMapping = 1; gl.toneMappingExposure = 1.1; gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); }}
        >
          <Suspense fallback={null}>
            <SceneContent
              cameraRef={cameraRef} onInteract={handleInteract} onRoomChange={handleRoomChange} onNearestChange={handleNearestChange}
              currentTask={currentTask} completedTasks={completedTasks} windowsInstalled={windowsInstalled} curtainsOpen={curtainsOpen}
              timeOfDay={timeOfDay} showAirflow={showAirflow} lightsOn={lightsOn} hideLabels={anyOverlayActive}
              phase={phase} activeApplianceId={activeApplianceId} interactedAppliances={interactedAppliances}
              onApplianceClick={handleApplianceClick} onWindowClick={() => {}}
              taskSubPhase={taskSubPhase} taskStep={taskStep}
              door1Closed={door1Closed} door2Closed={door2Closed}
            />
            {showCinematic && <CinematicCamera active={showCinematic} onComplete={() => setShowCinematic(false)} />}
          </Suspense>
        </Canvas>
        <div className="vignette-overlay" />
      </div>

      {/* HUD — hidden during overlays */}
      {!anyOverlayActive && (
        <>
          <div className="level1-hud">
            <button className="hud-back-btn" onClick={() => { stopSpeech(); navigate('/hub'); }}>← Back</button>
            <div className="hud-room-name">📍 {currentRoom}</div>
            <div className="hud-instructions">{phase === 'building' ? '🏠 Think Before Using Energy' : '🔍 Appliance Discovery'}</div>
          </div>

          {/* Phase 1 HUD */}
          {phase === 'building' && (
            <>
              <BuildingTaskHUD currentTask={currentTask} completedTasks={completedTasks} />
              {activeTask && currentTask <= 7 && <TaskObjective task={activeTask} />}
              <EnergyMeter energyLevel={energyLevel} />
              <TemperatureDisplay visible={true} indoor={indoorTemp} outdoor={outdoorTemp} />
              {/* Task step indicator for multi-step tasks */}
              {taskSubPhase === 'steps' && activeTaskData?.steps && (
                <TaskStepIndicator steps={activeTaskData.steps} currentStep={taskStep} taskTitle={activeTask.title} />
              )}
            </>
          )}

          {/* Phase 2 HUD */}
          {phase === 'appliances' && (
            <>
              <ApplianceDiscoveryHUD
                found={interactedAppliances.size}
                total={INTERACTABLE_IDS.length}
                points={interactedAppliances.size * 20}
                stars={Math.min(5, Math.floor(interactedAppliances.size / 3))}
              />
              <div className="task-objective-banner appliance-objective">
                <div className="task-objective-icon">🔍</div>
                <div className="task-objective-info">
                  <div className="task-objective-title">Discover All Appliances ({interactedAppliances.size}/{INTERACTABLE_IDS.length})</div>
                  <div className="task-objective-text">Walk near each appliance and press E to learn about it</div>
                </div>
              </div>
              <ApplianceSideTracker interactedAppliances={interactedAppliances} />
              <ApplianceInfoToast applianceId={!showApplianceInfo ? nearbyApplianceId : null} />
            </>
          )}
        </>
      )}

      {/* Micro Feedback Toast — always visible when triggered */}
      <MicroFeedbackToast feedback={microFeedback} visible={showMicroFeedback} />

      {/* Cinematic Overlay */}
      <CinematicOverlay visible={showCinematic} textPhase={cinematicText} />

      {/* Phase 1 Overlays */}
      <TeacherMessage visible={showTeacherIntro} title="Welcome to Energy-Smart Living!" message="Before we use any appliances, let's learn to THINK first! Every time you want to use an appliance, check the environment and try natural options. Walk to the glowing markers and press E." onClose={() => setShowTeacherIntro(false)} />

      {/* System Prompt — Decision Interrupt */}
      <SystemPrompt visible={showSystemPrompt} message={systemPromptMsg} onDismiss={handleSystemPromptDismiss} />

      {/* Task result popup */}
      <TaskPopup visible={showTaskPopup} popup={currentPopup} onClose={handleTaskPopupClose} langCode={selectedLanguage} />

      {/* AC Temperature Dial */}
      <ACTemperatureDial visible={showACDial} onSelect={handleACTempSelect} />

      {/* Day/Night Cycle UI */}
      <DayNightCycleUI
        visible={showDayNightCycle}
        phase={dayNightPhase}
        cycle={dayNightCycle}
        totalCycles={2}
        actions={activeTaskData}
        onAction={handleDayNightAction}
      />

      {/* Temperature Strategy UI */}
      <TemperatureStrategyUI
        visible={showTempStrategy}
        cases={activeTaskData?.cases}
        currentCase={tempStrategyCase}
        onAction={handleTempStrategyAction}
        result={tempStrategyResult}
      />

      {/* Combined Challenge UI */}
      <CombinedChallengeUI
        visible={showCombinedChallenge}
        decisions={activeTaskData?.decisions || []}
        answers={combinedAnswers}
        onAnswer={handleCombinedAnswer}
        onSubmit={handleCombinedSubmit}
        submitted={combinedSubmitted}
        result={combinedResult}
      />

      {/* Habit Reinforcement UI */}
      <HabitReinforcementUI
        visible={showHabitUI}
        situation={activeTaskData?.situations?.[habitSitIdx]}
        onAction={handleHabitAction}
        result={habitResult}
      />

      {/* Performance Summary */}
      <PerformanceSummary visible={showPerformance} data={performanceData} onContinue={handlePerformanceContinue} />

      {/* Before/After Cutscene */}
      <BeforeAfterCutscene visible={showCutscene} onComplete={handleCutsceneComplete} />
      <TeacherMessage visible={showTeacherEnd} title="Smart Thinking Complete!" message="You've learned to think before using energy! Good design and smart decisions reduce electricity use. Now let's discover what appliances you have and learn to use them wisely." onClose={handleTeacherEndClose} />

      {/* Phase Transition */}
      <PhaseTransition visible={showPhaseTransition} onStart={handlePhaseStart} />

      {/* Phase 2 Overlays */}
      {showApplianceInfo && <ApplianceInfoPopup applianceId={activeApplianceId} onClose={handleApplianceInfoClose} langCode={selectedLanguage} interactedCount={interactedAppliances.size} totalCount={INTERACTABLE_IDS.length} />}
      {showWindowInfo && <WindowInfoPopup windowId={activeWindowId} onClose={() => { setShowWindowInfo(false); setActiveWindowId(null); }} />}

      {/* Phase 1 Quiz — Building Design */}
      {showPhase1Quiz && <BuildingQuizModal questions={LEVEL1_QUIZ_QUESTIONS} title="Building Design Quiz" onComplete={handlePhase1QuizComplete} />}

      {/* Phase 2 Quiz — Appliance Discovery */}
      {showPhase2Quiz && <BuildingQuizModal questions={QUIZ_QUESTIONS} title="Appliance Discovery Quiz" onComplete={handlePhase2QuizComplete} />}

      {/* Level Complete */}
      {showLevelComplete && (
        <LevelCompleteScreen score={phase1Score + phase2Score} total={phase1Total + phase2Total} stars={finalStars} appliancesFound={interactedAppliances.size}
          onContinue={() => { completeLevel(1); unlockLevel(2); addCarbonCoins(finalStars * 20 + (phase1Score + phase2Score) * 5); navigate('/hub'); }}
        />
      )}

      <L1ControlsHelp />
    </div>
  );
}
