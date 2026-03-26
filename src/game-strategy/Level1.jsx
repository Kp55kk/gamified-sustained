import React, { useState, useCallback, Suspense, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { useNavigate } from 'react-router-dom';
import House from './House';
import Appliances from './Appliances';
import Player from './Player';
import { APPLIANCE_DATA, INTERACTABLE_IDS, QUIZ_QUESTIONS } from './applianceData';
import './Level1.css';

// ─── Speech Engine ───
function speak(text, rate = 0.9, pitch = 1.05) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = rate;
    u.pitch = pitch;
    u.lang = 'en-IN';
    window.speechSynthesis.speak(u);
  }
}
function stopSpeech() {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}

// ─── Audio System ───
let audioCtx = null;
function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}
function playInteractSound() {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(523, ctx.currentTime);
    osc.frequency.setValueAtTime(659, ctx.currentTime + 0.08);
    osc.frequency.setValueAtTime(784, ctx.currentTime + 0.16);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
  } catch (e) {}
}
function playCorrectSound() {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(523, ctx.currentTime);
    osc.frequency.setValueAtTime(784, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.5);
  } catch (e) {}
}
function playWrongSound() {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.setValueAtTime(150, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.4);
  } catch (e) {}
}

// ─── Ambient Music ───
function useAmbientMusic() {
  const gainRef = useRef(null);
  useEffect(() => {
    try {
      const ctx = getAudioCtx();
      const gain = ctx.createGain();
      gain.gain.value = 0.03;
      gain.connect(ctx.destination);
      gainRef.current = gain;

      // Simple pad-like ambient
      const notes = [220, 277, 330, 440];
      const oscs = notes.map(freq => {
        const o = ctx.createOscillator();
        o.type = 'sine';
        o.frequency.value = freq;
        o.connect(gain);
        o.start();
        return o;
      });

      return () => {
        oscs.forEach(o => { try { o.stop(); } catch(e) {} });
        gain.disconnect();
      };
    } catch (e) {}
  }, []);
}

// ─── Enhanced Speech Bubble ───
function SpeechBubble({ appliance, onClose }) {
  const [tab, setTab] = useState('about');
  if (!appliance) return null;

  const data = APPLIANCE_DATA[appliance.id] || appliance;

  return (
    <div className="speech-overlay" onClick={onClose}>
      <div className="cloud-bubble-wrapper" onClick={(e) => e.stopPropagation()}>
        <div className="cloud-bubble">
          <div className="bubble-header">
            <div className="bubble-icon">{data.icon}</div>
            <div>
              <h3 className="bubble-title">{data.name}</h3>
              <span className="bubble-room">{data.room} • {data.category}</span>
            </div>
            {data.hiddenConsumer && (
              <span className="hidden-badge">⚠️ HIDDEN CONSUMER</span>
            )}
          </div>

          {/* Tab buttons */}
          <div className="bubble-tabs">
            <button className={`tab-btn ${tab === 'about' ? 'active' : ''}`} onClick={() => setTab('about')}>About</button>
            <button className={`tab-btn ${tab === 'stats' ? 'active' : ''}`} onClick={() => setTab('stats')}>Energy Stats</button>
            <button className={`tab-btn ${tab === 'tips' ? 'active' : ''}`} onClick={() => setTab('tips')}>Tips & Facts</button>
          </div>

          {tab === 'about' && (
            <>
              <p className="bubble-description">{data.description}</p>
              <div className="bubble-stats">
                <div className="stat-card">
                  <div className="stat-value">{data.wattage}W</div>
                  <div className="stat-label">Power</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{data.monthlyKwh}</div>
                  <div className="stat-label">kWh/Mo</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{data.essential ? '✅' : '❌'}</div>
                  <div className="stat-label">Essential?</div>
                </div>
              </div>
            </>
          )}

          {tab === 'stats' && (
            <div className="stats-detail">
              <div className="stat-row"><span>Annual Usage:</span><strong>{data.annualKwh} kWh/yr</strong></div>
              <div className="stat-row"><span>CO₂ Emissions:</span><strong>{data.co2PerYear} kg/yr</strong></div>
              <div className="stat-row"><span>Usage Pattern:</span><strong>{data.usePerDay}</strong></div>
              <div className="stat-row"><span>Days Used/Year:</span><strong>{data.daysPerYear}</strong></div>
              {data.standbyPower ? (
                <div className="stat-row standby-highlight">
                  <span>⚡ Standby Power:</span><strong>{data.standbyPower}</strong>
                </div>
              ) : null}
              {data.standbyKwhYear ? (
                <div className="stat-row standby-highlight">
                  <span>⚡ Standby kWh/yr:</span><strong>{data.standbyKwhYear}</strong>
                </div>
              ) : null}
              <div className="stat-row"><span>BEE Rating:</span><strong>{data.beeRated || 'No'}</strong></div>
              <div className="stat-row"><span>Source:</span><span className="source-text">{data.source}</span></div>
            </div>
          )}

          {tab === 'tips' && (
            <div className="tips-section">
              <div className="fun-fact">
                <span className="fact-icon">💡</span>
                <p>{data.funFact || data.researchNote}</p>
              </div>
              {data.researchNote && data.funFact && (
                <div className="research-note">
                  <span className="note-icon">📊</span>
                  <p>{data.researchNote}</p>
                </div>
              )}
            </div>
          )}

          <button className="bubble-close-btn" onClick={onClose}>
            Got it! ✓
          </button>
        </div>

        <div className="cloud-tail">
          <div className="cloud-tail-dot" />
          <div className="cloud-tail-dot" />
          <div className="cloud-tail-dot" />
        </div>
      </div>
    </div>
  );
}

