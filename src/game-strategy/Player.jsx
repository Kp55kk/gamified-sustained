import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { APPLIANCE_POSITIONS, INTERACTABLE_IDS } from './applianceData';

// ════════════════════════════════════════════════════════════
//  WALL / COLLISION DATA
// ════════════════════════════════════════════════════════════

// Player wall collision segments (thin lines for capsule-like test)
const WALL_SEGMENTS = [
  { type: 'h', z: -8, x1: -10, x2: -6 },
  { type: 'h', z: -8, x1: -4, x2: 10 },
  { type: 'h', z: 8, x1: -10, x2: 10 },
  { type: 'h', z: 0, x1: -10, x2: -6 },
  { type: 'h', z: 0, x1: -4, x2: 4 },
  { type: 'h', z: 0, x1: 6, x2: 10 },
  { type: 'v', x: -10, z1: -8, z2: 8 },
  { type: 'v', x: 10, z1: -8, z2: 8 },
  { type: 'v', x: 0, z1: -8, z2: -5 },
  { type: 'v', x: 0, z1: -3, z2: 0 },
  { type: 'v', x: 4, z1: 0, z2: 3 },
  { type: 'v', x: 4, z1: 5, z2: 8 },
];

// Thick AABB boxes for camera raycasting (slightly oversized for safety)
const WALL_BOXES = [
  // Outer walls
  { min: [-10.2, 0, -8.2], max: [-5.8, 3.2, -7.8] },
  { min: [-4.2, 0, -8.2], max: [10.2, 3.2, -7.8] },
  { min: [-10.2, 0, 7.8],  max: [10.2, 3.2, 8.2] },
  { min: [-10.2, 0, -8.2], max: [-9.8, 3.2, 8.2] },
  { min: [9.8, 0, -8.2],   max: [10.2, 3.2, 8.2] },
  // Inner walls
  { min: [-10.1, 0, -0.15], max: [-5.9, 3.2, 0.15] },
  { min: [-4.1, 0, -0.15],  max: [4.1, 3.2, 0.15] },
  { min: [5.9, 0, -0.15],   max: [10.1, 3.2, 0.15] },
  { min: [-0.15, 0, -8.1],  max: [0.15, 3.2, -4.9] },
  { min: [-0.15, 0, -3.1],  max: [0.15, 3.2, 0.1] },
  { min: [3.85, 0, -0.1],   max: [4.15, 3.2, 3.1] },
  { min: [3.85, 0, 4.9],    max: [4.15, 3.2, 8.1] },
  // NOTE: No ceiling AABB — camera is allowed to orbit above walls
];

// Pre-build THREE.Box3 objects once (avoids GC churn every frame)
const WALL_AABBS = WALL_BOXES.map(b =>
  new THREE.Box3(
    new THREE.Vector3(b.min[0], b.min[1], b.min[2]),
    new THREE.Vector3(b.max[0], b.max[1], b.max[2])
  )
);

// ════════════════════════════════════════════════════════════
//  TUNING CONSTANTS — tweak these for feel
// ════════════════════════════════════════════════════════════

const PLAYER_SPEED        = 4.8;    // max m/s
const PLAYER_RADIUS       = 0.45;   // capsule radius for wall test
const INTERACTION_RADIUS  = 2.8;

// Camera
const CAM_DIST_OUTDOOR    = 7;      // camera distance outdoors / large rooms
const CAM_DIST_LIVING     = 6;
const CAM_DIST_BEDROOM    = 6;
const CAM_DIST_KITCHEN    = 5;
const CAM_DIST_BATHROOM   = 4;
const CAM_HEIGHT_OUTDOOR  = 5;
const CAM_HEIGHT_INDOOR   = 4;
const CAM_MIN_DIST        = 2.0;    // absolute minimum (very close zoom)
const CAM_WALL_PULLBACK   = 0.35;   // how far in front of wall to place cam

// Smoothing
const CAM_POS_SMOOTH      = 0.09;   // position lerp — lower = more lag (cinematic)
const CAM_POS_SMOOTH_FAR  = 0.18;   // when camera is far away, catch up faster
const CAM_DIST_SMOOTH     = 0.04;   // how fast camera distance adapts to room
const CAM_HEIGHT_SMOOTH   = 0.04;
const CAM_AUTOCENTER_SPEED = 0.3;   // how fast camera auto-centers behind player (rad/s)
const CAM_AUTOCENTER_DELAY = 2.0;   // seconds before auto-center kicks in

