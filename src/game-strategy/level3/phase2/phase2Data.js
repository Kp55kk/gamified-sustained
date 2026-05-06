// ═══════════════════════════════════════════════════════════
//  LEVEL 3 — PHASE 2 (ULTIMATE VERSION)
//  "HOW CAN WE SAVE OUR FUTURE?"
//  House becomes a live sustainability laboratory
// ═══════════════════════════════════════════════════════════

// ─── SOUND EFFECT CONFIGS ───
export const SFX = {
  sweep:    { freq: [300, 800], dur: 0.25, type: 'sine',     vol: 0.10 },
  dig:      { freq: [120, 80],  dur: 0.20, type: 'sawtooth', vol: 0.08 },
  water:    { freq: [600, 1200],dur: 0.35, type: 'sine',     vol: 0.06 },
  plant:    { freq: [400, 600], dur: 0.30, type: 'triangle', vol: 0.09 },
  grow:     { freq: [300, 500, 700], dur: 0.50, type: 'triangle', vol: 0.07 },
  scan:     { freq: [900, 1100],dur: 0.15, type: 'square',   vol: 0.05 },
  panel:    { freq: [500, 700], dur: 0.25, type: 'triangle', vol: 0.08 },
  solar:    { freq: [800, 1000, 1200], dur: 0.40, type: 'sine', vol: 0.06 },
  wind:     { freq: [200, 150], dur: 0.50, type: 'sine',     vol: 0.04 },
  turbine:  { freq: [350, 500], dur: 0.30, type: 'triangle', vol: 0.07 },
  storm:    { freq: [80, 60],   dur: 0.60, type: 'sawtooth', vol: 0.06 },
  toggle:   { freq: [700, 900], dur: 0.12, type: 'square',   vol: 0.06 },
  charge:   { freq: [400, 600, 800, 1000], dur: 0.60, type: 'sine', vol: 0.05 },
  whoosh:   { freq: [500, 200], dur: 0.30, type: 'sine',     vol: 0.05 },
  reveal:   { freq: [523, 659, 784], dur: 0.50, type: 'triangle', vol: 0.08 },
  ambient:  { freq: [220], dur: 2.0, type: 'sine', vol: 0.02 },
};

// ─── INTRO DIALOGUE ───
export const INTRO_DIALOGUE = [
  { speaker: 'narration', text: 'You step outside the house…' },
  { speaker: 'narration', text: 'The environment is still polluted from all that energy overuse.' },
  { speaker: 'narration', text: 'Dark clouds hang low. Heat waves shimmer. The garden is dry and barren.' },
  { speaker: 'teacher', text: '"We cannot stop using electricity…"' },
  { speaker: 'teacher', text: '"But we CAN reduce its damage."' },
  { speaker: 'teacher', text: '"Let us transform THIS home into a sustainable home."' },
  { speaker: 'narration', text: 'The teacher points toward the house. A journey of transformation begins.' },
];

// ─── PHASE SEGMENTS ───
export const SEGMENTS = [
  {
    id: 'trees',
    title: 'Trees — Green Transformation',
    subtitle: 'Transform the surroundings',
    icon: '🌳',
    color: '#22c55e',
    description: 'Transform the barren, polluted land around your home into a lush green garden that absorbs CO₂ and cools the environment.',
    duration: '5–6 minutes',
  },
  {
    id: 'solar',
    title: 'Solar — House Evolution',
    subtitle: 'Power from the Sun',
    icon: '☀️',
    color: '#f59e0b',
    description: 'Evolve your home into a smart solar house. Scan energy, install panels, and watch the house transform.',
    duration: '8–10 minutes',
  },
  {
    id: 'wind',
    title: 'Wind — Support System',
    subtitle: 'Renewable backup',
    icon: '🌬️',
    color: '#3b82f6',
    description: 'Install wind turbines in the open field nearby. Renewables work best together — wind supports solar.',
    duration: '4–5 minutes',
  },
];

// ═══════════════════════════════════════════════════════════
//  PART 1 — TREE TRANSFORMATION SYSTEM
// ═══════════════════════════════════════════════════════════

