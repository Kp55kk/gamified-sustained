// ═══════════════════════════════════════════════════════════
//  LEVEL 4: SOLAR REVOLUTION — Data & Constants
// ═══════════════════════════════════════════════════════════
import {
  LEVEL2_APPLIANCES, L2_APPLIANCE_IDS, L2_APPLIANCE_MAP,
  USAGE_HOURS, calculateBill, calculateCO2, CO2_FACTOR,
} from '../level2/level2Data';

export {
  L2_APPLIANCE_IDS, L2_APPLIANCE_MAP, USAGE_HOURS,
  calculateBill, calculateCO2, CO2_FACTOR,
};

// ═══ SOLAR PANEL SPECS ═══
export const PANEL_WATT_PEAK = 330; // Wp per panel
export const MAX_PANELS = 6;
export const PANEL_COST = 25000; // ₹ per panel (installed)
export const PANEL_AREA = 1.7; // m² per panel
export const ROOF_GRID_SLOTS = [
  { id: 0, x: -2.0, z: -1.5, shadow: 0.0, label: 'Front-Left' },
  { id: 1, x:  0.0, z: -1.5, shadow: 0.0, label: 'Front-Center' },
  { id: 2, x:  2.0, z: -1.5, shadow: 0.0, label: 'Front-Right' },
  { id: 3, x: -2.0, z:  0.5, shadow: 0.1, label: 'Back-Left' },
  { id: 4, x:  0.0, z:  0.5, shadow: 0.05, label: 'Back-Center' },
  { id: 5, x:  2.0, z:  0.5, shadow: 0.15, label: 'Back-Right (Tree Shadow)' },
];

// ═══ TIME OF DAY ═══
export const TIME_PERIODS = [
  { id: 'dawn',    label: 'Dawn (6 AM)',      hour: 6,  sunlight: 0.2,  icon: '\u{1F305}', skyColor: '#ff9966' },
  { id: 'morning', label: 'Morning (9 AM)',   hour: 9,  sunlight: 0.6,  icon: '\u{1F304}', skyColor: '#87CEEB' },
  { id: 'noon',    label: 'Noon (12 PM)',     hour: 12, sunlight: 1.0,  icon: '\u{2600}\u{FE0F}', skyColor: '#4a9eda' },
  { id: 'afternoon', label: 'Afternoon (3 PM)', hour: 15, sunlight: 0.8, icon: '\u{1F31E}', skyColor: '#6bb3d9' },
  { id: 'evening', label: 'Evening (6 PM)',   hour: 18, sunlight: 0.15, icon: '\u{1F307}', skyColor: '#cc6633' },
  { id: 'night',   label: 'Night (9 PM)',     hour: 21, sunlight: 0.0,  icon: '\u{1F303}', skyColor: '#0a1628' },
];

// ═══ WEATHER ═══
export const WEATHER_TYPES = [
  { id: 'clear',   label: 'Clear Sky',    factor: 1.0,  icon: '\u{2600}\u{FE0F}' },
  { id: 'partial', label: 'Partly Cloudy', factor: 0.7, icon: '\u{26C5}' },
  { id: 'cloudy',  label: 'Cloudy',       factor: 0.4,  icon: '\u{2601}\u{FE0F}' },
];

// ═══ PANEL TILT ANGLES ═══
export const TILT_OPTIONS = [
  { angle: 0,  label: 'Flat (0\u{00B0})',      efficiency: 0.65 },
  { angle: 15, label: '15\u{00B0} Tilt',        efficiency: 0.85 },
  { angle: 25, label: '25\u{00B0} Tilt (Best)', efficiency: 1.0  },
  { angle: 35, label: '35\u{00B0} Tilt',        efficiency: 0.90 },
  { angle: 45, label: '45\u{00B0} Tilt',        efficiency: 0.75 },
];

// ═══ BATTERY ═══
export const BATTERY_CAPACITY_KWH = 5.0; // 5 kWh home battery
export const BATTERY_CHARGE_RATE = 0.8; // kW max charge rate
export const BATTERY_DISCHARGE_RATE = 1.0; // kW max discharge

// ═══ SOLAR CALCULATION HELPERS ═══
export function calcSolarOutput(panelCount, tiltEfficiency, sunlight, weather, avgShadow) {
  if (panelCount === 0) return 0;
  const peakWatts = panelCount * PANEL_WATT_PEAK;
  const output = peakWatts * tiltEfficiency * sunlight * weather * (1 - avgShadow);
  return Math.round(output);
}

