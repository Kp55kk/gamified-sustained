// ═══════════════════════════════════════════════════════════
//  LEVEL 5: SMART SUSTAINABLE HOME — 8 INTERACTIVE TASKS
//  40–50 min progressive gameplay
//  BUY → PLACE → USE → REUSE → OPTIMIZE
//  Walk → Interact → See Result → Learn
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
  combo: '\u{1F504}', crisis: '\u{1F6A8}', cycle: '\u{1F501}',
  tool: '\u{1F527}', medal: '\u{1F3C5}', wave: '\u{1F30A}',
  thermo: '\u{1F321}\u{FE0F}', wind: '\u{1F4A8}',
  speech: '\u{1F4AC}', think: '\u{1F914}', play: '\u{1F3AE}',
  meter: '\u{1F4CF}', bolt: '\u{26A1}',
};

export const ROOM_ICONS = {
  'Living Room': '\u{1F6CB}\u{FE0F}', 'Bedroom': '\u{1F6CF}\u{FE0F}',
  'Kitchen': '\u{1F373}', 'Bathroom': '\u{1F6BF}',
  'Outside': '\u{1F333}', 'Utility': '\u{26A1}',
};

// ═══ GOVERNMENT SUBSIDY BONUS ═══
export const STARTING_BONUS = 100;
export const STARTING_BONUS_MSG = 'Government Smart Home Subsidy: +100 Carbon Coins!';

// ═══ STAGE DEFINITIONS (UPDATED) ═══
export const STAGES = [
  { id: 1, name: 'Basic Upgrade',     icon: '\u{1F527}', desc: 'Buy & place appliances step-by-step', time: '~10-12 min' },
  { id: 2, name: 'Smart Usage',       icon: '\u{1F9E0}', desc: 'Stop waste & detect phantom loads',   time: '~10-12 min' },
  { id: 3, name: 'Optimization',      icon: '\u{1F4CA}', desc: 'Replace & time-optimize systems',     time: '~8-10 min' },
  { id: 4, name: 'Crisis Mode',       icon: '\u{1F6A8}', desc: 'Handle overloads & weather changes',  time: '~6-8 min' },
  { id: 5, name: 'Master Simulation', icon: '\u{1F3C6}', desc: 'Manage full day: morning to night',   time: '~8-10 min' },
];

// ═══════════════════════════════════════════════════════════
//  HOME EVOLUTION SYSTEM
// ═══════════════════════════════════════════════════════════
export const HOME_EVOLUTION = [
  { stage: 1, label: 'Normal House',          icon: '\u{1F3E0}', desc: 'Standard home, no upgrades',          color: '#888' },
  { stage: 2, label: 'Aware Home',            icon: '\u{1F4A1}', desc: 'Standby waste eliminated',            color: '#f5a623' },
  { stage: 3, label: 'Smart Home',            icon: '\u{1F3E1}', desc: 'Optimized systems installed',         color: '#3b82f6' },
  { stage: 4, label: 'Resilient Home',        icon: '\u{1F6E1}\u{FE0F}', desc: 'Crisis-ready with load balancing', color: '#a855f7' },
  { stage: 5, label: 'Green Sustainable Home', icon: '\u{1F30D}', desc: 'Fully optimized smart home',         color: '#22c55e' },
];

// ═══════════════════════════════════════════════════════════
//  ENVIRONMENT FEEDBACK (performance-based)
// ═══════════════════════════════════════════════════════════
export const ENVIRONMENT_FEEDBACK = {
  poor:   { icon: '\u{1F32B}\u{FE0F}', label: 'Slight Pollution',   desc: 'Your decisions increased emissions. The environment shows signs of stress.',     color: '#ef4444' },
  fair:   { icon: '\u{1F327}\u{FE0F}', label: 'Recovering',         desc: 'Some good choices, but there\'s room for improvement.',                           color: '#f5a623' },
  good:   { icon: '\u{1F333}',          label: 'Greenery Returns',   desc: 'Your sustainable choices are helping the environment recover!',                    color: '#22c55e' },
  great:  { icon: '\u{1F30D}',          label: 'Thriving Planet',    desc: 'Outstanding! Your home is a model of sustainability. Nature is flourishing!',      color: '#16a34a' },
};

