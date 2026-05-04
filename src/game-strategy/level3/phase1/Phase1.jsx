import React, { useState, useCallback, useRef, useEffect, useMemo, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { useNavigate } from 'react-router-dom';
import { playerState } from '../../Player';
import { getProximityLevels } from '../../level2/Level2Appliances';
import Level3Environment from '../Level3Environment';
import { L2_APPLIANCE_IDS, L2_APPLIANCE_MAP, computeEnvironment, AC_TEMP_SETTINGS, OPTIMAL_TEMP_IDX, PHASE1_TASKS, REALIZATION_LINES, P1_QUIZ, PHASE1_BADGE, calculateP1Stars, BILL_APPLIANCES, EXPERIMENT_FEEDBACK, AC_SCENARIOS, computeEBMeter, CO2_JOURNEY_STEPS, APPLIANCE_COAL_DATA } from './phase1Data';
import { SceneContent, AnimatedValue, FloatingText, DashboardMetric, StepItem, playToggleOn, playToggleOff, playCorrectSound, playWrongSound, playMilestoneSound, playWarningSound, playHeavyHum, playBreathingSound } from './Phase1Core';
import './Phase1.css';

export default function Phase1({ onComplete }) {
  const navigate = useNavigate();
  const cameraRef = useRef(null);
  const floatIdRef = useRef(0);
  const breathTimerRef = useRef(null);

  const [taskIdx, setTaskIdx] = useState(0);
  const [taskState, setTaskState] = useState('intro');
  const [appStates, setAppStates] = useState(() => {
    const s = {}; L2_APPLIANCE_IDS.forEach(id => { s[id] = false; }); return s;
  });
  const [windowOpen, setWindowOpen] = useState(true);
  const [curtainOpen, setCurtainOpen] = useState(true);
  const [acTempIdx, setAcTempIdx] = useState(OPTIMAL_TEMP_IDX);
  const [showTempKnob, setShowTempKnob] = useState(false);
  const [showBillUI, setShowBillUI] = useState(false);
  const [billClicked, setBillClicked] = useState(new Set());
  const [highlightedApp, setHighlightedApp] = useState(null);
  const [showEBMeter, setShowEBMeter] = useState(false);
  const [showACScenarios, setShowACScenarios] = useState(false);
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [showAirExperience, setShowAirExperience] = useState(false);
  const [airTimer, setAirTimer] = useState(0);
  const [turnedOn, setTurnedOn] = useState([]);
  const [stepsDone, setStepsDone] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [fixActions, setFixActions] = useState([]);
  const [obsTimer, setObsTimer] = useState(0);
  const [obsRunning, setObsRunning] = useState(false);
  const [outsideReached, setOutsideReached] = useState(false);
  const [expTimer, setExpTimer] = useState(0);
  const [expRunning, setExpRunning] = useState(false);
  const [bestWatts, setBestWatts] = useState(99999);
  const [tasksCompleted, setTasksCompleted] = useState(0);
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizSel, setQuizSel] = useState(null);
  const [quizScore, setQuizScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [realStep, setRealStep] = useState(0);
  const [currentRoom, setCurrentRoom] = useState('Living Room');
  const [nearestApp, setNearestApp] = useState(null);
  const [proxLevels, setProxLevels] = useState({});
  const [floats, setFloats] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [stars, setStars] = useState(0);
  const [door1Closed, setDoor1Closed] = useState(false);
  const [door2Closed, setDoor2Closed] = useState(false);
  const [showDoors, setShowDoors] = useState(false);
  const [showCO2Journey, setShowCO2Journey] = useState(false);
  const [co2Step, setCo2Step] = useState(0);
  const [showPollutionOverlay, setShowPollutionOverlay] = useState(false);
  const [showIndianEBMeter, setShowIndianEBMeter] = useState(false);
  const [showFactoryInterior, setShowFactoryInterior] = useState(false);
  const [factoryStation, setFactoryStation] = useState(0);
  const [showPledge, setShowPledge] = useState(false);
  const [pledgeComplete, setPledgeComplete] = useState(false);

  const task = PHASE1_TASKS[taskIdx];
  const env = useMemo(() => computeEnvironment(appStates, acTempIdx, windowOpen, curtainOpen), [appStates, acTempIdx, windowOpen, curtainOpen]);

  const fogLevel = useMemo(() => {
    if (env.airQuality > 0.7) return '';
    if (env.airQuality > 0.4) return 'light';
    if (env.airQuality > 0.2) return 'medium';
    return 'heavy';
  }, [env.airQuality]);

  const heatTint = useMemo(() => {
    const i = Math.max(0, (env.watts - 1000) / 5000) * 0.15;
    return `rgba(255,60,0,${i})`;
  }, [env.watts]);

  const vignetteClass = env.damageLevel >= 0.6 ? 'danger' : env.damageLevel >= 0.3 ? 'warn' : '';

  useEffect(() => {
    if (!task) return;
    const states = {};
    L2_APPLIANCE_IDS.forEach(id => { states[id] = false; });
    if (task.initialOn) task.initialOn.forEach(id => { states[id] = true; });
    setAppStates(states);
    setWindowOpen(task.initialWindows !== undefined ? task.initialWindows : true);
    setCurtainOpen(task.initialCurtains !== undefined ? task.initialCurtains : true);
    setTurnedOn([]); setStepsDone([]); setCurrentStep(0); setFixActions([]);
    setFeedback(null); setShowBillUI(false); setBillClicked(new Set());
    setHighlightedApp(null); setShowTempKnob(false); setAcTempIdx(OPTIMAL_TEMP_IDX);
    setOutsideReached(false); setObsTimer(0); setObsRunning(false);
    setExpTimer(0); setExpRunning(false); setBestWatts(99999);
    setShowEBMeter(false); setShowACScenarios(false); setScenarioIdx(0);
    setShowAirExperience(false); setAirTimer(0);
    setDoor1Closed(false); setDoor2Closed(false);
    setShowDoors(task.id === 'comfort_decision');
    setShowCO2Journey(false); setCo2Step(0);
    setShowPollutionOverlay(false); setShowIndianEBMeter(false);
    setShowFactoryInterior(false); setFactoryStation(0);
    setShowPledge(false); setPledgeComplete(false);
  }, [taskIdx]);

  useEffect(() => {
    if (!obsRunning || obsTimer <= 0) return;
    const iv = setInterval(() => {
      setObsTimer(p => {
        if (p <= 1) { clearInterval(iv); setObsRunning(false); handleTaskComplete(); return 0; }
        if (p % 5 === 0) playHeavyHum();
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [obsRunning]);

  useEffect(() => {
    if (!expRunning) return;
    const iv = setInterval(() => {
      setExpTimer(p => {
        if (p <= 1) { clearInterval(iv); setExpRunning(false); handleTaskComplete(); return 0; }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [expRunning]);

  useEffect(() => {
    if (task?.type === 'free_play' && taskState === 'playing' && expRunning) {
      if (env.watts < bestWatts) setBestWatts(env.watts);
    }
  }, [env.watts, expRunning]);

  // Air quality experience timer
  useEffect(() => {
    if (!showAirExperience || airTimer <= 0) return;
    const iv = setInterval(() => {
      setAirTimer(p => {
        if (p <= 1) { clearInterval(iv); setShowAirExperience(false); handleTaskComplete(); return 0; }
        if (p % 3 === 0) playBreathingSound();
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [showAirExperience, airTimer]);

  useEffect(() => {
    if (task?.type === 'walk_outside' && taskState === 'playing' && outsideReached) {
      playBreathingSound();
      breathTimerRef.current = setInterval(() => playBreathingSound(), 3500);
      return () => { if (breathTimerRef.current) clearInterval(breathTimerRef.current); };
    }
  }, [outsideReached, taskState]);

  const addFloat = useCallback((text, type) => {
    const id = floatIdRef.current++;
    setFloats(prev => [...prev, { id, text, type }]);
  }, []);
  const removeFloat = useCallback(id => setFloats(prev => prev.filter(f => f.id !== id)), []);
  const showFB = useCallback((text, type, dur = 3000) => {
    setFeedback({ text, type });
    setTimeout(() => setFeedback(null), dur);
  }, []);
  const handleTaskComplete = useCallback(() => {
    playMilestoneSound();
    setTasksCompleted(p => p + 1);
    setTimeout(() => setTaskState('summary'), 600);
  }, []);

  const handleRoomChange = useCallback(room => {
    setCurrentRoom(room);
    if (task?.type === 'walk_outside' && taskState === 'playing' && !outsideReached) {
      if (!room || room === 'Outside' || room === '') {
        setOutsideReached(true);
        playWarningSound();
        showFB('\u{1F32B}\u{FE0F} The air is thick with pollution... You can barely see!', 'danger', 4000);
        setTimeout(() => handleTaskComplete(), 5000);
      }
    }
    // Auto-trigger pollution when entering Outside during air task
    if (task?.type === 'walk_outside_air' && taskState === 'playing' && room === 'Outside' && !showPollutionOverlay) {
      playWarningSound();
      setShowPollutionOverlay(true);
      showFB('\u{1F32B}\u{FE0F} The air is TOXIC! AQI 387 — HAZARDOUS!', 'danger', 5000);
      playBreathingSound();
      setTimeout(() => {
        showFB('\u{1F4A8} You felt the deadly pollution your energy use creates!', 'danger', 3000);
        setTimeout(() => handleTaskComplete(), 3000);
      }, (task.duration || 10) * 1000);
    }
    // Auto-trigger factory interior when entering Factory zone
    if (task?.type === 'factory_visit' && taskState === 'playing' && room === 'Factory' && !showFactoryInterior) {
      playWarningSound();
      setShowFactoryInterior(true);
      setFactoryStation(0);
      showFB('\u{1F3ED} You entered the Power Plant! Witness coal burning...', 'danger', 5000);
    }
  }, [task, taskState, outsideReached, handleTaskComplete, showFB, showPollutionOverlay, showFactoryInterior]);

  const handleNearestChange = useCallback(id => {
    setNearestApp(id);
    setProxLevels(getProximityLevels(playerState.x, playerState.z));
  }, []);

  // ═══ INTERACTION HANDLER ═══
  const handleInteract = useCallback((appId) => {
    if (!task || taskState !== 'playing') return;

    // ─── OUTDOOR TASKS: fire based on position, not appId ───
    if (task.type === 'walk_outside_air') {
      if (playerState.x < -11 && !showPollutionOverlay) {
        playWarningSound();
        setShowPollutionOverlay(true);
        showFB('\u{1F32B}\u{FE0F} The air is TOXIC! AQI 387 — HAZARDOUS! You can barely breathe!', 'danger', 5000);
        playBreathingSound();
        setTimeout(() => {
          showFB('\u{1F4A8} You felt the deadly pollution your energy use creates!', 'danger', 3000);
          setTimeout(() => handleTaskComplete(), 3000);
        }, (task.duration || 10) * 1000);
      } else if (!showPollutionOverlay) {
        showFB('\u{1F6AA} Walk OUTSIDE through the front door (left wall gap)!', 'info');
      }
      return;
    }

    if (task.type === 'eb_meter_outside') {
      // EB meter is on the left wall at [-10.35, 1.6, -1]
      const dx = playerState.x - (-10.35);
      const dz = playerState.z - (-1);
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < 3.5 && !showIndianEBMeter) {
        playCorrectSound();
        setShowIndianEBMeter(true);
        showFB('\u{1F4CA} EB Meter opened! Look at your shocking consumption!', 'info');
      } else if (!showIndianEBMeter) {
        showFB('\u{1F4CD} Walk to the EB Meter on the left wall and press E!', 'info');
      }
      return;
    }

    if (task.type === 'factory_visit') {
      if (playerState.x < -20 && !showFactoryInterior) {
        playWarningSound();
        setShowFactoryInterior(true);
        setFactoryStation(0);
        showFB('\u{1F3ED} You entered the Power Plant! Witness coal burning for YOUR electricity...', 'danger', 5000);
      } else if (!showFactoryInterior) {
        showFB('\u{1F3ED} Walk to the Factory — follow the path LEFT outside!', 'info');
      }
      return;
    }

    if (task.type === 'pledge_challenge') {
      if (!appId) return;
      if (!L2_APPLIANCE_IDS.includes(appId)) return;
      const ap = L2_APPLIANCE_MAP[appId];
      const ns = !appStates[appId];
      if (ns) { playToggleOn(); addFloat(`+${ap.wattage}W ⚡`, 'damage'); }
      else { playToggleOff(); addFloat(`-${ap.wattage}W saved 🌿`, 'save'); }
      setAppStates(prev => ({ ...prev, [appId]: ns }));
      return;
    }

    // ─── Handle DOOR interactions ───
    if (appId && appId.startsWith && appId.startsWith('__door__')) {
      if (task.type === 'multi_step') {
        const step = task.steps[currentStep];
        if (step && step.action === 'close_door_1' && !door1Closed && appId === '__door__bedroom_living') {
          playCorrectSound(); setDoor1Closed(true);
          addFloat(step.feedback, 'save');
          showFB('\ud83d\udeaa Door 1 closed! Living room → Bedroom sealed.', 'success');
          setStepsDone(prev => [...prev, step.id]);
          setCurrentStep(currentStep + 1);
          return;
        }
        if (step && step.action === 'close_door_2' && !door2Closed && appId === '__door__bedroom_bathroom') {
          playCorrectSound(); setDoor2Closed(true);
          addFloat(step.feedback, 'save');
          showFB('\ud83d\udeaa Door 2 closed! Bedroom → Bathroom sealed. Room is FULLY sealed! \u2705', 'success');
          setStepsDone(prev => [...prev, step.id]);
          setCurrentStep(currentStep + 1);
          return;
        }
        // Wrong door for the current step
        if (step && (step.action === 'close_door_1' || step.action === 'close_door_2')) {
          const needed = step.action === 'close_door_1' ? 'Living Room → Bedroom' : 'Bedroom → Bathroom';
          showFB(`\ud83d\udeaa Wrong door! Close the ${needed} door first.`, 'warning');
          return;
        }
      }
      return;
    }

    // Handle window interactions (from Player.jsx __window__ prefix)
    if (appId && appId.startsWith && appId.startsWith('__window__')) {
      if (task.type === 'multi_step') {
        const step = task.steps[currentStep];
        if (step && step.action === 'interact_window' && windowOpen) {
          playCorrectSound(); setWindowOpen(false);
          addFloat(step.feedback, 'save');
          showFB('\u2705 Window closed! Hot air from outside is now blocked.', 'success');
          setStepsDone(prev => [...prev, step.id]);
          setCurrentStep(currentStep + 1);
          return;
        }
        if (step && step.action === 'interact_curtain' && curtainOpen) {
          playCorrectSound(); setCurtainOpen(false);
          addFloat(step.feedback, 'save');
          showFB('\u2705 Curtain closed! Direct sunlight blocked \u2014 room stays cooler.', 'success');
          setStepsDone(prev => [...prev, step.id]);
          setCurrentStep(currentStep + 1);
          return;
        }
      }
      if (task.type === 'air_check' && !showAirExperience) {
        playWarningSound();
        setShowAirExperience(true);
        setAirTimer(task.duration || 8);
        showFB('\ud83c\udf2b\ufe0f Look outside... The air is thick with pollution!', 'danger', 5000);
        return;
      }
      if (task.type === 'fix' && !windowOpen) {
        playCorrectSound(); setWindowOpen(true); setCurtainOpen(true);
        addFloat('\ud83e\udea9 Window & curtains open! \u2705', 'save');
        showFB('\u2705 Windows & curtains open! Fresh air and natural light flow in!', 'success');
        setFixActions(prev => [...prev, 'window_open']);
        return;
      }
      if (task.type === 'free_play') {
        if (windowOpen) { setWindowOpen(false); addFloat('Window closed', 'info'); }
        else { setWindowOpen(true); addFloat('Window opened', 'save'); }
        return;
      }
      return;
    }

    if (!L2_APPLIANCE_IDS.includes(appId)) return;
    const ap = L2_APPLIANCE_MAP[appId];

    if (task.type === 'turn_on') {
      if (appStates[appId]) { addFloat('Already ON', 'info'); return; }
      playToggleOn();
      setAppStates(prev => ({ ...prev, [appId]: true }));
      addFloat(`+${ap.wattage}W \u26a1`, 'damage');
      if (ap.wattage >= 1000) {
        playHeavyHum();
        showFB(`\u26a0\ufe0f ${ap.name} uses ${ap.wattage}W \u2014 massive power draw!`, 'danger');
      } else {
        showFB(`${ap.name} turned ON (+${ap.wattage}W)`, 'warning');
      }
      const newOn = [...turnedOn, appId];
      setTurnedOn(newOn);
      if (task.requiredOn.every(id => id === appId || appStates[id])) {
        playWarningSound();
        showFB('\ud83d\udca5 You are OVERUSING the house! Look at the environment...', 'danger', 4000);
        setTimeout(() => handleTaskComplete(), 2500);
      }
      return;
    }

    if (task.type === 'multi_step') {
      const step = task.steps[currentStep];
      if (!step) return;

      // ── DOOR STEP: Check proximity to the SPECIFIC door directly ──
      if (step.action === 'close_door_1') {
        // Door 1 is at position [0, 1.1, -4]
        const dx = playerState.x - 0;
        const dz = playerState.z - (-4);
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < 3.5 && !door1Closed) {
          playCorrectSound(); setDoor1Closed(true);
          addFloat(step.feedback, 'save');
          showFB('\ud83d\udeaa Door 1 closed! Living room \u2192 Bedroom sealed.', 'success');
          setStepsDone(prev => [...prev, step.id]);
          setCurrentStep(currentStep + 1);
        } else if (door1Closed) {
          showFB('\u2705 Door already closed!', 'info');
        } else {
          showFB('\ud83d\udeaa Walk closer to the Living \u2192 Bedroom door (green glow)!', 'warning');
        }
        return;
      }
      if (step.action === 'close_door_2') {
        // Door 2 is at position [5, 1.1, 0]
        const dx = playerState.x - 5;
        const dz = playerState.z - 0;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < 3.5 && !door2Closed) {
          playCorrectSound(); setDoor2Closed(true);
          addFloat(step.feedback, 'save');
          showFB('\ud83d\udeaa Door 2 closed! Bedroom \u2192 Bathroom sealed. Room FULLY sealed! \u2705', 'success');
          setStepsDone(prev => [...prev, step.id]);
          setCurrentStep(currentStep + 1);
        } else if (door2Closed) {
          showFB('\u2705 Door already closed!', 'info');
        } else {
          showFB('\ud83d\udeaa Walk closer to the Bedroom \u2192 Bathroom door (green glow)!', 'warning');
        }
        return;
      }

      if (step.action === 'turn_on' && step.target === appId) {
        if (appStates[appId]) { addFloat('Already ON', 'info'); return; }
        playToggleOn();
        setAppStates(prev => ({ ...prev, [appId]: true }));
        if (step.id === 'try_fan') {
          showFB('\ud83e\udd75 Fan is running... but still too hot! Need something stronger.', 'warning', 3500);
        } else if (step.id === 'turn_on_ac') {
          if (!windowOpen && !curtainOpen) {
            showFB('\u2705 AC is ON \u2014 closed room helps cooling efficiently!', 'success');
          } else {
            showFB('\u26a0\ufe0f AC ON but cooling is WEAK \u2014 close windows/curtains first!', 'danger');
            return;
          }
        }
        addFloat(step.feedback, 'save');
        setStepsDone(prev => [...prev, step.id]);
        setCurrentStep(currentStep + 1);
        // After AC is on and room is sealed, trigger AC scenarios if defined
        if (step.id === 'turn_on_ac' && task.hasACScenarios) {
          setTimeout(() => {
            setShowACScenarios(true);
            setScenarioIdx(0);
          }, 1200);
        }
      } else if (step.action === 'ac_scenarios') {
        // Already handled via the scenario UI
        if (!showACScenarios) {
          setShowACScenarios(true);
          setScenarioIdx(0);
        }
      } else if (step.action === 'interact_window' || step.action === 'interact_curtain') {
        showFB('\ud83e\udea9 Walk to a window and press E to close it!', 'info');
      } else if (step.action === 'turn_on') {
        playWrongSound();
        showFB(`Not what you need now. ${step.label}`, 'warning');
      }
      return;
    }

    if (task.type === 'eb_meter') {
      // EB meter is at x=-10.35, z=-1 (outside left wall near entrance)
      // Player can be near x=-9, z=-1 (inside living room near entrance wall)
      const dx = playerState.x - (-9);
      const dz = playerState.z - (-1);
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < 3 && !showEBMeter) {
        setShowEBMeter(true); playCorrectSound();
        showFB('\ud83d\udcca EB Meter Board opened! Investigate which appliances use the most power.', 'info');
      } else if (!showEBMeter) {
        showFB('\ud83d\udccd Walk to the EB Meter near the front door (left wall)!', 'info');
      }
      return;
    }

    if (task.type === 'air_check') {
      // Player near the front door at x=-10, z=-2
      const dx = playerState.x - (-9);
      const dz = playerState.z - (-2);
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < 3 && !showAirExperience) {
        playWarningSound();
        setShowAirExperience(true);
        setAirTimer(task.duration || 8);
        showFB('\ud83c\udf2b\ufe0f Look outside through the door... The air is hazardous!', 'danger', 5000);
      } else if (!showAirExperience) {
        showFB('\ud83d\udccd Walk to the front door area to check outside air quality!', 'info');
      }
      return;
    }

    if (task.type === 'exploration') {
      if (currentRoom === 'Living Room' && !showBillUI) {
        setShowBillUI(true); playCorrectSound();
        showFB('\ud83d\udcca Bill Analysis opened! Click appliances to investigate.', 'info');
      } else if (!showBillUI) {
        showFB('\ud83d\udccd Walk to the Living Room to find the meter board!', 'info');
      }
      return;
    }

    if (task.type === 'observation') { addFloat('\ud83d\udc41\ufe0f Just observe...', 'info'); return; }

    if (task.type === 'fix') {
      const ns = !appStates[appId];
      if (appId === 'geyser' && !ns) {
        playToggleOff(); setAppStates(prev => ({ ...prev, [appId]: false }));
        addFloat('-2000W saved! \ud83c\udf31', 'save');
        showFB('\u2705 Geyser turned OFF \u2014 massive energy saved!', 'success');
        setFixActions(prev => [...prev, 'geyser_off']);
      } else if (appId === 'ac_1_5ton' && !ns) {
        playToggleOff(); setAppStates(prev => ({ ...prev, [appId]: false }));
        addFloat('-1500W saved! \ud83c\udf31', 'save');
        showFB('\u2705 AC turned OFF \u2014 huge reduction!', 'success');
        setFixActions(prev => [...prev, 'ac_off']);
      } else if ((appId === 'ceiling_fan' || appId === 'table_fan') && ns) {
        playToggleOn(); setAppStates(prev => ({ ...prev, [appId]: true }));
        addFloat('+70W only! \ud83c\udf3f', 'save');
        showFB('\u2705 Fan ON \u2014 efficient cooling at just 70W!', 'success');
        setFixActions(prev => [...prev, 'fan_on']);
      } else {
        if (ns) playToggleOn(); else playToggleOff();
        setAppStates(prev => ({ ...prev, [appId]: ns }));
        addFloat(ns ? `+${ap.wattage}W` : `-${ap.wattage}W saved`, ns ? 'damage' : 'save');
      }
      return;
    }



    if (task.type === 'free_play') {
      const ns = !appStates[appId];
      if (ns) { playToggleOn(); addFloat(`+${ap.wattage}W`, 'damage'); }
      else { playToggleOff(); addFloat(`-${ap.wattage}W saved`, 'save'); }
      setAppStates(prev => ({ ...prev, [appId]: ns }));
      return;
    }

    const ns = !appStates[appId];
    if (ns) playToggleOn(); else playToggleOff();
    setAppStates(prev => ({ ...prev, [appId]: ns }));
    addFloat(ns ? `+${ap.wattage}W` : `-${ap.wattage}W`, ns ? 'damage' : 'save');
  }, [task, taskState, appStates, turnedOn, currentStep, stepsDone, windowOpen, curtainOpen, currentRoom, showBillUI, showEBMeter, showAirExperience, fixActions, addFloat, showFB, handleTaskComplete, showACScenarios, showPollutionOverlay, showIndianEBMeter, showFactoryInterior]);

  useEffect(() => {
    if (task?.type !== 'fix' || taskState !== 'playing') return;
    const h = a => fixActions.includes(a);
    if (h('geyser_off') && h('ac_off') && h('fan_on') && windowOpen) {
      showFB('\u{1F33F} Environment is recovering! Great job!', 'success', 3000);
      setTimeout(() => handleTaskComplete(), 2000);
    }
  }, [fixActions, windowOpen, task, taskState]);

  const handleCloseWindow = useCallback(() => {
    setWindowOpen(false); playCorrectSound();
    addFloat('\u{1FA9F} Window closed! \u{2705}', 'save');
    showFB('\u{2705} Window closed! Less heat coming in.', 'success');
    if (task?.type === 'multi_step' && task.steps[currentStep]?.id === 'close_window') {
      setStepsDone(prev => [...prev, 'close_window']); setCurrentStep(prev => prev + 1);
    }
  }, [task, currentStep, addFloat, showFB]);

  const handleCloseCurtain = useCallback(() => {
    setCurtainOpen(false); playCorrectSound();
    addFloat('\u{1FA9F} Curtain closed! \u{2705}', 'save');
    showFB('\u{2705} Curtain closed! Sun blocked, room stays cool.', 'success');
    if (task?.type === 'multi_step' && task.steps[currentStep]?.id === 'close_curtain') {
      setStepsDone(prev => [...prev, 'close_curtain']); setCurrentStep(prev => prev + 1);
    }
  }, [task, currentStep, addFloat, showFB]);

  const handleOpenWindow = useCallback(() => {
    setWindowOpen(true); playCorrectSound();
    addFloat('\u{1FA9F} Window opened! Fresh air! \u{2705}', 'save');
    showFB('\u{2705} Window opened! Natural ventilation flowing.', 'success');
    if (task?.type === 'fix') setFixActions(prev => [...prev, 'window_open']);
  }, [task, addFloat, showFB]);

  const handleSetTemp = useCallback(idx => {
    setAcTempIdx(idx);
    const s = AC_TEMP_SETTINGS[idx];
    if (s.warning) showFB(`\u{26A0}\u{FE0F} ${s.warning}`, 'warning');
  }, [showFB]);

  const handleTempConfirm = useCallback(() => {
    setShowTempKnob(false);
    const s = AC_TEMP_SETTINGS[acTempIdx];
    if (acTempIdx <= 1) { playWrongSound(); showFB(`\u{2744}\u{FE0F} ${s.temp}\u{00B0}C uses ${Math.round(s.wattMul * 100)}% power! Very wasteful.`, 'danger'); }
    else if (acTempIdx === OPTIMAL_TEMP_IDX) { playCorrectSound(); showFB('\u{2705} Perfect! 24\u{00B0}C = optimal comfort with minimal waste!', 'success'); }
    else { playCorrectSound(); showFB(`${s.temp}\u{00B0}C set. ${s.cooling} cooling.`, 'info'); }
    if (task?.type === 'multi_step') {
      setStepsDone(prev => [...prev, 'set_temp']); setCurrentStep(prev => prev + 1);
      setTimeout(() => handleTaskComplete(), 1500);
    }
  }, [acTempIdx, task, showFB, handleTaskComplete]);

  const startTask = useCallback(() => {
    setTaskState('playing');
    if (task?.type === 'observation') { setObsTimer(task.duration || 15); setObsRunning(true); }
    if (task?.type === 'free_play') { setExpTimer(task.experimentTime || 30); setExpRunning(true); }
  }, [task]);

  const advanceTask = useCallback(() => {
    const next = taskIdx + 1;
    if (next >= PHASE1_TASKS.length) { setTaskState('realization'); setRealStep(0); }
    else { setTaskIdx(next); setTaskState('intro'); }
  }, [taskIdx]);

  const handleQuizSelect = useCallback(idx => {
    if (quizSel !== null) return;
    setQuizSel(idx); setShowExplanation(true);
    if (idx === P1_QUIZ[quizIdx].correctIndex) { playCorrectSound(); setQuizScore(p => p + 1); }
    else playWrongSound();
  }, [quizSel, quizIdx]);

  const handleQuizNext = useCallback(() => {
    const next = quizIdx + 1;
    if (next >= P1_QUIZ.length) {
      setStars(calculateP1Stars(tasksCompleted, PHASE1_TASKS.length, quizScore, P1_QUIZ.length));
      setTaskState('complete'); playMilestoneSound();
    } else { setQuizIdx(next); setQuizSel(null); setShowExplanation(false); }
  }, [quizIdx, quizScore, tasksCompleted]);

  const handleBillClick = useCallback(appId => {
    setHighlightedApp(appId);
    setBillClicked(prev => { const n = new Set(prev); n.add(appId); return n; });
    const a = L2_APPLIANCE_MAP[appId];
    showFB(`\u{1F50D} ${a.name} (${a.wattage}W) \u{2014} highlighted in house!`, 'info');
    if (billClicked.size + 1 >= (task?.requiredClicks || 3)) {
      setTimeout(() => { setShowBillUI(false); setHighlightedApp(null); handleTaskComplete(); }, 2000);
    }
  }, [billClicked, task, showFB, handleTaskComplete]);

  // EB Meter click handler
  const handleEBClick = useCallback(appId => {
    setHighlightedApp(appId);
    setBillClicked(prev => { const n = new Set(prev); n.add(appId); return n; });
    const a = L2_APPLIANCE_MAP[appId];
    playCorrectSound();
    showFB(`\u{1F50D} ${a.name}: ${a.wattage}W \u{2014} highlighted in 3D view!`, 'info');
    if (billClicked.size + 1 >= (task?.requiredClicks || 3)) {
      setTimeout(() => { setShowEBMeter(false); setHighlightedApp(null); handleTaskComplete(); }, 2000);
    }
  }, [billClicked, task, showFB, handleTaskComplete]);

  // AC Scenario navigation
  const handleScenarioNext = useCallback(() => {
    const nextIdx = scenarioIdx + 1;
    if (nextIdx >= AC_SCENARIOS.length) {
      setShowACScenarios(false);
      playMilestoneSound();
      showFB('\u{2705} You now understand AC temperature science! 24\u{00B0}C + sealed room = BEST!', 'success', 4000);
      // Complete the learn_temp step
      setStepsDone(prev => [...prev, 'learn_temp']);
      setCurrentStep(prev => prev + 1);
      setTimeout(() => handleTaskComplete(), 2000);
    } else {
      setScenarioIdx(nextIdx);
    }
  }, [scenarioIdx, showFB, handleTaskComplete]);

  // Computed EB Meter data
  const ebMeter = useMemo(() => computeEBMeter(appStates, acTempIdx), [appStates, acTempIdx]);

  const expFB = useMemo(() => {
    if (task?.type !== 'free_play' || !expRunning) return null;
    if (appStates.ac_1_5ton && windowOpen) return EXPERIMENT_FEEDBACK.ac_on_window_open;
    if (appStates.ac_1_5ton && curtainOpen) return EXPERIMENT_FEEDBACK.ac_on_curtain_open;
    if ((appStates.ceiling_fan || appStates.table_fan) && windowOpen && !appStates.ac_1_5ton) return EXPERIMENT_FEEDBACK.fan_ventilation;
    if (env.watts > 3000) return EXPERIMENT_FEEDBACK.high_watts;
    if (env.watts > 0 && env.watts < 200) return EXPERIMENT_FEEDBACK.low_watts;
    if (appStates.ac_1_5ton && acTempIdx <= 1) return EXPERIMENT_FEEDBACK.ac_18;
    if (appStates.ac_1_5ton && acTempIdx === OPTIMAL_TEMP_IDX) return EXPERIMENT_FEEDBACK.ac_24;
    return null;
  }, [appStates, windowOpen, curtainOpen, env.watts, acTempIdx, expRunning, task]);

  const highlightIds = highlightedApp ? [highlightedApp] : (task?.requiredOn || null);

  // ═══════════════════════════════════════════════════════════
  //  RENDER: TASK INTRO
  // ═══════════════════════════════════════════════════════════
  if (taskState === 'intro' && task) {
    return (
      <div className="l3p1-container">
        <div className="l3p1-intro-overlay">
          <div className="l3p1-intro-card">
            <div className="l3p1-intro-dot" style={{ color: task.color }}>{task.colorDot}</div>
            <div className="l3p1-intro-number">TASK {task.number} of {PHASE1_TASKS.length}</div>
            <h2 className="l3p1-intro-title">{task.icon} {task.title}</h2>
            <div className="l3p1-intro-subtitle">{task.subtitle}</div>
            <p className="l3p1-intro-desc">{task.description}</p>
            <div className="l3p1-intro-instruction">{'\u{1F3AE}'} {task.instruction}</div>
            <button className="l3p1-start-btn" onClick={startTask}>Start Task {'\u{2192}'}</button>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  //  RENDER: TASK SUMMARY
  // ═══════════════════════════════════════════════════════════
  if (taskState === 'summary' && task) {
    return (
      <div className="l3p1-container">
        <div className="l3p1-summary-overlay">
          <div className="l3p1-summary-card">
            <div className="l3p1-summary-icon">{'\u{2705}'}</div>
            <h3 className="l3p1-summary-title">Task {task.number} Complete!</h3>
            {task.learning && (
              <div className="l3p1-summary-learning">
                <div className="l3p1-learn-title">{task.learning.title}</div>
                {task.learning.messages.map((msg, i) => (
                  <div key={i} className="l3p1-learn-item">{'\u{1F4A1}'} {msg}</div>
                ))}
              </div>
            )}
            <button className="l3p1-next-btn" onClick={advanceTask}>
              {taskIdx + 1 >= PHASE1_TASKS.length ? 'Final Reflection \u{2192}' : 'Next Task \u{2192}'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  //  RENDER: REALIZATION SCENE
  // ═══════════════════════════════════════════════════════════
  if (taskState === 'realization') {
    return (
      <div className="l3p1-container">
        <div className="l3p1-real-overlay">
          <div className="l3p1-real-env">
            <Canvas camera={{ position: [0, 8, 20], fov: 55 }} gl={{ antialias: false }}
              onCreated={({ gl }) => { gl.setClearColor('#0a0505'); }}>
              <Suspense fallback={null}>
                <Level3Environment damageLevel={0.35} />
              </Suspense>
            </Canvas>
          </div>
          {REALIZATION_LINES.slice(0, realStep + 1).map((line, i) => (
            <div key={i} className={`l3p1-real-line ${line.speaker === 'teacher' ? 'teacher' : ''}`}
              style={{ animationDelay: `${i * 0.3}s` }}>
              {line.speaker === 'teacher' ? '\u{1F9D1}\u{200D}\u{1F3EB} ' : ''}{line.text}
            </div>
          ))}
          {realStep < REALIZATION_LINES.length - 1 ? (
            <button className="l3p1-real-continue" onClick={() => setRealStep(s => s + 1)}>...</button>
          ) : (
            <button className="l3p1-real-continue" onClick={() => setTaskState('quiz')}>Take the Quiz {'\u{2192}'}</button>
          )}
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  //  RENDER: QUIZ
  // ═══════════════════════════════════════════════════════════
  if (taskState === 'quiz') {
    const q = P1_QUIZ[quizIdx];
    return (
      <div className="l3p1-container">
        <div className="l3p1-quiz-overlay">
          <div className="l3p1-quiz-card">
            <div className="l3p1-quiz-progress">{'\u{1F9E0}'} Question {quizIdx + 1} of {P1_QUIZ.length}</div>
            <div className="l3p1-quiz-question">{q.question}</div>
            <div>
              {q.options.map((opt, i) => {
                let cls = 'l3p1-quiz-option';
                if (quizSel !== null) {
                  if (i === q.correctIndex) cls += ' correct';
                  else if (i === quizSel) cls += ' wrong';
                }
                return <button key={i} className={cls} onClick={() => handleQuizSelect(i)} disabled={quizSel !== null}>{opt}</button>;
              })}
            </div>
            {showExplanation && (<>
              <div className="l3p1-quiz-explanation">
                {quizSel === q.correctIndex ? '\u{2705} Correct! ' : '\u{274C} Not quite. '}{q.explanation}
              </div>
              <button className="l3p1-quiz-next" onClick={handleQuizNext}>
                {quizIdx + 1 >= P1_QUIZ.length ? 'Finish Quiz \u{2192}' : 'Next Question \u{2192}'}
              </button>
            </>)}
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  //  RENDER: PHASE COMPLETE
  // ═══════════════════════════════════════════════════════════
  if (taskState === 'complete') {
    const coins = PHASE1_BADGE.coins + stars * 10 + tasksCompleted * 5;
    return (
      <div className="l3p1-container">
        <div className="l3p1-complete-overlay">
          <div className="l3p1-complete-card">
            <div className="l3p1-complete-badge">{PHASE1_BADGE.icon}</div>
            <h2 className="l3p1-complete-title">Phase 1 Complete!</h2>
            <p className="l3p1-complete-subtitle">{PHASE1_BADGE.description}</p>
            <div className="l3p1-complete-stars">
              {[1, 2, 3].map(s => (
                <span key={s} className={`l3p1-star ${s <= stars ? 'earned' : ''}`}
                  style={{ animationDelay: `${s * 0.3}s` }}>{'\u{2B50}'}</span>
              ))}
            </div>
            <div className="l3p1-complete-stats">
              <div className="l3p1-cstat"><div className="l3p1-cstat-val">{tasksCompleted}/{PHASE1_TASKS.length}</div><div className="l3p1-cstat-lbl">Tasks Done</div></div>
              <div className="l3p1-cstat"><div className="l3p1-cstat-val">{quizScore}/{P1_QUIZ.length}</div><div className="l3p1-cstat-lbl">Quiz Score</div></div>
              <div className="l3p1-cstat"><div className="l3p1-cstat-val">+{coins}</div><div className="l3p1-cstat-lbl">Coins</div></div>
            </div>
            <div className="l3p1-complete-coins">{'\u{1FA99}'} +{coins} Carbon Coins earned!</div>
            <button className="l3p1-continue-btn" onClick={onComplete}>Continue to Phase 2 {'\u{2192}'}</button>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  //  RENDER: MAIN GAMEPLAY — 3D SCENE + HUD + ALL SYSTEMS
  // ═══════════════════════════════════════════════════════════
  const inC = env.indoorTemp > 32 ? '#ef4444' : env.indoorTemp > 28 ? '#f59e0b' : '#22c55e';
  const outC = env.outdoorTemp > 40 ? '#ef4444' : env.outdoorTemp > 37 ? '#f59e0b' : '#22c55e';
  const co2C = env.co2Level > 0.6 ? '#ef4444' : env.co2Level > 0.3 ? '#f59e0b' : '#22c55e';
  const wC = env.watts > 3000 ? '#ef4444' : env.watts > 1000 ? '#f59e0b' : '#22c55e';

  const showCloseWin = windowOpen && task && ((task.type === 'multi_step' && task.steps[currentStep]?.id === 'close_window') || task.type === 'free_play');
  const showCloseCur = curtainOpen && task && ((task.type === 'multi_step' && task.steps[currentStep]?.id === 'close_curtain') || task.type === 'free_play');
  const showOpenWin = !windowOpen && task && ((task.type === 'fix' && !fixActions.includes('window_open')) || task.type === 'free_play');

  // Compute which door step is currently active for door highlighting
  const currentDoorStep = (task?.type === 'multi_step' && task.steps[currentStep]) ? task.steps[currentStep].action : null;

  // CO₂ educational data
  const co2Kg = (env.watts * 0.71 / 1000).toFixed(2);
  const coalKg = (env.watts * 0.0007).toFixed(2);

  // Determine if player should be allowed outside
  const allowOutside = task?.allowOutside && taskState === 'playing';

  return (
    <div className="l3p1-container">
      <div className="l3p1-canvas-wrapper">
        <Canvas camera={{ position: [-5, 6, 1], fov: 50 }} gl={{ antialias: false }}
          onCreated={({ gl }) => { gl.setClearColor('#080808'); gl.toneMapping = 1; gl.toneMappingExposure = 1.0; gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); }}>
          <Suspense fallback={null}>
            <SceneContent applianceStates={appStates} nearestAppliance={nearestApp} highlightIds={highlightIds}
              onRoomChange={handleRoomChange} onNearestChange={handleNearestChange} onInteract={handleInteract}
              cameraRef={cameraRef} proximityLevels={proxLevels} damageLevel={env.damageLevel}
              windowOpen={windowOpen} curtainOpen={curtainOpen} door1Closed={door1Closed} door2Closed={door2Closed} showDoors={showDoors} currentDoorStep={currentDoorStep}
              allowOutside={allowOutside}
              showFactory={task?.type === 'factory_visit' && taskState === 'playing'}
              showEBMeterOutside={task?.type === 'eb_meter_outside' && taskState === 'playing'} />
          </Suspense>
        </Canvas>
        <div className={`l3p1-vignette ${vignetteClass}`} />
        <div className={`l3p1-fog-overlay ${fogLevel}`} />
        <div className="l3p1-heat-tint" style={{ background: heatTint }} />
        {/* Pollution visual when outside */}
        {showPollutionOverlay && (
          <div className="l3p1-pollution-overlay active">
            <div className="l3p1-pollution-particles" />
            <div className="l3p1-aqi-badge">
              <div className="l3p1-aqi-value">AQI 387</div>
              <div className="l3p1-aqi-label">HAZARDOUS</div>
              <div className="l3p1-aqi-detail">PM2.5: 285 µg/m³</div>
            </div>
          </div>
        )}
      </div>

      {/* TOP HUD */}
      <div className="l3p1-hud-top">
        <button className="l3p1-back-btn" onClick={() => navigate('/hub')}>{'\u{2190}'} Back</button>
        <div className="l3p1-hud-title">{'\u{1F525}'} Energy Consequences</div>
        <div className="l3p1-hud-room">{'\u{1F4CD}'} {currentRoom || 'Outside'}</div>
      </div>

      {/* DASHBOARD — 5 Live Metrics */}
      <div className="l3p1-dashboard">
        <DashboardMetric icon={'\u{1F321}\u{FE0F}'} value={<AnimatedValue value={env.indoorTemp} suffix={'\u{00B0}C'} />} label="Indoor" color={inC} pulse={env.indoorTemp > 34} />
        <DashboardMetric icon={'\u{2600}\u{FE0F}'} value={<AnimatedValue value={env.outdoorTemp} suffix={'\u{00B0}C'} decimals={1} />} label="Outdoor" color={outC} pulse={env.outdoorTemp > 40} />
        <DashboardMetric icon={'\u{1F30D}'} value={<AnimatedValue value={Math.round(env.co2Level * 100)} suffix="%" />} label={'CO\u{2082}'} color={co2C} pulse={env.co2Level > 0.6} />
        <DashboardMetric icon={'\u{1F4B0}'} value={<AnimatedValue value={env.monthlyBill} prefix={'\u{20B9}'} />} label="Bill/mo" color={env.monthlyBill > 2000 ? '#ef4444' : '#22c55e'} />
        <DashboardMetric icon={'\u{26A1}'} value={<AnimatedValue value={env.watts} suffix="W" />} label="Power" color={wC} pulse={env.watts > 3000} />
      </div>

      {/* CO₂ EDUCATIONAL DETAIL — shows coal/CO₂ impact */}
      {env.watts > 0 && taskState === 'playing' && (
        <div className="l3p1-co2-detail">
          <div className="l3p1-co2-detail-row">
            <span className="l3p1-co2-icon">{"\u{1F3ED}"}</span>
            <span className="l3p1-co2-label">Coal Burning:</span>
            <span className="l3p1-co2-val" style={{color:'#f59e0b'}}>{coalKg} kg/hr</span>
          </div>
          <div className="l3p1-co2-detail-row">
            <span className="l3p1-co2-icon">{"\u{1F32B}\u{FE0F}"}</span>
            <span className="l3p1-co2-label">CO{"\u{2082}"} Emitting:</span>
            <span className="l3p1-co2-val" style={{color: env.co2Level > 0.5 ? '#ef4444' : '#f59e0b'}}>{co2Kg} kg/hr</span>
          </div>
          {env.watts > 1000 && (
            <div className="l3p1-co2-warning">{"\u{26A0}\u{FE0F}"} High energy = More coal burned at power plant!</div>
          )}
        </div>
      )}

      {/* TASK BAR */}
      {task && taskState === 'playing' && (
        <div className="l3p1-task-bar" style={{ '--task-color': task.color }}>
          <div className="l3p1-task-header">
            <span className="l3p1-task-dot">{task.colorDot}</span>
            <span className="l3p1-task-num">Task {task.number}/{PHASE1_TASKS.length}</span>
          </div>
          <div className="l3p1-task-title">{task.icon} {task.title}</div>
          <div className="l3p1-task-subtitle">{task.subtitle}</div>
          <div className="l3p1-task-instruction">{task.instruction}</div>
          <div className="l3p1-task-hint">{'\u{1F4A1}'} {task.hint}</div>
          {task.type === 'multi_step' && task.steps && (
            <div className="l3p1-steps-list">
              {task.steps.map((step, i) => (
                <StepItem key={step.id} label={step.label} done={stepsDone.includes(step.id)} active={i === currentStep} />
              ))}
            </div>
          )}
          {task.type === 'turn_on' && task.requiredOn && (
            <div className="l3p1-task-progress">
              <div className="l3p1-task-progress-bar">
                <div className="l3p1-task-progress-fill" style={{ width: `${(task.requiredOn.filter(id => appStates[id]).length / task.requiredOn.length) * 100}%`, background: task.color }} />
              </div>
              <div className="l3p1-task-progress-text"><span>{task.requiredOn.filter(id => appStates[id]).length}/{task.requiredOn.length} turned ON</span></div>
            </div>
          )}
          {task.type === 'fix' && (
            <div className="l3p1-task-progress">
              <div className="l3p1-task-progress-bar">
                <div className="l3p1-task-progress-fill" style={{ width: `${(fixActions.length / (task.requiredActions?.length || 4)) * 100}%`, background: '#22c55e' }} />
              </div>
              <div className="l3p1-task-progress-text"><span>{fixActions.length}/{task.requiredActions?.length || 4} actions done</span></div>
            </div>
          )}
        </div>
      )}

      {/* OBSERVATION TIMER */}
      {task?.type === 'observation' && obsRunning && (
        <div className="l3p1-obs-timer">
          <div className="l3p1-obs-timer-val">{obsTimer}s</div>
          <div className="l3p1-obs-timer-lbl">Observing</div>
          <div className="l3p1-obs-msg">{'\u{1F441}\u{FE0F}'} Watch how the outdoor temp and CO{'\u{2082}'} keep rising...</div>
        </div>
      )}

      {/* EXPERIMENT TIMER */}
      {task?.type === 'free_play' && expRunning && (
        <div className="l3p1-obs-timer">
          <div className="l3p1-obs-timer-val">{expTimer}s</div>
          <div className="l3p1-obs-timer-lbl">Experiment</div>
          {expFB && <div className="l3p1-obs-msg">{expFB}</div>}
          <div className="l3p1-obs-msg" style={{ marginTop: 4, color: '#22c55e' }}>
            Best: {bestWatts < 99999 ? `${bestWatts}W` : '\u{2014}'} {bestWatts <= 200 ? '\u{1F33F}' : ''}
          </div>
        </div>
      )}

      {/* CONTEXT ACTIONS */}
      <div className="l3p1-context-actions">
        {showCloseWin && <button className="l3p1-ctx-btn" onClick={handleCloseWindow}>{'\u{1FA9F}'} Close Window</button>}
        {showCloseCur && <button className="l3p1-ctx-btn" onClick={handleCloseCurtain}>{'\u{1FA9F}'} Close Curtain</button>}
        {showOpenWin && <button className="l3p1-ctx-btn" onClick={handleOpenWindow}>{'\u{1FA9F}'} Open Window</button>}
        {task?.type === 'free_play' && appStates.ac_1_5ton && (
          <button className="l3p1-ctx-btn" onClick={() => setShowTempKnob(true)}>{'\u{1F321}\u{FE0F}'} Adjust AC Temp</button>
        )}
      </div>

      {/* FEEDBACK — Enhanced visibility */}
      {feedback && (
        <div className={`l3p1-feedback ${feedback.type}`}>
          <div className="l3p1-feedback-content">{feedback.text}</div>
        </div>
      )}
      <div className="l3p1-float-container">
        {floats.map(ft => <FloatingText key={ft.id} {...ft} onDone={removeFloat} />)}
      </div>

      {/* AC TEMPERATURE KNOB */}
      {showTempKnob && (
        <div className="l3p1-temp-knob-overlay">
          <div className="l3p1-temp-knob-card">
            <div className="l3p1-temp-title">{'\u{1F321}\u{FE0F}'} Set AC Temperature</div>
            <div className="l3p1-temp-display" style={{ color: AC_TEMP_SETTINGS[acTempIdx].color }}>
              {AC_TEMP_SETTINGS[acTempIdx].temp}{'\u{00B0}'}C
            </div>
            <div className="l3p1-temp-label" style={{ color: AC_TEMP_SETTINGS[acTempIdx].color }}>
              {AC_TEMP_SETTINGS[acTempIdx].cooling} Cooling
            </div>
            <input type="range" min={0} max={AC_TEMP_SETTINGS.length - 1} value={acTempIdx}
              onChange={e => handleSetTemp(Number(e.target.value))} className="l3p1-temp-slider"
              style={{ background: 'linear-gradient(90deg, #3b82f6, #22c55e, #f59e0b)' }} />
            <div className="l3p1-temp-watts" style={{ color: AC_TEMP_SETTINGS[acTempIdx].color }}>
              {'\u{26A1}'} ~{Math.round(1500 * AC_TEMP_SETTINGS[acTempIdx].wattMul)}W power draw
            </div>
            {AC_TEMP_SETTINGS[acTempIdx].warning && (
              <div className="l3p1-temp-warning">{'\u{26A0}\u{FE0F}'} {AC_TEMP_SETTINGS[acTempIdx].warning}</div>
            )}
            <button className="l3p1-temp-set-btn" onClick={handleTempConfirm}>Set Temperature {'\u{2705}'}</button>
          </div>
        </div>
      )}

      {/* EB METER BOARD */}
      {showEBMeter && (
        <div className="l3p1-eb-overlay">
          <div className="l3p1-eb-card">
            <div className="l3p1-eb-header">
              <div className="l3p1-eb-icon">{'\u{1F4E1}'}</div>
              <div className="l3p1-eb-label">TNEB Energy Meter</div>
              <div className="l3p1-eb-title">{'\u{26A1}'} Electricity Board Meter</div>
            </div>
            <div className="l3p1-eb-meter-box">
              <div className="l3p1-eb-reading"><AnimatedValue value={ebMeter.totalKwh} /> kWh</div>
              <div className="l3p1-eb-reading-sub">Monthly Consumption Reading</div>
            </div>
            <div className="l3p1-eb-stats">
              <div className="l3p1-eb-stat">
                <div className="l3p1-eb-stat-val" style={{color:'#f59e0b'}}>{'\u{20B9}'}<AnimatedValue value={ebMeter.totalCost} /></div>
                <div className="l3p1-eb-stat-lbl">Monthly Bill</div>
              </div>
              <div className="l3p1-eb-stat">
                <div className="l3p1-eb-stat-val" style={{color:'#ef4444'}}><AnimatedValue value={ebMeter.totalWatts} />W</div>
                <div className="l3p1-eb-stat-lbl">Current Load</div>
              </div>
            </div>
            {ebMeter.topConsumer && (
              <div className="l3p1-eb-top-consumer">
                <div className="l3p1-eb-top-label">{'\u{1F6A8}'} Highest Consumer</div>
                <div className="l3p1-eb-top-name">{ebMeter.topConsumer.icon} {ebMeter.topConsumer.name}</div>
                <div className="l3p1-eb-top-detail">{ebMeter.topConsumer.wattage}W {'\u{2022}'} {ebMeter.topConsumer.monthlyKwh} kWh/mo {'\u{2022}'} {'\u{20B9}'}{ebMeter.topConsumer.monthlyCost}/mo</div>
              </div>
            )}
            <div className="l3p1-eb-breakdown-title">{'\u{1F4CA}'} Full Breakdown (click to investigate)</div>
            <div className="l3p1-eb-progress">{'\u{1F50D}'} Investigated: {billClicked.size}/{task?.requiredClicks || 3}</div>
            {ebMeter.breakdown.map(a => {
              const pct = ebMeter.totalCost > 0 ? Math.round((a.monthlyCost / ebMeter.totalCost) * 100) : 0;
              const color = a.wattage >= 1000 ? '#ef4444' : a.wattage >= 200 ? '#f59e0b' : '#22c55e';
              return (
                <div key={a.id} className={`l3p1-eb-row ${billClicked.has(a.id) ? 'investigated' : ''}`}
                  onClick={() => handleEBClick(a.id)}>
                  <div className="l3p1-eb-row-icon">{a.icon}</div>
                  <div className="l3p1-eb-row-info">
                    <div className="l3p1-eb-row-name">{a.name}</div>
                    <div className="l3p1-eb-row-watts">{a.wattage}W {'\u{2022}'} {a.hours}h/day {'\u{2022}'} {a.monthlyKwh} kWh/mo</div>
                    <div className="l3p1-eb-row-bar-wrap">
                      <div className="l3p1-eb-row-bar" style={{ width: `${pct}%`, background: color }} />
                    </div>
                  </div>
                  <div className="l3p1-eb-row-cost" style={{ color }}>{'\u{20B9}'}{a.monthlyCost}</div>
                </div>
              );
            })}
            <button className="l3p1-eb-close" onClick={() => { setShowEBMeter(false); setHighlightedApp(null); }}>Close Meter {'\u{2714}'}</button>
          </div>
        </div>
      )}

      {/* AC SCENARIO TEACHING UI */}
      {showACScenarios && (
        <div className="l3p1-scenario-overlay">
          <div className="l3p1-scenario-card">
            <div className="l3p1-scenario-step">Scenario {scenarioIdx + 1} of {AC_SCENARIOS.length}</div>
            <div className="l3p1-scenario-title">{AC_SCENARIOS[scenarioIdx].title}</div>
            <div className="l3p1-scenario-setup">
              {AC_SCENARIOS[scenarioIdx].setup.temp && (
                <span className={`l3p1-scenario-tag ${AC_SCENARIOS[scenarioIdx].setup.temp <= 20 ? 'bad' : AC_SCENARIOS[scenarioIdx].setup.temp === 24 ? 'good' : 'neutral'}`}>
                  {'\u{1F321}\u{FE0F}'} {AC_SCENARIOS[scenarioIdx].setup.temp}{'\u{00B0}'}C
                </span>
              )}
              {AC_SCENARIOS[scenarioIdx].setup.fanOn && (
                <span className="l3p1-scenario-tag good">{'\u{1F32C}\u{FE0F}'} Fan ON</span>
              )}
              <span className={`l3p1-scenario-tag ${AC_SCENARIOS[scenarioIdx].setup.windowOpen ? 'bad' : 'good'}`}>
                {AC_SCENARIOS[scenarioIdx].setup.windowOpen ? '\u{1FA9F} Windows OPEN' : '\u{1FA9F} Windows CLOSED'}
              </span>
              <span className={`l3p1-scenario-tag ${AC_SCENARIOS[scenarioIdx].setup.curtainOpen ? 'bad' : 'good'}`}>
                {AC_SCENARIOS[scenarioIdx].setup.curtainOpen ? '\u{2600}\u{FE0F} Curtains OPEN' : '\u{1F319} Curtains CLOSED'}
              </span>
            </div>
            <div className={`l3p1-scenario-result ${AC_SCENARIOS[scenarioIdx].result.status}`}>
              <div className="l3p1-scenario-icon">{AC_SCENARIOS[scenarioIdx].result.icon}</div>
              <div className="l3p1-scenario-indoor">{AC_SCENARIOS[scenarioIdx].result.indoorResult}</div>
              <div className="l3p1-scenario-watts">{'\u{26A1}'} {AC_SCENARIOS[scenarioIdx].result.watts}W {'\u{2022}'} {'\u{20B9}'}{AC_SCENARIOS[scenarioIdx].result.monthlyExtra >= 0 ? '+' : ''}{AC_SCENARIOS[scenarioIdx].result.monthlyExtra}/month extra</div>
              <div className="l3p1-scenario-msg">{AC_SCENARIOS[scenarioIdx].result.message}</div>
              <div className="l3p1-scenario-lesson">{'\u{1F4A1}'} {AC_SCENARIOS[scenarioIdx].result.lesson}</div>
            </div>
            <button className="l3p1-scenario-next" onClick={handleScenarioNext}>
              {scenarioIdx + 1 >= AC_SCENARIOS.length ? 'I Understand! \u{2705}' : 'Next Scenario \u{2192}'}
            </button>
          </div>
        </div>
      )}

      {/* AIR QUALITY EXPERIENCE */}
      <div className={`l3p1-air-overlay ${showAirExperience ? 'active' : ''}`}>
        <div className="l3p1-air-info">
          <div className="l3p1-air-icon">{'\u{1F32B}\u{FE0F}'}</div>
          <div className="l3p1-air-text">Hazardous Air Quality</div>
          <div className="l3p1-air-sub">
            Your energy use has created visible pollution outside.
            CO{'\u{2082}'} from power plants is choking the air.
            Every watt of coal-powered electricity adds to this.
          </div>
          {airTimer > 0 && <div className="l3p1-air-timer">{airTimer}s</div>}
        </div>
      </div>

      {/* BILL ANALYSIS UI (legacy fallback) */}
      {showBillUI && (
        <div className="l3p1-bill-overlay">
          <div className="l3p1-bill-card">
            <div className="l3p1-bill-title">{'\u{1F4CA}'} Electricity Bill Analysis</div>
            <div className="l3p1-bill-total">{'\u{20B9}'}<AnimatedValue value={env.monthlyBill} />/month</div>
            <div className="l3p1-bill-clicked-count">
              {'\u{1F50D}'} Investigated: {billClicked.size}/{task?.requiredClicks || 3} {'\u{2014}'} Click appliances below!
            </div>
            {BILL_APPLIANCES.filter(a => appStates[a.id]).map(a => {
              const pct = env.watts > 0 ? Math.round((a.wattage / env.watts) * 100) : 0;
              const color = a.wattage >= 1000 ? '#ef4444' : a.wattage >= 200 ? '#f59e0b' : '#22c55e';
              return (
                <div key={a.id} className={`l3p1-bill-row ${highlightedApp === a.id ? 'highlighted' : ''}`}
                  onClick={() => handleBillClick(a.id)}>
                  <div className="l3p1-bill-row-icon">{a.icon}</div>
                  <div className="l3p1-bill-row-info">
                    <div className="l3p1-bill-row-name">{a.name} ({a.wattage}W)</div>
                    <div className="l3p1-bill-row-detail">{a.hours}h/day {'\u{2022}'} {a.monthlyKwh} kWh/mo {'\u{2022}'} {a.co2Monthly}kg CO{'\u{2082}'}</div>
                    <div className="l3p1-bill-row-bar">
                      <div className="l3p1-bill-row-bar-fill" style={{ width: `${pct}%`, background: color }} />
                    </div>
                  </div>
                  <div className="l3p1-bill-row-cost" style={{ color }}>{pct}%</div>
                </div>
              );
            })}
            <button className="l3p1-bill-close" onClick={() => { setShowBillUI(false); setHighlightedApp(null); }}>Close Bill Analysis</button>
          </div>
        </div>
      )}

      {/* PROXIMITY PROMPT for window/curtain/door interaction */}
      {task && taskState === 'playing' && task.type === 'multi_step' && task.steps[currentStep] && 
       (task.steps[currentStep].action === 'interact_window' || task.steps[currentStep].action === 'interact_curtain' || task.steps[currentStep].action === 'close_door_1' || task.steps[currentStep].action === 'close_door_2') && (
        <div className="l3p1-proximity-prompt l3p1-proximity-prompt--action l3p1-proximity-prompt--enhanced">
          <div className="l3p1-prompt-icon">
            {(task.steps[currentStep].action === 'close_door_1' || task.steps[currentStep].action === 'close_door_2') ? '\ud83d\udeaa' : '\ud83e\udea9'}
          </div>
          <div className="l3p1-prompt-text">
            {task.steps[currentStep].action === 'close_door_1'
              ? 'Walk to the bedroom door and press E to close it!'
              : task.steps[currentStep].action === 'close_door_2'
              ? 'Walk to the bathroom door and press E to close it!'
              : `Walk to a window and press E to ${task.steps[currentStep].action === 'interact_window' ? 'close the window' : 'close the curtain'}!`
            }
          </div>
          <div className="l3p1-prompt-key">
            <span className="l3p1-key-badge">E</span> Interact
          </div>
        </div>
      )}

      {/* PROXIMITY PROMPT for EB Meter */}
      {task && taskState === 'playing' && task.type === 'eb_meter' && !showEBMeter && (
        <div className="l3p1-proximity-prompt l3p1-proximity-prompt--action">
          {'\u{1F4E1}'} Walk to the EB Meter Board near the front door (left wall) and press E!
        </div>
      )}

      {/* PROXIMITY PROMPT for CO2 Journey */}
      {task && taskState === 'playing' && task.type === 'co2_journey' && !showCO2Journey && (
        <div className="l3p1-proximity-prompt l3p1-proximity-prompt--action l3p1-proximity-prompt--enhanced">
          <div className="l3p1-prompt-icon">{'\u{1F3ED}'}</div>
          <div className="l3p1-prompt-text">Walk to the front door and press E to see the Coal {'\u2192'} Electricity journey!</div>
          <div className="l3p1-prompt-key">
            <span className="l3p1-key-badge">E</span> Start Journey
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════ */}
      {/*  CO₂ FACTORY VISUALIZATION — Full-screen animated overlay  */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {showCO2Journey && CO2_JOURNEY_STEPS && (
        <div className="co2j-overlay">
          <div className="co2j-container">
            {/* Progress bar */}
            <div className="co2j-progress-bar">
              <div className="co2j-progress-fill" style={{ width: `${((co2Step + 1) / CO2_JOURNEY_STEPS.length) * 100}%` }} />
              <span className="co2j-progress-text">Stage {co2Step + 1} of {CO2_JOURNEY_STEPS.length}</span>
            </div>

            {/* Step indicators */}
            <div className="co2j-steps-row">
              {CO2_JOURNEY_STEPS.map((s, i) => (
                <div key={s.id} className={`co2j-step-dot ${i < co2Step ? 'done' : i === co2Step ? 'active' : ''}`}>
                  <span className="co2j-step-dot-icon">{i < co2Step ? '\u2705' : s.icon}</span>
                </div>
              ))}
            </div>

            {/* Arrow chain between dots */}
            <div className="co2j-chain">
              {CO2_JOURNEY_STEPS.map((s, i) => (
                <React.Fragment key={s.id}>
                  <div className={`co2j-chain-node ${i <= co2Step ? 'lit' : ''}`}>{s.icon}</div>
                  {i < CO2_JOURNEY_STEPS.length - 1 && (
                    <div className={`co2j-chain-arrow ${i < co2Step ? 'lit' : ''}`}>{'\u2192'}</div>
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Main content card */}
            <div className="co2j-card" style={{ background: CO2_JOURNEY_STEPS[co2Step]?.bg || '#1a1a2e' }}>
              <div className="co2j-card-icon">{CO2_JOURNEY_STEPS[co2Step]?.icon}</div>
              <h2 className="co2j-card-title">{CO2_JOURNEY_STEPS[co2Step]?.title}</h2>
              <p className="co2j-card-desc">{CO2_JOURNEY_STEPS[co2Step]?.description}</p>
              
              {/* Animated visual for the current step */}
              <div className={`co2j-animation co2j-anim-${CO2_JOURNEY_STEPS[co2Step]?.animation}`}>
                {CO2_JOURNEY_STEPS[co2Step]?.animation === 'mine' && (
                  <div className="co2j-mine-visual">
                    <div className="co2j-rock">{'⛏️'}</div>
                    <div className="co2j-coal-pieces">
                      {[1,2,3,4,5].map(i => <div key={i} className="co2j-coal-piece" style={{'--delay': `${i * 0.3}s`}}>{'🪨'}</div>)}
                    </div>
                  </div>
                )}
                {CO2_JOURNEY_STEPS[co2Step]?.animation === 'train' && (
                  <div className="co2j-train-visual">
                    <div className="co2j-train">{'🚂'}</div>
                    <div className="co2j-tracks">{'━━━━━━━━━━━━━━━'}</div>
                  </div>
                )}
                {CO2_JOURNEY_STEPS[co2Step]?.animation === 'burn' && (
                  <div className="co2j-burn-visual">
                    <div className="co2j-furnace">{'🔥'}</div>
                    <div className="co2j-smoke">
                      {[1,2,3,4,5,6].map(i => <div key={i} className="co2j-smoke-puff" style={{'--delay': `${i * 0.5}s`}}>{'💨'}</div>)}
                    </div>
                  </div>
                )}
                {CO2_JOURNEY_STEPS[co2Step]?.animation === 'spin' && (
                  <div className="co2j-spin-visual">
                    <div className="co2j-turbine">{'⚙️'}</div>
                    <div className="co2j-steam">{'💨'}</div>
                    <div className="co2j-bolt">{'⚡'}</div>
                  </div>
                )}
                {CO2_JOURNEY_STEPS[co2Step]?.animation === 'grid' && (
                  <div className="co2j-grid-visual">
                    <div className="co2j-tower">{'🗼'}</div>
                    <div className="co2j-wire">{'━━⚡━━⚡━━⚡━━'}</div>
                    <div className="co2j-city">{'🏘️'}</div>
                  </div>
                )}
                {CO2_JOURNEY_STEPS[co2Step]?.animation === 'home' && (
                  <div className="co2j-home-visual">
                    <div className="co2j-house">{'🏠'}</div>
                    <div className="co2j-plug">{'🔌'}</div>
                    <div className="co2j-apps-grid">
                      {APPLIANCE_COAL_DATA && Object.entries(APPLIANCE_COAL_DATA).filter(([id]) => appStates[id]).map(([id, data]) => (
                        <div key={id} className="co2j-app-chip">
                          <span>{data.icon}</span>
                          <span className="co2j-app-name">{data.name}</span>
                          <span className="co2j-app-coal">{data.coalPerHr} kg/hr</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Fact box */}
              <div className="co2j-fact-box">
                <div className="co2j-fact-label">{'\u{1F4A1}'} Did You Know?</div>
                <div className="co2j-fact-text">{CO2_JOURNEY_STEPS[co2Step]?.fact}</div>
              </div>

              {/* Detail box */}
              <div className="co2j-detail-box">
                <div className="co2j-detail-text">{CO2_JOURNEY_STEPS[co2Step]?.detail}</div>
              </div>

              {/* Coal impact on final step */}
              {co2Step === CO2_JOURNEY_STEPS.length - 1 && APPLIANCE_COAL_DATA && (
                <div className="co2j-impact-section">
                  <div className="co2j-impact-title">{'\u{1F525}'} YOUR Appliances Right Now:</div>
                  <div className="co2j-impact-grid">
                    {Object.entries(APPLIANCE_COAL_DATA).filter(([id]) => appStates[id]).map(([id, data]) => (
                      <div key={id} className="co2j-impact-row">
                        <span className="co2j-impact-icon">{data.icon}</span>
                        <span className="co2j-impact-name">{data.name}</span>
                        <span className="co2j-impact-watts">{data.watt}W</span>
                        <span className="co2j-impact-coal" style={{color: data.coalPerHr > 0.5 ? '#ef4444' : data.coalPerHr > 0.1 ? '#f59e0b' : '#22c55e'}}>
                          {data.coalPerHr} kg coal/hr
                        </span>
                        <span className="co2j-impact-tip">{data.tip}</span>
                      </div>
                    ))}
                  </div>
                  <div className="co2j-impact-total">
                    {'\u{1F525}'} Total Coal: <strong style={{color:'#ef4444', fontSize: '18px'}}>
                      {Object.entries(APPLIANCE_COAL_DATA).filter(([id]) => appStates[id]).reduce((sum, [, d]) => sum + d.coalPerHr, 0).toFixed(2)} kg/hour
                    </strong>
                    {' '}{'\u2022'}{' '}
                    CO{'\u2082'}: <strong style={{color:'#f59e0b'}}>
                      {Object.entries(APPLIANCE_COAL_DATA).filter(([id]) => appStates[id]).reduce((sum, [, d]) => sum + d.co2PerHr, 0).toFixed(2)} kg/hour
                    </strong>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="co2j-nav">
              {co2Step > 0 && (
                <button className="co2j-nav-btn co2j-nav-prev" onClick={() => setCo2Step(s => s - 1)}>
                  {'\u2190'} Previous
                </button>
              )}
              <button className="co2j-nav-btn co2j-nav-next" onClick={() => {
                if (co2Step + 1 >= CO2_JOURNEY_STEPS.length) {
                  setShowCO2Journey(false);
                  playMilestoneSound();
                  showFB('\u{2705} You now understand the FULL coal→electricity→CO\u2082 chain! Every watt matters!', 'success', 5000);
                  setTimeout(() => handleTaskComplete(), 2000);
                } else {
                  setCo2Step(s => s + 1);
                  playCorrectSound();
                }
              }}>
                {co2Step + 1 >= CO2_JOURNEY_STEPS.length ? 'I Understand! \u2705' : 'Next Stage \u2192'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PROXIMITY PROMPT for outdoor tasks */}
      {task && taskState === 'playing' && task.allowOutside && currentRoom !== 'Outside' && currentRoom !== 'Factory' && (
        <div className="l3p1-proximity-prompt l3p1-proximity-prompt--action l3p1-proximity-prompt--enhanced">
          <div className="l3p1-prompt-icon">{'\u{1F6AA}'}</div>
          <div className="l3p1-prompt-text">Walk to the front door (left wall) and go OUTSIDE!</div>
          <div className="l3p1-prompt-key">
            <span className="l3p1-key-badge">W</span> Walk through door
          </div>
        </div>
      )}

      {/* ═══ INDIAN EB METER OVERLAY ═══ */}
      {showIndianEBMeter && (() => {
        const ebData = computeEBMeter(appStates, acTempIdx);
        return (
          <div className="l3p1-eb-overlay">
            <div className="l3p1-eb-panel">
              <div className="l3p1-eb-header">
                <div className="l3p1-eb-logo">{'\u{26A1}'}</div>
                <div className="l3p1-eb-title">STATE ELECTRICITY BOARD</div>
                <div className="l3p1-eb-subtitle">Digital Energy Meter</div>
                <div className="l3p1-eb-consumer">SC No: SC-2024-48291</div>
              </div>

              <div className="l3p1-eb-display">
                <div className="l3p1-eb-reading">
                  <div className="l3p1-eb-reading-label">Current Reading</div>
                  <div className="l3p1-eb-reading-value">{ebData.totalKwh} <span>kWh/month</span></div>
                </div>
                <div className="l3p1-eb-load">
                  <div className="l3p1-eb-load-label">Live Load</div>
                  <div className="l3p1-eb-load-value" style={{color: ebData.totalWatts > 3000 ? '#ef4444' : ebData.totalWatts > 1000 ? '#f59e0b' : '#22c55e'}}>
                    {ebData.totalWatts}W
                  </div>
                </div>
              </div>

              <div className="l3p1-eb-breakdown">
                <div className="l3p1-eb-breakdown-title">{'\u{1F4CB}'} Appliance Breakdown</div>
                {ebData.breakdown.filter(b => appStates[b.id]).map(b => (
                  <div key={b.id} className="l3p1-eb-row">
                    <span className="l3p1-eb-row-icon">{b.icon}</span>
                    <span className="l3p1-eb-row-name">{b.name}</span>
                    <span className="l3p1-eb-row-watts">{b.wattage}W</span>
                    <span className="l3p1-eb-row-kwh">{b.monthlyKwh} kWh</span>
                    <span className="l3p1-eb-row-cost" style={{color: b.monthlyCost > 500 ? '#ef4444' : b.monthlyCost > 100 ? '#f59e0b' : '#22c55e'}}>
                      {'\u{20B9}'}{b.monthlyCost}
                    </span>
                  </div>
                ))}
              </div>

              <div className="l3p1-eb-total-section">
                <div className="l3p1-eb-total">
                  <div className="l3p1-eb-total-label">Monthly Bill</div>
                  <div className="l3p1-eb-total-value">{'\u{20B9}'}{ebData.totalCost}</div>
                </div>
                <div className="l3p1-eb-coal">
                  <div>{'\u{1F525}'} Coal burned: <strong style={{color:'#ef4444'}}>{(ebData.totalWatts * 0.0007 * 24 * 30).toFixed(0)} kg/month</strong></div>
                  <div>{'\u{1F4A8}'} CO{'\u{2082}'} emitted: <strong style={{color:'#f59e0b'}}>{(ebData.totalKwh * 0.71).toFixed(0)} kg/month</strong></div>
                </div>
                <div className="l3p1-eb-comparison">
                  <div className="l3p1-eb-comp-bar">
                    <div className="l3p1-eb-comp-fill l3p1-eb-comp-green" style={{width: '25%'}}>
                      <span>Green: 90kWh</span>
                    </div>
                    <div className="l3p1-eb-comp-fill l3p1-eb-comp-avg" style={{width: '40%'}}>
                      <span>Avg: 150kWh</span>
                    </div>
                    <div className="l3p1-eb-comp-fill l3p1-eb-comp-you" style={{width: `${Math.min(100, (ebData.totalKwh / 400) * 100)}%`}}>
                      <span>YOU: {ebData.totalKwh}kWh</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="l3p1-eb-shock">
                {'\u{1F628}'} Your family is spending <strong style={{color:'#ef4444', fontSize:'20px'}}>{'\u{20B9}'}{ebData.totalCost}/month</strong> on electricity!
                <br />That's <strong>{(ebData.totalKwh * 0.71).toFixed(0)} kg of CO{'\u{2082}'}</strong> dumped into the atmosphere every month.
              </div>

              <button className="l3p1-eb-close-btn" onClick={() => {
                setShowIndianEBMeter(false);
                playMilestoneSound();
                showFB('\u{1F4CA} Now you know the REAL cost of your energy use!', 'success', 3000);
                setTimeout(() => handleTaskComplete(), 2000);
              }}>
                I Understand the Impact {'\u{2705}'}
              </button>
            </div>
          </div>
        );
      })()}

      {/* ═══ FACTORY INTERIOR OVERLAY ═══ */}
      {showFactoryInterior && (() => {
        const stations = [
          { id: 'coal_arrival', title: 'Coal Arrival', icon: '⛏️', desc: 'Trains bring thousands of tons of coal from mines. This coal was formed over 300 MILLION years.', fact: 'India mines 900 million tons of coal per year!' },
          { id: 'conveyor', title: 'Coal Conveyor Belt', icon: '⚙️', desc: 'Coal is crushed into fine powder and carried by conveyor belts into the massive furnace.', fact: 'A power plant burns 230 kg of coal EVERY SECOND!' },
          { id: 'furnace', title: 'The Burning Furnace', icon: '🔥', desc: 'Coal powder is blown into a furnace at 1,500°C. Every watt of YOUR electricity starts with FIRE.', fact: 'For every 1 kWh: 0.71 kg CO₂ released!' },
          { id: 'turbine', title: 'Steam Turbine', icon: '⚡', desc: 'Steam spins turbine blades at 3,000 RPM generating electricity. Only 33% efficiency!', fact: 'TWO-THIRDS of coal energy is WASTED as heat!' },
          { id: 'emissions', title: 'The CO₂ Cloud', icon: '💨', desc: 'That thick smoke = CO₂, SO₂, toxic particles going into the air YOU breathe.', fact: 'YOUR appliances right now are burning coal:', showAppliances: true },
        ];
        const station = stations[factoryStation];
        return (
          <div className="l3p1-factory-overlay">
            <div className="l3p1-factory-panel">
              <div className="l3p1-factory-progress">
                {stations.map((s, i) => (
                  <div key={s.id} className={`l3p1-factory-dot ${i <= factoryStation ? 'active' : ''}`}>
                    {i < factoryStation ? '✅' : s.icon}
                  </div>
                ))}
              </div>

              <div className="l3p1-factory-card">
                <div className="l3p1-factory-station-icon">{station.icon}</div>
                <h2 className="l3p1-factory-station-title">Station {factoryStation + 1}: {station.title}</h2>
                <p className="l3p1-factory-station-desc">{station.desc}</p>

                {/* Animated visual per station */}
                <div className={`l3p1-factory-visual l3p1-fv-${station.id}`}>
                  {station.id === 'furnace' && (
                    <div className="l3p1-furnace-anim">
                      <div className="l3p1-furnace-fire">{['🔥','🔥','🔥','🔥','🔥'].map((f,i) => <span key={i} style={{'--i': i}}>{f}</span>)}</div>
                      <div className="l3p1-furnace-glow" />
                    </div>
                  )}
                  {station.id === 'conveyor' && (
                    <div className="l3p1-conveyor-anim">
                      {[1,2,3,4,5].map(i => <div key={i} className="l3p1-coal-box" style={{'--delay': `${i * 0.6}s`}}>⬛</div>)}
                    </div>
                  )}
                  {station.id === 'turbine' && (
                    <div className="l3p1-turbine-anim">⚙️</div>
                  )}
                  {station.id === 'emissions' && (
                    <div className="l3p1-emissions-anim">
                      {['💨','💨','💨','☁️','☁️'].map((e,i) => <span key={i} className="l3p1-smoke-emoji" style={{'--i': i}}>{e}</span>)}
                    </div>
                  )}
                </div>

                <div className="l3p1-factory-fact">
                  <span className="l3p1-factory-fact-label">⚠️ Did You Know?</span>
                  <span>{station.fact}</span>
                </div>

                {/* Show appliance coal impact on final station */}
                {station.showAppliances && (
                  <div className="l3p1-factory-impact">
                    {Object.entries(APPLIANCE_COAL_DATA).filter(([id]) => appStates[id]).map(([id, data]) => (
                      <div key={id} className="l3p1-factory-impact-row">
                        <span>{data.icon} {data.name}</span>
                        <span style={{color: data.coalPerHr > 0.5 ? '#ef4444' : '#f59e0b'}}>{data.coalPerHr} kg coal/hr</span>
                      </div>
                    ))}
                    <div className="l3p1-factory-impact-total">
                      🔥 Total: <strong style={{color:'#ef4444'}}>
                        {Object.entries(APPLIANCE_COAL_DATA).filter(([id]) => appStates[id]).reduce((s,[,d]) => s + d.coalPerHr, 0).toFixed(2)} kg coal/hr
                      </strong>
                    </div>
                  </div>
                )}
              </div>

              <button className="l3p1-factory-next-btn" onClick={() => {
                if (factoryStation + 1 >= stations.length) {
                  setShowFactoryInterior(false);
                  playMilestoneSound();
                  showFB('🏭 You witnessed coal burning for YOUR electricity! Every watt matters!', 'success', 5000);
                  setTimeout(() => handleTaskComplete(), 2000);
                } else {
                  setFactoryStation(s => s + 1);
                  playCorrectSound();
                }
              }}>
                {factoryStation + 1 >= stations.length ? 'I Will Save Energy! ✅' : `Next Station → (${factoryStation + 2}/5)`}
              </button>
            </div>
          </div>
        );
      })()}

      {/* ═══ PLEDGE CHALLENGE TIMER & UI ═══ */}
      {task?.type === 'pledge_challenge' && taskState === 'playing' && (
        <div className="l3p1-pledge-hud">
          <div className="l3p1-pledge-watts" style={{color: env.watts <= (task.targetWatts || 150) ? '#22c55e' : '#ef4444'}}>
            {'\u{26A1}'} {env.watts}W / {task.targetWatts || 150}W
          </div>
          <div className="l3p1-pledge-coal">
            🔥 Coal: {(env.watts * 0.0007).toFixed(3)} kg/hr
          </div>
          {env.watts <= (task.targetWatts || 150) && !pledgeComplete && (
            <button className="l3p1-pledge-btn" onClick={() => {
              setPledgeComplete(true);
              playMilestoneSound();
            }}>
              🌍 Take the Green Pledge!
            </button>
          )}
        </div>
      )}

      {/* PLEDGE CERTIFICATE */}
      {pledgeComplete && (
        <div className="l3p1-pledge-overlay">
          <div className="l3p1-pledge-cert">
            <div className="l3p1-pledge-cert-icon">🌍</div>
            <h2 className="l3p1-pledge-cert-title">GREEN PLEDGE CERTIFICATE</h2>
            <div className="l3p1-pledge-cert-line" />
            <p className="l3p1-pledge-cert-text">
              I pledge to use energy wisely, keep my home under {task?.targetWatts || 150}W when possible,
              and choose fans over AC whenever I can.
            </p>
            <div className="l3p1-pledge-cert-stats">
              <div className="l3p1-pledge-stat">
                <div className="l3p1-pledge-stat-val">{env.watts}W</div>
                <div className="l3p1-pledge-stat-lbl">Your Home</div>
              </div>
              <div className="l3p1-pledge-stat">
                <div className="l3p1-pledge-stat-val" style={{color:'#ef4444'}}>7720W</div>
                <div className="l3p1-pledge-stat-lbl">Wasteful Home</div>
              </div>
              <div className="l3p1-pledge-stat">
                <div className="l3p1-pledge-stat-val" style={{color:'#22c55e'}}>97%</div>
                <div className="l3p1-pledge-stat-lbl">Reduction!</div>
              </div>
            </div>
            <div className="l3p1-pledge-scale">
              <div className="l3p1-pledge-scale-title">If every student in India (260 million) takes this pledge:</div>
              <div className="l3p1-pledge-scale-item">🔥 1.3 BILLION kg less coal burned DAILY</div>
              <div className="l3p1-pledge-scale-item">💨 3.7 BILLION kg less CO₂ per DAY</div>
              <div className="l3p1-pledge-scale-item">🌳 = Planting 170 million trees EVERY DAY!</div>
            </div>
            <button className="l3p1-pledge-done-btn" onClick={() => {
              setPledgeComplete(false);
              handleTaskComplete();
            }}>
              Pledge Taken! Continue →
            </button>
          </div>
        </div>
      )}

      <button className="l3p1-help-btn" title="Controls: WASD to move, E to interact">?</button>
    </div>
  );
}
