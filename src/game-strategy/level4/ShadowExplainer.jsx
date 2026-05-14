// ═══════════════════════════════════════════════════════════
//  SHADOW ANALYSIS — Premium SVG Animated Explainer
//  Multi-step visual tutorial on shadow impact on solar panels
// ═══════════════════════════════════════════════════════════
import React, { useState, useEffect, useRef } from 'react';

const STEPS = [
  {
    id: 'sun_path', title: 'Sun Path & Shadow Tracking', color: '#fbbf24', glow: 'rgba(251,191,36,0.4)',
    desc: 'The sun moves across the sky from East to West. Shadows shift throughout the day — you MUST check at 9AM, 12PM, and 3PM to ensure panels stay shadow-free.',
    fact: 'India receives 4-7 kWh/m\u00B2/day of solar radiation — one of the best in the world! But even a small shadow can ruin output.',
    quiz: null,
  },
  {
    id: 'cell_impact', title: 'How Shadow Kills Output', color: '#ef4444', glow: 'rgba(239,68,68,0.4)',
    desc: 'Solar cells are wired in SERIES — like a chain. When shade falls on even ONE cell, it acts as a resistor and blocks current flow for the ENTIRE string. Output drops 30-50%!',
    fact: 'Bypass diodes help, but can only skip small sections. A shadow on 5% of the panel can still cause 25% power loss!',
    quiz: { q: 'What happens when shade falls on ONE cell in a series string?', opts: ['Only that cell loses power', 'Entire string output drops 30-50%', 'Nothing happens'], ans: 1 },
  },
  {
    id: 'shadow_sources', title: 'Common Shadow Sources', color: '#f97316', glow: 'rgba(249,115,22,0.4)',
    desc: 'Watch out for: trees, water tanks, satellite dishes, chimneys, adjacent buildings, and even bird droppings! Minimum 5 hours of UNINTERRUPTED shadow-free sunlight is needed (9AM-3PM).',
    fact: 'A single branch shadow at 2PM can reduce daily output by 20%. Always trim trees and clear obstructions BEFORE installation.',
    quiz: null,
  },
  {
    id: 'radiation_map', title: 'India Solar Radiation', color: '#22c55e', glow: 'rgba(34,197,94,0.4)',
    desc: 'India is blessed with excellent solar radiation. Rajasthan leads with 6-7 kWh/m\u00B2/day, while southern states average 5-6 kWh/m\u00B2/day. Even cloudy regions like Kerala get 4-5 kWh/m\u00B2/day!',
    fact: 'India receives about 5,000 trillion kWh of solar energy per year — enough to power the entire country 500 times over!',
    quiz: { q: 'What is India\'s average daily solar radiation?', opts: ['1-2 kWh/m\u00B2/day', '4-7 kWh/m\u00B2/day', '10-15 kWh/m\u00B2/day'], ans: 1 },
  },
];