export function getEnvironmentGrade(solarPct, co2Saved) {
  const score = solarPct * 0.5 + Math.min(co2Saved, 100) * 0.5;
  if (score >= 70) return 'great';
  if (score >= 45) return 'good';
  if (score >= 25) return 'fair';
  return 'poor';
}

// ═══════════════════════════════════════════════════════════
//  PROBLEM HINTS (for Smart Store — show BEFORE buying)
// ═══════════════════════════════════════════════════════════
export const PROBLEM_HINTS = {
  air_cooler:       { problem: 'High electricity bill due to AC (1500W)',      hint: 'Consider a more efficient cooling alternative' },
  smart_power_strip:{ problem: 'Devices waste energy in standby mode (~100W)', hint: 'Eliminate phantom power drain automatically' },
  led_smart_system: { problem: 'Traditional lights consume 200W+',             hint: 'Switch to smart lighting that adapts to your needs' },
  solar_water_heater:{ problem: 'Electric geyser is your biggest load (2000W)',hint: 'Use free solar energy to heat water' },
  ev_charger:       { problem: 'Petrol vehicle costs ₹8,000/month in fuel',   hint: 'Switch to electric and charge with solar' },
};

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

// ═══════════════════════════════════════════════════════════
//  8 INTERACTIVE TASKS — Walk → Interact → See Result → Learn
//  These replace all old card-based stages (2–5)
// ═══════════════════════════════════════════════════════════

