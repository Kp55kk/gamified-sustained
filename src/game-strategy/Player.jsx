import React, { useRef, useEffect, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { APPLIANCE_POSITIONS, INTERACTABLE_IDS } from './applianceData';

// Wall collision segments
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

const PLAYER_SPEED = 5;
const PLAYER_RADIUS = 0.45;
const INTERACTION_RADIUS = 2.8;
const CAM_DISTANCE = 7;
const CAM_HEIGHT = 5;

function checkCollision(x, z) {
  for (const w of WALL_SEGMENTS) {
    if (w.type === 'h') {
      if (Math.abs(z - w.z) < PLAYER_RADIUS && x >= w.x1 - PLAYER_RADIUS && x <= w.x2 + PLAYER_RADIUS) return true;
    } else {
      if (Math.abs(x - w.x) < PLAYER_RADIUS && z >= w.z1 - PLAYER_RADIUS && z <= w.z2 + PLAYER_RADIUS) return true;
    }
  }
  return false;
}

function getCurrentRoom(x, z) {
  if (x < 0 && z < 0) return 'Living Room';
  if (x >= 0 && z < 0) return 'Bedroom';
  if (x < 4 && z >= 0) return 'Kitchen';
  return 'Bathroom';
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
    if (dist < minDist) {
      minDist = dist;
      nearest = id;
    }
  }
  return nearest;
}

