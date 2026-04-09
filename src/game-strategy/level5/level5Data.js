// ═══════════════════════════════════════════════════════════
//  LEVEL 5: SMART SUSTAINABLE HOME — FULL SIMULATION SYSTEM
//  40–50 min progressive 5-stage gameplay
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
};

export const ROOM_ICONS = {
  'Living Room': '\u{1F6CB}\u{FE0F}', 'Bedroom': '\u{1F6CF}\u{FE0F}',
  'Kitchen': '\u{1F373}', 'Bathroom': '\u{1F6BF}',
  'Outside': '\u{1F333}', 'Utility': '\u{26A1}',
};

// ═══ GOVERNMENT SUBSIDY BONUS ═══
export const STARTING_BONUS = 100;
export const STARTING_BONUS_MSG = 'Government Smart Home Subsidy: +100 Carbon Coins!';

// ═══ STAGE DEFINITIONS ═══
export const STAGES = [
  { id: 1, name: 'Basic Upgrade',    icon: '\u{1F527}', desc: 'Learn & place appliances',        time: '~10 min' },
  { id: 2, name: 'Smart Usage',      icon: '\u{1F9E0}', desc: 'Master each appliance',           time: '~10 min' },
  { id: 3, name: 'Optimization',     icon: '\u{1F4CA}', desc: 'Combo tasks & CO₂ goals',        time: '~8 min' },
  { id: 4, name: 'Crisis',           icon: '\u{1F6A8}', desc: 'Handle dynamic problems',         time: '~8 min' },
  { id: 5, name: 'Master Simulation',icon: '\u{1F3C6}', desc: 'Run house perfectly',             time: '~10 min' },
];

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
//  STAGE 2: MULTI-USE TASK CHAINS (3 tasks per appliance)
// ═══════════════════════════════════════════════════════════
export const MULTI_USE_TASKS = {
  air_cooler: [
    {
      id: 'ac_t1', title: 'Replace AC Completely',
      instruction: 'Your living room is hot. Which cooling method saves the most energy?',
      correct: { label: 'Air Cooler at medium speed (150W)', feedback: 'Medium speed air cooler provides great comfort at just 150W. AC would use 1500W for the same room!' },
      wrong: { label: 'Run AC on turbo mode (2000W)', feedback: 'AC turbo mode uses 2000W — 13x more energy! Air cooler at medium speed is sufficient for most conditions.' },
      reward: 10, co2Impact: -2.1,
    },
    {
      id: 'ac_t2', title: 'Use During Moderate Heat',
      instruction: 'Temperature is 32°C (moderate). What\'s the best cooling strategy?',
      correct: { label: 'Air cooler + open windows for ventilation', feedback: 'At moderate temps, air cooler + natural ventilation is perfect. No AC needed — saves 86% energy!' },
      wrong: { label: 'Turn on AC because cooler isn\'t cold enough', feedback: 'At 32°C, air cooler is plenty! AC is only needed above 40°C in extreme heat. Don\'t waste energy!' },
      reward: 10, co2Impact: -1.8,
    },
    {
      id: 'ac_t3', title: 'Combine with Fan',
      instruction: 'How can you maximize air cooler efficiency with minimal energy?',
      correct: { label: 'Place cooler near window + use ceiling fan to distribute', feedback: 'Cooler near window draws fresh air, fan circulates it. Total: ~275W vs AC\'s 1500W. Brilliant combo!' },
      wrong: { label: 'Run two coolers at max speed', feedback: 'Two coolers = 400W and poor circulation. One cooler + fan = 275W with better distribution!' },
      reward: 15, co2Impact: -2.5,
    },
  ],
  smart_power_strip: [
    {
      id: 'sp_t1', title: 'Cut Phantom Load at Night',
      instruction: 'It\'s bedtime. TV, set-top box, laptop charger are in standby. What do you do?',
      correct: { label: 'Let smart strip auto-cut all standby devices', feedback: 'Smart strip detected 3 devices in standby = 85W phantom load. Auto-cut saves 744 kWh/year!' },
      wrong: { label: 'Manually unplug each device', feedback: 'Manual unplugging works but people forget! Smart strip does it automatically — 100% reliable, zero effort.' },
      reward: 10, co2Impact: -1.5,
    },
    {
      id: 'sp_t2', title: 'Schedule Auto-Off Times',
      instruction: 'How should you configure the smart strip for maximum savings?',
      correct: { label: 'Set auto-off from 11 PM to 6 AM + during work hours', feedback: 'Double savings! Night + work hours = 16 hours of zero phantom drain. Saves ~1,200 kWh/year!' },
      wrong: { label: 'Only cut power when you remember', feedback: 'Forgetting even 1 night wastes 85W × 8h = 680Wh. Smart scheduling never forgets!' },
      reward: 12, co2Impact: -2.0,
    },
    {
      id: 'sp_t3', title: 'Monitor Standby Trends',
      instruction: 'Smart strip shows your charger draws 15W even when phone is full. What do you do?',
      correct: { label: 'Enable "charge complete" auto-cutoff', feedback: 'Chargers draw power even when full! Auto-cutoff saves 131 kWh/year per charger. Smart monitoring!' },
      wrong: { label: 'Ignore it — 15W is nothing', feedback: '15W × 24h × 365 = 131 kWh/year = ₹920 wasted! Small leaks add up. Every watt matters!' },
      reward: 12, co2Impact: -1.8,
    },
  ],
  led_smart_system: [
    {
      id: 'led_t1', title: 'Auto-Dim Scheduling',
      instruction: 'It\'s 10 PM — you\'re watching TV in dim room. What should the lights do?',
      correct: { label: 'Auto-dim to 20% ambient level', feedback: 'Smart LEDs detect TV activity and dim to 20%. Saves 80% energy vs full brightness. Perfect ambiance!' },
      wrong: { label: 'Keep all room lights at 100%', feedback: 'Full brightness while watching TV? Wasted energy! Smart dimming gives better movie experience AND saves power.' },
      reward: 10, co2Impact: -1.2,
    },
    {
      id: 'led_t2', title: 'Motion Sensor Usage',
      instruction: 'Someone left the bathroom light on for 2 hours. How do you prevent this?',
      correct: { label: 'Enable motion sensor — auto-off after 5 min of no movement', feedback: 'Motion sensors prevent forgotten lights! Average savings: 3 hours/day of unnecessary lighting.' },
      wrong: { label: 'Put up a reminder sign', feedback: 'Signs get ignored! Motion sensors are automatic and reliable. Technology beats manual habits every time.' },
      reward: 10, co2Impact: -1.0,
    },
    {
      id: 'led_t3', title: 'Daylight Harvesting',
      instruction: 'It\'s a sunny afternoon. How should indoor lighting work?',
      correct: { label: 'Light sensors auto-reduce LEDs when sun is bright', feedback: 'Daylight harvesting! When sunlight is strong, LEDs dim or turn off. Saves 50-70% daytime lighting energy!' },
      wrong: { label: 'Keep LEDs on as usual — they\'re efficient anyway', feedback: 'Even efficient LEDs waste energy when sunlight is enough! Smart sensors eliminate unnecessary usage.' },
      reward: 15, co2Impact: -1.5,
    },
  ],
  solar_water_heater: [
    {
      id: 'sw_t1', title: 'Optimal Heating Time',
      instruction: 'When should you use the solar water heater for maximum efficiency?',
      correct: { label: 'Let it heat during 9 AM–2 PM (peak sun)', feedback: 'Solar thermal is most efficient during peak sun. Water stays hot for 24+ hours in insulated tank!' },
      wrong: { label: 'Try to use it in the evening', feedback: 'No sunlight = no heating! Plan usage during peak solar hours. The insulated tank keeps water hot till evening.' },
      reward: 10, co2Impact: -3.0,
    },
    {
      id: 'sw_t2', title: 'Preheat Timing Strategy',
      instruction: 'You need hot water at 6 AM tomorrow. What\'s your plan?',
      correct: { label: 'Solar heater runs all day — insulated tank keeps water hot overnight', feedback: 'Quality solar heaters maintain temperature for 24-48 hours. No electricity needed even for early morning use!' },
      wrong: { label: 'Turn on geyser backup at 5 AM', feedback: 'The insulated tank retains heat! Geyser backup wastes 2000W. Trust your solar system.' },
      reward: 12, co2Impact: -4.0,
    },
    {
      id: 'sw_t3', title: 'Cloudy Day Backup Plan',
      instruction: 'It\'s been cloudy for 2 days. Water isn\'t very hot. What do you do?',
      correct: { label: 'Use lukewarm water + quick electric boost for 5 min only', feedback: 'Smart strategy! 5 min boost = ~170Wh vs full geyser cycle = ~2000Wh. 90% savings even on cloudy days!' },
      wrong: { label: 'Run electric geyser for full 30-minute cycle', feedback: '30 min geyser = 1000Wh! A 5-minute boost is enough. Don\'t default to old habits on cloudy days.' },
      reward: 15, co2Impact: -3.5,
    },
  ],
  ev_charger: [
    {
      id: 'ev_t1', title: 'Charge Using Solar Peak',
      instruction: 'It\'s noon with full sunlight. EV needs charging. What do you do?',
      correct: { label: 'Start charging now — solar panels cover the 3000W', feedback: 'Noon solar output: ~1920W from panels + battery = essentially free charging! Zero cost, zero emissions!' },
      wrong: { label: 'Wait till night for cheaper grid rates', feedback: 'Night grid = 0.71 kg CO₂/kWh! Solar is FREE and CLEAN. Always prefer solar-hours charging.' },
      reward: 12, co2Impact: -5.0,
    },
    {
      id: 'ev_t2', title: 'Avoid Night Charging',
      instruction: 'It\'s 9 PM. EV has 40% charge. You need full by morning. What\'s the best plan?',
      correct: { label: 'Charge to 80% now, finish with solar at 10 AM tomorrow', feedback: '80% is enough for most commutes. Finishing with solar saves 30% vs full night grid charging!' },
      wrong: { label: 'Charge to 100% overnight using grid power', feedback: 'Full overnight charging = 18 kWh from grid = 12.78 kg CO₂! Partial charge + solar finish is smarter.' },
      reward: 15, co2Impact: -4.5,
    },
    {
      id: 'ev_t3', title: 'Balance EV + Home Appliances',
      instruction: 'EV is charging at 3000W. AC (1500W) and geyser (2000W) also on. Solar: 1920W. What do you do?',
      correct: { label: 'Stop AC (use cooler at 200W) + stop geyser (use solar heater)', feedback: 'Total load: 3200W → 3200W. Solar covers most of it! Smart substitution = massive savings!' },
      wrong: { label: 'Let everything run — we\'ll pay the bill', feedback: '6500W load with only 1920W solar = 4580W from grid = ₹32/hr + 3.25 kg CO₂/hr! Unsustainable!' },
      reward: 20, co2Impact: -6.0,
    },
  ],
};

