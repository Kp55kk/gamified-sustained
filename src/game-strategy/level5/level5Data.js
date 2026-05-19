// ═══════════════════════════════════════════════════════════
//  LEVEL 5: SMART APPLIANCE EVOLUTION — BEE STAR RATINGS
//  Story-driven 3D exploration: Home → Meter → Teacher → Shop → Learn
// ═══════════════════════════════════════════════════════════

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
  speech: '\u{1F4AC}', think: '\u{1F914}', play: '\u{1F3AE}',
  meter: '\u{1F4CF}', bolt: '\u{26A1}', store: '\u{1F3EA}',
  paper: '\u{1F4F0}', teacher: '\u{1F9D1}\u200D\u{1F3EB}',
};

// ═══ TIME SYSTEM (needed by Environment) ═══
export const SCHEDULE_SLOTS = [
  { id: 'dawn',      label: 'Dawn (6 AM)',      hour: 6,  icon: '\u{1F305}', sunlight: 0.2 },
  { id: 'morning',   label: 'Morning (9 AM)',   hour: 9,  icon: '\u{1F304}', sunlight: 0.6 },
  { id: 'noon',      label: 'Noon (12 PM)',     hour: 12, icon: '\u{2600}\u{FE0F}', sunlight: 1.0 },
  { id: 'afternoon', label: 'Afternoon (3 PM)', hour: 15, icon: '\u{1F31E}', sunlight: 0.8 },
  { id: 'evening',   label: 'Evening (6 PM)',   hour: 18, icon: '\u{1F307}', sunlight: 0.15 },
  { id: 'night',     label: 'Night (9 PM)',     hour: 21, icon: '\u{1F303}', sunlight: 0.0 },
];

// ═══ STORY STAGES ═══
export const STORY_STAGES = [
  { id: 'discover',  name: 'Check Electricity Meter', icon: '\u{26A1}',  objective: 'Walk to the electricity meter on the right side of the house' },
  { id: 'teacher',   name: 'Listen to Teacher',       icon: '\u{1F9D1}\u200D\u{1F3EB}', objective: 'Learn about BEE Star Ratings from the teacher' },
  { id: 'newspaper', name: 'Pick Up Newspaper',        icon: '\u{1F4F0}', objective: 'Pick up the newspaper near the front door' },
  { id: 'shop',      name: 'Visit Appliance Shop',     icon: '\u{1F3EA}', objective: 'Walk to the new BEE Star-Rated Appliance Shop' },
  { id: 'learn',     name: 'Inspect Appliances',       icon: '\u{1F50D}', objective: 'Interact with all 5 appliance displays in the shop' },
  { id: 'roof',      name: 'Inspect Roof Panels',      icon: '\u{2600}\u{FE0F}', objective: 'Walk to the roof to inspect the 25-year-old solar panels' },
  { id: 'phase2',    name: 'Solar Panel Lifecycle',     icon: '\u{267B}\u{FE0F}', objective: 'Learn about solar panel aging, recycling, and second-life uses' },
  { id: 'biogas',    name: 'Visit Biogas Plant',        icon: '\u{1F33F}', objective: 'Walk to the biogas plant behind the house' },
  { id: 'phase3',    name: 'Biogas Energy System',      icon: '\u{267B}\u{FE0F}', objective: 'Learn about waste collection, biogas production, and slurry reuse' },
  { id: 'quiz',      name: 'Take Final Quiz',          icon: '\u{1F9E0}', objective: 'Test your knowledge of all 3 phases' },
];

// ═══ TEACHER DIALOGUES ═══
export const METER_DIALOGUE = [
  "Whoa! Your electricity bill is \u20B94,800 per month!",
  "That's because your appliances are old and inefficient.",
  "Each appliance has a hidden energy rating\u{2026}",
];
export const TEACHER_DIALOGUE = [
  "Hello Arjun! I'm your Energy Teacher.",
  "Every appliance in India gets a BEE Star Rating \u{2014} from 1 to 5 stars.",
  "More stars means LESS electricity wasted!",
  "A 5-star fridge uses 74% LESS power than an old one.",
  "There's a new appliance shop nearby. Pick up that newspaper to find out!",
];
export const NEWSPAPER_HEADLINE = "NEW BEE Star-Rated Appliance Shop Opens in Your Neighborhood!";
export const NEWSPAPER_SUBTEXT = "Compare old vs 5-star appliances. Learn how to save \u20B915,000-25,000/year on electricity!";

// ═══ ROOF DIALOGUE (Phase 2 transition) ═══
export const ROOF_DIALOGUE = [
  "Great job with the star ratings, Arjun!",
  "Now let's check something important — the solar panels on your roof.",
  "They were installed 25 years ago. What happens to solar panels after so long?",
  "Walk up to the roof and let's find out!",
];

// ═══ PHASE 2 TOPIC IDS ═══
export const PHASE2_TOPIC_IDS = ['panel_aging', 'recycling_process', 'second_life', 'circular_economy'];

