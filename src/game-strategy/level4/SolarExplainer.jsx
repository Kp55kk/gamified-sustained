// ═══════════════════════════════════════════════════════════
//  HOW SOLAR ENERGY WORKS — Premium SVG Animated Visualization
// ═══════════════════════════════════════════════════════════
import React, { useState, useEffect, useRef, useCallback } from 'react';

const STEPS = [
  { id:'photons', title:'Sunlight (Photons)', color:'#fbbf24', glow:'rgba(251,191,36,0.4)',
    desc:'The sun emits photons — tiny packets of light energy that travel 150 million km to reach Earth in just 8 minutes.',
    fact:'173,000 terawatts of solar energy continuously hits Earth — 10,000× more than global energy demand!',
    quiz:null, sound:'shimmer' },
  { id:'pv_cell', title:'Photovoltaic Cell', color:'#60a5fa', glow:'rgba(96,165,250,0.4)',
    desc:'Photons hit silicon cells in the solar panel. Silicon atoms absorb photon energy and release electrons — creating an electric field.',
    fact:'Each solar cell has two layers: N-type (extra electrons) and P-type (missing electrons). The junction creates a one-way electron flow!',
    quiz:null, sound:'zap' },
  { id:'dc_power', title:'DC Electricity', color:'#f59e0b', glow:'rgba(245,158,11,0.4)',
    desc:'The freed electrons flow as Direct Current (DC) electricity through metal conductors in the panel.',
    fact:'A single 330W panel generates enough electricity to power 5 LED bulbs for 6 hours!',
    quiz:{ q:'What type of current do solar panels produce?', opts:['AC','DC','Both'], ans:1 }, sound:'electric' },
  { id:'inverter', title:'Inverter (DC → AC)', color:'#a78bfa', glow:'rgba(167,139,250,0.4)',
    desc:'The inverter converts DC to AC (Alternating Current) — the type of electricity your home appliances use.',
    fact:'Modern inverters are 97%+ efficient and can also track maximum power point to optimize output!',
    quiz:null, sound:'transform' },
  { id:'home', title:'Home Powered!', color:'#22c55e', glow:'rgba(34,197,94,0.4)',
    desc:'AC electricity flows to your switchboard and powers all home appliances — lights, fan, AC, TV, refrigerator!',
    fact:'A 3kW rooftop system can power an average Indian home and save ₹2,000+/month on electricity bills.',
    quiz:null, sound:'success' },
  { id:'excess', title:'Battery / Net Metering', color:'#8b5cf6', glow:'rgba(139,92,246,0.4)',
    desc:'Excess solar energy charges your battery for night use, or feeds back to the grid via net metering = bill credits!',
    fact:'With net metering, your electricity meter runs BACKWARD when you export solar power — you earn credits!',
    quiz:{ q:'What happens to excess solar energy?', opts:['Wasted','Stored in battery / exported to grid','Converted to heat'], ans:1 }, sound:'charge' },
  { id:'zero_co2', title:'Zero CO₂ Emissions!', color:'#16a34a', glow:'rgba(22,163,74,0.4)',
    desc:'Unlike coal/gas power plants, solar generates ZERO CO₂ during operation. Clean, silent, renewable energy!',
    fact:'A 5kW solar system prevents ~7,500 kg CO₂/year — equivalent to planting 340 trees!',
    quiz:null, sound:'nature' },
];

