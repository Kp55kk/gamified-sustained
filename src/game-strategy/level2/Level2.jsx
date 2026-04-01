import React, { useState, useCallback, useRef, useEffect, useMemo, Suspense } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import House from '../House';
import Player, { cameraMode, playerState } from '../Player';
import Level2Appliances, { getProximityLevels } from './Level2Appliances';
import {
  LEVEL2_APPLIANCES, L2_APPLIANCE_IDS, L2_APPLIANCE_MAP,
  getEnergyTier, MAX_POSSIBLE_WATTS, ENERGY_TIPS,
  QUIZ_QUESTIONS, LEVEL2_BADGE, TASKS, LEARNING_INSERTS,
  MICRO_QUESTIONS, getSmartMessage, calculateStars,
  getBarColor, getBarTierLabel, CO2_FACTOR,
  calculateBill, calculateCO2, calculateAnnualEnergy,
  USAGE_HOURS, BILL_SLABS, SHOCK_FACTS,
  SMART_INSIGHTS, GENERIC_INSIGHTS, COMPARISON_PAIRS,
} from './level2Data';
import { APPLIANCE_POSITIONS } from '../applianceData';
import QuizModal from './QuizModal';
import { useGame } from '../../context/GameContext';
import { getTranslation } from '../../translations/index';
import './Level2.css';

// ─── Audio System ───
let audioCtx = null;
function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}
function playToggleOnSound() {
  try {
    const ctx = getAudioCtx();
    const click = ctx.createOscillator(); const clickGain = ctx.createGain();
    click.connect(clickGain); clickGain.connect(ctx.destination);
    click.frequency.setValueAtTime(800, ctx.currentTime);
    clickGain.gain.setValueAtTime(0.15, ctx.currentTime);
    clickGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    click.start(ctx.currentTime); click.stop(ctx.currentTime + 0.1);
    const hum = ctx.createOscillator(); const humGain = ctx.createGain();
    hum.connect(humGain); humGain.connect(ctx.destination); hum.type = 'sine';
    hum.frequency.setValueAtTime(200, ctx.currentTime + 0.05);
    hum.frequency.linearRampToValueAtTime(400, ctx.currentTime + 0.3);
    humGain.gain.setValueAtTime(0.08, ctx.currentTime + 0.05);
    humGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    hum.start(ctx.currentTime + 0.05); hum.stop(ctx.currentTime + 0.5);
  } catch (e) {}
}
function playToggleOffSound() {
  try {
    const ctx = getAudioCtx(); const osc = ctx.createOscillator(); const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination); osc.type = 'sine';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(150, ctx.currentTime + 0.25);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.35);
  } catch (e) {}
}
function playCorrectSound() {
  try {
    const ctx = getAudioCtx();
    [523, 659, 784].forEach((freq, i) => {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination); osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);
      gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.3);
      osc.start(ctx.currentTime + i * 0.1); osc.stop(ctx.currentTime + i * 0.1 + 0.3);
    });
  } catch (e) {}
}
function playWrongSound() {
  try {
    const ctx = getAudioCtx(); const osc = ctx.createOscillator(); const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination); osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.4);
  } catch (e) {}
}
function playMilestoneSound() {
  try {
    const ctx = getAudioCtx();
    [523, 659, 784, 1047].forEach((freq, i) => {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination); osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12);
      gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.4);
      osc.start(ctx.currentTime + i * 0.12); osc.stop(ctx.currentTime + i * 0.12 + 0.4);
    });
  } catch (e) {}
}

// ─── JS Emoji Icons ───
const ICONS = {
  zap: '\u{26A1}', bulb: '\u{1F4A1}', leaf: '\u{1F33F}', fire: '\u{1F525}',
  check: '\u{2705}', trophy: '\u{1F3C6}', party: '\u{1F389}', star: '\u{2B50}',
  house: '\u{1F3E0}', pin: '\u{1F4CD}', plug: '\u{1F50C}', grad: '\u{1F393}',
  brain: '\u{1F9E0}', mouse: '\u{1F5B1}\u{FE0F}', warn: '\u{26A0}\u{FE0F}',
  cross: '\u{274C}', think: '\u{1F914}', happy: '\u{1F60A}', oops: '\u{1F605}',
  target: '\u{1F3AF}', memo: '\u{1F4DD}', globe: '\u{1F30D}', coin: '\u{1FA99}',
  chart: '\u{1F4CA}', money: '\u{1F4B0}', tree: '\u{1F333}', shock: '\u{1F633}',
};
const ROOM_ICONS = {
  'Living Room': '\u{1F6CB}\u{FE0F}', 'Bedroom': '\u{1F6CF}\u{FE0F}',
  'Kitchen': '\u{1F373}', 'Bathroom': '\u{1F6BF}',
};

// ─── Warm Evening Lighting ───
function WarmLighting() {
  const lightRef = useRef(); const ambientRef = useRef(); const hemiRef = useRef();
  useEffect(() => {
    let frame;
    const cycle = () => {
      const t = (Date.now() % 600000) / 600000;
      const brightness = 0.45 + Math.sin(t * Math.PI * 2) * 0.08;
      const warmth = 1.0 + Math.sin(t * Math.PI * 2) * 0.15;
      if (ambientRef.current) ambientRef.current.intensity = brightness;
      if (lightRef.current) {
        lightRef.current.intensity = warmth;
        const angle = t * Math.PI * 2;
        lightRef.current.position.set(8 * Math.cos(angle), 8 + 2 * Math.sin(angle), 10 * Math.sin(angle));
      }
      if (hemiRef.current) hemiRef.current.intensity = brightness * 0.7;
      frame = requestAnimationFrame(cycle);
    };
    cycle();
    return () => cancelAnimationFrame(frame);
  }, []);
  return (
    <>
      <ambientLight ref={ambientRef} intensity={0.45} color="#ffe8cc" />
      <directionalLight ref={lightRef} position={[8, 10, 10]} intensity={1.0} color="#ffd699" />
      <hemisphereLight ref={hemiRef} args={['#ffecd2', '#b97a20', 0.35]} />
      <pointLight position={[-8, 4, -5]} intensity={0.3} color="#ffeedd" distance={20} />
    </>
  );
}

function CameraRefForwarder({ cameraRef }) {
  const { camera } = useThree();
  useEffect(() => { cameraRef.current = camera; }, [camera, cameraRef]);
  return null;
}

