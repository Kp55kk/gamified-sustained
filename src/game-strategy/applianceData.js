// Appliance information data for Level 1
export const APPLIANCE_DATA = {
  tv: {
    id: 'tv',
    name: 'LED Television (42")',
    room: 'Living Room',
    wattage: 80,
    monthlyKwh: 12,
    icon: '📺',
    description:
      "Hi! I'm your LED Television. I consume about 80 watts of power — much less than older CRT TVs that used 150–200 watts! Watching me 5 hours a day adds up to roughly 12 units (kWh) per month, costing around ₹60–70.",
  },
  ac_living: {
    id: 'ac_living',
    name: 'Air Conditioner (1.5 Ton)',
    room: 'Living Room',
    wattage: 1500,
    monthlyKwh: 180,
    icon: '❄️',
    description:
      "Hello! I'm the Air Conditioner. I'm one of the biggest energy consumers in your home at about 1500 watts! Running me 8 hours daily uses around 180 units per month. Tip: set me to 24°C instead of 18°C to save 25% energy!",
  },
  fan_living: {
    id: 'fan_living',
    name: 'Ceiling Fan',
    room: 'Living Room',
    wattage: 75,
    monthlyKwh: 18,
    icon: '🌀',
    description:
      "Hey there! I'm the ceiling fan. I use about 75 watts — super efficient compared to an AC! Running me 8 hours a day costs only about 18 units per month. Modern BLDC fans use just 28 watts!",
  },
  light_living: {
    id: 'light_living',
    name: 'LED Light',
    room: 'Living Room',
    wattage: 10,
    monthlyKwh: 7,
    icon: '💡',
    description:
      "I'm an LED light bulb! I use only 10 watts to produce the same brightness as a 60-watt incandescent bulb. Running me around 8 hours a day uses about 7 units per month — incredibly efficient!",
  },
  charging_living: {
    id: 'charging_living',
    name: 'Charging Port',
    room: 'Living Room',
    wattage: 10,
    monthlyKwh: 2,
    icon: '🔌',
    description:
      "I'm a charging port! I use about 5–10 watts when charging your phone. But here's a tip: unplug me when not in use! Even on standby, chargers draw 'vampire power' — wasting energy 24/7.",
  },
  ac_bedroom: {
    id: 'ac_bedroom',
    name: 'Air Conditioner (1 Ton)',
    room: 'Bedroom',
    wattage: 1200,
    monthlyKwh: 144,
    icon: '❄️',
    description:
      "I'm the bedroom AC. At 1 ton capacity, I use about 1200 watts. For a good night's sleep, use my timer to run for just 4–5 hours. Using a 5-star rated AC can save up to 30% on energy!",
  },
  fan_bedroom: {
    id: 'fan_bedroom',
    name: 'Ceiling Fan',
    room: 'Bedroom',
    wattage: 75,
    monthlyKwh: 18,
    icon: '🌀',
    description:
      "I'm the bedroom ceiling fan! At 75 watts, I'm much cheaper to run than the AC. On mild nights, use me instead of the AC to save a lot of electricity!",
  },
  light_bedroom: {
    id: 'light_bedroom',
    name: 'LED Light',
    room: 'Bedroom',
    wattage: 10,
    monthlyKwh: 5,
    icon: '💡',
    description:
      "I'm the bedroom LED light! I use only 10 watts. Remember to switch me off when you leave the room. Using natural daylight during the day saves energy!",
  },
  charging_bedroom: {
    id: 'charging_bedroom',
    name: 'Charging Port',
    room: 'Bedroom',
    wattage: 10,
    monthlyKwh: 2,
    icon: '🔌',
    description:
      "I'm the bedroom charging port. Most people charge phones overnight for 8 hours, but phones only need 2–3 hours! Overcharging wastes electricity and reduces battery life.",
  },
  fridge: {
    id: 'fridge',
    name: 'Refrigerator',
    room: 'Kitchen',
    wattage: 150,
    monthlyKwh: 45,
    icon: '🧊',
    description:
      "I'm the Refrigerator! I run 24/7 using about 150 watts, consuming around 45 units per month. Don't open my door too often — each opening wastes energy as cold air escapes! Keep me away from heat sources too.",
  },
  induction: {
    id: 'induction',
    name: 'Induction Stove',
    room: 'Kitchen',
    wattage: 2000,
    monthlyKwh: 30,
    icon: '🍳',
    description:
      "I'm the Induction Stove! I use 1500–2000 watts but I'm 85% energy efficient — much better than gas stoves at 40%! I heat food faster, so even though my wattage is high, total energy used per meal is actually low.",
  },
  light_kitchen: {
    id: 'light_kitchen',
    name: 'LED Light',
    room: 'Kitchen',
    wattage: 10,
    monthlyKwh: 5,
    icon: '💡',
    description:
      "I'm the kitchen LED light! Good lighting in the kitchen is important for safety. I use just 10 watts. Consider installing me under cabinets for focused task lighting!",
  },
  exhaust: {
    id: 'exhaust',
    name: 'Exhaust Fan',
    room: 'Kitchen',
    wattage: 40,
    monthlyKwh: 6,
    icon: '💨',
    description:
      "I'm the kitchen exhaust fan! I use only 40 watts and help remove smoke, steam, and odors. Run me only while cooking to save energy — about 6 units per month with regular use.",
  },
  geyser: {
    id: 'geyser',
    name: 'Water Heater (Geyser)',
    room: 'Bathroom',
    wattage: 2000,
    monthlyKwh: 60,
    icon: '🚿',
    description:
      "I'm the Water Heater or Geyser! I use about 2000 watts — one of the highest in your home! Heat water for just 10 minutes before your bath. A solar water heater can replace me and save ₹1000+ per month!",
  },
  light_bathroom: {
    id: 'light_bathroom',
    name: 'LED Light',
    room: 'Bathroom',
    wattage: 10,
    monthlyKwh: 3,
    icon: '💡',
    description:
      "I'm the bathroom LED light! I use just 10 watts. Since bathrooms are used for shorter periods, I typically consume only about 3 units per month. Always switch me off when leaving!",
  },
};

