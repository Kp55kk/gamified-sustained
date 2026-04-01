import React, { useState, useCallback, useRef, useEffect, Suspense } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import House from '../House';
import Player, { cameraMode, playerState } from '../Player';
import Level2Appliances from './Level2Appliances';
import {
  LEVEL2_APPLIANCES, L2_APPLIANCE_IDS, L2_APPLIANCE_MAP,
  getEnergyTier, MAX_POSSIBLE_WATTS, ENERGY_TIPS,
  QUIZ_QUESTIONS, LEVEL2_BADGE, TASKS, LEARNING_INSERTS,
  MICRO_QUESTIONS, getSmartMessage, calculateStars,
} from './level2Data';
import { APPLIANCE_POSITIONS } from '../applianceData';
import QuizModal from './QuizModal';
import { useGame } from '../../context/GameContext';
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
    const click = ctx.createOscillator();
    const clickGain = ctx.createGain();
    click.connect(clickGain); clickGain.connect(ctx.destination);
    click.frequency.setValueAtTime(800, ctx.currentTime);
    clickGain.gain.setValueAtTime(0.15, ctx.currentTime);
    clickGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    click.start(ctx.currentTime); click.stop(ctx.currentTime + 0.1);
    const hum = ctx.createOscillator();
    const humGain = ctx.createGain();
    hum.connect(humGain); humGain.connect(ctx.destination);
    hum.type = 'sine';
    hum.frequency.setValueAtTime(200, ctx.currentTime + 0.05);
    hum.frequency.linearRampToValueAtTime(400, ctx.currentTime + 0.3);
    humGain.gain.setValueAtTime(0.08, ctx.currentTime + 0.05);
    humGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    hum.start(ctx.currentTime + 0.05); hum.stop(ctx.currentTime + 0.5);
  } catch (e) {}
}

function playToggleOffSound() {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = 'sine';
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
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);
      gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.3);
      osc.start(ctx.currentTime + i * 0.1); osc.stop(ctx.currentTime + i * 0.1 + 0.3);
    });
  } catch (e) {}
}

function playWrongSound() {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = 'sawtooth';
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
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'triangle';
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
};

// ─── Room icons ───
const ROOM_ICONS = {
  'Living Room': '\u{1F6CB}\u{FE0F}',
  'Bedroom': '\u{1F6CF}\u{FE0F}',
  'Kitchen': '\u{1F373}',
  'Bathroom': '\u{1F6BF}',
};

