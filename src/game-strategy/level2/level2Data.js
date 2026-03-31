// ─── Level 2: The Energy Meter — Complete Dataset ───
// Source: CEA India Ver 21.0 (2025), BEE India, IEA, U.S. DOE, U.S. EIA
// Emission Factor: 0.710 kg CO₂/kWh (CEA India FY 2024-25)

export const CO2_FACTOR = 0.710;

// ─── Energy Tier Thresholds (for meter bar color) ───
export const ENERGY_TIERS = {
  low:    { max: 500,      color: '#22c55e', label: 'Low Usage',    icon: '\u{1F7E2}' },
  medium: { max: 2000,     color: '#f59e0b', label: 'Medium Usage', icon: '\u{1F7E1}' },
  high:   { max: 5000,     color: '#ef4444', label: 'High Usage',   icon: '\u{1F534}' },
  extreme:{ max: Infinity, color: '#dc2626', label: 'Extreme!',     icon: '\u{1F525}' },
};

export function getEnergyTier(watts) {
  if (watts <= ENERGY_TIERS.low.max) return ENERGY_TIERS.low;
  if (watts <= ENERGY_TIERS.medium.max) return ENERGY_TIERS.medium;
  if (watts <= ENERGY_TIERS.high.max) return ENERGY_TIERS.high;
  return ENERGY_TIERS.extreme;
}

// Max watts for meter fill
export const MAX_POSSIBLE_WATTS = 7661;

// ─── Watt thresholds for smart messages ───
export const HIGH_WATT_THRESHOLD = 500;

export function getSmartMessage(wattage) {
  if (wattage >= 1500) return { text: 'This consumes a LOT of energy!', type: 'danger', icon: '\u{26A0}\u{FE0F}' };
  if (wattage >= HIGH_WATT_THRESHOLD) return { text: 'Moderate energy consumption', type: 'warning', icon: '\u{26A1}' };
  return { text: 'Energy efficient choice', type: 'good', icon: '\u{2705}' };
}

// ─── Level 2 Toggleable Appliances (13 appliances for 3D scene) ───
export const LEVEL2_APPLIANCES = [
  // Living Room
  { id: 'ceiling_fan',   name: 'Ceiling Fan',          icon: '\u{1F300}',            wattage: 70,   room: 'Living Room', animationType: 'spin',    category: 'Cooling' },
  { id: 'tv_smart',      name: 'Smart TV (43")',        icon: '\u{1F4FA}',            wattage: 75,   room: 'Living Room', animationType: 'glow',    category: 'Electronics' },
  { id: 'wifi_router',   name: 'Wi-Fi Router',          icon: '\u{1F4F6}',            wattage: 12,   room: 'Living Room', animationType: 'led',     category: 'Electronics' },
  { id: 'set_top_box',   name: 'Set-Top Box',           icon: '\u{1F4E6}',            wattage: 25,   room: 'Living Room', animationType: 'led',     category: 'Electronics' },
  // Bedroom
  { id: 'ac_1_5ton',     name: 'AC (1.5 Ton)',          icon: '\u{2744}\u{FE0F}',     wattage: 1500, room: 'Bedroom',     animationType: 'airflow', category: 'Cooling' },
  { id: 'phone_charger', name: 'Phone Charger',         icon: '\u{1F50C}',            wattage: 15,   room: 'Bedroom',     animationType: 'led',     category: 'Charging' },
  // Kitchen
  { id: 'fridge',        name: 'Refrigerator',          icon: '\u{1F9CA}',            wattage: 150,  room: 'Kitchen',     animationType: 'led',     category: 'Cooling' },
  { id: 'induction',     name: 'Induction Cooktop',     icon: '\u{1F373}',            wattage: 1500, room: 'Kitchen',     animationType: 'glow',    category: 'Cooking' },
  { id: 'microwave',     name: 'Microwave Oven',        icon: '\u{1F4E1}',            wattage: 1000, room: 'Kitchen',     animationType: 'glow',    category: 'Cooking' },
  { id: 'mixer_grinder', name: 'Mixer Grinder',         icon: '\u{26A1}',             wattage: 600,  room: 'Kitchen',     animationType: 'spin',    category: 'Cooking' },
  { id: 'led_tube',      name: 'LED Tube Light',        icon: '\u{1F4A1}',            wattage: 18,   room: 'Kitchen',     animationType: 'glow',    category: 'Lighting' },
  // Bathroom
  { id: 'geyser',        name: 'Geyser (2000W)',        icon: '\u{1F6BF}',            wattage: 2000, room: 'Bathroom',    animationType: 'glow',    category: 'Heating' },
  { id: 'washing_machine', name: 'Washing Machine',     icon: '\u{1F455}',            wattage: 420,  room: 'Bathroom',    animationType: 'spin',    category: 'Laundry' },
];

