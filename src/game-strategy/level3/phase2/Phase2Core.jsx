// ═══════════════════════════════════════════════════════════
//  LEVEL 3 PHASE 2 — Core: Audio + Unified House Scene
//  Rooftop turbine REMOVED — only field turbines remain
// ═══════════════════════════════════════════════════════════
import React, { Suspense, useRef, useEffect } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  House, HouseEnvironment, DustParticles,
  GrowingTree, CO2Particles, O2Particles, PlantSpot,
  SolarPanel, AnimatedSun, EnergyFlowLines,
  WindParticles,
  Birds, GrassPatches, DebrisObjects, FieldWindTurbine,
  HotspotMarker, BatteryUnit, InverterBox, PowerCable,
  ArjunCharacter, WorkerCharacter, ConstructionVehicle,
  Ladder, ActionParticles, IrrigationSystem,
  PlantingHole, SeedInHole,
} from './Phase2Scenes';

// ─── Audio Context ───
let audioCtx = null;
function getCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

// ─── Generic SFX player using SFX configs ───
export function playSFX(config) {
  if (!config) return;
  try {
    const ctx = getCtx();
    const freqs = Array.isArray(config.freq) ? config.freq : [config.freq];
    freqs.forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type = config.type || 'sine';
      const t0 = ctx.currentTime + i * (config.dur / freqs.length);
      o.frequency.setValueAtTime(f, t0);
      g.gain.setValueAtTime(config.vol || 0.08, t0);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + config.dur);
      o.start(t0); o.stop(t0 + config.dur);
    });
  } catch (e) {}
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

// Premium SFX helpers
export function playDig() { playSFX({ freq: [120, 80, 100], dur: 0.25, type: 'sawtooth', vol: 0.08 }); }
export function playWater() { playSFX({ freq: [600, 900, 1200], dur: 0.4, type: 'sine', vol: 0.06 }); }
export function playInstall() { playSFX({ freq: [400, 600, 500], dur: 0.2, type: 'triangle', vol: 0.08 }); }
export function playWind() { playSFX({ freq: [200, 150, 180], dur: 0.5, type: 'sine', vol: 0.04 }); }
export function playBirdChirp() { playSFX({ freq: [1200, 1600, 1400, 1800], dur: 0.3, type: 'sine', vol: 0.04 }); }
export function playSweep() { playSFX({ freq: [300, 600, 800], dur: 0.25, type: 'sine', vol: 0.08 }); }
export function playWire() { playSFX({ freq: [600, 800, 600], dur: 0.2, type: 'square', vol: 0.05 }); }

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

// ─── Task-aware camera — stays focused on action, orbits only when told to ───
function TaskCamera({
  target = [0, 2, 0],      // Where the camera looks
  offset = [0, 10, 20],    // Camera position offset from target
  orbit = false,            // Whether to slowly orbit
  orbitSpeed = 0.03,
  orbitRadius = 24,
  orbitHeight = 10,
  lerpSpeed = 0.03,
}) {
  const { camera } = useThree();
  const targetVec = useRef(new THREE.Vector3(0, 2, 0));
  const posVec = useRef(new THREE.Vector3(0, 10, 20));

  useFrame(() => {
    if (orbit) {
      // Slow orbit mode (observe/auto tasks)
      const t = performance.now() * 0.001 * orbitSpeed;
      posVec.current.set(
        Math.cos(t) * orbitRadius,
        orbitHeight,
        Math.sin(t) * orbitRadius
      );
      targetVec.current.set(target[0], target[1], target[2]);
    } else {
      // Fixed camera — smooth lerp to configured position
      posVec.current.set(
        target[0] + offset[0],
        target[1] + offset[1],
        target[2] + offset[2]
      );
      targetVec.current.set(target[0], target[1], target[2]);
    }

    camera.position.lerp(posVec.current, lerpSpeed);
    const lookTarget = new THREE.Vector3();
    lookTarget.copy(camera.userData._lookTarget || targetVec.current);
    lookTarget.lerp(targetVec.current, lerpSpeed);
    camera.userData._lookTarget = lookTarget.clone();
    camera.lookAt(lookTarget);
  });
  return null;
}
// Legacy alias for backward compat
function AutoCamera({ segment = 'trees' }) {
  const config = segment === 'solar'
    ? { orbit: true, orbitRadius: 20, orbitHeight: 14, target: [0, 4, 0] }
    : segment === 'wind'
    ? { orbit: true, orbitRadius: 35, orbitHeight: 14, target: [0, 3, 0] }
    : { orbit: true, orbitRadius: 24, orbitHeight: 10, target: [0, 2, 0] };
  return <TaskCamera {...config} orbitSpeed={segment === 'wind' ? 0.03 : segment === 'solar' ? 0.04 : 0.05} />;
}

