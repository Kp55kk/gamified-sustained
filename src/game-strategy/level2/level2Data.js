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

// Max watts for meter fill (updated for 15 appliances)
export const MAX_POSSIBLE_WATTS = 7720;

// ─── Watt thresholds for smart messages ───
export const HIGH_WATT_THRESHOLD = 500;

export function getSmartMessage(wattage) {
  if (wattage >= 1500) return { text: 'This consumes a LOT of energy!', type: 'danger', icon: '\u{26A0}\u{FE0F}' };
  if (wattage >= HIGH_WATT_THRESHOLD) return { text: 'Moderate energy consumption', type: 'warning', icon: '\u{26A1}' };
  return { text: 'Energy efficient choice', type: 'good', icon: '\u{2705}' };
}

// Priority classification for turn-off task popups
export function getWattagePriority(wattage) {
  if (wattage >= 1000) return 'high';
  if (wattage >= 100) return 'medium';
  return 'low';
}

// ─── Bar color for graph system ───
export function getBarColor(watts) {
  if (watts < 100) return '#22c55e';   // Green — Low
  if (watts <= 1000) return '#f59e0b'; // Yellow — Medium
  return '#ef4444';                     // Red — High
}

export function getBarTierLabel(watts) {
  if (watts < 100) return 'Low';
  if (watts <= 1000) return 'Medium';
  return 'High';
}

// ═══════════════════════════════════════════════════════════
//  ELECTRICITY BILL SLAB SYSTEM (Indian Rates)
// ═══════════════════════════════════════════════════════════

export const BILL_SLABS = [
  { min: 0,   max: 100, rate: 3, label: '0\u{2013}100 units'  },
  { min: 101, max: 200, rate: 5, label: '101\u{2013}200 units' },
  { min: 201, max: 300, rate: 7, label: '201\u{2013}300 units' },
  { min: 301, max: Infinity, rate: 9, label: '300+ units' },
];

export function calculateBill(monthlyKwh) {
  let remaining = monthlyKwh;
  let totalCost = 0;
  const breakdown = [];

  for (const slab of BILL_SLABS) {
    if (remaining <= 0) break;
    const slabSize = slab.max === Infinity ? remaining : Math.min(slab.max - slab.min + 1, 100);
    const unitsInSlab = Math.min(remaining, slabSize);
    const cost = unitsInSlab * slab.rate;
    breakdown.push({
      label: slab.label,
      units: Math.round(unitsInSlab * 10) / 10,
      rate: slab.rate,
      cost: Math.round(cost),
    });
    totalCost += cost;
    remaining -= unitsInSlab;
  }

  return {
    totalUnits: Math.round(monthlyKwh * 10) / 10,
    totalCost: Math.round(totalCost),
    breakdown,
  };
}

// ─── CO₂ Calculation ───
export function calculateCO2(kwh) {
  return Math.round(kwh * CO2_FACTOR * 100) / 100;
}

// ─── Annual Energy ───
export function calculateAnnualEnergy(dailyKwh, days = 365) {
  return Math.round(dailyKwh * days * 100) / 100;
}

// ─── Assumed daily usage hours for bill estimation ───
export const USAGE_HOURS = {
  ceiling_fan: 8,
  tv_smart: 6,
  wifi_router: 24,
  set_top_box: 6,
  ac_1_5ton: 8,
  phone_charger: 3,
  fridge: 8,       // compressor cycles ~8hr effective
  induction: 1.5,
  microwave: 0.5,
  mixer_grinder: 0.25,
  led_tube: 8,
  geyser: 0.5,
  washing_machine: 1,
  table_fan: 6,
  led_bulb: 10,
};

// ═══════════════════════════════════════════════════════════
//  LEVEL 2 APPLIANCES (15 total — includes Table Fan + LED Bulb)
// ═══════════════════════════════════════════════════════════