export const TREE_TYPES = [
  {
    id: 'neem', name: 'Neem Tree', icon: '🌿',
    co2PerYear: '48 kg', co2Value: 48, shade: 'Large',
    growthYears: '5–8 years', futureHeight: '15–20m',
    description: 'High CO₂ absorption, natural pest repellent',
    color: '#166534', bestFor: 'Maximum CO₂ reduction',
  },
  {
    id: 'banyan', name: 'Banyan Tree', icon: '🌳',
    co2PerYear: '22 kg', co2Value: 22, shade: 'Massive',
    growthYears: '10–15 years', futureHeight: '20–30m',
    description: 'Massive oxygen producer, enormous shade',
    color: '#15803d', bestFor: 'Long-term shade & oxygen',
  },
  {
    id: 'mango', name: 'Mango Tree', icon: '🥭',
    co2PerYear: '35 kg', co2Value: 35, shade: 'Medium',
    growthYears: '5–8 years', futureHeight: '10–15m',
    description: 'Good CO₂ absorption, provides fruit',
    color: '#047857', bestFor: 'Food + carbon offset',
  },
  {
    id: 'decorative', name: 'Decorative Plant', icon: '🌸',
    co2PerYear: '5 kg', co2Value: 5, shade: 'Small',
    growthYears: '1–2 years', futureHeight: '1–2m',
    description: 'Low CO₂ impact, adds beauty only',
    color: '#65a30d', bestFor: 'Aesthetics only',
  },
];

export const TREE_TASKS = [
  {
    id: 'survey', label: 'Survey the garden', icon: '👁️',
    instruction: 'Look at the barren, polluted surroundings',
    feedback: 'The land is dry and lifeless. Time to change that.',
    sfx: 'whoosh', auto: true, autoDur: 3500,
  },
  {
    id: 'select_trees', label: 'Choose tree types', icon: '🌿',
    instruction: 'Select which trees to plant strategically',
    feedback: 'Great choices! Strategic planting maximizes CO₂ absorption.',
    sfx: 'reveal', interactive: 'tree_select',
  },
  {
    id: 'clear_waste', label: 'Clear dry waste', icon: '🧹',
    instruction: 'Tap the debris to clear the garden',
    feedback: 'Garden cleared! The soil is ready.',
    sfx: 'sweep', interactive: 'debris_clear',
  },
  {
    id: 'dig_soil', label: 'Dig planting holes', icon: '⛏️',
    instruction: 'Press E to dig holes for each tree',
    feedback: 'Holes dug! Soil particles settling…',
    sfx: 'dig',
  },
  {
    id: 'add_water', label: 'Connect water pipeline', icon: '💧',
    instruction: 'Press E to lay down the irrigation line',
    feedback: 'Water pipeline connected! Flow beginning…',
    sfx: 'water',
  },
  {
    id: 'plant', label: 'Plant the trees', icon: '🌱',
    instruction: 'Press E to plant trees at each spot',
    feedback: 'Trees planted! Now watch them grow…',
    sfx: 'plant',
  },
  {
    id: 'grow', label: 'Time progression', icon: '⏩',
    instruction: 'Watch years pass — the environment transforms',
    feedback: 'Years have passed. The garden is alive!',
    sfx: 'grow', auto: true, autoDur: 8000,
  },
  {
    id: 'observe', label: 'Observe the transformation', icon: '🌡️',
    instruction: 'Notice temperature drop, shade, cleaner air',
    feedback: 'Trees reduced outdoor temperature by 2–4°C!',
    sfx: 'reveal', auto: true, autoDur: 4000,
  },
  {
    id: 'absorb', label: 'CO₂ absorption demo', icon: '💨',
    instruction: 'Watch CO₂ particles being absorbed by trees',
    feedback: 'Trees absorb CO₂ slowly but surely — a long-term solution.',
    sfx: 'whoosh', auto: true, autoDur: 5000,
  },
];

export const TOTAL_TREES_TO_PLANT = 5;

export const GARDEN_SPOTS = [
  { pos: [-8, 0, -6], label: 'Front Left' },
  { pos: [-8, 0, 6], label: 'Front Right' },
  { pos: [8, 0, -6], label: 'Back Left' },
  { pos: [8, 0, 6], label: 'Back Right' },
  { pos: [0, 0, 10], label: 'Side Garden' },
];

