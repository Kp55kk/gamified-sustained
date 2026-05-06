// ═══════════════════════════════════════════════════════════
//  LEVEL 3 — PHASE 2 DATA: Solutions to Reduce CO₂ Emissions
//  Three segments: Trees, Solar Energy, Wind Energy
// ═══════════════════════════════════════════════════════════

// ─── INTRO DIALOGUE (transition from Phase 1) ───
export const INTRO_DIALOGUE = [
  { speaker: 'teacher', text: 'You have seen the problem…' },
  { speaker: 'teacher', text: 'Burning coal for electricity releases massive CO₂ into our atmosphere.' },
  { speaker: 'teacher', text: 'Now let\'s explore how we can reduce CO₂ emissions.' },
  { speaker: 'teacher', text: 'Three powerful solutions exist…' },
];

// ─── SEGMENT METADATA ───
export const SEGMENTS = [
  {
    id: 'trees',
    title: 'Trees — Carbon Absorption',
    subtitle: 'Nature\'s CO₂ Filter',
    icon: '🌳',
    color: '#22c55e',
    description: 'Plant trees to absorb CO₂ from the atmosphere naturally.',
    envDescription: 'Empty barren land transforms into green plantation zone',
  },
  {
    id: 'solar',
    title: 'Solar Energy — Clean Electricity',
    subtitle: 'Power From The Sun',
    icon: '☀️',
    color: '#f59e0b',
    description: 'Install solar panels to generate clean, renewable electricity.',
    envDescription: 'House rooftop with solar panel installation',
  },
  {
    id: 'wind',
    title: 'Wind Energy — Renewable Power',
    subtitle: 'Harnessing The Wind',
    icon: '🌬️',
    color: '#3b82f6',
    description: 'Set up wind turbines to generate electricity from wind.',
    envDescription: 'Open elevated land with wind turbines',
  },
];

// ─── TREE SEGMENT TASKS ───
export const TREE_TASKS = [
  {
    id: 'dig',
    label: 'Dig the ground',
    instruction: 'Press E to dig a hole in the marked spot',
    icon: '⛏️',
    feedback: 'Ground prepared! Ready for planting.',
  },
  {
    id: 'plant',
    label: 'Place the sapling',
    instruction: 'Press E to plant the sapling',
    icon: '🌱',
    feedback: 'Sapling planted! Now it needs water.',
  },
  {
    id: 'water',
    label: 'Water the sapling',
    instruction: 'Press E to water the young tree',
    icon: '💧',
    feedback: 'Watered! Watch it grow…',
  },
  {
    id: 'grow',
    label: 'Watch it grow',
    instruction: 'Observe the fast-forward growth animation',
    icon: '🌿',
    feedback: 'The tree is growing rapidly!',
    auto: true,
  },
  {
    id: 'absorb',
    label: 'CO₂ absorption',
    instruction: 'Watch the tree absorb CO₂ particles',
    icon: '💨',
    feedback: 'CO₂ particles are being absorbed!',
    auto: true,
  },
];

// Number of trees player plants total
export const TOTAL_TREES_TO_PLANT = 5;

// ─── SOLAR SEGMENT TASKS ───
export const SOLAR_TASKS = [
  {
    id: 'place_panel_1',
    label: 'Place first solar panel',
    instruction: 'Press E on the roof grid slot to install a panel',
    icon: '🔲',
    feedback: 'Panel 1 installed!',
  },
  {
    id: 'place_panel_2',
    label: 'Place second solar panel',
    instruction: 'Press E on the next slot',
    icon: '🔲',
    feedback: 'Panel 2 installed!',
  },
  {
    id: 'place_panel_3',
    label: 'Place third solar panel',
    instruction: 'Press E on the next slot',
    icon: '🔲',
    feedback: 'Panel 3 installed!',
  },
  {
    id: 'orient',
    label: 'Orient panels south',
    instruction: 'Use ← → arrows to rotate panels. Face them SOUTH for max output!',
    icon: '🧭',
    feedback: 'Panels aligned south — maximum sunlight!',
  },
  {
    id: 'sun_sim',
    label: 'Sun simulation',
    instruction: 'Watch the sun move across the sky and generate energy',
    icon: '☀️',
    feedback: 'Solar energy is flowing to the house!',
    auto: true,
  },
  {
    id: 'power_house',
    label: 'Power the house',
    instruction: 'Watch appliances run on clean solar energy',
    icon: '🏠',
    feedback: 'The house is running on 100% solar power!',
    auto: true,
  },
];