// ═══════════════════════════════════════════════════════════
//  STAGE 3: COMBO TASKS & PROGRESSIVE GOALS
// ═══════════════════════════════════════════════════════════
export const COMBO_TASKS = [
  {
    id: 'combo_1',
    title: 'Efficient Evening Setup',
    description: 'Run lighting + entertainment + cooling with minimum energy',
    appliances: ['led_smart_system', 'smart_power_strip', 'air_cooler'],
    timeOfDay: 'evening',
    instruction: 'It\'s evening. You want to watch TV with comfortable cooling and good lighting. What\'s the optimal setup?',
    correct: {
      label: 'LED at 30% + Smart strip managing TV power + Cooler on low',
      feedback: 'Total: 10W + 15W + 150W = 175W! Traditional setup would use 200W + 100W + 1500W = 1800W. You saved 90%!',
    },
    wrong: {
      label: 'All lights on + AC on + devices in standby',
      feedback: 'That\'s 1800W vs 175W. Your combo saves ₹11.4/hour! Over a month, that\'s ₹2,736 saved.',
    },
    reward: 20, co2Impact: -3.5,
  },
  {
    id: 'combo_2',
    title: 'Solar Peak Maximizer',
    description: 'Use maximum solar during noon — charge EV + heat water + run home',
    appliances: ['ev_charger', 'solar_water_heater', 'led_smart_system'],
    timeOfDay: 'noon',
    instruction: 'It\'s peak solar noon. How do you maximize free solar energy usage?',
    correct: {
      label: 'Start EV charging + solar heater active + LED auto-off (sunlight)',
      feedback: 'EV charges for free, water heats for free, LEDs off because sun is bright. 100% solar utilization!',
    },
    wrong: {
      label: 'Save EV charging for night, use geyser, close curtains + lights on',
      feedback: 'You\'re wasting peak solar! Night EV charging = grid CO₂. Geyser = 2000W. Lights in daytime = waste.',
    },
    reward: 25, co2Impact: -8.0,
  },
  {
    id: 'combo_3',
    title: 'Night Efficiency Master',
    description: 'Minimize energy waste during zero-solar hours',
    appliances: ['smart_power_strip', 'led_smart_system', 'air_cooler'],
    timeOfDay: 'night',
    instruction: 'It\'s nighttime. No solar power. How do you minimize grid dependency?',
    correct: {
      label: 'Smart strip cuts phantom loads + LED motion sensors + cooler on timer',
      feedback: 'Night load: 0W phantom + minimal LED + timed cooler = ~80W avg. Without optimization: ~400W average!',
    },
    wrong: {
      label: 'Leave everything running as usual',
      feedback: '400W × 8 hours = 3.2 kWh from grid = ₹22.4 + 2.27 kg CO₂. Every night! That adds up fast.',
    },
    reward: 20, co2Impact: -4.0,
  },
  {
    id: 'combo_4',
    title: 'Full Home Orchestration',
    description: 'Run ALL 5 upgrades together with maximum efficiency',
    appliances: ['air_cooler', 'smart_power_strip', 'led_smart_system', 'solar_water_heater', 'ev_charger'],
    timeOfDay: 'afternoon',
    instruction: 'Afternoon — all appliances are active. How do you orchestrate them?',
    correct: {
      label: 'EV charging (solar) + SWH active + Cooler medium + LED daylight-auto + Strip monitoring',
      feedback: 'Total smart load: ~3225W, Solar covers ~1920W, grid only ~1305W. Traditional: 8700W all from grid!',
    },
    wrong: {
      label: 'Run everything at max without coordination',
      feedback: '8700W total, 1920W solar = 6780W from grid = ₹47.5/hr + 4.8 kg CO₂/hr. Chaos is expensive!',
    },
    reward: 30, co2Impact: -10.0,
  },
];

