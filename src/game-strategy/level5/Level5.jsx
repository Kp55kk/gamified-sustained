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
  MULTI_USE_TASKS, COMBO_TASKS, PROGRESSIVE_GOALS,
  DYNAMIC_EVENTS, MASTER_CYCLE_GOALS, ANALYSIS_QUESTIONS,
  HOME_EVOLUTION, ENVIRONMENT_FEEDBACK, getEnvironmentGrade,
  PROBLEM_HINTS, CONFIDENCE_MESSAGES,
} from './level5Data';
import Level5Quiz from './Level5Quiz';
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
function playCombo() { [523,659,784,880,1047].forEach((f,i) => { try { const c=getAC(),o=c.createOscillator(),g=c.createGain();o.connect(g);g.connect(c.destination);o.type='triangle';o.frequency.setValueAtTime(f,c.currentTime+i*0.08);g.gain.setValueAtTime(0.06,c.currentTime+i*0.08);g.gain.exponentialRampToValueAtTime(0.001,c.currentTime+i*0.08+0.2);o.start(c.currentTime+i*0.08);o.stop(c.currentTime+i*0.08+0.2);} catch(e){} }); }
function playThink() { try { const c=getAC(),o=c.createOscillator(),g=c.createGain();o.connect(g);g.connect(c.destination);o.type='sine';o.frequency.setValueAtTime(440,c.currentTime);o.frequency.linearRampToValueAtTime(660,c.currentTime+0.3);g.gain.setValueAtTime(0.04,c.currentTime);g.gain.exponentialRampToValueAtTime(0.001,c.currentTime+0.4);o.start(c.currentTime);o.stop(c.currentTime+0.4);} catch(e){} }

