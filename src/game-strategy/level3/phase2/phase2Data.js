// ═══════════════════════════════════════════════════════════
//  LEVEL 3 — PHASE 2 (ULTIMATE VERSION)
//  "HOW CAN WE SAVE OUR FUTURE?"
//  House becomes a live sustainability laboratory
// ═══════════════════════════════════════════════════════════

// ─── INTRO DIALOGUE ───
export const INTRO_DIALOGUE = [
  { speaker: 'teacher', text: 'We cannot stop using electricity…' },
  { speaker: 'teacher', text: 'But we CAN reduce its damage.' },
  { speaker: 'teacher', text: 'Let us transform this home into a sustainable home.' },
  { speaker: 'narration', text: 'The house that was overloaded and polluting… can become part of the solution.' },
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
  },
  {
    id: 'solar',
    title: 'Solar — House Evolution',
    subtitle: 'Power from the Sun',
    icon: '☀️',
    color: '#f59e0b',
    description: 'Evolve your home into a smart solar house. Scan energy usage, install panels, and watch the transformation.',
  },
  {
    id: 'wind',
    title: 'Wind — Support System',
    subtitle: 'Renewable backup',
    icon: '🌬️',
    color: '#3b82f6',
    description: 'Install a small wind turbine to support solar during night and storms. Renewables work best together.',
  },
];

// ═══════════════════════════════════════════════════════════
//  PART 1 — TREE TRANSFORMATION SYSTEM
// ═══════════════════════════════════════════════════════════

export const TREE_TYPES = [
  {
    id: 'neem',
    name: 'Neem Tree',
    icon: '🌿',
    co2PerYear: '48 kg',
    co2Value: 48,
    shade: 'Large',
    growthYears: '5-8 years',
    description: 'High CO₂ absorption, natural pest repellent, medicinal value',
    color: '#166534',
    bestFor: 'Maximum CO₂ reduction',
  },
  {
    id: 'banyan',
    name: 'Banyan Tree',
    icon: '🌳',
    co2PerYear: '22 kg',
    co2Value: 22,
    shade: 'Massive',
    growthYears: '10-15 years',
    description: 'Massive oxygen producer, enormous shade, cultural significance',
    color: '#15803d',
    bestFor: 'Long-term shade & oxygen',
  },
  {
    id: 'mango',
    name: 'Mango Tree',
    icon: '🥭',
    co2PerYear: '35 kg',
    co2Value: 35,
    shade: 'Medium',
    growthYears: '5-8 years',
    description: 'Good CO₂ absorption, provides fruit, beautiful canopy',
    color: '#047857',
    bestFor: 'Food + carbon offset',
  },
  {
    id: 'decorative',
    name: 'Decorative Plant',
    icon: '🌸',
    co2PerYear: '5 kg',
    co2Value: 5,
    shade: 'Small',
    growthYears: '1-2 years',
    description: 'Low CO₂ impact but adds beauty. Not effective for carbon reduction.',
    color: '#65a30d',
    bestFor: 'Aesthetics only',
  },
];

export const TREE_TASKS = [
  {
    id: 'select_trees',
    label: 'Choose tree types',
    instruction: 'Select trees to plant around the house garden',
    icon: '🌿',
    feedback: 'Good choices! Let\'s prepare the land.',
  },
  {
    id: 'clear_land',
    label: 'Clear dry waste',
    instruction: 'Press E to clear debris from the garden',
    icon: '🧹',
    feedback: 'Land cleared! Now prepare the soil.',
  },
  {
    id: 'dig_soil',
    label: 'Prepare the soil',
    instruction: 'Press E to dig planting holes',
    icon: '⛏️',
    feedback: 'Soil ready for planting!',
  },
  {
    id: 'plant',
    label: 'Plant the trees',
    instruction: 'Press E to plant your selected trees',
    icon: '🌱',
    feedback: 'Trees planted! Now add water.',
  },
  {
    id: 'water',
    label: 'Set up irrigation',
    instruction: 'Press E to connect water pipeline',
    icon: '💧',
    feedback: 'Water flowing! Watch the growth simulation...',
  },
  {
    id: 'grow',
    label: 'Time progression',
    instruction: 'Watch years pass — environment transforms',
    icon: '⏩',
    feedback: 'Amazing! The surroundings are transformed!',
    auto: true,
  },
  {
    id: 'observe',
    label: 'Observe the impact',
    instruction: 'Notice the temperature drop, shade, and cleaner air',
    icon: '🌡️',
    feedback: 'Trees reduced outdoor temperature by 2-4°C!',
    auto: true,
  },
];

export const TOTAL_TREES_TO_PLANT = 5;

// Tree planting spots around the house
export const GARDEN_SPOTS = [
  { pos: [-8, 0, -8], label: 'Front Left' },
  { pos: [-8, 0, 8], label: 'Front Right' },
  { pos: [8, 0, -8], label: 'Back Left' },
  { pos: [8, 0, 8], label: 'Back Right' },
  { pos: [0, 0, 12], label: 'Side Garden' },
];