export const PROGRESSIVE_GOALS = [
  { round: 1, target: 15, label: 'Reduce daily CO₂ to 15 kg', icon: '\u{1F3AF}' },
  { round: 2, target: 10, label: 'Reduce daily CO₂ to 10 kg', icon: '\u{1F525}' },
  { round: 3, target: 5,  label: 'Below 5 kg — Master level!',icon: '\u{1F3C6}' },
];

// ═══════════════════════════════════════════════════════════
//  STAGE 4: DYNAMIC EVENTS & DECISION CONSEQUENCES
// ═══════════════════════════════════════════════════════════
export const DYNAMIC_EVENTS = [
  {
    id: 'evt_cloudy',
    type: 'weather',
    title: 'Cloud Cover! ☁️',
    description: 'Heavy clouds have reduced solar output by 65%!',
    icon: '\u{2601}\u{FE0F}',
    effect: { solarFactor: 0.35 },
    duration: 12000,
    question: 'Solar dropped to 35%. EV is charging. What do you do?',
    correct: {
      label: 'Pause EV charging, switch to battery backup',
      feedback: 'Smart! Battery covers essentials while clouds pass. EV can charge later when sun returns.',
    },
    wrong: {
      label: 'Keep everything running from grid',
      feedback: 'Grid usage spikes! 3000W EV + 450W home = ₹24/hr from grid. Battery was available!',
    },
    consequence: { co2Spike: 3.5, billSpike: 24 },
    reward: 15,
  },
  {
    id: 'evt_night',
    type: 'time',
    title: 'Night Falls 🌙',
    description: 'Solar output is now ZERO. Battery at 60%.',
    icon: '\u{1F303}',
    effect: { solarFactor: 0 },
    duration: 12000,
    question: 'No solar. Battery has 6 kWh. How do you manage the night?',
    correct: {
      label: 'Smart strip cuts phantom loads + cooler on timer + LED motion only',
      feedback: 'Smart night mode! ~80W average = battery lasts 75 hours. More than enough till sunrise!',
    },
    wrong: {
      label: 'Run normally and use grid when battery dies',
      feedback: '400W drains 6 kWh battery in 15 hours. But smart mode uses only 80W — battery lasts 3x longer!',
    },
    consequence: { co2Spike: 2.8, billSpike: 18 },
    reward: 15,
  },
  {
    id: 'evt_demand',
    type: 'demand',
    title: 'Peak Demand! ⚡',
    description: 'All rooms need cooling. Multiple family members using devices.',
    icon: '\u{26A1}',
    effect: { demandMultiplier: 1.5 },
    duration: 12000,
    question: 'Family demand surge: cooling + devices + cooking + EV. What\'s your priority?',
    correct: {
      label: 'Prioritize: Solar heater for water, cooler for cooling, defer EV',
      feedback: 'Load management! Defer the 3000W EV, use solar heater (0W), cooler (200W). Total: ~425W vs 6500W!',
    },
    wrong: {
      label: 'Turn everything on simultaneously',
      feedback: '6500W load! Solar covers 1920W, grid: 4580W = ₹32/hr + 3.25 kg CO₂/hr. Learn to prioritize!',
    },
    consequence: { co2Spike: 4.5, billSpike: 32 },
    reward: 20,
  },
  {
    id: 'evt_heatwave',
    type: 'weather',
    title: 'Heat Wave! 🌡️',
    description: 'Temperature soared to 45°C! Cooling demand doubles.',
    icon: '\u{1F321}\u{FE0F}',
    effect: { demandMultiplier: 2.0 },
    duration: 12000,
    question: 'Extreme heat — everyone wants AC. You have air cooler. What do you do?',
    correct: {
      label: 'Cooler on max + wet curtains + ceiling fan = evaporative combo',
      feedback: 'Total: 275W! Evaporative combo works up to 45°C. AC would use 2000W for same comfort. Smart tactics!',
    },
    wrong: {
      label: 'Give up on cooler, rent an AC unit',
      feedback: 'AC rental = 2000W! Your cooler + wet curtains + fan = 275W achieves 85% of AC comfort at 86% less energy.',
    },
    consequence: { co2Spike: 5.0, billSpike: 38 },
    reward: 20,
  },
  {
    id: 'evt_battery_low',
    type: 'system',
    title: 'Battery Critical! 🔋',
    description: 'Battery dropped to 15%. Grid dependency increasing.',
    icon: '\u{1F50B}',
    effect: { batteryDrain: true },
    duration: 12000,
    question: 'Battery at 15%. Solar is moderate. What\'s your strategy?',
    correct: {
      label: 'Reduce load to essentials, let solar recharge battery first',
      feedback: 'Smart! Reducing load + solar recharge = battery back to 60% in 2 hours. Then resume normal usage.',
    },
    wrong: {
      label: 'Drain battery completely then switch to grid',
      feedback: 'Battery deep discharge reduces lifespan by 20%! Always maintain above 20%. Smart management extends battery life 5+ years.',
    },
    consequence: { co2Spike: 2.0, billSpike: 15 },
    reward: 15,
  },
];

