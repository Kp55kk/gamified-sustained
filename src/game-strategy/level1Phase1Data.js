// ═══════════════════════════════════════════════════════════════
//  LEVEL 1 — PHASE 1: "Think Before You Use Energy"
//  Task Definitions, Temperature Simulation, Scoring & Feedback
// ═══════════════════════════════════════════════════════════════

// ─── Temperature Simulation ───
export function calculateIndoorTemp(baseIndoor, outdoorTemp, windowOpen, curtainOpen, roomSize) {
  let temp = baseIndoor;
  const sizeMod = roomSize === 'large' ? 0.6 : roomSize === 'small' ? 1.4 : 1.0;

  if (windowOpen) {
    // Ventilation effect: indoor temp moves toward outdoor
    const delta = (outdoorTemp - baseIndoor) * 0.6 * sizeMod;
    temp += delta;
  }
  if (curtainOpen) {
    // Sunlight adds slight warmth during day but also improves airflow feel
    temp -= 0.5 * sizeMod;
  }
  return Math.round(temp * 10) / 10;
}

export function isComfortable(temp) {
  return temp >= 24 && temp <= 28;
}

// ─── AC Temperature Feedback ───
export const AC_TEMP_OPTIONS = [
  {
    temp: 18,
    label: '18°C',
    icon: '❄️',
    status: 'bad',
    color: '#ef4444',
    bgColor: 'rgba(239,68,68,0.1)',
    borderColor: '#ef4444',
    feedback: 'Too low → high energy consumption + environmental pollution ⚠️',
    energyImpact: 'Very High',
    learning: 'Setting AC below 22°C wastes massive energy — each degree lower costs ~6% more electricity.',
    score: 0,
  },
  {
    temp: 22,
    label: '22°C',
    icon: '🌡️',
    status: 'okay',
    color: '#f59e0b',
    bgColor: 'rgba(245,158,11,0.1)',
    borderColor: '#f59e0b',
    feedback: 'Acceptable but not optimal — could be more efficient ⚠️',
    energyImpact: 'Medium-High',
    learning: 'BEE recommends 24°C as the ideal balance of comfort and efficiency.',
    score: 5,
  },
  {
    temp: 24,
    label: '24°C',
    icon: '✅',
    status: 'good',
    color: '#22c55e',
    bgColor: 'rgba(34,197,94,0.1)',
    borderColor: '#22c55e',
    feedback: 'Comfortable and energy-efficient! Perfect choice 🌱',
    energyImpact: 'Optimal',
    learning: '24°C is the BEE-recommended temperature — saves up to 25% energy compared to 18°C.',
    score: 15,
  },
];

// ─── Micro Feedback Messages ───
export const MICRO_FEEDBACK = {
  naturalAirflow: { text: 'Natural airflow working 🌬️', type: 'success' },
  energyWasted: { text: 'Energy wasted ⚠️', type: 'warning' },
  efficientDecision: { text: 'Efficient decision 🌱', type: 'success' },
  coolingWasted: { text: 'Cooling is wasted — energy loss ⚠️', type: 'error' },
  efficientCooling: { text: 'Efficient cooling achieved ✅', type: 'success' },
  sunlightUsed: { text: 'Using natural sunlight ☀️', type: 'success' },
  tooManyLights: { text: 'Too many lights ON — use only what is needed ⚠️', type: 'warning' },
  windowFirst: { text: 'Always try natural airflow first 🌬️', type: 'info' },
  acClosedRoom: { text: 'AC requires closed environment ❄️', type: 'info' },
  useSunlight: { text: 'Use sunlight instead of electricity ☀️', type: 'info' },
  minimalLight: { text: 'Use minimum artificial light required 💡', type: 'info' },
  outdoorMatters: { text: 'Outdoor condition affects your decision 🌡️', type: 'info' },
  roomSizeMatters: { text: 'Room size affects cooling need 📐', type: 'info' },
  tempDropped: { text: 'Temperature dropped naturally! 🌡️↓', type: 'success' },
  correctSetting: { text: 'Correct setting matters, not just usage ⚙️', type: 'info' },
};

