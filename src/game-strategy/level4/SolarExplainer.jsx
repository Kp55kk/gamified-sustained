// ═══════════════════════════════════════════════════════════
//  HOW SOLAR ENERGY WORKS — Premium Animated Visualization
//  Like the CO₂ visualization in L3P2, but for solar
// ═══════════════════════════════════════════════════════════
import React, { useState, useEffect, useRef, useCallback } from 'react';

// ─── Solar Process Steps (research-backed) ───
const SOLAR_STEPS = [
  {
    id: 'photons',
    title: 'Sunlight (Photons)',
    icon: '☀️',
    visual: '☀️ → 〰️〰️〰️ →',
    color: '#fbbf24',
    glow: 'rgba(251,191,36,0.4)',
    desc: 'The sun emits photons — tiny packets of light energy that travel 150 million km to reach Earth in just 8 minutes.',
    fact: '173,000 terawatts of solar energy continuously hits Earth — 10,000× more than global energy demand!',
    sound: 'shimmer',
  },
  {
    id: 'pv_cell',
    title: 'Photovoltaic Cell',
    icon: '🔬',
    visual: '〰️ → [Si] → ⚡',
    color: '#60a5fa',
    glow: 'rgba(96,165,250,0.4)',
    desc: 'Photons hit silicon cells in the solar panel. Silicon atoms absorb photon energy and release electrons — creating an electric field.',
    fact: 'Each solar cell has two layers: N-type (extra electrons) and P-type (missing electrons). The junction creates a one-way electron flow!',
    sound: 'zap',
  },
  {
    id: 'dc_power',
    title: 'DC Electricity Generated',
    icon: '⚡',
    visual: '⚡ DC ════►',
    color: '#f59e0b',
    glow: 'rgba(245,158,11,0.4)',
    desc: 'The freed electrons flow as Direct Current (DC) electricity through metal conductors in the panel.',
    fact: 'A single 330W panel generates enough electricity to power 5 LED bulbs for 6 hours!',
    sound: 'electric',
  },
  {
    id: 'inverter',
    title: 'Inverter (DC → AC)',
    icon: '🔄',
    visual: 'DC ══► [⚙️] ══► AC',
    color: '#a78bfa',
    glow: 'rgba(167,139,250,0.4)',
    desc: 'The inverter converts DC to AC (Alternating Current) — the type of electricity your home appliances use.',
    fact: 'Modern inverters are 97%+ efficient and can also track maximum power point to optimize output!',
    sound: 'transform',
  },
  {
    id: 'home_power',
    title: 'Home Powered!',
    icon: '🏠',
    visual: 'AC ══► 🏠 💡❄️📺',
    color: '#22c55e',
    glow: 'rgba(34,197,94,0.4)',
    desc: 'AC electricity flows to your switchboard and powers all home appliances — lights, fan, AC, TV, refrigerator!',
    fact: 'A 3kW rooftop system can power an average Indian home and save ₹2,000+/month on electricity bills.',
    sound: 'success',
  },
  {
    id: 'excess',
    title: 'Excess → Battery / Grid',
    icon: '🔋',
    visual: '⚡ → 🔋 or → ⚡🏭',
    color: '#8b5cf6',
    glow: 'rgba(139,92,246,0.4)',
    desc: 'Excess solar energy charges your battery for night use, or feeds back to the grid (net metering = bill credits!).',
    fact: 'With net metering, your electricity meter runs BACKWARD when you export solar power — you earn credits!',
    sound: 'charge',
  },
  {
    id: 'zero_co2',
    title: 'Zero CO₂ Emissions!',
    icon: '🌿',
    visual: '☀️ → ⚡ → 🏠 → 🌿 0 CO₂',
    color: '#16a34a',
    glow: 'rgba(22,163,74,0.4)',
    desc: 'Unlike coal/gas power plants, solar generates ZERO CO₂ during operation. Clean, silent, renewable energy!',
    fact: 'A 5kW solar system prevents ~7,500 kg CO₂/year — equivalent to planting 340 trees!',
    sound: 'nature',
  },
];

// ─── Sound effects (Web Audio API) ───
function playSound(type) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.value = 0.08;

    const sounds = {
      shimmer: () => { osc.type = 'sine'; osc.frequency.setValueAtTime(800, ctx.currentTime); osc.frequency.exponentialRampToValueAtTime(1600, ctx.currentTime + 0.3); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5); },
      zap: () => { osc.type = 'sawtooth'; osc.frequency.setValueAtTime(200, ctx.currentTime); osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.15); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3); },
      electric: () => { osc.type = 'square'; osc.frequency.setValueAtTime(440, ctx.currentTime); osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.2); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4); },
      transform: () => { osc.type = 'triangle'; osc.frequency.setValueAtTime(300, ctx.currentTime); osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.1); osc.frequency.linearRampToValueAtTime(300, ctx.currentTime + 0.2); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4); },
      success: () => { osc.type = 'sine'; osc.frequency.setValueAtTime(523, ctx.currentTime); osc.frequency.setValueAtTime(659, ctx.currentTime + 0.15); osc.frequency.setValueAtTime(784, ctx.currentTime + 0.3); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6); },
      charge: () => { osc.type = 'sine'; osc.frequency.setValueAtTime(200, ctx.currentTime); osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.4); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5); },
      nature: () => { osc.type = 'sine'; osc.frequency.setValueAtTime(400, ctx.currentTime); osc.frequency.setValueAtTime(500, ctx.currentTime + 0.2); osc.frequency.setValueAtTime(600, ctx.currentTime + 0.4); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8); },
    };
    (sounds[type] || sounds.shimmer)();
    osc.start(); osc.stop(ctx.currentTime + 1);
  } catch (e) { /* silent fail */ }
}