export const LEVEL2_APPLIANCES = [
  // Living Room
  { id: 'ceiling_fan',   name: 'Ceiling Fan',          icon: '\u{1F300}',            wattage: 70,   room: 'Living Room', animationType: 'spin',    category: 'Cooling' },
  { id: 'tv_smart',      name: 'Smart TV (43")',        icon: '\u{1F4FA}',            wattage: 75,   room: 'Living Room', animationType: 'glow',    category: 'Electronics' },
  { id: 'wifi_router',   name: 'Wi-Fi Router',          icon: '\u{1F4F6}',            wattage: 12,   room: 'Living Room', animationType: 'led',     category: 'Electronics' },
  { id: 'set_top_box',   name: 'Set-Top Box',           icon: '\u{1F4E6}',            wattage: 25,   room: 'Living Room', animationType: 'led',     category: 'Electronics' },
  // Bedroom
  { id: 'ac_1_5ton',     name: 'AC (1.5 Ton)',          icon: '\u{2744}\u{FE0F}',     wattage: 1500, room: 'Bedroom',     animationType: 'airflow', category: 'Cooling' },
  { id: 'phone_charger', name: 'Phone Charger',         icon: '\u{1F50C}',            wattage: 15,   room: 'Bedroom',     animationType: 'led',     category: 'Charging' },
  { id: 'table_fan',     name: 'Table Fan',             icon: '\u{1F32A}\u{FE0F}',    wattage: 50,   room: 'Bedroom',     animationType: 'spin',    category: 'Cooling' },
  // Kitchen
  { id: 'fridge',        name: 'Refrigerator',          icon: '\u{1F9CA}',            wattage: 150,  room: 'Kitchen',     animationType: 'led',     category: 'Cooling' },
  { id: 'induction',     name: 'Induction Cooktop',     icon: '\u{1F373}',            wattage: 1500, room: 'Kitchen',     animationType: 'glow',    category: 'Cooking' },
  { id: 'microwave',     name: 'Microwave Oven',        icon: '\u{1F4E1}',            wattage: 1000, room: 'Kitchen',     animationType: 'glow',    category: 'Cooking' },
  { id: 'mixer_grinder', name: 'Mixer Grinder',         icon: '\u{26A1}',             wattage: 600,  room: 'Kitchen',     animationType: 'spin',    category: 'Cooking' },
  { id: 'led_tube',      name: 'LED Tube Light',        icon: '\u{1F4A1}',            wattage: 18,   room: 'Kitchen',     animationType: 'glow',    category: 'Lighting' },
  // Bathroom
  { id: 'geyser',        name: 'Geyser (2000W)',        icon: '\u{1F6BF}',            wattage: 2000, room: 'Bathroom',    animationType: 'glow',    category: 'Heating' },
  { id: 'washing_machine', name: 'Washing Machine',     icon: '\u{1F455}',            wattage: 420,  room: 'Bathroom',    animationType: 'spin',    category: 'Laundry' },
  // All Rooms
  { id: 'led_bulb',      name: 'LED Bulb (9W)',         icon: '\u{1F4A1}',            wattage: 9,    room: 'All Rooms',   animationType: 'glow',    category: 'Lighting' },
];

export const L2_APPLIANCE_IDS = LEVEL2_APPLIANCES.map(a => a.id);

// ─── Quick lookup map ───
export const L2_APPLIANCE_MAP = {};
LEVEL2_APPLIANCES.forEach(a => { L2_APPLIANCE_MAP[a.id] = a; });

// ═══════════════════════════════════════════════════════════
//  CO₂ SHOCK FACTS
// ═══════════════════════════════════════════════════════════

export const SHOCK_FACTS = [
  { appliance: 'AC (1.5 Ton)', fact: 'AC alone produces ~1,278 kg CO\u{2082}/year \u{1F633}', co2: 1278 },
  { appliance: 'Geyser', fact: 'Geyser produces ~128 kg CO\u{2082}/year in just 30 min/day!', co2: 128 },
  { appliance: 'Induction', fact: 'Induction cooktop produces ~575 kg CO\u{2082}/year', co2: 575 },
  { appliance: 'All Fans', fact: 'All 3 fans combined produce less CO\u{2082} than AC alone!', co2: 237 },
  { appliance: 'LED Lighting', fact: 'All LED lights together produce only ~60 kg CO\u{2082}/year \u{2705}', co2: 60 },
];

// ═══════════════════════════════════════════════════════════
//  SMART INSIGHTS (contextual, auto-generated)
// ═══════════════════════════════════════════════════════════

