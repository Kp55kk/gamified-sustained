import React, { useState, useCallback, useRef, useEffect, useMemo, Suspense } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { useNavigate } from 'react-router-dom';
import House from '../House';
import Level4Player, { l4PlayerState } from './Level4Player';
import Level2Appliances, { getProximityLevels } from '../level2/Level2Appliances';
import Level4Environment from './Level4Environment';
import { useGame } from '../../context/GameContext';
import {
  L2_APPLIANCE_IDS, L2_APPLIANCE_MAP, USAGE_HOURS,
  PANEL_WATT_PEAK, MAX_PANELS, ROOF_GRID_SLOTS, TIME_PERIODS, WEATHER_TYPES, TILT_OPTIONS,
  BATTERY_CAPACITY_KWH,
  calcSolarOutput, calcSolarDailyKwh, calcMonthlySolarKwh, calcCO2Saved, calcBillSavings,
  calcHouseMonthlyKwh, getEfficiencyPct,
  LEVEL3_BEFORE, calculateL4Stars, LEVEL4_BADGE,
  SOLAR_FACTS, ENTRY_DIALOGUE, FINAL_MESSAGE, L4_ICONS, ROOM_ICONS,
} from './level4Data';
import Level4Quiz from './Level4Quiz';
import './Level4.css';

// ═══ AUDIO ═══
let audioCtx = null;
function getAC() { if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)(); return audioCtx; }
function playPlace() { try { const c=getAC(),o=c.createOscillator(),g=c.createGain(); o.connect(g);g.connect(c.destination);o.type='triangle';o.frequency.setValueAtTime(600,c.currentTime);o.frequency.linearRampToValueAtTime(900,c.currentTime+0.1);g.gain.setValueAtTime(0.1,c.currentTime);g.gain.exponentialRampToValueAtTime(0.001,c.currentTime+0.2);o.start(c.currentTime);o.stop(c.currentTime+0.2); } catch(e){} }
function playSuccess() { [523,659,784,1047].forEach((f,i) => { try { const c=getAC(),o=c.createOscillator(),g=c.createGain();o.connect(g);g.connect(c.destination);o.type='triangle';o.frequency.setValueAtTime(f,c.currentTime+i*0.12);g.gain.setValueAtTime(0.08,c.currentTime+i*0.12);g.gain.exponentialRampToValueAtTime(0.001,c.currentTime+i*0.12+0.3);o.start(c.currentTime+i*0.12);o.stop(c.currentTime+i*0.12+0.3); } catch(e){} }); }
function playToggle(on) { try { const c=getAC(),o=c.createOscillator(),g=c.createGain();o.connect(g);g.connect(c.destination);o.frequency.setValueAtTime(on?800:300,c.currentTime);g.gain.setValueAtTime(0.08,c.currentTime);g.gain.exponentialRampToValueAtTime(0.001,c.currentTime+0.1);o.start(c.currentTime);o.stop(c.currentTime+0.1); } catch(e){} }

// ═══ 3D HELPERS ═══
function CamRef({r}){const{camera}=useThree();useEffect(()=>{r.current=camera},[camera,r]);return null;}

function Scene({appStates,nearest,onRoom,onNearest,onInteract,camRef,proxLevels,recovery,timeOfDay,slots,tilt,showMarkers,onRooftopReach}){
  return(<><CamRef r={camRef}/><Level4Environment recoveryLevel={recovery} timeOfDay={timeOfDay} installedSlots={slots} tiltAngle={tilt} showSlotMarkers={showMarkers}/><House/><Level2Appliances applianceStates={appStates} nearestAppliance={nearest} taskTargetIds={null} proximityLevels={proxLevels}/><Level4Player onRoomChange={onRoom} onNearestApplianceChange={onNearest} onInteract={onInteract} applianceIdList={L2_APPLIANCE_IDS} onRooftopReach={onRooftopReach}/></>);
}

