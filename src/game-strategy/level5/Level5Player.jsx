// ═══════════════════════════════════════════════════════════
//  LEVEL 5 — Player (reuses L4 mechanics + zone detection)
// ═══════════════════════════════════════════════════════════
import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { APPLIANCE_POSITIONS } from '../applianceData';

const INTERACTION_RADIUS = 3.0;
const PLAYER_RADIUS = 0.45;

// Level 5 Store appliance positions (placed in the house after buying)
const L5_APPLIANCE_POSITIONS = {
  air_cooler:         { pos: [-3, 0.5, -4] },     // Living Room — near center
  smart_power_strip:  { pos: [-8, 0.3, -3.5] },   // Living Room — near sofa
  led_smart_system:   { pos: [3, 2.5, -5] },       // Bedroom — near table fan area
  solar_water_heater: { pos: [9.0, 1.5, 3] },      // Bathroom — near geyser
  ev_charger:         { pos: [0, 0, 12] },         // Outside — Behind house
};

const WALL_SEGMENTS = [
  { type: 'h', z: -8, x1: -10, x2: 10 },
  { type: 'h', z: 8, x1: -10, x2: -2 },
  { type: 'h', z: 8, x1: 2, x2: 10 },
  { type: 'v', x: -10, z1: -8, z2: -3.5 },
  { type: 'v', x: -10, z1: -0.5, z2: 8 },
  { type: 'v', x: 10, z1: -8, z2: 8 },
  { type: 'h', z: 0, x1: -10, x2: -6.5 },
  { type: 'h', z: 0, x1: -3.5, x2: 3.5 },
  { type: 'h', z: 0, x1: 6.5, x2: 10 },
  { type: 'v', x: 0, z1: -8, z2: -5.5 },
  { type: 'v', x: 0, z1: -2.5, z2: 0 },
  { type: 'v', x: 4, z1: 0, z2: 2.5 },
  { type: 'v', x: 4, z1: 5.5, z2: 8 },
];

const FURNITURE_BOXES = [
  { minX: -2.2, maxX: -0.8, minZ: 5.8, maxZ: 7.2 },
  { minX: 4.8, maxX: 6.2, minZ: 5.8, maxZ: 7.2 },
  { minX: -9.0, maxX: -3.5, minZ: 6.0, maxZ: 7.2 },
  { minX: -9.5, maxX: -6.5, minZ: -7.5, maxZ: -5.5 },
  { minX: -6.0, maxX: -4.0, minZ: -7.5, maxZ: -7.0 },
  { minX: 5.0, maxX: 9.5, minZ: -7.5, maxZ: -4.5 },
  { minX: 1.5, maxX: 3.5, minZ: -7.5, maxZ: -7.0 },
  { minX: 8.2, maxX: 9.5, minZ: 1.0, maxZ: 3.0 },
];

function checkCollision(x, z) {
  for (const w of WALL_SEGMENTS) {
    if (w.type === 'h') { if (Math.abs(z - w.z) < PLAYER_RADIUS && x >= w.x1 - PLAYER_RADIUS && x <= w.x2 + PLAYER_RADIUS) return true; }
    else { if (Math.abs(x - w.x) < PLAYER_RADIUS && z >= w.z1 - PLAYER_RADIUS && z <= w.z2 + PLAYER_RADIUS) return true; }
  }
  for (const box of FURNITURE_BOXES) {
    if (x + PLAYER_RADIUS > box.minX && x - PLAYER_RADIUS < box.maxX && z + PLAYER_RADIUS > box.minZ && z - PLAYER_RADIUS < box.maxZ) return true;
  }
  return false;
}

function moveWithWalls(x, z, dx, dz) {
  let nx = Math.max(-30, Math.min(30, x + dx)), nz = Math.max(-30, Math.min(30, z + dz));
  if (!checkCollision(nx, nz)) return { x: nx, z: nz };
  const sx = Math.max(-30, Math.min(30, x + dx));
  if (!checkCollision(sx, z)) return { x: sx, z };
  const sz = Math.max(-30, Math.min(30, z + dz));
  if (!checkCollision(x, sz)) return { x, z: sz };
  return { x, z };
}

function getZone(x, z) {
  if (x > 10 && x < 20 && z > -12 && z < 0) return 'Utility';
  if (x < -10 || x > 10 || z < -8 || z > 8) return 'Outside';
  if (x < 0 && z < 0) return 'Living Room';
  if (x >= 0 && z < 0) return 'Bedroom';
  if (x < 4 && z >= 0) return 'Kitchen';
  return 'Bathroom';
}

