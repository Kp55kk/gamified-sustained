import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// Wall collision segments - each wall is axis-aligned
// NOTE: The back vertical wall has moved from x=0 to x=4 (bathroom is now smaller)
const WALL_SEGMENTS = [
  // Front wall (z = -8) with door gap at x=[-6,-4]
  { type: 'h', z: -8, x1: -10, x2: -6 },
  { type: 'h', z: -8, x1: -4, x2: 10 },
  // Back wall (z = 8)
  { type: 'h', z: 8, x1: -10, x2: 10 },
  // Horizontal middle wall (z = 0) with doors at x=[-6,-4] and x=[4,6]
  { type: 'h', z: 0, x1: -10, x2: -6 },
  { type: 'h', z: 0, x1: -4, x2: 4 },
  { type: 'h', z: 0, x1: 6, x2: 10 },
  // Left wall (x = -10)
  { type: 'v', x: -10, z1: -8, z2: 8 },
  // Right wall (x = 10)
  { type: 'v', x: 10, z1: -8, z2: 8 },
  // Vertical middle front (x = 0, z[-8,0]) with door at z=[-5,-3]
  { type: 'v', x: 0, z1: -8, z2: -5 },
  { type: 'v', x: 0, z1: -3, z2: 0 },
  // Vertical middle back (x = 4, z[0,8]) with door at z=[3,5] — MOVED from x=0 to x=4
  { type: 'v', x: 4, z1: 0, z2: 3 },
  { type: 'v', x: 4, z1: 5, z2: 8 },
];

const PLAYER_SPEED = 5;
const PLAYER_RADIUS = 0.45;

function checkCollisionAxis(x, z, axis) {
  // Check collision for a single axis movement
  for (const w of WALL_SEGMENTS) {
    if (w.type === 'h') {
      if (Math.abs(z - w.z) < PLAYER_RADIUS && x >= w.x1 - PLAYER_RADIUS && x <= w.x2 + PLAYER_RADIUS) {
        return true;
      }
    } else {
      if (Math.abs(x - w.x) < PLAYER_RADIUS && z >= w.z1 - PLAYER_RADIUS && z <= w.z2 + PLAYER_RADIUS) {
        return true;
      }
    }
  }
  return false;
}

function getCurrentRoom(x, z) {
  if (x < 0 && z < 0) return 'Living Room';
  if (x >= 0 && z < 0) return 'Bedroom';
  // Back section: wall at x=4 divides Kitchen (x<4) from Bathroom (x>=4)
  if (x < 4 && z >= 0) return 'Kitchen';
  return 'Bathroom';
}