export const DEBRIS_POSITIONS = [
  [-6, 0.1, -4], [-3, 0.1, 7], [5, 0.1, -5],
  [7, 0.1, 3], [-5, 0.1, 9], [3, 0.1, -8],
];

// ═══════════════════════════════════════════════════════════
//  PART 2 — SOLAR HOUSE EVOLUTION
// ═══════════════════════════════════════════════════════════

export const ENERGY_SCANNER_DATA = [
  { id: 'ac', name: 'Air Conditioner', icon: '❄️', watts: 1500, co2: 1.07, bill: 2250, category: 'heavy' },
  { id: 'geyser', name: 'Water Heater', icon: '🔥', watts: 2000, co2: 1.42, bill: 3000, category: 'heavy' },
  { id: 'fridge', name: 'Refrigerator', icon: '🧊', watts: 150, co2: 0.11, bill: 225, category: 'medium' },
  { id: 'lights', name: 'All Lights', icon: '💡', watts: 300, co2: 0.21, bill: 450, category: 'medium' },
  { id: 'fan', name: 'Ceiling Fan', icon: '🌀', watts: 70, co2: 0.05, bill: 105, category: 'low' },
  { id: 'tv', name: 'Television', icon: '📺', watts: 100, co2: 0.07, bill: 150, category: 'low' },
];

export const SOLAR_TASKS = [
  {
    id: 'energy_scan', label: 'Energy Scanner', icon: '🔍',
    instruction: 'Scan each appliance to see energy consumption',
    feedback: 'Energy map complete! AC & Geyser consume the most.',
    sfx: 'scan', interactive: 'energy_scan',
  },
  {
    id: 'scan_results', label: 'Analyze energy map', icon: '📊',
    instruction: 'See which appliances waste the most energy',
    feedback: 'The wiring shows energy flowing through the house.',
    sfx: 'reveal', auto: true, autoDur: 4000,
  },
  {
    id: 'roof_inspect', label: 'Rooftop inspection', icon: '🏠',
    instruction: 'Press E to inspect the roof for panel placement',
    feedback: 'Roof is suitable! Good sun exposure all day.',
    sfx: 'whoosh',
  },
  {
    id: 'place_panel_1', label: 'Install Panel 1', icon: '🔲',
    instruction: 'Press E to mount the first solar panel',
    feedback: 'Panel 1 secured on the roof!',
    sfx: 'panel',
  },
  {
    id: 'place_panel_2', label: 'Install Panel 2', icon: '🔲',
    instruction: 'Press E to mount the second panel',
    feedback: 'Panel 2 locked in place!',
    sfx: 'panel',
  },
  {
    id: 'place_panel_3', label: 'Install Panel 3', icon: '🔲',
    instruction: 'Press E to mount the third panel',
    feedback: 'All 3 panels installed! Now orient them.',
    sfx: 'panel',
  },
  {
    id: 'orient', label: 'Orient panels south', icon: '🧭',
    instruction: 'Use ← → arrows to face panels SOUTH',
    feedback: 'Panels aligned! Starting sun simulation.',
    sfx: 'toggle', interactive: 'orient',
  },
  {
    id: 'sun_sim', label: 'Sun path simulation', icon: '☀️',
    instruction: 'Watch the sun arc — panels generate energy',
    feedback: 'Solar energy flowing into the house!',
    sfx: 'solar', auto: true, autoDur: 6000,
  },
  {
    id: 'solar_mode', label: 'Switch to Solar mode', icon: '🔄',
    instruction: 'Press E to toggle the house from Grid to Solar',
    feedback: 'House now runs on solar! Watch the transformation.',
    sfx: 'toggle',
  },
  {
    id: 'live_compare', label: 'Grid vs Solar comparison', icon: '📊',
    instruction: 'See the live difference in CO₂, bill, pollution',
    feedback: 'Solar reduces CO₂ by 90% and bill by 70%!',
    sfx: 'reveal', auto: true, autoDur: 5000,
  },
  {
    id: 'battery_charge', label: 'Battery storage', icon: '🔋',
    instruction: 'Watch excess solar energy charge the battery',
    feedback: 'Battery storing energy for evening use!',
    sfx: 'charge', auto: true, autoDur: 4000,
  },
  {
    id: 'peak_hour', label: 'Peak hour challenge', icon: '⚡',
    instruction: 'Evening peak! Press E to use battery instead of grid',
    feedback: 'Battery powers the home during peak hours! Bill saved!',
    sfx: 'charge',
  },
];