// ─── Task Definitions ───
// Each task has: id, title, icon, scenario, steps, decision logic
export const PHASE1_TASKS = [
  // ─── TASK 1: Advanced Fan Decision ───
  {
    id: 1,
    title: 'Fan Decision — Natural Airflow First',
    icon: '🌬️',
    shortTitle: 'Fan',
    scenario: {
      description: 'The room feels slightly warm',
      indoorTemp: 29,
      outdoorTemp: 27,
      roomSize: 'medium',
      windowStart: 'closed',
      curtainStart: 'closed',
    },
    systemPrompt: 'Have you checked natural ventilation?',
    interruptPrompt: 'Check if windows and curtains are open',
    steps: [
      { id: 'open_window', instruction: 'Walk to Living Room window → Press E → Open', action: 'openWindow', icon: '🪟', position: [-5, 1.5, -7.0] },
      { id: 'open_curtain', instruction: 'Walk to Bedroom curtain → Press E → Open', action: 'openCurtain', icon: '🏠', position: [5, 1.5, -7.0] },
    ],
    // After steps: calculate temp, decide
    comfortableResult: {
      title: '🌬️ Natural Ventilation Is Enough!',
      message: 'Airflow improved! Temperature dropped to {{temp}}°C — the room is comfortable without a fan.',
      feedback: MICRO_FEEDBACK.naturalAirflow,
      learning: 'Always try natural airflow first — it costs zero energy!',
      score: 20,
    },
    warmResult: {
      title: '🌬️ Use Fan for Additional Comfort',
      message: 'Temperature dropped to {{temp}}°C, but still warm. You can now use the fan for additional comfort.',
      feedback: MICRO_FEEDBACK.efficientDecision,
      learning: 'Natural airflow reduced the load — the fan now uses less energy to cool the room.',
      score: 15,
    },
    // Large room override
    largRoomNote: 'Room size is large → fan required anyway',
    largRoomLearning: 'Room size affects cooling need — large rooms may still need fan support.',
    markerPosition: [-5, 1.5, -4], // Living room center
    windowPosition: [-5, 1.8, -7.9], // Living room window area
    curtainPosition: [5, 1.8, -7.9], // Bedroom curtain area
  },

  // ─── TASK 2: Advanced AC Decision ───
  {
    id: 2,
    title: 'AC Decision — Closed Environment',
    icon: '❄️',
    shortTitle: 'AC',
    scenario: {
      description: 'The room is hot',
      indoorTemp: 33,
      outdoorTemp: 35,
      roomSize: 'large',
      windowStart: 'open',
      curtainStart: 'open',
    },
    systemPrompt: 'AC requires a fully closed environment!\nClose windows, curtains, and doors first.',
    interruptPrompt: 'Close everything before using AC',
    steps: [
      { id: 'close_window', instruction: 'Walk to Bedroom window → Press E → Close', action: 'closeWindow', icon: '🪟', position: [5, 1.5, -7.0] },
      { id: 'close_curtain', instruction: 'Walk to Bedroom curtain → Press E → Close', action: 'closeCurtain', icon: '🏠', position: [5, 1.5, -7.0] },
      { id: 'close_door1', instruction: 'Walk to Bedroom door 1 → Press E → Close', action: 'closeDoor1', icon: '🚪', position: [5, 1.0, 0.5] },
      { id: 'close_door2', instruction: 'Walk to Bedroom door 2 → Press E → Close', action: 'closeDoor2', icon: '🚪', position: [0.5, 1.0, -4] },
    ],
    // After closing: show AC temp dial
    acTempRequired: true,
    ignoreResult: {
      title: '⚠️ Cooling Wasted!',
      message: 'AC is ON with open windows — cool air is escaping outside! Energy is being wasted.',
      feedback: MICRO_FEEDBACK.coolingWasted,
      learning: 'Never run AC with open windows — cold air escapes and the compressor works harder.',
      score: 0,
    },
    correctResult: {
      title: '✅ Efficient Cooling Achieved!',
      message: 'Windows, curtains, and doors closed. AC set to {{acTemp}}°C — cooling efficiently!',
      feedback: MICRO_FEEDBACK.efficientCooling,
      learning: 'AC requires a fully closed environment. Correct temperature setting saves up to 25% energy.',
      score: 15, // + AC temp score
    },
    markerPosition: [7, 1.5, -4], // Bedroom near AC
    windowPosition: [5, 1.8, -7.9],
    curtainPosition: [5, 1.8, -7.9],
  },

  // ─── TASK 3: Daylight + Illumination ───
  {
    id: 3,
    title: 'Daylight Check — Use Natural Light',
    icon: '🌞',
    shortTitle: 'Light',
    scenario: {
      description: 'Daytime — reading room needs bright light',
      timeOfDay: 'day',
      curtainStart: 'closed',
      requiredLux: 'Reading needs bright light',
    },
    systemPrompt: 'Is natural light available? Check before turning ON lights!',
    interruptPrompt: 'Open curtains first to check natural light',
    steps: [
      { id: 'open_curtain', instruction: 'Walk to Bedroom curtain → Press E → Open', action: 'openCurtain', icon: '☀️', position: [5, 1.5, -7.0] },
    ],
    // After opening: check if daylight is sufficient
    sufficientResult: {
      title: '☀️ Sunlight Fills the Room!',
      message: 'The room is bright enough — no artificial light needed! Natural light is free.',
      feedback: MICRO_FEEDBACK.sunlightUsed,
      learning: 'Use sunlight instead of electricity during the day.',
      score: 20,
    },
    insufficientResult: {
      title: '💡 Use One LED Light Only',
      message: 'Daylight helps, but not enough for reading. Use only ONE LED light for the remaining brightness.',
      feedback: MICRO_FEEDBACK.minimalLight,
      learning: 'Use minimum artificial light required — combine natural and LED for efficiency.',
      score: 15,
    },
    markerPosition: [5, 1.5, -5], // Bedroom
    curtainPosition: [5, 1.8, -7.9],
  },

  // ─── TASK 4: Day vs Night Decision Loop ───
  {
    id: 4,
    title: 'Day vs Night — Smart Behavior',
    icon: '🌗',
    shortTitle: 'Day/Night',
    scenario: {
      description: 'Experience day and night cycles',
      cycles: 2,
    },
    systemPrompt: 'Day and night need different energy actions!',
    dayActions: {
      title: '🌞 DAY — Sunlight Available',
      instructions: [
        'Open windows for ventilation',
        'Turn OFF all lights',
        'Use natural cooling',
      ],
      correctFeedback: MICRO_FEEDBACK.sunlightUsed,
    },
    nightActions: {
      title: '🌙 NIGHT — No Sunlight',
      instructions: [
        'Close windows if needed',
        'Use only required lighting',
        'Avoid excessive lights',
      ],
      correctFeedback: MICRO_FEEDBACK.efficientDecision,
    },
    warningOnExcessLights: MICRO_FEEDBACK.tooManyLights,
    learning: 'Day and night need different energy strategies — adapt your behavior!',
    score: 15,
    markerPosition: [-5, 1.5, -4],
  },

  // ─── TASK 5: Temperature Strategy ───
  {
    id: 5,
    title: 'Temperature Strategy — Compare & Decide',
    icon: '🌡️',
    shortTitle: 'Temp',
    scenario: {
      description: 'Compare indoor and outdoor temperatures to decide',
    },
    cases: [
      {
        id: 'case1',
        label: 'Scenario A',
        indoorTemp: 30,
        outdoorTemp: 26,
        bestAction: 'openWindow',
        bestActionLabel: 'Open Window',
        wrongAction: 'useAC',
        explanation: 'Outdoor is cooler (26°C) than indoor (30°C) — opening windows brings in cool air naturally!',
        feedback: MICRO_FEEDBACK.naturalAirflow,
      },
      {
        id: 'case2',
        label: 'Scenario B',
        indoorTemp: 30,
        outdoorTemp: 34,
        bestAction: 'useAC',
        bestActionLabel: 'Use AC',
        wrongAction: 'openWindow',
        explanation: 'Outdoor is hotter (34°C) than indoor (30°C) — opening windows would make it worse! AC is needed.',
        feedback: MICRO_FEEDBACK.efficientDecision,
      },
    ],
    learning: 'Outdoor condition affects your decision — always compare temperatures before acting!',
    correctScore: 15,
    wrongScore: 5,
    markerPosition: [7, 1.5, -4],
  },

  // ─── TASK 6: Combined Decision Challenge ───
  {
    id: 6,
    title: 'Combined Decision Challenge',
    icon: '🔥',
    shortTitle: 'Challenge',
    scenario: {
      description: 'Mixed conditions — Daytime, Medium heat, Medium room',
      indoorTemp: 30,
      outdoorTemp: 28,
      roomSize: 'medium',
      timeOfDay: 'day',
    },
    systemPrompt: 'Multiple factors! Consider everything before deciding.',
    decisions: [
      { id: 'window', question: 'Should you open windows?', correct: 'yes', options: ['yes', 'no'] },
      { id: 'fan', question: 'Is a fan needed?', correct: 'optional', options: ['yes', 'optional', 'no'] },
      { id: 'ac', question: 'Should you use AC?', correct: 'no', options: ['yes', 'no'] },
      { id: 'lights', question: 'Should lights be ON during daytime?', correct: 'no', options: ['yes', 'no'] },
    ],
    scoring: {
      perfect: { label: 'Outstanding! 🌟', score: 20, feedback: 'You made all the right decisions!' },
      good: { label: 'Great thinking! 👍', score: 15, feedback: 'Most decisions were efficient!' },
      average: { label: 'Room for improvement ⚠️', score: 8, feedback: 'Review natural options before appliances.' },
      poor: { label: 'Think again! ❌', score: 3, feedback: 'Always check environment first!' },
    },
    learning: 'In mixed conditions: environment first, natural options second, appliances last!',
    markerPosition: [-5, 1.5, -4],
  },

  // ─── TASK 7: Habit Reinforcement Loop ───
  {
    id: 7,
    title: 'Habit Reinforcement — Quick Decisions',
    icon: '🧠',
    shortTitle: 'Habits',
    scenario: {
      description: 'Random situations — apply what you learned!',
    },
    situations: [
      {
        id: 'sit1',
        title: 'Slight Heat',
        icon: '🌡️',
        description: 'It\'s slightly warm inside. Outdoor temp is lower.',
        correctAction: 'openWindow',
        correctLabel: 'Open Window',
        wrongAction: 'turnOnAC',
        wrongLabel: 'Turn ON AC',
        explanation: 'When outdoor is cooler, natural ventilation is the best first step!',
      },
      {
        id: 'sit2',
        title: 'Bright Daylight',
        icon: '☀️',
        description: 'It\'s a sunny afternoon. All lights are ON inside.',
        correctAction: 'openCurtain',
        correctLabel: 'Open Curtains & Turn OFF Lights',
        wrongAction: 'keepLights',
        wrongLabel: 'Keep Lights ON',
        explanation: 'Sunlight is free! Open curtains and turn off artificial lights during the day.',
      },
      {
        id: 'sit3',
        title: 'Moderate Airflow',
        icon: '🌬️',
        description: 'Windows are open. There\'s a gentle breeze. You want to turn ON the AC.',
        correctAction: 'useNatural',
        correctLabel: 'Keep Using Natural Air',
        wrongAction: 'turnOnAC',
        wrongLabel: 'Turn ON AC',
        explanation: 'Natural airflow is already working! Don\'t waste energy on AC when you have a breeze.',
      },
    ],
    correctScore: 10,
    wrongScore: 3,
    learning: 'Habits form through repetition — keep thinking before using energy!',
    markerPosition: [-5, 1.5, 2],
  },
];