// Movement
const ACCEL_RATE          = 14;     // how fast we reach max speed
const DECEL_RATE          = 10;     // how fast we stop
const TURN_SPEED          = 0.15;   // character mesh rotation smoothing (0..1)
const VEL_DEADZONE        = 0.05;   // below this velocity, consider stopped

// Mouse
const MOUSE_SENSITIVITY   = 0.002;
const PITCH_MIN           = 0.2;    // prevent looking straight across
const PITCH_MAX           = 1.15;   // prevent looking under ground

// Smart Camera Brain
const PREDICTIVE_SHIFT    = 0.15;   // how much camera shifts opposite to turning
const LOCKON_RADIUS       = 3.5;    // focus on appliance within this distance
const LOCKON_STRENGTH     = 0.02;   // how strongly camera pulls toward appliance

// ════════════════════════════════════════════════════════════
//  UTILITY FUNCTIONS
// ════════════════════════════════════════════════════════════

function checkCollision(x, z) {
  for (const w of WALL_SEGMENTS) {
    if (w.type === 'h') {
      if (Math.abs(z - w.z) < PLAYER_RADIUS &&
          x >= w.x1 - PLAYER_RADIUS &&
          x <= w.x2 + PLAYER_RADIUS) return true;
    } else {
      if (Math.abs(x - w.x) < PLAYER_RADIUS &&
          z >= w.z1 - PLAYER_RADIUS &&
          z <= w.z2 + PLAYER_RADIUS) return true;
    }
  }
  return false;
}

// Navigation assist — tries to slide player along wall surface
function slideMove(x, z, dx, dz) {
  const nx = x + dx;
  const nz = z + dz;

  // Try full move first
  if (!checkCollision(nx, nz)) return { x: nx, z: nz };

  // Try X only (slide along Z-axis wall)
  if (!checkCollision(nx, z)) return { x: nx, z: z };

  // Try Z only (slide along X-axis wall)
  if (!checkCollision(x, nz)) return { x: x, z: nz };

  // Stuck — try micro-nudge to unstick from corners
  const nudge = 0.02;
  for (const [ndx, ndz] of [[nudge, 0], [-nudge, 0], [0, nudge], [0, -nudge]]) {
    if (!checkCollision(x + ndx, z + ndz)) return { x: x + ndx, z: z + ndz };
  }

  return { x, z }; // truly stuck, don't move
}

function getCurrentRoom(x, z) {
  if (x < 0 && z < 0)  return 'Living Room';
  if (x >= 0 && z < 0)  return 'Bedroom';
  if (x < 4 && z >= 0)  return 'Kitchen';
  return 'Bathroom';
}

function isInsideHouse(x, z) {
  return x > -9.8 && x < 9.8 && z > -7.8 && z < 7.8;
}

function getNearestAppliance(px, pz) {
  let nearest = null;
  let minDist = INTERACTION_RADIUS;
  for (const id of INTERACTABLE_IDS) {
    const ap = APPLIANCE_POSITIONS[id];
    if (!ap) continue;
    const dx = px - ap.pos[0];
    const dz = pz - ap.pos[2];
    const dist = Math.sqrt(dx * dx + dz * dz);
    if (dist < minDist) { minDist = dist; nearest = id; }
  }
  return nearest;
}

// Shortest angular difference (wraps around ±π)
function angleDiff(a, b) {
  let d = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI;
  if (d < -Math.PI) d += Math.PI * 2;
  return d;
}

// ════════════════════════════════════════════════════════════
//  CAMERA COLLISION — Multi-ray sphere-cast approximation
// ════════════════════════════════════════════════════════════

const _ray = new THREE.Ray();
const _hit = new THREE.Vector3();
const _dir = new THREE.Vector3();
const _p3  = new THREE.Vector3();

