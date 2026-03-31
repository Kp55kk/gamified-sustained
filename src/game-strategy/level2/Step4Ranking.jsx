import React, { useState, useRef } from 'react';
import { RANKING_ANSWER } from './level2Data';

// Shuffle array
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function Step4Ranking({ onComplete, onScore }) {
  const [items, setItems] = useState(() => shuffle(RANKING_ANSWER));
  const [checked, setChecked] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [results, setResults] = useState([]);
  const dragItem = useRef(null);
  const dragOver = useRef(null);
  const [dragIdx, setDragIdx] = useState(null);
  const [overIdx, setOverIdx] = useState(null);

  const handleDragStart = (idx) => {
    dragItem.current = idx;
    setDragIdx(idx);
  };

  const handleDragEnter = (idx) => {
    dragOver.current = idx;
    setOverIdx(idx);
  };

  const handleDragEnd = () => {
    if (dragItem.current === null || dragOver.current === null) return;
    const copy = [...items];
    const draggedItem = copy[dragItem.current];
    copy.splice(dragItem.current, 1);
    copy.splice(dragOver.current, 0, draggedItem);
    setItems(copy);
    dragItem.current = null;
    dragOver.current = null;
    setDragIdx(null);
    setOverIdx(null);
  };

  const handleCheck = () => {
    const res = items.map((item, i) => ({
      id: item.id,
      correct: item.id === RANKING_ANSWER[i].id,
    }));
    setResults(res);
    setChecked(true);
    const count = res.filter(r => r.correct).length;
    setCorrectCount(count);
    onScore(count * 3);
  };

  const getExplanation = () => {
    if (correctCount === RANKING_ANSWER.length) {
      return `${'\u{1F389}'} Perfect! You ranked all ${RANKING_ANSWER.length} appliances correctly!`;
    }
    if (correctCount >= RANKING_ANSWER.length / 2) {
      return `${'\u{1F44D}'} Good job! ${correctCount}/${RANKING_ANSWER.length} correct. Remember: high wattage + long hours + many days = highest energy use!`;
    }
    return `${'\u{1F4A1}'} ${correctCount}/${RANKING_ANSWER.length} correct. The key factors are: wattage, daily hours, AND days per year. An appliance that runs longer overall uses more total energy.`;
  };

  return (
    <div className="l2-step-transition">
      <div className="l2-section-header">
        <span className="l2-section-icon">{'\u{1F3C6}'}</span>
        <h2 className="l2-section-title">Ranking Challenge</h2>
        <p className="l2-section-desc">
          Drag and drop to rank these appliances from HIGHEST to LOWEST annual energy consumption (kWh/year).
        </p>
      </div>

      <div className="l2-ranking-container">
        {items.map((item, idx) => {
          const result = checked ? results[idx] : null;
          return (
            <div
              key={item.id}
              className={`l2-ranking-item 
                ${dragIdx === idx ? 'dragging' : ''} 
                ${overIdx === idx ? 'drag-over' : ''}
                ${result?.correct ? 'correct' : ''}
                ${result && !result.correct ? 'wrong' : ''}`}
              draggable={!checked}
              onDragStart={() => handleDragStart(idx)}
              onDragEnter={() => handleDragEnter(idx)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => e.preventDefault()}
            >
              <div className="l2-ranking-num">#{idx + 1}</div>
              <div className="l2-ranking-icon">{item.icon}</div>
              <div className="l2-ranking-name">{item.name}</div>
              <div className="l2-ranking-kwh">
                {checked
                  ? `${item.kwhPerYear} kWh/yr ${result?.correct ? '\u{2705}' : '\u{274C}'}`
                  : ''}
              </div>
            </div>
          );
        })}
      </div>

      {!checked && (
        <button
          className="l2-check-btn"
          onClick={handleCheck}
          style={{ display: 'block', margin: '20px auto 0' }}
        >
          {'\u{2705}'} Check My Ranking
        </button>
      )}

      {checked && (
        <>
          <div className="l2-ranking-explanation">
            {getExplanation()}
          </div>
          <div style={{ textAlign: 'center' }}>
            <button
              className="l2-continue-btn"
              onClick={onComplete}
              style={{ margin: '20px auto 0' }}
            >
              Continue {'\u{2192}'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
