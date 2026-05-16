// ═══════════════════════════════════════════════════════════
//  LEVEL 4: SMART SOLAR HOME MANAGEMENT — Data & Constants
//  10-Phase system: Install → Learn → Manage → Optimize
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
export const PANEL_WATT_PEAK = 330;
export const MAX_PANELS = 6;
export const PANEL_COST = 25000;
export const PANEL_AREA = 1.7;
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
  { id: 'dawn',    label: 'Dawn (6 AM)',      hour: 6,  sunlight: 0.2,  icon: '🌅', skyColor: '#ff9966' },
  { id: 'morning', label: 'Morning (9 AM)',   hour: 9,  sunlight: 0.6,  icon: '🌄', skyColor: '#87CEEB' },
  { id: 'noon',    label: 'Noon (12 PM)',     hour: 12, sunlight: 1.0,  icon: '☀️', skyColor: '#4a9eda' },
  { id: 'afternoon', label: 'Afternoon (3 PM)', hour: 15, sunlight: 0.8, icon: '🌞', skyColor: '#6bb3d9' },
  { id: 'evening', label: 'Evening (6 PM)',   hour: 18, sunlight: 0.15, icon: '🌇', skyColor: '#cc6633' },
  { id: 'night',   label: 'Night (9 PM)',     hour: 21, sunlight: 0.0,  icon: '🌃', skyColor: '#0a1628' },
];

// ═══ WEATHER ═══
export const WEATHER_TYPES = [
  { id: 'clear',   label: 'Clear Sky',    factor: 1.0,  icon: '☀️' },
  { id: 'partial', label: 'Partly Cloudy', factor: 0.7, icon: '⛅' },
  { id: 'cloudy',  label: 'Cloudy',       factor: 0.4,  icon: '☁️' },
  { id: 'rainy',   label: 'Rainy',        factor: 0.2,  icon: '🌧️' },
];

// ═══ PANEL TILT ANGLES ═══
export const TILT_OPTIONS = [
  { angle: 0,  label: 'Flat (0°)',      efficiency: 0.65 },
  { angle: 15, label: '15° Tilt',        efficiency: 0.85 },
  { angle: 25, label: '25° Tilt (Best)', efficiency: 1.0  },
  { angle: 35, label: '35° Tilt',        efficiency: 0.90 },
  { angle: 45, label: '45° Tilt',        efficiency: 0.75 },
];

// ═══ BATTERY ═══
export const BATTERY_CAPACITY_KWH = 10.0; // 10 kWh home battery
export const BATTERY_CHARGE_RATE = 1.5;
export const BATTERY_DISCHARGE_RATE = 2.0;

// ═══ PEAK HOUR TARIFFS ═══
export const TARIFF_NORMAL = 6;   // ₹/unit normal
export const TARIFF_PEAK = 12;    // ₹/unit peak (6-10 PM)
export const PEAK_HOURS = { start: 18, end: 22, label: '6 PM – 10 PM' };

// ═══ SMART COOLING DATA ═══
export const COOLING_DATA = {
  comfortTemp: 24,
  outdoorTemps: [38, 42, 35, 30],
  coolRoofReduction: 5, // °C roof temp reduction
  insulationReduction: 3,
  fanWatts: 70,
  acWatts: 1500,
  savings: '₹1,800/month by using fan + cool roof instead of AC',
};

