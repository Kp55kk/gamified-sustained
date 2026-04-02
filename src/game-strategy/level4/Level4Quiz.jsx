// ═══════════════════════════════════════════════════════════
//  LEVEL 4: SOLAR REVOLUTION — Quiz
// ═══════════════════════════════════════════════════════════
import React, { useState, useCallback } from 'react';
import { L4_QUIZ_QUESTIONS, L4_ICONS } from './level4Data';

export default function Level4Quiz({ onComplete }) {
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [score, setScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);

  const question = L4_QUIZ_QUESTIONS[currentQ];
  const total = L4_QUIZ_QUESTIONS.length;
  const isCorrect = selectedIdx === question?.correctIndex;

  const handleSelect = useCallback((idx) => {
    if (selectedIdx !== null) return;
    setSelectedIdx(idx);
    setShowExplanation(true);
    if (idx === question.correctIndex) setScore(s => s + 1);
  }, [selectedIdx, question]);

  const handleNext = useCallback(() => {
    if (currentQ + 1 >= total) { onComplete({ score, total }); return; }
    setCurrentQ(c => c + 1);
    setSelectedIdx(null);
    setShowExplanation(false);
  }, [currentQ, total, score, onComplete]);

  if (!question) return null;

  return (
    <div className="l4-quiz-container">
      <div className="l4-quiz-card">
        <div className="l4-quiz-progress">{L4_ICONS.brain} Question {currentQ + 1} of {total}</div>
        <div className="l4-quiz-question">{question.question}</div>
        <div className="l4-quiz-options">
          {question.options.map((opt, i) => {
            let cls = 'l4-quiz-option';
            if (selectedIdx !== null) { if (i === question.correctIndex) cls += ' correct'; else if (i === selectedIdx) cls += ' wrong'; }
            return <button key={i} className={cls} onClick={() => handleSelect(i)} disabled={selectedIdx !== null}>{opt}</button>;
          })}
        </div>
        {showExplanation && (<>
          <div className="l4-quiz-explanation">
            {isCorrect ? <><strong>{L4_ICONS.check} Good understanding!</strong> {question.explanation}</> : <><strong>{L4_ICONS.cross} Not quite.</strong> {question.explanation}</>}
          </div>
          <button className="l4-quiz-next-btn" onClick={handleNext}>{currentQ + 1 >= total ? 'Finish Quiz' : 'Next Question'} {'\u{2192}'}</button>
        </>)}
      </div>
    </div>
  );
}
