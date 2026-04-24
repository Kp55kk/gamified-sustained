import React, { useState, useCallback, Suspense, useEffect, useRef } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import House from './House';
import Player, { cameraMode, playerState } from './Player';
import Appliances from './Appliances';
import { LEVEL1_TASK_POSITIONS, LEVEL1_QUIZ_QUESTIONS, QUIZ_QUESTIONS, APPLIANCE_DATA, INTERACTABLE_IDS } from './applianceData';
import { useGame } from '../context/GameContext';
import { getTranslation, getVoiceLocale } from '../translations/index';
import LevelIntro from './LevelIntro';
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
  } catch (e) {}
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
  } catch (e) {}
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
  } catch (e) {}
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
  } catch (e) {}
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
  } catch (e) {}
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

// ─── Task Definitions (Phase 1) ───
const TASKS = [
  { id: 1, title: 'Add Windows — Let the Light In', icon: '🪟', objective: 'Walk to the living room wall and press E to install a window', markerId: 'task_window_living',
    popup: { title: '☀️ Daylight Enters!', message: 'Sunlight is now lighting the room — artificial lighting is not required during daytime!', learning: 'Windows reduce electricity usage during daytime' }},
  { id: 2, title: 'Cross Ventilation — Fresh Air Flow', icon: '🌬️', objective: 'Place a window on the opposite wall for cross ventilation', markerId: 'task_ventilation',
    popup: { title: '🌬️ Fresh Air Flow!', message: 'Air now flows naturally through opposite openings. The room feels cooler without any fan!', learning: 'Cross ventilation improves comfort naturally' }},
  { id: 3, title: 'Open Curtains — Use Daylight', icon: '🌞', objective: 'Walk to the bedroom window and press E to open the curtains', markerId: 'task_curtains',
    popup: { title: '☀️ Sunlight Fills the Room!', message: 'The curtains are open — natural light replaces artificial lighting. Lights turn OFF automatically!', learning: 'Curtains affect energy usage — use natural light whenever possible' }},
  { id: 4, title: 'Day vs Night — Smart Behavior', icon: '🌗', objective: 'Walk to the living room center and press E to learn day vs night actions', markerId: 'task_daynight',
    popup: { title: '🌞🌙 Day vs Night', message: 'During DAY: Open windows, open curtains, turn OFF lights.\nDuring NIGHT: Turn ON only required lights, close curtains, use fan if needed.', learning: 'Day and night need different energy actions' }},
  { id: 5, title: 'Temperature Action — Ventilate First', icon: '🌡️', objective: 'Walk to the bedroom and press E to check temperature', markerId: 'task_temperature',
    popup: { title: '🌡️ Natural Cooling Works!', message: 'Outside: 30°C | Inside: 28°C — Opening the window provides natural cooling. No need for AC!', learning: 'Use ventilation before appliances' }},
];

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

// ═══ CURTAIN MESH ═══
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

