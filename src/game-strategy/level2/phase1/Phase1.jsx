import React, { useState, useCallback, useRef, useEffect, Suspense } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import House from '../../House';
import Player, { playerState } from '../../Player';
import Level2Appliances, { getProximityLevels } from '../Level2Appliances';
import { L2_APPLIANCE_IDS, L2_APPLIANCE_MAP } from '../level2Data';
import { PHASE1_TASKS, FAMILY_POSITIONS, FAMILY_MEMBERS, PHASE1_BADGE, getWattagePriority } from './phase1Data';
import FamilyMembers from './FamilyMembers';
import './Phase1.css';

// ─── Audio ───
let audioCtx = null;
function getAudioCtx() { if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)(); return audioCtx; }
function playCorrectSound() { try { const ctx = getAudioCtx(); [523,659,784].forEach((f,i)=>{const o=ctx.createOscillator();const g=ctx.createGain();o.connect(g);g.connect(ctx.destination);o.type='triangle';o.frequency.setValueAtTime(f,ctx.currentTime+i*0.1);g.gain.setValueAtTime(0.1,ctx.currentTime+i*0.1);g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+i*0.1+0.3);o.start(ctx.currentTime+i*0.1);o.stop(ctx.currentTime+i*0.1+0.3);}); } catch(e){} }
function playWrongSound() { try { const ctx=getAudioCtx();const o=ctx.createOscillator();const g=ctx.createGain();o.connect(g);g.connect(ctx.destination);o.type='sawtooth';o.frequency.setValueAtTime(200,ctx.currentTime);o.frequency.linearRampToValueAtTime(100,ctx.currentTime+0.3);g.gain.setValueAtTime(0.08,ctx.currentTime);g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.4);o.start(ctx.currentTime);o.stop(ctx.currentTime+0.4); } catch(e){} }
function playOffSound() { try { const ctx=getAudioCtx();const o=ctx.createOscillator();const g=ctx.createGain();o.connect(g);g.connect(ctx.destination);o.type='sine';o.frequency.setValueAtTime(400,ctx.currentTime);o.frequency.linearRampToValueAtTime(150,ctx.currentTime+0.25);g.gain.setValueAtTime(0.1,ctx.currentTime);g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.35);o.start(ctx.currentTime);o.stop(ctx.currentTime+0.35); } catch(e){} }
function playMilestone() { try { const ctx=getAudioCtx(); [523,659,784,1047].forEach((f,i)=>{const o=ctx.createOscillator();const g=ctx.createGain();o.connect(g);g.connect(ctx.destination);o.type='triangle';o.frequency.setValueAtTime(f,ctx.currentTime+i*0.12);g.gain.setValueAtTime(0.1,ctx.currentTime+i*0.12);g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+i*0.12+0.4);o.start(ctx.currentTime+i*0.12);o.stop(ctx.currentTime+i*0.12+0.4);}); } catch(e){} }

// ─── Lighting ───
function WarmLighting() {
  return (<>
    <ambientLight intensity={0.45} color="#ffe8cc" />
    <directionalLight position={[8,10,10]} intensity={1.0} color="#ffd699" />
    <hemisphereLight args={['#ffecd2','#b97a20',0.35]} />
    <pointLight position={[-8,4,-5]} intensity={0.3} color="#ffeedd" distance={20} />
  </>);
}

function CameraRef({ cameraRef }) {
  const { camera } = useThree();
  useEffect(() => { cameraRef.current = camera; }, [camera, cameraRef]);
  return null;
}

function SceneContent({ applianceStates, nearestAppliance, taskTargetIds, onRoomChange, onNearestChange, onInteract, cameraRef, proximityLevels, familyPositions }) {
  return (<>
    <WarmLighting />
    <CameraRef cameraRef={cameraRef} />
    <House />
    <Level2Appliances applianceStates={applianceStates} nearestAppliance={nearestAppliance} taskTargetIds={taskTargetIds} proximityLevels={proximityLevels} />
    <FamilyMembers familyPositions={familyPositions} familyData={FAMILY_MEMBERS} />
    <Player onRoomChange={onRoomChange} onNearestApplianceChange={onNearestChange} onInteract={onInteract} applianceIdList={L2_APPLIANCE_IDS} />
  </>);
}

