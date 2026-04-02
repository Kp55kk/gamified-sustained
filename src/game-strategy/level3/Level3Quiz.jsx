// ═══════════════════════════════════════════════════════════
//  LEVEL 3 — Scenario-Based Quiz
// ═══════════════════════════════════════════════════════════
import React, { useState, useCallback } from 'react';
import { L3_QUIZ_QUESTIONS, L3_ICONS } from './level3Data';

export default function Level3Quiz({ onComplete }) {
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [score, setScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);

  const question = L3_QUIZ_QUESTIONS[currentQ];
  const total = L3_QUIZ_QUESTIONS.length;
  const isCorrect = selectedIdx === question?.correctIndex;

  const handleSelect = useCallback((idx) => {
    if (selectedIdx !== null) return;
    setSelectedIdx(idx);
    setShowExplanation(true);
    if (idx === question.correctIndex) setScore(s => s + 1);
  }, [selectedIdx, question]);

  const handleNext = useCallback(() => {
    const nextQ = currentQ + 1;
    if (nextQ >= total) {
      onComplete({ score: score + (isCorrect ? 0 : 0), total });
      return;
    }
    setCurrentQ(nextQ);
    setSelectedIdx(null);
    setShowExplanation(false);
  }, [currentQ, total, score, isCorrect, onComplete]);

  if (!question) return null;

  return (
    <div className="l3-quiz-container">
      <div className="l3-quiz-card">
        <div className="l3-quiz-progress">
          {L3_ICONS.brain} Question {currentQ + 1} of {total}
        </div>
        <div className="l3-quiz-question">{question.question}</div>
        <div className="l3-quiz-options">
          {question.options.map((opt, i) => {
            let cls = 'l3-quiz-option';
            if (selectedIdx !== null) {
              if (i === question.correctIndex) cls += ' correct';
              else if (i === selectedIdx) cls += ' wrong';
            }
            return (
              <button key={i} className={cls} onClick={() => handleSelect(i)} disabled={selectedIdx !== null}>
                {opt}
              </button>
            );
          })}
        </div>
        {showExplanation && (
          <>
            <div className="l3-quiz-explanation">
              {isCorrect
                ? <><strong>{L3_ICONS.check} Good understanding!</strong> {question.explanation}</>
                : <><strong>{L3_ICONS.cross} Not quite.</strong> {question.explanation}</>
              }
            </div>
            <button className="l3-quiz-next-btn" onClick={handleNext}>
              {currentQ + 1 >= total ? 'Finish Quiz' : 'Next Question'} {'\u{2192}'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
