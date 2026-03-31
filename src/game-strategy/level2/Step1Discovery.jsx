import React, { useState, useEffect, useCallback } from 'react';
import { DISCOVERY_APPLIANCES } from './level2Data';

export default function Step1Discovery({ onComplete, onScore }) {
  const [states, setStates] = useState(
    Object.fromEntries(DISCOVERY_APPLIANCES.map(a => [a.id, false]))
  );
  const [floats, setFloats] = useState([]);
  const [interacted, setInteracted] = useState(new Set());

  const totalWatts = DISCOVERY_APPLIANCES.reduce(
    (sum, a) => sum + (states[a.id] ? (typeof a.wattage === 'number' ? a.wattage : 0) : 0), 0
  );

  const maxWatts = DISCOVERY_APPLIANCES.reduce(
    (sum, a) => sum + (typeof a.wattage === 'number' ? a.wattage : 0), 0
  );

  const toggleAppliance = useCallback((appliance) => {
    const isOn = !states[appliance.id];
    setStates(prev => ({ ...prev, [appliance.id]: isOn }));
    setInteracted(prev => new Set([...prev, appliance.id]));

    // Floating text
    const id = Date.now() + Math.random();
    setFloats(prev => [...prev, {
      id,
      appId: appliance.id,
      text: isOn ? `+${appliance.wattage}W added!` : 'Energy saved!',
      type: isOn ? 'added' : 'saved',
    }]);
    setTimeout(() => setFloats(prev => prev.filter(f => f.id !== id)), 1500);

    // Score for first interaction
    if (!interacted.has(appliance.id)) {
      onScore(5);
    }
  }, [states, interacted, onScore]);

  const canProceed = interacted.size >= 5;

  return (
    <div className="l2-step-transition">
      <div className="l2-section-header">
        <span className="l2-section-icon">{'\u{1F50C}'}</span>
        <h2 className="l2-section-title">Energy Discovery</h2>
        <p className="l2-section-desc">
          Toggle appliances ON/OFF and watch the energy meter react in real-time.
          Interact with at least 5 appliances to continue.
        </p>
      </div>

      {/* Energy Meter */}
      <div className="l2-meter-container">
        <div className="l2-meter-label">{'\u{26A1}'} Total Power Consumption</div>
        <div className={`l2-meter-value ${totalWatts > maxWatts * 0.6 ? 'high' : ''}`}>
          {totalWatts.toLocaleString()}
          <span className="l2-meter-unit">W</span>
        </div>
        <div className="l2-meter-bar">
          <div
            className="l2-meter-bar-fill"
            style={{ width: `${Math.min((totalWatts / maxWatts) * 100, 100)}%` }}
          />
        </div>
        <div className="l2-meter-info">
          <span>0W</span>
          <span>{interacted.size}/{DISCOVERY_APPLIANCES.length} explored</span>
          <span>{maxWatts.toLocaleString()}W</span>
        </div>
      </div>

      {/* Appliance Grid */}
      <div className="l2-room-grid">
        {DISCOVERY_APPLIANCES.map(appliance => {
          const isOn = states[appliance.id];
          const float = floats.find(f => f.appId === appliance.id);
          return (
            <div
              key={appliance.id}
              className={`l2-appliance-card ${isOn ? 'on' : ''}`}
              onClick={() => toggleAppliance(appliance)}
            >
              {float && (
                <div className={`l2-float-text ${float.type}`}>{float.text}</div>
              )}
              <div className="l2-card-icon">{appliance.icon}</div>
              <div className="l2-card-name">{appliance.name}</div>
              <div className="l2-card-watts">{appliance.wattage}W</div>
              <div className={`l2-toggle-track ${isOn ? 'on' : ''}`}>
                <div className="l2-toggle-knob" />
              </div>
            </div>
          );
        })}
      </div>

      <button
        className="l2-continue-btn"
        disabled={!canProceed}
        onClick={onComplete}
      >
        {canProceed
          ? `Continue ${'\u{2192}'}`
          : `Explore ${5 - interacted.size} more appliance${5 - interacted.size !== 1 ? 's' : ''}`}
      </button>
    </div>
  );
}