// ═══════════════════════════════════════════════════════════
//  STAGE 5: MASTER SIMULATION — 3 DAY CYCLES
// ═══════════════════════════════════════════════════════════
export const MASTER_CYCLE_GOALS = [
  { cycle: 1, name: 'Learn',   goal: 'Observe your home through a full day',       targetCO2: 20, icon: '\u{1F4D6}' },
  { cycle: 2, name: 'Improve', goal: 'Optimize each time period to reduce CO₂',    targetCO2: 12, icon: '\u{1F4C8}' },
  { cycle: 3, name: 'Master',  goal: 'Achieve near-zero grid dependency',          targetCO2: 5,  icon: '\u{1F3C6}' },
];

export const ANALYSIS_QUESTIONS = [
  {
    question: 'Looking at the energy graph, what caused the biggest spike?',
    options: ['EV charging at night', 'Running AC instead of cooler', 'Morning geyser usage', 'Phantom loads'],
    correctIndex: 0,
    explanation: 'EV charging at night = 3000W × grid = biggest spike! Shift to solar peak hours.',
  },
  {
    question: 'Which time period had the best solar utilization?',
    options: ['Dawn', 'Noon', 'Evening', 'Night'],
    correctIndex: 1,
    explanation: 'Noon has 100% sunlight factor — ~1920W from panels. Best time for high-load tasks!',
  },
  {
    question: 'How would you further optimize the evening period?',
    options: ['Add more panels', 'Use battery for evening + smart strip at night', 'Use grid power', 'Turn everything off'],
    correctIndex: 1,
    explanation: 'Battery bridges the evening gap, smart strip eliminates night phantom loads. Practical and effective!',
  },
];

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
  { id: 'appliance',   title: 'Upgrade Home',           icon: '\u{1F527}' },
  { id: 'integration', title: 'Integration Mode',       icon: '\u{1F504}' },
  { id: 'simulation',  title: 'Full Day Simulation',    icon: '\u{23F1}\u{FE0F}' },
  { id: 'dashboard',   title: 'Final Impact Dashboard', icon: '\u{1F4CA}' },
  { id: 'quiz',        title: 'Final Quiz',             icon: '\u{1F9E0}' },
  { id: 'reward',      title: 'Reward',                 icon: '\u{1F3C6}' },
];

