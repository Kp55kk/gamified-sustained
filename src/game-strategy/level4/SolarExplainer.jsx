// ═══════════════════════════════════════════════════════════
//  SOLAR EXPLAINER — "How Solar Energy Works" walkthrough
//  Sequentially presents 4 core topics after Phase 0 (install)
// ═══════════════════════════════════════════════════════════
import React, { useState } from 'react';
import PhaseExplainer from './PhaseExplainer';

const SOLAR_TOPICS = ['panel_basics', 'inverter_learn', 'net_meter', 'system_types'];
const TOPIC_LABELS = ['Solar Panel Basics', 'The Inverter', 'Net Meter', 'Solar System Types'];

export default function SolarExplainer({ onComplete }) {
  const [topicIdx, setTopicIdx] = useState(0);

  const handleTopicComplete = () => {
    const next = topicIdx + 1;
    if (next >= SOLAR_TOPICS.length) {
      onComplete?.();
    } else {
      setTopicIdx(next);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'flex-start',
    }}>
      {/* Topic progress bar */}
      <div style={{
        display: 'flex', gap: '8px', padding: '16px 20px',
        background: 'rgba(5,10,21,0.95)', width: '100%',
        justifyContent: 'center', alignItems: 'center',
        borderBottom: '1px solid rgba(56,217,169,0.15)',
      }}>
        {SOLAR_TOPICS.map((_, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: '6px',
          }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', fontWeight: 700,
              background: i < topicIdx ? 'rgba(34,197,94,0.3)'
                : i === topicIdx ? 'rgba(56,217,169,0.2)'
                : 'rgba(255,255,255,0.05)',
              border: `2px solid ${i < topicIdx ? '#22c55e' : i === topicIdx ? '#38d9a9' : '#333'}`,
              color: i <= topicIdx ? '#38d9a9' : '#555',
              transition: 'all 0.3s ease',
            }}>
              {i < topicIdx ? '✓' : i + 1}
            </div>
            <span style={{
              fontSize: '11px', fontWeight: 600,
              color: i === topicIdx ? '#38d9a9' : i < topicIdx ? '#22c55e' : '#555',
              display: window.innerWidth > 600 ? 'inline' : 'none',
            }}>
              {TOPIC_LABELS[i]}
            </span>
            {i < SOLAR_TOPICS.length - 1 && (
              <div style={{
                width: '24px', height: '2px',
                background: i < topicIdx ? '#22c55e' : '#333',
                transition: 'background 0.3s ease',
              }}/>
            )}
          </div>
        ))}
      </div>

      {/* Topic label for mobile */}
      <div style={{
        padding: '8px 16px', textAlign: 'center',
        fontSize: '13px', fontWeight: 600, color: '#38d9a9',
        background: 'rgba(5,10,21,0.9)',
        width: '100%',
      }}>
        Topic {topicIdx + 1} of {SOLAR_TOPICS.length}: {TOPIC_LABELS[topicIdx]}
      </div>

      {/* PhaseExplainer renders the topic */}
      <PhaseExplainer
        key={SOLAR_TOPICS[topicIdx]}
        topicId={SOLAR_TOPICS[topicIdx]}
        onComplete={handleTopicComplete}
      />
    </div>
  );
}
