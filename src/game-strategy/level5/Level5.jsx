import React, { useState, useCallback, useRef, useEffect, useMemo, Suspense } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { useNavigate } from 'react-router-dom';
import House from '../House';
import Level5Player, { l5PlayerState } from './Level5Player';
import Level2Appliances, { getProximityLevels } from '../level2/Level2Appliances';
import Level5Environment from './Level5Environment';
import { useGame } from '../../context/GameContext';
import {
  STORE_APPLIANCES, STORE_APPLIANCE_MAP, STORE_IDS,
  SCHEDULE_SLOTS, calcSolarW, BATTERY_CAPACITY, BATTERY_CHARGE_RATE, BATTERY_DISCHARGE_RATE,
  WEATHER_TYPES, COST_PER_KWH, BEFORE_STATS,
  calculateL5Stars, LEVEL5_BADGE, ENTRY_DIALOGUE, FINAL_DIALOGUE,
  L5, ROOM_ICONS, L2_APPLIANCE_IDS, L2_APPLIANCE_MAP, STARTING_BONUS, STARTING_BONUS_MSG,
  computeTotalSavings, L5_QUIZ, STAGES,
  HOME_EVOLUTION, ENVIRONMENT_FEEDBACK, getEnvironmentGrade,
  PROBLEM_HINTS, CONFIDENCE_MESSAGES,
  INTERACTIVE_TASKS, TASKS_BY_STAGE, GAMEPLAY_MESSAGES,
  TOTAL_POSSIBLE_TASK_SCORE,
} from './level5Data';
import Level5Quiz from './Level5Quiz';
import LevelIntro from '../LevelIntro';
import './Level5.css';

// ═══ AUDIO ═══
let audioCtx = null;
function getAC() { if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)(); return audioCtx; }
function playClick() { try { const c=getAC(),o=c.createOscillator(),g=c.createGain();o.connect(g);g.connect(c.destination);o.frequency.setValueAtTime(600,c.currentTime);g.gain.setValueAtTime(0.06,c.currentTime);g.gain.exponentialRampToValueAtTime(0.001,c.currentTime+0.08);o.start(c.currentTime);o.stop(c.currentTime+0.08);} catch(e){} }
function playBuy() { [440,554,659].forEach((f,i) => { try { const c=getAC(),o=c.createOscillator(),g=c.createGain();o.connect(g);g.connect(c.destination);o.type='triangle';o.frequency.setValueAtTime(f,c.currentTime+i*0.1);g.gain.setValueAtTime(0.08,c.currentTime+i*0.1);g.gain.exponentialRampToValueAtTime(0.001,c.currentTime+i*0.1+0.25);o.start(c.currentTime+i*0.1);o.stop(c.currentTime+i*0.1+0.25);} catch(e){} }); }
function playSuccess() { [523,659,784,1047].forEach((f,i) => { try { const c=getAC(),o=c.createOscillator(),g=c.createGain();o.connect(g);g.connect(c.destination);o.type='triangle';o.frequency.setValueAtTime(f,c.currentTime+i*0.12);g.gain.setValueAtTime(0.08,c.currentTime+i*0.12);g.gain.exponentialRampToValueAtTime(0.001,c.currentTime+i*0.12+0.3);o.start(c.currentTime+i*0.12);o.stop(c.currentTime+i*0.12+0.3);} catch(e){} }); }
function playError() { try { const c=getAC(),o=c.createOscillator(),g=c.createGain();o.connect(g);g.connect(c.destination);o.type='sawtooth';o.frequency.setValueAtTime(200,c.currentTime);g.gain.setValueAtTime(0.06,c.currentTime);g.gain.exponentialRampToValueAtTime(0.001,c.currentTime+0.3);o.start(c.currentTime);o.stop(c.currentTime+0.3);} catch(e){} }
function playPlace() { [600,800,1000].forEach((f,i) => { try { const c=getAC(),o=c.createOscillator(),g=c.createGain();o.connect(g);g.connect(c.destination);o.type='sine';o.frequency.setValueAtTime(f,c.currentTime+i*0.08);g.gain.setValueAtTime(0.06,c.currentTime+i*0.08);g.gain.exponentialRampToValueAtTime(0.001,c.currentTime+i*0.08+0.15);o.start(c.currentTime+i*0.08);o.stop(c.currentTime+i*0.08+0.15);} catch(e){} }); }
function playAlert() { [800,600,800].forEach((f,i) => { try { const c=getAC(),o=c.createOscillator(),g=c.createGain();o.connect(g);g.connect(c.destination);o.type='square';o.frequency.setValueAtTime(f,c.currentTime+i*0.15);g.gain.setValueAtTime(0.04,c.currentTime+i*0.15);g.gain.exponentialRampToValueAtTime(0.001,c.currentTime+i*0.15+0.12);o.start(c.currentTime+i*0.15);o.stop(c.currentTime+i*0.15+0.12);} catch(e){} }); }
function playDiscover() { [330,440,550].forEach((f,i) => { try { const c=getAC(),o=c.createOscillator(),g=c.createGain();o.connect(g);g.connect(c.destination);o.type='sine';o.frequency.setValueAtTime(f,c.currentTime+i*0.1);g.gain.setValueAtTime(0.06,c.currentTime+i*0.1);g.gain.exponentialRampToValueAtTime(0.001,c.currentTime+i*0.1+0.2);o.start(c.currentTime+i*0.1);o.stop(c.currentTime+i*0.1+0.2);} catch(e){} }); }
function playComplete() { [523,659,784,880,1047].forEach((f,i) => { try { const c=getAC(),o=c.createOscillator(),g=c.createGain();o.connect(g);g.connect(c.destination);o.type='triangle';o.frequency.setValueAtTime(f,c.currentTime+i*0.08);g.gain.setValueAtTime(0.06,c.currentTime+i*0.08);g.gain.exponentialRampToValueAtTime(0.001,c.currentTime+i*0.08+0.2);o.start(c.currentTime+i*0.08);o.stop(c.currentTime+i*0.08+0.2);} catch(e){} }); }

// ═══ 3D SCENE ═══
function CamRef({r}){const{camera}=useThree();useEffect(()=>{r.current=camera},[camera,r]);return null;}
function Scene({ appStates, nearest, onZone, onNearest, onInteract, camRef, proxLevels, timeOfDay, batteryPct, isEVCharging, weatherFactor, homeAppliances }) {
  const allIds = useMemo(() => [...L2_APPLIANCE_IDS, ...STORE_IDS], []);
  return (<><CamRef r={camRef}/><Level5Environment timeOfDay={timeOfDay} batteryPct={batteryPct} isEVCharging={isEVCharging} weatherFactor={weatherFactor} homeAppliances={homeAppliances} nearestAppliance={nearest}/><House/><Level2Appliances applianceStates={appStates} nearestAppliance={nearest} taskTargetIds={null} proximityLevels={proxLevels}/><Level5Player onZoneChange={onZone} onNearestApplianceChange={onNearest} onInteract={onInteract} applianceIdList={allIds}/></>);
}

// ═══ STAGE BAR COMPONENT ═══
function StageBar({ currentStage }) {
  return (
    <div className="l5-stage-bar">
      {STAGES.map(s => (
        <div key={s.id} className={`l5-stage-item ${s.id < currentStage ? 'done' : s.id === currentStage ? 'active' : 'locked'}`}>
          <div className="l5-stage-icon">{s.id < currentStage ? L5.check : s.icon}</div>
          <div className="l5-stage-name">{s.name}</div>
        </div>
      ))}
    </div>
  );
}