// ═══════════════════════════════════════════════════════════
//  PART 2 — SOLAR HOUSE EVOLUTION
// ═══════════════════════════════════════════════════════════

export const ENERGY_SCANNER_DATA = [
  { id: 'ac', name: 'Air Conditioner', icon: '❄️', watts: 1500, co2: 1.07, bill: 2250, category: 'heavy' },
  { id: 'fridge', name: 'Refrigerator', icon: '🧊', watts: 150, co2: 0.11, bill: 225, category: 'medium' },
  { id: 'lights', name: 'All Lights', icon: '💡', watts: 300, co2: 0.21, bill: 450, category: 'medium' },
  { id: 'fan', name: 'Ceiling Fan', icon: '🌀', watts: 70, co2: 0.05, bill: 105, category: 'low' },
  { id: 'geyser', name: 'Water Heater', icon: '🔥', watts: 2000, co2: 1.42, bill: 3000, category: 'heavy' },
  { id: 'tv', name: 'Television', icon: '📺', watts: 100, co2: 0.07, bill: 150, category: 'low' },
];

export const SOLAR_TASKS = [
  {
    id: 'energy_scan',
    label: 'Energy Scanner',
    instruction: 'Scan the house to see energy consumption',
    icon: '🔍',
    feedback: 'Energy map revealed! AC and Geyser consume the most.',
  },
  {
    id: 'roof_inspect',
    label: 'Rooftop inspection',
    instruction: 'Inspect the roof for solar panel placement',
    icon: '🏠',
    feedback: 'Roof is suitable! Good sun exposure.',
  },
  {
    id: 'place_panel_1',
    label: 'Place Panel 1',
    instruction: 'Press E to install the first solar panel',
    icon: '🔲',
    feedback: 'Panel 1 mounted!',
  },
  {
    id: 'place_panel_2',
    label: 'Place Panel 2',
    instruction: 'Press E to install the second panel',
    icon: '🔲',
    feedback: 'Panel 2 mounted!',
  },
  {
    id: 'place_panel_3',
    label: 'Place Panel 3',
    instruction: 'Press E to install the third panel',
    icon: '🔲',
    feedback: 'Panel 3 mounted! Now orient them.',
  },
  {
    id: 'orient',
    label: 'Orient panels south',
    instruction: 'Use ← → arrows to face panels SOUTH for maximum output',
    icon: '🧭',
    feedback: 'Panels aligned! Starting sun simulation.',
  },
  {
    id: 'sun_sim',
    label: 'Sun path simulation',
    instruction: 'Watch the sun move — panels generate clean energy',
    icon: '☀️',
    feedback: 'Solar energy is flowing into the house!',
    auto: true,
  },
  {
    id: 'solar_vs_grid',
    label: 'Grid vs Solar comparison',
    instruction: 'See the live difference between grid and solar power',
    icon: '📊',
    feedback: 'Solar reduces CO₂ by 90% and bill by 70%!',
    auto: true,
  },
  {
    id: 'peak_hour',
    label: 'Peak hour challenge',
    instruction: 'Evening peak! Use stored battery instead of grid',
    icon: '🔋',
    feedback: 'Battery powers the home during peak hours!',
  },
];

export const PANEL_ORIENTATIONS = [
  { label: 'North', angle: 0, efficiency: 0.3, icon: '⬆️' },
  { label: 'East', angle: 90, efficiency: 0.6, icon: '➡️' },
  { label: 'South', angle: 180, efficiency: 1.0, icon: '⬇️', correct: true },
  { label: 'West', angle: 270, efficiency: 0.6, icon: '⬅️' },
];

export const GRID_VS_SOLAR = {
  grid: { co2: '4.2 tons/yr', bill: '₹8,400/mo', pollution: 'High', source: 'Coal Power Plant' },
  solar: { co2: '0.2 tons/yr', bill: '₹1,200/mo', pollution: 'Near Zero', source: 'Rooftop Panels' },
};

export const TIME_OF_DAY = [
  { id: 'morning', label: '6 AM — Morning', sunAngle: 0.15, solarOutput: 40, description: 'Sun rising, moderate output' },
  { id: 'noon', label: '12 PM — Noon', sunAngle: 0.5, solarOutput: 100, description: 'Peak sunlight, maximum generation' },
  { id: 'afternoon', label: '3 PM — Afternoon', sunAngle: 0.7, solarOutput: 75, description: 'Good output, slight decline' },
  { id: 'evening', label: '6 PM — Evening', sunAngle: 0.9, solarOutput: 15, description: 'Low output, battery kicks in' },
  { id: 'night', label: '9 PM — Night', sunAngle: 1.0, solarOutput: 0, description: 'No solar, battery + wind support' },
];

// ═══════════════════════════════════════════════════════════
//  PART 3 — WIND SUPPORT SYSTEM
// ═══════════════════════════════════════════════════════════