// Task interaction targets — maps appliance IDs to what
// happens when player presses E near them during each task
export const INTERACTIVE_TASKS = [
  // ─── STAGE 2: SMART USAGE TASKS ─────────────────────────
  {
    id: 'task_standby',
    num: 1,
    stage: 2,
    title: 'Stop Wasting Standby Power',
    icon: '\u{1F50C}',
    scenario: 'Devices are OFF but still consuming power! Walk around your house and find the hidden energy waste.',
    description: 'Your smart meter shows 100W being consumed — but everything looks turned off. Find the standby devices and use your Smart Power Strip to cut the waste!',
    objectives: [
      { id: 'find_tv',      label: 'Find TV standby drain',      room: 'Living Room', target: 'tv_smart',       watts: 15 },
      { id: 'find_stb',     label: 'Find Set-Top Box standby',   room: 'Living Room', target: 'set_top_box',    watts: 25 },
      { id: 'find_charger', label: 'Find Charger phantom load',  room: 'Bedroom',    target: 'phone_charger',  watts: 15 },
      { id: 'use_strip',    label: 'Activate Smart Power Strip', room: 'Living Room', target: 'smart_power_strip', watts: -55, isSolution: true },
    ],
    energyBefore: { watts: 100, co2: 0.071, bill: 0.70 },
    energyAfter:  { watts: 0,   co2: 0,     bill: 0 },
    learning: 'Devices consume power even when OFF! This is called "standby" or "phantom" power. A smart strip cuts ALL standby drain automatically.',
    subtlePrompt: 'Was switching off each device enough, or was the smart strip more reliable?',
    reward: 15,
    co2Impact: -1.5,
  },
  {
    id: 'task_phantom',
    num: 2,
    stage: 2,
    title: 'Phantom Load Detection',
    icon: '\u{1F50D}',
    scenario: 'Your energy meter is HIGH, but nothing seems to be ON. Walk around and find the hidden energy sources!',
    description: 'Energy is leaking from hidden sources. Investigate every room — chargers plugged in without phones, idle appliances, and forgotten devices.',
    objectives: [
      { id: 'find_fan',       label: 'Check ceiling fan (idle)',   room: 'Living Room', target: 'ceiling_fan',  watts: 5, isPhantom: true },
      { id: 'find_fridge',    label: 'Check refrigerator cycles',  room: 'Kitchen',     target: 'fridge',       watts: 45, isPhantom: false, message: 'Fridge needs to stay on — but it cycles ON/OFF. This is normal consumption.' },
      { id: 'find_microwave', label: 'Find microwave standby',    room: 'Kitchen',     target: 'microwave',    watts: 8, isPhantom: true },
      { id: 'find_ac',        label: 'Find AC standby drain',     room: 'Bedroom',     target: 'ac_1_5ton',    watts: 20, isPhantom: true },
      { id: 'fix_all',        label: 'Fix all phantom loads',     room: 'Living Room', target: 'smart_power_strip', watts: -33, isSolution: true },
    ],
    energyBefore: { watts: 78, co2: 0.055, bill: 0.55 },
    energyAfter:  { watts: 45, co2: 0.032, bill: 0.32 },
    learning: 'Hidden energy waste exists! Phantom loads from standby devices, idle chargers, and forgotten appliances silently drain energy 24/7.',
    subtlePrompt: 'Not all background power is waste — the fridge needs it. Can you tell the difference?',
    reward: 15,
    co2Impact: -1.2,
  },
  {
    id: 'task_cooling',
    num: 3,
    stage: 2,
    title: 'Smart Cooling Strategy',
    icon: '\u{1F4A8}',
    scenario: 'The room is slightly hot (32°C — not extreme). Find the most efficient cooling method!',
    description: 'Walk to each cooling device and try it. The energy meter will show you the impact of each choice. Can you find the efficient combo?',
    objectives: [
      { id: 'try_ac',     label: 'Try AC alone',           room: 'Living Room', target: 'ac_1_5ton',    watts: 1500, isInefficient: true, message: 'AC: 1500W ⚠️ Overkill for 32°C! Energy spike detected.' },
      { id: 'try_fan',    label: 'Try Fan alone',           room: 'Living Room', target: 'ceiling_fan',  watts: 75,   isPartial: true,     message: 'Fan: 75W — Low energy but only 35% cooling effect.' },
      { id: 'try_cooler', label: 'Try Air Cooler alone',    room: 'Living Room', target: 'air_cooler', watts: 200, isPartial: true,  message: 'Cooler: 200W — Good! 78% cooling effect.' },
      { id: 'combo',      label: 'Combine Fan + Cooler',    room: 'Living Room', target: 'air_cooler', watts: 275, isSolution: true, message: 'Fan + Cooler = 275W, 88% cooling! Best combo!' },
    ],
    energyBefore: { watts: 1500, co2: 1.07, bill: 10.50 },
    energyAfter:  { watts: 275,  co2: 0.20, bill: 1.93 },
    learning: 'Combining appliances is efficient! Fan + Cooler gives 88% of AC cooling at only 18% of the energy cost.',
    subtlePrompt: 'Was using AC really necessary at 32°C?',
    reward: 20,
    co2Impact: -2.5,
  },

  // ─── STAGE 3: OPTIMIZATION TASKS ────────────────────────
  {
    id: 'task_solar_heater',
    num: 4,
    stage: 3,
    title: 'Use Solar Water Heater',
    icon: '\u{2615}',
    scenario: 'You need hot water. Walk to each heating option and compare their energy impact!',
    description: 'The geyser uses 2000W — the HIGHEST single appliance load in your home. But you have a solar water heater now. Compare both!',
    objectives: [
      { id: 'try_geyser', label: 'Check Electric Geyser',    room: 'Bathroom', target: 'geyser',  watts: 2000, isInefficient: true, message: 'Geyser: 2000W ⚠️ Your biggest energy hog!' },
      { id: 'use_solar',  label: 'Use Solar Water Heater',   room: 'Bathroom', target: 'solar_water_heater', watts: 0, isSolution: true, message: 'Solar Heater: 0W! Free energy from sunlight!' },
    ],
    energyBefore: { watts: 2000, co2: 1.42, bill: 14.00 },
    energyAfter:  { watts: 0,    co2: 0,    bill: 0 },
    learning: 'Replace appliances, don\'t just optimize! The solar water heater ELIMINATES 2000W by using free sunlight. That\'s the biggest single saving in your home.',
    subtlePrompt: 'Could you have optimized the geyser instead? Or was replacement the right call?',
    reward: 20,
    co2Impact: -4.0,
  },
  {
    id: 'task_ev_timing',
    num: 5,
    stage: 3,
    title: 'EV Charging Strategy',
    icon: '\u{26A1}',
    scenario: 'Your EV needs charging! Walk to the EV charger and decide WHEN to charge.',
    description: 'The EV charger uses 3000W — a heavy load. But timing matters! Solar panels produce free energy during the day.',
    objectives: [
      { id: 'check_solar', label: 'Check solar panel output',     room: 'Outside', target: 'ev_charger', watts: 0,    isInfo: true, message: 'Solar output: 1920W at noon. Night: 0W.' },
      { id: 'try_night',   label: 'Simulate night charging',      room: 'Outside', target: 'ev_charger', watts: 3000, isInefficient: true, message: 'Night: 3000W from GRID! Cost: ₹21/hr, CO₂: 2.13 kg/hr' },
      { id: 'try_day',     label: 'Simulate day (solar) charging', room: 'Outside', target: 'ev_charger', watts: 3000, isSolution: true, message: 'Day: Solar covers 1920W! Grid only 1080W. Cost: ₹7.56/hr' },
    ],
    energyBefore: { watts: 3000, co2: 2.13, bill: 21.00 },
    energyAfter:  { watts: 1080, co2: 0.77, bill: 7.56 },
    learning: 'Timing matters! Charging during solar peak means free energy covers 64% of the load. Night charging = 100% grid power.',
    subtlePrompt: 'What if you could charge at noon every day?',
    reward: 20,
    co2Impact: -5.0,
  },

  // ─── STAGE 4: CRISIS MODE ───────────────────────────────
  {
    id: 'task_overload',
    num: 6,
    stage: 4,
    title: 'Overload Prevention',
    icon: '\u{26A0}\u{FE0F}',
    scenario: 'Too many appliances are ON! The system is overloading — balance the load quickly!',
    description: 'AC (1500W) + Geyser (2000W) + EV Charger (3000W) are all running. Total: 6500W! Solar only provides 1920W. You need to reduce the load!',
    objectives: [
      { id: 'see_overload', label: 'See overload warning',    room: 'Living Room', target: 'ac_1_5ton',  watts: 6500, isOverload: true, message: '⚠️ OVERLOAD! 6500W total — Grid: 4580W! System unstable!' },
      { id: 'turn_off_ac',  label: 'Replace AC with Cooler',  room: 'Living Room', target: 'ac_1_5ton',  watts: -1300, isFixStep: true, message: 'Replaced AC (1500W) with Cooler (200W). Saved 1300W!' },
      { id: 'turn_off_gey', label: 'Switch to Solar Heater',  room: 'Bathroom',    target: 'geyser',  watts: -2000, isFixStep: true, message: 'Solar Heater replaces Geyser. Saved 2000W!' },
      { id: 'balanced',     label: 'Check system stability',  room: 'Outside',     target: 'ev_charger', watts: 3200, isSolution: true, message: 'System stable! 3200W total, Solar covers 1920W. Grid: 1280W' },
    ],
    energyBefore: { watts: 6500, co2: 3.26, bill: 32.20 },
    energyAfter:  { watts: 3200, co2: 0.91, bill: 8.96 },
    learning: 'Energy has limits! When too many high-load appliances run together, you must substitute inefficient ones with your smart upgrades.',
    subtlePrompt: 'What would happen if you didn\'t have the cooler and solar heater?',
    reward: 25,
    co2Impact: -6.0,
  },
  {
    id: 'task_weather',
    num: 7,
    stage: 4,
    title: 'Weather Adaptation',
    icon: '\u{2601}\u{FE0F}',
    scenario: 'Cloudy weather! Solar output has dropped by 65%. Adapt your energy usage!',
    description: 'Solar panels went from 1920W to just 672W. Your current usage is 1500W. You need to reduce or shift to battery!',
    objectives: [
      { id: 'see_drop',     label: 'See solar drop warning',   room: 'Outside',     target: 'ev_charger', watts: 0, isInfo: true, message: 'Solar dropped: 1920W → 672W (65% reduction)!' },
      { id: 'pause_ev',     label: 'Pause EV charging',        room: 'Outside',     target: 'ev_charger', watts: -3000, isFixStep: true, message: 'EV charging paused. Saved 3000W! Will resume when sun returns.' },
      { id: 'use_battery',  label: 'Switch essentials to battery', room: 'Living Room', target: 'smart_power_strip', watts: 0, isFixStep: true, message: 'Battery backup activated for essentials. Grid usage minimized.' },
      { id: 'adapted',      label: 'Verify adaptation',        room: 'Living Room', target: 'ceiling_fan', watts: 280, isSolution: true, message: 'Smart adjustment! Running on battery + reduced solar. Grid: minimal.' },
    ],
    energyBefore: { watts: 1500, co2: 0.59, bill: 5.81 },
    energyAfter:  { watts: 280,  co2: 0.04, bill: 0.42 },
    learning: 'Energy availability changes! Clouds, weather, and time of day affect solar output. Smart managers adapt by pausing heavy loads and using battery backup.',
    subtlePrompt: 'Clouds are temporary — was pausing the EV charger permanent?',
    reward: 25,
    co2Impact: -3.5,
  },

  // ─── STAGE 5: MASTER SIMULATION ─────────────────────────
  {
    id: 'task_fullday',
    num: 8,
    stage: 5,
    title: 'Full Day Management',
    icon: '\u{1F30D}',
    scenario: 'Manage your home through a FULL DAY — Morning, Noon, and Night. Each period needs a different strategy!',
    description: 'This is your final challenge. Walk through your home during each time period and make smart energy decisions. Solar availability changes throughout the day!',
    // Full day has 3 time periods, each with sub-objectives
    isFullDay: true,
    periods: [
      {
        id: 'morning',
        label: 'Morning (6-10 AM)',
        icon: '\u{1F305}',
        timeOfDay: 'morning',
        solarW: 1152,
        description: 'Solar warming up. Use solar heater for hot water. Start light loads.',
        objectives: [
          { id: 'morning_heater', label: 'Use Solar Water Heater',     room: 'Bathroom',    target: 'solar_water_heater', watts: 0,   isSolution: true, message: 'Morning sun heats water for free! Geyser stays OFF.' },
          { id: 'morning_lights', label: 'Ensure smart LED daylight mode', room: 'Bedroom',  target: 'led_smart_system',   watts: 0,   isSolution: true, message: 'LEDs auto-off — sunlight is sufficient!' },
          { id: 'morning_strip',  label: 'Check smart strip status',   room: 'Living Room', target: 'smart_power_strip',  watts: 0,   isSolution: true, message: 'Smart strip cut overnight phantom loads. Saved 8 hours of waste!' },
        ],
        optimalWatts: 80,
        actualWattsIfWrong: 2200,
      },
      {
        id: 'noon',
        label: 'Noon (11 AM-3 PM)',
        icon: '\u{2600}\u{FE0F}',
        timeOfDay: 'noon',
        solarW: 1920,
        description: 'Peak solar! Run heavy loads NOW — EV charging, laundry, etc.',
        objectives: [
          { id: 'noon_ev',      label: 'Start EV charging (solar peak)', room: 'Outside',     target: 'ev_charger',   watts: 3000, isSolution: true, message: 'EV charging during peak solar! 64% covered by free energy!' },
          { id: 'noon_cooler',  label: 'Use Cooler (not AC)',            room: 'Living Room', target: 'air_cooler',   watts: 200,  isSolution: true, message: 'Cooler at 200W instead of AC at 1500W. Smart choice!' },
          { id: 'noon_battery', label: 'Let battery charge from solar',  room: 'Outside',     target: 'ev_charger',   watts: 0,    isSolution: true, message: 'Excess solar charges your battery for tonight!' },
        ],
        optimalWatts: 3280,
        actualWattsIfWrong: 6500,
      },
      {
        id: 'night',
        label: 'Night (7-11 PM)',
        icon: '\u{1F303}',
        timeOfDay: 'night',
        solarW: 0,
        description: 'No solar. Use only necessary appliances. Battery backup for essentials.',
        objectives: [
          { id: 'night_strip',   label: 'Activate smart strip (cut standby)', room: 'Living Room', target: 'smart_power_strip', watts: 0,  isSolution: true, message: 'Smart strip cuts all standby. Zero phantom drain!' },
          { id: 'night_led',     label: 'Smart LED night mode (auto-dim)',     room: 'Bedroom',     target: 'led_smart_system',  watts: 2,  isSolution: true, message: 'LEDs at 20% ambient — 90% savings vs full brightness.' },
          { id: 'night_cooler',  label: 'Cooler on timer (not AC)',           room: 'Living Room', target: 'air_cooler',        watts: 200, isSolution: true, message: 'Cooler on timer: auto-off at 2 AM. Smart scheduling!' },
          { id: 'night_no_ev',   label: 'Ensure EV is NOT charging at night', room: 'Outside',     target: 'ev_charger',        watts: 0,   isSolution: true, message: 'EV charged during day. No night charging needed!' },
        ],
        optimalWatts: 282,
        actualWattsIfWrong: 4500,
      },
    ],
    energyBefore: { watts: 4400, co2: 3.12, bill: 30.80 },
    energyAfter:  { watts: 1214, co2: 0.42, bill: 3.72 },
    learning: 'Different strategy for day vs night! Morning = use solar heater. Noon = charge EV + heavy loads on solar. Night = minimize, use battery, avoid grid.',
    subtlePrompt: 'Could you run your entire home with zero grid power?',
    reward: 40,
    co2Impact: -10.0,
  },
];

