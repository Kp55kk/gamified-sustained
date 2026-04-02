


import React, { useMemo } from 'react';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

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

// Pitched Roof Component
function Roof() {
  const roofGeo = useMemo(() => {
    // Create a triangular prism for the roof using BufferGeometry
    // The house spans x=[-10,10], z=[-8,8] -> width=20, depth=16
    // Overhang: 1 unit on each side
    const hw = 11;   // half-width with overhang (x-axis)
    const hd = 9;    // half-depth with overhang (z-axis)
    const roofH = 2.5; // ridge height above wall tops
    const baseY = 0;
    const peakY = roofH;

    // Left slope: (-hw, 0, -hd) to (0, peak, -hd) to (0, peak, hd) to (-hw, 0, hd)
    // Right slope: (hw, 0, -hd) to (0, peak, -hd) to (0, peak, hd) to (hw, 0, hd)
    const vertices = new Float32Array([
      // Left slope (2 triangles)
      -hw, baseY, -hd,   0, peakY, -hd,   0, peakY, hd,
      -hw, baseY, -hd,   0, peakY, hd,   -hw, baseY, hd,
      // Right slope (2 triangles)
       hw, baseY, -hd,   0, peakY, hd,    0, peakY, -hd,
       hw, baseY, -hd,   hw, baseY, hd,   0, peakY, hd,
      // Front gable triangle
      -hw, baseY, -hd,   hw, baseY, -hd,  0, peakY, -hd,
      // Back gable triangle
      -hw, baseY, hd,    0, peakY, hd,    hw, baseY, hd,
    ]);

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <group position={[0, WALL_HEIGHT, 0]}>
      {/* Main roof surface - semi-transparent so interior is visible */}
      <mesh geometry={roofGeo} castShadow receiveShadow>
        <meshStandardMaterial color="#8B4513" roughness={0.8} side={THREE.DoubleSide} transparent opacity={0.35} depthWrite={false} />
      </mesh>
      {/* Ridge beam */}
      <mesh position={[0, 2.5, 0]} castShadow>
        <boxGeometry args={[0.2, 0.2, 20]} />
        <meshStandardMaterial color="#5a3015" roughness={0.7} />
      </mesh>
      {/* Roof trim - front */}
      <mesh position={[0, 1.25, -9]} castShadow>
        <boxGeometry args={[22.2, 0.15, 0.12]} />
        <meshStandardMaterial color="#6b4520" roughness={0.7} />
      </mesh>
      {/* Roof trim - back */}
      <mesh position={[0, 1.25, 9]} castShadow>
        <boxGeometry args={[22.2, 0.15, 0.12]} />
        <meshStandardMaterial color="#6b4520" roughness={0.7} />
      </mesh>
    </group>
  );
}

// Kitchen Stove with Oven and Chimney Hood
function KitchenStoveOven() {
  return (
    <group position={[-8.5, 0, 7.2]}>
      {/* Oven body */}
      <mesh position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[1.0, 0.9, 0.7]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.5} roughness={0.3} />
      </mesh>
      {/* Oven door - dark glass */}
      <mesh position={[0, 0.35, 0.36]}>
        <boxGeometry args={[0.8, 0.55, 0.02]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.1} metalness={0.3} />
      </mesh>
      {/* Oven handle */}
      <mesh position={[0, 0.65, 0.38]} castShadow>
        <boxGeometry args={[0.6, 0.04, 0.04]} />
        <meshStandardMaterial color="#888" metalness={0.7} roughness={0.2} />
      </mesh>
      {/* Stovetop surface */}
      <mesh position={[0, 0.92, 0]} castShadow>
        <boxGeometry args={[1.02, 0.04, 0.72]} />
        <meshStandardMaterial color="#222" roughness={0.2} />
      </mesh>
      {/* Gas burners */}
      {[[-0.25, -0.15], [0.25, -0.15], [-0.25, 0.15], [0.25, 0.15]].map(([bx, bz], i) => (
        <mesh key={i} position={[bx, 0.95, bz]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.06, 0.09, 16]} />
          <meshStandardMaterial color="#555" metalness={0.5} />
        </mesh>
      ))}
      {/* Chimney Hood */}
      <group position={[0, 2.0, 0]}>
        {/* Hood body - trapezoid shape approximated */}
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[1.1, 0.3, 0.6]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.3} metalness={0.4} />
        </mesh>
        {/* Hood bottom panel */}
        <mesh position={[0, -0.18, 0]}>
          <boxGeometry args={[1.0, 0.05, 0.55]} />
          <meshStandardMaterial color="#333" metalness={0.3} />
        </mesh>
        {/* Hood vent grille */}
        <mesh position={[0, -0.05, 0.31]}>
          <boxGeometry args={[0.9, 0.15, 0.02]} />
          <meshStandardMaterial color="#444" metalness={0.4} />
        </mesh>
        {/* Chimney pipe to ceiling */}
        <mesh position={[0, 0.55, 0]}>
          <boxGeometry args={[0.3, 0.8, 0.3]} />
          <meshStandardMaterial color="#222" metalness={0.3} />
        </mesh>
        {/* Hood lights */}
        <mesh position={[-0.2, -0.14, 0]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial color="#fffbe6" emissive="#fffbe6" emissiveIntensity={0.8} />
        </mesh>
        <mesh position={[0.2, -0.14, 0]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial color="#fffbe6" emissive="#fffbe6" emissiveIntensity={0.8} />
        </mesh>
      </group>
    </group>
  );
}

