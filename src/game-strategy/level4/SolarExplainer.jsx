// ═══════════════════════════════════════════════════════════
//  SOLAR EXPLAINER — "How Solar Energy Works" overview
//  Shows AFTER Phase 0 (install) — a general overview of
//  how solar energy works, NOT the detailed component
//  breakdowns (those come in Phase 1 walk-and-interact)
// ═══════════════════════════════════════════════════════════
import React, { useState, useEffect } from 'react';

// ─── Overview SVGs ───
// These show the BIG PICTURE of how solar works, distinct from
// Phase 1's component-by-component deep dives.

function SolarOverviewSVG({ step }) {
  // Step 0: The Complete Solar Journey (Sun → Panel → Power)
  if (step === 0) return (
    <svg viewBox="0 0 520 260" className="se-svg" style={{maxHeight:'42vh'}}>
      <defs>
        <linearGradient id="so-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1a1a3e"/><stop offset="100%" stopColor="#0a0a1f"/></linearGradient>
        <marker id="so-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="#fbbf24"/></marker>
        <marker id="so-arr2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="#22c55e"/></marker>
      </defs>
      <rect width="520" height="260" rx="16" fill="url(#so-sky)"/>
      {/* Sun */}
      <circle cx="80" cy="55" r="32" fill="#fbbf24" opacity="0.15"><animate attributeName="r" values="30;35;30" dur="3s" repeatCount="indefinite"/></circle>
      <circle cx="80" cy="55" r="20" fill="#fbbf24" opacity="0.6"><animate attributeName="r" values="18;22;18" dur="2s" repeatCount="indefinite"/></circle>
      <text x="80" y="62" fill="#fbbf24" fontSize="20" textAnchor="middle">☀️</text>
      <text x="80" y="90" fill="#fbbf24" fontSize="9" textAnchor="middle" fontWeight="bold">SUNLIGHT</text>
      {/* Sun rays to panel */}
      {[0,1,2,3,4].map(i=><line key={i} x1="110" y1={40+i*8} x2="190" y2={115+i*5} stroke="#fbbf24" strokeWidth="1.2" strokeDasharray="5,4" opacity="0.4"><animate attributeName="opacity" values="0.2;0.6;0.2" dur={`${1.5+i*0.2}s`} repeatCount="indefinite"/></line>)}
      {/* Solar Panel */}
      <rect x="180" y="110" width="110" height="55" rx="6" fill="rgba(96,165,250,0.12)" stroke="#60a5fa" strokeWidth="2"/>
      {[0,1,2].map(r=>[0,1,2].map(c=><rect key={`${r}${c}`} x={188+c*35} y={116+r*16} width="30" height="12" rx="2" fill="rgba(96,165,250,0.25)" stroke="#60a5fa" strokeWidth="0.5"/>))}
      <text x="235" y="180" fill="#60a5fa" fontSize="9" textAnchor="middle" fontWeight="bold">SOLAR PANEL</text>
      <text x="235" y="193" fill="#888" fontSize="7" textAnchor="middle">Converts light to electricity</text>
      {/* Arrow: Panel → Inverter */}
      <path d="M295,137 L340,137" stroke="#f59e0b" strokeWidth="2" strokeDasharray="6,4" markerEnd="url(#so-arr)"><animate attributeName="stroke-dashoffset" values="0;-20" dur="1s" repeatCount="indefinite"/></path>
      <text x="317" y="130" fill="#f59e0b" fontSize="7" textAnchor="middle">DC Power</text>
      {/* Inverter */}
      <rect x="345" y="115" width="70" height="45" rx="8" fill="rgba(167,139,250,0.12)" stroke="#a78bfa" strokeWidth="2"/>
      <text x="380" y="137" fill="#a78bfa" fontSize="9" textAnchor="middle" fontWeight="bold">INVERTER</text>
      <text x="380" y="150" fill="#888" fontSize="6" textAnchor="middle">DC → AC</text>
      <circle cx="380" cy="155" r="3" fill="#a78bfa"><animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite"/></circle>
      {/* Arrow: Inverter → Home */}
      <path d="M420,137 L455,137" stroke="#22c55e" strokeWidth="2" strokeDasharray="6,4" markerEnd="url(#so-arr2)"><animate attributeName="stroke-dashoffset" values="0;-20" dur="1s" repeatCount="indefinite"/></path>
      <text x="437" y="130" fill="#22c55e" fontSize="7" textAnchor="middle">AC Power</text>
      {/* Home */}
      <rect x="460" y="110" width="50" height="55" rx="6" fill="rgba(34,197,94,0.1)" stroke="#22c55e" strokeWidth="2"/>
      <text x="485" y="140" fill="#22c55e" fontSize="16" textAnchor="middle">🏠</text>
      <text x="485" y="180" fill="#22c55e" fontSize="8" textAnchor="middle" fontWeight="bold">HOME</text>
      {/* Title */}
      <text x="260" y="24" fill="#fff" fontSize="13" textAnchor="middle" fontWeight="bold">How Solar Energy Works</text>
      <text x="260" y="42" fill="#888" fontSize="8" textAnchor="middle">Sunlight → Solar Panel → Inverter → Your Home</text>
      {/* Bottom info */}
      <rect x="60" y="210" width="400" height="35" rx="10" fill="rgba(34,197,94,0.06)" stroke="rgba(34,197,94,0.2)" strokeWidth="1"/>
      <text x="260" y="228" fill="#22c55e" fontSize="9" textAnchor="middle" fontWeight="bold">Solar panels capture sunlight and convert it into clean, free electricity!</text>
      <text x="260" y="240" fill="#888" fontSize="7" textAnchor="middle">No fuel, no pollution, no moving parts — just pure energy from the sun</text>
    </svg>
  );

  // Step 1: Energy Flow — Day vs Night
  if (step === 1) return (
    <svg viewBox="0 0 520 280" className="se-svg" style={{maxHeight:'42vh'}}>
      <defs>
        <linearGradient id="so-day" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#1a1a3e"/><stop offset="50%" stopColor="#1a2040"/><stop offset="100%" stopColor="#0a0a1f"/></linearGradient>
        <marker id="so-fa" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="#fbbf24"/></marker>
        <marker id="so-ga" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="#8b5cf6"/></marker>
      </defs>
      <rect width="520" height="280" rx="16" fill="url(#so-day)"/>
      <text x="260" y="22" fill="#fff" fontSize="12" textAnchor="middle" fontWeight="bold">Solar Energy: Day & Night</text>
      {/* DAY side */}
      <rect x="15" y="35" width="240" height="200" rx="12" fill="rgba(251,191,36,0.04)" stroke="rgba(251,191,36,0.2)" strokeWidth="1"/>
      <text x="135" y="52" fill="#fbbf24" fontSize="10" textAnchor="middle" fontWeight="bold">☀️ DAYTIME (6 AM - 6 PM)</text>
      <circle cx="60" cy="85" r="16" fill="#fbbf24" opacity="0.5"><animate attributeName="r" values="14;18;14" dur="2s" repeatCount="indefinite"/></circle>
      <text x="60" y="89" fill="#fbbf24" fontSize="10" textAnchor="middle">☀️</text>
      <text x="60" y="108" fill="#888" fontSize="7" textAnchor="middle">Sun</text>
      <path d="M80,85 L115,105" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="4,3" markerEnd="url(#so-fa)"><animate attributeName="stroke-dashoffset" values="0;-14" dur="0.8s" repeatCount="indefinite"/></path>
      <rect x="115" y="95" width="55" height="25" rx="4" fill="rgba(96,165,250,0.15)" stroke="#60a5fa" strokeWidth="1.5"/>
      <text x="142" y="111" fill="#60a5fa" fontSize="7" textAnchor="middle">Panel</text>
      <path d="M175,107 L200,107" stroke="#22c55e" strokeWidth="1.5" strokeDasharray="4,3"><animate attributeName="stroke-dashoffset" values="0;-14" dur="0.8s" repeatCount="indefinite"/></path>
      <text x="222" y="99" fill="#22c55e" fontSize="7" textAnchor="middle">Powers</text>
      <text x="222" y="111" fill="#22c55e" fontSize="7" textAnchor="middle">Home!</text>
      {/* Battery charging */}
      <rect x="40" y="140" width="80" height="28" rx="6" fill="rgba(139,92,246,0.1)" stroke="#8b5cf6" strokeWidth="1.5"/>
      <text x="80" y="158" fill="#8b5cf6" fontSize="7" textAnchor="middle" fontWeight="bold">🔋 Battery Charges</text>
      <rect x="48" y="168" width="64" height="6" rx="3" fill="rgba(139,92,246,0.15)"/>
      <rect x="48" y="168" width="40" height="6" rx="3" fill="#8b5cf6" opacity="0.6"><animate attributeName="width" values="10;60;10" dur="4s" repeatCount="indefinite"/></rect>
      {/* Grid export */}
      <rect x="145" y="140" width="95" height="28" rx="6" fill="rgba(34,197,94,0.08)" stroke="#22c55e" strokeWidth="1"/>
      <text x="192" y="152" fill="#22c55e" fontSize="6" textAnchor="middle">Extra power → Grid</text>
      <text x="192" y="163" fill="#22c55e" fontSize="7" textAnchor="middle" fontWeight="bold">You EARN credits! 💰</text>
      <text x="135" y="210" fill="#fbbf24" fontSize="8" textAnchor="middle" fontWeight="bold">Solar powers your home + charges battery + earns credits</text>
      {/* NIGHT side */}
      <rect x="265" y="35" width="240" height="200" rx="12" fill="rgba(139,92,246,0.04)" stroke="rgba(139,92,246,0.2)" strokeWidth="1"/>
      <text x="385" y="52" fill="#8b5cf6" fontSize="10" textAnchor="middle" fontWeight="bold">🌙 NIGHTTIME (6 PM - 6 AM)</text>
      <text x="310" y="89" fill="#a78bfa" fontSize="16" textAnchor="middle">🌙</text>
      <text x="310" y="108" fill="#888" fontSize="7" textAnchor="middle">No Sun</text>
      <rect x="340" y="80" width="80" height="28" rx="6" fill="rgba(139,92,246,0.15)" stroke="#8b5cf6" strokeWidth="1.5"/>
      <text x="380" y="98" fill="#8b5cf6" fontSize="7" textAnchor="middle" fontWeight="bold">🔋 Battery</text>
      <path d="M425,94 L455,94" stroke="#8b5cf6" strokeWidth="1.5" strokeDasharray="4,3" markerEnd="url(#so-ga)"><animate attributeName="stroke-dashoffset" values="0;-14" dur="0.8s" repeatCount="indefinite"/></path>
      <text x="475" y="90" fill="#22c55e" fontSize="7" textAnchor="middle">Powers</text>
      <text x="475" y="102" fill="#22c55e" fontSize="7" textAnchor="middle">Home!</text>
      {/* Grid backup */}
      <rect x="305" y="125" width="160" height="28" rx="6" fill="rgba(96,165,250,0.06)" stroke="#60a5fa" strokeWidth="1"/>
      <text x="385" y="137" fill="#60a5fa" fontSize="6" textAnchor="middle">If battery runs out:</text>
      <text x="385" y="148" fill="#60a5fa" fontSize="7" textAnchor="middle" fontWeight="bold">Grid provides backup power ⚡</text>
      <text x="385" y="177" fill="#888" fontSize="7" textAnchor="middle">Your daytime credits reduce the bill!</text>
      <text x="385" y="210" fill="#8b5cf6" fontSize="8" textAnchor="middle" fontWeight="bold">Battery + credits = almost FREE electricity at night</text>
      {/* Bottom */}
      <rect x="40" y="244" width="440" height="26" rx="8" fill="rgba(34,197,94,0.08)" stroke="rgba(34,197,94,0.2)" strokeWidth="1"/>
      <text x="260" y="261" fill="#22c55e" fontSize="9" textAnchor="middle" fontWeight="bold">Result: 24/7 clean energy — day AND night! ☀️🌙</text>
    </svg>
  );

  // Step 2: Why Solar is Amazing — Impact Numbers
  if (step === 2) return (
    <svg viewBox="0 0 520 280" className="se-svg" style={{maxHeight:'42vh'}}>
      <defs>
        <linearGradient id="so-bg3" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0f1a2e"/><stop offset="100%" stopColor="#0a0f1a"/></linearGradient>
      </defs>
      <rect width="520" height="280" rx="16" fill="url(#so-bg3)"/>
      <text x="260" y="24" fill="#fff" fontSize="13" textAnchor="middle" fontWeight="bold">Why Solar Energy is Amazing!</text>
      <text x="260" y="42" fill="#888" fontSize="8" textAnchor="middle">Here's what your solar panels will do</text>
      {/* 4 impact cards */}
      {[
        {icon:'💰',title:'Save Money',val:'Rs.3,000+',sub:'/month saved',c:'#22c55e',x:70},
        {icon:'🌿',title:'Stop Pollution',val:'6,150 kg',sub:'CO₂ prevented/yr',c:'#16a34a',x:195},
        {icon:'🌳',title:'Save Trees',val:'= 280',sub:'trees planted',c:'#10b981',x:320},
        {icon:'⚡',title:'Free Power',val:'25+ yrs',sub:'of electricity',c:'#f59e0b',x:445},
      ].map((card,i)=>(
        <g key={i}>
          <rect x={card.x-50} y="55" width="100" height="115" rx="10" fill={`${card.c}0a`} stroke={`${card.c}44`} strokeWidth="1.5">
            <animate attributeName="opacity" values="0;1" dur="0.5s" begin={`${i*0.15}s`} fill="freeze"/>
          </rect>
          <text x={card.x} y="80" fill={card.c} fontSize="22" textAnchor="middle">{card.icon}</text>
          <text x={card.x} y="100" fill={card.c} fontSize="9" textAnchor="middle" fontWeight="bold">{card.title}</text>
          <text x={card.x} y="122" fill="#fff" fontSize="14" textAnchor="middle" fontWeight="bold">{card.val}</text>
          <text x={card.x} y="140" fill="#888" fontSize="7" textAnchor="middle">{card.sub}</text>
          <text x={card.x} y="160" fill={card.c} fontSize="10" textAnchor="middle">✅</text>
        </g>
      ))}
      {/* Comparison bar */}
      <rect x="40" y="185" width="440" height="50" rx="10" fill="rgba(239,68,68,0.04)" stroke="rgba(239,68,68,0.15)" strokeWidth="1"/>
      <text x="260" y="202" fill="#888" fontSize="8" textAnchor="middle">WITHOUT Solar: Rs.3,500/month bill + 223 kg CO₂ + 100% grid power</text>
      <rect x="40" y="240" width="440" height="30" rx="10" fill="rgba(34,197,94,0.08)" stroke="rgba(34,197,94,0.25)" strokeWidth="1"/>
      <text x="260" y="259" fill="#22c55e" fontSize="9" textAnchor="middle" fontWeight="bold">WITH Solar: Rs.200-400/month + ZERO pollution + energy independence! 🎉</text>
      <text x="260" y="220" fill="#f59e0b" fontSize="9" textAnchor="middle" fontWeight="bold">Solar pays for itself in just 3-4 years, then 21+ years of FREE power!</text>
    </svg>
  );

  // Step 3: What You'll Learn Next
  if (step === 3) return (
    <svg viewBox="0 0 520 280" className="se-svg" style={{maxHeight:'42vh'}}>
      <defs>
        <linearGradient id="so-bg4" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0f1a2e"/><stop offset="100%" stopColor="#0a0f1a"/></linearGradient>
      </defs>
      <rect width="520" height="280" rx="16" fill="url(#so-bg4)"/>
      <text x="260" y="24" fill="#fff" fontSize="13" textAnchor="middle" fontWeight="bold">Your Solar Learning Journey</text>
      <text x="260" y="42" fill="#888" fontSize="8" textAnchor="middle">You installed panels! Now learn how the whole system works</text>
      {/* Journey steps */}
      {[
        {n:'1',title:'Solar Parts',desc:'Panel, Inverter, Meter',icon:'🔧',c:'#60a5fa',done:true},
        {n:'2',title:'Panel Science',desc:'Angle, Shadows, Roof',icon:'📐',c:'#a78bfa',done:false},
        {n:'3',title:'Govt Help',desc:'PM Surya Ghar Subsidy',icon:'🏛️',c:'#f59e0b',done:false},
        {n:'4',title:'Batteries',desc:'Store power for night',icon:'🔋',c:'#8b5cf6',done:false},
        {n:'5',title:'Smart Energy',desc:'Best time to use power',icon:'🤖',c:'#22c55e',done:false},
        {n:'6',title:'Weather',desc:'Seasons & cleaning',icon:'🌦️',c:'#06b6d4',done:false},
        {n:'7',title:'Planet Impact',desc:'CO₂ saved & trees',icon:'🌿',c:'#16a34a',done:false},
        {n:'8',title:'Action Plan',desc:'Go solar in 10 steps',icon:'📈',c:'#f59e0b',done:false},
      ].map((s,i)=>{
        const row = Math.floor(i/4);
        const col = i%4;
        const x = 65 + col*130;
        const y = 60 + row*105;
        return (
          <g key={i}>
            <rect x={x-50} y={y} width="105" height="80" rx="8" fill={`${s.c}08`} stroke={`${s.c}${s.done?'66':'33'}`} strokeWidth={s.done?2:1}/>
            <text x={x+2} y={y+22} fill={s.c} fontSize="16" textAnchor="middle">{s.icon}</text>
            <text x={x+2} y={y+40} fill={s.c} fontSize="8" textAnchor="middle" fontWeight="bold">{s.title}</text>
            <text x={x+2} y={y+54} fill="#888" fontSize="6" textAnchor="middle">{s.desc}</text>
            {s.done && <text x={x+2} y={y+72} fill="#22c55e" fontSize="8" textAnchor="middle" fontWeight="bold">NEXT →</text>}
            {!s.done && <text x={x+2} y={y+72} fill="#555" fontSize="7" textAnchor="middle">Coming up</text>}
          </g>
        );
      })}
      <rect x="60" y="252" width="400" height="22" rx="6" fill="rgba(34,197,94,0.08)" stroke="rgba(34,197,94,0.2)" strokeWidth="1"/>
      <text x="260" y="267" fill="#22c55e" fontSize="8" textAnchor="middle" fontWeight="bold">Let's start by learning about each solar component! →</text>
    </svg>
  );

  return null;
}