export function calcSolarDailyKwh(panelCount, tiltEfficiency, weather, slots) {
  let totalWh = 0;
  const avgShadow = slots.length > 0
    ? slots.reduce((s, sl) => s + ROOF_GRID_SLOTS[sl].shadow, 0) / slots.length
    : 0;
  TIME_PERIODS.forEach(tp => {
    const watts = calcSolarOutput(panelCount, tiltEfficiency, tp.sunlight, weather, avgShadow);
    totalWh += watts * 3; // ~3 hours per period
  });
  return Math.round(totalWh / 1000 * 100) / 100;
}

export function calcMonthlySolarKwh(dailyKwh) {
  return Math.round(dailyKwh * 30 * 100) / 100;
}

export function calcCO2Saved(solarKwhMonth) {
  return Math.round(solarKwhMonth * CO2_FACTOR * 100) / 100;
}

export function calcBillSavings(solarKwhMonth, totalKwhMonth) {
  const withoutSolar = calculateBill(totalKwhMonth);
  const netGrid = Math.max(totalKwhMonth - solarKwhMonth, 0);
  const withSolar = calculateBill(netGrid);
  return {
    before: withoutSolar.totalCost,
    after: withSolar.totalCost,
    saved: withoutSolar.totalCost - withSolar.totalCost,
    pctSaved: totalKwhMonth > 0 ? Math.round(((withoutSolar.totalCost - withSolar.totalCost) / withoutSolar.totalCost) * 100) : 0,
  };
}

export function calcHouseMonthlyKwh() {
  let kwh = 0;
  L2_APPLIANCE_IDS.forEach(id => {
    const w = L2_APPLIANCE_MAP[id].wattage;
    const h = USAGE_HOURS[id] || 4;
    kwh += (w * h * 30) / 1000;
  });
  return Math.round(kwh * 100) / 100;
}

export function getEfficiencyPct(tiltEff, avgShadow, weatherFactor) {
  return Math.round(tiltEff * (1 - avgShadow) * weatherFactor * 100);
}

// ═══ LEVEL 3 STATS (for before/after) ═══
export const LEVEL3_BEFORE = {
  co2Month: 223,   // approx from Level 3 all-on
  billMonth: 2500,
  label: 'Level 3 (No Solar)',
};

// ═══ QUIZ (8 questions) ═══
export const L4_QUIZ_QUESTIONS = [
  {
    question: 'What does a solar panel convert sunlight into?',
    options: ['Heat', 'Electricity', 'Water', 'Wind'],
    correctIndex: 1,
    explanation: 'Solar panels use photovoltaic cells to convert sunlight directly into electricity!',
  },
  {
    question: 'Solar energy produces how much CO\u{2082}?',
    options: ['Same as coal', 'Half of gas', 'Zero CO\u{2082}', 'More than diesel'],
    correctIndex: 2,
    explanation: 'Solar panels produce zero CO\u{2082} during operation \u{2014} truly clean energy!',
  },
  {
    question: 'What angle gives best solar efficiency in India?',
    options: ['Flat (0\u{00B0})', '25\u{00B0} tilt', '90\u{00B0} vertical', '60\u{00B0} steep'],
    correctIndex: 1,
    explanation: 'For most of India (~15-25\u{00B0}N latitude), a 25\u{00B0} panel tilt captures maximum sunlight year-round.',
  },
  {
    question: 'When do solar panels produce the MOST energy?',
    options: ['Dawn', 'Noon', 'Evening', 'Night'],
    correctIndex: 1,
    explanation: 'Solar output peaks at noon when sunlight is strongest and most direct.',
  },
  {
    question: 'What reduces solar panel output?',
    options: ['Clean surface', 'Direct sunlight', 'Shadows from trees', 'Correct angle'],
    correctIndex: 2,
    explanation: 'Shadows significantly reduce output \u{2014} even partial shade can cut efficiency by 30%+!',
  },
  {
    question: 'How can you use solar power at night?',
    options: ['Panels work at night', 'Battery storage', 'Moonlight power', 'Not possible'],
    correctIndex: 1,
    explanation: 'Battery storage saves excess daytime solar energy for use at night!',
  },
  {
    question: 'When should you run heavy appliances with solar?',
    options: ['Night time', 'Early morning', 'Peak sunlight hours', 'Anytime'],
    correctIndex: 2,
    explanation: 'Running heavy appliances during peak sunlight maximizes direct solar usage and minimizes grid dependency.',
  },
  {
    question: 'A 2kW solar system in India saves approximately how much CO\u{2082} per year?',
    options: ['100 kg', '500 kg', '2,000 kg', '10,000 kg'],
    correctIndex: 2,
    explanation: '2kW system \u{2192} ~8 kWh/day \u{2192} ~2,920 kWh/year \u{00D7} 0.710 = ~2,073 kg CO\u{2082} saved!',
  },
];