// Sphere-cast approximation: cast centre ray + 4 offset rays
function cameraSphereCast(playerPos, camPos) {
  _dir.subVectors(camPos, playerPos);
  const totalDist = _dir.length();
  if (totalDist < 0.2) return totalDist;
  _dir.normalize();

  let closest = totalDist;

  // centre + 4 corners of a virtual sphere
  const offsets = [
    [0, 0, 0],       // centre
    [0, 0.3, 0],     // up
    [0, -0.3, 0],    // down
    [0.3, 0, 0],     // right (approximate)
    [-0.3, 0, 0],    // left
  ];

  for (const [ox, oy, oz] of offsets) {
    _p3.set(playerPos.x + ox, playerPos.y + oy, playerPos.z + oz);
    _ray.set(_p3, _dir);

    for (const aabb of WALL_AABBS) {
      if (_ray.intersectBox(aabb, _hit)) {
        const d = _hit.distanceTo(_p3);
        if (d > 0.2 && d < closest) {
          closest = d;
        }
      }
    }
  }

  return Math.max(CAM_MIN_DIST, closest - CAM_WALL_PULLBACK);
}

// ════════════════════════════════════════════════════════════
//  CHARACTER MODEL (unchanged)
// ════════════════════════════════════════════════════════════

function ArjunModel({ isMoving }) {
  const leftArmRef = useRef();
  const rightArmRef = useRef();
  const leftLegRef = useRef();
  const rightLegRef = useRef();
  const bodyRef = useRef();

  useFrame(() => {
    if (!bodyRef.current) return;

    if (isMoving) {
      const t = performance.now() * 0.008;
      bodyRef.current.position.y = Math.sin(t * 2) * 0.04;
      const swing = 0.6, legSwing = 0.5;
      if (leftArmRef.current) leftArmRef.current.rotation.x = Math.sin(t) * swing;
      if (rightArmRef.current) rightArmRef.current.rotation.x = Math.sin(t + Math.PI) * swing;
      if (leftLegRef.current) leftLegRef.current.rotation.x = Math.sin(t + Math.PI) * legSwing;
      if (rightLegRef.current) rightLegRef.current.rotation.x = Math.sin(t) * legSwing;
    } else {
      const t = performance.now() * 0.002;
      bodyRef.current.position.y = Math.sin(t) * 0.015;
      if (leftArmRef.current) { leftArmRef.current.rotation.x = Math.sin(t * 0.7) * 0.04; leftArmRef.current.rotation.z = Math.sin(t * 0.5) * 0.02 - 0.05; }
      if (rightArmRef.current) { rightArmRef.current.rotation.x = Math.sin(t * 0.7 + 0.5) * 0.04; rightArmRef.current.rotation.z = Math.sin(t * 0.5 + 0.5) * 0.02 + 0.05; }
      if (leftLegRef.current) leftLegRef.current.rotation.x = 0;
      if (rightLegRef.current) rightLegRef.current.rotation.x = 0;
    }
  });

  const skin = '#c68642', shirt = '#22c55e', pants = '#2563eb', hair = '#1a1a2e', shoe = '#333';

  return (
    <group ref={bodyRef}>
      {/* LEFT LEG */}
      <group ref={leftLegRef} position={[-0.12, 0.6, 0]}>
        <mesh position={[0, -0.13, 0]} castShadow><cylinderGeometry args={[0.08, 0.07, 0.25]} /><meshStandardMaterial color={pants} /></mesh>
        <mesh position={[0, -0.35, 0]} castShadow><cylinderGeometry args={[0.065, 0.055, 0.25]} /><meshStandardMaterial color={pants} /></mesh>
        <mesh position={[0, -0.5, 0.04]} castShadow><boxGeometry args={[0.12, 0.1, 0.2]} /><meshStandardMaterial color={shoe} /></mesh>
      </group>
      {/* RIGHT LEG */}
      <group ref={rightLegRef} position={[0.12, 0.6, 0]}>
        <mesh position={[0, -0.13, 0]} castShadow><cylinderGeometry args={[0.08, 0.07, 0.25]} /><meshStandardMaterial color={pants} /></mesh>
        <mesh position={[0, -0.35, 0]} castShadow><cylinderGeometry args={[0.065, 0.055, 0.25]} /><meshStandardMaterial color={pants} /></mesh>
        <mesh position={[0, -0.5, 0.04]} castShadow><boxGeometry args={[0.12, 0.1, 0.2]} /><meshStandardMaterial color={shoe} /></mesh>
      </group>
      {/* TORSO */}
      <mesh position={[0, 0.85, 0]} castShadow><boxGeometry args={[0.45, 0.55, 0.25]} /><meshStandardMaterial color={shirt} /></mesh>
      <mesh position={[0, 0.88, 0.13]}><circleGeometry args={[0.07, 6]} /><meshStandardMaterial color="#fff" /></mesh>
      {/* LEFT ARM */}
      <group ref={leftArmRef} position={[-0.3, 1.0, 0]}>
        <mesh position={[0, -0.12, 0]} castShadow><cylinderGeometry args={[0.055, 0.05, 0.25]} /><meshStandardMaterial color={shirt} /></mesh>
        <mesh position={[0, -0.32, 0]} castShadow><cylinderGeometry args={[0.045, 0.04, 0.2]} /><meshStandardMaterial color={skin} /></mesh>
        <mesh position={[0, -0.44, 0]} castShadow><sphereGeometry args={[0.04, 8, 8]} /><meshStandardMaterial color={skin} /></mesh>
      </group>
      {/* RIGHT ARM */}
      <group ref={rightArmRef} position={[0.3, 1.0, 0]}>
        <mesh position={[0, -0.12, 0]} castShadow><cylinderGeometry args={[0.055, 0.05, 0.25]} /><meshStandardMaterial color={shirt} /></mesh>
        <mesh position={[0, -0.32, 0]} castShadow><cylinderGeometry args={[0.045, 0.04, 0.2]} /><meshStandardMaterial color={skin} /></mesh>
        <mesh position={[0, -0.44, 0]} castShadow><sphereGeometry args={[0.04, 8, 8]} /><meshStandardMaterial color={skin} /></mesh>
      </group>
      {/* NECK */}
      <mesh position={[0, 1.15, 0]}><cylinderGeometry args={[0.06, 0.06, 0.08]} /><meshStandardMaterial color={skin} /></mesh>
      {/* HEAD */}
      <group position={[0, 1.38, 0]}>
        <mesh castShadow><sphereGeometry args={[0.2, 16, 16]} /><meshStandardMaterial color={skin} /></mesh>
        <mesh position={[0, 0.08, -0.02]}><sphereGeometry args={[0.21, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color={hair} /></mesh>
        <mesh position={[0, 0.1, 0.12]}><boxGeometry args={[0.25, 0.08, 0.08]} /><meshStandardMaterial color={hair} /></mesh>
        {/* Eyes */}
        <mesh position={[-0.07, 0.02, 0.18]}><sphereGeometry args={[0.035, 8, 8]} /><meshStandardMaterial color="#fff" /></mesh>
        <mesh position={[-0.07, 0.02, 0.2]}><sphereGeometry args={[0.018, 8, 8]} /><meshStandardMaterial color="#22c55e" /></mesh>
        <mesh position={[0.07, 0.02, 0.18]}><sphereGeometry args={[0.035, 8, 8]} /><meshStandardMaterial color="#fff" /></mesh>
        <mesh position={[0.07, 0.02, 0.2]}><sphereGeometry args={[0.018, 8, 8]} /><meshStandardMaterial color="#22c55e" /></mesh>
        {/* Eyebrows */}
        <mesh position={[-0.07, 0.065, 0.19]} rotation={[0, 0, 0.15]}><boxGeometry args={[0.06, 0.015, 0.01]} /><meshStandardMaterial color={hair} /></mesh>
        <mesh position={[0.07, 0.065, 0.19]} rotation={[0, 0, -0.15]}><boxGeometry args={[0.06, 0.015, 0.01]} /><meshStandardMaterial color={hair} /></mesh>
        {/* Mouth */}
        <mesh position={[0, -0.06, 0.19]}><boxGeometry args={[0.06, 0.015, 0.01]} /><meshStandardMaterial color="#a0522d" /></mesh>
        {/* Ears */}
        <mesh position={[-0.2, 0, 0]}><sphereGeometry args={[0.04, 8, 8]} /><meshStandardMaterial color={skin} /></mesh>
        <mesh position={[0.2, 0, 0]}><sphereGeometry args={[0.04, 8, 8]} /><meshStandardMaterial color={skin} /></mesh>
      </group>
    </group>
  );
}

// ════════════════════════════════════════════════════════════
//  SHARED STATE (exported for Appliances, Level1, etc.)
// ════════════════════════════════════════════════════════════

export const playerState = {
  x: -5,
  z: -6.5,
  nearestAppliance: null,
  cameraYaw: 0,
};

export const cameraMode = {
  cinematic: false,
  targetX: 0, targetY: 1.5, targetZ: 0,
};

// ════════════════════════════════════════════════════════════
//  PLAYER COMPONENT
// ════════════════════════════════════════════════════════════

export default function Player({ onRoomChange, onNearestApplianceChange, onInteract }) {
  const groupRef = useRef();
  const { camera, gl } = useThree();

  // Input refs
  const keysRef    = useRef({ up: false, down: false, left: false, right: false });
  const isLockedRef = useRef(false);

  // Position / velocity
  const posRef     = useRef({ x: -5, z: -6.5 });
  const velRef     = useRef({ x: 0, z: 0 });
  const speedRef   = useRef(0);           // scalar speed for animation blending
  const movingRef  = useRef(false);

  // Character facing angle (smoothed)
  const facingRef  = useRef(0);

  // Camera orbit
  const yawRef     = useRef(0);
  const pitchRef   = useRef(0.55);
  const prevYawRef = useRef(0);            // for predictive shift

  // Camera adaptive
  const camDistRef   = useRef(CAM_DIST_OUTDOOR);
  const camHeightRef = useRef(CAM_HEIGHT_OUTDOOR);

  // Auto-center timer
  const idleTimeRef = useRef(0);

  // ── Pointer Lock ──
  useEffect(() => {
    const canvas = gl.domElement;
    const requestLock = () => { if (!isLockedRef.current) canvas.requestPointerLock(); };
    const onLockChange = () => { isLockedRef.current = document.pointerLockElement === canvas; };
    const onMouseMove = (e) => {
      if (!isLockedRef.current) return;
      yawRef.current -= e.movementX * MOUSE_SENSITIVITY;
      pitchRef.current = Math.max(PITCH_MIN, Math.min(PITCH_MAX, pitchRef.current - e.movementY * MOUSE_SENSITIVITY));
      idleTimeRef.current = 0; // reset auto-center on mouse movement
    };
    canvas.addEventListener('click', requestLock);
    document.addEventListener('pointerlockchange', onLockChange);
    document.addEventListener('mousemove', onMouseMove);
    return () => {
      canvas.removeEventListener('click', requestLock);
      document.removeEventListener('pointerlockchange', onLockChange);
      document.removeEventListener('mousemove', onMouseMove);
    };
  }, [gl]);

  // ── Keyboard ──
  useEffect(() => {
    const down = (e) => {
      switch (e.key.toLowerCase()) {
        case 'w': case 'arrowup':    keysRef.current.up    = true; break;
        case 's': case 'arrowdown':  keysRef.current.down  = true; break;
        case 'a': case 'arrowleft':  keysRef.current.left  = true; break;
        case 'd': case 'arrowright': keysRef.current.right = true; break;
        case 'e': if (onInteract && playerState.nearestAppliance) onInteract(playerState.nearestAppliance); break;
      }
    };
    const up = (e) => {
      switch (e.key.toLowerCase()) {
        case 'w': case 'arrowup':    keysRef.current.up    = false; break;
        case 's': case 'arrowdown':  keysRef.current.down  = false; break;
        case 'a': case 'arrowleft':  keysRef.current.left  = false; break;
        case 'd': case 'arrowright': keysRef.current.right = false; break;
      }
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, [onInteract]);

  // ══════════════════════════════════════════════════════════
  //  GAME LOOP
  // ══════════════════════════════════════════════════════════
  useFrame((_, rawDelta) => {
    // Clamp delta to prevent huge jumps on tab-switch
    const delta = Math.min(rawDelta, 0.05);
    const keys = keysRef.current;
    const yaw = yawRef.current;

    // ─────── 1. INPUT → TARGET VELOCITY ───────
    let inX = 0, inZ = 0;
    if (keys.up)    inZ -= 1;
    if (keys.down)  inZ += 1;
    if (keys.left)  inX -= 1;
    if (keys.right) inX += 1;

    const hasInput = inX !== 0 || inZ !== 0;

    if (hasInput) {
      idleTimeRef.current = 0; // reset auto-center

      // Normalize diagonal
      const len = Math.sqrt(inX * inX + inZ * inZ);
      const nx = inX / len;
      const nz = inZ / len;

      // Rotate by camera yaw → camera-relative movement
      const cosY = Math.cos(yaw);
      const sinY = Math.sin(yaw);
      const targetVX = (nx * cosY - nz * sinY) * PLAYER_SPEED;
      const targetVZ = (nx * sinY + nz * cosY) * PLAYER_SPEED;

      // Smooth acceleration (exponential approach)
      const lerpFactor = 1 - Math.exp(-ACCEL_RATE * delta);
      velRef.current.x += (targetVX - velRef.current.x) * lerpFactor;
      velRef.current.z += (targetVZ - velRef.current.z) * lerpFactor;

    } else {
      // Smooth deceleration
      const lerpFactor = 1 - Math.exp(-DECEL_RATE * delta);
      velRef.current.x *= (1 - lerpFactor);
      velRef.current.z *= (1 - lerpFactor);

      // Hard stop at deadzone
      if (Math.abs(velRef.current.x) < VEL_DEADZONE) velRef.current.x = 0;
      if (Math.abs(velRef.current.z) < VEL_DEADZONE) velRef.current.z = 0;

      idleTimeRef.current += delta;
    }

    // Scalar speed (for animation checks)
    speedRef.current = Math.sqrt(velRef.current.x ** 2 + velRef.current.z ** 2);
    const isMoving = speedRef.current > 0.15;
    movingRef.current = isMoving;

    // ─────── 2. POSITION UPDATE + WALL SLIDING ───────
    const dx = velRef.current.x * delta;
    const dz = velRef.current.z * delta;
    const result = slideMove(posRef.current.x, posRef.current.z, dx, dz);
    posRef.current.x = result.x;
    posRef.current.z = result.z;

    // ─────── 3. CHARACTER ROTATION (smooth, no snap) ───────
    if (isMoving) {
      const targetFacing = Math.atan2(velRef.current.x, velRef.current.z);
      // Use shortest-path angular interpolation
      const diff = angleDiff(facingRef.current, targetFacing);
      facingRef.current += diff * TURN_SPEED;
    }

    // ─────── 4. UPDATE SHARED STATE ───────
    playerState.x = posRef.current.x;
    playerState.z = posRef.current.z;
    playerState.cameraYaw = yaw;

    // Nearest appliance
    const nearest = getNearestAppliance(posRef.current.x, posRef.current.z);
    if (nearest !== playerState.nearestAppliance) {
      playerState.nearestAppliance = nearest;
      if (onNearestApplianceChange) onNearestApplianceChange(nearest);
    }

    // Room
    const room = getCurrentRoom(posRef.current.x, posRef.current.z);
    if (onRoomChange) onRoomChange(room);

    // ─────── 5. UPDATE MESH ───────
    if (groupRef.current) {
      groupRef.current.position.x = posRef.current.x;
      groupRef.current.position.z = posRef.current.z;
      groupRef.current.rotation.y = facingRef.current;
    }

    // ═══════════════════════════════════════════════════════
    //  6. CAMERA SYSTEM — "Smart Camera Brain"
    // ═══════════════════════════════════════════════════════

    if (cameraMode.cinematic) {
      // ── Cinematic lock-on to appliance ──
      const midX = (posRef.current.x + cameraMode.targetX) * 0.5;
      const midZ = (posRef.current.z + cameraMode.targetZ) * 0.5;
      const cinematicTarget = new THREE.Vector3(midX, cameraMode.targetY + 1.5, midZ);
      camera.position.lerp(cinematicTarget, 0.04);
      camera.lookAt(cameraMode.targetX, cameraMode.targetY, cameraMode.targetZ);
      prevYawRef.current = yaw;
      return;
    }

    // ── A. Target distance/height based on room ──
    const inside = isInsideHouse(posRef.current.x, posRef.current.z);
    let targetDist, targetHeight;

    if (!inside) {
      targetDist = CAM_DIST_OUTDOOR;
      targetHeight = CAM_HEIGHT_OUTDOOR;
    } else {
      targetHeight = CAM_HEIGHT_INDOOR;
      switch (room) {
        case 'Bathroom':   targetDist = CAM_DIST_BATHROOM; break;
        case 'Kitchen':    targetDist = CAM_DIST_KITCHEN;  break;
        case 'Living Room': targetDist = CAM_DIST_LIVING;  break;
        default:           targetDist = CAM_DIST_BEDROOM;
      }
    }

    // Smooth distance / height transitions
    camDistRef.current   += (targetDist   - camDistRef.current)   * CAM_DIST_SMOOTH;
    camHeightRef.current += (targetHeight - camHeightRef.current) * CAM_HEIGHT_SMOOTH;

    // ── B. Auto-center behind player when idle ──
    if (idleTimeRef.current > CAM_AUTOCENTER_DELAY && isMoving) {
      // Slowly nudge yaw toward opposite of facing (behind the player)
      const behindYaw = facingRef.current + Math.PI;
      const yawDiff = angleDiff(yawRef.current, behindYaw);
      yawRef.current += yawDiff * CAM_AUTOCENTER_SPEED * delta;
    }

    // ── C. Predictive camera shift (Smart Camera Brain) ──
    const yawDelta = yawRef.current - prevYawRef.current;
    prevYawRef.current = yawRef.current;
    // When turning left, shift camera slightly right (and vice versa)
    const predictiveYaw = yawRef.current - yawDelta * PREDICTIVE_SHIFT;

    // ── D. Calculate ideal camera position ──
    const pitch = pitchRef.current;
    const orbitDist = camDistRef.current;
    const orbitHeight = camHeightRef.current;

    const idealCamX = posRef.current.x + Math.sin(predictiveYaw) * Math.cos(pitch) * orbitDist;
    const idealCamZ = posRef.current.z + Math.cos(predictiveYaw) * Math.cos(pitch) * orbitDist;
    const idealCamY = Math.sin(pitch) * orbitHeight;

    // ── E. Sphere-cast collision — prevent wall clipping ──
    const playerEye = new THREE.Vector3(posRef.current.x, 1.2, posRef.current.z);
    const idealCamPos = new THREE.Vector3(idealCamX, idealCamY, idealCamZ);
    const safeDist = cameraSphereCast(playerEye, idealCamPos);
    const actualDist = Math.min(safeDist, orbitDist);

    // Recalculate with safe distance
    const ratio = actualDist / Math.max(orbitDist, 0.01);
    const safeCamX = posRef.current.x + Math.sin(predictiveYaw) * Math.cos(pitch) * actualDist;
    const safeCamZ = posRef.current.z + Math.cos(predictiveYaw) * Math.cos(pitch) * actualDist;
    const safeCamY = Math.max(1.2, idealCamY * ratio);

    // ── F. Lock-on focus — gently pull camera toward nearby appliance ──
    let lookX = posRef.current.x;
    let lookZ = posRef.current.z;
    const lookY = 1.2;

    if (nearest) {
      const ap = APPLIANCE_POSITIONS[nearest];
      if (ap) {
        const adx = ap.pos[0] - posRef.current.x;
        const adz = ap.pos[2] - posRef.current.z;
        const aDist = Math.sqrt(adx * adx + adz * adz);
        if (aDist < LOCKON_RADIUS) {
          const lockStr = LOCKON_STRENGTH * (1 - aDist / LOCKON_RADIUS);
          lookX = THREE.MathUtils.lerp(lookX, (posRef.current.x + ap.pos[0]) * 0.5, lockStr);
          lookZ = THREE.MathUtils.lerp(lookZ, (posRef.current.z + ap.pos[2]) * 0.5, lockStr);
        }
      }
    }

    // ── G. Apply with smooth lag ──
    const camTarget = new THREE.Vector3(safeCamX, safeCamY, safeCamZ);
    const dist2Cam = camera.position.distanceTo(camTarget);
    const lagFactor = dist2Cam > 4 ? CAM_POS_SMOOTH_FAR : CAM_POS_SMOOTH;

    camera.position.lerp(camTarget, lagFactor);
    camera.lookAt(lookX, lookY, lookZ);
  });

  return (
    <group ref={groupRef} position={[-5, 0, -6.5]}>
      <ArjunModel isMoving={movingRef.current} />
      {/* Shadow disc */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.3, 16]} />
        <meshBasicMaterial color="#000" transparent opacity={0.2} />
      </mesh>
    </group>
  );
}