// ─── Task Marker Positions (for 3D markers) ───
// Includes both main task markers AND step-specific markers
export const PHASE1_TASK_POSITIONS = {};
PHASE1_TASKS.forEach(task => {
  // Main task marker
  PHASE1_TASK_POSITIONS[`phase1_task_${task.id}`] = {
    pos: task.markerPosition,
    label: task.title,
    room: task.id <= 1 ? 'Living Room' : task.id <= 3 ? 'Bedroom' : task.id <= 4 ? 'Living Room' : task.id === 5 ? 'Bedroom' : 'Living Room',
    task: task.id,
  };
  // Step-specific markers (for walk-to-location steps)
  if (task.steps) {
    task.steps.forEach((step, i) => {
      if (step.position) {
        PHASE1_TASK_POSITIONS[`phase1_task_${task.id}_step_${i}`] = {
          pos: step.position,
          label: step.instruction,
          room: step.position[0] >= 0 ? 'Bedroom' : 'Living Room',
          task: task.id,
        };
      }
    });
  }
});

// ─── Performance Scoring ───
export function calculatePerformance(taskScores) {
  const maxScore = 20 * 7; // max 20 per task
  const totalScore = taskScores.reduce((sum, s) => sum + s, 0);
  const pct = Math.round((totalScore / maxScore) * 100);

  // Natural vs Appliance usage estimate
  const naturalPct = Math.min(100, Math.round(pct * 1.1));
  const appliancePct = Math.max(0, 100 - naturalPct);

  return {
    totalScore,
    maxScore,
    percentage: pct,
    naturalUsage: naturalPct,
    applianceUsage: appliancePct,
    efficiencyScore: pct,
    rating: pct >= 85 ? 'Outstanding 🌟' : pct >= 65 ? 'Great Work 👍' : pct >= 40 ? 'Good Effort 💪' : 'Keep Learning 📚',
    stars: pct >= 85 ? 3 : pct >= 60 ? 2 : 1,
  };
}

// ─── Before/After Cutscene Data ───
export const CUTSCENE_DATA = {
  before: {
    label: '❌ BEFORE',
    items: [
      { icon: '🪟', text: 'Windows closed' },
      { icon: '💡', text: 'Lights always ON' },
      { icon: '❄️', text: 'AC overused at 18°C' },
      { icon: '📈', text: 'High energy waste' },
    ],
  },
  after: {
    label: '✅ AFTER',
    items: [
      { icon: '🪟', text: 'Windows open for airflow' },
      { icon: '☀️', text: 'Natural light used' },
      { icon: '❄️', text: 'AC at 24°C (efficient)' },
      { icon: '📉', text: 'Minimal energy usage' },
    ],
  },
  teacherMessage: 'Good design and smart thinking reduce energy use!',
};

// ─── Final Learning Outcomes ───
export const LEARNING_OUTCOMES = [
  'Environment first, appliance later',
  'Temperature comparison guides decisions',
  'Room size importance for cooling',
  'Correct AC settings (24°C optimal)',
  'Day vs night behavior differences',
  'Minimal energy usage habits',
];
