// ═══════════════════════════════════════════════════════════
//  ROOF LOAD — Premium SVG Animated Explainer
//  Visual tutorial on roof strength and solar panel weight
// ═══════════════════════════════════════════════════════════
import React, { useState, useEffect } from 'react';

const STEPS = [
  {
    id: 'panel_weight', title: 'Panel Weight Breakdown', color: '#60a5fa', glow: 'rgba(96,165,250,0.4)',
    desc: 'Each solar panel weighs 20-22 kg. With the aluminum/GI mounting frame, the load comes to 15-18 kg per square meter on your roof. A 5kW system uses about 15-16 panels.',
    fact: 'A single 330W panel weighs about the same as a medium suitcase (20 kg). The mounting structure adds just 5-8 kg/m\u00B2!',
    quiz: null,
  },
  {
    id: 'rcc_capacity', title: 'RCC Roof Strength', color: '#22c55e', glow: 'rgba(34,197,94,0.4)',
    desc: 'Indian RCC (Reinforced Cement Concrete) roofs are incredibly strong! They can handle 150+ kg/m\u00B2 of load. Solar panels at 15-18 kg/m\u00B2 use only about 10-12% of the roof\'s capacity. Perfectly safe!',
    fact: 'RCC roofs are designed to withstand loads of people, water tanks (500-1000L = 500-1000 kg), and more. Solar panels are featherweight in comparison!',
    quiz: { q: 'How much load can an RCC roof handle?', opts: ['20-30 kg/m\u00B2', '150+ kg/m\u00B2', '500+ kg/m\u00B2'], ans: 1 },
  },
  {
    id: 'space_needed', title: 'Space Requirements', color: '#f59e0b', glow: 'rgba(245,158,11,0.4)',
    desc: 'A 5kW system needs approximately 50 sq.m (500 sq.ft) of shadow-free roof space. Each 330W panel takes about 1.7 sq.m (2m x 0.85m). Plan your layout to avoid water tanks, chimneys, and AC units.',
    fact: 'An average Indian rooftop is 100-150 sq.m. A 5kW system uses only 33-50% of the total area, leaving plenty of room!',
    quiz: null,
  },
  {
    id: 'mounting_frame', title: 'GI Mounting Frame', color: '#a78bfa', glow: 'rgba(167,139,250,0.4)',
    desc: 'Hot-dip Galvanized Iron (GI) mounting frames last 25+ years without rusting. The frame is bolted into the roof with chemical anchors. Wind load rating: 150 km/h (IS 875 standard). No drilling through waterproof membrane!',
    fact: 'GI mounting frames can survive cyclone-level winds (150 km/h). The IS 875 standard ensures they\'re tested for Indian weather conditions!',
    quiz: { q: 'How long does a GI mounting frame last?', opts: ['5-8 years', '10-15 years', '25+ years'], ans: 2 },
  },
];