export const L2_APPLIANCE_IDS = LEVEL2_APPLIANCES.map(a => a.id);

// ─── Quick lookup map ───
export const L2_APPLIANCE_MAP = {};
LEVEL2_APPLIANCES.forEach(a => { L2_APPLIANCE_MAP[a.id] = a; });

// ═══════════════════════════════════════════════════════════
//  PROBLEM-BASED TASK SYSTEM
// ═══════════════════════════════════════════════════════════

export const TASKS = [
  {
    id: 'task_hot_room',
    scenario: 'The room is too hot!',
    icon: '\u{1F525}',
    hint: 'You need something that cools the room down.',
    correctIds: ['ceiling_fan', 'ac_1_5ton'],
    bestId: 'ceiling_fan',
    wrongHint: 'This appliance doesn\'t reduce temperature.',
    comparison: {
      efficient: { id: 'ceiling_fan', label: 'Ceiling Fan', watts: 70 },
      alternative: { id: 'ac_1_5ton', label: 'AC (1.5 Ton)', watts: 1500 },
      message: 'Fan uses 70W vs AC at 1500W \u{2014} that\'s 21x less energy!',
      lesson: 'Use a fan when possible. Reserve AC for extreme heat.',
    },
  },
  {
    id: 'task_dark_room',
    scenario: 'The room is dark!',
    icon: '\u{1F319}',
    hint: 'You need a light source.',
    correctIds: ['led_tube'],
    bestId: 'led_tube',
    wrongHint: 'This appliance doesn\'t produce light.',
    comparison: null,
  },
  {
    id: 'task_phone_dead',
    scenario: 'Phone battery is dead!',
    icon: '\u{1F4F1}',
    hint: 'You need something that charges your phone.',
    correctIds: ['phone_charger'],
    bestId: 'phone_charger',
    wrongHint: 'This won\'t charge your phone!',
    comparison: null,
  },
  {
    id: 'task_reheat_food',
    scenario: 'Need to warm up yesterday\'s food!',
    icon: '\u{1F35C}',
    hint: 'You need a cooking appliance that can reheat food.',
    correctIds: ['microwave', 'induction'],
    bestId: 'microwave',
    wrongHint: 'This appliance can\'t reheat food.',
    comparison: {
      efficient: { id: 'microwave', label: 'Microwave', watts: 1000 },
      alternative: { id: 'induction', label: 'Induction', watts: 1500 },
      message: 'Microwave reheats faster and uses less energy for small portions!',
      lesson: 'Use microwave for reheating. Induction is better for full cooking.',
    },
  },
  {
    id: 'task_dirty_clothes',
    scenario: 'Clothes need washing!',
    icon: '\u{1F455}',
    hint: 'You need a machine that washes clothes.',
    correctIds: ['washing_machine'],
    bestId: 'washing_machine',
    wrongHint: 'This appliance can\'t wash clothes.',
    comparison: null,
  },
  {
    id: 'task_hot_water',
    scenario: 'Need hot water for a bath!',
    icon: '\u{1F6C0}',
    hint: 'You need something that heats water.',
    correctIds: ['geyser'],
    bestId: 'geyser',
    wrongHint: 'This appliance doesn\'t heat water.',
    comparison: null,
  },
  {
    id: 'task_grind_spices',
    scenario: 'Need to grind masala for cooking!',
    icon: '\u{1F336}\u{FE0F}',
    hint: 'You need a kitchen appliance that grinds.',
    correctIds: ['mixer_grinder'],
    bestId: 'mixer_grinder',
    wrongHint: 'This appliance can\'t grind spices.',
    comparison: null,
  },
];

// ═══════════════════════════════════════════════════════════
//  LEARNING INSERTS (shown between tasks)
// ═══════════════════════════════════════════════════════════

export const LEARNING_INSERTS = [
  {
    id: 'learn_kwh',
    title: 'How Energy is Measured',
    icon: '\u{1F4A1}',
    content: 'Energy depends on power (Watts) and time (Hours).',
    formula: 'kWh = (Watts \u{00D7} Hours) \u{00F7} 1000',
    example: 'A 70W fan running 10 hours = (70 \u{00D7} 10) \u{00F7} 1000 = 0.7 kWh',
    afterTask: 2,
  },
  {
    id: 'learn_impact',
    title: 'Why It Matters',
    icon: '\u{1F30D}',
    content: 'Every kWh of electricity in India releases 0.710 kg of CO\u{2082}.',
    formula: 'CO\u{2082} = kWh \u{00D7} 0.710',
    example: 'AC using 1800 kWh/year = 1,278 kg CO\u{2082} \u{2014} more than ALL essential appliances combined!',
    afterTask: 4,
  },
];