export default function SolarExplainer({ onComplete }) {
  const [step, setStep] = useState(-1); // -1 = intro
  const [autoPlay, setAutoPlay] = useState(false);
  const [particles, setParticles] = useState([]);
  const particleId = useRef(0);
  const autoRef = useRef(null);

  const current = step >= 0 ? SOLAR_STEPS[step] : null;
  const allSeen = step >= SOLAR_STEPS.length - 1;
  const progress = Math.max(0, ((step + 1) / SOLAR_STEPS.length) * 100);

  // Spawn particles
  const spawnParticles = useCallback((color) => {
    const newP = Array.from({ length: 8 }, () => ({
      id: ++particleId.current,
      x: 30 + Math.random() * 40,
      y: 20 + Math.random() * 60,
      size: 3 + Math.random() * 5,
      color,
      dx: (Math.random() - 0.5) * 3,
      dy: -1 - Math.random() * 2,
      life: 1,
    }));
    setParticles(p => [...p, ...newP]);
  }, []);

  // Particle decay
  useEffect(() => {
    if (particles.length === 0) return;
    const t = setInterval(() => {
      setParticles(p => p.map(pp => ({ ...pp, x: pp.x + pp.dx, y: pp.y + pp.dy, life: pp.life - 0.04 })).filter(pp => pp.life > 0));
    }, 50);
    return () => clearInterval(t);
  }, [particles.length]);

  const goToStep = useCallback((idx) => {
    setStep(idx);
    if (idx >= 0 && idx < SOLAR_STEPS.length) {
      playSound(SOLAR_STEPS[idx].sound);
      spawnParticles(SOLAR_STEPS[idx].color);
    }
  }, [spawnParticles]);

  // Autoplay
  useEffect(() => {
    if (!autoPlay) return;
    autoRef.current = setInterval(() => {
      setStep(p => {
        const next = p + 1;
        if (next >= SOLAR_STEPS.length) { setAutoPlay(false); return p; }
        playSound(SOLAR_STEPS[next].sound);
        spawnParticles(SOLAR_STEPS[next].color);
        return next;
      });
    }, 3500);
    return () => clearInterval(autoRef.current);
  }, [autoPlay, spawnParticles]);

  return (
    <div className="solar-explainer">
      {/* Particle Layer */}
      <div className="se-particles">
        {particles.map(p => (
          <div key={p.id} className="se-particle" style={{
            left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size,
            background: p.color, opacity: p.life, boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
          }} />
        ))}
      </div>

      {/* Header */}
      <div className="se-header">
        <span className="se-header-icon">☀️</span>
        <span className="se-header-title">How Solar Energy Works</span>
      </div>

      {/* Progress bar */}
      <div className="se-progress-bar">
        <div className="se-progress-fill" style={{ width: `${progress}%`, background: current?.color || '#f5a623' }} />
      </div>

      {/* Intro screen */}
      {step === -1 && (
        <div className="se-intro">
          <div className="se-intro-sun">☀️</div>
          <div className="se-intro-title">The Journey of Sunlight to Electricity</div>
          <div className="se-intro-subtitle">7 steps that power your home — zero pollution!</div>
          <div className="se-intro-btns">
            <button className="se-btn primary" onClick={() => goToStep(0)}>Start Exploration →</button>
            <button className="se-btn secondary" onClick={() => { goToStep(0); setAutoPlay(true); }}>▶ Auto Play</button>
          </div>
        </div>
      )}

      {/* Step view */}
      {current && (
        <div className="se-step" style={{ '--step-color': current.color, '--step-glow': current.glow }}>
          {/* Visual strip */}
          <div className="se-visual-strip">
            <div className="se-visual-icon">{current.icon}</div>
            <div className="se-visual-flow">{current.visual}</div>
          </div>

          {/* Content */}
          <div className="se-step-title">{current.title}</div>
          <div className="se-step-desc">{current.desc}</div>

          {/* Fact card */}
          <div className="se-fact-card">
            <span className="se-fact-icon">💡</span>
            <span className="se-fact-text">{current.fact}</span>
          </div>

          {/* Step dots */}
          <div className="se-dots">
            {SOLAR_STEPS.map((s, i) => (
              <div key={s.id} className={`se-dot ${i === step ? 'active' : i < step ? 'done' : ''}`}
                   style={{ background: i <= step ? s.color : 'rgba(255,255,255,0.1)' }}
                   onClick={() => goToStep(i)} title={s.title} />
            ))}
          </div>

          {/* Navigation */}
          <div className="se-nav">
            {step > 0 && <button className="se-btn secondary" onClick={() => goToStep(step - 1)}>← Back</button>}
            {!allSeen && !autoPlay && (
              <button className="se-btn primary" onClick={() => goToStep(step + 1)}>
                Next: {SOLAR_STEPS[step + 1]?.title} →
              </button>
            )}
            {allSeen && (
              <button className="se-btn success" onClick={onComplete}>
                ✅ I Understand Solar Energy! →
              </button>
            )}
          </div>

          {/* Step counter */}
          <div className="se-counter">Step {step + 1} of {SOLAR_STEPS.length}</div>
        </div>
      )}
    </div>
  );
}