function StepSVG({ stepId, color }) {
  if (stepId === 'sun_path') return (
    <svg viewBox="0 0 420 170" className="se-svg">
      {/* Sky gradient */}
      <defs><linearGradient id="sky_sh" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1a3a6a"/><stop offset="100%" stopColor="#87ceeb" stopOpacity="0.3"/></linearGradient></defs>
      <rect x="0" y="0" width="420" height="170" fill="url(#sky_sh)" rx="8"/>
      {/* Sun arc path */}
      <path d="M 40 140 Q 210 -20 380 140" stroke="#fbbf24" strokeWidth="1.5" fill="none" strokeDasharray="6,4" opacity="0.4"/>
      {/* Sun positions: 9AM, 12PM, 3PM */}
      {[{x:80,y:90,t:'9AM'},{x:210,y:20,t:'12PM'},{x:340,y:90,t:'3PM'}].map((s,i) => (
        <g key={i}>
          <circle cx={s.x} cy={s.y} r="18" fill="#fbbf24" opacity="0.9">
            <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" begin={`${i*0.5}s`} repeatCount="indefinite"/>
          </circle>
          <circle cx={s.x} cy={s.y} r="24" fill="none" stroke="#fbbf24" strokeWidth="1" opacity="0.3">
            <animate attributeName="r" values="22;28;22" dur="3s" begin={`${i*0.3}s`} repeatCount="indefinite"/>
          </circle>
          <text x={s.x} y={s.y+35} fill="#fbbf24" fontSize="11" textAnchor="middle" fontWeight="bold">{s.t}</text>
        </g>
      ))}
      {/* House silhouette */}
      <rect x="160" y="120" width="100" height="40" fill="#555" rx="2"/>
      <polygon points="160,120 210,95 260,120" fill="#666"/>
      {/* Solar panel on roof */}
      <rect x="180" y="103" width="60" height="15" fill="#2244aa" stroke="#4488ff" strokeWidth="1" rx="2" transform="rotate(-12,210,110)"/>
      {/* Shadow lines from sun to objects */}
      {[0,1,2].map(i => (
        <line key={i} x1={[80,210,340][i]} y1={[90,20,90][i]} x2="210" y2="110" stroke="#fbbf24" strokeWidth="0.5" opacity="0.2" strokeDasharray="3,3"/>
      ))}
      {/* Ground */}
      <rect x="0" y="155" width="420" height="15" fill="#3a5a2a" rx="0"/>
      <text x="210" y="167" fill="#7cba5a" fontSize="8" textAnchor="middle">Check shadows at 9AM, 12PM, and 3PM</text>
    </svg>
  );

  if (stepId === 'cell_impact') return (
    <svg viewBox="0 0 420 170" className="se-svg">
      <text x="210" y="15" fill="#888" fontSize="9" textAnchor="middle">SERIES-CONNECTED SOLAR CELLS</text>
      {/* Cell chain */}
      {[0,1,2,3,4,5,6,7].map(i => {
        const x = 30 + i * 48, shaded = i === 3;
        return (
          <g key={i}>
            <rect x={x} y="30" width="40" height="55" rx="3" fill={shaded ? 'rgba(239,68,68,0.15)' : 'rgba(96,165,250,0.12)'} stroke={shaded ? '#ef4444' : '#60a5fa'} strokeWidth={shaded ? 2 : 1}/>
            {shaded && <><rect x={x} y="30" width="40" height="25" fill="rgba(0,0,0,0.4)" rx="3"/><text x={x+20} y="47" fill="#ef4444" fontSize="8" textAnchor="middle">SHADE</text></>}
            {!shaded && <text x={x+20} y="62" fill="#60a5fa" fontSize="8" textAnchor="middle">{`${100}%`}</text>}
            {shaded && <text x={x+20} y="75" fill="#ef4444" fontSize="9" textAnchor="middle" fontWeight="bold">BLOCKED</text>}
            {i < 7 && <line x1={x+42} y1="57" x2={x+46} y2="57" stroke={i >= 3 ? '#ef4444' : '#60a5fa'} strokeWidth="2"/>}
          </g>
        );
      })}
      {/* Current flow arrow */}
      <line x1="30" y1="100" x2="190" y2="100" stroke="#22c55e" strokeWidth="2.5" markerEnd="url(#arrowG)">
        <animate attributeName="x2" values="30;190;30" dur="3s" repeatCount="indefinite"/>
      </line>
      <line x1="200" y1="100" x2="400" y2="100" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="5,5" opacity="0.5"/>
      <defs><marker id="arrowG" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#22c55e"/></marker></defs>
      <text x="110" y="118" fill="#22c55e" fontSize="10" textAnchor="middle" fontWeight="bold">Current flows...</text>
      <text x="300" y="118" fill="#ef4444" fontSize="10" textAnchor="middle" fontWeight="bold">...BLOCKED! -50%</text>
      {/* Output comparison */}
      <rect x="40" y="130" width="150" height="18" rx="9" fill="rgba(34,197,94,0.15)" stroke="#22c55e" strokeWidth="1"/>
      <rect x="40" y="130" width="150" height="18" rx="9" fill="#22c55e" opacity="0.6">
        <animate attributeName="width" values="150;150;150" dur="2s" repeatCount="indefinite"/>
      </rect>
      <text x="115" y="143" fill="#fff" fontSize="9" textAnchor="middle" fontWeight="bold">No Shadow: 100%</text>
      <rect x="230" y="130" width="150" height="18" rx="9" fill="rgba(239,68,68,0.15)" stroke="#ef4444" strokeWidth="1"/>
      <rect x="230" y="130" width="75" height="18" rx="9" fill="#ef4444" opacity="0.6">
        <animate attributeName="width" values="150;75;75" dur="2s" repeatCount="indefinite"/>
      </rect>
      <text x="305" y="143" fill="#fff" fontSize="9" textAnchor="middle" fontWeight="bold">With Shadow: 50%</text>
      <text x="210" y="163" fill="#f97316" fontSize="9" textAnchor="middle">ONE shaded cell = ENTIRE string drops!</text>
    </svg>
  );

  if (stepId === 'shadow_sources') return (
    <svg viewBox="0 0 420 170" className="se-svg">
      <text x="210" y="15" fill="#888" fontSize="9" textAnchor="middle">COMMON SHADOW SOURCES TO AVOID</text>
      {/* House with panel */}
      <rect x="150" y="90" width="120" height="60" fill="#555" rx="2"/>
      <polygon points="150,90 210,60 270,90" fill="#666"/>
      <rect x="170" y="70" width="80" height="18" fill="#2244aa" stroke="#4488ff" strokeWidth="1" rx="2"/>
      {/* Shadow sources */}
      {/* Tree */}
      <circle cx="60" cy="60" r="25" fill="#2d5a2d" opacity="0.8"/>
      <rect x="56" y="80" width="8" height="40" fill="#5a3a1a"/>
      <line x1="60" y1="60" x2="180" y2="75" stroke="#000" strokeWidth="8" opacity="0.15">
        <animate attributeName="opacity" values="0.05;0.2;0.05" dur="4s" repeatCount="indefinite"/>
      </line>
      <text x="60" y="135" fill="#f97316" fontSize="8" textAnchor="middle">Tree</text>
      {/* Water tank */}
      <rect x="280" y="55" width="30" height="30" rx="3" fill="#777"/>
      <line x1="295" y1="70" x2="230" y2="78" stroke="#000" strokeWidth="6" opacity="0.15">
        <animate attributeName="opacity" values="0.05;0.2;0.05" dur="3.5s" repeatCount="indefinite"/>
      </line>
      <text x="295" y="100" fill="#f97316" fontSize="8" textAnchor="middle">Tank</text>
      {/* Building */}
      <rect x="350" y="30" width="50" height="120" fill="#444" rx="2"/>
      <line x1="350" y1="60" x2="260" y2="78" stroke="#000" strokeWidth="15" opacity="0.1">
        <animate attributeName="opacity" values="0.05;0.15;0.05" dur="5s" repeatCount="indefinite"/>
      </line>
      <text x="375" y="165" fill="#f97316" fontSize="8" textAnchor="middle">Building</text>
      {/* Dish */}
      <circle cx="130" cy="40" r="12" fill="none" stroke="#999" strokeWidth="2"/>
      <line x1="130" y1="52" x2="130" y2="65" stroke="#999" strokeWidth="2"/>
      <text x="130" y="80" fill="#f97316" fontSize="8" textAnchor="middle">Dish</text>
      {/* 5-hour requirement */}
      <rect x="80" y="148" width="260" height="18" rx="9" fill="rgba(34,197,94,0.12)" stroke="#22c55e" strokeWidth="1"/>
      <text x="210" y="161" fill="#22c55e" fontSize="9" textAnchor="middle" fontWeight="bold">Minimum 5 hours shadow-free (9AM - 3PM)</text>
    </svg>
  );

  if (stepId === 'radiation_map') return (
    <svg viewBox="0 0 420 170" className="se-svg">
      <text x="210" y="15" fill="#888" fontSize="9" textAnchor="middle">INDIA SOLAR RADIATION MAP (kWh/m\u00B2/day)</text>
      {/* Simplified India map outline */}
      <path d="M 180 25 L 220 25 L 240 40 L 250 60 L 240 80 L 250 100 L 235 120 L 220 140 L 210 155 L 200 140 L 190 120 L 175 100 L 165 80 L 170 60 L 175 40 Z" fill="rgba(34,197,94,0.08)" stroke="#22c55e" strokeWidth="1.5"/>
      {/* Rajasthan - high */}
      <circle cx="185" cy="55" r="12" fill="rgba(239,68,68,0.3)" stroke="#ef4444" strokeWidth="1">
        <animate attributeName="r" values="10;14;10" dur="3s" repeatCount="indefinite"/>
      </circle>
      <text x="185" y="58" fill="#ef4444" fontSize="7" textAnchor="middle" fontWeight="bold">6-7</text>
      <text x="145" y="55" fill="#ef4444" fontSize="7" textAnchor="end">Rajasthan</text>
      {/* Delhi */}
      <circle cx="200" cy="45" r="6" fill="rgba(245,158,11,0.3)"/><text x="200" y="48" fill="#f59e0b" fontSize="6" textAnchor="middle">5.5</text>
      <text x="220" y="42" fill="#f59e0b" fontSize="7">Delhi</text>
      {/* Mumbai */}
      <circle cx="178" cy="90" r="6" fill="rgba(245,158,11,0.3)"/><text x="178" y="93" fill="#f59e0b" fontSize="6" textAnchor="middle">5.2</text>
      <text x="150" y="93" fill="#f59e0b" fontSize="7" textAnchor="end">Mumbai</text>
      {/* Chennai */}
      <circle cx="215" cy="120" r="6" fill="rgba(34,197,94,0.3)"/><text x="215" y="123" fill="#22c55e" fontSize="6" textAnchor="middle">5.5</text>
      <text x="240" y="123" fill="#22c55e" fontSize="7">Chennai</text>
      {/* Kerala */}
      <circle cx="200" cy="140" r="6" fill="rgba(96,165,250,0.3)"/><text x="200" y="143" fill="#60a5fa" fontSize="6" textAnchor="middle">4.5</text>
      <text x="175" y="143" fill="#60a5fa" fontSize="7" textAnchor="end">Kerala</text>
      {/* Legend */}
      <rect x="300" y="30" width="100" height="120" rx="6" fill="rgba(0,0,0,0.3)" stroke="#333" strokeWidth="1"/>
      <text x="350" y="48" fill="#fff" fontSize="9" textAnchor="middle" fontWeight="bold">Radiation</text>
      {[{c:'#ef4444',t:'6-7 Excellent',y:65},{c:'#f59e0b',t:'5-6 Very Good',y:82},{c:'#22c55e',t:'4-5 Good',y:99},{c:'#60a5fa',t:'3-4 Moderate',y:116}].map((l,i) => (
        <g key={i}><circle cx="315" cy={l.y-3} r="5" fill={l.c} opacity="0.6"/><text x="325" y={l.y} fill={l.c} fontSize="8">{l.t}</text></g>
      ))}
      <text x="210" y="165" fill="#22c55e" fontSize="9" textAnchor="middle" fontWeight="bold">India = 5,000 trillion kWh/year solar potential!</text>
    </svg>
  );

  return null;
}

