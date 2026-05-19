import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  L4_ICONS, ENERGY_FLOW_STEPS, BATTERY_CAPACITY_KWH,
  TIME_PERIODS, SCHEDULABLE_APPLIANCES, TARIFF_NORMAL, TARIFF_PEAK, PEAK_HOURS,
  COOLING_DATA, SENSOR_ROOMS, EV_DATA, WEATHER_SCENARIOS,
  DASHBOARD_METRICS, TRANSFORMATION_BEFORE, TRANSFORMATION_AFTER,
  calcPeakSavings,
} from './level4Data';

// ─── Shared Audio ───
let _ac=null;
function getAC(){if(!_ac)_ac=new(window.AudioContext||window.webkitAudioContext)();return _ac;}
function playPhaseSound(type){try{const c=getAC(),o=c.createOscillator(),g=c.createGain();o.connect(g);g.connect(c.destination);g.gain.value=0.07;
  if(type==='start'){o.type='triangle';o.frequency.setValueAtTime(523,c.currentTime);o.frequency.setValueAtTime(659,c.currentTime+0.1);o.frequency.setValueAtTime(784,c.currentTime+0.2);g.gain.exponentialRampToValueAtTime(0.001,c.currentTime+0.5);}
  else if(type==='click'){o.type='sine';o.frequency.setValueAtTime(600,c.currentTime);g.gain.exponentialRampToValueAtTime(0.001,c.currentTime+0.15);}
  else if(type==='done'){o.type='triangle';[523,659,784,1047].forEach((f,i)=>{o.frequency.setValueAtTime(f,c.currentTime+i*0.12);});g.gain.exponentialRampToValueAtTime(0.001,c.currentTime+0.6);}
  else if(type==='learn'){o.type='sine';o.frequency.setValueAtTime(880,c.currentTime);o.frequency.exponentialRampToValueAtTime(1200,c.currentTime+0.15);g.gain.exponentialRampToValueAtTime(0.001,c.currentTime+0.3);}
  else{o.type='sine';o.frequency.setValueAtTime(440,c.currentTime);g.gain.exponentialRampToValueAtTime(0.001,c.currentTime+0.2);}
  o.start();o.stop(c.currentTime+1);}catch(e){}}

// ─── Animated Counter ───
function AnimCount({value,suffix='',prefix='',duration=800}){
  const[disp,setDisp]=useState(0);const ref=useRef(null);
  useEffect(()=>{let cur=0;const step=()=>{const d=value-cur;if(Math.abs(d)<1){setDisp(value);return;}cur+=d*0.15;setDisp(Math.round(cur));ref.current=requestAnimationFrame(step);};ref.current=requestAnimationFrame(step);return()=>{if(ref.current)cancelAnimationFrame(ref.current);};},[value]);
  return <span>{prefix}{typeof disp==='number'?disp.toLocaleString():disp}{suffix}</span>;
}

// ─── Shared Phase Wrapper ───
function PhaseWrap({ title, icon, children, onComplete, btnLabel='Continue →' }) {
  useEffect(()=>{playPhaseSound('start');},[]);
  return (
    <div className="l4-phase-wrap">
      <div className="l4-phase-header"><span className="l4-phase-icon">{icon}</span><span>{title}</span></div>
      <div className="l4-phase-body">{children}</div>
      {onComplete && <button className="l4-modal-btn green" onClick={()=>{playPhaseSound('done');onComplete();}}>{btnLabel}</button>}
    </div>
  );
}

