


import React, { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
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

// Door frame (open doorway - no door panel)
function DoorFrame({ position, rotation = [0, 0, 0], isEntrance = false }) {
  const frameColor = isEntrance ? '#6b4520' : '#8B6914';
  const frameW = 0.1;
  return (
    <group position={position} rotation={rotation}>
      {/* Left post */}
      <mesh position={[-0.85, 1.2, 0]} castShadow>
        <boxGeometry args={[frameW, 2.4, WALL_THICKNESS + 0.06]} />
        <meshStandardMaterial color={frameColor} roughness={0.5} />
      </mesh>
      {/* Right post */}
      <mesh position={[0.85, 1.2, 0]} castShadow>
        <boxGeometry args={[frameW, 2.4, WALL_THICKNESS + 0.06]} />
        <meshStandardMaterial color={frameColor} roughness={0.5} />
      </mesh>
      {/* Top beam */}
      <mesh position={[0, 2.42, 0]} castShadow>
        <boxGeometry args={[1.8, 0.1, WALL_THICKNESS + 0.06]} />
        <meshStandardMaterial color={frameColor} roughness={0.5} />
      </mesh>
      {/* Threshold */}
      <mesh position={[0, 0.01, 0]}>
        <boxGeometry args={[1.7, 0.02, WALL_THICKNESS + 0.08]} />
        <meshStandardMaterial color="#5a3a15" roughness={0.6} />
      </mesh>
    </group>
  );
}

// ─── Transparent Glass Door (visual only, no collision) ───
function GlassDoor({ position, rotation = [0, 0, 0], height = 2.2, width = 1.0 }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Glass pane */}
      <mesh position={[0, height / 2, 0]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial
          color="#88bbdd"
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
          roughness={0.05}
        />
      </mesh>
      {/* Door frame - top */}
      <mesh position={[0, height, 0]}>
        <boxGeometry args={[width + 0.06, 0.05, 0.04]} />
        <meshStandardMaterial color="#8B6914" roughness={0.5} />
      </mesh>
      {/* Door frame - bottom */}
      <mesh position={[0, 0.02, 0]}>
        <boxGeometry args={[width + 0.06, 0.05, 0.04]} />
        <meshStandardMaterial color="#8B6914" roughness={0.5} />
      </mesh>
      {/* Door frame - left */}
      <mesh position={[-(width / 2 + 0.01), height / 2, 0]}>
        <boxGeometry args={[0.05, height, 0.04]} />
        <meshStandardMaterial color="#8B6914" roughness={0.5} />
      </mesh>
      {/* Door frame - right */}
      <mesh position={[(width / 2 + 0.01), height / 2, 0]}>
        <boxGeometry args={[0.05, height, 0.04]} />
        <meshStandardMaterial color="#8B6914" roughness={0.5} />
      </mesh>
      {/* Door handle */}
      <mesh position={[width / 2 - 0.15, height / 2, 0.03]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.8} roughness={0.15} />
      </mesh>
    </group>
  );
}