export const WIND_TASKS = [
  {
    id: 'install_turbine',
    label: 'Install rooftop turbine',
    instruction: 'Press E to install a small wind turbine on the roof edge',
    icon: '🔧',
    feedback: 'Turbine installed! Waiting for wind...',
  },
  {
    id: 'observe_day',
    label: 'Daytime observation',
    instruction: 'Solar handles daytime — wind is backup',
    icon: '☀️',
    feedback: 'Solar dominant during day, wind minimal.',
    auto: true,
  },
  {
    id: 'night_support',
    label: 'Night support',
    instruction: 'Watch: solar stops at night — wind picks up!',
    icon: '🌙',
    feedback: 'Wind provides 30% power at night!',
    auto: true,
  },
  {
    id: 'storm_test',
    label: 'Storm weather test',
    instruction: 'Storm incoming! Watch how solar drops and wind surges',
    icon: '⛈️',
    feedback: 'During storms, wind compensates for weak solar!',
    auto: true,
  },
  {
    id: 'combined_result',
    label: 'Combined renewable view',
    instruction: 'See how solar + wind + battery = 24/7 clean energy',
    icon: '♻️',
    feedback: 'Combining renewables gives reliable clean power!',
    auto: true,
  },
];

export const WIND_SPEED_SEQUENCE = [
  { speed: 2, label: 'Calm', duration: 2500 },
  { speed: 5, label: 'Light Breeze', duration: 2500 },
  { speed: 3, label: 'Dropping...', duration: 2000 },
  { speed: 8, label: 'Strong Wind!', duration: 2500 },
  { speed: 12, label: 'Storm!', duration: 2000 },
  { speed: 4, label: 'Dying Down...', duration: 2500 },
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
    title: 'Tree Impact Report',
    icon: '🌳',
    facts: [
      'Your trees will absorb ~200 kg CO₂ per year combined',
      'Shade from trees reduces AC need by 15-25%',
      'Trees take 5-20 years for peak absorption',
      'Best species: Neem (48 kg/yr), Mango (35 kg/yr)',
    ],
    conclusion: '🌿 Trees are a slow but essential long-term solution',
  },
  solar: {
    title: 'Solar Impact Report',
    icon: '☀️',
    facts: [
      'Your 3 kW system reduces ~3-5 tons CO₂ per year — immediately!',
      'Monthly bill drops from ₹8,400 to ₹1,200',
      'Panels last 25+ years with minimal maintenance',
      'Government subsidy: up to ₹78,000 available',
    ],
    conclusion: '☀️ Solar gives the fastest, most practical CO₂ reduction for homes',
  },
  wind: {
    title: 'Wind Support Report',
    icon: '🌬️',
    facts: [
      'Small turbine provides backup during low-solar periods',
      'Wind + Solar + Battery = near 24/7 clean power',
      'Wind alone is unreliable for homes — needs consistent 4+ m/s',
      'Best as supplement, not primary source',
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
  before: {
    label: 'BEFORE',
    items: ['Polluted surroundings', 'High electricity bill ₹8,400/mo', 'Overheated rooms', 'Dark, smoky sky', 'Dry barren garden'],
  },
  after: {
    label: 'AFTER',
    items: ['Green lush garden', 'Bill reduced to ₹1,200/mo', 'Trees shade the house', 'Clean blue sky', 'Solar roof glowing'],
  },
};

export const REALIZATION_LINES = [
  { speaker: 'teacher', text: 'Look at what we\'ve achieved together…' },
  { speaker: 'narration', text: 'The barren land is now a green garden. Trees absorb CO₂ slowly but surely.' },
  { speaker: 'narration', text: 'The rooftop solar panels power the entire house — clean, free energy.' },
  { speaker: 'narration', text: 'The small wind turbine supports during night and storms.' },
  { speaker: 'teacher', text: 'Trees help slowly…' },
  { speaker: 'teacher', text: 'Wind supports when possible…' },
  { speaker: 'teacher', text: 'But solar energy can transform EVERY home.' },
  { speaker: 'teacher', text: 'The best strategy? Combine all three for maximum impact.' },
];

export const TRANSITION_LINE = 'In Level 4, you will learn how to bring solar energy to YOUR home.';

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
    explanation: 'A 3 kW rooftop solar system reduces approximately 3-5 tons of CO₂ per year by displacing coal electricity.',
  },
  {
    question: 'When does wind energy support solar the most?',
    options: ['At noon', 'At night and during storms', 'In summer only', 'Never — they don\'t work together'],
    correctIndex: 1,
    explanation: 'Wind supports solar at night (no sun) and during storms (clouds block sun, but wind is strong).',
  },
  {
    question: 'Which gives the FASTEST CO₂ reduction for a home?',
    options: ['Planting 100 trees', 'Rooftop solar panels', 'Small wind turbine', 'Using less electricity'],
    correctIndex: 1,
    explanation: 'Solar panels provide IMMEDIATE CO₂ reduction from Day 1. Trees take decades, wind needs special conditions.',
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
