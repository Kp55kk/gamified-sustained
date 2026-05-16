// ═══════════════════════════════════════════════════════════
//  BATTERY & ENERGY STORAGE — Premium Fullscreen Animated Tutorial
//  Multi-step SVG animated education covering battery tech, sizing, daily cycle
// ═══════════════════════════════════════════════════════════
import React, { useState, useEffect } from 'react';

const STEPS = [
  {
    id: 'comparison', title: 'Modern vs Old Battery', color: '#22c55e', glow: 'rgba(34,197,94,0.4)',
    desc: 'Modern Lithium batteries are the BEST for solar! They cost a bit more but last 3 times longer and give you 90% of stored power. Old-style batteries only last 3-5 years and give just 50% power.',
    fact: 'A Modern Lithium battery lasts 10-15 years. An old-style battery needs replacing every 3-5 years, so the modern one actually saves more money!',
    quiz: { q: 'Which battery is best for a solar home?', opts: ['Old-style (cheapest)', 'Modern Lithium (best value)', 'Car battery'], ans: 1 },
  },
  {
    id: 'sizing', title: 'How Big Should Your Battery Be?', color: '#f59e0b', glow: 'rgba(245,158,11,0.4)',
    desc: 'At night (12 hours), your home uses: LED bulbs + Fans + Fridge + WiFi + Phone charging + TV = about 4,240 Watt-hours. So you need a battery that can store at least 5,000 Watt-hours (5 units)!',
    fact: 'A 5-unit Modern Lithium battery is only the size of a small suitcase (35 kg). An old-style battery for the same power would weigh 120 kg!',
    quiz: null,
  },
  {
    id: 'daily_cycle', title: 'How the Battery Works All Day', color: '#a78bfa', glow: 'rgba(167,139,250,0.4)',
    desc: 'Morning: Solar starts, battery begins filling up. Noon: Battery is FULL + house runs on solar + extra power goes to the grid. Evening: No sunlight, so the battery powers your home. Night: Battery + a little grid power.',
    fact: 'In the evening (6-10 PM), grid electricity costs the most. But battery power is basically FREE because the sun already charged it during the day!',
    quiz: { q: 'When does the battery save you the most money?', opts: ['Morning (6-9 AM)', 'Evening (6-10 PM)', 'Midnight'], ans: 1 },
  },
  {
    id: 'grid_independence', title: 'Freedom from Power Cuts!', color: '#3b82f6', glow: 'rgba(59,130,246,0.4)',
    desc: 'Without solar: You depend 100% on outside power (grid). With solar only: 65% of your power comes from the sun. With solar + battery (BEST!): 90-95% of power is your own! You barely need the grid at all!',
    fact: 'Many areas in India have 68 hours of power cuts every month. With solar + battery, power cuts don\'t affect you at all!',
    quiz: null,
  },
  {
    id: 'cost_savings', title: 'Battery Savings Over Time', color: '#ec4899', glow: 'rgba(236,72,153,0.4)',
    desc: 'A 5-unit battery costs about Rs.2-3 Lakh. But it saves Rs.2,000-3,000 every month on electricity! In 5-6 years, it pays for itself. After that, you save Rs.3-4 Lakh over its lifetime. Plus: no power cuts ever!',
    fact: 'One Modern Lithium battery replaces 3-4 old-style batteries over its lifetime. That means less waste for our planet!',
    quiz: { q: 'How much can a battery save you every month?', opts: ['Rs.100-200', 'Rs.2,000-3,000', 'Rs.20,000+'], ans: 1 },
  },
];