// Map tasks by stage
export const TASKS_BY_STAGE = {
  2: INTERACTIVE_TASKS.filter(t => t.stage === 2),
  3: INTERACTIVE_TASKS.filter(t => t.stage === 3),
  4: INTERACTIVE_TASKS.filter(t => t.stage === 4),
  5: INTERACTIVE_TASKS.filter(t => t.stage === 5),
};

// ═══ IN-GAME LEARNING MESSAGES (shown during gameplay) ═══
export const GAMEPLAY_MESSAGES = {
  high_energy:  { icon: '\u{26A0}\u{FE0F}', text: 'High energy usage!',   color: '#ef4444' },
  efficient:    { icon: '\u{1F33F}',          text: 'Efficient choice!',    color: '#22c55e' },
  overload:     { icon: '\u{1F6A8}',          text: 'Overload detected!',   color: '#ef4444' },
  solar_good:   { icon: '\u{2600}\u{FE0F}',  text: 'Solar powering this!', color: '#f5a623' },
  phantom:      { icon: '\u{1F50D}',          text: 'Phantom load found!',  color: '#f59e0b' },
  standby:      { icon: '\u{1F50C}',          text: 'Standby drain detected!', color: '#f59e0b' },
  battery_low:  { icon: '\u{1F50B}',          text: 'Battery running low!', color: '#ef4444' },
  weather_drop: { icon: '\u{2601}\u{FE0F}',  text: 'Solar output dropped!', color: '#6b7280' },
  great_combo:  { icon: '\u{2728}',           text: 'Great combination!',   color: '#a855f7' },
};

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