// ═══ PHASE 2: ENERGY FLOW ═══
export function EnergyFlowPhase({ solarW, onComplete }) {
  const [step, setStep] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);
  useEffect(() => {
    if (!autoPlay) return;
    const t = setInterval(() => setStep(p => { if (p >= ENERGY_FLOW_STEPS.length - 1) { setAutoPlay(false); return p; } return p + 1; }), 2000);
    return () => clearInterval(t);
  }, [autoPlay]);
  const flow = ENERGY_FLOW_STEPS[step];
  const allSeen = step >= ENERGY_FLOW_STEPS.length - 1;
  return (
    <PhaseWrap title="Energy Flow" icon={L4_ICONS.zap} onComplete={allSeen ? onComplete : null} btnLabel="Next Phase →">
      <p className="l4-phase-desc">Watch how energy flows from the Sun to your home.</p>
      <div className="l4-flow-visual">
        {ENERGY_FLOW_STEPS.map((f, i) => (
          <div key={f.id} className={`l4-flow-step ${i <= step ? 'active' : ''} ${i === step ? 'current' : ''}`}
               style={{ '--flow-color': f.color }} onClick={() => setStep(i)}>
            <div className="l4-flow-dot" /><div className="l4-flow-label">{f.label}</div>
          </div>
        ))}
      </div>
      <div className="l4-flow-info">
        <div className="l4-flow-current">{flow?.label}</div>
        <div className="l4-flow-route">{flow?.from} → {flow?.to}</div>
      </div>
      <div className="l4-flow-stats">
        <div className="l4-flow-stat"><span>{L4_ICONS.sun}</span><span>Solar: {solarW}W</span></div>
        <div className="l4-flow-stat"><span>{L4_ICONS.battery}</span><span>Battery: Ready</span></div>
      </div>
      {!autoPlay && step < ENERGY_FLOW_STEPS.length - 1 && (
        <div className="l4-flow-btns">
          <button className="l4-modal-btn" onClick={() => setAutoPlay(true)}>▶ Auto Play</button>
          <button className="l4-modal-btn" onClick={() => setStep(p => Math.min(p + 1, ENERGY_FLOW_STEPS.length - 1))}>Next Step →</button>
        </div>
      )}
      <div className="l4-phase-learning">{L4_ICONS.bulb} In India, a 1kW solar panel makes about 4.5 units of electricity per day. Solar panels create battery-type power, the inverter changes it to home-type power that your appliances can use. Extra power goes to a battery or back to the power company. Outside power is only backup!</div>
    </PhaseWrap>
  );
}

// ═══ PHASE 3: BATTERY STORAGE ═══
export function BatteryPhase({ solarW, houseW, onComplete }) {
  const [timeIdx, setTimeIdx] = useState(2); // Start at noon
  const [charge, setCharge] = useState(0);
  const [history, setHistory] = useState([]);
  const tp = TIME_PERIODS[timeIdx];
  const solarNow = Math.round(solarW * tp.sunlight);
  const excess = Math.max(solarNow - houseW, 0);
  const deficit = Math.max(houseW - solarNow, 0);
  const battPct = Math.round((charge / BATTERY_CAPACITY_KWH) * 100);
  const isCharging = excess > 0 && charge < BATTERY_CAPACITY_KWH;
  const isDischarging = deficit > 0 && charge > 0 && tp.sunlight < 0.3;
  const nightPowered = charge > 0 && tp.sunlight === 0;

  useEffect(() => {
    const chargeKwh = (excess / 1000) * 3;
    const dischargeKwh = (deficit / 1000) * 3;
    if (isCharging) setCharge(p => Math.min(p + chargeKwh * 0.3, BATTERY_CAPACITY_KWH));
    if (isDischarging) setCharge(p => Math.max(p - dischargeKwh * 0.2, 0));
    setHistory(p => [...p.slice(-5), { time: tp.label, solar: solarNow, charge: Math.round(charge * 10) / 10 }]);
  }, [timeIdx]);

  return (
    <PhaseWrap title="Battery Storage" icon={L4_ICONS.battery} onComplete={battPct > 50 || nightPowered ? onComplete : null}>
      <p className="l4-phase-desc">Store solar energy during the day, use it at night!</p>
      <div className="l4-battery-visual">
        <div className="l4-batt-meter"><div className="l4-batt-fill" style={{ height: `${battPct}%` }} /><span>{battPct}%</span></div>
        <div className="l4-batt-info">
          <div>{charge.toFixed(1)} / {BATTERY_CAPACITY_KWH} units</div>
          <div className={`l4-batt-status ${isCharging ? 'charging' : isDischarging ? 'discharging' : ''}`}>
            {isCharging ? '⚡ Charging' : isDischarging ? '🔌 Discharging' : nightPowered ? '🌙 Night Power!' : '— Idle'}
          </div>
        </div>
      </div>
      <div className="l4-time-slider-wrap">
        <div className="l4-time-current">{tp.icon} {tp.label}</div>
        <input type="range" className="l4-time-slider" min={0} max={TIME_PERIODS.length - 1} value={timeIdx}
               onChange={e => setTimeIdx(Number(e.target.value))} />
        <div className="l4-time-periods">{TIME_PERIODS.map((t, i) => (
          <span key={t.id} className={`l4-tp ${i === timeIdx ? 'active' : ''}`} onClick={() => setTimeIdx(i)}>{t.icon}</span>
        ))}</div>
      </div>
      <div className="l4-batt-stats">
        <div><span>{L4_ICONS.sun}</span> Solar: {solarNow}W</div>
        <div><span>{L4_ICONS.house}</span> House: {houseW}W</div>
        <div><span>{excess > 0 ? '📥' : '📤'}</span> {excess > 0 ? `Excess: ${excess}W` : `Need: ${deficit}W`}</div>
      </div>
      <div className="l4-phase-learning">{L4_ICONS.bulb} Modern batteries store extra solar power for night use. In India, a 10-unit battery costs Rs.4-6 Lakh but saves Rs.15,000+ every year. Charge between 10AM-3PM (when the sun is strongest), use at night. The government offers help paying for solar + battery systems!</div>
    </PhaseWrap>
  );
}

