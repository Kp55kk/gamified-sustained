// ═══════════════════════════════════════════════════════════
//  LEVEL 5: SMART SUSTAINABLE HOME — Data & Constants
//  Final Master Simulation — Chief Sustainability Engineer
// ═══════════════════════════════════════════════════════════
import {
  LEVEL2_APPLIANCES, L2_APPLIANCE_IDS, L2_APPLIANCE_MAP,
  USAGE_HOURS, calculateBill, calculateCO2, CO2_FACTOR,
} from '../level2/level2Data';

export {
  L2_APPLIANCE_IDS, L2_APPLIANCE_MAP, USAGE_HOURS,
  calculateBill, calculateCO2, CO2_FACTOR,
};

// ═══ EV CHARGER (new appliance for L5) ═══
export const EV_CHARGER = {
  id: 'ev_charger', name: 'EV Charger', icon: '\u{1F50C}', wattage: 3000,
  room: 'Utility', animationType: 'glow', category: 'Heavy Load',
};

// ═══ ALL L5 APPLIANCES (L2 + EV) ═══
export const L5_APPLIANCES = [...LEVEL2_APPLIANCES, EV_CHARGER];
export const L5_APPLIANCE_IDS = L5_APPLIANCES.map(a => a.id);
export const L5_APPLIANCE_MAP = {};
L5_APPLIANCES.forEach(a => { L5_APPLIANCE_MAP[a.id] = a; });

// ═══ APPLIANCE DISCOVERY DATA ═══
export const APPLIANCE_INSIGHTS = {
  ceiling_fan:     { category: 'Efficient', insight: 'Low energy cooling option — runs for hours affordably', loadClass: 'low' },
  tv_smart:        { category: 'Moderate', insight: 'Smart TVs consume standby power even when "off"', loadClass: 'low' },
  wifi_router:     { category: 'Always On', insight: 'Runs 24/7 silently — 105 kWh/year', loadClass: 'low' },
  set_top_box:     { category: 'Standby Drain', insight: 'Turn off at plug when not watching!', loadClass: 'low' },
  ac_1_5ton:       { category: 'High Load', insight: 'Consumes high energy continuously — biggest bill driver', loadClass: 'high' },
  phone_charger:   { category: 'Low Load', insight: 'Unplug when done — phantom power adds up!', loadClass: 'low' },
  table_fan:       { category: 'Efficient', insight: 'Uses 30% less power than ceiling fan', loadClass: 'low' },
  fridge:          { category: 'Always On', insight: 'Compressor cycles — don\'t open door frequently', loadClass: 'medium' },
  induction:       { category: 'High Load', insight: '1500W cooking — use during solar peak hours', loadClass: 'high' },
  microwave:       { category: 'High Load', insight: 'Short bursts — efficient for reheating', loadClass: 'high' },
  mixer_grinder:   { category: 'Burst Load', insight: 'High watts but very short usage keeps annual cost low', loadClass: 'medium' },
  led_tube:        { category: 'Efficient', insight: 'LED tubes use 80% less than old fluorescent', loadClass: 'low' },
  geyser:          { category: 'Very High', insight: '2000W — highest home appliance! Limit to 10 min', loadClass: 'high' },
  washing_machine: { category: 'Medium Load', insight: 'Full loads maximize efficiency — schedule for noon', loadClass: 'medium' },
  led_bulb:        { category: 'Ultra Efficient', insight: 'Only 9W — replaced 60W incandescent bulbs', loadClass: 'low' },
  ev_charger:      { category: 'Heavy Load', insight: '3000W — best used during solar peak for free charging', loadClass: 'high' },
};

// ═══ SCHEDULING SYSTEM ═══
export const SCHEDULE_SLOTS = [
  { id: 'dawn',      label: 'Dawn (6 AM)',      hour: 6,  icon: '\u{1F305}', sunlight: 0.2 },
  { id: 'morning',   label: 'Morning (9 AM)',   hour: 9,  icon: '\u{1F304}', sunlight: 0.6 },
  { id: 'noon',      label: 'Noon (12 PM)',     hour: 12, icon: '\u{2600}\u{FE0F}', sunlight: 1.0 },
  { id: 'afternoon', label: 'Afternoon (3 PM)', hour: 15, icon: '\u{1F31E}', sunlight: 0.8 },
  { id: 'evening',   label: 'Evening (6 PM)',   hour: 18, icon: '\u{1F307}', sunlight: 0.15 },
  { id: 'night',     label: 'Night (9 PM)',     hour: 21, icon: '\u{1F303}', sunlight: 0.0 },
];

