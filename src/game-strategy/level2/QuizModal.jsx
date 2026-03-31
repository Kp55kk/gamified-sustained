import React, { useState, useMemo } from 'react';
import { QUIZ_QUESTIONS } from './level2Data';

export default function QuizModal({ onComplete }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [wrongStreak, setWrongStreak] = useState(0);
  const [correctStreak, setCorrectStreak] = useState(0);
  const [showHint, setShowHint] = useState(false);

  // Dynamic difficulty: sort questions and pick based on streaks
  const sortedQuestions = useMemo(() => {
    const qs = [...QUIZ_QUESTIONS];
    // Shuffle within difficulty levels for variety
    return qs.sort((a, b) => a.difficulty - b.difficulty);
  }, []);

  const question = sortedQuestions[currentIdx];
  const totalQ = sortedQuestions.length;
  const isLast = currentIdx >= totalQ - 1;

  const handleSelect = (idx) => {
    if (answered) return;
    setSelectedIdx(idx);
    setAnswered(true);

    if (idx === question.correctIndex) {
      setScore(s => s + 1);
      setCorrectStreak(s => s + 1);
      setWrongStreak(0);
      setShowHint(false);
    } else {
      setWrongStreak(s => s + 1);
      setCorrectStreak(0);
      // Show hint after 2 wrong in a row
      if (wrongStreak >= 1) {
        setShowHint(true);
      }
    }
  };

  const handleNext = () => {
    if (isLast) {
      const pct = (score / totalQ) * 100;
      const stars = pct >= 90 ? 3 : pct >= 60 ? 2 : 1;
      onComplete({ score, total: totalQ, stars, pct: Math.round(pct) });
      return;
    }
    setCurrentIdx(i => i + 1);
    setSelectedIdx(null);
    setAnswered(false);
    setShowHint(false);
  };

  const isCorrect = selectedIdx === question.correctIndex;

  return (
    <div className="l2-quiz-overlay">
      <div className="l2-quiz-modal">
        <div className="l2-quiz-header">
          <span className="l2-quiz-icon">{'\u{1F9E0}'}</span>
          <h3 className="l2-quiz-title">Energy Knowledge Quiz</h3>
        </div>

        <div className="l2-quiz-progress">
          <div
            className="l2-quiz-progress-fill"
            style={{ width: `${((currentIdx + 1) / totalQ) * 100}%` }}
          />
        </div>

        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px', textAlign: 'right' }}>
          Question {currentIdx + 1} of {totalQ}
          {correctStreak >= 2 && <span style={{ color: '#22c55e', marginLeft: '8px' }}>{'\u{1F525}'} {correctStreak} streak!</span>}
        </div>

        <div className="l2-quiz-question">{question.question}</div>

        <div className="l2-quiz-options">
          {question.options.map((opt, i) => {
            let cls = 'l2-quiz-option';
            if (answered) {
              cls += ' disabled';
              if (i === question.correctIndex) cls += ' correct';
              else if (i === selectedIdx && !isCorrect) cls += ' wrong';
            } else if (i === selectedIdx) {
              cls += ' selected';
            }
            return (
              <button key={i} className={cls} onClick={() => handleSelect(i)}>
                <strong>{String.fromCharCode(65 + i)}.</strong> {opt}
              </button>
            );
          })}
        </div>

        {answered && (
          <div className={`l2-quiz-feedback ${isCorrect ? 'correct' : 'wrong'}`}>
            {isCorrect
              ? `${'\u{2705}'} Correct!`
              : `${'\u{274C}'} Wrong! The answer is ${String.fromCharCode(65 + question.correctIndex)}.`}
            <p style={{ marginTop: '6px', opacity: 0.9 }}>{question.explanation}</p>
          </div>
        )}

        {showHint && !isCorrect && answered && (
          <div className="l2-quiz-hint">
            {'\u{1F4A1}'} Hint: Remember the formula kWh = (Watts {'\u00D7'} Hours) {'\u00F7'} 1000. Focus on the relationship between wattage, usage time, and total energy.
          </div>
        )}

        {answered && (
          <button className="l2-quiz-next" onClick={handleNext} style={{ display: 'block', margin: '16px auto 0' }}>
            {isLast ? 'See Results' : `Next ${'\u{2192}'}`}
          </button>
        )}
      </div>
    </div>
  );
}