// Appliance 3D positions in the house: [x, y, z] and rotation [rx, ry, rz]
export const APPLIANCE_POSITIONS = {
  tv:              { pos: [-5, 1.0, -7.7], rot: [0, 0, 0] },
  ac_living:       { pos: [-9.7, 2.3, -4], rot: [0, Math.PI / 2, 0] },
  fan_living:      { pos: [-5, 2.85, -4], rot: [0, 0, 0] },
  light_living:    { pos: [-3, 2.9, -6], rot: [0, 0, 0] },
  charging_living: { pos: [-9.7, 0.5, -2], rot: [0, Math.PI / 2, 0] },
  ac_bedroom:      { pos: [9.7, 2.3, -4], rot: [0, -Math.PI / 2, 0] },
  fan_bedroom:     { pos: [5, 2.85, -4], rot: [0, 0, 0] },
  light_bedroom:   { pos: [7, 2.9, -6], rot: [0, 0, 0] },
  charging_bedroom:{ pos: [9.7, 0.5, -6], rot: [0, -Math.PI / 2, 0] },
  fridge:          { pos: [-9, 0.9, 1.5], rot: [0, Math.PI / 2, 0] },
  induction:       { pos: [-5, 0.95, 7.3], rot: [0, Math.PI, 0] },
  light_kitchen:   { pos: [-5, 2.9, 4], rot: [0, 0, 0] },
  exhaust:         { pos: [-5, 2.3, 7.8], rot: [0, Math.PI, 0] },
  geyser:          { pos: [9.7, 2.0, 2], rot: [0, -Math.PI / 2, 0] },
  light_bathroom:  { pos: [5, 2.9, 4], rot: [0, 0, 0] },
};