// Kitchen Sink with Faucet integrated into counter
function KitchenSink() {
  return (
    <group position={[-5, 0, 7.2]}>
      {/* Sink basin recessed into counter */}
      <mesh position={[0, 0.88, 0]}>
        <boxGeometry args={[0.7, 0.12, 0.5]} />
        <meshStandardMaterial color="#e0e0e0" metalness={0.4} roughness={0.2} />
      </mesh>
      {/* Basin inside (darker) */}
      <mesh position={[0, 0.84, 0]}>
        <boxGeometry args={[0.55, 0.08, 0.38]} />
        <meshStandardMaterial color="#aaa" metalness={0.5} roughness={0.2} />
      </mesh>
      {/* Faucet base */}
      <mesh position={[0, 1.0, -0.2]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.25]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.8} roughness={0.15} />
      </mesh>
      {/* Faucet spout */}
      <mesh position={[0, 1.12, -0.08]} rotation={[0.8, 0, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.25]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.8} roughness={0.15} />
      </mesh>
    </group>
  );
}

// Dishwasher
function Dishwasher() {
  return (
    <group position={[-3.5, 0, 7.2]}>
      {/* Body */}
      <mesh position={[0, 0.42, 0]} castShadow>
        <boxGeometry args={[0.7, 0.84, 0.65]} />
        <meshStandardMaterial color="#d0d0d0" metalness={0.4} roughness={0.3} />
      </mesh>
      {/* Door front - stainless */}
      <mesh position={[0, 0.42, 0.33]}>
        <boxGeometry args={[0.65, 0.78, 0.02]} />
        <meshStandardMaterial color="#b8b8b8" metalness={0.5} roughness={0.25} />
      </mesh>
      {/* Handle */}
      <mesh position={[0, 0.75, 0.36]} castShadow>
        <boxGeometry args={[0.45, 0.04, 0.04]} />
        <meshStandardMaterial color="#999" metalness={0.7} roughness={0.2} />
      </mesh>
      {/* Control panel */}
      <mesh position={[0, 0.85, 0.34]}>
        <boxGeometry args={[0.6, 0.03, 0.02]} />
        <meshStandardMaterial color="#555" />
      </mesh>
    </group>
  );
}