export const PANEL_ORIENTATIONS = [
  { label: 'North', angle: 0, efficiency: 0.3, icon: '⬆️' },
  { label: 'East', angle: 90, efficiency: 0.6, icon: '➡️' },
  { label: 'South', angle: 180, efficiency: 1.0, icon: '⬇️', correct: true },
  { label: 'West', angle: 270, efficiency: 0.6, icon: '⬅️' },
];

export const GRID_VS_SOLAR = {
  grid:  { co2: '4.2 tons/yr', bill: '₹8,400/mo', pollution: 'High', source: 'Coal Power Plant' },
  solar: { co2: '0.2 tons/yr', bill: '₹1,200/mo', pollution: 'Near Zero', source: 'Rooftop Panels' },
};

export const TIME_OF_DAY = [
  { id: 'morning',   label: '6 AM',  sunAngle: 0.15, solarOutput: 40,  description: 'Sun rising' },
  { id: 'noon',      label: '12 PM', sunAngle: 0.50, solarOutput: 100, description: 'Peak sunlight' },
  { id: 'afternoon', label: '3 PM',  sunAngle: 0.70, solarOutput: 75,  description: 'Good output' },
  { id: 'evening',   label: '6 PM',  sunAngle: 0.90, solarOutput: 15,  description: 'Battery kicks in' },
  { id: 'night',     label: '9 PM',  sunAngle: 1.00, solarOutput: 0,   description: 'Wind support' },
];

// ═══════════════════════════════════════════════════════════
//  PART 3 — WIND SUPPORT SYSTEM (TURBINES OUTSIDE)
// ═══════════════════════════════════════════════════════════

// Wind turbines placed in the open field OUTSIDE the house
// (visible from drone view established in Level 1)
export const WIND_TURBINE_POSITIONS = [
  { pos: [-20, 0, -18], label: 'Field Turbine A' },
  { pos: [22, 0, -20],  label: 'Field Turbine B' },
  { pos: [-22, 0, 18],  label: 'Field Turbine C' },
];

export const WIND_TASKS = [
  {
    id: 'field_survey', label: 'Survey the open field', icon: '🌍',
    instruction: 'Look at the empty fields around the house',
    feedback: 'Open fields are perfect for wind turbines!',
    sfx: 'whoosh', auto: true, autoDur: 3500,
  },
  {
    id: 'install_turbine_1', label: 'Install Turbine A', icon: '🔧',
    instruction: 'Press E to install the first wind turbine',
    feedback: 'Turbine A erected in the field!',
    sfx: 'turbine',
  },
  {
    id: 'install_turbine_2', label: 'Install Turbine B', icon: '🔧',
    instruction: 'Press E to install the second turbine',
    feedback: 'Turbine B is up! Blades starting to spin.',
    sfx: 'turbine',
  },
  {
    id: 'install_turbine_3', label: 'Install Turbine C', icon: '🔧',
    instruction: 'Press E to install the third turbine',
    feedback: 'All turbines installed in the field!',
    sfx: 'turbine',
  },
  {
    id: 'observe_spin', label: 'Watch the blades', icon: '🌀',
    instruction: 'Observe blade speed changing with wind',
    feedback: 'Blades respond to wind speed in real time.',
    sfx: 'wind', auto: true, autoDur: 4000,
  },
  {
    id: 'day_support', label: 'Daytime observation', icon: '☀️',
    instruction: 'During day — solar handles most power',
    feedback: 'Solar dominant during daytime, wind minimal.',
    sfx: 'solar', auto: true, autoDur: 3500,
  },
  {
    id: 'night_support', label: 'Night support', icon: '🌙',
    instruction: 'Night falls — solar stops, wind picks up!',
    feedback: 'Wind turbines provide 30% power at night!',
    sfx: 'wind', auto: true, autoDur: 4000,
  },
  {
    id: 'storm_test', label: 'Storm weather test', icon: '⛈️',
    instruction: 'Storm incoming! Watch solar drop, wind surge!',
    feedback: 'During storms, wind compensates for weak solar!',
    sfx: 'storm', auto: true, autoDur: 5000,
  },
  {
    id: 'combined_view', label: 'Combined renewable energy', icon: '♻️',
    instruction: 'Solar + Wind + Battery = 24/7 clean energy',
    feedback: 'Combining renewables gives reliable clean power!',
    sfx: 'reveal', auto: true, autoDur: 5000,
  },
];

