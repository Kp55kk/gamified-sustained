// ═══════════════════════════════════════════════════════════
//  LEVEL 3 — PHASE 1: "Understand the Consequences of Energy Use"
//  Data: Tasks, Environment Model, AC Temp, Quiz
// ═══════════════════════════════════════════════════════════
import {
  L2_APPLIANCE_MAP, L2_APPLIANCE_IDS, USAGE_HOURS,
  calculateBill, calculateCO2,
} from '../../level2/level2Data';

export { L2_APPLIANCE_MAP, L2_APPLIANCE_IDS, USAGE_HOURS, calculateBill, calculateCO2 };

// ═══════════════════════════════════════════════════════════
//  AC TEMPERATURE SYSTEM
// ═══════════════════════════════════════════════════════════
export const AC_TEMP_SETTINGS = [
  { temp: 18, label: '18°C', cooling: 'Extreme', warning: 'Extreme cooling wastes massive energy!', wattMul: 1.4, color: '#3b82f6', indoorDelta: -14 },
  { temp: 20, label: '20°C', cooling: 'Strong',  warning: 'Very cold — high energy use',          wattMul: 1.2, color: '#6366f1', indoorDelta: -11 },
  { temp: 22, label: '22°C', cooling: 'Good',    warning: null,                                   wattMul: 1.0, color: '#8b5cf6', indoorDelta: -8  },
  { temp: 24, label: '24°C', cooling: 'Optimal', warning: null,                                   wattMul: 0.8, color: '#22c55e', indoorDelta: -6  },
  { temp: 26, label: '26°C', cooling: 'Mild',    warning: null,                                   wattMul: 0.65,color: '#84cc16', indoorDelta: -4  },
  { temp: 28, label: '28°C', cooling: 'Minimal', warning: 'Barely any cooling',                   wattMul: 0.5, color: '#f59e0b', indoorDelta: -2  },
];
export const OPTIMAL_TEMP_IDX = 3; // 24°C

// ═══════════════════════════════════════════════════════════
//  AC TEMPERATURE TEACHING SCENARIOS
//  Each scenario shows WHY a certain temp works or fails
// ═══════════════════════════════════════════════════════════
export const AC_SCENARIOS = [
  {
    id: 'windows_open_18',
    title: 'Scenario 1: AC at 18°C, Windows OPEN',
    setup: { temp: 18, windowOpen: true, curtainOpen: true },
    result: {
      icon: '❌', status: 'terrible',
      indoorResult: '32°C (barely cooled!)',
      watts: 2100, monthlyExtra: 1200,
      message: 'AC is fighting the outdoor heat! Cool air escapes through open windows. You\'re paying ₹1200 extra for NOTHING.',
      lesson: 'Never run AC with windows open — 70% of cooling is wasted!',
    },
  },
  {
    id: 'closed_18',
    title: 'Scenario 2: AC at 18°C, Room SEALED',
    setup: { temp: 18, windowOpen: false, curtainOpen: false },
    result: {
      icon: '⚠️', status: 'wasteful',
      indoorResult: '20°C (too cold!)',
      watts: 2100, monthlyExtra: 900,
      message: 'Room is sealed ✅ but 18°C is TOO COLD. Your body doesn\'t need this. You\'re wasting ₹900 extra per month for discomfort!',
      lesson: 'Each degree below 24°C wastes ~6% more energy. 18°C = 40% MORE than 24°C!',
    },
  },
  {
    id: 'closed_24',
    title: 'Scenario 3: AC at 24°C, Room SEALED ✅',
    setup: { temp: 24, windowOpen: false, curtainOpen: false },
    result: {
      icon: '✅', status: 'optimal',
      indoorResult: '24°C (perfect comfort!)',
      watts: 1200, monthlyExtra: 0,
      message: 'PERFECT! Room is sealed, AC at 24°C. Comfortable temperature with minimum energy waste. This is the SMART way!',
      lesson: '24°C + closed room = optimal comfort at lowest cost. BEE recommends this!',
    },
  },
  {
    id: 'fan_ventilation',
    title: 'Scenario 4: Fan + Open Windows (NO AC)',
    setup: { temp: null, windowOpen: true, curtainOpen: false, fanOn: true },
    result: {
      icon: '🌿', status: 'eco',
      indoorResult: '29°C (warm but ventilated)',
      watts: 70, monthlyExtra: -800,
      message: 'Fan + ventilation costs just 70W vs AC\'s 1200W! Saves ₹800/month. Perfect for mild days or when you can tolerate some warmth.',
      lesson: 'Always try fan + ventilation first. Use AC ONLY when truly needed!',
    },
  },
];

