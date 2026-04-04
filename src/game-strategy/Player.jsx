import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { APPLIANCE_POSITIONS, INTERACTABLE_IDS } from './applianceData';

// ════════════════════════════════════════════════════════════
//  WALL COLLISION DATA — ONLY WALLS, NOT DOORWAYS/APPLIANCES
//  Doorways have gaps so character can walk through
// ════════════════════════════════════════════════════════════

const WALL_SEGMENTS = [
  // Front wall (z = -8) — fully solid, no door
  { type: 'h', z: -8, x1: -10, x2: 10 },

  // Back wall (z = 8)
  { type: 'h', z: 8, x1: -10, x2: 10 },

  // Horizontal middle wall (z = 0) — gaps for doorways
  { type: 'h', z: 0, x1: -10, x2: -6.5 },
  { type: 'h', z: 0, x1: -3.5, x2: 3.5 },
  { type: 'h', z: 0, x1: 6.5, x2: 10 },

  // Left wall (x = -10) — door gap at z = [-3.5, -0.5] near WiFi router
  { type: 'v', x: -10, z1: -8, z2: -3.5 },
  { type: 'v', x: -10, z1: -0.5, z2: 8 },
  // Right wall (x = 10)
  { type: 'v', x: 10, z1: -8, z2: 8 },

  // Vertical wall front (x = 0, z = [-8, 0]) — gap for doorway
  { type: 'v', x: 0, z1: -8, z2: -5.5 },
  { type: 'v', x: 0, z1: -2.5, z2: 0 },

  // Vertical wall back (x = 4, z = [0, 8]) — gap for doorway
  { type: 'v', x: 4, z1: 0, z2: 2.5 },
  { type: 'v', x: 4, z1: 5.5, z2: 8 },
];

// Collision radius — 0.4 triggers collisions earlier so character doesn't clip
const PLAYER_RADIUS = 0.45;
const INTERACTION_RADIUS = 2.8;

// ════════════════════════════════════════════════════════════
//  FURNITURE COLLISION BOXES (large objects only)
//  Small appliances (router, charger, STB) have NO collision
//  Doorframes have NO collision
//  Floor has NO collision
// ════════════════════════════════════════════════════════════

const FURNITURE_BOXES = [
  // Fridge (Kitchen) - moved inward
  { minX: -2.2, maxX: -0.8, minZ: 5.8, maxZ: 7.2 },
  // Washing Machine (Bathroom) - moved inward
  { minX: 4.8, maxX: 6.2, minZ: 5.8, maxZ: 7.2 },
  // Kitchen counter back wall - moved inward
  { minX: -9.0, maxX: -3.5, minZ: 6.0, maxZ: 7.2 },
  // Living room sofa (L-shaped)
  { minX: -9.5, maxX: -6.5, minZ: -7.5, maxZ: -5.5 },
  // Living room TV stand - tight around TV at z=-7.0
  { minX: -6.0, maxX: -4.0, minZ: -7.5, maxZ: -7.0 },
  // Bedroom bed
  { minX: 5.0, maxX: 9.5, minZ: -7.5, maxZ: -4.5 },
  // Bedroom desk - tight around desk at z=-7.0
  { minX: 1.5, maxX: 3.5, minZ: -7.5, maxZ: -7.0 },
  // Bathroom fixtures area (geyser) - moved inward
  { minX: 8.2, maxX: 9.5, minZ: 1.0, maxZ: 3.0 },
];

// ════════════════════════════════════════════════════════════
//  COLLISION — WALLS + LARGE FURNITURE
// ════════════════════════════════════════════════════════════

function checkCollision(x, z) {
  // Check walls
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
  // Check furniture
  for (const box of FURNITURE_BOXES) {
    if (x + PLAYER_RADIUS > box.minX && x - PLAYER_RADIUS < box.maxX &&
        z + PLAYER_RADIUS > box.minZ && z - PLAYER_RADIUS < box.maxZ) return true;
  }
  return false;
}

// moveWithCollisions equivalent — try full move, then slide, then clamp to house bounds
function moveWithCollisions(x, z, dx, dz) {
  let nx = x + dx;
  let nz = z + dz;
  // Clamp to house boundary as safety net (walls at ±10 x, ±8 z)
  nx = Math.max(-9.5, Math.min(9.5, nx));
  nz = Math.max(-7.5, Math.min(7.5, nz));
  if (!checkCollision(nx, nz)) return { x: nx, z: nz };
  const cx = Math.max(-9.5, Math.min(9.5, x + dx));
  if (!checkCollision(cx, z)) return { x: cx, z: z };
  const cz = Math.max(-9.5, Math.min(9.5, z + dz));
  if (!checkCollision(x, cz)) return { x: x, z: cz };
  return { x, z };
}