// Solar panel orientation options
export const PANEL_ORIENTATIONS = [
  { label: 'North', angle: 0, efficiency: 0.3, icon: '⬆️' },
  { label: 'East', angle: 90, efficiency: 0.6, icon: '➡️' },
  { label: 'South', angle: 180, efficiency: 1.0, icon: '⬇️', correct: true },
  { label: 'West', angle: 270, efficiency: 0.6, icon: '⬅️' },
];

// ─── WIND SEGMENT TASKS ───
export const WIND_TASKS = [
  {
    id: 'install_turbine',
    label: 'Install wind turbine',
    instruction: 'Press E to install the turbine on the platform',
    icon: '🔧',
    feedback: 'Turbine installed! Waiting for wind…',
  },
  {
    id: 'wind_speed',
    label: 'Check wind speed',
    instruction: 'Observe the wind speed meter',
    icon: '🌡️',
    feedback: 'Wind speed detected!',
    auto: true,
  },
  {
    id: 'low_wind',
    label: 'Low wind test',
    instruction: 'Watch: low wind = slow rotation = little power',
    icon: '🍃',
    feedback: 'Low wind — barely any power generated.',
    auto: true,
  },
  {
    id: 'high_wind',
    label: 'High wind test',
    instruction: 'Watch: high wind = fast rotation = more power!',
    icon: '💨',
    feedback: 'Strong wind — turbine spinning fast!',
    auto: true,
  },
  {
    id: 'inconsistent',
    label: 'Notice inconsistency',
    instruction: 'Wind keeps changing — power output is unstable',
    icon: '📊',
    feedback: 'Wind is unreliable — energy output varies greatly.',
    auto: true,
  },
];

// Wind speed simulation keyframes
export const WIND_SPEED_SEQUENCE = [
  { speed: 2, label: 'Calm', duration: 3000 },
  { speed: 5, label: 'Light Breeze', duration: 3000 },
  { speed: 3, label: 'Dropping...', duration: 2000 },
  { speed: 8, label: 'Strong Wind!', duration: 3000 },
  { speed: 12, label: 'Very Strong!', duration: 2000 },
  { speed: 4, label: 'Dying Down...', duration: 3000 },
  { speed: 1, label: 'Almost Still', duration: 2000 },
  { speed: 6, label: 'Moderate', duration: 3000 },
];

// ─── DATA POPUPS (research-backed) ───
export const DATA_POPUPS = {
  trees: {
    title: 'Tree Carbon Facts',
    icon: '🌳',
    facts: [
      'One tree absorbs ~10–48 kg CO₂ per year',
      'A household needs 200–800 trees to fully offset its annual CO₂',
      'Trees take 20–30 years to reach peak carbon absorption',
      'Best species in India: Teak, Eucalyptus, Neem, Banyan',
    ],
    conclusion: 'Trees reduce CO₂ slowly — a long-term solution',
    reductionSpeed: 'slow',
  },
  solar: {
    title: 'Solar Energy Facts',
    icon: '☀️',
    facts: [
      '1 kW solar reduces ~1 ton CO₂ per year',
      'A 3 kW system generates ~12–15 units (kWh) per day',
      'Solar panels last 25+ years with minimal maintenance',
      'India subsidy: up to ₹78,000 for home solar installation',
    ],
    conclusion: 'Solar gives the fastest and most practical CO₂ reduction for homes',
    reductionSpeed: 'fast',
  },
  wind: {
    title: 'Wind Energy Facts',
    icon: '🌬️',
    facts: [
      'Wind turbines need consistent winds above 4 m/s',
      'A 2 kW turbine might produce ~3,000–5,000 kWh/year in ideal conditions',
      'Small wind turbines cost ₹1–5 lakh',
      'Only works well in coastal, hilltop, or open rural areas',
    ],
    conclusion: 'Wind works only in specific locations — not suitable everywhere',
    reductionSpeed: 'conditional',
  },
};