// ═══ 3D ═══
function CamRef({r}){const{camera}=useThree();useEffect(()=>{r.current=camera},[camera,r]);return null;}
function Scene({ appStates, nearest, onZone, onNearest, onInteract, camRef, proxLevels, timeOfDay, batteryPct, isEVCharging }) {
  return (<><CamRef r={camRef}/><Level5Environment timeOfDay={timeOfDay} batteryPct={batteryPct} isEVCharging={isEVCharging}/><House/><Level2Appliances applianceStates={appStates} nearestAppliance={nearest} taskTargetIds={null} proximityLevels={proxLevels}/><Level5Player onZoneChange={onZone} onNearestApplianceChange={onNearest} onInteract={onInteract} applianceIdList={L2_APPLIANCE_IDS}/></>);
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

// ═══ ENERGY METER COMPONENT (used in simulations) ═══
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

// ═══ MAIN LEVEL 5 ═══
export default function Level5() {
  const navigate = useNavigate();
  const { carbonCoins, addCarbonCoins, completeLevel, unlockLevel } = useGame();
  const camRef = useRef(null);

  // ─── STAGE SYSTEM ───
  const [stage, setStage] = useState(1);

  // ─── Screen Machine ───
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
  const timeSlot = useMemo(() => SCHEDULE_SLOTS.find(s => s.id === timeOfDay) || SCHEDULE_SLOTS[2], [timeOfDay]);

  // ─── Stage 2: Interactive Simulation Tasks ───
  const [multiUseAppIdx, setMultiUseAppIdx] = useState(0);
  const [multiUseTaskIdx, setMultiUseTaskIdx] = useState(0);
  const [multiUseCompleted, setMultiUseCompleted] = useState({});
  const [totalMultiUseScore, setTotalMultiUseScore] = useState(0);
  // Simulation sub-phases: 'task' → 'result' → 'think' → 'quiz' → 'feedback'
  const [simPhase, setSimPhase] = useState('task');
  const [simSelectedOption, setSimSelectedOption] = useState(null);
  const [quizAnswer, setQuizAnswer] = useState(null);
  const [showRetry, setShowRetry] = useState(false);
  const [confidenceMsg, setConfidenceMsg] = useState(null);

  // ─── Stage 3: Combo Tasks ───
  const [comboIdx, setComboIdx] = useState(0);
  const [comboScore, setComboScore] = useState(0);
  const [comboPhase, setComboPhase] = useState('task');
  const [comboSimOption, setComboSimOption] = useState(null);
  const [comboQuizAnswer, setComboQuizAnswer] = useState(null);
  const [comboRetry, setComboRetry] = useState(false);
  const [progressGoalIdx, setProgressGoalIdx] = useState(0);
  const [accumulatedCO2, setAccumulatedCO2] = useState(0);
  const [goalMet, setGoalMet] = useState(false);

  // ─── Stage 4: Dynamic Events ───
  const [eventIdx, setEventIdx] = useState(0);
  const [eventTimer, setEventTimer] = useState(0);
  const [totalConsequences, setTotalConsequences] = useState({ co2: 0, bill: 0 });
  const [crisisScore, setCrisisScore] = useState(0);
  const [crisisPhase, setCrisisPhase] = useState('event');
  const [crisisSimOption, setCrisisSimOption] = useState(null);
  const [crisisQuizAnswer, setCrisisQuizAnswer] = useState(null);
  const [crisisRetry, setCrisisRetry] = useState(false);

  // ─── Stage 5: Master Simulation ───
  const [masterCycle, setMasterCycle] = useState(0);
  const [simTimeIdx, setSimTimeIdx] = useState(0);
  const [simResults, setSimResults] = useState([]);
  const [simRunning, setSimRunning] = useState(false);
  const [allCycleResults, setAllCycleResults] = useState([]);
  const [analysisIdx, setAnalysisIdx] = useState(0);
  const [analysisAnswer, setAnalysisAnswer] = useState(null);
  const [analysisFeedback, setAnalysisFeedback] = useState(false);
  const [analysisScore, setAnalysisScore] = useState(0);

  // ─── Integration (preserved) ───
  const [integrationScore, setIntegrationScore] = useState(0);

  // ─── Quiz/Results ───
  const [quizResult, setQuizResult] = useState(null);

  // ═══ DERIVED ═══
  const currentSolarW = useMemo(() => calcSolarW(timeSlot.sunlight, weather.factor), [timeSlot, weather]);
  const houseWatts = useMemo(() => {
    let w = 0;
    Object.entries(appStates).forEach(([id, on]) => {
      if (on) { const appData = L2_APPLIANCE_MAP[id]; if (appData) w += appData.wattage; }
    });
    homeAppliances.forEach(id => {
      const sa = STORE_APPLIANCE_MAP[id]; if (sa) w += sa.wattage;
    });
    return w;
  }, [appStates, homeAppliances]);

  const solarUsed = Math.min(currentSolarW, houseWatts);
  const gridWatts = Math.max(houseWatts - currentSolarW, 0);
  const solarPct = houseWatts > 0 ? Math.round((solarUsed / houseWatts) * 100) : (currentSolarW > 0 ? 100 : 0);
  const co2Rate = (gridWatts / 1000) * 0.71;
  const billRate = (gridWatts / 1000) * COST_PER_KWH;
  const batteryPct = Math.round((batteryKwh / BATTERY_CAPACITY) * 100);
  const isEVCharging = homeAppliances.includes('ev_charger');

  const currentApp = STORE_APPLIANCES[currentAppIdx] || null;
  const totalSavings = useMemo(() => computeTotalSavings(completed), [completed]);
  const allAppsCompleted = completed.length >= STORE_APPLIANCES.length;

  const nextAvailableIdx = useMemo(() => {
    for (let i = 0; i < STORE_APPLIANCES.length; i++) {
      if (!purchased.includes(STORE_APPLIANCES[i].id)) return i;
    }
    return -1;
  }, [purchased]);

  // Multi-use current task
  const currentMultiApp = STORE_APPLIANCES[multiUseAppIdx] || null;
  const currentMultiTasks = currentMultiApp ? MULTI_USE_TASKS[currentMultiApp.id] || [] : [];
  const currentMultiTask = currentMultiTasks[multiUseTaskIdx] || null;

  // Combo
  const currentCombo = COMBO_TASKS[comboIdx] || null;

  // Events
  const currentEvent = DYNAMIC_EVENTS[eventIdx] || null;

  // Master cycle target
  const currentCycleGoal = MASTER_CYCLE_GOALS[masterCycle] || null;

  // Random confidence message
  const getConfidenceMsg = useCallback(() => {
    return CONFIDENCE_MESSAGES[Math.floor(Math.random() * CONFIDENCE_MESSAGES.length)];
  }, []);

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
    if (!['place', 'integration', 'simulation'].includes(screen)) return;
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

  // Event timer countdown (Stage 4)
  useEffect(() => {
    if (screen !== 'crisis' || crisisPhase !== 'event') return;
    if (eventTimer <= 0) return;
    const t = setInterval(() => {
      setEventTimer(prev => {
        if (prev <= 1) { clearInterval(t); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [screen, crisisPhase, eventTimer]);

  // Simulation runner (Stage 5)
  useEffect(() => {
    if (screen !== 'master_sim' || !simRunning) return;
    if (simTimeIdx >= SCHEDULE_SLOTS.length) {
      setSimRunning(false);
      return;
    }
    const slot = SCHEDULE_SLOTS[simTimeIdx];
    setTimeOfDay(slot.id);
    const t = setTimeout(() => {
      const sw = calcSolarW(slot.sunlight, weather.factor);
      const sp = houseWatts > 0 ? Math.round((Math.min(sw, houseWatts) / houseWatts) * 100) : 100;
      const gw = Math.max(houseWatts - sw, 0);
      const co2 = ((gw) / 1000 * 0.71);
      setSimResults(prev => [...prev, {
        time: slot.label, icon: slot.icon, solarW: sw, solarPct: sp,
        gridW: gw, co2: co2.toFixed(2),
      }]);
      setSimTimeIdx(i => i + 1);
    }, 1800);
    return () => clearTimeout(t);
  }, [screen, simRunning, simTimeIdx, weather, houseWatts]);

  // ═══ CALLBACKS ═══

  const handleZone = useCallback(z => setZone(z), []);
  const handleNearest = useCallback(n => setNearest(n), []);
  const handleInteract = useCallback(id => {
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
    if (['integration', 'master_sim'].includes(screen)) {
      if (!L2_APPLIANCE_IDS.includes(id)) return;
      setAppStates(prev => ({ ...prev, [id]: !prev[id] }));
      playClick();
    }
  }, [screen, currentApp, zone]);

  // Buy appliance (Stage 1)
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

  // ─── Stage 2: Interactive Simulation Handlers ───
  const handleSimOptionSelect = useCallback((option) => {
    setSimSelectedOption(option);
    playClick();
    // Show result for 1.5s, then transition to think prompt
    setTimeout(() => setSimPhase('result'), 300);
  }, []);

  const handleSimResult = useCallback(() => {
    setSimPhase('think');
    playThink();
    // Show "Think about what happened" for 1.5s, then show quiz
    setTimeout(() => setSimPhase('quiz'), 1500);
  }, []);

  const handleQuizAnswer = useCallback((idx) => {
    setQuizAnswer(idx);
    playClick();
    const task = currentMultiTask;
    if (!task) return;
    const isCorrect = idx === task.hiddenQuiz.correctIndex;
    setTimeout(() => {
      setSimPhase('feedback');
      if (isCorrect) {
        setTotalMultiUseScore(s => s + task.reward);
        addCarbonCoins(task.reward);
        setConfidenceMsg(getConfidenceMsg());
        setShowRetry(false);
      } else {
        setShowRetry(true);
        setConfidenceMsg(null);
      }
    }, 500);
  }, [currentMultiTask, addCarbonCoins, getConfidenceMsg]);

  const handleMultiUseRetry = useCallback(() => {
    setSimPhase('task');
    setSimSelectedOption(null);
    setQuizAnswer(null);
    setShowRetry(false);
    setConfidenceMsg(null);
    playClick();
  }, []);

  const handleMultiUseNext = useCallback(() => {
    const appId = STORE_APPLIANCES[multiUseAppIdx]?.id;
    const tasks = MULTI_USE_TASKS[appId] || [];

    if (multiUseTaskIdx + 1 < tasks.length) {
      setMultiUseTaskIdx(t => t + 1);
    } else {
      setMultiUseCompleted(prev => ({ ...prev, [appId]: true }));
      if (multiUseAppIdx + 1 < STORE_APPLIANCES.length) {
        setMultiUseAppIdx(a => a + 1);
        setMultiUseTaskIdx(0);
      } else {
        setStage(3);
        setScreen('stage_transition');
      }
    }
    // Reset simulation state
    setSimPhase('task');
    setSimSelectedOption(null);
    setQuizAnswer(null);
    setShowRetry(false);
    setConfidenceMsg(null);
  }, [multiUseAppIdx, multiUseTaskIdx]);

  // ─── Stage 3: Combo Task Handlers ───
  const handleComboSimSelect = useCallback((option) => {
    setComboSimOption(option);
    playClick();
    setTimeout(() => setComboPhase('result'), 300);
  }, []);

  const handleComboResult = useCallback(() => {
    setComboPhase('think');
    playThink();
    setTimeout(() => setComboPhase('quiz'), 1500);
  }, []);

  const handleComboQuizAnswer = useCallback((idx) => {
    setComboQuizAnswer(idx);
    playClick();
    const combo = currentCombo;
    if (!combo) return;
    const isCorrect = idx === combo.hiddenQuiz.correctIndex;
    setTimeout(() => {
      setComboPhase('feedback');
      if (isCorrect) {
        playCombo();
        setComboScore(s => s + combo.reward);
        addCarbonCoins(combo.reward);
        setAccumulatedCO2(prev => Math.max(0, prev + combo.co2Impact));
        setComboRetry(false);
        setConfidenceMsg(getConfidenceMsg());
      } else {
        setAccumulatedCO2(prev => prev + Math.abs(combo.co2Impact));
        setComboRetry(true);
        setConfidenceMsg(null);
      }
    }, 500);
  }, [currentCombo, addCarbonCoins, getConfidenceMsg]);

  const handleComboRetry = useCallback(() => {
    setComboPhase('task');
    setComboSimOption(null);
    setComboQuizAnswer(null);
    setComboRetry(false);
    setConfidenceMsg(null);
    playClick();
  }, []);

  const handleComboNext = useCallback(() => {
    if (comboIdx + 1 < COMBO_TASKS.length) {
      setComboIdx(c => c + 1);
    } else {
      const goal = PROGRESSIVE_GOALS[progressGoalIdx];
      if (goal && accumulatedCO2 <= goal.target) {
        setGoalMet(true);
        if (progressGoalIdx + 1 < PROGRESSIVE_GOALS.length) {
          setProgressGoalIdx(p => p + 1);
          setComboIdx(0);
          setGoalMet(false);
        } else {
          setStage(4);
          setScreen('stage_transition');
        }
      } else {
        setComboIdx(0);
      }
    }
    setComboPhase('task');
    setComboSimOption(null);
    setComboQuizAnswer(null);
    setComboRetry(false);
    setConfidenceMsg(null);
  }, [comboIdx, progressGoalIdx, accumulatedCO2]);

  // ─── Stage 4: Event Handlers ───
  const handleCrisisSimSelect = useCallback((option) => {
    setCrisisSimOption(option);
    playClick();
    setTimeout(() => setCrisisPhase('result'), 300);
  }, []);

  const handleCrisisResult = useCallback(() => {
    setCrisisPhase('think');
    playThink();
    setTimeout(() => setCrisisPhase('quiz'), 1500);
  }, []);

  const handleCrisisQuizAnswer = useCallback((idx) => {
    setCrisisQuizAnswer(idx);
    playClick();
    const evt = currentEvent;
    if (!evt) return;
    const isCorrect = idx === evt.hiddenQuiz.correctIndex;
    setTimeout(() => {
      setCrisisPhase('feedback');
      if (isCorrect) {
        playSuccess();
        setCrisisScore(s => s + evt.reward);
        addCarbonCoins(evt.reward);
        setCrisisRetry(false);
        setConfidenceMsg(getConfidenceMsg());
      } else {
        setTotalConsequences(prev => ({
          co2: prev.co2 + evt.consequence.co2Spike,
          bill: prev.bill + evt.consequence.billSpike,
        }));
        setCrisisRetry(true);
        setConfidenceMsg(null);
      }
    }, 500);
  }, [currentEvent, addCarbonCoins, getConfidenceMsg]);

  const handleCrisisRetry = useCallback(() => {
    setCrisisPhase('event');
    setCrisisSimOption(null);
    setCrisisQuizAnswer(null);
    setCrisisRetry(false);
    setConfidenceMsg(null);
    setEventTimer(12);
    playClick();
  }, []);

  const handleEventNext = useCallback(() => {
    if (eventIdx + 1 < DYNAMIC_EVENTS.length) {
      setEventIdx(e => e + 1);
      setEventTimer(12);
    } else {
      setStage(5);
      setScreen('stage_transition');
    }
    setCrisisPhase('event');
    setCrisisSimOption(null);
    setCrisisQuizAnswer(null);
    setCrisisRetry(false);
    setConfidenceMsg(null);
  }, [eventIdx]);

  // ─── Stage 5: Master Simulation ───
  const handleStartCycle = useCallback(() => {
    setSimTimeIdx(0);
    setSimResults([]);
    setSimRunning(true);
  }, []);

  const handleCycleComplete = useCallback(() => {
    const cycleData = {
      cycle: masterCycle + 1,
      results: [...simResults],
      avgSolar: simResults.length > 0 ? Math.round(simResults.reduce((s, r) => s + r.solarPct, 0) / simResults.length) : 0,
      totalCO2: simResults.reduce((s, r) => s + parseFloat(r.co2), 0),
    };
    setAllCycleResults(prev => [...prev, cycleData]);

    if (masterCycle + 1 < MASTER_CYCLE_GOALS.length) {
      setMasterCycle(c => c + 1);
      setSimTimeIdx(0);
      setSimResults([]);
    } else {
      setScreen('analysis');
    }
  }, [masterCycle, simResults]);

  // Analysis
  const handleAnalysisAnswer = useCallback((idx) => {
    setAnalysisAnswer(idx);
    setAnalysisFeedback(true);
    playClick();
    if (idx === ANALYSIS_QUESTIONS[analysisIdx]?.correctIndex) {
      setAnalysisScore(s => s + 1);
    }
  }, [analysisIdx]);

  const handleAnalysisNext = useCallback(() => {
    if (analysisIdx + 1 < ANALYSIS_QUESTIONS.length) {
      setAnalysisIdx(a => a + 1);
    } else {
      setScreen('dashboard');
    }
    setAnalysisAnswer(null);
    setAnalysisFeedback(false);
  }, [analysisIdx]);

  // Quiz complete
  const handleQuizComplete = useCallback(result => {
    setQuizResult(result);
    setScreen('reward');
    playSuccess();
    completeLevel(5);
    unlockLevel(6);
    const masterAvgSolar = allCycleResults.length > 0
      ? Math.round(allCycleResults.reduce((s, c) => s + c.avgSolar, 0) / allCycleResults.length)
      : 50;
    const stars = calculateL5Stars(
      completed.length,
      (result.score / result.total) * 100,
      integrationScore || comboScore,
      masterAvgSolar,
    );
    addCarbonCoins(LEVEL5_BADGE.coins * stars);
  }, [completed, integrationScore, comboScore, allCycleResults, completeLevel, unlockLevel, addCarbonCoins]);

  const stars = useMemo(() => {
    if (!quizResult) return 1;
    const masterAvgSolar = allCycleResults.length > 0
      ? Math.round(allCycleResults.reduce((s, c) => s + c.avgSolar, 0) / allCycleResults.length)
      : 50;
    return calculateL5Stars(
      completed.length,
      (quizResult.score / quizResult.total) * 100,
      integrationScore || comboScore,
      masterAvgSolar,
    );
  }, [quizResult, completed, integrationScore, comboScore, allCycleResults]);

  // Environment grade for dashboard
  const envGrade = useMemo(() => getEnvironmentGrade(totalSavings.solarPct, totalSavings.co2Saved), [totalSavings]);
  const envData = ENVIRONMENT_FEEDBACK[envGrade];

  // ═══ RENDER ═══
  return (
    <div className="l5-container">

      {/* ══ STAGE PROGRESS BAR ══ */}
      {!['entry', 'reward'].includes(screen) && <StageBar currentStage={stage} />}

      {/* ══ ENTRY SCREEN ══ */}
      {screen === 'entry' && (
        <div className="l5-intro-overlay">
          <div className={`l5-intro-icon ${introReady ? 'visible' : ''}`}>{L5.house}</div>
          <div className={`l5-intro-title ${introReady ? 'visible' : ''}`}>SMART SUSTAINABLE HOME</div>
          <div className={`l5-intro-sub ${introReady ? 'visible' : ''}`}>FULL HOME SIMULATION</div>
          <div className={`l5-intro-role ${introReady ? 'visible' : ''}`}>5 Stages • 40–50 Minutes • Build, Master & Optimize</div>
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

      {/* ══ STAGE TRANSITION SCREEN ══ */}
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
              if (stage === 2) { setScreen('multiuse'); setSimPhase('task'); }
              else if (stage === 3) { setScreen('combo'); setAccumulatedCO2(20); setComboPhase('task'); }
              else if (stage === 4) { setScreen('crisis'); setEventTimer(12); setCrisisPhase('event'); playAlert(); }
              else if (stage === 5) setScreen('master_sim');
            }}>
              Begin Stage {stage} {'\u{2192}'}
            </button>
          </div>
        </div>
      )}

      {/* ══ SMART STORE (Stage 1) ══ */}
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
                  {/* Problem banner (shown for available/unlocked cards) */}
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
                  isEVCharging={isEVCharging} />
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
      {/* ══ STAGE 2: INTERACTIVE SIMULATION TASKS ══ */}
      {/* ══════════════════════════════════════════════════════ */}
      {screen === 'multiuse' && currentMultiApp && currentMultiTask && (
        <div className="l5-multiuse-overlay">
          <div className="l5-multiuse-card">
            {/* Task chain progress */}
            <div className="l5-multiuse-progress">
              <div className="l5-multiuse-app-name">{currentMultiApp.icon} {currentMultiApp.name}</div>
              <div className="l5-multiuse-chain">
                {currentMultiTasks.map((t, i) => (
                  <div key={t.id} className={`l5-chain-dot ${i < multiUseTaskIdx ? 'done' : i === multiUseTaskIdx ? 'active' : ''}`}>
                    {i < multiUseTaskIdx ? L5.check : i + 1}
                  </div>
                ))}
              </div>
              <div className="l5-multiuse-overall">
                Appliance {multiUseAppIdx + 1}/{STORE_APPLIANCES.length} • Task {multiUseTaskIdx + 1}/{currentMultiTasks.length}
              </div>
            </div>

            {/* PHASE: TASK — Interactive Simulation */}
            {simPhase === 'task' && (
              <>
                <div className="l5-multiuse-badge">{L5.play} INTERACTIVE TASK</div>
                <div className="l5-multiuse-title">{currentMultiTask.title}</div>
                <div className="l5-multiuse-instruction">{currentMultiTask.simulation.scenario}</div>
                <div className="l5-sim-options">
                  {currentMultiTask.simulation.options.map(opt => (
                    <button key={opt.id} className="l5-sim-option" onClick={() => handleSimOptionSelect(opt)}>
                      <span className="l5-sim-option-icon">{opt.icon}</span>
                      <span className="l5-sim-option-label">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* PHASE: RESULT — Show simulation meters */}
            {simPhase === 'result' && simSelectedOption && (
              <>
                <div className="l5-multiuse-badge">{L5.chart} SIMULATION RESULT</div>
                <div className="l5-result-header">
                  <span className="l5-result-chosen-icon">{simSelectedOption.icon}</span>
                  <span className="l5-result-chosen-label">{simSelectedOption.label}</span>
                </div>
                <div className="l5-sim-meters">
                  <EnergyMeter label="Power Usage" value={simSelectedOption.watts} max={2000} unit="W" color={simSelectedOption.watts > 500 ? '#ef4444' : simSelectedOption.watts > 200 ? '#f5a623' : '#22c55e'} icon={L5.zap} animate />
                  <EnergyMeter label="CO₂ Emissions" value={simSelectedOption.co2} max={2} unit=" kg/hr" color={simSelectedOption.co2 > 0.5 ? '#ef4444' : simSelectedOption.co2 > 0.1 ? '#f5a623' : '#22c55e'} icon={L5.globe} animate />
                  {simSelectedOption.cost !== undefined && (
                    <EnergyMeter label="Hourly Cost" value={simSelectedOption.cost} max={15} unit=" ₹/hr" color={simSelectedOption.cost > 5 ? '#ef4444' : simSelectedOption.cost > 1 ? '#f5a623' : '#22c55e'} icon={L5.money} animate />
                  )}
                  {simSelectedOption.cooling !== undefined && (
                    <EnergyMeter label="Cooling Effect" value={simSelectedOption.cooling} max={100} unit="%" color="#3b82f6" icon={L5.wind} animate />
                  )}
                  {simSelectedOption.saving !== undefined && (
                    <EnergyMeter label="Annual Saving" value={simSelectedOption.saving} max={1500} unit=" kWh" color="#22c55e" icon={L5.leaf} animate />
                  )}
                  {simSelectedOption.comfort !== undefined && (
                    <EnergyMeter label="Comfort" value={simSelectedOption.comfort} max={100} unit="%" color="#a855f7" icon={L5.star} animate />
                  )}
                </div>
                <button className="l5-usage-next-btn" onClick={handleSimResult}>
                  {L5.think} Reflect on Results {'\u{2192}'}
                </button>
              </>
            )}

            {/* PHASE: THINK — Thinking prompt */}
            {simPhase === 'think' && (
              <div className="l5-think-phase">
                <div className="l5-think-icon">{L5.think}</div>
                <div className="l5-think-text">{currentMultiTask.hiddenQuiz.thinkPrompt}</div>
                <div className="l5-think-dots">
                  <span className="l5-dot-1">.</span>
                  <span className="l5-dot-2">.</span>
                  <span className="l5-dot-3">.</span>
                </div>
              </div>
            )}

            {/* PHASE: QUIZ — Hidden quiz (3 neutral options) */}
            {simPhase === 'quiz' && (
              <>
                <div className="l5-multiuse-badge">{L5.brain} REFLECTION</div>
                <div className="l5-quiz-question">{currentMultiTask.hiddenQuiz.question}</div>
                <div className="l5-sim-options">
                  {currentMultiTask.hiddenQuiz.options.map((opt, i) => (
                    <button key={i}
                      className={`l5-sim-option ${quizAnswer === i ? 'selected' : ''}`}
                      onClick={() => quizAnswer === null && handleQuizAnswer(i)}
                      disabled={quizAnswer !== null}
                    >
                      <span className="l5-sim-option-icon">{L5.play}</span>
                      <span className="l5-sim-option-label">{opt}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* PHASE: FEEDBACK — Narrative feedback */}
            {simPhase === 'feedback' && (
              <div className="l5-usage-feedback">
                <div className="l5-narrative-feedback">
                  <div className="l5-narrative-icon">{L5.speech}</div>
                  <div className="l5-narrative-text">
                    {quizAnswer === currentMultiTask.hiddenQuiz.correctIndex
                      ? currentMultiTask.feedback.correct
                      : currentMultiTask.feedback.wrong
                    }
                  </div>
                </div>

                {confidenceMsg && (
                  <div className="l5-confidence-boost">{L5.sparkle} {confidenceMsg}</div>
                )}

                {quizAnswer === currentMultiTask.hiddenQuiz.correctIndex && (
                  <div className="l5-multiuse-reward">
                    {L5.coin} +{currentMultiTask.reward} coins • {L5.globe} {currentMultiTask.co2Impact} kg CO₂
                  </div>
                )}

                {showRetry ? (
                  <div className="l5-retry-section">
                    <div className="l5-retry-text">{L5.speech} {currentMultiTask.feedback.retry}</div>
                    <button className="l5-retry-btn" onClick={handleMultiUseRetry}>
                      {L5.cycle} Try Again with Better Strategy
                    </button>
                    <button className="l5-skip-btn" onClick={handleMultiUseNext}>
                      Continue Anyway {'\u{2192}'}
                    </button>
                  </div>
                ) : (
                  <button className="l5-usage-next-btn" onClick={handleMultiUseNext}>
                    {multiUseTaskIdx + 1 >= currentMultiTasks.length && multiUseAppIdx + 1 >= STORE_APPLIANCES.length
                      ? `Complete Stage 2 ${'\u{2192}'}`
                      : multiUseTaskIdx + 1 >= currentMultiTasks.length
                        ? `Next Appliance ${'\u{2192}'}`
                        : `Next Task ${'\u{2192}'}`
                    }
                  </button>
                )}
              </div>
            )}

            {/* Score tracker */}
            <div className="l5-multiuse-score">
              {L5.star} Total Score: {totalMultiUseScore} pts
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════ */}
      {/* ══ STAGE 3: COMBO TASKS + PROGRESSIVE GOALS ══ */}
      {/* ══════════════════════════════════════════════════════ */}
      {screen === 'combo' && currentCombo && (
        <div className="l5-combo-overlay">
          {/* Progressive goal banner */}
          <div className="l5-progressive-goal">
            <div className="l5-goal-icon">{PROGRESSIVE_GOALS[progressGoalIdx]?.icon || L5.target}</div>
            <div className="l5-goal-text">{PROGRESSIVE_GOALS[progressGoalIdx]?.label}</div>
            <div className="l5-goal-current">Current CO₂: {accumulatedCO2.toFixed(1)} kg</div>
            <div className="l5-goal-bar">
              <div className="l5-goal-fill" style={{
                width: `${Math.max(0, 100 - (accumulatedCO2 / (PROGRESSIVE_GOALS[progressGoalIdx]?.target || 20)) * 100)}%`,
                background: accumulatedCO2 <= (PROGRESSIVE_GOALS[progressGoalIdx]?.target || 20) ? '#22c55e' : '#ef4444',
              }}></div>
            </div>
          </div>

          <div className="l5-combo-card">
            <div className="l5-combo-badge">{L5.combo} COMBO TASK {comboIdx + 1}/{COMBO_TASKS.length}</div>
            <div className="l5-combo-title">{currentCombo.title}</div>
            <div className="l5-combo-desc">{currentCombo.description}</div>

            {/* Appliances involved */}
            <div className="l5-combo-appliances">
              {currentCombo.appliances.map(id => {
                const a = STORE_APPLIANCE_MAP[id];
                return a ? <span key={id} className="l5-combo-app-tag">{a.icon} {a.name}</span> : null;
              })}
            </div>

            <div className="l5-combo-time">{L5.clock} Time: {SCHEDULE_SLOTS.find(s => s.id === currentCombo.timeOfDay)?.label}</div>

            {/* PHASE: TASK */}
            {comboPhase === 'task' && (
              <>
                <div className="l5-combo-instruction">{currentCombo.simulation.scenario}</div>
                <div className="l5-sim-options">
                  {currentCombo.simulation.options.map(opt => (
                    <button key={opt.id} className="l5-sim-option" onClick={() => handleComboSimSelect(opt)}>
                      <span className="l5-sim-option-icon">{opt.icon}</span>
                      <span className="l5-sim-option-label">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* PHASE: RESULT */}
            {comboPhase === 'result' && comboSimOption && (
              <>
                <div className="l5-result-header">
                  <span className="l5-result-chosen-icon">{comboSimOption.icon}</span>
                  <span className="l5-result-chosen-label">{comboSimOption.label}</span>
                </div>
                <div className="l5-sim-meters">
                  <EnergyMeter label="Total Power" value={comboSimOption.totalW} max={2000} unit="W" color={comboSimOption.totalW > 500 ? '#ef4444' : '#22c55e'} icon={L5.zap} animate />
                  <EnergyMeter label="CO₂/hr" value={comboSimOption.co2} max={2} unit=" kg" color={comboSimOption.co2 > 0.5 ? '#ef4444' : '#22c55e'} icon={L5.globe} animate />
                  {comboSimOption.solarUsed !== undefined && (
                    <EnergyMeter label="Solar Used" value={comboSimOption.solarUsed} max={1920} unit="W" color="#f5a623" icon={L5.sun} animate />
                  )}
                  {comboSimOption.gridW !== undefined && (
                    <EnergyMeter label="Grid Power" value={comboSimOption.gridW} max={5000} unit="W" color={comboSimOption.gridW > 1000 ? '#ef4444' : '#22c55e'} icon={L5.plug} animate />
                  )}
                </div>
                <button className="l5-usage-next-btn" onClick={handleComboResult}>
                  {L5.think} Reflect on Results {'\u{2192}'}
                </button>
              </>
            )}

            {/* PHASE: THINK */}
            {comboPhase === 'think' && (
              <div className="l5-think-phase">
                <div className="l5-think-icon">{L5.think}</div>
                <div className="l5-think-text">{currentCombo.hiddenQuiz.thinkPrompt}</div>
                <div className="l5-think-dots"><span className="l5-dot-1">.</span><span className="l5-dot-2">.</span><span className="l5-dot-3">.</span></div>
              </div>
            )}

            {/* PHASE: QUIZ */}
            {comboPhase === 'quiz' && (
              <>
                <div className="l5-multiuse-badge">{L5.brain} REFLECTION</div>
                <div className="l5-quiz-question">{currentCombo.hiddenQuiz.question}</div>
                <div className="l5-sim-options">
                  {currentCombo.hiddenQuiz.options.map((opt, i) => (
                    <button key={i} className={`l5-sim-option ${comboQuizAnswer === i ? 'selected' : ''}`}
                      onClick={() => comboQuizAnswer === null && handleComboQuizAnswer(i)} disabled={comboQuizAnswer !== null}>
                      <span className="l5-sim-option-icon">{L5.play}</span>
                      <span className="l5-sim-option-label">{opt}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* PHASE: FEEDBACK */}
            {comboPhase === 'feedback' && (
              <div className="l5-usage-feedback">
                <div className="l5-narrative-feedback">
                  <div className="l5-narrative-icon">{L5.speech}</div>
                  <div className="l5-narrative-text">
                    {comboQuizAnswer === currentCombo.hiddenQuiz.correctIndex ? currentCombo.feedback.correct : currentCombo.feedback.wrong}
                  </div>
                </div>
                {confidenceMsg && <div className="l5-confidence-boost">{L5.sparkle} {confidenceMsg}</div>}
                {comboQuizAnswer === currentCombo.hiddenQuiz.correctIndex && (
                  <div className="l5-multiuse-reward">{L5.coin} +{currentCombo.reward} coins • {L5.globe} {currentCombo.co2Impact} kg CO₂</div>
                )}
                {comboRetry ? (
                  <div className="l5-retry-section">
                    <div className="l5-retry-text">{L5.speech} {currentCombo.feedback.retry}</div>
                    <button className="l5-retry-btn" onClick={handleComboRetry}>{L5.cycle} Try Again</button>
                    <button className="l5-skip-btn" onClick={handleComboNext}>Continue {'\u{2192}'}</button>
                  </div>
                ) : (
                  <button className="l5-usage-next-btn" onClick={handleComboNext}>
                    {comboIdx + 1 >= COMBO_TASKS.length ? `Check Goal ${'\u{2192}'}` : `Next Combo ${'\u{2192}'}`}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════ */}
      {/* ══ STAGE 4: CRISIS — DYNAMIC EVENTS ══ */}
      {/* ══════════════════════════════════════════════════════ */}
      {screen === 'crisis' && currentEvent && (
        <div className="l5-crisis-overlay">
          <div className="l5-crisis-card">
            {/* Event header */}
            <div className="l5-crisis-header">
              <div className="l5-crisis-event-icon">{currentEvent.icon}</div>
              <div className="l5-crisis-event-title">{currentEvent.title}</div>
              {crisisPhase === 'event' && (
                <div className={`l5-crisis-timer ${eventTimer <= 3 ? 'urgent' : ''}`}>
                  {L5.clock} {eventTimer}s
                </div>
              )}
            </div>

            <div className="l5-crisis-event-num">Event {eventIdx + 1} / {DYNAMIC_EVENTS.length}</div>
            <div className="l5-crisis-desc">{currentEvent.description}</div>

            {/* PHASE: EVENT — Live simulation task */}
            {crisisPhase === 'event' && (
              <>
                <div className="l5-crisis-question">{currentEvent.simulation.scenario}</div>
                <div className="l5-sim-options">
                  {currentEvent.simulation.options.map(opt => (
                    <button key={opt.id} className="l5-sim-option" onClick={() => handleCrisisSimSelect(opt)}>
                      <span className="l5-sim-option-icon">{opt.icon}</span>
                      <span className="l5-sim-option-label">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* PHASE: RESULT */}
            {crisisPhase === 'result' && crisisSimOption && (
              <>
                <div className="l5-result-header">
                  <span className="l5-result-chosen-icon">{crisisSimOption.icon}</span>
                  <span className="l5-result-chosen-label">{crisisSimOption.label}</span>
                </div>
                <div className="l5-sim-meters">
                  {crisisSimOption.gridW !== undefined && (
                    <EnergyMeter label="Grid Power" value={crisisSimOption.gridW} max={4000} unit="W" color={crisisSimOption.gridW > 1000 ? '#ef4444' : '#22c55e'} icon={L5.zap} animate />
                  )}
                  {crisisSimOption.co2 !== undefined && (
                    <EnergyMeter label="CO₂ Impact" value={crisisSimOption.co2} max={3} unit=" kg/hr" color={crisisSimOption.co2 > 1 ? '#ef4444' : '#22c55e'} icon={L5.globe} animate />
                  )}
                  {crisisSimOption.watts !== undefined && (
                    <EnergyMeter label="Energy Used" value={crisisSimOption.watts} max={2000} unit="W" color={crisisSimOption.watts > 500 ? '#ef4444' : '#22c55e'} icon={L5.bolt} animate />
                  )}
                  {crisisSimOption.avgW !== undefined && (
                    <EnergyMeter label="Avg Load" value={crisisSimOption.avgW} max={500} unit="W" color={crisisSimOption.avgW > 200 ? '#ef4444' : '#22c55e'} icon={L5.meter} animate />
                  )}
                </div>
                <button className="l5-usage-next-btn" onClick={handleCrisisResult}>
                  {L5.think} Reflect on Decision {'\u{2192}'}
                </button>
              </>
            )}

            {/* PHASE: THINK */}
            {crisisPhase === 'think' && (
              <div className="l5-think-phase">
                <div className="l5-think-icon">{L5.think}</div>
                <div className="l5-think-text">{currentEvent.hiddenQuiz.thinkPrompt}</div>
                <div className="l5-think-dots"><span className="l5-dot-1">.</span><span className="l5-dot-2">.</span><span className="l5-dot-3">.</span></div>
              </div>
            )}

            {/* PHASE: QUIZ */}
            {crisisPhase === 'quiz' && (
              <>
                <div className="l5-multiuse-badge">{L5.brain} CRISIS REFLECTION</div>
                <div className="l5-quiz-question">{currentEvent.hiddenQuiz.question}</div>
                <div className="l5-sim-options">
                  {currentEvent.hiddenQuiz.options.map((opt, i) => (
                    <button key={i} className={`l5-sim-option ${crisisQuizAnswer === i ? 'selected' : ''}`}
                      onClick={() => crisisQuizAnswer === null && handleCrisisQuizAnswer(i)} disabled={crisisQuizAnswer !== null}>
                      <span className="l5-sim-option-icon">{L5.play}</span>
                      <span className="l5-sim-option-label">{opt}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* PHASE: FEEDBACK */}
            {crisisPhase === 'feedback' && (
              <div className="l5-usage-feedback">
                <div className="l5-narrative-feedback">
                  <div className="l5-narrative-icon">{L5.speech}</div>
                  <div className="l5-narrative-text">
                    {crisisQuizAnswer === currentEvent.hiddenQuiz.correctIndex ? currentEvent.feedback.correct : currentEvent.feedback.wrong}
                  </div>
                </div>
                {confidenceMsg && <div className="l5-confidence-boost">{L5.sparkle} {confidenceMsg}</div>}
                {crisisQuizAnswer === currentEvent.hiddenQuiz.correctIndex && (
                  <div className="l5-multiuse-reward">{L5.coin} +{currentEvent.reward} coins earned!</div>
                )}
                {crisisRetry ? (
                  <div className="l5-retry-section">
                    <div className="l5-consequence-flash">
                      <div className="l5-consequence-title">{L5.warn} Impact of this decision:</div>
                      <div className="l5-consequence-item">{L5.globe} CO₂ Spike: +{currentEvent.consequence.co2Spike} kg</div>
                      <div className="l5-consequence-item">{L5.money} Bill Impact: +₹{currentEvent.consequence.billSpike}</div>
                    </div>
                    <div className="l5-retry-text">{L5.speech} {currentEvent.feedback.retry}</div>
                    <button className="l5-retry-btn" onClick={handleCrisisRetry}>{L5.cycle} Try Again</button>
                    <button className="l5-skip-btn" onClick={handleEventNext}>Continue {'\u{2192}'}</button>
                  </div>
                ) : (
                  <button className="l5-usage-next-btn" onClick={handleEventNext}>
                    {eventIdx + 1 >= DYNAMIC_EVENTS.length ? `Complete Stage 4 ${'\u{2192}'}` : `Next Event ${'\u{2192}'}`}
                  </button>
                )}
              </div>
            )}

            {/* Running consequences total */}
            {(totalConsequences.co2 > 0 || totalConsequences.bill > 0) && (
              <div className="l5-crisis-totals">
                {L5.warn} Total Impact: {totalConsequences.co2.toFixed(1)} kg CO₂ • ₹{totalConsequences.bill} extra
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════ */}
      {/* ══ STAGE 5: MASTER SIMULATION ══ */}
      {/* ══════════════════════════════════════════════════════ */}
      {screen === 'master_sim' && (
        <div className="l5-master-overlay">
          <div className="l5-master-card">
            {/* Cycle indicator */}
            <div className="l5-cycle-indicator">
              {MASTER_CYCLE_GOALS.map((c, i) => (
                <div key={i} className={`l5-cycle-dot ${i < masterCycle ? 'done' : i === masterCycle ? 'active' : ''}`}>
                  {i < masterCycle ? L5.check : c.icon}
                  <span>{c.name}</span>
                </div>
              ))}
            </div>

            <div className="l5-master-title">
              {L5.clock} Cycle {masterCycle + 1}: {currentCycleGoal?.name || 'Master'}
            </div>
            <div className="l5-master-goal">{currentCycleGoal?.goal}</div>
            <div className="l5-master-target-co2">
              {L5.target} Target: CO₂ below {currentCycleGoal?.targetCO2 || 5} kg
            </div>

            {/* Home appliances bar */}
            <div className="l5-master-home-bar">
              {L5.house} Your Home: {homeAppliances.map(id => STORE_APPLIANCE_MAP[id]?.icon || '').join(' ')}
            </div>

            {!simRunning && simResults.length === 0 && (
              <button className="l5-sim-start-btn" onClick={handleStartCycle}>
                Start Cycle {masterCycle + 1} {'\u{2192}'}
              </button>
            )}

            {(simRunning || simResults.length > 0) && (
              <div className="l5-sim-timeline">
                {SCHEDULE_SLOTS.map((slot, i) => {
                  const result = simResults[i];
                  const isCurrent = simRunning && i === simTimeIdx;
                  return (
                    <div key={slot.id} className={`l5-sim-slot ${result ? 'done' : ''} ${isCurrent ? 'current' : ''}`}>
                      <div className="l5-sim-slot-icon">{slot.icon}</div>
                      <div className="l5-sim-slot-label">{slot.label}</div>
                      {result && (
                        <div className="l5-sim-slot-results">
                          <span className="l5-sim-solar">{L5.sun} {result.solarPct}%</span>
                          <span className="l5-sim-grid">Grid: {result.gridW}W</span>
                          <span className="l5-sim-co2">CO₂: {result.co2} kg</span>
                        </div>
                      )}
                      {isCurrent && <div className="l5-sim-slot-running">Running...</div>}
                    </div>
                  );
                })}
              </div>
            )}

            {simResults.length >= SCHEDULE_SLOTS.length && (
              <div className="l5-sim-summary">
                <div className="l5-sim-summary-title">{L5.chart} Cycle {masterCycle + 1} Summary</div>

                {/* Energy bar graph */}
                <div className="l5-energy-graph">
                  <div className="l5-graph-title">{L5.graph} Energy Timeline</div>
                  <div className="l5-graph-bars">
                    {simResults.map((r, i) => (
                      <div key={i} className="l5-graph-bar-group">
                        <div className="l5-graph-bar-solar" style={{ height: `${Math.min(r.solarPct, 100)}%` }}></div>
                        <div className="l5-graph-bar-grid" style={{ height: `${Math.min(100 - r.solarPct, 100)}%` }}></div>
                        <div className="l5-graph-bar-label">{r.icon}</div>
                      </div>
                    ))}
                  </div>
                  <div className="l5-graph-legend">
                    <span className="l5-legend-solar">{L5.sun} Solar</span>
                    <span className="l5-legend-grid">{L5.zap} Grid</span>
                  </div>
                </div>

                <div className="l5-sim-summary-stats">
                  <div className="l5-sim-stat">
                    <div className="l5-sim-stat-val">{Math.round(simResults.reduce((s, r) => s + r.solarPct, 0) / simResults.length)}%</div>
                    <div className="l5-sim-stat-label">Avg Solar</div>
                  </div>
                  <div className="l5-sim-stat">
                    <div className="l5-sim-stat-val">{simResults.reduce((s, r) => s + parseFloat(r.co2), 0).toFixed(1)} kg</div>
                    <div className="l5-sim-stat-label">Total CO₂</div>
                  </div>
                </div>
                <button className="l5-sim-next-btn" onClick={handleCycleComplete}>
                  {masterCycle + 1 >= MASTER_CYCLE_GOALS.length
                    ? `All Cycles Done — Analysis ${'\u{2192}'}`
                    : `Start Cycle ${masterCycle + 2} ${'\u{2192}'}`
                  }
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══ ENERGY ANALYSIS (after Master Sim) ══ */}
      {screen === 'analysis' && (
        <div className="l5-analysis-overlay">
          <div className="l5-analysis-card">
            <div className="l5-analysis-title">{L5.graph} Energy Analysis</div>
            <div className="l5-analysis-sub">Reflect on your simulation performance</div>

            {/* Cycle comparison */}
            <div className="l5-analysis-cycles">
              {allCycleResults.map((c, i) => (
                <div key={i} className="l5-analysis-cycle-row">
                  <span className="l5-analysis-cycle-name">{MASTER_CYCLE_GOALS[i]?.icon} Cycle {c.cycle}</span>
                  <span className="l5-analysis-cycle-solar">{L5.sun} {c.avgSolar}%</span>
                  <span className="l5-analysis-cycle-co2">{L5.globe} {c.totalCO2.toFixed(1)} kg</span>
                </div>
              ))}
            </div>

            {/* Analysis question (narrative feedback, no correct/wrong indicators) */}
            {analysisIdx < ANALYSIS_QUESTIONS.length && (
              <div className="l5-analysis-question-box">
                <div className="l5-analysis-q-badge">{L5.brain} Reflection {analysisIdx + 1}/{ANALYSIS_QUESTIONS.length}</div>
                <div className="l5-analysis-q-text">{ANALYSIS_QUESTIONS[analysisIdx].question}</div>

                {!analysisFeedback ? (
                  <div className="l5-sim-options">
                    {ANALYSIS_QUESTIONS[analysisIdx].options.map((opt, i) => (
                      <button key={i} className="l5-sim-option" onClick={() => handleAnalysisAnswer(i)}>
                        <span className="l5-sim-option-icon">{L5.play}</span>
                        <span className="l5-sim-option-label">{opt}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="l5-usage-feedback">
                    <div className="l5-narrative-feedback">
                      <div className="l5-narrative-icon">{L5.speech}</div>
                      <div className="l5-narrative-text">
                        {analysisAnswer === ANALYSIS_QUESTIONS[analysisIdx].correctIndex
                          ? ANALYSIS_QUESTIONS[analysisIdx].feedback.correct
                          : ANALYSIS_QUESTIONS[analysisIdx].feedback.wrong
                        }
                      </div>
                    </div>
                    <button className="l5-usage-next-btn" onClick={handleAnalysisNext}>
                      {analysisIdx + 1 >= ANALYSIS_QUESTIONS.length ? `View Dashboard ${'\u{2192}'}` : `Next ${'\u{2192}'}`}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══ FINAL DASHBOARD (UPGRADED) ══ */}
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

            {/* Key Solar & Emissions Callouts */}
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

            {/* Simulation performance */}
            {allCycleResults.length > 0 && (
              <div className="l5-dash-sim-summary">
                <div className="l5-dash-breakdown-title">{L5.cycle} Simulation Performance</div>
                {allCycleResults.map((c, i) => (
                  <div key={i} className="l5-dash-breakdown-row">
                    <span>{MASTER_CYCLE_GOALS[i]?.icon} Cycle {c.cycle}: {MASTER_CYCLE_GOALS[i]?.name}</span>
                    <span className="l5-dash-save-pct">{c.avgSolar}% solar</span>
                    <span className="l5-dash-save-co2">{c.totalCO2.toFixed(1)} kg</span>
                  </div>
                ))}
              </div>
            )}

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

            {/* Crisis consequences (if any) */}
            {totalConsequences.co2 > 0 && (
              <div className="l5-dash-consequences">
                {L5.warn} Crisis Impact: +{totalConsequences.co2.toFixed(1)} kg CO₂, +₹{totalConsequences.bill} (from suboptimal decisions)
              </div>
            )}

            <button className="l5-dash-quiz-btn" onClick={() => setScreen('quiz')}>
              Take Final Reflection Quiz {'\u{2192}'}
            </button>
          </div>
        </div>
      )}

      {/* ══ QUIZ ══ */}
      {screen === 'quiz' && <Level5Quiz onComplete={handleQuizComplete} />}

      {/* ══ REWARD ══ */}
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
              <div className="l5-reward-stat"><div className="l5-reward-stat-label">Upgrades</div><div className="l5-reward-stat-value">{completed.length}/{STORE_APPLIANCES.length}</div></div>
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