// ═══ BIOGAS DIALOGUE (Phase 3 transition) ═══
export const BIOGAS_DIALOGUE = [
  "Amazing work on solar lifecycle, Arjun!",
  "Now let's explore the THIRD pillar of sustainable living — BIOGAS!",
  "There's a biogas plant behind the house. Let's see how kitchen waste becomes free cooking gas!",
  "Walk to the biogas plant to begin.",
];

// ═══ PHASE 3 TOPIC IDS ═══
export const PHASE3_TOPIC_IDS = ['waste_collection', 'plant_construction', 'anaerobic_digestion', 'biogas_usage', 'slurry_reuse'];

// ═══ SHOP APPLIANCE DISPLAYS ═══
export const SHOP_DISPLAYS = [
  { id: 'shop_fan',     topicId: 'star_basics',       name: 'Ceiling Fan Display',    icon: '\u{1F300}', desc: 'Old Fan vs BLDC 5-Star',     pos: [19, 0.5, -3]  },
  { id: 'shop_fridge',  topicId: 'energy_comparison',  name: 'Refrigerator Display',   icon: '\u{1F9CA}', desc: 'Old Fridge vs 5-Star',       pos: [19, 0.5, 4]   },
  { id: 'shop_ac',      topicId: 'star_analysis',      name: 'AC Display',             icon: '\u{2744}\u{FE0F}',  desc: '1-Star vs 5-Star Inverter', pos: [29, 0.5, -3]  },
  { id: 'shop_washer',  topicId: 'lifecycle_cost',     name: 'Washer & Fridge Combo',  icon: '\u{1F455}', desc: 'Lifecycle Cost Calculator',   pos: [29, 0.5, 4]   },
  { id: 'shop_label',   topicId: 'smart_buying',       name: 'BEE Label Station',      icon: '\u{2B50}', desc: 'Smart Buying Guide',          pos: [24, 0.5, 6]   },
];
export const SHOP_DISPLAY_IDS = SHOP_DISPLAYS.map(d => d.id);
export const SHOP_DISPLAY_MAP = {};
SHOP_DISPLAYS.forEach(d => { SHOP_DISPLAY_MAP[d.id] = d; });

// ═══ INTERACTION POINTS (non-shop) ═══
export const INTERACTION_POINTS = {
  electricity_meter: { pos: [10.3, 1.2, -3], name: 'Electricity Meter', icon: '\u{26A1}' },
  newspaper:         { pos: [-5, 0.3, -10],  name: 'Newspaper',         icon: '\u{1F4F0}' },
};

// ═══ TOPIC LIST ═══
export const L5_TOPICS = [
  { id: 'star_basics',       name: 'BEE Star Ratings',        icon: '\u{2B50}', color: '#f59e0b' },
  { id: 'energy_comparison', name: 'Energy Comparison Lab',    icon: '\u{26A1}', color: '#22c55e' },
  { id: 'star_analysis',     name: 'Star Rating Deep Dive',    icon: '\u{1F4CA}', color: '#a78bfa' },
  { id: 'lifecycle_cost',    name: 'Lifecycle Cost Calculator', icon: '\u{1F4B0}', color: '#60a5fa' },
  { id: 'smart_buying',      name: 'Smart Buying Guide',       icon: '\u{1F6D2}', color: '#f97316' },
];