// ═══════════════════════════════════════════════════════════
//  EB METER DATA — Displayed outside the house
// ═══════════════════════════════════════════════════════════
export function computeEBMeter(appStates, acTempIdx) {
  let totalWatts = 0;
  const breakdown = [];
  L2_APPLIANCE_IDS.forEach(id => {
    if (!appStates[id]) return;
    const a = L2_APPLIANCE_MAP[id];
    let w = a.wattage;
    if (id === 'ac_1_5ton') w = Math.round(w * AC_TEMP_SETTINGS[acTempIdx].wattMul);
    const hrs = USAGE_HOURS[id] || 4;
    const monthlyKwh = (w * hrs * 30) / 1000;
    const monthlyCost = Math.round(monthlyKwh * 7); // ~₹7/kWh
    totalWatts += w;
    breakdown.push({ id, name: a.name, icon: a.icon, wattage: w, hours: hrs, monthlyKwh: Math.round(monthlyKwh), monthlyCost, room: a.room });
  });
  breakdown.sort((a, b) => b.monthlyCost - a.monthlyCost);
  const totalKwh = breakdown.reduce((s, b) => s + b.monthlyKwh, 0);
  const totalCost = calculateBill(totalKwh).totalCost;
  const topConsumer = breakdown[0] || null;
  const topThree = breakdown.slice(0, 3);
  return { totalWatts, totalKwh, totalCost, breakdown, topConsumer, topThree };
}

// ═══════════════════════════════════════════════════════════
//  ENVIRONMENT MODEL
// ═══════════════════════════════════════════════════════════
export const BASE_ENV = { indoorTemp: 34, outdoorTemp: 36, co2: 0.05, airQuality: 1.0 };

export const APPLIANCE_ENV = {
  ac_1_5ton:       { indoor: 0,    outdoor: 3,   co2: 0.18, aqDrain: 0.10 },
  geyser:          { indoor: 2,    outdoor: 1.5, co2: 0.15, aqDrain: 0.08 },
  ceiling_fan:     { indoor: -2,   outdoor: 0,   co2: 0.008,aqDrain: 0.003 },
  table_fan:       { indoor: -1.5, outdoor: 0,   co2: 0.006,aqDrain: 0.002 },
  tv_smart:        { indoor: 0.5,  outdoor: 0,   co2: 0.012,aqDrain: 0.005 },
  fridge:          { indoor: 0.3,  outdoor: 0,   co2: 0.018,aqDrain: 0.006 },
  washing_machine: { indoor: 0,    outdoor: 0,   co2: 0.06, aqDrain: 0.03 },
  induction:       { indoor: 1,    outdoor: 0,   co2: 0.22, aqDrain: 0.09 },
  microwave:       { indoor: 0.5,  outdoor: 0,   co2: 0.14, aqDrain: 0.06 },
  mixer_grinder:   { indoor: 0,    outdoor: 0,   co2: 0.09, aqDrain: 0.04 },
  wifi_router:     { indoor: 0,    outdoor: 0,   co2: 0.001,aqDrain: 0.001 },
  set_top_box:     { indoor: 0,    outdoor: 0,   co2: 0.003,aqDrain: 0.001 },
  phone_charger:   { indoor: 0,    outdoor: 0,   co2: 0.002,aqDrain: 0.001 },
  led_tube:        { indoor: 0,    outdoor: 0,   co2: 0.002,aqDrain: 0.001 },
  led_bulb:        { indoor: 0,    outdoor: 0,   co2: 0.001,aqDrain: 0.001 },
};