// ─── Progress Checklist Panel ───
function ChecklistPanel({ interacted, isOpen, onToggle }) {
  const count = interacted.size;
  const total = INTERACTABLE_IDS.length;

  return (
    <div className={`checklist-panel ${isOpen ? 'open' : ''}`}>
      <button className="checklist-toggle" onClick={onToggle}>
        {isOpen ? '▶' : '◀'} {count}/{total}
      </button>
      {isOpen && (
        <div className="checklist-content">
          <h3 className="checklist-title">🏠 Home Audit Mission</h3>
          <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: `${(count / total) * 100}%` }} />
            <span className="progress-text">{count} / {total} Appliances</span>
          </div>
          <div className="checklist-items">
            {INTERACTABLE_IDS.map((id) => {
              const data = APPLIANCE_DATA[id];
              if (!data) return null;
              const done = interacted.has(id);
              return (
                <div key={id} className={`checklist-item ${done ? 'done' : ''}`}>
                  <span className="check-mark">{done ? '✅' : '⬜'}</span>
                  <span className="check-icon">{data.icon}</span>
                  <span className="check-name">{data.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Quiz Modal ───
function QuizModal({ question, onAnswer, answered, selectedIndex }) {
  if (!question) return null;

  return (
    <div className="quiz-overlay">
      <div className="quiz-modal">
        <div className="quiz-header">
          <span className="quiz-icon">🧠</span>
          <h3>Quick Quiz!</h3>
        </div>
        <p className="quiz-question">{question.question}</p>
        <div className="quiz-options">
          {question.options.map((opt, i) => {
            let cls = 'quiz-option';
            if (answered) {
              if (i === question.correctIndex) cls += ' correct';
              else if (i === selectedIndex) cls += ' wrong';
            }
            return (
              <button
                key={i}
                className={cls}
                onClick={() => !answered && onAnswer(i)}
                disabled={answered}
              >
                {String.fromCharCode(65 + i)}. {opt}
              </button>
            );
          })}
        </div>
        {answered && (
          <div className={`quiz-feedback ${selectedIndex === question.correctIndex ? 'correct' : 'wrong'}`}>
            {selectedIndex === question.correctIndex
              ? '✅ Correct! +1 ⭐'
              : `❌ Wrong! The answer is ${String.fromCharCode(65 + question.correctIndex)}.`}
            <p className="quiz-explanation">{question.explanation}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Stars & Badge Display ───
function RewardsDisplay({ stars, badge, showBadge }) {
  return (
    <>
      <div className="stars-display">
        {'⭐'.repeat(stars)} {stars > 0 && <span className="star-count">{stars}</span>}
      </div>
      {showBadge && (
        <div className="badge-overlay">
          <div className="badge-modal">
            <div className="badge-celebration">🎉</div>
            <h2 className="badge-title">Appliance Master!</h2>
            <p className="badge-text">You've explored all 12 appliances and completed your Home Energy Audit!</p>
            <div className="badge-stars">{'⭐'.repeat(stars)}</div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── 3D Scene Content ───
function SceneContent({ onApplianceClick, onRoomChange, onNearestChange, onInteract, activeApplianceId, interactedAppliances }) {
  return (
    <>
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

      <House />
      <Appliances
        onApplianceClick={onApplianceClick}
        activeApplianceId={activeApplianceId}
        interactedAppliances={interactedAppliances}
      />
      <Player
        onRoomChange={onRoomChange}
        onNearestApplianceChange={onNearestChange}
        onInteract={onInteract}
      />
    </>
  );
}

// ─── Main Level 1 Component ───
export default function Level1() {
  const navigate = useNavigate();
  const [activeAppliance, setActiveAppliance] = useState(null);
  const [currentRoom, setCurrentRoom] = useState('Living Room');
  const [nearestAppliance, setNearestAppliance] = useState(null);
  const [interacted, setInteracted] = useState(new Set());
  const [checklistOpen, setChecklistOpen] = useState(true);

  // Quiz state
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [quizSelected, setQuizSelected] = useState(null);
  const [quizIndex, setQuizIndex] = useState(0);
  const [askedQuizCount, setAskedQuizCount] = useState(0);

  // Rewards
  const [stars, setStars] = useState(0);
  const [showBadge, setShowBadge] = useState(false);

  // Ambient music
  useAmbientMusic();

  const handleInteract = useCallback((applianceId) => {
    if (activeAppliance || showQuiz) return; // Already interacting or in quiz
    const data = APPLIANCE_DATA[applianceId];
    if (!data) return;

    playInteractSound();
    setActiveAppliance(data);
    speak(data.description, data.voiceRate || 0.9, data.voicePitch || 1.05);

    // Mark as interacted
    setInteracted(prev => {
      const next = new Set(prev);
      const wasNew = !next.has(applianceId);
      next.add(applianceId);

      if (wasNew) {
        setStars(s => s + 1);
        // Check for quiz trigger (every 4 interactions)
        const newCount = next.size;
        if (newCount > 0 && newCount % 4 === 0 && askedQuizCount < QUIZ_QUESTIONS.length) {
          setTimeout(() => {
            setCurrentQuiz(QUIZ_QUESTIONS[askedQuizCount]);
            setShowQuiz(true);
            setQuizAnswered(false);
            setQuizSelected(null);
            setAskedQuizCount(c => c + 1);
          }, 500);
        }
        // Check for completion
        if (newCount >= INTERACTABLE_IDS.length) {
          setTimeout(() => setShowBadge(true), 1000);
        }
      }
      return next;
    });
  }, [activeAppliance, showQuiz, askedQuizCount]);

  const handleApplianceClick = useCallback((applianceId) => {
    handleInteract(applianceId);
  }, [handleInteract]);

  const handleCloseBubble = useCallback(() => {
    stopSpeech();
    setActiveAppliance(null);
  }, []);

  const handleQuizAnswer = useCallback((index) => {
    setQuizSelected(index);
    setQuizAnswered(true);
    if (index === currentQuiz?.correctIndex) {
      playCorrectSound();
      setStars(s => s + 1);
    } else {
      playWrongSound();
    }
    // Auto-close quiz after 3 seconds
    setTimeout(() => {
      setShowQuiz(false);
      setCurrentQuiz(null);
      setQuizAnswered(false);
      setQuizSelected(null);
    }, 3500);
  }, [currentQuiz]);

  const handleRoomChange = useCallback((room) => {
    setCurrentRoom(prev => prev !== room ? room : prev);
  }, []);

  const handleNearestChange = useCallback((id) => {
    setNearestAppliance(id);
  }, []);

  return (
    <div className="level1-container">
      {/* 3D Canvas */}
      <Canvas
        shadows
        camera={{ position: [-5, 6, 1], fov: 50 }}
        onCreated={({ gl }) => {
          gl.setClearColor('#87CEEB');
          gl.toneMapping = 1;
          gl.toneMappingExposure = 1.2;
        }}
      >
        <Suspense fallback={null}>
          <SceneContent
            onApplianceClick={handleApplianceClick}
            onRoomChange={handleRoomChange}
            onNearestChange={handleNearestChange}
            onInteract={handleInteract}
            activeApplianceId={activeAppliance?.id}
            interactedAppliances={interacted}
          />
        </Suspense>
      </Canvas>

      {/* HUD */}
      <div className="level1-hud">
        <button className="hud-back-btn" onClick={() => navigate('/hub')}>← Back</button>
        <div className="hud-room-name">📍 {currentRoom}</div>
        <div className="hud-instructions">🏠 Home Audit Mission</div>
      </div>

      {/* Stars */}
      <RewardsDisplay stars={stars} showBadge={showBadge} />

      {/* Progress Checklist */}
      <ChecklistPanel
        interacted={interacted}
        isOpen={checklistOpen}
        onToggle={() => setChecklistOpen(o => !o)}
      />

      {/* Bottom hint */}
      <div className="interaction-hint">
        <span className="key-icon">W</span><span className="key-icon">A</span>
        <span className="key-icon">S</span><span className="key-icon">D</span> Move
        &nbsp;•&nbsp; 🖱️ Look Around
        &nbsp;•&nbsp; <span className="key-icon">E</span> Interact
        {nearestAppliance && !activeAppliance && (
          <span className="hint-nearby">
            &nbsp;— <span className="pulse-text">{APPLIANCE_DATA[nearestAppliance]?.icon} {APPLIANCE_DATA[nearestAppliance]?.name} nearby!</span>
          </span>
        )}
      </div>

      {/* Speech Bubble */}
      <SpeechBubble appliance={activeAppliance} onClose={handleCloseBubble} />

      {/* Quiz */}
      {showQuiz && (
        <QuizModal
          question={currentQuiz}
          onAnswer={handleQuizAnswer}
          answered={quizAnswered}
          selectedIndex={quizSelected}
        />
      )}
    </div>
  );
}