// SVG Diagrams per step
function StepSVG({ stepId, color }) {
  const common = { stroke:color, strokeWidth:2, fill:'none' };
  if (stepId === 'photons') return (
    <svg viewBox="0 0 400 160" className="se-svg">
      <circle cx="60" cy="80" r="30" fill="#fbbf24" opacity="0.9"><animate attributeName="r" values="28;32;28" dur="2s" repeatCount="indefinite"/></circle>
      <circle cx="60" cy="80" r="40" fill="none" stroke="#fbbf24" strokeWidth="1" opacity="0.3"><animate attributeName="r" values="38;50;38" dur="3s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.3;0.1;0.3" dur="3s" repeatCount="indefinite"/></circle>
      {[0,1,2,3,4].map(i=><line key={i} x1="95" y1={50+i*15} x2="300" y2={50+i*15} stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="8,6" opacity="0.6"><animate attributeName="x1" values="95;105;95" dur={`${1.5+i*0.2}s`} repeatCount="indefinite"/></line>)}
      {[0,1,2,3,4,5,6].map(i=><circle key={i} cx={130+i*25} cy={55+(i%3)*18} r="3" fill="#fbbf24"><animate attributeName="cx" values={`${130+i*25};${160+i*25};${130+i*25}`} dur={`${2+i*0.3}s`} repeatCount="indefinite"/><animate attributeName="opacity" values="1;0.3;1" dur={`${2+i*0.3}s`} repeatCount="indefinite"/></circle>)}
      <rect x="310" y="55" width="70" height="50" rx="4" fill="rgba(96,165,250,0.15)" stroke="#60a5fa" strokeWidth="1.5"/>
      <text x="345" y="84" fill="#60a5fa" fontSize="10" textAnchor="middle">Panel</text>
    </svg>
  );
  if (stepId === 'pv_cell') return (
    <svg viewBox="0 0 400 160" className="se-svg">
      <rect x="100" y="20" width="200" height="120" rx="6" fill="rgba(96,165,250,0.05)" stroke="#60a5fa" strokeWidth="1"/>
      <text x="200" y="16" fill="#888" fontSize="9" textAnchor="middle">SILICON SOLAR CELL CROSS-SECTION</text>
      <rect x="110" y="35" width="180" height="45" rx="2" fill="rgba(96,165,250,0.12)" stroke="#60a5fa" strokeWidth="1"/>
      <text x="200" y="62" fill="#60a5fa" fontSize="11" textAnchor="middle" fontWeight="bold">N-Type (Extra Electrons ⊖)</text>
      <rect x="110" y="80" width="180" height="45" rx="2" fill="rgba(239,68,68,0.12)" stroke="#ef4444" strokeWidth="1"/>
      <text x="200" y="107" fill="#ef4444" fontSize="11" textAnchor="middle" fontWeight="bold">P-Type (Holes ⊕)</text>
      <line x1="110" y1="80" x2="290" y2="80" stroke="#f5a623" strokeWidth="2" strokeDasharray="4,3"/>
      <text x="320" y="83" fill="#f5a623" fontSize="9">Junction</text>
      {[0,1,2,3].map(i=><circle key={i} cx={140+i*40} cy={60} r="4" fill="#60a5fa"><animate attributeName="cy" values="60;100;130" dur="2s" begin={`${i*0.4}s`} repeatCount="indefinite"/><animate attributeName="opacity" values="1;0.8;0" dur="2s" begin={`${i*0.4}s`} repeatCount="indefinite"/></circle>)}
      <text x="200" y="148" fill="#22c55e" fontSize="10" textAnchor="middle">⚡ Electrons flow → Electricity!</text>
    </svg>
  );
  if (stepId === 'dc_power') return (
    <svg viewBox="0 0 400 160" className="se-svg">
      <rect x="20" y="50" width="80" height="60" rx="4" fill="rgba(96,165,250,0.1)" stroke="#60a5fa" strokeWidth="1.5"/>
      <text x="60" y="84" fill="#60a5fa" fontSize="10" textAnchor="middle">Panel</text>
      <line x1="100" y1="80" x2="380" y2="80" stroke="#f59e0b" strokeWidth="3" strokeDasharray="12,6"><animate attributeName="strokeDashoffset" values="0;-36" dur="1s" repeatCount="indefinite"/></line>
      {[0,1,2,3,4].map(i=><circle key={i} cx={120+i*55} cy="80" r="5" fill="#f59e0b"><animate attributeName="cx" values={`${120+i*55};${175+i*55};${120+i*55}`} dur="2s" begin={`${i*0.3}s`} repeatCount="indefinite"/></circle>)}
      <text x="200" y="40" fill="#f59e0b" fontSize="14" textAnchor="middle" fontWeight="bold">DC ═══════►</text>
      <text x="200" y="130" fill="#aaa" fontSize="10" textAnchor="middle">Direct Current: electrons flow in ONE direction</text>
      <path d="M 140 140 L 380 140" stroke="#f59e0b" strokeWidth="1.5" fill="none"/>
      <text x="130" y="144" fill="#f59e0b" fontSize="8">+</text><text x="385" y="144" fill="#f59e0b" fontSize="8">−</text>
    </svg>
  );
  if (stepId === 'inverter') return (
    <svg viewBox="0 0 400 160" className="se-svg">
      <text x="60" y="30" fill="#f59e0b" fontSize="11" textAnchor="middle" fontWeight="bold">DC Input</text>
      <path d="M 20 80 L 40 80 L 40 50 L 80 50 L 80 80 L 100 80 L 100 50 L 140 50 L 140 80" stroke="#f59e0b" strokeWidth="2" fill="none"/>
      <rect x="160" y="40" width="80" height="80" rx="8" fill="rgba(167,139,250,0.1)" stroke="#a78bfa" strokeWidth="2"/>
      <text x="200" y="75" fill="#a78bfa" fontSize="12" textAnchor="middle" fontWeight="bold">INVERTER</text>
      <text x="200" y="92" fill="#888" fontSize="8" textAnchor="middle">DC → AC</text>
      <text x="340" y="30" fill="#22c55e" fontSize="11" textAnchor="middle" fontWeight="bold">AC Output</text>
      <path d="M 260 80 Q 280 50 300 80 Q 320 110 340 80 Q 360 50 380 80" stroke="#22c55e" strokeWidth="2" fill="none"><animate attributeName="d" values="M 260 80 Q 280 50 300 80 Q 320 110 340 80 Q 360 50 380 80;M 260 80 Q 280 110 300 80 Q 320 50 340 80 Q 360 110 380 80;M 260 80 Q 280 50 300 80 Q 320 110 340 80 Q 360 50 380 80" dur="1s" repeatCount="indefinite"/></path>
      <text x="200" y="140" fill="#a78bfa" fontSize="9" textAnchor="middle">97%+ efficiency • MPPT tracking</text>
    </svg>
  );
  if (stepId === 'home') return (
    <svg viewBox="0 0 400 160" className="se-svg">
      <polygon points="200,15 120,60 280,60" fill="rgba(34,197,94,0.1)" stroke="#22c55e" strokeWidth="1.5"/>
      <rect x="140" y="60" width="120" height="80" fill="rgba(34,197,94,0.05)" stroke="#22c55e" strokeWidth="1.5"/>
      <rect x="175" y="100" width="30" height="40" fill="rgba(139,92,246,0.15)" stroke="#a78bfa"/>
      {[{x:150,y:70,e:'💡'},{x:230,y:70,e:'❄️'},{x:150,y:95,e:'📺'},{x:230,y:95,e:'🔌'}].map((a,i)=>
        <text key={i} x={a.x} y={a.y} fontSize="14" textAnchor="middle"><animate attributeName="opacity" values="0.4;1;0.4" dur={`${1.5+i*0.3}s`} repeatCount="indefinite"/>{a.e}</text>
      )}
      <line x1="60" y1="80" x2="140" y2="80" stroke="#22c55e" strokeWidth="2" strokeDasharray="6,4"><animate attributeName="strokeDashoffset" values="0;-20" dur="0.8s" repeatCount="indefinite"/></line>
      <text x="40" y="78" fill="#22c55e" fontSize="14">⚡</text>
      <text x="200" y="155" fill="#22c55e" fontSize="10" textAnchor="middle">All appliances powered by solar!</text>
    </svg>
  );
  if (stepId === 'excess') return (
    <svg viewBox="0 0 400 160" className="se-svg">
      <text x="60" y="78" fill="#f5a623" fontSize="12" fontWeight="bold">Excess ⚡</text>
      <line x1="120" y1="72" x2="180" y2="72" stroke="#f5a623" strokeWidth="2" markerEnd="url(#arr)"/>
      <line x1="200" y1="72" x2="200" y2="40" stroke="#8b5cf6" strokeWidth="2"/>
      <line x1="200" y1="72" x2="200" y2="110" stroke="#22c55e" strokeWidth="2"/>
      <rect x="160" y="10" width="80" height="30" rx="6" fill="rgba(139,92,246,0.1)" stroke="#8b5cf6" strokeWidth="1.5"/>
      <text x="200" y="29" fill="#8b5cf6" fontSize="10" textAnchor="middle" fontWeight="bold">🔋 Battery</text>
      <rect x="160" y="110" width="80" height="30" rx="6" fill="rgba(34,197,94,0.1)" stroke="#22c55e" strokeWidth="1.5"/>
      <text x="200" y="129" fill="#22c55e" fontSize="10" textAnchor="middle" fontWeight="bold">⚡ Grid Export</text>
      <text x="300" y="29" fill="#8b5cf6" fontSize="9">Store for night</text>
      <text x="300" y="129" fill="#22c55e" fontSize="9">Net metering credits</text>
      <text x="330" y="80" fill="#888" fontSize="9">Meter runs ← BACKWARD!</text>
      <defs><marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#f5a623"/></marker></defs>
    </svg>
  );
  if (stepId === 'zero_co2') return (
    <svg viewBox="0 0 400 160" className="se-svg">
      <rect x="10" y="20" width="170" height="120" rx="8" fill="rgba(239,68,68,0.05)" stroke="#ef4444" strokeWidth="1" strokeDasharray="4,3"/>
      <text x="95" y="16" fill="#ef4444" fontSize="9" textAnchor="middle">COAL POWER</text>
      <rect x="30" y="50" width="50" height="40" fill="rgba(239,68,68,0.1)" stroke="#ef4444"/>
      <text x="55" y="74" fill="#ef4444" fontSize="8" textAnchor="middle">🏭</text>
      {[0,1,2].map(i=><circle key={i} cx={100+i*20} cy={50-i*10} r={8+i*3} fill="rgba(150,150,150,0.2)" stroke="#888" strokeWidth="0.5"><animate attributeName="cy" values={`${50-i*10};${30-i*10};${50-i*10}`} dur={`${2+i*0.5}s`} repeatCount="indefinite"/></circle>)}
      <text x="95" y="120" fill="#ef4444" fontSize="9" textAnchor="middle">820g CO₂/kWh</text>
      <rect x="220" y="20" width="170" height="120" rx="8" fill="rgba(34,197,94,0.05)" stroke="#22c55e" strokeWidth="1"/>
      <text x="305" y="16" fill="#22c55e" fontSize="9" textAnchor="middle">SOLAR POWER</text>
      <rect x="260" y="50" width="50" height="6" fill="#60a5fa" stroke="#60a5fa" rx="2"/>
      <text x="285" y="74" fill="#22c55e" fontSize="14" textAnchor="middle">☀️</text>
      <text x="305" y="95" fill="#22c55e" fontSize="16" textAnchor="middle" fontWeight="bold">0g CO₂</text>
      <text x="305" y="120" fill="#22c55e" fontSize="9" textAnchor="middle">7,500 kg saved/year</text>
      <text x="205" y="85" fill="#f5a623" fontSize="16" fontWeight="bold">VS</text>
    </svg>
  );
  return null;
}