export function computeEnvironment(appStates, acTempIdx, windowOpen, curtainOpen) {
  let indoor = BASE_ENV.indoorTemp;
  let outdoor = BASE_ENV.outdoorTemp;
  let co2 = BASE_ENV.co2;
  let aq = BASE_ENV.airQuality;
  let watts = 0;

  L2_APPLIANCE_IDS.forEach(id => {
    if (!appStates[id]) return;
    const w = L2_APPLIANCE_MAP[id].wattage;
    const env = APPLIANCE_ENV[id];
    if (!env) return;
    // AC handled specially
    if (id === 'ac_1_5ton') {
      const setting = AC_TEMP_SETTINGS[acTempIdx];
      watts += Math.round(w * setting.wattMul);
      // AC indoor effect depends on closed room
      const acEffective = (!windowOpen && !curtainOpen) ? 1.0 : 0.3;
      indoor += setting.indoorDelta * acEffective;
      outdoor += env.outdoor * setting.wattMul;
      co2 += env.co2 * setting.wattMul;
      aq -= env.aqDrain * setting.wattMul;
    } else {
      watts += w;
      indoor += env.indoor;
      outdoor += env.outdoor;
      co2 += env.co2;
      aq -= env.aqDrain;
    }
  });

  // Ventilation bonus (open windows + fan, no AC)
  if (windowOpen && !appStates.ac_1_5ton && (appStates.ceiling_fan || appStates.table_fan)) {
    indoor -= 3;
  } else if (windowOpen && !appStates.ac_1_5ton) {
    indoor -= 1;
  }

  // Calculate live cost (₹/hour approximation)
  const costPerHour = (watts / 1000) * 7; // ~₹7/kWh average
  const monthlyKwh = L2_APPLIANCE_IDS.reduce((sum, id) => {
    if (!appStates[id]) return sum;
    const w = id === 'ac_1_5ton' ? Math.round(L2_APPLIANCE_MAP[id].wattage * AC_TEMP_SETTINGS[acTempIdx].wattMul) : L2_APPLIANCE_MAP[id].wattage;
    return sum + (w * (USAGE_HOURS[id] || 4) * 30) / 1000;
  }, 0);
  const bill = calculateBill(monthlyKwh);

  return {
    indoorTemp: Math.round(indoor),
    outdoorTemp: Math.round(outdoor * 10) / 10,
    co2Level: Math.min(Math.max(co2, 0), 1.0),
    airQuality: Math.max(aq, 0),
    watts,
    costPerHour: Math.round(costPerHour * 10) / 10,
    monthlyBill: bill.totalCost,
    damageLevel: Math.min(watts / 7720, 1.0),
  };
}

// ═══════════════════════════════════════════════════════════
//  BILL BOARD APPLIANCE DATA
// ═══════════════════════════════════════════════════════════
export const BILL_APPLIANCES = L2_APPLIANCE_IDS.map(id => {
  const a = L2_APPLIANCE_MAP[id];
  const hrs = USAGE_HOURS[id] || 4;
  const monthlyKwh = (a.wattage * hrs * 30) / 1000;
  const co2 = calculateCO2(monthlyKwh);
  return { id, name: a.name, icon: a.icon, wattage: a.wattage, hours: hrs, monthlyKwh: Math.round(monthlyKwh), co2Monthly: Math.round(co2 * 10) / 10, room: a.room };
}).sort((a, b) => b.wattage - a.wattage);

