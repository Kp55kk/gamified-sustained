// ═══════════════════════════════════════════════════════════
//  PHASE 1 — BUILD ENERGY SAVING HABITS
//  8 Mini Real-Life Tasks | 2–3 mins each | 10–15 mins total
// ═══════════════════════════════════════════════════════════

// ─── Family Members ───
// Arjun = Player (green shirt, controlled by player)
// Family NPCs: Father, Mother, Brother
export const FAMILY_MEMBERS = [
  {
    id: 'father',
    name: 'Father',
    gender: 'male',
    color: { skin: '#c68642', shirt: '#3b82f6', pants: '#334155', hair: '#1a1a2e', shoe: '#222' },
    scale: 1.05,
  },
  {
    id: 'mother',
    name: 'Mother',
    gender: 'female',
    color: {
      skin: '#d4956b', shirt: '#ec4899', pants: '#7c3aed', hair: '#1a1a2e', shoe: '#333',
      dupatta: '#f472b6', bindi: '#dc2626',
    },
    scale: 0.95,
  },
  {
    id: 'brother',
    name: 'Brother',
    gender: 'male',
    color: { skin: '#c68642', shirt: '#f59e0b', pants: '#2563eb', hair: '#1a1a2e', shoe: '#333' },
    scale: 0.7,
  },
];

// ─── Family positions per task ───
export const FAMILY_POSITIONS = {
  task1: [
    { id: 'father',  pos: [-7, 0, -6],    rot: 0,     activity: 'Watching TV' },
    { id: 'mother',  pos: [-8, 0, -5.5],   rot: 0.3,   activity: 'Reading' },
    { id: 'brother', pos: [-6, 0, -5],     rot: -0.2,  activity: 'Playing' },
  ],
  task2: [
    { id: 'father',  pos: [5, 0, -6],      rot: Math.PI, activity: 'Sleeping 💤' },
  ],
  task3: [
    { id: 'brother', pos: [-5, 0, 4],      rot: Math.PI, activity: 'In Kitchen' },
  ],
  task4: [
    { id: 'father',  pos: [-6, 0, -5],     rot: 0,     activity: 'In Living Room' },
    { id: 'mother',  pos: [-7, 0, -4.5],   rot: 0.3,   activity: 'In Living Room' },
  ],
  task5: [
    { id: 'mother',  pos: [-5, 0, -5],     rot: 0,     activity: 'In Living Room' },
    { id: 'brother', pos: [-4, 0, -4.5],   rot: -0.2,  activity: 'Playing' },
  ],
  task6: [
    // Everyone asleep — no family visible (midnight patrol)
  ],
  task7: [
    { id: 'father',  pos: [5, 0, -6],      rot: 0,     activity: 'In Bedroom' },
    { id: 'mother',  pos: [6, 0, -5.5],    rot: 0.2,   activity: 'In Bedroom' },
    { id: 'brother', pos: [7, 0, -5],      rot: -0.2,  activity: 'In Bedroom' },
  ],
  task8: [
    { id: 'father',  pos: [-5, 0, -3.5],   rot: Math.PI / 2, activity: 'Near door' },
    { id: 'mother',  pos: [-4, 0, -3.5],   rot: Math.PI / 2, activity: 'Near door' },
    { id: 'brother', pos: [-3.5, 0, -3],   rot: Math.PI / 2, activity: 'Near door' },
  ],
};

// ═══════════════════════════════════════════════════════════
//  8 MINI TASKS
// ═══════════════════════════════════════════════════════════