const OVERVIEW_STEPS = [
  { title: 'How Solar Energy Works', desc: 'Sunlight hits your solar panels and gets converted into electricity. The inverter changes the power type so your home appliances can use it. It\'s like a magic process — sunshine in, electricity out!' ,
    fact: 'India receives about 5,000 trillion kWh of solar energy per year — that\'s 4,000 times our total electricity demand!' },
  { title: 'Solar Energy: Day & Night', desc: 'During the day, solar panels power your home and charge a battery. At night, the battery takes over. Any extra daytime power goes to the grid and you earn credits that reduce your bill!',
    fact: 'With a good battery, your home can run 100% on solar — even at night. No more power cuts!' },
  { title: 'Why Solar is Amazing!', desc: 'A small solar system saves over Rs.3,000 every month, prevents 6,150 kg of CO₂ pollution per year (equal to planting 280 trees), and pays for itself in just 3-4 years!',
    fact: 'After the payback period, you get 21+ years of almost FREE electricity. Total savings: Rs.12-15 Lakh!' },
  { title: 'Your Learning Journey', desc: 'You\'ve installed the panels! Next, you\'ll learn about each part of the solar system — the inverter, the meter, battery storage, smart energy use, and much more. Let\'s go!',
    fact: 'By the end of this level, you\'ll know everything about running a smart solar home — enough to teach your family!' },
];

