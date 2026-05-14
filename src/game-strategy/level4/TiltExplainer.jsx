// ═══════════════════════════════════════════════════════════
//  TILT ANGLE — Premium SVG Animated Explainer
//  Visual tutorial on panel tilt and orientation
// ═══════════════════════════════════════════════════════════
import React, { useState, useEffect } from 'react';

const STEPS = [
  { id:'direction', title:'Face TRUE SOUTH', color:'#f59e0b',
    desc:'In India (Northern Hemisphere), solar panels must face TRUE SOUTH for maximum sunlight. The sun travels across the southern sky. Facing north loses 30%+ energy! Use a compass or Google Maps to find true south.',
    fact:'True south is slightly different from magnetic south. In India, the magnetic declination is 0-2 degrees, so a compass is accurate enough for solar panels.',
    quiz:{ q:'Which direction should panels face in India?', opts:['North','East','True South'], ans:2 }},
  { id:'tilt_angle', title:'Tilt = Your Latitude', color:'#22c55e',
    desc:'The optimal tilt angle equals your city\'s latitude. Chennai: 13\u00B0, Bangalore: 13\u00B0, Mumbai: 19\u00B0, Delhi: 28\u00B0, Kolkata: 22\u00B0. This ensures panels are perpendicular to the sun\'s rays for maximum energy capture throughout the year.',
    fact:'Every 1\u00B0 wrong tilt = 0.5% energy loss. At 10\u00B0 wrong, you lose 5% — that is Rs.3,000-4,000 per year wasted!' },
  { id:'seasonal', title:'Seasonal Tilt Adjustment', color:'#60a5fa',
    desc:'For even better output, adjust tilt seasonally: Summer (Apr-Sep): Latitude minus 15\u00B0. Winter (Oct-Mar): Latitude plus 15\u00B0. This captures more energy as the sun\'s angle changes. Fixed systems use latitude angle year-round as a good average.',
    fact:'Tracking systems that follow the sun can boost output by 25-35%, but they cost 40% more and need maintenance. Fixed tilt is best for homes.',
    quiz:{ q:'What happens if tilt is 10\u00B0 wrong?', opts:['Nothing','5% energy loss','Panel breaks'], ans:1 }},
  { id:'cities', title:'Indian City Tilt Guide', color:'#a78bfa',
    desc:'Quick reference: Trivandrum 8\u00B0, Chennai/Bangalore 13\u00B0, Hyderabad 17\u00B0, Mumbai 19\u00B0, Pune 18\u00B0, Ahmedabad 23\u00B0, Kolkata 22\u00B0, Lucknow 27\u00B0, Delhi 28\u00B0, Chandigarh 31\u00B0, Srinagar 34\u00B0. Look up your exact latitude for perfect tilt!',
    fact:'India is blessed with 4-7 kWh/m\u00B2/day of solar radiation. Rajasthan and Gujarat get the most (6.5-7 kWh), while NE India gets least (3.5-4.5 kWh).' },
];