// ═══════════════════════════════════════════════════════════
//  TASK DEFINITIONS (7 TASKS)
// ═══════════════════════════════════════════════════════════
export const PHASE1_TASKS = [
  {
    id: 'overuse_house', number: 1,
    title: 'Overuse the House',
    subtitle: 'YOU CREATE THE PROBLEM',
    icon: '⚡', color: '#ef4444', colorDot: '🔴',
    objective: 'Turn ON appliances to see what happens',
    description: 'Walk around and turn ON the AC, Geyser, and Lights. Watch what happens to the environment around you!',
    instruction: 'Walk to each appliance → Press E to turn ON',
    hint: 'Turn ON at least AC, Geyser, and Lights to see the full impact',
    type: 'turn_on',
    requiredOn: ['ac_1_5ton', 'geyser', 'led_tube'],
    initialOn: [],
    initialWindows: true, initialCurtains: true,
    learning: {
      title: '🧠 What You Caused',
      messages: [
        'Every appliance ON increases CO₂ emissions immediately',
        'High-watt devices (AC=1500W, Geyser=2000W) cause the MOST damage',
        'The environment reacts in real-time to your energy choices',
      ],
    },
  },
  {
    id: 'comfort_decision', number: 2,
    title: 'Comfort Decision Zone',
    subtitle: 'FAN → AC LOGIC',
    icon: '⚖️', color: '#f59e0b', colorDot: '🟡',
    objective: 'Cool the room the smart way',
    description: 'The room is HOT (34°C)! First try the fan. If that\'s not enough, prepare the room properly before using AC. Learn WHY 24°C with a closed room is the golden rule.',
    instruction: 'Walk to the fan → Press E → Then close windows/curtains by walking near them → Finally turn ON AC and set the right temperature',
    hint: 'AC won\'t work efficiently with open windows! SEAL the room first.',
    type: 'multi_step',
    hasACScenarios: true, // Triggers the elaborate AC scenario teaching UI
    steps: [
      { id: 'try_fan', label: '1. Walk to ceiling fan and turn it ON', action: 'turn_on', target: 'ceiling_fan', feedback: 'Fan running... 70W only! But still 32°C 🥵' },
      { id: 'close_window', label: '2. Walk to window → Press E to close', action: 'interact_window', feedback: 'Window closed! Hot air blocked ✅' },
      { id: 'close_curtain', label: '3. Walk to window → Press E to close curtain', action: 'interact_curtain', feedback: 'Curtain closed! Sunlight blocked ✅' },
      { id: 'turn_on_ac', label: '4. Walk to AC and turn it ON', action: 'turn_on', target: 'ac_1_5ton', feedback: 'AC ON — sealed room = efficient cooling! ✅' },
      { id: 'learn_temp', label: '5. Learn why 24°C is the best setting', action: 'ac_scenarios', feedback: 'Now you understand AC temperature science! 🧠' },
    ],
    initialOn: [], initialWindows: true, initialCurtains: true,
    learning: {
      title: '🧠 Smart Cooling Science',
      messages: [
        'Always try the fan FIRST — 70W vs AC\'s 1500W (20x difference!)',
        'SEAL the room (close windows + curtains + doors) before AC',
        'AC at 24°C with closed room = ₹0 wasted. AC at 18°C = ₹900 extra!',
        'Open windows + AC = 70% cooling WASTED. Worst combination!',
        'BEE India recommends 24°C as the standard AC temperature',
      ],
    },
  },
  {
    id: 'bill_hunt', number: 3,
    title: 'Bill Hunt',
    subtitle: 'FIND THE ENERGY THIEVES',
    icon: '💰', color: '#8b5cf6', colorDot: '🟣',
    objective: 'Find what is increasing your electricity bill',
    description: 'Your electricity bill is ₹3000+! Walk OUTSIDE to the EB meter board to investigate. The meter shows exactly which appliances are stealing your money!',
    instruction: 'Walk to the DOOR (left wall) → The EB meter is just inside the door → Press E to read the meter',
    hint: 'The EB meter is near the front door on the left wall!',
    type: 'eb_meter',
    initialOn: ['ac_1_5ton', 'geyser', 'tv_smart', 'led_tube', 'led_bulb', 'ceiling_fan', 'fridge'],
    initialWindows: false, initialCurtains: false,
    meterRoom: 'Living Room', // Must be in this room to interact
    requiredClicks: 3, // Must investigate at least 3 appliances
    learning: {
      title: '🧠 Bill Breakdown',
      messages: [
        'AC and Geyser together make up 60%+ of your electricity bill',
        'The EB meter never lies — it shows EXACTLY what you\'re paying',
        'Small devices like LED lights cost < ₹30/month. AC costs ₹1500+!',
        'Knowing which appliance costs the most helps you save smartly',
      ],
    },
  },
  {
    id: 'heat_loop', number: 4,
    title: 'Heat Loop Experience',
    subtitle: 'THE VICIOUS CYCLE',
    icon: '🌡️', color: '#dc2626', colorDot: '🔴',
    objective: 'Experience the heat feedback loop',
    description: 'Keep the AC running and watch what happens outside. More energy → more heat → more need for cooling. A vicious cycle!',
    instruction: 'Watch the outdoor temperature and CO₂ rise over 15 seconds',
    hint: 'Notice how using AC makes the OUTSIDE hotter!',
    type: 'observation',
    initialOn: ['ac_1_5ton', 'geyser', 'induction'],
    initialWindows: false, initialCurtains: false,
    duration: 15, // seconds to observe
    learning: {
      title: '🧠 The Heat Loop',
      messages: [
        'AC pumps heat FROM inside TO outside — making the city hotter!',
        'More AC usage → hotter cities → even MORE AC needed',
        'This is the Urban Heat Island effect — a real-world crisis',
      ],
    },
  },
  {
    id: 'air_quality', number: 5,
    title: 'Air Quality Check',
    subtitle: 'EXPERIENCE POLLUTION',
    icon: '🌫️', color: '#6b7280', colorDot: '⚫',
    objective: 'Experience the air pollution caused by energy use',
    description: 'Walk to the front door and open the window to see what your energy use has done to the air outside. The pollution is VISIBLE!',
    instruction: 'Walk to the door area (left wall) → Press E near window to open → See the pollution outside',
    hint: 'Walk to the left wall near the door to see outside!',
    type: 'air_check',
    initialOn: ['ac_1_5ton', 'geyser', 'induction', 'tv_smart'],
    initialWindows: false, initialCurtains: false,
    triggerRoom: 'Living Room', // Near the front door
    duration: 8, // seconds to experience
    learning: {
      title: '🧠 The Air We Breathe',
      messages: [
        'Electricity generation from coal creates harmful air pollution',
        'More energy use = more CO₂, SO₂, and particulate matter',
        'India generates ~70% electricity from fossil fuels',
        'Poor air quality affects 1.4 billion people\'s health',
      ],
    },
  },
  {
    id: 'fix_created', number: 6,
    title: 'Fix What You Created',
    subtitle: 'UNDO THE DAMAGE',
    icon: '🔧', color: '#22c55e', colorDot: '🟢',
    objective: 'Reduce the environmental impact',
    description: 'Now fix the damage! Turn OFF the geyser, replace AC with fan, and open windows for natural ventilation.',
    instruction: 'Turn OFF geyser → Turn OFF AC → Turn ON fan → Open windows',
    hint: 'Reduce wattage to see the environment recover!',
    type: 'fix',
    requiredActions: ['geyser_off', 'ac_off', 'fan_on', 'window_open'],
    initialOn: ['ac_1_5ton', 'geyser', 'tv_smart', 'led_tube', 'induction'],
    initialWindows: false, initialCurtains: false,
    learning: {
      title: '🧠 Recovery',
      messages: [
        'Smart choices immediately reduce environmental impact',
        'Fan + open windows = natural cooling with 95% less energy',
        'Good… but is this enough? Electricity still causes pollution.',
      ],
    },
  },
  {
    id: 'free_play', number: 7,
    title: 'Free Play Experiment',
    subtitle: 'TRY COMBINATIONS',
    icon: '🔬', color: '#06b6d4', colorDot: '🔵',
    objective: 'Experiment freely and find the best combinations',
    description: 'Try different combinations! AC + closed room vs Fan + ventilation vs Lights + daylight. Watch how each choice affects the environment.',
    instruction: 'Toggle appliances freely. Try to find the lowest-impact setup!',
    hint: 'Best combo: Fan + open windows during day, minimal lights at night',
    type: 'free_play',
    initialOn: [],
    initialWindows: true, initialCurtains: true,
    targetWatts: 200, // Goal: get under 200W
    experimentTime: 30, // seconds
    learning: {
      title: '🧠 Key Insight',
      messages: [
        'The best energy setup uses natural resources first (light, air)',
        'Only use high-watt appliances when absolutely necessary',
        'Every watt saved reduces your carbon footprint',
      ],
    },
  },
];

