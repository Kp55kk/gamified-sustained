import React, { useState, useCallback, useRef, useEffect, useMemo, Suspense } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { useNavigate } from 'react-router-dom';
import House from '../House';
import Level5Player, { l5PlayerState } from './Level5Player';
import Level2Appliances, { getProximityLevels } from '../level2/Level2Appliances';
import Level5Environment from './Level5Environment';
import { useGame } from '../../context/GameContext';
import {
  L5_APPLIANCE_IDS, L5_APPLIANCE_MAP,
  APPLIANCE_INSIGHTS, SCHEDULE_SLOTS, OPTIMAL_SCHEDULE, scoreSchedule,
  calcSolarW, BATTERY_CAPACITY, BATTERY_CHARGE_RATE, BATTERY_DISCHARGE_RATE,
  WEATHER_TYPES, DYNAMIC_EVENTS, CRISIS_SCENARIO, COST_PER_KWH, BEFORE_STATS,
  PHASES, calculateL5Stars, LEVEL5_BADGE, ENTRY_DIALOGUE, FINAL_DIALOGUE,
  PHASE_LEARNINGS, L5, ROOM_ICONS, L2_APPLIANCE_IDS,
} from './level5Data';
import Level5Quiz from './Level5Quiz';
import './Level5.css';

// ═══ AUDIO ═══
let audioCtx = null;
function getAC() { if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)(); return audioCtx; }
function playToggle(on) { try { const c=getAC(),o=c.createOscillator(),g=c.createGain();o.connect(g);g.connect(c.destination);o.frequency.setValueAtTime(on?800:300,c.currentTime);g.gain.setValueAtTime(0.08,c.currentTime);g.gain.exponentialRampToValueAtTime(0.001,c.currentTime+0.1);o.start(c.currentTime);o.stop(c.currentTime+0.1);} catch(e){} }
function playSuccess() { [523,659,784,1047].forEach((f,i) => { try { const c=getAC(),o=c.createOscillator(),g=c.createGain();o.connect(g);g.connect(c.destination);o.type='triangle';o.frequency.setValueAtTime(f,c.currentTime+i*0.12);g.gain.setValueAtTime(0.08,c.currentTime+i*0.12);g.gain.exponentialRampToValueAtTime(0.001,c.currentTime+i*0.12+0.3);o.start(c.currentTime+i*0.12);o.stop(c.currentTime+i*0.12+0.3);} catch(e){} }); }

// ═══ 3D ═══
function CamRef({r}){const{camera}=useThree();useEffect(()=>{r.current=camera},[camera,r]);return null;}
function Scene({ appStates, nearest, onZone, onNearest, onInteract, camRef, proxLevels, timeOfDay, batteryPct, isEVCharging }) {
  return (<><CamRef r={camRef}/><Level5Environment timeOfDay={timeOfDay} batteryPct={batteryPct} isEVCharging={isEVCharging}/><House/><Level2Appliances applianceStates={appStates} nearestAppliance={nearest} taskTargetIds={null} proximityLevels={proxLevels}/><Level5Player onZoneChange={onZone} onNearestApplianceChange={onNearest} onInteract={onInteract} applianceIdList={L2_APPLIANCE_IDS}/></>);
}