// ─── Arjun Character Model ───
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
      // Body bob
      bodyRef.current.position.y = Math.sin(t * 2) * 0.04;
      // Walk cycle
      const swing = 0.6;
      const legSwing = 0.5;
      if (leftArmRef.current) leftArmRef.current.rotation.x = Math.sin(t) * swing;
      if (rightArmRef.current) rightArmRef.current.rotation.x = Math.sin(t + Math.PI) * swing;
      if (leftLegRef.current) leftLegRef.current.rotation.x = Math.sin(t + Math.PI) * legSwing;
      if (rightLegRef.current) rightLegRef.current.rotation.x = Math.sin(t) * legSwing;
    } else {
      // Idle: subtle breathing + sway
      const t = performance.now() * 0.002;
      bodyRef.current.position.y = Math.sin(t) * 0.015;
      if (leftArmRef.current) leftArmRef.current.rotation.x = Math.sin(t * 0.7) * 0.04;
      if (rightArmRef.current) rightArmRef.current.rotation.x = Math.sin(t * 0.7 + 0.5) * 0.04;
      if (leftArmRef.current) leftArmRef.current.rotation.z = Math.sin(t * 0.5) * 0.02 - 0.05;
      if (rightArmRef.current) rightArmRef.current.rotation.z = Math.sin(t * 0.5 + 0.5) * 0.02 + 0.05;
      if (leftLegRef.current) leftLegRef.current.rotation.x = 0;
      if (rightLegRef.current) rightLegRef.current.rotation.x = 0;
    }
  });

  const skinColor = '#c68642';
  const shirtColor = '#22c55e';
  const pantsColor = '#2563eb';
  const hairColor = '#1a1a2e';
  const shoeColor = '#333';

  return (
    <group ref={bodyRef}>
      {/* LEFT LEG */}
      <group ref={leftLegRef} position={[-0.12, 0.6, 0]}>
        <mesh position={[0, -0.13, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.07, 0.25]} />
          <meshStandardMaterial color={pantsColor} />
        </mesh>
        <mesh position={[0, -0.35, 0]} castShadow>
          <cylinderGeometry args={[0.065, 0.055, 0.25]} />
          <meshStandardMaterial color={pantsColor} />
        </mesh>
        <mesh position={[0, -0.5, 0.04]} castShadow>
          <boxGeometry args={[0.12, 0.1, 0.2]} />
          <meshStandardMaterial color={shoeColor} />
        </mesh>
      </group>

      {/* RIGHT LEG */}
      <group ref={rightLegRef} position={[0.12, 0.6, 0]}>
        <mesh position={[0, -0.13, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.07, 0.25]} />
          <meshStandardMaterial color={pantsColor} />
        </mesh>
        <mesh position={[0, -0.35, 0]} castShadow>
          <cylinderGeometry args={[0.065, 0.055, 0.25]} />
          <meshStandardMaterial color={pantsColor} />
        </mesh>
        <mesh position={[0, -0.5, 0.04]} castShadow>
          <boxGeometry args={[0.12, 0.1, 0.2]} />
          <meshStandardMaterial color={shoeColor} />
        </mesh>
      </group>

      {/* TORSO */}
      <mesh position={[0, 0.85, 0]} castShadow>
        <boxGeometry args={[0.45, 0.55, 0.25]} />
        <meshStandardMaterial color={shirtColor} />
      </mesh>
      <mesh position={[0, 0.88, 0.13]}>
        <circleGeometry args={[0.07, 6]} />
        <meshStandardMaterial color="#fff" />
      </mesh>

      {/* LEFT ARM */}
      <group ref={leftArmRef} position={[-0.3, 1.0, 0]}>
        <mesh position={[0, -0.12, 0]} castShadow>
          <cylinderGeometry args={[0.055, 0.05, 0.25]} />
          <meshStandardMaterial color={shirtColor} />
        </mesh>
        <mesh position={[0, -0.32, 0]} castShadow>
          <cylinderGeometry args={[0.045, 0.04, 0.2]} />
          <meshStandardMaterial color={skinColor} />
        </mesh>
        <mesh position={[0, -0.44, 0]} castShadow>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color={skinColor} />
        </mesh>
      </group>

      {/* RIGHT ARM */}
      <group ref={rightArmRef} position={[0.3, 1.0, 0]}>
        <mesh position={[0, -0.12, 0]} castShadow>
          <cylinderGeometry args={[0.055, 0.05, 0.25]} />
          <meshStandardMaterial color={shirtColor} />
        </mesh>
        <mesh position={[0, -0.32, 0]} castShadow>
          <cylinderGeometry args={[0.045, 0.04, 0.2]} />
          <meshStandardMaterial color={skinColor} />
        </mesh>
        <mesh position={[0, -0.44, 0]} castShadow>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color={skinColor} />
        </mesh>
      </group>

      {/* NECK */}
      <mesh position={[0, 1.15, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.08]} />
        <meshStandardMaterial color={skinColor} />
      </mesh>

      {/* HEAD */}
      <group position={[0, 1.38, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial color={skinColor} />
        </mesh>
        <mesh position={[0, 0.08, -0.02]}>
          <sphereGeometry args={[0.21, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={hairColor} />
        </mesh>
        <mesh position={[0, 0.1, 0.12]}>
          <boxGeometry args={[0.25, 0.08, 0.08]} />
          <meshStandardMaterial color={hairColor} />
        </mesh>
        {/* Eyes */}
        <mesh position={[-0.07, 0.02, 0.18]}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshStandardMaterial color="#fff" />
        </mesh>
        <mesh position={[-0.07, 0.02, 0.2]}>
          <sphereGeometry args={[0.018, 8, 8]} />
          <meshStandardMaterial color="#22c55e" />
        </mesh>
        <mesh position={[0.07, 0.02, 0.18]}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshStandardMaterial color="#fff" />
        </mesh>
        <mesh position={[0.07, 0.02, 0.2]}>
          <sphereGeometry args={[0.018, 8, 8]} />
          <meshStandardMaterial color="#22c55e" />
        </mesh>
        {/* Eyebrows */}
        <mesh position={[-0.07, 0.065, 0.19]} rotation={[0, 0, 0.15]}>
          <boxGeometry args={[0.06, 0.015, 0.01]} />
          <meshStandardMaterial color={hairColor} />
        </mesh>
        <mesh position={[0.07, 0.065, 0.19]} rotation={[0, 0, -0.15]}>
          <boxGeometry args={[0.06, 0.015, 0.01]} />
          <meshStandardMaterial color={hairColor} />
        </mesh>
        {/* Mouth */}
        <mesh position={[0, -0.06, 0.19]}>
          <boxGeometry args={[0.06, 0.015, 0.01]} />
          <meshStandardMaterial color="#a0522d" />
        </mesh>
        {/* Ears */}
        <mesh position={[-0.2, 0, 0]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color={skinColor} />
        </mesh>
        <mesh position={[0.2, 0, 0]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color={skinColor} />
        </mesh>
      </group>
    </group>
  );
}

// ─── Shared player state (exported for other components) ───
export const playerState = {
  x: -5,
  z: -6.5,
  nearestAppliance: null,
  cameraYaw: 0,
};

export default function Player({ onRoomChange, onNearestApplianceChange, onInteract }) {
  const groupRef = useRef();
  const { camera, gl } = useThree();
  const keysRef = useRef({ up: false, down: false, left: false, right: false });
  const posRef = useRef({ x: -5, z: -6.5 });
  const movingRef = useRef(false);
  const angleRef = useRef(0);
  const yawRef = useRef(0);     // horizontal camera rotation
  const pitchRef = useRef(0.6); // vertical tilt (rad from horizontal)
  const isLockedRef = useRef(false);

  // Pointer lock handling
  useEffect(() => {
    const canvas = gl.domElement;

    const requestLock = () => {
      if (!isLockedRef.current) {
        canvas.requestPointerLock();
      }
    };

    const onLockChange = () => {
      isLockedRef.current = document.pointerLockElement === canvas;
    };

    const onMouseMove = (e) => {
      if (!isLockedRef.current) return;
      yawRef.current -= e.movementX * 0.003;
      pitchRef.current = Math.max(0.15, Math.min(1.2, pitchRef.current - e.movementY * 0.003));
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

  // Key events
  useEffect(() => {
    const onDown = (e) => {
      switch (e.key.toLowerCase()) {
        case 'w': case 'arrowup':    keysRef.current.up = true; break;
        case 's': case 'arrowdown':  keysRef.current.down = true; break;
        case 'a': case 'arrowleft':  keysRef.current.left = true; break;
        case 'd': case 'arrowright': keysRef.current.right = true; break;
        case 'e':
          if (onInteract && playerState.nearestAppliance) {
            onInteract(playerState.nearestAppliance);
          }
          break;
      }
    };
    const onUp = (e) => {
      switch (e.key.toLowerCase()) {
        case 'w': case 'arrowup':    keysRef.current.up = false; break;
        case 's': case 'arrowdown':  keysRef.current.down = false; break;
        case 'a': case 'arrowleft':  keysRef.current.left = false; break;
        case 'd': case 'arrowright': keysRef.current.right = false; break;
      }
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  }, [onInteract]);

  useFrame((_, delta) => {
    const keys = keysRef.current;
    const yaw = yawRef.current;

    // Movement relative to camera direction
    let inputX = 0, inputZ = 0;
    if (keys.up) inputZ -= 1;
    if (keys.down) inputZ += 1;
    if (keys.left) inputX -= 1;
    if (keys.right) inputX += 1;

    const isMoving = inputX !== 0 || inputZ !== 0;
    movingRef.current = isMoving;

    if (isMoving) {
      const len = Math.sqrt(inputX * inputX + inputZ * inputZ);
      const nx = inputX / len;
      const nz = inputZ / len;

      // Rotate movement by camera yaw
      const cosY = Math.cos(yaw);
      const sinY = Math.sin(yaw);
      const worldX = (nx * cosY - nz * sinY) * PLAYER_SPEED * delta;
      const worldZ = (nx * sinY + nz * cosY) * PLAYER_SPEED * delta;

      // Face movement direction
      angleRef.current = Math.atan2(worldX, worldZ);

      // Collision check (axis-separated for wall sliding)
      const newX = posRef.current.x + worldX;
      const newZ = posRef.current.z + worldZ;
      if (!checkCollision(newX, posRef.current.z)) posRef.current.x = newX;
      if (!checkCollision(posRef.current.x, newZ)) posRef.current.z = newZ;
    }

    // Update shared state
    playerState.x = posRef.current.x;
    playerState.z = posRef.current.z;
    playerState.cameraYaw = yaw;

    // Nearest appliance
    const nearest = getNearestAppliance(posRef.current.x, posRef.current.z);
    if (nearest !== playerState.nearestAppliance) {
      playerState.nearestAppliance = nearest;
      if (onNearestApplianceChange) onNearestApplianceChange(nearest);
    }

    // Update mesh
    if (groupRef.current) {
      groupRef.current.position.x = posRef.current.x;
      groupRef.current.position.z = posRef.current.z;
      const targetRotY = angleRef.current;
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, 0.15);
    }

    // Camera orbit around player
    const pitch = pitchRef.current;
    const camX = posRef.current.x + Math.sin(yaw) * Math.cos(pitch) * CAM_DISTANCE;
    const camZ = posRef.current.z + Math.cos(yaw) * Math.cos(pitch) * CAM_DISTANCE;
    const camY = Math.sin(pitch) * CAM_HEIGHT;

    const camTarget = new THREE.Vector3(camX, camY, camZ);
    camera.position.lerp(camTarget, 0.08);
    camera.lookAt(posRef.current.x, 1.2, posRef.current.z);

    // Room detection
    if (onRoomChange) {
      onRoomChange(getCurrentRoom(posRef.current.x, posRef.current.z));
    }
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
