import React from 'react';
import { Html } from '@react-three/drei';

const WALL_THICKNESS = 0.15;
const WALL_HEIGHT = 3;
const WALL_COLOR = '#f5f0e8';
const WALL_COLOR_INNER = '#ede8db';

// Floor colors per room
const FLOOR_COLORS = {
  livingRoom: '#c4a882',
  bedroom: '#c4a882',
  kitchen: '#d4cfc6',
  bathroom: '#b8c9c4',
};

// Wall segment helper
function WallBox({ position, size, color = WALL_COLOR }) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.85} />
    </mesh>
  );
}

// Door frame
function DoorFrame({ position, rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Left post */}
      <mesh position={[-0.85, 1.2, 0]}>
        <boxGeometry args={[0.08, 2.4, WALL_THICKNESS + 0.04]} />
        <meshStandardMaterial color="#8B6914" roughness={0.6} />
      </mesh>
      {/* Right post */}
      <mesh position={[0.85, 1.2, 0]}>
        <boxGeometry args={[0.08, 2.4, WALL_THICKNESS + 0.04]} />
        <meshStandardMaterial color="#8B6914" roughness={0.6} />
      </mesh>
      {/* Top beam */}
      <mesh position={[0, 2.42, 0]}>
        <boxGeometry args={[1.78, 0.08, WALL_THICKNESS + 0.04]} />
        <meshStandardMaterial color="#8B6914" roughness={0.6} />
      </mesh>
    </group>
  );
}