export const PHASE1_TASKS = [
  // ──────────────────────────────────────────
  //  TASK 1 — UNUSED ROOMS 🟢
  // ──────────────────────────────────────────
  {
    id: 'task1_unused_rooms',
    number: 1,
    title: 'Unused Rooms',
    subtitle: "Don't waste energy",
    colorDot: '🟢',
    color: '#22c55e',
    icon: '🏠',
    type: 'turn_off',
    scenario: '👨‍👩‍👦 Family is gathered in the Living Room!',
    instruction: 'Turn OFF all appliances in the empty rooms',
    hint: 'Walk to Bedroom, Kitchen, Bathroom — turn off what no one is using',
    learning: "Don't waste energy — if no one is in the room, turn everything OFF!",
    initialOn: ['ceiling_fan', 'tv_smart', 'wifi_router', 'set_top_box', 'ac_1_5ton', 'table_fan', 'led_tube', 'geyser', 'mixer_grinder'],
    turnOffIds: ['ac_1_5ton', 'table_fan', 'led_tube', 'geyser', 'mixer_grinder'],
    protectedIds: ['ceiling_fan', 'tv_smart', 'wifi_router', 'set_top_box'],
    protectedMessage: '🏠 The family is using this right now!',
    requiredOff: 5,
    familyKey: 'task1',
    offPopups: {
      high:   'Great! Significant energy saved 🌱',
      medium: 'Good catch! Energy saved 👍',
      low:    'Energy saved 👍',
    },
    finalLearning: {
      title: '💡 Key Learning',
      messages: [
        'Most energy waste comes from appliances left ON in empty rooms',
        'Always turn OFF devices when leaving a room',
      ],
    },
  },

  // ──────────────────────────────────────────
  //  TASK 2 — SMART COOLING AWARENESS 🔵
  //  Father sleeping in bedroom — AC unnecessary
  // ──────────────────────────────────────────
  {
    id: 'task2_smart_cooling',
    number: 2,
    title: 'Smart Cooling',
    subtitle: 'Is AC really needed?',
    colorDot: '🔵',
    color: '#3b82f6',
    icon: '❄️',
    type: 'turn_off_partial',
    scenario: '💤 Father is sleeping in the Bedroom. The AC is running at full blast!',
    instruction: 'The curtains are open and table fan is running — the room is already cool enough. Turn OFF what\'s wasting energy!',
    hint: 'Think: Is the AC necessary when natural breeze + fan is enough?',
    learning: 'Don\'t use AC when fan + natural ventilation is sufficient!',
    initialOn: ['ac_1_5ton', 'table_fan', 'led_bulb'],
    turnOffIds: ['ac_1_5ton', 'led_bulb'],        // AC wasteful (fan+breeze enough), light off (sleeping!)
    keepOnIds: ['table_fan'],                       // Fan is sufficient cooling
    protectedIds: ['table_fan'],
    protectedMessage: '🌀 The table fan provides enough cooling for Father while sleeping!',
    requiredOff: 2,
    familyKey: 'task2',
    trickMessage: '⚡ Not everything should be OFF — Father still needs some cooling! But does he need the AC AND a light while sleeping?',
    offPopups: {
      high:   '❄️ AC uses 1500W! Fan at 50W is 30x more efficient! 🌱',
      medium: 'Good catch! 👍',
      low:    '💡 Light OFF while sleeping — smart! 👍',
    },
    finalLearning: {
      title: '💡 Key Learning',
      messages: [
        'AC (1500W) vs Table Fan (50W) — fan is 30x more energy efficient!',
        'When curtains are open and breeze is flowing, a fan is enough',
        'Turn off lights when someone is sleeping — they don\'t need it!',
      ],
    },
  },

  // ──────────────────────────────────────────
  //  TASK 3 — FORGOTTEN APPLIANCES 🟣
  // ──────────────────────────────────────────
  {
    id: 'task3_forgotten',
    number: 3,
    title: 'Forgotten Appliances',
    subtitle: 'Habit of checking before leaving',
    colorDot: '🟣',
    color: '#a855f7',
    icon: '🚪',
    type: 'forgotten',
    scenario: '🚶 You just left the Kitchen...',
    instruction: 'Go back and check — did you leave anything ON?',
    hint: 'Walk back to the Kitchen and turn off what was left running',
    learning: 'Build the habit of checking before leaving any room!',
    initialOn: ['led_tube', 'mixer_grinder'],
    turnOffIds: ['led_tube', 'mixer_grinder'],
    triggerRoom: 'Living Room',
    sourceRoom: 'Kitchen',
    popupMessage: '🤔 Did you forget something?',
    popupSubtext: 'Check the Kitchen — you might have left appliances ON!',
    requiredOff: 2,
    familyKey: 'task3',
    finalLearning: {
      title: '💡 Key Learning',
      messages: [
        'Always check before leaving a room',
        'Light and fan are the most commonly forgotten appliances',
      ],
    },
  },

  // ──────────────────────────────────────────
  //  TASK 4 — STANDBY POWER 🟡
  // ──────────────────────────────────────────
  {
    id: 'task4_standby',
    number: 4,
    title: 'Standby Power',
    subtitle: 'Hidden energy waste',
    colorDot: '🟡',
    color: '#eab308',
    icon: '🔌',
    type: 'standby',
    scenario: '🔌 Appliances look OFF but are still consuming power!',
    instruction: 'Find devices in standby mode and unplug them',
    hint: 'TV is OFF but plug is ON. Charger is plugged in without phone.',
    learning: 'Standby power (phantom load) wastes energy silently!',
    standbyDevices: [
      { id: 'tv_smart', name: 'TV (Standby)', watts: 3, hint: 'TV is OFF but the plug indicator is glowing — unplug it!' },
      { id: 'set_top_box', name: 'Set-Top Box (Standby)', watts: 12, hint: 'STB light is ON even though TV is off — turn off at plug!' },
      { id: 'phone_charger', name: 'Charger (No Phone)', watts: 0.5, hint: 'Charger plugged in with no phone — phantom power!' },
    ],
    requiredOff: 3,
    familyKey: 'task4',
    smartPowerStrip: true,
    finalLearning: {
      title: '💡 Key Learning — VERY IMPORTANT',
      messages: [
        'Standby power (phantom load) can waste 5-10% of home electricity!',
        'Use a smart power strip to cut ALL standby power at once',
        'Always unplug chargers when not in use',
      ],
    },
  },

  // ──────────────────────────────────────────
  //  TASK 5 — DAYTIME HABIT ☀️
  //  Open windows in Living Room + turn off lights
  // ──────────────────────────────────────────
  {
    id: 'task5_daytime',
    number: 5,
    title: 'Sunlight Savings',
    subtitle: 'Use natural light from windows',
    colorDot: '🔴',
    color: '#ef4444',
    icon: '☀️',
    type: 'daytime',
    scenario: '☀️ It\'s a bright sunny afternoon! The Living Room lights are ON unnecessarily.',
    instruction: 'Open the windows in the Living Room and turn OFF the electric lights',
    hint: 'Natural sunlight is FREE — open the windows and let it flood in!',
    learning: 'During daytime, open windows for natural light instead of using electricity!',
    initialOn: ['led_bulb', 'led_tube'],
    turnOffIds: ['led_bulb', 'led_tube'],
    curtainsClosed: true,
    targetRoom: 'Living Room',
    requiredActions: ['open_curtains', 'turn_off_lights'],
    requiredOff: 2,
    familyKey: 'task5',
    finalLearning: {
      title: '💡 Key Learning',
      messages: [
        'Natural sunlight is the best FREE light source',
        'Open windows during daytime — save electricity AND get fresh air!',
        'Two lights OFF = 27W saved continuously. Over a month, that adds up!',
      ],
    },
  },

  // ──────────────────────────────────────────
  //  TASK 6 — MIDNIGHT ENERGY PATROL 🔦
  //  Creative nighttime detective mission
  // ──────────────────────────────────────────
  {
    id: 'task6_midnight_patrol',
    number: 6,
    title: 'Midnight Energy Patrol',
    subtitle: 'Be the energy detective',
    colorDot: '🟤',
    color: '#a16207',
    icon: '🔦',
    type: 'turn_off',
    scenario: '🌙 It\'s midnight. Everyone is asleep… but you hear humming sounds from other rooms!',
    instruction: 'Patrol the house like an Energy Detective — find and turn off forgotten appliances!',
    hint: 'Check every room! Some appliances are still running that nobody needs at midnight. But careful — some things MUST stay on!',
    learning: 'Even at midnight, energy waste continues silently. Be the family\'s Energy Guardian!',
    initialOn: ['geyser', 'led_tube', 'tv_smart', 'ceiling_fan', 'fridge'],
    turnOffIds: ['geyser', 'led_tube', 'tv_smart'],
    protectedIds: ['ceiling_fan', 'fridge'],
    protectedMessage: '🌙 This needs to stay ON! (Fan for sleeping family / Fridge for food)',
    mustStayOnIds: ['ceiling_fan', 'fridge'],
    mustStayOnReasons: {
      ceiling_fan: '🌀 The family is sleeping with the fan on — don\'t wake them!',
      fridge: '🧊 Fridge must stay ON 24/7 — food will spoil!',
    },
    requiredOff: 3,
    familyKey: 'task6',
    isNightScene: true,
    offPopups: {
      high:   '🔦 Found it! Geyser was wasting 2000W all night! 🌱',
      medium: '🔦 Caught it! No one watches TV at midnight! 👍',
      low:    '🔦 Kitchen light OFF — no one is cooking at midnight! 👍',
    },
    trickMessage: '🔦 You\'re the Midnight Energy Detective! Not everything should be OFF — the fridge and bedroom fan must stay ON!',
    finalLearning: {
      title: '💡 Key Learning — Energy Never Sleeps!',
      messages: [
        'Forgotten geyser at midnight = 2000W wasted for hours!',
        'Always do a quick patrol before bed — it takes 30 seconds',
        'Fridge is the ONLY appliance that should run 24/7',
        'This nightly habit can save ₹500+ per month!',
      ],
    },
  },

  // ──────────────────────────────────────────
  //  TASK 7 — PRIORITY THINKING ⚡
  // ──────────────────────────────────────────
  {
    id: 'task7_priority',
    number: 7,
    title: 'Priority Thinking',
    subtitle: 'Prioritize usage',
    colorDot: '⚡',
    color: '#f59e0b',
    icon: '🧠',
    type: 'priority',
    scenario: '⚡ Multiple appliances are ON: AC, Fan, TV',
    instruction: 'Decide what is necessary — not everything must stay ON!',
    hint: 'Is the AC really needed if the fan is enough? Is anyone watching TV?',
    learning: 'Prioritize — think about what is truly necessary!',
    initialOn: ['ac_1_5ton', 'ceiling_fan', 'tv_smart'],
    turnOffIds: ['ac_1_5ton'],
    keepOnIds: ['ceiling_fan', 'tv_smart'],
    protectedIds: ['ceiling_fan', 'tv_smart'],
    protectedMessage: '📺 The family is watching TV and the fan provides enough cooling!',
    requiredOff: 1,
    familyKey: 'task7',
    trickMessage: '🧠 Not all must be turned OFF — prioritize what\'s needed!',
    finalLearning: {
      title: '💡 Key Learning',
      messages: [
        'Don\'t use high-energy appliances when a low-energy alternative works',
        'Fan (70W) can replace AC (1500W) — 21x less energy!',
        'Prioritize usage based on actual need, not habit',
      ],
    },
  },

  // ──────────────────────────────────────────
  //  TASK 8 — LAST CHECK BEFORE LEAVING HOME 🎯
  // ──────────────────────────────────────────
  {
    id: 'task8_last_check',
    number: 8,
    title: 'Last Check Before Leaving',
    subtitle: 'Check the entire house',
    colorDot: '🎯',
    color: '#dc2626',
    icon: '🏠',
    type: 'last_check',
    scenario: '👨‍👩‍👦 Family is leaving for a function!',
    instruction: 'Check every room — turn OFF unnecessary appliances before leaving!',
    hint: 'Walk through ALL rooms. But remember: some things should STAY on!',
    learning: 'Before leaving home, always do a final energy check!',
    cutscene: {
      message: '"Did we turn everything OFF?"',
      teacherMessage: 'Before leaving home, always check for energy waste!',
    },
    initialOn: [
      'ceiling_fan', 'tv_smart', 'led_bulb', 'ac_1_5ton', 'table_fan',
      'led_tube', 'geyser', 'phone_charger', 'fridge',
    ],
    turnOffIds: [
      'ceiling_fan', 'tv_smart', 'led_bulb', 'ac_1_5ton', 'table_fan',
      'led_tube', 'geyser', 'phone_charger',
    ],
    mustStayOnIds: ['fridge'],
    mustStayOnReasons: {
      fridge: '🧊 Fridge should STAY ON — food will spoil!',
    },
    protectedIds: ['fridge'],
    protectedMessage: '🧊 This needs to stay ON even when you leave!',
    requiredOff: 8,
    familyKey: 'task8',
    smartHints: {
      wrong: '⚠️ This should be turned OFF before leaving',
      correct: '✅ This needs to stay ON',
    },
    finalLearning: {
      title: '💡 Key Learning — MOST IMPORTANT',
      messages: [
        'Always do a final check before leaving home',
        'Not EVERYTHING should be turned off — fridge must stay on!',
        'This simple habit can save hundreds of rupees per month',
      ],
    },
  },
];

// ─── Wattage helper ───
export function getWattagePriority(wattage) {
  if (wattage >= 1000) return 'high';
  if (wattage >= 100) return 'medium';
  return 'low';
}

// ─── Phase 1 completion bonus ───
export const PHASE1_BADGE = {
  title: 'Energy Saver',
  description: 'Built real energy-saving habits!',
  icon: '🌱',
  coins: 40,
};