function StepSVG({ stepId, color }) {
  if (stepId === 'panel_weight') return (
    <svg viewBox="0 0 420 170" className="se-svg">
      <text x="210" y="15" fill="#888" fontSize="9" textAnchor="middle">SOLAR PANEL WEIGHT BREAKDOWN</text>
      {/* Panel illustration */}
      <rect x="130" y="30" width="160" height="70" rx="4" fill="rgba(96,165,250,0.1)" stroke="#60a5fa" strokeWidth="2"/>
      {[0,1,2,3,4,5].map(i=><line key={i} x1={130+i*32} y1="30" x2={130+i*32} y2="100" stroke="#60a5fa" strokeWidth="0.5" opacity="0.3"/>)}
      {[0,1,2].map(i=><line key={i} x1="130" y1={30+i*35} x2="290" y2={30+i*35} stroke="#60a5fa" strokeWidth="0.5" opacity="0.3"/>)}
      <text x="210" y="70" fill="#60a5fa" fontSize="14" textAnchor="middle" fontWeight="bold">330W Panel</text>
      {/* Weight indicator */}
      <rect x="50" y="115" width="320" height="30" rx="6" fill="rgba(0,0,0,0.3)"/>
      {[{l:'Panel',w:110,c:'#60a5fa',v:'20-22 kg'},{l:'Mount',w:60,c:'#a78bfa',v:'+8 kg'},{l:'Total/m\u00B2',w:80,c:'#f59e0b',v:'15-18 kg'}].map((b,i)=>{
        const x=60+i*110;
        return <g key={i}>
          <rect x={x} y="118" width={b.w} height="24" rx="4" fill={b.c} opacity="0.3"/>
          <text x={x+b.w/2} y="134" fill={b.c} fontSize="9" textAnchor="middle" fontWeight="bold">{b.l}: {b.v}</text>
        </g>;
      })}
      <text x="210" y="162" fill="#aaa" fontSize="9" textAnchor="middle">Lightweight! Only 10-12% of roof capacity</text>
    </svg>
  );

  if (stepId === 'rcc_capacity') return (
    <svg viewBox="0 0 420 170" className="se-svg">
      <text x="210" y="15" fill="#888" fontSize="9" textAnchor="middle">RCC ROOF LOAD CAPACITY</text>
      {/* Capacity bar */}
      <rect x="60" y="30" width="300" height="35" rx="8" fill="rgba(255,255,255,0.05)" stroke="#333" strokeWidth="1"/>
      <rect x="60" y="30" width="300" height="35" rx="8" fill="rgba(34,197,94,0.1)"/>
      {/* Solar load portion */}
      <rect x="60" y="30" width={300*(18/150)} height="35" rx="8" fill="#22c55e" opacity="0.6">
        <animate attributeName="width" from="0" to={300*(18/150)} dur="1.5s" fill="freeze"/>
      </rect>
      <text x="60+20" y="52" fill="#fff" fontSize="10" fontWeight="bold">Solar: 18 kg/m\u00B2</text>
      <text x="350" y="52" fill="#22c55e" fontSize="10" fontWeight="bold">150+ kg/m\u00B2 capacity</text>
      {/* Visual comparison */}
      {[{l:'Solar Panels',v:18,c:'#60a5fa',y:85},{l:'Water Tank',v:100,c:'#f59e0b',y:110},{l:'People Standing',v:50,c:'#a78bfa',y:135}].map((item,i)=>(
        <g key={i}>
          <text x="60" y={item.y} fill="#aaa" fontSize="9">{item.l}</text>
          <rect x="160" y={item.y-10} width={200} height="14" rx="7" fill="rgba(255,255,255,0.03)"/>
          <rect x="160" y={item.y-10} width={200*(item.v/150)} height="14" rx="7" fill={item.c} opacity="0.5">
            <animate attributeName="width" from="0" to={200*(item.v/150)} dur="1s" begin={`${i*0.2}s`} fill="freeze"/>
          </rect>
          <text x={165+200*(item.v/150)} y={item.y} fill={item.c} fontSize="8" fontWeight="bold">{item.v} kg/m\u00B2</text>
        </g>
      ))}
      <text x="210" y="163" fill="#22c55e" fontSize="10" textAnchor="middle" fontWeight="bold">{'\u2705'} Solar uses only 12% of capacity!</text>
    </svg>
  );

  if (stepId === 'space_needed') return (
    <svg viewBox="0 0 420 170" className="se-svg">
      <text x="210" y="15" fill="#888" fontSize="9" textAnchor="middle">ROOF SPACE REQUIREMENT (5kW SYSTEM)</text>
      {/* Roof outline */}
      <rect x="60" y="30" width="300" height="120" rx="4" fill="rgba(245,158,11,0.05)" stroke="#f59e0b" strokeWidth="1" strokeDasharray="4,4"/>
      <text x="310" y="28" fill="#888" fontSize="8">~100 m\u00B2 typical roof</text>
      {/* Solar area */}
      <rect x="70" y="40" width="150" height="100" rx="3" fill="rgba(96,165,250,0.15)" stroke="#60a5fa" strokeWidth="1.5">
        <animate attributeName="opacity" values="0.8;1;0.8" dur="3s" repeatCount="indefinite"/>
      </rect>
      {/* Panel grid inside */}
      {[0,1,2,3,4].map(r=>[0,1,2].map(c=>(
        <rect key={`${r}-${c}`} x={75+c*48} y={45+r*18} width="44" height="15" rx="2" fill="rgba(96,165,250,0.3)" stroke="#60a5fa" strokeWidth="0.5"/>
      )))}
      <text x="145" y="150" fill="#60a5fa" fontSize="10" textAnchor="middle" fontWeight="bold">50 m\u00B2 (15 panels)</text>
      {/* Free area */}
      <text x="295" y="90" fill="#666" fontSize="10" textAnchor="middle">Free Area</text>
      <text x="295" y="105" fill="#888" fontSize="8" textAnchor="middle">~50 m\u00B2 remaining</text>
    </svg>
  );

  if (stepId === 'mounting_frame') return (
    <svg viewBox="0 0 420 170" className="se-svg">
      <text x="210" y="15" fill="#888" fontSize="9" textAnchor="middle">GI MOUNTING FRAME DURABILITY</text>
      {/* Frame structure */}
      <rect x="100" y="60" width="220" height="8" rx="2" fill="#a78bfa" opacity="0.7"/>
      <rect x="100" y="90" width="220" height="8" rx="2" fill="#a78bfa" opacity="0.7"/>
      {[0,1,2,3].map(i=><rect key={i} x={120+i*55} y="58" width="6" height="42" rx="1" fill="#a78bfa" opacity="0.5"/>)}
      {/* Panel on frame */}
      <rect x="100" y="40" width="220" height="18" rx="3" fill="rgba(96,165,250,0.2)" stroke="#60a5fa" strokeWidth="1"/>
      <text x="210" y="53" fill="#60a5fa" fontSize="9" textAnchor="middle">Solar Panel</text>
      {/* Durability specs */}
      {[
        {icon:'\u{1F4AA}', t:'Wind rating: 150 km/h', c:'#22c55e', y:120},
        {icon:'\u{1F6E1}', t:'Anti-rust: Hot-dip galvanized', c:'#f59e0b', y:138},
        {icon:'\u23F3', t:'Lifespan: 25+ years', c:'#a78bfa', y:156},
      ].map((s,i)=>(
        <g key={i}>
          <text x="100" y={s.y} fill={s.c} fontSize="11">{s.icon} {s.t}</text>
        </g>
      ))}
    </svg>
  );

  return null;
}