// ═══ TASKS DEFINITION ═══
const TASKS = [
  { id: 'discover', title: 'Solar Discovery', icon: '\u{2600}\u{FE0F}', objective: 'Walk outside and explore the environment', desc: 'Leave the house through the front door. Look around to see the world.', hint: 'Use W to walk forward, A/D to turn. Q to look up, Z to look down.' },
  { id: 'install', title: 'Install Solar Panels', icon: '\u{1F527}', objective: 'Place solar panels on the roof', desc: 'Walk to the front of the house and look up at the roof. Place at least 3 panels.', hint: 'Click the roof grid to place panels. Avoid shadow spots!' },
  { id: 'optimize', title: 'Optimize Panels', icon: '\u{2699}\u{FE0F}', objective: 'Adjust tilt for max efficiency', desc: 'Set the best panel angle. Target: 80%+ efficiency.', hint: '25\u{00B0} is optimal for India!' },
  { id: 'energy', title: 'Energy Management', icon: '\u{26A1}', objective: 'Run the house on solar power', desc: 'Go inside and turn on appliances. Watch solar vs grid split.', hint: 'Solar supplies power first. Keep grid usage low!' },
  { id: 'daynight', title: 'Day-Night Challenge', icon: '\u{1F305}', objective: 'Manage energy across the day', desc: 'Use the time slider to see how solar changes. Use heavy appliances at noon!', hint: 'Slide time to see output change' },
  { id: 'battery', title: 'Battery Storage', icon: '\u{1F50B}', objective: 'Store solar energy for night use', desc: 'At noon, excess solar charges battery. At night, battery powers house.', hint: 'Slide time to charge/discharge' },
  { id: 'recovery', title: 'See Recovery', icon: '\u{1F333}', objective: 'Walk outside and see the environment', desc: 'Go out through the front door and explore! See how solar power restored the world.', hint: 'Walk outside, look around at the trees and sky!' },
  { id: 'challenge', title: 'Final Challenge', icon: '\u{1F3AF}', objective: 'Run house with minimum grid', desc: 'Max solar usage (70%+), minimize grid. Smart timing!', hint: 'Turn on appliances during noon for best solar coverage' },
];

// ═══ CONTROLS HELP ═══
function ControlsHelp(){const[s,setS]=useState(false);
  return(<><button className="l4-help-btn" onClick={()=>setS(true)}>?</button>{s&&<div className="l4-controls-overlay" onClick={()=>setS(false)}><div className="l4-controls-card" onClick={e=>e.stopPropagation()}><div className="l4-controls-title">{L4_ICONS.grad} Controls</div>{[['W/\u2191','Forward'],['S/\u2193','Backward'],['A/\u2190','Turn Left'],['D/\u2192','Turn Right'],['Q','Look Up'],['Z','Look Down'],['E','Interact']].map(([k,l])=><div key={k} className="l4-ctrl-row"><span><span className="l4-key">{k}</span></span><span>{l}</span></div>)}<button className="l4-controls-got-it" onClick={()=>setS(false)}>Got it!</button></div></div>}</>);
}