// ═══ APPLIANCE SCHEDULE DATA (for Peak Hour phase) ═══
export const SCHEDULABLE_APPLIANCES = [
  { id: 'washing', name: 'Washing Machine', icon: '🧺', watts: 500, canShift: true, bestTime: 'noon', peakPenalty: 6 },
  { id: 'ev_charge', name: 'EV Charging', icon: '🔌', watts: 3000, canShift: true, bestTime: 'noon', peakPenalty: 36 },
  { id: 'geyser', name: 'Water Heater', icon: '🔥', watts: 2000, canShift: true, bestTime: 'morning', peakPenalty: 24 },
  { id: 'ac', name: 'Air Conditioner', icon: '❄️', watts: 1500, canShift: false, bestTime: 'evening', peakPenalty: 18 },
  { id: 'tv', name: 'Television', icon: '📺', watts: 100, canShift: false, bestTime: 'evening', peakPenalty: 1.2 },
  { id: 'lights', name: 'Lights', icon: '💡', watts: 300, canShift: false, bestTime: 'evening', peakPenalty: 3.6 },
];

// ═══ EV CHARGING DATA ═══
export const EV_DATA = {
  batteryCapacity: 40, // kWh
  chargeRate: 3, // kW
  fullChargeTime: 13.3, // hours
  solarChargeKwh: 12, // kWh via solar in peak 4 hours
  gridChargeKwh: 40,
  solarCost: 0,
  gridCost: 480, // ₹ (40 kWh × ₹12 peak)
  dayCost: 240, // ₹ (40 kWh × ₹6 normal)
};

// ═══ SMART SENSOR DATA ═══
export const SENSOR_ROOMS = [
  { id: 'living', name: 'Living Room', icon: '🛋️', savings: 15, installed: false },
  { id: 'bedroom', name: 'Bedroom', icon: '🛏️', savings: 20, installed: false },
  { id: 'kitchen', name: 'Kitchen', icon: '🍳', savings: 10, installed: false },
  { id: 'bathroom', name: 'Bathroom', icon: '🚿', savings: 25, installed: false },
];

// ═══ WEATHER SCENARIOS (for Phase 8) ═══
export const WEATHER_SCENARIOS = [
  { id: 'sunny', label: 'Sunny Day', icon: '☀️', solarFactor: 1.0, tempC: 38,
    tip: 'Solar at full capacity! Run heavy appliances now.', batteryAction: 'Charging' },
  { id: 'cloudy', label: 'Cloudy Day', icon: '☁️', solarFactor: 0.4, tempC: 32,
    tip: 'Solar reduced — rely on battery. Delay heavy loads.', batteryAction: 'Discharging' },
  { id: 'rainy', label: 'Rainy Day', icon: '🌧️', solarFactor: 0.15, tempC: 28,
    tip: 'Minimal solar. Battery + grid needed. Reduce consumption.', batteryAction: 'Discharging' },
  { id: 'heatwave', label: 'Heatwave', icon: '🥵', solarFactor: 0.95, tempC: 45,
    tip: 'Max solar but high AC demand! Balance cooling vs production.', batteryAction: 'Balanced' },
];

