// ═══════════════════════════════════════════════════════════
//  PM SURYA GHAR — Premium Fullscreen Animated Explainer
//  8-step educational journey with SVG animations & quizzes
// ═══════════════════════════════════════════════════════════
import React, { useState, useEffect } from 'react';

const STEPS = [
  { id:'intro', title:'What is PM Surya Ghar?', color:'#f59e0b',
    desc:'PM Surya Ghar Muft Bijli Yojana is India\'s largest rooftop solar scheme. The government provides up to Rs.78,000 subsidy to install solar panels on your roof, giving you up to 300 units of FREE electricity every month!',
    fact:'Target: 1 Crore homes by 2027. Budget allocation: Rs.75,021 Crore. This will generate 30 GW of rooftop solar capacity across India!' },
  { id:'eligibility', title:'Who is Eligible?', color:'#3b82f6',
    desc:'Any Indian citizen who owns a residential house with a valid electricity connection (DISCOM) can apply. You must not have received any prior government solar subsidy, and your roof should be shadow-free for 5+ hours/day.',
    fact:'Even if you live in a flat/apartment, you can apply through your RWA (Resident Welfare Association) for the common rooftop area!',
    quiz:{ q:'Can a flat owner apply for PM Surya Ghar?', opts:['No, only individual houses','Yes, through their RWA','Only if ground floor'], ans:1 }},
  { id:'documents', title:'Documents Required', color:'#8b5cf6',
    desc:'You need: Aadhaar/PAN Card, Proof of Address (electricity bill), Latest Electricity Bill showing consumer number, Roof Ownership Certificate, and Bank Account details for direct subsidy transfer.',
    fact:'The entire application is ONLINE at pmsuryaghar.gov.in. No need to visit any government office! Process takes 30-45 days.' },
  { id:'application', title:'6-Step Application Process', color:'#22c55e',
    desc:'1. Register at pmsuryaghar.gov.in  2. Login with consumer number + OTP  3. Submit rooftop solar application  4. DISCOM conducts feasibility survey (7-15 days)  5. Choose MNRE-empanelled vendor for installation  6. After inspection, subsidy deposited to bank!',
    fact:'DISCOM = Distribution Company (like TNEB in Tamil Nadu, BESCOM in Bangalore, TATA Power in Mumbai). Find yours on the portal!',
    quiz:{ q:'How do you apply for PM Surya Ghar?', opts:['Visit local municipality','Online at pmsuryaghar.gov.in','Through nearest bank'], ans:1 }},
  { id:'subsidy', title:'Subsidy Calculator', color:'#f59e0b',
    desc:'Up to 2 kW: Rs.30,000 per kW (max Rs.60,000). For 2-3 kW: Rs.18,000 per additional kW. Maximum subsidy: Rs.78,000 (for 3 kW and above). The subsidy is deposited directly into your bank account within 30-45 days of commissioning!',
    fact:'A 3kW system costs approximately Rs.2.1 Lakh. After Rs.78,000 subsidy, you pay only Rs.1.32 Lakh. This pays back in just 3-4 years!' },
  { id:'savings', title:'Monthly Savings & Benefits', color:'#22c55e',
    desc:'Your monthly electricity bill drops from Rs.3,000-4,000 to just Rs.200-400! You get up to 300 units FREE per month. Surplus power is sold back to DISCOM at Rs.3-4 per unit through net metering. Average monthly savings: Rs.4,000-5,000!',
    fact:'Over 25 years, a 3kW system saves Rs.12-15 Lakh! That is a 400%+ return on your investment — better than Fixed Deposits, Gold, or Stock Market!',
    quiz:{ q:'How much can a 3kW system save over 25 years?', opts:['Rs.2-3 Lakh','Rs.5-7 Lakh','Rs.12-15 Lakh'], ans:2 }},
  { id:'life_change', title:'How Your Life Changes', color:'#60a5fa',
    desc:'Before Solar: Rs.3,500/month bill, power cuts, pollution. After Solar: Rs.200/month bill, 24/7 power (with battery), zero carbon. Your home becomes a mini power plant! You EARN from surplus electricity. Property value increases 3-4%. Your children learn about clean energy.',
    fact:'One solar home prevents 6,150 kg of CO2 per year — equivalent to planting 280 Neem trees! Over 25 years: 153 tonnes of CO2 prevented!' },
  { id:'other_schemes', title:'Related Solar Schemes', color:'#a78bfa',
    desc:'PM-KUSUM: For farmers — solar pumps with 60% subsidy. State Schemes: Many states offer additional 10-20% subsidy on top of central. Green Energy Open Access: For commercial users. Solar Park Scheme: Community-level solar installations.',
    fact:'Tamil Nadu: Additional Rs.10,000-15,000 state subsidy. Gujarat: 40% extra subsidy for Antyodaya families. Check your state portal for combined benefits!',
    quiz:{ q:'What is PM-KUSUM scheme for?', opts:['Urban housing','Farmers — solar pumps','Highway lighting'], ans:1 }},
];

