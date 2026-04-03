import React, { useState, useCallback, useRef, useEffect, useMemo, Suspense } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import House from '../House';
import Player, { cameraMode, playerState } from '../Player';
import Level2Appliances, { getProximityLevels } from '../level2/Level2Appliances';
import Level3Environment from './Level3Environment';
import { APPLIANCE_POSITIONS } from '../applianceData';
import { useGame } from '../../context/GameContext';
import { getTranslation } from '../../translations';
import ArjunCharacter from '../../components/ArjunCharacter';
import {
  L2_APPLIANCE_IDS, L2_APPLIANCE_MAP, USAGE_HOURS,
  calculateBill, calculateCO2, MAX_POSSIBLE_WATTS,
  getDamageLevel, getDamageTier,
  LEARNING_TASKS, L3_QUIZ_QUESTIONS, calculateL3Stars,
  LEVEL3_BADGE, SHOCK_DATA, ENTRY_DIALOGUE, END_DIALOGUE,
  getDamageAttribution, getApplianceCO2Monthly, getApplianceCO2Annual,
  BILL_MILESTONES, TREES_PER_CO2, L3_ICONS, ROOM_ICONS,
  APPLIANCE_LESSONS, REAL_LIFE_ACTIONS,
} from './level3Data';
import Level3Quiz from './Level3Quiz';
import './Level3.css';

// ═══ AUDIO ═══
let audioCtx = null;
function getAudioCtx() { if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)(); return audioCtx; }
function playSound(freq, type, dur, vol = 0.1) {
  try { const c = getAudioCtx(), o = c.createOscillator(), g = c.createGain(); o.connect(g); g.connect(c.destination); o.type = type; o.frequency.setValueAtTime(freq, c.currentTime); g.gain.setValueAtTime(vol, c.currentTime); g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur); o.start(c.currentTime); o.stop(c.currentTime + dur); } catch (e) {}
}
function playToggleOnSound() { playSound(800, 'sine', 0.1, 0.12); }
function playToggleOffSound() { try { const c = getAudioCtx(), o = c.createOscillator(), g = c.createGain(); o.connect(g); g.connect(c.destination); o.type = 'sine'; o.frequency.setValueAtTime(400, c.currentTime); o.frequency.linearRampToValueAtTime(150, c.currentTime + 0.25); g.gain.setValueAtTime(0.1, c.currentTime); g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.35); o.start(c.currentTime); o.stop(c.currentTime + 0.35); } catch (e) {} }
function playRumbleSound() { try { const c = getAudioCtx(), o = c.createOscillator(), g = c.createGain(); o.connect(g); g.connect(c.destination); o.type = 'sine'; o.frequency.setValueAtTime(50, c.currentTime); o.frequency.linearRampToValueAtTime(30, c.currentTime + 1); g.gain.setValueAtTime(0.2, c.currentTime); g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 1.5); o.start(c.currentTime); o.stop(c.currentTime + 1.5); } catch (e) {} }
function playAlarmSound() { [0, 0.3, 0.6].forEach(t => { try { const c = getAudioCtx(), o = c.createOscillator(), g = c.createGain(); o.connect(g); g.connect(c.destination); o.type = 'sawtooth'; o.frequency.setValueAtTime(400, c.currentTime + t); o.frequency.linearRampToValueAtTime(600, c.currentTime + t + 0.15); g.gain.setValueAtTime(0.08, c.currentTime + t); g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + t + 0.3); o.start(c.currentTime + t); o.stop(c.currentTime + t + 0.3); } catch (e) {} }); }
function playSuccessSound() { [523, 659, 784].forEach((f, i) => playSound(f, 'triangle', 0.3, 0.1)); }
function playFailSound() { playSound(200, 'sawtooth', 0.6, 0.1); }

// ═══ 3D HELPERS ═══
function CameraRef({ cameraRef }) { const { camera } = useThree(); useEffect(() => { cameraRef.current = camera; }, [camera, cameraRef]); return null; }

function SceneContent({ applianceStates, nearestAppliance, onRoomChange, onNearestChange, onInteract, cameraRef, proximityLevels, damageLevel }) {
  return (<>
    <CameraRef cameraRef={cameraRef} />
    <Level3Environment damageLevel={damageLevel} />
    <House />
    <Level2Appliances applianceStates={applianceStates} nearestAppliance={nearestAppliance} taskTargetIds={null} proximityLevels={proximityLevels} />
    <Player onRoomChange={onRoomChange} onNearestApplianceChange={onNearestChange} onInteract={onInteract} applianceIdList={L2_APPLIANCE_IDS} />
  </>);
}

function AnimatedCounter({ value, prefix = '', suffix = '', decimals = 0 }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => { let cur = display; const step = () => { const d = value - cur; if (Math.abs(d) < (decimals > 0 ? 0.01 : 1)) { setDisplay(value); return; } cur += d * 0.12; setDisplay(decimals > 0 ? Math.round(cur * 100) / 100 : Math.round(cur)); requestAnimationFrame(step); }; requestAnimationFrame(step); }, [value]);
  return <span>{prefix}{decimals > 0 ? display.toFixed(decimals) : display.toLocaleString()}{suffix}</span>;
}

function FloatingText({ text, type, id, onDone }) {
  useEffect(() => { const t = setTimeout(() => onDone(id), 2000); return () => clearTimeout(t); }, [id, onDone]);
  return <div className={`l3-floating-text ${type}`}>{text}</div>;
}

// ═══ CONTROLS HELP ═══
function ControlsHelp() {
  const [show, setShow] = useState(false);
  useEffect(() => { setShow(true); const t = setTimeout(() => setShow(false), 3000); return () => clearTimeout(t); }, []);
  useEffect(() => { if (!show) return; const h = e => { if (e.key === 'Escape') setShow(false); }; window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h); }, [show]);
  return (<>
    <button className="l3-help-btn" onClick={() => setShow(true)}>?</button>
    {show && <div className="l3-controls-overlay" onClick={() => setShow(false)}><div className="l3-controls-card" onClick={e => e.stopPropagation()}>
      <div className="l3-controls-title">{L3_ICONS.grad} Controls</div>
      {[['W/\u2191','Forward'],['S/\u2193','Backward'],['A/\u2190','Left'],['D/\u2192','Right'],['E','Toggle']].map(([k,l]) => <div key={k} className="l3-ctrl-row"><span className="l3-ctrl-keys"><span className="l3-key">{k}</span></span><span>{l}</span></div>)}
      <button className="l3-controls-got-it" onClick={() => setShow(false)}>Got it!</button>
    </div></div>}
  </>);
}