export default function ShadowExplainer({ onComplete }) {
  const [step, setStep] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState(null);
  const [animClass, setAnimClass] = useState('se-enter');
  const current = STEPS[step];

  useEffect(() => {
    setAnimClass('se-enter');
    setQuizAnswer(null);
    const t = setTimeout(() => setAnimClass('se-active'), 50);
    return () => clearTimeout(t);
  }, [step]);

  const advance = () => {
    if (step < STEPS.length - 1) {
      setAnimClass('se-exit');
      setTimeout(() => setStep(s => s + 1), 300);
    } else {
      onComplete?.();
    }
  };

  const handleQuiz = (idx) => {
    setQuizAnswer(idx);
  };

  return (
    <div className="se-overlay">
      <div className={`se-card ${animClass}`} style={{ borderColor: current.color + '44' }}>
        {/* Progress */}
        <div className="se-progress">
          {STEPS.map((s, i) => (
            <div key={i} className={`se-dot ${i === step ? 'active' : i < step ? 'done' : ''}`} style={{ background: i <= step ? current.color : '#333' }}/>
          ))}
        </div>
        {/* Step count */}
        <div className="se-step-count" style={{ color: current.color }}>Step {step + 1} of {STEPS.length}</div>
        {/* Title */}
        <div className="se-title" style={{ color: current.color }}>{current.title}</div>
        {/* SVG Animation */}
        <StepSVG stepId={current.id} color={current.color}/>
        {/* Description */}
        <div className="se-desc">{current.desc}</div>
        {/* Fun fact */}
        <div className="se-fact" style={{ borderLeftColor: current.color }}>
          <span style={{ color: current.color }}>Did you know?</span> {current.fact}
        </div>
        {/* Quiz */}
        {current.quiz && (
          <div className="se-quiz">
            <div className="se-quiz-q">{current.quiz.q}</div>
            <div className="se-quiz-opts">
              {current.quiz.opts.map((opt, i) => (
                <button key={i} className={`se-quiz-btn ${quizAnswer !== null ? (i === current.quiz.ans ? 'correct' : quizAnswer === i ? 'wrong' : '') : ''}`} onClick={() => handleQuiz(i)} disabled={quizAnswer !== null}>
                  {opt}
                </button>
              ))}
            </div>
            {quizAnswer !== null && (
              <div className={`se-quiz-fb ${quizAnswer === current.quiz.ans ? 'correct' : 'wrong'}`}>
                {quizAnswer === current.quiz.ans ? '\u2705 Correct!' : `\u274C The answer is: ${current.quiz.opts[current.quiz.ans]}`}
              </div>
            )}
          </div>
        )}
        {/* Next button */}
        <button className="se-next" style={{ background: current.color }} onClick={advance} disabled={current.quiz && quizAnswer === null}>
          {step < STEPS.length - 1 ? 'Next \u2192' : 'Complete \u2714'}
        </button>
      </div>
    </div>
  );
}
