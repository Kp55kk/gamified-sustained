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
  computeTotalSavings, L5_QUIZ,
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

// ═══ 3D ═══
function CamRef({r}){const{camera}=useThree();useEffect(()=>{r.current=camera},[camera,r]);return null;}
function Scene({ appStates, nearest, onZone, onNearest, onInteract, camRef, proxLevels, timeOfDay, batteryPct, isEVCharging }) {
  return (<><CamRef r={camRef}/><Level5Environment timeOfDay={timeOfDay} batteryPct={batteryPct} isEVCharging={isEVCharging}/><House/><Level2Appliances applianceStates={appStates} nearestAppliance={nearest} taskTargetIds={null} proximityLevels={proxLevels}/><Level5Player onZoneChange={onZone} onNearestApplianceChange={onNearest} onInteract={onInteract} applianceIdList={L2_APPLIANCE_IDS}/></>);
}

// ═══ MAIN LEVEL 5 ═══
export default function Level5() {
  const navigate = useNavigate();
  const { carbonCoins, addCarbonCoins, completeLevel, unlockLevel } = useGame();
  const camRef = useRef(null);

  // ─── Screen Machine ───
  // entry → store → buy → intro → place → use → confirm → (repeat) → integration → simulation → dashboard → quiz → reward
  const [screen, setScreen] = useState('entry');
  const [introReady, setIntroReady] = useState(false);
  const [dialogIdx, setDialogIdx] = useState(0);
  const [bonusGiven, setBonusGiven] = useState(false);

  // ─── Store & Appliance Progress ───
  const [purchased, setPurchased] = useState([]); // appliance ids bought
  const [placed, setPlaced] = useState([]); // appliance ids placed correctly
  const [completed, setCompleted] = useState([]); // appliance ids fully learned
  const [currentAppIdx, setCurrentAppIdx] = useState(0); // which appliance we're working on
  const [appPhase, setAppPhase] = useState('buy'); // buy | intro | place | use | confirm

  // ─── Usage Task ───
  const [usageChoice, setUsageChoice] = useState(null); // 'correct' | 'wrong' | null
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

  // ─── Simulation ───
  const [simTimeIdx, setSimTimeIdx] = useState(0);
  const [simResults, setSimResults] = useState([]);
  const [simRunning, setSimRunning] = useState(false);

  // ─── Quiz/Results ───
  const [quizResult, setQuizResult] = useState(null);

  // ─── Integration ───
  const [integrationScore, setIntegrationScore] = useState(0);

  // ═══ DERIVED ═══
  const currentSolarW = useMemo(() => calcSolarW(timeSlot.sunlight, weather.factor), [timeSlot, weather]);
  const houseWatts = useMemo(() => {
    let w = 0;
    Object.entries(appStates).forEach(([id, on]) => {
      if (on) {
        const appData = L2_APPLIANCE_MAP[id];
        if (appData) w += appData.wattage;
      }
    });
    // Add watts from placed sustainable appliances that are "active"
    placed.forEach(id => {
      const sa = STORE_APPLIANCE_MAP[id];
      if (sa) w += sa.wattage;
    });
    return w;
  }, [appStates, placed]);

  const solarUsed = Math.min(currentSolarW, houseWatts);
  const gridWatts = Math.max(houseWatts - currentSolarW, 0);
  const solarPct = houseWatts > 0 ? Math.round((solarUsed / houseWatts) * 100) : (currentSolarW > 0 ? 100 : 0);
  const co2Rate = (gridWatts / 1000) * 0.71;
  const billRate = (gridWatts / 1000) * COST_PER_KWH;
  const batteryPct = Math.round((batteryKwh / BATTERY_CAPACITY) * 100);
  const isEVCharging = placed.includes('ev_charger');

  const currentApp = STORE_APPLIANCES[currentAppIdx] || null;
  const totalSavings = useMemo(() => computeTotalSavings(completed), [completed]);
  const allAppsCompleted = completed.length >= STORE_APPLIANCES.length;

  // Next available appliance — the first one not yet purchased
  const nextAvailableIdx = useMemo(() => {
    for (let i = 0; i < STORE_APPLIANCES.length; i++) {
      if (!purchased.includes(STORE_APPLIANCES[i].id)) return i;
    }
    return -1;
  }, [purchased]);

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

  // Simulation runner
  useEffect(() => {
    if (screen !== 'simulation' || !simRunning) return;
    if (simTimeIdx >= SCHEDULE_SLOTS.length) {
      setSimRunning(false);
      return;
    }
    const slot = SCHEDULE_SLOTS[simTimeIdx];
    setTimeOfDay(slot.id);
    const t = setTimeout(() => {
      const sw = calcSolarW(slot.sunlight, weather.factor);
      const sp = houseWatts > 0 ? Math.round((Math.min(sw, houseWatts) / houseWatts) * 100) : 100;
      setSimResults(prev => [...prev, {
        time: slot.label, icon: slot.icon, solarW: sw, solarPct: sp,
        gridW: Math.max(houseWatts - sw, 0),
        co2: ((Math.max(houseWatts - sw, 0)) / 1000 * 0.71).toFixed(2),
      }]);
      setSimTimeIdx(i => i + 1);
    }, 2500);
    return () => clearTimeout(t);
  }, [screen, simRunning, simTimeIdx, weather, houseWatts]);

  // ═══ CALLBACKS ═══

  const handleZone = useCallback(z => setZone(z), []);
  const handleNearest = useCallback(n => setNearest(n), []);
  const handleInteract = useCallback(id => {
    // During placement phase, pressing E places the appliance if in correct room
    if (screen === 'place' && currentApp) {
      if (zone === currentApp.correctRoom) {
        playPlace();
        setPlaced(prev => [...prev, currentApp.id]);
        setAppPhase('use');
        setScreen('use');
      } else {
        playError();
        setPlacementError(`${currentApp.name} doesn't belong in ${zone}! Go to ${currentApp.correctRoom}.`);
      }
      return;
    }
    // Toggle L2 appliances in integration/simulation modes
    if (['integration', 'simulation'].includes(screen)) {
      if (!L2_APPLIANCE_IDS.includes(id)) return;
      setAppStates(prev => ({ ...prev, [id]: !prev[id] }));
      playClick();
    }
  }, [screen, currentApp, zone]);

  // Buy appliance
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

  // After intro popup → go to placement
  const handleIntroGotIt = useCallback(() => {
    setScreen('place');
    setAppPhase('place');
    playClick();
  }, []);

  // Usage choice
  const handleUsageChoice = useCallback((choice) => {
    setUsageChoice(choice);
    setShowUsageFeedback(true);
    if (choice === 'correct') playSuccess();
    else playError();
  }, []);

  // Confirm learning → complete this appliance
  const handleConfirmLearning = useCallback(() => {
    if (!currentApp) return;
    setCompleted(prev => [...prev, currentApp.id]);
    playSuccess();

    // Check if there's another appliance to buy
    const nextIdx = STORE_APPLIANCES.findIndex(a => !purchased.includes(a.id) && a.id !== currentApp.id);
    if (nextIdx >= 0 || completed.length + 1 < STORE_APPLIANCES.length) {
      // Go back to store for next appliance
      setUsageChoice(null);
      setShowUsageFeedback(false);
      setAppPhase('buy');
      setScreen('store');
    } else {
      // All appliances done → integration
      setScreen('integration');
    }
  }, [currentApp, purchased, completed]);

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
      integrationScore,
      simResults.length > 0 ? simResults.reduce((s, r) => s + r.solarPct, 0) / simResults.length : 50
    );
    addCarbonCoins(LEVEL5_BADGE.coins * stars);
  }, [completed, integrationScore, simResults, completeLevel, unlockLevel, addCarbonCoins]);

  const stars = useMemo(() => {
    if (!quizResult) return 1;
    return calculateL5Stars(
      completed.length,
      (quizResult.score / quizResult.total) * 100,
      integrationScore,
      simResults.length > 0 ? simResults.reduce((s, r) => s + r.solarPct, 0) / simResults.length : 50
    );
  }, [quizResult, completed, integrationScore, simResults]);

  // ═══ RENDER ═══
  return (
    <div className="l5-container">

      {/* ══ ENTRY SCREEN ══ */}
      {screen === 'entry' && (
        <div className="l5-intro-overlay">
          <div className={`l5-intro-icon ${introReady ? 'visible' : ''}`}>{L5.house}</div>
          <div className={`l5-intro-title ${introReady ? 'visible' : ''}`}>SMART SUSTAINABLE HOME</div>
          <div className={`l5-intro-sub ${introReady ? 'visible' : ''}`}>BUILD YOUR FUTURE</div>
          <div className={`l5-intro-role ${introReady ? 'visible' : ''}`}>Upgrade your home step-by-step</div>
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

      {/* ══ SMART STORE ══ */}
      {screen === 'store' && (
        <div className="l5-store-overlay">
          <div className="l5-store-header">
            <button className="l5-back-btn" onClick={() => navigate('/hub')}>{'\u{2190}'} Hub</button>
            <div className="l5-store-title">{L5.store} Upgrade Home</div>
            <div className="l5-store-coins">{L5.coin} {carbonCoins}</div>
          </div>

          {/* Subsidy Banner */}
          {bonusGiven && purchased.length === 0 && (
            <div className="l5-subsidy-banner">
              {L5.sparkle} {STARTING_BONUS_MSG}
            </div>
          )}

          {/* Progress */}
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

              return (
                <div key={app.id} className={`l5-store-card ${isDone ? 'done' : isBought ? 'bought' : isLocked ? 'locked' : canBuy ? 'available' : 'unavailable'}`}>
                  <div className="l5-store-card-icon">{isDone ? L5.check : isLocked ? L5.lock : app.icon}</div>
                  <div className="l5-store-card-name">{isLocked ? '???' : app.name}</div>
                  <div className="l5-store-card-watts">{isLocked ? '---' : `${app.wattage}W • ${app.loadType}`}</div>

                  {isDone && <div className="l5-store-card-status done">{L5.check} Completed</div>}
                  {isBought && !isDone && (
                    <button className="l5-store-card-btn resume" onClick={() => {
                      setCurrentAppIdx(idx);
                      // Resume from where we left off
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
                    <div className="l5-store-card-replace">
                      {L5.leaf} Replaces: {app.replaces}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* All done → go to integration */}
          {allAppsCompleted && (
            <button className="l5-store-complete-btn" onClick={() => setScreen('integration')}>
              {L5.check} All Upgrades Done — Start Integration Mode {'\u{2192}'}
            </button>
          )}
        </div>
      )}

      {/* ══ APPLIANCE INTRO POPUP ══ */}
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

      {/* ══ PLACEMENT MODE (3D Scene) ══ */}
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

          {/* HUD */}
          <div className="l5-hud-top">
            <button className="l5-back-btn" onClick={() => { setScreen('store'); }}>{'\u{2190}'} Store</button>
            <div className="l5-hud-title">{L5.house} Place {currentApp.name}</div>
            <div className="l5-hud-zone">{ROOM_ICONS[zone] || L5.pin} {zone}</div>
          </div>

          {/* Placement instruction */}
          <div className="l5-placement-task">
            <div className="l5-placement-icon">{currentApp.icon}</div>
            <div className="l5-placement-info">
              <div className="l5-placement-title">Place in: <strong className="l5-placement-room">{currentApp.correctRoom}</strong></div>
              <div className="l5-placement-hint">Walk to {currentApp.correctRoom} and press <span className="l5-key">E</span> to place</div>
            </div>
          </div>

          {/* Room indicator */}
          <div className={`l5-room-indicator ${zone === currentApp.correctRoom ? 'correct' : 'wrong'}`}>
            {zone === currentApp.correctRoom ? (
              <>{L5.check} Correct room! Press <span className="l5-key">E</span> to place</>
            ) : (
              <>{L5.cross} Go to <strong>{currentApp.correctRoom}</strong></>
            )}
          </div>

          {/* Error toast */}
          {placementError && (
            <div className="l5-error-toast">
              {L5.warn} {placementError}
            </div>
          )}

          <HelpBtn />
        </div>
      )}

      {/* ══ USAGE TASK ══ */}
      {screen === 'use' && currentApp && (
        <div className="l5-usage-overlay">
          <div className="l5-usage-card">
            <div className="l5-usage-badge">{L5.target} USAGE TASK</div>
            <div className="l5-usage-icon">{currentApp.icon}</div>
            <div className="l5-usage-title">{currentApp.usageTask.title}</div>
            <div className="l5-usage-instruction">{currentApp.usageTask.instruction}</div>

            {!showUsageFeedback ? (
              <div className="l5-usage-choices">
                <button className="l5-usage-choice correct-choice" onClick={() => handleUsageChoice('correct')}>
                  {L5.check} {currentApp.usageTask.correct.label}
                </button>
                <button className="l5-usage-choice wrong-choice" onClick={() => handleUsageChoice('wrong')}>
                  {L5.cross} {currentApp.usageTask.wrong.label}
                </button>
              </div>
            ) : (
              <div className="l5-usage-feedback">
                <div className={`l5-feedback-box ${usageChoice}`}>
                  <div className="l5-feedback-icon">{usageChoice === 'correct' ? L5.check : L5.warn}</div>
                  <div className="l5-feedback-text">
                    {usageChoice === 'correct'
                      ? currentApp.usageTask.correct.feedback
                      : currentApp.usageTask.wrong.feedback
                    }
                  </div>
                </div>
                {/* Energy impact */}
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

      {/* ══ LEARNING CONFIRMATION ══ */}
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
              <div className="l5-confirm-before">
                <span>{L5.cross}</span> Before: {currentApp.replaces}
              </div>
              <div className="l5-confirm-arrow">{'\u{2192}'}</div>
              <div className="l5-confirm-after">
                <span>{L5.check}</span> After: {currentApp.name} ({currentApp.wattage}W)
              </div>
            </div>

            <button className="l5-confirm-btn" onClick={handleConfirmLearning}>
              {completed.length + 1 >= STORE_APPLIANCES.length
                ? `${L5.check} All Done — Integration Mode ${'\u{2192}'}`
                : `${L5.check} Got it! Next Upgrade ${'\u{2192}'}`
              }
            </button>
          </div>
        </div>
      )}

      {/* ══ INTEGRATION MODE (3D Scene) ══ */}
      {screen === 'integration' && (
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

          {/* HUD */}
          <div className="l5-hud-top">
            <button className="l5-back-btn" onClick={() => navigate('/hub')}>{'\u{2190}'} Hub</button>
            <div className="l5-hud-title">{L5.gear} Integration Mode</div>
            <div className="l5-hud-zone">{ROOM_ICONS[zone] || L5.pin} {zone}</div>
          </div>

          {/* Dashboard */}
          <div className="l5-int-dashboard">
            <div className="l5-int-dash-item">
              <span>{L5.sun}</span>
              <div><div className="l5-int-dash-label">Solar</div><div className={`l5-int-dash-val ${solarPct >= 60 ? 'green' : 'amber'}`}>{solarPct}%</div></div>
            </div>
            <div className="l5-int-dash-item">
              <span>{L5.globe}</span>
              <div><div className="l5-int-dash-label">CO₂/hr</div><div className={`l5-int-dash-val ${co2Rate < 0.5 ? 'green' : 'red'}`}>{co2Rate.toFixed(2)} kg</div></div>
            </div>
            <div className="l5-int-dash-item">
              <span>{L5.money}</span>
              <div><div className="l5-int-dash-label">Bill/hr</div><div className={`l5-int-dash-val ${billRate < 5 ? 'green' : 'amber'}`}>₹{billRate.toFixed(1)}</div></div>
            </div>
          </div>

          {/* Task */}
          <div className="l5-int-task">
            <div className="l5-int-task-title">{L5.target} Optimize Your Entire Home</div>
            <div className="l5-int-task-desc">All upgrades are active. Interact with appliances to optimize energy. Achieve ≥60% solar usage!</div>
          </div>

          {/* Time control */}
          <div className="l5-time-panel">
            <div className="l5-time-icon">{timeSlot.icon}</div>
            <div className="l5-time-label">{timeSlot.label}</div>
            <div className="l5-time-periods">
              {SCHEDULE_SLOTS.map(s => (
                <span key={s.id} className={`l5-time-period ${timeOfDay === s.id ? 'active' : ''}`}
                  onClick={() => setTimeOfDay(s.id)} title={s.label}>{s.icon}</span>
              ))}
            </div>
          </div>

          {/* Upgrades summary */}
          <div className="l5-int-upgrades">
            <div className="l5-int-upg-header">{L5.check} Your Upgrades</div>
            {STORE_APPLIANCES.map(a => (
              <div key={a.id} className="l5-int-upg-item">
                <span>{a.icon}</span>
                <span>{a.name}</span>
                <span className="l5-int-upg-save">-{a.savingPct}%</span>
              </div>
            ))}
          </div>

          {/* Complete button */}
          {solarPct >= 50 && (
            <div className="l5-complete-btn">
              <button className="l5-modal-btn" onClick={() => {
                setIntegrationScore(solarPct);
                setScreen('simulation');
                setSimTimeIdx(0);
                setSimResults([]);
              }}>
                {L5.check} Integration Complete — Start Day Simulation {'\u{2192}'}
              </button>
            </div>
          )}

          <HelpBtn />
        </div>
      )}

      {/* ══ FULL DAY SIMULATION ══ */}
      {screen === 'simulation' && (
        <div className="l5-sim-overlay">
          <div className="l5-sim-card">
            <div className="l5-sim-title">{L5.clock} Full Day Simulation</div>
            <div className="l5-sim-desc">Watch your sustainable home run through 24 hours!</div>

            {!simRunning && simResults.length === 0 && (
              <button className="l5-sim-start-btn" onClick={() => setSimRunning(true)}>
                Start Simulation {L5.sun}
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
                <div className="l5-sim-summary-title">{L5.chart} Day Summary</div>
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
                <button className="l5-sim-next-btn" onClick={() => setScreen('dashboard')}>
                  View Final Dashboard {'\u{2192}'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══ FINAL DASHBOARD ══ */}
      {screen === 'dashboard' && (
        <div className="l5-dash-overlay">
          <div className="l5-dash-card">
            <div className="l5-dash-title">{L5.chart} Final Impact Dashboard</div>

            <div className="l5-dash-compare">
              <div className="l5-dash-col before">
                <div className="l5-dash-col-label">{L5.cross} Before Upgrades</div>
                <div className="l5-dash-col-stat"><span>{BEFORE_STATS.co2Month} kg</span><span>CO₂/month</span></div>
                <div className="l5-dash-col-stat"><span>₹{BEFORE_STATS.billMonth}</span><span>Bill/month</span></div>
                <div className="l5-dash-col-stat"><span>0%</span><span>Efficiency</span></div>
              </div>
              <div className="l5-dash-col after">
                <div className="l5-dash-col-label">{L5.check} After Upgrades</div>
                <div className="l5-dash-col-stat"><span>{Math.max(BEFORE_STATS.co2Month - totalSavings.co2Saved, 0)} kg</span><span>CO₂/month</span></div>
                <div className="l5-dash-col-stat"><span>₹{Math.max(BEFORE_STATS.billMonth - totalSavings.billSaved, 0)}</span><span>Bill/month</span></div>
                <div className="l5-dash-col-stat"><span>{totalSavings.efficiencyPct}%</span><span>Efficiency</span></div>
              </div>
            </div>

            <div className="l5-dash-savings">
              {L5.sparkle} You saved {totalSavings.co2Saved} kg CO₂ and ₹{totalSavings.billSaved}/month!
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
              Take Final Quiz {'\u{2192}'}
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

            {quizResult && <div style={{ color: '#aaa', fontSize: 12, margin: '8px 0' }}>Quiz: {quizResult.score}/{quizResult.total} correct</div>}
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
