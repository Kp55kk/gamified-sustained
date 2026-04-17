import React, { useState, useCallback, Suspense, useEffect, useRef } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import House from './House';
import Appliances from './Appliances';
import Player, { cameraMode, playerState } from './Player';
import { APPLIANCE_DATA, APPLIANCE_POSITIONS, INTERACTABLE_IDS, QUIZ_QUESTIONS, ACHIEVEMENTS } from './applianceData';
import { useGame } from '../context/GameContext';
import { getTranslation, getVoiceLocale } from '../translations/index';
import LevelIntro from './LevelIntro';
import './Level1.css';

// ─── Speech Engine (ENGLISH ONLY — FIX 3) ───
let isSpeakingGlobal = false;
function speak(text, langCode = 'en', rate = 0.9, pitch = 1.05, onEnd) {
  // FIX 3: Only play voiceover for English
  if (langCode !== 'en') {
    if (onEnd) onEnd();
    return;
  }
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = rate;
    u.pitch = pitch;
    u.lang = getVoiceLocale(langCode);
    isSpeakingGlobal = true;
    u.onend = () => { isSpeakingGlobal = false; if (onEnd) onEnd(); };
    u.onerror = () => { isSpeakingGlobal = false; if (onEnd) onEnd(); };
    window.speechSynthesis.speak(u);
  }
}
function stopSpeech() {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  isSpeakingGlobal = false;
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
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(523, ctx.currentTime);
    osc.frequency.setValueAtTime(659, ctx.currentTime + 0.08);
    osc.frequency.setValueAtTime(784, ctx.currentTime + 0.16);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.4);
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
function playCoinSound() {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(987, ctx.currentTime);
    osc.frequency.setValueAtTime(1319, ctx.currentTime + 0.08);
    osc.frequency.setValueAtTime(1568, ctx.currentTime + 0.16);
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.45);
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

// ─── Ambient Music (disabled) ───
function useAmbientMusic() {}

// ─── JS Emoji Icons (replacing Unicode emoji) ───
const ICONS = {
  bulb: '\u{1F4A1}',
  brain: '\u{1F9E0}',
  check: '\u{2705}',
  cross: '\u{274C}',
  star: '\u{2B50}',
  fire: '\u{1F525}',
  trophy: '\u{1F3C6}',
  party: '\u{1F389}',
  thumbsUp: '\u{1F44D}',
  muscle: '\u{1F4AA}',
  speaker: '\u{1F50A}',
  house: '\u{1F3E0}',
  pin: '\u{1F4CD}',
  search: '\u{1F50D}',
  grad: '\u{1F393}',
  runner: '\u{1F3C3}',
  zap: '\u{26A1}',
  leaf: '\u{1F33F}',
  info: '\u{2139}\u{FE0F}',
  think: '\u{1F914}',
  cry: '\u{1F622}',
  wave: '\u{1F44B}',
  couch: '\u{1F6CB}\u{FE0F}',
  bed: '\u{1F6CF}\u{FE0F}',
  cook: '\u{1F373}',
  shower: '\u{1F6BF}',
  close: '\u{2715}',
  checkBox: '\u{2705}',
  emptyBox: '\u{2B1C}',
  mouse: '\u{1F5B1}\u{FE0F}',
  coin: '\u{1FA99}',
  sparkles: '\u{2728}',
  gift: '\u{1F381}',
  tada: '\u{1F389}',
};

