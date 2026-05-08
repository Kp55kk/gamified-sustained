// ═══════════════════════════════════════════════════════════
//  LEVEL 3 PHASE 2 — Core: Audio + Unified House Scene
// ═══════════════════════════════════════════════════════════
import React, { Suspense, useRef, useEffect } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  House, HouseEnvironment, DustParticles,
  GrowingTree, CO2Particles, O2Particles, PlantSpot,
  SolarPanel, AnimatedSun, EnergyFlowLines,
  WindTurbine, WindParticles,
  Birds, GrassPatches, DebrisObjects, FieldWindTurbine,
  HotspotMarker, BatteryUnit,
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

// ─── DRONE INTRO CAMERA — sweeps from bird's eye to eye-level ───
export function DroneIntroCamera({ active, onComplete }) {
  const { camera } = useThree();
  const progress = useRef(0);
  const startPos = new THREE.Vector3(0, 50, 50);
  const endPos = new THREE.Vector3(-20, 12, 15);
  const lookTarget = new THREE.Vector3(0, 2, 0);
  const completed = useRef(false);

  useEffect(() => {
    if (active) {
      progress.current = 0;
      completed.current = false;
      camera.position.copy(startPos);
      camera.lookAt(lookTarget);
    }
  }, [active]);

  useFrame((_, delta) => {
    if (!active || completed.current) return;
    progress.current += delta / 8; // 8-second sweep
    const t = Math.min(progress.current, 1);
    const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    camera.position.lerpVectors(startPos, endPos, ease);
    camera.lookAt(lookTarget);
    if (t >= 1 && !completed.current) {
      completed.current = true;
      if (onComplete) onComplete();
    }
  });
  return null;
}

// ─── Camera orbiting the house ───
function AutoCamera({ segment = 'trees' }) {
  const { camera } = useThree();
  const config = segment === 'solar'
    ? { radius: 22, height: 14, targetY: 4, speed: 0.04 }
    : segment === 'wind'
    ? { radius: 30, height: 12, targetY: 3, speed: 0.03 }
    : { radius: 26, height: 10, targetY: 2, speed: 0.05 };

  useFrame(() => {
    const t = performance.now() * 0.001 * config.speed;
    camera.position.set(
      Math.cos(t) * config.radius,
      config.height,
      Math.sin(t) * config.radius
    );
    camera.lookAt(0, config.targetY, 0);
  });
  return null;
}

// ─── ROOFTOP panel positions (on the real house roof at y=3.3) ───
const ROOFTOP_PANEL_POSITIONS = [[-4, 3.35, -3], [0, 3.35, -3], [4, 3.35, -3]];

// ─── GARDEN tree spots (outside the real house walls) ───
const GARDEN_TREE_SPOTS = [
  [-16, 0, -12], [-16, 0, 12], [16, 0, -12], [16, 0, 12], [0, 0, 14],
];

// ─── WIND turbine position (on roof) ───
const TURBINE_POS = [6, 3.3, -5];

// ─── FIELD turbine positions (far from house) ───
const FIELD_TURBINE_POSITIONS = [
  [-30, 0, -25], [30, 0, -25], [-30, 0, 25],
];

// ─── DEBRIS positions (around the garden outside the house) ───
const DEBRIS_POSITIONS = [
  [-14, 0.1, -10], [-12, 0.1, 10], [14, 0.1, -8],
  [15, 0.1, 6], [-13, 0.1, 14], [12, 0.1, -14],
];

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
  // New enhanced props
  debrisCleared = [], hotspots = [], activeHotspot = -1,
  fieldTurbines = [false, false, false], batteryCharge = 0, batteryActive = false,
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
      <GrassPatches greenLevel={effectiveGreen} />
      <Birds active={effectiveGreen > 0.4} count={Math.floor(effectiveGreen * 8)} />

      {/* Trees from current or previous segments */}
      {segment === 'trees' && (
        <>
          {plantSpots.map((pos, i) => <PlantSpot key={i} position={pos} active={i === currentSpot} />)}
          {trees.map((t, i) => <GrowingTree key={i} position={t.pos} growthPhase={t.growth} absorbing={t.absorbing} />)}
          <CO2Particles active={co2Active} treePositions={treePositions} />
          <O2Particles active={co2Active} treePositions={treePositions} />
          <DebrisObjects positions={DEBRIS_POSITIONS} cleared={debrisCleared} />
          {hotspots.map((h, i) => <HotspotMarker key={h.id} position={h.pos} active={i === activeHotspot} color="#f59e0b" />)}
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
          {segment === 'solar' && <BatteryUnit chargeLevel={batteryCharge} active={batteryActive} />}
        </>
      )}

      {/* Wind — field turbines + rooftop turbine */}
      {segment === 'wind' && (
        <>
          <WindTurbine position={TURBINE_POS} installed={turbineInstalled} windSpeed={windSpeed} />
          <WindParticles windSpeed={windSpeed} />
          {FIELD_TURBINE_POSITIONS.map((pos, i) => (
            <FieldWindTurbine key={i} position={pos} installed={fieldTurbines[i]} windSpeed={windSpeed} />
          ))}
        </>
      )}
    </>
  );
}

export { ROOFTOP_PANEL_POSITIONS, GARDEN_TREE_SPOTS, TURBINE_POS, FIELD_TURBINE_POSITIONS, DEBRIS_POSITIONS };

// ─── 3D Canvas wrapper ───
// Uses the SAME pattern as Phase 1's working Canvas (gl={{ antialias: false }}, toneMapping = 1)
export function Scene3DCanvas({ children }) {
  return (
    <div className="l3p2-canvas-wrap">
      <Canvas
        camera={{ position: [0, 12, 30], fov: 50 }}
        gl={{ antialias: false }}
        onCreated={({ gl }) => {
          gl.setClearColor('#1a1008');
          gl.toneMapping = 1;
          gl.toneMappingExposure = 1.2;
          gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        }}
      >
        <Suspense fallback={null}>
          {children}
        </Suspense>
      </Canvas>
    </div>
  );
}