// ═══ QUIZ — EXTENDED FOR FULL SIMULATION ═══
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
  {
    question: 'During a cloud event, what\'s the smartest strategy?',
    options: ['Switch everything to grid', 'Pause heavy loads + use battery', 'Turn off all appliances', 'Ignore it'],
    correctIndex: 1,
    explanation: 'Pause heavy loads (EV) and use battery for essentials. Clouds are temporary — be patient!',
  },
  {
    question: 'What\'s "phantom load" and how much does it cost per year?',
    options: ['Ghost power, ₹100/yr', 'Standby drain, ~₹6,100/yr', 'Peak demand, ₹3,000/yr', 'Battery leak, ₹500/yr'],
    correctIndex: 1,
    explanation: 'Phantom load = devices drawing power in standby. Costs ~₹6,100/year — a significant hidden expense!',
  },
  {
    question: 'Best strategy when battery is at 15%?',
    options: ['Drain it completely', 'Reduce load + let solar recharge', 'Switch to full grid', 'Turn off battery system'],
    correctIndex: 1,
    explanation: 'Deep discharge harms battery life. Reduce load, let solar recharge above 20%, then resume normal use.',
  },
  {
    question: 'Running cooler + fan combo vs AC — energy savings?',
    options: ['50%', '70%', '82%', '92%'],
    correctIndex: 2,
    explanation: 'Cooler (200W) + Fan (75W) = 275W. AC = 1500W. Savings = 82% with nearly equivalent comfort!',
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
  description: 'Built and mastered a fully smart sustainable home simulation!',
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
  "You handled crises, optimized combos, and ran 3 full cycles.",
  "Every upgrade made your home smarter and greener.",
  "You are now a true Sustainability Master!",
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
