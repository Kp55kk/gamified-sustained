import React, { useState, useEffect, useRef, useCallback } from 'react';
import './SchoolCutscene.css';

// ─── Audio System (Web Audio API) ───
let audioCtx = null;
function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

// Classroom ambience — gentle low hum
function startClassroomAmbience() {
  try {
    const ctx = getAudioCtx();
    // Brown noise for classroom ambience
    const bufferSize = 2 * ctx.sampleRate;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.03, ctx.currentTime);
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, ctx.currentTime);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start();
    return { source, gain };
  } catch (e) { return null; }
}

function stopAmbience(ambience) {
  if (!ambience) return;
  try {
    ambience.gain.gain.exponentialRampToValueAtTime(0.001, getAudioCtx().currentTime + 0.5);
    setTimeout(() => { try { ambience.source.stop(); } catch(e) {} }, 600);
  } catch(e) {}
}

// Clapping sound effect
function playClappingSound() {
  try {
    const ctx = getAudioCtx();
    // Multiple quick bursts to simulate clapping
    for (let i = 0; i < 8; i++) {
      const bufferSize = ctx.sampleRate * 0.06;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let j = 0; j < bufferSize; j++) {
        data[j] = (Math.random() * 2 - 1) * Math.exp(-j / (bufferSize * 0.15));
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2000 + Math.random() * 1000, ctx.currentTime);
      filter.Q.setValueAtTime(0.5, ctx.currentTime);
      source.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      const startTime = ctx.currentTime + i * 0.18 + Math.random() * 0.04;
      gain.gain.setValueAtTime(0.08 + Math.random() * 0.04, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.15);
      source.start(startTime);
      source.stop(startTime + 0.2);
    }
  } catch(e) {}
}

// Positive chime sound
function playRewardChime() {
  try {
    const ctx = getAudioCtx();
    [523, 659, 784, 1047].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.15);
      gain.gain.setValueAtTime(0.08, ctx.currentTime + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 0.5);
      osc.start(ctx.currentTime + i * 0.15);
      osc.stop(ctx.currentTime + i * 0.15 + 0.5);
    });
  } catch(e) {}
}

// ─── Scene Data ───
const SCENES = [
  {
    id: 'transition',
    type: 'transition',
    text: 'Next Day…',
    duration: 2500,
  },
  {
    id: 'classroom',
    type: 'visual',
    visual: 'classroom',
    teacherDialogue: 'Yesterday, I asked all of you to practice saving energy at home…',
    duration: 4000,
  },
  {
    id: 'question',
    type: 'dialogue',
    teacherDialogue: 'How many of you turned OFF unnecessary appliances before leaving your house?',
    duration: 4000,
  },
  {
    id: 'silence',
    type: 'silence',
    description: 'Class is silent…',
    arjunRaises: true,
    duration: 4500,
  },
  {
    id: 'reaction',
    type: 'dialogue',
    teacherDialogue: 'Very good, Arjun!',
    teacherSmile: true,
    followUp: 'This is how good habits are formed — by practicing every day',
    duration: 5000,
  },
  {
    id: 'appreciation',
    type: 'appreciation',
    teacherDialogue: "Let's all appreciate Arjun",
    clapping: true,
    duration: 4500,
  },
  {
    id: 'reward',
    type: 'reward',
    teacherDialogue: 'This is for your effort and responsibility',
    chocolate: true,
    duration: 4000,
  },
  {
    id: 'message',
    type: 'dialogue',
    teacherDialogue: 'Saving energy is not a one-time task…',
    followUp: 'It should become a daily habit',
    important: true,
    duration: 5000,
  },
  {
    id: 'player',
    type: 'overlay',
    overlayText: 'Just like Arjun, you are building a habit',
    duration: 3500,
  },
  {
    id: 'final',
    type: 'dialogue',
    teacherDialogue: "Now let's understand how much energy we actually use…",
    transition: true,
    duration: 3500,
  },
];

// ─── Student desk component ───
function StudentDesk({ index, clapping, highlight }) {
  const studentEmojis = ['👦', '👧', '👦🏽', '👧🏻', '👦🏾', '👧🏽', '👦🏻', '👧🏾'];
  return (
    <div className={`sc-student ${clapping ? 'sc-clapping' : ''} ${highlight ? 'sc-highlight' : ''}`}
         style={{ animationDelay: `${index * 0.08}s` }}>
      <span className="sc-student-emoji">{studentEmojis[index % studentEmojis.length]}</span>
      {clapping && <span className="sc-clap-emoji">👏</span>}
    </div>
  );
}