function SceneContent({ applianceStates, nearestAppliance, taskTargetIds, onRoomChange, onNearestChange, onInteract, cameraRef, proximityLevels }) {
  return (
    <>
      <WarmLighting />
      <CameraRefForwarder cameraRef={cameraRef} />
      <House />
      <Level2Appliances applianceStates={applianceStates} nearestAppliance={nearestAppliance} taskTargetIds={taskTargetIds} proximityLevels={proximityLevels} />
      <Player onRoomChange={onRoomChange} onNearestApplianceChange={onNearestChange} onInteract={onInteract} applianceIdList={L2_APPLIANCE_IDS} />
    </>
  );
}

function AnimatedWattCounter({ targetValue }) {
  const [displayValue, setDisplayValue] = useState(0);
  const animRef = useRef(null);
  useEffect(() => {
    let current = displayValue;
    const step = () => {
      const diff = targetValue - current;
      if (Math.abs(diff) < 1) { setDisplayValue(targetValue); return; }
      current += diff * 0.12;
      setDisplayValue(Math.round(current));
      animRef.current = requestAnimationFrame(step);
    };
    animRef.current = requestAnimationFrame(step);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [targetValue]);
  return <span className="l2-watt-number">{displayValue.toLocaleString()}W</span>;
}

function FloatingText({ text, type, id, onDone }) {
  useEffect(() => { const timer = setTimeout(() => onDone(id), 2000); return () => clearTimeout(timer); }, [id, onDone]);
  return <div className={`l2-floating-text ${type}`}>{text}</div>;
}

// ─── SVG Energy Gauge (Fix 4: bright white needle, vivid arcs, tick marks) ───
function EnergyGauge({ watts, maxWatts = 4000 }) {
  const [animW, setAnimW] = useState(0);
  const aRef = useRef(null);
  useEffect(() => {
    let c = animW;
    const s = () => { const d = watts - c; if (Math.abs(d) < 1) { setAnimW(watts); return; } c += d * 0.08; setAnimW(Math.round(c)); aRef.current = requestAnimationFrame(s); };
    aRef.current = requestAnimationFrame(s);
    return () => { if (aRef.current) cancelAnimationFrame(aRef.current); };
  }, [watts]);
  const pct = Math.min(animW / maxWatts, 1), ang = -90 + pct * 180, cx = 110, cy = 100, r = 80;
  const arc = (s, e) => { const sa = (-90 + s * 180) * Math.PI / 180, ea = (-90 + e * 180) * Math.PI / 180; return `M ${cx + r * Math.cos(sa)} ${cy + r * Math.sin(sa)} A ${r} ${r} 0 ${e - s > 0.5 ? 1 : 0} 1 ${cx + r * Math.cos(ea)} ${cy + r * Math.sin(ea)}`; };
  const nr = ang * Math.PI / 180, nx = cx + 68 * Math.cos(nr), ny = cy + 68 * Math.sin(nr);
  // Tick marks at 0W, 1000W, 2000W, 3000W, 4000W
  const ticks = [
    { pct: 0, label: '0W' }, { pct: 0.25, label: '1000W' },
    { pct: 0.5, label: '2000W' }, { pct: 0.75, label: '3000W' }, { pct: 1, label: '4000W' },
  ];
  return (
    <div className="l2-gauge-container">
      <svg viewBox="0 0 220 120" className="l2-gauge-svg">
        <path d={arc(0, 1)} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="18" strokeLinecap="round" />
        <path d={arc(0, 0.125)} fill="none" stroke="#16e868" strokeWidth="16" strokeLinecap="round" />
        <path d={arc(0.125, 0.375)} fill="none" stroke="#fde047" strokeWidth="16" />
        <path d={arc(0.375, 0.625)} fill="none" stroke="#fb923c" strokeWidth="16" />
        <path d={arc(0.625, 1)} fill="none" stroke="#f43f5e" strokeWidth="16" strokeLinecap="round" />
        {/* Tick marks with labels */}
        {ticks.map((t, i) => {
          const ta = (-90 + t.pct * 180) * Math.PI / 180;
          const innerR = r - 12, outerR = r + 4, labelR = r + 14;
          return (
            <g key={i}>
              <line x1={cx + innerR * Math.cos(ta)} y1={cy + innerR * Math.sin(ta)}
                    x2={cx + outerR * Math.cos(ta)} y2={cy + outerR * Math.sin(ta)}
                    stroke="#fff" strokeWidth="1.5" opacity="0.7" />
              <text x={cx + labelR * Math.cos(ta)} y={cy + labelR * Math.sin(ta) + 3}
                    fill="#e2e8f0" fontSize="7" textAnchor="middle" fontWeight="600">{t.label}</text>
            </g>
          );
        })}
        {/* Needle — bright white, thick, with strong glow */}
        <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round"
          style={{ filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.9)) drop-shadow(0 0 16px rgba(255,255,255,0.4))', transition: 'all 0.3s' }} />
        {/* Center hub */}
        <circle cx={cx} cy={cy} r="7" fill="#1e293b" stroke="#ffffff" strokeWidth="2.5"
          style={{ filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.6))' }} />
        <circle cx={cx} cy={cy} r="3.5" fill="#ffffff" />
        {/* Needle tip dot */}
        <circle cx={nx} cy={ny} r="4" fill="#ffffff"
          style={{ filter: 'drop-shadow(0 0 10px white) drop-shadow(0 0 20px rgba(255,255,255,0.5))' }} />
      </svg>
    </div>
  );
}

function ControlsHelp({ t }) {
  const l2t = t?.level2 || {};
  const [show, setShow] = useState(false);
  const [auto, setAuto] = useState(false);
  useEffect(() => { if (!auto) { setShow(true); setAuto(true); const t = setTimeout(() => setShow(false), 3000); return () => clearTimeout(t); } }, []);
  useEffect(() => { if (!show) return; const h = (e) => { if (e.key === 'Escape') setShow(false); }; window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h); }, [show]);
  return (
    <>
      <button className="l2-help-btn" onClick={() => setShow(true)}>?</button>
      {show && (
        <div className="l2-controls-overlay" onClick={() => setShow(false)}>
          <div className="l2-controls-card" onClick={e => e.stopPropagation()}>
            <div className="l2-controls-title">{ICONS.grad} {l2t.controls || 'Controls'}</div>
            <div className="l2-controls-list">
              <div className="l2-ctrl-row"><span className="l2-ctrl-keys"><span className="l2-key">W</span> / <span className="l2-key">{'\u2191'}</span></span><span>{l2t.moveForward || 'Move Forward'}</span></div>
              <div className="l2-ctrl-row"><span className="l2-ctrl-keys"><span className="l2-key">S</span> / <span className="l2-key">{'\u2193'}</span></span><span>{l2t.moveBackward || 'Move Backward'}</span></div>
              <div className="l2-ctrl-row"><span className="l2-ctrl-keys"><span className="l2-key">A</span> / <span className="l2-key">{'\u2190'}</span></span><span>{l2t.turnLeft || 'Turn Left'}</span></div>
              <div className="l2-ctrl-row"><span className="l2-ctrl-keys"><span className="l2-key">D</span> / <span className="l2-key">{'\u2192'}</span></span><span>{l2t.turnRight || 'Turn Right'}</span></div>
              <div className="l2-ctrl-row"><span className="l2-ctrl-keys"><span className="l2-key">E</span></span><span>{l2t.interactAppliance || 'Interact with Appliance'}</span></div>
              <div className="l2-ctrl-row"><span className="l2-ctrl-keys"><span className="l2-key">ESC</span></span><span>{l2t.exitMenu || 'Exit to Menu'}</span></div>
            </div>
            <button className="l2-controls-got-it" onClick={() => setShow(false)}>{l2t.gotIt || 'Got it!'}</button>
          </div>
        </div>
      )}
    </>
  );
}