// ═══ PHASE 4: PEAK HOUR MANAGEMENT ═══
export function PeakHourPhase({ onComplete }) {
  const [scheduled, setScheduled] = useState({});
  const shiftable = SCHEDULABLE_APPLIANCES.filter(a => a.canShift);
  const fixed = SCHEDULABLE_APPLIANCES.filter(a => !a.canShift);
  const shiftedIds = Object.entries(scheduled).filter(([, v]) => v === 'solar').map(([k]) => k);
  const savings = calcPeakSavings(shiftedIds);
  const allDecided = shiftable.every(a => scheduled[a.id]);

  const toggle = id => {playPhaseSound('click');setScheduled(p => ({ ...p, [id]: p[id] === 'solar' ? 'peak' : 'solar' }));};

  return (
    <PhaseWrap title="Peak Hour Management" icon={L4_ICONS.chart} onComplete={allDecided ? onComplete : null}>
      <p className="l4-phase-desc">Peak hours (6-10 PM) cost ₹{TARIFF_PEAK}/unit vs ₹{TARIFF_NORMAL}/unit. Shift heavy loads to solar hours!</p>
      <div className="l4-peak-tariff">
        <div className="l4-tariff-normal"><span>☀️ Solar Hours</span><span>₹{TARIFF_NORMAL}/unit</span></div>
        <div className="l4-tariff-peak"><span>🌙 Peak Hours</span><span>₹{TARIFF_PEAK}/unit</span></div>
      </div>
      <div className="l4-peak-label">Shiftable Appliances — tap to schedule:</div>
      <div className="l4-peak-grid">
        {shiftable.map(a => (
          <div key={a.id} className={`l4-peak-app ${scheduled[a.id] || ''}`} onClick={() => toggle(a.id)}>
            <span className="l4-peak-app-icon">{a.icon}</span>
            <span className="l4-peak-app-name">{a.name}</span>
            <span className="l4-peak-app-watts">{a.watts}W</span>
            <span className="l4-peak-app-time">{scheduled[a.id] === 'solar' ? '☀️ Solar' : scheduled[a.id] === 'peak' ? '🌙 Peak' : 'Tap to schedule'}</span>
          </div>
        ))}
      </div>
      <div className="l4-peak-label">Fixed (cannot shift):</div>
      <div className="l4-peak-fixed">{fixed.map(a => (
        <span key={a.id} className="l4-peak-fixed-item">{a.icon} {a.name}</span>
      ))}</div>
      {savings > 0 && <div className="l4-peak-savings">{L4_ICONS.money} Monthly savings: ₹{savings} by shifting to solar hours!</div>}
      <div className="l4-phase-learning">{L4_ICONS.bulb} In India, electricity gets more expensive the more you use. Evening hours (6-10 PM) cost the most! By running the washing machine, geyser, and car charger during daytime (10AM-3PM), you use FREE solar power and save Rs.800-1,500 every month!</div>
    </PhaseWrap>
  );
}