// ════════════════════════════════════════════════════════
//  SCHOOL CUTSCENE COMPONENT
// ════════════════════════════════════════════════════════
export default function SchoolCutscene({ onComplete }) {
  const [currentScene, setCurrentScene] = useState(0);
  const [scenePhase, setScenePhase] = useState('enter'); // enter, active, exit
  const [handRaised, setHandRaised] = useState(false);
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);
  const ambienceRef = useRef(null);
  const timerRef = useRef(null);

  const scene = SCENES[currentScene];

  // Start classroom ambience
  useEffect(() => {
    ambienceRef.current = startClassroomAmbience();
    return () => {
      stopAmbience(ambienceRef.current);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Auto-advance scenes
  useEffect(() => {
    if (!autoPlay || !scene) return;
    setScenePhase('enter');
    setShowFollowUp(false);
    setHandRaised(false);

    // Enter animation
    const enterTimer = setTimeout(() => setScenePhase('active'), 400);

    // Scene-specific effects
    let effectTimer;
    if (scene.id === 'silence') {
      effectTimer = setTimeout(() => setHandRaised(true), 2000);
    }
    if (scene.followUp) {
      effectTimer = setTimeout(() => setShowFollowUp(true), scene.duration * 0.5);
    }
    if (scene.clapping) {
      effectTimer = setTimeout(() => playClappingSound(), 800);
    }
    if (scene.chocolate) {
      effectTimer = setTimeout(() => playRewardChime(), 600);
    }

    // Auto advance
    timerRef.current = setTimeout(() => {
      setScenePhase('exit');
      setTimeout(() => {
        if (currentScene < SCENES.length - 1) {
          setCurrentScene(prev => prev + 1);
        } else {
          // Cutscene complete
          stopAmbience(ambienceRef.current);
          onComplete();
        }
      }, 500);
    }, scene.duration);

    return () => {
      clearTimeout(enterTimer);
      if (effectTimer) clearTimeout(effectTimer);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentScene, autoPlay]);

  // Skip handler
  const handleSkip = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    stopAmbience(ambienceRef.current);
    onComplete();
  }, [onComplete]);

  // Manual advance
  const handleNext = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setScenePhase('exit');
    setTimeout(() => {
      if (currentScene < SCENES.length - 1) {
        setCurrentScene(prev => prev + 1);
      } else {
        stopAmbience(ambienceRef.current);
        onComplete();
      }
    }, 300);
  }, [currentScene, onComplete]);

  if (!scene) return null;

  // Progress percentage
  const progress = ((currentScene + 1) / SCENES.length) * 100;

  return (
    <div className="sc-container" onClick={handleNext}>
      {/* Background */}
      <div className="sc-background">
        <div className="sc-bg-gradient" />
        <div className="sc-blackboard">
          <div className="sc-blackboard-text">Save Energy 🌱</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="sc-progress-bar">
        <div className="sc-progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Skip button */}
      <button className="sc-skip-btn" onClick={(e) => { e.stopPropagation(); handleSkip(); }}>
        Skip ⏭️
      </button>

      {/* ═══ SCENE 1: TRANSITION ═══ */}
      {scene.type === 'transition' && (
        <div className={`sc-scene sc-transition ${scenePhase}`}>
          <div className="sc-transition-text">{scene.text}</div>
          <div className="sc-transition-icon">🏫</div>
          <div className="sc-transition-sub">Walking into school…</div>
        </div>
      )}

      {/* ═══ SCENE 2: CLASSROOM SETUP ═══ */}
      {scene.type === 'visual' && scene.visual === 'classroom' && (
        <div className={`sc-scene sc-classroom ${scenePhase}`}>
          <div className="sc-classroom-scene">
            {/* Teacher */}
            <div className="sc-teacher">
              <div className="sc-teacher-avatar">🧑‍🏫</div>
              <div className="sc-teacher-bubble">
                <span className="sc-bubble-icon">💬</span>
                <span className="sc-bubble-text">{scene.teacherDialogue}</span>
              </div>
            </div>
            {/* Students */}
            <div className="sc-students-grid">
              {Array.from({ length: 8 }).map((_, i) => (
                <StudentDesk key={i} index={i} />
              ))}
            </div>
            {/* Arjun */}
            <div className="sc-arjun-seat">
              <span className="sc-arjun-emoji">🧑🏽</span>
              <span className="sc-arjun-label">Arjun</span>
            </div>
          </div>
        </div>
      )}

      {/* ═══ SCENE 3 & 5 & 8 & 10: DIALOGUE ═══ */}
      {scene.type === 'dialogue' && (
        <div className={`sc-scene sc-dialogue ${scenePhase}`}>
          <div className="sc-classroom-scene">
            <div className={`sc-teacher ${scene.teacherSmile ? 'sc-smile' : ''}`}>
              <div className="sc-teacher-avatar">
                {scene.teacherSmile ? '😊' : '🧑‍🏫'}
              </div>
              <div className={`sc-teacher-bubble ${scene.important ? 'sc-important' : ''}`}>
                <span className="sc-bubble-icon">💬</span>
                <span className="sc-bubble-text">{scene.teacherDialogue}</span>
              </div>
              {showFollowUp && scene.followUp && (
                <div className="sc-teacher-followup">
                  <span className="sc-bubble-icon">💬</span>
                  <span className="sc-bubble-text">{scene.followUp}</span>
                </div>
              )}
            </div>
            <div className="sc-students-grid">
              {Array.from({ length: 8 }).map((_, i) => (
                <StudentDesk key={i} index={i} />
              ))}
            </div>
            <div className="sc-arjun-seat">
              <span className="sc-arjun-emoji">🧑🏽</span>
              <span className="sc-arjun-label">Arjun</span>
            </div>
            {scene.transition && (
              <div className="sc-transition-hint">
                <span>⚡ Transitioning to Phase 2 — Energy Meter</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ SCENE 4: SILENCE MOMENT ═══ */}
      {scene.type === 'silence' && (
        <div className={`sc-scene sc-silence ${scenePhase}`}>
          <div className="sc-classroom-scene">
            <div className="sc-teacher">
              <div className="sc-teacher-avatar">🧑‍🏫</div>
              <div className="sc-teacher-waiting">
                <span className="sc-waiting-dots">...</span>
                <span className="sc-waiting-text">Waiting for response</span>
              </div>
            </div>
            <div className="sc-students-grid sc-silent">
              {Array.from({ length: 8 }).map((_, i) => (
                <StudentDesk key={i} index={i} />
              ))}
            </div>
            <div className={`sc-arjun-seat ${handRaised ? 'sc-hand-raised' : ''}`}>
              <span className="sc-arjun-emoji">
                {handRaised ? '🙋🏽‍♂️' : '🧑🏽'}
              </span>
              <span className="sc-arjun-label">Arjun</span>
              {handRaised && (
                <div className="sc-focus-ring" />
              )}
            </div>
            {!handRaised && (
              <div className="sc-silence-indicator">
                <span className="sc-silence-text">No one raises their hand…</span>
              </div>
            )}
            {handRaised && (
              <div className="sc-focus-text">
                <span>✨ Arjun raises his hand!</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ SCENE 6: APPRECIATION ═══ */}
      {scene.type === 'appreciation' && (
        <div className={`sc-scene sc-appreciation ${scenePhase}`}>
          <div className="sc-classroom-scene">
            <div className="sc-teacher sc-smile">
              <div className="sc-teacher-avatar">😊</div>
              <div className="sc-teacher-bubble">
                <span className="sc-bubble-icon">💬</span>
                <span className="sc-bubble-text">{scene.teacherDialogue}</span>
              </div>
            </div>
            <div className="sc-students-grid sc-clapping-grid">
              {Array.from({ length: 8 }).map((_, i) => (
                <StudentDesk key={i} index={i} clapping={true} />
              ))}
            </div>
            <div className="sc-arjun-seat sc-shy">
              <span className="sc-arjun-emoji">😊</span>
              <span className="sc-arjun-label">Arjun</span>
              <div className="sc-arjun-glow" />
            </div>
            <div className="sc-clap-particles">
              {Array.from({ length: 6 }).map((_, i) => (
                <span key={i} className="sc-clap-particle" style={{
                  '--delay': `${i * 0.15}s`,
                  '--x': `${20 + Math.random() * 60}%`,
                }}>👏</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══ SCENE 7: REWARD ═══ */}
      {scene.type === 'reward' && (
        <div className={`sc-scene sc-reward ${scenePhase}`}>
          <div className="sc-reward-scene">
            <div className="sc-teacher sc-smile">
              <div className="sc-teacher-avatar">😊</div>
              <div className="sc-teacher-bubble">
                <span className="sc-bubble-icon">💬</span>
                <span className="sc-bubble-text">{scene.teacherDialogue}</span>
              </div>
            </div>
            <div className="sc-reward-moment">
              <div className="sc-chocolate-icon">🍫</div>
              <div className="sc-reward-arrow">→</div>
              <div className="sc-arjun-receiving">
                <span className="sc-arjun-emoji">😊</span>
                <span className="sc-arjun-label">Arjun</span>
              </div>
            </div>
            <div className="sc-reward-sparkles">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className="sc-sparkle" style={{
                  '--delay': `${i * 0.2}s`,
                  '--x': `${10 + i * 20}%`,
                }}>✨</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══ SCENE 9: OVERLAY TEXT ═══ */}
      {scene.type === 'overlay' && (
        <div className={`sc-scene sc-overlay ${scenePhase}`}>
          <div className="sc-overlay-content">
            <div className="sc-overlay-icon">🌟</div>
            <div className="sc-overlay-text">{scene.overlayText}</div>
            <div className="sc-overlay-sub">Keep going — every habit counts! 🌱</div>
          </div>
        </div>
      )}

      {/* Click to continue hint */}
      <div className="sc-click-hint">
        Click anywhere to continue →
      </div>
    </div>
  );
}
