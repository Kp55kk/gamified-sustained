// ═══════════════════════════════════════════════════════════
//  LEVEL 3: THE CARBON CRISIS — Data & Constants (ENHANCED)
//  Learning + Tasks + Quiz + Real-Life Actions
// ═══════════════════════════════════════════════════════════

import {
  LEVEL2_APPLIANCES, L2_APPLIANCE_IDS, L2_APPLIANCE_MAP,
  USAGE_HOURS, calculateBill, calculateCO2, CO2_FACTOR, BILL_SLABS,
} from '../level2/level2Data';

export {
  LEVEL2_APPLIANCES, L2_APPLIANCE_IDS, L2_APPLIANCE_MAP,
  USAGE_HOURS, calculateBill, calculateCO2, CO2_FACTOR, BILL_SLABS,
};

export const MAX_POSSIBLE_WATTS = 7720;

export function getDamageLevel(totalWatts) {
  return Math.min(totalWatts / MAX_POSSIBLE_WATTS, 1.0);
}

// ═══════════════════════════════════════════════════════════
//  DAMAGE TIERS
// ═══════════════════════════════════════════════════════════
export const DAMAGE_TIERS = [
  { max: 0.25, label: 'Normal',   color: '#22c55e', icon: '\u{1F7E2}', skyTop: '#5eaadd', skyBot: '#87CEEB', ground: '#3a5a3a' },
  { max: 0.50, label: 'Warning',  color: '#f59e0b', icon: '\u{1F7E1}', skyTop: '#c0550a', skyBot: '#e67e22', ground: '#7a6a30' },
  { max: 0.75, label: 'Danger',   color: '#ef4444', icon: '\u{1F534}', skyTop: '#6b1010', skyBot: '#8b1a1a', ground: '#4a3020' },
  { max: 1.00, label: 'COLLAPSE', color: '#7f1d1d', icon: '\u{1F525}', skyTop: '#0a0505', skyBot: '#1a0505', ground: '#1a0e05' },
];

export function getDamageTier(damageLevel) {
  for (const tier of DAMAGE_TIERS) {
    if (damageLevel <= tier.max) return tier;
  }
  return DAMAGE_TIERS[DAMAGE_TIERS.length - 1];
}

export const BILL_MILESTONES = [
  { amount: 1000, label: 'Warning',  color: '#f59e0b' },
  { amount: 2000, label: 'High',     color: '#ef4444' },
  { amount: 3000, label: 'CRITICAL', color: '#7f1d1d' },
];

// ═══════════════════════════════════════════════════════════
//  CO₂ HELPERS
// ═══════════════════════════════════════════════════════════
export function getApplianceCO2Monthly(id) {
  const a = L2_APPLIANCE_MAP[id];
  if (!a) return 0;
  const hours = USAGE_HOURS[id] || 4;
  const monthlyKwh = (a.wattage * hours * 30) / 1000;
  return Math.round(calculateCO2(monthlyKwh) * 100) / 100;
}

export function getApplianceCO2Annual(id) {
  return Math.round(getApplianceCO2Monthly(id) * 12 * 100) / 100;
}

export function getDamageAttribution(applianceStates) {
  let total = 0;
  const attribution = [];
  L2_APPLIANCE_IDS.forEach(id => {
    if (applianceStates[id]) {
      const co2 = getApplianceCO2Monthly(id);
      total += co2;
      attribution.push({
        id, name: L2_APPLIANCE_MAP[id].name,
        icon: L2_APPLIANCE_MAP[id].icon,
        co2, wattage: L2_APPLIANCE_MAP[id].wattage,
      });
    }
  });
  return attribution
    .map(a => ({ ...a, pct: total > 0 ? Math.round((a.co2 / total) * 100) : 0 }))
    .sort((a, b) => b.co2 - a.co2);
}