// ═══ PHASE 5: SMART COOLING ═══
export function SmartCoolingPhase({ onComplete }) {
  const [coolRoof, setCoolRoof] = useState(false);
  const [insulation, setInsulation] = useState(false);
  const [mode, setMode] = useState('ac'); // ac | fan | hybrid
  const outdoor = 38;
  const reduction = (coolRoof ? COOLING_DATA.coolRoofReduction : 0) + (insulation ? COOLING_DATA.insulationReduction : 0);
  const indoor = outdoor - reduction - (mode === 'ac' ? 14 : mode === 'fan' ? 4 : 10);
  const watts = mode === 'ac' ? COOLING_DATA.acWatts : mode === 'fan' ? COOLING_DATA.fanWatts : 800;
  const isComfort = indoor <= COOLING_DATA.comfortTemp;

  return (
    <PhaseWrap title="Smart Cooling" icon="❄️" onComplete={isComfort && (coolRoof || insulation) ? onComplete : null}>
      <p className="l4-phase-desc">Achieve {COOLING_DATA.comfortTemp}°C comfort using minimum energy (Comfort temperature rule).</p>
      <div className="l4-cool-temp">
        <div className="l4-cool-outdoor">🌡️ Outside: {outdoor}°C</div>
        <div className={`l4-cool-indoor ${isComfort ? 'comfort' : 'hot'}`}>🏠 Inside: {indoor}°C {isComfort ? '✅' : '⚠️'}</div>
        <div className="l4-cool-watts">⚡ Using: {watts}W</div>
      </div>
      <div className="l4-cool-options">
        <div className="l4-cool-label">Building Improvements:</div>
        <label className={`l4-cool-toggle ${coolRoof ? 'on' : ''}`} onClick={() => setCoolRoof(!coolRoof)}>
          <span>🏠 Cool Roof Coating</span><span>-{COOLING_DATA.coolRoofReduction}°C</span>
        </label>
        <label className={`l4-cool-toggle ${insulation ? 'on' : ''}`} onClick={() => setInsulation(!insulation)}>
          <span>🧱 Wall Insulation</span><span>-{COOLING_DATA.insulationReduction}°C</span>
        </label>
      </div>
      <div className="l4-cool-options">
        <div className="l4-cool-label">Cooling Mode:</div>
        {[['fan', '🌀 Fan Only', `${COOLING_DATA.fanWatts}W`], ['hybrid', '❄️ Fan + AC Eco', '800W'], ['ac', '❄️ Full AC', `${COOLING_DATA.acWatts}W`]].map(([m, label, w]) => (
          <div key={m} className={`l4-cool-mode ${mode === m ? 'selected' : ''}`} onClick={() => setMode(m)}>
            <span>{label}</span><span>{w}</span>
          </div>
        ))}
      </div>
      <div className="l4-phase-learning">{L4_ICONS.bulb} The comfort rule says 24°C is the perfect temperature. A cool roof coating (white paint on roof) reflects sunlight and reduces indoor heat by 3-5°C. With good insulation + ceiling fan ({COOLING_DATA.fanWatts}W), you can avoid using AC ({COOLING_DATA.acWatts}W) — saving 80% on cooling!</div>
    </PhaseWrap>
  );
}

// ═══ PHASE 6: SMART AUTOMATION ═══
export function AutomationPhase({ onComplete }) {
  const [sensors, setSensors] = useState(SENSOR_ROOMS.map(r => ({ ...r })));
  const [demoRoom, setDemoRoom] = useState(null);
  const installed = sensors.filter(s => s.installed).length;
  const totalSavings = sensors.filter(s => s.installed).reduce((s, r) => s + r.savings, 0);

  const installSensor = id => {playPhaseSound('click');setSensors(p => p.map(s => s.id === id ? { ...s, installed: true } : s));};

  return (
    <PhaseWrap title="Smart Automation" icon="🤖" onComplete={installed >= 3 ? onComplete : null}>
      <p className="l4-phase-desc">Install smart sensors — empty room = auto lights OFF, saving energy!</p>
      <div className="l4-auto-grid">
        {sensors.map(room => (
          <div key={room.id} className={`l4-auto-room ${room.installed ? 'installed' : ''}`}
               onClick={() => { if (!room.installed) { installSensor(room.id); setDemoRoom(room.id); } }}>
            <div className="l4-auto-room-icon">{room.icon}</div>
            <div className="l4-auto-room-name">{room.name}</div>
            <div className="l4-auto-room-status">
              {room.installed ? `✅ ${room.savings}% saved` : '📡 Tap to install'}
            </div>
          </div>
        ))}
      </div>
      {demoRoom && (
        <div className="l4-auto-demo">
          <div className="l4-auto-demo-title">🎬 Demo: {sensors.find(s => s.id === demoRoom)?.name}</div>
          <div className="l4-auto-demo-steps">
            <span>👤 Person leaves room</span> → <span>📡 Sensor detects empty</span> → <span>💡 Lights auto OFF</span> → <span>💰 Energy saved!</span>
          </div>
        </div>
      )}
      <div className="l4-auto-savings">
        <span>{L4_ICONS.check}</span> {installed}/4 sensors installed — {totalSavings}% energy saved
      </div>
      <div className="l4-phase-learning">{L4_ICONS.bulb} Motion sensors (Rs.300-800 each) detect if someone is in the room and turn lights OFF automatically. This saves 15-25% energy. Installing in 4 rooms saves about Rs.500 every month on wasted light and fan electricity!</div>
    </PhaseWrap>
  );
}

