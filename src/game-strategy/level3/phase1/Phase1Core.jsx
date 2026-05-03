// ═══════════════════════════════════════════════════════════
//  LEVEL 3 — PHASE 1 CORE: Audio, 3D Scene, Shared Components
//  "Understand the Consequences of Energy Use"
// ═══════════════════════════════════════════════════════════
import React, { useState, useEffect, useCallback } from 'react';
import { useThree } from '@react-three/fiber';
import House from '../../House';
import Player from '../../Player';
import Level2Appliances from '../../level2/Level2Appliances';
import Level3Environment from '../Level3Environment';
import { L2_APPLIANCE_IDS } from './phase1Data';

// ═══════════════════════════════════════════════════════════
//  AUDIO SYSTEM — Immersive sound feedback
// ═══════════════════════════════════════════════════════════
let audioCtx = null;
function getCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

export function playToggleOn() {
  try {
    const ctx = getCtx();
    // Click sound
    const click = ctx.createOscillator();
    const clickGain = ctx.createGain();
    click.connect(clickGain);
    clickGain.connect(ctx.destination);
    click.frequency.setValueAtTime(800, ctx.currentTime);
    clickGain.gain.setValueAtTime(0.15, ctx.currentTime);
    clickGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    click.start(ctx.currentTime);
    click.stop(ctx.currentTime + 0.1);
    // Power-up hum
    const hum = ctx.createOscillator();
    const humGain = ctx.createGain();
    hum.connect(humGain);
    humGain.connect(ctx.destination);
    hum.type = 'sine';
    hum.frequency.setValueAtTime(200, ctx.currentTime + 0.05);
    hum.frequency.linearRampToValueAtTime(400, ctx.currentTime + 0.3);
    humGain.gain.setValueAtTime(0.08, ctx.currentTime + 0.05);
    humGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    hum.start(ctx.currentTime + 0.05);
    hum.stop(ctx.currentTime + 0.5);
  } catch (e) {}
}

export function playToggleOff() {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(150, ctx.currentTime + 0.25);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.35);
  } catch (e) {}
}

export function playCorrectSound() {
  try {
    const ctx = getCtx();
    [523, 659, 784].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);
      gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.3);
      osc.start(ctx.currentTime + i * 0.1);
      osc.stop(ctx.currentTime + i * 0.1 + 0.3);
    });
  } catch (e) {}
}

export function playWrongSound() {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
  } catch (e) {}
}

export function playMilestoneSound() {
  try {
    const ctx = getCtx();
    [523, 659, 784, 1047].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12);
      gain.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.4);
      osc.start(ctx.currentTime + i * 0.12);
      osc.stop(ctx.currentTime + i * 0.12 + 0.4);
    });
  } catch (e) {}
}

export function playWarningSound() {
  try {
    const ctx = getCtx();
    [0, 0.3, 0.6].forEach(t => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(400, ctx.currentTime + t);
      osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + t + 0.15);
      gain.gain.setValueAtTime(0.06, ctx.currentTime + t);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.3);
      osc.start(ctx.currentTime + t);
      osc.stop(ctx.currentTime + t + 0.3);
    });
  } catch (e) {}
}

export function playHeavyHum() {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(55, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(45, ctx.currentTime + 1.5);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 2);
  } catch (e) {}
}

export function playBreathingSound() {
  try {
    const ctx = getCtx();
    // Inhale
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    const filter1 = ctx.createBiquadFilter();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(80, ctx.currentTime);
    filter1.type = 'lowpass';
    filter1.frequency.setValueAtTime(400, ctx.currentTime);
    osc1.connect(filter1);
    filter1.connect(gain1);
    gain1.connect(ctx.destination);
    gain1.gain.setValueAtTime(0, ctx.currentTime);
    gain1.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 0.8);
    gain1.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.6);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 1.6);
    // Exhale
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    const filter2 = ctx.createBiquadFilter();
    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(60, ctx.currentTime + 1.8);
    filter2.type = 'lowpass';
    filter2.frequency.setValueAtTime(300, ctx.currentTime + 1.8);
    osc2.connect(filter2);
    filter2.connect(gain2);
    gain2.connect(ctx.destination);
    gain2.gain.setValueAtTime(0, ctx.currentTime + 1.8);
    gain2.gain.linearRampToValueAtTime(0.03, ctx.currentTime + 2.4);
    gain2.gain.linearRampToValueAtTime(0, ctx.currentTime + 3.2);
    osc2.start(ctx.currentTime + 1.8);
    osc2.stop(ctx.currentTime + 3.2);
  } catch (e) {}
}

// ═══════════════════════════════════════════════════════════
//  3D SCENE COMPONENTS
// ═══════════════════════════════════════════════════════════

export function CameraRefForwarder({ cameraRef }) {
  const { camera } = useThree();
  useEffect(() => { cameraRef.current = camera; }, [camera, cameraRef]);
  return null;
}

export function SceneContent({
  applianceStates, nearestAppliance, highlightIds,
  onRoomChange, onNearestChange, onInteract,
  cameraRef, proximityLevels, damageLevel
}) {
  return (
    <>
      <CameraRefForwarder cameraRef={cameraRef} />
      <Level3Environment damageLevel={damageLevel} />
      <House bedroomCurtainsOnly={true} />
      <Level2Appliances
        applianceStates={applianceStates}
        nearestAppliance={nearestAppliance}
        taskTargetIds={highlightIds}
        proximityLevels={proximityLevels}
      />
      <Player
        onRoomChange={onRoomChange}
        onNearestApplianceChange={onNearestChange}
        onInteract={onInteract}
        applianceIdList={L2_APPLIANCE_IDS}
      />
    </>
  );
}

// ═══════════════════════════════════════════════════════════
//  UI HELPER COMPONENTS
// ═══════════════════════════════════════════════════════════

// Animated counter with smooth interpolation
export function AnimatedValue({ value, prefix = '', suffix = '', decimals = 0 }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let cur = display;
    let raf;
    const step = () => {
      const diff = value - cur;
      if (Math.abs(diff) < (decimals > 0 ? 0.01 : 1)) {
        setDisplay(value);
        return;
      }
      cur += diff * 0.12;
      setDisplay(decimals > 0 ? Math.round(cur * 100) / 100 : Math.round(cur));
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => { if (raf) cancelAnimationFrame(raf); };
  }, [value]);
  return (
    <span>
      {prefix}
      {decimals > 0 ? display.toFixed(decimals) : display.toLocaleString()}
      {suffix}
    </span>
  );
}

// Floating text notification
export function FloatingText({ text, type, id, onDone }) {
  useEffect(() => {
    const timer = setTimeout(() => onDone(id), 2000);
    return () => clearTimeout(timer);
  }, [id, onDone]);
  return <div className={`l3p1-float-text ${type}`}>{text}</div>;
}

// Dashboard metric card
export function DashboardMetric({ icon, value, label, color, pulse }) {
  return (
    <div className={`l3p1-metric ${pulse ? 'pulse' : ''}`}>
      <div className="l3p1-metric-icon">{icon}</div>
      <div className="l3p1-metric-value" style={{ color }}>{value}</div>
      <div className="l3p1-metric-label">{label}</div>
    </div>
  );
}

// Step checklist item
export function StepItem({ label, done, active }) {
  return (
    <div className={`l3p1-step-item ${done ? 'done' : ''} ${active ? 'active' : ''}`}>
      <div className="l3p1-step-check">{done ? '✓' : active ? '→' : ''}</div>
      <span>{label}</span>
    </div>
  );
}