// ═══════════════════════════════════════════════════════════
//  APPLIANCE LEARNING DATA (Cause → Effect → Lesson)
// ═══════════════════════════════════════════════════════════
export const APPLIANCE_LESSONS = {
  ac_1_5ton: {
    cause: 'AC uses 1500W of power',
    effect: 'High CO\u{2082} generated continuously',
    why: 'High power + long usage = maximum energy consumption',
    lesson: 'Use fan when possible to reduce environmental impact',
  },
  ceiling_fan: {
    cause: 'Fan uses only 70W',
    effect: 'Very low CO\u{2082} output',
    why: 'Low wattage means minimal energy even for long usage',
    lesson: 'Fan is 20x more efficient than AC for cooling',
  },
  tv_smart: {
    cause: 'TV uses 100W',
    effect: 'Moderate CO\u{2082} during usage',
    why: 'Continuous screen draws steady power',
    lesson: 'Turn OFF when not watching to save energy',
  },
  fridge: {
    cause: 'Fridge uses 150W constantly',
    effect: 'Runs 24/7 = significant yearly CO\u{2082}',
    why: 'Always-on appliance accumulates over time',
    lesson: 'Keep fridge efficient \u{2014} don\u{2019}t leave door open',
  },
  geyser: {
    cause: 'Geyser uses 2000W \u{2014} very high!',
    effect: 'Massive CO\u{2082} per hour of use',
    why: 'Heating water requires extreme energy',
    lesson: 'Limit usage to 10\u{2013}15 minutes, use solar heater if possible',
  },
  washing_machine: {
    cause: 'Washing machine uses 500W',
    effect: 'Moderate CO\u{2082} per wash cycle',
    why: 'Motor + water heating draws significant power',
    lesson: 'Run full loads only to maximize efficiency',
  },
  induction: {
    cause: 'Induction uses 1800W \u{2014} very high!',
    effect: 'High CO\u{2082} during cooking',
    why: 'Rapid heating needs huge power draw',
    lesson: 'Cook efficiently \u{2014} use pressure cooker to reduce time',
  },
  microwave: {
    cause: 'Microwave uses 1200W',
    effect: 'High power but short usage',
    why: 'Brief usage limits total energy vs. continuous appliances',
    lesson: 'Microwave is efficient for reheating vs. full oven',
  },
  mixer_grinder: {
    cause: 'Mixer uses 750W',
    effect: 'Moderate CO\u{2082} in short bursts',
    why: 'Motor speed demands decent power',
    lesson: 'Use for short durations to keep impact low',
  },
  wifi_router: {
    cause: 'Router uses only 12W',
    effect: 'Minimal CO\u{2082} output',
    why: 'Very low wattage device',
    lesson: 'Low-power always-on devices are acceptable',
  },
  set_top_box: {
    cause: 'STB uses 25W even on standby',
    effect: 'Wastes energy when TV is off',
    why: 'Standby power \u{2014} "vampire" energy drain',
    lesson: 'Turn OFF STB when not watching to avoid waste',
  },
  phone_charger: {
    cause: 'Charger uses 15W',
    effect: 'Small but constant waste if left plugged',
    why: 'Trickle power draw even when phone is full',
    lesson: 'Unplug charger after phone is charged',
  },
  led_tube: {
    cause: 'LED tube uses 18W',
    effect: 'Very low CO\u{2082}',
    why: 'LED technology is highly efficient',
    lesson: 'LED lights save 80% energy vs. old tube lights',
  },
  led_bulb: {
    cause: 'LED bulb uses only 9W',
    effect: 'Negligible CO\u{2082}',
    why: 'Lowest wattage lighting option',
    lesson: 'Replace all old bulbs with LED to save energy',
  },
  table_fan: {
    cause: 'Table fan uses 50W',
    effect: 'Very low CO\u{2082}',
    why: 'Small motor, low power consumption',
    lesson: 'Personal fans are great for targeted cooling',
  },
};