// ═══ QUIZ — FINAL ONLY (NO QUIZ DURING GAME) ═══
export const L5_QUIZ = [
  {
    question: 'What is the best time to charge your EV for zero emissions?',
    options: ['Night (for convenience)', 'Noon (peak solar output)', 'Evening (after work)'],
    correctIndex: 1,
    feedback: {
      correct: 'Noon has maximum solar output — the simulation showed 100% solar coverage for EV charging. Free and clean!',
      wrong: 'Solar panels produce peak power at noon. Non-solar charging means grid dependency and CO₂ emissions.',
    },
  },
  {
    question: 'Which cooling combination is most efficient at moderate temperatures?',
    options: ['AC at full blast (1500W)', 'Fan + Air Cooler combo (275W)', 'Two fans at maximum (150W)'],
    correctIndex: 1,
    feedback: {
      correct: 'Fan + Cooler gives 88% cooling at only 275W — compared to AC at 1500W. You experienced this in Task 3!',
      wrong: 'Remember Task 3: Fan + Cooler combination provided near-AC comfort at a fraction of the energy.',
    },
  },
  {
    question: 'How does a Smart Power Strip save energy?',
    options: ['It generates solar power', 'It cuts phantom/standby power drain automatically', 'It reduces WiFi usage'],
    correctIndex: 1,
    feedback: {
      correct: 'Smart strips detect and cut phantom power — devices drawing energy even when "off." Saves ~876 kWh/year!',
      wrong: 'Think back to Task 1: those standby devices were silently draining power. The smart strip cut it all automatically.',
    },
  },
  {
    question: 'Solar Water Heater replaces which high-load appliance?',
    options: ['AC (1500W)', 'Microwave (1000W)', 'Electric Geyser (2000W)'],
    correctIndex: 2,
    feedback: {
      correct: 'The geyser was your home\'s biggest single load at 2000W — solar heating eliminated it completely!',
      wrong: 'Remember Task 4: the electric geyser drew 2000W, more than any other single appliance. Solar replaced it with 0W.',
    },
  },
  {
    question: 'When solar drops due to clouds, what should you do?',
    options: ['Switch everything to grid immediately', 'Pause heavy loads + use battery for essentials', 'Turn off all appliances completely'],
    correctIndex: 1,
    feedback: {
      correct: 'Battery bridges temporary disruptions. Heavy loads can wait for sun to return. You practiced this in Task 7!',
      wrong: 'Clouds are temporary. Full grid switch wastes money. Total shutdown is overkill. Battery bridging is proportional.',
    },
  },
  {
    question: 'During system overload (6500W), what was the best strategy?',
    options: ['Turn off everything', 'Replace AC with Cooler + Geyser with Solar Heater', 'Just use grid power for everything'],
    correctIndex: 1,
    feedback: {
      correct: 'Smart substitution: Cooler replaces AC (-1300W), Solar Heater replaces Geyser (-2000W). You did this in Task 6!',
      wrong: 'Task 6 showed that substituting inefficient appliances with efficient upgrades is better than shutdown or grid overload.',
    },
  },
  {
    question: 'What uses the most free solar energy from your daily routine?',
    options: ['Running LED lights during day', 'Charging EV at noon + Solar water heating', 'Keeping AC on during sunset'],
    correctIndex: 1,
    feedback: {
      correct: 'EV charging (3000W) + Solar heater (2000W replaced) at noon = maximum solar utilization. Task 8 morning-noon cycle showed this!',
      wrong: 'LEDs during day should be OFF (sunlight!). AC at sunset has little solar. Noon heavy loads maximize free solar energy.',
    },
  },
  {
    question: 'What is "phantom load" and what does it cost annually?',
    options: ['Ghost power — about ₹100/year', 'Standby drain — about ₹6,100/year', 'Peak demand — about ₹3,000/year'],
    correctIndex: 1,
    feedback: {
      correct: 'Phantom load is the silent energy drain from devices in standby. At ~100W continuous, it costs ₹6,100/year!',
      wrong: 'Remember Task 2: those "off" devices were drawing 78W+ continuously. Over a year, that adds up to thousands of rupees.',
    },
  },
];