function playSound(type) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator(); const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination); gain.gain.value = 0.08;
    const S = {
      shimmer:()=>{osc.type='sine';osc.frequency.setValueAtTime(800,ctx.currentTime);osc.frequency.exponentialRampToValueAtTime(1600,ctx.currentTime+0.3);gain.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.5)},
      zap:()=>{osc.type='sawtooth';osc.frequency.setValueAtTime(200,ctx.currentTime);osc.frequency.exponentialRampToValueAtTime(800,ctx.currentTime+0.15);gain.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.3)},
      electric:()=>{osc.type='square';osc.frequency.setValueAtTime(440,ctx.currentTime);osc.frequency.exponentialRampToValueAtTime(880,ctx.currentTime+0.2);gain.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.4)},
      transform:()=>{osc.type='triangle';osc.frequency.setValueAtTime(300,ctx.currentTime);osc.frequency.linearRampToValueAtTime(600,ctx.currentTime+0.1);gain.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.4)},
      success:()=>{osc.type='sine';osc.frequency.setValueAtTime(523,ctx.currentTime);osc.frequency.setValueAtTime(784,ctx.currentTime+0.15);gain.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.5)},
      charge:()=>{osc.type='sine';osc.frequency.setValueAtTime(200,ctx.currentTime);osc.frequency.exponentialRampToValueAtTime(600,ctx.currentTime+0.4);gain.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.5)},
      nature:()=>{osc.type='sine';osc.frequency.setValueAtTime(400,ctx.currentTime);osc.frequency.setValueAtTime(600,ctx.currentTime+0.3);gain.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.6)},
    };
    (S[type]||S.shimmer)(); osc.start(); osc.stop(ctx.currentTime+1);
  } catch(e){}
}