// ─── ROOFTOP panel positions (4 panels now) ───
const ROOFTOP_PANEL_POSITIONS = [[-5, 3.35, -3], [-1.5, 3.35, -3], [2, 3.35, -3], [5.5, 3.35, -3]];

// ─── GARDEN tree spots (outside the real house walls) ───
const GARDEN_TREE_SPOTS = [
  [-16, 0, -12], [-16, 0, 12], [16, 0, -12], [16, 0, 12], [0, 0, 14],
];

// ─── FIELD turbine positions — closer and more visible ───
const FIELD_TURBINE_POSITIONS = [
  [-25, 0, -20], [25, 0, -18], [-22, 0, 22],
];

// ─── DEBRIS positions (around the garden outside the house) ───
const DEBRIS_POSITIONS = [
  [-14, 0.1, -10], [-12, 0.1, 10], [14, 0.1, -8],
  [15, 0.1, 6], [-13, 0.1, 14], [12, 0.1, -14],
];

// ═══ UNIFIED HOUSE SCENE ═══
// Shows the same house always, with progressive additions
// NO rooftop turbine — only field turbines at ground level
export function HouseScene3D({
  segment = 'trees',
  // Tree state
  trees = [], plantSpots = GARDEN_TREE_SPOTS, currentSpot = 0, co2Active = false, greenLevel = 0,
  // Solar state
  panelsPlaced = 0, panelAngle = 0, sunProgress = 0.5, energyFlowing = false,
  wiringVisible = false,
  // Wind state
  windSpeed = 0,
  // Completed segments tracking
  treesComplete = false, solarComplete = false,
  // Enhanced props
  debrisCleared = [], hotspots = [], activeHotspot = -1,
  fieldTurbines = [false, false, false], batteryCharge = 0, batteryActive = false,
  inverterInstalled = false,
  // Character & animation props
  characterPos = [0, 0, 5], characterAction = 'idle', characterAngle = 0,
  particlePos = [0, 0, 0], particleType = 'none', particlesActive = false,
  showLadder = false, showVehicle = false, vehicleArriving = false,
  showWorkers = false, irrigationVisible = false,
  // Camera control — replaces the always-rotating AutoCamera
  cameraConfig = null,
  // Digging & planting visuals
  diggingHoles = [], seedsPlanted = [],
}) {
  const treePositions = trees.filter(t => t.growth >= 3).map(t => t.pos);
  const dustIntensity = 1 - greenLevel;
  const effectiveGreen = treesComplete ? Math.max(greenLevel, 0.5) : greenLevel;
  const showPrevTrees = (segment === 'solar' || segment === 'wind') && treesComplete;
  const showPrevSolar = segment === 'wind' && solarComplete;

  // Determine camera: use cameraConfig if provided, else fallback to orbiting
  const cam = cameraConfig || { orbit: true };

  return (
    <>
      <HouseEnvironment greenLevel={effectiveGreen} segment={segment} />
      <TaskCamera
        target={cam.target || [0, 2, 0]}
        offset={cam.offset || [0, 10, 20]}
        orbit={cam.orbit || false}
        orbitSpeed={cam.orbitSpeed || (segment === 'wind' ? 0.03 : segment === 'solar' ? 0.04 : 0.05)}
        orbitRadius={cam.orbitRadius || (segment === 'wind' ? 35 : segment === 'solar' ? 20 : 24)}
        orbitHeight={cam.orbitHeight || (segment === 'wind' ? 14 : segment === 'solar' ? 14 : 10)}
        lerpSpeed={cam.lerpSpeed || 0.03}
      />
      <House damageLevel={Math.max(0, 0.8 - effectiveGreen * 0.8)} />
      <DustParticles intensity={dustIntensity} />
      <GrassPatches greenLevel={effectiveGreen} />
      <Birds active={effectiveGreen > 0.4} count={Math.floor(effectiveGreen * 8)} />

      {/* Trees from current or previous segments */}
      {segment === 'trees' && (
        <>
          {plantSpots.map((pos, i) => <PlantSpot key={i} position={pos} active={i === currentSpot} />)}
          {trees.map((t, i) => <GrowingTree key={i} position={t.pos} growthPhase={t.growth} absorbing={t.absorbing} treeType={t.type} />)}
          <CO2Particles active={co2Active} treePositions={treePositions} />
          <O2Particles active={co2Active} treePositions={treePositions} />
          <DebrisObjects positions={DEBRIS_POSITIONS} cleared={debrisCleared} />
          {hotspots.map((h, i) => <HotspotMarker key={h.id} position={h.pos} active={i === activeHotspot} color="#f59e0b" />)}
          {/* Planting holes — visible dug holes in the ground */}
          {diggingHoles.map((pos, i) => (
            <PlantingHole key={`hole-${i}`} position={pos} hasSeed={seedsPlanted.includes(i)} />
          ))}
          {/* Seeds visible in holes */}
          {seedsPlanted.map((idx) => {
            const pos = diggingHoles[idx];
            if (!pos) return null;
            return <SeedInHole key={`seed-${idx}`} position={pos} />;
          })}
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
          {segment === 'solar' && inverterInstalled && <InverterBox />}
          {segment === 'solar' && wiringVisible && <PowerCable from={[0, 3.35, -3]} to={[5, 1.5, 4]} />}
        </>
      )}

      {/* Wind — field turbines ONLY, no rooftop turbine */}
      {segment === 'wind' && (
        <>
          <WindParticles windSpeed={windSpeed} />
          {FIELD_TURBINE_POSITIONS.map((pos, i) => (
            <FieldWindTurbine key={i} position={pos} installed={fieldTurbines[i]} windSpeed={windSpeed} />
          ))}
        </>
      )}

      {/* Arjun Character — always visible during gameplay */}
      <ArjunCharacter position={characterPos} action={characterAction} facingAngle={characterAngle} scale={1.2} />

      {/* Action particles at character's work position */}
      <ActionParticles position={particlePos} type={particleType} active={particlesActive} />

      {/* Ladder for solar rooftop access */}
      <Ladder position={[-10.5, 0, -3]} visible={showLadder} />

      {/* Construction vehicle for wind turbine delivery */}
      <ConstructionVehicle position={[-30, 0, -20]} visible={showVehicle} arriving={vehicleArriving} />

      {/* Workers near turbine sites */}
      {showWorkers && FIELD_TURBINE_POSITIONS.map((pos, i) => (
        <group key={`workers-${i}`}>
          <WorkerCharacter position={[pos[0] + 1.5, pos[1], pos[2]]} action={fieldTurbines[i] ? 'idle' : 'work'} facingAngle={Math.PI * 0.3 * i} />
          <WorkerCharacter position={[pos[0] - 1, pos[1], pos[2] + 1]} action={fieldTurbines[i] ? 'idle' : 'work'} facingAngle={Math.PI * 0.5 + i} />
        </group>
      ))}

      {/* Irrigation system connecting to planted trees */}
      <IrrigationSystem treePositions={trees.map(t => t.pos)} visible={irrigationVisible} />
    </>
  );
}

export { ROOFTOP_PANEL_POSITIONS, GARDEN_TREE_SPOTS, FIELD_TURBINE_POSITIONS, DEBRIS_POSITIONS };

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