function ScreenGlow({ totalWatts }) {
  if (totalWatts > 2000) return <div className="l2-screen-glow l2-glow-red" />;
  if (totalWatts > 0 && totalWatts < 500) return <div className="l2-screen-glow l2-glow-green" />;
  return null;
}

const EYE_STYLES = {
  fridge: { w: 18, h: 22, p: 7 }, wifi_router: { w: 8, h: 8, p: 4 },
  ac_1_5ton: { w: 16, h: 10, p: 6 }, tv_smart: { w: 18, h: 12, p: 5, rect: true },
  table_fan: { w: 10, h: 14, p: 5, dizzy: true }, ceiling_fan: { w: 14, h: 14, p: 5 },
};
function ApplianceFace({ id, isOn, dist, popupOpen, px, pz }) {
  const [blink, setBlink] = useState(false);
  const pos = APPLIANCE_POSITIONS[id]?.pos;
  useEffect(() => { const iv = setInterval(() => { setBlink(true); setTimeout(() => setBlink(false), 150); }, 3000 + Math.random() * 1000); return () => clearInterval(iv); }, []);
  if (!pos || dist > 4) return null;
  const op = dist > 3.5 ? (4 - dist) * 2 : 1;
  const e = EYE_STYLES[id] || { w: 14, h: 16, p: 5 };
  const dx = (px || 0) - pos[0], dz = (pz || 0) - pos[2], len = Math.sqrt(dx * dx + dz * dz) || 1;
  const ppx = (dx / len) * e.w * 0.2, ppy = (dz / len) * e.h * 0.15;
  const ex = popupOpen && isOn, eyeH = blink ? 2 : (ex ? e.h * 1.3 : e.h);
  return (
    <div className="l2-face-container" style={{ opacity: op, transition: 'opacity 0.3s' }}>
      <div className="l2-face-eyes">
        {[0, 1].map(i => (
          <div key={i} className="l2-face-eye" style={{ width: e.w, height: eyeH, borderRadius: e.rect ? '3px' : '50%', transition: 'height 0.1s' }}>
            {!e.dizzy ? <div className="l2-face-pupil" style={{ width: e.p, height: blink ? 1 : e.p, borderRadius: '50%', transform: `translate(${ppx}px, ${ppy}px)` }} /> : <span style={{fontSize:6}}>@</span>}
          </div>
        ))}
      </div>
      <div className={`l2-face-mouth ${ex ? 'excited' : ''}`}>{ex ? 'O' : '\u2323'}</div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
//  MAIN LEVEL 2 COMPONENT
// ════════════════════════════════════════════════════════════

export default function Level2() {
  const navigate = useNavigate();
  const { addCarbonCoins, completeLevel, unlockLevel, selectedLanguage } = useGame();
  const langCode = selectedLanguage || 'en';
  const t = getTranslation(langCode);
  const l2t = t?.level2 || {};
  const cameraRef = useRef(null);

  const [phase, setPhase] = useState('intro');
  const [introStep, setIntroStep] = useState(0);
  const [applianceStates, setApplianceStates] = useState(() => {
    const initial = {};
    L2_APPLIANCE_IDS.forEach(id => { initial[id] = false; });
    return initial;
  });
  const [totalWatts, setTotalWatts] = useState(0);
  const [onCount, setOnCount] = useState(0);
  const [sessionEnergy, setSessionEnergy] = useState(0);
  const [toggledSet, setToggledSet] = useState(new Set());
  const [infoPopup, setInfoPopup] = useState(null);
  const [currentTaskIdx, setCurrentTaskIdx] = useState(0);
  const [taskFeedback, setTaskFeedback] = useState(null);
  const [taskComparison, setTaskComparison] = useState(null);
  const [correctTasks, setCorrectTasks] = useState(0);
  const [efficientChoices, setEfficientChoices] = useState(0);
  const [taskHint, setTaskHint] = useState(null);
  const [learningInsert, setLearningInsert] = useState(null);
  const [microQuestion, setMicroQuestion] = useState(null);
  const [microAnswer, setMicroAnswer] = useState(null);
  const [quizResult, setQuizResult] = useState(null);
  const [stars, setStars] = useState(0);
  const [currentRoom, setCurrentRoom] = useState('Living Room');
  const [nearestAppliance, setNearestAppliance] = useState(null);
  const [floatingTexts, setFloatingTexts] = useState([]);
  const [proximityLevels, setProximityLevels] = useState({});
  const floatingIdRef = useRef(0);

  // ─── NEW: 7 Systems State ───
  const [showGraph, setShowGraph] = useState(false);
  const [showBill, setShowBill] = useState(false);
  const [showCO2Panel, setShowCO2Panel] = useState(false);
  const [energyHistory, setEnergyHistory] = useState([{ watts: 0, time: Date.now() }]);
  const [insightIdx, setInsightIdx] = useState(0);
  const [interactionCount, setInteractionCount] = useState(0);

  // ─── Compute totals ───
  useEffect(() => {
    let watts = 0, count = 0;
    L2_APPLIANCE_IDS.forEach(id => {
      if (applianceStates[id]) { watts += L2_APPLIANCE_MAP[id].wattage; count++; }
    });
    setTotalWatts(watts);
    setOnCount(count);
  }, [applianceStates]);

  // ─── Active insights (context-aware) ───
  const activeInsights = useMemo(() => {
    const contextual = SMART_INSIGHTS.filter(ins => ins.condition(applianceStates));
    return contextual.length > 0 ? contextual : GENERIC_INSIGHTS;
  }, [applianceStates]);

  // ─── Rotate insights ───
  useEffect(() => {
    if (phase !== 'explore' && phase !== 'tasks') return;
    const t = setInterval(() => setInsightIdx(i => (i + 1) % activeInsights.length), 5000);
    return () => clearInterval(t);
  }, [phase, activeInsights.length]);

  // ─── Active comparisons for graph ───
  const activeComparisons = useMemo(() => {
    return COMPARISON_PAIRS.filter(c => applianceStates[c.a] && applianceStates[c.b]).map(c => {
      const wA = L2_APPLIANCE_MAP[c.a].wattage;
      const wB = L2_APPLIANCE_MAP[c.b].wattage;
      const ratio = Math.round(wA / wB);
      return { ...c, message: c.message.replace('{x}', ratio), wA, wB };
    });
  }, [applianceStates]);

  // ─── ON appliances list for graph ───
  const onAppliances = useMemo(() => {
    return LEVEL2_APPLIANCES.filter(a => applianceStates[a.id]).sort((a, b) => b.wattage - a.wattage);
  }, [applianceStates]);

  // ─── Bill calculation ───
  const billData = useMemo(() => {
    let monthlyKwh = 0;
    L2_APPLIANCE_IDS.forEach(id => {
      if (applianceStates[id]) {
        const w = L2_APPLIANCE_MAP[id].wattage;
        const h = USAGE_HOURS[id] || 4;
        monthlyKwh += (w * h * 30) / 1000;
      }
    });
    return calculateBill(monthlyKwh);
  }, [applianceStates]);

  // ─── CO2 calculation ───
  const co2Data = useMemo(() => {
    const totalKwh = billData.totalUnits;
    return { kwhMonth: totalKwh, co2Month: calculateCO2(totalKwh), co2Year: calculateCO2(totalKwh * 12) };
  }, [billData]);

  // ─── Intro animation ───
  useEffect(() => {
    if (phase === 'intro') {
      const t1 = setTimeout(() => setIntroStep(1), 500);
      const t2 = setTimeout(() => setIntroStep(2), 1500);
      const t3 = setTimeout(() => setIntroStep(3), 2500);
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }
  }, [phase]);

  const canStartTasks = toggledSet.size >= 4;
  const currentTask = TASKS[currentTaskIdx] || null;
  const taskTargetIds = (phase === 'tasks' && currentTask) ? currentTask.correctIds : null;

  const addFloating = useCallback((text, type) => {
    const id = floatingIdRef.current++;
    setFloatingTexts(prev => [...prev, { id, text, type }]);
  }, []);
  const removeFloatingText = useCallback((id) => {
    setFloatingTexts(prev => prev.filter(t => t.id !== id));
  }, []);

  // ─── Record history point ───
  const recordHistory = useCallback((watts) => {
    setEnergyHistory(prev => [...prev.slice(-49), { watts, time: Date.now() }]);
  }, []);

  // ─── EXPLORE MODE: Toggle handler ───
  const handleExploreInteract = useCallback((applianceId) => {
    if (!L2_APPLIANCE_IDS.includes(applianceId)) return;
    setApplianceStates(prev => {
      const newState = !prev[applianceId];
      const appliance = L2_APPLIANCE_MAP[applianceId];
      if (newState) {
        playToggleOnSound();
        addFloating(`+${appliance.wattage}W added!`, 'add');
        setSessionEnergy(s => s + appliance.wattage);
        const smartMsg = getSmartMessage(appliance.wattage);
        const co2hint = `${ICONS.globe} CO\u{2082}: ${calculateCO2((appliance.wattage * (USAGE_HOURS[applianceId] || 4) * 30) / 1000)} kg/month`;
        setInfoPopup({ name: appliance.name, icon: appliance.icon, wattage: appliance.wattage, message: smartMsg, co2hint });
        setTimeout(() => setInfoPopup(null), 4000);
      } else {
        playToggleOffSound();
        addFloating(`${appliance.wattage}W saved!`, 'save');
      }
      const newStates = { ...prev, [applianceId]: newState };
      let w = 0;
      L2_APPLIANCE_IDS.forEach(id => { if (newStates[id]) w += L2_APPLIANCE_MAP[id].wattage; });
      recordHistory(w);
      return newStates;
    });
    setToggledSet(prev => { const next = new Set(prev); next.add(applianceId); return next; });
    setInteractionCount(c => c + 1);
  }, [addFloating, recordHistory]);

  // ─── TASK MODE: Toggle handler ───
  const handleTaskInteract = useCallback((applianceId) => {
    if (!L2_APPLIANCE_IDS.includes(applianceId)) return;
    if (!currentTask || taskFeedback) return;
    const appliance = L2_APPLIANCE_MAP[applianceId];
    const isCorrect = currentTask.correctIds.includes(applianceId);
    const isBest = applianceId === currentTask.bestId;
    if (isCorrect) {
      playCorrectSound(); playToggleOnSound();
      setApplianceStates(prev => ({ ...prev, [applianceId]: true }));
      setSessionEnergy(s => s + appliance.wattage);
      setCorrectTasks(c => c + 1);
      if (isBest) setEfficientChoices(e => e + 1);
      if (currentTask.comparison && !isBest) {
        setTaskComparison(currentTask.comparison);
        setTaskFeedback({ type: 'correct-compare', text: `${ICONS.check} Correct! But there's a better option...` });
      } else if (currentTask.comparison && isBest) {
        setTaskFeedback({ type: 'correct-best', text: `${ICONS.check} Perfect! Most efficient choice!` });
        addFloating('Best Choice!', 'best');
      } else {
        setTaskFeedback({ type: 'correct', text: `${ICONS.check} Correct Choice!` });
        addFloating(`${ICONS.check} Correct!`, 'correct');
      }
    } else {
      playWrongSound();
      setTaskHint(currentTask.wrongHint);
      setTaskFeedback({ type: 'wrong', text: `${ICONS.oops} Oops! That won't solve the problem.` });
      addFloating('Try again!', 'wrong');
      setTimeout(() => { setTaskFeedback(null); setTaskHint(null); }, 2500);
    }
  }, [currentTask, taskFeedback, addFloating]);

  const advanceTask = useCallback(() => {
    setTaskFeedback(null); setTaskComparison(null); setTaskHint(null);
    const nextIdx = currentTaskIdx + 1;
    const insert = LEARNING_INSERTS.find(l => l.afterTask === nextIdx);
    if (insert) { setLearningInsert(insert); return; }
    const micro = MICRO_QUESTIONS.find(m => m.afterTask === nextIdx);
    if (micro && !microAnswer) { setMicroQuestion(micro); return; }
    if (nextIdx >= TASKS.length) { playMilestoneSound(); setPhase('quiz'); return; }
    setCurrentTaskIdx(nextIdx);
  }, [currentTaskIdx, microAnswer]);

  const closeLearning = useCallback(() => {
    setLearningInsert(null);
    const nextIdx = currentTaskIdx + 1;
    const micro = MICRO_QUESTIONS.find(m => m.afterTask === nextIdx);
    if (micro && !microAnswer) { setMicroQuestion(micro); return; }
    if (nextIdx >= TASKS.length) { playMilestoneSound(); setPhase('quiz'); return; }
    setCurrentTaskIdx(nextIdx);
  }, [currentTaskIdx, microAnswer]);

  const handleMicroAnswer = useCallback((idx) => {
    const isCorrect = idx === microQuestion.correctIndex;
    if (isCorrect) playCorrectSound(); else playWrongSound();
    setMicroAnswer({ selectedIdx: idx, isCorrect });
  }, [microQuestion]);

  const closeMicro = useCallback(() => {
    setMicroQuestion(null); setMicroAnswer(null);
    const nextIdx = currentTaskIdx + 1;
    if (nextIdx >= TASKS.length) { playMilestoneSound(); setPhase('quiz'); return; }
    setCurrentTaskIdx(nextIdx);
  }, [currentTaskIdx]);

  const handleInteract = useCallback((applianceId) => {
    if (phase === 'explore') handleExploreInteract(applianceId);
    else if (phase === 'tasks') handleTaskInteract(applianceId);
  }, [phase, handleExploreInteract, handleTaskInteract]);

  const handleQuizComplete = useCallback((result) => {
    const s = calculateStars(correctTasks, TASKS.length, efficientChoices, result.score, result.total);
    setStars(s); setQuizResult(result); setPhase('reward');
  }, [correctTasks, efficientChoices]);

  const handleContinue = useCallback(() => {
    const coinsEarned = LEVEL2_BADGE.coins + (stars * 10) + (correctTasks * 5) + (efficientChoices * 10);
    addCarbonCoins(coinsEarned); completeLevel(2); unlockLevel(3); navigate('/hub');
  }, [stars, correctTasks, efficientChoices, addCarbonCoins, completeLevel, unlockLevel, navigate]);

  const handleRoomChange = useCallback((room) => setCurrentRoom(room), []);
  const handleNearestChange = useCallback((id) => {
    setNearestAppliance(id);
    setProximityLevels(getProximityLevels(playerState.x, playerState.z));
  }, []);

  // ═══════════════════════════════════════════════════════
  //  RENDER — INTRO
  // ═══════════════════════════════════════════════════════
  if (phase === 'intro') {
    return (
      <div className="l2-container">
        <div className="l2-intro-overlay">
          <div className="l2-intro-particles">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="l2-intro-particle" style={{ '--x': `${Math.random() * 100}%`, '--delay': `${Math.random() * 3}s`, '--duration': `${2 + Math.random() * 3}s` }} />
            ))}
          </div>
          <div className={`l2-intro-badge ${introStep >= 1 ? 'visible' : ''}`}>
            <div className="l2-intro-badge-icon">{ICONS.zap}</div>
            <div className="l2-intro-badge-glow" />
          </div>
          <h1 className={`l2-intro-title ${introStep >= 2 ? 'visible' : ''}`}>New Tool Unlocked</h1>
          <div className={`l2-intro-subtitle ${introStep >= 2 ? 'visible' : ''}`}>
            <span className="l2-intro-tool-name">{ICONS.zap} ENERGY METER {ICONS.zap}</span>
          </div>
          <div className={`l2-intro-dialogue ${introStep >= 3 ? 'visible' : ''}`}>
            <div className="l2-intro-avatar">{'\u{1F9D1}\u{200D}\u{1F393}'}</div>
            <p className="l2-intro-quote">
              "Let's see how much electricity these appliances use!
              Toggle them ON and OFF to see the energy impact in real-time."
            </p>
          </div>
          <button className={`l2-intro-start-btn ${introStep >= 3 ? 'visible' : ''}`} onClick={() => setPhase('explore')}>
            Begin Level 2 {'\u{2192}'}
          </button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════
  //  RENDER — QUIZ
  // ═══════════════════════════════════════════════════════
  if (phase === 'quiz') {
    return <div className="l2-container"><QuizModal onComplete={handleQuizComplete} /></div>;
  }

  // ═══════════════════════════════════════════════════════
  //  RENDER — REWARD (with CO₂ impact)
  // ═══════════════════════════════════════════════════════
  if (phase === 'reward' && quizResult) {
    const coinsEarned = LEVEL2_BADGE.coins + (stars * 10) + (correctTasks * 5) + (efficientChoices * 10);
    const randomFact = SHOCK_FACTS[Math.floor(Math.random() * SHOCK_FACTS.length)];
    return (
      <div className="l2-container">
        <div className="l2-reward-overlay">
          <div className="l2-reward-card">
            <div className="l2-reward-badge">{LEVEL2_BADGE.icon}</div>
            <div className="l2-reward-title">{LEVEL2_BADGE.title}</div>
            <div className="l2-reward-subtitle">{LEVEL2_BADGE.description}</div>
            <div className="l2-reward-stars">
              {[1, 2, 3].map(s => (
                <span key={s} className={`l2-reward-star ${s <= stars ? 'earned' : 'empty'}`} style={{ animationDelay: `${s * 0.3}s` }}>{ICONS.star}</span>
              ))}
            </div>
            <div className="l2-reward-stats">
              <div className="l2-reward-stat"><span className="l2-reward-stat-label">Tasks Correct</span><span className="l2-reward-stat-value">{correctTasks}/{TASKS.length}</span></div>
              <div className="l2-reward-stat"><span className="l2-reward-stat-label">Efficient Choices</span><span className="l2-reward-stat-value">{efficientChoices}</span></div>
              <div className="l2-reward-stat"><span className="l2-reward-stat-label">Quiz Score</span><span className="l2-reward-stat-value">{quizResult.score}/{quizResult.total}</span></div>
            </div>
            {/* CO₂ Impact Section */}
            <div className="l2-reward-co2">
              <div className="l2-reward-co2-title">{ICONS.globe} Environmental Impact</div>
              <div className="l2-reward-co2-grid">
                <div className="l2-co2-stat"><span className="l2-co2-val">{co2Data.kwhMonth}</span><span className="l2-co2-lbl">kWh/month</span></div>
                <div className="l2-co2-stat"><span className="l2-co2-val">{co2Data.co2Month} kg</span><span className="l2-co2-lbl">CO{'\u{2082}'}/month</span></div>
                <div className="l2-co2-stat"><span className="l2-co2-val">{co2Data.co2Year} kg</span><span className="l2-co2-lbl">CO{'\u{2082}'}/year</span></div>
              </div>
              <div className="l2-co2-shock">{ICONS.shock} {randomFact.fact}</div>
            </div>
            <div className="l2-reward-coins">
              <span className="l2-reward-coins-icon">{ICONS.coin}</span>
              <span className="l2-reward-coins-text">+{coinsEarned} Carbon Coins</span>
            </div>
            <button className="l2-continue-btn" onClick={handleContinue}>Return to Hub {'\u{2192}'}</button>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════
  //  RENDER — EXPLORE + TASKS (3D SCENE + HUD + ALL 7 SYSTEMS)
  // ═══════════════════════════════════════════════════════
  const tier = getEnergyTier(totalWatts);
  const meterPct = Math.min((totalWatts / MAX_POSSIBLE_WATTS) * 100, 100);
  const currentInsight = activeInsights[insightIdx % activeInsights.length];

  return (
    <div className="l2-container">
      {/* 3D Canvas */}
      <div className="l2-canvas-wrapper">
        <Canvas camera={{ position: [-5, 6, 1], fov: 50 }} gl={{ antialias: false }}
          onCreated={({ gl }) => { gl.setClearColor('#f5deb3'); gl.toneMapping = 1; gl.toneMappingExposure = 1.1; gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); }}>
          <Suspense fallback={null}>
            <SceneContent applianceStates={applianceStates} nearestAppliance={nearestAppliance} taskTargetIds={taskTargetIds}
              onRoomChange={handleRoomChange} onNearestChange={handleNearestChange} onInteract={handleInteract} cameraRef={cameraRef} proximityLevels={proximityLevels} />
          </Suspense>
        </Canvas>
        <div className="l2-vignette" />
        <ScreenGlow totalWatts={totalWatts} />
      </div>

      {/* HUD TOP BAR */}
      <div className="l2-hud-top">
        <button className="l2-back-btn" onClick={() => navigate('/hub')}>{l2t.back || '\u{2190} Back'}</button>
        <div className="l2-hud-title">{ICONS.zap} {l2t.energyMeter || 'Energy Meter'}</div>
        <div className="l2-hud-room">{ROOM_ICONS[currentRoom] || ICONS.pin} {t?.rooms?.[currentRoom]?.name?.replace('📍 ', '') || currentRoom}</div>
      </div>

      {/* TASK BAR */}
      {phase === 'tasks' && currentTask && !taskFeedback && !learningInsert && !microQuestion && (
        <div className="l2-task-bar">
          <div className="l2-task-progress-label">{ICONS.target} Task {currentTaskIdx + 1} of {TASKS.length}</div>
          <div className="l2-task-scenario"><span className="l2-task-icon">{currentTask.icon}</span><span className="l2-task-text">{currentTask.scenario}</span></div>
          <div className="l2-task-hint-text">{ICONS.bulb} {currentTask.hint}</div>
        </div>
      )}

      {/* EXPLORE → TASKS + Graph/Bill/CO2 buttons */}
      {phase === 'explore' && (
        <div className="l2-action-buttons">
          {interactionCount >= 2 && <button className="l2-action-btn graph-btn" onClick={() => setShowGraph(true)}>{ICONS.chart} {l2t.energyGraph || 'Energy Graph'}</button>}
          {interactionCount >= 2 && <button className="l2-action-btn bill-btn" onClick={() => setShowBill(true)}>{ICONS.money} {l2t.billCalc || 'Bill Calc'}</button>}
          {interactionCount >= 2 && <button className="l2-action-btn co2-btn" onClick={() => setShowCO2Panel(true)}>{ICONS.globe} {l2t.co2Impact || 'CO₂ Impact'}</button>}
          {canStartTasks && <button className="l2-start-tasks-btn" onClick={() => {
            const reset = {}; L2_APPLIANCE_IDS.forEach(id => { reset[id] = false; });
            setApplianceStates(reset); setTotalWatts(0); setOnCount(0); setPhase('tasks');
          }}>{ICONS.target} {l2t.startTasks || 'Start Tasks'} {'\u{2192}'}</button>}
        </div>
      )}

      {/* ENERGY GAUGE PANEL */}
      <div className="l2-energy-panel">
        <div className="l2-energy-header">
          <span className="l2-energy-icon">{ICONS.zap}</span><span className="l2-energy-label">{l2t.energyMeter || 'Energy Meter'}</span>
        </div>
        <EnergyGauge watts={totalWatts} maxWatts={4000} />
        <div className="l2-gauge-digital">
          <AnimatedWattCounter targetValue={totalWatts} />
        </div>
        <div className="l2-gauge-info">
          <span className="l2-gauge-count">{onCount}/{L2_APPLIANCE_IDS.length} {l2t.on || 'ON'}</span>
          <span className="l2-gauge-co2">{ICONS.globe} {l2t.co2Label || 'CO₂'}: {co2Data.co2Month} {l2t.kgMo || 'kg/mo'}</span>
        </div>
      </div>

      {/* SESSION TRACKER */}
      <div className="l2-session-tracker">{ICONS.zap} {l2t.session || 'Session'}: <strong>{sessionEnergy.toLocaleString()}W</strong></div>

      {/* INTELLIGENT INSIGHT TICKER */}
      {currentInsight && (phase === 'explore' || phase === 'tasks') && (
        <div className="l2-insight-ticker" key={insightIdx}>
          <span className="l2-insight-icon">{currentInsight.icon}</span>
          <span className="l2-insight-text">{currentInsight.text}</span>
        </div>
      )}

      {/* PROGRESS PANEL */}
      {phase === 'explore' && (
        <div className="l2-progress-panel">
          <div className="l2-progress-header">{ICONS.check} {l2t.discovery || 'Discovery'}</div>
          <div className="l2-progress-bar-outer"><div className="l2-progress-bar-inner" style={{ width: `${(toggledSet.size / L2_APPLIANCE_IDS.length) * 100}%` }} /></div>
          <div className="l2-progress-text">{toggledSet.size}/{L2_APPLIANCE_IDS.length} {l2t.tested || 'tested'}{canStartTasks && <span className="l2-progress-complete"> {ICONS.party} {l2t.ready || 'Ready!'}</span>}</div>
        </div>
      )}
      {phase === 'tasks' && (
        <div className="l2-progress-panel">
          <div className="l2-progress-header">{ICONS.target} Task Progress</div>
          <div className="l2-progress-bar-outer"><div className="l2-progress-bar-inner" style={{ width: `${(currentTaskIdx / TASKS.length) * 100}%` }} /></div>
          <div className="l2-progress-text">{correctTasks}/{currentTaskIdx} correct {efficientChoices > 0 && `| ${ICONS.star} ${efficientChoices} efficient`}</div>
        </div>
      )}

      {/* INFO POPUP (with CO₂) */}
      {infoPopup && (
        <div className={`l2-info-popup ${infoPopup.message.type}`}>
          <div className="l2-info-popup-header">
            <span className="l2-info-popup-icon">{infoPopup.icon}</span>
            <span className="l2-info-popup-name">{infoPopup.name}</span>
            <span className="l2-info-popup-watt">{infoPopup.wattage}W</span>
          </div>
          <div className="l2-info-popup-message"><span className="l2-info-msg-icon">{infoPopup.message.icon}</span><span>{infoPopup.message.text}</span></div>
          {infoPopup.co2hint && <div className="l2-info-popup-co2">{infoPopup.co2hint}</div>}
        </div>
      )}

      {/* TASK FEEDBACK */}
      {taskFeedback && (
        <div className={`l2-task-feedback ${taskFeedback.type}`}>
          <div className="l2-task-feedback-text">{taskFeedback.text}</div>
          {taskFeedback.type === 'wrong' && taskHint && <div className="l2-task-hint">{ICONS.bulb} Hint: {taskHint}</div>}
          {taskComparison && (
            <div className="l2-comparison-card">
              <div className="l2-comparison-title">{ICONS.zap} Energy Comparison</div>
              <div className="l2-comparison-bars">
                <div className="l2-comparison-row efficient">
                  <span className="l2-comp-label">{taskComparison.efficient.label}</span>
                  <div className="l2-comp-bar-outer"><div className="l2-comp-bar-fill" style={{ width: `${(taskComparison.efficient.watts / taskComparison.alternative.watts) * 100}%`, background: '#22c55e' }} /></div>
                  <span className="l2-comp-watts">{taskComparison.efficient.watts}W</span>
                </div>
                <div className="l2-comparison-row alternative">
                  <span className="l2-comp-label">{taskComparison.alternative.label}</span>
                  <div className="l2-comp-bar-outer"><div className="l2-comp-bar-fill" style={{ width: '100%', background: '#ef4444' }} /></div>
                  <span className="l2-comp-watts">{taskComparison.alternative.watts}W</span>
                </div>
              </div>
              <div className="l2-comparison-message">{ICONS.bulb} {taskComparison.message}</div>
              <div className="l2-comparison-lesson">{taskComparison.lesson}</div>
            </div>
          )}
          {taskFeedback.type !== 'wrong' && (
            <button className="l2-task-next-btn" onClick={advanceTask}>{currentTaskIdx + 1 >= TASKS.length ? 'Finish Tasks' : 'Next Task'} {'\u{2192}'}</button>
          )}
        </div>
      )}

      {/* LEARNING INSERT */}
      {learningInsert && (
        <div className="l2-learning-overlay">
          <div className="l2-learning-card">
            <div className="l2-learning-icon">{learningInsert.icon}</div>
            <h3 className="l2-learning-title">{learningInsert.title}</h3>
            <p className="l2-learning-content">{learningInsert.content}</p>
            <div className="l2-learning-formula">{learningInsert.formula}</div>
            {learningInsert.simpleLogic && <div className="l2-learning-simple">{ICONS.brain} {learningInsert.simpleLogic}</div>}
            <div className="l2-learning-example">{ICONS.bulb} Example: {learningInsert.example}</div>
            <button className="l2-learning-btn" onClick={closeLearning}>Got it! {'\u{2192}'}</button>
          </div>
        </div>
      )}

      {/* MICRO INTERACTION */}
      {microQuestion && (
        <div className="l2-learning-overlay">
          <div className="l2-micro-card">
            <div className="l2-micro-icon">{ICONS.think}</div>
            <h3 className="l2-micro-title">Quick Question!</h3>
            <p className="l2-micro-question">{microQuestion.question}</p>
            <div className="l2-micro-options">
              {microQuestion.options.map((opt, i) => (
                <button key={i} className={`l2-micro-option ${microAnswer ? (i === microQuestion.correctIndex ? 'correct' : (i === microAnswer.selectedIdx ? 'wrong' : '')) : ''}`}
                  onClick={() => !microAnswer && handleMicroAnswer(i)} disabled={!!microAnswer}>{opt}</button>
              ))}
            </div>
            {microAnswer && (
              <div className={`l2-micro-feedback ${microAnswer.isCorrect ? 'correct' : 'wrong'}`}>
                {microAnswer.isCorrect ? `${ICONS.check} Correct!` : `${ICONS.cross} Not quite!`}
                <p>{microQuestion.explanation}</p>
              </div>
            )}
            {microAnswer && <button className="l2-learning-btn" onClick={closeMicro}>Continue {'\u{2192}'}</button>}
          </div>
        </div>
      )}

      {/* ═══ GRAPH OVERLAY ═══ */}
      {showGraph && (
        <div className="l2-learning-overlay" onClick={() => setShowGraph(false)}>
          <div className="l2-graph-panel" onClick={e => e.stopPropagation()}>
            <div className="l2-graph-header">
              <span>{ICONS.chart} Appliance vs Watts</span>
              <button className="l2-graph-close" onClick={() => setShowGraph(false)}>{ICONS.cross}</button>
            </div>
            {onAppliances.length === 0 ? (
              <div className="l2-graph-empty">{ICONS.bulb} Turn ON some appliances to see the chart!</div>
            ) : (
              <div className="l2-graph-bars">
                {onAppliances.map((a, i) => {
                  const maxW = Math.max(...onAppliances.map(x => x.wattage), 1);
                  return (
                    <div key={a.id} className="l2-graph-row" style={{ animationDelay: `${i * 0.08}s` }}>
                      <div className="l2-graph-label">{a.icon} {a.name}</div>
                      <div className="l2-graph-bar-outer">
                        <div className="l2-graph-bar-fill" style={{ width: `${(a.wattage / maxW) * 100}%`, backgroundColor: getBarColor(a.wattage), animationDelay: `${i * 0.08}s` }} />
                      </div>
                      <div className="l2-graph-watts" style={{ color: getBarColor(a.wattage) }}>{a.wattage}W</div>
                      <div className="l2-graph-tier-badge" style={{ color: getBarColor(a.wattage) }}>{getBarTierLabel(a.wattage)}</div>
                    </div>
                  );
                })}
              </div>
            )}
            {/* Smart Comparisons */}
            {activeComparisons.length > 0 && (
              <div className="l2-graph-comparisons">
                <div className="l2-graph-comp-title">{ICONS.zap} Comparison Mode</div>
                {activeComparisons.slice(0, 2).map((c, i) => (
                  <div key={i} className="l2-graph-comp-item">{ICONS.bulb} {c.message}</div>
                ))}
              </div>
            )}
            {/* Auto insights */}
            {onAppliances.length >= 2 && (
              <div className="l2-graph-insight">
                {ICONS.brain} {onAppliances[0].name} consumes much more energy than {onAppliances[onAppliances.length - 1].name}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ BILL OVERLAY ═══ */}
      {showBill && (
        <div className="l2-learning-overlay" onClick={() => setShowBill(false)}>
          <div className="l2-bill-panel" onClick={e => e.stopPropagation()}>
            <div className="l2-bill-header">
              <span>{ICONS.money} Monthly Electricity Bill</span>
              <button className="l2-graph-close" onClick={() => setShowBill(false)}>{ICONS.cross}</button>
            </div>
            <div className="l2-bill-total">
              <div className="l2-bill-units">{billData.totalUnits} kWh</div>
              <div className="l2-bill-cost">{'\u{20B9}'}{billData.totalCost}</div>
              <div className="l2-bill-period">Estimated Monthly Bill</div>
            </div>
            <div className="l2-bill-breakdown">
              <div className="l2-bill-breakdown-title">Slab Breakdown</div>
              {billData.breakdown.map((slab, i) => (
                <div key={i} className="l2-bill-slab-row">
                  <span className="l2-bill-slab-label">{slab.label}</span>
                  <span className="l2-bill-slab-units">{slab.units} units</span>
                  <span className="l2-bill-slab-rate">{'\u{20B9}'}{slab.rate}/unit</span>
                  <span className="l2-bill-slab-cost">{'\u{20B9}'}{slab.cost}</span>
                </div>
              ))}
            </div>
            {/* Smart Savings */}
            <div className="l2-bill-savings">
              <div className="l2-bill-savings-title">{ICONS.bulb} Smart Savings</div>
              <div className="l2-bill-saving-item">{ICONS.leaf} Using fan instead of AC saves {'\u{20B9}'}{Math.round(((1500 - 70) * 8 * 30 / 1000) * 5)}/month</div>
              <div className="l2-bill-saving-item">{ICONS.leaf} LED bulb vs old 60W saves {'\u{20B9}'}{Math.round(((60 - 9) * 10 * 30 / 1000) * 5)}/month</div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ CO₂ IMPACT OVERLAY ═══ */}
      {showCO2Panel && (
        <div className="l2-learning-overlay" onClick={() => setShowCO2Panel(false)}>
          <div className="l2-co2-panel" onClick={e => e.stopPropagation()}>
            <div className="l2-co2-header">
              <span>{ICONS.globe} CO{'\u{2082}'} Impact Dashboard</span>
              <button className="l2-graph-close" onClick={() => setShowCO2Panel(false)}>{ICONS.cross}</button>
            </div>
            <div className="l2-co2-formula-box">
              <div className="l2-co2-formula">CO{'\u{2082}'} = kWh {'\u{00D7}'} 0.710 kg</div>
              <div className="l2-co2-formula-note">India emission factor (CEA FY 2024-25)</div>
            </div>
            <div className="l2-co2-results">
              <div className="l2-co2-result-card">
                <div className="l2-co2-result-val">{co2Data.kwhMonth}</div>
                <div className="l2-co2-result-lbl">kWh/month</div>
              </div>
              <div className="l2-co2-result-card accent">
                <div className="l2-co2-result-val">{co2Data.co2Month} kg</div>
                <div className="l2-co2-result-lbl">CO{'\u{2082}'}/month</div>
              </div>
              <div className="l2-co2-result-card warn">
                <div className="l2-co2-result-val">{co2Data.co2Year} kg</div>
                <div className="l2-co2-result-lbl">CO{'\u{2082}'}/year</div>
              </div>
            </div>
            <div className="l2-co2-explanation">
              <div><strong>Watts</strong> = Speed of energy flow</div>
              <div><strong>kWh</strong> = Total energy consumed</div>
              <div><strong>CO{'\u{2082}'}</strong> = Environmental impact</div>
            </div>
            <div className="l2-co2-facts-title">{ICONS.shock} Real Shock Facts</div>
            {SHOCK_FACTS.map((f, i) => (
              <div key={i} className="l2-co2-fact-item">{f.fact}</div>
            ))}
          </div>
        </div>
      )}

      {/* FLOATING TEXTS */}
      <div className="l2-floating-container">
        {floatingTexts.map(ft => <FloatingText key={ft.id} id={ft.id} text={ft.text} type={ft.type} onDone={removeFloatingText} />)}
      </div>

      {/* HELP BUTTON + APPLIANCE FACES */}
      <ControlsHelp t={t} />
      {(() => {
        const sorted = L2_APPLIANCE_IDS.map(id => {
          const ap = APPLIANCE_POSITIONS[id];
          if (!ap) return { id, dist: Infinity };
          const dx = playerState.x - ap.pos[0], dz = playerState.z - ap.pos[2];
          return { id, dist: Math.sqrt(dx * dx + dz * dz) };
        }).sort((a, b) => a.dist - b.dist).slice(0, 3).filter(a => a.dist <= 4);
        return sorted.map(({ id, dist }) => (
          <div key={`face-${id}`} className="l2-face-wrapper" style={{ position: 'absolute', left: '50%', top: '35%', transform: 'translate(-50%, -50%)', pointerEvents: 'none', zIndex: 20 }}>
            <ApplianceFace id={id} isOn={!!applianceStates[id]} dist={dist} popupOpen={!!infoPopup && infoPopup.name === L2_APPLIANCE_MAP[id]?.name} px={playerState.x} pz={playerState.z} />
          </div>
        ));
      })()}
    </div>
  );
}