// ═══════════════════════════════════════════════════════════
//  REALIZATION DIALOGUE
// ═══════════════════════════════════════════════════════════
export const REALIZATION_LINES = [
  { speaker: 'narrator', text: 'You made better choices…' },
  { speaker: 'narrator', text: 'The house improved…' },
  { speaker: 'narrator', text: 'But outside… still not fully clean.' },
  { speaker: 'teacher', text: '"You used less energy — that\'s great!"' },
  { speaker: 'teacher', text: '"But electricity itself still causes pollution…"' },
  { speaker: 'teacher', text: '"We need a better solution."' },
];

// ═══════════════════════════════════════════════════════════
//  PHASE 1 QUIZ (6 questions)
// ═══════════════════════════════════════════════════════════
export const P1_QUIZ = [
  {
    id: 'q1',
    question: 'When you turned ON the AC and Geyser together, what happened to the environment?',
    options: ['Nothing changed', 'CO₂ and outdoor temperature increased', 'The room got colder everywhere', 'Electricity became free'],
    correctIndex: 1,
    explanation: 'High-watt appliances like AC (1500W) and Geyser (2000W) dramatically increase CO₂ emissions and contribute to outdoor heating.',
  },
  {
    id: 'q2',
    question: 'Why should you close windows and curtains BEFORE turning on the AC?',
    options: ['To make the room darker', 'Because AC needs closed space to cool efficiently', 'Windows break from cold air', 'It doesn\'t matter'],
    correctIndex: 1,
    explanation: 'An AC works by cooling air inside a sealed space. Open windows let cool air escape and hot air enter, wasting up to 70% of the cooling!',
  },
  {
    id: 'q3',
    question: 'What is the optimal AC temperature for balancing comfort and energy savings?',
    options: ['16°C — colder is better', '18°C — for maximum cooling', '24°C — optimal balance', '30°C — saves most energy'],
    correctIndex: 2,
    explanation: '24°C provides comfortable cooling while using 20-40% less energy than 18°C. Each degree lower wastes about 6% more energy!',
  },
  {
    id: 'q4',
    question: 'What is the "Heat Loop" effect you experienced?',
    options: [
      'The house gets colder over time',
      'More AC usage → hotter outside → even more AC needed',
      'Fans create loops of wind',
      'Geysers heat the loop of water',
    ],
    correctIndex: 1,
    explanation: 'ACs pump heat from inside to outside. When everyone uses AC, cities become hotter (Urban Heat Island effect), creating a vicious cycle that demands even more cooling.',
  },
  {
    id: 'q5',
    question: 'Which combination is the MOST energy-efficient for cooling?',
    options: [
      'AC at 18°C with windows open',
      'AC at 24°C with closed room',
      'Fan + open windows for ventilation',
      'AC + Fan + Geyser together',
    ],
    correctIndex: 2,
    explanation: 'Fan + open windows uses only 70W (vs 1500W for AC). When natural ventilation is possible, it\'s 20x more energy-efficient!',
  },
  {
    id: 'q6',
    question: 'After fixing the house, the teacher said "But electricity still causes pollution." Why?',
    options: [
      'Because pollution is permanent',
      'Because most electricity comes from burning fossil fuels like coal',
      'Because fans pollute the air',
      'Because LED lights emit CO₂',
    ],
    correctIndex: 1,
    explanation: 'In India, ~70% of electricity comes from coal and gas. Even reducing usage helps, but the source of electricity still creates CO₂. That\'s why we need clean energy like solar!',
  },
];

