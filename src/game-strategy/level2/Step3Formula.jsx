import React, { useState } from 'react';

export default function Step3Formula({ onComplete, onScore }) {
  const [sliderWatts, setSliderWatts] = useState(75);
  const [sliderHours, setSliderHours] = useState(12);
  const [sliderDays, setSliderDays] = useState(300);
  const [practiceAnswer, setPracticeAnswer] = useState('');
  const [practiceFeedback, setPracticeFeedback] = useState(null);
  const [practiceSubmitted, setPracticeSubmitted] = useState(false);

  const calcKwhDay = (w, h) => ((w * h) / 1000).toFixed(2);
  const calcKwhYear = (w, h, d) => (((w * h) / 1000) * d).toFixed(1);
  const calcCo2 = (kwh) => (kwh * 0.710).toFixed(1);

  const liveKwhDay = calcKwhDay(sliderWatts, sliderHours);
  const liveKwhYear = calcKwhYear(sliderWatts, sliderHours, sliderDays);
  const liveCo2 = calcCo2(parseFloat(liveKwhYear));

  // Practice: 1500W AC, 8 hrs/day, 150 days = 1800 kWh
  const correctAnswer = 1800;

  const handlePracticeSubmit = () => {
    const answer = parseFloat(practiceAnswer);
    setPracticeSubmitted(true);
    if (Math.abs(answer - correctAnswer) <= 10) {
      setPracticeFeedback('correct');
      onScore(15);
    } else {
      setPracticeFeedback('wrong');
    }
  };

  return (
    <div className="l2-step-transition">
      <div className="l2-section-header">
        <span className="l2-section-icon">{'\u{1F9EE}'}</span>
        <h2 className="l2-section-title">The Energy Formula</h2>
        <p className="l2-section-desc">Learn how to calculate energy consumption in kWh.</p>
      </div>

      {/* Formula Display */}
      <div className="l2-formula-display">
        <div className="l2-formula-title">The Formula</div>
        <div className="l2-formula-text">
          <span className="l2-formula-highlight">kWh</span> = (Watts {'\u00D7'} Hours) {'\u00F7'} 1000
        </div>
      </div>

      {/* Example */}
      <div className="l2-example-box">
        <div className="l2-example-title">{'\u{1F4DD}'} Worked Example: One Ceiling Fan</div>
        <div className="l2-example-step">
          {'\u{2460}'} <strong>Daily kWh</strong> = (75W {'\u00D7'} 12 hrs) {'\u00F7'} 1000 = <strong>0.9 kWh/day</strong>
        </div>
        <div className="l2-example-step">
          {'\u{2461}'} <strong>Annual kWh</strong> = 0.9 {'\u00D7'} 300 days = <strong>270 kWh/year</strong>
        </div>
        <div className="l2-example-step">
          {'\u{2462}'} <strong>Annual CO{'\u2082'}</strong> = 270 {'\u00D7'} 0.710 = <strong>191.7 kg CO{'\u2082'}/year</strong>
        </div>
        <div className="l2-example-result">
          {'\u{1F4A1}'} A home with 3 fans: 191.7 {'\u00D7'} 3 = 575 kg CO{'\u2082'}/year!
        </div>
      </div>

      {/* Interactive Calculator */}
      <div className="l2-calc-box">
        <div className="l2-calc-title">{'\u{1F50B}'} Interactive Calculator</div>

        <div className="l2-calc-row">
          <span className="l2-calc-label">Wattage</span>
          <input
            type="range"
            className="l2-calc-slider"
            min="10"
            max="2500"
            step="5"
            value={sliderWatts}
            onChange={e => setSliderWatts(Number(e.target.value))}
          />
          <span className="l2-calc-value">{sliderWatts}W</span>
        </div>

        <div className="l2-calc-row">
          <span className="l2-calc-label">Hours/day</span>
          <input
            type="range"
            className="l2-calc-slider"
            min="0.25"
            max="24"
            step="0.25"
            value={sliderHours}
            onChange={e => setSliderHours(Number(e.target.value))}
          />
          <span className="l2-calc-value">{sliderHours}h</span>
        </div>

        <div className="l2-calc-row">
          <span className="l2-calc-label">Days/year</span>
          <input
            type="range"
            className="l2-calc-slider"
            min="30"
            max="365"
            step="5"
            value={sliderDays}
            onChange={e => setSliderDays(Number(e.target.value))}
          />
          <span className="l2-calc-value">{sliderDays}d</span>
        </div>

        <div className="l2-calc-result">
          <div className="l2-calc-result-value">{liveKwhYear} <span style={{ fontSize: '16px', color: '#94a3b8' }}>kWh/year</span></div>
          <div className="l2-calc-result-label">
            {liveKwhDay} kWh/day {'\u{2022}'} {liveCo2} kg CO{'\u2082'}/year
          </div>
        </div>
      </div>

      {/* Practice Problem */}
      <div className="l2-practice-box">
        <div className="l2-practice-title">{'\u{1F9E0}'} Practice Challenge</div>
        <div className="l2-practice-question">
          An Air Conditioner uses <strong>1500W</strong> for <strong>8 hours/day</strong> over <strong>150 days</strong>.
          <br />What is its annual energy consumption in kWh?
        </div>
        <div>
          <input
            type="number"
            className="l2-practice-input"
            placeholder="kWh"
            value={practiceAnswer}
            onChange={e => setPracticeAnswer(e.target.value)}
            disabled={practiceSubmitted}
          />
          <button
            className="l2-practice-submit"
            onClick={handlePracticeSubmit}
            disabled={!practiceAnswer || practiceSubmitted}
          >
            Check
          </button>
        </div>
        {practiceFeedback && (
          <div className={`l2-practice-feedback ${practiceFeedback}`}>
            {practiceFeedback === 'correct'
              ? `${'\u{2705}'} Correct! (1500 \u00D7 8) \u00F7 1000 \u00D7 150 = 1800 kWh/year. +15 points!`
              : `${'\u{274C}'} Not quite. The answer is 1800 kWh. Daily = (1500 \u00D7 8) \u00F7 1000 = 12 kWh. Annual = 12 \u00D7 150 = 1800 kWh.`}
          </div>
        )}
      </div>

      <button
        className="l2-continue-btn"
        onClick={onComplete}
        style={{ display: 'block', margin: '24px auto 0' }}
      >
        Continue {'\u{2192}'}
      </button>
    </div>
  );
}