function getNearestAppliance(px, pz, idList) {
  let nearest = null, minDist = INTERACTION_RADIUS;
  for (const id of idList) {
    const ap = APPLIANCE_POSITIONS[id] || L5_APPLIANCE_POSITIONS[id];
    if (!ap) continue;
    const dx = px - ap.pos[0], dz = pz - ap.pos[2];
    const dist = Math.sqrt(dx * dx + dz * dz);
    if (dist < minDist) { minDist = dist; nearest = id; }
  }
  return nearest;
}

function ArjunModel({ isMoving }) {
  const leftArmRef = useRef(), rightArmRef = useRef(), leftLegRef = useRef(), rightLegRef = useRef(), bodyRef = useRef();
  useFrame(() => {
    if (!bodyRef.current) return;
    if (isMoving) {
      const t = performance.now() * 0.008;
      bodyRef.current.position.y = Math.sin(t * 2) * 0.06;
      if (leftArmRef.current) leftArmRef.current.rotation.x = Math.sin(t) * 0.6;
      if (rightArmRef.current) rightArmRef.current.rotation.x = Math.sin(t + Math.PI) * 0.6;
      if (leftLegRef.current) leftLegRef.current.rotation.x = Math.sin(t + Math.PI) * 0.5;
      if (rightLegRef.current) rightLegRef.current.rotation.x = Math.sin(t) * 0.5;
    } else {
      const t = performance.now() * 0.002;
      bodyRef.current.position.y = Math.sin(t) * 0.02;
      if (leftArmRef.current) { leftArmRef.current.rotation.x = 0; }
      if (rightArmRef.current) { rightArmRef.current.rotation.x = 0; }
      if (leftLegRef.current) leftLegRef.current.rotation.x = 0;
      if (rightLegRef.current) rightLegRef.current.rotation.x = 0;
    }
  });
  const skin='#c68642',shirt='#16a34a',pants='#1e3a5f',hair='#1a1a2e',shoe='#333';
  return (
    <group ref={bodyRef}>
      <group ref={leftLegRef} position={[-0.12,0.6,0]}><mesh position={[0,-0.13,0]}><cylinderGeometry args={[0.08,0.07,0.25]}/><meshStandardMaterial color={pants}/></mesh><mesh position={[0,-0.35,0]}><cylinderGeometry args={[0.065,0.055,0.25]}/><meshStandardMaterial color={pants}/></mesh><mesh position={[0,-0.5,0.04]}><boxGeometry args={[0.12,0.1,0.2]}/><meshStandardMaterial color={shoe}/></mesh></group>
      <group ref={rightLegRef} position={[0.12,0.6,0]}><mesh position={[0,-0.13,0]}><cylinderGeometry args={[0.08,0.07,0.25]}/><meshStandardMaterial color={pants}/></mesh><mesh position={[0,-0.35,0]}><cylinderGeometry args={[0.065,0.055,0.25]}/><meshStandardMaterial color={pants}/></mesh><mesh position={[0,-0.5,0.04]}><boxGeometry args={[0.12,0.1,0.2]}/><meshStandardMaterial color={shoe}/></mesh></group>
      <mesh position={[0,0.85,0]}><boxGeometry args={[0.45,0.55,0.25]}/><meshStandardMaterial color={shirt}/></mesh>
      <group ref={leftArmRef} position={[-0.3,1.0,0]}><mesh position={[0,-0.12,0]}><cylinderGeometry args={[0.055,0.05,0.25]}/><meshStandardMaterial color={shirt}/></mesh><mesh position={[0,-0.32,0]}><cylinderGeometry args={[0.045,0.04,0.2]}/><meshStandardMaterial color={skin}/></mesh></group>
      <group ref={rightArmRef} position={[0.3,1.0,0]}><mesh position={[0,-0.12,0]}><cylinderGeometry args={[0.055,0.05,0.25]}/><meshStandardMaterial color={shirt}/></mesh><mesh position={[0,-0.32,0]}><cylinderGeometry args={[0.045,0.04,0.2]}/><meshStandardMaterial color={skin}/></mesh></group>
      <mesh position={[0,1.15,0]}><cylinderGeometry args={[0.06,0.06,0.08]}/><meshStandardMaterial color={skin}/></mesh>
      <group position={[0,1.38,0]}>
        <mesh><sphereGeometry args={[0.2,16,16]}/><meshStandardMaterial color={skin}/></mesh>
        <mesh position={[0,0.08,-0.02]}><sphereGeometry args={[0.21,16,12,0,Math.PI*2,0,Math.PI/2]}/><meshStandardMaterial color={hair}/></mesh>
        <mesh position={[-0.07,0.02,0.18]}><sphereGeometry args={[0.035,8,8]}/><meshStandardMaterial color="#fff"/></mesh>
        <mesh position={[-0.07,0.02,0.2]}><sphereGeometry args={[0.018,8,8]}/><meshStandardMaterial color="#22c55e"/></mesh>
        <mesh position={[0.07,0.02,0.18]}><sphereGeometry args={[0.035,8,8]}/><meshStandardMaterial color="#fff"/></mesh>
        <mesh position={[0.07,0.02,0.2]}><sphereGeometry args={[0.018,8,8]}/><meshStandardMaterial color="#22c55e"/></mesh>
      </group>
    </group>
  );
}