function StepSVG({ stepId, color }) {
  if (stepId === 'direction') return (
    <svg viewBox="0 0 440 170" className="se-svg">
      <text x="220" y="15" fill="#888" fontSize="9" textAnchor="middle">PANEL ORIENTATION — TRUE SOUTH</text>
      {/* Compass */}
      <circle cx="120" cy="95" r="55" fill="rgba(255,255,255,0.03)" stroke="#444" strokeWidth="1"/>
      <circle cx="120" cy="95" r="50" fill="none" stroke="#333" strokeWidth="0.5"/>
      <text x="120" y="48" fill="#ef4444" fontSize="12" textAnchor="middle" fontWeight="bold">N</text>
      <text x="120" y="152" fill="#22c55e" fontSize="12" textAnchor="middle" fontWeight="bold">S</text>
      <text x="68" y="99" fill="#888" fontSize="10" textAnchor="middle">W</text>
      <text x="172" y="99" fill="#888" fontSize="10" textAnchor="middle">E</text>
      {/* Arrow pointing south */}
      <line x1="120" y1="75" x2="120" y2="130" stroke="#22c55e" strokeWidth="3"/>
      <polygon points="120,138 114,126 126,126" fill="#22c55e">
        <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite"/>
      </polygon>
      {/* Sun path */}
      <path d="M220,140 Q320,20 420,140" fill="none" stroke="#fbbf24" strokeWidth="2" strokeDasharray="5,3"/>
      <circle cx="320" cy="45" r="15" fill="#fbbf24"><animate attributeName="r" values="13;16;13" dur="3s" repeatCount="indefinite"/></circle>
      <text x="320" y="80" fill="#888" fontSize="8" textAnchor="middle">Sun path (East to West)</text>
      <text x="225" y="150" fill="#aaa" fontSize="8">Sunrise</text>
      <text x="405" y="150" fill="#aaa" fontSize="8">Sunset</text>
      <text x="320" y="120" fill="#22c55e" fontSize="10" textAnchor="middle" fontWeight="bold">Panels face this direction</text>
    </svg>
  );

  if (stepId === 'tilt_angle') return (
    <svg viewBox="0 0 440 170" className="se-svg">
      <text x="220" y="15" fill="#888" fontSize="9" textAnchor="middle">OPTIMAL TILT = LATITUDE ANGLE</text>
      {/* Roof line */}
      <line x1="80" y1="130" x2="360" y2="130" stroke="#666" strokeWidth="2"/>
      {/* Panel at correct tilt */}
      <g transform="translate(180,130) rotate(-20)">
        <rect x="0" y="-8" width="100" height="12" rx="2" fill="rgba(96,165,250,0.3)" stroke="#60a5fa" strokeWidth="2"/>
        {[0,1,2,3].map(i=><line key={i} x1={i*25+5} y1="-8" x2={i*25+5} y2="4" stroke="#60a5fa" strokeWidth="0.5" opacity="0.3"/>)}
        <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite"/>
      </g>
      {/* Tilt angle arc */}
      <path d="M280,130 A30,30 0 0,0 270,108" fill="none" stroke="#f59e0b" strokeWidth="2"/>
      <text x="300" y="120" fill="#f59e0b" fontSize="11" fontWeight="bold">20{'\u00B0'}</text>
      {/* Sun rays */}
      {[0,1,2,3,4].map(i=>(
        <line key={i} x1={160+i*20} y1="30" x2={190+i*12} y2="100" stroke="#fbbf24" strokeWidth="1" opacity="0.4" strokeDasharray="3,3">
          <animate attributeName="opacity" values="0.2;0.6;0.2" dur="2s" begin={`${i*0.2}s`} repeatCount="indefinite"/>
        </line>
      ))}
      <text x="250" y="40" fill="#fbbf24" fontSize="9">Sun rays</text>
      <text x="220" y="160" fill="#22c55e" fontSize="10" textAnchor="middle" fontWeight="bold">Perpendicular = Maximum Energy!</text>
    </svg>
  );

  if (stepId === 'cities') return (
    <svg viewBox="0 0 440 170" className="se-svg">
      <text x="220" y="15" fill="#888" fontSize="9" textAnchor="middle">INDIA TILT ANGLE MAP</text>
      {[
        {city:'Trivandrum',tilt:8,y:155,x:175},
        {city:'Chennai',tilt:13,y:140,x:220},
        {city:'Bangalore',tilt:13,y:138,x:185},
        {city:'Mumbai',tilt:19,y:115,x:145},
        {city:'Hyderabad',tilt:17,y:120,x:200},
        {city:'Kolkata',tilt:22,y:98,x:270},
        {city:'Delhi',tilt:28,y:70,x:195},
        {city:'Chandigarh',tilt:31,y:55,x:190},
      ].map((c,i)=>(
        <g key={i}>
          <circle cx={c.x} cy={c.y} r="4" fill={color} opacity="0.8">
            <animate attributeName="r" values="3;5;3" dur="2s" begin={`${i*0.2}s`} repeatCount="indefinite"/>
          </circle>
          <text x={c.x+8} y={c.y+3} fill="#ccc" fontSize="7">{c.city} ({c.tilt}{'\u00B0'})</text>
        </g>
      ))}
      {/* India outline (simplified) */}
      <path d="M160,35 L210,35 L240,50 L270,70 L280,100 L260,130 L230,150 L200,160 L170,155 L155,140 L140,115 L145,80 L155,55 Z" fill="none" stroke="#444" strokeWidth="1"/>
      {/* Legend */}
      <rect x="310" y="40" width="120" height="110" rx="6" fill="rgba(255,255,255,0.02)" stroke="#333" strokeWidth="0.5"/>
      <text x="370" y="58" fill={color} fontSize="9" textAnchor="middle" fontWeight="bold">Tilt Guide</text>
      <text x="320" y="78" fill="#aaa" fontSize="7">South India: 8-13{'\u00B0'}</text>
      <text x="320" y="95" fill="#aaa" fontSize="7">Central India: 17-23{'\u00B0'}</text>
      <text x="320" y="112" fill="#aaa" fontSize="7">North India: 28-34{'\u00B0'}</text>
      <text x="320" y="135" fill="#f59e0b" fontSize="7">Tilt = Your Latitude!</text>
    </svg>
  );

  return (
    <svg viewBox="0 0 440 140" className="se-svg">
      <rect x="10" y="10" width="420" height="120" rx="8" fill="rgba(255,255,255,0.02)" stroke={color} strokeWidth="0.5"/>
      <text x="220" y="70" fill={color} fontSize="12" textAnchor="middle" fontWeight="bold">Seasonal Tilt Adjustment</text>
      <text x="100" y="100" fill="#fbbf24" fontSize="9" textAnchor="middle">Summer: Lat - 15{'\u00B0'}</text>
      <text x="340" y="100" fill="#60a5fa" fontSize="9" textAnchor="middle">Winter: Lat + 15{'\u00B0'}</text>
    </svg>
  );
}

