import React, { useState, useCallback, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { useNavigate } from 'react-router-dom';
import House from './House';
import Appliances from './Appliances';
import Player from './Player';
import { APPLIANCE_DATA } from './applianceData';
import './Level1.css';

// ─── Speech Engine (Web Speech API) ───
function speak(text) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.05;
    utterance.lang = 'en-IN';
    window.speechSynthesis.speak(utterance);
  }
}

function stopSpeech() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

// ─── Cloud Speech Bubble Overlay ───
function SpeechBubble({ appliance, onClose }) {
  if (!appliance) return null;

  return (
    <div className="speech-overlay" onClick={onClose}>
      <div className="cloud-bubble-wrapper" onClick={(e) => e.stopPropagation()}>
        <div className="cloud-bubble">
          <div className="bubble-header">
            <div className="bubble-icon">{appliance.icon}</div>
            <div>
              <h3 className="bubble-title">{appliance.name}</h3>
              <span className="bubble-room">{appliance.room}</span>
            </div>
          </div>

          <p className="bubble-description">{appliance.description}</p>

          <div className="bubble-stats">
            <div className="stat-card">
              <div className="stat-value">{appliance.wattage}W</div>
              <div className="stat-label">Power</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{appliance.monthlyKwh}</div>
              <div className="stat-label">kWh / Month</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">₹{Math.round(appliance.monthlyKwh * 6)}</div>
              <div className="stat-label">Est. Cost / Mo</div>
            </div>
          </div>

          <button className="bubble-close-btn" onClick={onClose}>
            Got it! ✓
          </button>
        </div>

        {/* Cloud thought-trail dots */}
        <div className="cloud-tail">
          <div className="cloud-tail-dot" />
          <div className="cloud-tail-dot" />
          <div className="cloud-tail-dot" />
        </div>
      </div>
    </div>
  );
}

// ─── 3D Scene Content ───
function SceneContent({ onApplianceClick, onRoomChange }) {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 15, 10]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
      />
      <hemisphereLight args={['#b1e1ff', '#b97a20', 0.3]} />

      {/* Scene */}
      <House />
      <Appliances onApplianceClick={onApplianceClick} />
      <Player onRoomChange={onRoomChange} />
    </>
  );
}

// ─── Loading Fallback ───
function LoadingScreen() {
  return (
    <div className="level1-loading">
      <div className="loading-spinner" />
      <p style={{ fontSize: 18, fontWeight: 600 }}>Loading Arjun's House...</p>
      <p style={{ fontSize: 13, color: '#64748b', marginTop: 8 }}>Setting up rooms and appliances</p>
    </div>
  );
}

// ─── Main Level 1 Component ───
export default function Level1() {
  const navigate = useNavigate();
  const [activeAppliance, setActiveAppliance] = useState(null);
  const [currentRoom, setCurrentRoom] = useState('Living Room');

  const handleApplianceClick = useCallback((applianceId) => {
    const data = APPLIANCE_DATA[applianceId];
    if (data) {
      setActiveAppliance(data);
      speak(data.description);
    }
  }, []);

  const handleCloseBubble = useCallback(() => {
    stopSpeech();
    setActiveAppliance(null);
  }, []);

  const handleRoomChange = useCallback((room) => {
    setCurrentRoom((prev) => (prev !== room ? room : prev));
  }, []);

  return (
    <div className="level1-container">
      {/* 3D Canvas */}
      <Canvas
        shadows
        camera={{ position: [-5, 6, 1], fov: 50 }}
        onCreated={({ gl }) => {
          gl.setClearColor('#87CEEB');
          gl.toneMapping = 1; // ACESFilmic
          gl.toneMappingExposure = 1.2;
        }}
      >
        <Suspense fallback={null}>
          <SceneContent
            onApplianceClick={handleApplianceClick}
            onRoomChange={handleRoomChange}
          />
        </Suspense>
      </Canvas>

      {/* HUD Overlay */}
      <div className="level1-hud">
        <button className="hud-back-btn" onClick={() => navigate('/hub')}>
          ← Back
        </button>
        <div className="hud-room-name">
          📍 {currentRoom}
        </div>
        <div className="hud-instructions">
          🏠 Home Audit Mission
        </div>
      </div>

      {/* Bottom instructions hint */}
      <div className="interaction-hint">
        Use <span className="key-icon">↑</span><span className="key-icon">↓</span>
        <span className="key-icon">←</span><span className="key-icon">→</span> to move Arjun
        &nbsp;•&nbsp; Click appliances to learn about energy
      </div>

      {/* Speech Bubble Dialog */}
      <SpeechBubble appliance={activeAppliance} onClose={handleCloseBubble} />
    </div>
  );
}