// Arjun 3D Character with REALISTIC alternating arm/leg walk cycle
function ArjunModel({ isMoving, facingAngle }) {
  const leftArmRef = useRef();
  const rightArmRef = useRef();
  const leftLegRef = useRef();
  const rightLegRef = useRef();
  const bodyRef = useRef();

  useFrame((_, delta) => {
    if (!bodyRef.current) return;

    if (isMoving) {
      const t = performance.now() * 0.008;
      const swingSpeed = 1.0;

      // Body bob - slight up/down while walking
      bodyRef.current.position.y = Math.sin(t * 2 * swingSpeed) * 0.04;

      // Natural walk cycle: opposite arm/leg pairs swing together
      // Left arm + Right leg swing forward, then Right arm + Left leg
      const swingAngle = 0.6; // max swing angle in radians
      const legSwing = 0.5;

      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = Math.sin(t * swingSpeed) * swingAngle;
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = Math.sin(t * swingSpeed + Math.PI) * swingAngle;
      }
      if (leftLegRef.current) {
        leftLegRef.current.rotation.x = Math.sin(t * swingSpeed + Math.PI) * legSwing;
      }
      if (rightLegRef.current) {
        rightLegRef.current.rotation.x = Math.sin(t * swingSpeed) * legSwing;
      }
    } else {
      // Idle: everything returns to zero
      bodyRef.current.position.y = 0;
      if (leftArmRef.current) leftArmRef.current.rotation.x = 0;
      if (rightArmRef.current) rightArmRef.current.rotation.x = 0;
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
      {/* ─── LEFT LEG ─── */}
      <group ref={leftLegRef} position={[-0.12, 0.6, 0]}>
        {/* Upper leg (thigh) */}
        <mesh position={[0, -0.13, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.07, 0.25]} />
          <meshStandardMaterial color={pantsColor} />
        </mesh>
        {/* Lower leg (shin) */}
        <mesh position={[0, -0.35, 0]} castShadow>
          <cylinderGeometry args={[0.065, 0.055, 0.25]} />
          <meshStandardMaterial color={pantsColor} />
        </mesh>
        {/* Left Shoe */}
        <mesh position={[0, -0.5, 0.04]} castShadow>
          <boxGeometry args={[0.12, 0.1, 0.2]} />
          <meshStandardMaterial color={shoeColor} />
        </mesh>
      </group>

      {/* ─── RIGHT LEG ─── */}
      <group ref={rightLegRef} position={[0.12, 0.6, 0]}>
        {/* Upper leg */}
        <mesh position={[0, -0.13, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.07, 0.25]} />
          <meshStandardMaterial color={pantsColor} />
        </mesh>
        {/* Lower leg */}
        <mesh position={[0, -0.35, 0]} castShadow>
          <cylinderGeometry args={[0.065, 0.055, 0.25]} />
          <meshStandardMaterial color={pantsColor} />
        </mesh>
        {/* Right Shoe */}
        <mesh position={[0, -0.5, 0.04]} castShadow>
          <boxGeometry args={[0.12, 0.1, 0.2]} />
          <meshStandardMaterial color={shoeColor} />
        </mesh>
      </group>

      {/* ─── TORSO ─── */}
      <mesh position={[0, 0.85, 0]} castShadow>
        <boxGeometry args={[0.45, 0.55, 0.25]} />
        <meshStandardMaterial color={shirtColor} />
      </mesh>
      {/* Emblem on chest */}
      <mesh position={[0, 0.88, 0.13]}>
        <circleGeometry args={[0.07, 6]} />
        <meshStandardMaterial color="#fff" />
      </mesh>

      {/* ─── LEFT ARM ─── */}
      <group ref={leftArmRef} position={[-0.3, 1.0, 0]}>
        {/* Upper arm */}
        <mesh position={[0, -0.12, 0]} castShadow>
          <cylinderGeometry args={[0.055, 0.05, 0.25]} />
          <meshStandardMaterial color={shirtColor} />
        </mesh>
        {/* Forearm */}
        <mesh position={[0, -0.32, 0]} castShadow>
          <cylinderGeometry args={[0.045, 0.04, 0.2]} />
          <meshStandardMaterial color={skinColor} />
        </mesh>
        {/* Hand */}
        <mesh position={[0, -0.44, 0]} castShadow>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color={skinColor} />
        </mesh>
      </group>

      {/* ─── RIGHT ARM ─── */}
      <group ref={rightArmRef} position={[0.3, 1.0, 0]}>
        {/* Upper arm */}
        <mesh position={[0, -0.12, 0]} castShadow>
          <cylinderGeometry args={[0.055, 0.05, 0.25]} />
          <meshStandardMaterial color={shirtColor} />
        </mesh>
        {/* Forearm */}
        <mesh position={[0, -0.32, 0]} castShadow>
          <cylinderGeometry args={[0.045, 0.04, 0.2]} />
          <meshStandardMaterial color={skinColor} />
        </mesh>
        {/* Hand */}
        <mesh position={[0, -0.44, 0]} castShadow>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color={skinColor} />
        </mesh>
      </group>

      {/* ─── NECK ─── */}
      <mesh position={[0, 1.15, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.08]} />
        <meshStandardMaterial color={skinColor} />
      </mesh>

      {/* ─── HEAD ─── */}
      <group position={[0, 1.38, 0]}>
        {/* Head sphere */}
        <mesh castShadow>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial color={skinColor} />
        </mesh>

        {/* Hair */}
        <mesh position={[0, 0.08, -0.02]}>
          <sphereGeometry args={[0.21, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={hairColor} />
        </mesh>
        {/* Hair fringe */}
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

        {/* Mouth - smile */}
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

export default function Player({ onRoomChange }) {
  const groupRef = useRef();
  const { camera } = useThree();
  const keysRef = useRef({ up: false, down: false, left: false, right: false });
  const posRef = useRef({ x: -5, z: -6.5 });
  const movingRef = useRef(false);
  const angleRef = useRef(0);

  // Key event listeners
  useEffect(() => {
    const onDown = (e) => {
      switch (e.key) {
        case 'ArrowUp':    case 'w': case 'W': keysRef.current.up = true; break;
        case 'ArrowDown':  case 's': case 'S': keysRef.current.down = true; break;
        case 'ArrowLeft':  case 'a': case 'A': keysRef.current.left = true; break;
        case 'ArrowRight': case 'd': case 'D': keysRef.current.right = true; break;
      }
    };
    const onUp = (e) => {
      switch (e.key) {
        case 'ArrowUp':    case 'w': case 'W': keysRef.current.up = false; break;
        case 'ArrowDown':  case 's': case 'S': keysRef.current.down = false; break;
        case 'ArrowLeft':  case 'a': case 'A': keysRef.current.left = false; break;
        case 'ArrowRight': case 'd': case 'D': keysRef.current.right = false; break;
      }
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => { window.removeEventListener('keydown', onDown); window.removeEventListener('keyup', onUp); };
  }, []);

  useFrame((_, delta) => {
    const keys = keysRef.current;
    let dx = 0, dz = 0;
    if (keys.up) dz -= 1;
    if (keys.down) dz += 1;
    if (keys.left) dx -= 1;
    if (keys.right) dx += 1;

    const isMoving = dx !== 0 || dz !== 0;
    movingRef.current = isMoving;

    if (isMoving) {
      // Normalize diagonal movement
      const len = Math.sqrt(dx * dx + dz * dz);
      dx = (dx / len) * PLAYER_SPEED * delta;
      dz = (dz / len) * PLAYER_SPEED * delta;

      // Face movement direction
      angleRef.current = Math.atan2(dx, dz);

      // Axis-separated collision (allows wall sliding)
      const newX = posRef.current.x + dx;
      const newZ = posRef.current.z + dz;

      if (!checkCollisionAxis(newX, posRef.current.z, 'x')) {
        posRef.current.x = newX;
      }
      if (!checkCollisionAxis(posRef.current.x, newZ, 'z')) {
        posRef.current.z = newZ;
      }
    }

    // Update mesh position and rotation
    if (groupRef.current) {
      groupRef.current.position.x = posRef.current.x;
      groupRef.current.position.z = posRef.current.z;
      // Smooth rotation
      const targetRotY = angleRef.current;
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, 0.15);
    }

    // Camera follow
    const camTarget = new THREE.Vector3(posRef.current.x, 6, posRef.current.z + 7);
    camera.position.lerp(camTarget, 0.05);
    camera.lookAt(posRef.current.x, 1, posRef.current.z);

    // Report current room
    if (onRoomChange) {
      const room = getCurrentRoom(posRef.current.x, posRef.current.z);
      onRoomChange(room);
    }
  });

  return (
    <group ref={groupRef} position={[-5, 0, -6.5]}>
      <ArjunModel isMoving={movingRef.current} facingAngle={angleRef.current} />
      {/* Shadow disc */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.3, 16]} />
        <meshBasicMaterial color="#000" transparent opacity={0.2} />
      </mesh>
    </group>
  );
}