export default function House() {
  return (
    <group>
      {/* ─── FLOORS ─── */}
      {/* Living Room floor */}
      <mesh position={[-5, 0.001, -4]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[10, 8]} />
        <meshStandardMaterial color={FLOOR_COLORS.livingRoom} roughness={0.7} />
      </mesh>
      {/* Bedroom floor */}
      <mesh position={[5, 0.001, -4]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[10, 8]} />
        <meshStandardMaterial color={FLOOR_COLORS.bedroom} roughness={0.7} />
      </mesh>
      {/* Kitchen floor */}
      <mesh position={[-5, 0.001, 4]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[10, 8]} />
        <meshStandardMaterial color={FLOOR_COLORS.kitchen} roughness={0.8} />
      </mesh>
      {/* Bathroom floor */}
      <mesh position={[5, 0.001, 4]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[10, 8]} />
        <meshStandardMaterial color={FLOOR_COLORS.bathroom} roughness={0.9} />
      </mesh>

      {/* ─── OUTER WALLS ─── */}
      {/* Front wall (z = -8) - with door gap at x = [-6, -4] */}
      <WallBox position={[-8, WALL_HEIGHT / 2, -8]} size={[4, WALL_HEIGHT, WALL_THICKNESS]} />
      <WallBox position={[3, WALL_HEIGHT / 2, -8]} size={[14, WALL_HEIGHT, WALL_THICKNESS]} />
      {/* Above front door */}
      <WallBox position={[-5, 2.7, -8]} size={[2, 0.6, WALL_THICKNESS]} />
      <DoorFrame position={[-5, 0, -8]} />

      {/* Back wall (z = 8) */}
      <WallBox position={[0, WALL_HEIGHT / 2, 8]} size={[20, WALL_HEIGHT, WALL_THICKNESS]} />

      {/* Left wall (x = -10) */}
      <WallBox position={[-10, WALL_HEIGHT / 2, 0]} size={[WALL_THICKNESS, WALL_HEIGHT, 16]} />

      {/* Right wall (x = 10) */}
      <WallBox position={[10, WALL_HEIGHT / 2, 0]} size={[WALL_THICKNESS, WALL_HEIGHT, 16]} />

      {/* ─── INNER WALLS ─── */}
      {/* Horizontal middle wall (z = 0) */}
      {/* Left section: x = [-10, -6] */}
      <WallBox position={[-8, WALL_HEIGHT / 2, 0]} size={[4, WALL_HEIGHT, WALL_THICKNESS]} color={WALL_COLOR_INNER} />
      {/* Living→Kitchen door gap at x=[-6,-4], above door */}
      <WallBox position={[-5, 2.7, 0]} size={[2, 0.6, WALL_THICKNESS]} color={WALL_COLOR_INNER} />
      <DoorFrame position={[-5, 0, 0]} />
      {/* Middle section: x = [-4, 4] */}
      <WallBox position={[0, WALL_HEIGHT / 2, 0]} size={[8, WALL_HEIGHT, WALL_THICKNESS]} color={WALL_COLOR_INNER} />
      {/* Bedroom→Bathroom door gap at x=[4,6], above door */}
      <WallBox position={[5, 2.7, 0]} size={[2, 0.6, WALL_THICKNESS]} color={WALL_COLOR_INNER} />
      <DoorFrame position={[5, 0, 0]} />
      {/* Right section: x = [6, 10] */}
      <WallBox position={[8, WALL_HEIGHT / 2, 0]} size={[4, WALL_HEIGHT, WALL_THICKNESS]} color={WALL_COLOR_INNER} />

      {/* Vertical middle wall - front (x = 0, z = [-8, 0]) */}
      {/* Top section: z = [-8, -5] */}
      <WallBox position={[0, WALL_HEIGHT / 2, -6.5]} size={[WALL_THICKNESS, WALL_HEIGHT, 3]} color={WALL_COLOR_INNER} />
      {/* Living→Bedroom door gap at z=[-5,-3], above door */}
      <WallBox position={[0, 2.7, -4]} size={[WALL_THICKNESS, 0.6, 2]} color={WALL_COLOR_INNER} />
      <DoorFrame position={[0, 0, -4]} rotation={[0, Math.PI / 2, 0]} />
      {/* Bottom section: z = [-3, 0] */}
      <WallBox position={[0, WALL_HEIGHT / 2, -1.5]} size={[WALL_THICKNESS, WALL_HEIGHT, 3]} color={WALL_COLOR_INNER} />

      {/* Vertical middle wall - back (x = 0, z = [0, 8]) */}
      {/* Top section: z = [0, 3] */}
      <WallBox position={[0, WALL_HEIGHT / 2, 1.5]} size={[WALL_THICKNESS, WALL_HEIGHT, 3]} color={WALL_COLOR_INNER} />
      {/* Kitchen→Bathroom door gap at z=[3,5], above door */}
      <WallBox position={[0, 2.7, 4]} size={[WALL_THICKNESS, 0.6, 2]} color={WALL_COLOR_INNER} />
      <DoorFrame position={[0, 0, 4]} rotation={[0, Math.PI / 2, 0]} />
      {/* Bottom section: z = [5, 8] */}
      <WallBox position={[0, WALL_HEIGHT / 2, 6.5]} size={[WALL_THICKNESS, WALL_HEIGHT, 3]} color={WALL_COLOR_INNER} />

      {/* ─── BASIC FURNITURE ─── */}
      {/* Living Room - Sofa */}
      <group position={[-5, 0, -3]}>
        <mesh position={[0, 0.3, 0]} castShadow>
          <boxGeometry args={[2.5, 0.6, 1]} />
          <meshStandardMaterial color="#6b4c3b" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.65, -0.35]} castShadow>
          <boxGeometry args={[2.5, 0.4, 0.3]} />
          <meshStandardMaterial color="#5a3d2e" roughness={0.8} />
        </mesh>
      </group>

      {/* Bedroom - Bed */}
      <group position={[5, 0, -5]}>
        <mesh position={[0, 0.25, 0]} castShadow>
          <boxGeometry args={[2.2, 0.5, 3]} />
          <meshStandardMaterial color="#8B6914" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.55, 0]} castShadow>
          <boxGeometry args={[2, 0.15, 2.8]} />
          <meshStandardMaterial color="#e8e0d0" roughness={0.6} />
        </mesh>
        {/* Pillow */}
        <mesh position={[0, 0.7, -1.1]} castShadow>
          <boxGeometry args={[1.4, 0.15, 0.5]} />
          <meshStandardMaterial color="#fff" roughness={0.5} />
        </mesh>
        {/* Headboard */}
        <mesh position={[0, 0.8, -1.45]} castShadow>
          <boxGeometry args={[2.2, 1, 0.12]} />
          <meshStandardMaterial color="#6b4520" roughness={0.7} />
        </mesh>
      </group>

      {/* Kitchen - Counter along back wall */}
      <group position={[-5, 0, 7.2]}>
        <mesh position={[0, 0.45, 0]} castShadow>
          <boxGeometry args={[6, 0.9, 0.7]} />
          <meshStandardMaterial color="#a0896e" roughness={0.6} />
        </mesh>
        {/* Counter top */}
        <mesh position={[0, 0.92, 0]} castShadow>
          <boxGeometry args={[6.1, 0.06, 0.75]} />
          <meshStandardMaterial color="#d4ccc0" roughness={0.3} metalness={0.1} />
        </mesh>
      </group>

      {/* Bathroom - Toilet */}
      <group position={[7, 0, 6]}>
        <mesh position={[0, 0.25, 0]} castShadow>
          <boxGeometry args={[0.5, 0.5, 0.6]} />
          <meshStandardMaterial color="#f0f0f0" roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.55, -0.2]} castShadow>
          <boxGeometry args={[0.5, 0.5, 0.12]} />
          <meshStandardMaterial color="#f0f0f0" roughness={0.3} />
        </mesh>
      </group>

      {/* Bathroom - Sink */}
      <group position={[3, 0, 7.5]}>
        <mesh position={[0, 0.8, 0]} castShadow>
          <boxGeometry args={[0.8, 0.08, 0.5]} />
          <meshStandardMaterial color="#e8e8e8" roughness={0.2} metalness={0.3} />
        </mesh>
        {/* Basin */}
        <mesh position={[0, 0.73, 0]}>
          <cylinderGeometry args={[0.25, 0.2, 0.12, 16]} />
          <meshStandardMaterial color="#ddd" roughness={0.2} />
        </mesh>
      </group>

      {/* ─── ROOM LABELS ─── */}
      <Html position={[-5, 2.8, -4]} center>
        <div className="room-label-3d">Living Room</div>
      </Html>
      <Html position={[5, 2.8, -4]} center>
        <div className="room-label-3d">Bedroom</div>
      </Html>
      <Html position={[-5, 2.8, 4]} center>
        <div className="room-label-3d">Kitchen</div>
      </Html>
      <Html position={[5, 2.8, 4]} center>
        <div className="room-label-3d">Bathroom</div>
      </Html>

      {/* ─── GROUND OUTSIDE ─── */}
      <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#3a5a3a" roughness={1} />
      </mesh>
    </group>
  );
}
