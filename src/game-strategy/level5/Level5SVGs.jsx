import React from 'react';

export default function TopicSVG({ svgId, color }) {
  const C = color;
  if (svgId === 'star_label') return (
    <svg viewBox="0 0 440 150" className="se-svg">
      <rect x="120" y="10" width="200" height="130" rx="10" fill="rgba(245,158,11,0.06)" stroke="#f59e0b" strokeWidth="2"/>
      <text x="220" y="30" fill="#f59e0b" fontSize="10" textAnchor="middle" fontWeight="bold">BEE STAR LABEL</text>
      {[1,2,3,4,5].map(i=><text key={i} x={140+i*28} y="55" fill={i<=4?'#f59e0b':'#555'} fontSize="16" textAnchor="middle">{'\u2B50'}</text>)}
      <rect x="150" y="68" width="140" height="18" rx="4" fill="rgba(34,197,94,0.1)" stroke="#22c55e" strokeWidth="1"/>
      <text x="220" y="81" fill="#22c55e" fontSize="8" textAnchor="middle" fontWeight="bold">Annual Energy: 180 kWh</text>
      <rect x="150" y="92" width="140" height="12" rx="6" fill="rgba(255,255,255,0.05)"/>
      <rect x="150" y="92" width="50" height="12" rx="6" fill="rgba(34,197,94,0.4)"><animate attributeName="width" values="0;50" dur="1.5s" fill="freeze"/></rect>
      <text x="220" y="120" fill="#f59e0b" fontSize="8" textAnchor="middle">More Stars = Less Electricity!</text>
      <circle cx="55" cy="75" r="25" fill="rgba(245,158,11,0.1)" stroke="#f59e0b" strokeWidth="1"><animate attributeName="r" values="23;27;23" dur="2s" repeatCount="indefinite"/></circle>
      <text x="55" y="72" fill="#f59e0b" fontSize="9" textAnchor="middle" fontWeight="bold">BEE</text>
      <text x="55" y="84" fill="#888" fontSize="6" textAnchor="middle">India</text>
      <circle cx="390" cy="75" r="22" fill="rgba(34,197,94,0.1)" stroke="#22c55e" strokeWidth="1.5"/>
      <text x="390" y="73" fill="#22c55e" fontSize="16" textAnchor="middle">{'\u2B50'}</text>
      <text x="390" y="90" fill="#22c55e" fontSize="7" textAnchor="middle">5-Star</text>
    </svg>);
  if (svgId === 'star_compare') return (
    <svg viewBox="0 0 440 150" className="se-svg">
      <text x="220" y="14" fill="#888" fontSize="8" textAnchor="middle">HOW TO READ THE BEE LABEL</text>
      <rect x="30" y="22" width="170" height="115" rx="8" fill="rgba(239,68,68,0.06)" stroke="#ef4444" strokeWidth="1.5"/>
      <text x="115" y="40" fill="#ef4444" fontSize="9" textAnchor="middle" fontWeight="bold">1-Star (Wasteful)</text>
      <text x="115" y="58" fill="#ef4444" fontSize="12" textAnchor="middle">{'\u2B50'}</text>
      <text x="115" y="78" fill="#fff" fontSize="11" textAnchor="middle" fontWeight="bold">400 kWh/year</text>
      <text x="115" y="95" fill="#ef4444" fontSize="9" textAnchor="middle">Rs.2,800/year</text>
      <rect x="50" y="102" width="130" height="8" rx="4" fill="rgba(239,68,68,0.3)"/>
      <rect x="50" y="102" width="130" height="8" rx="4" fill="rgba(239,68,68,0.5)"><animate attributeName="width" values="0;130" dur="1s" fill="freeze"/></rect>
      <text x="115" y="128" fill="#ef4444" fontSize="7" textAnchor="middle">HIGH energy use</text>
      <rect x="240" y="22" width="170" height="115" rx="8" fill="rgba(34,197,94,0.06)" stroke="#22c55e" strokeWidth="1.5"/>
      <text x="325" y="40" fill="#22c55e" fontSize="9" textAnchor="middle" fontWeight="bold">5-Star (Efficient)</text>
      {[1,2,3,4,5].map(i=><text key={i} x={275+i*18} y="58" fill="#f59e0b" fontSize="10" textAnchor="middle">{'\u2B50'}</text>)}
      <text x="325" y="78" fill="#22c55e" fontSize="11" textAnchor="middle" fontWeight="bold">180 kWh/year</text>
      <text x="325" y="95" fill="#22c55e" fontSize="9" textAnchor="middle">Rs.1,260/year</text>
      <rect x="260" y="102" width="130" height="8" rx="4" fill="rgba(255,255,255,0.05)"/>
      <rect x="260" y="102" width="45" height="8" rx="4" fill="rgba(34,197,94,0.5)"><animate attributeName="width" values="0;45" dur="1s" fill="freeze"/></rect>
      <text x="325" y="128" fill="#22c55e" fontSize="7" textAnchor="middle" fontWeight="bold">LOW energy use</text>
    </svg>);
  if (svgId === 'star_efficiency') return (
    <svg viewBox="0 0 440 150" className="se-svg">
      <text x="220" y="14" fill="#888" fontSize="8" textAnchor="middle">EACH STAR SAVES 8-15% ELECTRICITY</text>
      {[{s:1,w:150,kwh:'329',rs:'2,303',c:'#ef4444'},{s:3,w:90,kwh:'220',rs:'1,540',c:'#f59e0b'},{s:5,w:40,kwh:'123',rs:'858',c:'#22c55e'}].map((d,i)=>(
        <g key={i}>
          <text x="15" y={42+i*40} fill="#ddd" fontSize="8">{d.s}-Star Fan</text>
          <rect x="100" y={30+i*40} width="200" height="16" rx="8" fill="rgba(255,255,255,0.04)"/>
          <rect x="100" y={30+i*40} width={d.w} height="16" rx="8" fill={d.c} opacity="0.5"><animate attributeName="width" values="0;{d.w}" dur="1s" begin={`${i*0.2}s`} fill="freeze"/></rect>
          <text x="310" y={42+i*40} fill={d.c} fontSize="8" fontWeight="bold">{d.kwh} kWh</text>
          <text x="380" y={42+i*40} fill="#888" fontSize="7">Rs.{d.rs}/yr</text>
        </g>))}
      <rect x="100" y="120" width="240" height="22" rx="6" fill="rgba(34,197,94,0.1)" stroke="#22c55e" strokeWidth="1"/>
      <text x="220" y="135" fill="#22c55e" fontSize="9" textAnchor="middle" fontWeight="bold">5-star fan saves Rs.1,445/year vs regular fan!</text>
    </svg>);
  if (svgId === 'star_meter') return (
    <svg viewBox="0 0 440 150" className="se-svg">
      <text x="220" y="14" fill="#888" fontSize="8" textAnchor="middle">ENERGY METER: OLD vs NEW APPLIANCE</text>
      <rect x="30" y="25" width="170" height="100" rx="8" fill="rgba(239,68,68,0.06)" stroke="#ef4444" strokeWidth="1.5"/>
      <text x="115" y="42" fill="#ef4444" fontSize="9" textAnchor="middle" fontWeight="bold">Old Fridge (2010)</text>
      <rect x="55" y="50" width="120" height="14" rx="7" fill="rgba(239,68,68,0.15)"/>
      <rect x="55" y="50" width="120" height="14" rx="7" fill="rgba(239,68,68,0.5)"><animate attributeName="width" values="0;120" dur="1.2s" fill="freeze"/></rect>
      <text x="115" y="80" fill="#ef4444" fontSize="12" textAnchor="middle" fontWeight="bold">700 kWh/yr</text>
      <text x="115" y="100" fill="#ef4444" fontSize="8" textAnchor="middle">Rs.4,900/year</text>
      <text x="115" y="118" fill="#888" fontSize="7" textAnchor="middle">HIGH waste</text>
      <rect x="240" y="25" width="170" height="100" rx="8" fill="rgba(34,197,94,0.06)" stroke="#22c55e" strokeWidth="1.5"/>
      <text x="325" y="42" fill="#22c55e" fontSize="9" textAnchor="middle" fontWeight="bold">5-Star Fridge (New)</text>
      <rect x="265" y="50" width="120" height="14" rx="7" fill="rgba(255,255,255,0.05)"/>
      <rect x="265" y="50" width="32" height="14" rx="7" fill="rgba(34,197,94,0.5)"><animate attributeName="width" values="0;32" dur="1.2s" fill="freeze"/></rect>
      <text x="325" y="80" fill="#22c55e" fontSize="12" textAnchor="middle" fontWeight="bold">180 kWh/yr</text>
      <text x="325" y="100" fill="#22c55e" fontSize="8" textAnchor="middle">Rs.1,260/year</text>
      <text x="325" y="118" fill="#22c55e" fontSize="7" textAnchor="middle" fontWeight="bold">74% LESS!</text>
    </svg>);
  if (svgId === 'star_old_vs_new') return (
    <svg viewBox="0 0 440 150" className="se-svg">
      <text x="220" y="14" fill="#888" fontSize="8" textAnchor="middle">AC COMPARISON: OLD vs 5-STAR INVERTER</text>
      <rect x="20" y="25" width="185" height="110" rx="8" fill="rgba(239,68,68,0.06)" stroke="#ef4444" strokeWidth="1.5"/>
      <text x="112" y="42" fill="#ef4444" fontSize="9" textAnchor="middle" fontWeight="bold">Old AC (2008)</text>
      <text x="112" y="62" fill="#fff" fontSize="14" textAnchor="middle" fontWeight="bold">2,500 kWh/yr</text>
      <text x="112" y="80" fill="#ef4444" fontSize="10" textAnchor="middle">Rs.17,500/year</text>
      <rect x="45" y="88" width="135" height="8" rx="4" fill="rgba(239,68,68,0.4)"><animate attributeName="width" values="0;135" dur="1s" fill="freeze"/></rect>
      <text x="112" y="118" fill="#ef4444" fontSize="7" textAnchor="middle">ON/OFF cycling wastes energy</text>
      <rect x="235" y="25" width="185" height="110" rx="8" fill="rgba(34,197,94,0.06)" stroke="#22c55e" strokeWidth="1.5"/>
      <text x="327" y="42" fill="#22c55e" fontSize="9" textAnchor="middle" fontWeight="bold">5-Star Inverter AC</text>
      <text x="327" y="62" fill="#22c55e" fontSize="14" textAnchor="middle" fontWeight="bold">1,000 kWh/yr</text>
      <text x="327" y="80" fill="#22c55e" fontSize="10" textAnchor="middle">Rs.7,000/year</text>
      <rect x="260" y="88" width="55" height="8" rx="4" fill="rgba(34,197,94,0.5)"><animate attributeName="width" values="0;55" dur="1s" fill="freeze"/></rect>
      <text x="327" y="118" fill="#22c55e" fontSize="7" textAnchor="middle" fontWeight="bold">Variable speed = 60% less!</text>
    </svg>);
  if (svgId === 'energy_bar_chart') return (
    <svg viewBox="0 0 440 150" className="se-svg">
      <text x="220" y="14" fill="#888" fontSize="8" textAnchor="middle">ENERGY USE: OLD vs 5-STAR APPLIANCES</text>
      {[{n:'Fan',o:75,s:28,y:28},{n:'AC',o:2500,s:1000,y:58},{n:'Fridge',o:250,s:80,y:88},{n:'Washer',o:500,s:300,y:118}].map((a,i)=>{const oW=Math.min(a.o/18,150);const sW=Math.min(a.s/18,150);return(
        <g key={i}>
          <text x="15" y={a.y+9} fill="#ccc" fontSize="7">{a.n}</text>
          <rect x="70" y={a.y} width={oW} height="10" rx="5" fill="rgba(239,68,68,0.4)"><animate attributeName="width" values={`0;${oW}`} dur="0.8s" begin={`${i*0.15}s`} fill="freeze"/></rect>
          <text x={75+oW} y={a.y+8} fill="#ef4444" fontSize="6">{a.o}W</text>
          <rect x="70" y={a.y+13} width={sW} height="10" rx="5" fill="rgba(34,197,94,0.4)"><animate attributeName="width" values={`0;${sW}`} dur="0.8s" begin={`${i*0.15}s`} fill="freeze"/></rect>
          <text x={75+sW} y={a.y+21} fill="#22c55e" fontSize="6">{a.s}W</text>
        </g>)})}
      <rect x="300" y="35" width="120" height="60" rx="10" fill="rgba(34,197,94,0.1)" stroke="#22c55e" strokeWidth="1.5"/>
      <text x="360" y="55" fill="#22c55e" fontSize="9" textAnchor="middle" fontWeight="bold">SAVE</text>
      <text x="360" y="72" fill="#22c55e" fontSize="12" textAnchor="middle" fontWeight="bold">Rs.15,000+</text>
      <text x="360" y="86" fill="#888" fontSize="7" textAnchor="middle">/year with all 5-star</text>
    </svg>);
  if (svgId === 'annual_savings') return (
    <svg viewBox="0 0 440 150" className="se-svg">
      <text x="220" y="14" fill="#888" fontSize="8" textAnchor="middle">EFFICIENCY = USEFUL OUTPUT / TOTAL INPUT</text>
      <rect x="30" y="25" width="170" height="50" rx="8" fill="rgba(239,68,68,0.06)" stroke="#ef4444" strokeWidth="1"/>
      <text x="115" y="42" fill="#ef4444" fontSize="8" textAnchor="middle">1-Star AC: 65% efficient</text>
      <text x="115" y="58" fill="#ef4444" fontSize="7" textAnchor="middle">35% electricity WASTED as heat!</text>
      <rect x="240" y="25" width="170" height="50" rx="8" fill="rgba(34,197,94,0.06)" stroke="#22c55e" strokeWidth="1"/>
      <text x="325" y="42" fill="#22c55e" fontSize="8" textAnchor="middle">5-Star AC: 95% efficient</text>
      <text x="325" y="58" fill="#22c55e" fontSize="7" textAnchor="middle">Only 5% wasted!</text>
      <rect x="60" y="85" width="320" height="20" rx="10" fill="rgba(255,255,255,0.04)"/>
      <rect x="60" y="85" width="208" height="20" rx="10" fill="rgba(239,68,68,0.3)"/>
      <rect x="60" y="85" width="304" height="20" rx="10" fill="rgba(34,197,94,0.2)"><animate attributeName="width" values="208;304" dur="1.5s" fill="freeze"/></rect>
      <text x="170" y="99" fill="#ef4444" fontSize="7" textAnchor="middle">65%</text>
      <text x="360" y="99" fill="#22c55e" fontSize="7" fontWeight="bold">95%</text>
      <text x="220" y="125" fill="#a78bfa" fontSize="9" textAnchor="middle" fontWeight="bold">Ratings get stricter every 2 years!</text>
    </svg>);
  if (svgId === 'lifecycle_bar') return (
    <svg viewBox="0 0 440 150" className="se-svg">
      <text x="220" y="14" fill="#888" fontSize="8" textAnchor="middle">ANNUAL SAVINGS: OLD FAN vs 5-STAR FAN</text>
      {[{l:'Old Fan 75W',kwh:329,rs:2303,c:'#ef4444',y:28},{l:'5-Star 28W',kwh:123,rs:858,c:'#22c55e',y:68}].map((f,i)=>(
        <g key={i}>
          <text x="20" y={f.y+10} fill="#ddd" fontSize="8">{f.l}</text>
          <rect x="120" y={f.y} width="200" height="14" rx="7" fill="rgba(255,255,255,0.04)"/>
          <rect x="120" y={f.y} width={f.kwh/2} height="14" rx="7" fill={f.c} opacity="0.5"><animate attributeName="width" values={`0;${f.kwh/2}`} dur="1s" begin={`${i*0.3}s`} fill="freeze"/></rect>
          <text x={128+f.kwh/2} y={f.y+10} fill={f.c} fontSize="7" fontWeight="bold">{f.kwh} kWh</text>
          <text x="120" y={f.y+28} fill="#888" fontSize="7">Cost: Rs.{f.rs}/year</text>
        </g>))}
      <rect x="100" y="115" width="240" height="25" rx="8" fill="rgba(34,197,94,0.1)" stroke="#22c55e" strokeWidth="1.5"/>
      <text x="220" y="132" fill="#22c55e" fontSize="9" textAnchor="middle" fontWeight="bold">Save 206 kWh + Rs.1,445/year per fan!</text>
    </svg>);
  if (svgId === 'purchase_vs_running') return (
    <svg viewBox="0 0 440 150" className="se-svg">
      <text x="220" y="14" fill="#888" fontSize="8" textAnchor="middle">PURCHASE COST vs 10-YEAR RUNNING COST</text>
      <rect x="20" y="25" width="185" height="110" rx="8" fill="rgba(239,68,68,0.06)" stroke="#ef4444" strokeWidth="1.5"/>
      <text x="112" y="42" fill="#ef4444" fontSize="8" textAnchor="middle" fontWeight="bold">1-Star AC</text>
      <text x="112" y="58" fill="#888" fontSize="7" textAnchor="middle">Buy: Rs.25,000</text>
      <text x="112" y="72" fill="#ef4444" fontSize="7" textAnchor="middle">Run: Rs.17,500/yr x 10</text>
      <text x="112" y="92" fill="#ef4444" fontSize="12" textAnchor="middle" fontWeight="bold">Rs.2,00,000</text>
      <text x="112" y="108" fill="#ef4444" fontSize="7" textAnchor="middle">TOTAL in 10 years</text>
      <rect x="235" y="25" width="185" height="110" rx="8" fill="rgba(34,197,94,0.06)" stroke="#22c55e" strokeWidth="1.5"/>
      <text x="327" y="42" fill="#22c55e" fontSize="8" textAnchor="middle" fontWeight="bold">5-Star AC</text>
      <text x="327" y="58" fill="#888" fontSize="7" textAnchor="middle">Buy: Rs.45,000</text>
      <text x="327" y="72" fill="#22c55e" fontSize="7" textAnchor="middle">Run: Rs.7,000/yr x 10</text>
      <text x="327" y="92" fill="#22c55e" fontSize="12" textAnchor="middle" fontWeight="bold">Rs.1,15,000</text>
      <text x="327" y="108" fill="#22c55e" fontSize="7" textAnchor="middle">SAVES Rs.85,000!</text>
    </svg>);
  if (svgId === 'label_reader') return (
    <svg viewBox="0 0 440 150" className="se-svg">
      <text x="220" y="14" fill="#888" fontSize="8" textAnchor="middle">WHAT IS LIFECYCLE COST?</text>
      <rect x="30" y="25" width="120" height="110" rx="8" fill="rgba(245,158,11,0.06)" stroke="#f59e0b" strokeWidth="1.5"/>
      <text x="90" y="42" fill="#f59e0b" fontSize="8" textAnchor="middle" fontWeight="bold">Purchase Price</text>
      <text x="90" y="62" fill="#f59e0b" fontSize="7" textAnchor="middle">15-25% of total</text>
      <rect x="50" y="70" width="80" height="50" rx="6" fill="rgba(245,158,11,0.15)"/>
      <text x="90" y="100" fill="#f59e0b" fontSize="10" textAnchor="middle" fontWeight="bold">Rs.18K</text>
      <rect x="180" y="25" width="120" height="110" rx="8" fill="rgba(239,68,68,0.06)" stroke="#ef4444" strokeWidth="1.5"/>
      <text x="240" y="42" fill="#ef4444" fontSize="8" textAnchor="middle" fontWeight="bold">Electricity Cost</text>
      <text x="240" y="62" fill="#ef4444" fontSize="7" textAnchor="middle">75-85% of total!</text>
      <rect x="195" y="70" width="90" height="50" rx="6" fill="rgba(239,68,68,0.15)"><animate attributeName="width" values="30;90" dur="1.5s" fill="freeze"/></rect>
      <text x="240" y="100" fill="#ef4444" fontSize="10" textAnchor="middle" fontWeight="bold">Rs.27K+</text>
      <rect x="330" y="40" width="90" height="80" rx="10" fill="rgba(34,197,94,0.1)" stroke="#22c55e" strokeWidth="1.5"/>
      <text x="375" y="60" fill="#22c55e" fontSize="8" textAnchor="middle" fontWeight="bold">TOTAL</text>
      <text x="375" y="80" fill="#22c55e" fontSize="8" textAnchor="middle">Lifecycle</text>
      <text x="375" y="100" fill="#22c55e" fontSize="10" textAnchor="middle" fontWeight="bold">Rs.45K</text>
    </svg>);
  if (svgId === 'fridge_compare') return (
    <svg viewBox="0 0 440 150" className="se-svg">
      <text x="220" y="14" fill="#888" fontSize="8" textAnchor="middle">FRIDGE: 15-YEAR LIFECYCLE COST</text>
      <rect x="20" y="25" width="185" height="110" rx="8" fill="rgba(239,68,68,0.06)" stroke="#ef4444" strokeWidth="1.5"/>
      <text x="112" y="40" fill="#ef4444" fontSize="8" textAnchor="middle" fontWeight="bold">1-Star Fridge</text>
      <text x="112" y="55" fill="#888" fontSize="7" textAnchor="middle">Buy: Rs.12,000</text>
      <text x="112" y="68" fill="#ef4444" fontSize="7" textAnchor="middle">Electricity: Rs.4,800/yr x 15</text>
      <text x="112" y="88" fill="#ef4444" fontSize="14" textAnchor="middle" fontWeight="bold">Rs.84,000</text>
      <text x="112" y="105" fill="#ef4444" fontSize="7" textAnchor="middle">TOTAL lifetime cost</text>
      <rect x="235" y="25" width="185" height="110" rx="8" fill="rgba(34,197,94,0.06)" stroke="#22c55e" strokeWidth="1.5"/>
      <text x="327" y="40" fill="#22c55e" fontSize="8" textAnchor="middle" fontWeight="bold">5-Star Fridge</text>
      <text x="327" y="55" fill="#888" fontSize="7" textAnchor="middle">Buy: Rs.18,000</text>
      <text x="327" y="68" fill="#22c55e" fontSize="7" textAnchor="middle">Electricity: Rs.1,260/yr x 15</text>
      <text x="327" y="88" fill="#22c55e" fontSize="14" textAnchor="middle" fontWeight="bold">Rs.36,900</text>
      <text x="327" y="105" fill="#22c55e" fontSize="7" textAnchor="middle">SAVES Rs.47,100!</text>
    </svg>);
  if (svgId === 'ac_compare') return (
    <svg viewBox="0 0 440 150" className="se-svg">
      <text x="220" y="14" fill="#888" fontSize="8" textAnchor="middle">AC: 10-YEAR LIFECYCLE COST</text>
      <rect x="20" y="25" width="185" height="55" rx="8" fill="rgba(239,68,68,0.06)" stroke="#ef4444" strokeWidth="1"/>
      <text x="112" y="42" fill="#ef4444" fontSize="8" textAnchor="middle" fontWeight="bold">1-Star AC: Rs.2,00,000</text>
      <text x="112" y="58" fill="#888" fontSize="7" textAnchor="middle">Rs.25K buy + Rs.17.5K/yr x 10</text>
      <rect x="240" y="25" width="185" height="55" rx="8" fill="rgba(34,197,94,0.06)" stroke="#22c55e" strokeWidth="1"/>
      <text x="332" y="42" fill="#22c55e" fontSize="8" textAnchor="middle" fontWeight="bold">5-Star AC: Rs.1,15,000</text>
      <text x="332" y="58" fill="#888" fontSize="7" textAnchor="middle">Rs.45K buy + Rs.7K/yr x 10</text>
      {[{l:'1-Star',w:200,c:'#ef4444'},{l:'5-Star',w:115,c:'#22c55e'}].map((b,i)=>(
        <g key={i}>
          <text x="20" y={98+i*25} fill="#ccc" fontSize="7">{b.l}</text>
          <rect x="70" y={88+i*25} width="300" height="14" rx="7" fill="rgba(255,255,255,0.04)"/>
          <rect x="70" y={88+i*25} width={b.w} height="14" rx="7" fill={b.c} opacity="0.5"><animate attributeName="width" values={`0;${b.w}`} dur="1s" begin={`${i*0.3}s`} fill="freeze"/></rect>
          <text x={78+b.w} y={98+i*25} fill={b.c} fontSize="7" fontWeight="bold">Rs.{b.l==='1-Star'?'2,00,000':'1,15,000'}</text>
        </g>))}
      <text x="220" y="140" fill="#22c55e" fontSize="8" textAnchor="middle" fontWeight="bold">Inverter tech protects other electronics too!</text>
    </svg>);
  if (svgId === 'washer_compare') return (
    <svg viewBox="0 0 440 150" className="se-svg">
      <text x="220" y="14" fill="#888" fontSize="8" textAnchor="middle">WASHER + FAN: TOP PICKS</text>
      <rect x="20" y="22" width="190" height="115" rx="8" fill="rgba(249,115,22,0.06)" stroke="#f97316" strokeWidth="1.5"/>
      <text x="115" y="38" fill="#f97316" fontSize="9" textAnchor="middle" fontWeight="bold">5-Star Front-Load Washer</text>
      <text x="115" y="55" fill="#ccc" fontSize="7" textAnchor="middle">40% less water + energy vs top-load</text>
      <text x="115" y="72" fill="#22c55e" fontSize="9" textAnchor="middle" fontWeight="bold">Saves Rs.2,000/year</text>
      <rect x="40" y="80" width="150" height="10" rx="5" fill="rgba(255,255,255,0.04)"/>
      <rect x="40" y="80" width="60" height="10" rx="5" fill="rgba(34,197,94,0.4)"><animate attributeName="width" values="0;60" dur="1s" fill="freeze"/></rect>
      <text x="115" y="105" fill="#888" fontSize="7" textAnchor="middle">Inverter motor = quieter + durable</text>
      <text x="115" y="120" fill="#f97316" fontSize="7" textAnchor="middle">Always choose front-load!</text>
      <rect x="230" y="22" width="190" height="115" rx="8" fill="rgba(96,165,250,0.06)" stroke="#60a5fa" strokeWidth="1.5"/>
      <text x="325" y="38" fill="#60a5fa" fontSize="9" textAnchor="middle" fontWeight="bold">BLDC Motor Fan</text>
      <text x="325" y="55" fill="#ccc" fontSize="7" textAnchor="middle">Only 28W vs regular 75W</text>
      <text x="325" y="72" fill="#22c55e" fontSize="9" textAnchor="middle" fontWeight="bold">Rs.14,500 saved in 10 yrs</text>
      <rect x="250" y="80" width="150" height="10" rx="5" fill="rgba(255,255,255,0.04)"/>
      <rect x="250" y="80" width="25" height="10" rx="5" fill="rgba(34,197,94,0.4)"><animate attributeName="width" values="0;25" dur="1s" fill="freeze"/></rect>
      <text x="325" y="105" fill="#888" fontSize="7" textAnchor="middle">Rs.2,500-3,500 per fan</text>
      <text x="325" y="120" fill="#60a5fa" fontSize="7" textAnchor="middle">Best investment per rupee!</text>
    </svg>);
  if (svgId === 'fan_compare') return (
    <svg viewBox="0 0 440 150" className="se-svg">
      <text x="220" y="14" fill="#888" fontSize="8" textAnchor="middle">4 THINGS TO CHECK ON BEE LABEL</text>
      {[{n:'1. Stars (4-5)',d:'Higher = more efficient',icon:'\u2B50',c:'#f59e0b',x:55},
        {n:'2. kWh/year',d:'Lower = less electricity',icon:'\u26A1',c:'#22c55e',x:165},
        {n:'3. Brand/Model',d:'Compare online reviews',icon:'\uD83D\uDD0D',c:'#60a5fa',x:275},
        {n:'4. Year',d:'Newer = stricter rating',icon:'\uD83D\uDCC5',c:'#a78bfa',x:385}].map((s,i)=>(
        <g key={i}>
          <rect x={s.x-45} y="25" width="90" height="105" rx="8" fill={`${s.c}11`} stroke={s.c} strokeWidth="1"/>
          <text x={s.x} y="50" fill={s.c} fontSize="18" textAnchor="middle">{s.icon}</text>
          <text x={s.x} y="70" fill={s.c} fontSize="8" textAnchor="middle" fontWeight="bold">{s.n}</text>
          <text x={s.x} y="85" fill="#888" fontSize="6" textAnchor="middle">{s.d}</text>
          <text x={s.x} y="120" fill="#22c55e" fontSize="10" textAnchor="middle">{'\u2705'}</text>
        </g>))}
    </svg>);
  if (svgId === 'buying_checklist') return (
    <svg viewBox="0 0 440 150" className="se-svg">
      <text x="220" y="14" fill="#888" fontSize="8" textAnchor="middle">SMART BUYING CHECKLIST</text>
      {[{t:'Check BEE star rating (4-5 stars)',d:true},
        {t:'Compare annual kWh on labels',d:true},
        {t:'Calculate 10-year total cost',d:true},
        {t:'Choose inverter technology',d:false},
        {t:'Check for government subsidies',d:false},
        {t:'Read online energy reviews',d:false}].map((item,i)=>(
        <g key={i}>
          <rect x="60" y={22+i*20} width="320" height="17" rx="6" fill={item.d?"rgba(34,197,94,0.06)":"rgba(255,255,255,0.03)"} stroke={item.d?"#22c55e33":"#33333388"} strokeWidth="1"/>
          <text x="80" y={34+i*20} fill={item.d?"#22c55e":"#888"} fontSize="8">{item.d?'\u2705':'\u2B1C'} {item.t}</text>
        </g>))}
      <rect x="100" y="128" width="240" height="18" rx="4" fill="rgba(34,197,94,0.08)"/>
      <text x="220" y="140" fill="#22c55e" fontSize="8" textAnchor="middle" fontWeight="bold">Save Rs.15,000-25,000/year with smart choices!</text>
    </svg>);
  // ═══ PHASE 2: SOLAR PANEL LIFECYCLE SVGs ═══
  if (svgId === 'panel_timeline') return (
    <svg viewBox="0 0 440 150" className="se-svg">
      <text x="220" y="14" fill="#888" fontSize="8" textAnchor="middle">25-YEAR SOLAR PANEL JOURNEY</text>
      <line x1="40" y1="75" x2="400" y2="75" stroke="#333" strokeWidth="2"/>
      {[{yr:'Year 0',x:40,pct:'100%',w:300,c:'#22c55e'},{yr:'Year 5',x:112,pct:'96%',w:288,c:'#22c55e'},{yr:'Year 10',x:184,pct:'93%',w:279,c:'#f59e0b'},{yr:'Year 15',x:256,pct:'89%',w:267,c:'#f59e0b'},{yr:'Year 20',x:328,pct:'86%',w:258,c:'#f97316'},{yr:'Year 25',x:400,pct:'80%',w:240,c:'#f97316'}].map((d,i)=>(
        <g key={i}>
          <circle cx={d.x} cy="75" r="6" fill={d.c} stroke="#fff" strokeWidth="1"><animate attributeName="r" values="4;7;4" dur="2s" begin={`${i*0.3}s`} repeatCount="indefinite"/></circle>
          <text x={d.x} y="65" fill={d.c} fontSize="7" textAnchor="middle" fontWeight="bold">{d.pct}</text>
          <text x={d.x} y="95" fill="#888" fontSize="6" textAnchor="middle">{d.yr}</text>
        </g>))}
      <rect x="100" y="110" width="240" height="22" rx="6" fill="rgba(34,197,94,0.1)" stroke="#22c55e" strokeWidth="1"/>
      <text x="220" y="125" fill="#22c55e" fontSize="8" textAnchor="middle" fontWeight="bold">Still producing 80% power after 25 years!</text>
    </svg>);
  if (svgId === 'degradation_curve') return (
    <svg viewBox="0 0 440 150" className="se-svg">
      <text x="220" y="14" fill="#888" fontSize="8" textAnchor="middle">DEGRADATION RATE: 0.5-0.8% PER YEAR</text>
      <line x1="60" y1="130" x2="400" y2="130" stroke="#444" strokeWidth="1"/><line x1="60" y1="30" x2="60" y2="130" stroke="#444" strokeWidth="1"/>
      <text x="55" y="35" fill="#888" fontSize="6" textAnchor="end">300W</text><text x="55" y="85" fill="#888" fontSize="6" textAnchor="end">270W</text><text x="55" y="130" fill="#888" fontSize="6" textAnchor="end">240W</text>
      <path d="M60,32 Q130,38 200,55 Q270,72 340,88 Q370,95 400,100" fill="none" stroke="#f97316" strokeWidth="2.5" strokeDasharray="400" strokeDashoffset="400"><animate attributeName="stroke-dashoffset" values="400;0" dur="2s" fill="freeze"/></path>
      <path d="M60,32 Q130,38 200,55 Q270,72 340,88 Q370,95 400,100 L400,130 L60,130 Z" fill="rgba(249,115,22,0.08)"><animate attributeName="opacity" values="0;1" dur="2s" fill="freeze"/></path>
      {[{x:60,y:32,l:'300W'},{x:200,y:55,l:'279W'},{x:400,y:100,l:'240W'}].map((p,i)=><circle key={i} cx={p.x} cy={p.y} r="4" fill="#f97316"><animate attributeName="opacity" values="0;1" dur="0.5s" begin={`${i*0.7}s`} fill="freeze"/></circle>)}
    </svg>);
  if (svgId === 'aging_output') return (
    <svg viewBox="0 0 440 150" className="se-svg">
      <text x="220" y="14" fill="#888" fontSize="8" textAnchor="middle">WHAT CAUSES SOLAR PANEL AGING?</text>
      {[{n:'UV Light',d:'Micro-cracks in cells',icon:'\u2600\uFE0F',c:'#f59e0b',x:80},{n:'Heat Cycling',d:'Expand/contract daily',icon:'\uD83C\uDF21\uFE0F',c:'#ef4444',x:220},{n:'Moisture',d:'Edge seal breakdown',icon:'\uD83D\uDCA7',c:'#0ea5e9',x:360}].map((s,i)=>(
        <g key={i}>
          <rect x={s.x-55} y="25" width="110" height="95" rx="10" fill={`${s.c}11`} stroke={s.c} strokeWidth="1.5"/>
          <text x={s.x} y="50" fill={s.c} fontSize="20" textAnchor="middle">{s.icon}</text>
          <text x={s.x} y="72" fill={s.c} fontSize="9" textAnchor="middle" fontWeight="bold">{s.n}</text>
          <text x={s.x} y="88" fill="#999" fontSize="7" textAnchor="middle">{s.d}</text>
          <rect x={s.x-35} y="98" width="70" height="8" rx="4" fill="rgba(255,255,255,0.05)"/>
          <rect x={s.x-35} y="98" width={20+i*15} height="8" rx="4" fill={`${s.c}66`}><animate attributeName="width" values={`0;${20+i*15}`} dur="1s" begin={`${i*0.2}s`} fill="freeze"/></rect>
        </g>))}
      <text x="220" y="140" fill="#22c55e" fontSize="8" textAnchor="middle" fontWeight="bold">Modern panels are built tough — tempered glass + sealed frames!</text>
    </svg>);
  if (svgId === 'recycle_steps') return (
    <svg viewBox="0 0 440 150" className="se-svg">
      <text x="220" y="14" fill="#888" fontSize="8" textAnchor="middle">4 STEPS TO RECYCLE A SOLAR PANEL</text>
      {[{n:'1. Remove Frame',d:'Aluminum unclips',c:'#60a5fa',x:65},{n:'2. Separate Glass',d:'75% of panel',c:'#0ea5e9',x:175},{n:'3. Heat Laminate',d:'Melt plastic layer',c:'#f97316',x:285},{n:'4. Recover Cells',d:'Silicon + metals',c:'#22c55e',x:395}].map((s,i)=>(
        <g key={i}>
          <rect x={s.x-50} y="28" width="100" height="85" rx="8" fill={`${s.c}11`} stroke={s.c} strokeWidth="1.5"><animate attributeName="opacity" values="0;1" dur="0.4s" begin={`${i*0.3}s`} fill="freeze"/></rect>
          <text x={s.x} y="55" fill={s.c} fontSize="9" textAnchor="middle" fontWeight="bold">{s.n}</text>
          <text x={s.x} y="75" fill="#aaa" fontSize="7" textAnchor="middle">{s.d}</text>
          {i<3 && <line x1={s.x+50} y1="70" x2={s.x+60} y2="70" stroke="#555" strokeWidth="1.5" markerEnd="url(#arrow)"/>}
        </g>))}
      <text x="220" y="135" fill="#0ea5e9" fontSize="8" textAnchor="middle" fontWeight="bold">Entire process takes just 2-4 hours per panel!</text>
    </svg>);
  if (svgId === 'glass_recovery') return (
    <svg viewBox="0 0 440 150" className="se-svg">
      <text x="220" y="14" fill="#888" fontSize="8" textAnchor="middle">MATERIAL BREAKDOWN OF A SOLAR PANEL</text>
      {[{n:'Glass',pct:75,w:225,c:'#60a5fa',y:28},{n:'Aluminum',pct:8,w:24,c:'#a78bfa',y:52},{n:'Plastic',pct:10,w:30,c:'#f97316',y:76},{n:'Silicon',pct:5,w:15,c:'#22c55e',y:100},{n:'Silver/Cu',pct:1,w:3,c:'#f59e0b',y:124}].map((m,i)=>(
        <g key={i}>
          <text x="60" y={m.y+10} fill="#ccc" fontSize="7" textAnchor="end">{m.n}</text>
          <rect x="70" y={m.y} width="300" height="16" rx="4" fill="rgba(255,255,255,0.04)"/>
          <rect x="70" y={m.y} width={m.w} height="16" rx="4" fill={m.c} opacity="0.5"><animate attributeName="width" values={`0;${m.w}`} dur="0.8s" begin={`${i*0.15}s`} fill="freeze"/></rect>
          <text x={78+m.w} y={m.y+11} fill={m.c} fontSize="7" fontWeight="bold">{m.pct}%</text>
        </g>))}
    </svg>);
  if (svgId === 'recycle_stats') return (
    <svg viewBox="0 0 440 150" className="se-svg">
      <text x="220" y="14" fill="#888" fontSize="8" textAnchor="middle">RECYCLABILITY COMPARISON</text>
      <circle cx="120" cy="85" r="45" fill="none" stroke="#333" strokeWidth="8"/>
      <circle cx="120" cy="85" r="45" fill="none" stroke="#22c55e" strokeWidth="8" strokeDasharray="283" strokeDashoffset="14" strokeLinecap="round" transform="rotate(-90 120 85)"><animate attributeName="stroke-dashoffset" values="283;14" dur="1.5s" fill="freeze"/></circle>
      <text x="120" y="82" fill="#22c55e" fontSize="18" textAnchor="middle" fontWeight="bold">95%</text>
      <text x="120" y="96" fill="#22c55e" fontSize="7" textAnchor="middle">Recyclable</text>
      <text x="120" y="140" fill="#22c55e" fontSize="8" textAnchor="middle" fontWeight="bold">Solar Panels</text>
      {[{n:'Smartphones',pct:30,c:'#ef4444'},{n:'Clothes',pct:12,c:'#f97316'},{n:'Plastic Bottles',pct:29,c:'#f59e0b'}].map((c,i)=>(
        <g key={i}>
          <text x="240" y={42+i*32} fill="#ccc" fontSize="7">{c.n}</text>
          <rect x="240" y={46+i*32} width="160" height="10" rx="5" fill="rgba(255,255,255,0.04)"/>
          <rect x="240" y={46+i*32} width={c.pct*1.6} height="10" rx="5" fill={c.c} opacity="0.5"><animate attributeName="width" values={`0;${c.pct*1.6}`} dur="0.8s" begin={`${i*0.2}s`} fill="freeze"/></rect>
          <text x={248+c.pct*1.6} y={55+i*32} fill={c.c} fontSize="7" fontWeight="bold">{c.pct}%</text>
        </g>))}
    </svg>);
  if (svgId === 'second_life_uses') return (
    <svg viewBox="0 0 440 150" className="se-svg">
      <text x="220" y="14" fill="#888" fontSize="8" textAnchor="middle">SECOND-LIFE PANEL APPLICATIONS</text>
      {[{n:'Water Pumps',icon:'\uD83D\uDCA7',c:'#0ea5e9',x:55},{n:'Street Lights',icon:'\uD83D\uDCA1',c:'#f59e0b',x:143},{n:'Schools',icon:'\uD83C\uDFEB',c:'#8b5cf6',x:231},{n:'Farm Fences',icon:'\uD83C\uDF3E',c:'#22c55e',x:319},{n:'Phone Charge',icon:'\uD83D\uDD0C',c:'#f97316',x:407}].map((u,i)=>(
        <g key={i}>
          <rect x={u.x-40} y="25" width="80" height="90" rx="10" fill={`${u.c}11`} stroke={u.c} strokeWidth="1"><animate attributeName="opacity" values="0;1" dur="0.4s" begin={`${i*0.15}s`} fill="freeze"/></rect>
          <text x={u.x} y="55" fill={u.c} fontSize="22" textAnchor="middle">{u.icon}</text>
          <text x={u.x} y="80" fill={u.c} fontSize="8" textAnchor="middle" fontWeight="bold">{u.n}</text>
          <text x={u.x} y="105" fill="#22c55e" fontSize="12" textAnchor="middle">{'\u2705'}</text>
        </g>))}
      <text x="220" y="138" fill="#8b5cf6" fontSize="8" textAnchor="middle" fontWeight="bold">70-80% output panels get a whole new life!</text>
    </svg>);
  if (svgId === 'second_life_farm') return (
    <svg viewBox="0 0 440 150" className="se-svg">
      <text x="220" y="14" fill="#888" fontSize="8" textAnchor="middle">POWERING RURAL INDIA WITH USED PANELS</text>
      <rect x="20" y="25" width="185" height="105" rx="8" fill="rgba(34,197,94,0.06)" stroke="#22c55e" strokeWidth="1.5"/>
      <text x="112" y="42" fill="#22c55e" fontSize="9" textAnchor="middle" fontWeight="bold">Second-Life Panel Benefits</text>
      <text x="112" y="58" fill="#ccc" fontSize="7" textAnchor="middle">70-80% cheaper than new</text>
      <text x="112" y="72" fill="#ccc" fontSize="7" textAnchor="middle">Still enough for pumps + lights</text>
      <text x="112" y="86" fill="#22c55e" fontSize="9" textAnchor="middle" fontWeight="bold">Save Rs.15-20K/year on diesel</text>
      <text x="112" y="102" fill="#ccc" fontSize="7" textAnchor="middle">Lasts 10-15 more years!</text>
      <text x="112" y="120" fill="#22c55e" fontSize="8" textAnchor="middle" fontWeight="bold">Free sunlight = free power</text>
      <rect x="235" y="25" width="185" height="105" rx="8" fill="rgba(249,115,22,0.06)" stroke="#f97316" strokeWidth="1.5"/>
      <text x="327" y="42" fill="#f97316" fontSize="9" textAnchor="middle" fontWeight="bold">Impact Numbers</text>
      <text x="327" y="62" fill="#f97316" fontSize="14" textAnchor="middle" fontWeight="bold">14 Crore</text>
      <text x="327" y="78" fill="#ccc" fontSize="7" textAnchor="middle">Indian farms total</text>
      <text x="327" y="98" fill="#f97316" fontSize="11" textAnchor="middle" fontWeight="bold">2.8 Billion L</text>
      <text x="327" y="114" fill="#ccc" fontSize="7" textAnchor="middle">diesel saved if 10% adopt</text>
    </svg>);
  if (svgId === 'second_life_examples') return (
    <svg viewBox="0 0 440 150" className="se-svg">
      <text x="220" y="14" fill="#888" fontSize="8" textAnchor="middle">REAL SECOND-LIFE PROJECTS IN INDIA</text>
      {[{n:'Village Lights',v:'100+ villages',c:'#f59e0b',x:80},{n:'School Power',v:'500+ schools',c:'#8b5cf6',x:180},{n:'Water Filters',v:'UV purifiers',c:'#0ea5e9',x:280},{n:'EV Charging',v:'E-rickshaws',c:'#22c55e',x:380}].map((p,i)=>(
        <g key={i}>
          <rect x={p.x-45} y="25" width="90" height="80" rx="8" fill={`${p.c}11`} stroke={p.c} strokeWidth="1"/>
          <text x={p.x} y="50" fill={p.c} fontSize="9" textAnchor="middle" fontWeight="bold">{p.n}</text>
          <text x={p.x} y="68" fill="#ccc" fontSize="7" textAnchor="middle">{p.v}</text>
          <rect x={p.x-25} y="78" width="50" height="12" rx="3" fill={`${p.c}33`}><animate attributeName="width" values="0;50" dur="0.6s" begin={`${i*0.2}s`} fill="freeze"/></rect>
        </g>))}
      <rect x="60" y="115" width="320" height="22" rx="6" fill="rgba(139,92,246,0.1)" stroke="#8b5cf6" strokeWidth="1"/>
      <text x="220" y="130" fill="#8b5cf6" fontSize="8" textAnchor="middle" fontWeight="bold">50,000 families powered by Rajasthan's Social Solar Initiative!</text>
    </svg>);
  if (svgId === 'circular_flow') return (
    <svg viewBox="0 0 440 150" className="se-svg">
      <text x="220" y="14" fill="#888" fontSize="8" textAnchor="middle">LINEAR vs CIRCULAR ECONOMY</text>
      <rect x="15" y="25" width="195" height="55" rx="8" fill="rgba(239,68,68,0.06)" stroke="#ef4444" strokeWidth="1.5"/>
      <text x="112" y="42" fill="#ef4444" fontSize="8" textAnchor="middle" fontWeight="bold">LINEAR: Make → Use → Throw</text>
      <text x="112" y="60" fill="#ef4444" fontSize="7" textAnchor="middle">Creates waste + pollution</text>
      {[40,80,120,160].map((x,i)=><text key={i} x={x} y="72" fill="#ef4444" fontSize="8" textAnchor="middle">{['\u2699\uFE0F','\u2192','\uD83D\uDDD1\uFE0F','\u274C'][i]}</text>)}
      <rect x="230" y="25" width="195" height="55" rx="8" fill="rgba(16,185,129,0.06)" stroke="#10b981" strokeWidth="1.5"/>
      <text x="327" y="42" fill="#10b981" fontSize="8" textAnchor="middle" fontWeight="bold">CIRCULAR: Make → Use → Recycle</text>
      <text x="327" y="60" fill="#10b981" fontSize="7" textAnchor="middle">Zero waste — materials cycle!</text>
      <circle cx="327" cy="72" r="0" fill="none" stroke="#10b981" strokeWidth="1"><animate attributeName="r" values="0;6" dur="1s" fill="freeze"/></circle>
      <rect x="60" y="90" width="320" height="45" rx="8" fill="rgba(16,185,129,0.08)" stroke="#10b981" strokeWidth="1"/>
      <text x="220" y="108" fill="#10b981" fontSize="9" textAnchor="middle" fontWeight="bold">Solar panels: 95% materials cycle back!</text>
      <text x="220" y="125" fill="#10b981" fontSize="7" textAnchor="middle">Could create 1 Lakh new green jobs in India</text>
    </svg>);
  if (svgId === 'cradle_to_cradle') return (
    <svg viewBox="0 0 440 150" className="se-svg">
      <text x="220" y="14" fill="#888" fontSize="8" textAnchor="middle">CRADLE-TO-CRADLE: DESIGN FOR RECYCLING</text>
      {[{n:'Lead-Free Solder',d:'Safer recycling',c:'#22c55e',x:65},{n:'Snap-Fit Frames',d:'Easy disassembly',c:'#0ea5e9',x:175},{n:'Material Labels',d:'Clear marking',c:'#f59e0b',x:285},{n:'Module Reuse',d:'Refurbish first',c:'#8b5cf6',x:395}].map((s,i)=>(
        <g key={i}>
          <rect x={s.x-48} y="25" width="96" height="75" rx="8" fill={`${s.c}11`} stroke={s.c} strokeWidth="1.5"/>
          <text x={s.x} y="48" fill={s.c} fontSize="9" textAnchor="middle" fontWeight="bold">{s.n}</text>
          <text x={s.x} y="65" fill="#999" fontSize="7" textAnchor="middle">{s.d}</text>
          <text x={s.x} y="88" fill="#22c55e" fontSize="14" textAnchor="middle">{'\u2705'}</text>
        </g>))}
      <rect x="80" y="112" width="280" height="25" rx="6" fill="rgba(34,197,94,0.1)" stroke="#22c55e" strokeWidth="1"/>
      <text x="220" y="129" fill="#22c55e" fontSize="8" textAnchor="middle" fontWeight="bold">60% cheaper recycling + 15% more materials recovered!</text>
    </svg>);
  if (svgId === 'ewaste_compare') return (
    <svg viewBox="0 0 440 150" className="se-svg">
      <text x="220" y="14" fill="#888" fontSize="8" textAnchor="middle">SOLAR PANELS vs OTHER E-WASTE</text>
      {[{n:'Phone',life:'2-3 yrs',rec:'30%',c:'#ef4444',y:28},{n:'Laptop',life:'4-5 yrs',rec:'35%',c:'#f97316',y:56},{n:'TV',life:'7-10 yrs',rec:'40%',c:'#f59e0b',y:84},{n:'Solar Panel',life:'25-40 yrs',rec:'95%',c:'#22c55e',y:112}].map((e,i)=>(
        <g key={i}>
          <text x="15" y={e.y+10} fill="#ccc" fontSize="7">{e.n}</text>
          <text x="90" y={e.y+10} fill="#888" fontSize="6">{e.life}</text>
          <rect x="140" y={e.y} width="250" height="14" rx="4" fill="rgba(255,255,255,0.04)"/>
          <rect x="140" y={e.y} width={parseInt(e.rec)*2.5} height="14" rx="4" fill={e.c} opacity="0.5"><animate attributeName="width" values={`0;${parseInt(e.rec)*2.5}`} dur="0.8s" begin={`${i*0.15}s`} fill="freeze"/></rect>
          <text x={148+parseInt(e.rec)*2.5} y={e.y+10} fill={e.c} fontSize="7" fontWeight="bold">{e.rec} recyclable</text>
        </g>))}
    </svg>);
  // ─── FALLBACK ───
  return (
    <svg viewBox="0 0 440 120" className="se-svg">
      <rect x="20" y="10" width="400" height="100" rx="12" fill={`${C}08`} stroke={`${C}44`} strokeWidth="1"/>
      <text x="220" y="60" fill={C} fontSize="14" textAnchor="middle" fontWeight="bold">{svgId.replace(/_/g,' ').replace(/\b\w/g,l=>l.toUpperCase())}</text>
      <text x="220" y="82" fill="#888" fontSize="9" textAnchor="middle">Interactive Learning Module</text>
      <circle cx="220" cy="35" r="8" fill={C} opacity="0.3"><animate attributeName="r" values="6;10;6" dur="2s" repeatCount="indefinite"/></circle>
    </svg>
  );
}