// ═══════════════════════════════════════════════════════════
//  MICRO INTERACTIONS (quick in-game questions)
// ═══════════════════════════════════════════════════════════

export const MICRO_QUESTIONS = [
  {
    id: 'micro_ac_hours',
    question: 'AC runs 8 hours/day \u{2014} high or low energy?',
    options: ['Low Energy', 'High Energy'],
    correctIndex: 1,
    explanation: 'AC at 1500W for 8 hours = 12 kWh/day! That\'s very high energy usage.',
    afterTask: 5,
  },
  {
    id: 'micro_charger',
    question: 'A charger left plugged in (not charging) \u{2014} does it still use energy?',
    options: ['No, it\'s idle', 'Yes, phantom power'],
    correctIndex: 1,
    explanation: 'Idle chargers draw 0.1\u{2013}0.5W continuously. Unplug when not charging!',
    afterTask: 6,
  },
];

// ─── Quiz Questions (3-5, based on player experience) ───
export const QUIZ_QUESTIONS = [
  {
    id: 'l2q1', difficulty: 1,
    question: 'What is the formula to calculate energy consumption (kWh)?',
    options: ['Watts \u{00D7} Hours', '(Watts \u{00D7} Hours) \u{00F7} 1000', 'Watts \u{00F7} Hours', 'Watts + Hours'],
    correctIndex: 1,
    explanation: 'kWh = (Watts \u{00D7} Hours) \u{00F7} 1000. We divide by 1000 because 1 kWh = 1000 Wh.',
  },
  {
    id: 'l2q2', difficulty: 1,
    question: 'Which is more energy-efficient for cooling a room?',
    options: ['AC (1500W)', 'Ceiling Fan (70W)', 'Geyser (2000W)', 'Microwave (1000W)'],
    correctIndex: 1,
    explanation: 'A ceiling fan at 70W uses 21x less energy than an AC at 1500W!',
  },
  {
    id: 'l2q3', difficulty: 2,
    question: 'Turning OFF which appliance saves the MOST energy instantly?',
    options: ['Ceiling Fan (70W)', 'Wi-Fi Router (12W)', 'Geyser (2000W)', 'Phone Charger (15W)'],
    correctIndex: 2,
    explanation: 'Geyser at 2000W saves the most \u{2014} every minute costs more than a fan running an hour!',
  },
  {
    id: 'l2q4', difficulty: 2,
    question: 'If AC (1500W) and Geyser (2000W) are both ON, what\'s the total?',
    options: ['2000W', '2500W', '3500W', '1500W'],
    correctIndex: 2,
    explanation: 'Total = Sum of all ON appliances. 1500W + 2000W = 3500W!',
  },
  {
    id: 'l2q5', difficulty: 3,
    question: 'Setting AC to 24\u{00B0}C instead of 18\u{00B0}C saves approximately what percentage?',
    options: ['10%', '15%', '25%', '35%'],
    correctIndex: 2,
    explanation: 'Each degree higher saves ~6%. From 18\u{00B0}C to 24\u{00B0}C = ~25% energy saved!',
  },
];

// ─── Star Rating Thresholds ───
export function calculateStars(correctTasks, totalTasks, efficientChoices, quizScore, quizTotal) {
  // Weight: 40% task accuracy, 30% efficient choices, 30% quiz score
  const taskPct = (correctTasks / totalTasks) * 100;
  const efficientPct = (efficientChoices / totalTasks) * 100;
  const quizPct = (quizScore / quizTotal) * 100;
  const overall = taskPct * 0.4 + efficientPct * 0.3 + quizPct * 0.3;

  if (overall >= 85) return 3;
  if (overall >= 60) return 2;
  return 1;
}

// ─── Achievement/Badge ───
export const LEVEL2_BADGE = {
  id: 'watt_wizard',
  title: 'Watt Wizard',
  description: 'Mastered appliance energy consumption!',
  icon: '\u{1F9D9}',
  coins: 50,
};

// ─── Energy Tips ───
export const ENERGY_TIPS = [
  'The AC + Geyser together use more than all other appliances combined!',
  'Switching to a BLDC fan saves 60% energy \u{2014} from 70W down to 28W!',
  'Setting AC to 24\u{00B0}C instead of 18\u{00B0}C saves ~25% energy.',
  'Your Wi-Fi router runs 24/7. That\u{2019}s 105 kWh/year!',
  'A phone charger left plugged in wastes energy even when not charging.',
  'The microwave\u{2019}s clock display uses more electricity per year than charging your phone!',
];