export default function SolarExplainer({ onComplete }) {
  const [step, setStep] = useState(-1);
  const [autoPlay, setAutoPlay] = useState(false);
  const [quizAnswer, setQuizAnswer] = useState(null);
  const [particles, setParticles] = useState([]);
  const pid = useRef(0);
  const autoRef = useRef(null);
  const current = step >= 0 ? STEPS[step] : null;
  const allSeen = step >= STEPS.length - 1;
  const progress = Math.max(0, ((step + 1) / STEPS.length) * 100);

  const spawnP = useCallback((c) => {
    setParticles(p => [...p, ...Array.from({length:6},()=>({id:++pid.current,x:30+Math.random()*40,y:20+Math.random()*60,size:3+Math.random()*4,color:c,dx:(Math.random()-0.5)*3,dy:-1-Math.random()*2,life:1}))]);
  }, []);

  useEffect(() => {
    if (!particles.length) return;
    const t = setInterval(() => setParticles(p => p.map(pp=>({...pp,x:pp.x+pp.dx,y:pp.y+pp.dy,life:pp.life-0.04})).filter(pp=>pp.life>0)), 50);
    return () => clearInterval(t);
  }, [particles.length]);

  const goTo = useCallback((idx) => {
    setStep(idx); setQuizAnswer(null);
    if (idx >= 0 && idx < STEPS.length) { playSound(STEPS[idx].sound); spawnP(STEPS[idx].color); }
  }, [spawnP]);

  useEffect(() => {
    if (!autoPlay) return;
    autoRef.current = setInterval(() => {
      setStep(p => { const n=p+1; if(n>=STEPS.length){setAutoPlay(false);return p;} playSound(STEPS[n].sound);spawnP(STEPS[n].color);setQuizAnswer(null);return n; });
    }, 4000);
    return () => clearInterval(autoRef.current);
  }, [autoPlay, spawnP]);

  return (
    <div className="solar-explainer">
      <div className="se-particles">
        {particles.map(p => <div key={p.id} className="se-particle" style={{left:`${p.x}%`,top:`${p.y}%`,width:p.size,height:p.size,background:p.color,opacity:p.life,boxShadow:`0 0 ${p.size*2}px ${p.color}`}}/>)}
      </div>
      <div className="se-header"><span className="se-header-icon">☀️</span><span className="se-header-title">How Solar Energy Works</span></div>
      <div className="se-progress-bar"><div className="se-progress-fill" style={{width:`${progress}%`,background:current?.color||'#f5a623'}}/></div>

      {step === -1 && (
        <div className="se-intro">
          <div className="se-intro-sun">☀️</div>
          <div className="se-intro-title">The Journey of Sunlight to Electricity</div>
          <div className="se-intro-subtitle">7 animated steps — zero pollution!</div>
          <div className="se-intro-btns">
            <button className="se-btn primary" onClick={() => goTo(0)}>Start Exploration →</button>
            <button className="se-btn secondary" onClick={() => {goTo(0);setAutoPlay(true)}}>▶ Auto Play</button>
          </div>
        </div>
      )}

      {current && (
        <div className="se-step" style={{'--step-color':current.color,'--step-glow':current.glow}}>
          <div className="se-svg-container">
            <StepSVG stepId={current.id} color={current.color}/>
          </div>
          <div className="se-step-title">{current.title}</div>
          <div className="se-step-desc">{current.desc}</div>
          <div className="se-fact-card"><span className="se-fact-icon">💡</span><span className="se-fact-text">{current.fact}</span></div>

          {current.quiz && !quizAnswer && (
            <div className="se-quiz-card">
              <div className="se-quiz-q">🧠 Quick Check: {current.quiz.q}</div>
              <div className="se-quiz-opts">
                {current.quiz.opts.map((o,i) => (
                  <button key={i} className="se-quiz-opt" onClick={() => {
                    setQuizAnswer(i);
                    playSound(i === current.quiz.ans ? 'success' : 'zap');
                  }}>{o}</button>
                ))}
              </div>
            </div>
          )}
          {quizAnswer !== null && current.quiz && (
            <div className={`se-quiz-result ${quizAnswer===current.quiz.ans?'correct':'wrong'}`}>
              {quizAnswer===current.quiz.ans ? '✅ Correct!' : `❌ The answer is: ${current.quiz.opts[current.quiz.ans]}`}
            </div>
          )}

          <div className="se-dots">
            {STEPS.map((s,i) => <div key={s.id} className={`se-dot ${i===step?'active':i<step?'done':''}`}
              style={{background:i<=step?s.color:'rgba(255,255,255,0.1)'}} onClick={()=>goTo(i)} title={s.title}/>)}
          </div>
          <div className="se-nav">
            {step > 0 && <button className="se-btn secondary" onClick={() => goTo(step-1)}>← Back</button>}
            {!allSeen && !autoPlay && (
              <button className="se-btn primary" onClick={() => goTo(step+1)}>Next: {STEPS[step+1]?.title} →</button>
            )}
            {allSeen && <button className="se-btn success" onClick={onComplete}>✅ I Understand Solar Energy! →</button>}
          </div>
          <div className="se-counter">Step {step+1} of {STEPS.length}</div>
        </div>
      )}
    </div>
  );
}
