import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

// ════════════════════════════════════════════════════════════
//  FAMILY MEMBER 3D MODELS
//  Male & Female characters using Three.js primitives
//  Mother has longer hair, dupatta, bindi — distinctly female
// ════════════════════════════════════════════════════════════

function FamilyCharacter({ member, position, rotation, activity, scale = 1 }) {
  const groupRef = useRef();
  const leftArmRef = useRef();
  const rightArmRef = useRef();
  const bodyRef = useRef();

  const { skin, shirt, pants, hair, shoe } = member.color;
  const isFemale = member.gender === 'female';
  const s = (member.scale || 1) * scale;

  // Idle animation — gentle breathing + arm sway
  useFrame(() => {
    if (!bodyRef.current) return;
    const t = performance.now() * 0.001;
    bodyRef.current.position.y = Math.sin(t * 0.8 + position[0]) * 0.015;
    if (leftArmRef.current) {
      leftArmRef.current.rotation.x = Math.sin(t * 0.6 + position[2]) * 0.04;
      leftArmRef.current.rotation.z = -0.08;
    }
    if (rightArmRef.current) {
      rightArmRef.current.rotation.x = Math.sin(t * 0.6 + position[2] + 0.5) * 0.04;
      rightArmRef.current.rotation.z = 0.08;
    }
  });

  return (
    <group position={position} rotation={[0, rotation || 0, 0]} scale={[s, s, s]}>
      <group ref={bodyRef}>
        {/* Legs */}
        <group position={[-0.1, 0.5, 0]}>
          <mesh position={[0, -0.1, 0]} castShadow>
            <cylinderGeometry args={[0.07, 0.06, 0.22]} />
            <meshStandardMaterial color={pants} />
          </mesh>
          <mesh position={[0, -0.3, 0]} castShadow>
            <cylinderGeometry args={[0.055, 0.05, 0.2]} />
            <meshStandardMaterial color={pants} />
          </mesh>
          <mesh position={[0, -0.43, 0.03]} castShadow>
            <boxGeometry args={[0.1, 0.08, 0.16]} />
            <meshStandardMaterial color={shoe} />
          </mesh>
        </group>
        <group position={[0.1, 0.5, 0]}>
          <mesh position={[0, -0.1, 0]} castShadow>
            <cylinderGeometry args={[0.07, 0.06, 0.22]} />
            <meshStandardMaterial color={pants} />
          </mesh>
          <mesh position={[0, -0.3, 0]} castShadow>
            <cylinderGeometry args={[0.055, 0.05, 0.2]} />
            <meshStandardMaterial color={pants} />
          </mesh>
          <mesh position={[0, -0.43, 0.03]} castShadow>
            <boxGeometry args={[0.1, 0.08, 0.16]} />
            <meshStandardMaterial color={shoe} />
          </mesh>
        </group>

        {/* Torso */}
        <mesh position={[0, 0.75, 0]} castShadow>
          <boxGeometry args={[isFemale ? 0.36 : 0.38, 0.48, 0.22]} />
          <meshStandardMaterial color={shirt} />
        </mesh>

        {/* Dupatta / Saree drape (Female only) */}
        {isFemale && member.color.dupatta && (
          <>
            {/* Dupatta across shoulder */}
            <mesh position={[-0.12, 0.85, 0.08]} rotation={[0.1, 0, -0.3]} castShadow>
              <boxGeometry args={[0.06, 0.5, 0.15]} />
              <meshStandardMaterial color={member.color.dupatta} transparent opacity={0.85} />
            </mesh>
            {/* Dupatta hanging end */}
            <mesh position={[-0.18, 0.55, 0.06]} rotation={[0.05, 0, -0.15]} castShadow>
              <boxGeometry args={[0.05, 0.3, 0.12]} />
              <meshStandardMaterial color={member.color.dupatta} transparent opacity={0.75} />
            </mesh>
          </>
        )}

        {/* Arms */}
        <group ref={leftArmRef} position={[isFemale ? -0.24 : -0.26, 0.88, 0]}>
          <mesh position={[0, -0.1, 0]} castShadow>
            <cylinderGeometry args={[0.05, 0.04, 0.22]} />
            <meshStandardMaterial color={shirt} />
          </mesh>
          <mesh position={[0, -0.28, 0]} castShadow>
            <cylinderGeometry args={[0.04, 0.035, 0.18]} />
            <meshStandardMaterial color={skin} />
          </mesh>
          <mesh position={[0, -0.38, 0]} castShadow>
            <sphereGeometry args={[0.035, 8, 8]} />
            <meshStandardMaterial color={skin} />
          </mesh>
        </group>
        <group ref={rightArmRef} position={[isFemale ? 0.24 : 0.26, 0.88, 0]}>
          <mesh position={[0, -0.1, 0]} castShadow>
            <cylinderGeometry args={[0.05, 0.04, 0.22]} />
            <meshStandardMaterial color={shirt} />
          </mesh>
          <mesh position={[0, -0.28, 0]} castShadow>
            <cylinderGeometry args={[0.04, 0.035, 0.18]} />
            <meshStandardMaterial color={skin} />
          </mesh>
          <mesh position={[0, -0.38, 0]} castShadow>
            <sphereGeometry args={[0.035, 8, 8]} />
            <meshStandardMaterial color={skin} />
          </mesh>
        </group>

        {/* Neck */}
        <mesh position={[0, 1.02, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.06]} />
          <meshStandardMaterial color={skin} />
        </mesh>

        {/* Head */}
        <group position={[0, 1.2, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.17, 16, 16]} />
            <meshStandardMaterial color={skin} />
          </mesh>

          {/* ─── MALE HAIR (short cap) ─── */}
          {!isFemale && (
            <mesh position={[0, 0.07, -0.02]}>
              <sphereGeometry args={[0.18, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <meshStandardMaterial color={hair} />
            </mesh>
          )}

          {/* ─── FEMALE HAIR (full head + long back + side parting) ─── */}
          {isFemale && (
            <>
              {/* Full hair cap */}
              <mesh position={[0, 0.06, -0.01]}>
                <sphereGeometry args={[0.19, 16, 14, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
                <meshStandardMaterial color={hair} />
              </mesh>
              {/* Side hair left */}
              <mesh position={[-0.14, -0.02, 0.02]}>
                <boxGeometry args={[0.06, 0.2, 0.12]} />
                <meshStandardMaterial color={hair} />
              </mesh>
              {/* Side hair right */}
              <mesh position={[0.14, -0.02, 0.02]}>
                <boxGeometry args={[0.06, 0.2, 0.12]} />
                <meshStandardMaterial color={hair} />
              </mesh>
              {/* Long hair back (ponytail / flowing down) */}
              <mesh position={[0, -0.08, -0.12]}>
                <boxGeometry args={[0.12, 0.35, 0.08]} />
                <meshStandardMaterial color={hair} />
              </mesh>
              {/* Ponytail end */}
              <mesh position={[0, -0.28, -0.13]}>
                <sphereGeometry args={[0.06, 8, 8]} />
                <meshStandardMaterial color={hair} />
              </mesh>
              {/* Hair parting decoration / clip */}
              <mesh position={[0.08, 0.14, 0.1]}>
                <sphereGeometry args={[0.02, 6, 6]} />
                <meshStandardMaterial color="#ef4444" />
              </mesh>
            </>
          )}

          {/* Bindi (Female only) */}
          {isFemale && member.color.bindi && (
            <mesh position={[0, 0.08, 0.17]}>
              <sphereGeometry args={[0.018, 8, 8]} />
              <meshStandardMaterial color={member.color.bindi} />
            </mesh>
          )}

          {/* Eyes */}
          <mesh position={[-0.06, 0.02, 0.15]}>
            <sphereGeometry args={[0.028, 8, 8]} />
            <meshStandardMaterial color="#fff" />
          </mesh>
          <mesh position={[-0.06, 0.02, 0.17]}>
            <sphereGeometry args={[0.015, 8, 8]} />
            <meshStandardMaterial color="#333" />
          </mesh>
          <mesh position={[0.06, 0.02, 0.15]}>
            <sphereGeometry args={[0.028, 8, 8]} />
            <meshStandardMaterial color="#fff" />
          </mesh>
          <mesh position={[0.06, 0.02, 0.17]}>
            <sphereGeometry args={[0.015, 8, 8]} />
            <meshStandardMaterial color="#333" />
          </mesh>

          {/* Eyelashes (Female only) */}
          {isFemale && (
            <>
              <mesh position={[-0.06, 0.045, 0.165]} rotation={[0.3, 0, 0]}>
                <boxGeometry args={[0.04, 0.006, 0.003]} />
                <meshStandardMaterial color="#111" />
              </mesh>
              <mesh position={[0.06, 0.045, 0.165]} rotation={[0.3, 0, 0]}>
                <boxGeometry args={[0.04, 0.006, 0.003]} />
                <meshStandardMaterial color="#111" />
              </mesh>
            </>
          )}

          {/* Mouth */}
          <mesh position={[0, -0.05, 0.16]}>
            <boxGeometry args={[isFemale ? 0.04 : 0.05, 0.012, 0.008]} />
            <meshStandardMaterial color={isFemale ? '#c9544d' : '#a0522d'} />
          </mesh>

          {/* Ears */}
          <mesh position={[-0.17, 0, 0]}>
            <sphereGeometry args={[0.035, 8, 8]} />
            <meshStandardMaterial color={skin} />
          </mesh>
          <mesh position={[0.17, 0, 0]}>
            <sphereGeometry args={[0.035, 8, 8]} />
            <meshStandardMaterial color={skin} />
          </mesh>

          {/* Earrings (Female only) */}
          {isFemale && (
            <>
              <mesh position={[-0.18, -0.06, 0]}>
                <sphereGeometry args={[0.015, 6, 6]} />
                <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.2} />
              </mesh>
              <mesh position={[0.18, -0.06, 0]}>
                <sphereGeometry args={[0.015, 6, 6]} />
                <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.2} />
              </mesh>
            </>
          )}
        </group>
      </group>

      {/* Activity Label */}
      {activity && (
        <Html position={[0, 1.8, 0]} center>
          <div style={{
            background: 'rgba(0,0,0,0.7)',
            color: '#fff',
            padding: '3px 10px',
            borderRadius: '8px',
            fontSize: '10px',
            fontFamily: 'Nunito, sans-serif',
            fontWeight: 600,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
          }}>
            {member.name}
          </div>
        </Html>
      )}

      {/* Shadow disc */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.22, 12]} />
        <meshBasicMaterial color="#000" transparent opacity={0.15} />
      </mesh>
    </group>
  );
}

// ════════════════════════════════════════════════════════════
//  FAMILY MEMBERS GROUP — Renders all family members for a task
// ════════════════════════════════════════════════════════════

export default function FamilyMembers({ familyPositions, familyData }) {
  if (!familyPositions || familyPositions.length === 0) return null;

  return (
    <group>
      {familyPositions.map((fp) => {
        const member = familyData.find(m => m.id === fp.id);
        if (!member) return null;
        return (
          <FamilyCharacter
            key={fp.id}
            member={member}
            position={fp.pos}
            rotation={fp.rot}
            activity={fp.activity}
          />
        );
      })}
    </group>
  );
}