export const WIND_SPEED_SEQUENCE = [
  { speed: 2, label: 'Calm', duration: 2500 },
  { speed: 5, label: 'Light Breeze', duration: 2500 },
  { speed: 3, label: 'Dropping…', duration: 2000 },
  { speed: 8, label: 'Strong Wind!', duration: 2500 },
  { speed: 12, label: 'Storm!', duration: 2000 },
  { speed: 4, label: 'Dying Down…', duration: 2500 },
  { speed: 1, label: 'Almost Still', duration: 2000 },
  { speed: 7, label: 'Good Wind', duration: 2500 },
];

export const WEATHER_STATES = [
  { id: 'clear', label: 'Clear Sky', solarEff: 1.0, windEff: 0.3, icon: '☀️' },
  { id: 'cloudy', label: 'Cloudy', solarEff: 0.4, windEff: 0.6, icon: '☁️' },
  { id: 'storm', label: 'Storm', solarEff: 0.1, windEff: 1.0, icon: '⛈️' },
  { id: 'night', label: 'Night', solarEff: 0.0, windEff: 0.5, icon: '🌙' },
];

// ═══════════════════════════════════════════════════════════
//  DATA POPUPS (after each segment)
// ═══════════════════════════════════════════════════════════

export const DATA_POPUPS = {
  trees: {
    title: 'Tree Impact Report', icon: '🌳',
    facts: [
      'Your trees will absorb ~200 kg CO₂ per year combined',
      'Shade from trees reduces AC need by 15–25%',
      'Trees take 5–20 years for peak absorption',
      'Best species: Neem (48 kg/yr), Mango (35 kg/yr)',
      'Trees also reduce ambient temperature by 2–4°C',
    ],
    conclusion: '🌿 Trees are a slow but essential long-term solution',
  },
  solar: {
    title: 'Solar Impact Report', icon: '☀️',
    facts: [
      'Your 3 kW system reduces ~3–5 tons CO₂ per year — immediately!',
      'Monthly bill drops from ₹8,400 to ₹1,200',
      'Panels last 25+ years with minimal maintenance',
      'Government subsidy: up to ₹78,000 available',
      'Battery storage enables peak-hour independence',
    ],
    conclusion: '☀️ Solar gives the fastest, most practical CO₂ reduction for homes',
  },
  wind: {
    title: 'Wind Support Report', icon: '🌬️',
    facts: [
      'Field turbines provide backup during low-solar periods',
      'Wind + Solar + Battery = near 24/7 clean power',
      'Wind alone is unreliable — needs consistent 4+ m/s',
      'Best as supplement, not primary home source',
      'Open fields nearby are ideal turbine locations',
    ],
    conclusion: '🌬️ Wind works best as a support to solar energy',
  },
};

// ═══════════════════════════════════════════════════════════
//  COMPARISON & REALIZATION
// ═══════════════════════════════════════════════════════════

export const COMPARISON_DATA = [
  {
    id: 'solar', label: 'Solar Energy', icon: '☀️', color: '#f59e0b',
    reductionPercent: 90, speed: 'Immediate', co2PerYear: '~3–5 tons',
    cost: '₹1.5–3 lakh (subsidy available)', timeToEffect: 'Day 1',
    bestFor: 'Any home with a rooftop', barWidth: 90,
  },
  {
    id: 'wind', label: 'Wind Support', icon: '🌬️', color: '#3b82f6',
    reductionPercent: 30, speed: 'When windy', co2PerYear: '~1–2 tons',
    cost: '₹1–5 lakh', timeToEffect: 'Variable',
    bestFor: 'Backup for solar', barWidth: 30,
  },
  {
    id: 'trees', label: 'Tree Planting', icon: '🌳', color: '#22c55e',
    reductionPercent: 15, speed: '5–20 years', co2PerYear: '~0.2–0.5 tons',
    cost: 'Very Low', timeToEffect: '10–20 years',
    bestFor: 'Cooling + long-term', barWidth: 15,
  },
];