// ═══ QUIZ (Phase 1 + Phase 2 combined) ═══
export const L5_QUIZ = [
  // Phase 1: Star Ratings
  { question: 'What does BEE stand for?', options: ['Best Electrical Equipment', 'Bureau of Energy Efficiency', 'Basic Energy Evaluation'], correctIndex: 1, feedback: { correct: 'BEE is the Bureau of Energy Efficiency!', wrong: 'BEE stands for Bureau of Energy Efficiency.' }},
  { question: 'How much less electricity does a 5-star fridge use vs an old one?', options: ['20% less', '50% less', '74% less'], correctIndex: 2, feedback: { correct: '74% less \u2014 from 700 kWh to 180 kWh/year!', wrong: 'A 5-star fridge uses 74% less electricity.' }},
  { question: 'What type of ceiling fan motor is most efficient?', options: ['Induction motor', 'BLDC motor', 'Universal motor'], correctIndex: 1, feedback: { correct: 'BLDC motors use only 28W vs 75W!', wrong: 'BLDC motors are most efficient at 28W.' }},
  { question: 'Which costs MORE over 15 years: cheap 1-star or expensive 5-star fridge?', options: ['The cheap 1-star fridge', 'The expensive 5-star fridge', 'Both cost the same'], correctIndex: 0, feedback: { correct: '1-star costs Rs.84,000 total vs Rs.36,900 for 5-star!', wrong: 'Cheap appliances cost more due to electricity.' }},
  { question: 'How much can a family save/year with all 5-star appliances?', options: ['Rs.2,000-5,000', 'Rs.15,000-25,000', 'Rs.50,000-75,000'], correctIndex: 1, feedback: { correct: 'Rs.15,000-25,000 per year!', wrong: 'Total savings are Rs.15,000-25,000/year.' }},
  { question: 'How often does BEE make star ratings stricter?', options: ['Every year', 'Every 2 years', 'Every 5 years'], correctIndex: 1, feedback: { correct: 'Every 2 years they get stricter!', wrong: 'Star ratings update every 2 years.' }},
  // Phase 2: Solar Panel Lifecycle
  { question: 'How much power does a solar panel lose per year?', options: ['5-10%', '0.5-0.8%', '15-20%'], correctIndex: 1, feedback: { correct: 'Just 0.5-0.8% per year — very slow decline!', wrong: 'Solar panels degrade at only 0.5-0.8% per year.' }},
  { question: 'After 25 years, how much of its original power does a panel produce?', options: ['About 50%', 'About 80%', 'About 95%'], correctIndex: 1, feedback: { correct: 'About 80% — a 300W panel still gives 240W!', wrong: 'After 25 years, panels still produce about 80% power.' }},
  { question: 'What percentage of a solar panel is recyclable?', options: ['50-60%', '70-80%', '90-95%'], correctIndex: 2, feedback: { correct: '90-95% recyclable — one of the most recyclable products!', wrong: 'Solar panels are 90-95% recyclable by weight.' }},
  { question: 'What is the largest material component of a solar panel?', options: ['Silicon', 'Glass (75%)', 'Aluminum'], correctIndex: 1, feedback: { correct: 'Glass makes up 75% and is fully recyclable!', wrong: 'Glass is 75% of a solar panel — the largest component.' }},
  { question: 'How long can second-life panels serve in rural areas?', options: ['1-2 years', '5-7 years', '10-15 years'], correctIndex: 2, feedback: { correct: '10-15 more years of useful service!', wrong: 'Second-life panels can serve 10-15 more years.' }},
  { question: 'What does cradle-to-cradle design mean?', options: ['Making panels cheaper', 'Designing for easy recycling from Day 1', 'Using plastic instead of glass'], correctIndex: 1, feedback: { correct: 'Design for recycling from the very beginning!', wrong: 'Cradle-to-cradle means designing for easy recycling from Day 1.' }},
  // Phase 3: Biogas
  { question: 'What type of waste goes into a biogas plant?', options: ['Plastic and metal', 'Organic kitchen waste', 'Glass bottles'], correctIndex: 1, feedback: { correct: 'Only organic waste like veggie peels and food scraps!', wrong: 'Biogas plants need organic kitchen waste — not plastic or glass.' }},
  { question: 'What is the main fuel component of biogas?', options: ['Carbon dioxide', 'Methane (CH\u2084)', 'Hydrogen'], correctIndex: 1, feedback: { correct: 'Methane makes up 60% of biogas and burns cleanly!', wrong: 'Methane (CH\u2084) at 60% is the fuel that burns in biogas.' }},
  { question: 'How many LPG cylinders can a biogas plant replace per year?', options: ['1 cylinder', '2-3 cylinders', '10 cylinders'], correctIndex: 1, feedback: { correct: '2-3 cylinders per year — saving Rs.2,000-3,000!', wrong: 'A household biogas plant replaces 2-3 LPG cylinders per year.' }},
  { question: 'What is biogas slurry used for?', options: ['Throwing in the river', 'Organic fertilizer for plants', 'Building material'], correctIndex: 1, feedback: { correct: 'Slurry is nutrient-rich fertilizer with N, P, and K!', wrong: 'Biogas slurry is an excellent organic fertilizer for plants.' }},
];

// ═══ CONFIDENCE BOOST ═══
export const CONFIDENCE_MESSAGES = [
  'You\'re becoming a smart energy consumer!',
  'Your appliance knowledge is growing!',
  'That\'s how a sustainability expert thinks!',
  'You\'re mastering smart buying decisions!',
  'Excellent \u2014 your home gets more efficient!',
];

// ═══ STAR SYSTEM ═══
export function calculateL5Stars(topicsCompleted, quizScore, quizTotal) {
  const topicPct = (topicsCompleted / 5) * 100;
  const quizPct = quizTotal > 0 ? (quizScore / quizTotal) * 100 : 50;
  const overall = topicPct * 0.5 + quizPct * 0.5;
  if (overall >= 75) return 3;
  if (overall >= 50) return 2;
  return 1;
}

// ═══ BADGE ═══
export const LEVEL5_BADGE = {
  id: 'star_rating_expert', title: 'Star Rating Expert',
  description: 'Mastered BEE Star Ratings and smart appliance buying!',
  icon: '\u{1F3C6}', coins: 200,
};

// ═══ DIALOGUE ═══
export const ENTRY_DIALOGUE = [
  "You've learned about solar energy\u{2026}",
  "But what about the appliances INSIDE your home?",
  "Every appliance has a secret energy rating!",
  "Let's explore and discover BEE Star Ratings!",
];
export const FINAL_DIALOGUE = [
  "You now understand BEE Star Ratings like a pro!",
  "Every smart buying decision saves money AND the planet.",
  "Share this knowledge with your family!",
  "Go make sustainable choices in the real world. \u{1F30D}\u{2728}",
];