// ─── COMPARISON DATA ───
export const COMPARISON_DATA = [
  {
    id: 'solar',
    label: 'Solar Energy',
    icon: '☀️',
    color: '#f59e0b',
    reductionPercent: 90,
    speed: 'Fast',
    co2PerYear: '~3–5 tons',
    cost: 'Medium',
    timeToEffect: 'Immediate',
    bestFor: 'Any home with a rooftop',
    barWidth: 90,
  },
  {
    id: 'wind',
    label: 'Wind Energy',
    icon: '🌬️',
    color: '#3b82f6',
    reductionPercent: 55,
    speed: 'Moderate',
    co2PerYear: '~2–3 tons',
    cost: 'High',
    timeToEffect: 'Quick (if windy)',
    bestFor: 'Coastal/hilltop areas only',
    barWidth: 55,
  },
  {
    id: 'trees',
    label: 'Tree Planting',
    icon: '🌳',
    color: '#22c55e',
    reductionPercent: 25,
    speed: 'Slow',
    co2PerYear: '~0.5–2 tons (100 trees)',
    cost: 'Very Low',
    timeToEffect: '10–20 years',
    bestFor: 'Long-term + biodiversity',
    barWidth: 25,
  },
];

// ─── REALIZATION / CONCLUSION DIALOGUE ───
export const REALIZATION_LINES = [
  { speaker: 'teacher', text: 'You have now experienced all three solutions…' },
  { speaker: 'narration', text: 'Trees absorb CO₂ naturally — but slowly, over decades.' },
  { speaker: 'narration', text: 'Wind energy works — but only where wind blows strong and steady.' },
  { speaker: 'teacher', text: 'But for homes like yours…' },
  { speaker: 'teacher', text: 'Solar energy gives the fastest and most practical results.' },
  { speaker: 'narration', text: 'A 3 kW rooftop solar system can offset ~3–5 tons of CO₂ per year — immediately.' },
  { speaker: 'teacher', text: 'The best strategy? Combine solar + trees for maximum impact.' },
];

// ─── TRANSITION TO LEVEL 4 ───
export const TRANSITION_LINE = 'In the next level, you will learn how to use solar energy in your own home.';

// ─── QUIZ ───
export const PHASE2_QUIZ = [
  {
    question: 'How much CO₂ does one tree absorb per year on average?',
    options: ['1–5 kg', '10–48 kg', '100–200 kg', '500+ kg'],
    correctIndex: 1,
    explanation: 'A single tree absorbs approximately 10–48 kg of CO₂ per year, depending on species, age, and climate.',
  },
  {
    question: 'Which direction should solar panels face in India for maximum output?',
    options: ['North', 'East', 'South', 'West'],
    correctIndex: 2,
    explanation: 'In the Northern Hemisphere (India), solar panels should face South to receive maximum sunlight throughout the day.',
  },
  {
    question: 'How much CO₂ can 1 kW of solar panels reduce per year?',
    options: ['~10 kg', '~100 kg', '~500 kg', '~1 ton (1,000 kg)'],
    correctIndex: 3,
    explanation: '1 kW of solar panels can reduce approximately 1 ton (1,000 kg) of CO₂ per year by displacing grid electricity from coal.',
  },
  {
    question: 'What is the main disadvantage of small wind turbines for homes?',
    options: [
      'They are too heavy',
      'They need consistent strong wind (most areas don\'t have it)',
      'They only work during daytime',
      'They produce too much noise',
    ],
    correctIndex: 1,
    explanation: 'Wind turbines require average wind speeds above 4 m/s. Most urban and suburban areas don\'t have consistent enough wind, making them impractical for most homes.',
  },
  {
    question: 'Which solution provides the FASTEST CO₂ reduction for a typical home?',
    options: ['Planting 100 trees', 'Installing rooftop solar panels', 'Installing a small wind turbine', 'All are equally fast'],
    correctIndex: 1,
    explanation: 'Rooftop solar panels provide IMMEDIATE CO₂ reduction by displacing grid electricity. Trees take decades, and wind needs special conditions.',
  },
];

// ─── BADGE & SCORING ───
export const PHASE2_BADGE = {
  icon: '🌍',
  name: 'Climate Solver',
  description: 'You explored three powerful solutions to reduce CO₂ emissions!',
  coins: 60,
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
  initial: 100,        // Starting CO₂ level (%)
  afterTrees: 80,      // After planting trees
  afterSolar: 35,      // After solar installation
  afterWind: 25,       // After wind (conditional)
  target: 20,          // Target level
};