// ─── Warm Evening Lighting ───
function WarmLighting() {
  const lightRef = useRef();
  const ambientRef = useRef();
  const hemiRef = useRef();

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

// ─── 3D Scene ───
function SceneContent({ applianceStates, nearestAppliance, taskTargetIds, onRoomChange, onNearestChange, onInteract, cameraRef }) {
  return (
    <>
      <WarmLighting />
      <CameraRefForwarder cameraRef={cameraRef} />
      <House />
      <Level2Appliances
        applianceStates={applianceStates}
        nearestAppliance={nearestAppliance}
        taskTargetIds={taskTargetIds}
      />
      <Player
        onRoomChange={onRoomChange}
        onNearestApplianceChange={onNearestChange}
        onInteract={onInteract}
        applianceIdList={L2_APPLIANCE_IDS}
      />
    </>
  );
}

// ─── Animated Watt Counter ───
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

// ─── Floating Text ───
function FloatingText({ text, type, id, onDone }) {
  useEffect(() => {
    const timer = setTimeout(() => onDone(id), 2000);
    return () => clearTimeout(timer);
  }, [id, onDone]);
  return <div className={`l2-floating-text ${type}`}>{text}</div>;
}

// ════════════════════════════════════════════════════════════
//  MAIN LEVEL 2 COMPONENT
// ════════════════════════════════════════════════════════════

export default function Level2() {
  const navigate = useNavigate();
  const { addCarbonCoins, completeLevel, unlockLevel } = useGame();
  const cameraRef = useRef(null);

  // ─── Phase: intro → explore → tasks → learning → micro → quiz → reward ───
  const [phase, setPhase] = useState('intro');
  const [introStep, setIntroStep] = useState(0);

  // ─── Appliance states + energy ───
  const [applianceStates, setApplianceStates] = useState(() => {
    const initial = {};
    L2_APPLIANCE_IDS.forEach(id => { initial[id] = false; });
    return initial;
  });
  const [totalWatts, setTotalWatts] = useState(0);
  const [onCount, setOnCount] = useState(0);
  const [sessionEnergy, setSessionEnergy] = useState(0);

  // ─── Explore mode state ───
  const [toggledSet, setToggledSet] = useState(new Set());

  // ─── Info popup (shown when toggling ON in explore mode) ───
  const [infoPopup, setInfoPopup] = useState(null);

  // ─── Task system ───
  const [currentTaskIdx, setCurrentTaskIdx] = useState(0);
  const [taskFeedback, setTaskFeedback] = useState(null);
  const [taskComparison, setTaskComparison] = useState(null);
  const [correctTasks, setCorrectTasks] = useState(0);
  const [efficientChoices, setEfficientChoices] = useState(0);
  const [taskHint, setTaskHint] = useState(null);

  // ─── Learning insert ───
  const [learningInsert, setLearningInsert] = useState(null);

  // ─── Micro interaction ───
  const [microQuestion, setMicroQuestion] = useState(null);
  const [microAnswer, setMicroAnswer] = useState(null);

  // ─── Quiz + reward ───
  const [quizResult, setQuizResult] = useState(null);
  const [stars, setStars] = useState(0);

  // ─── UI ───
  const [currentRoom, setCurrentRoom] = useState('Living Room');
  const [nearestAppliance, setNearestAppliance] = useState(null);
  const [floatingTexts, setFloatingTexts] = useState([]);
  const floatingIdRef = useRef(0);

  // ─── Compute totals ───
  useEffect(() => {
    let watts = 0, count = 0;
    L2_APPLIANCE_IDS.forEach(id => {
      if (applianceStates[id]) { watts += L2_APPLIANCE_MAP[id].wattage; count++; }
    });
    setTotalWatts(watts);
    setOnCount(count);
  }, [applianceStates]);

  // ─── Intro animation ───
  useEffect(() => {
    if (phase === 'intro') {
      const t1 = setTimeout(() => setIntroStep(1), 500);
      const t2 = setTimeout(() => setIntroStep(2), 1500);
      const t3 = setTimeout(() => setIntroStep(3), 2500);
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }
  }, [phase]);

  // ─── Check explore → tasks transition ───
  const canStartTasks = toggledSet.size >= 4;

  // ─── Current task ───
  const currentTask = TASKS[currentTaskIdx] || null;
  const taskTargetIds = (phase === 'tasks' && currentTask) ? currentTask.correctIds : null;

  // ─── Add floating text helper ───
  const addFloating = useCallback((text, type) => {
    const id = floatingIdRef.current++;
    setFloatingTexts(prev => [...prev, { id, text, type }]);
  }, []);

  const removeFloatingText = useCallback((id) => {
    setFloatingTexts(prev => prev.filter(t => t.id !== id));
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
        // Show info popup
        const smartMsg = getSmartMessage(appliance.wattage);
        setInfoPopup({
          name: appliance.name,
          icon: appliance.icon,
          wattage: appliance.wattage,
          message: smartMsg,
        });
        setTimeout(() => setInfoPopup(null), 3500);
      } else {
        playToggleOffSound();
        addFloating(`${appliance.wattage}W saved!`, 'save');
      }

      return { ...prev, [applianceId]: newState };
    });

    setToggledSet(prev => {
      const next = new Set(prev);
      next.add(applianceId);
      return next;
    });
  }, [addFloating]);

  // ─── TASK MODE: Toggle handler ───
  const handleTaskInteract = useCallback((applianceId) => {
    if (!L2_APPLIANCE_IDS.includes(applianceId)) return;
    if (!currentTask || taskFeedback) return;

    const appliance = L2_APPLIANCE_MAP[applianceId];
    const isCorrect = currentTask.correctIds.includes(applianceId);
    const isBest = applianceId === currentTask.bestId;

    if (isCorrect) {
      playCorrectSound();
      playToggleOnSound();
      setApplianceStates(prev => ({ ...prev, [applianceId]: true }));
      setSessionEnergy(s => s + appliance.wattage);
      setCorrectTasks(c => c + 1);
      if (isBest) setEfficientChoices(e => e + 1);

      // Show feedback
      if (currentTask.comparison && !isBest) {
        // Correct but not the most efficient — show comparison
        setTaskComparison(currentTask.comparison);
        setTaskFeedback({
          type: 'correct-compare',
          text: `${ICONS.check} Correct! But there's a better option...`,
        });
      } else if (currentTask.comparison && isBest) {
        setTaskFeedback({
          type: 'correct-best',
          text: `${ICONS.check} Perfect! Most efficient choice!`,
        });
        addFloating('Best Choice!', 'best');
      } else {
        setTaskFeedback({
          type: 'correct',
          text: `${ICONS.check} Correct Choice!`,
        });
        addFloating(`${ICONS.check} Correct!`, 'correct');
      }
    } else {
      playWrongSound();
      setTaskHint(currentTask.wrongHint);
      setTaskFeedback({
        type: 'wrong',
        text: `${ICONS.oops} Oops! That won't solve the problem.`,
      });
      addFloating('Try again!', 'wrong');
      // Clear wrong feedback after 2s to allow retry
      setTimeout(() => {
        setTaskFeedback(null);
        setTaskHint(null);
      }, 2500);
    }
  }, [currentTask, taskFeedback, addFloating]);

  // ─── Advance to next task ───
  const advanceTask = useCallback(() => {
    setTaskFeedback(null);
    setTaskComparison(null);
    setTaskHint(null);

    const nextIdx = currentTaskIdx + 1;

    // Check for learning insert
    const insert = LEARNING_INSERTS.find(l => l.afterTask === nextIdx);
    if (insert) {
      setLearningInsert(insert);
      return;
    }

    // Check for micro question
    const micro = MICRO_QUESTIONS.find(m => m.afterTask === nextIdx);
    if (micro && !microAnswer) {
      setMicroQuestion(micro);
      return;
    }

    // Check if tasks complete
    if (nextIdx >= TASKS.length) {
      playMilestoneSound();
      setPhase('quiz');
      return;
    }

    setCurrentTaskIdx(nextIdx);
  }, [currentTaskIdx, microAnswer]);

  // ─── Close learning insert ───
  const closeLearning = useCallback(() => {
    setLearningInsert(null);
    // Continue to next task or micro question
    const nextIdx = currentTaskIdx + 1;
    const micro = MICRO_QUESTIONS.find(m => m.afterTask === nextIdx);
    if (micro && !microAnswer) {
      setMicroQuestion(micro);
      return;
    }
    if (nextIdx >= TASKS.length) {
      playMilestoneSound();
      setPhase('quiz');
      return;
    }
    setCurrentTaskIdx(nextIdx);
  }, [currentTaskIdx, microAnswer]);

  // ─── Handle micro answer ───
  const handleMicroAnswer = useCallback((idx) => {
    const isCorrect = idx === microQuestion.correctIndex;
    if (isCorrect) playCorrectSound();
    else playWrongSound();
    setMicroAnswer({ selectedIdx: idx, isCorrect });
  }, [microQuestion]);

  // ─── Close micro and advance ───
  const closeMicro = useCallback(() => {
    setMicroQuestion(null);
    setMicroAnswer(null);
    const nextIdx = currentTaskIdx + 1;
    if (nextIdx >= TASKS.length) {
      playMilestoneSound();
      setPhase('quiz');
      return;
    }
    setCurrentTaskIdx(nextIdx);
  }, [currentTaskIdx]);

  // ─── Unified interact dispatcher ───
  const handleInteract = useCallback((applianceId) => {
    if (phase === 'explore') handleExploreInteract(applianceId);
    else if (phase === 'tasks') handleTaskInteract(applianceId);
  }, [phase, handleExploreInteract, handleTaskInteract]);

  // ─── Quiz completion ───
  const handleQuizComplete = useCallback((result) => {
    const s = calculateStars(correctTasks, TASKS.length, efficientChoices, result.score, result.total);
    setStars(s);
    setQuizResult(result);
    setPhase('reward');
  }, [correctTasks, efficientChoices]);

  // ─── Reward → Hub ───
  const handleContinue = useCallback(() => {
    const coinsEarned = LEVEL2_BADGE.coins + (stars * 10) + (correctTasks * 5) + (efficientChoices * 10);
    addCarbonCoins(coinsEarned);
    completeLevel(2);
    unlockLevel(3);
    navigate('/hub');
  }, [stars, correctTasks, efficientChoices, addCarbonCoins, completeLevel, unlockLevel, navigate]);

  const handleRoomChange = useCallback((room) => setCurrentRoom(room), []);
  const handleNearestChange = useCallback((id) => setNearestAppliance(id), []);

  // ═══════════════════════════════════════════════════════
  //  RENDER — INTRO PHASE
  // ═══════════════════════════════════════════════════════

  if (phase === 'intro') {
    return (
      <div className="l2-container">
        <div className="l2-intro-overlay">
          <div className="l2-intro-particles">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="l2-intro-particle" style={{
                '--x': `${Math.random() * 100}%`,
                '--delay': `${Math.random() * 3}s`,
                '--duration': `${2 + Math.random() * 3}s`,
              }} />
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
          <button className={`l2-intro-start-btn ${introStep >= 3 ? 'visible' : ''}`}
            onClick={() => setPhase('explore')}>
            Begin Level 2 {'\u{2192}'}
          </button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════
  //  RENDER — QUIZ PHASE
  // ═══════════════════════════════════════════════════════

  if (phase === 'quiz') {
    return (
      <div className="l2-container">
        <QuizModal onComplete={handleQuizComplete} />
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════
  //  RENDER — REWARD PHASE
  // ═══════════════════════════════════════════════════════

  if (phase === 'reward' && quizResult) {
    const coinsEarned = LEVEL2_BADGE.coins + (stars * 10) + (correctTasks * 5) + (efficientChoices * 10);
    return (
      <div className="l2-container">
        <div className="l2-reward-overlay">
          <div className="l2-reward-card">
            <div className="l2-reward-badge">{LEVEL2_BADGE.icon}</div>
            <div className="l2-reward-title">{LEVEL2_BADGE.title}</div>
            <div className="l2-reward-subtitle">{LEVEL2_BADGE.description}</div>

            <div className="l2-reward-stars">
              {[1, 2, 3].map(s => (
                <span key={s} className={`l2-reward-star ${s <= stars ? 'earned' : 'empty'}`}
                  style={{ animationDelay: `${s * 0.3}s` }}>{ICONS.star}</span>
              ))}
            </div>

            <div className="l2-reward-stats">
              <div className="l2-reward-stat">
                <span className="l2-reward-stat-label">Tasks Correct</span>
                <span className="l2-reward-stat-value">{correctTasks}/{TASKS.length}</span>
              </div>
              <div className="l2-reward-stat">
                <span className="l2-reward-stat-label">Efficient Choices</span>
                <span className="l2-reward-stat-value">{efficientChoices}</span>
              </div>
              <div className="l2-reward-stat">
                <span className="l2-reward-stat-label">Quiz Score</span>
                <span className="l2-reward-stat-value">{quizResult.score}/{quizResult.total}</span>
              </div>
            </div>

            <div className="l2-reward-coins">
              <span className="l2-reward-coins-icon">{ICONS.coin}</span>
              <span className="l2-reward-coins-text">+{coinsEarned} Carbon Coins</span>
            </div>

            <div className="l2-reward-impact">
              <div className="l2-reward-impact-text">
                {ICONS.globe} AC uses ~1,800 kWh/year {'\u{1F633}'}
                <br />Choosing efficient appliances saves energy and reduces CO{'\u{2082}'} emissions!
              </div>
            </div>

            <button className="l2-continue-btn" onClick={handleContinue}>
              Return to Hub {'\u{2192}'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════
  //  RENDER — EXPLORE + TASKS (3D SCENE + HUD)
  // ═══════════════════════════════════════════════════════

  const tier = getEnergyTier(totalWatts);
  const meterPct = Math.min((totalWatts / MAX_POSSIBLE_WATTS) * 100, 100);

  return (
    <div className="l2-container">
      {/* ─── 3D Canvas ─── */}
      <div className="l2-canvas-wrapper">
        <Canvas
          camera={{ position: [-5, 6, 1], fov: 50 }}
          gl={{ antialias: false }}
          onCreated={({ gl }) => {
            gl.setClearColor('#f5deb3');
            gl.toneMapping = 1;
            gl.toneMappingExposure = 1.1;
            gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
          }}
        >
          <Suspense fallback={null}>
            <SceneContent
              applianceStates={applianceStates}
              nearestAppliance={nearestAppliance}
              taskTargetIds={taskTargetIds}
              onRoomChange={handleRoomChange}
              onNearestChange={handleNearestChange}
              onInteract={handleInteract}
              cameraRef={cameraRef}
            />
          </Suspense>
        </Canvas>
        <div className="l2-vignette" />
      </div>

      {/* ─── HUD TOP BAR ─── */}
      <div className="l2-hud-top">
        <button className="l2-back-btn" onClick={() => navigate('/hub')}>
          {'\u{2190}'} Back
        </button>
        <div className="l2-hud-title">{ICONS.zap} Energy Meter</div>
        <div className="l2-hud-room">{ROOM_ICONS[currentRoom] || ICONS.pin} {currentRoom}</div>
      </div>

      {/* ─── TASK BAR (shown in task mode) ─── */}
      {phase === 'tasks' && currentTask && !taskFeedback && !learningInsert && !microQuestion && (
        <div className="l2-task-bar">
          <div className="l2-task-progress-label">
            {ICONS.target} Task {currentTaskIdx + 1} of {TASKS.length}
          </div>
          <div className="l2-task-scenario">
            <span className="l2-task-icon">{currentTask.icon}</span>
            <span className="l2-task-text">{currentTask.scenario}</span>
          </div>
          <div className="l2-task-hint-text">
            {ICONS.bulb} {currentTask.hint}
          </div>
        </div>
      )}

      {/* ─── EXPLORE → TASKS transition button ─── */}
      {phase === 'explore' && canStartTasks && (
        <div className="l2-start-tasks-container">
          <button className="l2-start-tasks-btn" onClick={() => {
            // Reset all appliances to OFF for task mode
            const reset = {};
            L2_APPLIANCE_IDS.forEach(id => { reset[id] = false; });
            setApplianceStates(reset);
            setTotalWatts(0);
            setOnCount(0);
            setPhase('tasks');
          }}>
            {ICONS.target} Ready for Tasks! Start Problem Solving {'\u{2192}'}
          </button>
        </div>
      )}

      {/* ─── ENERGY METER PANEL ─── */}
      <div className="l2-energy-panel">
        <div className="l2-energy-header">
          <span className="l2-energy-icon">{ICONS.zap}</span>
          <span className="l2-energy-label">Total Power Usage</span>
        </div>
        <div className="l2-watt-display">
          <AnimatedWattCounter targetValue={totalWatts} />
        </div>
        <div className="l2-meter-bar-container">
          <div className="l2-meter-bar-fill" style={{
            width: `${meterPct}%`,
            backgroundColor: tier.color,
            boxShadow: `0 0 12px ${tier.color}60, inset 0 1px 0 rgba(255,255,255,0.3)`,
          }} />
          <div className="l2-meter-ticks">
            <span>0W</span><span>2kW</span><span>5kW</span><span>7.6kW</span>
          </div>
        </div>
        <div className="l2-meter-tier" style={{ color: tier.color }}>
          {tier.icon} {tier.label}
        </div>
        <div className="l2-appliance-count">
          <span className="l2-count-on">{onCount}</span>
          <span className="l2-count-sep">/</span>
          <span className="l2-count-total">{L2_APPLIANCE_IDS.length}</span>
          <span className="l2-count-label">ON</span>
        </div>
      </div>

      {/* ─── MINI ENERGY TRACKER ─── */}
      <div className="l2-session-tracker">
        {ICONS.zap} Session Energy: <strong>{sessionEnergy.toLocaleString()}W</strong>
      </div>

      {/* ─── PROGRESS PANEL (Explore mode) ─── */}
      {phase === 'explore' && (
        <div className="l2-progress-panel">
          <div className="l2-progress-header">{ICONS.check} Discovery</div>
          <div className="l2-progress-bar-outer">
            <div className="l2-progress-bar-inner"
              style={{ width: `${(toggledSet.size / L2_APPLIANCE_IDS.length) * 100}%` }} />
          </div>
          <div className="l2-progress-text">
            {toggledSet.size}/{L2_APPLIANCE_IDS.length} tested
            {canStartTasks && <span className="l2-progress-complete"> {ICONS.party} Ready!</span>}
          </div>
        </div>
      )}

      {/* ─── TASK PROGRESS (Task mode) ─── */}
      {phase === 'tasks' && (
        <div className="l2-progress-panel">
          <div className="l2-progress-header">{ICONS.target} Task Progress</div>
          <div className="l2-progress-bar-outer">
            <div className="l2-progress-bar-inner"
              style={{ width: `${((currentTaskIdx) / TASKS.length) * 100}%` }} />
          </div>
          <div className="l2-progress-text">
            {correctTasks}/{currentTaskIdx} correct {efficientChoices > 0 && `| ${ICONS.star} ${efficientChoices} efficient`}
          </div>
        </div>
      )}

      {/* ─── APPLIANCE INFO POPUP ─── */}
      {infoPopup && (
        <div className={`l2-info-popup ${infoPopup.message.type}`}>
          <div className="l2-info-popup-header">
            <span className="l2-info-popup-icon">{infoPopup.icon}</span>
            <span className="l2-info-popup-name">{infoPopup.name}</span>
            <span className="l2-info-popup-watt">{infoPopup.wattage}W</span>
          </div>
          <div className="l2-info-popup-message">
            <span className="l2-info-msg-icon">{infoPopup.message.icon}</span>
            <span>{infoPopup.message.text}</span>
          </div>
        </div>
      )}

      {/* ─── TASK FEEDBACK ─── */}
      {taskFeedback && (
        <div className={`l2-task-feedback ${taskFeedback.type}`}>
          <div className="l2-task-feedback-text">{taskFeedback.text}</div>

          {/* Smart Hint for wrong answer */}
          {taskFeedback.type === 'wrong' && taskHint && (
            <div className="l2-task-hint">
              {ICONS.bulb} Hint: {taskHint}
            </div>
          )}

          {/* Energy Comparison */}
          {taskComparison && (
            <div className="l2-comparison-card">
              <div className="l2-comparison-title">{ICONS.zap} Energy Comparison</div>
              <div className="l2-comparison-bars">
                <div className="l2-comparison-row efficient">
                  <span className="l2-comp-label">{taskComparison.efficient.label}</span>
                  <div className="l2-comp-bar-outer">
                    <div className="l2-comp-bar-fill" style={{
                      width: `${(taskComparison.efficient.watts / taskComparison.alternative.watts) * 100}%`,
                      background: '#22c55e',
                    }} />
                  </div>
                  <span className="l2-comp-watts">{taskComparison.efficient.watts}W</span>
                </div>
                <div className="l2-comparison-row alternative">
                  <span className="l2-comp-label">{taskComparison.alternative.label}</span>
                  <div className="l2-comp-bar-outer">
                    <div className="l2-comp-bar-fill" style={{ width: '100%', background: '#ef4444' }} />
                  </div>
                  <span className="l2-comp-watts">{taskComparison.alternative.watts}W</span>
                </div>
              </div>
              <div className="l2-comparison-message">{ICONS.bulb} {taskComparison.message}</div>
              <div className="l2-comparison-lesson">{taskComparison.lesson}</div>
            </div>
          )}

          {taskFeedback.type !== 'wrong' && (
            <button className="l2-task-next-btn" onClick={advanceTask}>
              {currentTaskIdx + 1 >= TASKS.length ? 'Finish Tasks' : 'Next Task'} {'\u{2192}'}
            </button>
          )}
        </div>
      )}

      {/* ─── LEARNING INSERT ─── */}
      {learningInsert && (
        <div className="l2-learning-overlay">
          <div className="l2-learning-card">
            <div className="l2-learning-icon">{learningInsert.icon}</div>
            <h3 className="l2-learning-title">{learningInsert.title}</h3>
            <p className="l2-learning-content">{learningInsert.content}</p>
            <div className="l2-learning-formula">{learningInsert.formula}</div>
            <div className="l2-learning-example">
              {ICONS.bulb} Example: {learningInsert.example}
            </div>
            <button className="l2-learning-btn" onClick={closeLearning}>
              Got it! {'\u{2192}'}
            </button>
          </div>
        </div>
      )}

      {/* ─── MICRO INTERACTION ─── */}
      {microQuestion && (
        <div className="l2-learning-overlay">
          <div className="l2-micro-card">
            <div className="l2-micro-icon">{ICONS.think}</div>
            <h3 className="l2-micro-title">Quick Question!</h3>
            <p className="l2-micro-question">{microQuestion.question}</p>
            <div className="l2-micro-options">
              {microQuestion.options.map((opt, i) => (
                <button key={i}
                  className={`l2-micro-option ${microAnswer
                    ? (i === microQuestion.correctIndex ? 'correct' : (i === microAnswer.selectedIdx ? 'wrong' : ''))
                    : ''}`}
                  onClick={() => !microAnswer && handleMicroAnswer(i)}
                  disabled={!!microAnswer}
                >
                  {opt}
                </button>
              ))}
            </div>
            {microAnswer && (
              <div className={`l2-micro-feedback ${microAnswer.isCorrect ? 'correct' : 'wrong'}`}>
                {microAnswer.isCorrect ? `${ICONS.check} Correct!` : `${ICONS.cross} Not quite!`}
                <p>{microQuestion.explanation}</p>
              </div>
            )}
            {microAnswer && (
              <button className="l2-learning-btn" onClick={closeMicro}>
                Continue {'\u{2192}'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* ─── FLOATING TEXTS ─── */}
      <div className="l2-floating-container">
        {floatingTexts.map(ft => (
          <FloatingText key={ft.id} id={ft.id} text={ft.text} type={ft.type} onDone={removeFloatingText} />
        ))}
      </div>

      {/* ─── BOTTOM CONTROLS ─── */}
      <div className="l2-controls-hint">
        <span className="l2-key">W</span>
        <span className="l2-key">A</span>
        <span className="l2-key">S</span>
        <span className="l2-key">D</span> Move
        &nbsp;{ICONS.mouse}&nbsp; Look
        &nbsp;{'\u{2022}'}&nbsp;
        <span className="l2-key">E</span> {phase === 'tasks' ? 'Choose' : 'Toggle'}
        {nearestAppliance && L2_APPLIANCE_IDS.includes(nearestAppliance) && (
          <span className="l2-hint-nearby">
            &nbsp;{'\u{2014}'}{' '}
            <span className="l2-pulse-text">
              {L2_APPLIANCE_MAP[nearestAppliance]?.icon}{' '}
              {L2_APPLIANCE_MAP[nearestAppliance]?.name} nearby!
            </span>
          </span>
        )}
      </div>
    </div>
  );
}