export const HOUSE_TRANSFORMATION = {
  before: ['Polluted surroundings', 'High electricity bill ₹8,400/mo', 'Overheated rooms', 'Dark smoky sky', 'Dry barren garden'],
  after:  ['Green lush garden', 'Bill reduced to ₹1,200/mo', 'Trees shade the house', 'Clean blue sky', 'Solar roof glowing', 'Wind turbines in the field'],
};

export const REALIZATION_LINES = [
  { speaker: 'narration', text: 'Look at what we\'ve achieved together…' },
  { speaker: 'narration', text: 'The barren land is now a green garden. Trees absorb CO₂ slowly but surely.' },
  { speaker: 'narration', text: 'The rooftop solar panels power the entire house — clean, free energy.' },
  { speaker: 'narration', text: 'Wind turbines in the field support during night and storms.' },
  { speaker: 'teacher', text: '"Trees help slowly…"' },
  { speaker: 'teacher', text: '"Wind supports when possible…"' },
  { speaker: 'teacher', text: '"But solar energy can transform EVERY home."' },
  { speaker: 'teacher', text: '"The best strategy? Combine all three."' },
];

export const TRANSITION_LINE = 'LEVEL 4 — SOLAR REVOLUTION';

// ═══════════════════════════════════════════════════════════
//  QUIZ
// ═══════════════════════════════════════════════════════════

export const PHASE2_QUIZ = [
  {
    question: 'Which tree has the highest CO₂ absorption per year?',
    options: ['Decorative Plant (~5 kg)', 'Banyan (~22 kg)', 'Neem (~48 kg)', 'Mango (~35 kg)'],
    correctIndex: 2,
    explanation: 'Neem trees absorb approximately 48 kg of CO₂ per year — the highest among common Indian trees.',
  },
  {
    question: 'Which direction should solar panels face in India?',
    options: ['North', 'East', 'South', 'West'],
    correctIndex: 2,
    explanation: 'In the Northern Hemisphere (India), panels face South for maximum sunlight throughout the day.',
  },
  {
    question: 'How much can a 3 kW solar system reduce CO₂ per year?',
    options: ['~50 kg', '~500 kg', '~1 ton', '~3–5 tons'],
    correctIndex: 3,
    explanation: 'A 3 kW rooftop solar system reduces approximately 3–5 tons of CO₂ per year.',
  },
  {
    question: 'When does wind energy support solar the most?',
    options: ['At noon', 'At night and during storms', 'In summer only', 'Never'],
    correctIndex: 1,
    explanation: 'Wind supports solar at night (no sun) and during storms (clouds block sun, but wind is strong).',
  },
  {
    question: 'Which gives the FASTEST CO₂ reduction for a home?',
    options: ['Planting 100 trees', 'Rooftop solar panels', 'Small wind turbine', 'Using less electricity'],
    correctIndex: 1,
    explanation: 'Solar panels provide IMMEDIATE CO₂ reduction from Day 1.',
  },
  {
    question: 'Where are wind turbines best placed near a home?',
    options: ['On the rooftop', 'Inside the garden', 'In open fields nearby', 'Underground'],
    correctIndex: 2,
    explanation: 'Wind turbines need open, unobstructed space for consistent wind flow — open fields are ideal.',
  },
];

// ─── BADGE & SCORING ───
export const PHASE2_BADGE = {
  icon: '🏡',
  name: 'Sustainability Pioneer',
  description: 'You transformed a polluted home into a sustainable living space!',
  coins: 80,
};

export function calculateP2Stars(segmentsCompleted, totalSegments, quizScore, totalQuestions) {
  let s = 0;
  if (segmentsCompleted >= totalSegments) s++;
  if (quizScore >= Math.ceil(totalQuestions * 0.6)) s++;
  if (quizScore >= totalQuestions - 1) s++;
  return s;
}

// ─── CO₂ METER LEVELS ───
export const CO2_REDUCTION_LEVELS = {
  initial: 100,
  afterTrees: 75,
  afterSolar: 20,
  afterWind: 10,
  target: 10,
};
