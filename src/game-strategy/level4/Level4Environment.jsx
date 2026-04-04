// ═══════════════════════════════════════════════════════════
//  LEVEL 4: SOLAR REVOLUTION — 3D Environment (Enhanced)
//  Recovery-based: dark world → bright solar-powered world
//  Trees closer, ground bigger, garden, path, flowers
// ═══════════════════════════════════════════════════════════
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ROOF_GRID_SLOTS, TIME_PERIODS } from './level4Data';

// ═══ SKY DOME ═══
function SkyDome({ recoveryLevel, timeOfDay }) {
  const ref = useRef();
  const baseColor = useMemo(() => {
    const tp = TIME_PERIODS.find(t => t.id === timeOfDay) || TIME_PERIODS[2];
    return new THREE.Color(tp.skyColor);
  }, [timeOfDay]);

  useFrame(() => {
    if (!ref.current) return;
    const damaged = new THREE.Color('#1a0505');
    const target = baseColor.clone();
    const blended = damaged.clone().lerp(target, recoveryLevel);
    ref.current.material.color.lerp(blended, 0.05);
  });

  return (
    <mesh ref={ref} position={[0, 0, 0]}>
      <sphereGeometry args={[80, 24, 24]} />
      <meshBasicMaterial color="#1a0505" side={THREE.BackSide} />
    </mesh>
  );
}

// ═══ SUN LIGHT ═══
function SunLight({ recoveryLevel, timeOfDay }) {
  const dirRef = useRef();
  const ambRef = useRef();

  useFrame(() => {
    if (!dirRef.current || !ambRef.current) return;
    const tp = TIME_PERIODS.find(t => t.id === timeOfDay) || TIME_PERIODS[2];
    const angle = ((tp.hour - 6) / 12) * Math.PI;
    const sunX = Math.cos(angle) * 25;
    const sunY = Math.sin(angle) * 25 + 3;
    dirRef.current.position.lerp(new THREE.Vector3(sunX, Math.max(sunY, 1), -8), 0.03);
    const targetI = tp.sunlight * recoveryLevel * 3.0;
    dirRef.current.intensity += (targetI - dirRef.current.intensity) * 0.04;
    const ambT = 0.2 + recoveryLevel * 0.6 + tp.sunlight * 0.4;
    ambRef.current.intensity += (ambT - ambRef.current.intensity) * 0.04;
  });

  return (
    <>
      <directionalLight ref={dirRef} position={[15, 20, -8]} intensity={0.8} color="#ffeedd" />
      <ambientLight ref={ambRef} intensity={0.4} color="#ffeedd" />
      <hemisphereLight intensity={0.3 + recoveryLevel * 0.4} color="#87ceeb" groundColor="#2a5a2a" />
    </>
  );
}

// ═══ SUN ORB ═══
function SunOrb({ timeOfDay }) {
  const ref = useRef();
  useFrame(() => {
    if (!ref.current) return;
    const tp = TIME_PERIODS.find(t => t.id === timeOfDay) || TIME_PERIODS[2];
    const angle = ((tp.hour - 6) / 12) * Math.PI;
    const x = Math.cos(angle) * 45;
    const y = Math.sin(angle) * 45 + 8;
    ref.current.position.lerp(new THREE.Vector3(x, Math.max(y, -10), -30), 0.03);
    ref.current.material.opacity = tp.sunlight > 0.05 ? 0.9 : 0;
  });
  return (
    <mesh ref={ref} position={[10, 30, -30]}>
      <sphereGeometry args={[4, 16, 16]} />
      <meshBasicMaterial color="#ffee55" transparent opacity={0.9} />
    </mesh>
  );
}

// ═══ GROUND ═══
function Ground({ recoveryLevel }) {
  const ref = useRef();
  useFrame(() => {
    if (!ref.current) return;
    const dead = new THREE.Color('#1a0e05');
    const alive = new THREE.Color('#3a7a3a');
    const target = dead.clone().lerp(alive, recoveryLevel);
    ref.current.material.color.lerp(target, 0.03);
  });
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
      <planeGeometry args={[120, 120]} />
      <meshStandardMaterial color="#1a0e05" />
    </mesh>
  );
}

// ═══ PATH (walkway around house) ═══
function WalkPath() {
  return (
    <group>
      {/* Front path */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-5, -0.03, -10]}>
        <planeGeometry args={[3, 6]} />
        <meshStandardMaterial color="#8a7a6a" />
      </mesh>
      {/* Side paths */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-12, -0.03, 0]}>
        <planeGeometry args={[2, 18]} />
        <meshStandardMaterial color="#7a6a5a" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[12, -0.03, 0]}>
        <planeGeometry args={[2, 18]} />
        <meshStandardMaterial color="#7a6a5a" />
      </mesh>
    </group>
  );
}