// ═══════════════════════════════════════════════════════════
//  PHASE 1 MAIN COMPONENT
// ═══════════════════════════════════════════════════════════
export default function Phase1({ onComplete }) {
  const cameraRef = useRef(null);
  const [currentTaskIdx, setCurrentTaskIdx] = useState(0);
  const [taskState, setTaskState] = useState('intro'); // intro, playing, summary, cutscene
  const [applianceStates, setApplianceStates] = useState({});
  const [turnedOff, setTurnedOff] = useState([]);
  const [currentRoom, setCurrentRoom] = useState('Living Room');
  const [nearestAppliance, setNearestAppliance] = useState(null);
  const [proximityLevels, setProximityLevels] = useState({});
  const [floatingTexts, setFloatingTexts] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [totalEnergySaved, setTotalEnergySaved] = useState(0);
  const [tasksCompleted, setTasksCompleted] = useState(0);
  const [forgottenPopup, setForgottenPopup] = useState(false);
  const [standbyFound, setStandbyFound] = useState([]);
  const [curtainsOpened, setCurtainsOpened] = useState(false);
  const [showPhaseComplete, setShowPhaseComplete] = useState(false);
  const floatIdRef = useRef(0);
  const forgottenDismissedRef = useRef(false);

  const currentTask = PHASE1_TASKS[currentTaskIdx];
  const familyPositions = currentTask ? FAMILY_POSITIONS[currentTask.familyKey] || [] : [];

  // ─── Initialize task ───
  useEffect(() => {
    if (!currentTask) return;
    const states = {};
    L2_APPLIANCE_IDS.forEach(id => { states[id] = false; });
    if (currentTask.initialOn) {
      currentTask.initialOn.forEach(id => { states[id] = true; });
    }
    setApplianceStates(states);
    setTurnedOff([]);
    setFeedback(null);
    setForgottenPopup(false);
    forgottenDismissedRef.current = false;
    setStandbyFound([]);
    setCurtainsOpened(false);
    setTaskState('intro');
  }, [currentTaskIdx]);

  const taskTargetIds = currentTask ? (currentTask.turnOffIds || currentTask.standbyDevices?.map(d => d.id) || []) : [];

  const addFloating = useCallback((text, type) => {
    const id = floatIdRef.current++;
    setFloatingTexts(prev => [...prev, { id, text, type }]);
    setTimeout(() => setFloatingTexts(prev => prev.filter(f => f.id !== id)), 2000);
  }, []);

  // ─── Task 3: Forgotten popup trigger ───
  useEffect(() => {
    if (!currentTask || currentTask.type !== 'forgotten' || taskState !== 'playing') return;
    if (currentTask.triggerRoom && currentRoom === currentTask.triggerRoom && !forgottenPopup && !forgottenDismissedRef.current && turnedOff.length === 0) {
      setForgottenPopup(true);
    }
  }, [currentRoom, currentTask, taskState, forgottenPopup, turnedOff]);

  // ─── Dismiss forgotten popup (prevents re-triggering) ───
  const dismissForgotten = useCallback(() => {
    setForgottenPopup(false);
    forgottenDismissedRef.current = true;
  }, []);

  // ─── Check task completion ───
  const checkCompletion = useCallback((newTurnedOff) => {
    if (!currentTask) return false;
    const required = currentTask.requiredOff || 0;
    if (newTurnedOff.length >= required) {
      const saved = newTurnedOff.reduce((s, id) => {
        const a = L2_APPLIANCE_MAP[id];
        return s + (a ? a.wattage : 0);
      }, 0);
      playMilestone();
      setTotalEnergySaved(prev => prev + saved);
      setTasksCompleted(prev => prev + 1);
      setTimeout(() => setTaskState('summary'), 600);
      return true;
    }
    return false;
  }, [currentTask]);

  // ─── Handle interaction ───
  const handleInteract = useCallback((applianceId) => {
    if (!L2_APPLIANCE_IDS.includes(applianceId)) return;
    if (!currentTask || taskState !== 'playing') return;

    // ── Standby task ──
    if (currentTask.type === 'standby') {
      const device = currentTask.standbyDevices?.find(d => d.id === applianceId);
      if (!device) { playWrongSound(); addFloating('Not a standby device', 'wrong'); return; }
      if (standbyFound.includes(applianceId)) { addFloating('Already unplugged!', 'save'); return; }
      playCorrectSound(); playOffSound();
      const newFound = [...standbyFound, applianceId];
      setStandbyFound(newFound);
      setApplianceStates(prev => ({ ...prev, [applianceId]: false }));
      addFloating(`Phantom load stopped! -${device.watts}W`, 'save');
      setFeedback({ type: 'correct', text: `🔌 ${device.hint}` });
      setTimeout(() => setFeedback(null), 3000);
      const newOff = [...turnedOff, applianceId];
      setTurnedOff(newOff);
      checkCompletion(newOff);
      return;
    }

    // ── Daytime task — curtains ──
    if (currentTask.type === 'daytime' && !curtainsOpened) {
      // First interaction near window opens curtains
      if (currentRoom === 'Living Room' || currentRoom === 'Bedroom') {
        setCurtainsOpened(true);
        addFloating('☀️ Curtains opened! Sunlight flowing in!', 'correct');
        playCorrectSound();
        setFeedback({ type: 'correct', text: '☀️ Natural sunlight is now lighting the room!' });
        setTimeout(() => setFeedback(null), 2500);
        // Don't return — still need to turn off lights
      }
    }

    // ── Protected appliances ──
    if (currentTask.protectedIds?.includes(applianceId)) {
      playWrongSound();
      addFloating(currentTask.protectedMessage || 'This is needed!', 'wrong');
      setFeedback({ type: 'wrong', text: currentTask.protectedMessage || 'This appliance is needed!' });
      setTimeout(() => setFeedback(null), 2500);
      return;
    }

    // ── Must-stay-on appliances (Task 8) ──
    if (currentTask.mustStayOnIds?.includes(applianceId)) {
      playWrongSound();
      const reason = currentTask.mustStayOnReasons?.[applianceId] || 'This needs to stay ON!';
      addFloating(reason, 'wrong');
      setFeedback({ type: 'wrong', text: reason });
      setTimeout(() => setFeedback(null), 2500);
      return;
    }

    // ── Turn-off target ──
    if (currentTask.turnOffIds?.includes(applianceId)) {
      if (!applianceStates[applianceId]) { addFloating('Already OFF', 'save'); return; }
      if (turnedOff.includes(applianceId)) { addFloating('Already turned off!', 'save'); return; }
      playCorrectSound(); playOffSound();
      setApplianceStates(prev => ({ ...prev, [applianceId]: false }));
      const appliance = L2_APPLIANCE_MAP[applianceId];
      addFloating(`-${appliance?.wattage || 0}W saved! 🌱`, 'save');

      const priority = getWattagePriority(appliance?.wattage || 0);
      const popupMsg = currentTask.offPopups?.[priority] || 'Energy saved! 🌱';
      setFeedback({ type: 'correct', text: `✅ ${popupMsg}` });
      setTimeout(() => setFeedback(null), 2500);

      const newOff = [...turnedOff, applianceId];
      setTurnedOff(newOff);
      checkCompletion(newOff);
      return;
    }

    // ── Not a target ──
    playWrongSound();
    addFloating('Not a target for this task', 'wrong');
    setTimeout(() => setFeedback(null), 2000);
  }, [currentTask, taskState, applianceStates, turnedOff, standbyFound, curtainsOpened, currentRoom, addFloating, checkCompletion]);

  // ─── Advance to next task ───
  const advanceTask = useCallback(() => {
    const nextIdx = currentTaskIdx + 1;
    if (nextIdx >= PHASE1_TASKS.length) {
      setShowPhaseComplete(true);
      return;
    }
    setCurrentTaskIdx(nextIdx);
  }, [currentTaskIdx]);

  const handleRoomChange = useCallback((room) => setCurrentRoom(room), []);
  const handleNearestChange = useCallback((id) => {
    setNearestAppliance(id);
    setProximityLevels(getProximityLevels(playerState.x, playerState.z));
  }, []);

  // ═══════════════════════════════════════
  //  PHASE COMPLETE SCREEN
  // ═══════════════════════════════════════
  if (showPhaseComplete) {
    return (
      <div className="p1-container">
        <div className="p1-complete-overlay">
          <div className="p1-complete-card">
            <div className="p1-complete-icon">{PHASE1_BADGE.icon}</div>
            <h2 className="p1-complete-title">Phase 1 Complete!</h2>
            <p className="p1-complete-subtitle">{PHASE1_BADGE.description}</p>
            <div className="p1-complete-stats">
              <div className="p1-stat"><span className="p1-stat-val">{tasksCompleted}</span><span className="p1-stat-lbl">Tasks Done</span></div>
              <div className="p1-stat"><span className="p1-stat-val">{totalEnergySaved.toLocaleString()}W</span><span className="p1-stat-lbl">Energy Saved</span></div>
              <div className="p1-stat"><span className="p1-stat-val">+{PHASE1_BADGE.coins}</span><span className="p1-stat-lbl">Coins</span></div>
            </div>
            <div className="p1-complete-learning">
              <div className="p1-learn-title">🌱 Habits Built</div>
              <div className="p1-learn-item">✅ Turn off unused rooms</div>
              <div className="p1-learn-item">✅ Check before leaving</div>
              <div className="p1-learn-item">✅ Stop phantom power</div>
              <div className="p1-learn-item">✅ Use natural light</div>
              <div className="p1-learn-item">✅ Prioritize wisely</div>
            </div>
            <button className="p1-continue-btn" onClick={onComplete}>Continue to Phase 2 →</button>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════
  //  TASK 8 CUTSCENE
  // ═══════════════════════════════════════
  if (currentTask?.type === 'last_check' && taskState === 'intro') {
    return (
      <div className="p1-container">
        <div className="p1-cutscene-overlay">
          <div className="p1-cutscene-card">
            <div className="p1-cutscene-family">👨‍👩‍👦</div>
            <div className="p1-cutscene-bubble">
              <p className="p1-cutscene-quote">💬 {currentTask.cutscene.message}</p>
            </div>
            <div className="p1-cutscene-teacher">
              <span className="p1-teacher-avatar">🧑‍🏫</span>
              <p className="p1-teacher-msg">💬 {currentTask.cutscene.teacherMessage}</p>
            </div>
            <button className="p1-start-btn" onClick={() => setTaskState('playing')}>Start Final Check →</button>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════
  //  TASK INTRO SCREEN
  // ═══════════════════════════════════════
  if (taskState === 'intro' && currentTask?.type !== 'last_check') {
    return (
      <div className="p1-container">
        <div className="p1-intro-overlay">
          <div className="p1-intro-card">
            <div className="p1-intro-dot" style={{ background: currentTask.color }}>{currentTask.colorDot}</div>
            <div className="p1-intro-number">TASK {currentTask.number} of {PHASE1_TASKS.length}</div>
            <h2 className="p1-intro-title">{currentTask.icon} {currentTask.title}</h2>
            <p className="p1-intro-scenario">{currentTask.scenario}</p>
            <p className="p1-intro-instruction">{currentTask.instruction}</p>
            {currentTask.trickMessage && <div className="p1-intro-trick">{currentTask.trickMessage}</div>}
            <button className="p1-start-btn" onClick={() => setTaskState('playing')}>Start Task →</button>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════
  //  TASK SUMMARY SCREEN
  // ═══════════════════════════════════════
  if (taskState === 'summary') {
    const saved = turnedOff.reduce((s, id) => s + (L2_APPLIANCE_MAP[id]?.wattage || 0), 0);
    return (
      <div className="p1-container">
        <div className="p1-summary-overlay">
          <div className="p1-summary-card">
            <div className="p1-summary-icon">✅</div>
            <h3 className="p1-summary-title">Task {currentTask.number} Complete!</h3>
            <div className="p1-summary-saved">
              <span className="p1-saved-val">-{saved.toLocaleString()}W</span>
              <span className="p1-saved-lbl">Energy Saved</span>
            </div>
            <div className="p1-summary-count">{turnedOff.length} appliance{turnedOff.length !== 1 ? 's' : ''} handled</div>
            {currentTask.finalLearning && (
              <div className="p1-summary-learning">
                <div className="p1-learn-title">{currentTask.finalLearning.title}</div>
                {currentTask.finalLearning.messages.map((msg, i) => (
                  <div key={i} className="p1-learn-item">💡 {msg}</div>
                ))}
              </div>
            )}
            <button className="p1-next-btn" onClick={advanceTask}>
              {currentTaskIdx + 1 >= PHASE1_TASKS.length ? 'Complete Phase 1 🎉' : 'Next Task →'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════
  //  GAMEPLAY — 3D SCENE + HUD
  // ═══════════════════════════════════════
  return (
    <div className="p1-container">
      <div className="p1-canvas-wrapper">
        <Canvas camera={{ position: [-5,6,1], fov: 50 }} gl={{ antialias: false }}
          onCreated={({ gl }) => { gl.setClearColor('#f5deb3'); gl.toneMapping = 1; gl.toneMappingExposure = 1.1; gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); }}>
          <Suspense fallback={null}>
            <SceneContent applianceStates={applianceStates} nearestAppliance={nearestAppliance} taskTargetIds={taskTargetIds}
              onRoomChange={handleRoomChange} onNearestChange={handleNearestChange} onInteract={handleInteract}
              cameraRef={cameraRef} proximityLevels={proximityLevels} familyPositions={familyPositions} />
          </Suspense>
        </Canvas>
        <div className="p1-vignette" />
      </div>

      {/* TOP HUD */}
      <div className="p1-hud-top">
        <div className="p1-hud-phase">🌱 Phase 1 — Build Habits</div>
        <div className="p1-hud-room">📍 {currentRoom}</div>
      </div>

      {/* TASK BAR */}
      <div className="p1-task-bar" style={{ borderLeftColor: currentTask.color }}>
        <div className="p1-task-header">
          <span className="p1-task-dot">{currentTask.colorDot}</span>
          <span className="p1-task-label">Task {currentTask.number}/{PHASE1_TASKS.length}</span>
        </div>
        <div className="p1-task-title">{currentTask.icon} {currentTask.title}</div>
        <div className="p1-task-instruction">{currentTask.instruction}</div>
        <div className="p1-task-hint">💡 {currentTask.hint}</div>
        <div className="p1-task-progress">
          <div className="p1-task-progress-bar">
            <div className="p1-task-progress-fill" style={{ width: `${(turnedOff.length / (currentTask.requiredOff || 1)) * 100}%`, background: currentTask.color }} />
          </div>
          <span className="p1-task-progress-text">{turnedOff.length}/{currentTask.requiredOff || 0}</span>
        </div>
      </div>

      {/* ENERGY SAVED TRACKER */}
      <div className="p1-energy-tracker">
        <span className="p1-energy-icon">⚡</span>
        <span className="p1-energy-text">Total Saved: <strong>{totalEnergySaved.toLocaleString()}W</strong></span>
      </div>

      {/* FORGOTTEN POPUP (Task 3) */}
      {forgottenPopup && currentTask?.type === 'forgotten' && (
        <div className="p1-forgotten-overlay" onClick={dismissForgotten}>
          <div className="p1-forgotten-card" onClick={e => e.stopPropagation()}>
            <div className="p1-forgotten-icon">🤔</div>
            <h3 className="p1-forgotten-title">{currentTask.popupMessage}</h3>
            <p className="p1-forgotten-text">{currentTask.popupSubtext}</p>
            <button className="p1-forgotten-btn" onClick={dismissForgotten}>Go Back! →</button>
          </div>
        </div>
      )}

      {/* FEEDBACK TOAST */}
      {feedback && (
        <div className={`p1-feedback ${feedback.type}`}>
          <div className="p1-feedback-text">{feedback.text}</div>
        </div>
      )}

      {/* FLOATING TEXTS */}
      <div className="p1-floating-container">
        {floatingTexts.map(ft => (
          <div key={ft.id} className={`p1-floating-text ${ft.type}`}>{ft.text}</div>
        ))}
      </div>
    </div>
  );
}