// ═══ CONFIDENCE BOOST MESSAGES ═══
export const CONFIDENCE_MESSAGES = [
  'You\'re making efficient decisions!',
  'Your energy awareness is growing!',
  'That\'s how a sustainability engineer thinks!',
  'You\'re mastering smart energy management!',
  'Excellent thinking — your home gets greener!',
];

// ═══ STAR SYSTEM ═══
export function calculateL5Stars(appliancesCompleted, quizPct, taskScore, totalPossibleTaskScore) {
  const appPct = (appliancesCompleted / STORE_APPLIANCES.length) * 100;
  const taskPct = totalPossibleTaskScore > 0 ? (taskScore / totalPossibleTaskScore) * 100 : 50;
  const overall = appPct * 0.25 + quizPct * 0.25 + taskPct * 0.5;
  if (overall >= 75) return 3;
  if (overall >= 50) return 2;
  return 1;
}

// Total possible task score
export const TOTAL_POSSIBLE_TASK_SCORE = INTERACTIVE_TASKS.reduce((sum, t) => sum + t.reward, 0);

// ═══ BADGE ═══
export const LEVEL5_BADGE = {
  id: 'sustainability_master',
  title: 'Sustainability Master',
  description: 'Built and mastered a fully smart sustainable home!',
  icon: '\u{1F3C6}',
  coins: 200,
};