function getCurrentRoom(x, z) {
  if (x < 0 && z < 0) return 'Living Room';
  if (x >= 0 && z < 0) return 'Bedroom';
  if (x < 4 && z >= 0) return 'Kitchen';
  return 'Bathroom';
}

function getNearestAppliance(px, pz, idList) {
  let nearest = null;
  let minDist = INTERACTION_RADIUS;
  const ids = idList || INTERACTABLE_IDS;
  for (const id of ids) {
    const ap = APPLIANCE_POSITIONS[id];
    if (!ap) continue;
    const dx = px - ap.pos[0];
    const dz = pz - ap.pos[2];
    const dist = Math.sqrt(dx * dx + dz * dz);
    if (dist < minDist) { minDist = dist; nearest = id; }
  }
  return nearest;
}

// ════════════════════════════════════════════════════════════
//  CHARACTER MODEL (Arjun)
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
      bodyRef.current.position.y = Math.sin(t * 2) * 0.06;
      if (leftArmRef.current) leftArmRef.current.rotation.x = Math.sin(t) * 0.6;
      if (rightArmRef.current) rightArmRef.current.rotation.x = Math.sin(t + Math.PI) * 0.6;
      if (leftLegRef.current) leftLegRef.current.rotation.x = Math.sin(t + Math.PI) * 0.5;
      if (rightLegRef.current) rightLegRef.current.rotation.x = Math.sin(t) * 0.5;
    } else {
      const t = performance.now() * 0.002;
      bodyRef.current.position.y = Math.sin(t) * 0.02;
      if (leftArmRef.current) { leftArmRef.current.rotation.x = Math.sin(t * 0.7) * 0.05; leftArmRef.current.rotation.z = -0.05; }
      if (rightArmRef.current) { rightArmRef.current.rotation.x = Math.sin(t * 0.7 + 0.5) * 0.05; rightArmRef.current.rotation.z = 0.05; }
      if (leftLegRef.current) leftLegRef.current.rotation.x = 0;
      if (rightLegRef.current) rightLegRef.current.rotation.x = 0;
    }
  });

  const skin = '#c68642', shirt = '#22c55e', pants = '#2563eb', hair = '#1a1a2e', shoe = '#333';

  return (
    <group ref={bodyRef}>
      <group ref={leftLegRef} position={[-0.12, 0.6, 0]}>
        <mesh position={[0, -0.13, 0]} castShadow><cylinderGeometry args={[0.08, 0.07, 0.25]} /><meshStandardMaterial color={pants} /></mesh>
        <mesh position={[0, -0.35, 0]} castShadow><cylinderGeometry args={[0.065, 0.055, 0.25]} /><meshStandardMaterial color={pants} /></mesh>
        <mesh position={[0, -0.5, 0.04]} castShadow><boxGeometry args={[0.12, 0.1, 0.2]} /><meshStandardMaterial color={shoe} /></mesh>
      </group>
      <group ref={rightLegRef} position={[0.12, 0.6, 0]}>
        <mesh position={[0, -0.13, 0]} castShadow><cylinderGeometry args={[0.08, 0.07, 0.25]} /><meshStandardMaterial color={pants} /></mesh>
        <mesh position={[0, -0.35, 0]} castShadow><cylinderGeometry args={[0.065, 0.055, 0.25]} /><meshStandardMaterial color={pants} /></mesh>
        <mesh position={[0, -0.5, 0.04]} castShadow><boxGeometry args={[0.12, 0.1, 0.2]} /><meshStandardMaterial color={shoe} /></mesh>
      </group>
      <mesh position={[0, 0.85, 0]} castShadow><boxGeometry args={[0.45, 0.55, 0.25]} /><meshStandardMaterial color={shirt} /></mesh>
      <mesh position={[0, 0.88, 0.13]}><circleGeometry args={[0.07, 6]} /><meshStandardMaterial color="#fff" /></mesh>
      <group ref={leftArmRef} position={[-0.3, 1.0, 0]}>
        <mesh position={[0, -0.12, 0]} castShadow><cylinderGeometry args={[0.055, 0.05, 0.25]} /><meshStandardMaterial color={shirt} /></mesh>
        <mesh position={[0, -0.32, 0]} castShadow><cylinderGeometry args={[0.045, 0.04, 0.2]} /><meshStandardMaterial color={skin} /></mesh>
        <mesh position={[0, -0.44, 0]} castShadow><sphereGeometry args={[0.04, 8, 8]} /><meshStandardMaterial color={skin} /></mesh>
      </group>
      <group ref={rightArmRef} position={[0.3, 1.0, 0]}>
        <mesh position={[0, -0.12, 0]} castShadow><cylinderGeometry args={[0.055, 0.05, 0.25]} /><meshStandardMaterial color={shirt} /></mesh>
        <mesh position={[0, -0.32, 0]} castShadow><cylinderGeometry args={[0.045, 0.04, 0.2]} /><meshStandardMaterial color={skin} /></mesh>
        <mesh position={[0, -0.44, 0]} castShadow><sphereGeometry args={[0.04, 8, 8]} /><meshStandardMaterial color={skin} /></mesh>
      </group>
      <mesh position={[0, 1.15, 0]}><cylinderGeometry args={[0.06, 0.06, 0.08]} /><meshStandardMaterial color={skin} /></mesh>
      <group position={[0, 1.38, 0]}>
        <mesh castShadow><sphereGeometry args={[0.2, 16, 16]} /><meshStandardMaterial color={skin} /></mesh>
        <mesh position={[0, 0.08, -0.02]}><sphereGeometry args={[0.21, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color={hair} /></mesh>
        <mesh position={[0, 0.1, 0.12]}><boxGeometry args={[0.25, 0.08, 0.08]} /><meshStandardMaterial color={hair} /></mesh>
        <mesh position={[-0.07, 0.02, 0.18]}><sphereGeometry args={[0.035, 8, 8]} /><meshStandardMaterial color="#fff" /></mesh>
        <mesh position={[-0.07, 0.02, 0.2]}><sphereGeometry args={[0.018, 8, 8]} /><meshStandardMaterial color="#22c55e" /></mesh>
        <mesh position={[0.07, 0.02, 0.18]}><sphereGeometry args={[0.035, 8, 8]} /><meshStandardMaterial color="#fff" /></mesh>
        <mesh position={[0.07, 0.02, 0.2]}><sphereGeometry args={[0.018, 8, 8]} /><meshStandardMaterial color="#22c55e" /></mesh>
        <mesh position={[-0.07, 0.065, 0.19]} rotation={[0, 0, 0.15]}><boxGeometry args={[0.06, 0.015, 0.01]} /><meshStandardMaterial color={hair} /></mesh>
        <mesh position={[0.07, 0.065, 0.19]} rotation={[0, 0, -0.15]}><boxGeometry args={[0.06, 0.015, 0.01]} /><meshStandardMaterial color={hair} /></mesh>
        <mesh position={[0, -0.06, 0.19]}><boxGeometry args={[0.06, 0.015, 0.01]} /><meshStandardMaterial color="#a0522d" /></mesh>
        <mesh position={[-0.2, 0, 0]}><sphereGeometry args={[0.04, 8, 8]} /><meshStandardMaterial color={skin} /></mesh>
        <mesh position={[0.2, 0, 0]}><sphereGeometry args={[0.04, 8, 8]} /><meshStandardMaterial color={skin} /></mesh>
      </group>
    </group>
  );
}

// ════════════════════════════════════════════════════════════
//  SHARED STATE
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
//  - NO pointer lock
//  - NO mouse camera rotation
//  - Camera: above + behind character, lerp follow (like UniversalCamera with inputs.clear())
//  - Movement: WASD/Arrows rotate + move character, speed 0.15, turnSpeed 0.05
//  - Collisions: WALLS ONLY via moveWithCollisions
// ════════════════════════════════════════════════════════════

export default function Player({ onRoomChange, onNearestApplianceChange, onInteract, applianceIdList }) {
  const groupRef = useRef();
  const { camera } = useThree();

  // Input map — exactly as specified
  const keys = useRef({});
  const posRef = useRef({ x: -5, z: -6.5 });
  const rotRef = useRef(0); // character rotation.y
  const movingRef = useRef(false);

  // ── Reset all state on mount so character + camera start fresh ──
  useEffect(() => {
    // Reset position
    posRef.current = { x: -5, z: -6.5 };
    rotRef.current = 0;
    // Reset shared state
    playerState.x = -5;
    playerState.z = -6.5;
    playerState.nearestAppliance = null;
    playerState.cameraYaw = 0;
    // Reset camera mode
    cameraMode.cinematic = false;
    cameraMode.targetX = 0;
    cameraMode.targetY = 1.5;
    cameraMode.targetZ = 0;
    // Reset camera position to behind the character
    camera.position.set(-5 - Math.sin(0) * 8, 6, -6.5 - Math.cos(0) * 8);
    camera.lookAt(-5, 1.5, -6.5);
    // Reset character mesh position
    if (groupRef.current) {
      groupRef.current.position.set(-5, 0, -6.5);
      groupRef.current.rotation.y = 0;
    }
  }, [camera]);

  // ── Keyboard: keydown/keyup with preventDefault to stop page scroll ──
  useEffect(() => {
    const onKeyDown = (e) => {
      const k = e.key.toLowerCase();
      keys.current[k] = true;
      // Prevent page scroll on arrow keys
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) {
        e.preventDefault();
      }
      // E to interact
      if (k === 'e' && onInteract && playerState.nearestAppliance) {
        onInteract(playerState.nearestAppliance);
      }
    };
    const onKeyUp = (e) => {
      keys.current[e.key.toLowerCase()] = false;
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [onInteract]);

  // ══════════════════════════════════════════════════════════
  //  RENDER LOOP — exact logic from user spec
  // ══════════════════════════════════════════════════════════
  useFrame(() => {
    const k = keys.current;
    const speed = 0.15;
    const turnSpeed = 0.05;

    // ─── ROTATE character left/right (swapped signs for camera-relative controls) ───
    if (k['a'] || k['arrowleft']) {
      rotRef.current += turnSpeed;
    }
    if (k['d'] || k['arrowright']) {
      rotRef.current -= turnSpeed;
    }

    // ─── Calculate forward direction based on character rotation ───
    const forwardX = Math.sin(rotRef.current);
    const forwardZ = Math.cos(rotRef.current);

    let moved = false;

    // ─── MOVE character forward/backward ───
    if (k['w'] || k['arrowup']) {
      const result = moveWithCollisions(
        posRef.current.x, posRef.current.z,
        forwardX * speed, forwardZ * speed
      );
      posRef.current.x = result.x;
      posRef.current.z = result.z;
      moved = true;
    }
    if (k['s'] || k['arrowdown']) {
      const result = moveWithCollisions(
        posRef.current.x, posRef.current.z,
        -forwardX * speed, -forwardZ * speed
      );
      posRef.current.x = result.x;
      posRef.current.z = result.z;
      moved = true;
    }

    movingRef.current = moved;

    // ─── Update shared state ───
    playerState.x = posRef.current.x;
    playerState.z = posRef.current.z;
    playerState.cameraYaw = rotRef.current;

    // Nearest appliance
    const nearest = getNearestAppliance(posRef.current.x, posRef.current.z, applianceIdList);
    if (nearest !== playerState.nearestAppliance) {
      playerState.nearestAppliance = nearest;
      if (onNearestApplianceChange) onNearestApplianceChange(nearest);
    }

    // Room detection
    const room = getCurrentRoom(posRef.current.x, posRef.current.z);
    if (onRoomChange) onRoomChange(room);

    // ─── Update character mesh ───
    if (groupRef.current) {
      groupRef.current.position.x = posRef.current.x;
      groupRef.current.position.z = posRef.current.z;
      groupRef.current.rotation.y = rotRef.current;
    }

    // ═══════════════════════════════════════════════════════
    //  CAMERA — above + behind character, smooth lerp
    //  Equivalent to UniversalCamera with inputs.clear()
    //  Camera NEVER responds to mouse or keyboard directly
    // ═══════════════════════════════════════════════════════

    if (cameraMode.cinematic) {
      const midX = (posRef.current.x + cameraMode.targetX) * 0.5;
      const midZ = (posRef.current.z + cameraMode.targetZ) * 0.5;
      const cinematicTarget = new THREE.Vector3(midX, cameraMode.targetY + 1.5, midZ);
      camera.position.lerp(cinematicTarget, 0.04);
      camera.lookAt(cameraMode.targetX, cameraMode.targetY, cameraMode.targetZ);
      return;
    }

    // Target camera position: behind character based on rotation
    const targetCamX = posRef.current.x - Math.sin(rotRef.current) * 8;
    const targetCamY = 6; // character.position.y + 6 (character is at y=0)
    const targetCamZ = posRef.current.z - Math.cos(rotRef.current) * 8;

    // Smooth lerp — exactly 0.05 as specified
    camera.position.x += (targetCamX - camera.position.x) * 0.04;
    camera.position.y += (targetCamY - camera.position.y) * 0.04;
    camera.position.z += (targetCamZ - camera.position.z) * 0.04;

    // Look at character (position + Vector3(0, 1.5, 0))
    camera.lookAt(posRef.current.x, 1.5, posRef.current.z);
  });

  return (
    <group ref={groupRef} position={[-5, 0, -6.5]}>
      <ArjunModel isMoving={movingRef.current} />
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.3, 16]} />
        <meshBasicMaterial color="#000" transparent opacity={0.2} />
      </mesh>
    </group>
  );
}
