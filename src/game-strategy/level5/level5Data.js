// ═══════════════════════════════════════════════════════════
//  LEVEL 5: SMART SUSTAINABLE HOME — INTERACTIVE SIMULATION
//  40–50 min progressive 5-stage gameplay
//  PLAY → EXPERIENCE → THINK → ANSWER → CONFIRM
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

// ═══ STAGE DEFINITIONS ═══
export const STAGES = [
  { id: 1, name: 'Basic Upgrade',    icon: '\u{1F527}', desc: 'Learn & place appliances',        time: '~10 min' },
  { id: 2, name: 'Smart Usage',      icon: '\u{1F9E0}', desc: 'Master each appliance',           time: '~10 min' },
  { id: 3, name: 'Optimization',     icon: '\u{1F4CA}', desc: 'Combo tasks & CO₂ goals',        time: '~8 min' },
  { id: 4, name: 'Crisis',           icon: '\u{1F6A8}', desc: 'Handle dynamic problems',         time: '~8 min' },
  { id: 5, name: 'Master Simulation',icon: '\u{1F3C6}', desc: 'Run house perfectly',             time: '~10 min' },
];

// ═══════════════════════════════════════════════════════════
//  HOME EVOLUTION SYSTEM
// ═══════════════════════════════════════════════════════════
export const HOME_EVOLUTION = [
  { stage: 1, label: 'Basic House',          icon: '\u{1F3E0}', desc: 'Standard home, no upgrades',          color: '#888' },
  { stage: 2, label: 'Better Lighting',      icon: '\u{1F4A1}', desc: 'Smart lighting installed',            color: '#f5a623' },
  { stage: 3, label: 'Smart Home',           icon: '\u{1F3E1}', desc: 'Optimized appliance scheduling',      color: '#3b82f6' },
  { stage: 4, label: 'Resilient Home',       icon: '\u{1F6E1}\u{FE0F}', desc: 'Crisis-ready with battery backup',    color: '#a855f7' },
  { stage: 5, label: 'Green Sustainable Home', icon: '\u{1F30D}', desc: 'Fully solar-powered smart home',    color: '#22c55e' },
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
//  STAGE 2: MULTI-USE INTERACTIVE TASKS
//  Format: simulation → hiddenQuiz (3 options) → narrativeFeedback
// ═══════════════════════════════════════════════════════════
export const MULTI_USE_TASKS = {
  air_cooler: [
    {
      id: 'ac_t1', title: 'Cool the Living Room',
      // ─── SIMULATION: Player tries 3 cooling methods ───
      simulation: {
        scenario: 'Your living room temperature is 35°C. Try each cooling method and observe the energy impact.',
        options: [
          { id: 'ac',     label: 'Turn on AC',                icon: '\u{2744}\u{FE0F}', watts: 1500, co2: 1.07, cost: 10.5, cooling: 95 },
          { id: 'fan',    label: 'Use Ceiling Fan',            icon: '\u{1F4A8}', watts: 75,   co2: 0.05, cost: 0.53, cooling: 35 },
          { id: 'cooler', label: 'Use Air Cooler',             icon: '\u{1F32C}\u{FE0F}', watts: 150,  co2: 0.11, cost: 1.05, cooling: 78 },
        ],
      },
      // ─── HIDDEN QUIZ (after simulation experience) ───
      hiddenQuiz: {
        thinkPrompt: 'Think about what you just experienced...',
        question: 'Which option provided efficient cooling with lower energy?',
        options: ['AC at full power', 'Ceiling Fan only', 'Air Cooler'],
        correctIndex: 2,
      },
      // ─── NARRATIVE FEEDBACK (no ✅/❌) ───
      feedback: {
        correct: 'That approach provides balanced cooling at just 150W — 10x less than AC with 78% cooling effectiveness!',
        wrong: 'That approach either uses excessive energy or doesn\'t cool effectively. The air cooler balances both needs.',
        retry: 'Try the simulation again and observe the energy meter more carefully.',
      },
      reward: 10, co2Impact: -2.1,
    },
    {
      id: 'ac_t2', title: 'Moderate Heat Day',
      simulation: {
        scenario: 'Temperature is 32°C (moderate heat). Try different strategies and observe energy consumption.',
        options: [
          { id: 'ac_full',    label: 'AC on full blast',            icon: '\u{2744}\u{FE0F}', watts: 2000, co2: 1.42, cost: 14.0, cooling: 98 },
          { id: 'cooler_win', label: 'Cooler + open windows',       icon: '\u{1F32C}\u{FE0F}', watts: 150,  co2: 0.11, cost: 1.05, cooling: 82 },
          { id: 'cooler_max', label: 'Cooler on max, windows shut',  icon: '\u{1F4A8}', watts: 200,  co2: 0.14, cost: 1.40, cooling: 65 },
        ],
      },
      hiddenQuiz: {
        thinkPrompt: 'Consider the cooling vs energy tradeoff you observed...',
        question: 'At moderate temperatures, which strategy was most energy-efficient while staying comfortable?',
        options: ['AC at full capacity', 'Cooler with ventilation', 'Cooler at max without airflow'],
        correctIndex: 1,
      },
      feedback: {
        correct: 'Cooler + natural ventilation at moderate temps uses only 150W with 82% comfort — no AC needed!',
        wrong: 'At 32°C, natural ventilation amplifies the cooler\'s effectiveness. Observe how airflow affects cooling.',
        retry: 'Run the simulation again — notice how open windows change the cooling efficiency.',
      },
      reward: 10, co2Impact: -1.8,
    },
    {
      id: 'ac_t3', title: 'Maximize Cooling Efficiency',
      simulation: {
        scenario: 'Hot afternoon — find the most efficient cooling combo with minimum energy.',
        options: [
          { id: 'two_coolers', label: 'Run two coolers at max',        icon: '\u{1F4A8}', watts: 400,  co2: 0.28, cost: 2.80, cooling: 70 },
          { id: 'cooler_fan',  label: 'Cooler near window + fan',      icon: '\u{1F32C}\u{FE0F}', watts: 275,  co2: 0.20, cost: 1.93, cooling: 88 },
          { id: 'ac_low',      label: 'AC on eco mode',                icon: '\u{2744}\u{FE0F}', watts: 900,  co2: 0.64, cost: 6.30, cooling: 92 },
        ],
      },
      hiddenQuiz: {
        thinkPrompt: 'Which combination gave the best cooling-to-energy ratio?',
        question: 'How can you maximize air cooler efficiency with minimal energy?',
        options: ['Two coolers at maximum speed', 'One cooler near window with ceiling fan', 'AC on eco/low mode'],
        correctIndex: 1,
      },
      feedback: {
        correct: 'Cooler near window draws fresh air, fan circulates it. Total: 275W with 88% comfort — brilliant combo!',
        wrong: 'The simulation showed that strategic placement + fan circulation outperforms brute force cooling.',
        retry: 'Try again — watch the cooling percentage vs watts used for each option.',
      },
      reward: 15, co2Impact: -2.5,
    },
  ],
  smart_power_strip: [
    {
      id: 'sp_t1', title: 'Nighttime Power Management',
      simulation: {
        scenario: 'It\'s bedtime. TV, set-top box, and laptop charger are in standby. Observe what happens overnight.',
        options: [
          { id: 'strip_auto', label: 'Smart strip auto-cuts standby',  icon: '\u{1F50C}', watts: 0,   co2: 0,    cost: 0,    saving: 85 },
          { id: 'manual',     label: 'Manually unplug each device',    icon: '\u{1F91A}', watts: 5,   co2: 0.004,cost: 0.04, saving: 80 },
          { id: 'standby',    label: 'Leave everything in standby',    icon: '\u{1F4A4}', watts: 85,  co2: 0.06, cost: 0.60, saving: 0 },
        ],
      },
      hiddenQuiz: {
        thinkPrompt: 'Observe the overnight energy drain difference...',
        question: 'Which method most reliably eliminates phantom power drain?',
        options: ['Automatic smart strip cutoff', 'Manual unplugging each night', 'Keeping devices on standby'],
        correctIndex: 0,
      },
      feedback: {
        correct: 'The smart strip automatically detects and cuts standby drain — zero effort, 100% reliable, saves 744 kWh/year!',
        wrong: 'Manual unplugging works but people forget. Standby keeps draining. Automation is the most reliable approach.',
        retry: 'Run the simulation again and compare the overnight energy waste between methods.',
      },
      reward: 10, co2Impact: -1.5,
    },
    {
      id: 'sp_t2', title: 'Schedule Auto-Off Times',
      simulation: {
        scenario: 'Configure the smart strip\'s schedule. See how different schedules affect annual energy waste.',
        options: [
          { id: 'full_sched', label: 'Auto-off 11PM–6AM + work hours', icon: '\u{1F4C5}', watts: 0,  co2: 0,    cost: 0,    saving: 1200 },
          { id: 'night_only', label: 'Night-only auto-off',            icon: '\u{1F303}', watts: 40, co2: 0.03, cost: 0.28, saving: 600 },
          { id: 'manual_rem', label: 'Cut power when you remember',    icon: '\u{1F914}', watts: 60, co2: 0.04, cost: 0.42, saving: 300 },
        ],
      },
      hiddenQuiz: {
        thinkPrompt: 'Compare the annual savings between scheduling approaches...',
        question: 'Which scheduling strategy saves the most energy annually?',
        options: ['Full schedule (night + work hours)', 'Night-only schedule', 'Whenever you remember'],
        correctIndex: 0,
      },
      feedback: {
        correct: 'Double schedule covers 16 hours of zero phantom drain — saving ~1,200 kWh/year. Smart automation!',
        wrong: 'Partial schedules miss peak waste hours. Full scheduling maximizes the strip\'s potential.',
        retry: 'Observe the annual kWh savings number for each approach in the simulation.',
      },
      reward: 12, co2Impact: -2.0,
    },
    {
      id: 'sp_t3', title: 'Monitor Charging Waste',
      simulation: {
        scenario: 'Smart strip shows your charger draws 15W even when phone is 100%. What approach saves the most?',
        options: [
          { id: 'auto_cut',   label: 'Enable charge-complete cutoff',  icon: '\u{1F50B}', watts: 0,  co2: 0,    cost: 0,    saving: 131 },
          { id: 'timer',      label: 'Set 2-hour charging timer',      icon: '\u{23F1}\u{FE0F}', watts: 5,  co2: 0.004,cost: 0.04, saving: 100 },
          { id: 'ignore',     label: 'Leave it — 15W is tiny',         icon: '\u{1F937}', watts: 15, co2: 0.01, cost: 0.11, saving: 0 },
        ],
      },
      hiddenQuiz: {
        thinkPrompt: 'Small watts add up over a full year...',
        question: 'What\'s the most effective way to handle charger waste?',
        options: ['Auto-cutoff when fully charged', 'Fixed-time charging timer', 'Ignore the small drain'],
        correctIndex: 0,
      },
      feedback: {
        correct: 'Auto-cutoff saves 131 kWh/year per charger. Every watt matters when multiplied by 8,760 hours!',
        wrong: '15W seems small, but 15W × 24h × 365 = 131 kWh/year = ₹920 wasted. Smart monitoring catches these leaks.',
        retry: 'Check the annual savings column — small continuous drains become significant over time.',
      },
      reward: 12, co2Impact: -1.8,
    },
  ],
  led_smart_system: [
    {
      id: 'led_t1', title: 'Evening Lighting',
      simulation: {
        scenario: 'It\'s 10 PM — you\'re watching TV in the living room. Try different lighting setups.',
        options: [
          { id: 'auto_dim',  label: 'Auto-dim to 20% ambient',     icon: '\u{1F4A1}', watts: 2,   co2: 0.001, cost: 0.01, comfort: 90 },
          { id: 'half',      label: 'Manual dim to 50%',            icon: '\u{1F506}', watts: 5,   co2: 0.004, cost: 0.04, comfort: 75 },
          { id: 'full',      label: 'All room lights at 100%',      icon: '\u{2600}\u{FE0F}', watts: 10,  co2: 0.007, cost: 0.07, comfort: 50 },
        ],
      },
      hiddenQuiz: {
        thinkPrompt: 'Consider both comfort and energy in your experience...',
        question: 'Which lighting setup gave the best movie experience with lowest energy?',
        options: ['Smart auto-dim to ambient level', 'Manual 50% dimming', 'Full brightness everywhere'],
        correctIndex: 0,
      },
      feedback: {
        correct: 'Smart auto-dim detected TV mode and optimized to 20% — best ambiance AND lowest energy!',
        wrong: 'Full brightness during TV watching wastes energy and reduces viewing experience. Smart dimming adapts automatically.',
        retry: 'Notice how comfort rating changes with brightness — sometimes less light is better.',
      },
      reward: 10, co2Impact: -1.2,
    },
    {
      id: 'led_t2', title: 'Prevent Wasted Lighting',
      simulation: {
        scenario: 'Bathroom light was left on for 2 hours with nobody inside. Try different prevention methods.',
        options: [
          { id: 'motion',     label: 'Motion sensor (auto-off 5 min)', icon: '\u{1F6B6}', watts: 0,  co2: 0,    cost: 0,    saving: 365 },
          { id: 'reminder',   label: 'Put up a reminder sign',         icon: '\u{1F4DD}', watts: 5,  co2: 0.004,cost: 0.04, saving: 120 },
          { id: 'do_nothing', label: 'Accept it happens sometimes',    icon: '\u{1F937}', watts: 10, co2: 0.007,cost: 0.07, saving: 0 },
        ],
      },
      hiddenQuiz: {
        thinkPrompt: 'Which approach was most reliable at preventing waste?',
        question: 'How do you most effectively prevent forgotten lights?',
        options: ['Automatic motion sensor cutoff', 'Reminder signs near switches', 'Accept occasional waste'],
        correctIndex: 0,
      },
      feedback: {
        correct: 'Motion sensors are 100% reliable — they never forget! Saves an average of 3 hours/day of unnecessary lighting.',
        wrong: 'Signs get ignored over time. Technology beats manual habits for consistent energy savings.',
        retry: 'Compare the annual savings — automated systems catch every instance of waste.',
      },
      reward: 10, co2Impact: -1.0,
    },
    {
      id: 'led_t3', title: 'Daylight Harvesting',
      simulation: {
        scenario: 'Sunny afternoon — bright sunlight through windows. How should indoor lighting respond?',
        options: [
          { id: 'sensor',     label: 'Light sensor auto-reduces LEDs', icon: '\u{2600}\u{FE0F}', watts: 0,  co2: 0,    cost: 0,    saving: 70 },
          { id: 'manual_off', label: 'Manually turn lights off',       icon: '\u{1F91A}', watts: 0,  co2: 0,    cost: 0,    saving: 40 },
          { id: 'keep_on',    label: 'Keep LEDs on — they\'re efficient', icon: '\u{1F4A1}', watts: 10, co2: 0.007,cost: 0.07, saving: 0 },
        ],
      },
      hiddenQuiz: {
        thinkPrompt: 'Even efficient lights waste energy when sunlight is sufficient...',
        question: 'What\'s the smartest way to handle daytime lighting?',
        options: ['Automatic light sensors adjust brightness', 'Manual on/off switching', 'Keep efficient LEDs running'],
        correctIndex: 0,
      },
      feedback: {
        correct: 'Daylight harvesting automatically adjusts brightness based on sunlight — saves 50-70% of daytime lighting energy!',
        wrong: 'Even efficient LEDs waste energy when natural light is enough. Smart sensors eliminate this automatically.',
        retry: 'Notice that automation captures savings consistently — manual methods miss moments.',
      },
      reward: 15, co2Impact: -1.5,
    },
  ],
  solar_water_heater: [
    {
      id: 'sw_t1', title: 'Optimal Water Heating',
      simulation: {
        scenario: 'You need hot water. Try each heating method and compare energy cost and effectiveness.',
        options: [
          { id: 'solar_peak', label: 'Solar heater (9AM–2PM sun)',  icon: '\u{2600}\u{FE0F}', watts: 0,    co2: 0,    cost: 0,    temp: 65 },
          { id: 'geyser_30',  label: 'Electric geyser for 30 min',  icon: '\u{26A1}',          watts: 2000, co2: 1.42, cost: 14.0, temp: 70 },
          { id: 'solar_eve',  label: 'Solar heater in evening',     icon: '\u{1F307}',         watts: 0,    co2: 0,    cost: 0,    temp: 35 },
        ],
      },
      hiddenQuiz: {
        thinkPrompt: 'Compare heating effectiveness vs energy consumption...',
        question: 'When should you use the solar water heater for maximum efficiency?',
        options: ['During peak sunlight hours (9AM–2PM)', 'In the evening for dinner', 'Anytime — solar always works'],
        correctIndex: 0,
      },
      feedback: {
        correct: 'Solar thermal is most efficient during peak sun. Water stays hot 24+ hours in the insulated tank!',
        wrong: 'Solar heating depends on sunlight intensity. Peak hours give maximum heat with zero electricity.',
        retry: 'Check the temperature output — timing matters for solar efficiency.',
      },
      reward: 10, co2Impact: -3.0,
    },
    {
      id: 'sw_t2', title: 'Early Morning Hot Water',
      simulation: {
        scenario: 'You need hot water at 6 AM tomorrow. Plan your approach and see the results.',
        options: [
          { id: 'trust_tank', label: 'Solar heated all day — insulated tank keeps hot', icon: '\u{1F321}\u{FE0F}', watts: 0,    co2: 0,    cost: 0,    temp: 55 },
          { id: 'geyser_5am', label: 'Turn on geyser backup at 5 AM',                  icon: '\u{26A1}',          watts: 2000, co2: 1.42, cost: 14.0, temp: 70 },
          { id: 'no_plan',    label: 'Hope the water is warm enough',                   icon: '\u{1F937}',         watts: 0,    co2: 0,    cost: 0,    temp: 30 },
        ],
      },
      hiddenQuiz: {
        thinkPrompt: 'Consider the insulated tank\'s heat retention overnight...',
        question: 'What\'s the smartest plan for early morning hot water?',
        options: ['Trust the insulated solar tank', 'Run electric geyser at 5 AM', 'Just use cold water'],
        correctIndex: 0,
      },
      feedback: {
        correct: 'Quality solar heaters maintain temperature for 24-48 hours. No electricity needed even for early morning!',
        wrong: 'The insulated tank retains heat overnight. Using the geyser wastes 2000W when solar heat is already stored.',
        retry: 'Check the temperature reading — insulated tanks lose very little heat overnight.',
      },
      reward: 12, co2Impact: -4.0,
    },
    {
      id: 'sw_t3', title: 'Cloudy Day Strategy',
      simulation: {
        scenario: '2 cloudy days — solar water isn\'t very hot (38°C). How do you handle bathing?',
        options: [
          { id: 'boost_5',   label: 'Lukewarm solar + 5-min electric boost', icon: '\u{26A1}',  watts: 170,  co2: 0.12, cost: 1.19, temp: 55 },
          { id: 'full_gey',  label: 'Full geyser cycle (30 minutes)',        icon: '\u{1F525}', watts: 2000, co2: 1.42, cost: 14.0, temp: 70 },
          { id: 'cold_bath', label: 'Just use the lukewarm water as-is',     icon: '\u{1F4A7}', watts: 0,    co2: 0,    cost: 0,    temp: 38 },
        ],
      },
      hiddenQuiz: {
        thinkPrompt: 'Balance comfort with energy usage in cloudy conditions...',
        question: 'What\'s the smartest approach on cloudy days?',
        options: ['Quick electric boost on lukewarm water', 'Full geyser cycle from scratch', 'Use water as-is, no heating'],
        correctIndex: 0,
      },
      feedback: {
        correct: '5-minute boost = ~170Wh VS full geyser = 1000Wh. 90% savings even on cloudy days — smart strategy!',
        wrong: 'A quick boost on already-warm water is much more efficient than heating from scratch.',
        retry: 'Compare the energy cost — even partial solar heating dramatically reduces backup needs.',
      },
      reward: 15, co2Impact: -3.5,
    },
  ],
  ev_charger: [
    {
      id: 'ev_t1', title: 'Solar-Powered Charging',
      simulation: {
        scenario: 'It\'s noon with full sunlight. Your EV needs charging. Try different charging times.',
        options: [
          { id: 'noon_solar', label: 'Charge now during solar peak',    icon: '\u{2600}\u{FE0F}', watts: 3000, co2: 0,    cost: 0,    solarCover: 100 },
          { id: 'evening',    label: 'Wait till evening after work',    icon: '\u{1F307}',         watts: 3000, co2: 2.13, cost: 21.0, solarCover: 10 },
          { id: 'night_grid', label: 'Charge overnight using grid',     icon: '\u{1F303}',         watts: 3000, co2: 2.13, cost: 21.0, solarCover: 0 },
        ],
      },
      hiddenQuiz: {
        thinkPrompt: 'Observe which charging time used the most free solar energy...',
        question: 'When is the ideal time to charge your EV for zero emissions?',
        options: ['Noon during peak solar', 'Evening after work hours', 'Overnight for convenience'],
        correctIndex: 0,
      },
      feedback: {
        correct: 'Noon solar covers the full 3000W load — zero cost, zero emissions. Free fuel from sunlight!',
        wrong: 'Non-solar charging means 100% grid power — 2.13 kg CO₂ and ₹21/hour. Solar hours = free charging.',
        retry: 'Watch the solar coverage meter — noon provides maximum panel output.',
      },
      reward: 12, co2Impact: -5.0,
    },
    {
      id: 'ev_t2', title: 'Night Charging Strategy',
      simulation: {
        scenario: '9 PM — EV at 40% charge, 100% needed by 7 AM. Plan your charging strategy.',
        options: [
          { id: 'partial_solar', label: 'Charge to 80% now + finish with solar at 10 AM', icon: '\u{2600}\u{FE0F}', watts: 1800, co2: 0.85, cost: 8.40, smart: true },
          { id: 'full_night',    label: 'Charge to 100% overnight on grid',               icon: '\u{1F303}',         watts: 3000, co2: 2.13, cost: 21.0, smart: false },
          { id: 'morning_rush',  label: 'Wait till morning and rush-charge',               icon: '\u{23F0}',          watts: 3000, co2: 0.75, cost: 7.00, smart: false },
        ],
      },
      hiddenQuiz: {
        thinkPrompt: 'Consider total emissions across the full charging cycle...',
        question: 'What\'s the best plan when you need a full charge by morning?',
        options: ['Partial charge now, finish with solar tomorrow', 'Full overnight grid charging', 'Rush-charge in the morning'],
        correctIndex: 0,
      },
      feedback: {
        correct: '80% is enough for most commutes. Finishing with solar saves 30% emissions vs full night charging!',
        wrong: 'Full overnight charging = 18 kWh from grid = 12.78 kg CO₂. Split charging with solar is smarter.',
        retry: 'Compare the total CO₂ column — partial + solar always wins.',
      },
      reward: 15, co2Impact: -4.5,
    },
    {
      id: 'ev_t3', title: 'Balance EV + Home Load',
      simulation: {
        scenario: 'EV charging at 3000W. AC (1500W) and geyser (2000W) also running. Solar only covers 1920W.',
        options: [
          { id: 'substitute', label: 'Stop AC (use cooler) + stop geyser (use solar heater)', icon: '\u{1F4A1}', watts: 3200, co2: 0.91, cost: 8.96, gridW: 1280 },
          { id: 'all_on',     label: 'Keep everything running at once',                       icon: '\u{26A1}',  watts: 6500, co2: 3.26, cost: 32.2, gridW: 4580 },
          { id: 'stop_ev',    label: 'Pause EV charging to save power',                       icon: '\u{1F697}', watts: 3500, co2: 1.12, cost: 11.1, gridW: 1580 },
        ],
      },
      hiddenQuiz: {
        thinkPrompt: 'Which approach reduced grid dependency the most while keeping EV charging?',
        question: 'When EV is charging, how do you minimize total home energy from grid?',
        options: ['Substitute high-load appliances with efficient alternatives', 'Run everything simultaneously', 'Pause EV charging entirely'],
        correctIndex: 0,
      },
      feedback: {
        correct: 'Smart substitution: Cooler (200W) replaces AC (1500W), solar heater replaces geyser (2000W). Grid drops from 4580W to 1280W!',
        wrong: 'Running all loads = 4580W from grid. Smart appliance substitution is the key to managing high-demand periods.',
        retry: 'Compare grid watts — substituting old appliances with your upgrades makes a massive difference.',
      },
      reward: 20, co2Impact: -6.0,
    },
  ],
};

// ═══════════════════════════════════════════════════════════
//  STAGE 3: COMBO TASKS — INTERACTIVE SIMULATION + HIDDEN QUIZ
// ═══════════════════════════════════════════════════════════
export const COMBO_TASKS = [
  {
    id: 'combo_1',
    title: 'Efficient Evening Setup',
    description: 'Run lighting + entertainment + cooling simultaneously with minimum energy.',
    appliances: ['led_smart_system', 'smart_power_strip', 'air_cooler'],
    timeOfDay: 'evening',
    simulation: {
      scenario: 'Evening — you want TV, comfortable cooling, and good lighting. Configure your setup.',
      options: [
        { id: 'smart',   label: 'LED 30% + Smart strip monitor + Cooler low', icon: '\u{1F4A1}', totalW: 175,  co2: 0.12, bill: 1.23 },
        { id: 'normal',  label: 'All lights + AC + devices in standby',       icon: '\u{26A1}',  totalW: 1800, co2: 1.28, bill: 12.6 },
        { id: 'minimal', label: 'Everything off except TV',                    icon: '\u{1F4FA}', totalW: 120,  co2: 0.09, bill: 0.84 },
      ],
    },
    hiddenQuiz: {
      thinkPrompt: 'Which setup balanced comfort and efficiency?',
      question: 'What combination provided the best comfort-to-energy ratio for an evening at home?',
      options: ['Smart LED + Strip + Cooler combo', 'Traditional lights + AC + standby', 'Minimal — only TV on'],
      correctIndex: 0,
    },
    feedback: {
      correct: 'Total: 175W vs traditional 1800W — you saved 90% with equal comfort. This is smart orchestration!',
      wrong: 'The smart combo maintains full comfort at a fraction of the energy. Minimal mode sacrifices comfort unnecessarily.',
      retry: 'Compare comfort levels alongside energy — the smart combo offers both.',
    },
    reward: 20, co2Impact: -3.5,
  },
  {
    id: 'combo_2',
    title: 'Solar Peak Maximizer',
    description: 'Use maximum solar during noon — charge EV, heat water, run home efficiently.',
    appliances: ['ev_charger', 'solar_water_heater', 'led_smart_system'],
    timeOfDay: 'noon',
    simulation: {
      scenario: 'Peak solar noon (1920W available). How do you maximize free solar energy?',
      options: [
        { id: 'maximize', label: 'EV charging + Solar heater + LEDs auto-off (sun)', icon: '\u{2600}\u{FE0F}', totalW: 3000, solarUsed: 1920, gridW: 1080, co2: 0.77 },
        { id: 'wasteful', label: 'Save EV for night + geyser + lights on (curtains shut)', icon: '\u{1F303}', totalW: 2210, solarUsed: 400,  gridW: 1810, co2: 1.29 },
        { id: 'conserve', label: 'Turn everything off to save power',                     icon: '\u{1F6AB}', totalW: 0,    solarUsed: 0,    gridW: 0,    co2: 0 },
      ],
    },
    hiddenQuiz: {
      thinkPrompt: 'Solar energy is free — not using it during peak IS wasting it...',
      question: 'How do you maximize the value of peak solar hours?',
      options: ['Run high-load tasks during solar peak', 'Save tasks for night/cheaper grid', 'Minimize all usage during peak'],
      correctIndex: 0,
    },
    feedback: {
      correct: 'EV charges free, water heats free, LEDs off because sun is bright — 100% solar utilization!',
      wrong: 'Unused solar energy is wasted energy! Peak hours are your free-power window for heavy loads.',
      retry: 'Observe the "Solar Used" meter — higher is better during peak hours.',
    },
    reward: 25, co2Impact: -8.0,
  },
  {
    id: 'combo_3',
    title: 'Night Efficiency Master',
    description: 'Minimize energy waste during zero-solar hours.',
    appliances: ['smart_power_strip', 'led_smart_system', 'air_cooler'],
    timeOfDay: 'night',
    simulation: {
      scenario: 'Nighttime — zero solar. How do you minimize grid dependency?',
      options: [
        { id: 'optimized', label: 'Strip cuts phantom + Motion LED + Cooler timer', icon: '\u{1F303}', totalW: 80,  co2: 0.06, bill: 0.56 },
        { id: 'normal',    label: 'Leave everything running normally',              icon: '\u{26A1}',  totalW: 400, co2: 0.28, bill: 2.80 },
        { id: 'off_all',   label: 'Turn off everything including cooler',           icon: '\u{1F6AB}', totalW: 0,   co2: 0,    bill: 0 },
      ],
    },
    hiddenQuiz: {
      thinkPrompt: 'Balance comfort and conservation at night...',
      question: 'What\'s the optimal nighttime energy strategy?',
      options: ['Smart automation with timed settings', 'Normal operation unchanged', 'Shut everything off completely'],
      correctIndex: 0,
    },
    feedback: {
      correct: '80W average vs 400W — smart night mode reduces grid usage by 80% while maintaining comfort!',
      wrong: 'Normal mode wastes through phantom loads. Shutting everything off sacrifices comfort. Smart automation balances both.',
      retry: 'Check the watts vs comfort — automation finds the sweet spot.',
    },
    reward: 20, co2Impact: -4.0,
  },
  {
    id: 'combo_4',
    title: 'Full Home Orchestration',
    description: 'Run ALL 5 upgrades together at maximum efficiency.',
    appliances: ['air_cooler', 'smart_power_strip', 'led_smart_system', 'solar_water_heater', 'ev_charger'],
    timeOfDay: 'afternoon',
    simulation: {
      scenario: 'Afternoon — all 5 appliances active. How do you orchestrate them for minimum grid use?',
      options: [
        { id: 'orchest',  label: 'EV solar + SWH + Cooler med + LED auto + Strip monitor', icon: '\u{1F3AF}', totalW: 3225, solarUsed: 1920, gridW: 1305, co2: 0.93 },
        { id: 'chaos',    label: 'Everything at max without coordination',                 icon: '\u{26A1}',  totalW: 8700, solarUsed: 1920, gridW: 6780, co2: 4.81 },
        { id: 'rotate',   label: 'Run one appliance at a time',                            icon: '\u{1F501}', totalW: 600,  solarUsed: 600,  gridW: 0,    co2: 0 },
      ],
    },
    hiddenQuiz: {
      thinkPrompt: 'Which approach used solar most effectively while running the whole home?',
      question: 'How is a smart home best orchestrated when all appliances are active?',
      options: ['Coordinated scheduling with solar priority', 'Run everything at maximum simultaneously', 'One appliance at a time to avoid overload'],
      correctIndex: 0,
    },
    feedback: {
      correct: '3225W total, solar covers 1920W, grid only 1305W. Compared to uncoordinated: 6780W from grid! Orchestration is key.',
      wrong: 'Uncoordinated = chaos and high bills. One-at-a-time is impractical. Smart orchestration balances all loads with solar.',
      retry: 'Compare grid watts between approaches — coordination dramatically reduces dependency.',
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
//  STAGE 4: DYNAMIC EVENTS — LIVE SIMULATION + HIDDEN QUIZ
// ═══════════════════════════════════════════════════════════
export const DYNAMIC_EVENTS = [
  {
    id: 'evt_cloudy',
    type: 'weather',
    title: 'Cloud Cover Detected!',
    description: 'Heavy clouds have reduced solar output by 65%!',
    icon: '\u{2601}\u{FE0F}',
    effect: { solarFactor: 0.35 },
    duration: 12000,
    simulation: {
      scenario: 'Solar dropped to 35%. EV is charging at 3000W. What action do you take?',
      options: [
        { id: 'battery',  label: 'Pause EV, switch to battery backup',  icon: '\u{1F50B}', gridW: 200,  co2: 0.14, saved: 2800 },
        { id: 'grid',     label: 'Keep everything on grid power',       icon: '\u{26A1}',  gridW: 3200, co2: 2.27, saved: 0 },
        { id: 'shutdown', label: 'Shut down all non-essential devices',  icon: '\u{1F6AB}', gridW: 50,   co2: 0.04, saved: 3150 },
      ],
    },
    hiddenQuiz: {
      thinkPrompt: 'Clouds are temporary — which response was proportionate?',
      question: 'When solar drops suddenly, what\'s the proportionate response?',
      options: ['Pause heavy loads + use battery for essentials', 'Continue normally on grid power', 'Shut down everything immediately'],
      correctIndex: 0,
    },
    feedback: {
      correct: 'Battery covers essentials while clouds pass. EV can resume when sun returns. Smart proportional response!',
      wrong: 'Full grid usage creates a CO₂ spike. Complete shutdown is overreaction. Battery bridging is the balanced approach.',
      retry: 'Consider: clouds are temporary. What preserves comfort while minimizing grid spikes?',
    },
    consequence: { co2Spike: 3.5, billSpike: 24 },
    reward: 15,
  },
  {
    id: 'evt_night',
    type: 'time',
    title: 'Night Falls',
    description: 'Solar output is now ZERO. Battery at 60%.',
    icon: '\u{1F303}',
    effect: { solarFactor: 0 },
    duration: 12000,
    simulation: {
      scenario: 'No solar. 6 kWh in battery. How do you manage the next 10 hours until sunrise?',
      options: [
        { id: 'smart_night', label: 'Smart strip + cooler timer + motion LED only',  icon: '\u{1F303}', avgW: 80,  batteryHours: 75, co2: 0.06 },
        { id: 'normal',      label: 'Run normally, switch to grid when battery dies', icon: '\u{26A1}',  avgW: 400, batteryHours: 15, co2: 0.28 },
        { id: 'all_off',     label: 'Turn off everything to preserve battery',       icon: '\u{1F6AB}', avgW: 0,   batteryHours: 999, co2: 0 },
      ],
    },
    hiddenQuiz: {
      thinkPrompt: 'How long does the battery last with each approach?',
      question: 'What\'s the smartest nighttime energy management?',
      options: ['Smart automation at minimal load', 'Normal usage until battery depletes', 'Complete shutdown to save battery'],
      correctIndex: 0,
    },
    feedback: {
      correct: '80W average means battery lasts 75 hours — far more than needed until sunrise! Smart automation wins.',
      wrong: 'Normal mode drains battery in 15 hours. Shutdown preserves battery but sacrifices comfort. Smart mode does both.',
      retry: 'Check battery hours — smart automation extends battery life dramatically.',
    },
    consequence: { co2Spike: 2.8, billSpike: 18 },
    reward: 15,
  },
  {
    id: 'evt_demand',
    type: 'demand',
    title: 'Peak Demand Surge!',
    description: 'All rooms need cooling. Multiple family members using devices simultaneously.',
    icon: '\u{26A1}',
    effect: { demandMultiplier: 1.5 },
    duration: 12000,
    simulation: {
      scenario: 'Family demand surge: cooling + devices + cooking + EV all requested at once.',
      options: [
        { id: 'prioritize', label: 'Solar heater for water + cooler + defer EV',  icon: '\u{1F3AF}', totalW: 425,  gridW: 0,    co2: 0 },
        { id: 'all_on',     label: 'Turn everything on simultaneously',           icon: '\u{26A1}',  totalW: 6500, gridW: 4580, co2: 3.25 },
        { id: 'ration',     label: 'Only allow one room to use appliances',        icon: '\u{1F6AB}', totalW: 200,  gridW: 0,    co2: 0 },
      ],
    },
    hiddenQuiz: {
      thinkPrompt: 'Which approach served the family while keeping energy manageable?',
      question: 'During peak demand, what\'s the best load management strategy?',
      options: ['Prioritize with smart substitution', 'Run everything at once', 'Strictly ration to one room'],
      correctIndex: 0,
    },
    feedback: {
      correct: 'Prioritization puts zero-watt solar heater first, uses efficient cooler, defers EV. Total: 425W vs 6500W!',
      wrong: 'Everything at once = 4580W from grid. Strict rationing upsets the family. Prioritization serves everyone efficiently.',
      retry: 'Compare how many family needs are met vs energy used in each approach.',
    },
    consequence: { co2Spike: 4.5, billSpike: 32 },
    reward: 20,
  },
  {
    id: 'evt_heatwave',
    type: 'weather',
    title: 'Heat Wave Alert!',
    description: 'Temperature soared to 45°C! Cooling demand doubles.',
    icon: '\u{1F321}\u{FE0F}',
    effect: { demandMultiplier: 2.0 },
    duration: 12000,
    simulation: {
      scenario: 'Extreme heat — everyone wants maximum cooling. You have an air cooler. What do you do?',
      options: [
        { id: 'combo',    label: 'Cooler max + wet curtains + ceiling fan',  icon: '\u{1F4A8}', watts: 275,  cooling: 85, co2: 0.20 },
        { id: 'rent_ac',  label: 'Give up and rent an AC unit',             icon: '\u{2744}\u{FE0F}', watts: 2000, cooling: 92, co2: 1.42 },
        { id: 'endure',   label: 'Just use the fan and endure',             icon: '\u{1F937}', watts: 75,   cooling: 30, co2: 0.05 },
      ],
    },
    hiddenQuiz: {
      thinkPrompt: 'Which approach provided near-AC comfort without AC energy cost?',
      question: 'During extreme heat, what\'s the most sustainable cooling strategy?',
      options: ['Evaporative combo (cooler + wet curtains + fan)', 'Temporary AC rental', 'Endure with just a fan'],
      correctIndex: 0,
    },
    feedback: {
      correct: 'Evaporative combo achieves 85% of AC comfort at just 275W — that\'s 86% less energy even in extreme heat!',
      wrong: 'AC rental uses 2000W. Fan alone is insufficient at 45°C. The evaporative combo is the smart middle ground.',
      retry: 'Compare cooling percentage vs watts — the combo is surprisingly effective.',
    },
    consequence: { co2Spike: 5.0, billSpike: 38 },
    reward: 20,
  },
  {
    id: 'evt_battery_low',
    type: 'system',
    title: 'Battery Critical!',
    description: 'Battery dropped to 15%. Grid dependency increasing.',
    icon: '\u{1F50B}',
    effect: { batteryDrain: true },
    duration: 12000,
    simulation: {
      scenario: 'Battery at 15%. Solar is moderate. How do you handle this situation?',
      options: [
        { id: 'recharge', label: 'Reduce load + let solar recharge battery first',  icon: '\u{2600}\u{FE0F}', result: 'Battery recovers to 60% in 2 hours', watts: 200 },
        { id: 'drain',    label: 'Drain battery fully then switch to grid',          icon: '\u{26A1}',         result: 'Battery lifespan reduced by 20%',    watts: 800 },
        { id: 'grid_now', label: 'Switch entirely to grid immediately',             icon: '\u{1F50C}',        result: 'Battery stays at 15%, grid costs rise', watts: 600 },
      ],
    },
    hiddenQuiz: {
      thinkPrompt: 'Deep discharge affects battery lifespan significantly...',
      question: 'When battery is critically low, what protects both battery health and budget?',
      options: ['Reduce load and let solar recharge', 'Drain completely then switch', 'Abandon battery, use grid only'],
      correctIndex: 0,
    },
    feedback: {
      correct: 'Reducing load + solar recharge recovers battery to 60% in 2 hours. Battery health preserved, grid avoided!',
      wrong: 'Deep discharge damages battery lifespan by 20%. Immediate grid switch wastes stored solar. Managed recharge is optimal.',
      retry: 'Consider long-term battery health alongside immediate power needs.',
    },
    consequence: { co2Spike: 2.0, billSpike: 15 },
    reward: 15,
  },
];

// ═══════════════════════════════════════════════════════════
//  STAGE 5: MASTER SIMULATION — 3 DAY CYCLES + ANALYSIS
// ═══════════════════════════════════════════════════════════
export const MASTER_CYCLE_GOALS = [
  { cycle: 1, name: 'Learn',   goal: 'Observe your home through a full day',       targetCO2: 20, icon: '\u{1F4D6}' },
  { cycle: 2, name: 'Improve', goal: 'Optimize each time period to reduce CO₂',    targetCO2: 12, icon: '\u{1F4C8}' },
  { cycle: 3, name: 'Master',  goal: 'Achieve near-zero grid dependency',          targetCO2: 5,  icon: '\u{1F3C6}' },
];

export const ANALYSIS_QUESTIONS = [
  {
    question: 'Based on your simulation experience, what caused the biggest energy spike across the day?',
    options: ['EV charging during non-solar hours', 'Running AC instead of cooler', 'Morning geyser usage'],
    correctIndex: 0,
    feedback: {
      correct: 'EV charging at night = 3000W × grid power = the biggest single spike. Shifting to solar hours eliminates this entirely.',
      wrong: 'While all options waste energy, the EV\'s 3000W non-solar charging creates the single largest grid dependency.',
    },
  },
  {
    question: 'During which time period did your home use the most free solar energy?',
    options: ['Dawn (early morning)', 'Noon (peak sunlight)', 'Evening (after sunset)'],
    correctIndex: 1,
    feedback: {
      correct: 'Noon has 100% sunlight factor — ~1920W from panels. This is your golden hour for heavy loads!',
      wrong: 'Solar output peaks at noon. Dawn and evening have minimal sunlight. Schedule heavy tasks during peak hours.',
    },
  },
  {
    question: 'Looking at the full-day pattern, what strategy reduced CO₂ the most overall?',
    options: ['Running everything on battery', 'Using solar-timed scheduling for all loads', 'Minimizing appliance usage completely'],
    correctIndex: 1,
    feedback: {
      correct: 'Solar-timed scheduling matches heavy loads to solar availability — the most impactful single strategy for CO₂ reduction!',
      wrong: 'Battery has limits. Minimizing usage is impractical. Solar-timed scheduling is practical AND maximally effective.',
    },
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

// ═══ PHASE DEFINITIONS ═══
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

// ═══ QUIZ — HIDDEN STYLE (NO ✅/❌) ═══
export const L5_QUIZ = [
  {
    question: 'Air Cooler uses how much less energy than AC?',
    options: ['50% less', '70% less', '86% less'],
    correctIndex: 2,
    feedback: {
      correct: 'Air Cooler uses 200W vs AC\'s 1500W — that\'s 86% less energy. You experienced this in the simulation!',
      wrong: 'Remember the simulation — air cooler ran at 200W while AC used 1500W. That difference is 86%.',
    },
  },
  {
    question: 'What does a Smart Power Strip eliminate?',
    options: ['Wi-Fi signal interference', 'Phantom/standby power drain', 'Solar panel degradation'],
    correctIndex: 1,
    feedback: {
      correct: 'Smart strips detect and cut phantom power — devices drawing energy even when "off." Saves ~876 kWh/year!',
      wrong: 'Think back to the nighttime simulation — those standby devices were silently draining power. That\'s phantom load.',
    },
  },
  {
    question: 'When is the most efficient time to charge an EV with solar?',
    options: ['Night (for convenience)', 'Noon (peak solar output)', 'Evening (after work)'],
    correctIndex: 1,
    feedback: {
      correct: 'Noon has maximum solar output — the simulation showed 100% solar coverage for EV charging. Free and clean!',
      wrong: 'Solar panels produce peak power at noon. Non-solar charging means grid dependency and CO₂ emissions.',
    },
  },
  {
    question: 'Solar Water Heater replaces which high-load appliance?',
    options: ['AC (1500W)', 'Microwave (1000W)', 'Electric Geyser (2000W)'],
    correctIndex: 2,
    feedback: {
      correct: 'The geyser was your home\'s biggest single load at 2000W — solar heating eliminated it completely!',
      wrong: 'Remember the energy meters — the electric geyser drew 2000W, more than any other single appliance.',
    },
  },
  {
    question: 'Smart LED lighting saves how much energy compared to traditional bulbs?',
    options: ['50%', '70%', '90%'],
    correctIndex: 2,
    feedback: {
      correct: 'Smart LEDs use 10W vs traditional 100W — 90% savings with better light quality and smart features!',
      wrong: 'The simulation showed smart LEDs at just 10W with auto-dimming. Traditional lighting was around 100W+.',
    },
  },
  {
    question: 'Which combination provides the largest annual CO₂ savings?',
    options: ['Air Cooler + Smart Strip', 'Solar Heater + EV Charger (solar)', 'LED + Cooler'],
    correctIndex: 1,
    feedback: {
      correct: 'Solar heater (259 kg) + EV solar charging (1,800 kg) = 2,059 kg CO₂ saved. The simulation showed this massive combined impact!',
      wrong: 'Think about which appliances replace the highest-wattage loads. The geyser (2000W) and petrol vehicles create the most emissions.',
    },
  },
  {
    question: 'During a sudden cloud event, what strategy maintains the best balance?',
    options: ['Switch everything to grid immediately', 'Pause heavy loads + use battery for essentials', 'Turn off all appliances completely'],
    correctIndex: 1,
    feedback: {
      correct: 'Battery bridges temporary disruptions. Heavy loads can wait for sun to return. Proportional response!',
      wrong: 'Clouds are temporary. Full grid switch wastes money. Total shutdown is overkill. Battery bridging is proportional.',
    },
  },
  {
    question: 'What is "phantom load" and what does it cost annually?',
    options: ['Ghost power — about ₹100/year', 'Standby drain — about ₹6,100/year', 'Peak demand — about ₹3,000/year'],
    correctIndex: 1,
    feedback: {
      correct: 'Phantom load is the silent energy drain from devices in standby. At ~100W continuous, it costs ₹6,100/year!',
      wrong: 'Remember the smart strip simulation — those "off" devices were drawing 85W continuously. Over a year, that adds up significantly.',
    },
  },
  {
    question: 'When battery drops to 15%, what approach protects the battery\'s long-term health?',
    options: ['Drain it completely first', 'Reduce load + let solar recharge above 20%', 'Disconnect battery and use grid only'],
    correctIndex: 1,
    feedback: {
      correct: 'Deep discharge damages batteries. Reducing load + solar recharge preserves battery health for 5+ years.',
      wrong: 'The crisis simulation showed that deep discharge reduces battery lifespan by 20%. Managed recharge is essential.',
    },
  },
  {
    question: 'Running cooler + fan combo vs AC — what energy savings did the simulation show?',
    options: ['About 50% savings', 'About 82% savings', 'About 95% savings'],
    correctIndex: 1,
    feedback: {
      correct: 'Cooler (200W) + Fan (75W) = 275W. AC = 1500W. That\'s 82% savings with nearly equivalent comfort!',
      wrong: 'Think back to the simulation meters — 275W combo vs 1500W AC. The percentage difference is significant.',
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