// ═══════════════════════════════════════════════════════════
//  LEARNING TASKS (5 tasks with objectives + learning)
// ═══════════════════════════════════════════════════════════
export const LEARNING_TASKS = [
  {
    id: 'smart_cooling',
    title: 'Smart Cooling',
    icon: '\u{2744}\u{FE0F}',
    objective: 'Cool the room with minimum carbon impact',
    description: 'The room is hot! Choose the most efficient cooling option.',
    type: '3d', // player walks and toggles
    setupAppliances: {}, // all OFF
    successCheck: (states) => (states.ceiling_fan || states.table_fan) && !states.ac_1_5ton,
    failCheck: (states) => states.ac_1_5ton,
    failWarning: 'AC uses too much energy! Try a fan instead.',
    successAppliances: ['ceiling_fan', 'table_fan'],
    wrongAppliances: ['ac_1_5ton'],
    hint: 'Think about which cooling option uses less energy\u{2026}',
    learnings: [
      'Fan uses much less energy than AC (70W vs 1500W)',
      'Efficient cooling choice reduces CO\u{2082} by 95%',
    ],
    learningKey: 'Fan is 20x more efficient than AC',
  },
  {
    id: 'stop_waste',
    title: 'Stop Energy Waste',
    icon: '\u{267B}\u{FE0F}',
    objective: 'Turn OFF unnecessary appliances',
    description: 'Several appliances are running for no reason. Find and turn them OFF!',
    type: '3d',
    setupAppliances: { set_top_box: true, phone_charger: true, led_tube: true, led_bulb: true, tv_smart: true },
    successCheck: (states) => !states.set_top_box && !states.phone_charger && !states.led_tube,
    targetOffIds: ['set_top_box', 'phone_charger', 'led_tube'],
    hint: 'Look for devices that are ON but not being used\u{2026}',
    learnings: [
      'Unused appliances still consume electricity (standby power)',
      'Turning them OFF saves energy and reduces your bill',
    ],
    learningKey: 'Standby power wastes energy silently',
  },
  {
    id: 'balance_usage',
    title: 'Balance Usage',
    icon: '\u{2696}\u{FE0F}',
    objective: 'Use only required appliances',
    description: 'Too many appliances are running! Keep only what you truly need.',
    type: '3d',
    setupAppliances: { ac_1_5ton: true, tv_smart: true, ceiling_fan: true, induction: true, microwave: true, geyser: true, washing_machine: true },
    successCheck: (states) => {
      const onCount = Object.values(states).filter(Boolean).length;
      return onCount <= 3;
    },
    hint: 'You only need 2\u{2013}3 essential appliances at a time',
    learnings: [
      'More appliances ON = more CO\u{2082} + higher electricity bill',
      'Smart usage means running only what you need right now',
    ],
    learningKey: 'Use only what you need, when you need it',
  },
  {
    id: 'high_vs_low',
    title: 'High vs Low Impact',
    icon: '\u{1F50D}',
    objective: 'Identify which appliance causes the most damage',
    description: 'Look at these appliances \u{2014} which one produces the MOST CO\u{2082}?',
    type: 'quiz', // UI-based choice
    choices: [
      { id: 'ceiling_fan', label: 'Ceiling Fan (70W)', icon: '\u{1F32C}\u{FE0F}', correct: false },
      { id: 'led_bulb', label: 'LED Bulb (9W)', icon: '\u{1F4A1}', correct: false },
      { id: 'ac_1_5ton', label: 'AC 1.5 Ton (1500W)', icon: '\u{2744}\u{FE0F}', correct: true },
      { id: 'wifi_router', label: 'Wi-Fi Router (12W)', icon: '\u{1F4F6}', correct: false },
    ],
    learnings: [
      'AC contributes highest CO\u{2082} emissions (~1,278 kg/year)',
      'It uses 20x more power than a fan for the same purpose',
    ],
    learningKey: 'AC is the #1 source of home CO\u{2082} emissions',
  },
  {
    id: 'reduce_fast',
    title: 'Reduce Carbon Quickly',
    icon: '\u{23F1}\u{FE0F}',
    objective: 'Reduce emissions within 20 seconds!',
    description: 'EMERGENCY! CO\u{2082} is critical! Turn OFF high-watt appliances NOW!',
    type: 'timed',
    timeLimit: 20,
    setupAppliances: { ac_1_5ton: true, geyser: true, induction: true, microwave: true, tv_smart: true, ceiling_fan: true },
    successCheck: (states) => {
      let watts = 0;
      L2_APPLIANCE_IDS.forEach(id => { if (states[id]) watts += L2_APPLIANCE_MAP[id].wattage; });
      return watts <= 500;
    },
    hint: 'Turn OFF the highest-watt appliances first!',
    learnings: [
      'Quick actions can prevent damage escalation',
      'Always target high-wattage appliances first for maximum impact',
    ],
    learningKey: 'Act fast \u{2014} prioritize high-watt appliances',
  },
];

