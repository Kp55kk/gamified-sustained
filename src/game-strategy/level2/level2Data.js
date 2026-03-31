// ─── Level 2: The Energy Meter — Complete Dataset ───
// Source: CEA India Ver 21.0 (2025), BEE India, IEA, U.S. DOE, U.S. EIA
// Emission Factor: 0.710 kg CO₂/kWh (CEA India FY 2024-25)

export const CO2_FACTOR = 0.710;

// ─── Appliance Data (D1 Table — Essential + Non-Essential) ───
export const APPLIANCES = [
  // Essential
  { id: 'ceiling_fan',     name: 'Ceiling Fan (\u00D73)',   icon: '\u{1F300}',  wattage: 225, hoursPerDay: 12, daysPerYear: 300, kwhPerYear: 810,  co2: 575,  type: 'essential', category: 'Cooling',       room: 'Living Room', color: '#3b82f6' },
  { id: 'fridge',          name: 'Refrigerator (200L)',     icon: '\u{1F9CA}',  wattage: 150, hoursPerDay: 8,  daysPerYear: 365, kwhPerYear: 400,  co2: 284,  type: 'essential', category: 'Preservation',  room: 'Kitchen',     color: '#06b6d4' },
  { id: 'led_lights',      name: 'LED Lights (8\u00D710W)', icon: '\u{1F4A1}',  wattage: 80,  hoursPerDay: 6,  daysPerYear: 365, kwhPerYear: 175,  co2: 124,  type: 'essential', category: 'Lighting',      room: 'All Rooms',   color: '#eab308' },
  { id: 'tv_led',          name: 'Television (32" LED)',    icon: '\u{1F4FA}',  wattage: 55,  hoursPerDay: 5,  daysPerYear: 365, kwhPerYear: 100,  co2: 71,   type: 'essential', category: 'Entertainment', room: 'Living Room', color: '#8b5cf6' },
  { id: 'wifi_router',     name: 'Wi-Fi Router',            icon: '\u{1F4F6}',  wattage: 12,  hoursPerDay: 24, daysPerYear: 365, kwhPerYear: 105,  co2: 75,   type: 'essential', category: 'Comms',         room: 'Living Room', color: '#14b8a6' },
  { id: 'chargers',        name: 'Mobile + Laptop Charger', icon: '\u{1F50C}',  wattage: 65,  hoursPerDay: 4,  daysPerYear: 365, kwhPerYear: 95,   co2: 67,   type: 'essential', category: 'Charging',      room: 'Bedroom',     color: '#f97316' },
  { id: 'iron',            name: 'Electric Iron',           icon: '\u{2668}\u{FE0F}', wattage: 1000, hoursPerDay: 0.25, daysPerYear: 300, kwhPerYear: 75, co2: 53, type: 'essential', category: 'Laundry', room: 'Bedroom', color: '#ef4444' },
  { id: 'water_purifier',  name: 'Water Purifier (RO)',     icon: '\u{1F4A7}',  wattage: 60,  hoursPerDay: 3,  daysPerYear: 365, kwhPerYear: 66,   co2: 47,   type: 'essential', category: 'Utility',       room: 'Kitchen',     color: '#0ea5e9' },

  // Non-Essential
  { id: 'ac',              name: 'Air Conditioner (1.5T)',   icon: '\u{2744}\u{FE0F}', wattage: 1500, hoursPerDay: 8, daysPerYear: 150, kwhPerYear: 1800, co2: 1278, type: 'non-essential', category: 'Cooling',   room: 'Bedroom',  color: '#3b82f6' },
  { id: 'room_heater',     name: 'Room Heater (Radiant)',   icon: '\u{1F525}',  wattage: 2000, hoursPerDay: 5,  daysPerYear: 60,  kwhPerYear: 600,  co2: 426,  type: 'non-essential', category: 'Heating',   room: 'Bedroom',  color: '#ef4444' },
  { id: 'dishwasher',      name: 'Dishwasher',              icon: '\u{1F37D}\u{FE0F}', wattage: 1800, hoursPerDay: 1, daysPerYear: 200, kwhPerYear: 360, co2: 256, type: 'non-essential', category: 'Kitchen', room: 'Kitchen', color: '#64748b' },
  { id: 'desktop',         name: 'Desktop Computer',        icon: '\u{1F5A5}\u{FE0F}', wattage: 250, hoursPerDay: 4, daysPerYear: 300, kwhPerYear: 300, co2: 213, type: 'non-essential', category: 'Computing', room: 'Bedroom', color: '#6366f1' },
  { id: 'dryer',           name: 'Clothes Dryer',           icon: '\u{1F32C}\u{FE0F}', wattage: 2500, hoursPerDay: 1, daysPerYear: 100, kwhPerYear: 250, co2: 178, type: 'non-essential', category: 'Laundry', room: 'Bathroom', color: '#a855f7' },
  { id: 'geyser',          name: 'Electric Geyser (25L)',   icon: '\u{1F6BF}',  wattage: 2000, hoursPerDay: 0.5, daysPerYear: 180, kwhPerYear: 180, co2: 128,  type: 'non-essential', category: 'Heating',   room: 'Bathroom', color: '#f43f5e' },
  { id: 'oven',            name: 'Electric Oven / OTG',     icon: '\u{1F35E}',  wattage: 2000, hoursPerDay: 0.5, daysPerYear: 150, kwhPerYear: 150, co2: 107,  type: 'non-essential', category: 'Cooking',   room: 'Kitchen',  color: '#d97706' },
  { id: 'gaming',          name: 'Gaming Console',          icon: '\u{1F3AE}',  wattage: 200, hoursPerDay: 2,   daysPerYear: 250, kwhPerYear: 100, co2: 71,   type: 'non-essential', category: 'Entertainment', room: 'Living Room', color: '#10b981' },
  { id: 'washing_machine', name: 'Washing Machine (7kg)',   icon: '\u{1F455}',  wattage: 500, hoursPerDay: 1,   daysPerYear: 200, kwhPerYear: 100, co2: 71,   type: 'non-essential', category: 'Laundry',   room: 'Bathroom', color: '#0284c7' },
  { id: 'microwave',       name: 'Microwave Oven',          icon: '\u{1F4E1}',  wattage: 1200, hoursPerDay: 0.25, daysPerYear: 300, kwhPerYear: 90, co2: 64,  type: 'non-essential', category: 'Cooking',   room: 'Kitchen',  color: '#ea580c' },
];

