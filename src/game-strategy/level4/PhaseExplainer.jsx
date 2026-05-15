// ═══════════════════════════════════════════════════════════
//  PHASE EXPLAINER — Unified Premium Animated Explainer
//  Renders any topic from phaseExplainerData.js
// ═══════════════════════════════════════════════════════════
import React, { useState, useEffect } from 'react';
import { EXPLAINER_TOPICS } from './phaseExplainerData';

// ═══ SVG DIAGRAM LIBRARY ═══
function TopicSVG({ svgId, color }) {
  const C = color;
  // ─── PANEL BASICS ───
  if (svgId === 'panel_sun') return (
    <svg viewBox="0 0 440 150" className="se-svg">
      <circle cx="60" cy="75" r="28" fill="#fbbf24" opacity="0.9"><animate attributeName="r" values="26;30;26" dur="2s" repeatCount="indefinite"/></circle>
      {[0,1,2,3,4].map(i=><line key={i} x1="95" y1={45+i*15} x2="250" y2={55+i*12} stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="6,4" opacity="0.5"><animate attributeName="opacity" values="0.3;0.7;0.3" dur={`${1.5+i*0.2}s`} repeatCount="indefinite"/></line>)}
      <rect x="260" y="40" width="100" height="70" rx="4" fill="rgba(96,165,250,0.15)" stroke="#60a5fa" strokeWidth="2"/>
      {[0,1,2].map(r=>[0,1,2].map(c=><rect key={`${r}${c}`} x={268+c*32} y={48+r*22} width="28" height="18" rx="2" fill="rgba(96,165,250,0.3)" stroke="#60a5fa" strokeWidth="0.5"/>))}
      <path d="M370,75 L390,75" stroke="#22c55e" strokeWidth="2.5"/>
      <text x="400" y="70" fill="#22c55e" fontSize="10" fontWeight="bold">Electricity!</text>
      <text x="60" y="120" fill="#fbbf24" fontSize="9" textAnchor="middle">Sun</text>
      <text x="310" y="125" fill="#60a5fa" fontSize="9" textAnchor="middle">Solar Panel</text>
    </svg>);
  if (svgId === 'panel_cells') return (
    <svg viewBox="0 0 440 150" className="se-svg">
      <text x="220" y="14" fill="#888" fontSize="8" textAnchor="middle">INSIDE A SOLAR PANEL</text>
      <rect x="100" y="25" width="240" height="100" rx="6" fill="rgba(96,165,250,0.05)" stroke="#60a5fa" strokeWidth="1"/>
      {[0,1,2,3,4,5].map(i=><rect key={i} x={110+i*38} y="35" width="34" height="34" rx="2" fill="rgba(96,165,250,0.2)" stroke="#60a5fa" strokeWidth="1"/>)}
      <text x="220" y="58" fill="#60a5fa" fontSize="8" textAnchor="middle">Silicon Cells</text>
      {[0,1,2,3].map(i=><circle key={i} cx={130+i*50} cy="50" r="3" fill="#fbbf24"><animate attributeName="cy" values="50;90;120" dur="2s" begin={`${i*0.3}s`} repeatCount="indefinite"/><animate attributeName="opacity" values="1;0.7;0" dur="2s" begin={`${i*0.3}s`} repeatCount="indefinite"/></circle>)}
      <text x="220" y="100" fill="#22c55e" fontSize="9" textAnchor="middle" fontWeight="bold">Electrons flow = Electricity!</text>
      <path d="M340,75 L380,75" stroke="#22c55e" strokeWidth="2" markerEnd="url(#arr)"/>
      <defs><marker id="arr" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="#22c55e"/></marker></defs>
    </svg>);
  if (svgId === 'panel_types') return (
    <svg viewBox="0 0 440 140" className="se-svg">
      <rect x="30" y="20" width="170" height="100" rx="6" fill="rgba(30,30,40,0.8)" stroke="#333" strokeWidth="1"/>
      <text x="115" y="42" fill="#888" fontSize="9" textAnchor="middle">Monocrystalline</text>
      <rect x="50" y="50" width="130" height="55" rx="3" fill="#1a1a2e" stroke="#333" strokeWidth="1"/>
      <text x="115" y="82" fill="#aaa" fontSize="11" textAnchor="middle" fontWeight="bold">20-22% power</text>
      <text x="115" y="117" fill="#22c55e" fontSize="9" textAnchor="middle">Best Quality</text>
      <rect x="240" y="20" width="170" height="100" rx="6" fill="rgba(30,50,80,0.3)" stroke="#3b82f6" strokeWidth="1"/>
      <text x="325" y="42" fill="#888" fontSize="9" textAnchor="middle">Polycrystalline</text>
      <rect x="260" y="50" width="130" height="55" rx="3" fill="rgba(59,130,246,0.15)" stroke="#3b82f6" strokeWidth="1"/>
      <text x="325" y="82" fill="#60a5fa" fontSize="11" textAnchor="middle" fontWeight="bold">15-17% power</text>
      <text x="325" y="117" fill="#f59e0b" fontSize="9" textAnchor="middle">Budget-Friendly</text>
    </svg>);

  // ─── INVERTER ───
  if (svgId === 'inverter_convert') return (
    <svg viewBox="0 0 440 140" className="se-svg">
      <rect x="30" y="30" width="100" height="80" rx="8" fill="rgba(96,165,250,0.1)" stroke="#60a5fa" strokeWidth="1.5"/>
      <text x="80" y="65" fill="#60a5fa" fontSize="14" textAnchor="middle" fontWeight="bold">DC</text>
      <text x="80" y="85" fill="#888" fontSize="8" textAnchor="middle">From Panels</text>
      <path d="M140,70 L200,70" stroke="#f59e0b" strokeWidth="2" strokeDasharray="6,3"><animate attributeName="stroke-dashoffset" values="0;-18" dur="1s" repeatCount="indefinite"/></path>
      <rect x="210" y="25" width="100" height="90" rx="10" fill="rgba(167,139,250,0.15)" stroke="#a78bfa" strokeWidth="2"/>
      <text x="260" y="60" fill="#a78bfa" fontSize="11" textAnchor="middle" fontWeight="bold">INVERTER</text>
      <text x="260" y="78" fill="#888" fontSize="8" textAnchor="middle">DC to AC</text>
      <circle cx="260" cy="95" r="5" fill="#22c55e"><animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite"/></circle>
      <path d="M320,70 L380,70" stroke="#22c55e" strokeWidth="2" strokeDasharray="6,3"><animate attributeName="stroke-dashoffset" values="0;-18" dur="1s" repeatCount="indefinite"/></path>
      <rect x="390" y="30" width="40" height="80" rx="6" fill="rgba(34,197,94,0.1)" stroke="#22c55e" strokeWidth="1.5"/>
      <text x="410" y="65" fill="#22c55e" fontSize="12" textAnchor="middle" fontWeight="bold">AC</text>
      <text x="410" y="85" fill="#888" fontSize="7" textAnchor="middle">To Home</text>
    </svg>);
  if (svgId === 'inverter_brain') return (
    <svg viewBox="0 0 440 130" className="se-svg">
      <rect x="150" y="15" width="140" height="100" rx="12" fill="rgba(167,139,250,0.1)" stroke="#a78bfa" strokeWidth="2"/>
      <text x="220" y="40" fill="#a78bfa" fontSize="12" textAnchor="middle" fontWeight="bold">Smart Inverter</text>
      <text x="220" y="60" fill="#888" fontSize="8" textAnchor="middle">Tracks Sun Position</text>
      <text x="220" y="75" fill="#888" fontSize="8" textAnchor="middle">Optimizes Power</text>
      <text x="220" y="90" fill="#888" fontSize="8" textAnchor="middle">Protects Home</text>
      <text x="220" y="105" fill="#22c55e" fontSize="9" textAnchor="middle" fontWeight="bold">97% Efficient!</text>
      <circle cx="100" cy="65" r="20" fill="#fbbf24" opacity="0.7"><animate attributeName="r" values="18;22;18" dur="2s" repeatCount="indefinite"/></circle>
      <text x="100" y="100" fill="#888" fontSize="8" textAnchor="middle">Sun</text>
      <line x1="120" y1="65" x2="148" y2="65" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="4,3"/>
      <rect x="330" y="35" width="70" height="60" rx="6" fill="rgba(34,197,94,0.08)" stroke="#22c55e" strokeWidth="1"/>
      <text x="365" y="60" fill="#22c55e" fontSize="9" textAnchor="middle">Your</text>
      <text x="365" y="75" fill="#22c55e" fontSize="9" textAnchor="middle">Home</text>
      <line x1="292" y1="65" x2="328" y2="65" stroke="#22c55e" strokeWidth="1.5" strokeDasharray="4,3"/>
    </svg>);
  if (svgId === 'inverter_types') return (
    <svg viewBox="0 0 440 130" className="se-svg">
      {[{x:30,name:'String',price:'Rs.25-50K',c:'#60a5fa'},{x:170,name:'Micro',price:'Rs.8K/panel',c:'#a78bfa'},{x:310,name:'Hybrid',price:'Rs.60K-1L',c:'#22c55e'}].map((t,i)=>(
        <g key={i}><rect x={t.x} y="15" width="120" height="95" rx="8" fill={`${t.c}11`} stroke={t.c} strokeWidth="1.5"/>
        <text x={t.x+60} y="40" fill={t.c} fontSize="11" textAnchor="middle" fontWeight="bold">{t.name}</text>
        <text x={t.x+60} y="60" fill="#aaa" fontSize="8" textAnchor="middle">{t.price}</text>
        <text x={t.x+60} y="80" fill="#888" fontSize="7" textAnchor="middle">{i===0?'Simple & Cheap':i===1?'Best for Shade':'Battery Ready'}</text>
        {i===2 && <text x={t.x+60} y="100" fill="#22c55e" fontSize="8" textAnchor="middle" fontWeight="bold">RECOMMENDED</text>}</g>
      ))}
    </svg>);

  // ─── NET METER ───
  if (svgId === 'meter_spin') return (
    <svg viewBox="0 0 440 130" className="se-svg">
      <rect x="160" y="15" width="120" height="100" rx="10" fill="rgba(34,197,94,0.08)" stroke="#22c55e" strokeWidth="2"/>
      <text x="220" y="38" fill="#22c55e" fontSize="10" textAnchor="middle" fontWeight="bold">NET METER</text>
      <rect x="180" y="45" width="80" height="25" rx="4" fill="rgba(0,0,0,0.4)" stroke="#333"/>
      <text x="220" y="63" fill="#22c55e" fontSize="14" textAnchor="middle" fontFamily="monospace" fontWeight="bold"><animate attributeName="textLength" values="40;60;40" dur="3s" repeatCount="indefinite"/>0042</text>
      <text x="220" y="85" fill="#888" fontSize="8" textAnchor="middle">Counts BOTH ways!</text>
      <path d="M175,95 C190,80 250,80 265,95" fill="none" stroke="#f59e0b" strokeWidth="1.5"><animate attributeName="d" values="M175,95 C190,80 250,80 265,95;M175,95 C190,100 250,100 265,95;M175,95 C190,80 250,80 265,95" dur="2s" repeatCount="indefinite"/></path>
      <text x="80" y="70" fill="#ef4444" fontSize="9" textAnchor="middle">Grid Power IN</text>
      <path d="M120,65 L155,65" stroke="#ef4444" strokeWidth="1.5" markerEnd="url(#arr2)"/>
      <text x="360" y="70" fill="#22c55e" fontSize="9" textAnchor="middle">Solar OUT</text>
      <path d="M285,65 L320,65" stroke="#22c55e" strokeWidth="1.5" markerEnd="url(#arr3)"/>
      <defs><marker id="arr2" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="#ef4444"/></marker><marker id="arr3" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="#22c55e"/></marker></defs>
    </svg>);
  if (svgId === 'meter_savings') return (
    <svg viewBox="0 0 440 130" className="se-svg">
      <text x="220" y="14" fill="#888" fontSize="8" textAnchor="middle">HOW NET METERING SAVES MONEY</text>
      <rect x="30" y="25" width="160" height="45" rx="6" fill="rgba(251,191,36,0.08)" stroke="#fbbf24" strokeWidth="1"/>
      <text x="40" y="42" fill="#fbbf24" fontSize="8">DAY: Solar makes power</text>
      <text x="40" y="58" fill="#22c55e" fontSize="9" fontWeight="bold">Extra goes to grid = Credits!</text>
      <rect x="30" y="80" width="160" height="45" rx="6" fill="rgba(96,165,250,0.08)" stroke="#60a5fa" strokeWidth="1"/>
      <text x="40" y="97" fill="#60a5fa" fontSize="8">NIGHT: Use grid power</text>
      <text x="40" y="113" fill="#22c55e" fontSize="9" fontWeight="bold">Credits reduce your bill!</text>
      <rect x="250" y="30" width="160" height="80" rx="10" fill="rgba(34,197,94,0.1)" stroke="#22c55e" strokeWidth="2"/>
      <text x="330" y="55" fill="#22c55e" fontSize="11" textAnchor="middle" fontWeight="bold">RESULT</text>
      <text x="330" y="75" fill="#fff" fontSize="12" textAnchor="middle" fontWeight="bold">Almost FREE!</text>
      <text x="330" y="95" fill="#888" fontSize="8" textAnchor="middle">Rs.200-400/month</text>
    </svg>);
  if (svgId === 'meter_bill') return (
    <svg viewBox="0 0 440 130" className="se-svg">
      <rect x="30" y="15" width="170" height="100" rx="8" fill="rgba(239,68,68,0.06)" stroke="#ef4444" strokeWidth="1.5"/>
      <text x="115" y="35" fill="#ef4444" fontSize="10" textAnchor="middle" fontWeight="bold">BEFORE Solar</text>
      <text x="115" y="60" fill="#fff" fontSize="18" textAnchor="middle" fontWeight="bold">Rs.3,500</text>
      <text x="115" y="78" fill="#888" fontSize="8" textAnchor="middle">/month</text>
      <rect x="55" y="88" width="120" height="8" rx="4" fill="rgba(239,68,68,0.3)"/>
      <rect x="240" y="15" width="170" height="100" rx="8" fill="rgba(34,197,94,0.06)" stroke="#22c55e" strokeWidth="1.5"/>
      <text x="325" y="35" fill="#22c55e" fontSize="10" textAnchor="middle" fontWeight="bold">AFTER Solar</text>
      <text x="325" y="60" fill="#22c55e" fontSize="18" textAnchor="middle" fontWeight="bold">Rs.200</text>
      <text x="325" y="78" fill="#888" fontSize="8" textAnchor="middle">/month</text>
      <rect x="265" y="88" width="120" height="8" rx="4" fill="rgba(34,197,94,0.15)"/>
      <rect x="265" y="88" width="8" height="8" rx="4" fill="#22c55e"/>
    </svg>);

  // ─── SYSTEM TYPES ───
  if (svgId === 'sys_ongrid') return (
    <svg viewBox="0 0 440 130" className="se-svg">
      <rect x="20" y="25" width="80" height="50" rx="4" fill="rgba(251,191,36,0.1)" stroke="#fbbf24" strokeWidth="1.5"/>
      <text x="60" y="55" fill="#fbbf24" fontSize="9" textAnchor="middle">Panels</text>
      <path d="M105,50 L155,50" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4,3"/>
      <rect x="160" y="25" width="60" height="50" rx="6" fill="rgba(167,139,250,0.1)" stroke="#a78bfa" strokeWidth="1.5"/>
      <text x="190" y="55" fill="#a78bfa" fontSize="8" textAnchor="middle">Inverter</text>
      <path d="M225,50 L270,50" stroke="#22c55e" strokeWidth="1.5"/>
      <rect x="275" y="20" width="70" height="60" rx="6" fill="rgba(34,197,94,0.08)" stroke="#22c55e" strokeWidth="1.5"/>
      <text x="310" y="45" fill="#22c55e" fontSize="8" textAnchor="middle">Home</text>
      <text x="310" y="60" fill="#888" fontSize="7" textAnchor="middle">+ Grid</text>
      <text x="220" y="105" fill="#60a5fa" fontSize="10" textAnchor="middle" fontWeight="bold">Cheapest! Rs.3-4 Lakh</text>
      <text x="220" y="120" fill="#ef4444" fontSize="8" textAnchor="middle">No power during grid cuts</text>
    </svg>);
  if (svgId === 'sys_offgrid') return (
    <svg viewBox="0 0 440 130" className="se-svg">
      <rect x="20" y="20" width="80" height="45" rx="4" fill="rgba(251,191,36,0.1)" stroke="#fbbf24" strokeWidth="1.5"/>
      <text x="60" y="48" fill="#fbbf24" fontSize="9" textAnchor="middle">Panels</text>
      <rect x="160" y="20" width="60" height="45" rx="6" fill="rgba(167,139,250,0.1)" stroke="#a78bfa" strokeWidth="1.5"/>
      <text x="190" y="48" fill="#a78bfa" fontSize="8" textAnchor="middle">Inverter</text>
      <rect x="160" y="75" width="60" height="40" rx="6" fill="rgba(139,92,246,0.15)" stroke="#8b5cf6" strokeWidth="1.5"/>
      <text x="190" y="100" fill="#8b5cf6" fontSize="8" textAnchor="middle">Battery</text>
      <rect x="290" y="25" width="70" height="50" rx="6" fill="rgba(34,197,94,0.08)" stroke="#22c55e" strokeWidth="1.5"/>
      <text x="325" y="55" fill="#22c55e" fontSize="9" textAnchor="middle">Home</text>
      <text x="220" y="125" fill="#f59e0b" fontSize="9" textAnchor="middle" fontWeight="bold">Fully Independent — No Grid Needed</text>
    </svg>);
  if (svgId === 'sys_hybrid') return (
    <svg viewBox="0 0 440 130" className="se-svg">
      <rect x="10" y="20" width="75" height="40" rx="4" fill="rgba(251,191,36,0.1)" stroke="#fbbf24" strokeWidth="1.5"/>
      <text x="47" y="45" fill="#fbbf24" fontSize="8" textAnchor="middle">Panels</text>
      <rect x="130" y="15" width="70" height="50" rx="8" fill="rgba(34,197,94,0.15)" stroke="#22c55e" strokeWidth="2"/>
      <text x="165" y="35" fill="#22c55e" fontSize="8" textAnchor="middle" fontWeight="bold">Hybrid</text>
      <text x="165" y="50" fill="#22c55e" fontSize="7" textAnchor="middle">Inverter</text>
      <rect x="130" y="75" width="70" height="35" rx="6" fill="rgba(139,92,246,0.15)" stroke="#8b5cf6" strokeWidth="1.5"/>
      <text x="165" y="97" fill="#8b5cf6" fontSize="8" textAnchor="middle">Battery</text>
      <rect x="260" y="20" width="70" height="40" rx="6" fill="rgba(34,197,94,0.08)" stroke="#22c55e" strokeWidth="1.5"/>
      <text x="295" y="45" fill="#22c55e" fontSize="9" textAnchor="middle">Home</text>
      <rect x="370" y="20" width="55" height="40" rx="6" fill="rgba(96,165,250,0.08)" stroke="#60a5fa" strokeWidth="1"/>
      <text x="397" y="45" fill="#60a5fa" fontSize="8" textAnchor="middle">Grid</text>
      <text x="220" y="125" fill="#22c55e" fontSize="10" textAnchor="middle" fontWeight="bold">BEST: Grid + Battery + Solar!</text>
    </svg>);

  // ─── Generic fallback for topics with many SVGs ───
  // Return a styled text-based SVG for any unmatched svgId
  return (
    <svg viewBox="0 0 440 120" className="se-svg">
      <rect x="20" y="10" width="400" height="100" rx="12" fill={`${C}08`} stroke={`${C}44`} strokeWidth="1"/>
      <text x="220" y="60" fill={C} fontSize="14" textAnchor="middle" fontWeight="bold">{svgId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</text>
      <text x="220" y="82" fill="#888" fontSize="9" textAnchor="middle">Interactive Learning Module</text>
      <circle cx="220" cy="35" r="8" fill={C} opacity="0.3"><animate attributeName="r" values="6;10;6" dur="2s" repeatCount="indefinite"/></circle>
    </svg>);
}

// ═══ MAIN COMPONENT ═══
export default function PhaseExplainer({ topicId, onComplete }) {
  const topic = EXPLAINER_TOPICS[topicId];
  const [step, setStep] = useState(0);
  const [quizAns, setQuizAns] = useState(null);
  const [animClass, setAnimClass] = useState('se-enter');

  useEffect(() => {
    setAnimClass('se-enter');
    setQuizAns(null);
    const t = setTimeout(() => setAnimClass('se-active'), 50);
    return () => clearTimeout(t);
  }, [step]);

  if (!topic) return null;
  const steps = topic.steps;
  const current = steps[step];

  const advance = () => {
    if (step < steps.length - 1) {
      setAnimClass('se-exit');
      setTimeout(() => setStep(s => s + 1), 300);
    } else onComplete?.();
  };

  return (
    <div className="se-overlay">
      <div className={`se-card ${animClass}`} style={{ borderColor: topic.color + '44' }}>
        <div className="se-progress">
          {steps.map((s, i) => (
            <div key={i} className={`se-dot ${i === step ? 'active' : i < step ? 'done' : ''}`}
              style={{ background: i <= step ? topic.color : '#333' }} />
          ))}
        </div>
        <div className="se-step-count" style={{ color: topic.color }}>
          {topic.name} — Step {step + 1} of {steps.length}
        </div>
        <div className="se-title" style={{ color: topic.color }}>{current.title}</div>
        <TopicSVG svgId={current.svg} color={topic.color} />
        <div className="se-desc">{current.desc}</div>
        <div className="se-fact" style={{ borderLeftColor: topic.color }}>
          <span style={{ color: topic.color }}>Did you know?</span> {current.fact}
        </div>
        {current.quiz && (
          <div className="se-quiz">
            <div className="se-quiz-q">{current.quiz.q}</div>
            <div className="se-quiz-opts">
              {current.quiz.opts.map((opt, i) => (
                <button key={i}
                  className={`se-quiz-btn ${quizAns !== null ? (i === current.quiz.ans ? 'correct' : quizAns === i ? 'wrong' : '') : ''}`}
                  onClick={() => setQuizAns(i)} disabled={quizAns !== null}>{opt}</button>
              ))}
            </div>
            {quizAns !== null && (
              <div className={`se-quiz-fb ${quizAns === current.quiz.ans ? 'correct' : 'wrong'}`}>
                {quizAns === current.quiz.ans ? 'Correct!' : `Answer: ${current.quiz.opts[current.quiz.ans]}`}
              </div>
            )}
          </div>
        )}
        <button className="se-next" style={{ background: topic.color }}
          onClick={advance} disabled={current.quiz && quizAns === null}>
          {step < steps.length - 1 ? `Next: ${steps[step + 1].title} \u2192` : `Complete ${topic.name} \u2714`}
        </button>
      </div>
    </div>
  );
}