// ═══ DISCOVERY FACTS ═══
export const SOLAR_FACTS = [
  { icon: '\u{2600}\u{FE0F}', fact: 'Solar panels convert sunlight directly into electricity' },
  { icon: '\u{1F33F}', fact: 'Zero CO\u{2082} emissions during operation' },
  { icon: '\u{267B}\u{FE0F}', fact: 'Solar is 100% renewable \u{2014} the sun won\u{2019}t run out' },
  { icon: '\u{1F4B0}', fact: 'Panels last 25+ years with minimal maintenance' },
  { icon: '\u{1F3E0}', fact: 'A typical Indian home needs 3\u{2013}5 kW solar system' },
];

// ═══ STAR SYSTEM ═══
export function calculateL4Stars(efficiency, challengeScore, quizScore, quizTotal) {
  const effPct = Math.min(efficiency, 100);
  const challengePct = challengeScore;
  const quizPct = (quizScore / quizTotal) * 100;
  const overall = effPct * 0.3 + challengePct * 0.3 + quizPct * 0.4;
  if (overall >= 80) return 3;
  if (overall >= 55) return 2;
  return 1;
}

export const LEVEL4_BADGE = {
  id: 'solar_engineer',
  title: 'Solar Engineer',
  description: 'Mastered solar energy and sustainable living!',
  icon: '\u{2600}\u{FE0F}',
  coins: 100,
};

// ═══ DIALOGUE ═══
export const ENTRY_DIALOGUE = [
  'There is a solution\u{2026}',
  'Clean energy from the sun \u{2600}\u{FE0F}',
  'Let\u{2019}s rebuild using solar power!',
];

export const FINAL_MESSAGE = [
  'The sun gives free energy every day.',
  'Using solar can power your future.',
  'You are now a Solar Engineer!',
];

// ═══ ICONS ═══
export const L4_ICONS = {
  sun: '\u{2600}\u{FE0F}', panel: '\u{1FA9F}', zap: '\u{26A1}',
  battery: '\u{1F50B}', globe: '\u{1F30D}', tree: '\u{1F333}',
  money: '\u{1F4B0}', chart: '\u{1F4CA}', check: '\u{2705}',
  cross: '\u{274C}', star: '\u{2B50}', trophy: '\u{1F3C6}',
  coin: '\u{1FA99}', bulb: '\u{1F4A1}', brain: '\u{1F9E0}',
  target: '\u{1F3AF}', clock: '\u{23F1}\u{FE0F}',
  leaf: '\u{1F33F}', wind: '\u{1F32C}\u{FE0F}',
  shield: '\u{1F6E1}\u{FE0F}', grad: '\u{1F393}',
  pin: '\u{1F4CD}', sparkle: '\u{2728}', muscle: '\u{1F4AA}',
  house: '\u{1F3E0}', wrench: '\u{1F527}', gear: '\u{2699}\u{FE0F}',
  down: '\u{2B07}\u{FE0F}', up: '\u{2B06}\u{FE0F}',
  warn: '\u{26A0}\u{FE0F}', party: '\u{1F389}',
  cloud: '\u{2601}\u{FE0F}', night: '\u{1F303}',
  sunrise: '\u{1F305}', book: '\u{1F4D8}',
};

export const ROOM_ICONS = {
  'Living Room': '\u{1F6CB}\u{FE0F}', 'Bedroom': '\u{1F6CF}\u{FE0F}',
  'Kitchen': '\u{1F373}', 'Bathroom': '\u{1F6BF}', 'Rooftop': '\u{1F3E0}',
};
