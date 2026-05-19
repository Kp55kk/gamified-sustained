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

  // ═══ PHASE 5: SMART ENERGY ═══
  // ─── Load Shifting ───
  if (svgId === 'load_clock') return (
    <svg viewBox="0 0 440 150" className="se-svg">
      <circle cx="100" cy="75" r="50" fill="rgba(245,158,11,0.06)" stroke="#f59e0b" strokeWidth="2"/>
      <path d="M 100 25 A 50 50 0 0 1 145 105" fill="none" stroke="#fbbf24" strokeWidth="10" opacity="0.25" strokeLinecap="round"/>
      <text x="62" y="42" fill="#fbbf24" fontSize="7" fontWeight="bold">10AM</text>
      <text x="132" y="108" fill="#fbbf24" fontSize="7" fontWeight="bold">3PM</text>
      <circle cx="138" cy="35" r="12" fill="#fbbf24" opacity="0.8"><animate attributeName="r" values="10;14;10" dur="2s" repeatCount="indefinite"/></circle>
      <text x="100" y="72" fill="#fff" fontSize="14" textAnchor="middle" fontWeight="bold">FREE!</text>
      <text x="100" y="88" fill="#888" fontSize="8" textAnchor="middle">Solar Hours</text>
      <rect x="210" y="15" width="210" height="120" rx="8" fill="rgba(245,158,11,0.05)" stroke="#f59e0b" strokeWidth="1"/>
      <text x="315" y="32" fill="#f59e0b" fontSize="9" textAnchor="middle" fontWeight="bold">BEST TIMES TO USE</text>
      {[{n:'Washing Machine',t:'2 PM',y:52},{n:'Water Heater',t:'11 AM',y:72},{n:'Iron',t:'12 PM',y:92},{n:'EV Charging',t:'12 PM',y:112}].map((a,i)=><g key={i}><text x="225" y={a.y} fill="#ccc" fontSize="8">{a.n}</text><text x="405" y={a.y} fill="#22c55e" fontSize="8" fontWeight="bold" textAnchor="end">{a.t} FREE</text></g>)}
    </svg>);
  if (svgId === 'load_schedule') return (
    <svg viewBox="0 0 440 150" className="se-svg">
      <text x="220" y="14" fill="#888" fontSize="8" textAnchor="middle">COST: DAYTIME SOLAR vs EVENING GRID</text>
      {[{n:'Washing Machine',free:'Rs.0',paid:'Rs.4/load',w1:0,w2:40,y:30},{n:'Water Heater',free:'Rs.0',paid:'Rs.24/use',w1:0,w2:160,y:60},{n:'Iron',free:'Rs.0',paid:'Rs.8/hr',w1:0,w2:80,y:90},{n:'EV Charge',free:'Rs.0',paid:'Rs.26/charge',w1:0,w2:180,y:120}].map((a,i)=>(
        <g key={i}>
          <text x="15" y={a.y+10} fill="#ddd" fontSize="8">{a.n}</text>
          <rect x="120" y={a.y} width="130" height="10" rx="5" fill="rgba(34,197,94,0.15)"/><rect x="120" y={a.y} width="4" height="10" rx="2" fill="#22c55e"><animate attributeName="width" from="0" to="4" dur="0.5s" begin={`${i*0.15}s`} fill="freeze"/></rect>
          <text x="255" y={a.y+9} fill="#22c55e" fontSize="7" fontWeight="bold">{a.free}</text>
          <rect x="120" y={a.y+14} width="130" height="10" rx="5" fill="rgba(239,68,68,0.1)"/><rect x="120" y={a.y+14} width={a.w2/2} height="10" rx="5" fill="rgba(239,68,68,0.4)"><animate attributeName="width" from="0" to={a.w2/2} dur="0.8s" begin={`${i*0.15}s`} fill="freeze"/></rect>
          <text x="255" y={a.y+23} fill="#ef4444" fontSize="7">{a.paid}</text>
        </g>))}
      <rect x="300" y="40" width="120" height="60" rx="10" fill="rgba(34,197,94,0.1)" stroke="#22c55e" strokeWidth="1.5"/>
      <text x="360" y="62" fill="#22c55e" fontSize="10" textAnchor="middle" fontWeight="bold">SAVE</text>
      <text x="360" y="78" fill="#22c55e" fontSize="14" textAnchor="middle" fontWeight="bold">Rs.2,000</text>
      <text x="360" y="92" fill="#888" fontSize="8" textAnchor="middle">/month</text>
    </svg>);
  if (svgId === 'load_savings') return (
    <svg viewBox="0 0 440 150" className="se-svg">
      <text x="220" y="14" fill="#888" fontSize="8" textAnchor="middle">MONTHLY SAVINGS FROM SMART TIMING</text>
      {[{m:'Jan',v:1200},{m:'Mar',v:1500},{m:'May',v:2000},{m:'Jul',v:1400},{m:'Sep',v:1600},{m:'Nov',v:1800}].map((d,i)=>{const h=d.v/25;return(
        <g key={i}><rect x={50+i*65} y={130-h} width="40" height={h} rx="4" fill="rgba(34,197,94,0.3)" stroke="#22c55e" strokeWidth="1"><animate attributeName="height" from="0" to={h} dur="0.8s" begin={`${i*0.1}s`} fill="freeze"/><animate attributeName="y" from="130" to={130-h} dur="0.8s" begin={`${i*0.1}s`} fill="freeze"/></rect>
        <text x={70+i*65} y={125-h} fill="#22c55e" fontSize="7" textAnchor="middle" fontWeight="bold">Rs.{d.v}</text>
        <text x={70+i*65} y="142" fill="#888" fontSize="7" textAnchor="middle">{d.m}</text></g>)})}
      <text x="220" y="28" fill="#22c55e" fontSize="10" textAnchor="middle" fontWeight="bold">Total: Rs.18,000-24,000/year saved!</text>
    </svg>);

  // ─── Smart Sensors ───
  if (svgId === 'sensor_motion') return (
    <svg viewBox="0 0 440 150" className="se-svg">
      <rect x="30" y="20" width="160" height="110" rx="8" fill="rgba(139,92,246,0.06)" stroke="#a78bfa" strokeWidth="1.5"/>
      <text x="110" y="38" fill="#a78bfa" fontSize="9" textAnchor="middle" fontWeight="bold">ROOM WITH SENSOR</text>
      <rect x="100" y="45" width="14" height="14" rx="3" fill="#a78bfa" opacity="0.8"><animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite"/></rect>
      <text x="107" y="75" fill="#888" fontSize="7" textAnchor="middle">Sensor</text>
      {[20,35,50,65].map((r,i)=><circle key={i} cx="107" cy="52" r={r} fill="none" stroke="#a78bfa" strokeWidth="0.5" opacity={0.4-i*0.08}><animate attributeName="r" values={`${r-5};${r+5};${r-5}`} dur="2s" begin={`${i*0.3}s`} repeatCount="indefinite"/></circle>)}
      <text x="60" y="100" fill="#888" fontSize="7">Nobody here?</text>
      <text x="60" y="115" fill="#22c55e" fontSize="9" fontWeight="bold">Lights AUTO OFF!</text>
      <rect x="240" y="25" width="170" height="100" rx="10" fill="rgba(34,197,94,0.08)" stroke="#22c55e" strokeWidth="1.5"/>
      <text x="325" y="45" fill="#22c55e" fontSize="10" textAnchor="middle" fontWeight="bold">SAVINGS</text>
      <text x="325" y="65" fill="#fff" fontSize="9" textAnchor="middle">Cost: Rs.500 per sensor</text>
      <text x="325" y="82" fill="#22c55e" fontSize="9" textAnchor="middle">Saves: Rs.200-300/month</text>
      <text x="325" y="100" fill="#a78bfa" fontSize="9" textAnchor="middle" fontWeight="bold">15-25% energy saved!</text>
    </svg>);
  if (svgId === 'sensor_types') return (
    <svg viewBox="0 0 440 150" className="se-svg">
      <text x="220" y="14" fill="#888" fontSize="8" textAnchor="middle">TWO TYPES OF SMART SENSORS</text>
      <rect x="20" y="22" width="185" height="115" rx="8" fill="rgba(139,92,246,0.06)" stroke="#a78bfa" strokeWidth="1.5"/>
      <text x="112" y="40" fill="#a78bfa" fontSize="10" textAnchor="middle" fontWeight="bold">Motion Sensor</text>
      <text x="112" y="56" fill="#888" fontSize="8" textAnchor="middle">Rs.500 per room</text>
      <circle cx="112" cy="80" r="15" fill="rgba(139,92,246,0.2)" stroke="#a78bfa" strokeWidth="1"><animate attributeName="r" values="13;17;13" dur="2s" repeatCount="indefinite"/></circle>
      <text x="112" y="84" fill="#a78bfa" fontSize="8" textAnchor="middle">📡</text>
      <text x="112" y="110" fill="#ccc" fontSize="7" textAnchor="middle">Detects people</text>
      <text x="112" y="125" fill="#22c55e" fontSize="8" textAnchor="middle" fontWeight="bold">Auto lights ON/OFF</text>
      <rect x="235" y="22" width="185" height="115" rx="8" fill="rgba(6,182,212,0.06)" stroke="#06b6d4" strokeWidth="1.5"/>
      <text x="327" y="40" fill="#06b6d4" fontSize="10" textAnchor="middle" fontWeight="bold">Smart Thermostat</text>
      <text x="327" y="56" fill="#888" fontSize="8" textAnchor="middle">Rs.3,000</text>
      <rect x="302" y="65" width="50" height="30" rx="6" fill="rgba(6,182,212,0.15)" stroke="#06b6d4" strokeWidth="1"/>
      <text x="327" y="85" fill="#06b6d4" fontSize="12" textAnchor="middle" fontWeight="bold">24°C</text>
      <text x="327" y="110" fill="#ccc" fontSize="7" textAnchor="middle">Auto AC control</text>
      <text x="327" y="125" fill="#22c55e" fontSize="8" textAnchor="middle" fontWeight="bold">Saves 24% on cooling!</text>
    </svg>);
  if (svgId === 'sensor_savings') return (
    <svg viewBox="0 0 440 150" className="se-svg">
      <text x="220" y="14" fill="#888" fontSize="8" textAnchor="middle">SMART HOME = AUTOMATIC SAVINGS</text>
      {[{r:'Living Room',s:15,c:'#a78bfa',x:70},{r:'Bedroom',s:20,c:'#22c55e',x:180},{r:'Kitchen',s:10,c:'#f59e0b',x:290},{r:'Bathroom',s:25,c:'#06b6d4',x:400}].map((rm,i)=>{const h=rm.s*3;return(
        <g key={i}><rect x={rm.x-30} y={120-h} width="50" height={h} rx="4" fill={`${rm.c}33`} stroke={rm.c} strokeWidth="1"><animate attributeName="height" from="0" to={h} dur="0.8s" begin={`${i*0.15}s`} fill="freeze"/><animate attributeName="y" from="120" to={120-h} dur="0.8s" begin={`${i*0.15}s`} fill="freeze"/></rect>
        <text x={rm.x-5} y={115-h} fill={rm.c} fontSize="9" textAnchor="middle" fontWeight="bold">{rm.s}%</text>
        <text x={rm.x-5} y="135" fill="#aaa" fontSize="7" textAnchor="middle">{rm.r}</text></g>)})}
      <text x="220" y="30" fill="#22c55e" fontSize="10" textAnchor="middle" fontWeight="bold">Total: 30-40% less electricity used!</text>
    </svg>);

  // ─── EV + Solar ───
  if (svgId === 'ev_charger') return (
    <svg viewBox="0 0 440 150" className="se-svg">
      <circle cx="80" cy="50" r="25" fill="#fbbf24" opacity="0.15"><animate attributeName="r" values="23;27;23" dur="2s" repeatCount="indefinite"/></circle>
      <text x="80" y="55" fill="#fbbf24" fontSize="20" textAnchor="middle">☀️</text>
      <text x="80" y="80" fill="#888" fontSize="7" textAnchor="middle">Solar Panel</text>
      <path d="M110,50 L180,50" stroke="#fbbf24" strokeWidth="2" strokeDasharray="6,4"><animate attributeName="stroke-dashoffset" values="0;-20" dur="1s" repeatCount="indefinite"/></path>
      <rect x="185" y="30" width="60" height="45" rx="6" fill="rgba(139,92,246,0.1)" stroke="#a78bfa" strokeWidth="1.5"/>
      <text x="215" y="48" fill="#a78bfa" fontSize="7" textAnchor="middle">Charger</text>
      <text x="215" y="62" fill="#a78bfa" fontSize="8" textAnchor="middle" fontWeight="bold">3 kW</text>
      <path d="M250,52 L310,52" stroke="#22c55e" strokeWidth="2" strokeDasharray="6,4"><animate attributeName="stroke-dashoffset" values="0;-20" dur="1s" repeatCount="indefinite"/></path>
      <rect x="315" y="25" width="100" height="55" rx="10" fill="rgba(34,197,94,0.08)" stroke="#22c55e" strokeWidth="1.5"/>
      <text x="365" y="45" fill="#ddd" fontSize="8" textAnchor="middle">🚗 Electric Car</text>
      <text x="365" y="60" fill="#22c55e" fontSize="9" textAnchor="middle" fontWeight="bold">FREE Charging!</text>
      <text x="365" y="75" fill="#888" fontSize="7" textAnchor="middle">40 kWh battery</text>
      <rect x="80" y="100" width="300" height="30" rx="8" fill="rgba(34,197,94,0.08)" stroke="#22c55e" strokeWidth="1"/>
      <text x="230" y="120" fill="#22c55e" fontSize="10" textAnchor="middle" fontWeight="bold">312 km range per charge — ZERO cost!</text>
    </svg>);
  if (svgId === 'ev_cost') return (
    <svg viewBox="0 0 440 150" className="se-svg">
      <text x="220" y="14" fill="#888" fontSize="8" textAnchor="middle">COST PER KILOMETER COMPARISON</text>
      {[{n:'Petrol Car',cost:'Rs.5.50/km',w:180,c:'#ef4444',y:35},{n:'EV (Grid)',cost:'Rs.0.80/km',w:26,c:'#f59e0b',y:70},{n:'EV (Solar)',cost:'Rs.0/km FREE!',w:2,c:'#22c55e',y:105}].map((v,i)=>(
        <g key={i}>
          <text x="15" y={v.y+10} fill="#ddd" fontSize="9">{v.n}</text>
          <rect x="130" y={v.y} width="200" height="18" rx="9" fill="rgba(255,255,255,0.05)"/>
          <rect x="130" y={v.y} width={v.w} height="18" rx="9" fill={v.c} opacity="0.6"><animate attributeName="width" from="0" to={v.w} dur="1s" begin={`${i*0.2}s`} fill="freeze"/></rect>
          <text x="340" y={v.y+13} fill={v.c} fontSize="9" fontWeight="bold">{v.cost}</text>
        </g>))}
      <rect x="130" y="130" width="200" height="16" rx="4" fill="rgba(34,197,94,0.1)"/>
      <text x="230" y="142" fill="#22c55e" fontSize="8" textAnchor="middle" fontWeight="bold">15,000 km/year = Rs.82,500 saved!</text>
    </svg>);
  if (svgId === 'ev_v2h') return (
    <svg viewBox="0 0 440 150" className="se-svg">
      <text x="220" y="14" fill="#888" fontSize="8" textAnchor="middle">VEHICLE-TO-HOME: YOUR CAR POWERS YOUR HOUSE!</text>
      <rect x="30" y="30" width="120" height="80" rx="10" fill="rgba(34,197,94,0.08)" stroke="#22c55e" strokeWidth="1.5"/>
      <text x="90" y="55" fill="#ddd" fontSize="18" textAnchor="middle">🚗</text>
      <text x="90" y="75" fill="#22c55e" fontSize="9" textAnchor="middle" fontWeight="bold">EV Battery</text>
      <text x="90" y="90" fill="#888" fontSize="8" textAnchor="middle">40 kWh stored</text>
      <text x="90" y="104" fill="#22c55e" fontSize="7" textAnchor="middle">= 3-4 days of power!</text>
      <path d="M155,55 L210,55" stroke="#fbbf24" strokeWidth="2" strokeDasharray="6,3" markerEnd="url(#evArr1)"><animate attributeName="stroke-dashoffset" values="0;-18" dur="1s" repeatCount="indefinite"/></path>
      <text x="183" y="48" fill="#fbbf24" fontSize="7" textAnchor="middle">DAY: Solar→Car</text>
      <path d="M210,80 L155,80" stroke="#a78bfa" strokeWidth="2" strokeDasharray="6,3" markerEnd="url(#evArr2)"><animate attributeName="stroke-dashoffset" values="0;-18" dur="1s" repeatCount="indefinite"/></path>
      <text x="183" y="93" fill="#a78bfa" fontSize="7" textAnchor="middle">NIGHT: Car→Home</text>
      <rect x="220" y="30" width="120" height="80" rx="10" fill="rgba(96,165,250,0.08)" stroke="#60a5fa" strokeWidth="1.5"/>
      <text x="280" y="55" fill="#ddd" fontSize="18" textAnchor="middle">🏠</text>
      <text x="280" y="75" fill="#60a5fa" fontSize="9" textAnchor="middle" fontWeight="bold">Your Home</text>
      <text x="280" y="90" fill="#888" fontSize="8" textAnchor="middle">Uses ~12 kWh/day</text>
      <circle cx="380" cy="55" r="20" fill="#fbbf24" opacity="0.15"><animate attributeName="r" values="18;22;18" dur="2s" repeatCount="indefinite"/></circle>
      <text x="380" y="60" fill="#fbbf24" fontSize="14" textAnchor="middle">☀️</text>
      <text x="380" y="80" fill="#888" fontSize="7" textAnchor="middle">Sun charges</text>
      <text x="380" y="90" fill="#888" fontSize="7" textAnchor="middle">everything!</text>
      <defs><marker id="evArr1" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="#fbbf24"/></marker><marker id="evArr2" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="#a78bfa"/></marker></defs>
    </svg>);

  // ═══ PHASE 6: WEATHER & MAINTENANCE ═══
  if (svgId === 'season_summer') return (
    <svg viewBox="0 0 440 150" className="se-svg">
      <circle cx="70" cy="50" r="30" fill="#fbbf24" opacity="0.2"><animate attributeName="r" values="28;33;28" dur="2s" repeatCount="indefinite"/></circle>
      <text x="70" y="55" fill="#fbbf24" fontSize="22" textAnchor="middle">☀️</text>
      <text x="70" y="85" fill="#fbbf24" fontSize="8" textAnchor="middle" fontWeight="bold">SUMMER</text>
      <text x="70" y="96" fill="#888" fontSize="7" textAnchor="middle">Mar - Jun</text>
      {[{l:'Solar Output',v:95,c:'#22c55e'},{l:'Daylight Hours',v:85,c:'#fbbf24'},{l:'Panel Heat Loss',v:15,c:'#ef4444'}].map((b,i)=>(
        <g key={i}><text x="150" y={35+i*35} fill="#ccc" fontSize="8">{b.l}</text>
        <rect x="260" y={25+i*35} width="150" height="14" rx="7" fill="rgba(255,255,255,0.05)"/>
        <rect x="260" y={25+i*35} width={b.v*1.5} height="14" rx="7" fill={b.c} opacity="0.6"><animate attributeName="width" from="0" to={b.v*1.5} dur="1s" begin={`${i*0.2}s`} fill="freeze"/></rect>
        <text x={265+b.v*1.5} y={36+i*35} fill={b.c} fontSize="8" fontWeight="bold">{b.v}%</text></g>))}
      <text x="300" y="135" fill="#22c55e" fontSize="9" textAnchor="middle" fontWeight="bold">28-30 units/day from 5kW system!</text>
    </svg>);
  if (svgId === 'season_monsoon') return (
    <svg viewBox="0 0 440 150" className="se-svg">
      <rect x="40" y="20" width="80" height="40" rx="20" fill="rgba(96,165,250,0.2)" stroke="#60a5fa" strokeWidth="1"/>
      <text x="80" y="45" fill="#60a5fa" fontSize="16" textAnchor="middle">🌧️</text>
      <text x="80" y="80" fill="#60a5fa" fontSize="8" textAnchor="middle" fontWeight="bold">MONSOON</text>
      <text x="80" y="92" fill="#888" fontSize="7" textAnchor="middle">Jul - Sep</text>
      {[0,1,2,3,4].map(i=><line key={i} x1={55+i*12} y1="62" x2={50+i*12} y2="70" stroke="#60a5fa" strokeWidth="1.5" opacity="0.4"><animate attributeName="y2" values="68;75;68" dur={`${0.8+i*0.1}s`} repeatCount="indefinite"/></line>)}
      <rect x="160" y="20" width="260" height="50" rx="8" fill="rgba(245,158,11,0.06)" stroke="#f59e0b" strokeWidth="1"/>
      <text x="290" y="38" fill="#f59e0b" fontSize="9" textAnchor="middle" fontWeight="bold">Output drops 30-50%</text>
      <text x="290" y="55" fill="#888" fontSize="8" textAnchor="middle">But panels still make 20-40% power on cloudy days!</text>
      <rect x="160" y="80" width="260" height="50" rx="8" fill="rgba(34,197,94,0.06)" stroke="#22c55e" strokeWidth="1"/>
      <text x="290" y="100" fill="#22c55e" fontSize="9" textAnchor="middle" fontWeight="bold">FREE Bonus: Rain cleans your panels!</text>
      <text x="290" y="118" fill="#888" fontSize="8" textAnchor="middle">No cleaning needed during monsoon season</text>
    </svg>);
  if (svgId === 'season_winter') return (
    <svg viewBox="0 0 440 150" className="se-svg">
      <text x="70" y="45" fill="#06b6d4" fontSize="22" textAnchor="middle">❄️</text>
      <text x="70" y="75" fill="#06b6d4" fontSize="8" textAnchor="middle" fontWeight="bold">WINTER</text>
      <text x="70" y="87" fill="#888" fontSize="7" textAnchor="middle">Oct - Feb</text>
      <rect x="150" y="15" width="270" height="55" rx="8" fill="rgba(6,182,212,0.06)" stroke="#06b6d4" strokeWidth="1"/>
      <text x="285" y="35" fill="#06b6d4" fontSize="9" textAnchor="middle" fontWeight="bold">Shorter days = less sunlight hours</text>
      <text x="285" y="52" fill="#888" fontSize="8" textAnchor="middle">But cooler weather makes panels MORE efficient!</text>
      <rect x="150" y="80" width="270" height="55" rx="8" fill="rgba(34,197,94,0.06)" stroke="#22c55e" strokeWidth="1"/>
      <text x="285" y="100" fill="#22c55e" fontSize="9" textAnchor="middle" fontWeight="bold">Yearly Average: 1,500-1,800 units per kW</text>
      <text x="285" y="118" fill="#22c55e" fontSize="8" textAnchor="middle">5kW = 7,500-9,000 units/year — enough for a full home!</text>
    </svg>);

  // ─── Maintenance ───
  if (svgId === 'maint_dirty') return (
    <svg viewBox="0 0 440 150" className="se-svg">
      <text x="220" y="14" fill="#888" fontSize="8" textAnchor="middle">DIRTY PANELS LOSE POWER!</text>
      <rect x="40" y="30" width="150" height="80" rx="6" fill="rgba(245,158,11,0.08)" stroke="#f59e0b" strokeWidth="1.5"/>
      {[0,1,2].map(r=>[0,1,2].map(c=><rect key={`${r}${c}`} x={52+c*45} y={40+r*22} width="38" height="18" rx="2" fill="rgba(139,92,246,0.15)" stroke="#888" strokeWidth="0.5"/>))}
      {[{x:60,y:48},{x:120,y:55},{x:85,y:70},{x:140,y:80},{x:100,y:90}].map((d,i)=><circle key={i} cx={d.x} cy={d.y} r="4" fill="rgba(139,92,246,0.4)" opacity="0.6"/>)}
      <text x="115" y="125" fill="#f59e0b" fontSize="8" textAnchor="middle">Dust + bird droppings</text>
      <rect x="240" y="40" width="160" height="25" rx="6" fill="rgba(239,68,68,0.1)" stroke="#ef4444" strokeWidth="1"/>
      <rect x="244" y="44" width="60" height="17" rx="4" fill="rgba(239,68,68,0.4)"><animate attributeName="width" from="150" to="60" dur="1.5s" fill="freeze"/></rect>
      <text x="410" y="57" fill="#ef4444" fontSize="8" fontWeight="bold">-25%</text>
      <text x="320" y="85" fill="#ef4444" fontSize="10" textAnchor="middle" fontWeight="bold">Power drops 15-25%!</text>
      <text x="320" y="105" fill="#888" fontSize="8" textAnchor="middle">In dusty cities: -25% in just 2 weeks</text>
    </svg>);
  if (svgId === 'maint_clean') return (
    <svg viewBox="0 0 440 150" className="se-svg">
      <text x="220" y="14" fill="#888" fontSize="8" textAnchor="middle">CLEAN PANELS = MAXIMUM POWER</text>
      <rect x="40" y="30" width="150" height="80" rx="6" fill="rgba(34,197,94,0.08)" stroke="#22c55e" strokeWidth="1.5"/>
      {[0,1,2].map(r=>[0,1,2].map(c=><rect key={`${r}${c}`} x={52+c*45} y={40+r*22} width="38" height="18" rx="2" fill="rgba(96,165,250,0.25)" stroke="#60a5fa" strokeWidth="0.5"/>))}
      <text x="115" y="125" fill="#22c55e" fontSize="8" textAnchor="middle" fontWeight="bold">Sparkling clean!</text>
      <rect x="240" y="40" width="160" height="25" rx="6" fill="rgba(34,197,94,0.1)" stroke="#22c55e" strokeWidth="1"/>
      <rect x="244" y="44" width="150" height="17" rx="4" fill="rgba(34,197,94,0.5)"><animate attributeName="width" from="60" to="150" dur="1.5s" fill="freeze"/></rect>
      <text x="410" y="57" fill="#22c55e" fontSize="8" fontWeight="bold">100%</text>
      <text x="320" y="85" fill="#22c55e" fontSize="10" textAnchor="middle" fontWeight="bold">Full power restored!</text>
      <text x="320" y="105" fill="#888" fontSize="8" textAnchor="middle">Clean every 2-4 weeks with soft water</text>
      <text x="320" y="120" fill="#888" fontSize="7" textAnchor="middle">Best time: early morning when cool</text>
    </svg>);
  if (svgId === 'maint_check') return (
    <svg viewBox="0 0 440 150" className="se-svg">
      <text x="220" y="14" fill="#888" fontSize="8" textAnchor="middle">YEARLY CHECKUP ITEMS</text>
      {[{t:'Check all wiring connections',d:true},{t:'Inspect inverter health',d:true},{t:'Clean panel surfaces',d:true},{t:'Test power output',d:false},{t:'Check mounting bolts',d:false}].map((item,i)=>(
        <g key={i}><rect x="60" y={25+i*23} width="320" height="19" rx="6" fill={item.d?"rgba(34,197,94,0.06)":"rgba(255,255,255,0.03)"} stroke={item.d?"#22c55e33":"#33333388"} strokeWidth="1"/>
        <text x="80" y={38+i*23} fill={item.d?"#22c55e":"#888"} fontSize="9">{item.d?"✅":"⬜"} {item.t}</text></g>))}
      <rect x="100" y="125" width="240" height="20" rx="6" fill="rgba(34,197,94,0.08)" stroke="#22c55e" strokeWidth="1"/>
      <text x="220" y="139" fill="#22c55e" fontSize="8" textAnchor="middle" fontWeight="bold">Cost: Rs.2,000-3,000/year — panels last 25+ years!</text>
    </svg>);

  // ─── Monsoon Safety ───
  if (svgId === 'monsoon_lightning') return (
    <svg viewBox="0 0 440 150" className="se-svg">
      <rect x="150" y="15" width="140" height="60" rx="6" fill="rgba(96,165,250,0.08)" stroke="#60a5fa" strokeWidth="1"/>
      <text x="220" y="35" fill="#60a5fa" fontSize="8" textAnchor="middle">Solar System</text>
      <rect x="170" y="42" width="30" height="20" rx="2" fill="rgba(96,165,250,0.2)"/><rect x="210" y="42" width="30" height="20" rx="2" fill="rgba(96,165,250,0.2)"/>
      <path d="M220,0 L210,15 L225,15 L200,45" stroke="#fbbf24" strokeWidth="3" fill="none"><animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite"/></path>
      <text x="80" y="55" fill="#ef4444" fontSize="9" fontWeight="bold">⚡ Lightning!</text>
      <text x="80" y="70" fill="#ef4444" fontSize="7">1 strike = Rs.1-2 Lakh damage</text>
      <rect x="100" y="90" width="240" height="45" rx="8" fill="rgba(34,197,94,0.08)" stroke="#22c55e" strokeWidth="1.5"/>
      <text x="220" y="108" fill="#22c55e" fontSize="9" textAnchor="middle" fontWeight="bold">🛡️ Lightning Protector: Rs.3,000-5,000</text>
      <text x="220" y="125" fill="#22c55e" fontSize="8" textAnchor="middle">Saves your entire system! Always install one.</text>
    </svg>);
  if (svgId === 'monsoon_protect') return (
    <svg viewBox="0 0 440 150" className="se-svg">
      <text x="220" y="14" fill="#888" fontSize="8" textAnchor="middle">3 THINGS YOU NEED FOR STORM PROTECTION</text>
      {[{n:'Lightning Rod',loc:'On Roof',cost:'Rs.3-5K',icon:'⚡',c:'#fbbf24',x:30},{n:'Surge Protector',loc:'On Inverter',cost:'Rs.2-3K',icon:'🛡️',c:'#a78bfa',x:165},{n:'Earth Grounding',loc:'3 Copper Rods',cost:'Rs.5-8K',icon:'🔌',c:'#22c55e',x:300}].map((p,i)=>(
        <g key={i}><rect x={p.x} y="22" width="120" height="95" rx="8" fill={`${p.c}11`} stroke={p.c} strokeWidth="1.5"/>
        <text x={p.x+60} y="42" fill={p.c} fontSize="16" textAnchor="middle">{p.icon}</text>
        <text x={p.x+60} y="60" fill={p.c} fontSize="9" textAnchor="middle" fontWeight="bold">{p.n}</text>
        <text x={p.x+60} y="78" fill="#aaa" fontSize="7" textAnchor="middle">{p.loc}</text>
        <text x={p.x+60} y="95" fill="#888" fontSize="8" textAnchor="middle">{p.cost}</text>
        <text x={p.x+60} y="110" fill="#22c55e" fontSize="7" textAnchor="middle">✅ Essential!</text></g>))}
      <text x="220" y="140" fill="#f59e0b" fontSize="8" textAnchor="middle" fontWeight="bold">Total: Rs.10-16K for complete storm protection</text>
    </svg>);
  if (svgId === 'monsoon_wind') return (
    <svg viewBox="0 0 440 150" className="se-svg">
      <text x="220" y="14" fill="#888" fontSize="8" textAnchor="middle">BUILT TO WITHSTAND EXTREME WEATHER</text>
      <rect x="160" y="40" width="120" height="60" rx="4" fill="rgba(96,165,250,0.1)" stroke="#60a5fa" strokeWidth="2" transform="rotate(-5 220 70)"/>
      {[0,1,2].map(c=><rect key={c} x={172+c*38} y="48" width="32" height="20" rx="2" fill="rgba(96,165,250,0.25)" transform="rotate(-5 220 70)"/>)}
      {[0,1,2,3].map(i=><path key={i} d={`M${30+i*10},${50+i*8} Q${80+i*15},${40+i*5} ${140},${55+i*5}`} stroke="#60a5fa" strokeWidth="1.5" fill="none" opacity={0.3+i*0.1}><animate attributeName="d" values={`M${30+i*10},${50+i*8} Q${80+i*15},${40+i*5} ${140},${55+i*5};M${30+i*10},${55+i*8} Q${80+i*15},${45+i*5} ${140},${60+i*5};M${30+i*10},${50+i*8} Q${80+i*15},${40+i*5} ${140},${55+i*5}`} dur={`${1.5+i*0.2}s`} repeatCount="indefinite"/></path>)}
      <text x="60" y="100" fill="#60a5fa" fontSize="8" textAnchor="middle">💨 150 km/h wind</text>
      <rect x="300" y="30" width="120" height="100" rx="10" fill="rgba(34,197,94,0.06)" stroke="#22c55e" strokeWidth="1"/>
      <text x="360" y="52" fill="#22c55e" fontSize="9" textAnchor="middle" fontWeight="bold">Protected!</text>
      <text x="360" y="70" fill="#ccc" fontSize="7" textAnchor="middle">✅ Wind: 150 km/h</text>
      <text x="360" y="85" fill="#ccc" fontSize="7" textAnchor="middle">✅ Waterproof boxes</text>
      <text x="360" y="100" fill="#ccc" fontSize="7" textAnchor="middle">✅ Hail-proof glass</text>
      <text x="360" y="115" fill="#ccc" fontSize="7" textAnchor="middle">✅ Rain slides off</text>
    </svg>);

  // ═══ PHASE 7: ENVIRONMENTAL IMPACT ═══
  if (svgId === 'co2_what') return (
    <svg viewBox="0 0 440 150" className="se-svg">
      <circle cx="110" cy="70" r="45" fill="rgba(96,165,250,0.08)" stroke="#60a5fa" strokeWidth="1.5"/>
      <text x="110" y="65" fill="#60a5fa" fontSize="28" textAnchor="middle">🌍</text>
      <text x="110" y="95" fill="#888" fontSize="7" textAnchor="middle">Our Earth</text>
      <ellipse cx="110" cy="70" rx="55" ry="55" fill="none" stroke="#ef4444" strokeWidth="1" strokeDasharray="4,3" opacity="0.4"><animate attributeName="rx" values="53;58;53" dur="3s" repeatCount="indefinite"/></ellipse>
      <text x="110" y="135" fill="#ef4444" fontSize="7" textAnchor="middle">CO₂ blanket traps heat!</text>
      <rect x="220" y="20" width="200" height="110" rx="8" fill="rgba(239,68,68,0.05)" stroke="#ef4444" strokeWidth="1"/>
      <text x="320" y="40" fill="#ef4444" fontSize="9" textAnchor="middle" fontWeight="bold">What is CO₂?</text>
      <text x="320" y="58" fill="#ccc" fontSize="8" textAnchor="middle">A harmful gas from burning</text>
      <text x="320" y="72" fill="#ccc" fontSize="8" textAnchor="middle">coal, petrol, and gas</text>
      <text x="320" y="92" fill="#ef4444" fontSize="8" textAnchor="middle" fontWeight="bold">Too much = Earth gets hotter!</text>
      <text x="320" y="110" fill="#888" fontSize="7" textAnchor="middle">India: 70% electricity from coal</text>
      <text x="320" y="122" fill="#888" fontSize="7" textAnchor="middle">Each unit = 0.82 kg CO₂ released</text>
    </svg>);
  if (svgId === 'co2_prevent') return (
    <svg viewBox="0 0 440 150" className="se-svg">
      <text x="220" y="14" fill="#888" fontSize="8" textAnchor="middle">SOLAR vs COAL: POLLUTION COMPARISON</text>
      <rect x="20" y="25" width="180" height="110" rx="8" fill="rgba(34,197,94,0.06)" stroke="#22c55e" strokeWidth="1.5"/>
      <text x="110" y="45" fill="#22c55e" fontSize="16" textAnchor="middle">☀️</text>
      <text x="110" y="65" fill="#22c55e" fontSize="10" textAnchor="middle" fontWeight="bold">Solar Energy</text>
      <text x="110" y="82" fill="#22c55e" fontSize="14" textAnchor="middle" fontWeight="bold">ZERO CO₂</text>
      <text x="110" y="100" fill="#888" fontSize="7" textAnchor="middle">5kW prevents 6,150 kg/year</text>
      <text x="110" y="115" fill="#22c55e" fontSize="7" textAnchor="middle">= removing 2 cars!</text>
      <rect x="240" y="25" width="180" height="110" rx="8" fill="rgba(239,68,68,0.06)" stroke="#ef4444" strokeWidth="1.5"/>
      <text x="330" y="45" fill="#ef4444" fontSize="16" textAnchor="middle">🏭</text>
      <text x="330" y="65" fill="#ef4444" fontSize="10" textAnchor="middle" fontWeight="bold">Coal Power</text>
      <text x="330" y="82" fill="#ef4444" fontSize="14" textAnchor="middle" fontWeight="bold">820g/unit</text>
      <text x="330" y="100" fill="#888" fontSize="7" textAnchor="middle">Releases smoke, ash,</text>
      <text x="330" y="115" fill="#ef4444" fontSize="7" textAnchor="middle">and harmful gases</text>
    </svg>);
  if (svgId === 'co2_trees') return (
    <svg viewBox="0 0 440 150" className="se-svg">
      <text x="220" y="14" fill="#888" fontSize="8" textAnchor="middle">YOUR SOLAR HOME = PLANTING A FOREST!</text>
      <rect x="30" y="25" width="100" height="80" rx="8" fill="rgba(34,197,94,0.08)" stroke="#22c55e" strokeWidth="1"/>
      <text x="80" y="50" fill="#22c55e" fontSize="24" textAnchor="middle">☀️</text>
      <text x="80" y="72" fill="#22c55e" fontSize="8" textAnchor="middle" fontWeight="bold">1 Solar Home</text>
      <text x="80" y="86" fill="#888" fontSize="7" textAnchor="middle">5kW system</text>
      <text x="160" y="65" fill="#22c55e" fontSize="16">=</text>
      <rect x="190" y="25" width="230" height="80" rx="8" fill="rgba(34,197,94,0.06)" stroke="#22c55e" strokeWidth="1"/>
      {[0,1,2,3,4,5,6].map(i=><text key={i} x={210+i*30} y="55" fill="#22c55e" fontSize="14" textAnchor="middle">🌳</text>)}
      <text x="305" y="75" fill="#22c55e" fontSize="10" textAnchor="middle" fontWeight="bold">280 Neem Trees!</text>
      <text x="305" y="90" fill="#888" fontSize="7" textAnchor="middle">25 years = 153 TONNES CO₂ prevented</text>
      <rect x="80" y="115" width="280" height="25" rx="6" fill="rgba(34,197,94,0.1)" stroke="#22c55e" strokeWidth="1"/>
      <text x="220" y="132" fill="#22c55e" fontSize="8" textAnchor="middle" fontWeight="bold">1 crore solar homes = India's entire airplane pollution!</text>
    </svg>);
  if (svgId === 'community_what') return (
    <svg viewBox="0 0 440 150" className="se-svg">
      <rect x="50" y="30" width="100" height="90" rx="4" fill="rgba(96,165,250,0.08)" stroke="#60a5fa" strokeWidth="1.5"/>
      {[0,1,2].map(r=>[0,1].map(c=><rect key={`${r}${c}`} x={60+c*40} y={40+r*25} width="30" height="18" rx="2" fill="rgba(96,165,250,0.15)" stroke="#60a5fa" strokeWidth="0.5"/>))}
      <rect x="70" y="22" width="60" height="12" rx="3" fill="rgba(251,191,36,0.2)" stroke="#fbbf24" strokeWidth="1"/>
      <text x="100" y="31" fill="#fbbf24" fontSize="7" textAnchor="middle">Shared Panels</text>
      <text x="100" y="132" fill="#60a5fa" fontSize="8" textAnchor="middle" fontWeight="bold">Apartment Building</text>
      <rect x="210" y="25" width="210" height="105" rx="8" fill="rgba(34,197,94,0.05)" stroke="#22c55e" strokeWidth="1"/>
      <text x="315" y="45" fill="#22c55e" fontSize="9" textAnchor="middle" fontWeight="bold">Community Solar Benefits</text>
      <text x="315" y="65" fill="#ccc" fontSize="8" textAnchor="middle">✅ 15-20% cheaper per family</text>
      <text x="315" y="82" fill="#ccc" fontSize="8" textAnchor="middle">✅ Share one big system</text>
      <text x="315" y="99" fill="#ccc" fontSize="8" textAnchor="middle">✅ Less roof space needed</text>
      <text x="315" y="118" fill="#22c55e" fontSize="8" textAnchor="middle" fontWeight="bold">Everyone saves together!</text>
    </svg>);
  if (svgId === 'community_india') return (
    <svg viewBox="0 0 440 150" className="se-svg">
      <text x="220" y="14" fill="#888" fontSize="8" textAnchor="middle">INDIA'S SOLAR POWER JOURNEY</text>
      {[{l:'Now: 100 GW',w:60,c:'#22c55e',y:30},{l:'Target: 500 GW by 2030',w:150,c:'#fbbf24',y:65},{l:'PM Surya Ghar: 1 Crore Homes',w:120,c:'#a78bfa',y:100}].map((b,i)=>(
        <g key={i}><text x="20" y={b.y+12} fill="#ccc" fontSize="8">{b.l}</text>
        <rect x="220" y={b.y} width="200" height="20" rx="10" fill="rgba(255,255,255,0.04)"/>
        <rect x="220" y={b.y} width={b.w} height="20" rx="10" fill={b.c} opacity="0.5"><animate attributeName="width" from="0" to={b.w} dur="1.2s" begin={`${i*0.3}s`} fill="freeze"/></rect></g>))}
      <rect x="100" y="128" width="240" height="18" rx="4" fill="rgba(34,197,94,0.08)"/>
      <text x="220" y="140" fill="#22c55e" fontSize="8" textAnchor="middle" fontWeight="bold">India is 3rd largest solar producer in the world!</text>
    </svg>);
  if (svgId === 'community_impact') return (
    <svg viewBox="0 0 440 150" className="se-svg">
      <text x="220" y="14" fill="#888" fontSize="8" textAnchor="middle">ONE SOLAR HOME INSPIRES MANY!</text>
      <circle cx="220" cy="75" r="20" fill="rgba(34,197,94,0.15)" stroke="#22c55e" strokeWidth="2"><animate attributeName="r" values="18;22;18" dur="2s" repeatCount="indefinite"/></circle>
      <text x="220" y="72" fill="#22c55e" fontSize="12" textAnchor="middle">🏠</text>
      <text x="220" y="85" fill="#22c55e" fontSize="6" textAnchor="middle">YOUR HOME</text>
      {[0,1,2,3].map(i=><circle key={i} cx="220" cy="75" r={35+i*18} fill="none" stroke="#22c55e" strokeWidth="0.8" opacity={0.3-i*0.05}><animate attributeName="r" values={`${33+i*18};${38+i*18};${33+i*18}`} dur="3s" begin={`${i*0.5}s`} repeatCount="indefinite"/></circle>)}
      {[{x:170,y:40},{x:270,y:40},{x:160,y:110},{x:280,y:110}].map((p,i)=><text key={i} x={p.x} y={p.y} fill="#60a5fa" fontSize="10" textAnchor="middle">🏠</text>)}
      <text x="220" y="140" fill="#22c55e" fontSize="8" textAnchor="middle" fontWeight="bold">1 solar home → 3-4 more neighbors go solar!</text>
    </svg>);
  if (svgId === 'future_bifacial') return (
    <svg viewBox="0 0 440 150" className="se-svg">
      <text x="220" y="14" fill="#888" fontSize="8" textAnchor="middle">TWO-SIDED SOLAR PANELS</text>
      <circle cx="220" cy="40" r="16" fill="#fbbf24" opacity="0.3"><animate attributeName="r" values="14;18;14" dur="2s" repeatCount="indefinite"/></circle>
      <text x="220" y="44" fill="#fbbf24" fontSize="10" textAnchor="middle">☀️</text>
      <line x1="220" y1="56" x2="220" y2="70" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="3,2"><animate attributeName="stroke-dashoffset" values="0;-10" dur="1s" repeatCount="indefinite"/></line>
      <rect x="140" y="72" width="160" height="8" rx="2" fill="rgba(96,165,250,0.4)" stroke="#60a5fa" strokeWidth="1.5"/>
      <text x="130" y="78" fill="#60a5fa" fontSize="7" textAnchor="end">TOP</text>
      <text x="310" y="78" fill="#a78bfa" fontSize="7">BOTTOM</text>
      <line x1="220" y1="82" x2="220" y2="100" stroke="#a78bfa" strokeWidth="1" strokeDasharray="3,2" opacity="0.5"/>
      <rect x="180" y="102" width="80" height="12" rx="3" fill="rgba(167,139,250,0.1)"/>
      <text x="220" y="111" fill="#a78bfa" fontSize="7" textAnchor="middle">Reflected light</text>
      <rect x="30" y="95" width="100" height="40" rx="6" fill="rgba(34,197,94,0.08)" stroke="#22c55e" strokeWidth="1"/>
      <text x="80" y="112" fill="#22c55e" fontSize="9" textAnchor="middle" fontWeight="bold">+10-30%</text>
      <text x="80" y="126" fill="#888" fontSize="7" textAnchor="middle">More power!</text>
      <rect x="310" y="95" width="110" height="40" rx="6" fill="rgba(245,158,11,0.08)" stroke="#f59e0b" strokeWidth="1"/>
      <text x="365" y="112" fill="#f59e0b" fontSize="8" textAnchor="middle" fontWeight="bold">White roof = +15%</text>
      <text x="365" y="126" fill="#888" fontSize="7" textAnchor="middle">reflects more light</text>
    </svg>);
  if (svgId === 'future_tiles') return (
    <svg viewBox="0 0 440 150" className="se-svg">
      <text x="220" y="14" fill="#888" fontSize="8" textAnchor="middle">SOLAR ROOF TILES — THE FUTURE!</text>
      <path d="M120,50 L220,25 L320,50 L320,110 L120,110 Z" fill="rgba(139,92,246,0.06)" stroke="#a78bfa" strokeWidth="1.5"/>
      {[0,1,2,3].map(r=>[0,1,2,3].map(c=><rect key={`${r}${c}`} x={135+c*42} y={55+r*14} width="38" height="11" rx="1" fill="rgba(139,92,246,0.15)" stroke="#a78bfa" strokeWidth="0.4"/>))}
      <text x="220" y="122" fill="#a78bfa" fontSize="8" textAnchor="middle" fontWeight="bold">Looks like normal tiles!</text>
      <rect x="340" y="30" width="85" height="90" rx="8" fill="rgba(34,197,94,0.06)" stroke="#22c55e" strokeWidth="1"/>
      <text x="382" y="50" fill="#22c55e" fontSize="8" textAnchor="middle" fontWeight="bold">Benefits</text>
      <text x="382" y="68" fill="#ccc" fontSize="7" textAnchor="middle">✅ Beautiful</text>
      <text x="382" y="82" fill="#ccc" fontSize="7" textAnchor="middle">✅ 50+ years</text>
      <text x="382" y="96" fill="#ccc" fontSize="7" textAnchor="middle">✅ Weatherproof</text>
      <text x="382" y="110" fill="#22c55e" fontSize="7" textAnchor="middle">Available soon!</text>
    </svg>);
  if (svgId === 'future_battery') return (
    <svg viewBox="0 0 440 150" className="se-svg">
      <text x="220" y="14" fill="#888" fontSize="8" textAnchor="middle">SUPER BATTERIES OF THE FUTURE</text>
      <rect x="30" y="25" width="170" height="55" rx="8" fill="rgba(139,92,246,0.06)" stroke="#a78bfa" strokeWidth="1.5"/>
      <text x="115" y="42" fill="#a78bfa" fontSize="9" textAnchor="middle" fontWeight="bold">Solid-State Battery</text>
      <text x="115" y="57" fill="#ccc" fontSize="7" textAnchor="middle">Coming 2026-2028</text>
      <text x="115" y="72" fill="#22c55e" fontSize="8" textAnchor="middle" fontWeight="bold">2x storage, 20+ year life!</text>
      <rect x="240" y="25" width="170" height="55" rx="8" fill="rgba(245,158,11,0.06)" stroke="#f59e0b" strokeWidth="1.5"/>
      <text x="325" y="42" fill="#f59e0b" fontSize="9" textAnchor="middle" fontWeight="bold">Printable Solar Cells</text>
      <text x="325" y="57" fill="#ccc" fontSize="7" textAnchor="middle">30%+ efficiency</text>
      <text x="325" y="72" fill="#f59e0b" fontSize="8" textAnchor="middle" fontWeight="bold">Print on any surface!</text>
      <rect x="80" y="95" width="280" height="40" rx="10" fill="rgba(34,197,94,0.08)" stroke="#22c55e" strokeWidth="1.5"/>
      <text x="220" y="112" fill="#22c55e" fontSize="10" textAnchor="middle" fontWeight="bold">🔮 Windows, walls, backpacks = solar power!</text>
      <text x="220" y="128" fill="#888" fontSize="8" textAnchor="middle">This future is only 5-10 years away</text>
    </svg>);

  // ═══ PHASE 8: ACTION PLAN ═══
  if (svgId === 'savings_invest') return (
    <svg viewBox="0 0 440 150" className="se-svg">
      <text x="220" y="14" fill="#888" fontSize="8" textAnchor="middle">5kW SOLAR SYSTEM — WHERE YOUR MONEY GOES</text>
      <circle cx="110" cy="85" r="55" fill="none" stroke="#22c55e" strokeWidth="1" opacity="0.3"/>
      <path d="M110,30 A55,55 0 0,1 161,113" fill="rgba(96,165,250,0.2)" stroke="#60a5fa" strokeWidth="2"/>
      <path d="M110,30 A55,55 0 0,0 59,113" fill="rgba(139,92,246,0.2)" stroke="#a78bfa" strokeWidth="2"/>
      <path d="M59,113 A55,55 0 0,0 161,113" fill="rgba(34,197,94,0.2)" stroke="#22c55e" strokeWidth="2"/>
      <text x="130" y="65" fill="#60a5fa" fontSize="7" fontWeight="bold">Panels 55%</text>
      <text x="75" y="65" fill="#a78bfa" fontSize="7" fontWeight="bold">Inverter 20%</text>
      <text x="110" y="115" fill="#22c55e" fontSize="7" fontWeight="bold">Install 25%</text>
      <rect x="210" y="25" width="210" height="105" rx="8" fill="rgba(34,197,94,0.05)" stroke="#22c55e" strokeWidth="1"/>
      <text x="315" y="42" fill="#22c55e" fontSize="9" textAnchor="middle" fontWeight="bold">TOTAL COST (5kW)</text>
      <text x="315" y="60" fill="#fff" fontSize="12" textAnchor="middle" fontWeight="bold">Rs.3-3.5 Lakhs</text>
      <text x="315" y="78" fill="#fbbf24" fontSize="9" textAnchor="middle" fontWeight="bold">- Rs.78,000 Govt Subsidy!</text>
      <text x="315" y="95" fill="#22c55e" fontSize="10" textAnchor="middle" fontWeight="bold">You Pay: Rs.2.2-2.7 Lakhs</text>
      <text x="315" y="115" fill="#888" fontSize="7" textAnchor="middle">EMI available: Rs.3,000-5,000/month</text>
    </svg>);
  if (svgId === 'savings_graph') return (
    <svg viewBox="0 0 440 150" className="se-svg">
      <text x="220" y="14" fill="#888" fontSize="8" textAnchor="middle">25-YEAR SAVINGS JOURNEY</text>
      <line x1="40" y1="130" x2="420" y2="130" stroke="#333" strokeWidth="1"/>
      <line x1="40" y1="25" x2="40" y2="130" stroke="#333" strokeWidth="1"/>
      <path d="M40,120 L100,115 L160,100 L220,80 L280,55 L340,35 L400,25" fill="none" stroke="#22c55e" strokeWidth="2.5"><animate attributeName="stroke-dasharray" values="0,500;500,0" dur="2s" fill="freeze"/></path>
      <path d="M40,120 L100,115 L160,100 L220,80 L280,55 L340,35 L400,25" fill="rgba(34,197,94,0.08)" stroke="none"/>
      <line x1="160" y1="25" x2="160" y2="130" stroke="#fbbf24" strokeWidth="1" strokeDasharray="4,3" opacity="0.5"/>
      <text x="160" y="22" fill="#fbbf24" fontSize="7" textAnchor="middle">Break-even: 4 yrs</text>
      {[{x:40,l:'0'},{x:160,l:'5yr'},{x:280,l:'15yr'},{x:400,l:'25yr'}].map((t,i)=><text key={i} x={t.x} y="142" fill="#888" fontSize="7" textAnchor="middle">{t.l}</text>)}
      <rect x="310" y="45" width="110" height="35" rx="6" fill="rgba(34,197,94,0.15)" stroke="#22c55e" strokeWidth="1"/>
      <text x="365" y="60" fill="#22c55e" fontSize="8" textAnchor="middle" fontWeight="bold">Total Savings</text>
      <text x="365" y="74" fill="#22c55e" fontSize="10" textAnchor="middle" fontWeight="bold">Rs.25-30 Lakhs!</text>
    </svg>);
  if (svgId === 'savings_roi') return (
    <svg viewBox="0 0 440 150" className="se-svg">
      <text x="220" y="14" fill="#888" fontSize="8" textAnchor="middle">RETURN ON INVESTMENT COMPARISON</text>
      {[{n:'Solar System',ret:'25-30%',w:150,c:'#22c55e',y:28},{n:'Fixed Deposit',ret:'7%',w:42,c:'#60a5fa',y:60},{n:'Gold',ret:'10%',w:60,c:'#fbbf24',y:92},{n:'Savings Account',ret:'4%',w:24,c:'#888',y:124}].map((v,i)=>(
        <g key={i}><text x="15" y={v.y+10} fill="#ddd" fontSize="8">{v.n}</text>
        <rect x="140" y={v.y} width="200" height="18" rx="9" fill="rgba(255,255,255,0.04)"/>
        <rect x="140" y={v.y} width={v.w} height="18" rx="9" fill={v.c} opacity="0.5"><animate attributeName="width" from="0" to={v.w} dur="1s" begin={`${i*0.2}s`} fill="freeze"/></rect>
        <text x="350" y={v.y+13} fill={v.c} fontSize="9" fontWeight="bold">{v.ret}/year</text></g>))}
    </svg>);
  if (svgId === 'review_basics') return (
    <svg viewBox="0 0 440 150" className="se-svg">
      <text x="220" y="14" fill="#888" fontSize="8" textAnchor="middle">WHAT YOU LEARNED — SOLAR BASICS</text>
      {[{icon:'☀️',t:'Sun → Electricity',sub:'Solar cells convert light',c:'#fbbf24',x:55},{icon:'🔄',t:'Inverter',sub:'Changes power type',c:'#a78bfa',x:165},{icon:'📊',t:'Smart Meter',sub:'Counts both ways',c:'#22c55e',x:275},{icon:'🏠',t:'System Types',sub:'On/Off/Hybrid grid',c:'#60a5fa',x:385}].map((item,i)=>(
        <g key={i}><rect x={item.x-45} y="25" width="90" height="105" rx="8" fill={`${item.c}11`} stroke={item.c} strokeWidth="1"/>
        <text x={item.x} y="50" fill={item.c} fontSize="18" textAnchor="middle">{item.icon}</text>
        <text x={item.x} y="70" fill={item.c} fontSize="8" textAnchor="middle" fontWeight="bold">{item.t}</text>
        <text x={item.x} y="85" fill="#888" fontSize="7" textAnchor="middle">{item.sub}</text>
        <text x={item.x} y="120" fill="#22c55e" fontSize="10" textAnchor="middle">✅</text></g>))}
    </svg>);
  if (svgId === 'review_install') return (
    <svg viewBox="0 0 440 150" className="se-svg">
      <text x="220" y="14" fill="#888" fontSize="8" textAnchor="middle">WHAT YOU LEARNED — INSTALLATION & SMART ENERGY</text>
      {[{t:'Panel Installation',s:'Roof angle + direction',y:28},{t:'Battery Storage',s:'Store power for night',y:52},{t:'Smart Timing',s:'Use appliances during sun',y:76},{t:'Smart Sensors',s:'Auto lights + AC control',y:100},{t:'EV + Solar',s:'Free car charging!',y:124}].map((item,i)=>(
        <g key={i}><rect x="40" y={item.y} width="360" height="20" rx="6" fill="rgba(34,197,94,0.05)" stroke="#22c55e33" strokeWidth="1"/>
        <text x="55" y={item.y+14} fill="#22c55e" fontSize="9">✅</text>
        <text x="75" y={item.y+14} fill="#ddd" fontSize="8" fontWeight="bold">{item.t}</text>
        <text x="385" y={item.y+14} fill="#888" fontSize="7" textAnchor="end">{item.s}</text></g>))}
    </svg>);
  if (svgId === 'review_env') return (
    <svg viewBox="0 0 440 150" className="se-svg">
      <text x="220" y="14" fill="#888" fontSize="8" textAnchor="middle">WHAT YOU LEARNED — ENVIRONMENT & FUTURE</text>
      <rect x="20" y="25" width="130" height="55" rx="8" fill="rgba(34,197,94,0.06)" stroke="#22c55e" strokeWidth="1"/>
      <text x="85" y="42" fill="#22c55e" fontSize="14" textAnchor="middle">🌍</text>
      <text x="85" y="58" fill="#22c55e" fontSize="8" textAnchor="middle" fontWeight="bold">6,150 kg CO₂</text>
      <text x="85" y="72" fill="#888" fontSize="7" textAnchor="middle">saved per year</text>
      <rect x="160" y="25" width="120" height="55" rx="8" fill="rgba(34,197,94,0.06)" stroke="#22c55e" strokeWidth="1"/>
      <text x="220" y="42" fill="#22c55e" fontSize="14" textAnchor="middle">🌳</text>
      <text x="220" y="58" fill="#22c55e" fontSize="8" textAnchor="middle" fontWeight="bold">280 Trees</text>
      <text x="220" y="72" fill="#888" fontSize="7" textAnchor="middle">equivalent</text>
      <rect x="290" y="25" width="130" height="55" rx="8" fill="rgba(34,197,94,0.06)" stroke="#22c55e" strokeWidth="1"/>
      <text x="355" y="42" fill="#22c55e" fontSize="14" textAnchor="middle">🔮</text>
      <text x="355" y="58" fill="#22c55e" fontSize="8" textAnchor="middle" fontWeight="bold">Future Tech</text>
      <text x="355" y="72" fill="#888" fontSize="7" textAnchor="middle">solar everywhere!</text>
      <rect x="60" y="95" width="320" height="40" rx="10" fill="rgba(34,197,94,0.1)" stroke="#22c55e" strokeWidth="1.5"/>
      <text x="220" y="112" fill="#22c55e" fontSize="10" textAnchor="middle" fontWeight="bold">You are now a Solar Energy Expert! 🎓</text>
      <text x="220" y="128" fill="#888" fontSize="8" textAnchor="middle">Ready to make a difference for our planet</text>
    </svg>);
  if (svgId === 'action_start') return (
    <svg viewBox="0 0 440 150" className="se-svg">
      <text x="220" y="14" fill="#888" fontSize="8" textAnchor="middle">YOUR SOLAR JOURNEY — STEPS 1-4</text>
      {[{n:'1. Check Roof',d:'Flat or sloped?',icon:'🏠',c:'#60a5fa',x:55},{n:'2. Calculate',d:'How many panels?',icon:'🧮',c:'#a78bfa',x:165},{n:'3. Get Quotes',d:'Compare 3 vendors',icon:'📋',c:'#f59e0b',x:275},{n:'4. Apply Subsidy',d:'PM Surya Ghar',icon:'🏛️',c:'#22c55e',x:385}].map((s,i)=>(
        <g key={i}><circle cx={s.x} cy="55" r="22" fill={`${s.c}15`} stroke={s.c} strokeWidth="1.5"/>
        <text x={s.x} y="52" fill={s.c} fontSize="14" textAnchor="middle">{s.icon}</text>
        <text x={s.x} y="90" fill={s.c} fontSize="8" textAnchor="middle" fontWeight="bold">{s.n}</text>
        <text x={s.x} y="105" fill="#888" fontSize="7" textAnchor="middle">{s.d}</text>
        {i<3 && <path d={`M${s.x+25},55 L${s.x+85},55`} stroke={s.c} strokeWidth="1" strokeDasharray="4,3" opacity="0.4" markerEnd="url(#actArr)"/>}</g>))}
      <rect x="80" y="120" width="280" height="22" rx="6" fill="rgba(34,197,94,0.08)"/>
      <text x="220" y="135" fill="#22c55e" fontSize="8" textAnchor="middle" fontWeight="bold">This takes just 1-2 weeks!</text>
      <defs><marker id="actArr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto"><path d="M0,0 L10,5 L0,10" fill="none" stroke="#22c55e" strokeWidth="2"/></marker></defs>
    </svg>);
  if (svgId === 'action_install') return (
    <svg viewBox="0 0 440 150" className="se-svg">
      <text x="220" y="14" fill="#888" fontSize="8" textAnchor="middle">INSTALLATION STEPS 5-7</text>
      {[{n:'5. Installation',d:'1-3 days work',detail:'Mount panels + wiring',c:'#60a5fa',y:28},{n:'6. Inspection',d:'DISCOM approval',detail:'Safety check by officials',c:'#a78bfa',y:68},{n:'7. Meter Change',d:'Net meter installed',detail:'Start selling extra power!',c:'#22c55e',y:108}].map((s,i)=>(
        <g key={i}><rect x="30" y={s.y} width="380" height="32" rx="8" fill={`${s.c}11`} stroke={s.c} strokeWidth="1"/>
        <circle cx="55" cy={s.y+16} r="10" fill={`${s.c}33`}/>
        <text x="55" y={s.y+20} fill={s.c} fontSize="8" textAnchor="middle" fontWeight="bold">{i+5}</text>
        <text x="80" y={s.y+13} fill={s.c} fontSize="9" fontWeight="bold">{s.n}</text>
        <text x="80" y={s.y+26} fill="#888" fontSize="7">{s.detail}</text>
        <text x="390" y={s.y+18} fill="#888" fontSize="7" textAnchor="end">{s.d}</text></g>))}
    </svg>);
  if (svgId === 'action_save') return (
    <svg viewBox="0 0 440 150" className="se-svg">
      <text x="220" y="14" fill="#888" fontSize="8" textAnchor="middle">STEPS 8-10: MAXIMIZE YOUR SAVINGS</text>
      {[{n:'8. Monitor Daily',tip:'Check app every morning',icon:'📱',c:'#60a5fa',x:55},{n:'9. Clean Monthly',tip:'Soft water + cloth',icon:'🧹',c:'#f59e0b',x:165},{n:'10. Share & Inspire',tip:'Tell neighbors!',icon:'🌟',c:'#22c55e',x:275}].map((s,i)=>(
        <g key={i}><rect x={s.x-45} y="25" width="100" height="80" rx="8" fill={`${s.c}11`} stroke={s.c} strokeWidth="1"/>
        <text x={s.x+5} y="50" fill={s.c} fontSize="18" textAnchor="middle">{s.icon}</text>
        <text x={s.x+5} y="70" fill={s.c} fontSize="8" textAnchor="middle" fontWeight="bold">{s.n}</text>
        <text x={s.x+5} y="85" fill="#888" fontSize="7" textAnchor="middle">{s.tip}</text>
        <text x={s.x+5} y="100" fill="#22c55e" fontSize="8" textAnchor="middle">✅</text></g>))}
      <rect x="60" y="115" width="320" height="28" rx="8" fill="rgba(34,197,94,0.12)" stroke="#22c55e" strokeWidth="1.5"/>
      <text x="220" y="133" fill="#22c55e" fontSize="10" textAnchor="middle" fontWeight="bold">🎉 You're ready to go SOLAR! Congratulations!</text>
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
