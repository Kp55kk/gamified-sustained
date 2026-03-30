import React, { useState, useCallback, Suspense, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { useNavigate } from 'react-router-dom';
import House from './House';
import Appliances from './Appliances';
import Player, { cameraMode } from './Player';
import { APPLIANCE_DATA, APPLIANCE_POSITIONS, INTERACTABLE_IDS, QUIZ_QUESTIONS, ACHIEVEMENTS } from './applianceData';
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
function playAchievementSound() {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.setValueAtTime(660, ctx.currentTime + 0.1);
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.2);
    osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.6);
  } catch (e) {}
}
function playLevelCompleteSound() {
  try {
    const ctx = getAudioCtx();
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.15);
      gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 0.5);
      osc.start(ctx.currentTime + i * 0.15);
      osc.stop(ctx.currentTime + i * 0.15 + 0.5);
    });
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

// ─── Flash Card (Memory Boost) ───
function FlashCard({ appliance, visible }) {
  if (!visible || !appliance) return null;
  return (
    <div className="flash-card">
      <div className="flash-card-inner">
        <span className="flash-icon">{appliance.icon}</span>
        <div className="flash-info">
          <strong>{appliance.name}</strong>
          <span>{appliance.wattage}W • {appliance.annualKwh} kWh/yr</span>
          <span className="flash-fact">💡 {appliance.funFact || appliance.description?.slice(0, 80) + '...'}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Achievement Toast ───
function AchievementToast({ achievement, visible }) {
  if (!visible || !achievement) return null;
  return (
    <div className="achievement-toast">
      <div className="achievement-icon">{achievement.icon}</div>
      <div className="achievement-info">
        <div className="achievement-label">Achievement Unlocked!</div>
        <div className="achievement-title">{achievement.title}</div>
        <div className="achievement-desc">{achievement.description}</div>
      </div>
    </div>
  );
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

// ─── Full Quiz Modal (post-completion) ───
function FullQuizModal({ questions, onComplete }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [consecutiveWrong, setConsecutiveWrong] = useState(0);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [orderedQuestions, setOrderedQuestions] = useState([]);

  // Initialize with adaptive ordering
  useEffect(() => {
    const sorted = [...questions].sort((a, b) => (a.difficulty || 1) - (b.difficulty || 1));
    setOrderedQuestions(sorted);
  }, [questions]);

  if (orderedQuestions.length === 0) return null;
  const question = orderedQuestions[currentIdx];
  if (!question) return null;

  const total = orderedQuestions.length;
  const pct = total > 0 ? Math.round((currentIdx / total) * 100) : 0;

  const handleAnswer = (idx) => {
    if (answered) return;
    setSelectedIndex(idx);
    setAnswered(true);

    const isCorrect = idx === question.correctIndex;
    if (isCorrect) {
      playCorrectSound();
      setScore(s => s + 1);
      setConsecutiveCorrect(c => c + 1);
      setConsecutiveWrong(0);
    } else {
      playWrongSound();
      setConsecutiveWrong(c => c + 1);
      setConsecutiveCorrect(0);

      // Adaptive: if 2+ wrong, reorder remaining to put easier ones first
      if (consecutiveWrong >= 1) {
        setOrderedQuestions(prev => {
          const done = prev.slice(0, currentIdx + 1);
          const remaining = prev.slice(currentIdx + 1).sort((a, b) => (a.difficulty || 1) - (b.difficulty || 1));
          return [...done, ...remaining];
        });
      }
    }

    // Auto advance after delay
    setTimeout(() => {
      setAnswered(false);
      setSelectedIndex(null);
      if (currentIdx + 1 >= total) {
        const finalScore = isCorrect ? score + 1 : score;
        onComplete(finalScore, total);
      } else {
        setCurrentIdx(i => i + 1);
      }
    }, 2500);
  };

  return (
    <div className="quiz-overlay">
      <div className="quiz-modal full-quiz">
        <div className="quiz-header">
          <span className="quiz-icon">🧠</span>
          <h3>Energy Knowledge Quiz</h3>
        </div>
        <div className="quiz-progress-bar">
          <div className="quiz-progress-fill" style={{ width: `${((currentIdx + 1) / total) * 100}%` }} />
          <span className="quiz-progress-text">Question {currentIdx + 1} / {total}</span>
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
                onClick={() => handleAnswer(i)}
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
              ? '✅ Correct!'
              : `❌ Wrong! The answer is ${String.fromCharCode(65 + question.correctIndex)}.`}
            <p className="quiz-explanation">{question.explanation}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Level Completed Screen ───
function LevelCompleteScreen({ score, total, stars, onContinue }) {
  const pct = Math.round((score / total) * 100);

  return (
    <div className="level-complete-overlay">
      <div className="level-complete-modal">
        <div className="confetti-container">
          {Array.from({ length: 30 }).map((_, i) => (
            <div key={i} className="confetti-piece" style={{
              '--delay': `${Math.random() * 2}s`,
              '--x': `${Math.random() * 100}%`,
              '--rotation': `${Math.random() * 360}deg`,
              '--color': ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'][i % 6],
            }} />
          ))}
        </div>
        <div className="lc-celebration">🎉</div>
        <h2 className="lc-title">Level Completed!</h2>
        <p className="lc-subtitle">Home Energy Audit Complete</p>

        <div className="lc-stars">
          {[1, 2, 3].map(s => (
            <span key={s} className={`lc-star ${s <= stars ? 'earned' : 'empty'}`}
              style={{ animationDelay: `${s * 0.3}s` }}>
              ⭐
            </span>
          ))}
        </div>

        <div className="lc-score">
          <div className="lc-score-number">{score}/{total}</div>
          <div className="lc-score-label">Correct Answers ({pct}%)</div>
        </div>

        <div className="lc-rating-label">
          {stars === 3 && '🏆 Outstanding! You\'re an Energy Expert!'}
          {stars === 2 && '👍 Great Work! Keep learning!'}
          {stars === 1 && '💪 Good effort! Try again to improve!'}
        </div>

        <button className="lc-continue-btn" onClick={onContinue}>
          Continue →
        </button>
      </div>
    </div>
  );
}

// ─── Stars & Badge Display ───
function RewardsDisplay({ stars }) {
  return (
    <div className="stars-display">
      {'⭐'.repeat(Math.min(stars, 20))} {stars > 0 && <span className="star-count">{stars}</span>}
    </div>
  );
}

// ─── Day/Night Cycle ───
function DayNightCycle() {
  const lightRef = useRef();
  const ambientRef = useRef();
  const hemiRef = useRef();

  useEffect(() => {
    // Run a slow cycle
    let frame;
    const cycle = () => {
      const t = (Date.now() % 300000) / 300000; // 5-min cycle
      const brightness = 0.3 + Math.sin(t * Math.PI * 2) * 0.2;
      const warmth = 0.8 + Math.sin(t * Math.PI * 2) * 0.2;
      
      if (ambientRef.current) {
        ambientRef.current.intensity = brightness + 0.1;
      }
      if (lightRef.current) {
        lightRef.current.intensity = warmth;
        const angle = t * Math.PI * 2;
        lightRef.current.position.set(
          10 * Math.cos(angle),
          12 + 3 * Math.sin(angle),
          10 * Math.sin(angle)
        );
      }
      if (hemiRef.current) {
        hemiRef.current.intensity = brightness;
      }
      frame = requestAnimationFrame(cycle);
    };
    cycle();
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <>
      <ambientLight ref={ambientRef} intensity={0.4} />
      <directionalLight
        ref={lightRef}
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
      <hemisphereLight ref={hemiRef} args={['#b1e1ff', '#b97a20', 0.3]} />
    </>
  );
}

// ─── 3D Scene Content ───
function SceneContent({ onApplianceClick, onRoomChange, onNearestChange, onInteract, activeApplianceId, interactedAppliances }) {
  return (
    <>
      <DayNightCycle />
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
  const [isCinematic, setIsCinematic] = useState(false);

  // Flash card state
  const [flashCard, setFlashCard] = useState(null);
  const [showFlash, setShowFlash] = useState(false);

  // Quiz states
  const [showFullQuiz, setShowFullQuiz] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizTotal, setQuizTotal] = useState(0);
  const [finalStars, setFinalStars] = useState(0);
  const [showLevelComplete, setShowLevelComplete] = useState(false);

  // Rewards
  const [stars, setStars] = useState(0);

  // Achievements
  const [unlockedAchievements, setUnlockedAchievements] = useState(new Set());
  const [currentAchievement, setCurrentAchievement] = useState(null);
  const [showAchievement, setShowAchievement] = useState(false);

  // Ambient music
  useAmbientMusic();

  // Achievement checker
  const triggerAchievement = useCallback((triggerId) => {
    const achievement = ACHIEVEMENTS.find(a => a.trigger === triggerId);
    if (!achievement || unlockedAchievements.has(achievement.id)) return;

    setUnlockedAchievements(prev => {
      const next = new Set(prev);
      next.add(achievement.id);
      return next;
    });
    playAchievementSound();
    setCurrentAchievement(achievement);
    setShowAchievement(true);
    setTimeout(() => setShowAchievement(false), 4000);
  }, [unlockedAchievements]);

  const handleInteract = useCallback((applianceId) => {
    if (activeAppliance || showFullQuiz || showLevelComplete) return;
    const data = APPLIANCE_DATA[applianceId];
    if (!data) return;

    playInteractSound();
    setActiveAppliance(data);
    speak(data.description, data.voiceRate || 0.9, data.voicePitch || 1.05);

    // Cinematic camera zoom
    const pos = APPLIANCE_POSITIONS?.[applianceId];
    if (pos) {
      cameraMode.cinematic = true;
      cameraMode.targetX = pos.pos[0];
      cameraMode.targetY = pos.pos[1];
      cameraMode.targetZ = pos.pos[2];
    }
    setIsCinematic(true);

    // Mark as interacted
    setInteracted(prev => {
      const next = new Set(prev);
      const wasNew = !next.has(applianceId);
      next.add(applianceId);

      if (wasNew) {
        setStars(s => s + 1);
        const newCount = next.size;

        // Achievement triggers
        if (newCount === 1) triggerAchievement('interact_1');
        if (newCount === 3) triggerAchievement('interact_3');
        if (newCount === 6) triggerAchievement('interact_6');
        if (newCount === 9) triggerAchievement('interact_9');
        if (newCount === 12) triggerAchievement('interact_12');
        if (newCount === 15) triggerAchievement('interact_15');

        // Trigger full quiz after all 12 interactions
        if (newCount >= INTERACTABLE_IDS.length) {
          setTimeout(() => {
            setShowFullQuiz(true);
          }, 2000);
        }
      }
      return next;
    });
  }, [activeAppliance, showFullQuiz, showLevelComplete, triggerAchievement]);

  const handleApplianceClick = useCallback((applianceId) => {
    handleInteract(applianceId);
  }, [handleInteract]);

  const handleCloseBubble = useCallback(() => {
    stopSpeech();
    const closedAppliance = activeAppliance;
    setActiveAppliance(null);

    // Reset cinematic camera
    cameraMode.cinematic = false;
    setIsCinematic(false);

    // Show memory flash card
    if (closedAppliance) {
      setFlashCard(closedAppliance);
      setShowFlash(true);
      setTimeout(() => setShowFlash(false), 3500);
    }
  }, [activeAppliance]);

  const handleQuizComplete = useCallback((score, total) => {
    setQuizScore(score);
    setQuizTotal(total);
    setShowFullQuiz(false);
    setQuizCompleted(true);

    // Calculate stars
    const pct = (score / total) * 100;
    let earnedStars = 1;
    if (pct >= 90) earnedStars = 3;
    else if (pct >= 60) earnedStars = 2;
    setFinalStars(earnedStars);

    // Achievement for quiz performance
    if (pct === 100) triggerAchievement('quiz_perfect');
    if (earnedStars >= 3) triggerAchievement('quiz_3stars');

    playLevelCompleteSound();

    setTimeout(() => setShowLevelComplete(true), 500);
  }, [triggerAchievement]);

  const handleRoomChange = useCallback((room) => {
    setCurrentRoom(prev => prev !== room ? room : prev);
  }, []);

  const handleNearestChange = useCallback((id) => {
    setNearestAppliance(id);
  }, []);

  return (
    <div className="level1-container">
      {/* 3D Canvas */}
      <div className={`canvas-wrapper ${isCinematic ? 'cinematic-blur' : ''}`}>
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
      </div>

      {/* HUD */}
      <div className="level1-hud">
        <button className="hud-back-btn" onClick={() => navigate('/hub')}>← Back</button>
        <div className="hud-room-name">📍 {currentRoom}</div>
        <div className="hud-instructions">🏠 Home Audit Mission</div>
      </div>

      {/* Stars */}
      <RewardsDisplay stars={stars} />

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

      {/* Memory Flash Card */}
      <FlashCard appliance={flashCard} visible={showFlash} />

      {/* Achievement Toast */}
      <AchievementToast achievement={currentAchievement} visible={showAchievement} />

      {/* Full Quiz after all 12 interactions */}
      {showFullQuiz && (
        <FullQuizModal
          questions={QUIZ_QUESTIONS}
          onComplete={handleQuizComplete}
        />
      )}

      {/* Level Complete Screen */}
      {showLevelComplete && (
        <LevelCompleteScreen
          score={quizScore}
          total={quizTotal}
          stars={finalStars}
          onContinue={() => navigate('/hub')}
        />
      )}
    </div>
  );
}