// Large Double-Door Refrigerator  
function LargeFridge() {
  return (
    <group position={[-1.5, 0, 7.2]}>
      {/* Main body */}
      <mesh position={[0, 0.95, 0]} castShadow>
        <boxGeometry args={[1.0, 1.9, 0.7]} />
        <meshStandardMaterial color="#d8d8d8" metalness={0.4} roughness={0.25} />
      </mesh>
      {/* Left door */}
      <mesh position={[-0.25, 0.95, 0.36]}>
        <boxGeometry args={[0.48, 1.85, 0.02]} />
        <meshStandardMaterial color="#c8c8c8" metalness={0.45} roughness={0.25} />
      </mesh>
      {/* Right door */}
      <mesh position={[0.25, 0.95, 0.36]}>
        <boxGeometry args={[0.48, 1.85, 0.02]} />
        <meshStandardMaterial color="#c8c8c8" metalness={0.45} roughness={0.25} />
      </mesh>
      {/* Door split line */}
      <mesh position={[0, 0.95, 0.37]}>
        <boxGeometry args={[0.02, 1.85, 0.01]} />
        <meshStandardMaterial color="#aaa" />
      </mesh>
      {/* Left handle */}
      <mesh position={[-0.05, 1.1, 0.39]} castShadow>
        <boxGeometry args={[0.03, 0.5, 0.04]} />
        <meshStandardMaterial color="#999" metalness={0.7} roughness={0.2} />
      </mesh>
      {/* Right handle */}
      <mesh position={[0.05, 1.1, 0.39]} castShadow>
        <boxGeometry args={[0.03, 0.5, 0.04]} />
        <meshStandardMaterial color="#999" metalness={0.7} roughness={0.2} />
      </mesh>
      {/* Ice/Water dispenser on left door */}
      <mesh position={[-0.25, 1.2, 0.38]}>
        <boxGeometry args={[0.2, 0.25, 0.02]} />
        <meshStandardMaterial color="#333" roughness={0.2} />
      </mesh>
      {/* Dispenser buttons */}
      <mesh position={[-0.25, 1.38, 0.39]}>
        <boxGeometry args={[0.15, 0.04, 0.01]} />
        <meshStandardMaterial color="#2563eb" emissive="#2563eb" emissiveIntensity={0.3} />
      </mesh>
      {/* Bottom freezer door line */}
      <mesh position={[0, 0.25, 0.37]}>
        <boxGeometry args={[0.96, 0.02, 0.01]} />
        <meshStandardMaterial color="#aaa" />
      </mesh>
    </group>
  );
}

// Dining Table with Chairs, Plates, and Glasses
function DiningTable() {
  return (
    <group position={[-5, 0, 3.5]}>
      {/* Table top */}
      <mesh position={[0, 0.75, 0]} castShadow>
        <boxGeometry args={[2.5, 0.06, 1.2]} />
        <meshStandardMaterial color="#2d2d2d" roughness={0.5} />
      </mesh>
      {/* Table legs */}
      {[[-1.1, -0.5], [-1.1, 0.5], [1.1, -0.5], [1.1, 0.5]].map(([lx, lz], i) => (
        <mesh key={i} position={[lx, 0.37, lz]} castShadow>
          <boxGeometry args={[0.06, 0.74, 0.06]} />
          <meshStandardMaterial color="#2d2d2d" roughness={0.5} />
        </mesh>
      ))}

      {/* Chairs */}
      {[
        { pos: [-0.7, 0, -0.9], rot: 0 },
        { pos: [0.7, 0, -0.9], rot: 0 },
        { pos: [-0.7, 0, 0.9], rot: Math.PI },
        { pos: [0.7, 0, 0.9], rot: Math.PI },
      ].map((chair, i) => (
        <group key={i} position={chair.pos} rotation={[0, chair.rot, 0]}>
          {/* Chair seat */}
          <mesh position={[0, 0.45, 0]} castShadow>
            <boxGeometry args={[0.4, 0.04, 0.4]} />
            <meshStandardMaterial color="#3d3d3d" roughness={0.6} />
          </mesh>
          {/* Chair back */}
          <mesh position={[0, 0.7, -0.18]} castShadow>
            <boxGeometry args={[0.38, 0.5, 0.04]} />
            <meshStandardMaterial color="#3d3d3d" roughness={0.6} />
          </mesh>
          {/* Chair legs */}
          {[[-0.15, -0.15], [-0.15, 0.15], [0.15, -0.15], [0.15, 0.15]].map(([cx, cz], j) => (
            <mesh key={j} position={[cx, 0.22, cz]}>
              <boxGeometry args={[0.03, 0.44, 0.03]} />
              <meshStandardMaterial color="#4a4a4a" />
            </mesh>
          ))}
        </group>
      ))}

      {/* Place settings - plates */}
      {[[-0.7, 0.79, -0.15], [0.7, 0.79, -0.15], [-0.7, 0.79, 0.15], [0.7, 0.79, 0.15]].map((pos, i) => (
        <group key={`setting-${i}`}>
          {/* Plate */}
          <mesh position={pos} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.15, 16]} />
            <meshStandardMaterial color="#fff" roughness={0.3} />
          </mesh>
          {/* Small plate */}
          <mesh position={[pos[0], pos[1] + 0.005, pos[2]]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.08, 16]} />
            <meshStandardMaterial color="#e8e8e8" roughness={0.3} />
          </mesh>
          {/* Glass */}
          <mesh position={[pos[0] + 0.2, 0.82, pos[2]]}>
            <cylinderGeometry args={[0.03, 0.025, 0.1, 8]} />
            <meshStandardMaterial color="#d4e8f0" transparent opacity={0.5} roughness={0.1} />
          </mesh>
        </group>
      ))}

      {/* Placemats (colored rectangles under plates) */}
      {[
        { pos: [-0.7, 0.78, -0.15], color: '#0ea5e9' },
        { pos: [0.7, 0.78, -0.15], color: '#0ea5e9' },
        { pos: [-0.7, 0.78, 0.15], color: '#22c55e' },
        { pos: [0.7, 0.78, 0.15], color: '#22c55e' },
      ].map((mat, i) => (
        <mesh key={`mat-${i}`} position={mat.pos} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.4, 0.3]} />
          <meshStandardMaterial color={mat.color} roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
}