// ═══ HOME EVOLUTION STRIP ═══
function HomeEvoStrip({ stage }) {
  return (
    <div className="l5-home-evo-strip">
      {HOME_EVOLUTION.map(h => (
        <div key={h.stage} className={`l5-home-evo-stage ${h.stage <= stage ? 'active' : ''} ${h.stage === stage ? 'current' : ''}`}>
          <div className="l5-home-evo-icon" style={{ color: h.stage <= stage ? h.color : '#555' }}>{h.icon}</div>
          <div className="l5-home-evo-label">{h.label}</div>
        </div>
      ))}
    </div>
  );
}

// ═══ ENERGY METER COMPONENT ═══
function EnergyMeter({ label, value, max, unit, color, icon, animate }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="l5-sim-meter">
      <div className="l5-sim-meter-label">{icon} {label}</div>
      <div className="l5-sim-meter-track">
        <div className={`l5-sim-meter-fill ${animate ? 'animate' : ''}`} style={{ width: `${pct}%`, background: color }}></div>
      </div>
      <div className="l5-sim-meter-value" style={{ color }}>{value}{unit}</div>
    </div>
  );
}

// ═══ LIVE ENERGY HUD (shown during 3D tasks) ═══
function TaskEnergyHUD({ currentWatts, solarW, co2Rate, gameplayMsg }) {
  const gridW = Math.max(currentWatts - solarW, 0);
  const solarPct = currentWatts > 0 ? Math.round((Math.min(solarW, currentWatts) / currentWatts) * 100) : 100;
  return (
    <div className="l5-task-energy-hud">
      <div className="l5-energy-bar-row">
        <span className="l5-energy-icon">{L5.zap}</span>
        <div className="l5-energy-bar-track">
          <div className="l5-energy-bar-fill" style={{
            width: `${Math.min(currentWatts / 5000 * 100, 100)}%`,
            background: currentWatts > 3000 ? '#ef4444' : currentWatts > 1000 ? '#f5a623' : '#22c55e',
          }}></div>
        </div>
        <span className="l5-energy-val">{currentWatts}W</span>
      </div>
      <div className="l5-energy-stats-row">
        <span className="l5-energy-mini">{L5.sun} Solar: {solarPct}%</span>
        <span className="l5-energy-mini">{L5.globe} CO₂: {co2Rate.toFixed(2)} kg/hr</span>
        <span className="l5-energy-mini">{L5.plug} Grid: {gridW}W</span>
      </div>
      {gameplayMsg && (
        <div className="l5-gameplay-msg" style={{ borderColor: gameplayMsg.color + '60' }}>
          <span>{gameplayMsg.icon}</span> {gameplayMsg.text}
        </div>
      )}
    </div>
  );
}

// ═══ TASK OBJECTIVE CHECKLIST (shown during 3D tasks) ═══
function TaskObjectives({ objectives, completedObjectives }) {
  return (
    <div className="l5-task-objectives">
      <div className="l5-obj-title">{L5.target} Objectives</div>
      {objectives.map(obj => {
        const done = completedObjectives.includes(obj.id);
        return (
          <div key={obj.id} className={`l5-obj-item ${done ? 'done' : ''}`}>
            <span className="l5-obj-check">{done ? L5.check : '☐'}</span>
            <span className="l5-obj-label">{obj.label}</span>
            {obj.room && <span className="l5-obj-room">{ROOM_ICONS[obj.room] || ''} {obj.room}</span>}
          </div>
        );
      })}
    </div>
  );
}