// ═══════════════════════════════════════════════════════════
//  SCENARIO-BASED QUIZ (6 questions)
// ═══════════════════════════════════════════════════════════
export const L3_QUIZ_QUESTIONS = [
  {
    id: 'q1', difficulty: 1,
    question: 'The room is hot \u{2014} what\u{2019}s the best eco-friendly choice?',
    options: ['Turn on AC at 16\u{00B0}C', 'Use a ceiling fan', 'Use both AC and fan', 'Do nothing'],
    correctIndex: 1,
    explanation: 'A ceiling fan uses only 70W vs AC\u{2019}s 1500W. It\u{2019}s 20x more energy-efficient for basic cooling!',
  },
  {
    id: 'q2', difficulty: 1,
    question: 'Which appliance increases CO\u{2082} emissions the MOST?',
    options: ['Ceiling Fan (70W)', 'AC (1500W)', 'LED Bulb (9W)', 'Wi-Fi Router (12W)'],
    correctIndex: 1,
    explanation: 'AC at 1500W produces ~1,278 kg CO\u{2082}/year \u{2014} more than all other home appliances combined!',
  },
  {
    id: 'q3', difficulty: 2,
    question: 'What\u{2019}s the best way to reduce your electricity bill?',
    options: ['Use more appliances', 'Reduce usage & switch off unused devices', 'Keep everything on standby', 'Use old bulbs'],
    correctIndex: 1,
    explanation: 'Reducing usage and turning off standby devices can cut your bill by 20\u{2013}40%!',
  },
  {
    id: 'q4', difficulty: 2,
    question: 'If your energy consumption increases, CO\u{2082} emissions will\u{2026}',
    options: ['Decrease', 'Stay the same', 'Increase proportionally', 'Become zero'],
    correctIndex: 2,
    explanation: 'CO\u{2082} = kWh \u{00D7} 0.710. More energy = proportionally more CO\u{2082} emissions!',
  },
  {
    id: 'q5', difficulty: 2,
    question: 'Your phone is fully charged but still plugged in. What should you do?',
    options: ['Leave it \u{2014} it\u{2019}s fine', 'Unplug the charger immediately', 'Add more devices to same socket', 'Turn off the phone'],
    correctIndex: 1,
    explanation: 'Chargers draw standby power even when the phone is full. Unplugging saves energy!',
  },
  {
    id: 'q6', difficulty: 3,
    question: 'What\u{2019}s the best way to reduce your carbon footprint at home?',
    options: ['Use everything you want', 'Use efficiently \u{2014} right appliance, right time', 'Avoid all electronics', 'Only use at night'],
    correctIndex: 1,
    explanation: 'Smart, efficient usage \u{2014} choosing the right appliance at the right time \u{2014} is the key to reducing your carbon footprint!',
  },
];

// ═══════════════════════════════════════════════════════════
//  REAL-LIFE ACTIONS
// ═══════════════════════════════════════════════════════════
export const REAL_LIFE_ACTIONS = [
  { icon: '\u{1F32C}\u{FE0F}', action: 'Use fan instead of AC when possible', impact: 'Saves ~1,200 kg CO\u{2082}/year' },
  { icon: '\u{1F50C}', action: 'Turn OFF unused devices & unplug chargers', impact: 'Saves ~100 kg CO\u{2082}/year' },
  { icon: '\u{1F4A1}', action: 'Replace all bulbs with LED', impact: 'Uses 80% less energy' },
  { icon: '\u{23F1}\u{FE0F}', action: 'Reduce AC & geyser usage time', impact: 'Biggest single impact on bill' },
  { icon: '\u{1F6BF}', action: 'Use solar water heater instead of geyser', impact: 'Zero electricity for hot water' },
  { icon: '\u{1F9FA}', action: 'Run washing machine with full loads only', impact: 'Cuts energy per wash by 50%' },
];