// Kitchen Window
function KitchenWindow() {
  return (
    <group position={[-5, 1.8, 7.95]}>
      {/* Window frame */}
      <mesh>
        <boxGeometry args={[1.6, 1.2, 0.1]} />
        <meshStandardMaterial color="#8B6914" roughness={0.6} />
      </mesh>
      {/* Window glass */}
      <mesh position={[0, 0, 0.03]}>
        <planeGeometry args={[1.4, 1.0]} />
        <meshStandardMaterial color="#87CEEB" transparent opacity={0.4} roughness={0.05} />
      </mesh>
      {/* Window cross bars */}
      <mesh position={[0, 0, 0.06]}>
        <boxGeometry args={[1.4, 0.04, 0.03]} />
        <meshStandardMaterial color="#8B6914" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0, 0.06]}>
        <boxGeometry args={[0.04, 1.0, 0.03]} />
        <meshStandardMaterial color="#8B6914" roughness={0.6} />
      </mesh>
    </group>
  );
}

export default function House() {
  return (
    <group>
      {/* ─── ROOF ─── */}
      <Roof />

      {/* ─── FLOORS ─── */}
      {/* Living Room floor (unchanged: x=[-10,0], z=[-8,0]) */}
      <mesh position={[-5, 0.001, -4]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[10, 8]} />
        <meshStandardMaterial color={FLOOR_COLORS.livingRoom} roughness={0.7} />
      </mesh>
      {/* Bedroom floor (unchanged: x=[0,10], z=[-8,0]) */}
      <mesh position={[5, 0.001, -4]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[10, 8]} />
        <meshStandardMaterial color={FLOOR_COLORS.bedroom} roughness={0.7} />
      </mesh>
      {/* Kitchen floor (larger: x=[-10,4], z=[0,8]) -> center at (-3, 4), size 14x8 */}
      <mesh position={[-3, 0.001, 4]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[14, 8]} />
        <meshStandardMaterial color={FLOOR_COLORS.kitchen} roughness={0.8} />
      </mesh>
      {/* Bathroom floor (smaller: x=[4,10], z=[0,8]) -> center at (7, 4), size 6x8 */}
      <mesh position={[7, 0.001, 4]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[6, 8]} />
        <meshStandardMaterial color={FLOOR_COLORS.bathroom} roughness={0.9} />
      </mesh>

      {/* ─── OUTER WALLS ─── */}
      {/* Front wall (z = -8) - fully solid, no door */}
      <WallBox position={[0, WALL_HEIGHT / 2, -8]} size={[20, WALL_HEIGHT, WALL_THICKNESS]} />

      {/* Back wall (z = 8) */}
      <WallBox position={[0, WALL_HEIGHT / 2, 8]} size={[20, WALL_HEIGHT, WALL_THICKNESS]} />

      {/* Left wall (x = -10) — door gap at z = [-3.5, -0.5] near WiFi router */}
      <WallBox position={[-10, WALL_HEIGHT / 2, -5.75]} size={[WALL_THICKNESS, WALL_HEIGHT, 4.5]} />
      <WallBox position={[-10, WALL_HEIGHT / 2, 4.25]} size={[WALL_THICKNESS, WALL_HEIGHT, 7.5]} />
      {/* Above left wall door */}
      <WallBox position={[-10, 2.7, -2]} size={[WALL_THICKNESS, 0.6, 3]} />
      <DoorFrame position={[-10, 0, -2]} rotation={[0, Math.PI / 2, 0]} />

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

      {/* Vertical middle wall - front (x = 0, z = [-8, 0]) - UNCHANGED */}
      {/* Top section: z = [-8, -5] */}
      <WallBox position={[0, WALL_HEIGHT / 2, -6.5]} size={[WALL_THICKNESS, WALL_HEIGHT, 3]} color={WALL_COLOR_INNER} />
      {/* Living→Bedroom door gap at z=[-5,-3], above door */}
      <WallBox position={[0, 2.7, -4]} size={[WALL_THICKNESS, 0.6, 2]} color={WALL_COLOR_INNER} />
      <DoorFrame position={[0, 0, -4]} rotation={[0, Math.PI / 2, 0]} />
      {/* Bottom section: z = [-3, 0] */}
      <WallBox position={[0, WALL_HEIGHT / 2, -1.5]} size={[WALL_THICKNESS, WALL_HEIGHT, 3]} color={WALL_COLOR_INNER} />

      {/* Vertical middle wall - back (x = 4, z = [0, 8]) - MOVED from x=0 to x=4 */}
      {/* Top section: z = [0, 3] */}
      <WallBox position={[4, WALL_HEIGHT / 2, 1.5]} size={[WALL_THICKNESS, WALL_HEIGHT, 3]} color={WALL_COLOR_INNER} />
      {/* Kitchen→Bathroom door gap at z=[3,5], above door */}
      <WallBox position={[4, 2.7, 4]} size={[WALL_THICKNESS, 0.6, 2]} color={WALL_COLOR_INNER} />
      <DoorFrame position={[4, 0, 4]} rotation={[0, Math.PI / 2, 0]} />
      {/* Bottom section: z = [5, 8] */}
      <WallBox position={[4, WALL_HEIGHT / 2, 6.5]} size={[WALL_THICKNESS, WALL_HEIGHT, 3]} color={WALL_COLOR_INNER} />

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

      {/* ─── KITCHEN APPLIANCES (upgraded) ─── */}
      {/* L-shaped counter along back wall and right side */}
      {/* Back counter (z=7.2, from x=-7.5 to x=-2) */}
      <group position={[-5, 0, 7.2]}>
        {/* Counter base - wooden cabinets */}
        <mesh position={[0, 0.42, 0]} castShadow>
          <boxGeometry args={[6, 0.84, 0.7]} />
          <meshStandardMaterial color="#c4a060" roughness={0.6} />
        </mesh>
        {/* Counter top - granite */}
        <mesh position={[0, 0.86, 0]} castShadow>
          <boxGeometry args={[6.1, 0.06, 0.75]} />
          <meshStandardMaterial color="#e8e0d0" roughness={0.2} metalness={0.05} />
        </mesh>
        {/* Cabinet doors */}
        {[-2.2, -1.2, -0.2, 0.8, 1.8].map((cx, i) => (
          <mesh key={i} position={[cx, 0.42, 0.36]}>
            <boxGeometry args={[0.85, 0.72, 0.02]} />
            <meshStandardMaterial color="#b89050" roughness={0.5} />
          </mesh>
        ))}
        {/* Cabinet handles */}
        {[-2.2, -1.2, -0.2, 0.8, 1.8].map((cx, i) => (
          <mesh key={`h-${i}`} position={[cx, 0.5, 0.38]}>
            <boxGeometry args={[0.12, 0.03, 0.03]} />
            <meshStandardMaterial color="#888" metalness={0.6} />
          </mesh>
        ))}
      </group>

      <KitchenStoveOven />
      <KitchenSink />
      <Dishwasher />
      <LargeFridge />
      <DiningTable />
      <KitchenWindow />

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

      {/* Bathroom - Sink (repositioned for smaller bathroom) */}
      <group position={[5.5, 0, 7.5]}>
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
      <Html position={[-3, 2.8, 4]} center>
        <div className="room-label-3d">Kitchen</div>
      </Html>
      <Html position={[7, 2.8, 4]} center>
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