// ═══ MAIN LEVEL 5 ═══
export default function Level5() {
  const navigate = useNavigate();
  const { addCarbonCoins, completeLevel, unlockLevel } = useGame();
  const camRef = useRef(null);

  // ─── Phase Machine ───
  const [screen, setScreen] = useState('entry');     // entry | play | quiz | reward
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [introStep, setIntroStep] = useState(0);
  const [introReady, setIntroReady] = useState(false);
  const [dialogIdx, setDialogIdx] = useState(0);

  // ─── 3D State ───
  const [appStates, setAppStates] = useState(() => {
    const s = {}; L2_APPLIANCE_IDS.forEach(id => s[id] = false);
    s.ev_charger = false;
    return s;
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

  // ─── Discovery ───
  const [discoveredApps, setDiscoveredApps] = useState(new Set());
  const [discoveryPopup, setDiscoveryPopup] = useState(null);

  // ─── Scheduling ───
  const [playerSchedule, setPlayerSchedule] = useState({});

  // ─── Events / Crisis ───
  const [activeEvent, setActiveEvent] = useState(null);
  const [crisisActive, setCrisisActive] = useState(false);
  const [crisisPassed, setCrisisPassed] = useState(false);

  // ─── Results ───
  const [quizResult, setQuizResult] = useState(null);
  const [dayRunData, setDayRunData] = useState([]);

  // ─── Insight ───
  const [insight, setInsight] = useState(null);

  // ═══ DERIVED COMPUTATIONS ═══
  const houseWatts = useMemo(() => {
    let w = 0;
    Object.entries(appStates).forEach(([id, on]) => {
      if (on) { const app = L5_APPLIANCE_MAP[id]; if (app) w += app.wattage; }
    });
    return w;
  }, [appStates]);

  const currentSolarW = useMemo(() => calcSolarW(timeSlot.sunlight, weather.factor), [timeSlot, weather]);
  const solarUsed = Math.min(currentSolarW, houseWatts);
  const excessSolar = Math.max(currentSolarW - houseWatts, 0);
  const remainAfterSolar = Math.max(houseWatts - currentSolarW, 0);
  const batteryDischarge = Math.min(remainAfterSolar, BATTERY_DISCHARGE_RATE * 1000, batteryKwh * 1000);
  const gridWatts = Math.max(remainAfterSolar - batteryDischarge, 0);
  const solarPct = houseWatts > 0 ? Math.round(((solarUsed + batteryDischarge) / houseWatts) * 100) : (currentSolarW > 0 ? 100 : 0);
  const efficiencyPct = houseWatts > 0 ? Math.min(100, Math.round(((solarUsed + batteryDischarge) / houseWatts) * 100)) : 100;
  const co2Rate = (gridWatts / 1000) * 0.71;
  const billRate = (gridWatts / 1000) * COST_PER_KWH;
  const batteryPct = Math.round((batteryKwh / BATTERY_CAPACITY) * 100);
  const isEVCharging = appStates.ev_charger;

  // Battery charge/discharge effect
  useEffect(() => {
    if (screen !== 'play') return;
    const interval = setInterval(() => {
      setBatteryKwh(prev => {
        if (excessSolar > 0 && prev < BATTERY_CAPACITY) {
          return Math.min(BATTERY_CAPACITY, prev + BATTERY_CHARGE_RATE * 0.05);
        }
        if (remainAfterSolar > 0 && prev > 0) {
          return Math.max(0, prev - (batteryDischarge / 1000) * 0.05);
        }
        return prev;
      });
    }, 500);
    return () => clearInterval(interval);
  }, [screen, excessSolar, remainAfterSolar, batteryDischarge]);

  // Proximity levels
  useEffect(() => {
    if (screen !== 'play') return;
    const interval = setInterval(() => {
      const p = getProximityLevels(l5PlayerState.x, l5PlayerState.z, L2_APPLIANCE_IDS);
      setProxLevels(p);
    }, 200);
    return () => clearInterval(interval);
  }, [screen]);

  // ═══ CALLBACKS ═══
  const handleInteract = useCallback(id => {
    if (screen !== 'play') return;
    const appId = id;

    // Discovery popup
    if (!discoveredApps.has(appId) && APPLIANCE_INSIGHTS[appId]) {
      const app = L5_APPLIANCE_MAP[appId];
      const ins = APPLIANCE_INSIGHTS[appId];
      if (app) {
        setDiscoveryPopup({ ...app, ...ins });
        setDiscoveredApps(prev => new Set([...prev, appId]));
        return;
      }
    }

    // Toggle
    setAppStates(prev => {
      const next = { ...prev, [appId]: !prev[appId] };
      playToggle(!prev[appId]);
      return next;
    });
  }, [screen, discoveredApps]);

  const handleZone = useCallback(z => setZone(z), []);
  const handleNearest = useCallback(n => setNearest(n), []);

  // ═══ PHASE COMPLETION LOGIC ═══
  const canCompletePhase = useMemo(() => {
    const phase = PHASES[phaseIdx];
    if (!phase) return false;
    switch (phase.id) {
      case 'dashboard': return true; // Just explored
      case 'appliance': return discoveredApps.size >= 5;
      case 'control': return solarPct >= 30;
      case 'schedule': return Object.keys(playerSchedule).length >= 4;
      case 'solar': return solarPct >= 50;
      case 'events': return true; // Experienced events
      case 'crisis': return crisisPassed;
      case 'graphs': return true;
      case 'dayrun': return dayRunData.length >= 4;
      case 'impact': return true;
      default: return true;
    }
  }, [phaseIdx, discoveredApps, solarPct, playerSchedule, crisisPassed, dayRunData]);

  const advancePhase = useCallback(() => {
    if (phaseIdx < PHASES.length - 1) {
      playSuccess();
      setPhaseIdx(p => p + 1);
      setActiveEvent(null);
    } else {
      // All phases done → quiz
      playSuccess();
      setScreen('quiz');
    }
  }, [phaseIdx]);

  // ═══ DYNAMIC EVENTS ═══
  useEffect(() => {
    if (screen !== 'play' || PHASES[phaseIdx]?.id !== 'events') return;
    const event = DYNAMIC_EVENTS.find(e => e.trigger === timeOfDay);
    if (event) {
      setActiveEvent(event);
      const w = WEATHER_TYPES.find(wt => wt.id === event.weather);
      if (w) setWeather(w);
    }
  }, [timeOfDay, screen, phaseIdx]);

  // ═══ CRISIS MODE ═══
  useEffect(() => {
    if (screen !== 'play' || PHASES[phaseIdx]?.id !== 'crisis') return;
    setCrisisActive(true);
    setBatteryKwh(BATTERY_CAPACITY * CRISIS_SCENARIO.conditions.batteryPct / 100);
    setWeather(WEATHER_TYPES.find(w => w.factor <= CRISIS_SCENARIO.conditions.solarFactor) || WEATHER_TYPES[2]);
  }, [phaseIdx, screen]);

  useEffect(() => {
    if (!crisisActive) return;
    if (gridWatts < CRISIS_SCENARIO.targets.maxGridW * 1000) {
      setCrisisPassed(true);
      setCrisisActive(false);
      setInsight({ icon: L5.check, text: CRISIS_SCENARIO.success });
    }
  }, [crisisActive, gridWatts]);

  // ═══ INSIGHTS ═══
  useEffect(() => {
    if (screen !== 'play') return;
    const msgs = [];
    if (solarPct >= 80) msgs.push({ icon: L5.sun, text: `☀️ ${solarPct}% solar powered! Excellent!` });
    else if (solarPct >= 50) msgs.push({ icon: L5.leaf, text: `🌿 ${solarPct}% from solar. Good progress!` });
    if (gridWatts > 2000) msgs.push({ icon: L5.warn, text: `⚠️ High grid usage: ${gridWatts}W. Reduce load!` });
    if (batteryPct < 20 && timeSlot.sunlight < 0.3) msgs.push({ icon: L5.battery, text: `🔋 Battery low (${batteryPct}%). Conserve energy!` });
    if (isEVCharging && timeSlot.sunlight >= 0.6) msgs.push({ icon: L5.ev, text: `🚗 Smart! EV charging during solar peak.` });
    if (msgs.length > 0) {
      setInsight(msgs[Math.floor(Math.random() * msgs.length)]);
      const t = setTimeout(() => setInsight(null), 4000);
      return () => clearTimeout(t);
    }
  }, [solarPct, gridWatts, batteryPct, isEVCharging, screen, timeSlot]);

  // Day run data collection
  const addDayRunEntry = useCallback(() => {
    setDayRunData(prev => [...prev, {
      time: timeOfDay, solarW: currentSolarW, gridW: gridWatts, houseW: houseWatts,
      battery: batteryPct, co2: co2Rate, bill: billRate, efficiency: efficiencyPct,
    }]);
  }, [timeOfDay, currentSolarW, gridWatts, houseWatts, batteryPct, co2Rate, billRate, efficiencyPct]);

  // After stats
  const afterStats = useMemo(() => ({
    co2Month: Math.round(BEFORE_STATS.co2Month * (1 - Math.min(solarPct, 100) / 100)),
    billMonth: Math.round(BEFORE_STATS.billMonth * (1 - Math.min(solarPct, 100) / 120)),
  }), [solarPct]);

  // ═══ ENTRY STEP TIMER ═══
  useEffect(() => {
    if (screen !== 'entry') return;
    const t = setTimeout(() => setIntroReady(true), 500);
    return () => clearTimeout(t);
  }, [screen]);

  // ═══ QUIZ COMPLETE ═══
  const handleQuizComplete = useCallback(result => {
    setQuizResult(result);
    setScreen('reward');
    playSuccess();
    completeLevel(5);
    unlockLevel(6);
    const stars = calculateL5Stars(efficiencyPct, solarPct, scoreSchedule(playerSchedule).pct, crisisPassed, (result.score / result.total) * 100);
    addCarbonCoins(LEVEL5_BADGE.coins * stars);
  }, [efficiencyPct, solarPct, playerSchedule, crisisPassed, completeLevel, unlockLevel, addCarbonCoins]);

  const stars = useMemo(() => {
    if (!quizResult) return 1;
    return calculateL5Stars(efficiencyPct, solarPct, scoreSchedule(playerSchedule).pct, crisisPassed, (quizResult.score / quizResult.total) * 100);
  }, [quizResult, efficiencyPct, solarPct, playerSchedule, crisisPassed]);

  const currentPhase = PHASES[phaseIdx];

  // ═══ RENDER ═══
  return (
    <div className="l5-container">
      {/* ── ENTRY SCREEN ── */}
      {screen === 'entry' && (
        <div className="l5-intro-overlay">
          <div className={`l5-intro-icon ${introReady ? 'visible' : ''}`}>{L5.house}</div>
          <div className={`l5-intro-title ${introReady ? 'visible' : ''}`}>SMART SUSTAINABLE HOME</div>
          <div className={`l5-intro-role ${introReady ? 'visible' : ''}`}>Role: Chief Sustainability Engineer</div>
          <div className={`l5-intro-dialogue ${introReady ? 'visible' : ''}`}>
            <span className="l5-intro-avatar">{'\u{1F468}\u{200D}\u{1F393}'}</span>
            <span className="l5-intro-quote">{ENTRY_DIALOGUE[dialogIdx]}</span>
          </div>
          <button
            className={`l5-intro-btn ${introReady ? 'visible' : ''}`}
            onClick={() => {
              if (dialogIdx < ENTRY_DIALOGUE.length - 1) setDialogIdx(d => d + 1);
              else setScreen('play');
            }}
          >
            {dialogIdx < ENTRY_DIALOGUE.length - 1 ? 'Next \u{2192}' : 'Begin Level 5 \u{2192}'}
          </button>
        </div>
      )}

      {/* ── 3D SCENE (always rendered during play) ── */}
      {screen !== 'entry' && (
        <div className="l5-canvas-wrapper">
          <Canvas
            camera={{ position: [-5, 8, -14], fov: 50 }}
            gl={{ antialias: false }}
            onCreated={({ gl }) => { gl.setClearColor('#050a15'); gl.toneMapping = 1; gl.toneMappingExposure = 1.0; gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); }}
          >
            <Suspense fallback={null}>
              <Scene
                appStates={appStates} nearest={nearest} onZone={handleZone}
                onNearest={handleNearest} onInteract={handleInteract} camRef={camRef}
                proxLevels={proxLevels} timeOfDay={timeOfDay} batteryPct={batteryPct}
                isEVCharging={isEVCharging}
              />
            </Suspense>
          </Canvas>
        </div>
      )}

      {/* ── HUD TOP ── */}
      {screen === 'play' && (
        <div className="l5-hud-top">
          <button className="l5-back-btn" onClick={() => navigate('/hub')}>{'\u{2190}'} Hub</button>
          <div className="l5-hud-title">{L5.leaf} Smart Sustainable Home</div>
          <div className="l5-hud-zone">{ROOM_ICONS[zone] || L5.pin} {zone}</div>
        </div>
      )}

      {/* ── GLOBAL DASHBOARD ── */}
      {screen === 'play' && (
        <div className="l5-dashboard">
          <div className="l5-dash-item">
            <span className="l5-dash-icon">{L5.globe}</span>
            <div>
              <div className="l5-dash-label">CO₂/hr</div>
              <div className={`l5-dash-val ${co2Rate < 0.5 ? 'green' : co2Rate < 1 ? 'amber' : 'red'}`}>{co2Rate.toFixed(2)} kg</div>
            </div>
          </div>
          <div className="l5-dash-item">
            <span className="l5-dash-icon">{L5.money}</span>
            <div>
              <div className="l5-dash-label">Bill/hr</div>
              <div className={`l5-dash-val ${billRate < 5 ? 'green' : billRate < 10 ? 'amber' : 'red'}`}>₹{billRate.toFixed(1)}</div>
            </div>
          </div>
          <div className="l5-dash-item">
            <span className="l5-dash-icon">{L5.zap}</span>
            <div>
              <div className="l5-dash-label">Efficiency</div>
              <div className={`l5-dash-val ${efficiencyPct >= 70 ? 'green' : efficiencyPct >= 40 ? 'amber' : 'red'}`}>{efficiencyPct}%</div>
            </div>
          </div>
          <div className="l5-dash-item">
            <span className="l5-dash-icon">{L5.sun}</span>
            <div>
              <div className="l5-dash-label">Solar</div>
              <div className={`l5-dash-val ${solarPct >= 60 ? 'green' : solarPct >= 30 ? 'amber' : 'red'}`}>{solarPct}%</div>
            </div>
          </div>
          <div className="l5-dash-item">
            <span className="l5-dash-icon">{L5.battery}</span>
            <div>
              <div className="l5-dash-label">Battery</div>
              <div className={`l5-dash-val ${batteryPct >= 50 ? 'green' : batteryPct >= 20 ? 'amber' : 'red'}`}>{batteryPct}%</div>
            </div>
          </div>
        </div>
      )}

      {/* ── TASK BAR ── */}
      {screen === 'play' && currentPhase && (
        <div className="l5-taskbar">
          <div className="l5-taskbar-phase">Phase {phaseIdx + 1} of {PHASES.length}</div>
          <div className="l5-taskbar-title">{currentPhase.icon} {currentPhase.title}</div>
          <div className="l5-taskbar-obj">{currentPhase.objective}</div>
        </div>
      )}

      {/* ── SOLAR / BATTERY PANEL ── */}
      {screen === 'play' && (
        <div className="l5-solar-panel">
          <div className="l5-solar-header">{L5.sun} Solar Output</div>
          <div className="l5-solar-watts">{currentSolarW}W</div>
          <div className="l5-split-bar">
            {solarUsed > 0 && <div className="l5-split-solar" style={{ width: `${(solarUsed / Math.max(houseWatts, 1)) * 100}%` }}>{L5.sun}</div>}
            {batteryDischarge > 0 && <div className="l5-split-battery" style={{ width: `${(batteryDischarge / Math.max(houseWatts, 1)) * 100}%` }}>{L5.battery}</div>}
            {gridWatts > 0 && <div className="l5-split-grid" style={{ width: `${(gridWatts / Math.max(houseWatts, 1)) * 100}%` }}>Grid</div>}
          </div>
          <div className="l5-battery-bar">
            <div className="l5-battery-fill" style={{ width: `${batteryPct}%`, background: batteryPct > 50 ? '#22c55e' : batteryPct > 20 ? '#f5a623' : '#ef4444' }}></div>
          </div>
          <div className="l5-battery-info"><span>{L5.battery} {batteryKwh.toFixed(1)}/{BATTERY_CAPACITY} kWh</span><span>{excessSolar > 0 ? `+${excessSolar}W charging` : ''}</span></div>
        </div>
      )}

      {/* ── TIME CONTROL ── */}
      {screen === 'play' && (
        <div className="l5-time-panel">
          <div className="l5-time-icon">{timeSlot.icon}</div>
          <div className="l5-time-label">{timeSlot.label}</div>
          <div className="l5-time-periods">
            {SCHEDULE_SLOTS.map(s => (
              <span
                key={s.id}
                className={`l5-time-period ${timeOfDay === s.id ? 'active' : ''}`}
                onClick={() => { setTimeOfDay(s.id); if (PHASES[phaseIdx]?.id === 'dayrun') addDayRunEntry(); }}
                title={s.label}
              >{s.icon}</span>
            ))}
          </div>
        </div>
      )}

      {/* ── DISCOVERY POPUP ── */}
      {discoveryPopup && (
        <div className="l5-discovery-popup">
          <div className="l5-popup-icon">{discoveryPopup.icon}</div>
          <div className="l5-popup-name">{discoveryPopup.name}</div>
          <div className="l5-popup-watts">{discoveryPopup.wattage}W</div>
          <div className="l5-popup-cat">Category: <span className={discoveryPopup.loadClass}>{discoveryPopup.category}</span></div>
          <div className="l5-popup-insight">{L5.bulb} {discoveryPopup.insight}</div>
          <button className="l5-popup-dismiss" onClick={() => { setDiscoveryPopup(null); handleInteract(discoveryPopup.id); }}>Got it! {L5.check}</button>
        </div>
      )}

      {/* ── WEATHER BAR (during events phase) ── */}
      {screen === 'play' && PHASES[phaseIdx]?.id === 'events' && (
        <div className="l5-weather-bar">
          {WEATHER_TYPES.map(w => (
            <button key={w.id} className={`l5-weather-btn ${weather.id === w.id ? 'active' : ''}`} onClick={() => setWeather(w)}>
              {w.icon} {w.label}
            </button>
          ))}
        </div>
      )}

      {/* ── ACTIVE EVENT ALERT ── */}
      {activeEvent && screen === 'play' && (
        <div className="l5-event-banner">
          <span>{activeEvent.label}</span>
          <span style={{ color: '#aaa', fontSize: '11px' }}>{activeEvent.hint}</span>
        </div>
      )}

      {/* ── CRISIS BANNER ── */}
      {crisisActive && screen === 'play' && (
        <div className="l5-crisis-banner">
          <span>{L5.alert}</span>
          <span className="l5-crisis-text">{CRISIS_SCENARIO.title} — Grid: {gridWatts}W (target: &lt;{CRISIS_SCENARIO.targets.maxGridW * 1000}W)</span>
        </div>
      )}

      {/* ── INSIGHT TICKER ── */}
      {insight && screen === 'play' && (
        <div className="l5-insight" key={insight.text}>
          <span className="l5-insight-icon">{insight.icon}</span>
          <span className="l5-insight-text">{insight.text}</span>
        </div>
      )}

      {/* ── INTERACTION HINT ── */}
      {nearest && screen === 'play' && !discoveryPopup && (
        <div style={{ position: 'absolute', bottom: 85, left: '50%', transform: 'translateX(-50%)', zIndex: 20, background: 'rgba(5,10,20,0.92)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 10, padding: '6px 14px', fontSize: 12, fontWeight: 700, color: '#22c55e' }}>
          Press <span style={{ background: 'rgba(34,197,94,0.15)', padding: '2px 8px', borderRadius: 4, marginLeft: 4, marginRight: 4 }}>E</span> to interact with {L5_APPLIANCE_MAP[nearest]?.name || nearest}
        </div>
      )}

      {/* ── SCHEDULING MODAL ── */}
      {screen === 'play' && PHASES[phaseIdx]?.id === 'schedule' && !discoveryPopup && (
        <ScheduleModal schedule={playerSchedule} setSchedule={setPlayerSchedule} />
      )}

      {/* ── GRAPH MODAL ── */}
      {screen === 'play' && PHASES[phaseIdx]?.id === 'graphs' && !discoveryPopup && (
        <GraphModal appStates={appStates} />
      )}

      {/* ── IMPACT DASHBOARD ── */}
      {screen === 'play' && PHASES[phaseIdx]?.id === 'impact' && (
        <ImpactDashboard solarPct={solarPct} efficiencyPct={efficiencyPct} afterStats={afterStats} />
      )}

      {/* ── PHASE COMPLETE BUTTON ── */}
      {screen === 'play' && canCompletePhase && (
        <div className="l5-complete-btn">
          <button className="l5-modal-btn" onClick={advancePhase}>
            {phaseIdx < PHASES.length - 1 ? `✅ Complete — Next: ${PHASES[phaseIdx + 1]?.title}` : '✅ Complete All Phases → Quiz'}
          </button>
        </div>
      )}

      {/* ── PROGRESS BAR ── */}
      {screen === 'play' && (
        <div className="l5-progress-panel">
          <div className="l5-progress-header">{L5.target} Progress</div>
          <div className="l5-progress-bar-outer">
            <div className="l5-progress-bar-inner" style={{ width: `${((phaseIdx + 1) / PHASES.length) * 100}%` }}></div>
          </div>
          <div className="l5-progress-text">Phase {phaseIdx + 1}/{PHASES.length} {'\u{2022}'} {discoveredApps.size} apps found</div>
        </div>
      )}

      {/* ── QUIZ ── */}
      {screen === 'quiz' && <Level5Quiz onComplete={handleQuizComplete} />}

      {/* ── REWARD ── */}
      {screen === 'reward' && (
        <div className="l5-reward-overlay">
          <div className="l5-reward-card">
            <div className="l5-reward-badge">{L5.trophy}</div>
            <div className="l5-reward-title">{LEVEL5_BADGE.title}</div>
            <div className="l5-reward-sub">{LEVEL5_BADGE.description}</div>
            <div className="l5-reward-stars">
              {[1, 2, 3].map(s => (
                <span key={s} className={`l5-reward-star ${s <= stars ? 'earned' : 'empty'}`} style={{ animationDelay: `${s * 0.25}s` }}>{L5.star}</span>
              ))}
            </div>
            <div className="l5-reward-stats">
              <div className="l5-reward-stat"><div className="l5-reward-stat-label">CO₂ Saved</div><div className="l5-reward-stat-value">{Math.round(BEFORE_STATS.co2Month - afterStats.co2Month)} kg</div></div>
              <div className="l5-reward-stat"><div className="l5-reward-stat-label">Bill Saved</div><div className="l5-reward-stat-value">₹{Math.round(BEFORE_STATS.billMonth - afterStats.billMonth)}</div></div>
              <div className="l5-reward-stat"><div className="l5-reward-stat-label">Solar</div><div className="l5-reward-stat-value">{solarPct}%</div></div>
              <div className="l5-reward-stat"><div className="l5-reward-stat-label">Efficiency</div><div className="l5-reward-stat-value">{efficiencyPct}%</div></div>
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

      {/* ── HELP BTN ── */}
      {screen === 'play' && <HelpBtn />}
    </div>
  );
}

// ═══ SCHEDULE MODAL ═══
function ScheduleModal({ schedule, setSchedule }) {
  const heavyApps = useMemo(() => [
    'washing_machine', 'ev_charger', 'ac_1_5ton', 'geyser', 'induction', 'microwave',
    'led_bulb', 'led_tube', 'ceiling_fan', 'tv_smart', 'fridge',
  ], []);
  return (
    <div className="l5-modal-overlay" onClick={e => e.stopPropagation()}>
      <div className="l5-modal-card" onClick={e => e.stopPropagation()}>
        <div className="l5-modal-title">{L5.cal} Smart Scheduling</div>
        <p style={{ color: '#aaa', fontSize: 13, marginBottom: 12 }}>Assign each appliance to its best time slot. Solar peak = noon!</p>
        <div className="l5-schedule-grid">
          {heavyApps.map(id => {
            const app = L5_APPLIANCE_MAP[id];
            if (!app) return null;
            return (
              <div key={id} className={`l5-sched-item ${schedule[id] ? 'assigned' : ''}`}>
                <div className="l5-sched-name">{app.icon} {app.name}</div>
                <select className="l5-sched-select" value={schedule[id] || ''} onChange={e => setSchedule(prev => ({ ...prev, [id]: e.target.value }))}>
                  <option value="">Select time...</option>
                  {SCHEDULE_SLOTS.map(s => <option key={s.id} value={s.id}>{s.icon} {s.label}</option>)}
                </select>
                {schedule[id] && <div className="l5-sched-slot">{SCHEDULE_SLOTS.find(s => s.id === schedule[id])?.icon} {SCHEDULE_SLOTS.find(s => s.id === schedule[id])?.label}</div>}
              </div>
            );
          })}
        </div>
        {Object.keys(schedule).length >= 4 && (
          <div style={{ textAlign: 'center', color: '#22c55e', fontSize: 13, fontWeight: 700, marginTop: 8 }}>
            {L5.check} Score: {scoreSchedule(schedule).pct}% optimal scheduling
          </div>
        )}
      </div>
    </div>
  );
}

// ═══ GRAPH MODAL ═══
function GraphModal({ appStates }) {
  const activeApps = useMemo(() => Object.entries(appStates).filter(([, on]) => on).map(([id]) => L5_APPLIANCE_MAP[id]).filter(Boolean), [appStates]);
  const allApps = useMemo(() => Object.values(L5_APPLIANCE_MAP).sort((a, b) => b.wattage - a.wattage), []);
  const maxW = useMemo(() => Math.max(...allApps.map(a => a.wattage), 1), [allApps]);
  return (
    <div className="l5-modal-overlay" onClick={e => e.stopPropagation()}>
      <div className="l5-modal-card" onClick={e => e.stopPropagation()}>
        <div className="l5-modal-title">{L5.graph} Energy Analytics</div>
        <p style={{ color: '#aaa', fontSize: 12, marginBottom: 10 }}>{L5.zap} Appliance Power Consumption (Watts)</p>
        <div className="l5-graph-container">
          {allApps.map(a => {
            const pct = (a.wattage / maxW) * 100;
            const cls = a.wattage >= 1000 ? 'high' : a.wattage >= 200 ? 'medium' : 'low';
            const on = appStates[a.id];
            return (
              <div key={a.id} className="l5-graph-bar-row" style={{ opacity: on ? 1 : 0.5 }}>
                <div className="l5-graph-label">{a.icon} {a.name}</div>
                <div className="l5-graph-bar-bg">
                  <div className={`l5-graph-bar-fill ${cls}`} style={{ width: `${pct}%` }}>{a.wattage}W</div>
                </div>
              </div>
            );
          })}
        </div>
        {activeApps.length > 0 && (
          <div style={{ marginTop: 10, padding: 10, background: 'rgba(34,197,94,0.06)', borderRadius: 10, border: '1px solid rgba(34,197,94,0.15)' }}>
            <div style={{ fontSize: 11, color: '#22c55e', fontWeight: 700 }}>{L5.bulb} Active Load: {activeApps.reduce((s, a) => s + a.wattage, 0)}W</div>
            <div style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>Highest: {activeApps.sort((a, b) => b.wattage - a.wattage)[0]?.name} ({activeApps[0]?.wattage}W)</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══ IMPACT DASHBOARD ═══
function ImpactDashboard({ solarPct, efficiencyPct, afterStats }) {
  const co2Reduction = Math.round(((BEFORE_STATS.co2Month - afterStats.co2Month) / BEFORE_STATS.co2Month) * 100);
  return (
    <div className="l5-modal-overlay" onClick={e => e.stopPropagation()}>
      <div className="l5-modal-card" onClick={e => e.stopPropagation()}>
        <div className="l5-modal-title">{L5.globe} Final Impact Report</div>
        <div className="l5-impact-grid">
          <div className="l5-impact-col before">
            <div className="l5-impact-label">{L5.cross} Before Solar</div>
            <div className="l5-impact-stat"><div className="l5-impact-stat-val">{BEFORE_STATS.co2Month} kg</div><div className="l5-impact-stat-lbl">CO₂/month</div></div>
            <div className="l5-impact-stat"><div className="l5-impact-stat-val">₹{BEFORE_STATS.billMonth}</div><div className="l5-impact-stat-lbl">Bill/month</div></div>
            <div className="l5-impact-stat"><div className="l5-impact-stat-val">0%</div><div className="l5-impact-stat-lbl">Solar</div></div>
          </div>
          <div className="l5-impact-col after">
            <div className="l5-impact-label">{L5.check} After Solar</div>
            <div className="l5-impact-stat"><div className="l5-impact-stat-val">{afterStats.co2Month} kg</div><div className="l5-impact-stat-lbl">CO₂/month</div></div>
            <div className="l5-impact-stat"><div className="l5-impact-stat-val">₹{afterStats.billMonth}</div><div className="l5-impact-stat-lbl">Bill/month</div></div>
            <div className="l5-impact-stat"><div className="l5-impact-stat-val">{solarPct}%</div><div className="l5-impact-stat-lbl">Solar</div></div>
          </div>
        </div>
        <div className="l5-impact-savings">{L5.leaf} You reduced emissions by {co2Reduction}%!</div>
        <div className="l5-impact-message">{L5.sparkle} Efficiency: {efficiencyPct}% {'\u{2022}'} Solar: {solarPct}% {'\u{2022}'} Savings: ₹{BEFORE_STATS.billMonth - afterStats.billMonth}/month</div>
      </div>
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
        {[['W/\u2191','Forward'],['S/\u2193','Backward'],['A/\u2190','Turn Left'],['D/\u2192','Turn Right'],['Q','Look Up'],['Z','Look Down'],['E','Interact']].map(([k, l]) => (
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