export default function TiltExplainer({ onComplete }) {
  const [step, setStep] = useState(0);
  const [quizAns, setQuizAns] = useState(null);
  const [animClass, setAnimClass] = useState('se-enter');
  const current = STEPS[step];

  useEffect(() => {
    setAnimClass('se-enter');
    setQuizAns(null);
    const t = setTimeout(() => setAnimClass('se-active'), 50);
    return () => clearTimeout(t);
  }, [step]);

  const advance = () => {
    if (step < STEPS.length - 1) {
      setAnimClass('se-exit');
      setTimeout(() => setStep(s => s + 1), 300);
    } else onComplete?.();
  };

  return (
    <div className="se-overlay">
      <div className={`se-card ${animClass}`} style={{borderColor: current.color + '44'}}>
        <div className="se-progress">
          {STEPS.map((s,i) => (
            <div key={i} className={`se-dot ${i===step?'active':i<step?'done':''}`}
              style={{background: i<=step ? s.color : '#333'}}/>
          ))}
        </div>
        <div className="se-step-count" style={{color:current.color}}>Step {step+1} of {STEPS.length}</div>
        <div className="se-title" style={{color:current.color}}>{current.title}</div>
        <StepSVG stepId={current.id} color={current.color}/>
        <div className="se-desc">{current.desc}</div>
        <div className="se-fact" style={{borderLeftColor:current.color}}>
          <span style={{color:current.color}}>Did you know?</span> {current.fact}
        </div>
        {current.quiz && (
          <div className="se-quiz">
            <div className="se-quiz-q">{current.quiz.q}</div>
            <div className="se-quiz-opts">
              {current.quiz.opts.map((opt,i) => (
                <button key={i} className={`se-quiz-btn ${quizAns!==null?(i===current.quiz.ans?'correct':quizAns===i?'wrong':''):''}` }
                  onClick={()=>setQuizAns(i)} disabled={quizAns!==null}>{opt}</button>
              ))}
            </div>
            {quizAns!==null && (
              <div className={`se-quiz-fb ${quizAns===current.quiz.ans?'correct':'wrong'}`}>
                {quizAns===current.quiz.ans ? 'Correct!' : `Answer: ${current.quiz.opts[current.quiz.ans]}`}
              </div>
            )}
          </div>
        )}
        <button className="se-next" style={{background:current.color}} onClick={advance}
          disabled={current.quiz && quizAns===null}>
          {step < STEPS.length - 1 ? `Next: ${STEPS[step+1].title} \u2192` : 'Complete \u2714'}
        </button>
      </div>
    </div>
  );
}