export const OPTIMAL_SCHEDULE = {
  washing_machine: 'noon', ev_charger: 'noon', induction: 'morning',
  ac_1_5ton: 'afternoon', geyser: 'morning', microwave: 'noon',
  led_bulb: 'night', led_tube: 'evening', ceiling_fan: 'afternoon',
  tv_smart: 'evening', fridge: 'dawn', // always on but mark dawn
};

export function scoreSchedule(playerSchedule) {
  let correct = 0, total = 0;
  for (const [appId, slot] of Object.entries(playerSchedule)) {
    if (OPTIMAL_SCHEDULE[appId]) {
      total++;
      if (slot === OPTIMAL_SCHEDULE[appId]) correct++;
    }
  }
  return { correct, total, pct: total > 0 ? Math.round((correct / total) * 100) : 0 };
}

// ═══ SOLAR SYSTEM ═══
export const PANEL_WATT_PEAK = 330;
export const PANEL_COUNT = 6; // pre-installed in L5
export const TILT_EFF = 1.0; // optimal tilt pre-set
export const AVG_SHADOW = 0.03;

export function calcSolarW(sunlight, weather = 1.0) {
  return Math.round(PANEL_COUNT * PANEL_WATT_PEAK * TILT_EFF * sunlight * weather * (1 - AVG_SHADOW));
}

export function calcDailySolarKwh(weather = 1.0) {
  let wh = 0;
  SCHEDULE_SLOTS.forEach(s => { wh += calcSolarW(s.sunlight, weather) * 3; });
  return Math.round(wh / 1000 * 100) / 100;
}

// ═══ BATTERY ═══
export const BATTERY_CAPACITY = 10.0; // 10 kWh
export const BATTERY_CHARGE_RATE = 1.5;
export const BATTERY_DISCHARGE_RATE = 2.0;

// ═══ WEATHER / DYNAMIC EVENTS ═══
export const WEATHER_TYPES = [
  { id: 'clear',   label: 'Clear Sky',    factor: 1.0,  icon: '\u{2600}\u{FE0F}' },
  { id: 'partial', label: 'Partly Cloudy', factor: 0.7,  icon: '\u{26C5}' },
  { id: 'cloudy',  label: 'Overcast',     factor: 0.35, icon: '\u{2601}\u{FE0F}' },
  { id: 'storm',   label: 'Stormy',       factor: 0.15, icon: '\u{26C8}\u{FE0F}' },
];

export const DYNAMIC_EVENTS = [
  { id: 'cloudy_noon', trigger: 'noon', weather: 'cloudy', label: '\u{2601}\u{FE0F} Clouds roll in at noon!', hint: 'Solar drops — shift heavy loads or use battery' },
  { id: 'night_demand', trigger: 'night', weather: 'clear', label: '\u{1F303} Night falls — no solar!', hint: 'Battery and grid only. Reduce load!' },
  { id: 'peak_demand', trigger: 'afternoon', weather: 'partial', label: '\u{26A1} Peak demand spike!', hint: 'Everyone uses AC — grid stressed. Use solar+battery' },
];

// ═══ CRISIS SCENARIOS ═══
export const CRISIS_SCENARIO = {
  title: '\u{1F6A8} Energy Crisis!',
  desc: 'Battery at 15%, solar dropping, heavy load ON. Prevent CO\u{2082} and bill spikes!',
  conditions: { batteryPct: 15, solarFactor: 0.3, mandatoryLoads: ['fridge', 'wifi_router', 'led_bulb'] },
  targets: { maxGridW: 800, maxCO2Rate: 0.5 },
  success: 'Crisis averted! Smart load management saved the day.',
  failure: 'Grid overload! CO\u{2082} spiked. Try shedding non-essential loads.',
};

// ═══ COST PER UNIT ═══
export const COST_PER_KWH = 7; // ₹7 avg

// ═══ BEFORE VALUES (from Level 3) ═══
export const BEFORE_STATS = { co2Month: 223, billMonth: 2500 };

