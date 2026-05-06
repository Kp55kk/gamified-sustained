// ═══════════════════════════════════════════════════════════
//  LEVEL 3 PHASE 2 — Core: Audio + Unified House Scene
// ═══════════════════════════════════════════════════════════
import React, { Suspense } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import {
  House, HouseEnvironment, DustParticles,
  GrowingTree, CO2Particles, O2Particles, PlantSpot,
  SolarPanel, AnimatedSun, EnergyFlowLines,
  WindTurbine, WindParticles,
} from './Phase2Scenes';

// ─── Audio ───
let audioCtx = null;
function getCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

export function playAction() {
  try { const ctx = getCtx(); const o = ctx.createOscillator(); const g = ctx.createGain(); o.connect(g); g.connect(ctx.destination); o.frequency.setValueAtTime(600, ctx.currentTime); o.frequency.linearRampToValueAtTime(900, ctx.currentTime + 0.15); g.gain.setValueAtTime(0.12, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3); o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.3); } catch (e) {}
}

export function playSuccess() {
  try { const ctx = getCtx(); [523, 659, 784, 1047].forEach((f, i) => { const o = ctx.createOscillator(); const g = ctx.createGain(); o.connect(g); g.connect(ctx.destination); o.type = 'triangle'; o.frequency.setValueAtTime(f, ctx.currentTime + i * 0.12); g.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.12); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.4); o.start(ctx.currentTime + i * 0.12); o.stop(ctx.currentTime + i * 0.12 + 0.4); }); } catch (e) {}
}

export function playCorrect() {
  try { const ctx = getCtx(); [523, 659, 784].forEach((f, i) => { const o = ctx.createOscillator(); const g = ctx.createGain(); o.connect(g); g.connect(ctx.destination); o.type = 'triangle'; o.frequency.setValueAtTime(f, ctx.currentTime + i * 0.1); g.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.1); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.3); o.start(ctx.currentTime + i * 0.1); o.stop(ctx.currentTime + i * 0.1 + 0.3); }); } catch (e) {}
}

export function playWrong() {
  try { const ctx = getCtx(); const o = ctx.createOscillator(); const g = ctx.createGain(); o.connect(g); g.connect(ctx.destination); o.type = 'sawtooth'; o.frequency.setValueAtTime(200, ctx.currentTime); o.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.3); g.gain.setValueAtTime(0.08, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4); o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.4); } catch (e) {}
}

// ─── Camera orbiting the house ───
function AutoCamera({ segment = 'trees' }) {
  const { camera } = useThree();
  // Different camera angles per segment
  const config = segment === 'solar'
    ? { radius: 10, height: 8, target: [0, 4, 0], speed: 0.06 }
    : segment === 'wind'
    ? { radius: 12, height: 7, target: [0, 3.5, 0], speed: 0.07 }
    : { radius: 14, height: 6, target: [0, 1.5, 0], speed: 0.08 };

  useFrame(() => {
    const t = performance.now() * 0.001 * config.speed;
    camera.position.set(Math.cos(t) * config.radius, config.height, Math.sin(t) * config.radius);
    camera.lookAt(config.target[0], config.target[1], config.target[2]);
  });
  return null;
}

// ─── ROOFTOP panel positions (on the house roof at y=4.0) ───
const ROOFTOP_PANEL_POSITIONS = [[-2, 4.05, -1], [0, 4.05, -1], [2, 4.05, -1]];

// ─── GARDEN tree spots (around the house) ───
const GARDEN_TREE_SPOTS = [
  [-7, 0, -5], [-7, 0, 5], [7, 0, -5], [7, 0, 5], [0, 0, 8],
];

// ─── WIND turbine position (on roof edge) ───
const TURBINE_POS = [3.5, 4.0, -2.8];

// ═══ UNIFIED HOUSE SCENE ═══
// Shows the same house always, with progressive additions
export function HouseScene3D({
  segment = 'trees',
  // Tree state
  trees = [], plantSpots = GARDEN_TREE_SPOTS, currentSpot = 0, co2Active = false, greenLevel = 0,
  // Solar state
  panelsPlaced = 0, panelAngle = 0, sunProgress = 0.5, energyFlowing = false,
  // Wind state
  turbineInstalled = false, windSpeed = 0,
  // Completed segments tracking
  treesComplete = false, solarComplete = false,
}) {
  const treePositions = trees.filter(t => t.growth >= 3).map(t => t.pos);
  const dustIntensity = 1 - greenLevel;
  const effectiveGreen = treesComplete ? Math.max(greenLevel, 0.5) : greenLevel;
  const showPrevTrees = (segment === 'solar' || segment === 'wind') && treesComplete;
  const showPrevSolar = segment === 'wind' && solarComplete;

  return (
    <>
      <HouseEnvironment greenLevel={effectiveGreen} segment={segment} />
      <AutoCamera segment={segment} />
      <House damageLevel={Math.max(0, 0.8 - effectiveGreen * 0.8)} />
      <DustParticles intensity={dustIntensity} />

      {/* Trees from current or previous segments */}
      {segment === 'trees' && (
        <>
          {plantSpots.map((pos, i) => <PlantSpot key={i} position={pos} active={i === currentSpot} />)}
          {trees.map((t, i) => <GrowingTree key={i} position={t.pos} growthPhase={t.growth} absorbing={t.absorbing} />)}
          <CO2Particles active={co2Active} treePositions={treePositions} />
          <O2Particles active={co2Active} treePositions={treePositions} />
        </>
      )}
      {showPrevTrees && GARDEN_TREE_SPOTS.map((pos, i) => (
        <GrowingTree key={`prev-${i}`} position={pos} growthPhase={4} absorbing={false} />
      ))}

      {/* Solar panels on rooftop */}
      {(segment === 'solar' || showPrevSolar) && (
        <>
          {ROOFTOP_PANEL_POSITIONS.map((pos, i) => (
            <SolarPanel key={i} position={pos}
              placed={showPrevSolar ? true : i < panelsPlaced}
              glowing={showPrevSolar ? true : energyFlowing && i < panelsPlaced}
              angle={showPrevSolar ? 180 : panelAngle} />
          ))}
          {segment === 'solar' && <AnimatedSun progress={sunProgress} />}
          {segment === 'solar' && <EnergyFlowLines active={energyFlowing} panelPositions={ROOFTOP_PANEL_POSITIONS.slice(0, panelsPlaced)} />}
        </>
      )}

      {/* Wind turbine on roof */}
      {segment === 'wind' && (
        <>
          <WindTurbine position={TURBINE_POS} installed={turbineInstalled} windSpeed={windSpeed} />
          <WindParticles windSpeed={windSpeed} />
        </>
      )}
    </>
  );
}

export { ROOFTOP_PANEL_POSITIONS, GARDEN_TREE_SPOTS, TURBINE_POS };

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