// ═══════════════════════════════════════════════════════════
//  BADGE & SCORING
// ═══════════════════════════════════════════════════════════
export const PHASE1_BADGE = {
  icon: '🔍',
  title: 'Energy Analyst',
  description: 'Understood the consequences of energy use!',
  coins: 50,
};

export function calculateP1Stars(tasksCompleted, totalTasks, quizScore, quizTotal) {
  const taskPct = (tasksCompleted / totalTasks) * 100;
  const quizPct = (quizScore / quizTotal) * 100;
  const overall = taskPct * 0.5 + quizPct * 0.5;
  if (overall >= 80) return 3;
  if (overall >= 55) return 2;
  return 1;
}

// ═══════════════════════════════════════════════════════════
//  EXPERIMENT FEEDBACK MESSAGES
// ═══════════════════════════════════════════════════════════
export const EXPERIMENT_FEEDBACK = {
  ac_on_window_open: '⚠️ AC is ON but windows are open — cooling escaping!',
  ac_on_curtain_open: '⚠️ Sunlight heating the room — close curtains!',
  fan_ventilation: '✅ Fan + open windows = efficient natural cooling!',
  geyser_long: '⚠️ Geyser uses 2000W — limit to 10 min!',
  all_lights_day: '💡 All lights ON during daytime? Try sunlight!',
  low_watts: '🌿 Excellent! Under 200W — minimal impact!',
  high_watts: '🔥 Over 3000W — significant environmental damage!',
  ac_18: '❄️ 18°C uses 40% more energy than 24°C!',
  ac_24: '✅ 24°C — perfect balance of comfort and efficiency!',
};