// ═══════════════════════════════════════════════════════════
//  STAR SYSTEM
// ═══════════════════════════════════════════════════════════
export function calculateL3Stars(tasksPassed, totalTasks, quizScore, quizTotal) {
  const taskPct = (tasksPassed / totalTasks) * 100;
  const quizPct = (quizScore / quizTotal) * 100;
  const overall = taskPct * 0.5 + quizPct * 0.5;
  if (overall >= 80) return 3;
  if (overall >= 55) return 2;
  return 1;
}

export const LEVEL3_BADGE = {
  id: 'carbon_guardian',
  title: 'Carbon Guardian',
  description: 'Understood the devastating impact of energy misuse!',
  icon: '\u{1F6E1}\u{FE0F}',
  coins: 75,
};

// ═══════════════════════════════════════════════════════════
//  SHOCK DATA
// ═══════════════════════════════════════════════════════════
export const SHOCK_DATA = [
  { label: 'AC (1.5 Ton)',         co2Annual: 1278, icon: '\u{2744}\u{FE0F}' },
  { label: 'Geyser (2000W)',       co2Annual: 128,  icon: '\u{1F6BF}' },
  { label: 'Induction Cooktop',    co2Annual: 575,  icon: '\u{1F373}' },
  { label: 'Average Indian Home',  co2Annual: 2000, icon: '\u{1F3E0}' },
];

export const TREES_PER_CO2 = 22;

// ═══════════════════════════════════════════════════════════
//  DIALOGUE
// ═══════════════════════════════════════════════════════════
export const ENTRY_DIALOGUE = [
  'Something is wrong\u{2026}',
  'The more energy we use\u{2026}',
  '\u{2026}the worse it gets.',
];

export const END_DIALOGUE = [
  'We thought energy was harmless\u{2026}',
  'But every switch\u{2026} had a cost\u{2026}',
  'If this continues\u{2026} there may be no future\u{2026}',
  'But\u{2026} what if there was another way?',
];

// ═══════════════════════════════════════════════════════════
//  ICONS
// ═══════════════════════════════════════════════════════════
export const L3_ICONS = {
  zap: '\u{26A1}', fire: '\u{1F525}', globe: '\u{1F30D}',
  warn: '\u{26A0}\u{FE0F}', check: '\u{2705}', cross: '\u{274C}',
  star: '\u{2B50}', trophy: '\u{1F3C6}', party: '\u{1F389}',
  coin: '\u{1FA99}', chart: '\u{1F4CA}', money: '\u{1F4B0}',
  tree: '\u{1F333}', shock: '\u{1F633}', brain: '\u{1F9E0}',
  bulb: '\u{1F4A1}', skull: '\u{1F480}', house: '\u{1F3E0}',
  target: '\u{1F3AF}', clock: '\u{23F1}\u{FE0F}',
  leaf: '\u{1F33F}', sun: '\u{2600}\u{FE0F}',
  thermometer: '\u{1F321}\u{FE0F}', wind: '\u{1F32A}\u{FE0F}',
  smoke: '\u{1F32B}\u{FE0F}', siren: '\u{1F6A8}',
  shield: '\u{1F6E1}\u{FE0F}', grad: '\u{1F393}',
  pin: '\u{1F4CD}', memo: '\u{1F4DD}', book: '\u{1F4D8}',
  muscle: '\u{1F4AA}', sparkle: '\u{2728}', recycle: '\u{267B}\u{FE0F}',
  down: '\u{2B07}\u{FE0F}', up: '\u{2B06}\u{FE0F}',
};

