// ═══════════════════════════════════════════════════════════
//  LEVEL 5: SMART SUSTAINABLE HOME — BUILD YOUR FUTURE
//  Progressive Appliance Unlock System
// ═══════════════════════════════════════════════════════════
import {
  LEVEL2_APPLIANCES, L2_APPLIANCE_IDS, L2_APPLIANCE_MAP,
  USAGE_HOURS, calculateBill, calculateCO2, CO2_FACTOR,
} from '../level2/level2Data';

export {
  L2_APPLIANCE_IDS, L2_APPLIANCE_MAP, USAGE_HOURS,
  calculateBill, calculateCO2, CO2_FACTOR,
};

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
  store: '\u{1F3EA}', lock: '\u{1F512}', unlock: '\u{1F513}',
  plug: '\u{1F50C}', drop: '\u{1F4A7}', snow: '\u{2744}\u{FE0F}',
  light: '\u{1F4A1}', strip: '\u{1F50C}', heater: '\u{2615}',
};

export const ROOM_ICONS = {
  'Living Room': '\u{1F6CB}\u{FE0F}', 'Bedroom': '\u{1F6CF}\u{FE0F}',
  'Kitchen': '\u{1F373}', 'Bathroom': '\u{1F6BF}',
  'Outside': '\u{1F333}', 'Utility': '\u{26A1}',
};

// ═══ GOVERNMENT SUBSIDY BONUS ═══
export const STARTING_BONUS = 100;
export const STARTING_BONUS_MSG = 'Government Smart Home Subsidy: +100 Carbon Coins!';

// ═══ 5 PROGRESSIVE SUSTAINABLE APPLIANCES ═══
export const STORE_APPLIANCES = [
  {
    id: 'air_cooler',
    name: 'Air Cooler',
    icon: '\u{1F4A8}',
    wattage: 200,
    cost: 50,
    loadType: 'Medium',
    loadClass: 'medium',
    correctRoom: 'Living Room',
    description: 'An energy-efficient alternative to AC that uses evaporative cooling.',
    insight: 'Uses only 200W compared to AC\'s 1500W — that\'s 86% less energy!',
    bestTime: 'afternoon',
    replaces: 'AC (1500W)',
    savingPct: 86,
    co2SavedKg: 8.5,
    usageTask: {
      title: 'Cool the Room Efficiently',
      instruction: 'Choose the best way to cool the room',
      correct: { label: 'Use Air Cooler (200W)', time: 'afternoon', feedback: 'Air Cooler uses 86% less energy than AC! Smart sustainable choice.' },
      wrong: { label: 'Use AC (1500W)', feedback: 'AC consumes 1500W — that\'s 7.5× more energy and higher CO₂ emissions!' },
    },
    learningMsg: 'Air cooler reduced energy by 86% compared to AC. In a year, this saves ~950 kWh and ~675 kg CO₂!',
  },
  {
    id: 'smart_power_strip',
    name: 'Smart Power Strip',
    icon: '\u{1F50C}',
    wattage: 15,
    cost: 60,
    loadType: 'Ultra Low',
    loadClass: 'low',
    correctRoom: 'Living Room',
    description: 'Automatically cuts power to devices in standby mode, eliminating phantom load.',
    insight: 'Standby devices waste 5-10% of home energy. Smart strip eliminates this waste!',
    bestTime: 'night',
    replaces: 'Standby Waste (~100W phantom)',
    savingPct: 95,
    co2SavedKg: 4.2,
    usageTask: {
      title: 'Eliminate Standby Waste',
      instruction: 'How do you reduce phantom power drain at night?',
      correct: { label: 'Smart Strip auto-cuts standby', time: 'night', feedback: 'Smart strip detected TV, STB, charger in standby → Cut phantom power automatically!' },
      wrong: { label: 'Leave devices on standby', feedback: 'Standby devices silently drain ~100W continuously — that\'s 876 kWh/year wasted!' },
    },
    learningMsg: 'Smart power strip saves ~876 kWh/year by eliminating phantom loads. That\'s ₹6,100 and 622 kg CO₂ saved annually!',
  },
  {
    id: 'led_smart_system',
    name: 'LED Smart Lighting',
    icon: '\u{1F4A1}',
    wattage: 10,
    cost: 70,
    loadType: 'Ultra Efficient',
    loadClass: 'low',
    correctRoom: 'Bedroom',
    description: 'Smart LED system with dimming, scheduling, and motion detection — replaces all traditional lighting.',
    insight: 'Uses 80% less energy than incandescent and auto-dims when not needed!',
    bestTime: 'evening',
    replaces: 'Traditional Lighting (~200W)',
    savingPct: 90,
    co2SavedKg: 3.8,
    usageTask: {
      title: 'Smart Lighting Control',
      instruction: 'How do you manage lighting efficiently in the evening?',
      correct: { label: 'Smart LED with auto-dim + scheduling', time: 'evening', feedback: 'Smart LEDs dim automatically and turn off on schedule — 90% energy saved!' },
      wrong: { label: 'Keep all lights at full brightness', feedback: 'Full brightness wastes energy. Smart dimming saves 40% even when lights are on!' },
    },
    learningMsg: 'Smart LED system uses 90% less energy than traditional bulbs. Motion sensors prevent lights being left on in empty rooms!',
  },
  {
    id: 'solar_water_heater',
    name: 'Solar Water Heater',
    icon: '\u{2615}',
    wattage: 0,
    cost: 100,
    loadType: 'Zero Electric',
    loadClass: 'low',
    correctRoom: 'Bathroom',
    description: 'Uses solar thermal energy to heat water — completely replaces the 2000W electric geyser!',
    insight: 'Zero electricity! Heats water using sunlight. Replaces the biggest energy hog in your home.',
    bestTime: 'morning',
    replaces: 'Electric Geyser (2000W)',
    savingPct: 100,
    co2SavedKg: 12.5,
    usageTask: {
      title: 'Heat Water Without Electricity',
      instruction: 'How do you get hot water for a bath?',
      correct: { label: 'Solar Water Heater (0W)', time: 'morning', feedback: 'Solar heater uses FREE sunlight! Zero electricity, zero CO₂, zero cost!' },
      wrong: { label: 'Electric Geyser (2000W)', feedback: 'Geyser uses 2000W — the highest single appliance load! That\'s ~128 kg CO₂/year!' },
    },
    learningMsg: 'Solar water heater eliminated 2000W load completely! Saves ~365 kWh/year and 259 kg CO₂. The geyser was your home\'s biggest energy consumer!',
  },
  {
    id: 'ev_charger',
    name: 'EV Charger',
    icon: '\u{26A1}',
    wattage: 3000,
    cost: 120,
    loadType: 'Heavy',
    loadClass: 'high',
    correctRoom: 'Outside',
    description: 'Electric Vehicle charger — charges your car using solar energy instead of petrol!',
    insight: '3000W load but if charged during solar peak, it\'s essentially FREE and zero-emission!',
    bestTime: 'noon',
    replaces: 'Petrol Vehicle (~₹8,000/month fuel)',
    savingPct: 70,
    co2SavedKg: 150,
    usageTask: {
      title: 'Charge Vehicle Using Solar',
      instruction: 'When is the best time to charge your EV?',
      correct: { label: 'Charge at noon (solar peak)', time: 'noon', feedback: 'Noon charging uses free solar energy! Zero fuel cost, zero emissions!' },
      wrong: { label: 'Charge at night (no solar)', feedback: 'Night charging uses grid power — higher bills and 0.71 kg CO₂ per kWh consumed!' },
    },
    learningMsg: 'EV + Solar charging replaces ₹8,000/month petrol cost with near-zero energy cost. Annual CO₂ savings: ~1,800 kg compared to petrol car!',
  },
];