// ═══ PHASE 7: EV CHARGING ═══
export function EVChargingPhase({ onComplete }) {
  const [schedule, setSchedule] = useState(null);
  return (
    <PhaseWrap title="EV + Solar Charging" icon="🚗" onComplete={schedule === 'solar' ? onComplete : null}>
      <p className="l4-phase-desc">When should you charge your electric vehicle?</p>
      <div className="l4-ev-compare">
        <div className={`l4-ev-option ${schedule === 'solar' ? 'selected' : ''}`} onClick={() => setSchedule('solar')}>
          <div className="l4-ev-opt-icon">☀️</div>
          <div className="l4-ev-opt-title">Daytime Solar Charging</div>
          <div className="l4-ev-opt-stats">
            <div>⚡ {EV_DATA.solarChargeKwh} units from solar</div>
            <div>💰 Cost: ₹{EV_DATA.solarCost}</div>
            <div>🌿 Zero CO₂</div>
          </div>
        </div>
        <div className="l4-ev-vs">VS</div>
        <div className={`l4-ev-option bad ${schedule === 'grid' ? 'selected' : ''}`} onClick={() => setSchedule('grid')}>
          <div className="l4-ev-opt-icon">🌙</div>
          <div className="l4-ev-opt-title">Nighttime Outside Power Charging</div>
          <div className="l4-ev-opt-stats">
            <div>⚡ {EV_DATA.gridChargeKwh} units from outside power</div>
            <div>💸 Cost: ₹{EV_DATA.gridCost}</div>
            <div>💨 High CO₂</div>
          </div>
        </div>
      </div>
      {schedule && (
        <div className={`l4-ev-result ${schedule === 'solar' ? 'good' : 'bad'}`}>
          {schedule === 'solar'
            ? `✅ Smart choice! Save ₹${EV_DATA.gridCost}/charge and zero emissions!`
            : `⚠️ Outside power charging costs ₹${EV_DATA.gridCost} and creates pollution. Try solar!`}
        </div>
      )}
      <div className="l4-phase-learning">{L4_ICONS.bulb} India supports electric vehicles! A Tata Nexon EV needs about 30 units for 300km range. Solar charging at home costs Rs.0 per km compared to Rs.1.50 per km from outside power. That saves Rs.45,000 per year! Charge between 10AM-3PM when your solar panels are making the most power.</div>
    </PhaseWrap>
  );
}