// ═══ PHASE DEFINITIONS ═══
export const PHASES = [
  { id: 'dashboard',   title: 'Global Dashboard',     icon: '\u{1F4CA}', objective: 'Familiarize yourself with the sustainability dashboard', desc: 'Your command center — all metrics live. Walk around and observe.', hint: 'Dashboard is always visible. Move with WASD.' },
  { id: 'appliance',   title: 'Appliance Discovery',   icon: '\u{1F50D}', objective: 'Discover all appliances and learn their energy profiles', desc: 'Walk to each appliance and interact (E key). First contact reveals energy details.', hint: 'Visit each room — Living, Bedroom, Kitchen, Bathroom, and Utility zone.' },
  { id: 'control',     title: 'Smart Control',         icon: '\u{1F39B}\u{FE0F}', objective: 'Manage appliances efficiently with solar priority', desc: 'Turn appliances ON/OFF. Solar supplies first, then battery, then grid.', hint: 'Keep grid usage below 500W for best efficiency.' },
  { id: 'schedule',    title: 'Smart Scheduling',      icon: '\u{1F4C5}', objective: 'Schedule heavy appliances to optimal times', desc: 'Assign each heavy appliance to the best time of day. Solar peak = noon!', hint: 'Washing machine + EV at noon. Lights at night.' },
  { id: 'solar',       title: 'Solar + Battery',       icon: '\u{2600}\u{FE0F}', objective: 'Maximize solar usage and battery storage', desc: 'Solar supplies first. Excess charges battery. Grid is last resort.', hint: 'Watch the energy flow animation. Charge battery at noon!' },
  { id: 'events',      title: 'Dynamic Events',        icon: '\u{1F326}\u{FE0F}', objective: 'Adapt to changing weather conditions', desc: 'Weather changes affect solar output. Adjust your strategy in real-time!', hint: 'Clouds reduce solar — switch to battery or reduce load.' },
  { id: 'crisis',      title: 'Crisis Mode',           icon: '\u{1F6A8}', objective: 'Handle an energy emergency', desc: 'Battery low, solar dropping, heavy load on. Keep grid under control!', hint: 'Turn off non-essential appliances. Prioritize critical loads.' },
  { id: 'graphs',      title: 'Energy Analytics',      icon: '\u{1F4CA}', objective: 'Analyze your energy usage patterns', desc: 'View bar charts of appliance consumption and time-based usage.', hint: 'AC is the biggest consumer. LED lights are most efficient!' },
  { id: 'dayrun',      title: 'Full Day Simulation',   icon: '\u{23F1}\u{FE0F}', objective: 'Run the house through a complete 24-hour cycle', desc: 'Manage morning→noon→evening→night. Optimize every time period!', hint: 'Heavy loads at noon, essentials only at night.' },
  { id: 'impact',      title: 'Final Impact Report',   icon: '\u{1F30D}', objective: 'See your total sustainability impact', desc: 'Compare your performance against baseline. How much did you save?', hint: 'Check CO₂ reduction, bill savings, and efficiency score.' },
];

// ═══ QUIZ — SCENARIO-BASED ═══
export const L5_QUIZ = [
  {
    question: 'Best time to charge the EV using solar power?',
    options: ['Night (cheap grid)', 'Dawn (early start)', 'Noon (peak solar)', 'Evening (after work)'],
    correctIndex: 2,
    explanation: 'Noon has maximum solar output — free, clean charging!',
  },
  {
    question: 'Solar drops due to clouds. Battery at 40%. What should you do?',
    options: ['Turn on AC', 'Reduce load to essentials', 'Switch everything to grid', 'Charge battery from grid'],
    correctIndex: 1,
    explanation: 'Reduce load to stretch battery life and minimize grid dependency.',
  },
  {
    question: 'Which appliance scheduling saves the most money?',
    options: ['Lights at noon', 'Washing machine at noon', 'AC at midnight', 'Geyser all day'],
    correctIndex: 1,
    explanation: 'Washing machine at noon uses free solar power instead of paid grid!',
  },
  {
    question: 'efficiency = (usefulEnergy / totalEnergy) × 100. If solar provides 1200W and house uses 1500W, what\'s the solar efficiency?',
    options: ['60%', '75%', '80%', '100%'],
    correctIndex: 2,
    explanation: '(1200 / 1500) × 100 = 80%. Solar covers 80% of demand!',
  },
  {
    question: 'Your battery is full at noon with excess solar. What happens to the surplus?',
    options: ['Wasted', 'Exported to grid', 'Stored for night use', 'Battery overcharges'],
    correctIndex: 1,
    explanation: 'Excess solar with full battery gets exported to the grid (net metering).',
  },
  {
    question: 'Which uses MORE energy per year: AC for 8h/day or LED bulbs for 24h?',
    options: ['LED bulbs', 'Both equal', 'AC by far', 'Depends on season'],
    correctIndex: 2,
    explanation: 'AC: 1500W × 8h = 12kWh/day. LED: 9W × 24h = 0.22kWh/day. AC uses 55× more!',
  },
  {
    question: 'What is the CO₂ factor for Indian electricity grid?',
    options: ['0.3 kg/kWh', '0.5 kg/kWh', '0.71 kg/kWh', '1.0 kg/kWh'],
    correctIndex: 2,
    explanation: 'India\'s grid emission factor is 0.710 kg CO₂/kWh (CEA 2024-25).',
  },
  {
    question: 'You achieved 80% solar usage. What does this mean?',
    options: ['80% of panels active', '80% of energy from sun', '80% bill reduction', '80% battery charge'],
    correctIndex: 1,
    explanation: '80% solar usage means 80% of your home\'s energy came from solar panels!',
  },
];