export const STORE_APPLIANCE_MAP = {};
STORE_APPLIANCES.forEach(a => { STORE_APPLIANCE_MAP[a.id] = a; });
export const STORE_IDS = STORE_APPLIANCES.map(a => a.id);

// ═══ TIME SYSTEM ═══
export const SCHEDULE_SLOTS = [
  { id: 'dawn',      label: 'Dawn (6 AM)',      hour: 6,  icon: '\u{1F305}', sunlight: 0.2 },
  { id: 'morning',   label: 'Morning (9 AM)',   hour: 9,  icon: '\u{1F304}', sunlight: 0.6 },
  { id: 'noon',      label: 'Noon (12 PM)',     hour: 12, icon: '\u{2600}\u{FE0F}', sunlight: 1.0 },
  { id: 'afternoon', label: 'Afternoon (3 PM)', hour: 15, icon: '\u{1F31E}', sunlight: 0.8 },
  { id: 'evening',   label: 'Evening (6 PM)',   hour: 18, icon: '\u{1F307}', sunlight: 0.15 },
  { id: 'night',     label: 'Night (9 PM)',     hour: 21, icon: '\u{1F303}', sunlight: 0.0 },
];

// ═══ SOLAR SYSTEM ═══
export const PANEL_WATT_PEAK = 330;
export const PANEL_COUNT = 6;
export const BATTERY_CAPACITY = 10.0;
export const BATTERY_CHARGE_RATE = 1.5;
export const BATTERY_DISCHARGE_RATE = 2.0;

export function calcSolarW(sunlight, weather = 1.0) {
  return Math.round(PANEL_COUNT * PANEL_WATT_PEAK * sunlight * weather * 0.97);
}

// ═══ WEATHER ═══
export const WEATHER_TYPES = [
  { id: 'clear',   label: 'Clear Sky',    factor: 1.0,  icon: '\u{2600}\u{FE0F}' },
  { id: 'partial', label: 'Partly Cloudy', factor: 0.7,  icon: '\u{26C5}' },
  { id: 'cloudy',  label: 'Overcast',     factor: 0.35, icon: '\u{2601}\u{FE0F}' },
];

// ═══ COST ═══
export const COST_PER_KWH = 7;
export const BEFORE_STATS = { co2Month: 223, billMonth: 2500 };