// ═══ TREES (nearby + visible) — animated foliage color ═══
function Trees({ recoveryLevel }) {
  const treeData = useMemo(() => {
    const positions = [
      // Close to house (very visible)
      [-14, 0, -6], [-14, 0, 0], [-14, 0, 6],
      [14, 0, -6], [14, 0, 0], [14, 0, 6],
      // Front garden
      [-8, 0, -12], [-3, 0, -14], [3, 0, -14], [8, 0, -12],
      // Back
      [-6, 0, 12], [0, 0, 14], [6, 0, 12],
      // Further out (scenic)
      [-22, 0, -10], [-20, 0, 5], [-24, 0, 12],
      [22, 0, -10], [20, 0, 5], [24, 0, 12],
      [0, 0, 22], [-10, 0, 20], [10, 0, 20],
    ];
    return positions.map((p, i) => ({ pos: p, id: i, scale: 0.7 + Math.random() * 0.6 }));
  }, []);

  return treeData.map(t => <AnimatedTree key={t.id} treeData={t} recoveryLevel={recoveryLevel} />);
}

function AnimatedTree({ treeData, recoveryLevel }) {
  const canopy1Ref = useRef();
  const canopy2Ref = useRef();
  const trunkH = 2.0 * treeData.scale;

  useFrame(() => {
    const green = recoveryLevel;
    const canopyScale = (0.3 + green * 0.8) * treeData.scale;
    // Dead = brown/orange, Alive = rich green
    const deadColor = new THREE.Color(0.4, 0.15, 0.05);
    const aliveColor = new THREE.Color(0.1, 0.75, 0.15);
    const targetColor = deadColor.clone().lerp(aliveColor, green);

    if (canopy1Ref.current) {
      canopy1Ref.current.material.color.lerp(targetColor, 0.04);
      canopy1Ref.current.scale.setScalar(canopyScale * 1.4);
      canopy1Ref.current.position.y = trunkH + canopyScale * 0.5;
    }
    if (canopy2Ref.current) {
      const darkerTarget = targetColor.clone().multiplyScalar(0.9);
      canopy2Ref.current.material.color.lerp(darkerTarget, 0.04);
      canopy2Ref.current.scale.setScalar(canopyScale * 0.9);
      canopy2Ref.current.position.y = trunkH + canopyScale * 1.2;
    }
  });

  const initScale = (0.3 + recoveryLevel * 0.8) * treeData.scale;
  return (
    <group position={treeData.pos}>
      <mesh position={[0, trunkH / 2, 0]}>
        <cylinderGeometry args={[0.18, 0.25, trunkH, 6]} />
        <meshStandardMaterial color="#5a3a1a" />
      </mesh>
      <mesh ref={canopy1Ref} position={[0, trunkH + initScale * 0.5, 0]}>
        <sphereGeometry args={[1, 8, 6]} />
        <meshStandardMaterial color={new THREE.Color(0.4, 0.15, 0.05)} />
      </mesh>
      <mesh ref={canopy2Ref} position={[0, trunkH + initScale * 1.2, 0]}>
        <sphereGeometry args={[1, 8, 6]} />
        <meshStandardMaterial color={new THREE.Color(0.35, 0.15, 0.05)} />
      </mesh>
    </group>
  );
}

// ═══ FLOWERS/BUSHES (garden) — animated ═══
function Garden({ recoveryLevel }) {
  const bushPositions = useMemo(() => [
    [-12, 0, -4], [-12, 0, 4], [12, 0, -4], [12, 0, 4],
    [-6, 0, -10], [6, 0, -10],
    [-4, 0, 10], [4, 0, 10],
  ], []);

  return bushPositions.map((p, i) => <AnimatedBush key={i} position={p} recoveryLevel={recoveryLevel} />);
}

function AnimatedBush({ position, recoveryLevel }) {
  const ref = useRef();
  useFrame(() => {
    if (!ref.current) return;
    ref.current.visible = recoveryLevel >= 0.25;
    if (recoveryLevel >= 0.25) {
      const dead = new THREE.Color(0.3, 0.15, 0.05);
      const alive = new THREE.Color(0.1, 0.55, 0.1);
      const target = dead.clone().lerp(alive, recoveryLevel);
      ref.current.material.color.lerp(target, 0.04);
      const s = 0.3 + recoveryLevel * 0.5;
      ref.current.scale.setScalar(s);
    }
  });
  return (
    <mesh ref={ref} position={[position[0], 0.3, position[2]]} visible={false}>
      <sphereGeometry args={[1, 8, 6]} />
      <meshStandardMaterial color={new THREE.Color(0.3, 0.15, 0.05)} />
    </mesh>
  );
}