export const SMART_INSIGHTS = [
  { condition: (states) => states.ac_1_5ton && states.ceiling_fan, text: 'AC + Fan combo: Use fan with AC at 26\u{00B0}C to save 20% energy!', icon: '\u{1F4A1}' },
  { condition: (states) => states.ac_1_5ton && !states.ceiling_fan, text: 'Try using a fan instead of AC \u{2014} saves 21\u{00D7} more energy!', icon: '\u{1F32A}\u{FE0F}' },
  { condition: (states) => states.geyser, text: 'Geyser is the highest watt appliance! Limit to 10 min.', icon: '\u{26A0}\u{FE0F}' },
  { condition: (states) => states.tv_smart && states.set_top_box, text: 'TV + Set-Top Box: Turn off STB at plug when not watching!', icon: '\u{1F4FA}' },
  { condition: (states) => states.microwave && states.induction, text: 'Microwave reheats faster with less energy than induction!', icon: '\u{1F373}' },
  { condition: (states) => states.wifi_router, text: 'Wi-Fi router runs 24/7 \u{2014} that\u{2019}s 105 kWh/year silently!', icon: '\u{1F4F6}' },
  { condition: (states) => states.phone_charger, text: 'Unplug charger when done \u{2014} phantom power adds up!', icon: '\u{1F50C}' },
  { condition: (states) => states.ceiling_fan && states.table_fan, text: 'Two fans running? Table fan uses 30% less than ceiling fan!', icon: '\u{1F300}' },
  { condition: (states) => states.led_bulb && states.led_tube, text: 'LED lighting is super efficient \u{2014} both combined use only 27W!', icon: '\u{1F4A1}' },
  { condition: (states) => states.fridge, text: 'Fridge runs 24/7 but compressor cycles. Don\u{2019}t open door too often!', icon: '\u{1F9CA}' },
  { condition: (states) => states.washing_machine, text: 'Wash full loads to maximize energy efficiency!', icon: '\u{1F455}' },
  { condition: (states) => states.mixer_grinder, text: 'Mixer is 600W but short bursts keep annual use low!', icon: '\u{26A1}' },
];

// ─── Generic insights (always available) ───
export const GENERIC_INSIGHTS = [
  { text: 'Fan runs longer but consumes less power than AC', icon: '\u{1F300}' },
  { text: 'AC consumes high power in short time', icon: '\u{2744}\u{FE0F}' },
  { text: 'LED bulbs replaced 60W incandescent \u{2014} 85% energy saved!', icon: '\u{1F4A1}' },
  { text: 'Every kWh in India = 0.710 kg CO\u{2082} emissions', icon: '\u{1F30D}' },
  { text: 'High watt appliances increase your bill quickly', icon: '\u{1FA99}' },
  { text: 'Smart choices today = sustainable tomorrow!', icon: '\u{1F33F}' },
];

// ─── Comparison pairs for graph ───
export const COMPARISON_PAIRS = [
  { a: 'ac_1_5ton', b: 'ceiling_fan', message: 'AC uses {x}\u{00D7} more energy than a fan!' },
  { a: 'ac_1_5ton', b: 'table_fan', message: 'AC uses {x}\u{00D7} more energy than table fan!' },
  { a: 'geyser', b: 'led_bulb', message: 'Geyser uses {x}\u{00D7} more energy than LED bulb!' },
  { a: 'induction', b: 'led_tube', message: 'Induction uses {x}\u{00D7} more energy than LED tube!' },
  { a: 'microwave', b: 'wifi_router', message: 'Microwave uses {x}\u{00D7} more energy than router!' },
  { a: 'mixer_grinder', b: 'phone_charger', message: 'Mixer uses {x}\u{00D7} more energy than a charger!' },
];

// ═══════════════════════════════════════════════════════════
//  PROBLEM-BASED TASK SYSTEM
// ═══════════════════════════════════════════════════════════