// ─── Animated Door (wood panel that swings open on Y-axis) ───
function AnimatedDoor({ position, rotation = [0, 0, 0], height = 2.2, width = 1.0 }) {
  const doorRef = useRef();
  const [isOpen, setIsOpen] = useState(false);
  const targetAngle = useRef(0);

  useFrame(() => {
    if (!doorRef.current) return;
    targetAngle.current = isOpen ? Math.PI / 2 : 0;
    doorRef.current.rotation.y += (targetAngle.current - doorRef.current.rotation.y) * 0.06;
  });

  return (
    <group position={position} rotation={rotation}
      onClick={(e) => { e.stopPropagation(); setIsOpen(prev => !prev); }}
      onPointerOver={(e) => { document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { document.body.style.cursor = 'default'; }}>
      {/* Door pivot group — hinge on left edge */}
      <group ref={doorRef} position={[-width / 2, 0, 0]}>
        {/* Wood door panel */}
        <mesh position={[width / 2, height / 2, 0]} castShadow>
          <boxGeometry args={[width, height, 0.05]} />
          <meshStandardMaterial color="#6b4226" roughness={0.7} />
        </mesh>
        {/* Wood grain detail */}
        <mesh position={[width / 2, height / 2, 0.026]}>
          <boxGeometry args={[width * 0.15, height * 0.85, 0.005]} />
          <meshStandardMaterial color="#7a5230" roughness={0.6} />
        </mesh>
        {/* Handle */}
        <mesh position={[width - 0.12, height / 2, 0.04]}>
          <sphereGeometry args={[0.04, 10, 10]} />
          <meshStandardMaterial color="#c0a040" metalness={0.85} roughness={0.15} />
        </mesh>
        {/* Handle base plate */}
        <mesh position={[width - 0.12, height / 2, 0.03]}>
          <boxGeometry args={[0.06, 0.12, 0.01]} />
          <meshStandardMaterial color="#b08830" metalness={0.7} roughness={0.25} />
        </mesh>
      </group>
    </group>
  );
}

// ─── Realistic Bedroom Curtain (multi-fold panels with rod, finials, and smooth animation) ───
function RealisticBedroomCurtain({ position, rotation = [0, 0, 0], width = 1.4, height = 1.1 }) {
  const FOLDS = 5;
  const PANEL_WIDTH = width / 2;
  const foldWidth = PANEL_WIDTH / FOLDS;
  const leftPanels = useRef([]);
  const rightPanels = useRef([]);
  const [isOpen, setIsOpen] = useState(false);

  useFrame(() => {
    const speed = 0.055;
    for (let i = 0; i < FOLDS; i++) {
      const lp = leftPanels.current[i];
      const rp = rightPanels.current[i];
      if (!lp || !rp) continue;

      if (isOpen) {
        // Bunch up to edges with staggered fold effect
        const lTarget = -width / 2 - 0.05 - i * 0.025;
        const rTarget = width / 2 + 0.05 + i * 0.025;
        lp.position.x += (lTarget - lp.position.x) * speed;
        rp.position.x += (rTarget - rp.position.x) * speed;
        const scaleTarget = 0.22 + i * 0.03;
        lp.scale.x += (scaleTarget - lp.scale.x) * speed;
        rp.scale.x += (scaleTarget - rp.scale.x) * speed;
      } else {
        // Spread evenly across window — panels meet in the middle
        const lTarget = -PANEL_WIDTH / 2 + i * foldWidth;
        const rTarget = i * foldWidth;
        lp.position.x += (lTarget - lp.position.x) * speed;
        rp.position.x += (rTarget - rp.position.x) * speed;
        lp.scale.x += (1 - lp.scale.x) * speed;
        rp.scale.x += (1 - rp.scale.x) * speed;
      }
    }
  });

  return (
    <group position={position} rotation={rotation}
      onClick={(e) => { e.stopPropagation(); setIsOpen(prev => !prev); }}
      onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { document.body.style.cursor = 'default'; }}>
      {/* Curtain rod */}
      <mesh position={[0, height / 2 + 0.08, 0.07]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.02, 0.02, width + 0.3, 8]} />
        <meshStandardMaterial color="#b8860b" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Rod finials (decorative end caps) */}
      <mesh position={[-(width / 2 + 0.15), height / 2 + 0.08, 0.07]}>
        <sphereGeometry args={[0.035, 8, 8]} />
        <meshStandardMaterial color="#b8860b" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[(width / 2 + 0.15), height / 2 + 0.08, 0.07]}>
        <sphereGeometry args={[0.035, 8, 8]} />
        <meshStandardMaterial color="#b8860b" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Left curtain folds — deep maroon fabric */}
      {Array.from({ length: FOLDS }).map((_, i) => (
        <mesh
          key={`l${i}`}
          ref={el => { leftPanels.current[i] = el; }}
          position={[-PANEL_WIDTH / 2 + i * foldWidth, 0, 0.07]}
        >
          <boxGeometry args={[foldWidth - 0.008, height, 0.025]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? '#8B0000' : '#7a0000'}
            roughness={0.85}
            transparent opacity={0.95}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      {/* Right curtain folds — deep maroon fabric */}
      {Array.from({ length: FOLDS }).map((_, i) => (
        <mesh
          key={`r${i}`}
          ref={el => { rightPanels.current[i] = el; }}
          position={[i * foldWidth, 0, 0.07]}
        >
          <boxGeometry args={[foldWidth - 0.008, height, 0.025]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? '#8B0000' : '#7a0000'}
            roughness={0.85}
            transparent opacity={0.95}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

// ─── Window Component (Indian style with vertical grille bars) ───
// name prop used for interaction identification
function HouseWindow({ position, rotation = [0, 0, 0], width = 1.5, height = 1.2, isFrosted = false, name = 'window' }) {
  const frameThickness = 0.05;
  const glassColor = isFrosted ? '#c8dde8' : '#87CEEB';
  const glassOpacity = isFrosted ? 0.5 : 0.3;
  const innerW = width - frameThickness * 2;
  const innerH = height - frameThickness * 2;

  return (
    <group position={position} rotation={rotation} userData={{ isWindow: true, windowName: name }}>
      {/* Window frame - outer border */}
      {/* Top frame */}
      <mesh position={[0, height / 2 - frameThickness / 2, 0]}>
        <boxGeometry args={[width, frameThickness, WALL_THICKNESS + 0.06]} />
        <meshStandardMaterial color="#6b4520" roughness={0.5} />
      </mesh>
      {/* Bottom frame */}
      <mesh position={[0, -height / 2 + frameThickness / 2, 0]}>
        <boxGeometry args={[width, frameThickness, WALL_THICKNESS + 0.06]} />
        <meshStandardMaterial color="#6b4520" roughness={0.5} />
      </mesh>
      {/* Left frame */}
      <mesh position={[-width / 2 + frameThickness / 2, 0, 0]}>
        <boxGeometry args={[frameThickness, height, WALL_THICKNESS + 0.06]} />
        <meshStandardMaterial color="#6b4520" roughness={0.5} />
      </mesh>
      {/* Right frame */}
      <mesh position={[width / 2 - frameThickness / 2, 0, 0]}>
        <boxGeometry args={[frameThickness, height, WALL_THICKNESS + 0.06]} />
        <meshStandardMaterial color="#6b4520" roughness={0.5} />
      </mesh>

      {/* Glass pane */}
      <mesh position={[0, 0, 0.02]}>
        <planeGeometry args={[innerW, innerH]} />
        <meshStandardMaterial
          color={glassColor}
          transparent
          opacity={glassOpacity}
          roughness={isFrosted ? 0.8 : 0.05}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Vertical grille bars (2 bars - Indian window style) */}
      <mesh position={[-innerW / 6, 0, 0.04]}>
        <boxGeometry args={[0.02, innerH, 0.02]} />
        <meshStandardMaterial color="#444" metalness={0.4} roughness={0.4} />
      </mesh>
      <mesh position={[innerW / 6, 0, 0.04]}>
        <boxGeometry args={[0.02, innerH, 0.02]} />
        <meshStandardMaterial color="#444" metalness={0.4} roughness={0.4} />
      </mesh>

      {/* Window sill */}
      <mesh position={[0, -height / 2 - 0.03, 0.06]}>
        <boxGeometry args={[width + 0.1, 0.04, 0.12]} />
        <meshStandardMaterial color="#5a3a15" roughness={0.6} />
      </mesh>
    </group>
  );
}

// Baseboard trim along wall base
function Baseboard({ position, size }) {
  return (
    <mesh position={position} castShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color="#3a2a18" roughness={0.6} />
    </mesh>
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
      -hw, baseY, -hd, 0, peakY, -hd, 0, peakY, hd,
      -hw, baseY, -hd, 0, peakY, hd, -hw, baseY, hd,
      // Right slope (2 triangles)
      hw, baseY, -hd, 0, peakY, hd, 0, peakY, -hd,
      hw, baseY, -hd, hw, baseY, hd, 0, peakY, hd,
      // Front gable triangle
      -hw, baseY, -hd, hw, baseY, -hd, 0, peakY, -hd,
      // Back gable triangle
      -hw, baseY, hd, 0, peakY, hd, hw, baseY, hd,
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
    <group position={[-7.5, 0, 6.5]}>
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
    <group position={[-5, 0, 6.5]}>
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
    <group position={[-3.5, 0, 6.5]}>
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
    <group position={[-1.5, 0, 6.5]}>
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

// Window positions data exported for interaction system
export const WINDOW_POSITIONS = {
  bedroom_window_back: { pos: [5, 1.8, -8], label: 'Bedroom Window (Back)' },
  bedroom_window_front: { pos: [2.5, 1.8, -8], label: 'Bedroom Window (Front)' },
  kitchen_window_back: { pos: [-5, 2.1, 8], label: 'Kitchen Window' },
  bathroom_window: { pos: [10, 2.1, 4], label: 'Bathroom Window' },
};

export default function House({ bedroomCurtainsOnly = false }) {
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
      {/* Front wall (z = -8) - 2 bedroom windows + 1 living room window */}
      {/* Section x=[-10, -5.75] -> center -7.875, width 4.25 */}
      <WallBox position={[-7.875, WALL_HEIGHT / 2, -8]} size={[4.25, WALL_HEIGHT, WALL_THICKNESS]} />
      {/* Section x=[-4.25, 1.75] -> center -1.25, width 6 */}
      <WallBox position={[-1.25, WALL_HEIGHT / 2, -8]} size={[6, WALL_HEIGHT, WALL_THICKNESS]} />
      {/* Above living room window (x=-5) */}
      <WallBox position={[-5, 2.5, -8]} size={[1.5, 1.0, WALL_THICKNESS]} />
      {/* Below living room window (x=-5) */}
      <WallBox position={[-5, 0.6, -8]} size={[1.5, 1.2, WALL_THICKNESS]} />
      {/* Between two bedroom front windows: x=[3.25, 4.25] -> center 3.75, width 1.0 */}
      <WallBox position={[3.75, WALL_HEIGHT / 2, -8]} size={[1.0, WALL_HEIGHT, WALL_THICKNESS]} />
      {/* Right of second window: x=[5.75, 10] -> center 7.875, width 4.25 */}
      <WallBox position={[7.875, WALL_HEIGHT / 2, -8]} size={[4.25, WALL_HEIGHT, WALL_THICKNESS]} />
      {/* Above bedroom window 1 (x=2.5) */}
      <WallBox position={[2.5, 2.5, -8]} size={[1.5, 1.0, WALL_THICKNESS]} />
      {/* Below bedroom window 1 (x=2.5) */}
      <WallBox position={[2.5, 0.6, -8]} size={[1.5, 1.2, WALL_THICKNESS]} />
      {/* Above bedroom window 2 (x=5) */}
      <WallBox position={[5, 2.5, -8]} size={[1.5, 1.0, WALL_THICKNESS]} />
      {/* Below bedroom window 2 (x=5) */}
      <WallBox position={[5, 0.6, -8]} size={[1.5, 1.2, WALL_THICKNESS]} />

      {/* Back wall (z = 8) — gap at x=[-2, 2] for backyard door, kitchen window at x=-5 */}
      {/* Left section: x=[-10, -5.75] -> center -7.875, width 4.25 */}
      <WallBox position={[-7.875, WALL_HEIGHT / 2, 8]} size={[4.25, WALL_HEIGHT, WALL_THICKNESS]} />
      {/* Between kitchen window and door gap: x=[-4.25, -2] -> center -3.125, width 2.25 */}
      <WallBox position={[-3.125, WALL_HEIGHT / 2, 8]} size={[2.25, WALL_HEIGHT, WALL_THICKNESS]} />
      {/* Above kitchen window (x=-5, bottom at 1.5, height 1.2 -> top at 2.7) */}
      <WallBox position={[-5, 2.85, 8]} size={[1.5, 0.3, WALL_THICKNESS]} />
      {/* Below kitchen window */}
      <WallBox position={[-5, 0.75, 8]} size={[1.5, 1.5, WALL_THICKNESS]} />
      {/* Right of back door: x=[2, 10] -> center 6, width 8 */}
      <WallBox position={[6, WALL_HEIGHT / 2, 8]} size={[8, WALL_HEIGHT, WALL_THICKNESS]} />
      {/* Above back door */}
      <WallBox position={[0, 2.7, 8]} size={[4, 0.6, WALL_THICKNESS]} />
      <DoorFrame position={[0, 0, 8]} />

      {/* Left wall (x = -10) — door gap at z = [-3.5, -0.5], window at z=-4.75 (1.5 wide) */}
      {/* Section z=[-8, -5.5] -> center z=-6.75, depth 2.5 */}
      <WallBox position={[-10, WALL_HEIGHT / 2, -6.75]} size={[WALL_THICKNESS, WALL_HEIGHT, 2.5]} />
      {/* Section z=[-4, -3.5] -> center z=-3.75, depth 0.5 */}
      <WallBox position={[-10, WALL_HEIGHT / 2, -3.75]} size={[WALL_THICKNESS, WALL_HEIGHT, 0.5]} />
      {/* Above left wall window */}
      <WallBox position={[-10, 2.5, -4.75]} size={[WALL_THICKNESS, 1.0, 1.5]} />
      {/* Below left wall window */}
      <WallBox position={[-10, 0.6, -4.75]} size={[WALL_THICKNESS, 1.2, 1.5]} />
      <WallBox position={[-10, WALL_HEIGHT / 2, 4.25]} size={[WALL_THICKNESS, WALL_HEIGHT, 7.5]} />
      {/* Above left wall door */}
      <WallBox position={[-10, 2.7, -2]} size={[WALL_THICKNESS, 0.6, 3]} />
      <DoorFrame position={[-10, 0, -2]} rotation={[0, Math.PI / 2, 0]} isEntrance={true} />

      {/* Right wall (x = 10) - solid for bedroom, split for bathroom window only */}
      {/* Bedroom section: z=[-8, 0] -> fully solid (no window here, AC is on this wall) */}
      <WallBox position={[10, WALL_HEIGHT / 2, -4]} size={[WALL_THICKNESS, WALL_HEIGHT, 8]} />

      {/* Bathroom section of right wall: z=[0, 8], window at z=4, 1.2 wide -> gap z=[3.4, 4.6] */}
      {/* Section z=[0, 3.4] -> center z=1.7, depth 3.4 */}
      <WallBox position={[10, WALL_HEIGHT / 2, 1.7]} size={[WALL_THICKNESS, WALL_HEIGHT, 3.4]} />
      {/* Section z=[4.6, 8] -> center z=6.3, depth 3.4 */}
      <WallBox position={[10, WALL_HEIGHT / 2, 6.3]} size={[WALL_THICKNESS, WALL_HEIGHT, 3.4]} />
      {/* Above bathroom window (window bottom=1.35, top=2.25) -> above piece from 2.25 to 3.0 */}
      <WallBox position={[10, 2.625, 4]} size={[WALL_THICKNESS, 0.75, 1.2]} />
      {/* Below bathroom window -> from 0 to 1.35 */}
      <WallBox position={[10, 0.675, 4]} size={[WALL_THICKNESS, 1.35, 1.2]} />

      {/* ─── WINDOWS ─── */}
      {/* Living Room - Front wall window (z=-8, centered at x=-5) */}
      <HouseWindow
        position={[-5, 1.8, -7.9]}
        width={1.5} height={1.2}
        name="livingroom_window_front"
      />
      {/* Living Room - Left wall window (x=-10, centered at z=-4.75) */}
      <HouseWindow
        position={[-9.9, 1.8, -4.75]}
        rotation={[0, Math.PI / 2, 0]}
        width={1.5} height={1.2}
        name="livingroom_window_left"
      />
      {/* Bedroom - Back wall window 1 (z=-8, centered at x=5) */}
      <HouseWindow
        position={[5, 1.8, -7.9]}
        width={1.5} height={1.2}
        name="bedroom_window_back"
      />
      {/* Bedroom - Front wall window 2 (z=-8, centered at x=2.5) - moved from side wall to avoid AC overlap */}
      <HouseWindow
        position={[2.5, 1.8, -7.9]}
        width={1.5} height={1.2}
        name="bedroom_window_front"
      />
      {/* Kitchen - Back wall window (z=8, centered at x=-5, higher up) */}
      <HouseWindow
        position={[-5, 2.1, 7.9]}
        width={1.5} height={1.2}
        name="kitchen_window_back"
      />
      {/* Bathroom - Right wall window (x=10, centered at z=4, 1.2x0.9, frosted) */}
      <HouseWindow
        position={[9.9, 1.8, 4]}
        rotation={[0, Math.PI / 2, 0]}
        width={1.2} height={0.9}
        isFrosted={true}
        name="bathroom_window"
      />

      {/* ─── BASEBOARDS (outer walls) ─── */}
      <Baseboard position={[0, 0.06, -7.9]} size={[20, 0.12, 0.05]} />
      <Baseboard position={[0, 0.06, 7.9]} size={[20, 0.12, 0.05]} />
      <Baseboard position={[-9.9, 0.06, -5.75]} size={[0.05, 0.12, 4.5]} />
      <Baseboard position={[-9.9, 0.06, 4.25]} size={[0.05, 0.12, 7.5]} />
      <Baseboard position={[9.9, 0.06, 0]} size={[0.05, 0.12, 16]} />

      {/* ─── INNER WALLS ─── */}
      {/* Horizontal middle wall (z = 0) — FIX 4: proper doorway sizing, no gaps */}
      {/* Left section: x = [-10, -5.5] = wall left of living→kitchen door */}
      <WallBox position={[-7.75, WALL_HEIGHT / 2, 0]} size={[4.5, WALL_HEIGHT, WALL_THICKNESS]} color={WALL_COLOR_INNER} />
      {/* Living→Kitchen door gap at x=[-5.5,-4.5] (1.0 wide), above door fill to ceiling */}
      <WallBox position={[-5, 2.6, 0]} size={[1.0, 0.8, WALL_THICKNESS]} color={WALL_COLOR_INNER} />
      <DoorFrame position={[-5, 0, 0]} />
      {/* Right of living→kitchen door to bedroom→bathroom door: x=[-4.5, 4.5] */}
      <WallBox position={[0, WALL_HEIGHT / 2, 0]} size={[9, WALL_HEIGHT, WALL_THICKNESS]} color={WALL_COLOR_INNER} />
      {/* Bedroom→Bathroom door gap at x=[4.5,5.5] (1.0 wide), above door */}
      <WallBox position={[5, 2.6, 0]} size={[1.0, 0.8, WALL_THICKNESS]} color={WALL_COLOR_INNER} />
      <DoorFrame position={[5, 0, 0]} />
      {/* Right section: x = [5.5, 10] */}
      <WallBox position={[7.75, WALL_HEIGHT / 2, 0]} size={[4.5, WALL_HEIGHT, WALL_THICKNESS]} color={WALL_COLOR_INNER} />

      {/* Vertical middle wall - front (x = 0, z = [-8, 0]) */}
      {/* Top section: z = [-8, -4.5] */}
      <WallBox position={[0, WALL_HEIGHT / 2, -6.25]} size={[WALL_THICKNESS, WALL_HEIGHT, 3.5]} color={WALL_COLOR_INNER} />
      {/* Living→Bedroom door gap at z=[-4.5,-3.5] (1.0 wide), above door */}
      <WallBox position={[0, 2.6, -4]} size={[WALL_THICKNESS, 0.8, 1.0]} color={WALL_COLOR_INNER} />
      <DoorFrame position={[0, 0, -4]} rotation={[0, Math.PI / 2, 0]} />
      {/* Bottom section: z = [-3.5, 0] */}
      <WallBox position={[0, WALL_HEIGHT / 2, -1.75]} size={[WALL_THICKNESS, WALL_HEIGHT, 3.5]} color={WALL_COLOR_INNER} />

      {/* Vertical middle wall - back (x = 4, z = [0, 8]) */}
      {/* Top section: z = [0, 3.5] */}
      <WallBox position={[4, WALL_HEIGHT / 2, 1.75]} size={[WALL_THICKNESS, WALL_HEIGHT, 3.5]} color={WALL_COLOR_INNER} />
      {/* Kitchen→Bathroom door gap at z=[3.5,4.5] (1.0 wide), above door */}
      <WallBox position={[4, 2.6, 4]} size={[WALL_THICKNESS, 0.8, 1.0]} color={WALL_COLOR_INNER} />
      <DoorFrame position={[4, 0, 4]} rotation={[0, Math.PI / 2, 0]} />
      {/* Bottom section: z = [4.5, 8] */}
      <WallBox position={[4, WALL_HEIGHT / 2, 6.25]} size={[WALL_THICKNESS, WALL_HEIGHT, 3.5]} color={WALL_COLOR_INNER} />

      {/* ─── ANIMATED WOOD DOORS ON ALL DOORWAYS ─── */}
      {/* Living→Kitchen doorway (z=0, x=-5) */}
      <AnimatedDoor position={[-5, 0, 0.02]} width={1.0} height={2.2} />
      {/* Living→Bedroom doorway (x=0, z=-4) */}
      <AnimatedDoor position={[0.02, 0, -4]} rotation={[0, Math.PI / 2, 0]} width={1.0} height={2.2} />
      {/* Bedroom→Bathroom doorway (z=0, x=5) */}
      <AnimatedDoor position={[5, 0, 0.02]} width={1.0} height={2.2} />
      {/* Kitchen→Bathroom doorway (x=4, z=4) */}
      <AnimatedDoor position={[4.02, 0, 4]} rotation={[0, Math.PI / 2, 0]} width={1.0} height={2.2} />
      {/* Back door (z=8, x=0) */}
      <AnimatedDoor position={[0, 0, 7.98]} width={1.0} height={2.2} />
      {/* Left entrance door (x=-10, z=-2) */}
      <AnimatedDoor position={[-9.98, 0, -2]} rotation={[0, Math.PI / 2, 0]} width={1.0} height={2.2} />

      {/* ─── CURTAINS ─── */}
      {/* Bedroom back window — always has curtain */}
      <RealisticBedroomCurtain position={[5, 1.8, -7.9]} width={1.4} height={1.1} />
      {/* Bedroom front window — always has curtain */}
      <RealisticBedroomCurtain position={[2.5, 1.8, -7.9]} width={1.4} height={1.1} />
      {/* Non-bedroom curtains — only shown when bedroomCurtainsOnly is false */}
      {!bedroomCurtainsOnly && (
        <>
          {/* Living Room front window */}
          <RealisticBedroomCurtain position={[-5, 1.8, -7.9]} width={1.4} height={1.1} />
          {/* Living Room left window */}
          <RealisticBedroomCurtain position={[-9.9, 1.8, -4.75]} rotation={[0, Math.PI / 2, 0]} width={1.4} height={1.1} />
          {/* Kitchen back window */}
          <RealisticBedroomCurtain position={[-5, 2.1, 7.9]} width={1.4} height={1.1} />
          {/* Bathroom window (smaller) */}
          <RealisticBedroomCurtain position={[9.9, 1.8, 4]} rotation={[0, Math.PI / 2, 0]} width={1.1} height={0.8} />
        </>
      )}

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
      <group position={[-5, 0, 6.5]}>
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

      {/* Bathroom - Realistic Wash Basin with Vanity, Faucet & Mirror */}
      <group position={[5.5, 0, 7.8]} rotation={[0, Math.PI, 0]}>
        {/* Vanity cabinet base */}
        <mesh position={[0, 0.38, 0]} castShadow>
          <boxGeometry args={[1.4, 0.76, 0.5]} />
          <meshStandardMaterial color="#d4c4a8" roughness={0.55} />
        </mesh>
        {/* Cabinet left door */}
        <mesh position={[-0.35, 0.38, 0.256]}>
          <boxGeometry args={[0.62, 0.64, 0.02]} />
          <meshStandardMaterial color="#c8b890" roughness={0.5} />
        </mesh>
        {/* Cabinet right door */}
        <mesh position={[0.35, 0.38, 0.256]}>
          <boxGeometry args={[0.62, 0.64, 0.02]} />
          <meshStandardMaterial color="#c8b890" roughness={0.5} />
        </mesh>
        {/* Cabinet handles */}
        <mesh position={[-0.12, 0.42, 0.28]}>
          <sphereGeometry args={[0.025, 10, 10]} />
          <meshStandardMaterial color="#b8b8b8" metalness={0.8} roughness={0.15} />
        </mesh>
        <mesh position={[0.12, 0.42, 0.28]}>
          <sphereGeometry args={[0.025, 10, 10]} />
          <meshStandardMaterial color="#b8b8b8" metalness={0.8} roughness={0.15} />
        </mesh>
        {/* Center divider line */}
        <mesh position={[0, 0.38, 0.258]}>
          <boxGeometry args={[0.015, 0.64, 0.005]} />
          <meshStandardMaterial color="#b0a080" roughness={0.6} />
        </mesh>
        {/* Thick marble countertop */}
        <mesh position={[0, 0.78, 0]} castShadow>
          <boxGeometry args={[1.45, 0.06, 0.55]} />
          <meshStandardMaterial color="#f5f0e8" roughness={0.1} metalness={0.03} />
        </mesh>
        {/* Backsplash */}
        <mesh position={[0, 0.92, -0.24]}>
          <boxGeometry args={[1.45, 0.24, 0.04]} />
          <meshStandardMaterial color="#f0ece4" roughness={0.15} />
        </mesh>
        {/* Basin rim */}
        <mesh position={[0, 0.8, 0.02]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.17, 0.23, 24]} />
          <meshStandardMaterial color="#ffffff" roughness={0.12} side={THREE.DoubleSide} />
        </mesh>
        {/* Basin bowl */}
        <mesh position={[0, 0.72, 0.02]}>
          <cylinderGeometry args={[0.2, 0.14, 0.16, 24]} />
          <meshStandardMaterial color="#f8f8f8" roughness={0.12} metalness={0.08} />
        </mesh>
        {/* Basin inner */}
        <mesh position={[0, 0.68, 0.02]}>
          <cylinderGeometry args={[0.12, 0.1, 0.04, 20]} />
          <meshStandardMaterial color="#e0e0e0" roughness={0.25} />
        </mesh>
        {/* Drain plug */}
        <mesh position={[0, 0.66, 0.02]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.025, 12]} />
          <meshStandardMaterial color="#999" metalness={0.7} roughness={0.2} side={THREE.DoubleSide} />
        </mesh>
        {/* Faucet base plate */}
        <mesh position={[0, 0.82, -0.14]} castShadow>
          <cylinderGeometry args={[0.04, 0.045, 0.03, 12]} />
          <meshStandardMaterial color="#d0d0d0" metalness={0.9} roughness={0.08} />
        </mesh>
        {/* Faucet pillar */}
        <mesh position={[0, 0.98, -0.14]} castShadow>
          <cylinderGeometry args={[0.02, 0.025, 0.3, 10]} />
          <meshStandardMaterial color="#c8c8c8" metalness={0.9} roughness={0.08} />
        </mesh>
        {/* Faucet gooseneck */}
        <mesh position={[0, 1.1, -0.04]} rotation={[0.85, 0, 0]} castShadow>
          <cylinderGeometry args={[0.012, 0.015, 0.22, 8]} />
          <meshStandardMaterial color="#c8c8c8" metalness={0.9} roughness={0.08} />
        </mesh>
        {/* Spout end */}
        <mesh position={[0, 1.0, 0.06]}>
          <cylinderGeometry args={[0.018, 0.012, 0.05, 8]} />
          <meshStandardMaterial color="#b8b8b8" metalness={0.85} roughness={0.1} />
        </mesh>
        {/* Hot handle (red dot) */}
        <mesh position={[-0.1, 0.88, -0.12]} castShadow>
          <cylinderGeometry args={[0.022, 0.022, 0.05, 8]} />
          <meshStandardMaterial color="#d0d0d0" metalness={0.8} roughness={0.15} />
        </mesh>
        <mesh position={[-0.1, 0.91, -0.12]}>
          <sphereGeometry args={[0.012, 8, 8]} />
          <meshStandardMaterial color="#ef4444" roughness={0.3} />
        </mesh>
        {/* Cold handle (blue dot) */}
        <mesh position={[0.1, 0.88, -0.12]} castShadow>
          <cylinderGeometry args={[0.022, 0.022, 0.05, 8]} />
          <meshStandardMaterial color="#d0d0d0" metalness={0.8} roughness={0.15} />
        </mesh>
        <mesh position={[0.1, 0.91, -0.12]}>
          <sphereGeometry args={[0.012, 8, 8]} />
          <meshStandardMaterial color="#3b82f6" roughness={0.3} />
        </mesh>
        {/* Soap dispenser */}
        <mesh position={[0.4, 0.86, 0.05]}>
          <cylinderGeometry args={[0.03, 0.035, 0.1, 10]} />
          <meshStandardMaterial color="#e8c8a0" roughness={0.4} />
        </mesh>
        <mesh position={[0.4, 0.93, 0.05]}>
          <cylinderGeometry args={[0.015, 0.015, 0.04, 8]} />
          <meshStandardMaterial color="#c0c0c0" metalness={0.7} roughness={0.2} />
        </mesh>
        {/* Towel bar */}
        <mesh position={[0.72, 0.5, 0.1]}>
          <boxGeometry args={[0.02, 0.02, 0.35]} />
          <meshStandardMaterial color="#c0c0c0" metalness={0.7} roughness={0.2} />
        </mesh>
        {/* Towel */}
        <mesh position={[0.72, 0.42, 0.1]}>
          <boxGeometry args={[0.01, 0.2, 0.3]} />
          <meshStandardMaterial color="#87CEEB" roughness={0.7} />
        </mesh>
        {/* ─── MIRROR ─── */}
        {/* Wooden frame */}
        <mesh position={[0, 1.75, -0.26]} castShadow>
          <boxGeometry args={[0.85, 1.0, 0.035]} />
          <meshStandardMaterial color="#6b4520" roughness={0.45} metalness={0.05} />
        </mesh>
        {/* Inner frame accent */}
        <mesh position={[0, 1.75, -0.24]}>
          <boxGeometry args={[0.8, 0.95, 0.01]} />
          <meshStandardMaterial color="#8B6914" roughness={0.4} />
        </mesh>
        {/* Mirror glass */}
        <mesh position={[0, 1.75, -0.232]}>
          <boxGeometry args={[0.72, 0.87, 0.008]} />
          <meshStandardMaterial color="#c0d8e8" metalness={0.92} roughness={0.03} />
        </mesh>
        {/* Glare highlight */}
        <mesh position={[-0.18, 1.8, -0.226]}>
          <boxGeometry args={[0.06, 0.55, 0.004]} />
          <meshStandardMaterial color="#ffffff" transparent opacity={0.2} roughness={0.0} />
        </mesh>
        <mesh position={[0.22, 1.65, -0.226]}>
          <boxGeometry args={[0.04, 0.3, 0.004]} />
          <meshStandardMaterial color="#ffffff" transparent opacity={0.12} roughness={0.0} />
        </mesh>
      </group>

      {/* Room labels removed — names shown in top HUD banner only */}

      {/* ─── GROUND OUTSIDE ─── */}
      <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#3a5a3a" roughness={1} />
      </mesh>
    </group>
  );
}