export const l5PlayerState = { x: -12, z: -2, nearestAppliance: null, cameraYaw: -Math.PI / 2, cameraPitch: 0.3 };

export default function Level5Player({ onZoneChange, onNearestApplianceChange, onInteract, applianceIdList }) {
  const groupRef = useRef();
  const { camera } = useThree();
  const keys = useRef({});
  const posRef = useRef({ x: -12, z: -2 });
  const rotRef = useRef(-Math.PI / 2);
  const pitchRef = useRef(0.3);
  const movingRef = useRef(false);

  useEffect(() => {
    posRef.current = { x: -12, z: -2 }; rotRef.current = -Math.PI / 2; pitchRef.current = 0.3;
    l5PlayerState.x = -12; l5PlayerState.z = -2;
    camera.position.set(-12, 6, -2 - 8); camera.lookAt(-12, 1.5, -2);
    if (groupRef.current) { groupRef.current.position.set(-12, 0, -2); groupRef.current.rotation.y = -Math.PI / 2; }
  }, [camera]);

  useEffect(() => {
    const onDown = e => {
      const k = e.key.toLowerCase();
      keys.current[k] = true;
      if (['arrowup','arrowdown','arrowleft','arrowright'].includes(k)) e.preventDefault();
      if (k === 'e' && onInteract && l5PlayerState.nearestAppliance) onInteract(l5PlayerState.nearestAppliance);
    };
    const onUp = e => { keys.current[e.key.toLowerCase()] = false; };
    window.addEventListener('keydown', onDown); window.addEventListener('keyup', onUp);
    return () => { window.removeEventListener('keydown', onDown); window.removeEventListener('keyup', onUp); };
  }, [onInteract]);

  useFrame(() => {
    const k = keys.current, speed = 0.15, turnSpeed = 0.05;
    if (k['a'] || k['arrowleft']) rotRef.current += turnSpeed;
    if (k['d'] || k['arrowright']) rotRef.current -= turnSpeed;
    if (k['q']) pitchRef.current = Math.min(pitchRef.current + 0.02, 1.2);
    if (k['z']) pitchRef.current = Math.max(pitchRef.current - 0.02, -0.3);
    const fX = Math.sin(rotRef.current), fZ = Math.cos(rotRef.current);
    let moved = false;
    if (k['w'] || k['arrowup']) { const r = moveWithWalls(posRef.current.x, posRef.current.z, fX * speed, fZ * speed); posRef.current = r; moved = true; }
    if (k['s'] || k['arrowdown']) { const r = moveWithWalls(posRef.current.x, posRef.current.z, -fX * speed, -fZ * speed); posRef.current = r; moved = true; }
    movingRef.current = moved;
    l5PlayerState.x = posRef.current.x; l5PlayerState.z = posRef.current.z;
    const nearest = getNearestAppliance(posRef.current.x, posRef.current.z, applianceIdList || []);
    if (nearest !== l5PlayerState.nearestAppliance) { l5PlayerState.nearestAppliance = nearest; if (onNearestApplianceChange) onNearestApplianceChange(nearest); }
    const zone = getZone(posRef.current.x, posRef.current.z);
    if (onZoneChange) onZoneChange(zone);
    if (groupRef.current) { groupRef.current.position.x = posRef.current.x; groupRef.current.position.z = posRef.current.z; groupRef.current.rotation.y = rotRef.current; }
    const camDist = 8, camH = 3 + pitchRef.current * 5;
    camera.position.x += (posRef.current.x - Math.sin(rotRef.current) * camDist - camera.position.x) * 0.05;
    camera.position.y += (camH - camera.position.y) * 0.05;
    camera.position.z += (posRef.current.z - Math.cos(rotRef.current) * camDist - camera.position.z) * 0.05;
    camera.lookAt(posRef.current.x, 1.5 + pitchRef.current * 2, posRef.current.z);
  });

  return (
    <group ref={groupRef} position={[-12, 0, -2]}>
      <ArjunModel isMoving={movingRef.current} />
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.3, 16]} /><meshBasicMaterial color="#000" transparent opacity={0.2} /></mesh>
    </group>
  );
}