// ═══ NEIGHBOR HOUSES — animated ═══
function NeighborHouses({ recoveryLevel }) {
  const houses = useMemo(() => [
    { pos: [-22, 0, -15], rot: 0.3 },
    { pos: [22, 0, -15], rot: -0.3 },
    { pos: [-25, 0, 10], rot: 0.5 },
    { pos: [25, 0, 10], rot: -0.5 },
  ], []);

  return houses.map((h, i) => <AnimatedNeighborHouse key={i} house={h} recoveryLevel={recoveryLevel} />);
}

function AnimatedNeighborHouse({ house, recoveryLevel }) {
  const wallRef = useRef();
  const roofRef = useRef();
  useFrame(() => {
    if (wallRef.current) {
      const deadWall = new THREE.Color(0.25, 0.2, 0.15);
      const aliveWall = new THREE.Color(0.7, 0.55, 0.4);
      wallRef.current.material.color.lerp(deadWall.clone().lerp(aliveWall, recoveryLevel), 0.03);
    }
    if (roofRef.current) {
      const deadRoof = new THREE.Color(0.3, 0.15, 0.05);
      const aliveRoof = new THREE.Color(0.6, 0.35, 0.15);
      roofRef.current.material.color.lerp(deadRoof.clone().lerp(aliveRoof, recoveryLevel), 0.03);
    }
  });
  return (
    <group position={house.pos} rotation={[0, house.rot, 0]}>
      <mesh ref={wallRef} position={[0, 1.5, 0]}>
        <boxGeometry args={[4, 3, 5]} />
        <meshStandardMaterial color={new THREE.Color(0.25, 0.2, 0.15)} />
      </mesh>
      <mesh ref={roofRef} position={[0, 3.3, 0]} rotation={[0, 0, 0]}>
        <coneGeometry args={[3.5, 1.5, 4]} />
        <meshStandardMaterial color={new THREE.Color(0.3, 0.15, 0.05)} />
      </mesh>
    </group>
  );
}

// ═══ SOLAR PANELS ON ROOF ═══
function RoofPanels({ installedSlots, tiltAngle }) {
  const tiltRad = (tiltAngle * Math.PI) / 180;
  return installedSlots.map(slotIdx => {
    const slot = ROOF_GRID_SLOTS[slotIdx];
    if (!slot) return null;
    return (
      <group key={slot.id} position={[slot.x, 5.5, slot.z + 1]}>
        <mesh rotation={[-tiltRad, 0, 0]} position={[0, 0.05, 0]}>
          <boxGeometry args={[1.5, 0.08, 1.0]} />
          <meshStandardMaterial color="#1a2a5a" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh rotation={[-tiltRad, 0, 0]} position={[0, 0.1, 0]}>
          <boxGeometry args={[1.4, 0.02, 0.9]} />
          <meshStandardMaterial color="#2244aa" metalness={0.9} roughness={0.1} emissive="#112255" emissiveIntensity={0.1} />
        </mesh>
        <mesh position={[-0.5, -0.15, 0]}><cylinderGeometry args={[0.02, 0.02, 0.4, 4]} /><meshStandardMaterial color="#888" /></mesh>
        <mesh position={[0.5, -0.15, 0]}><cylinderGeometry args={[0.02, 0.02, 0.4, 4]} /><meshStandardMaterial color="#888" /></mesh>
      </group>
    );
  });
}

// ═══ ROOF SLOTS MARKERS (visible from outside) ═══
function RoofSlotMarkers({ slots, installedSlots }) {
  return slots.map(slot => {
    if (installedSlots.includes(slot.id)) return null;
    return (
      <mesh key={slot.id} position={[slot.x, 5.35, slot.z + 1]}>
        <boxGeometry args={[1.5, 0.02, 1.0]} />
        <meshStandardMaterial color="#ff6600" transparent opacity={0.4} emissive="#ff6600" emissiveIntensity={0.3} />
      </mesh>
    );
  });
}

// ═══ MAIN ENVIRONMENT ═══
export default function Level4Environment({
  recoveryLevel = 0, timeOfDay = 'noon',
  installedSlots = [], tiltAngle = 25,
  showSlotMarkers = false,
}) {
  return (
    <>
      <SkyDome recoveryLevel={recoveryLevel} timeOfDay={timeOfDay} />
      <SunLight recoveryLevel={recoveryLevel} timeOfDay={timeOfDay} />
      <SunOrb timeOfDay={timeOfDay} />
      <Ground recoveryLevel={recoveryLevel} />
      <WalkPath />
      <Trees recoveryLevel={recoveryLevel} />
      <Garden recoveryLevel={recoveryLevel} />
      <NeighborHouses recoveryLevel={recoveryLevel} />
      <RoofPanels installedSlots={installedSlots} tiltAngle={tiltAngle} />
      {showSlotMarkers && <RoofSlotMarkers slots={ROOF_GRID_SLOTS} installedSlots={installedSlots} />}
    </>
  );
}