// ═══ 10 PHASES DEFINITION ═══
export const L4_PHASES = [
  {
    id: 'install', title: 'Solar Installation', icon: '🔧', duration: '5-6 min',
    desc: 'Put solar panels on the rooftop — choose the best spots, avoid shadows, and set the right angle.',
    objective: 'Place at least 3 panels and set the best angle to catch maximum sunlight.',
    learning: 'Where to place panels, avoiding shadows, setting the right angle',
  },
  {
    id: 'system_components', title: 'How Solar Systems Work', icon: '☀️', duration: '3-4 min',
    desc: 'Walk around the house and learn about the 4 main parts: panels, inverter, smart meter, and system types.',
    objective: 'Visit all 4 solar parts and learn how they work together.',
    learning: 'Solar cells, how power is changed for home use, selling extra power, system types',
  },
  {
    id: 'installation_science', title: 'Panel Science & Setup', icon: '📐', duration: '3-4 min',
    desc: 'Learn why panels need the right angle, why shadows are bad, and what your roof needs.',
    objective: 'Understand why angle matters, shadows reduce power, and roofs must be strong enough.',
    learning: 'Best panel angle, shadow problems, roof strength check',
  },
  {
    id: 'subsidies_roi', title: 'PM Surya Ghar & Money Help', icon: '🏛️', duration: '4-5 min',
    desc: 'Learn about government help, how much solar costs, and how to pay for it.',
    objective: 'Learn about the PM Surya Ghar scheme, how much you save, and loan options.',
    learning: 'Government subsidy of Rs.78,000, total cost, electricity bill savings, solar loans',
  },
  {
    id: 'battery_storage', title: 'Battery & Energy Storage', icon: '🔋', duration: '3-4 min',
    desc: 'Learn about batteries — which type is best, how big you need, and how they work day and night.',
    objective: 'Understand Modern vs Old batteries, how much storage you need, and the daily cycle.',
    learning: 'Battery types, size calculator, how batteries fill and empty, freedom from power cuts',
  },
  {
    id: 'smart_energy', title: 'Smart Energy Use', icon: '🤖', duration: '4-5 min',
    desc: 'Learn to use appliances at the right time, add smart sensors, and charge electric cars with solar.',
    objective: 'Learn when to use appliances, how sensors save power, and solar car charging.',
    learning: 'Using appliances at the right time, motion sensors, energy star ratings, electric car + solar',
  },
  {
    id: 'weather_maintenance', title: 'Weather & Cleaning', icon: '🌦️', duration: '3-4 min',
    desc: 'Learn how different seasons affect solar power, how to keep panels clean, and storm safety.',
    objective: 'Learn seasonal changes, cleaning schedule, and how to protect panels from storms.',
    learning: 'Summer/monsoon/winter differences, panel cleaning, lightning and storm protection',
  },
  {
    id: 'environmental_impact', title: 'Saving Our Planet', icon: '🌿', duration: '3-4 min',
    desc: 'See how much pollution your solar home prevents — trees saved, air cleaned, future technology.',
    objective: 'Understand how solar reduces pollution, community solar, and amazing future inventions.',
    learning: 'Pollution reduction, solar for apartments, India\'s goals, two-sided panels, super-batteries',
  },
  {
    id: 'total_impact', title: 'Your Total Impact & Action Plan', icon: '📈', duration: '3-4 min',
    desc: 'See your complete savings, test your knowledge, and get a step-by-step plan to go solar.',
    objective: 'See 25-year savings, check what you learned, and get your action plan.',
    learning: '25-year money savings, knowledge review, 10-step action plan',
  },
  {
    id: 'finale', title: 'Solar Champion!', icon: '🏆', duration: '2-3 min',
    desc: 'See the amazing before/after change — you are now a Solar Champion ready for India\'s clean energy future!',
    objective: 'See the full change from a polluted home to a smart solar home.',
    learning: 'Energy freedom, caring for the planet, clean environment',
  },
];


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
    totalWh += watts * 3;
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

// ═══ PEAK HOUR SAVINGS CALCULATOR ═══
export function calcPeakSavings(shiftedAppliances) {
  let saved = 0;
  shiftedAppliances.forEach(id => {
    const app = SCHEDULABLE_APPLIANCES.find(a => a.id === id);
    if (app) saved += app.peakPenalty;
  });
  return Math.round(saved * 30); // monthly
}

// ═══ LEVEL 3 STATS (for before/after) ═══
export const LEVEL3_BEFORE = {
  co2Month: 223,
  billMonth: 2500,
  label: 'Level 3 (No Solar)',
};