// ═══ WALL COVER ═══
function WallCover({ position, size, visible }) {
  const ref = useRef();
  useFrame(() => { if (!ref.current) return; const t = visible ? 1 : 0; ref.current.material.opacity += (t - ref.current.material.opacity) * 0.05; ref.current.visible = ref.current.material.opacity > 0.01; });
  return (<mesh ref={ref} position={position}><boxGeometry args={size} /><meshStandardMaterial color="#f5f0e8" roughness={0.85} transparent opacity={1} /></mesh>);
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

// ═══ 3D SCENE CONTENT ═══
function SceneContent({
  cameraRef, onInteract, onRoomChange, onNearestChange,
  currentTask, completedTasks, windowsInstalled, curtainsOpen, timeOfDay,
  showAirflow, lightsOn, hideLabels, phase, activeApplianceId, interactedAppliances,
  onApplianceClick, onWindowClick
}) {
  const taskIdList = React.useMemo(() => {
    if (phase !== 'building' || currentTask > 5) return [];
    const activeTask = TASKS.find(t => t.id === currentTask);
    return activeTask ? [activeTask.markerId] : [];
  }, [currentTask, phase]);

  // In appliance phase, use the full interactable IDs list
  const applianceIdList = phase === 'appliances' ? INTERACTABLE_IDS : taskIdList;

  return (
    <>
      <DynamicLighting windowsInstalled={windowsInstalled} curtainsOpen={curtainsOpen} timeOfDay={timeOfDay} />
      <ArtificialLights lightsOn={lightsOn} />
      <CameraRefForwarder cameraRef={cameraRef} />
      <House />
      <WallCover position={[-5, 1.8, -7.95]} size={[1.5, 1.4, 0.2]} visible={!completedTasks.has(1)} />
      <WallCover position={[-9.95, 1.8, -4]} size={[0.2, 1.4, 1.5]} visible={!completedTasks.has(2)} />
      <SunlightBeam position={[-5, 1, -6]} visible={completedTasks.has(1) && timeOfDay === 'day'} />
      <SunlightBeam position={[-8, 1, -4]} visible={completedTasks.has(2) && timeOfDay === 'day'} />
      <SunlightBeam position={[5, 1, -6]} visible={curtainsOpen && timeOfDay === 'day'} />
      <CurtainMesh isOpen={curtainsOpen} />
      <AirflowParticles visible={showAirflow} />

      {/* Phase 1: Task markers */}
      {phase === 'building' && TASKS.map(task => {
        const pos = LEVEL1_TASK_POSITIONS[task.markerId];
        if (!pos) return null;
        return <TaskMarker3D key={task.id} position={pos.pos} label={task.objective} isActive={currentTask === task.id} isCompleted={completedTasks.has(task.id)} taskNumber={task.id} hideLabel={hideLabels} />;
      })}

      {/* Phase 2: Appliances */}
      {phase === 'appliances' && (
        <Appliances
          onApplianceClick={onApplianceClick}
          onWindowClick={onWindowClick}
          activeApplianceId={activeApplianceId}
          interactedAppliances={interactedAppliances}
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

// ═══ APPLIANCE INFO POPUP (Phase 2) — with Voiceover — Compact UI ═══
function ApplianceInfoPopup({ applianceId, onClose, langCode }) {
  // Voiceover: speak appliance description when popup opens
  useEffect(() => {
    if (applianceId) {
      const data = APPLIANCE_DATA[applianceId];
      if (data && data.description) {
        speak(
          `${data.name}. ${data.description}`,
          langCode || 'en',
          data.voiceRate || 0.9,
          data.voicePitch || 1.05
        );
      }
    }
    return () => stopSpeech();
  }, [applianceId, langCode]);

  if (!applianceId) return null;
  const data = APPLIANCE_DATA[applianceId];
  if (!data) return null;

  const annualKwh = typeof data.annualKwh === 'string' ? parseInt(data.annualKwh) : (data.annualKwh || 0);
  const co2 = typeof data.co2PerYear === 'string' ? data.co2PerYear : (data.co2PerYear || '—');
  const monthlyKwh = typeof data.monthlyKwh === 'string' ? data.monthlyKwh : (data.monthlyKwh || '—');

  const handleClose = () => { stopSpeech(); onClose(); };

  return (
    <div className="ai-popup-overlay" onClick={handleClose}>
      <div className="ai-popup-card" onClick={e => e.stopPropagation()}>
        <button className="ai-popup-close" onClick={handleClose}>✕</button>

        {/* Header: Icon + Name + Category inline */}
        <div className="ai-popup-header">
          <div className="ai-popup-icon">{data.icon}</div>
          <div className="ai-popup-header-info">
            <h2 className="ai-popup-name">{data.name}</h2>
            <div className="ai-popup-category">{data.category}</div>
          </div>
        </div>

        {/* Power stats in a compact row */}
        <div className="ai-popup-power-row">
          <div className="ai-popup-power-main">
            <span className="ai-popup-wattage">{data.wattage}W</span>
          </div>
          <div className="ai-popup-power-details">
            <span>{data.usePerDay || '—'}</span>
            <span className="ai-popup-power-dot">•</span>
            <span>{data.daysPerYear ? `${data.daysPerYear} days/yr` : '365 days/yr'}</span>
          </div>
        </div>

        {/* Energy Impact — compact 3-column */}
        <div className="ai-popup-impact-grid">
          <div className="ai-popup-impact-item">
            <div className="ai-popup-impact-value">{monthlyKwh}</div>
            <div className="ai-popup-impact-label">kWh/mo</div>
          </div>
          <div className="ai-popup-impact-item">
            <div className="ai-popup-impact-value">{annualKwh}</div>
            <div className="ai-popup-impact-label">kWh/yr</div>
          </div>
          <div className="ai-popup-impact-item">
            <div className="ai-popup-impact-value">{co2}</div>
            <div className="ai-popup-impact-label">kg CO₂/yr</div>
          </div>
        </div>

        {/* About — compact */}
        <div className="ai-popup-about">
          <div className="ai-popup-about-border" />
          <p className="ai-popup-about-text">{data.description}</p>
        </div>

        {/* Badges row */}
        <div className="ai-popup-badges">
          {data.hiddenConsumer && (
            <div className="ai-popup-hidden-badge">
              <span>👁️</span> Hidden Consumer — {data.standbyPower}
            </div>
          )}
          {data.beeRated && data.beeRated !== 'No' && (
            <div className="ai-popup-bee-badge">
              ⭐ BEE: {data.beeRated}
            </div>
          )}
        </div>

        {/* Fun Fact */}
        {data.funFact && (
          <div className="ai-popup-funfact">
            <span className="ai-popup-funfact-icon">💡</span>
            <span className="ai-popup-funfact-text">{data.funFact}</span>
          </div>
        )}

        <button className="ai-popup-btn" onClick={handleClose}>Got it! →</button>
      </div>
    </div>
  );
}

// ═══ APPLIANCE TRACKER TABLE (Phase 2 HUD) ═══
function ApplianceTracker({ interactedAppliances, showTracker, onToggle }) {
  return (
    <>
      <button className="tracker-toggle-btn" onClick={onToggle}>
        📋 {interactedAppliances.size}/{INTERACTABLE_IDS.length}
      </button>
      {showTracker && (
        <div className="tracker-panel">
          <div className="tracker-title">Appliance Checklist</div>
          <div className="tracker-grid">
            {INTERACTABLE_IDS.map(id => {
              const data = APPLIANCE_DATA[id];
              const found = interactedAppliances.has(id);
              return (
                <div key={id} className={`tracker-item ${found ? 'found' : ''}`}>
                  <span className="tracker-icon">{data?.icon || '❓'}</span>
                  <span className="tracker-name">{data?.name || id}</span>
                  <span className="tracker-status">{found ? '✅' : '❌'}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
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

// ═══ PHASE TRANSITION (Building → Appliances) ═══
function PhaseTransition({ visible, onStart }) {
  if (!visible) return null;
  return (
    <div className="phase-transition-overlay">
      <div className="phase-transition-card">
        <div className="phase-transition-icon">🔍</div>
        <h2 className="phase-transition-title">Phase 2: Discover Your Appliances</h2>
        <p className="phase-transition-text">
          Your house is now well-designed! Next, walk around and discover all the appliances in your home.
          Press E near each appliance to learn its wattage, usage, and saving tips.
        </p>
        <button className="phase-transition-btn" onClick={onStart}>Start Exploring →</button>
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

// ═══════════════════════════════════════════════════
//  MAIN LEVEL 1 COMPONENT
// ═══════════════════════════════════════════════════
export default function Level1() {
  const navigate = useNavigate();
  const { selectedLanguage, completeLevel, unlockLevel, addCarbonCoins } = useGame();
  const cameraRef = useRef(null);

  // ─── PHASE: 'intro' → 'building' → 'transition' → 'appliances' → 'quiz' → 'complete' ───
  const [showLevelIntro, setShowLevelIntro] = useState(true);
  const [showTeacherIntro, setShowTeacherIntro] = useState(false);
  const [phase, setPhase] = useState('building'); // 'building' | 'appliances'

  // Phase 1: Building Tasks state
  const [currentTask, setCurrentTask] = useState(1);
  const [completedTasks, setCompletedTasks] = useState(new Set());
  const [showTaskPopup, setShowTaskPopup] = useState(false);
  const [currentPopup, setCurrentPopup] = useState(null);
  const [showECBC, setShowECBC] = useState(false);
  const [showCutscene, setShowCutscene] = useState(false);
  const [showTeacherEnd, setShowTeacherEnd] = useState(false);

  // Phase 2: Appliance Discovery state
  const [showPhaseTransition, setShowPhaseTransition] = useState(false);
  const [activeApplianceId, setActiveApplianceId] = useState(null);
  const [interactedAppliances, setInteractedAppliances] = useState(new Set());
  const [showApplianceInfo, setShowApplianceInfo] = useState(false);
  const [nearbyApplianceId, setNearbyApplianceId] = useState(null);

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
  const [showApplianceTracker, setShowApplianceTracker] = useState(false);

  // House state
  const [windowsInstalled, setWindowsInstalled] = useState(0);
  const [curtainsOpen, setCurtainsOpen] = useState(false);
  const [timeOfDay, setTimeOfDay] = useState('day');
  const [showAirflow, setShowAirflow] = useState(false);
  const [lightsOn, setLightsOn] = useState(true);
  const [energyLevel, setEnergyLevel] = useState(100);
  const [currentRoom, setCurrentRoom] = useState('Living Room');

  // Teacher intro after level intro
  useEffect(() => {
    if (!showLevelIntro && !showTeacherIntro && currentTask === 1 && completedTasks.size === 0) setShowTeacherIntro(true);
  }, [showLevelIntro]);

  // Update energy from completed tasks
  useEffect(() => {
    let e = 100;
    if (completedTasks.has(1)) e -= 20;
    if (completedTasks.has(2)) e -= 20;
    if (completedTasks.has(3)) e -= 15;
    if (completedTasks.has(4)) e -= 15;
    if (completedTasks.has(5)) e -= 15;
    setEnergyLevel(Math.max(15, e));
  }, [completedTasks]);

  // Update lights
  useEffect(() => {
    if (timeOfDay === 'day' && (windowsInstalled > 0 || curtainsOpen)) setLightsOn(false);
    else if (timeOfDay === 'night') setLightsOn(true);
  }, [windowsInstalled, curtainsOpen, timeOfDay]);

  // ─── PHASE 1: BUILDING TASK INTERACTION ───
  const handleBuildingInteract = useCallback((interactedId) => {
    if (showTaskPopup || showECBC || showCutscene || showTeacherIntro || showTeacherEnd) return;
    const activeTask = TASKS.find(t => t.id === currentTask);
    if (!activeTask || interactedId !== activeTask.markerId) return;

    playInteractSound(); playTaskCompleteSound();

    switch (currentTask) {
      case 1: setWindowsInstalled(w => w + 1); break;
      case 2: setWindowsInstalled(w => w + 1); setShowAirflow(true); break;
      case 3: setCurtainsOpen(true); break;
      case 4: setTimeOfDay('night'); setTimeout(() => setTimeOfDay('day'), 2000); break;
      case 5: break;
    }

    setCompletedTasks(prev => { const next = new Set(prev); next.add(currentTask); return next; });
    setCurrentPopup(activeTask.popup);
    setShowTaskPopup(true);
  }, [currentTask, showTaskPopup, showECBC, showCutscene, showTeacherIntro, showTeacherEnd]);

  // ─── PHASE 2: APPLIANCE INTERACTION ───
  const handleApplianceInteract = useCallback((applianceId) => {
    if (showApplianceInfo || showPhase2Quiz || showLevelComplete) return;
    // Handle window interactions
    if (applianceId.startsWith('__window__')) return;

    playInteractSound();
    setActiveApplianceId(applianceId);
    setShowApplianceInfo(true);

    setInteractedAppliances(prev => {
      const next = new Set(prev);
      next.add(applianceId);
      return next;
    });
  }, [showApplianceInfo, showPhase2Quiz, showLevelComplete]);

  // Main interaction dispatcher
  const handleInteract = useCallback((id) => {
    if (phase === 'building') handleBuildingInteract(id);
    else if (phase === 'appliances') handleApplianceInteract(id);
  }, [phase, handleBuildingInteract, handleApplianceInteract]);

  // ─── FLOW HANDLERS ───
  const handleTaskPopupClose = useCallback(() => {
    setShowTaskPopup(false); setCurrentPopup(null);
    if (currentTask < 5) setCurrentTask(t => t + 1);
    else setShowECBC(true); // All building tasks done
  }, [currentTask]);

  const handleECBCClose = useCallback(() => { setShowECBC(false); setShowCutscene(true); }, []);
  const handleCutsceneComplete = useCallback(() => { setShowCutscene(false); setShowTeacherEnd(true); }, []);

  // After building tasks → show Phase 1 quiz
  const handleTeacherEndClose = useCallback(() => {
    setShowTeacherEnd(false);
    setShowPhase1Quiz(true); // Phase 1 Quiz
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

    // Check if ALL appliances discovered (must be exactly all)
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
  const handleNearestChange = useCallback(() => {}, []);
  const handleApplianceClick = useCallback((id) => handleApplianceInteract(id), [handleApplianceInteract]);

  // Determine if any overlay is active (for hiding 3D labels)
  const anyOverlayActive = showTeacherIntro || showTeacherEnd || showTaskPopup || showPhase1Quiz || showPhase2Quiz || showLevelComplete || showCutscene || showECBC || showPhaseTransition || showApplianceInfo;

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
        onComplete={() => setShowLevelIntro(false)}
      />
    );
  }

  const activeTask = TASKS.find(t => t.id === currentTask);

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
            />
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
            <div className="hud-instructions">{phase === 'building' ? '🏠 Building Design' : '🔍 Appliance Discovery'}</div>
          </div>

          {/* Phase 1 HUD */}
          {phase === 'building' && (
            <>
              <BuildingTaskHUD currentTask={currentTask} completedTasks={completedTasks} />
              {activeTask && currentTask <= 5 && <TaskObjective task={activeTask} />}
              <EnergyMeter energyLevel={energyLevel} />
              <TemperatureDisplay visible={currentTask >= 5} indoor={28} outdoor={30} />
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
              <ApplianceTracker
                interactedAppliances={interactedAppliances}
                showTracker={showApplianceTracker}
                onToggle={() => setShowApplianceTracker(s => !s)}
              />
              <ApplianceInfoToast applianceId={!showApplianceInfo ? nearbyApplianceId : null} />
            </>
          )}
        </>
      )}

      {/* Phase 1 Overlays */}
      <TeacherMessage visible={showTeacherIntro} title="Welcome to Building Design!" message="Before we use any appliances, let's improve this house using natural methods. A good house reduces energy needs! Walk to the glowing markers and press E to complete each task." onClose={() => setShowTeacherIntro(false)} />
      <TaskPopup visible={showTaskPopup} popup={currentPopup} onClose={handleTaskPopupClose} langCode={selectedLanguage} />
      <ECBCPopup visible={showECBC} onClose={handleECBCClose} />
      <BeforeAfterCutscene visible={showCutscene} onComplete={handleCutsceneComplete} />
      <TeacherMessage visible={showTeacherEnd} title="House Design Complete!" message="Now your house is bright, well-ventilated, and comfortable — all without extra electricity! Next, let's discover what appliances you have and learn to use them wisely." onClose={handleTeacherEndClose} />

      {/* Phase Transition */}
      <PhaseTransition visible={showPhaseTransition} onStart={handlePhaseStart} />

      {/* Phase 2 Overlays */}
      {showApplianceInfo && <ApplianceInfoPopup applianceId={activeApplianceId} onClose={handleApplianceInfoClose} langCode={selectedLanguage} />}

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