// ═══ MAIN ═══
export default function Level4() {
  const navigate = useNavigate();
  const { addCarbonCoins, completeLevel } = useGame();
  const camRef = useRef(null);

  const [phase, setPhase] = useState('entry');
  const [introStep, setIntroStep] = useState(0);
  const [introBg, setIntroBg] = useState('dark');

  // Task system
  const [taskIdx, setTaskIdx] = useState(0);
  const [taskPhase, setTaskPhase] = useState('objective'); // objective | active | complete
  const [tasksPassed, setTasksPassed] = useState(0);

  // Solar
  const [installedSlots, setInstalledSlots] = useState([]);
  const [tiltAngle, setTiltAngle] = useState(25);
  const [tiltEff, setTiltEff] = useState(1.0);
  const [weatherIdx, setWeatherIdx] = useState(0);
  const [timeIdx, setTimeIdx] = useState(2);

  // Battery
  const [batteryCharge, setBatteryCharge] = useState(0);

  // Appliances
  const [appStates, setAppStates] = useState(() => { const s={}; L2_APPLIANCE_IDS.forEach(id=>{s[id]=false}); return s; });
  const [currentRoom, setCurrentRoom] = useState('Living Room');
  const [nearest, setNearest] = useState(null);
  const [proxLevels, setProxLevels] = useState({});

  // Discovery
  const [hasGoneOutside, setHasGoneOutside] = useState(false);
  const [discoveryQ, setDiscoveryQ] = useState(null);
  const [reachedRooftop, setReachedRooftop] = useState(false);

  // Quiz/Reward
  const [quizResult, setQuizResult] = useState(null);
  const [stars, setStars] = useState(0);

  // Computed
  const weather = WEATHER_TYPES[weatherIdx];
  const timePeriod = TIME_PERIODS[timeIdx];
  const panelCount = installedSlots.length;
  const avgShadow = panelCount > 0 ? installedSlots.reduce((s,i)=>s+ROOF_GRID_SLOTS[i].shadow,0)/panelCount : 0;
  const currentSolarW = calcSolarOutput(panelCount, tiltEff, timePeriod.sunlight, weather.factor, avgShadow);
  const dailyKwh = calcSolarDailyKwh(panelCount, tiltEff, weather.factor, installedSlots);
  const monthlyKwh = calcMonthlySolarKwh(dailyKwh);
  const houseKwh = calcHouseMonthlyKwh();
  const effPct = getEfficiencyPct(tiltEff, avgShadow, weather.factor);
  const co2Saved = calcCO2Saved(monthlyKwh);
  const savings = calcBillSavings(monthlyKwh, houseKwh);

  const houseWatts = useMemo(() => {
    let w=0; L2_APPLIANCE_IDS.forEach(id=>{if(appStates[id])w+=L2_APPLIANCE_MAP[id].wattage}); return w;
  }, [appStates]);
  const solarUsed = Math.min(currentSolarW, houseWatts);
  const gridWatts = Math.max(houseWatts - currentSolarW, 0);
  const excessSolar = Math.max(currentSolarW - houseWatts, 0);
  const solarPct = houseWatts > 0 ? Math.round((solarUsed / houseWatts) * 100) : (panelCount > 0 ? 100 : 0);
  const gridPct = 100 - solarPct;

  const recoveryLevel = useMemo(() => {
    if (phase === 'entry') return 0;
    const base = Math.min(taskIdx / TASKS.length, 1);
    return 0.15 + base * 0.85;
  }, [phase, taskIdx]);

  const currentTask = TASKS[taskIdx];

  // ─── Intro animation ───
  useEffect(() => {
    if (phase !== 'entry') return;
    const t1=setTimeout(()=>setIntroStep(1),500);
    const t2=setTimeout(()=>{setIntroStep(2);setIntroBg('dawn')},1800);
    const t3=setTimeout(()=>{setIntroStep(3);setIntroBg('bright')},3500);
    const t4=setTimeout(()=>{setIntroStep(4);setIntroBg('solar')},5000);
    return()=>{clearTimeout(t1);clearTimeout(t2);clearTimeout(t3);clearTimeout(t4)};
  }, [phase]);

  // ─── Room change → detect going outside ───
  const handleRoomChange = useCallback(r => {
    setCurrentRoom(r);
    if (r === 'Outside' && !hasGoneOutside) setHasGoneOutside(true);
  }, [hasGoneOutside]);

  // ─── Interact ───
  const handleInteract = useCallback(id => {
    if (!L2_APPLIANCE_IDS.includes(id)) return;
    setAppStates(p => { playToggle(!p[id]); return {...p,[id]:!p[id]}; });
  }, []);

  // ─── Panel slot toggle ───
  const toggleSlot = useCallback(idx => {
    setInstalledSlots(prev => {
      if (prev.includes(idx)) return prev.filter(i=>i!==idx);
      if (prev.length >= MAX_PANELS) return prev;
      playPlace(); return [...prev, idx];
    });
  }, []);

  const selectTilt = useCallback((angle, eff) => { setTiltAngle(angle); setTiltEff(eff); playPlace(); }, []);

  // ─── Task completion checks ───
  useEffect(() => {
    if (phase !== 'play' || taskPhase !== 'active') return;
    const t = currentTask;
    if (!t) return;
    if (t.id === 'discover' && hasGoneOutside && discoveryQ !== null) {
      completeTask();
    }
    if (t.id === 'energy' && houseWatts > 0 && solarPct > 0) {
      // Keep active, user clicks next
    }
  }, [phase, taskPhase, hasGoneOutside, discoveryQ, houseWatts, solarPct, currentTask]);

  const completeTask = useCallback(() => {
    playSuccess();
    setTasksPassed(p => p + 1);
    setTaskPhase('complete');
  }, []);

  const advanceTask = useCallback(() => {
    const next = taskIdx + 1;
    if (next >= TASKS.length) {
      setPhase('compare');
    } else {
      setTaskIdx(next);
      setTaskPhase('objective');
    }
  }, [taskIdx]);

  const handleQuizComplete = useCallback(result => {
    setQuizResult(result);
    const s = calculateL4Stars(effPct, solarPct, result.score, result.total);
    setStars(s); setPhase('reward');
  }, [effPct, solarPct]);

  const handleFinish = useCallback(() => {
    addCarbonCoins(LEVEL4_BADGE.coins + stars * 20);
    completeLevel(4); navigate('/hub');
  }, [stars, addCarbonCoins, completeLevel, navigate]);

  const handleRooftopReach = useCallback(() => {
    if (!reachedRooftop) setReachedRooftop(true);
  }, [reachedRooftop]);

  // ═══ RENDER: ENTRY ═══
  if (phase === 'entry') {
    return (<div className="l4-container"><div className="l4-intro-overlay">
      <div className={`l4-intro-bg ${introBg}`}/>
      <div className={`l4-intro-icon ${introStep>=2?'visible':''}`}>{L4_ICONS.sun}</div>
      <h1 className={`l4-intro-title ${introStep>=3?'visible':''}`}>SOLAR REVOLUTION</h1>
      <div className={`l4-intro-subtitle ${introStep>=3?'visible':''}`}>Level 4</div>
      <div className={`l4-intro-dialogue ${introStep>=3?'visible':''}`}>
        <div className="l4-intro-avatar">{'\u{1F9D1}\u{200D}\u{1F393}'}</div>
        <p className="l4-intro-quote">"{ENTRY_DIALOGUE.join(' ')}"</p>
      </div>
      <button className={`l4-intro-start-btn ${introStep>=4?'visible':''}`} onClick={()=>{setPhase('play');setTaskPhase('objective')}}>Begin Level 4 {'\u{2192}'}</button>
    </div></div>);
  }

  // ═══ RENDER: QUIZ ═══
  if (phase === 'quiz') return <div className="l4-container"><Level4Quiz onComplete={handleQuizComplete}/></div>;

  // ═══ RENDER: REWARD ═══
  if (phase === 'reward' && quizResult) {
    const coins = LEVEL4_BADGE.coins + stars * 20;
    return (<div className="l4-container"><div className="l4-reward-overlay"><div className="l4-reward-card">
      <div className="l4-reward-badge">{LEVEL4_BADGE.icon}</div>
      <div className="l4-reward-title">{LEVEL4_BADGE.title}</div>
      <div className="l4-reward-subtitle">{LEVEL4_BADGE.description}</div>
      <div className="l4-reward-stars">{[1,2,3].map(s=><span key={s} className={`l4-reward-star ${s<=stars?'earned':'empty'}`} style={{animationDelay:`${s*0.3}s`}}>{L4_ICONS.star}</span>)}</div>
      <div className="l4-reward-stats">
        <div className="l4-reward-stat"><div className="l4-reward-stat-label">Efficiency</div><div className="l4-reward-stat-value">{effPct}%</div></div>
        <div className="l4-reward-stat"><div className="l4-reward-stat-label">CO{'\u2082'} Saved</div><div className="l4-reward-stat-value">{co2Saved} kg</div></div>
        <div className="l4-reward-stat"><div className="l4-reward-stat-label">Quiz</div><div className="l4-reward-stat-value">{quizResult.score}/{quizResult.total}</div></div>
      </div>
      <div className="l4-reward-final-msg">{FINAL_MESSAGE.map((m,i)=><div key={i} className="l4-reward-final-line">"{m}"</div>)}</div>
      <div className="l4-reward-coins"><span>{L4_ICONS.coin}</span><span>+{coins} Carbon Coins</span></div>
      <button className="l4-reward-btn" onClick={handleFinish}>Return to Hub {'\u{2192}'}</button>
    </div></div></div>);
  }

  // ═══ RENDER: COMPARE ═══
  if (phase === 'compare') {
    return (<div className="l4-container"><div className="l4-modal-overlay"><div className="l4-modal-card">
      <div className="l4-modal-title">{L4_ICONS.chart} Before vs After Solar</div>
      <div className="l4-compare-grid">
        <div className="l4-compare-col before">
          <div className="l4-compare-label">{L4_ICONS.cross} Before</div>
          <div className="l4-compare-stat"><div className="l4-compare-stat-val">{LEVEL3_BEFORE.co2Month} kg</div><div className="l4-compare-stat-lbl">CO{'\u2082'}/month</div></div>
          <div className="l4-compare-stat"><div className="l4-compare-stat-val">{'\u20B9'}{LEVEL3_BEFORE.billMonth}</div><div className="l4-compare-stat-lbl">Bill/month</div></div>
        </div>
        <div className="l4-compare-col after">
          <div className="l4-compare-label">{L4_ICONS.check} After Solar</div>
          <div className="l4-compare-stat"><div className="l4-compare-stat-val">{Math.max(LEVEL3_BEFORE.co2Month - co2Saved, 0)} kg</div><div className="l4-compare-stat-lbl">CO{'\u2082'}/month</div></div>
          <div className="l4-compare-stat"><div className="l4-compare-stat-val">{'\u20B9'}{savings.after}</div><div className="l4-compare-stat-lbl">Bill/month</div></div>
        </div>
      </div>
      <div className="l4-compare-savings">{L4_ICONS.sparkle} Saved {'\u20B9'}{savings.saved}/month ({savings.pctSaved}%)</div>
      <div style={{marginTop:'8px',padding:'8px',background:'rgba(34,197,94,0.06)',borderRadius:'8px',fontSize:'12px',color:'#aaddbb',textAlign:'center'}}>{L4_ICONS.leaf} Solar reduced emissions and cost significantly!</div>
      <button className="l4-modal-btn" onClick={()=>setPhase('quiz')}>Take Final Quiz {'\u{2192}'}</button>
    </div></div></div>);
  }

  // ═══ RENDER: TASK OBJECTIVE (briefing before each task) ═══
  if (phase === 'play' && taskPhase === 'objective' && currentTask) {
    return (<div className="l4-container"><div className="l4-modal-overlay"><div className="l4-modal-card">
      <div style={{fontSize:'11px',color:'#888',textTransform:'uppercase',letterSpacing:'2px',marginBottom:'6px'}}>Task {taskIdx + 1} of {TASKS.length}</div>
      <div className="l4-modal-title"><span style={{fontSize:'36px'}}>{currentTask.icon}</span> {currentTask.title}</div>
      <div style={{fontSize:'16px',fontWeight:600,color:'#ffeedd',marginBottom:'8px',lineHeight:1.5}}>{L4_ICONS.target} {currentTask.objective}</div>
      <div style={{fontSize:'13px',color:'#999',marginBottom:'12px'}}>{currentTask.desc}</div>
      <div style={{padding:'8px 12px',background:'rgba(245,166,35,0.06)',borderRadius:'8px',fontSize:'12px',color:'#f5a623'}}>{L4_ICONS.bulb} {currentTask.hint}</div>
      <button className="l4-modal-btn" onClick={()=>setTaskPhase('active')}>Start Task {'\u{2192}'}</button>
    </div></div></div>);
  }

  // ═══ RENDER: TASK COMPLETE ═══
  if (phase === 'play' && taskPhase === 'complete' && currentTask) {
    const learnings = {
      discover: ['Solar is 100% clean and renewable', 'Sunlight can be converted to electricity'],
      install: ['Panel placement affects output', 'Shadows reduce efficiency'],
      optimize: ['25\u00B0 tilt is best for India', 'Better placement = more energy'],
      energy: ['Solar supplies power first', 'Reduce usage to minimize grid'],
      daynight: ['Solar output peaks at noon', 'Plan heavy usage for peak sunlight'],
      battery: ['Battery stores excess solar', 'Night usage can be solar-powered'],
      recovery: ['Solar restores the environment', 'Clean energy = blue sky, green trees, fresh air'],
      challenge: ['Smart usage maximizes solar', 'You can run a home on clean energy!'],
    };
    return (<div className="l4-container"><div className="l4-modal-overlay"><div className="l4-modal-card" style={{borderColor:'rgba(34,197,94,0.3)'}}>
      <div style={{display:'flex',alignItems:'center',gap:'8px',fontFamily:"'Fredoka',sans-serif",fontSize:'18px',fontWeight:700,color:'#22c55e',marginBottom:'14px'}}>{L4_ICONS.check} Task Complete!</div>
      <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
        {(learnings[currentTask.id] || []).map((l,i) => (
          <div key={i} style={{display:'flex',alignItems:'flex-start',gap:'8px',background:'rgba(34,197,94,0.06)',border:'1px solid rgba(34,197,94,0.15)',borderRadius:'10px',padding:'10px 12px',fontSize:'13px',color:'#aaddbb',lineHeight:1.5}}>
            <span>{L4_ICONS.bulb}</span><span>{l}</span>
          </div>
        ))}
      </div>
      <button className="l4-modal-btn green" onClick={advanceTask}>{taskIdx+1 >= TASKS.length ? 'See Results' : 'Next Task'} {'\u{2192}'}</button>
    </div></div></div>);
  }

  // ═══ RENDER: INSTALL TASK (modal overlay on 3D) ═══
  if (phase === 'play' && taskPhase === 'active' && currentTask?.id === 'install') {
    return (<div className="l4-container">
      <div className="l4-canvas-wrapper">
        <Canvas camera={{position:[-5,8,-14],fov:50}} gl={{antialias:false}} onCreated={({gl})=>{gl.setClearColor('#050a15');gl.toneMapping=1;gl.toneMappingExposure=1.0;gl.setPixelRatio(Math.min(window.devicePixelRatio,1.5))}}>
          <Suspense fallback={null}><Level4Environment recoveryLevel={recoveryLevel} timeOfDay="noon" installedSlots={installedSlots} tiltAngle={tiltAngle} showSlotMarkers={true}/><House/></Suspense>
        </Canvas>
      </div>
      <div style={{position:'absolute',inset:0,zIndex:35,display:'flex',alignItems:'center',justifyContent:'flex-end',padding:'16px 24px'}}>
        <div className="l4-modal-card" style={{maxWidth:'380px',boxShadow:'0 0 40px rgba(0,0,0,0.8)'}}>
          <div className="l4-modal-title">{L4_ICONS.wrench} Place Solar Panels on Roof</div>
          <p style={{fontSize:'12px',color:'#aaa',marginBottom:'6px'}}>Click positions to place panels. Place at least 3!</p>
          <div className="l4-grid-slots">
            {ROOF_GRID_SLOTS.map(slot => {
              const placed = installedSlots.includes(slot.id);
              return (<div key={slot.id} className={`l4-grid-slot ${placed?'placed':''} ${slot.shadow>0.05?'shadow-warn':''}`} onClick={()=>toggleSlot(slot.id)}>
                <div className="l4-grid-slot-icon">{placed ? L4_ICONS.panel : '\u{2795}'}</div>
                <div className="l4-grid-slot-label">{slot.label}</div>
                {slot.shadow > 0 && <div className="l4-grid-slot-shadow">{L4_ICONS.cloud} {Math.round(slot.shadow*100)}% shadow</div>}
              </div>);
            })}
          </div>
          <div style={{fontSize:'13px',color:'#f5a623',textAlign:'center'}}>{panelCount}/{MAX_PANELS} panels {' \u2022 '}{panelCount * PANEL_WATT_PEAK}W peak</div>
          <button className="l4-modal-btn" disabled={panelCount<3} onClick={completeTask}>Done Installing {'\u{2192}'}</button>
        </div>
      </div>
    </div>);
  }

  // ═══ RENDER: OPTIMIZE TASK ═══
  if (phase === 'play' && taskPhase === 'active' && currentTask?.id === 'optimize') {
    return (<div className="l4-container">
      <div className="l4-canvas-wrapper">
        <Canvas camera={{position:[-5,8,-14],fov:50}} gl={{antialias:false}} onCreated={({gl})=>{gl.setClearColor('#050a15');gl.toneMapping=1;gl.toneMappingExposure=1.0;gl.setPixelRatio(Math.min(window.devicePixelRatio,1.5))}}>
          <Suspense fallback={null}><Level4Environment recoveryLevel={recoveryLevel} timeOfDay="noon" installedSlots={installedSlots} tiltAngle={tiltAngle}/><House/></Suspense>
        </Canvas>
      </div>
      <div style={{position:'absolute',inset:0,zIndex:35,display:'flex',alignItems:'center',justifyContent:'flex-end',padding:'16px 24px'}}>
        <div className="l4-modal-card" style={{maxWidth:'380px',boxShadow:'0 0 40px rgba(0,0,0,0.8)'}}>
          <div className="l4-modal-title">{L4_ICONS.gear} Optimize Panel Angle</div>
          <div className="l4-tilt-options">
            {TILT_OPTIONS.map(t => (<div key={t.angle} className={`l4-tilt-option ${tiltAngle===t.angle?'selected':''} ${t.efficiency===1.0?'best':''}`} onClick={()=>selectTilt(t.angle,t.efficiency)}>
              <div className="l4-tilt-label">{t.label}</div>
              <div className="l4-tilt-eff">{Math.round(t.efficiency*100)}%</div>
            </div>))}
          </div>
          <div className="l4-eff-gauge">
            <div className="l4-eff-value" style={{color:effPct>=80?'#22c55e':'#f5a623'}}>{effPct}%</div>
            <div className="l4-eff-label">Overall Efficiency</div>
          </div>
          {effPct >= 80 && <div style={{padding:'6px',background:'rgba(34,197,94,0.08)',borderRadius:'6px',fontSize:'12px',color:'#22c55e',textAlign:'center'}}>{L4_ICONS.check} Excellent!</div>}
          <button className="l4-modal-btn" onClick={completeTask}>Confirm Optimization {'\u{2192}'}</button>
        </div>
      </div>
    </div>);
  }

  // ═══ RENDER: QUIZ-only phases handled above ═══
  if (phase !== 'play') return null;

  // ═══ RENDER: 3D SCENE (discover, energy, daynight, battery, challenge) ═══
  const batteryPct = Math.round((batteryCharge / BATTERY_CAPACITY_KWH) * 100);
  const showTimeSlider = currentTask && ['daynight','battery','challenge'].includes(currentTask.id);
  const showBattery = currentTask && ['battery','challenge'].includes(currentTask.id);
  const showWeather = currentTask && ['daynight','challenge'].includes(currentTask.id);
  const challengeMetSolar = solarPct >= 70;
  const challengeMetGrid = gridWatts < 500;

  return (<div className="l4-container">
    <div className="l4-canvas-wrapper">
      <Canvas camera={{position:[-5,6,1],fov:50}} gl={{antialias:false}}
        onCreated={({gl})=>{gl.setClearColor('#050a15');gl.toneMapping=1;gl.toneMappingExposure=1.0;gl.setPixelRatio(Math.min(window.devicePixelRatio,1.5))}}>
        <Suspense fallback={null}>
          <Scene appStates={appStates} nearest={nearest} onRoom={handleRoomChange}
            onNearest={id=>{setNearest(id);setProxLevels(getProximityLevels(l4PlayerState.x,l4PlayerState.z))}}
            onInteract={handleInteract} camRef={camRef} proxLevels={proxLevels}
            recovery={recoveryLevel} timeOfDay={timePeriod.id} slots={installedSlots} tilt={tiltAngle}
            showMarkers={false} onRooftopReach={handleRooftopReach}/>
        </Suspense>
      </Canvas>
    </div>

    {/* HUD TOP */}
    <div className="l4-hud-top">
      <button className="l4-back-btn" onClick={()=>navigate('/hub')}>{'\u2190'} Back</button>
      <div className="l4-hud-title">{L4_ICONS.sun} Solar Revolution</div>
      <div className="l4-hud-room">{ROOM_ICONS[currentRoom]||L4_ICONS.pin} {currentRoom}</div>
    </div>

    {/* TASK BAR */}
    <div style={{position:'absolute',top:'55px',left:'50%',transform:'translateX(-50%)',zIndex:20,background:'rgba(5,10,20,0.95)',border:'1px solid rgba(245,166,35,0.25)',borderRadius:'12px',padding:'10px 18px',maxWidth:'420px',width:'90%',textAlign:'center'}}>
      <div style={{fontSize:'10px',color:'#888',textTransform:'uppercase',letterSpacing:'1px'}}>Task {taskIdx+1}/{TASKS.length}</div>
      <div style={{fontSize:'14px',fontWeight:700,color:'#f5a623'}}>{currentTask?.icon} {currentTask?.title}</div>
      <div style={{fontSize:'12px',color:'#aaa',marginTop:'2px'}}>{L4_ICONS.target} {currentTask?.objective}</div>
      {currentTask?.id === 'discover' && <div style={{fontSize:'11px',color:'#88ccff',marginTop:'4px'}}>{hasGoneOutside ? `${L4_ICONS.check} Outside!` : 'Walk through the front door...'} {' \u2022 '} Q=Look Up, Z=Look Down</div>}
    </div>

    {/* SOLAR METER (after install) */}
    {panelCount > 0 && (
      <div className="l4-solar-panel">
        <div className="l4-solar-header"><span>{L4_ICONS.sun}</span><span>Solar Output</span></div>
        <div className="l4-solar-bar-outer"><div className="l4-solar-bar-fill" style={{width:`${Math.min(currentSolarW/(panelCount*PANEL_WATT_PEAK||1)*100,100)}%`,backgroundColor:'#f5a623',color:'#f5a623'}}/></div>
        <div className="l4-solar-output">
          <span className="l4-solar-watts">{currentSolarW}W</span>
          <span className="l4-solar-eff" style={{backgroundColor:effPct>=80?'rgba(34,197,94,0.15)':'rgba(245,166,35,0.15)',color:effPct>=80?'#22c55e':'#f5a623'}}>{effPct}% eff</span>
        </div>
        <div className="l4-solar-details"><span>{panelCount} panels</span><span>{dailyKwh} kWh/day</span></div>
        {houseWatts > 0 && <div style={{marginTop:'6px'}}>
          <div style={{fontSize:'10px',color:'#888',marginBottom:'2px'}}>Power Source</div>
          <div className="l4-split-bar">
            <div className="l4-split-solar" style={{width:`${solarPct}%`}}>{solarPct>10?`${solarPct}%`:''}</div>
            <div className="l4-split-grid" style={{width:`${gridPct}%`}}>{gridPct>10?`Grid ${gridPct}%`:''}</div>
          </div>
        </div>}
      </div>
    )}

    {/* BATTERY */}
    {showBattery && (
      <div className="l4-battery-panel">
        <div className="l4-battery-header"><span>{L4_ICONS.battery}</span><span>Battery</span></div>
        <div className="l4-battery-bar-outer"><div className="l4-battery-bar-fill" style={{width:`${batteryPct}%`}}/></div>
        <div className="l4-battery-info"><span>{batteryCharge.toFixed(1)}/{BATTERY_CAPACITY_KWH} kWh</span><span>{excessSolar>0?'Charging':timePeriod.sunlight===0?'Discharging':'Idle'}</span></div>
      </div>
    )}

    {/* TIME PANEL */}
    <div className="l4-time-panel">
      <div className="l4-time-icon">{timePeriod.icon}</div>
      <div className="l4-time-label">{timePeriod.label}</div>
      <div className="l4-time-weather">{weather.icon} {weather.label}</div>
      {showTimeSlider && (<div style={{marginTop:'8px'}}>
        <input type="range" className="l4-time-slider" min={0} max={TIME_PERIODS.length-1} value={timeIdx} onChange={e=>{
          setTimeIdx(Number(e.target.value));
          const tp = TIME_PERIODS[Number(e.target.value)];
          if (tp.sunlight === 0 && batteryCharge > 0) setBatteryCharge(p => Math.max(p - 0.5, 0));
          else if (excessSolar > 0) setBatteryCharge(p => Math.min(p + 0.3, BATTERY_CAPACITY_KWH));
        }}/>
        <div className="l4-time-periods">{TIME_PERIODS.map((tp,i)=><span key={tp.id} className={`l4-time-period ${i===timeIdx?'active':''}`} onClick={()=>setTimeIdx(i)}>{tp.icon}</span>)}</div>
      </div>)}
    </div>

    {/* WEATHER */}
    {showWeather && (
      <div style={{position:'absolute',top:'110px',left:'50%',transform:'translateX(-50%)',zIndex:20,display:'flex',gap:'6px'}}>
        {WEATHER_TYPES.map((w,i)=>(
          <button key={w.id} onClick={()=>setWeatherIdx(i)} style={{padding:'5px 10px',borderRadius:'6px',border:`1px solid ${i===weatherIdx?'rgba(245,166,35,0.4)':'rgba(255,255,255,0.1)'}`,background:i===weatherIdx?'rgba(245,166,35,0.12)':'rgba(5,10,20,0.9)',color:'#ddd',fontSize:'11px',fontWeight:600,cursor:'pointer'}}>{w.icon} {w.label}</button>
        ))}
      </div>
    )}

    {/* CHALLENGE HUD */}
    {currentTask?.id === 'challenge' && (
      <div style={{position:'absolute',top:'145px',left:'50%',transform:'translateX(-50%)',zIndex:20,background:'rgba(5,10,20,0.95)',border:'2px solid rgba(245,166,35,0.3)',borderRadius:'10px',padding:'8px 14px',display:'flex',gap:'12px'}}>
        <span style={{fontSize:'12px',color:challengeMetSolar?'#22c55e':'#ef4444',fontWeight:700}}>{L4_ICONS.sun} Solar {solarPct}% {challengeMetSolar?L4_ICONS.check:''}</span>
        <span style={{fontSize:'12px',color:challengeMetGrid?'#22c55e':'#ef4444',fontWeight:700}}>{L4_ICONS.zap} Grid {gridWatts}W {challengeMetGrid?L4_ICONS.check:''}</span>
      </div>
    )}

    {/* DISCOVERY QUESTION */}
    {currentTask?.id === 'discover' && hasGoneOutside && discoveryQ === null && (
      <div style={{position:'absolute',bottom:'80px',left:'50%',transform:'translateX(-50%)',zIndex:20,background:'rgba(5,10,20,0.95)',border:'1px solid rgba(245,166,35,0.3)',borderRadius:'12px',padding:'14px 20px',maxWidth:'340px',textAlign:'center'}}>
        <div style={{fontSize:'13px',fontWeight:700,color:'#f5a623',marginBottom:'6px'}}>{L4_ICONS.bulb} Quick Question</div>
        <div style={{fontSize:'13px',color:'#ffeedd',marginBottom:'8px'}}>Is solar energy clean energy?</div>
        <div style={{display:'flex',gap:'8px'}}>
          <button onClick={()=>setDiscoveryQ(true)} style={{flex:1,padding:'8px',borderRadius:'8px',border:'1px solid rgba(34,197,94,0.3)',background:'rgba(34,197,94,0.08)',color:'#22c55e',fontWeight:700,cursor:'pointer',fontSize:'13px'}}>Yes {L4_ICONS.check}</button>
          <button onClick={()=>setDiscoveryQ(false)} style={{flex:1,padding:'8px',borderRadius:'8px',border:'1px solid rgba(239,68,68,0.3)',background:'rgba(239,68,68,0.08)',color:'#ef4444',fontWeight:700,cursor:'pointer',fontSize:'13px'}}>No {L4_ICONS.cross}</button>
        </div>
      </div>
    )}

    {/* COMPLETE TASK BUTTON (for tasks that need manual completion) */}
    {taskPhase === 'active' && currentTask && ['energy','daynight','battery','challenge'].includes(currentTask.id) && (
      <div style={{position:'absolute',bottom:'20px',left:'50%',transform:'translateX(-50%)',zIndex:20}}>
        <button className="l4-modal-btn" style={{padding:'10px 24px',width:'auto'}} onClick={completeTask}>Complete Task {'\u{2192}'}</button>
      </div>
    )}

    {/* PROGRESS */}
    <div className="l4-progress-panel">
      <div className="l4-progress-header">{L4_ICONS.target} Tasks</div>
      <div className="l4-progress-bar-outer"><div className="l4-progress-bar-inner" style={{width:`${(taskIdx/TASKS.length)*100}%`}}/></div>
      <div className="l4-progress-text">{tasksPassed} done / {TASKS.length} total</div>
    </div>

    <ControlsHelp/>
  </div>);
}