function StepSVG({ stepId, color }) {
  if (stepId === 'intro') return (
    <svg viewBox="0 0 440 180" className="se-svg">
      <defs>
        <linearGradient id="pmg-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#87CEEB"/><stop offset="100%" stopColor="#e0f0ff"/></linearGradient>
        <linearGradient id="pmg-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#f59e0b"/><stop offset="100%" stopColor="#fbbf24"/></linearGradient>
      </defs>
      <rect x="0" y="0" width="440" height="120" fill="url(#pmg-sky)" rx="8"/>
      {/* Sun */}
      <circle cx="380" cy="35" r="22" fill="#fbbf24"><animate attributeName="r" values="22;25;22" dur="3s" repeatCount="indefinite"/></circle>
      {[0,1,2,3,4,5,6,7].map(i=><line key={i} x1={380+Math.cos(i*Math.PI/4)*28} y1={35+Math.sin(i*Math.PI/4)*28} x2={380+Math.cos(i*Math.PI/4)*35} y2={35+Math.sin(i*Math.PI/4)*35} stroke="#fbbf24" strokeWidth="2" opacity="0.6"><animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" begin={`${i*0.25}s`} repeatCount="indefinite"/></line>)}
      {/* House with solar panels */}
      <polygon points="120,80 180,50 240,80" fill="#8B4513"/>
      <rect x="130" y="80" width="100" height="40" fill="#d4a574"/>
      <rect x="160" y="90" width="20" height="30" fill="#5a3a1a"/>
      {/* Solar panels on roof */}
      {[0,1,2].map(i=><rect key={i} x={145+i*25} y={60+i*3} width="20" height="12" rx="1" fill="#1a3a5f" stroke="#3b82f6" strokeWidth="0.5"><animate attributeName="fill" values="#1a3a5f;#2a5a8f;#1a3a5f" dur="3s" begin={`${i*0.3}s`} repeatCount="indefinite"/></rect>)}
      {/* Energy flow arrows */}
      <path d="M220,70 Q260,50 280,70" fill="none" stroke="#fbbf24" strokeWidth="2" strokeDasharray="4,3"><animate attributeName="stroke-dashoffset" values="0;-14" dur="1s" repeatCount="indefinite"/></path>
      {/* Gov building */}
      <rect x="280" y="65" width="60" height="55" fill="#e8dcc8" stroke="#bbb" strokeWidth="0.5"/>
      <polygon points="280,65 310,45 340,65" fill="#8B7355"/>
      {[0,1,2].map(i=><rect key={i} x={288+i*18} y="80" width="10" height="15" fill="#87CEEB" stroke="#666" strokeWidth="0.3"/>)}
      <text x="310" y="112" fill="#333" fontSize="7" textAnchor="middle" fontWeight="bold">GOV</text>
      {/* Bottom info bar */}
      <rect x="0" y="125" width="440" height="55" fill="rgba(10,20,40,0.9)" rx="0 0 8 8"/>
      <text x="20" y="148" fill="#fbbf24" fontSize="14" fontWeight="bold">PM Surya Ghar Muft Bijli Yojana</text>
      <text x="20" y="168" fill="#888" fontSize="10">1 Crore Homes | Rs.78,000 Subsidy | 300 Units FREE/Month</text>
    </svg>
  );

  if (stepId === 'subsidy') return (
    <svg viewBox="0 0 440 180" className="se-svg">
      <text x="220" y="18" fill="#888" fontSize="9" textAnchor="middle">SUBSIDY BREAKDOWN BY SYSTEM SIZE</text>
      {/* Subsidy bars */}
      {[
        {kw:'1 kW', sub:'30,000', total:30, cost:'70,000', y:35, w:80},
        {kw:'2 kW', sub:'60,000', total:60, cost:'1,40,000', y:65, w:160},
        {kw:'3 kW', sub:'78,000', total:78, cost:'2,10,000', y:95, w:208},
        {kw:'5 kW', sub:'78,000', total:78, cost:'3,50,000', y:125, w:208},
      ].map((b,i)=>(
        <g key={i}>
          <text x="15" y={b.y+12} fill="#ccc" fontSize="10" fontWeight="bold">{b.kw}</text>
          <rect x="60" y={b.y} width="300" height="22" rx="4" fill="rgba(255,255,255,0.03)"/>
          <rect x="60" y={b.y} width={b.w} height="22" rx="4" fill={color} opacity="0.7">
            <animate attributeName="width" from="0" to={b.w} dur="1s" begin={`${i*0.15}s`} fill="freeze"/>
          </rect>
          <text x={65+b.w} y={b.y+14} fill={color} fontSize="9" fontWeight="bold"> Rs.{b.sub}</text>
          <text x="365" y={b.y+14} fill="#666" fontSize="8">Cost: Rs.{b.cost}</text>
        </g>
      ))}
      <rect x="60" y="155" width="300" height="20" rx="4" fill="rgba(245,166,35,0.08)" stroke="rgba(245,166,35,0.3)" strokeWidth="1"/>
      <text x="210" y="169" fill="#f59e0b" fontSize="10" textAnchor="middle" fontWeight="bold">Maximum Subsidy Capped at Rs.78,000</text>
    </svg>
  );

  if (stepId === 'savings') return (
    <svg viewBox="0 0 440 180" className="se-svg">
      <text x="220" y="15" fill="#888" fontSize="9" textAnchor="middle">MONTHLY ELECTRICITY BILL: BEFORE vs AFTER SOLAR</text>
      {/* Before bar */}
      <rect x="40" y="30" width="160" height="55" rx="6" fill="rgba(239,68,68,0.1)" stroke="#ef4444" strokeWidth="1"/>
      <text x="120" y="48" fill="#ef4444" fontSize="10" textAnchor="middle" fontWeight="bold">BEFORE Solar</text>
      <text x="120" y="72" fill="#ef4444" fontSize="22" textAnchor="middle" fontWeight="bold">Rs.3,500</text>
      {/* After bar */}
      <rect x="240" y="30" width="160" height="55" rx="6" fill="rgba(34,197,94,0.1)" stroke="#22c55e" strokeWidth="1"/>
      <text x="320" y="48" fill="#22c55e" fontSize="10" textAnchor="middle" fontWeight="bold">AFTER Solar</text>
      <text x="320" y="72" fill="#22c55e" fontSize="22" textAnchor="middle" fontWeight="bold">Rs.200</text>
      {/* Arrow */}
      <text x="212" y="62" fill="#fbbf24" fontSize="18" textAnchor="middle" fontWeight="bold">{'\u2192'}</text>
      {/* 25-year projection */}
      <text x="220" y="105" fill="#888" fontSize="9" textAnchor="middle">25-YEAR CUMULATIVE SAVINGS</text>
      <rect x="40" y="112" width="360" height="16" rx="4" fill="rgba(255,255,255,0.03)"/>
      <rect x="40" y="112" width="0" height="16" rx="4" fill="#22c55e" opacity="0.6">
        <animate attributeName="width" from="0" to="360" dur="2s" fill="freeze"/>
      </rect>
      <text x="220" y="124" fill="#fff" fontSize="9" textAnchor="middle" fontWeight="bold">Rs.12-15 LAKH saved!</text>
      {/* ROI */}
      <text x="120" y="148" fill="#60a5fa" fontSize="10" textAnchor="middle">Payback: 3-4 years</text>
      <text x="320" y="148" fill="#f59e0b" fontSize="10" textAnchor="middle">ROI: 400%+</text>
      <text x="220" y="170" fill="#22c55e" fontSize="11" textAnchor="middle" fontWeight="bold">Better than FD, Gold, or Stock Market!</text>
    </svg>
  );

  if (stepId === 'life_change') return (
    <svg viewBox="0 0 440 180" className="se-svg">
      <text x="220" y="15" fill="#888" fontSize="9" textAnchor="middle">YOUR LIFE: BEFORE vs AFTER SOLAR</text>
      {/* Before column */}
      <rect x="10" y="25" width="200" height="145" rx="6" fill="rgba(239,68,68,0.05)" stroke="rgba(239,68,68,0.2)" strokeWidth="1"/>
      <text x="110" y="42" fill="#ef4444" fontSize="11" textAnchor="middle" fontWeight="bold">BEFORE</text>
      {['Rs.3,500/month bill','Frequent power cuts','Polluting the air','Rising tariffs yearly','Dependent on grid'].map((t,i)=>(
        <text key={i} x="25" y={60+i*22} fill="#e88" fontSize="9">{'\u274C'} {t}</text>
      ))}
      {/* After column */}
      <rect x="230" y="25" width="200" height="145" rx="6" fill="rgba(34,197,94,0.05)" stroke="rgba(34,197,94,0.2)" strokeWidth="1"/>
      <text x="330" y="42" fill="#22c55e" fontSize="11" textAnchor="middle" fontWeight="bold">AFTER</text>
      {['Rs.200/month bill','24/7 power (battery)','Zero carbon footprint','EARN from surplus','Energy independent'].map((t,i)=>(
        <text key={i} x="245" y={60+i*22} fill="#4ade80" fontSize="9">{'\u2705'} {t}</text>
      ))}
      {/* Arrow */}
      <text x="220" y="100" fill="#fbbf24" fontSize="22" textAnchor="middle" fontWeight="bold">{'\u2192'}</text>
    </svg>
  );

  if (stepId === 'application') return (
    <svg viewBox="0 0 440 180" className="se-svg">
      <text x="220" y="15" fill="#888" fontSize="9" textAnchor="middle">6-STEP APPLICATION PROCESS</text>
      {[
        {n:'1', t:'Register Online', c:'#3b82f6'},
        {n:'2', t:'Login + Apply', c:'#8b5cf6'},
        {n:'3', t:'DISCOM Survey', c:'#f59e0b'},
        {n:'4', t:'Choose Vendor', c:'#22c55e'},
        {n:'5', t:'Installation', c:'#ef4444'},
        {n:'6', t:'Get Subsidy!', c:'#fbbf24'},
      ].map((s,i)=>{
        const x = 30 + i*68;
        return (
          <g key={i}>
            <circle cx={x+25} cy="55" r="18" fill={s.c} opacity="0.15" stroke={s.c} strokeWidth="1.5">
              <animate attributeName="r" values="16;19;16" dur="2s" begin={`${i*0.2}s`} repeatCount="indefinite"/>
            </circle>
            <text x={x+25} y="60" fill={s.c} fontSize="14" textAnchor="middle" fontWeight="bold">{s.n}</text>
            <text x={x+25} y="85" fill="#ccc" fontSize="7" textAnchor="middle">{s.t}</text>
            {i < 5 && <line x1={x+45} y1="55" x2={x+60} y2="55" stroke="#444" strokeWidth="1" strokeDasharray="3,2"/>}
          </g>
        );
      })}
      {/* Timeline details */}
      <rect x="20" y="100" width="400" height="70" rx="6" fill="rgba(255,255,255,0.02)"/>
      <text x="30" y="118" fill="#60a5fa" fontSize="9" fontWeight="bold">Website: pmsuryaghar.gov.in</text>
      <text x="30" y="136" fill="#888" fontSize="8">Survey: 7-15 days | Installation: 2-3 days | Subsidy: 30-45 days</text>
      <text x="30" y="154" fill="#f59e0b" fontSize="9" fontWeight="bold">Total time: 45-60 days from application to subsidy in bank!</text>
    </svg>
  );

  // Default: simple info card
  return (
    <svg viewBox="0 0 440 140" className="se-svg">
      <rect x="10" y="10" width="420" height="120" rx="10" fill="rgba(255,255,255,0.02)" stroke={color} strokeWidth="1" opacity="0.3"/>
      <circle cx="50" cy="70" r="25" fill={color} opacity="0.15"/>
      <text x="50" y="76" fill={color} fontSize="20" textAnchor="middle">{stepId==='eligibility'?'\uD83D\uDCCB':stepId==='documents'?'\uD83D\uDCC4':'\uD83D\uDCDA'}</text>
      <text x="100" y="55" fill={color} fontSize="12" fontWeight="bold">Key Information</text>
      <text x="100" y="75" fill="#aaa" fontSize="9">Read the details below for complete information.</text>
      <text x="100" y="95" fill="#666" fontSize="8">Interactive quiz included in this step!</text>
    </svg>
  );
}

export default function PMSuryaGharOffice({ onComplete }) {
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
