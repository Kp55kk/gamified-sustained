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
      { id: 'try_fan', label: '1. Walk to ceiling fan and turn it ON', action: 'turn_on', target: 'ceiling_fan', feedback: 'Fan ON! 70W only... but 32°C is still too hot 🥵' },
      { id: 'close_window', label: '2. Walk to window → Press E to close', action: 'interact_window', feedback: 'Window closed! Hot air blocked ✅' },
      { id: 'close_curtain', label: '3. Walk to window → Press E to close curtain', action: 'interact_curtain', feedback: 'Curtain closed! Sunlight blocked ✅' },
      { id: 'close_door_1', label: '4. Close Living → Bedroom door', action: 'close_door_1', feedback: 'Door 1 sealed! ✅' },
      { id: 'close_door_2', label: '5. Close Bedroom → Bathroom door', action: 'close_door_2', feedback: 'Door 2 sealed! Room is FULLY closed ✅' },
      { id: 'turn_on_ac', label: '6. Walk to AC and turn it ON', action: 'turn_on', target: 'ac_1_5ton', feedback: 'AC ON — sealed room = efficient cooling! ✅' },
      { id: 'learn_temp', label: '7. Learn why 24°C is the best setting', action: 'ac_scenarios', feedback: 'Now you understand AC temperature science! 🧠' },
    ],
    initialOn: [],
    initialWindows: true, initialCurtains: true,
    learning: {
      title: '\u{1F4A1} Smart Cooling',
      messages: [
        'Fan first (70W), AC only when needed (1500W)',
        'SEAL the room before AC: close windows, curtains, doors',
        '24\u00B0C is the golden temperature: comfort + efficiency',
        'Each degree below 24\u00B0C wastes ~6% more energy',
      ],
    },
  },
  {
    id: 'fix_the_damage', number: 3,
    title: 'Fix the Damage',
    subtitle: 'UNDO THE OVERUSE',
    icon: '\u{1F33F}', color: '#22c55e', colorDot: '\u{1F7E2}',
    objective: 'Turn off wasteful appliances and restore the environment',
    description: 'The house is overloaded! AC, geyser, and lights are all ON. Turn off the geyser, turn off AC, turn ON the fan, and open the windows to let natural air in.',
    instruction: 'Turn OFF geyser \u2192 Turn OFF AC \u2192 Turn ON fan \u2192 Open windows',
    hint: 'Geyser (2000W) and AC (1500W) are the biggest energy wasters!',
    type: 'fix',
    requiredActions: ['geyser_off', 'ac_off', 'fan_on', 'window_open'],
    initialOn: ['ac_1_5ton', 'geyser', 'led_tube', 'induction'],
    initialWindows: false, initialCurtains: false,
    learning: {
      title: '\u{1F4A1} Smart Choices',
      messages: [
        'Turning OFF geyser saves 2000W instantly!',
        'Fan + open windows uses 20x less energy than AC',
        'Your actions directly reduce CO\u2082 emissions',
        'Small choices create massive impact at scale',
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
    duration: 15,
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
    triggerRoom: 'Living Room',
    duration: 8,
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
    id: 'coal_to_light', number: 6,
    title: 'Coal to Light: The CO\u2082 Journey',
    subtitle: 'SEE WHERE ELECTRICITY COMES FROM',
    icon: '\u{1F3ED}', color: '#dc2626', colorDot: '\u{1F534}',
    objective: 'Discover how coal becomes electricity and causes CO\u2082',
    description: 'Every time you flip a switch, coal burns in a power plant hundreds of kilometers away. Walk to the front door and press E to witness the FULL journey: Coal Mine \u2192 Power Plant \u2192 Burning Furnace \u2192 Steam Turbine \u2192 Your Home!',
    instruction: 'Walk to the front door area \u2192 Press E to start the Coal \u2192 Electricity visualization',
    hint: 'India generates ~70% electricity from coal. Your AC alone burns 0.95 kg of coal per HOUR!',
    type: 'co2_journey',
    initialOn: ['ac_1_5ton', 'geyser', 'tv_smart', 'led_tube', 'ceiling_fan', 'fridge'],
    initialWindows: false, initialCurtains: false,
    learning: {
      title: '\u{1F4A1} The Coal Truth',
      messages: [
        '70% of India\'s electricity comes from COAL power plants',
        'Burning 1 kg of coal produces 2.86 kg of CO\u2082 gas',
        'Your AC running 8 hrs/day burns ~7.6 kg of coal DAILY',
        'A geyser running 30 min burns 0.7 kg of coal \u2014 just for hot water!',
        'India is the world\'s 2nd largest coal consumer \u2014 YOUR choices matter!',
        'Renewable energy (solar, wind) produces ZERO CO\u2082. This is the future.',
      ],
    },
  },
  {
    id: 'coal_counter_fix', number: 7,
    title: 'Stop the Coal Furnace!',
    subtitle: 'UNDO THE DAMAGE',
    icon: '\u{1F525}', color: '#22c55e', colorDot: '\u{1F7E2}',
    objective: 'Reduce coal burning by fixing the wasteful home!',
    description: 'You just SAW coal burning for YOUR appliances! Now fix the house: turn off wasteful appliances, enable natural cooling, and watch the coal consumption DROP!',
    instruction: 'Turn OFF geyser \u2192 Turn OFF AC \u2192 Turn ON fan \u2192 Open windows \u2192 Watch coal STOP!',
    hint: 'Target: Under 200W = only 0.14 kg coal/hr vs 5.4 kg when wasteful!',
    type: 'fix',
    requiredActions: ['geyser_off', 'ac_off', 'fan_on', 'window_open'],
    initialOn: ['ac_1_5ton', 'geyser', 'tv_smart', 'led_tube', 'led_bulb', 'induction', 'ceiling_fan'],
    initialWindows: false, initialCurtains: false,
    learning: {
      title: '\u{1F4A1} Green Home = Less Coal',
      messages: [
        'Wasteful home: 7720W = 5.4 kg coal/hr. Green home: 200W = 0.14 kg coal/hr!',
        'That\'s a 97% REDUCTION in coal burning just from smart choices!',
        'Fan (70W) + open windows = natural cooling burning only 0.05 kg coal/hr',
        'A green home saves ~35 kg of coal per DAY compared to a wasteful one',
        'If every Indian household did this: 1.3 BILLION kg less coal burned daily!',
      ],
    },
  },
  {
    id: 'energy_budget', number: 8,
    title: 'Energy Budget Challenge',
    subtitle: 'PROVE YOUR KNOWLEDGE',
    icon: '\u{1F4CA}', color: '#06b6d4', colorDot: '\u{1F535}',
    objective: 'Keep the house comfortable under 200W for 30 seconds',
    description: 'Final challenge! Strict budget: only 200W = 0.14 kg coal/hr. Can you keep the house liveable while staying under budget?',
    instruction: 'Toggle appliances ON/OFF. Stay UNDER 200W for 30 seconds to win!',
    hint: 'Smart combo: Fan (70W) + LED (7W) + WiFi (12W) + Charger (5W) = 94W!',
    type: 'free_play',
    initialOn: [],
    initialWindows: true, initialCurtains: true,
    targetWatts: 200,
    experimentTime: 30,
    learning: {
      title: '\u{1F4A1} Energy Analyst Graduate',
      messages: [
        'You proved a family CAN live comfortably under 200W!',
        'AC (1500W) alone burns more coal than your ENTIRE green home setup!',
        'Coal burned per hour: AC=0.95kg, Geyser=1.42kg, Your setup=0.066kg!',
        'You are now a certified Energy Analyst \u2014 you understand consequences!',
        'Next: Discover RENEWABLE energy that burns ZERO coal!',
      ],
    },
  },
];


// ═══════════════════════════════════════════════════════════
//  CO2 JOURNEY VISUALIZATION STEPS
// ═══════════════════════════════════════════════════════════
export const CO2_JOURNEY_STEPS = [
  {
    id: 'coal_mine', title: 'Step 1: The Coal Mine', icon: '⛏️',
    bg: 'linear-gradient(135deg, #1a1a2e, #16213e)',
    description: 'Deep underground in Jharia, Jharkhand — India\'s largest coalfield. Massive machines extract coal 24/7.',
    fact: 'India mines ~900 MILLION tons of coal every year — enough to fill 15 million train cars!',
    detail: 'Coal formed over 300 million years from dead plants. We burn in hours what nature created in millennia.',
    animation: 'mine',
  },
  {
    id: 'transport', title: 'Step 2: Coal Transport', icon: '🚂',
    bg: 'linear-gradient(135deg, #1a1a2e, #0f3460)',
    description: 'Trains carry coal hundreds of kilometers from mines to thermal power plants. Each train carries ~4,000 tons.',
    fact: '40% of Indian Railways freight is COAL — the single largest cargo moved in India!',
    detail: 'The journey from Jharia mines to a power plant can take 2-3 days by rail.',
    animation: 'train',
  },
  {
    id: 'power_plant', title: 'Step 3: The Power Plant', icon: '🏭',
    bg: 'linear-gradient(135deg, #2d1810, #4a1c10)',
    description: 'Coal is crushed to powder and blown into a MASSIVE furnace at 1,500°C. The heat boils water into steam.',
    fact: 'A single power plant burns 20,000 tons of coal PER DAY — 230 kg every SECOND!',
    detail: 'For every 1 kWh produced, about 0.71 kg of CO₂ is released into the atmosphere.',
    animation: 'burn',
  },
  {
    id: 'turbine', title: 'Step 4: Steam Turbine', icon: '⚙️',
    bg: 'linear-gradient(135deg, #1a1a2e, #3a1078)',
    description: 'Super-heated steam spins giant turbine blades at 3,000 RPM, driving a generator that produces electricity.',
    fact: 'Thermal efficiency is only ~33% — TWO-THIRDS of coal energy is WASTED as heat!',
    detail: 'For every 3 units of coal energy, only 1 becomes electricity. The rest heats the atmosphere.',
    animation: 'spin',
  },
  {
    id: 'grid', title: 'Step 5: The Power Grid', icon: '⚡',
    bg: 'linear-gradient(135deg, #0a1628, #1a2980)',
    description: 'Electricity travels through 400,000V lines across hundreds of km. Transformers step down to 230V for homes.',
    fact: 'India\'s power grid is the 3rd largest in the world — serving 1.4 billion people!',
    detail: '~5% of electricity is LOST during transmission. Even more coal is burned to compensate.',
    animation: 'grid',
  },
  {
    id: 'your_home', title: 'Step 6: YOUR Home', icon: '🏠',
    bg: 'linear-gradient(135deg, #0a1628, #1e3a5f)',
    description: 'Electricity reaches YOUR switchboard. Every appliance ON sends a signal back — burning MORE coal!',
    fact: 'Right now, YOUR appliances are burning coal at a power plant far away!',
    detail: 'See exactly how much coal each of your appliances is consuming below.',
    animation: 'home',
  },
];

export const APPLIANCE_COAL_DATA = {
  ac_1_5ton: { name: 'AC (1.5T)', watt: 1500, coalPerHr: 0.95, co2PerHr: 1.065, icon: '❄️', tip: 'BIGGEST coal burner!' },
  geyser: { name: 'Geyser', watt: 2000, coalPerHr: 1.42, co2PerHr: 1.42, icon: '🚿', tip: '30 min = 0.71 kg coal!' },
  induction: { name: 'Induction', watt: 2000, coalPerHr: 1.42, co2PerHr: 1.42, icon: '🍳', tip: 'Same power as geyser!' },
  tv_smart: { name: 'Smart TV', watt: 120, coalPerHr: 0.085, co2PerHr: 0.085, icon: '📺', tip: 'Low but hours add up' },
  led_tube: { name: 'LED Tube', watt: 20, coalPerHr: 0.014, co2PerHr: 0.014, icon: '💡', tip: '20x better than old bulbs' },
  ceiling_fan: { name: 'Fan', watt: 70, coalPerHr: 0.05, co2PerHr: 0.05, icon: '🌬️', tip: 'Low coal, great comfort!' },
  fridge: { name: 'Fridge', watt: 150, coalPerHr: 0.11, co2PerHr: 0.11, icon: '🧊', tip: 'Runs 24/7 but efficient' },
};

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
