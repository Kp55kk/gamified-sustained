// ═══════════════════════════════════════════════════════════
//  LEVEL 3 — PHASE 2: Placeholder (Coming Soon)
// ═══════════════════════════════════════════════════════════
import React from 'react';

export default function Phase2({ onComplete }) {
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #050a15 0%, #0a1628 100%)',
      fontFamily: 'Nunito, sans-serif',
      color: '#fff',
      gap: '16px',
    }}>
      <div style={{ fontSize: '64px' }}>🚧</div>
      <h1 style={{
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '28px',
        color: '#ff6644',
        textShadow: '0 0 20px rgba(255,68,0,0.4)',
      }}>
        Phase 2 — Coming Soon
      </h1>
      <p style={{ color: '#999', fontSize: '14px', maxWidth: '400px', textAlign: 'center', lineHeight: 1.6 }}>
        This phase is under development. Your Phase 1 progress has been saved!
      </p>
      <button
        onClick={onComplete}
        style={{
          background: 'linear-gradient(135deg, #c0392b, #e74c3c)',
          border: 'none',
          color: '#fff',
          padding: '12px 32px',
          borderRadius: '12px',
          fontSize: '15px',
          fontWeight: 700,
          fontFamily: 'Fredoka, sans-serif',
          cursor: 'pointer',
          marginTop: '8px',
          boxShadow: '0 0 16px rgba(231,76,60,0.4)',
        }}
      >
        Return to Hub →
      </button>
    </div>
  );
}
