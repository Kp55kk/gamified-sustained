import React, { useState, useEffect } from 'react';
import { EXPLAINER_TOPICS } from './level5ExplainerData';
import TopicSVG from './Level5SVGs';

export default function Level5PhaseExplainer({ topicId, onComplete }) {
  const topic = EXPLAINER_TOPICS[topicId];
  const [step, setStep] = useState(0);
  const [quizAns, setQuizAns] = useState(null);
  const [animClass, setAnimClass] = useState('se-enter');

  useEffect(() => {
    setAnimClass('se-enter');
    setQuizAns(null);
    const t = setTimeout(() => setAnimClass('se-active'), 50);
    return () => clearTimeout(t);
  }, [step]);

  if (!topic) return null;
  const steps = topic.steps;
  const current = steps[step];

  const advance = () => {
    if (step < steps.length - 1) {
      setAnimClass('se-exit');
      setTimeout(() => setStep(s => s + 1), 300);
    } else onComplete?.();
  };

  return (
    <div className="se-overlay">
      <div className={`se-card ${animClass}`} style={{ borderColor: topic.color + '44' }}>
        <div className="se-progress">
          {steps.map((s, i) => (
            <div key={i} className={`se-dot ${i === step ? 'active' : i < step ? 'done' : ''}`}
              style={{ background: i <= step ? topic.color : '#333' }} />
          ))}
        </div>
        <div className="se-step-count" style={{ color: topic.color }}>
          {topic.name} — Step {step + 1} of {steps.length}
        </div>
        <div className="se-title" style={{ color: topic.color }}>{current.title}</div>
        <TopicSVG svgId={current.svg} color={topic.color} />
        <div className="se-desc">{current.desc}</div>
        <div className="se-fact" style={{ borderLeftColor: topic.color }}>
          <span style={{ color: topic.color }}>Did you know?</span> {current.fact}
        </div>
        {current.quiz && (
          <div className="se-quiz">
            <div className="se-quiz-q">{current.quiz.q}</div>
            <div className="se-quiz-opts">
              {current.quiz.opts.map((opt, i) => (
                <button key={i}
                  className={`se-quiz-btn ${quizAns !== null ? (i === current.quiz.ans ? 'correct' : quizAns === i ? 'wrong' : '') : ''}`}
                  onClick={() => setQuizAns(i)} disabled={quizAns !== null}>{opt}</button>
              ))}
            </div>
            {quizAns !== null && (
              <div className={`se-quiz-fb ${quizAns === current.quiz.ans ? 'correct' : 'wrong'}`}>
                {quizAns === current.quiz.ans ? 'Correct!' : `Answer: ${current.quiz.opts[current.quiz.ans]}`}
              </div>
            )}
          </div>
        )}
        <button className="se-next" style={{ background: topic.color }}
          onClick={advance} disabled={current.quiz && quizAns === null}>
          {step < steps.length - 1 ? `Next: ${steps[step + 1].title} \u2192` : `Complete ${topic.name} \u2714`}
        </button>
      </div>
    </div>
  );
}