export const TASKS = [
  {
    id: 'task_family_room',
    type: 'turn_off',
    scenario: '\u{1F468}\u{200D}\u{1F469}\u{200D}\u{1F467}\u{200D}\u{1F466} Family is gathered in the Living Room!',
    icon: '\u{1F3E0}',
    hint: 'Find and turn OFF unnecessary appliances in other rooms.',
    // Appliances auto-turned ON when task starts — player must turn them OFF
    turnOffIds: ['geyser', 'ac_1_5ton', 'mixer_grinder', 'table_fan', 'led_tube'],
    // Living Room appliances that should STAY on (protected)
    protectedIds: ['ceiling_fan', 'tv_smart', 'wifi_router', 'set_top_box'],
    requiredOff: 3,
    // Priority-based popup messages
    startPopup: 'Some appliances are ON in empty rooms \u{26A0}\u{FE0F}\nFind and turn them OFF to save energy',
    nearPopups: {
      high:   'This consumes a LOT of energy even when unused \u{26A0}\u{FE0F}',
      medium: 'Still consuming power \u{2014} moderate waste',
      low:    'Still consuming power \u{2014} but less impact',
    },
    offPopups: {
      high:   'Great! Significant energy saved \u{1F331}',
      medium: 'Good catch! Energy saved \u{1F44D}',
      low:    'Energy saved \u{1F44D}',
    },
    protectedPopup: 'This appliance is currently needed \u{2014} the family is using it!',
    // Star thresholds
    starThresholds: {
      three: ['geyser', 'ac_1_5ton', 'mixer_grinder', 'table_fan', 'led_tube'],  // all 5 = 3 stars
      two: 3,    // 3-4 appliances
      one: 2,    // minimum pass
    },
    // Final summary
    finalLearning: {
      title: '\u{1F4A1} Key Learning',
      messages: [
        'Most energy waste comes from high-power appliances left ON unnecessarily',
        'Turning OFF unused devices reduces both cost and CO\u{2082}',
      ],
    },
    comparison: null,
  },
  {
    id: 'task_dark_room',
    scenario: 'The room is dark!',
    icon: '\u{1F319}',
    hint: 'You need a light source.',
    correctIds: ['led_tube', 'led_bulb'],
    bestId: 'led_bulb',
    wrongHint: 'This appliance doesn\'t produce light.',
    comparison: {
      efficient: { id: 'led_bulb', label: 'LED Bulb (9W)', watts: 9 },
      alternative: { id: 'led_tube', label: 'LED Tube (18W)', watts: 18 },
      message: 'LED Bulb uses 9W vs Tube at 18W \u{2014} half the energy for spot lighting!',
      lesson: 'Use LED bulbs for task lighting, tubes for full room illumination.',
    },
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
    simpleLogic: 'Think of Watts as SPEED \u{2014} how fast energy flows.',
    afterTask: 2,
  },
  {
    id: 'learn_annual',
    title: 'Annual Energy Consumption',
    icon: '\u{1F4C5}',
    content: 'To find yearly energy, multiply daily usage by the number of days.',
    formula: 'Annual kWh = Daily kWh \u{00D7} Days',
    example: 'Fan: 0.56 kWh/day \u{00D7} 300 days = 168 kWh/year',
    simpleLogic: 'Think of kWh as TOTAL ENERGY \u{2014} what you pay for!',
    afterTask: 3,
  },
  {
    id: 'learn_co2',
    title: 'CO\u{2082} Emission Impact',
    icon: '\u{1F30D}',
    content: 'Every kWh of electricity in India releases CO\u{2082} into the atmosphere.',
    formula: 'CO\u{2082} = kWh \u{00D7} 0.710 kg',
    example: 'AC using 1800 kWh/year = 1,278 kg CO\u{2082} \u{2014} more than ALL essential appliances combined!',
    simpleLogic: 'Think of CO\u{2082} as ENVIRONMENTAL IMPACT \u{2014} your carbon footprint!',
    afterTask: 5,
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
    afterTask: 4,
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
    options: ['AC (1500W)', 'Table Fan (50W)', 'Geyser (2000W)', 'Microwave (1000W)'],
    correctIndex: 1,
    explanation: 'A table fan at 50W uses 30\u{00D7} less energy than an AC at 1500W!',
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
    question: 'How much CO\u{2082} does 10 kWh of electricity produce in India?',
    options: ['3.5 kg', '5.0 kg', '7.1 kg', '10.0 kg'],
    correctIndex: 2,
    explanation: 'CO\u{2082} = kWh \u{00D7} 0.710. So 10 kWh \u{00D7} 0.710 = 7.1 kg CO\u{2082}!',
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
  'LED Bulb (9W) replaced 60W incandescent \u{2014} saving 85% energy!',
  'Table Fan (50W) uses 30% less power than a ceiling fan (70W)!',
];

// ─── Smart Savings comparisons for bill system ───
export const SMART_SAVINGS = [
  {
    scenario: 'Using Fan instead of AC',
    efficientId: 'ceiling_fan',
    wastefulId: 'ac_1_5ton',
    monthlySaving: null, // calculated dynamically
  },
  {
    scenario: 'Using LED Bulb instead of old 60W incandescent',
    efficientWatts: 9,
    wastefulWatts: 60,
    hours: 10,
    monthlySaving: null,
  },
  {
    scenario: 'Turning off STB at plug (save standby)',
    savingKwh: 10,
    monthlySaving: null,
  },
];