// ═══ PHASE 8: WEATHER RESPONSE ═══
export function WeatherPhase({ solarW, batteryCharge, onComplete }) {
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [responded, setResponded] = useState([]);
  const scenario = WEATHER_SCENARIOS[scenarioIdx];
  const adjustedSolar = Math.round(solarW * scenario.solarFactor);
  const allResponded = responded.length >= WEATHER_SCENARIOS.length;

  const respond = () => {
    if (!responded.includes(scenarioIdx)) setResponded(p => [...p, scenarioIdx]);
    if (scenarioIdx < WEATHER_SCENARIOS.length - 1) setScenarioIdx(p => p + 1);
  };

  return (
    <PhaseWrap title="Weather Response" icon="🌦️" onComplete={allResponded ? onComplete : null}>
      <p className="l4-phase-desc">Adapt your smart home to changing weather conditions!</p>
      <div className="l4-weather-tabs">
        {WEATHER_SCENARIOS.map((w, i) => (
          <button key={w.id} className={`l4-weather-tab ${i === scenarioIdx ? 'active' : ''} ${responded.includes(i) ? 'done' : ''}`}
                  onClick={() => setScenarioIdx(i)}>{w.icon}</button>
        ))}
      </div>
      <div className="l4-weather-card">
        <div className="l4-weather-title">{scenario.icon} {scenario.label}</div>
        <div className="l4-weather-stats">
          <div>☀️ Solar: {adjustedSolar}W ({Math.round(scenario.solarFactor * 100)}%)</div>
          <div>🌡️ Temperature: {scenario.tempC}°C</div>
          <div>🔋 Battery: {scenario.batteryAction}</div>
        </div>
        <div className="l4-weather-tip">{L4_ICONS.bulb} {scenario.tip}</div>
        {!responded.includes(scenarioIdx) && (
          <button className="l4-modal-btn" onClick={respond}>Adapt & Continue →</button>
        )}
        {responded.includes(scenarioIdx) && <div className="l4-weather-done">✅ Adapted!</div>}
      </div>
      <div className="l4-phase-learning">{L4_ICONS.bulb} India gets 300+ sunny days per year, but monsoon season (June-September) reduces solar by 30-50%. Smart homes automatically adjust: sunny day → charge battery + send extra power out, cloudy day → use less power, rainy/night → use battery. Weather apps help you plan ahead!</div>
    </PhaseWrap>
  );
}

// ═══ PHASE 9: IMPACT DASHBOARD ═══
export function DashboardPhase({ metrics, onComplete }) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => { setTimeout(() => setAnimated(true), 300); }, []);

  return (
    <PhaseWrap title="Impact Dashboard" icon="📈" onComplete={onComplete}>
      <p className="l4-phase-desc">Your real impact — see what your smart solar home achieved!</p>
      <div className="l4-dash-grid">
        {DASHBOARD_METRICS.map((m, i) => (
          <div key={m.id} className={`l4-dash-card ${animated ? 'show' : ''}`} style={{ '--delay': `${i * 0.15}s`, '--card-color': m.color }}>
            <div className="l4-dash-icon">{m.icon}</div>
            <div className="l4-dash-value"><AnimCount value={Number(metrics[m.id]) || 0}/></div>
            <div className="l4-dash-unit">{m.unit}</div>
            <div className="l4-dash-label">{m.label}</div>
          </div>
        ))}
      </div>
      <div className="l4-dash-summary">
        {L4_ICONS.sparkle} You're saving the planet one kilowatt at a time!
      </div>
      <div className="l4-phase-learning">{L4_ICONS.bulb} India aims for 100 GW of solar power by 2026. A single 5kW home system prevents 7,500 kg of pollution every year (equal to planting 340 trees!). If 10 million homes go solar, India saves 75 billion kg of pollution per year — that is like removing 16 million cars from the road!</div>
    </PhaseWrap>
  );
}

// ═══ PHASE 10: FINALE / TRANSFORMATION ═══
export function FinalePhase({ onComplete }) {
  const [step, setStep] = useState(0);
  const [showAfter, setShowAfter] = useState(false);
  useEffect(() => { const t = setTimeout(() => setShowAfter(true), 2000); return () => clearTimeout(t); }, []);

  return (
    <PhaseWrap title="Future Home" icon="🏆" onComplete={showAfter ? onComplete : null} btnLabel="Take Final Quiz →">
      <p className="l4-phase-desc">Witness the transformation of your home and environment!</p>
      <div className="l4-finale-split">
        <div className="l4-finale-col before">
          <div className="l4-finale-label">❌ Before</div>
          {TRANSFORMATION_BEFORE.map((t, i) => (
            <div key={i} className="l4-finale-item" style={{ color: t.color }}>{t.icon} {t.label}</div>
          ))}
        </div>
        {showAfter && (
          <div className="l4-finale-col after">
            <div className="l4-finale-label">✅ After Smart Solar</div>
            {TRANSFORMATION_AFTER.map((t, i) => (
              <div key={i} className="l4-finale-item" style={{ color: t.color, animationDelay: `${i * 0.2}s` }}>{t.icon} {t.label}</div>
            ))}
          </div>
        )}
      </div>
      {showAfter && (
        <div className="l4-finale-message">
          {L4_ICONS.sparkle} You transformed a polluted, power-cut-prone home into a smart, sustainable, solar-powered future home!
        </div>
      )}
    </PhaseWrap>
  );
}