// Step 1 Discovery: subset of appliances for ON/OFF room interaction
export const DISCOVERY_APPLIANCES = APPLIANCES.filter(a =>
  ['ceiling_fan', 'fridge', 'led_lights', 'tv_led', 'ac', 'geyser', 'washing_machine', 'microwave', 'iron', 'desktop'].includes(a.id)
);

// Step 4 Ranking: sorted by kwhPerYear (answer key)
export const RANKING_ANSWER = [...APPLIANCES]
  .sort((a, b) => b.kwhPerYear - a.kwhPerYear)
  .slice(0, 8);

// ─── Electricity Rate Slabs (Indian Domestic) ───
export const RATE_SLABS = [
  { min: 0,   max: 100, rate: 3,  label: '0-100 units' },
  { min: 101, max: 200, rate: 5,  label: '101-200 units' },
  { min: 201, max: 300, rate: 7,  label: '201-300 units' },
  { min: 301, max: Infinity, rate: 9, label: '300+ units' },
];

export function calculateBill(monthlyKwh) {
  let remaining = monthlyKwh;
  let total = 0;
  const breakdown = [];
  for (const slab of RATE_SLABS) {
    const slabUnits = Math.min(remaining, slab.max - slab.min + 1);
    if (slabUnits <= 0) break;
    const cost = slabUnits * slab.rate;
    breakdown.push({ ...slab, units: slabUnits, cost });
    total += cost;
    remaining -= slabUnits;
  }
  return { total: Math.round(total), breakdown, monthlyKwh: Math.round(monthlyKwh) };
}

// ─── Sharma Family Example ───
export const SHARMA_FAMILY = [
  { name: '3 Ceiling Fans',   dailyUse: '12 hrs', days: 300, kwh: 810,  co2: 575 },
  { name: '8 LED Lights',     dailyUse: '6 hrs',  days: 365, kwh: 175,  co2: 124 },
  { name: '1 Refrigerator',   dailyUse: '24 hrs', days: 365, kwh: 400,  co2: 284 },
  { name: '1 LED TV (32")',   dailyUse: '4 hrs',  days: 365, kwh: 80,   co2: 57 },
  { name: '1 AC (1.5 Ton)',   dailyUse: '6 hrs',  days: 120, kwh: 1080, co2: 767 },
  { name: '1 Washing Machine', dailyUse: '1 hr',  days: 156, kwh: 78,   co2: 55 },
  { name: '1 Geyser',         dailyUse: '30 min', days: 120, kwh: 120,  co2: 85 },
  { name: 'Router + Chargers', dailyUse: 'Various', days: 365, kwh: 170, co2: 121 },
];