function StepSVG({ stepId, color }) {
  if (stepId === 'comparison') return (
    <svg viewBox="0 0 420 180" className="se-svg">
      <text x="210" y="15" fill="#888" fontSize="9" textAnchor="middle">BATTERY TECHNOLOGY COMPARISON</text>
      {/* LiFePO4 column */}
      <rect x="30" y="25" width="170" height="145" rx="8" fill="rgba(34,197,94,0.06)" stroke="#22c55e" strokeWidth="1.5"/>
      <text x="115" y="43" fill="#22c55e" fontSize="11" textAnchor="middle" fontWeight="bold">Modern Lithium</text>
      <text x="115" y="58" fill="#22c55e" fontSize="8" textAnchor="middle">Best Choice!</text>
      {/* LiFePO4 bars */}
      {[{l:'Cost',v:70,c:'#f59e0b',t:'\u20B940-60K/kWh',y:72},{l:'Life',v:95,c:'#22c55e',t:'10-15 years',y:92},{l:'Cycles',v:90,c:'#3b82f6',t:'6000+',y:112},{l:'Usable',v:90,c:'#a78bfa',t:'90%',y:132},{l:'Weight',v:30,c:'#ec4899',t:'Light!',y:152}].map((b,i) => (
        <g key={i}>
          <text x="40" y={b.y} fill="#aaa" fontSize="8">{b.l}</text>
          <rect x="75" y={b.y-8} width="100" height="10" rx="5" fill="rgba(255,255,255,0.05)"/>
          <rect x="75" y={b.y-8} width={b.v} height="10" rx="5" fill={b.c} opacity="0.7">
            <animate attributeName="width" from="0" to={b.v} dur="1s" begin={`${i*0.15}s`} fill="freeze"/>
          </rect>
          <text x="180" y={b.y} fill={b.c} fontSize="7">{b.t}</text>
        </g>
      ))}
      {/* Lead-Acid column */}
      <rect x="220" y="25" width="170" height="145" rx="8" fill="rgba(239,68,68,0.06)" stroke="#ef4444" strokeWidth="1.5"/>
      <text x="305" y="43" fill="#ef4444" fontSize="11" textAnchor="middle" fontWeight="bold">Old-Style</text>
      <text x="305" y="58" fill="#ef4444" fontSize="8" textAnchor="middle">Not Recommended</text>
      {[{l:'Cost',v:30,c:'#22c55e',t:'\u20B910-15K/kWh',y:72},{l:'Life',v:25,c:'#ef4444',t:'3-5 years',y:92},{l:'Cycles',v:15,c:'#ef4444',t:'500-800',y:112},{l:'Usable',v:50,c:'#f59e0b',t:'50%',y:132},{l:'Weight',v:90,c:'#ef4444',t:'Heavy!',y:152}].map((b,i) => (
        <g key={i}>
          <text x="230" y={b.y} fill="#aaa" fontSize="8">{b.l}</text>
          <rect x="265" y={b.y-8} width="100" height="10" rx="5" fill="rgba(255,255,255,0.05)"/>
          <rect x="265" y={b.y-8} width={b.v} height="10" rx="5" fill={b.c} opacity="0.7">
            <animate attributeName="width" from="0" to={b.v} dur="1s" begin={`${i*0.15}s`} fill="freeze"/>
          </rect>
          <text x="370" y={b.y} fill={b.c} fontSize="7">{b.t}</text>
        </g>
      ))}
    </svg>
  );

  if (stepId === 'sizing') return (
    <svg viewBox="0 0 420 180" className="se-svg">
      <text x="210" y="15" fill="#888" fontSize="9" textAnchor="middle">NIGHT-TIME LOAD CALCULATION (12 HOURS)</text>
      {/* Appliance breakdown bars */}
      {[
        {n:'Fridge',w:1800,c:'#60a5fa',icon:'\uD83E\uDDCA'}, {n:'Fans (3x)',w:1260,c:'#22c55e',icon:'\uD83C\uDF2C\uFE0F'},
        {n:'LED Bulbs',w:600,c:'#fbbf24',icon:'\uD83D\uDCA1'}, {n:'TV',w:300,c:'#a78bfa',icon:'\uD83D\uDCFA'},
        {n:'WiFi Router',w:180,c:'#f97316',icon:'\uD83C\uDF10'}, {n:'Phone',w:100,c:'#ec4899',icon:'\uD83D\uDCF1'},
      ].map((a, i) => {
        const maxW = 1800, barW = (a.w / maxW) * 200;
        const y = 28 + i * 22;
        return (
          <g key={i}>
            <text x="15" y={y+12} fill="#ddd" fontSize="9">{a.icon} {a.n}</text>
            <rect x="120" y={y+2} width="200" height="14" rx="7" fill="rgba(255,255,255,0.05)"/>
            <rect x="120" y={y+2} width={barW} height="14" rx="7" fill={a.c} opacity="0.7">
              <animate attributeName="width" from="0" to={barW} dur="0.8s" begin={`${i*0.12}s`} fill="freeze"/>
            </rect>
            <text x={125+barW} y={y+13} fill={a.c} fontSize="8" fontWeight="bold">{a.w} Wh</text>
          </g>
        );
      })}
      {/* Total */}
      <line x1="30" y1="162" x2="390" y2="162" stroke="#444" strokeWidth="1"/>
      <rect x="120" y="164" width="200" height="14" rx="7" fill="rgba(245,158,11,0.15)" stroke="#f59e0b" strokeWidth="1"/>
      <text x="15" y="175" fill="#f59e0b" fontSize="10" fontWeight="bold">TOTAL</text>
      <text x="220" y="175" fill="#f59e0b" fontSize="10" textAnchor="middle" fontWeight="bold">4,240 Wh = 4.24 kWh</text>
      <text x="350" y="175" fill="#22c55e" fontSize="9" fontWeight="bold">\u2192 5 kWh recommended</text>
    </svg>
  );

  if (stepId === 'daily_cycle') return (
    <svg viewBox="0 0 420 180" className="se-svg">
      <text x="210" y="12" fill="#888" fontSize="9" textAnchor="middle">24-HOUR SOLAR + BATTERY CYCLE</text>
      {/* Timeline bar */}
      <rect x="20" y="25" width="380" height="6" rx="3" fill="#222"/>
      {/* Time segments */}
      {[
        {x:20,w:48,c:'#334',l:'12AM',h:'Sleep'},
        {x:68,w:47,c:'#553',l:'6AM',h:'Solar Start'},
        {x:115,w:95,c:'#fbbf24',l:'9AM',h:'PEAK SOLAR'},
        {x:210,w:48,c:'#a75',l:'3PM',h:'Solar Drop'},
        {x:258,w:63,c:'#a78bfa',l:'6PM',h:'BATTERY'},
        {x:321,w:79,c:'#335',l:'10PM',h:'Grid+Batt'},
      ].map((s,i) => (
        <g key={i}>
          <rect x={s.x} y="25" width={s.w} height="6" rx="3" fill={s.c} opacity="0.8"/>
          <text x={s.x} y="45" fill="#888" fontSize="7">{s.l}</text>
          <text x={s.x+s.w/2} y="58" fill={typeof s.c === 'string' && s.c.startsWith('#f') ? s.c : '#aaa'} fontSize="7" textAnchor="middle" fontWeight="bold">{s.h}</text>
        </g>
      ))}
      {/* Battery charge level curve */}
      <text x="30" y="78" fill="#22c55e" fontSize="8">Battery Level</text>
      <path d="M 20 140 L 68 140 L 115 120 L 180 80 L 210 75 L 258 80 L 290 110 L 321 130 L 400 140" stroke="#22c55e" strokeWidth="2" fill="none">
        <animate attributeName="strokeDashoffset" from="500" to="0" dur="3s" fill="freeze"/>
      </path>
      {/* Labels */}
      <text x="180" y="73" fill="#22c55e" fontSize="7" textAnchor="middle">100% Full</text>
      <text x="290" y="125" fill="#a78bfa" fontSize="7" textAnchor="middle">Powering home</text>
      {/* Solar output curve */}
      <path d="M 20 160 L 68 160 L 90 150 L 115 120 L 165 90 L 210 85 L 258 120 L 280 150 L 300 160 L 400 160" stroke="#fbbf24" strokeWidth="1.5" fill="none" strokeDasharray="4,3"/>
      <text x="165" y="83" fill="#fbbf24" fontSize="7" textAnchor="middle">\u2600 Solar Output</text>
      {/* Savings callout */}
      <rect x="260" y="85" width="100" height="25" rx="6" fill="rgba(167,139,250,0.15)" stroke="#a78bfa" strokeWidth="1"/>
      <text x="310" y="97" fill="#a78bfa" fontSize="8" textAnchor="middle" fontWeight="bold">Saves \u20B98-12/unit</text>
      <text x="310" y="107" fill="#a78bfa" fontSize="7" textAnchor="middle">vs grid peak rates!</text>
    </svg>
  );

  if (stepId === 'grid_independence') return (
    <svg viewBox="0 0 420 180" className="se-svg">
      <text x="210" y="15" fill="#888" fontSize="9" textAnchor="middle">GRID INDEPENDENCE LEVELS</text>
      {/* Three scenarios */}
      {[
        {l:'No Solar', grid:100, solar:0, batt:0, c:'#ef4444', y:35, status:'100% Grid'},
        {l:'Solar Only', grid:35, solar:65, batt:0, c:'#f59e0b', y:85, status:'65% Self-sufficient'},
        {l:'Solar+Battery', grid:8, solar:55, batt:37, c:'#22c55e', y:135, status:'92% Independent!'},
      ].map((s,i) => (
        <g key={i}>
          <text x="15" y={s.y+12} fill="#ddd" fontSize="9" fontWeight="bold">{s.l}</text>
          <rect x="130" y={s.y} width="250" height="22" rx="11" fill="rgba(255,255,255,0.05)" stroke="#333" strokeWidth="1"/>
          {/* Grid portion */}
          <rect x="130" y={s.y} width={s.grid*2.5} height="22" rx={s.grid===100?11:0} fill="rgba(239,68,68,0.5)">
            <animate attributeName="width" from="250" to={s.grid*2.5} dur="1.2s" begin={`${i*0.3}s`} fill="freeze"/>
          </rect>
          {/* Solar portion */}
          {s.solar > 0 && <rect x={130+s.grid*2.5} y={s.y} width={s.solar*2.5} height="22" fill="rgba(251,191,36,0.5)"/>}
          {/* Battery portion */}
          {s.batt > 0 && <rect x={130+(s.grid+s.solar)*2.5} y={s.y} width={s.batt*2.5} height="22" rx="11" fill="rgba(167,139,250,0.5)"/>}
          <text x="390" y={s.y+15} fill={s.c} fontSize="8" fontWeight="bold">{s.status}</text>
        </g>
      ))}
      {/* Legend */}
      <g transform="translate(130,170)">
        {[{c:'rgba(239,68,68,0.5)',l:'Grid'},{c:'rgba(251,191,36,0.5)',l:'Solar'},{c:'rgba(167,139,250,0.5)',l:'Battery'}].map((l,i) => (
          <g key={i}><rect x={i*80} y="-8" width="12" height="8" rx="2" fill={l.c}/><text x={i*80+16} y={-1} fill="#aaa" fontSize="8">{l.l}</text></g>
        ))}
      </g>
    </svg>
  );

  if (stepId === 'cost_savings') return (
    <svg viewBox="0 0 420 180" className="se-svg">
      <text x="210" y="15" fill="#888" fontSize="9" textAnchor="middle">BATTERY ROI OVER 15 YEARS</text>
      {/* Cost vs Savings timeline */}
      <line x1="50" y1="150" x2="390" y2="150" stroke="#444" strokeWidth="1"/>
      <line x1="50" y1="30" x2="50" y2="150" stroke="#444" strokeWidth="1"/>
      {/* Year labels */}
      {[0,5,10,15].map(y => <text key={y} x={50+y*22.7} y="163" fill="#888" fontSize="8" textAnchor="middle">Yr {y}</text>)}
      {/* Cost line (flat at purchase) */}
      <path d="M 50 50 L 390 50" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4,4" opacity="0.5"/>
      <text x="395" y="53" fill="#ef4444" fontSize="7">Cost: \u20B92-3L</text>
      {/* Savings curve (growing) */}
      <path d="M 50 150 L 100 140 L 150 125 L 200 105 L 250 80 L 300 50 L 350 20 L 390 0" stroke="#22c55e" strokeWidth="2.5" fill="none">
        <animate attributeName="strokeDashoffset" from="500" to="0" dur="2s" fill="freeze"/>
      </path>
      <text x="395" y="5" fill="#22c55e" fontSize="7">Savings</text>
      {/* Break-even point */}
      <circle cx="220" cy="95" r="6" fill="#f59e0b" stroke="#fff" strokeWidth="1.5">
        <animate attributeName="r" values="5;8;5" dur="2s" repeatCount="indefinite"/>
      </circle>
      <text x="220" y="85" fill="#f59e0b" fontSize="8" textAnchor="middle" fontWeight="bold">Break-even!</text>
      <text x="220" y="115" fill="#f59e0b" fontSize="7" textAnchor="middle">~5-6 years</text>
      {/* Net profit area */}
      <rect x="250" y="25" width="120" height="30" rx="6" fill="rgba(34,197,94,0.12)" stroke="#22c55e" strokeWidth="1"/>
      <text x="310" y="38" fill="#22c55e" fontSize="9" textAnchor="middle" fontWeight="bold">Net Profit:</text>
      <text x="310" y="50" fill="#22c55e" fontSize="11" textAnchor="middle" fontWeight="bold">\u20B93-4 Lakh!</text>
      {/* Monthly savings */}
      <rect x="80" y="130" width="120" height="16" rx="4" fill="rgba(167,139,250,0.1)"/>
      <text x="140" y="142" fill="#a78bfa" fontSize="8" textAnchor="middle">Peak savings: \u20B92-3K/month</text>
    </svg>
  );

  return null;
}

export default function BatteryExplainer({ onComplete }) {
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
        <div className="se-title" style={{ color: current.color }}>{'🔋'} {current.title}</div>
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