// ═══ DIALOGUE ═══
export const ENTRY_DIALOGUE = [
  "You've started using solar energy\u{2026}",
  "But a truly sustainable home needs smart upgrades.",
  "Now let's upgrade your home step-by-step!",
  "Each upgrade teaches you a sustainable solution.",
  "This is a FULL HOME SIMULATION — not just a level!",
];

export const FINAL_DIALOGUE = [
  "You built and mastered a fully sustainable home!",
  "You handled overloads, adapted to weather, and managed a full day.",
  "Every upgrade made your home smarter and greener.",
  "The future is shaped by YOUR choices!",
  "Go make a difference in the real world. \u{1F30D}\u{2728}",
];

// ═══ TOTAL SAVINGS ═══
export function computeTotalSavings(completedIds) {
  let totalCo2 = 0;
  let totalBillSaved = 0;
  completedIds.forEach(id => {
    const app = STORE_APPLIANCE_MAP[id];
    if (app) {
      totalCo2 += app.co2SavedKg;
      totalBillSaved += Math.round(app.co2SavedKg * 10);
    }
  });
  return {
    co2Saved: Math.round(totalCo2),
    billSaved: totalBillSaved,
    efficiencyPct: Math.round((completedIds.length / STORE_APPLIANCES.length) * 100),
    solarPct: completedIds.includes('solar_water_heater') && completedIds.includes('ev_charger') ? 85 : completedIds.length * 15,
  };
}
