// ═══════════════════════════════════════════════════════════
//  PHASE 1 — BUILD ENERGY SAVING HABITS
//  8 Mini Real-Life Tasks | 2–3 mins each | 10–15 mins total
// ═══════════════════════════════════════════════════════════

// ─── Family Members ───
export const FAMILY_MEMBERS = [
  {
    id: 'dad',
    name: 'Dad',
    color: { skin: '#c68642', shirt: '#3b82f6', pants: '#334155', hair: '#1a1a2e', shoe: '#222' },
    scale: 1.05,
  },
  {
    id: 'mom',
    name: 'Mom',
    color: { skin: '#d4956b', shirt: '#ec4899', pants: '#7c3aed', hair: '#1a1a2e', shoe: '#333' },
    scale: 0.95,
  },
  {
    id: 'son',
    name: 'Son',
    color: { skin: '#c68642', shirt: '#f59e0b', pants: '#2563eb', hair: '#1a1a2e', shoe: '#333' },
    scale: 0.75,
  },
  {
    id: 'daughter',
    name: 'Daughter',
    color: { skin: '#d4956b', shirt: '#f472b6', pants: '#a855f7', hair: '#1a1a2e', shoe: '#222' },
    scale: 0.7,
  },
];

// ─── Family positions per task ───
// Room reference: Living Room (x<0, z<0), Bedroom (x>=0, z<0), Kitchen (x<4, z>=0), Bathroom (x>=4, z>=0)
export const FAMILY_POSITIONS = {
  task1: [
    { id: 'dad',      pos: [-7, 0, -6],   rot: 0,          activity: 'Watching TV' },
    { id: 'mom',      pos: [-8, 0, -5.5],  rot: 0.3,        activity: 'Reading' },
    { id: 'son',      pos: [-6, 0, -5],    rot: -0.2,       activity: 'Playing' },
    { id: 'daughter', pos: [-7.5, 0, -4.5], rot: 0.5,       activity: 'Studying' },
  ],
  task2: [
    { id: 'son',      pos: [5, 0, -6],     rot: 0,          activity: 'Sitting alone' },
  ],
  task3: [
    { id: 'daughter', pos: [-5, 0, 4],      rot: Math.PI,   activity: 'In Kitchen' },
  ],
  task4: [
    { id: 'dad',      pos: [-6, 0, -5],     rot: 0,         activity: 'In Living Room' },
    { id: 'mom',      pos: [-7, 0, -4.5],   rot: 0.3,       activity: 'In Living Room' },
  ],
  task5: [
    { id: 'mom',      pos: [-5, 0, -5],     rot: 0,         activity: 'In Living Room' },
    { id: 'daughter', pos: [-4, 0, -4.5],   rot: -0.2,      activity: 'Playing' },
  ],
  task6: [
    { id: 'dad',      pos: [6, 0, -6],      rot: 0,         activity: 'In Bedroom' },
    { id: 'son',      pos: [7, 0, -5],      rot: -0.3,      activity: 'In Bedroom' },
  ],
  task7: [
    { id: 'dad',      pos: [5, 0, -6],      rot: 0,         activity: 'In Bedroom' },
    { id: 'mom',      pos: [6, 0, -5.5],    rot: 0.2,       activity: 'In Bedroom' },
    { id: 'son',      pos: [7, 0, -5],      rot: -0.2,      activity: 'In Bedroom' },
  ],
  task8: [
    { id: 'dad',      pos: [-5, 0, -3.5],   rot: Math.PI / 2, activity: 'Near door' },
    { id: 'mom',      pos: [-4, 0, -3.5],   rot: Math.PI / 2, activity: 'Near door' },
    { id: 'son',      pos: [-3.5, 0, -3],   rot: Math.PI / 2, activity: 'Near door' },
    { id: 'daughter', pos: [-4.5, 0, -3],   rot: Math.PI / 2, activity: 'Near door' },
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
    scenario: '👨‍👩‍👧‍👦 Family is gathered in the Living Room!',
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
  //  TASK 2 — PARTIAL USAGE AWARENESS 🔵
  // ──────────────────────────────────────────
  {
    id: 'task2_partial_usage',
    number: 2,
    title: 'Partial Usage Awareness',
    subtitle: 'Even in same room, use only what is needed',
    colorDot: '🔵',
    color: '#3b82f6',
    icon: '💡',
    type: 'turn_off_partial',
    scenario: '🧑 One person sitting in the Bedroom',
    instruction: 'Fan ON, Light ON, TV ON — but only 1 person. Turn OFF what\'s unnecessary!',
    hint: 'Not everything should be OFF — think about what the person actually needs',
    learning: 'Even in the same room, use only what is needed!',
    initialOn: ['table_fan', 'led_bulb', 'tv_smart', 'ac_1_5ton'],
    turnOffIds: ['tv_smart', 'ac_1_5ton'],       // TV not being watched, AC when fan is enough
    keepOnIds: ['table_fan', 'led_bulb'],          // Fan + Light needed
    protectedIds: ['table_fan', 'led_bulb'],
    protectedMessage: '💡 This person needs this right now!',
    requiredOff: 2,
    familyKey: 'task2',
    trickMessage: '⚡ Not all appliances should be OFF — think about what is truly needed!',
    finalLearning: {
      title: '💡 Key Learning',
      messages: [
        'Even in the same room, not every appliance needs to be ON',
        'Use only what is necessary — a fan + light may be enough',
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
    // Player starts in Living Room, Kitchen has items left ON
    initialOn: ['led_tube', 'mixer_grinder'],
    turnOffIds: ['led_tube', 'mixer_grinder'],
    triggerRoom: 'Living Room',   // Popup triggers when player reaches Living Room
    sourceRoom: 'Kitchen',       // Must go back to Kitchen
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
    // These appliances appear OFF visually but are still drawing standby power
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
  //  TASK 5 — DAYTIME HABIT 🔴
  // ──────────────────────────────────────────
  {
    id: 'task5_daytime',
    number: 5,
    title: 'Daytime Habit',
    subtitle: 'Use natural light',
    colorDot: '🔴',
    color: '#ef4444',
    icon: '☀️',
    type: 'daytime',
    scenario: '☀️ It\'s a bright sunny day!',
    instruction: 'Open the curtains and turn OFF the lights',
    hint: 'Natural sunlight is FREE — use it instead of electric lights!',
    learning: 'During daytime, use natural light to save electricity!',
    initialOn: ['led_bulb', 'led_tube'],
    turnOffIds: ['led_bulb', 'led_tube'],
    curtainsClosed: true,         // Visual: curtains start closed
    requiredActions: ['open_curtains', 'turn_off_lights'],
    requiredOff: 2,
    familyKey: 'task5',
    finalLearning: {
      title: '💡 Key Learning',
      messages: [
        'Natural sunlight is the best FREE light source',
        'Open curtains during the day instead of using electric lights',
      ],
    },
  },

  // ──────────────────────────────────────────
  //  TASK 6 — NIGHTTIME DISCIPLINE 🟤
  // ──────────────────────────────────────────
  {
    id: 'task6_nighttime',
    number: 6,
    title: 'Nighttime Discipline',
    subtitle: 'Controlled usage',
    colorDot: '🟤',
    color: '#a16207',
    icon: '🌙',
    type: 'turn_off_partial',
    scenario: '🌙 It\'s nighttime — too many lights are ON!',
    instruction: 'Keep only the lights that are actually needed',
    hint: 'Not every room needs a light ON at night',
    learning: 'At night, use controlled lighting — only in rooms you\'re using!',
    initialOn: ['led_bulb', 'led_tube', 'ceiling_fan', 'table_fan'],
    turnOffIds: ['led_tube', 'table_fan'],            // Kitchen light + bedroom fan (family sleeping in bedroom with AC)
    keepOnIds: ['led_bulb', 'ceiling_fan'],            // Living room light (someone reading) + fan
    protectedIds: ['led_bulb', 'ceiling_fan'],
    protectedMessage: '🌙 This light is needed — someone is using this room!',
    requiredOff: 2,
    familyKey: 'task6',
    isNightScene: true,
    finalLearning: {
      title: '💡 Key Learning',
      messages: [
        'At night, only keep lights ON in rooms you\'re actively using',
        'Controlled usage saves significant energy over time',
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
    // Player must make smart choices — turn off AC (use fan instead), keep TV if watching
    turnOffIds: ['ac_1_5ton'],                // AC is unnecessary when fan works
    keepOnIds: ['ceiling_fan', 'tv_smart'],   // Fan + TV stay (family watching)
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
    scenario: '👨‍👩‍👧‍👦 Family is leaving for a function!',
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
    // TRICKY: These should NOT be turned off!
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