export const ROOM_ICONS = {
  'Living Room': '\u{1F6CB}\u{FE0F}',
  'Bedroom': '\u{1F6CF}\u{FE0F}',
  'Kitchen': '\u{1F373}',
  'Bathroom': '\u{1F6BF}',
};

// ═══════════════════════════════════════════════════════════
//  REALIZATION LINES (post-quiz emotional moment)
// ═══════════════════════════════════════════════════════════
export const REALIZATION_LINES = [
  'Even after making better choices\u{2026}',
  'The problem still exists\u{2026}',
  '\u{2026}',
  'Is there\u{2026} something more we can do?',
];

// ═══════════════════════════════════════════════════════════
//  TEACHER DIALOGUE (solar hook intro)
// ═══════════════════════════════════════════════════════════
export const TEACHER_DIALOGUE = [
  "You've done well reducing energy usage\u{2026}",
  "But to truly protect the environment\u{2026}",
  "We need a different kind of energy\u{2026}",
  "Clean energy.",
];

export const TEACHER_DIALOGUE_2 = [
  "Solar energy produces electricity without pollution.",
  "It can power your home and protect the planet.",
];

export const SOLAR_HOOK_DATA = {
  giftText: 'SOLAR SYSTEM UNLOCKED \u{2600}\u{FE0F}',
  levelTitle: 'LEVEL 4: THE SOLUTION',
  levelSubtitle: 'SOLAR REVOLUTION',
  finalLine: "Now\u{2026} let's build a better future",
  teacherGift: "I have something for you\u{2026}",
  fixWorldQuestion: "Do you want to fix the world?",
  fixWorldDecline: "The world still needs you\u{2026}",
};

// ═══════════════════════════════════════════════════════════
//  GUIDANCE CONFIG (per-task guided learning data)
// ═══════════════════════════════════════════════════════════
export const GUIDANCE_CONFIG = {
  smart_cooling: {
    wrongAppliances: ['ac_1_5ton'],
    correctAppliances: ['ceiling_fan', 'table_fan'],
    wrongFeedback: {
      immediate: '+1500W added!',
      co2: 'CO\u{2082} increasing rapidly!',
      dialogue: 'This cools the room\u{2026} but at a very high energy cost \u{26A0}\u{FE0F}',
      instruction: 'Turn OFF the AC and try a more efficient option',
      fixStep: 'Press E near AC to turn it OFF',
      correctStep: 'Now try using the Fan instead',
    },
    successFeedback: 'Good choice! Fan uses much less energy',
    lessonPopup: 'Efficient choices reduce CO\u{2082} and electricity usage',
  },
  stop_waste: {
    wrongAppliances: [],
    correctAppliances: [],
    wrongFeedback: {
      dialogue: 'Some devices are still running unnecessarily!',
      instruction: 'Look for devices that are ON but not being used',
      fixStep: 'Find standby devices and turn them OFF',
    },
    successFeedback: 'Great! You stopped energy waste',
    lessonPopup: 'Standby power is a silent energy drain',
  },
  balance_usage: {
    wrongAppliances: ['ac_1_5ton', 'geyser', 'induction'],
    correctAppliances: ['ceiling_fan', 'led_bulb'],
    wrongFeedback: {
      dialogue: 'Too many high-power appliances are running!',
      instruction: 'Turn OFF appliances you don\'t truly need right now',
      fixStep: 'Start with the highest-watt appliances',
    },
    successFeedback: 'Smart! Running only what you need',
    lessonPopup: 'More appliances ON = more CO\u{2082} + higher bill',
  },
  reduce_fast: {
    wrongAppliances: [],
    correctAppliances: [],
    wrongFeedback: {
      dialogue: 'CO\u{2082} is still critical! Target high-watt appliances!',
      instruction: 'Turn OFF the highest-watt appliances first',
      fixStep: 'AC (1500W), Geyser (2000W), Induction (1800W)',
    },
    successFeedback: 'Fast action saved the environment!',
    lessonPopup: 'Always prioritize high-watt appliances first',
  },
};