// ═══════════════════════════════════════════════════════════
//  MAIN LEVEL 3
// ═══════════════════════════════════════════════════════════
export default function Level3() {
  const navigate = useNavigate();
  const { addCarbonCoins, completeLevel, unlockLevel, selectedLanguage, carbonCoins } = useGame();
  const t = getTranslation(selectedLanguage);
  const cameraRef = useRef(null);

  // ─── Phases ───
  const [phase, setPhase] = useState('intro');
  const [introStep, setIntroStep] = useState(0);

  // ─── Appliance States ───
  const [applianceStates, setApplianceStates] = useState(() => {
    const s = {}; L2_APPLIANCE_IDS.forEach(id => { s[id] = false; }); return s;
  });
  const [totalWatts, setTotalWatts] = useState(0);
  const [onCount, setOnCount] = useState(0);
  const [toggledSet, setToggledSet] = useState(new Set());

  // ─── Damage ───
  const [peakDamage, setPeakDamage] = useState(0);
  const [screenShake, setScreenShake] = useState(false);
  const [isCritical, setIsCritical] = useState(false);
  const [criticalShown, setCriticalShown] = useState(false);

  // ─── Learning System ───
  const [learningPopup, setLearningPopup] = useState(null);
  const [learnedLessons, setLearnedLessons] = useState([]);
  const learningTimerRef = useRef(null);

  // ─── Task System ───
  const [currentTaskIdx, setCurrentTaskIdx] = useState(0);
  const [taskPhase, setTaskPhase] = useState('objective'); // objective | active | learning
  const [tasksPassed, setTasksPassed] = useState(0);
  const [taskWarning, setTaskWarning] = useState(null);
  const [taskQuizAnswer, setTaskQuizAnswer] = useState(null);
  const [missionTimer, setMissionTimer] = useState(0);
  const [missionActive, setMissionActive] = useState(false);
  const [beforeStats, setBeforeStats] = useState(null);

  // ─── Formula ───
  const [formulaAnswer, setFormulaAnswer] = useState(null);

  // ─── Quiz & Reward ───
  const [quizResult, setQuizResult] = useState(null);
  const [stars, setStars] = useState(0);

  // ─── Story sequence ───
  const [storyStep, setStoryStep] = useState(0);
  const [storyVisible, setStoryVisible] = useState(true);
  const [sleepPhase, setSleepPhase] = useState(0);
  const [comicPopState, setComicPopState] = useState('hidden'); // hidden | visible | fade-out
  const [storyBgDark, setStoryBgDark] = useState(false);

  // ─── UI ───
  const [currentRoom, setCurrentRoom] = useState('Living Room');
  const [nearestAppliance, setNearestAppliance] = useState(null);
  const [proximityLevels, setProximityLevels] = useState({});
  const [floatingTexts, setFloatingTexts] = useState([]);
  const floatingIdRef = useRef(0);

  // ═══ COMPUTED ═══
  useEffect(() => {
    let w = 0, c = 0;
    L2_APPLIANCE_IDS.forEach(id => { if (applianceStates[id]) { w += L2_APPLIANCE_MAP[id].wattage; c++; } });
    setTotalWatts(w); setOnCount(c);
  }, [applianceStates]);

  const damageLevel = useMemo(() => getDamageLevel(totalWatts), [totalWatts]);
  const damageTier = useMemo(() => getDamageTier(damageLevel), [damageLevel]);

  const billData = useMemo(() => {
    let kwh = 0;
    L2_APPLIANCE_IDS.forEach(id => { if (applianceStates[id]) { kwh += (L2_APPLIANCE_MAP[id].wattage * (USAGE_HOURS[id] || 4) * 30) / 1000; } });
    return calculateBill(kwh);
  }, [applianceStates]);

  const co2Data = useMemo(() => {
    const k = billData.totalUnits;
    return { kwhMonth: k, co2Month: calculateCO2(k), co2Year: calculateCO2(k * 12) };
  }, [billData]);

  const damageAttribution = useMemo(() => getDamageAttribution(applianceStates), [applianceStates]);
  const billMilestone = useMemo(() => { for (let i = BILL_MILESTONES.length - 1; i >= 0; i--) { if (billData.totalCost >= BILL_MILESTONES[i].amount) return BILL_MILESTONES[i]; } return null; }, [billData.totalCost]);
  const carbonBarPct = Math.min((co2Data.co2Month / 300) * 100, 100);

  useEffect(() => { if (damageLevel > peakDamage) setPeakDamage(damageLevel); }, [damageLevel, peakDamage]);

  // ─── Critical trigger ───
  useEffect(() => {
    if (damageLevel >= 0.75 && !criticalShown && (phase === 'explore' || phase === 'tasks')) {
      setIsCritical(true); setCriticalShown(true); playAlarmSound(); playRumbleSound();
      setScreenShake(true); setTimeout(() => setScreenShake(false), 2000);
      cameraMode.cinematic = true; cameraMode.targetX = -5; cameraMode.targetY = 2; cameraMode.targetZ = 14;
    }
  }, [damageLevel, criticalShown, phase]);

  // ─── Intro animation ───
  useEffect(() => {
    if (phase !== 'intro') return;
    const timers = [setTimeout(() => setIntroStep(1), 600), setTimeout(() => { setIntroStep(2); playRumbleSound(); }, 1800), setTimeout(() => setIntroStep(3), 3000), setTimeout(() => setIntroStep(4), 4200)];
    return () => timers.forEach(clearTimeout);
  }, [phase]);

  // ─── Mission timer ───
  useEffect(() => {
    if (!missionActive || missionTimer <= 0) return;
    const iv = setInterval(() => { setMissionTimer(p => { if (p <= 1) { clearInterval(iv); handleTaskFail(); return 0; } return p - 1; }); }, 1000);
    return () => clearInterval(iv);
  }, [missionActive]);

  // ─── Check task success for active tasks ───
  useEffect(() => {
    if (phase !== 'tasks' || taskPhase !== 'active') return;
    const task = LEARNING_TASKS[currentTaskIdx];
    if (!task || task.type === 'quiz') return;
    if (task.successCheck && task.successCheck(applianceStates)) {
      handleTaskSuccess();
    }
  }, [applianceStates, phase, taskPhase, currentTaskIdx]);

  // ═══ HANDLERS ═══
  const addFloating = useCallback((text, type) => {
    const id = floatingIdRef.current++;
    setFloatingTexts(prev => [...prev, { id, text, type }]);
  }, []);
  const removeFloating = useCallback(id => setFloatingTexts(prev => prev.filter(t => t.id !== id)), []);

  const addLesson = useCallback((lesson) => {
    setLearnedLessons(prev => prev.includes(lesson) ? prev : [...prev, lesson]);
  }, []);

  // ─── Show learning popup for appliance ───
  const showLearningForAppliance = useCallback((id) => {
    const lesson = APPLIANCE_LESSONS[id];
    const appliance = L2_APPLIANCE_MAP[id];
    if (!lesson || !appliance) return;
    if (learningTimerRef.current) clearTimeout(learningTimerRef.current);
    setLearningPopup({ id, name: appliance.name, icon: appliance.icon, wattage: appliance.wattage, ...lesson });
    addLesson(lesson.lesson);
    learningTimerRef.current = setTimeout(() => setLearningPopup(null), 6000);
  }, [addLesson]);

  // ─── Toggle appliance ───
  const handleInteract = useCallback((applianceId) => {
    if (!L2_APPLIANCE_IDS.includes(applianceId) || isCritical) return;
    const task = phase === 'tasks' ? LEARNING_TASKS[currentTaskIdx] : null;

    setApplianceStates(prev => {
      const newState = !prev[applianceId];
      const a = L2_APPLIANCE_MAP[applianceId];

      if (newState) {
        playToggleOnSound();
        addFloating(`+${a.wattage}W \u{2191} CO\u{2082}`, 'damage');
        // Check for task fail condition (e.g., turning on AC in smart cooling task)
        if (task && task.failCheck && task.failCheck({ ...prev, [applianceId]: true })) {
          setTaskWarning(task.failWarning || 'Wrong choice!');
          setTimeout(() => setTaskWarning(null), 2500);
        }
      } else {
        playToggleOffSound();
        addFloating(`-${a.wattage}W saved`, 'save');
      }

      // Show learning popup when turning ON (during explore or tasks)
      if (newState && (phase === 'explore' || phase === 'tasks')) {
        showLearningForAppliance(applianceId);
      }

      return { ...prev, [applianceId]: newState };
    });
    setToggledSet(prev => { const n = new Set(prev); n.add(applianceId); return n; });
  }, [addFloating, isCritical, phase, currentTaskIdx, showLearningForAppliance]);

  // ─── Task handlers ───
  const handleTaskSuccess = useCallback(() => {
    setMissionActive(false);
    setTasksPassed(p => p + 1);
    playSuccessSound();
    setTaskPhase('learning');
    const task = LEARNING_TASKS[currentTaskIdx];
    if (task) task.learnings.forEach(l => addLesson(l));
  }, [currentTaskIdx, addLesson]);

  const handleTaskFail = useCallback(() => {
    setMissionActive(false);
    playFailSound();
    setScreenShake(true); setTimeout(() => setScreenShake(false), 1000);
    setTaskPhase('learning');
    const task = LEARNING_TASKS[currentTaskIdx];
    if (task) task.learnings.forEach(l => addLesson(l));
  }, [currentTaskIdx, addLesson]);

  const startTask = useCallback((idx) => {
    const task = LEARNING_TASKS[idx];
    if (!task) return;
    setTaskQuizAnswer(null);
    if (task.type === 'quiz') {
      setTaskPhase('active');
      return;
    }
    // Setup appliances
    const newStates = {};
    L2_APPLIANCE_IDS.forEach(id => { newStates[id] = false; });
    if (task.setupAppliances) {
      Object.entries(task.setupAppliances).forEach(([id, val]) => { newStates[id] = val; });
    }
    setApplianceStates(newStates);
    setTaskPhase('active');
    if (task.type === 'timed') {
      setMissionTimer(task.timeLimit);
      setMissionActive(true);
      playAlarmSound();
    }
  }, []);

  const advanceTask = useCallback(() => {
    const next = currentTaskIdx + 1;
    if (next >= LEARNING_TASKS.length) {
      // Capture "after" stats and move to before-after
      setPhase('before-after');
    } else {
      setCurrentTaskIdx(next);
      setTaskPhase('objective');
    }
  }, [currentTaskIdx]);

  const dismissCritical = useCallback(() => { setIsCritical(false); cameraMode.cinematic = false; }, []);

  const handleQuizComplete = useCallback((result) => {
    setQuizResult(result);
    const s = calculateL3Stars(tasksPassed, LEARNING_TASKS.length, result.score, result.total);
    setStars(s); setPhase('reward');
  }, [tasksPassed]);

  const handleContinue = useCallback(() => {
    addCarbonCoins(LEVEL3_BADGE.coins + stars * 15 + tasksPassed * 10);
    completeLevel(3); unlockLevel(4);
    setStoryStep(1); setStoryVisible(true); setPhase('story');
  }, [stars, tasksPassed, addCarbonCoins, completeLevel, unlockLevel]);

  // ─── Story step advance ───
  const advanceStory = useCallback(() => {
    setStoryVisible(false);
    setTimeout(() => {
      setStoryStep(prev => prev + 1);
      setStoryVisible(true);
      setComicPopState('hidden');
      setSleepPhase(0);
      setStoryBgDark(false);
    }, 400);
  }, []);

  // ─── Step 3: Comic pop timing ───
  useEffect(() => {
    if (phase !== 'story' || storyStep !== 3 || !storyVisible) return;
    const t1 = setTimeout(() => setComicPopState('visible'), 500);
    const t2 = setTimeout(() => setComicPopState('fade-out'), 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [phase, storyStep, storyVisible]);

  // ─── Step 4: Falling Asleep auto-advance ───
  useEffect(() => {
    if (phase !== 'story' || storyStep !== 4 || !storyVisible) return;
    const timers = [
      setTimeout(() => setSleepPhase(1), 1000),   // start fading character
      setTimeout(() => setStoryBgDark(true), 2000), // darken background
      setTimeout(() => setSleepPhase(2), 3000),    // show text
      setTimeout(() => setSleepPhase(3), 5000),    // fade out text
      setTimeout(() => {
        setStoryVisible(false);
        setTimeout(() => {
          setStoryStep(5);
          setStoryVisible(true);
          setStoryBgDark(false);
        }, 400);
      }, 6000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [phase, storyStep, storyVisible]);

  const handleRoomChange = useCallback(r => setCurrentRoom(r), []);
  const handleNearestChange = useCallback(id => { setNearestAppliance(id); setProximityLevels(getProximityLevels(playerState.x, playerState.z)); }, []);

  const canContinueExplore = toggledSet.size >= 4;

  // ═══ RENDER: INTRO ═══
  if (phase === 'intro') {
    return (<div className="l3-container"><div className="l3-intro-overlay">
      <div className="l3-intro-bg" />
      {introStep >= 1 && <div className="l3-intro-flicker" />}
      <div className={`l3-intro-icon ${introStep >= 1 ? 'visible' : ''}`}>{L3_ICONS.fire}</div>
      <h1 className={`l3-intro-title ${introStep >= 2 ? 'visible' : ''}`}>THE CARBON CRISIS</h1>
      <div className={`l3-intro-subtitle ${introStep >= 2 ? 'visible' : ''}`}>Level 3</div>
      <div className={`l3-intro-dialogue ${introStep >= 3 ? 'visible' : ''}`}>
        <div className="l3-intro-avatar">{'\u{1F9D1}\u{200D}\u{1F393}'}</div>
        <p className="l3-intro-quote">"{ENTRY_DIALOGUE.join(' ')}"</p>
      </div>
      <button className={`l3-intro-start-btn ${introStep >= 4 ? 'visible' : ''}`} onClick={() => setPhase('explore')}>Begin Level 3 {'\u{2192}'}</button>
    </div></div>);
  }

  // ═══ RENDER: QUIZ ═══
  if (phase === 'quiz') return <div className="l3-container"><Level3Quiz onComplete={handleQuizComplete} /></div>;

  // ═══ RENDER: REWARD ═══
  if (phase === 'reward' && quizResult) {
    const coins = LEVEL3_BADGE.coins + stars * 15 + tasksPassed * 10;
    return (<div className="l3-container"><div className="l3-reward-overlay"><div className="l3-reward-card">
      <div className="l3-reward-badge">{LEVEL3_BADGE.icon}</div>
      <div className="l3-reward-title">{LEVEL3_BADGE.title}</div>
      <div className="l3-reward-subtitle">{LEVEL3_BADGE.description}</div>
      <div className="l3-reward-stars">{[1,2,3].map(s => <span key={s} className={`l3-reward-star ${s <= stars ? 'earned' : 'empty'}`} style={{animationDelay:`${s*0.3}s`}}>{L3_ICONS.star}</span>)}</div>
      <div className="l3-reward-stats">
        <div className="l3-reward-stat"><div className="l3-reward-stat-label">Tasks Passed</div><div className="l3-reward-stat-value">{tasksPassed}/{LEARNING_TASKS.length}</div></div>
        <div className="l3-reward-stat"><div className="l3-reward-stat-label">Quiz Score</div><div className="l3-reward-stat-value">{quizResult.score}/{quizResult.total}</div></div>
      </div>
      <div className="l3-end-dialogue">{END_DIALOGUE.map((l, i) => <div key={i} className="l3-end-line" style={{animationDelay:`${i*1.2}s`}}>"{l}"</div>)}</div>
      <div style={{marginTop:'10px',padding:'10px',background:'rgba(255,68,0,0.06)',borderRadius:'8px',fontSize:'14px',color:'#ffccaa',textAlign:'center',fontWeight:600}}>
        {L3_ICONS.bulb} "Your choices directly affect the environment. Smart usage reduces damage."
      </div>
      <div className="l3-reward-coins"><span>{L3_ICONS.coin}</span><span>+{coins} Carbon Coins</span></div>
      <button className="l3-reward-btn" onClick={handleContinue}>{t?.level3Story?.returnToBase || 'Return to Base →'}</button>
    </div></div></div>);
  }

  // ═══ RENDER: HOOK (L4 preview — now reached from story step 5) ═══
  if (phase === 'hook') return (<div className="l3-container"><div className="l3-hook-overlay">
    <div className="l3-hook-icon">{L3_ICONS.sun}</div>
    <div className="l3-hook-title">LEVEL 4</div>
    <div className="l3-hook-subtitle">THE SOLUTION {'\u{2014}'} SOLAR ENERGY {L3_ICONS.sun}</div>
    <button className="l3-hook-btn" onClick={() => navigate('/hub')}>Return to Hub {'\u{2192}'}</button>
  </div></div>);

  // ═══ RENDER: POST-QUIZ STORY SEQUENCE ═══
  if (phase === 'story') {
    const s = t?.level3Story || {};
    const ap = s.appliances || {};
    const applianceList = ['ac', 'fans', 'heater', 'fridge', 'lights'];
    const coins = LEVEL3_BADGE.coins + stars * 15 + tasksPassed * 10;
    const starPositions = [
      { top: '15%', left: '20%' }, { top: '25%', left: '75%' },
      { top: '60%', left: '10%' }, { top: '70%', left: '85%' },
    ];

    return (
      <div className={`l3-container l3-story-overlay ${storyBgDark ? 'l3-story-bg-dark' : 'l3-story-bg-normal'}`}>

        {/* ─── STEP 1: The Realization ─── */}
        {storyStep === 1 && (
          <div className={`l3-story-step ${storyVisible ? 'visible' : ''}`}>
            <div className="l3-story-cards-row">
              {/* Energy Card */}
              <div className="l3-story-card energy">
                <div className="l3-story-card-header">{s.energyUsed || '⚡ Energy Used'}</div>
                {applianceList.map(key => (
                  <div key={key} className="l3-story-card-item">
                    {ap[key]?.name || key} — {ap[key]?.kwh || ''}
                  </div>
                ))}
              </div>
              {/* CO₂ Card */}
              <div className="l3-story-card co2">
                <div className="l3-story-card-header">{s.co2Produced || '🌍 CO₂ Produced'}</div>
                {applianceList.map(key => (
                  <div key={key} className="l3-story-card-item">
                    {ap[key]?.name || key} — {ap[key]?.co2 || ''}
                  </div>
                ))}
              </div>
            </div>
            <div className="l3-story-total l3-story-total-pulse">
              {s.totalCo2 || 'Total: 4,088 kg CO₂ per year'}
            </div>
            <div style={{ marginBottom: '16px' }}>
              <ArjunCharacter mood="shocked" size={80} />
            </div>
            <button className="l3-story-btn" onClick={advanceStory}>
              {s.next || 'Next →'}
            </button>
          </div>
        )}

        {/* ─── STEP 2: The Weight of It ─── */}
        {storyStep === 2 && (
          <div className={`l3-story-step ${storyVisible ? 'visible' : ''}`}>
            <div className="l3-story-thought-container">
              <div className={`l3-story-thought-bubble ${storyVisible ? 'visible' : ''}`}>
                {s.thought1 || "I know the problem now. My home produces 4.1 tonnes of CO₂ every year. That's the weight of a small car... just from electricity."}
              </div>
              <ArjunCharacter mood="shocked" size={120} />
            </div>
            <button className="l3-story-btn" style={{ marginTop: '24px' }} onClick={advanceStory}>
              {s.next || 'Next →'}
            </button>
          </div>
        )}

        {/* ─── STEP 3: The Big Question ─── */}
        {storyStep === 3 && (
          <div className={`l3-story-step ${storyVisible ? 'visible' : ''}`}>
            {/* Comic pop */}
            <div className={`l3-story-comic-pop ${comicPopState}`}>
              {s.comicPop || 'HMMMM...'}
            </div>
            <div className="l3-story-thought-container">
              <div className={`l3-story-thought-bubble ${storyVisible ? 'visible' : ''}`}>
                {s.thought2 || "I can switch off appliances. I can buy efficient ones. But is that enough? There has to be a BIGGER solution..."}
              </div>
              <ArjunCharacter mood="thinking" size={120} />
            </div>
            <button className="l3-story-btn" style={{ marginTop: '24px' }} onClick={advanceStory}>
              {s.next || 'Next →'}
            </button>
          </div>
        )}

        {/* ─── STEP 4: Falling Asleep (auto-advance) ─── */}
        {storyStep === 4 && (
          <div className={`l3-story-step ${storyVisible ? 'visible' : ''}`}>
            {/* Stars */}
            {starPositions.map((pos, i) => (
              <div
                key={i}
                className={`l3-story-star ${sleepPhase >= 1 ? 'visible' : ''}`}
                style={{ top: pos.top, left: pos.left }}
              />
            ))}
            {/* Character fading */}
            <div className="l3-story-sleep-character" style={{ opacity: sleepPhase >= 1 ? 0 : 1 }}>
              <ArjunCharacter mood="thinking" size={120} />
            </div>
            {/* Sleep text */}
            <div className={`l3-story-sleep-text ${sleepPhase >= 2 ? (sleepPhase >= 3 ? 'fade-out' : 'visible') : ''}`}>
              {s.sleepText || "That night, Arjun couldn't stop thinking..."}
            </div>
          </div>
        )}

        {/* ─── STEP 5: Level Complete ─── */}
        {storyStep === 5 && (
          <div className={`l3-story-step ${storyVisible ? 'visible' : ''}`}>
            {/* Subtle particles */}
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="l3-story-particle"
                style={{
                  left: `${10 + Math.random() * 80}%`,
                  top: `${60 + Math.random() * 30}%`,
                  backgroundColor: i % 2 === 0 ? '#22c55e' : '#f59e0b',
                  animation: `l3-story-particle-float ${4 + Math.random() * 4}s ease-in-out ${Math.random() * 3}s infinite`,
                }}
              />
            ))}
            <div className="l3-story-complete-title">
              {s.levelComplete || 'Level 3 Complete'}
            </div>
            <div className="l3-story-complete-badge">
              {LEVEL3_BADGE.icon}
            </div>
            <div className="l3-story-complete-coins">
              <span>{L3_ICONS.coin}</span>
              <span>Carbon Coins: {carbonCoins}</span>
            </div>
            <div className="l3-story-complete-hint">
              {s.dreamHint || 'Something awaits in your dreams...'}
            </div>
            <div className="l3-story-complete-btn">
              <button className="l3-story-btn" onClick={() => navigate('/hub')}>
                {s.returnToBase || 'Return to Base →'}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ═══ RENDER: DAMAGE GRAPH ═══
  if (phase === 'damage-graph') {
    const all = L2_APPLIANCE_IDS.map(id => ({ ...L2_APPLIANCE_MAP[id], co2Annual: getApplianceCO2Annual(id) })).sort((a, b) => b.co2Annual - a.co2Annual);
    const mx = Math.max(...all.map(a => a.co2Annual), 1);
    return (<div className="l3-container"><div className="l3-modal-overlay"><div className="l3-modal-card">
      <div className="l3-modal-title">{L3_ICONS.chart} Appliance vs CO{'\u{2082}'} Impact</div>
      <p style={{fontSize:'13px',color:'#999',marginBottom:'14px'}}>Annual CO{'\u{2082}'} emissions per appliance:</p>
      {all.map((a, i) => { const c = a.co2Annual > 500 ? '#ef4444' : a.co2Annual > 100 ? '#f59e0b' : '#22c55e'; return (
        <div key={a.id} className="l3-graph-row" style={{animationDelay:`${i*0.06}s`}}>
          <div className="l3-graph-label">{a.icon} {a.name}</div>
          <div className="l3-graph-bar-outer"><div className="l3-graph-bar-fill" style={{width:`${(a.co2Annual/mx)*100}%`,backgroundColor:c}} /></div>
          <div className="l3-graph-value" style={{color:c}}>{a.co2Annual} kg</div>
        </div>); })}
      <div style={{marginTop:'14px',fontSize:'13px',color:'#ff8855',background:'rgba(255,68,0,0.08)',padding:'10px',borderRadius:'8px'}}>
        {L3_ICONS.warn} AC alone produces <strong>~1,278 kg CO{'\u{2082}'}/year</strong>!
      </div>
      <button className="l3-modal-btn" onClick={() => setPhase('formula')}>Understand the Formula {'\u{2192}'}</button>
    </div></div></div>);
  }

  // ═══ RENDER: FORMULA ═══
  if (phase === 'formula') {
    return (<div className="l3-container"><div className="l3-modal-overlay"><div className="l3-modal-card">
      <div className="l3-modal-title">{L3_ICONS.brain} CO{'\u{2082}'} Emission Formula</div>
      <p style={{fontSize:'13px',color:'#ccc',marginBottom:'10px',lineHeight:1.6}}>Every unit of electricity creates pollution:</p>
      <div className="l3-formula-box">
        <div className="l3-formula-text">CO{'\u{2082}'} = kWh {'\u{00D7}'} 0.710 kg</div>
        <div className="l3-formula-note">India Emission Factor (CEA FY 2024-25)</div>
      </div>
      <p style={{fontSize:'13px',color:'#ccc',margin:'10px 0'}}>{L3_ICONS.bulb} <strong>Simply:</strong> Energy {'\u{2192}'} Pollution</p>
      <div className="l3-formula-practice">
        <div className="l3-formula-question">{L3_ICONS.target} If you use <strong>10 kWh</strong>, how much CO{'\u{2082}'}?</div>
        <div className="l3-formula-options">
          {[3.55, 5.0, 7.1, 10.0].map((v, i) => {
            let cls = 'l3-formula-option';
            if (formulaAnswer !== null) { if (v === 7.1) cls += ' correct'; else if (v === formulaAnswer) cls += ' wrong'; }
            return <button key={i} className={cls} onClick={() => !formulaAnswer && setFormulaAnswer(v)}>{v} kg</button>;
          })}
        </div>
        {formulaAnswer !== null && <div className={`l3-formula-feedback ${formulaAnswer === 7.1 ? 'correct' : 'wrong'}`}>
          {formulaAnswer === 7.1 ? `${L3_ICONS.check} Correct! 10 \u{00D7} 0.710 = 7.10 kg` : `${L3_ICONS.cross} Answer: 10 \u{00D7} 0.710 = 7.10 kg`}
        </div>}
      </div>
      <button className="l3-modal-btn" onClick={() => { setBeforeStats({ co2: co2Data.co2Month, bill: billData.totalCost, watts: totalWatts }); setPhase('tasks'); }}
        style={{opacity: formulaAnswer ? 1 : 0.4, pointerEvents: formulaAnswer ? 'auto' : 'none'}}>
        Start Learning Tasks {L3_ICONS.fire} {'\u{2192}'}
      </button>
    </div></div></div>);
  }

  // ═══ RENDER: TASK OBJECTIVE ═══
  if (phase === 'tasks' && taskPhase === 'objective') {
    const task = LEARNING_TASKS[currentTaskIdx];
    return (<div className="l3-container"><div className="l3-task-objective-overlay"><div className="l3-task-objective-card">
      <div className="l3-task-number">Task {currentTaskIdx + 1} of {LEARNING_TASKS.length}</div>
      <div className="l3-task-icon-big">{task.icon}</div>
      <div className="l3-task-title-big">{task.title}</div>
      <div className="l3-task-objective-text">{L3_ICONS.target} {task.objective}</div>
      <div className="l3-task-desc-text">{task.description}</div>
      <button className="l3-task-start-btn" onClick={() => startTask(currentTaskIdx)}>Start Task {'\u{2192}'}</button>
    </div></div></div>);
  }

  // ═══ RENDER: TASK QUIZ (Type: quiz) ═══
  if (phase === 'tasks' && taskPhase === 'active' && LEARNING_TASKS[currentTaskIdx]?.type === 'quiz') {
    const task = LEARNING_TASKS[currentTaskIdx];
    return (<div className="l3-container"><div className="l3-modal-overlay"><div className="l3-modal-card">
      <div className="l3-modal-title">{task.icon} {task.title}</div>
      <p style={{fontSize:'14px',color:'#ffccaa',marginBottom:'12px'}}>{task.description}</p>
      <div className="l3-task-quiz-choices">
        {task.choices.map((ch, i) => {
          let cls = 'l3-task-quiz-choice';
          if (taskQuizAnswer !== null) { if (ch.correct) cls += ' correct'; else if (ch.id === taskQuizAnswer && !ch.correct) cls += ' wrong'; }
          return (<button key={i} className={cls} onClick={() => {
            if (taskQuizAnswer !== null) return;
            setTaskQuizAnswer(ch.id);
            setTimeout(() => { if (ch.correct) handleTaskSuccess(); else handleTaskFail(); }, 1200);
          }}><div className="l3-task-quiz-choice-icon">{ch.icon}</div><div className="l3-task-quiz-choice-label">{ch.label}</div></button>);
        })}
      </div>
    </div></div></div>);
  }

  // ═══ RENDER: TASK LEARNING (after task) ═══
  if (phase === 'tasks' && taskPhase === 'learning') {
    const task = LEARNING_TASKS[currentTaskIdx];
    const success = tasksPassed > (currentTaskIdx > 0 ? tasksPassed - 1 : -1);
    return (<div className="l3-container"><div className="l3-task-learning-overlay"><div className={`l3-task-learning-card ${success ? '' : 'fail'}`}>
      <div className={`l3-task-learning-header ${success ? 'success' : 'fail'}`}>
        {success ? L3_ICONS.check : L3_ICONS.cross} {success ? 'Task Complete!' : 'Task Failed'}
      </div>
      <div className="l3-task-learning-items">
        {task.learnings.map((l, i) => <div key={i} className="l3-task-learning-item"><span>{L3_ICONS.bulb}</span><span>{l}</span></div>)}
      </div>
      <button className="l3-modal-btn" onClick={advanceTask}>{currentTaskIdx + 1 >= LEARNING_TASKS.length ? 'See Results' : 'Next Task'} {'\u{2192}'}</button>
    </div></div></div>);
  }

  // ═══ RENDER: BEFORE vs AFTER ═══
  if (phase === 'before-after') {
    const bCO2 = beforeStats?.co2 || 0; const bBill = beforeStats?.bill || 0;
    const aCO2 = co2Data.co2Month; const aBill = billData.totalCost;
    const reduction = bCO2 > 0 ? Math.round(((bCO2 - aCO2) / bCO2) * 100) : 0;
    return (<div className="l3-container"><div className="l3-modal-overlay"><div className="l3-modal-card">
      <div className="l3-modal-title">{L3_ICONS.chart} Before vs After Optimization</div>
      <div className="l3-compare-grid">
        <div className="l3-compare-col before">
          <div className="l3-compare-label">{L3_ICONS.cross} Before</div>
          <div className="l3-compare-stat"><div className="l3-compare-stat-val">{bCO2} kg</div><div className="l3-compare-stat-lbl">CO{'\u{2082}'}/month</div></div>
          <div className="l3-compare-stat"><div className="l3-compare-stat-val">{'\u{20B9}'}{bBill}</div><div className="l3-compare-stat-lbl">Bill/month</div></div>
        </div>
        <div className="l3-compare-col after">
          <div className="l3-compare-label">{L3_ICONS.check} After</div>
          <div className="l3-compare-stat"><div className="l3-compare-stat-val">{aCO2} kg</div><div className="l3-compare-stat-lbl">CO{'\u{2082}'}/month</div></div>
          <div className="l3-compare-stat"><div className="l3-compare-stat-val">{'\u{20B9}'}{aBill}</div><div className="l3-compare-stat-lbl">Bill/month</div></div>
        </div>
      </div>
      {reduction > 0 && <div className="l3-compare-reduction">{L3_ICONS.down} Your smart choices reduced impact by {reduction}%!</div>}
      <button className="l3-modal-btn" onClick={() => setPhase('you-caused')}>{L3_ICONS.warn} See Damage Breakdown {'\u{2192}'}</button>
    </div></div></div>);
  }

  // ═══ RENDER: YOU CAUSED THIS ═══
  if (phase === 'you-caused') {
    const attr = damageAttribution;
    return (<div className="l3-container"><div className="l3-modal-overlay"><div className="l3-modal-card">
      <div className="l3-modal-title">{L3_ICONS.warn} YOU CAUSED THIS DAMAGE</div>
      <p style={{fontSize:'13px',color:'#ff8855',marginBottom:'12px'}}>Your energy choices led to environmental damage:</p>
      {attr.length > 0 ? <div className="l3-blame-grid">{attr.map(a => {
        const c = a.pct > 40 ? '#ef4444' : a.pct > 20 ? '#f59e0b' : '#22c55e';
        return (<div key={a.id} className="l3-blame-row"><div className="l3-blame-icon">{a.icon}</div><div className="l3-blame-name">{a.name} ({a.wattage}W)</div>
          <div className="l3-blame-bar"><div className="l3-blame-bar-fill" style={{width:`${a.pct}%`,backgroundColor:c}} /></div>
          <div className="l3-blame-pct" style={{color:c}}>{a.pct}%</div></div>);
      })}</div> : <p style={{color:'#22c55e'}}>{L3_ICONS.check} No appliances running!</p>}
      <div className="l3-neighbor-msg">{L3_ICONS.house} "Your energy affects others too"</div>
      <button className="l3-modal-btn" onClick={() => setPhase('real-life')}>What Can YOU Do? {'\u{2192}'}</button>
    </div></div></div>);
  }

  // ═══ RENDER: REAL-LIFE ACTIONS ═══
  if (phase === 'real-life') {
    return (<div className="l3-container"><div className="l3-modal-overlay"><div className="l3-modal-card">
      <div className="l3-modal-title">{L3_ICONS.muscle} What Can YOU Do in Real Life?</div>
      <div className="l3-reallife-grid">
        {REAL_LIFE_ACTIONS.map((a, i) => (
          <div key={i} className="l3-reallife-item" style={{animationDelay:`${i*0.08}s`}}>
            <div className="l3-reallife-icon">{a.icon}</div>
            <div className="l3-reallife-text"><div className="l3-reallife-action">{a.action}</div><div className="l3-reallife-impact">{a.impact}</div></div>
          </div>
        ))}
      </div>
      <button className="l3-modal-btn" onClick={() => setPhase('summary')}>See Reality Check {'\u{2192}'}</button>
    </div></div></div>);
  }

  // ═══ RENDER: SUMMARY ═══
  if (phase === 'summary') {
    const treesNeeded = Math.ceil(co2Data.co2Year / TREES_PER_CO2);
    return (<div className="l3-container"><div className="l3-modal-overlay"><div className="l3-modal-card">
      <div className="l3-modal-title">{L3_ICONS.chart} Reality Check</div>
      <div className="l3-summary-stats">
        <div className="l3-summary-stat"><div className="l3-summary-stat-val" style={{color:'#f59e0b'}}>{billData.totalUnits}</div><div className="l3-summary-stat-lbl">kWh/month</div></div>
        <div className="l3-summary-stat"><div className="l3-summary-stat-val" style={{color:'#ef4444'}}>{co2Data.co2Month} kg</div><div className="l3-summary-stat-lbl">CO{'\u{2082}'}/month</div></div>
        <div className="l3-summary-stat"><div className="l3-summary-stat-val" style={{color:'#ff4400'}}>{'\u{20B9}'}{billData.totalCost}</div><div className="l3-summary-stat-lbl">Bill/month</div></div>
      </div>
      <div className="l3-shock-card">
        <div className="l3-shock-title">{L3_ICONS.shock} Shock Data</div>
        {SHOCK_DATA.map((d, i) => <div key={i} className="l3-shock-item"><span>{d.icon}</span><span>{d.label}</span><span style={{marginLeft:'auto',fontWeight:700,color:'#ff6644'}}>{d.co2Annual} kg/yr</span></div>)}
      </div>
      <div style={{marginTop:'12px',padding:'10px',background:'rgba(239,68,68,0.08)',borderRadius:'8px',fontSize:'13px',color:'#ff8855',textAlign:'center'}}>
        {L3_ICONS.tree} To absorb {co2Data.co2Year} kg CO{'\u{2082}'}/year, you need <strong>~{treesNeeded} trees</strong>!
      </div>
      {learnedLessons.length > 0 && <div style={{marginTop:'10px',padding:'10px',background:'rgba(34,197,94,0.06)',border:'1px solid rgba(34,197,94,0.15)',borderRadius:'8px'}}>
        <div style={{fontSize:'12px',fontWeight:700,color:'#22c55e',marginBottom:'6px'}}>{L3_ICONS.book} What You Learned</div>
        {learnedLessons.slice(0, 5).map((l, i) => <div key={i} style={{fontSize:'11px',color:'#aaddbb',padding:'2px 0'}}>• {l}</div>)}
      </div>}
      <button className="l3-modal-btn" onClick={() => setPhase('quiz')}>Take the Final Quiz {'\u{2192}'}</button>
    </div></div></div>);
  }

  // ═══ RENDER: 3D SCENE (explore + task active) ═══
  const vignetteClass = damageLevel >= 0.75 ? 'collapse' : damageLevel >= 0.5 ? 'danger' : '';
  const isTaskActive = phase === 'tasks' && taskPhase === 'active';
  const activeTimedTask = isTaskActive && LEARNING_TASKS[currentTaskIdx]?.type === 'timed';

  return (<div className={`l3-container ${screenShake ? 'l3-screen-shake-loop' : ''}`}>
    <div className="l3-canvas-wrapper">
      <Canvas camera={{position:[-5,6,1],fov:50}} gl={{antialias:false}}
        onCreated={({gl}) => { gl.setClearColor('#050505'); gl.toneMapping = 1; gl.toneMappingExposure = 1.0; gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); }}>
        <Suspense fallback={null}>
          <SceneContent applianceStates={applianceStates} nearestAppliance={nearestAppliance}
            onRoomChange={handleRoomChange} onNearestChange={handleNearestChange}
            onInteract={handleInteract} cameraRef={cameraRef}
            proximityLevels={proximityLevels} damageLevel={damageLevel} />
        </Suspense>
      </Canvas>
      <div className={`l3-vignette ${vignetteClass}`} />
    </div>

    {/* HUD TOP */}
    <div className="l3-hud-top">
      <button className="l3-back-btn" onClick={() => navigate('/hub')}>{'\u{2190}'} Back</button>
      <div className="l3-hud-title">{L3_ICONS.fire} Carbon Crisis</div>
      <div className="l3-hud-room">{ROOM_ICONS[currentRoom] || L3_ICONS.pin} {currentRoom}</div>
    </div>

    {/* CARBON METER */}
    <div className="l3-carbon-panel">
      <div className="l3-carbon-header"><span>{L3_ICONS.globe}</span><span>Carbon Meter</span></div>
      <div className="l3-carbon-bar-outer"><div className="l3-carbon-bar-fill" style={{width:`${carbonBarPct}%`,backgroundColor:damageTier.color,color:damageTier.color}} /></div>
      <div className="l3-carbon-value">
        <span className="l3-carbon-kg" style={{color:damageTier.color}}><AnimatedCounter value={co2Data.co2Month} suffix=" kg" decimals={1} /></span>
        <span className="l3-carbon-tier" style={{backgroundColor:damageTier.color+'20',color:damageTier.color}}>{damageTier.icon} {damageTier.label}</span>
      </div>
      <div className="l3-carbon-watts"><span>{L3_ICONS.zap} {totalWatts}W</span><span>{onCount}/{L2_APPLIANCE_IDS.length} ON</span></div>
    </div>

    {/* BILL */}
    <div className={`l3-bill-panel ${billMilestone ? 'flash' : ''}`}>
      <div className="l3-bill-header">{L3_ICONS.money} Electricity Bill</div>
      <div className="l3-bill-amount" style={{color:billMilestone?.color||'#22c55e'}}><AnimatedCounter value={billData.totalCost} prefix={'\u{20B9}'} /></div>
      <div className="l3-bill-label">per month</div>
      {billMilestone && <div className="l3-bill-milestone" style={{backgroundColor:billMilestone.color+'20',color:billMilestone.color}}>{L3_ICONS.warn} {billMilestone.label}</div>}
    </div>

    {/* LEARNING POPUP */}
    {learningPopup && !isTaskActive && (
      <div className="l3-learning-popup">
        <div className="l3-learning-popup-header"><span>{learningPopup.icon}</span><span>{learningPopup.name}</span><span className="l3-learning-popup-watt">{learningPopup.wattage}W</span></div>
        <div className="l3-learning-step cause"><span className="l3-learning-step-icon">{L3_ICONS.zap}</span><span>{learningPopup.cause}</span></div>
        <div className="l3-learning-step effect"><span className="l3-learning-step-icon">{L3_ICONS.globe}</span><span>{learningPopup.effect}</span></div>
        <div className="l3-learning-step why"><span className="l3-learning-step-icon">{L3_ICONS.brain}</span><span>{learningPopup.why}</span></div>
        <div className="l3-learning-step lesson"><span className="l3-learning-step-icon">{L3_ICONS.bulb}</span><span>{learningPopup.lesson}</span></div>
      </div>
    )}

    {/* WHAT YOU LEARNED HUD */}
    {!learningPopup && learnedLessons.length > 0 && (phase === 'explore' || isTaskActive) && (
      <div className="l3-learned-hud">
        <div className="l3-learned-title">{L3_ICONS.book} What You Learned</div>
        {learnedLessons.map((l, i) => <div key={i} className="l3-learned-item">{l}</div>)}
      </div>
    )}

    {/* TASK BAR (timed) */}
    {activeTimedTask && (<div className="l3-mission-bar">
      <div className="l3-mission-header">
        <div className="l3-mission-title">{LEARNING_TASKS[currentTaskIdx].icon} {LEARNING_TASKS[currentTaskIdx].title}</div>
        <div className={`l3-mission-timer ${missionTimer > 15 ? 'safe' : missionTimer > 8 ? 'warn' : 'danger'}`}>{L3_ICONS.clock} {missionTimer}s</div>
      </div>
      <div className="l3-mission-desc">{LEARNING_TASKS[currentTaskIdx].description}</div>
      <div className="l3-mission-hint">{L3_ICONS.bulb} {LEARNING_TASKS[currentTaskIdx].hint}</div>
    </div>)}

    {/* 3D TASK BAR (non-timed) */}
    {isTaskActive && LEARNING_TASKS[currentTaskIdx]?.type === '3d' && (<div className="l3-mission-bar">
      <div className="l3-mission-header"><div className="l3-mission-title">{LEARNING_TASKS[currentTaskIdx].icon} {LEARNING_TASKS[currentTaskIdx].title}</div></div>
      <div className="l3-mission-desc">{L3_ICONS.target} {LEARNING_TASKS[currentTaskIdx].objective}</div>
      <div className="l3-mission-hint">{L3_ICONS.bulb} {LEARNING_TASKS[currentTaskIdx].hint}</div>
    </div>)}

    {/* TASK WARNING */}
    {taskWarning && <div className="l3-task-warning">{L3_ICONS.warn} {taskWarning}</div>}

    {/* EXPLORE ACTIONS */}
    {phase === 'explore' && canContinueExplore && (
      <div className="l3-action-buttons"><button className="l3-continue-btn" onClick={() => setPhase('damage-graph')}>{L3_ICONS.chart} Analyze Damage {'\u{2192}'}</button></div>
    )}

    {/* PROGRESS */}
    {phase === 'explore' && (<div className="l3-progress-panel">
      <div className="l3-progress-header">{L3_ICONS.target} Discovery</div>
      <div className="l3-progress-bar-outer"><div className="l3-progress-bar-inner" style={{width:`${(toggledSet.size/L2_APPLIANCE_IDS.length)*100}%`}} /></div>
      <div className="l3-progress-text">{toggledSet.size}/{L2_APPLIANCE_IDS.length} tested{canContinueExplore && <span style={{color:'#ff6644'}}> — Ready!</span>}</div>
    </div>)}
    {phase === 'tasks' && (<div className="l3-progress-panel">
      <div className="l3-progress-header">{L3_ICONS.target} Tasks</div>
      <div className="l3-progress-bar-outer"><div className="l3-progress-bar-inner" style={{width:`${((currentTaskIdx + (taskPhase === 'learning' ? 1 : 0))/LEARNING_TASKS.length)*100}%`}} /></div>
      <div className="l3-progress-text">{tasksPassed} passed / {currentTaskIdx + (taskPhase === 'learning' ? 1 : 0)} done</div>
    </div>)}

    {/* INSIGHT */}
    {(phase === 'explore' || isTaskActive) && totalWatts > 0 && (
      <div className="l3-insight-ticker" key={totalWatts}><span>{damageTier.icon}</span><span>
        {damageLevel >= 0.75 ? 'CRITICAL! Turn OFF high-watt appliances NOW!' : damageLevel >= 0.5 ? 'Environment deteriorating!' : damageLevel >= 0.25 ? 'CO\u{2082} rising. Be mindful!' : 'More energy = more destruction'}
      </span></div>
    )}

    {/* CRITICAL */}
    {isCritical && (<div className="l3-critical-overlay">
      <div className="l3-critical-icon">{L3_ICONS.siren}</div>
      <div className="l3-critical-title">{L3_ICONS.warn} CRITICAL LEVEL REACHED</div>
      <div className="l3-critical-subtitle">The environment is collapsing!</div>
      <button className="l3-critical-dismiss" onClick={dismissCritical}>I understand {'\u{2192}'}</button>
    </div>)}

    <div className="l3-floating-container">{floatingTexts.map(ft => <FloatingText key={ft.id} {...ft} onDone={removeFloating} />)}</div>
    <ControlsHelp />
  </div>);
}