// ═══ QUIZ (10 questions — covering all phases) ═══
export const L4_QUIZ_QUESTIONS = [
  {
    question: 'What does a solar panel turn sunlight into?',
    options: ['Heat', 'Electricity', 'Water', 'Wind'],
    correctIndex: 1,
    explanation: 'Solar panels use special cells to turn sunlight directly into electricity!',
  },
  {
    question: 'How much pollution (CO2) does solar energy create?',
    options: ['Same as coal', 'Half of gas', 'Zero pollution', 'More than diesel'],
    correctIndex: 2,
    explanation: 'Solar panels create ZERO pollution while working — truly clean energy!',
  },
  {
    question: 'What angle gives the best solar power in India?',
    options: ['Flat (0°)', '25° tilt', '90° straight up', '60° steep'],
    correctIndex: 1,
    explanation: 'For most of India, a 25° tilt on solar panels catches the most sunlight.',
  },
  {
    question: 'Why should you charge your electric car during the day?',
    options: ['Faster charging', 'Free solar power!', 'Better battery life', 'Quieter at night'],
    correctIndex: 1,
    explanation: 'Daytime charging uses FREE solar energy instead of expensive grid power!',
  },
  {
    question: 'When is electricity most expensive?',
    options: ['6 AM – 10 AM', '12 PM – 4 PM', '6 PM – 10 PM', '10 PM – 2 AM'],
    correctIndex: 2,
    explanation: 'Evening hours (6-10 PM) have the highest demand, so electricity costs more!',
  },
  {
    question: 'How can you use solar power at night?',
    options: ['Panels work at night', 'Battery stores it', 'Moonlight power', 'Not possible'],
    correctIndex: 1,
    explanation: 'Batteries save extra daytime solar energy so you can use it at night!',
  },
  {
    question: 'What is the best comfortable room temperature?',
    options: ['18°C', '20°C', '24°C', '28°C'],
    correctIndex: 2,
    explanation: '24°C is the perfect comfortable temperature — saves energy too!',
  },
  {
    question: 'What does a cool roof coating do?',
    options: ['Makes roof pretty', 'Reduces heat inside by 5°C', 'Makes electricity', 'Blocks rain'],
    correctIndex: 1,
    explanation: 'A white cool roof coating bounces sunlight away, making your house up to 5°C cooler!',
  },
  {
    question: 'Smart motion sensors help by:',
    options: ['Playing music', 'Auto-turning off lights in empty rooms', 'Heating the house', 'Nothing useful'],
    correctIndex: 1,
    explanation: 'Motion sensors detect empty rooms and turn off lights and fans, saving 15-25% energy!',
  },
  {
    question: 'When should you run the washing machine with solar?',
    options: ['Midnight', 'Peak sunlight hours', 'Early morning', 'Late evening'],
    correctIndex: 1,
    explanation: 'Running heavy appliances during peak sunlight maximizes free solar energy usage!',
  },
];

// ═══ DISCOVERY FACTS ═══
export const SOLAR_FACTS = [
  { icon: '☀️', fact: 'Solar panels convert sunlight directly into electricity' },
  { icon: '🌿', fact: 'Zero CO2 emissions during operation' },
  { icon: '♻️', fact: 'Solar is 100% renewable — the sun will not run out' },
  { icon: '💰', fact: 'Panels last 25+ years with very little cleaning needed' },
  { icon: '🏠', fact: 'A typical Indian home needs 3-5 kW solar system' },
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
  id: 'solar_home_manager',
  title: 'Smart Solar Home Manager',
  description: 'Mastered solar energy, battery storage, and smart home management!',
  icon: '☀️',
  coins: 150,
};

// ═══ DIALOGUE ═══
export const ENTRY_DIALOGUE = [
  'Welcome to the Smart Solar Home...',
  'You will learn to manage energy like a pro! ☀️',
  'Install, store, optimize, and save!',
];

export const FINAL_MESSAGE = [
  'You transformed a grid-dependent home into a smart solar home!',
  'Energy independence is the future.',
  'You are now a Smart Solar Home Manager!',
];