export default function SolarExplainer({ onComplete }) {
  const [step, setStep] = useState(0);
  const [animClass, setAnimClass] = useState('se-enter');

  useEffect(() => {
    setAnimClass('se-enter');
    const t = setTimeout(() => setAnimClass('se-active'), 50);
    return () => clearTimeout(t);
  }, [step]);

  const current = OVERVIEW_STEPS[step];
  const isLast = step >= OVERVIEW_STEPS.length - 1;

  const advance = () => {
    if (!isLast) {
      setAnimClass('se-exit');
      setTimeout(() => setStep(s => s + 1), 300);
    } else {
      onComplete?.();
    }
  };

  return (
    <div className="se-overlay">
      <div className={`se-card ${animClass}`} style={{ borderColor: '#38d9a944', maxWidth: '580px' }}>
        {/* Progress dots */}
        <div className="se-progress">
          {OVERVIEW_STEPS.map((_, i) => (
            <div key={i} className={`se-dot ${i === step ? 'active' : i < step ? 'done' : ''}`}
              style={{ background: i <= step ? '#38d9a9' : '#333' }} />
          ))}
        </div>
        <div className="se-step-count" style={{ color: '#38d9a9' }}>
          ☀️ How Solar Works — Step {step + 1} of {OVERVIEW_STEPS.length}
        </div>
        <div className="se-title" style={{ color: '#38d9a9' }}>{current.title}</div>
        <SolarOverviewSVG step={step} />
        <div className="se-desc">{current.desc}</div>
        <div className="se-fact" style={{ borderLeftColor: '#38d9a9' }}>
          <span style={{ color: '#38d9a9' }}>Did you know?</span> {current.fact}
        </div>
        <button className="se-next" style={{ background: '#38d9a9' }} onClick={advance}>
          {isLast ? 'Start Exploring Solar Parts ✔' : `Next: ${OVERVIEW_STEPS[step + 1].title} →`}
        </button>
      </div>
    </div>
  );
}