// ═══ STAR SYSTEM ═══
export function calculateL5Stars(effPct, solarPct, schedPct, crisisPassed, quizPct) {
  const overall = effPct * 0.2 + solarPct * 0.2 + schedPct * 0.15 + (crisisPassed ? 15 : 0) + quizPct * 0.3;
  if (overall >= 75) return 3;
  if (overall >= 50) return 2;
  return 1;
}

// ═══ BADGE ═══
export const LEVEL5_BADGE = {
  id: 'sustainability_chief',
  title: 'Chief Sustainability Engineer',
  description: 'Mastered the Smart Sustainable Home — ultimate energy manager!',
  icon: '\u{1F3C6}',
  coins: 200,
};

// ═══ DIALOGUE ═══
export const ENTRY_DIALOGUE = [
  "You've learned the problem\u{2026}",
  "You've discovered the solution\u{2026}",
  "Now\u{2026} can you manage everything?",
];

export const FINAL_DIALOGUE = [
  "The future is not fixed\u{2026}",
  "It is shaped by your choices.",
  "You are now a Chief Sustainability Engineer!",
  "Go make a difference. \u{1F30D}\u{2728}",
];

// ═══ ICONS ═══
export const L5 = {
  sun: '\u{2600}\u{FE0F}', zap: '\u{26A1}', battery: '\u{1F50B}', globe: '\u{1F30D}',
  money: '\u{1F4B0}', chart: '\u{1F4CA}', check: '\u{2705}', cross: '\u{274C}',
  star: '\u{2B50}', trophy: '\u{1F3C6}', coin: '\u{1FA99}', bulb: '\u{1F4A1}',
  brain: '\u{1F9E0}', target: '\u{1F3AF}', leaf: '\u{1F33F}', sparkle: '\u{2728}',
  pin: '\u{1F4CD}', house: '\u{1F3E0}', gear: '\u{2699}\u{FE0F}', ev: '\u{1F697}',
  warn: '\u{26A0}\u{FE0F}', party: '\u{1F389}', clock: '\u{23F1}\u{FE0F}',
  shield: '\u{1F6E1}\u{FE0F}', grad: '\u{1F393}', fire: '\u{1F525}',
  cloud: '\u{2601}\u{FE0F}', search: '\u{1F50D}', cal: '\u{1F4C5}',
  slider: '\u{1F39B}\u{FE0F}', storm: '\u{26C8}\u{FE0F}', alert: '\u{1F6A8}',
  graph: '\u{1F4C8}', night: '\u{1F303}', sunrise: '\u{1F305}',
};

export const ROOM_ICONS = {
  'Living Room': '\u{1F6CB}\u{FE0F}', 'Bedroom': '\u{1F6CF}\u{FE0F}',
  'Kitchen': '\u{1F373}', 'Bathroom': '\u{1F6BF}',
  'Outside': '\u{1F333}', 'Utility': '\u{26A1}',
};

// ═══ LEARNINGS PER PHASE ═══
export const PHASE_LEARNINGS = {
  dashboard: ['The dashboard shows your real-time sustainability metrics', 'Monitor CO₂, bill, efficiency, solar, and battery together'],
  appliance: ['Every appliance has a different energy profile', 'High-load appliances drive most of your bill and CO₂'],
  control:   ['Solar-first priority reduces grid dependency', 'Smart ON/OFF timing is key to efficiency'],
  schedule:  ['Heavy appliances at noon = free solar power', 'Good scheduling increases efficiency by 30%+'],
  solar:     ['Solar → Battery → Grid is the optimal priority', 'Battery stores excess noon solar for night use'],
  events:    ['Weather directly impacts solar generation', 'Adaptability is key to sustainable energy management'],
  crisis:    ['Emergency load shedding prevents CO₂ spikes', 'Critical loads (fridge, router) must stay on'],
  graphs:    ['AC consumes more than all LED lights combined for a year', 'Data-driven decisions lead to better efficiency'],
  dayrun:    ['A well-managed day balances all energy sources', 'Every hour requires different strategies'],
  impact:    ['Your choices directly reduced CO₂ and bills', 'Solar energy is the solution — clean, free, sustainable'],
};