// ═══ PHASE DEFINITIONS (10 phases) ═══
export const PHASES = [
  { id: 'entry',       title: 'Welcome',               icon: '\u{1F3E0}' },
  { id: 'store',       title: 'Smart Store',            icon: '\u{1F3EA}' },
  { id: 'appliance',   title: 'Upgrade Home',           icon: '\u{1F527}' }, // cycles per appliance
  { id: 'integration', title: 'Integration Mode',       icon: '\u{1F504}' },
  { id: 'simulation',  title: 'Full Day Simulation',    icon: '\u{23F1}\u{FE0F}' },
  { id: 'dashboard',   title: 'Final Impact Dashboard', icon: '\u{1F4CA}' },
  { id: 'quiz',        title: 'Final Quiz',             icon: '\u{1F9E0}' },
  { id: 'reward',      title: 'Reward',                 icon: '\u{1F3C6}' },
];

// ═══ QUIZ — UPDATED FOR 5 SUSTAINABLE APPLIANCES ═══
export const L5_QUIZ = [
  {
    question: 'Air Cooler uses how much less energy than AC?',
    options: ['50% less', '70% less', '86% less', '95% less'],
    correctIndex: 2,
    explanation: 'Air Cooler uses 200W vs AC\'s 1500W — that\'s 86% less energy!',
  },
  {
    question: 'What does a Smart Power Strip eliminate?',
    options: ['Wi-Fi signal', 'Phantom/standby power drain', 'Solar panel output', 'Battery charge'],
    correctIndex: 1,
    explanation: 'Smart strips cut phantom power from devices left in standby — saving ~876 kWh/year!',
  },
  {
    question: 'Best time to charge an EV using solar?',
    options: ['Night (cheap grid)', 'Dawn (early start)', 'Noon (peak solar)', 'Evening (after work)'],
    correctIndex: 2,
    explanation: 'Noon has maximum solar output — free, clean charging with zero grid dependency!',
  },
  {
    question: 'Solar Water Heater replaces which high-load appliance?',
    options: ['AC (1500W)', 'Microwave (1000W)', 'Electric Geyser (2000W)', 'Induction (1500W)'],
    correctIndex: 2,
    explanation: 'Solar water heater uses sunlight to heat water, replacing the 2000W geyser completely!',
  },
  {
    question: 'Smart LED lighting saves how much energy compared to incandescent?',
    options: ['30%', '50%', '70%', '90%'],
    correctIndex: 3,
    explanation: 'Smart LEDs use 10W vs incandescent\'s 100W — 90% energy savings with better light quality!',
  },
  {
    question: 'Which combination saves the most CO₂ annually?',
    options: ['Air Cooler + Smart Strip', 'Solar Heater + EV Charger', 'LED + Cooler', 'Strip + LED'],
    correctIndex: 1,
    explanation: 'Solar heater (259 kg) + EV solar charging (1800 kg) = 2,059 kg CO₂ saved — massive impact!',
  },
];

// ═══ STAR SYSTEM ═══
export function calculateL5Stars(appliancesCompleted, quizPct, integrationPct, simulationPct) {
  const appPct = (appliancesCompleted / STORE_APPLIANCES.length) * 100;
  const overall = appPct * 0.3 + quizPct * 0.3 + integrationPct * 0.2 + simulationPct * 0.2;
  if (overall >= 75) return 3;
  if (overall >= 50) return 2;
  return 1;
}

// ═══ BADGE ═══
export const LEVEL5_BADGE = {
  id: 'sustainability_master',
  title: 'Sustainability Master',
  description: 'Built a fully smart and sustainable home from the ground up!',
  icon: '\u{1F3C6}',
  coins: 200,
};

// ═══ DIALOGUE ═══
export const ENTRY_DIALOGUE = [
  "You've started using solar energy\u{2026}",
  "But a truly sustainable home needs smart upgrades.",
  "Now let's upgrade your home step-by-step!",
  "Each upgrade teaches you a sustainable solution.",
];

export const FINAL_DIALOGUE = [
  "You built a fully sustainable home!",
  "Every upgrade made your home smarter and greener.",
  "You are now a Sustainability Master!",
  "Go make a difference in the real world. \u{1F30D}\u{2728}",
];

// ═══ TOTAL SAVINGS (computed from all 5 appliances) ═══
export function computeTotalSavings(completedIds) {
  let totalCo2 = 0;
  let totalBillSaved = 0;
  completedIds.forEach(id => {
    const app = STORE_APPLIANCE_MAP[id];
    if (app) {
      totalCo2 += app.co2SavedKg;
      totalBillSaved += Math.round(app.co2SavedKg * 10); // rough ₹ estimate
    }
  });
  return {
    co2Saved: Math.round(totalCo2),
    billSaved: totalBillSaved,
    efficiencyPct: Math.round((completedIds.length / STORE_APPLIANCES.length) * 100),
    solarPct: completedIds.includes('solar_water_heater') && completedIds.includes('ev_charger') ? 85 : completedIds.length * 15,
  };
}