// ─── Quiz Questions (difficulty: 1=easy, 2=medium, 3=hard) ───
export const QUIZ_QUESTIONS = [
  {
    id: 'l2q1', difficulty: 1,
    question: 'What is the formula to calculate daily energy consumption (kWh)?',
    options: ['Watts \u00D7 Hours', '(Watts \u00D7 Hours) \u00F7 1000', 'Watts \u00F7 Hours', 'Watts + Hours'],
    correctIndex: 1,
    explanation: 'kWh = (Watts \u00D7 Hours) \u00F7 1000. We divide by 1000 because 1 kWh = 1000 watt-hours.',
  },
  {
    id: 'l2q2', difficulty: 1,
    question: 'Which single appliance emits the MOST CO\u2082 per year in an Indian home?',
    options: ['Ceiling Fan', 'Refrigerator', 'Air Conditioner', 'Geyser'],
    correctIndex: 2,
    explanation: 'The AC emits ~1278 kg CO\u2082/year \u2014 more than ALL essential appliances combined! High wattage (1500W) + long hours (8h/day).',
  },
  {
    id: 'l2q3', difficulty: 1,
    question: 'How much CO\u2082 is released per unit (kWh) of electricity in India?',
    options: ['0.500 kg', '0.710 kg', '0.900 kg', '1.200 kg'],
    correctIndex: 1,
    explanation: 'India\'s grid emission factor is 0.710 kg CO\u2082/kWh (CEA India FY 2024-25, Ver 21.0).',
  },
  {
    id: 'l2q4', difficulty: 2,
    question: 'A 75W ceiling fan runs 12 hours/day for 300 days. What is its annual kWh?',
    options: ['180 kWh', '270 kWh', '360 kWh', '900 kWh'],
    correctIndex: 1,
    explanation: 'Daily = (75 \u00D7 12) \u00F7 1000 = 0.9 kWh. Annual = 0.9 \u00D7 300 = 270 kWh.',
  },
  {
    id: 'l2q5', difficulty: 2,
    question: 'Essential appliances account for what percentage of total household CO\u2082?',
    options: ['15%', '32%', '50%', '68%'],
    correctIndex: 1,
    explanation: 'Essential appliances produce ~1296 kg CO\u2082/year, which is about 32% of the total ~4088 kg.',
  },
  {
    id: 'l2q6', difficulty: 2,
    question: 'Which factor does NOT affect how much CO\u2082 an appliance produces?',
    options: ['Wattage of the appliance', 'Hours used per day', 'Color of the appliance', 'Days used per year'],
    correctIndex: 2,
    explanation: 'CO\u2082 depends on wattage, hours/day, and days/year. The color has no effect on energy consumption!',
  },
  {
    id: 'l2q7', difficulty: 3,
    question: 'The Sharma family uses ~2913 kWh/year. What is their approximate annual CO\u2082 emission?',
    options: ['~1500 kg', '~2068 kg', '~2913 kg', '~3500 kg'],
    correctIndex: 1,
    explanation: '2913 kWh \u00D7 0.710 kg/kWh = ~2068 kg CO\u2082. That\'s about 2.1 tonnes per year!',
  },
];

// ─── Achievement/Badge ───
export const LEVEL2_BADGE = {
  id: 'watt_wizard',
  title: 'Watt Wizard',
  description: 'Mastered appliance energy consumption!',
  icon: '\u{1F9D9}',
  coins: 50,
};

// ─── Energy Impact Messages ───
export const IMPACT_MESSAGES = [
  'AC uses ~1800 kWh/year \u{2014} more than ALL essential appliances combined!',
  'Top 3 appliances (AC, Fans, Heater) cause ~56% of all household CO\u2082.',
  'Switching to BLDC fans saves 50-60% energy \u{2014} from 75W down to 28W!',
  'Setting AC to 24\u{00B0}C instead of 18\u{00B0}C saves ~25% energy.',
  'India\'s grid gets cleaner every year \u{2014} emission factor dropped from 0.774 to 0.710 in a decade.',
];