// ─── Flash Card (Memory Boost) ───
function FlashCard({ appliance, visible, t }) {
  if (!visible || !appliance) return null;
  const at = t?.appliances?.[appliance.id];
  return (
    <div className="flash-card">
      <div className="flash-card-inner">
        <span className="flash-icon">{appliance.icon}</span>
        <div className="flash-info">
          <strong>{at?.name || appliance.name}</strong>
          <span>{appliance.wattage}W {ICONS.zap} {appliance.annualKwh} kWh/yr</span>
          <span className="flash-fact">{ICONS.bulb} {at?.funFact || appliance.funFact || appliance.description?.slice(0, 80) + '...'}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Achievement Toast ───
function AchievementToast({ achievement, visible, t }) {
  if (!visible || !achievement) return null;
  const at = t?.achievements?.[achievement.id];
  return (
    <div className="achievement-toast">
      <div className="achievement-icon">{achievement.icon}</div>
      <div className="achievement-info">
        <div className="achievement-label">{t?.achievements?.unlocked || `${ICONS.trophy} Achievement Unlocked!`}</div>
        <div className="achievement-title">{at?.title || achievement.title}</div>
        <div className="achievement-desc">{at?.description || achievement.description}</div>
      </div>
    </div>
  );
}

// ─── Category color mapping for pills ───
const CATEGORY_COLORS = {
  'Cooling': { bg: '#dbeafe', color: '#2563eb' },
  'Lighting': { bg: '#fef9c3', color: '#a16207' },
  'Electronics': { bg: '#e0e7ff', color: '#4338ca' },
  'Heating': { bg: '#fee2e2', color: '#dc2626' },
  'Heating/Cooking': { bg: '#fee2e2', color: '#dc2626' },
  'Cooling/Preservation': { bg: '#dbeafe', color: '#2563eb' },
  'Motors/Laundry': { bg: '#ede9fe', color: '#7c3aed' },
  'Motors/Cooking': { bg: '#ede9fe', color: '#7c3aed' },
  'Electronics/Comms': { bg: '#e0e7ff', color: '#4338ca' },
  'Electronics/Entertainment': { bg: '#e0e7ff', color: '#4338ca' },
  'Electronics/Charging': { bg: '#e0e7ff', color: '#4338ca' },
};

// ─── Coin Reward Popup ───
function CoinRewardPopup({ visible, applianceName, points }) {
  if (!visible) return null;
  return (
    <div className="coin-reward-popup">
      <div className="coin-reward-inner">
        <div className="coin-reward-coin">{ICONS.coin}</div>
        <div className="coin-reward-sparkles">{ICONS.sparkles}</div>
        <div className="coin-reward-text">+{points} Coins!</div>
        <div className="coin-reward-sub">You discovered <strong>{applianceName}</strong>!</div>
      </div>
    </div>
  );
}

// ─── Points Display (Top of Screen) ───
function PointsDisplay({ points, totalDiscovered, total }) {
  return (
    <div className="points-display">
      <div className="points-display-coin">{ICONS.coin}</div>
      <div className="points-display-info">
        <div className="points-display-value">{points}</div>
        <div className="points-display-label">Points</div>
      </div>
      <div className="points-display-divider" />
      <div className="points-display-info">
        <div className="points-display-value">{totalDiscovered}/{total}</div>
        <div className="points-display-label">Found</div>
      </div>
    </div>
  );
}

// ─── Full-Screen Appliance Popup (Kid-Friendly, Colorful) ───
function ApplianceTooltip({ appliance, onClose, t, langCode }) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [closing, setClosing] = useState(false);

  const data = appliance ? (APPLIANCE_DATA[appliance.id] || appliance) : null;
  const at = appliance ? t?.appliances?.[appliance.id] : null;

  // ESC to close
  useEffect(() => {
    if (!appliance) return;
    const handleEsc = (e) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [appliance]);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => { setClosing(false); onClose(); }, 200);
  };

  if (!appliance || !data) return null;

  const catColors = CATEGORY_COLORS[data.category] || { bg: '#f1f5f9', color: '#475569' };
  const description = at?.display_text || data.description || '';
  const funFact = at?.funFact || data.funFact || '';
  const energyTip = at?.energyTip || data.researchNote || '';
  const annualKwh = data.annualKwh || String.fromCharCode(8212);
  const co2PerYear = data.co2PerYear || String.fromCharCode(8212);

  const usageLine = data.usePerDay && data.daysPerYear
    ? `${data.usePerDay} ${ICONS.zap} ${data.daysPerYear} ${t?.ui?.daysUsed || 'days/yr'}`
    : data.usePerDay || '';

  // Full voiceover
  const handleReplay = () => {
    if (langCode !== 'en') return;
    setIsSpeaking(true);
    const fullVoice = `${data.name}. ${data.wattage} watts. ${usageLine}. ${at?.voice_text || data.description}`;
    speak(fullVoice, langCode, 0.85, data.voicePitch || 1.05, () => setIsSpeaking(false));
  };

  return (
    <div className={`popup-overlay-fullscreen ${closing ? 'closing' : ''}`} onClick={handleClose}>
      <div
        className={`popup-card-fullscreen ${closing ? 'closing' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating decorative elements */}
        <div className="popup-fs-deco popup-fs-deco-1" />
        <div className="popup-fs-deco popup-fs-deco-2" />
        <div className="popup-fs-deco popup-fs-deco-3" />

        {/* Close button */}
        <button className="popup-fs-close" onClick={handleClose}>{ICONS.close}</button>

        {/* Scrollable content */}
        <div className="popup-fs-scroll">
          {/* ── Section 1: Identity ── */}
          <div className="popup-fs-icon-wrap">
            <div className="popup-fs-icon">{data.icon || ICONS.zap}</div>
          </div>
          <div className="popup-fs-name">{at?.name || data.name}</div>
          <div className="popup-fs-category" style={{ background: catColors.bg, color: catColors.color }}>
            {data.category}
          </div>

          {/* ── Section 2: Power & Usage ── */}
          <div className="popup-fs-section">
            <div className="popup-fs-section-label">{ICONS.zap} POWER & USAGE</div>
            <div className="popup-fs-wattage">{data.wattage}W</div>
            {usageLine && <div className="popup-fs-usage">{usageLine}</div>}
          </div>

          {/* ── Section 3: About ── */}
          {description && (
            <div className="popup-fs-section">
              <div className="popup-fs-section-label">{ICONS.info} ABOUT</div>
              <div className="popup-fs-description">{description}</div>
            </div>
          )}

          {/* ── Section 4: Energy Impact ── */}
          <div className="popup-fs-section">
            <div className="popup-fs-section-label">{ICONS.leaf} ENERGY IMPACT</div>
            <div className="popup-fs-stats-row">
              <div className="popup-fs-stat">
                <div className="popup-fs-stat-value">{annualKwh}</div>
                <div className="popup-fs-stat-label">{t?.ui?.annualUsage || 'kWh/year'}</div>
              </div>
              <div className="popup-fs-stat">
                <div className="popup-fs-stat-value">{co2PerYear}</div>
                <div className="popup-fs-stat-label">{t?.ui?.co2Emissions || 'kg CO\u2082/yr'}</div>
              </div>
            </div>
          </div>

          {/* ── Section 5: Energy Saving Tip ── */}
          {energyTip && (
            <div className="popup-fs-section">
              <div className="popup-fs-tip-box">
                <div className="popup-fs-tip-label">{ICONS.bulb} {t?.ui?.energySavingTip || 'Energy Saving Tip'}</div>
                <div className="popup-fs-tip-text">{energyTip}</div>
              </div>
            </div>
          )}

          {/* ── Section 6: Fun Fact ── */}
          {funFact && (
            <div className="popup-fs-section">
              <div className="popup-fs-funfact-box">
                <div className="popup-fs-funfact-label">{ICONS.think} {t?.ui?.didYouKnow || 'Did You Know?'}</div>
                <div className="popup-fs-funfact-text">{funFact}</div>
              </div>
            </div>
          )}

          {/* ── Bottom row ── */}
          <div className="popup-fs-bottom-row">
            {langCode === 'en' && (
              <button
                className={`popup-fs-speaker ${isSpeaking ? 'speaking' : ''}`}
                onClick={handleReplay}
              >
                {ICONS.speaker} Listen
              </button>
            )}
            <button className="popup-fs-close-btn" onClick={handleClose}>
              Got it! {ICONS.thumbsUp}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Room icons (JS strings) ───
const ROOM_ICONS = {
  'Living Room': ICONS.couch,
  'Bedroom': ICONS.bed,
  'Kitchen': ICONS.cook,
  'Bathroom': ICONS.shower,
};

// ─── Room Entry Banner (Fix 4: small elegant pill, slides down, fades out in 2s) ───
function RoomEntryBanner({ room, visible, t }) {
  if (!visible || !room) return null;
  const rt = t?.rooms?.[room];
  const icon = ROOM_ICONS[room] || ICONS.pin;
  return (
    <div className="room-entry-banner">
      <span className="room-entry-icon">{icon}</span>
      <span className="room-entry-text">{rt?.name?.replace('📍 ', '') || room}</span>
    </div>
  );
}

// ─── Arjun Thought Bubble ───
function ThoughtBubble({ text, visible }) {
  if (!visible || !text) return null;
  return (
    <div className="thought-bubble">
      <div className="thought-bubble-content">{text}</div>
      <div className="thought-bubble-tail">
        <div className="thought-tail-dot" />
        <div className="thought-tail-dot small" />
      </div>
    </div>
  );
}

// ─── Progress Checklist Panel ───
function ChecklistPanel({ interacted, isOpen, onToggle, t }) {
  const count = interacted.size;
  const total = INTERACTABLE_IDS.length;

  return (
    <div className={`checklist-panel ${isOpen ? 'open' : ''}`}>
      <button className="checklist-toggle" onClick={onToggle}>
        {isOpen ? '▶' : '◀'} {count}/{total}
      </button>
      {isOpen && (
        <div className="checklist-content">
          <h3 className="checklist-title">{t?.ui?.homeAuditMission || `${ICONS.house} Home Audit Mission`}</h3>
          <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: `${(count / total) * 100}%` }} />
            <span className="progress-text">{count} / {total} {t?.ui?.appliances || 'Appliances'}</span>
          </div>
          <div className="checklist-items">
            {INTERACTABLE_IDS.map((id) => {
              const data = APPLIANCE_DATA[id];
              if (!data) return null;
              const done = interacted.has(id);
              const at = t?.appliances?.[id];
              return (
                <div key={id} className={`checklist-item ${done ? 'done' : ''}`}>
                  <span className="check-mark">{done ? ICONS.checkBox : ICONS.emptyBox}</span>
                  <span className="check-icon">{data.icon}</span>
                  <span className="check-name">{at?.name || data.name}</span>
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
function FullQuizModal({ questions, onComplete, t }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [consecutiveWrong, setConsecutiveWrong] = useState(0);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [orderedQuestions, setOrderedQuestions] = useState([]);

  useEffect(() => {
    const sorted = [...questions].sort((a, b) => (a.difficulty || 1) - (b.difficulty || 1));
    setOrderedQuestions(sorted);
  }, [questions]);

  if (orderedQuestions.length === 0) return null;
  const question = orderedQuestions[currentIdx];
  if (!question) return null;

  const total = orderedQuestions.length;

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

      if (consecutiveWrong >= 1) {
        setOrderedQuestions(prev => {
          const done = prev.slice(0, currentIdx + 1);
          const remaining = prev.slice(currentIdx + 1).sort((a, b) => (a.difficulty || 1) - (b.difficulty || 1));
          return [...done, ...remaining];
        });
      }
    }

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
          <span className="quiz-icon">{ICONS.brain}</span>
          <h3>{t?.quiz?.title || 'Energy Knowledge Quiz'}</h3>
        </div>
        <div className="quiz-progress-bar">
          <div className="quiz-progress-fill" style={{ width: `${((currentIdx + 1) / total) * 100}%` }} />
          <span className="quiz-progress-text">{t?.quiz?.question || 'Question'} {currentIdx + 1} / {total}</span>
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
              <button key={i} className={cls} onClick={() => handleAnswer(i)} disabled={answered}>
                {String.fromCharCode(65 + i)}. {opt}
              </button>
            );
          })}
        </div>
        {answered && (
          <div className={`quiz-feedback ${selectedIndex === question.correctIndex ? 'correct' : 'wrong'}`}>
            {selectedIndex === question.correctIndex
              ? (t?.quiz?.correct || `${ICONS.check} Correct!`)
              : `${t?.quiz?.wrongPrefix || `${ICONS.cross} Wrong! The answer is`} ${String.fromCharCode(65 + question.correctIndex)}.`}
            <p className="quiz-explanation">{question.explanation}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Level Completed Screen ───
function LevelCompleteScreen({ score, total, stars, onContinue, t }) {
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
        <div className="lc-celebration">{ICONS.party}</div>
        <h2 className="lc-title">{t?.rewards?.levelCompleted || 'Level Completed!'}</h2>
        <p className="lc-subtitle">{t?.rewards?.homeAuditComplete || 'Home Energy Audit Complete'}</p>

        <div className="lc-stars">
          {[1, 2, 3].map(s => (
            <span key={s} className={`lc-star ${s <= stars ? 'earned' : 'empty'}`}
              style={{ animationDelay: `${s * 0.3}s` }}>
              {ICONS.star}
            </span>
          ))}
        </div>

        <div className="lc-score">
          <div className="lc-score-number">{score}/{total}</div>
          <div className="lc-score-label">{t?.rewards?.correctAnswers || 'Correct Answers'} ({pct}%)</div>
        </div>

        <div className="lc-rating-label">
          {stars === 3 && (t?.rewards?.outstanding || `${ICONS.trophy} Outstanding! You're an Energy Expert!`)}
          {stars === 2 && (t?.rewards?.greatWork || `${ICONS.thumbsUp} Great Work! Keep learning!`)}
          {stars === 1 && (t?.rewards?.goodEffort || `${ICONS.muscle} Good effort! Try again to improve!`)}
        </div>

        <button className="lc-continue-btn" onClick={onContinue}>
          {t?.rewards?.continue || 'Continue →'}
        </button>
      </div>
    </div>
  );
}

// ─── Stars & Badge Display ───
function RewardsDisplay({ stars }) {
  return (
    <div className="stars-display">
      {ICONS.star.repeat(Math.min(stars, 20))} {stars > 0 && <span className="star-count">{stars}</span>}
    </div>
  );
}

// ─── Warm Evening Lighting (Fix 4: inviting Indian home feel) ───
function WarmLighting() {
  const lightRef = useRef();
  const ambientRef = useRef();
  const hemiRef = useRef();

  useEffect(() => {
    let frame;
    const cycle = () => {
      const t = (Date.now() % 600000) / 600000; // slower cycle
      // Warm evening: higher baseline, subtle variation
      const brightness = 0.45 + Math.sin(t * Math.PI * 2) * 0.08;
      const warmth = 1.0 + Math.sin(t * Math.PI * 2) * 0.15;
      if (ambientRef.current) ambientRef.current.intensity = brightness;
      if (lightRef.current) {
        lightRef.current.intensity = warmth;
        // Sun low on horizon for evening feel
        const angle = t * Math.PI * 2;
        lightRef.current.position.set(8 * Math.cos(angle), 8 + 2 * Math.sin(angle), 10 * Math.sin(angle));
      }
      if (hemiRef.current) hemiRef.current.intensity = brightness * 0.7;
      frame = requestAnimationFrame(cycle);
    };
    cycle();
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <>
      {/* Warm amber ambient */}
      <ambientLight ref={ambientRef} intensity={0.45} color="#ffe8cc" />
      {/* Warm golden directional (sunset feel) */}
      <directionalLight ref={lightRef} position={[8, 10, 10]} intensity={1.0} color="#ffd699" />
      {/* Warm hemisphere: golden sky, brown ground */}
      <hemisphereLight ref={hemiRef} args={['#ffecd2', '#b97a20', 0.35]} />
      {/* Fill light from opposite side for softer shadows */}
      <pointLight position={[-8, 4, -5]} intensity={0.3} color="#ffeedd" distance={20} />
    </>
  );
}

// ─── Camera Ref Forwarder (to pass camera ref out of Canvas) ───
function CameraRefForwarder({ cameraRef }) {
  const { camera } = useThree();
  useEffect(() => {
    cameraRef.current = camera;
  }, [camera, cameraRef]);
  return null;
}

// ─── 3D Scene Content ───
function SceneContent({ onApplianceClick, onRoomChange, onNearestChange, onInteract, activeApplianceId, interactedAppliances, cameraRef }) {
  return (
    <>
      <WarmLighting />
      <CameraRefForwarder cameraRef={cameraRef} />
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

// ─── L1 Controls Help (Fix 6: ? button matching Level 2) ───
function L1ControlsHelp({ t }) {
  const [show, setShow] = useState(false);
  const [auto, setAuto] = useState(false);
  useEffect(() => { if (!auto) { setShow(true); setAuto(true); const timer = setTimeout(() => setShow(false), 3000); return () => clearTimeout(timer); } }, []);
  useEffect(() => { if (!show) return; const h = (e) => { if (e.key === 'Escape') setShow(false); }; window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h); }, [show]);
  const l2t = t?.level2 || {};
  return (
    <>
      <button className="l1-help-btn" onClick={() => setShow(true)}>?</button>
      {show && (
        <div className="l1-controls-overlay" onClick={() => setShow(false)}>
          <div className="l1-controls-card" onClick={e => e.stopPropagation()}>
            <div className="l1-controls-title">{ICONS.star} {l2t.controls || 'Controls'}</div>
            <div className="l1-controls-list">
              <div className="l1-ctrl-row"><span className="l1-ctrl-keys"><span className="l1-key">W</span> / <span className="l1-key">{"\u2191"}</span></span><span>{l2t.moveForward || 'Move Forward'}</span></div>
              <div className="l1-ctrl-row"><span className="l1-ctrl-keys"><span className="l1-key">S</span> / <span className="l1-key">{"\u2193"}</span></span><span>{l2t.moveBackward || 'Move Backward'}</span></div>
              <div className="l1-ctrl-row"><span className="l1-ctrl-keys"><span className="l1-key">A</span> / <span className="l1-key">{"\u2190"}</span></span><span>{l2t.turnLeft || 'Turn Left'}</span></div>
              <div className="l1-ctrl-row"><span className="l1-ctrl-keys"><span className="l1-key">D</span> / <span className="l1-key">{"\u2192"}</span></span><span>{l2t.turnRight || 'Turn Right'}</span></div>
              <div className="l1-ctrl-row"><span className="l1-ctrl-keys"><span className="l1-key">E</span></span><span>{l2t.interactAppliance || 'Interact with Appliance'}</span></div>
              <div className="l1-ctrl-row"><span className="l1-ctrl-keys"><span className="l1-key">ESC</span></span><span>{l2t.exitMenu || 'Exit to Menu'}</span></div>
            </div>
            <button className="l1-controls-got-it" onClick={() => setShow(false)}>{l2t.gotIt || 'Got it!'}</button>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Main Level 1 Component ───
export default function Level1() {
  const navigate = useNavigate();
  const { selectedLanguage, completeLevel, unlockLevel, addCarbonCoins } = useGame();
  const langCode = selectedLanguage || 'en';
  const t = getTranslation(langCode);

  // Camera and canvas refs for tooltip positioning
  const cameraRef = useRef(null);
  const canvasRef = useRef(null);

  const [showLevelIntro, setShowLevelIntro] = useState(true);
  const [activeAppliance, setActiveAppliance] = useState(null);
  const [currentRoom, setCurrentRoom] = useState('Living Room');
  const [nearestAppliance, setNearestAppliance] = useState(null);
  const [interacted, setInteracted] = useState(new Set());
  const [checklistOpen, setChecklistOpen] = useState(false);
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
  const [totalPoints, setTotalPoints] = useState(0);

  // Coin reward popup
  const [showCoinReward, setShowCoinReward] = useState(false);
  const [coinRewardName, setCoinRewardName] = useState('');

  // Achievements
  const [unlockedAchievements, setUnlockedAchievements] = useState(new Set());
  const [currentAchievement, setCurrentAchievement] = useState(null);
  const [showAchievement, setShowAchievement] = useState(false);

  // Room entry voiceover state
  const [visitedRooms, setVisitedRooms] = useState(new Set());
  const [roomBanner, setRoomBanner] = useState(null);
  const [showRoomBanner, setShowRoomBanner] = useState(false);
  const [thoughtText, setThoughtText] = useState(null);
  const [showThought, setShowThought] = useState(false);

  // Speaking indicator
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Ambient music (disabled)
  useAmbientMusic();

  // FIX 1: No pointer lock — removed pointer lock management entirely

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

    // Speak using voice_text from translation, fallback to English description
    const at = t?.appliances?.[applianceId];
    const voiceText = at?.voice_text || data.description;
    setIsSpeaking(true);
    speak(voiceText, langCode, data.voiceRate || 0.9, data.voicePitch || 1.05, () => setIsSpeaking(false));

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
        // Award 10 coins for first discovery
        setTotalPoints(p => p + 10);
        playCoinSound();
        setCoinRewardName(data.name);
        setShowCoinReward(true);
        setTimeout(() => setShowCoinReward(false), 2200);

        const newCount = next.size;

        if (newCount === 1) triggerAchievement('interact_1');
        if (newCount === 3) triggerAchievement('interact_3');
        if (newCount === 6) triggerAchievement('interact_6');
        if (newCount === 9) triggerAchievement('interact_9');
        if (newCount === 12) triggerAchievement('interact_12');
        if (newCount === 15) triggerAchievement('interact_15');

        if (newCount >= INTERACTABLE_IDS.length) {
          setTimeout(() => setShowFullQuiz(true), 2000);
        }
      }
      return next;
    });
  }, [activeAppliance, showFullQuiz, showLevelComplete, triggerAchievement, t, langCode]);

  const handleApplianceClick = useCallback((applianceId) => {
    handleInteract(applianceId);
  }, [handleInteract]);

  const handleCloseBubble = useCallback(() => {
    stopSpeech();
    setIsSpeaking(false);
    const closedAppliance = activeAppliance;
    setActiveAppliance(null);

    cameraMode.cinematic = false;
    setIsCinematic(false);

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

    const pct = (score / total) * 100;
    let earnedStars = 1;
    if (pct >= 90) earnedStars = 3;
    else if (pct >= 60) earnedStars = 2;
    setFinalStars(earnedStars);

    if (pct === 100) triggerAchievement('quiz_perfect');
    if (earnedStars >= 3) triggerAchievement('quiz_3stars');

    playLevelCompleteSound();
    setTimeout(() => setShowLevelComplete(true), 500);
  }, [triggerAchievement]);

  // Room change handler with entry voiceover
  const handleRoomChange = useCallback((room) => {
    setCurrentRoom(prev => {
      if (prev !== room) {
        // Check if room is being visited for the first time
        if (!visitedRooms.has(room)) {
          setVisitedRooms(vr => {
            const next = new Set(vr);
            next.add(room);
            return next;
          });

          // Show room banner (2 seconds)
          setRoomBanner(room);
          setShowRoomBanner(true);
          setTimeout(() => setShowRoomBanner(false), 2000);

          // Room entry voiceover
          const rt = t?.rooms?.[room];
          if (rt) {
            // Show thought bubble
            setThoughtText(rt.display_text);
            setShowThought(true);

            // Speak the room voice text
            speak(rt.voice_text || rt.display_text, langCode, 0.9, 1.0, () => {
              setTimeout(() => setShowThought(false), 1000);
            });
          }
        }
        return room;
      }
      return prev;
    });
  }, [visitedRooms, t, langCode]);

  const handleNearestChange = useCallback((id) => {
    setNearestAppliance(id);
  }, []);

  // ─── LEVEL INTRO ───
  if (showLevelIntro) {
    return (
      <LevelIntro
        levelNumber={1}
        levelTitle="Home Energy Audit"
        levelIcon="🏠"
        objective="Walk through your virtual home and discover the appliances that power your daily life. Learn how each device works, what it does, and how much electricity it uses."
        learningOutcome="By the end of this level, you will understand what household appliances are, how to interact with them, and why knowing about them matters for energy awareness."
        terms={[
          { icon: '🧩', name: 'Appliance', definition: 'A device in your home that uses electricity to perform a task — like a fan, TV, or fridge.', example: 'A ceiling fan is an appliance that cools the room' },
          { icon: '🎮', name: 'Interaction', definition: 'When you do something with an object in the game — like walking up to it and pressing a button to learn about it.', example: 'Press E near an appliance to interact' },
          { icon: '🟢', name: 'Activation', definition: 'Turning something ON so it starts working and begins using electricity.', example: 'When you turn ON the AC, it starts consuming 1500W' },
        ]}
        onComplete={() => setShowLevelIntro(false)}
      />
    );
  }

  return (
    <div className="level1-container">
      {/* 3D Canvas */}
      <div className={`canvas-wrapper ${isCinematic ? 'cinematic-blur' : ''}`}>
        <Canvas
          camera={{ position: [-5, 6, 1], fov: 50 }}
          gl={{ antialias: false }}
          onCreated={({ gl }) => {
            canvasRef.current = gl.domElement;
            gl.setClearColor('#f5deb3');
            gl.toneMapping = 1;
            gl.toneMappingExposure = 1.1;
            gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
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
              cameraRef={cameraRef}
            />
          </Suspense>
        </Canvas>
        {/* Vignette overlay */}
        <div className="vignette-overlay" />
      </div>



      {/* HUD - hidden during quiz */}
      {!showFullQuiz && !showLevelComplete && (
        <>
          <div className="level1-hud">
            <button className="hud-back-btn" onClick={() => { stopSpeech(); navigate('/hub'); }}>{t?.ui?.back || String.fromCharCode(8592) + ' Back'}</button>
            <div className="hud-room-name">{t?.rooms?.[currentRoom]?.name || `${ICONS.pin} ${currentRoom}`}</div>
            <div className="hud-instructions">{t?.ui?.homeAuditMission || `${ICONS.house} Home Audit Mission`}</div>
          </div>

          {/* Points Display */}
          <PointsDisplay points={totalPoints} totalDiscovered={interacted.size} total={INTERACTABLE_IDS.length} />

          {/* Stars */}
          <RewardsDisplay stars={stars} />

          {/* Progress Checklist */}
          <ChecklistPanel
            interacted={interacted}
            isOpen={checklistOpen}
            onToggle={() => setChecklistOpen(o => !o)}
            t={t}
          />


        </>
      )}

      {/* Room Entry Banner - hidden during quiz */}
      {!showFullQuiz && !showLevelComplete && (
        <RoomEntryBanner room={roomBanner} visible={showRoomBanner} t={t} />
      )}

      {/* Arjun Thought Bubble - hidden during quiz */}
      {!showFullQuiz && !showLevelComplete && (
        <ThoughtBubble text={thoughtText} visible={showThought} />
      )}

      {/* Screen-Centered Appliance Popup - hidden during quiz */}
      {!showFullQuiz && !showLevelComplete && (
        <ApplianceTooltip
          appliance={activeAppliance}
          onClose={handleCloseBubble}
          t={t}
          langCode={langCode}
        />
      )}

      {/* Memory Flash Card - hidden during quiz */}
      {!showFullQuiz && !showLevelComplete && (
        <FlashCard appliance={flashCard} visible={showFlash} t={t} />
      )}

      {/* Achievement Toast - hidden during quiz */}
      {!showFullQuiz && !showLevelComplete && (
        <AchievementToast achievement={currentAchievement} visible={showAchievement} t={t} />
      )}

      {/* Coin Reward Popup */}
      {!showFullQuiz && !showLevelComplete && (
        <CoinRewardPopup visible={showCoinReward} applianceName={coinRewardName} points={10} />
      )}

      {/* Full Quiz */}
      {showFullQuiz && (
        <FullQuizModal
          questions={QUIZ_QUESTIONS}
          onComplete={handleQuizComplete}
          t={t}
        />
      )}

      {/* Level Complete Screen */}
      {showLevelComplete && (
        <LevelCompleteScreen
          score={quizScore}
          total={quizTotal}
          stars={finalStars}
          onContinue={() => {
            // Mark Level 1 complete and unlock Level 2
            completeLevel(1);
            unlockLevel(2);
            addCarbonCoins(finalStars * 20 + quizScore * 5);
            navigate('/hub');
          }}
          t={t}
        />
      )}
      {/* Help Button (Fix 6) */}
      <L1ControlsHelp t={t} />
    </div>
  );
}