// ═══ ENERGY FLOW STEPS ═══
export const ENERGY_FLOW_STEPS = [
  { id: 'sun_to_panel', label: 'Sunlight hits panels', from: 'sun', to: 'panel', color: '#fbbf24' },
  { id: 'panel_to_inverter', label: 'DC → AC conversion', from: 'panel', to: 'inverter', color: '#f59e0b' },
  { id: 'inverter_to_battery', label: 'Excess → Battery storage', from: 'inverter', to: 'battery', color: '#22c55e' },
  { id: 'inverter_to_home', label: 'Power → Home appliances', from: 'inverter', to: 'home', color: '#3b82f6' },
  { id: 'battery_to_home', label: 'Night: Battery → Home', from: 'battery', to: 'home', color: '#8b5cf6' },
  { id: 'grid_backup', label: 'Grid backup (if needed)', from: 'grid', to: 'home', color: '#ef4444' },
];

// ═══ DASHBOARD METRICS ═══
export const DASHBOARD_METRICS = [
  { id: 'solar_kwh', label: 'Solar Generated', unit: 'kWh/month', icon: '☀️', color: '#f59e0b' },
  { id: 'co2_saved', label: 'CO₂ Reduced', unit: 'kg/month', icon: '🌿', color: '#22c55e' },
  { id: 'bill_saved', label: 'Bill Saved', unit: '₹/month', icon: '💰', color: '#10b981' },
  { id: 'battery_stored', label: 'Battery Stored', unit: 'kWh', icon: '🔋', color: '#8b5cf6' },
  { id: 'grid_reduced', label: 'Grid Dependency', unit: '%', icon: '⚡', color: '#ef4444' },
  { id: 'trees_equiv', label: 'Trees Equivalent', unit: '/year', icon: '🌳', color: '#16a34a' },
];

// ═══ TRANSFORMATION DATA ═══
export const TRANSFORMATION_BEFORE = [
  { label: 'Polluted surroundings', icon: '🏭', color: '#ef4444' },
  { label: 'High CO₂ emissions', icon: '💨', color: '#f97316' },
  { label: 'Bill ₹8,400/month', icon: '💸', color: '#f59e0b' },
  { label: 'Overheated rooms (38°C)', icon: '🌡️', color: '#ef4444' },
  { label: '100% grid dependent', icon: '⚡', color: '#dc2626' },
  { label: 'No smart controls', icon: '🔌', color: '#92400e' },
];

export const TRANSFORMATION_AFTER = [
  { label: 'Green lush surroundings', icon: '🌳', color: '#22c55e' },
  { label: 'CO₂ reduced by 90%', icon: '🌿', color: '#16a34a' },
  { label: 'Bill ₹1,200/month', icon: '💰', color: '#059669' },
  { label: 'Comfort 24°C (smart cooling)', icon: '❄️', color: '#06b6d4' },
  { label: '90% solar powered', icon: '☀️', color: '#f59e0b' },
  { label: 'Full smart automation', icon: '🤖', color: '#8b5cf6' },
];

// ═══ ICONS ═══
export const L4_ICONS = {
  sun: '☀️', panel: '📐', zap: '⚡',
  battery: '🔋', globe: '🌍', tree: '🌳',
  money: '💰', chart: '📊', check: '✅',
  cross: '❌', star: '⭐', trophy: '🏆',
  coin: '💰', bulb: '💡', brain: '🧠',
  target: '🎯', clock: '⏱️',
  leaf: '🌿', wind: '💨',
  shield: '🛡️', grad: '🎓',
  pin: '📍', sparkle: '✨', muscle: '💪',
  house: '🏠', wrench: '🔧', gear: '⚙️',
  down: '⬇️', up: '⬆️',
  warn: '⚠️', party: '🎉',
  cloud: '☁️', night: '🌃',
  sunrise: '🌅', book: '📘',
  car: '🚗', robot: '🤖', temp: '🌡️',
  plug: '🔌', sensor: '📡', schedule: '📅',
  flow: '➡️', dashboard: '📱',
};

export const ROOM_ICONS = {
  'Living Room': '🛋️', 'Bedroom': '🛏️',
  'Kitchen': '🍳', 'Bathroom': '🚿', 'Rooftop': '🏠',
  'Outside': '🌳',
};
