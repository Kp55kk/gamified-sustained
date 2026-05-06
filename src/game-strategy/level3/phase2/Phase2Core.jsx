// ═══════════════════════════════════════════════════════════
//  LEVEL 3 PHASE 2 — Core: Audio + 3D Scene Wrappers
// ═══════════════════════════════════════════════════════════
import React, { Suspense, useRef, useState, useEffect, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  GrowingTree, CO2Particles, O2Particles, PlantSpot, TreeEnvironment,
  SolarPanel, AnimatedSun, EnergyFlowLines, SolarEnvironment,
  WindTurbine, WindParticles, WindEnvironment,
} from './Phase2Scenes';

// ─── Audio ───
let audioCtx = null;
function getCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

export function playAction() {
  try {
    const ctx = getCtx();
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.frequency.setValueAtTime(600, ctx.currentTime);
    o.frequency.linearRampToValueAtTime(900, ctx.currentTime + 0.15);
    g.gain.setValueAtTime(0.12, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.3);
  } catch (e) {}
}

export function playSuccess() {
  try {
    const ctx = getCtx();
    [523, 659, 784, 1047].forEach((f, i) => {
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination); o.type = 'triangle';
      o.frequency.setValueAtTime(f, ctx.currentTime + i * 0.12);
      g.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.12);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.4);
      o.start(ctx.currentTime + i * 0.12); o.stop(ctx.currentTime + i * 0.12 + 0.4);
    });
  } catch (e) {}
}

export function playCorrect() {
  try {
    const ctx = getCtx();
    [523, 659, 784].forEach((f, i) => {
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination); o.type = 'triangle';
      o.frequency.setValueAtTime(f, ctx.currentTime + i * 0.1);
      g.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.1);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.3);
      o.start(ctx.currentTime + i * 0.1); o.stop(ctx.currentTime + i * 0.1 + 0.3);
    });
  } catch (e) {}
}

export function playWrong() {
  try {
    const ctx = getCtx();
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination); o.type = 'sawtooth';
    o.frequency.setValueAtTime(200, ctx.currentTime);
    o.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.3);
    g.gain.setValueAtTime(0.08, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.4);
  } catch (e) {}
}

// ─── Camera auto-orbit ───
export function AutoCamera({ target = [0, 2, 0], radius = 10, height = 6, speed = 0.15 }) {
  const { camera } = useThree();
  useFrame(() => {
    const t = performance.now() * 0.001 * speed;
    camera.position.set(Math.cos(t) * radius, height, Math.sin(t) * radius);
    camera.lookAt(target[0], target[1], target[2]);
  });
  return null;
}

// ─── TREE SCENE 3D ───
export function TreeScene3D({ trees, plantSpots, currentSpot, co2Active, greenLevel }) {
  const treePositions = trees.filter(t => t.growth >= 3).map(t => t.pos);
  return (
    <>
      <TreeEnvironment greenLevel={greenLevel} />
      <AutoCamera target={[0, 1, 0]} radius={12} height={7} speed={0.08} />
      {plantSpots.map((pos, i) => (
        <PlantSpot key={i} position={pos} active={i === currentSpot} />
      ))}
      {trees.map((t, i) => (
        <GrowingTree key={i} position={t.pos} growthPhase={t.growth} absorbing={t.absorbing} />
      ))}
      <CO2Particles active={co2Active} treePositions={treePositions} />
      <O2Particles active={co2Active} treePositions={treePositions} />
    </>
  );
}

// ─── SOLAR SCENE 3D ───
const PANEL_POSITIONS = [[-2, 0.1, -1], [0, 0.1, -1], [2, 0.1, -1]];

export function SolarScene3D({ panelsPlaced, panelAngle, sunProgress, energyFlowing }) {
  return (
    <>
      <SolarEnvironment sunProgress={sunProgress} />
      <AnimatedSun progress={sunProgress} />
      <AutoCamera target={[0, 0.5, 0]} radius={8} height={5} speed={0.06} />
      {PANEL_POSITIONS.map((pos, i) => (
        <SolarPanel key={i} position={pos} placed={i < panelsPlaced} glowing={energyFlowing && i < panelsPlaced} angle={panelAngle} />
      ))}
      <EnergyFlowLines active={energyFlowing} panelPositions={PANEL_POSITIONS.slice(0, panelsPlaced)} />
    </>
  );
}

export { PANEL_POSITIONS };

// ─── WIND SCENE 3D ───
export function WindScene3D({ installed, windSpeed }) {
  return (
    <>
      <WindEnvironment />
      <AutoCamera target={[0, 4, 0]} radius={14} height={8} speed={0.07} />
      <WindTurbine position={[0, 0, 0]} installed={installed} windSpeed={windSpeed} />
      <WindParticles windSpeed={windSpeed} />
    </>
  );
}

// ─── 3D Canvas wrapper ───
export function Scene3DCanvas({ children }) {
  return (
    <div className="l3p2-canvas-wrap">
      <Canvas camera={{ position: [0, 5, 12], fov: 50 }} gl={{ antialias: false }}
        onCreated={({ gl }) => { gl.setClearColor('#080808'); gl.toneMapping = 1; gl.toneMappingExposure = 1.0; gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); }}>
        <Suspense fallback={null}>
          {children}
        </Suspense>
      </Canvas>
    </div>
  );
}