export default function RoofLoadExplainer({ onComplete }) {
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

  return (
    <div className="se-overlay">
      <div className={`se-card ${animClass}`} style={{ borderColor: current.color + '44' }}>
        <div className="se-progress">
          {STEPS.map((s, i) => (
            <div key={i} className={`se-dot ${i === step ? 'active' : i < step ? 'done' : ''}`} style={{ background: i <= step ? current.color : '#333' }}/>
          ))}
        </div>
        <div className="se-step-count" style={{ color: current.color }}>Step {step + 1} of {STEPS.length}</div>
        <div className="se-title" style={{ color: current.color }}>{'\uD83C\uDFD7\uFE0F'} {current.title}</div>
        <StepSVG stepId={current.id} color={current.color}/>
        <div className="se-desc">{current.desc}</div>
        <div className="se-fact" style={{ borderLeftColor: current.color }}>
          <span style={{ color: current.color }}>Did you know?</span> {current.fact}
        </div>
        {current.quiz && (
          <div className="se-quiz">
            <div className="se-quiz-q">{current.quiz.q}</div>
            <div className="se-quiz-opts">
              {current.quiz.opts.map((opt, i) => (
                <button key={i} className={`se-quiz-btn ${quizAnswer !== null ? (i === current.quiz.ans ? 'correct' : quizAnswer === i ? 'wrong' : '') : ''}`} onClick={() => setQuizAnswer(i)} disabled={quizAnswer !== null}>
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
        <button className="se-next" style={{ background: current.color }} onClick={advance} disabled={current.quiz && quizAnswer === null}>
          {step < STEPS.length - 1 ? 'Next \u2192' : 'Complete \u2714'}
        </button>
      </div>
    </div>
  );
}