// ═══ MAIN LEVEL 5 ═══
export default function Level5() {
  const navigate = useNavigate();
  const { carbonCoins, addCarbonCoins, completeLevel, unlockLevel } = useGame();
  const camRef = useRef(null);

  // ─── STAGE SYSTEM ───
  const [stage, setStage] = useState(1);

  // ─── Screen Machine ───
  const [showLevelIntro, setShowLevelIntro] = useState(true);
  const [screen, setScreen] = useState('entry');
  const [introReady, setIntroReady] = useState(false);
  const [dialogIdx, setDialogIdx] = useState(0);
  const [bonusGiven, setBonusGiven] = useState(false);

  // ─── Store & Appliance Progress (Stage 1) ───
  const [purchased, setPurchased] = useState([]);
  const [placed, setPlaced] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [currentAppIdx, setCurrentAppIdx] = useState(0);
  const [appPhase, setAppPhase] = useState('buy');

  // ─── Home Appliances (PERSISTENT) ───
  const [homeAppliances, setHomeAppliances] = useState([]);

  // ─── Usage Task (Stage 1) ───
  const [usageChoice, setUsageChoice] = useState(null);
  const [showUsageFeedback, setShowUsageFeedback] = useState(false);

  // ─── Placement ───
  const [placementError, setPlacementError] = useState(null);

  // ─── 3D State ───
  const [appStates, setAppStates] = useState(() => {
    const s = {}; L2_APPLIANCE_IDS.forEach(id => s[id] = false); return s;
  });
  const [nearest, setNearest] = useState(null);
  const [zone, setZone] = useState('Outside');
  const [proxLevels, setProxLevels] = useState(() => {
    const p = {}; L2_APPLIANCE_IDS.forEach(id => p[id] = 0); return p;
  });

  // ─── Energy Systems ───
  const [timeOfDay, setTimeOfDay] = useState('noon');
  const [weather, setWeather] = useState(WEATHER_TYPES[0]);
  const [batteryKwh, setBatteryKwh] = useState(5.0);

  // ═══ 8 INTERACTIVE TASKS STATE ═══
  const [currentTaskIdx, setCurrentTaskIdx] = useState(0);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [completedObjectives, setCompletedObjectives] = useState([]);
  const [taskScore, setTaskScore] = useState(0);
  const [taskCurrentWatts, setTaskCurrentWatts] = useState(0);
  const [gameplayMsg, setGameplayMsg] = useState(null);
  const [taskInteractionMsg, setTaskInteractionMsg] = useState(null);
  const [taskSubtlePrompt, setTaskSubtlePrompt] = useState(false);

  // Full Day Task (Task 8) — period tracking
  const [fullDayPeriodIdx, setFullDayPeriodIdx] = useState(0);
  const [fullDayPeriodObjectives, setFullDayPeriodObjectives] = useState([]);
  const [fullDayResults, setFullDayResults] = useState([]);

  // ─── Quiz/Results ───
  const [quizResult, setQuizResult] = useState(null);

  // ═══ DERIVED ═══
  const currentSolarW = useMemo(() => {
    const slot = SCHEDULE_SLOTS.find(s => s.id === timeOfDay) || SCHEDULE_SLOTS[2];
    return calcSolarW(slot.sunlight, weather.factor);
  }, [timeOfDay, weather]);

  const batteryPct = Math.round((batteryKwh / BATTERY_CAPACITY) * 100);
  const isEVCharging = homeAppliances.includes('ev_charger');

  const currentApp = STORE_APPLIANCES[currentAppIdx] || null;
  const totalSavings = useMemo(() => computeTotalSavings(completed), [completed]);
  const allAppsCompleted = completed.length >= STORE_APPLIANCES.length;

  // Current interactive task
  const stageTasks = useMemo(() => TASKS_BY_STAGE[stage] || [], [stage]);
  const stageTaskStartIdx = useMemo(() => {
    let idx = 0;
    for (let s = 2; s < stage; s++) {
      idx += (TASKS_BY_STAGE[s] || []).length;
    }
    return idx;
  }, [stage]);
  const localTaskIdx = currentTaskIdx - stageTaskStartIdx;
  const currentTask = INTERACTIVE_TASKS[currentTaskIdx] || null;

  // Objectives for current context (task or full-day period)
  const activeObjectives = useMemo(() => {
    if (!currentTask) return [];
    if (currentTask.isFullDay) {
      const period = currentTask.periods[fullDayPeriodIdx];
      return period ? period.objectives : [];
    }
    return currentTask.objectives;
  }, [currentTask, fullDayPeriodIdx]);

  // ═══ EFFECTS ═══

  // Intro animation
  useEffect(() => {
    if (screen !== 'entry') return;
    const t = setTimeout(() => setIntroReady(true), 500);
    return () => clearTimeout(t);
  }, [screen]);

  // Give bonus on first store visit
  useEffect(() => {
    if (screen === 'store' && !bonusGiven) {
      addCarbonCoins(STARTING_BONUS);
      setBonusGiven(true);
    }
  }, [screen, bonusGiven, addCarbonCoins]);

  // Proximity levels
  useEffect(() => {
    if (!['place', 'task_active'].includes(screen)) return;
    const interval = setInterval(() => {
      const p = getProximityLevels(l5PlayerState.x, l5PlayerState.z, L2_APPLIANCE_IDS);
      setProxLevels(p);
    }, 200);
    return () => clearInterval(interval);
  }, [screen]);

  // Placement error auto-dismiss
  useEffect(() => {
    if (!placementError) return;
    const t = setTimeout(() => setPlacementError(null), 3000);
    return () => clearTimeout(t);
  }, [placementError]);

  // Gameplay message auto-dismiss
  useEffect(() => {
    if (!gameplayMsg) return;
    const t = setTimeout(() => setGameplayMsg(null), 3000);
    return () => clearTimeout(t);
  }, [gameplayMsg]);

  // Task interaction message auto-dismiss
  useEffect(() => {
    if (!taskInteractionMsg) return;
    const t = setTimeout(() => setTaskInteractionMsg(null), 4000);
    return () => clearTimeout(t);
  }, [taskInteractionMsg]);

  // Initialize task watts when entering task
  useEffect(() => {
    if (screen === 'task_active' && currentTask) {
      setTaskCurrentWatts(currentTask.isFullDay
        ? (currentTask.periods[fullDayPeriodIdx]?.actualWattsIfWrong || 0)
        : currentTask.energyBefore.watts
      );
      // Set time of day for task context
      if (currentTask.isFullDay) {
        const period = currentTask.periods[fullDayPeriodIdx];
        if (period) setTimeOfDay(period.timeOfDay);
      }
      // Set weather for weather task
      if (currentTask.id === 'task_weather') {
        setWeather(WEATHER_TYPES[2]); // cloudy
      } else {
        setWeather(WEATHER_TYPES[0]); // clear
      }
    }
  }, [screen, currentTask, fullDayPeriodIdx]);

  // ═══ CALLBACKS ═══

  const handleZone = useCallback(z => setZone(z), []);
  const handleNearest = useCallback(n => setNearest(n), []);

  // ─── 3D INTERACTION HANDLER ───
  const handleInteract = useCallback(id => {
    // Stage 1: Placement mode
    if (screen === 'place' && currentApp) {
      if (zone === currentApp.correctRoom) {
        playPlace();
        setPlaced(prev => [...prev, currentApp.id]);
        setHomeAppliances(prev => prev.includes(currentApp.id) ? prev : [...prev, currentApp.id]);
        setAppPhase('use');
        setScreen('use');
      } else {
        playError();
        setPlacementError(`${currentApp.name} doesn't belong in ${zone}! Go to ${currentApp.correctRoom}.`);
      }
      return;
    }

    // Interactive Tasks: Handle task-specific interactions
    if (screen === 'task_active' && currentTask) {
      const objectives = activeObjectives;
      // Find matching objective for this interaction
      const matchingObj = objectives.find(obj =>
        !completedObjectives.includes(obj.id) &&
        (obj.target === id || (obj.room && obj.room === zone && obj.target === id))
      );

      if (matchingObj) {
        playDiscover();
        setCompletedObjectives(prev => [...prev, matchingObj.id]);

        // Show message
        if (matchingObj.message) {
          setTaskInteractionMsg({ text: matchingObj.message, obj: matchingObj });
        }

        // Show gameplay message
        if (matchingObj.isInefficient) {
          setGameplayMsg(GAMEPLAY_MESSAGES.high_energy);
        } else if (matchingObj.isPhantom) {
          setGameplayMsg(GAMEPLAY_MESSAGES.phantom);
        } else if (matchingObj.isSolution) {
          setGameplayMsg(GAMEPLAY_MESSAGES.efficient);
        } else if (matchingObj.isOverload) {
          setGameplayMsg(GAMEPLAY_MESSAGES.overload);
          playAlert();
        } else if (matchingObj.isFixStep) {
          setGameplayMsg(GAMEPLAY_MESSAGES.efficient);
        }

        // Update watts
        if (matchingObj.watts !== undefined) {
          if (matchingObj.isSolution || matchingObj.isFixStep) {
            setTaskCurrentWatts(prev => Math.max(0, prev + matchingObj.watts));
          } else if (matchingObj.isInefficient || matchingObj.isOverload) {
            setTaskCurrentWatts(matchingObj.watts);
          }
        }

        // Check if all objectives complete
        const newCompleted = [...completedObjectives, matchingObj.id];
        const allDone = objectives.every(obj => newCompleted.includes(obj.id));
        if (allDone) {
          playComplete();
          // For full-day tasks, move to next period or complete
          if (currentTask.isFullDay) {
            const period = currentTask.periods[fullDayPeriodIdx];
            setFullDayResults(prev => [...prev, {
              period: period.label,
              icon: period.icon,
              optimalWatts: period.optimalWatts,
            }]);
            setTimeout(() => {
              if (fullDayPeriodIdx + 1 < currentTask.periods.length) {
                setFullDayPeriodIdx(prev => prev + 1);
                setCompletedObjectives([]);
              } else {
                setScreen('task_result');
                setTaskSubtlePrompt(false);
              }
            }, 1500);
          } else {
            setTimeout(() => {
              setScreen('task_result');
              setTaskSubtlePrompt(false);
            }, 1500);
          }
        }
      }
    }
  }, [screen, currentApp, zone, currentTask, activeObjectives, completedObjectives, fullDayPeriodIdx]);

  // ─── Stage 1: Buy appliance ───
  const handleBuy = useCallback((appId) => {
    const app = STORE_APPLIANCE_MAP[appId];
    if (!app || carbonCoins < app.cost) return;
    addCarbonCoins(-app.cost);
    setPurchased(prev => [...prev, appId]);
    setCurrentAppIdx(STORE_APPLIANCES.findIndex(a => a.id === appId));
    setAppPhase('intro');
    setScreen('intro');
    playBuy();
  }, [carbonCoins, addCarbonCoins]);

  const handleIntroGotIt = useCallback(() => {
    setScreen('place');
    setAppPhase('place');
    playClick();
  }, []);

  const handleUsageChoice = useCallback((choice) => {
    setUsageChoice(choice);
    setShowUsageFeedback(true);
    playClick();
  }, []);

  const handleConfirmLearning = useCallback(() => {
    if (!currentApp) return;
    setCompleted(prev => [...prev, currentApp.id]);
    playSuccess();

    const nextIdx = STORE_APPLIANCES.findIndex(a => !purchased.includes(a.id) && a.id !== currentApp.id);
    if (nextIdx >= 0 || completed.length + 1 < STORE_APPLIANCES.length) {
      setUsageChoice(null);
      setShowUsageFeedback(false);
      setAppPhase('buy');
      setScreen('store');
    } else {
      setStage(2);
      setScreen('stage_transition');
    }
  }, [currentApp, purchased, completed]);

  // ─── Task Navigation ───
  const handleStartTask = useCallback(() => {
    setCompletedObjectives([]);
    setTaskInteractionMsg(null);
    setGameplayMsg(null);
    setTaskSubtlePrompt(false);
    if (currentTask?.isFullDay) {
      setFullDayPeriodIdx(0);
      setFullDayPeriodObjectives([]);
      setFullDayResults([]);
    }
    setScreen('task_active');
    playClick();
  }, [currentTask]);

  const handleTaskLearning = useCallback(() => {
    setScreen('task_learning');
    setTaskSubtlePrompt(true);
    playClick();
  }, []);

  const handleTaskComplete = useCallback(() => {
    if (!currentTask) return;
    setCompletedTasks(prev => [...prev, currentTask.id]);
    setTaskScore(prev => prev + currentTask.reward);
    addCarbonCoins(currentTask.reward);
    playSuccess();

    // Move to next task or stage
    const nextIdx = currentTaskIdx + 1;
    if (nextIdx < INTERACTIVE_TASKS.length) {
      const nextTask = INTERACTIVE_TASKS[nextIdx];
      setCurrentTaskIdx(nextIdx);
      if (nextTask.stage !== currentTask.stage) {
        // New stage
        setStage(nextTask.stage);
        setScreen('stage_transition');
      } else {
        setScreen('task_intro');
      }
    } else {
      // All tasks done → dashboard
      setScreen('dashboard');
    }
    // Reset
    setCompletedObjectives([]);
    setTaskInteractionMsg(null);
    setGameplayMsg(null);
  }, [currentTask, currentTaskIdx, addCarbonCoins]);

  // Quiz complete
  const handleQuizComplete = useCallback(result => {
    setQuizResult(result);
    setScreen('reward');
    playSuccess();
    completeLevel(5);
    unlockLevel(6);
    const stars = calculateL5Stars(
      completed.length,
      (result.score / result.total) * 100,
      taskScore,
      TOTAL_POSSIBLE_TASK_SCORE,
    );
    addCarbonCoins(LEVEL5_BADGE.coins * stars);
  }, [completed, taskScore, completeLevel, unlockLevel, addCarbonCoins]);

  const stars = useMemo(() => {
    if (!quizResult) return 1;
    return calculateL5Stars(
      completed.length,
      (quizResult.score / quizResult.total) * 100,
      taskScore,
      TOTAL_POSSIBLE_TASK_SCORE,
    );
  }, [quizResult, completed, taskScore]);

  // Environment grade for dashboard
  const envGrade = useMemo(() => getEnvironmentGrade(totalSavings.solarPct, totalSavings.co2Saved), [totalSavings]);
  const envData = ENVIRONMENT_FEEDBACK[envGrade];

  // ═══ RENDER ═══
  return (
    <div className="l5-container">

      {/* ══ STAGE PROGRESS BAR ══ */}
      {!['entry', 'reward'].includes(screen) && <StageBar currentStage={stage} />}

      {/* ══════════════════════════════════════════════════════ */}
      {/* ══ LEVEL INTRO (Learn Before Play) ══ */}
      {/* ══════════════════════════════════════════════════════ */}
      {showLevelIntro && (
        <LevelIntro
          levelNumber={5}
          levelTitle="Smart Sustainable Home"
          levelIcon="\u{1F3D8}\u{FE0F}"
          objective="Take charge of an entire smart home as the Chief Sustainability Engineer. Purchase, place, and manage 5 advanced eco-friendly appliances across multiple stages to build the ultimate energy-efficient home."
          learningOutcome="By the end of this level, you will master energy efficiency, learn how to optimize appliance usage for minimum waste, and understand load management to balance electricity demand across your home."
          terms={[
            { icon: '\u{2699}\u{FE0F}', name: 'Efficiency', definition: 'Getting the most useful work done while using the least amount of energy. An efficient home wastes very little electricity.', example: 'An inverter AC is more efficient than a regular AC' },
            { icon: '\u{1F9E0}', name: 'Optimization', definition: 'Using your resources in the smartest possible way \u{2014} choosing the right appliance, the right time, and the right settings to save energy.', example: 'Running the washing machine during solar peak hours' },
            { icon: '\u{1F4CA}', name: 'Load Management', definition: 'Controlling how much electricity is used at any given time by spreading out heavy appliance usage and avoiding peak overload.', example: 'Don\u{2019}t run AC, geyser, and washing machine all at once' },
          ]}
          onComplete={() => setShowLevelIntro(false)}
        />
      )}

      {/* ══════════════════════════════════════════════════════ */}
      {/* ══ ENTRY SCREEN ══ */}
      {/* ══════════════════════════════════════════════════════ */}
      {!showLevelIntro && screen === 'entry' && (
        <div className="l5-intro-overlay">
          <div className={`l5-intro-icon ${introReady ? 'visible' : ''}`}>{L5.house}</div>
          <div className={`l5-intro-title ${introReady ? 'visible' : ''}`}>SMART SUSTAINABLE HOME</div>
          <div className={`l5-intro-sub ${introReady ? 'visible' : ''}`}>FULL HOME SIMULATION</div>
          <div className={`l5-intro-role ${introReady ? 'visible' : ''}`}>5 Stages • 8 Interactive Tasks • 40–50 Minutes</div>
          <div className={`l5-intro-dialogue ${introReady ? 'visible' : ''}`}>
            <span className="l5-intro-avatar">{'\u{1F468}\u{200D}\u{1F393}'}</span>
            <span className="l5-intro-quote">{ENTRY_DIALOGUE[dialogIdx]}</span>
          </div>
          <button
            className={`l5-intro-btn ${introReady ? 'visible' : ''}`}
            onClick={() => {
              if (dialogIdx < ENTRY_DIALOGUE.length - 1) setDialogIdx(d => d + 1);
              else setScreen('store');
            }}
          >
            {dialogIdx < ENTRY_DIALOGUE.length - 1 ? 'Next \u{2192}' : 'Open Smart Store \u{1F3EA}'}
          </button>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════ */}
      {/* ══ STAGE TRANSITION SCREEN ══ */}
      {/* ══════════════════════════════════════════════════════ */}
      {screen === 'stage_transition' && (
        <div className="l5-stage-transition-overlay">
          <div className="l5-stage-transition-card">
            <div className="l5-stage-transition-badge">STAGE {stage} UNLOCKED</div>
            <div className="l5-stage-transition-icon">{STAGES[stage - 1]?.icon || L5.star}</div>
            <div className="l5-stage-transition-name">{STAGES[stage - 1]?.name}</div>
            <div className="l5-stage-transition-desc">{STAGES[stage - 1]?.desc}</div>
            <div className="l5-stage-transition-time">{L5.clock} {STAGES[stage - 1]?.time}</div>
            <HomeEvoStrip stage={stage} />
            <button className="l5-stage-transition-btn" onClick={() => {
              setScreen('task_intro');
            }}>
              Begin Stage {stage} {'\u{2192}'}
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════ */}
      {/* ══ SMART STORE (Stage 1) ══ */}
      {/* ══════════════════════════════════════════════════════ */}
      {screen === 'store' && (
        <div className="l5-store-overlay">
          <div className="l5-store-header">
            <button className="l5-back-btn" onClick={() => navigate('/hub')}>{'\u{2190}'} Hub</button>
            <div className="l5-store-title">{L5.store} Upgrade Home</div>
            <div className="l5-store-coins">{L5.coin} {carbonCoins}</div>
          </div>

          {bonusGiven && purchased.length === 0 && (
            <div className="l5-subsidy-banner">{L5.sparkle} {STARTING_BONUS_MSG}</div>
          )}

          <div className="l5-store-progress">
            <div className="l5-store-progress-label">{L5.target} Upgrades: {completed.length}/{STORE_APPLIANCES.length}</div>
            <div className="l5-store-progress-bar">
              <div className="l5-store-progress-fill" style={{ width: `${(completed.length / STORE_APPLIANCES.length) * 100}%` }}></div>
            </div>
          </div>

          <div className="l5-store-subtitle">{L5.bulb} Choose sustainable upgrades for your home</div>

          <div className="l5-store-grid">
            {STORE_APPLIANCES.map((app, idx) => {
              const isBought = purchased.includes(app.id);
              const isDone = completed.includes(app.id);
              const isAvailable = idx === 0 || completed.includes(STORE_APPLIANCES[idx - 1].id);
              const isLocked = !isAvailable && !isBought && !isDone;
              const canBuy = isAvailable && !isBought && carbonCoins >= app.cost;
              const cantAfford = isAvailable && !isBought && carbonCoins < app.cost;
              const hint = PROBLEM_HINTS[app.id];

              return (
                <div key={app.id} className={`l5-store-card ${isDone ? 'done' : isBought ? 'bought' : isLocked ? 'locked' : canBuy ? 'available' : 'unavailable'}`}>
                  {/* Problem banner */}
                  {!isLocked && !isDone && hint && (
                    <div className="l5-store-problem">
                      <div className="l5-store-problem-issue">{L5.warn} {hint.problem}</div>
                      <div className="l5-store-problem-hint">{L5.bulb} {hint.hint}</div>
                    </div>
                  )}

                  <div className="l5-store-card-icon">{isDone ? L5.check : isLocked ? L5.lock : app.icon}</div>
                  <div className="l5-store-card-name">{isLocked ? '???' : app.name}</div>
                  <div className="l5-store-card-watts">{isLocked ? '---' : `${app.wattage}W • ${app.loadType}`}</div>

                  {isDone && <div className="l5-store-card-status done">{L5.check} Completed</div>}
                  {isBought && !isDone && (
                    <button className="l5-store-card-btn resume" onClick={() => {
                      setCurrentAppIdx(idx);
                      if (placed.includes(app.id)) { setScreen('use'); setAppPhase('use'); }
                      else { setScreen('place'); setAppPhase('place'); }
                    }}>{L5.target} Continue</button>
                  )}
                  {canBuy && (
                    <button className="l5-store-card-btn buy" onClick={() => handleBuy(app.id)}>
                      {L5.coin} Buy — {app.cost} coins
                    </button>
                  )}
                  {cantAfford && <div className="l5-store-card-status locked">{L5.coin} Need {app.cost} coins</div>}
                  {isLocked && <div className="l5-store-card-status locked">{L5.lock} Locked</div>}

                  {!isLocked && (
                    <div className="l5-store-card-replace">{L5.leaf} Replaces: {app.replaces}</div>
                  )}
                </div>
              );
            })}
          </div>

          {allAppsCompleted && (
            <button className="l5-store-complete-btn" onClick={() => { setStage(2); setScreen('stage_transition'); }}>
              {L5.check} All Upgrades Done — Start Stage 2 {'\u{2192}'}
            </button>
          )}
        </div>
      )}

      {/* ══ APPLIANCE INTRO POPUP (Stage 1) ══ */}
      {screen === 'intro' && currentApp && (
        <div className="l5-intro-popup-overlay">
          <div className="l5-intro-popup">
            <div className="l5-popup-badge">NEW UPGRADE</div>
            <div className="l5-popup-icon">{currentApp.icon}</div>
            <div className="l5-popup-name">{currentApp.name}</div>
            <div className="l5-popup-watts">{currentApp.wattage}W</div>
            <div className="l5-popup-load">
              Type: <span className={`l5-load-${currentApp.loadClass}`}>{currentApp.loadType}</span>
            </div>
            <div className="l5-popup-desc">{currentApp.description}</div>
            <div className="l5-popup-insight">
              <span>{L5.bulb}</span> {currentApp.insight}
            </div>
            <div className="l5-popup-best">
              <span>{L5.clock}</span> Best used: {SCHEDULE_SLOTS.find(s => s.id === currentApp.bestTime)?.label || currentApp.bestTime}
            </div>
            <div className="l5-popup-replaces">
              <span>{L5.leaf}</span> Replaces: <strong>{currentApp.replaces}</strong> — saves {currentApp.savingPct}% energy!
            </div>
            <button className="l5-popup-btn" onClick={handleIntroGotIt}>
              Unlocked! Place it in your home {'\u{2192}'}
            </button>
          </div>
        </div>
      )}

      {/* ══ PLACEMENT MODE (3D Scene — Stage 1) ══ */}
      {screen === 'place' && currentApp && (
        <div className="l5-container">
          <div className="l5-canvas-wrapper">
            <Canvas
              camera={{ position: [-5, 8, -14], fov: 50 }}
              gl={{ antialias: false }}
              onCreated={({ gl }) => { gl.setClearColor('#050a15'); gl.toneMapping = 1; gl.toneMappingExposure = 1.0; gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); }}
            >
              <Suspense fallback={null}>
                <Scene appStates={appStates} nearest={nearest} onZone={handleZone}
                  onNearest={handleNearest} onInteract={handleInteract} camRef={camRef}
                  proxLevels={proxLevels} timeOfDay={timeOfDay} batteryPct={batteryPct}
                  isEVCharging={isEVCharging} weatherFactor={weather.factor} homeAppliances={homeAppliances} />
              </Suspense>
            </Canvas>
          </div>

          <div className="l5-hud-top">
            <button className="l5-back-btn" onClick={() => { setScreen('store'); }}>{'\u{2190}'} Store</button>
            <div className="l5-hud-title">{L5.house} Place {currentApp.name}</div>
            <div className="l5-hud-zone">{ROOM_ICONS[zone] || L5.pin} {zone}</div>
          </div>

          <div className="l5-placement-task">
            <div className="l5-placement-icon">{currentApp.icon}</div>
            <div className="l5-placement-info">
              <div className="l5-placement-title">Place in: <strong className="l5-placement-room">{currentApp.correctRoom}</strong></div>
              <div className="l5-placement-hint">Walk to {currentApp.correctRoom} and press <span className="l5-key">E</span> to place</div>
            </div>
          </div>

          <div className={`l5-room-indicator ${zone === currentApp.correctRoom ? 'correct' : 'wrong'}`}>
            {zone === currentApp.correctRoom ? (
              <>{L5.check} Correct room! Press <span className="l5-key">E</span> to place</>
            ) : (
              <>{L5.pin} Go to <strong>{currentApp.correctRoom}</strong></>
            )}
          </div>

          {placementError && (
            <div className="l5-error-toast">{L5.warn} {placementError}</div>
          )}

          {homeAppliances.length > 0 && (
            <div className="l5-home-appliances-indicator">
              <div className="l5-home-app-title">{L5.house} Your Home</div>
              {homeAppliances.map(id => {
                const a = STORE_APPLIANCE_MAP[id];
                return a ? <div key={id} className="l5-home-app-item"><span>{a.icon}</span> {a.name}</div> : null;
              })}
            </div>
          )}

          <HelpBtn />
        </div>
      )}

      {/* ══ USAGE TASK (Stage 1) ══ */}
      {screen === 'use' && currentApp && (
        <div className="l5-usage-overlay">
          <div className="l5-usage-card">
            <div className="l5-usage-badge">{L5.target} USAGE TASK</div>
            <div className="l5-usage-icon">{currentApp.icon}</div>
            <div className="l5-usage-title">{currentApp.usageTask.title}</div>
            <div className="l5-usage-instruction">{currentApp.usageTask.instruction}</div>

            {!showUsageFeedback ? (
              <div className="l5-usage-choices">
                <button className="l5-sim-option" onClick={() => handleUsageChoice('correct')}>
                  {L5.play} {currentApp.usageTask.correct.label}
                </button>
                <button className="l5-sim-option" onClick={() => handleUsageChoice('wrong')}>
                  {L5.play} {currentApp.usageTask.wrong.label}
                </button>
              </div>
            ) : (
              <div className="l5-usage-feedback">
                <div className="l5-narrative-feedback">
                  <div className="l5-narrative-icon">{L5.speech}</div>
                  <div className="l5-narrative-text">
                    {usageChoice === 'correct'
                      ? currentApp.usageTask.correct.feedback
                      : currentApp.usageTask.wrong.feedback
                    }
                  </div>
                </div>
                <div className="l5-feedback-metrics">
                  <div className="l5-feedback-metric">
                    <span className="l5-metric-icon">{L5.zap}</span>
                    <span className="l5-metric-label">Energy Saved</span>
                    <span className="l5-metric-val">{currentApp.savingPct}%</span>
                  </div>
                  <div className="l5-feedback-metric">
                    <span className="l5-metric-icon">{L5.globe}</span>
                    <span className="l5-metric-label">CO₂ Reduced</span>
                    <span className="l5-metric-val">{currentApp.co2SavedKg} kg/mo</span>
                  </div>
                </div>
                <button className="l5-usage-next-btn" onClick={() => { setScreen('confirm'); }}>
                  See Learning Summary {'\u{2192}'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══ LEARNING CONFIRMATION (Stage 1) ══ */}
      {screen === 'confirm' && currentApp && (
        <div className="l5-confirm-overlay">
          <div className="l5-confirm-card">
            <div className="l5-confirm-icon">{currentApp.icon}</div>
            <div className="l5-confirm-title">{L5.brain} What You Learned</div>
            <div className="l5-confirm-msg">{currentApp.learningMsg}</div>

            <div className="l5-confirm-stats">
              <div className="l5-confirm-stat">
                <div className="l5-confirm-stat-icon">{L5.zap}</div>
                <div className="l5-confirm-stat-label">Energy Saved</div>
                <div className="l5-confirm-stat-val">{currentApp.savingPct}%</div>
              </div>
              <div className="l5-confirm-stat">
                <div className="l5-confirm-stat-icon">{L5.globe}</div>
                <div className="l5-confirm-stat-label">CO₂ Reduced</div>
                <div className="l5-confirm-stat-val">{currentApp.co2SavedKg} kg</div>
              </div>
              <div className="l5-confirm-stat">
                <div className="l5-confirm-stat-icon">{L5.leaf}</div>
                <div className="l5-confirm-stat-label">Replaces</div>
                <div className="l5-confirm-stat-val">{currentApp.replaces}</div>
              </div>
            </div>

            <div className="l5-confirm-comparison">
              <div className="l5-confirm-before"><span>{L5.warn}</span> Before: {currentApp.replaces}</div>
              <div className="l5-confirm-arrow">{'\u{2192}'}</div>
              <div className="l5-confirm-after"><span>{L5.leaf}</span> After: {currentApp.name} ({currentApp.wattage}W)</div>
            </div>

            <div className="l5-home-evolving">
              {L5.house} Your home now has {homeAppliances.length} upgrade{homeAppliances.length !== 1 ? 's' : ''} installed!
            </div>

            <button className="l5-confirm-btn" onClick={handleConfirmLearning}>
              {completed.length + 1 >= STORE_APPLIANCES.length
                ? `${L5.sparkle} All Done — Next Stage ${'\u{2192}'}`
                : `${L5.sparkle} Got it! Next Upgrade ${'\u{2192}'}`
              }
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════ */}
      {/* ══ TASK INTRO (before 3D) ══ */}
      {/* ══════════════════════════════════════════════════════ */}
      {screen === 'task_intro' && currentTask && (
        <div className="l5-task-intro-overlay">
          <div className="l5-task-intro-card">
            <div className="l5-task-intro-badge">TASK {currentTask.num} of 8</div>
            <div className="l5-task-intro-icon">{currentTask.icon}</div>
            <div className="l5-task-intro-title">{currentTask.title}</div>
            <div className="l5-task-intro-scenario">{currentTask.scenario}</div>
            <div className="l5-task-intro-desc">{currentTask.description}</div>

            {/* Before metrics */}
            <div className="l5-task-intro-metrics">
              <div className="l5-task-metric before">
                <span className="l5-task-metric-label">{L5.warn} Current</span>
                <span className="l5-task-metric-val">{currentTask.energyBefore.watts}W</span>
                <span className="l5-task-metric-sub">{currentTask.energyBefore.co2} kg CO₂/hr</span>
              </div>
              <div className="l5-task-metric arrow">{'\u{2192}'}</div>
              <div className="l5-task-metric target">
                <span className="l5-task-metric-label">{L5.target} Target</span>
                <span className="l5-task-metric-val">{currentTask.energyAfter.watts}W</span>
                <span className="l5-task-metric-sub">{currentTask.energyAfter.co2} kg CO₂/hr</span>
              </div>
            </div>

            {/* Objectives preview */}
            <div className="l5-task-intro-objectives">
              <div className="l5-task-intro-obj-title">{L5.target} What to do:</div>
              {(currentTask.isFullDay ? currentTask.periods[0].objectives : currentTask.objectives).map(obj => (
                <div key={obj.id} className="l5-task-intro-obj-item">
                  <span>☐</span> {obj.label} <span className="l5-task-intro-obj-room">{ROOM_ICONS[obj.room] || ''}</span>
                </div>
              ))}
            </div>

            {currentTask.isFullDay && (
              <div className="l5-task-fullday-periods">
                <div className="l5-task-fullday-label">{L5.clock} 3 Time Periods:</div>
                {currentTask.periods.map(p => (
                  <span key={p.id} className="l5-task-period-tag">{p.icon} {p.label}</span>
                ))}
              </div>
            )}

            <button className="l5-task-intro-btn" onClick={handleStartTask}>
              {L5.play} Start Task — Walk & Interact {'\u{2192}'}
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════ */}
      {/* ══ TASK ACTIVE (3D Scene + HUD) ══ */}
      {/* ══════════════════════════════════════════════════════ */}
      {screen === 'task_active' && currentTask && (
        <div className="l5-container">
          <div className="l5-canvas-wrapper">
            <Canvas
              camera={{ position: [-5, 8, -14], fov: 50 }}
              gl={{ antialias: false }}
              onCreated={({ gl }) => { gl.setClearColor('#050a15'); gl.toneMapping = 1; gl.toneMappingExposure = 1.0; gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); }}
            >
              <Suspense fallback={null}>
                <Scene appStates={appStates} nearest={nearest} onZone={handleZone}
                  onNearest={handleNearest} onInteract={handleInteract} camRef={camRef}
                  proxLevels={proxLevels} timeOfDay={timeOfDay} batteryPct={batteryPct}
                  isEVCharging={isEVCharging} weatherFactor={weather.factor} homeAppliances={homeAppliances} />
              </Suspense>
            </Canvas>
          </div>

          {/* Top HUD */}
          <div className="l5-hud-top">
            <div className="l5-hud-task-badge">{currentTask.icon} Task {currentTask.num}</div>
            <div className="l5-hud-title">{currentTask.title}</div>
            <div className="l5-hud-zone">{ROOM_ICONS[zone] || L5.pin} {zone}</div>
          </div>

          {/* Full Day period indicator */}
          {currentTask.isFullDay && (
            <div className="l5-fullday-period-hud">
              {currentTask.periods.map((p, i) => (
                <div key={p.id} className={`l5-period-dot ${i < fullDayPeriodIdx ? 'done' : i === fullDayPeriodIdx ? 'active' : ''}`}>
                  {i < fullDayPeriodIdx ? L5.check : p.icon}
                  <span>{p.label}</span>
                </div>
              ))}
            </div>
          )}

          {/* Energy HUD */}
          <TaskEnergyHUD
            currentWatts={taskCurrentWatts}
            solarW={currentSolarW}
            co2Rate={(Math.max(taskCurrentWatts - currentSolarW, 0) / 1000) * 0.71}
            gameplayMsg={gameplayMsg}
          />

          {/* Objectives checklist */}
          <TaskObjectives
            objectives={activeObjectives}
            completedObjectives={completedObjectives}
          />

          {/* Interaction message popup */}
          {taskInteractionMsg && (
            <div className={`l5-task-interaction-msg ${taskInteractionMsg.obj?.isSolution ? 'success' : taskInteractionMsg.obj?.isInefficient ? 'warning' : taskInteractionMsg.obj?.isOverload ? 'danger' : taskInteractionMsg.obj?.isPhantom ? 'phantom' : 'info'}`}>
              <div className="l5-interaction-msg-text">{taskInteractionMsg.text}</div>
            </div>
          )}

          {/* Nearest appliance hint */}
          {nearest && (
            <div className="l5-nearest-hint">
              Press <span className="l5-key">E</span> to interact with {nearest.replace(/_/g, ' ')}
            </div>
          )}

          <HelpBtn />
        </div>
      )}

      {/* ══════════════════════════════════════════════════════ */}
      {/* ══ TASK RESULT (before/after comparison) ══ */}
      {/* ══════════════════════════════════════════════════════ */}
      {screen === 'task_result' && currentTask && (
        <div className="l5-task-result-overlay">
          <div className="l5-task-result-card">
            <div className="l5-task-result-badge">{L5.chart} RESULT</div>
            <div className="l5-task-result-icon">{currentTask.icon}</div>
            <div className="l5-task-result-title">{currentTask.title}</div>

            <div className="l5-task-result-compare">
              <div className="l5-task-result-col before">
                <div className="l5-task-result-col-label">{L5.warn} Before</div>
                <div className="l5-task-result-stat">
                  <span>{L5.zap}</span> {currentTask.energyBefore.watts}W
                </div>
                <div className="l5-task-result-stat">
                  <span>{L5.globe}</span> {currentTask.energyBefore.co2} kg CO₂/hr
                </div>
                <div className="l5-task-result-stat">
                  <span>{L5.money}</span> ₹{currentTask.energyBefore.bill}/hr
                </div>
              </div>
              <div className="l5-task-result-arrow">{'\u{2192}'}</div>
              <div className="l5-task-result-col after">
                <div className="l5-task-result-col-label">{L5.leaf} After</div>
                <div className="l5-task-result-stat">
                  <span>{L5.zap}</span> {currentTask.energyAfter.watts}W
                </div>
                <div className="l5-task-result-stat">
                  <span>{L5.globe}</span> {currentTask.energyAfter.co2} kg CO₂/hr
                </div>
                <div className="l5-task-result-stat">
                  <span>{L5.money}</span> ₹{currentTask.energyAfter.bill}/hr
                </div>
              </div>
            </div>

            {/* Savings highlight */}
            <div className="l5-task-result-savings">
              <div className="l5-task-result-saving-item">
                {L5.zap} Power Reduced: <strong>{Math.round((1 - currentTask.energyAfter.watts / Math.max(currentTask.energyBefore.watts, 1)) * 100)}%</strong>
              </div>
              <div className="l5-task-result-saving-item">
                {L5.globe} CO₂ Saved: <strong>{(currentTask.energyBefore.co2 - currentTask.energyAfter.co2).toFixed(2)} kg/hr</strong>
              </div>
            </div>

            {/* Full day results */}
            {currentTask.isFullDay && fullDayResults.length > 0 && (
              <div className="l5-fullday-results">
                <div className="l5-fullday-results-title">{L5.clock} Period Results:</div>
                {fullDayResults.map((r, i) => (
                  <div key={i} className="l5-fullday-result-row">
                    <span>{r.icon} {r.period}</span>
                    <span className="l5-fullday-result-watts">{L5.check} {r.optimalWatts}W optimal</span>
                  </div>
                ))}
              </div>
            )}

            <button className="l5-task-result-btn" onClick={handleTaskLearning}>
              {L5.brain} What Did You Learn? {'\u{2192}'}
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════ */}
      {/* ══ TASK LEARNING (educational summary) ══ */}
      {/* ══════════════════════════════════════════════════════ */}
      {screen === 'task_learning' && currentTask && (
        <div className="l5-task-learning-overlay">
          <div className="l5-task-learning-card">
            <div className="l5-task-learning-badge">{L5.brain} LEARNING</div>
            <div className="l5-task-learning-icon">{currentTask.icon}</div>
            <div className="l5-task-learning-title">{currentTask.title}</div>

            <div className="l5-task-learning-msg">
              <div className="l5-narrative-feedback">
                <div className="l5-narrative-icon">{L5.speech}</div>
                <div className="l5-narrative-text">{currentTask.learning}</div>
              </div>
            </div>

            {/* Subtle prompt */}
            {taskSubtlePrompt && currentTask.subtlePrompt && (
              <div className="l5-task-subtle-prompt">
                <span>{L5.think}</span> {currentTask.subtlePrompt}
              </div>
            )}

            {/* Reward */}
            <div className="l5-task-learning-reward">
              {L5.coin} +{currentTask.reward} coins • {L5.globe} {currentTask.co2Impact} kg CO₂
            </div>

            {/* Confidence message */}
            <div className="l5-confidence-boost">
              {L5.sparkle} {CONFIDENCE_MESSAGES[currentTaskIdx % CONFIDENCE_MESSAGES.length]}
            </div>

            <button className="l5-task-learning-btn" onClick={handleTaskComplete}>
              {currentTaskIdx + 1 >= INTERACTIVE_TASKS.length
                ? `${L5.chart} View Impact Dashboard ${'\u{2192}'}`
                : INTERACTIVE_TASKS[currentTaskIdx + 1]?.stage !== currentTask.stage
                  ? `${L5.sparkle} Complete Stage ${currentTask.stage} ${'\u{2192}'}`
                  : `${L5.play} Next Task ${'\u{2192}'}`
              }
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════ */}
      {/* ══ FINAL IMPACT DASHBOARD ══ */}
      {/* ══════════════════════════════════════════════════════ */}
      {screen === 'dashboard' && (
        <div className="l5-dash-overlay">
          <div className="l5-dash-card">
            <div className="l5-dash-title">{L5.chart} Final Impact Dashboard</div>

            {/* Home Evolution */}
            <HomeEvoStrip stage={5} />

            {/* Environment Feedback */}
            <div className="l5-env-feedback" style={{ borderColor: envData.color + '40' }}>
              <div className="l5-env-icon">{envData.icon}</div>
              <div className="l5-env-label" style={{ color: envData.color }}>{envData.label}</div>
              <div className="l5-env-desc">{envData.desc}</div>
            </div>

            {/* Key Callouts */}
            <div className="l5-dash-callouts">
              <div className="l5-dash-callout solar">
                <div className="l5-callout-icon">{L5.sun}</div>
                <div className="l5-callout-text">You powered your home using <strong>{totalSavings.solarPct}%</strong> solar energy</div>
              </div>
              <div className="l5-dash-callout emission">
                <div className="l5-callout-icon">{L5.leaf}</div>
                <div className="l5-callout-text">You reduced emissions by <strong>{totalSavings.efficiencyPct}%</strong> overall</div>
              </div>
            </div>

            <div className="l5-dash-compare">
              <div className="l5-dash-col before">
                <div className="l5-dash-col-label">{L5.warn} Before Upgrades</div>
                <div className="l5-dash-col-stat"><span>{BEFORE_STATS.co2Month} kg</span><span>CO₂/month</span></div>
                <div className="l5-dash-col-stat"><span>₹{BEFORE_STATS.billMonth}</span><span>Bill/month</span></div>
                <div className="l5-dash-col-stat"><span>0%</span><span>Efficiency</span></div>
              </div>
              <div className="l5-dash-col after">
                <div className="l5-dash-col-label">{L5.leaf} After Upgrades</div>
                <div className="l5-dash-col-stat"><span>{Math.max(BEFORE_STATS.co2Month - totalSavings.co2Saved, 0)} kg</span><span>CO₂/month</span></div>
                <div className="l5-dash-col-stat"><span>₹{Math.max(BEFORE_STATS.billMonth - totalSavings.billSaved, 0)}</span><span>Bill/month</span></div>
                <div className="l5-dash-col-stat"><span>{totalSavings.efficiencyPct}%</span><span>Efficiency</span></div>
              </div>
            </div>

            <div className="l5-dash-savings">
              {L5.sparkle} You saved {totalSavings.co2Saved} kg CO₂ and ₹{totalSavings.billSaved}/month!
            </div>

            {/* Final message */}
            <div className="l5-dash-final-msg">
              {L5.globe} "You reduced emissions by {totalSavings.efficiencyPct}%"
            </div>

            {/* Task performance */}
            <div className="l5-dash-task-summary">
              <div className="l5-dash-breakdown-title">{L5.play} Task Performance</div>
              {INTERACTIVE_TASKS.map(t => (
                <div key={t.id} className="l5-dash-breakdown-row">
                  <span>{t.icon} {t.title}</span>
                  <span className="l5-dash-save-pct">{completedTasks.includes(t.id) ? `${L5.check} +${t.reward} pts` : `${L5.cross} Missed`}</span>
                </div>
              ))}
              <div className="l5-dash-task-total">
                {L5.star} Total: {taskScore}/{TOTAL_POSSIBLE_TASK_SCORE} points
              </div>
            </div>

            {/* Upgrade breakdown */}
            <div className="l5-dash-breakdown">
              <div className="l5-dash-breakdown-title">{L5.leaf} Upgrade Breakdown</div>
              {STORE_APPLIANCES.map(a => (
                <div key={a.id} className="l5-dash-breakdown-row">
                  <span>{a.icon} {a.name}</span>
                  <span className="l5-dash-save-pct">-{a.savingPct}% energy</span>
                  <span className="l5-dash-save-co2">-{a.co2SavedKg} kg CO₂</span>
                </div>
              ))}
            </div>

            <button className="l5-dash-quiz-btn" onClick={() => setScreen('quiz')}>
              Take Final Reflection Quiz {'\u{2192}'}
            </button>
          </div>
        </div>
      )}

      {/* ══ QUIZ ══ */}
      {screen === 'quiz' && <Level5Quiz onComplete={handleQuizComplete} />}

      {/* ══════════════════════════════════════════════════════ */}
      {/* ══ REWARD ══ */}
      {/* ══════════════════════════════════════════════════════ */}
      {screen === 'reward' && (
        <div className="l5-reward-overlay">
          <div className="l5-reward-card">
            <div className="l5-reward-badge">{L5.trophy}</div>
            <div className="l5-reward-title">SUSTAINABILITY MASTER</div>
            <div className="l5-reward-sub">{LEVEL5_BADGE.description}</div>
            <div className="l5-reward-stars">
              {[1, 2, 3].map(s => (
                <span key={s} className={`l5-reward-star ${s <= stars ? 'earned' : 'empty'}`} style={{ animationDelay: `${s * 0.25}s` }}>{L5.star}</span>
              ))}
            </div>

            {/* Home Evolution Final */}
            <HomeEvoStrip stage={5} />

            {/* Environment Feedback */}
            <div className="l5-env-feedback" style={{ borderColor: envData.color + '40' }}>
              <div className="l5-env-icon">{envData.icon}</div>
              <div className="l5-env-label" style={{ color: envData.color }}>{envData.label}</div>
              <div className="l5-env-desc">{envData.desc}</div>
            </div>

            {/* Stages completed */}
            <div className="l5-reward-stages">
              {STAGES.map(s => (
                <div key={s.id} className="l5-reward-stage-item">
                  <span>{L5.check}</span> {s.name}
                </div>
              ))}
            </div>

            <div className="l5-reward-stats">
              <div className="l5-reward-stat"><div className="l5-reward-stat-label">CO₂ Saved</div><div className="l5-reward-stat-value">{totalSavings.co2Saved} kg</div></div>
              <div className="l5-reward-stat"><div className="l5-reward-stat-label">Bill Saved</div><div className="l5-reward-stat-value">₹{totalSavings.billSaved}</div></div>
              <div className="l5-reward-stat"><div className="l5-reward-stat-label">Solar</div><div className="l5-reward-stat-value">{totalSavings.solarPct}%</div></div>
              <div className="l5-reward-stat"><div className="l5-reward-stat-label">Tasks</div><div className="l5-reward-stat-value">{completedTasks.length}/8</div></div>
            </div>

            <div className="l5-reward-coins">{L5.coin} +{LEVEL5_BADGE.coins * stars} Carbon Coins</div>

            <div className="l5-reward-final">
              {FINAL_DIALOGUE.map((d, i) => <div key={i} className="l5-reward-final-line">{d}</div>)}
            </div>

            {quizResult && <div style={{ color: '#aaa', fontSize: 12, margin: '8px 0' }}>Reflection Quiz: {quizResult.score}/{quizResult.total}</div>}
            <button className="l5-reward-btn" onClick={() => navigate('/hub')}>Return to Mission Hub {L5.sparkle}</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══ HELP ═══
function HelpBtn() {
  const [s, setS] = useState(false);
  return (<>
    <button className="l5-help-btn" onClick={() => setS(true)}>?</button>
    {s && <div className="l5-modal-overlay" onClick={() => setS(false)}>
      <div className="l5-modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 340 }}>
        <div className="l5-modal-title">{L5.gear} Controls</div>
        {[['W/\u2191','Forward'],['S/\u2193','Backward'],['A/\u2190','Turn Left'],['D/\u2192','Turn Right'],['Q','Look Up'],['Z','Look Down'],['E','Interact / Place']].map(([k, l]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ background: 'rgba(34,197,94,0.12)', padding: '2px 10px', borderRadius: 4, fontWeight: 700, fontSize: 13, color: '#22c55e' }}>{k}</span>
            <span style={{ color: '#aaa', fontSize: 13 }}>{l}</span>
          </div>
        ))}
        <button className="l5-modal-btn" onClick={() => setS(false)}>Got it!</button>
      </div>
    </div>}
  </>);
}
