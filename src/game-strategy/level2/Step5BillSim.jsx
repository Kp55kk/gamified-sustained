import React, { useState, useMemo } from 'react';
import { APPLIANCES, RATE_SLABS, calculateBill, CO2_FACTOR, SHARMA_FAMILY } from './level2Data';

export default function Step5BillSim({ onComplete, onScore }) {
  const [selected, setSelected] = useState(
    Object.fromEntries(APPLIANCES.slice(0, 8).map(a => [a.id, true]))
  );

  const totalAnnualKwh = useMemo(() => {
    return APPLIANCES.reduce((sum, a) => sum + (selected[a.id] ? a.kwhPerYear : 0), 0);
  }, [selected]);

  const monthlyKwh = totalAnnualKwh / 12;
  const bill = calculateBill(monthlyKwh);
  const annualCo2 = (totalAnnualKwh * CO2_FACTOR).toFixed(0);
  const annualCost = bill.total * 12;

  const toggleAppliance = (id) => {
    setSelected(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const selectedCount = Object.values(selected).filter(Boolean).length;

  return (
    <div className="l2-step-transition">
      <div className="l2-section-header">
        <span className="l2-section-icon">{'\u{1F4B0}'}</span>
        <h2 className="l2-section-title">Bill Simulator</h2>
        <p className="l2-section-desc">
          Select the appliances your home uses and see a real electricity bill simulation with Indian slab rates.
        </p>
      </div>

      {/* Appliance Toggles */}
      <div className="l2-bill-controls">
        {APPLIANCES.map(app => (
          <div
            key={app.id}
            className={`l2-bill-toggle ${selected[app.id] ? 'active' : ''}`}
            onClick={() => toggleAppliance(app.id)}
          >
            <span className="l2-bill-toggle-icon">{app.icon}</span>
            <span className="l2-bill-toggle-name">{app.name}</span>
            <span className="l2-bill-toggle-kwh">{app.kwhPerYear} kWh</span>
          </div>
        ))}
      </div>

      {/* Bill Receipt */}
      <div className="l2-bill-receipt">
        <div className="l2-bill-header">
          <div className="l2-bill-title">{'\u{26A1}'} Electricity Bill</div>
          <div className="l2-bill-subtitle">
            {selectedCount} appliances {'\u{2022}'} {Math.round(monthlyKwh)} units/month
          </div>
        </div>

        {/* Slab Breakdown */}
        {bill.breakdown.map((slab, i) => (
          <div key={i} className="l2-bill-slab-row">
            <span className="l2-bill-slab-label">{slab.label}</span>
            <span className="l2-bill-slab-units">{slab.units} units</span>
            <span className="l2-bill-slab-rate">@ {'\u{20B9}'}{slab.rate}/unit</span>
            <span className="l2-bill-slab-cost">{'\u{20B9}'}{Math.round(slab.cost)}</span>
          </div>
        ))}

        <div className="l2-bill-total-row">
          <span className="l2-bill-total-label">Monthly Total</span>
          <span className="l2-bill-total-amount">{'\u{20B9}'}{bill.total.toLocaleString()}</span>
        </div>

        <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '13px', color: '#64748b' }}>
          Annual: {'\u{20B9}'}{annualCost.toLocaleString()} | {totalAnnualKwh.toLocaleString()} kWh/year
        </div>

        <div className="l2-bill-co2-row">
          {'\u{1F30D}'} Annual CO{'\u2082'} Footprint: <strong>{annualCo2} kg</strong> ({(annualCo2 / 1000).toFixed(1)} tonnes)
        </div>
      </div>

      {/* Sharma Family Comparison */}
      <div className="l2-example-box" style={{ marginTop: '24px', maxWidth: '440px' }}>
        <div className="l2-example-title">{'\u{1F3E0}'} The Sharma Family (Jaipur, 4 members)</div>
        {SHARMA_FAMILY.map((item, i) => (
          <div key={i} className="l2-example-step" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>{item.name}</span>
            <span style={{ color: '#22c55e', fontWeight: 700 }}>{item.kwh} kWh</span>
          </div>
        ))}
        <div className="l2-example-result" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '8px', marginTop: '8px' }}>
          Total: 2,913 kWh/year {'\u{2192}'} ~2,068 kg CO{'\u2082'}
        </div>
      </div>

      <button
        className="l2-continue-btn"
        onClick={() => { onScore(10); onComplete(); }}
        style={{ display: 'block', margin: '24px auto 0' }}
      >
        Continue to Quiz {'\u{2192}'}
      </button>
    </div>
  );
}
