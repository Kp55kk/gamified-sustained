// ═══════════════════════════════════════════════════════════
//  LEVEL 3 — PHASE 2 (ULTIMATE VERSION)
//  "HOW CAN WE SAVE OUR FUTURE?"
//  House becomes a live sustainability laboratory
// ═══════════════════════════════════════════════════════════

// ─── SOUND EFFECT CONFIGS ───
export const SFX = {
  sweep:    { freq: [300, 800], dur: 0.25, type: 'sine',     vol: 0.10 },
  dig:      { freq: [120, 80],  dur: 0.20, type: 'sawtooth', vol: 0.08 },
  water:    { freq: [600, 1200],dur: 0.35, type: 'sine',     vol: 0.06 },
  plant:    { freq: [400, 600], dur: 0.30, type: 'triangle', vol: 0.09 },
  grow:     { freq: [300, 500, 700], dur: 0.50, type: 'triangle', vol: 0.07 },
  scan:     { freq: [900, 1100],dur: 0.15, type: 'square',   vol: 0.05 },
  panel:    { freq: [500, 700], dur: 0.25, type: 'triangle', vol: 0.08 },
  solar:    { freq: [800, 1000, 1200], dur: 0.40, type: 'sine', vol: 0.06 },
  wind:     { freq: [200, 150], dur: 0.50, type: 'sine',     vol: 0.04 },
  turbine:  { freq: [350, 500], dur: 0.30, type: 'triangle', vol: 0.07 },
  storm:    { freq: [80, 60],   dur: 0.60, type: 'sawtooth', vol: 0.06 },
  toggle:   { freq: [700, 900], dur: 0.12, type: 'square',   vol: 0.06 },
  charge:   { freq: [400, 600, 800, 1000], dur: 0.60, type: 'sine', vol: 0.05 },
  whoosh:   { freq: [500, 200], dur: 0.30, type: 'sine',     vol: 0.05 },
  reveal:   { freq: [523, 659, 784], dur: 0.50, type: 'triangle', vol: 0.08 },
  ambient:  { freq: [220], dur: 2.0, type: 'sine', vol: 0.02 },
  wire:     { freq: [600, 800, 600], dur: 0.20, type: 'square', vol: 0.05 },
  mount:    { freq: [300, 500], dur: 0.15, type: 'triangle', vol: 0.07 },
  bird:     { freq: [1200, 1600, 1400], dur: 0.30, type: 'sine', vol: 0.04 },
  pour:     { freq: [100, 60], dur: 0.40, type: 'sawtooth', vol: 0.06 },
};

// ─── PANEL TYPE SELECTION DATA ───
export const PANEL_TYPES = [
  { id: 'mono', name: 'Monocrystalline', icon: '⬛', efficiency: '22%', cost: '₹25,000/panel',
    color: '#1a237e', description: 'Higher efficiency, sleek black look, best for limited roof space' },
  { id: 'poly', name: 'Polycrystalline', icon: '🔷', efficiency: '17%', cost: '₹18,000/panel',
    color: '#1565c0', description: 'More affordable, blue speckled look, good for larger roofs' },
];

// ─── TURBINE TYPE SELECTION DATA ───
export const TURBINE_TYPES = [
  { id: 'horizontal', name: 'Horizontal Axis', icon: '🌀', efficiency: 'High', minWind: '4 m/s',
    description: 'Most common type — large blades face the wind directly', recommended: true },
  { id: 'vertical', name: 'Vertical Axis', icon: '🔄', efficiency: 'Medium', minWind: '2 m/s',
    description: 'Works in any wind direction — lower output but more compact' },
];

// ─── INTRO DIALOGUE — "THERE IS STILL HOPE" ───
export const INTRO_DIALOGUE = [
  { speaker: 'teacher', text: '"You have seen how energy usage damages our environment."' },
  { speaker: 'teacher', text: '"But we can still fix this. There is hope."' },
  { speaker: 'teacher', text: '"Let us transform THIS house into a sustainable home."' },
  { speaker: 'teacher', text: '"We will use trees, solar energy, and wind energy."' },
  { speaker: 'narration', text: 'A journey of transformation begins…' },
];

// ─── PHASE SEGMENTS ───
export const SEGMENTS = [
  {
    id: 'trees',
    title: 'Trees — Green Transformation',
    subtitle: 'Transform the surroundings',
    icon: '🌳',
    color: '#22c55e',
    description: 'Transform the barren, polluted land around your home into a lush green garden that absorbs CO₂ and cools the environment.',
    duration: '5–6 minutes',
  },
  {
    id: 'solar',
    title: 'Solar — House Evolution',
    subtitle: 'Power from the Sun',
    icon: '☀️',
    color: '#f59e0b',
    description: 'Evolve your home into a smart solar house. Scan energy, install panels, and watch the house transform.',
    duration: '8–10 minutes',
  },
  {
    id: 'wind',
    title: 'Wind — Support System',
    subtitle: 'Renewable backup',
    icon: '🌬️',
    color: '#3b82f6',
    description: 'Install wind turbines in the open field nearby. Renewables work best together — wind supports solar.',
    duration: '4–5 minutes',
  },
];

// ═══════════════════════════════════════════════════════════
//  PART 1 — TREE TRANSFORMATION SYSTEM
// ═══════════════════════════════════════════════════════════

export const TREE_TYPES = [
  {
    id: 'neem', name: 'Neem Tree', icon: '🌿',
    co2PerYear: '48 kg', co2Value: 48, shade: 'Large',
    growthYears: '5–8 years', futureHeight: '15–20m',
    description: 'High CO₂ absorption, natural pest repellent',
    color: '#166534', bestFor: 'Maximum CO₂ reduction',
  },
  {
    id: 'banyan', name: 'Banyan Tree', icon: '🌳',
    co2PerYear: '22 kg', co2Value: 22, shade: 'Massive',
    growthYears: '10–15 years', futureHeight: '20–30m',
    description: 'Massive oxygen producer, enormous shade',
    color: '#15803d', bestFor: 'Long-term shade & oxygen',
  },
  {
    id: 'mango', name: 'Mango Tree', icon: '🥭',
    co2PerYear: '35 kg', co2Value: 35, shade: 'Medium',
    growthYears: '5–8 years', futureHeight: '10–15m',
    description: 'Good CO₂ absorption, provides fruit',
    color: '#047857', bestFor: 'Food + carbon offset',
  },
  {
    id: 'decorative', name: 'Decorative Plant', icon: '🌸',
    co2PerYear: '5 kg', co2Value: 5, shade: 'Small',
    growthYears: '1–2 years', futureHeight: '1–2m',
    description: 'Low CO₂ impact, adds beauty only',
    color: '#65a30d', bestFor: 'Aesthetics only',
  },
];

export const TREE_TASKS = [
  {
    id: 'survey', label: 'Survey the garden', icon: '👁️',
    instruction: 'Look at the barren, polluted surroundings',
    feedback: 'The land is dry and lifeless. Time to change that.',
    sfx: 'whoosh', auto: true, autoDur: 4000,
    teacherLine: 'See how barren and hot this land is? No shade, no life.',
    visualDemo: 'Camera pans across dry cracked ground with heat shimmer',
  },
  {
    id: 'clear_debris', label: 'Clear the debris', icon: '🧹',
    instruction: 'Press E on each debris pile to clean the yard',
    feedback: 'Area cleaned! Now we can see the soil properly.',
    sfx: 'sweep',
    teacherLine: 'First, we clear the waste. A clean site is essential for planting.',
    visualDemo: 'Debris piles glow — player clears each one',
  },
  {
    id: 'analyze_soil', label: 'Analyze soil quality', icon: '🔬',
    instruction: 'Press E at each hotspot to scan soil quality',
    feedback: 'Soil analysis complete! Good nutrients detected.',
    sfx: 'scan',
    teacherLine: 'Soil quality determines which trees will thrive here.',
    visualDemo: 'Hotspot markers pulse — player scans each one',
  },
  {
    id: 'select_trees', label: 'Choose tree types', icon: '🌿',
    instruction: 'Select which trees to plant strategically',
    feedback: 'Great choices! Strategic planting maximizes CO₂ absorption.',
    sfx: 'reveal', interactive: 'tree_select',
    teacherLine: 'Different trees absorb different amounts of CO₂. Choose wisely!',
    visualDemo: 'Holographic tree previews appear at planting spots',
  },
  {
    id: 'dig_holes', label: 'Dig planting holes', icon: '⛏️',
    instruction: 'Press E at each spot to dig planting holes',
    feedback: 'Holes dug! Ready for planting.',
    sfx: 'dig',
    teacherLine: 'Each hole needs to be deep enough for the root ball.',
    visualDemo: 'Ground opens at each spot as player digs',
  },
  {
    id: 'plant_tree_1', label: 'Plant Tree 1', icon: '🌱',
    instruction: 'Press E to plant the first tree',
    feedback: 'First tree planted! Watch it take root.',
    sfx: 'plant',
    teacherLine: 'The first tree begins our green transformation!',
    visualDemo: 'Seedling appears and roots spread into soil',
  },
  {
    id: 'plant_tree_2', label: 'Plant Tree 2', icon: '🌱',
    instruction: 'Press E to plant the second tree',
    feedback: 'Second tree in the ground!',
    sfx: 'plant',
    teacherLine: 'More trees means more shade and cooler air.',
    visualDemo: 'Another seedling with growing animation',
  },
  {
    id: 'plant_tree_3', label: 'Plant Tree 3', icon: '🌱',
    instruction: 'Press E to plant the third tree',
    feedback: 'Three trees planted! Setting up care system next.',
    sfx: 'plant',
    teacherLine: 'Three trees will absorb over 100 kg of CO₂ per year!',
    visualDemo: 'Third seedling joins the growing garden',
  },
  {
    id: 'setup_irrigation', label: 'Set up irrigation', icon: '💧',
    instruction: 'Press E to connect drip irrigation lines',
    feedback: 'Drip irrigation connected to all trees!',
    sfx: 'water',
    teacherLine: 'Drip irrigation saves 60% water compared to flooding.',
    visualDemo: 'Irrigation lines visually connect to each tree base',
  },
  {
    id: 'water_trees', label: 'Water the trees', icon: '🚿',
    instruction: 'Press E to water each tree — watch the particles!',
    feedback: 'Trees watered! Growth begins.',
    sfx: 'water',
    teacherLine: 'Young trees need regular watering for the first 2 years.',
    visualDemo: 'Water particles flow from drip lines to roots',
  },
  {
    id: 'observe_growth_y1', label: 'Year 1 — Saplings', icon: '⏩',
    instruction: 'Watch Year 1 growth — saplings take root',
    feedback: 'Year 1: Saplings are established!',
    sfx: 'grow', auto: true, autoDur: 6000,
    teacherLine: 'In the first year, roots spread deep underground.',
    visualDemo: 'Trees grow from seedling to small sapling stage',
  },
  {
    id: 'observe_growth_y5', label: 'Year 5 — Young trees', icon: '⏩',
    instruction: 'Watch Year 5 — canopy forming, birds arriving',
    feedback: 'Year 5: Shade emerging, temperature dropping!',
    sfx: 'grow', auto: true, autoDur: 6000,
    teacherLine: 'By year 5, trees start providing real shade and CO₂ absorption.',
    visualDemo: 'Trees grow larger, canopy forms, birds appear',
  },
  {
    id: 'observe_growth_y10', label: 'Year 10 — Full growth', icon: '⏩',
    instruction: 'Watch Year 10 — full maturity!',
    feedback: 'Year 10: Mature garden with full environmental benefits!',
    sfx: 'grow', auto: true, autoDur: 6000,
    teacherLine: 'A mature tree absorbs 20-50 kg CO₂ every year. Permanently.',
    visualDemo: 'Full mature trees with multi-layer canopy and leaf particles',
  },
  {
    id: 'measure_results', label: 'Measure the impact', icon: '🌡️',
    instruction: 'Press E to read temperature and CO₂ meters',
    feedback: 'Temperature down 3°C! CO₂ absorption: 200 kg/year!',
    sfx: 'reveal',
    teacherLine: 'Trees reduced ambient temperature by 2-4°C and absorb CO₂ daily.',
    visualDemo: 'Thermometer and CO₂ gauge show improvement values',
  },
];

export const TOTAL_TREES_TO_PLANT = 5;

export const GARDEN_SPOTS = [
  { pos: [-8, 0, -6], label: 'Front Left' },
  { pos: [-8, 0, 6], label: 'Front Right' },
  { pos: [8, 0, -6], label: 'Back Left' },
  { pos: [8, 0, 6], label: 'Back Right' },
  { pos: [0, 0, 10], label: 'Side Garden' },
];

export const DEBRIS_POSITIONS = [
  [-6, 0.1, -4], [-3, 0.1, 7], [5, 0.1, -5],
  [7, 0.1, 3], [-5, 0.1, 9], [3, 0.1, -8],
];

// ═══════════════════════════════════════════════════════════
//  PART 2 — SOLAR HOUSE EVOLUTION
// ═══════════════════════════════════════════════════════════

export const ENERGY_SCANNER_DATA = [
  { id: 'ac', name: 'Air Conditioner', icon: '❄️', watts: 1500, co2: 1.07, bill: 2250, category: 'heavy' },
  { id: 'geyser', name: 'Water Heater', icon: '🔥', watts: 2000, co2: 1.42, bill: 3000, category: 'heavy' },
  { id: 'fridge', name: 'Refrigerator', icon: '🧊', watts: 150, co2: 0.11, bill: 225, category: 'medium' },
  { id: 'lights', name: 'All Lights', icon: '💡', watts: 300, co2: 0.21, bill: 450, category: 'medium' },
  { id: 'fan', name: 'Ceiling Fan', icon: '🌀', watts: 70, co2: 0.05, bill: 105, category: 'low' },
  { id: 'tv', name: 'Television', icon: '📺', watts: 100, co2: 0.07, bill: 150, category: 'low' },
];

export const SOLAR_TASKS = [
  {
    id: 'assess_roof', label: 'Assess the roof', icon: '🏠',
    instruction: 'Press E to inspect the roof area for solar potential',
    feedback: 'Roof assessed! Flat surface with excellent sun exposure.',
    sfx: 'whoosh',
    teacherLine: 'A south-facing roof with no shade is ideal for solar panels.',
    visualDemo: 'Camera focuses on rooftop with sun path overlay',
  },
  {
    id: 'energy_scan', label: 'Energy Scanner', icon: '🔍',
    instruction: 'Scan each appliance to see energy consumption',
    feedback: 'Energy map complete! AC & Geyser consume the most.',
    sfx: 'scan', interactive: 'energy_scan',
    teacherLine: 'First, let us find out how much energy this house uses.',
    visualDemo: 'Appliance grid appears — player taps each to reveal consumption',
  },
  {
    id: 'calculate_load', label: 'Calculate total load', icon: '📊',
    instruction: 'See total watts calculated — house needs 4,120W peak',
    feedback: 'Total load: 4,120W peak. A 3 kW system covers 75%!',
    sfx: 'reveal', auto: true, autoDur: 5000,
    teacherLine: 'Knowing your total load helps size the solar system correctly.',
    visualDemo: 'Watts counter animates up to total, then shows system recommendation',
  },
  {
    id: 'choose_panel_type', label: 'Choose panel type', icon: '⚡',
    instruction: 'Select: Monocrystalline (efficient) or Polycrystalline (affordable)',
    feedback: 'Panel type selected! Now let us install the mounting.',
    sfx: 'toggle', interactive: 'panel_select',
    teacherLine: 'Monocrystalline panels are 20% more efficient but cost more.',
    visualDemo: 'Two panel types shown side by side with specs comparison',
  },
  {
    id: 'install_mounting', label: 'Install rail mounts', icon: '🔧',
    instruction: 'Press E to install mounting rails on the roof',
    feedback: 'Rails secured! Panels can now be mounted.',
    sfx: 'panel',
    teacherLine: 'Mounting rails hold the panels at the optimal tilt angle.',
    visualDemo: 'Aluminum rail mounts appear on roof surface',
  },
  {
    id: 'place_panel_1', label: 'Install Panel 1', icon: '🔲',
    instruction: 'Press E to mount the first solar panel',
    feedback: 'Panel 1 secured on the roof!',
    sfx: 'panel',
    teacherLine: 'Each panel generates about 300-400 watts of power.',
    visualDemo: 'Panel slides onto rails with click animation',
  },
  {
    id: 'place_panel_2', label: 'Install Panel 2', icon: '🔲',
    instruction: 'Press E to mount the second panel',
    feedback: 'Panel 2 locked in place!',
    sfx: 'panel',
    teacherLine: 'Panels work together — more panels, more power.',
    visualDemo: 'Second panel mounts beside the first',
  },
  {
    id: 'place_panel_3', label: 'Install Panel 3', icon: '🔲',
    instruction: 'Press E to mount the third panel',
    feedback: 'Panel 3 installed!',
    sfx: 'panel',
    teacherLine: 'Three panels give us about 1 kW of capacity.',
    visualDemo: 'Third panel clicks into place',
  },
  {
    id: 'place_panel_4', label: 'Install Panel 4', icon: '🔲',
    instruction: 'Press E to mount the fourth and final panel',
    feedback: 'All 4 panels installed! Now wire them together.',
    sfx: 'panel',
    teacherLine: 'Four panels complete our 1.2 kW array. Now to connect them.',
    visualDemo: 'Fourth panel mounts — full array visible',
  },
  {
    id: 'wire_panels', label: 'Wire the panels', icon: '🔌',
    instruction: 'Press E to connect panel wiring to the inverter',
    feedback: 'Wiring complete! Energy flow lines visible.',
    sfx: 'toggle',
    teacherLine: 'Panels produce DC power — the inverter converts it to AC.',
    visualDemo: 'Glowing wire lines animate from panels down to inverter',
  },
  {
    id: 'orient', label: 'Orient panels south', icon: '🧭',
    instruction: 'Use ← → arrows to face panels SOUTH',
    feedback: 'Panels aligned! Starting sun simulation.',
    sfx: 'toggle', interactive: 'orient',
    teacherLine: 'In India, south-facing panels get the most sunlight all day.',
    visualDemo: 'Compass HUD with directional arrows',
  },
  {
    id: 'sun_sim', label: 'Sun path simulation', icon: '☀️',
    instruction: 'Watch the full day sun arc — panels generate energy',
    feedback: 'Solar energy flowing into the house!',
    sfx: 'solar', auto: true, autoDur: 8000,
    teacherLine: 'Peak generation happens between 10 AM and 3 PM.',
    visualDemo: 'Animated sun crosses the sky, panels glow with energy output',
  },
  {
    id: 'solar_mode', label: 'Switch to Solar mode', icon: '🔄',
    instruction: 'Press E to toggle the house from Grid to Solar',
    feedback: 'House now runs on solar! Watch the transformation.',
    sfx: 'toggle',
    teacherLine: 'Switching to solar reduces your electricity bill by 70-90%!',
    visualDemo: 'House visuals shift — sky clears, green glow on house',
  },
  {
    id: 'install_battery', label: 'Install battery storage', icon: '🔋',
    instruction: 'Press E to connect the battery storage unit',
    feedback: 'Battery installed! Excess solar energy will be stored.',
    sfx: 'charge',
    teacherLine: 'A 10 kWh battery stores enough for evening and night use.',
    visualDemo: 'Battery unit appears on wall, charge indicator lights up',
  },
  {
    id: 'peak_hour', label: 'Peak hour challenge', icon: '⚡',
    instruction: 'Evening peak! Press E to use battery instead of grid',
    feedback: 'Battery powers the home during peak hours! ₹3,000/mo saved!',
    sfx: 'charge',
    teacherLine: 'Peak hour grid rates are ₹12/unit. Battery power is free!',
    visualDemo: 'Sky darkens to evening, battery discharges to power house',
  },
];

export const PANEL_ORIENTATIONS = [
  { label: 'North', angle: 0, efficiency: 0.3, icon: '⬆️' },
  { label: 'East', angle: 90, efficiency: 0.6, icon: '➡️' },
  { label: 'South', angle: 180, efficiency: 1.0, icon: '⬇️', correct: true },
  { label: 'West', angle: 270, efficiency: 0.6, icon: '⬅️' },
];

export const GRID_VS_SOLAR = {
  grid:  { co2: '4.2 tons/yr', bill: '₹8,400/mo', pollution: 'High', source: 'Coal Power Plant' },
  solar: { co2: '0.2 tons/yr', bill: '₹1,200/mo', pollution: 'Near Zero', source: 'Rooftop Panels' },
};

export const TIME_OF_DAY = [
  { id: 'morning',   label: '6 AM',  sunAngle: 0.15, solarOutput: 40,  description: 'Sun rising' },
  { id: 'noon',      label: '12 PM', sunAngle: 0.50, solarOutput: 100, description: 'Peak sunlight' },
  { id: 'afternoon', label: '3 PM',  sunAngle: 0.70, solarOutput: 75,  description: 'Good output' },
  { id: 'evening',   label: '6 PM',  sunAngle: 0.90, solarOutput: 15,  description: 'Battery kicks in' },
  { id: 'night',     label: '9 PM',  sunAngle: 1.00, solarOutput: 0,   description: 'Wind support' },
];

// ═══════════════════════════════════════════════════════════
//  PART 3 — WIND SUPPORT SYSTEM (TURBINES OUTSIDE)
// ═══════════════════════════════════════════════════════════

// Wind turbines placed in the open field OUTSIDE the house
// (visible from drone view established in Level 1)
export const WIND_TURBINE_POSITIONS = [
  { pos: [-20, 0, -18], label: 'Field Turbine A' },
  { pos: [22, 0, -20],  label: 'Field Turbine B' },
  { pos: [-22, 0, 18],  label: 'Field Turbine C' },
];

export const WIND_TASKS = [
  {
    id: 'field_survey', label: 'Survey the open field', icon: '🌍',
    instruction: 'Press E to survey different field locations for wind',
    feedback: 'Open fields are perfect for wind turbines!',
    sfx: 'whoosh',
    teacherLine: 'Wind turbines need open space with no obstructions.',
    visualDemo: 'Camera sweeps across open fields around the house',
  },
  {
    id: 'wind_analysis', label: 'Analyze wind speeds', icon: '📊',
    instruction: 'Press E to read wind speed at different heights',
    feedback: 'Wind is strongest at 8-10m height. Good location found!',
    sfx: 'scan',
    teacherLine: 'Wind speed increases with height — taller towers catch more wind.',
    visualDemo: 'Wind speed indicators at different heights show readings',
  },
  {
    id: 'choose_turbine', label: 'Choose turbine type', icon: '⚙️',
    instruction: 'Select the turbine type for this field',
    feedback: 'Horizontal axis turbine selected — best for consistent wind.',
    sfx: 'toggle', interactive: 'turbine_select',
    teacherLine: 'Horizontal axis turbines are the most efficient for open fields.',
    visualDemo: 'Two turbine types shown with efficiency specs',
  },
  {
    id: 'prepare_foundation', label: 'Prepare foundation', icon: '🏗️',
    instruction: 'Press E to pour the concrete foundation pad',
    feedback: 'Foundation poured! Solid base for the turbine.',
    sfx: 'dig',
    teacherLine: 'A strong foundation keeps the turbine stable in storms.',
    visualDemo: 'Octagonal concrete pad appears at first turbine position',
  },
  {
    id: 'install_turbine_1', label: 'Erect Turbine A', icon: '🔧',
    instruction: 'Press E to erect the first wind turbine',
    feedback: 'Turbine A erected in the field!',
    sfx: 'turbine',
    teacherLine: 'The first turbine rises! Watch the tower and blades assemble.',
    visualDemo: 'Turbine tower rises, nacelle attaches, blades unfold',
  },
  {
    id: 'install_turbine_2', label: 'Erect Turbine B', icon: '🔧',
    instruction: 'Press E to install the second turbine',
    feedback: 'Turbine B is up! Blades starting to spin.',
    sfx: 'turbine',
    teacherLine: 'Spacing turbines apart avoids wind shadow interference.',
    visualDemo: 'Second turbine assembles at different field position',
  },
  {
    id: 'install_turbine_3', label: 'Erect Turbine C', icon: '🔧',
    instruction: 'Press E to install the third turbine',
    feedback: 'All 3 field turbines installed!',
    sfx: 'turbine',
    teacherLine: 'Three turbines give us redundancy — if one stops, others continue.',
    visualDemo: 'Third turbine completes the field array',
  },
  {
    id: 'connect_grid', label: 'Connect to house', icon: '🔌',
    instruction: 'Press E to wire turbines to the house power system',
    feedback: 'Power cables connected! Wind energy flowing to house.',
    sfx: 'toggle',
    teacherLine: 'Underground cables carry wind power safely to the house.',
    visualDemo: 'Glowing power lines animate from turbine bases to house',
  },
  {
    id: 'wind_test', label: 'Wind speed test', icon: '🌀',
    instruction: 'Watch blades spin at different wind speeds',
    feedback: 'Blades respond to wind speed in real time!',
    sfx: 'wind', auto: true, autoDur: 6000,
    teacherLine: 'Turbines need at least 4 m/s wind to generate useful power.',
    visualDemo: 'Wind speed cycles through calm to strong, blades respond',
  },
  {
    id: 'weather_scenarios', label: 'Weather scenarios', icon: '🌤️',
    instruction: 'Press E to toggle through Clear / Cloudy / Night / Storm',
    feedback: 'You see how solar and wind complement each other!',
    sfx: 'toggle', interactive: 'weather',
    teacherLine: 'This is why we need BOTH solar and wind — they cover each other.',
    visualDemo: 'Sky changes color for each weather, output bars update',
  },
  {
    id: 'combined_solar_wind', label: 'Combined output', icon: '📊',
    instruction: 'See combined solar + wind output across all conditions',
    feedback: 'Together they provide near-constant renewable power!',
    sfx: 'reveal', auto: true, autoDur: 6000,
    teacherLine: 'Solar + Wind + Battery = reliable 24/7 clean energy.',
    visualDemo: 'Combined output graph shows how gaps are filled',
  },
  {
    id: 'night_mode', label: 'Night mode demo', icon: '🌙',
    instruction: 'Watch: solar off, wind takes over at night',
    feedback: 'Wind turbines provide 30% power at night!',
    sfx: 'wind', auto: true, autoDur: 6000,
    teacherLine: 'At night, wind and battery keep the lights on.',
    visualDemo: 'Sky goes dark, solar output zeroes, wind turbines speed up',
  },
  {
    id: 'storm_mode', label: 'Storm mode demo', icon: '⛈️',
    instruction: 'Watch: storm — solar down, wind surges!',
    feedback: 'During storms, wind compensates for weak solar!',
    sfx: 'storm', auto: true, autoDur: 6000,
    teacherLine: 'Storms are wind energy\'s best moment — maximum output!',
    visualDemo: 'Dark storm clouds, rain particles, turbines spin fast',
  },
];

export const WIND_SPEED_SEQUENCE = [
  { speed: 2, label: 'Calm', duration: 2500 },
  { speed: 5, label: 'Light Breeze', duration: 2500 },
  { speed: 3, label: 'Dropping…', duration: 2000 },
  { speed: 8, label: 'Strong Wind!', duration: 2500 },
  { speed: 12, label: 'Storm!', duration: 2000 },
  { speed: 4, label: 'Dying Down…', duration: 2500 },
  { speed: 1, label: 'Almost Still', duration: 2000 },
  { speed: 7, label: 'Good Wind', duration: 2500 },
];

export const WEATHER_STATES = [
  { id: 'clear', label: 'Clear Sky', solarEff: 1.0, windEff: 0.3, icon: '☀️' },
  { id: 'cloudy', label: 'Cloudy', solarEff: 0.4, windEff: 0.6, icon: '☁️' },
  { id: 'storm', label: 'Storm', solarEff: 0.1, windEff: 1.0, icon: '⛈️' },
  { id: 'night', label: 'Night', solarEff: 0.0, windEff: 0.5, icon: '🌙' },
];

// ═══════════════════════════════════════════════════════════
//  DATA POPUPS (after each segment)
// ═══════════════════════════════════════════════════════════

export const DATA_POPUPS = {
  trees: {
    title: 'Tree Impact Report', icon: '🌳',
    facts: [
      'Your trees will absorb ~200 kg CO₂ per year combined',
      'Shade from trees reduces AC need by 15–25%',
      'Trees take 5–20 years for peak absorption',
      'Best species: Neem (48 kg/yr), Mango (35 kg/yr)',
      'Trees also reduce ambient temperature by 2–4°C',
    ],
    conclusion: '🌿 Trees are a slow but essential long-term solution',
  },
  solar: {
    title: 'Solar Impact Report', icon: '☀️',
    facts: [
      'Your 3 kW system reduces ~3–5 tons CO₂ per year — immediately!',
      'Monthly bill drops from ₹8,400 to ₹1,200',
      'Panels last 25+ years with minimal maintenance',
      'Government subsidy: up to ₹78,000 available',
      'Battery storage enables peak-hour independence',
    ],
    conclusion: '☀️ Solar gives the fastest, most practical CO₂ reduction for homes',
  },
  wind: {
    title: 'Wind Support Report', icon: '🌬️',
    facts: [
      'Field turbines provide backup during low-solar periods',
      'Wind + Solar + Battery = near 24/7 clean power',
      'Wind alone is unreliable — needs consistent 4+ m/s',
      'Best as supplement, not primary home source',
      'Open fields nearby are ideal turbine locations',
    ],
    conclusion: '🌬️ Wind works best as a support to solar energy',
  },
};

// ═══════════════════════════════════════════════════════════
//  COMPARISON & REALIZATION
// ═══════════════════════════════════════════════════════════

export const COMPARISON_DATA = [
  {
    id: 'solar', label: 'Solar Energy', icon: '☀️', color: '#f59e0b',
    reductionPercent: 90, speed: 'Immediate', co2PerYear: '~3–5 tons',
    cost: '₹1.5–3 lakh (subsidy available)', timeToEffect: 'Day 1',
    bestFor: 'Any home with a rooftop', barWidth: 90,
  },
  {
    id: 'wind', label: 'Wind Support', icon: '🌬️', color: '#3b82f6',
    reductionPercent: 30, speed: 'When windy', co2PerYear: '~1–2 tons',
    cost: '₹1–5 lakh', timeToEffect: 'Variable',
    bestFor: 'Backup for solar', barWidth: 30,
  },
  {
    id: 'trees', label: 'Tree Planting', icon: '🌳', color: '#22c55e',
    reductionPercent: 15, speed: '5–20 years', co2PerYear: '~0.2–0.5 tons',
    cost: 'Very Low', timeToEffect: '10–20 years',
    bestFor: 'Cooling + long-term', barWidth: 15,
  },
];

export const HOUSE_TRANSFORMATION = {
  before: ['Polluted surroundings', 'High electricity bill ₹8,400/mo', 'Overheated rooms', 'Dark smoky sky', 'Dry barren garden'],
  after:  ['Green lush garden', 'Bill reduced to ₹1,200/mo', 'Trees shade the house', 'Clean blue sky', 'Solar roof glowing', 'Wind turbines in the field'],
};

export const REALIZATION_LINES = [
  { speaker: 'narration', text: 'Look at what we\'ve achieved together…' },
  { speaker: 'narration', text: 'The barren land is now a green garden. Trees absorb CO₂ slowly but surely.' },
  { speaker: 'narration', text: 'The rooftop solar panels power the entire house — clean, free energy.' },
  { speaker: 'narration', text: 'Wind turbines in the field support during night and storms.' },
  { speaker: 'teacher', text: '"Trees help slowly…"' },
  { speaker: 'teacher', text: '"Wind supports when possible…"' },
  { speaker: 'teacher', text: '"But solar energy can transform EVERY home."' },
  { speaker: 'teacher', text: '"The best strategy? Combine all three."' },
];

export const TRANSITION_LINE = 'LEVEL 4 — SOLAR REVOLUTION';

// ═══════════════════════════════════════════════════════════
//  QUIZ
// ═══════════════════════════════════════════════════════════

export const PHASE2_QUIZ = [
  {
    question: 'Which tree has the highest CO₂ absorption per year?',
    options: ['Decorative Plant (~5 kg)', 'Banyan (~22 kg)', 'Neem (~48 kg)', 'Mango (~35 kg)'],
    correctIndex: 2,
    explanation: 'Neem trees absorb approximately 48 kg of CO₂ per year — the highest among common Indian trees.',
  },
  {
    question: 'Which direction should solar panels face in India?',
    options: ['North', 'East', 'South', 'West'],
    correctIndex: 2,
    explanation: 'In the Northern Hemisphere (India), panels face South for maximum sunlight throughout the day.',
  },
  {
    question: 'How much can a 3 kW solar system reduce CO₂ per year?',
    options: ['~50 kg', '~500 kg', '~1 ton', '~3–5 tons'],
    correctIndex: 3,
    explanation: 'A 3 kW rooftop solar system reduces approximately 3–5 tons of CO₂ per year.',
  },
  {
    question: 'When does wind energy support solar the most?',
    options: ['At noon', 'At night and during storms', 'In summer only', 'Never'],
    correctIndex: 1,
    explanation: 'Wind supports solar at night (no sun) and during storms (clouds block sun, but wind is strong).',
  },
  {
    question: 'Which gives the FASTEST CO₂ reduction for a home?',
    options: ['Planting 100 trees', 'Rooftop solar panels', 'Small wind turbine', 'Using less electricity'],
    correctIndex: 1,
    explanation: 'Solar panels provide IMMEDIATE CO₂ reduction from Day 1.',
  },
  {
    question: 'Where are wind turbines best placed near a home?',
    options: ['On the rooftop', 'Inside the garden', 'In open fields nearby', 'Underground'],
    correctIndex: 2,
    explanation: 'Wind turbines need open, unobstructed space for consistent wind flow — open fields are ideal.',
  },
];

// ─── BADGE & SCORING ───
export const PHASE2_BADGE = {
  icon: '🏡',
  name: 'Sustainability Pioneer',
  description: 'You transformed a polluted home into a sustainable living space!',
  coins: 80,
};

export function calculateP2Stars(segmentsCompleted, totalSegments, quizScore, totalQuestions) {
  let s = 0;
  if (segmentsCompleted >= totalSegments) s++;
  if (quizScore >= Math.ceil(totalQuestions * 0.6)) s++;
  if (quizScore >= totalQuestions - 1) s++;
  return s;
}

// ─── CO₂ METER LEVELS ───
export const CO2_REDUCTION_LEVELS = {
  initial: 100,
  afterTrees: 75,
  afterSolar: 20,
  afterWind: 10,
  target: 10,
};

// ═══════════════════════════════════════════════════════════
//  ENHANCED DATA — ENVIRONMENTAL HOTSPOTS (Task 1)
// ═══════════════════════════════════════════════════════════
export const ENV_HOTSPOTS = [
  { id: 'dry_land', label: 'Dry Cracked Land', icon: '🏜️', pos: [-6, 0.5, 5],
    detail: 'No shade → more heat absorption → ground temperature 55°C',
    impact: 'Temperature +8°C without tree cover' },
  { id: 'dead_plants', label: 'Dead Plants', icon: '🥀', pos: [6, 0.5, -4],
    detail: 'No water, no care → vegetation died → no CO₂ absorption',
    impact: 'Lost 15 kg/year CO₂ absorption capacity' },
  { id: 'hot_wall', label: 'Overheated Wall', icon: '🔥', pos: [4.5, 2, 3],
    detail: 'Direct sunlight heats walls → indoor temperature rises → more AC needed',
    impact: 'Wall temperature 65°C without shade' },
  { id: 'poor_airflow', label: 'Stagnant Air', icon: '💨', pos: [-5, 3, -3],
    detail: 'No trees → no wind channeling → poor natural ventilation',
    impact: 'Indoor airflow reduced by 40%' },
];

// ═══════════════════════════════════════════════════════════
//  TREE ANALYSIS HOLOGRAMS (Task 2)
// ═══════════════════════════════════════════════════════════
export const TREE_ANALYSIS = [
  { id: 'neem', name: 'Neem Tree', icon: '🌿', color: '#166534',
    futureSize: '15-20m tall', shadowRadius: '8m',
    coolingImpact: '-3°C nearby', co2Absorption: '48 kg/year',
    airflow: '+35% improvement', rating: 5,
    verdict: 'Best for household environmental support' },
  { id: 'banyan', name: 'Banyan Tree', icon: '🌳', color: '#15803d',
    futureSize: '20-30m tall', shadowRadius: '15m',
    coolingImpact: '-5°C nearby', co2Absorption: '22 kg/year',
    airflow: '+50% improvement', rating: 4,
    verdict: 'Massive shade coverage, slow growth' },
  { id: 'mango', name: 'Mango Tree', icon: '🥭', color: '#047857',
    futureSize: '10-15m tall', shadowRadius: '6m',
    coolingImpact: '-2°C nearby', co2Absorption: '35 kg/year',
    airflow: '+25% improvement', rating: 4,
    verdict: 'Good CO₂ absorption + provides fruit' },
  { id: 'decorative', name: 'Decorative Plant', icon: '🌸', color: '#65a30d',
    futureSize: '1-2m tall', shadowRadius: '0.5m',
    coolingImpact: '-0.5°C nearby', co2Absorption: '5 kg/year',
    airflow: '+5% improvement', rating: 2,
    verdict: 'Adds beauty only — low environmental impact' },
];

// ═══════════════════════════════════════════════════════════
//  TREE GROWTH TIMELINE (Time Progression Cinematic)
// ═══════════════════════════════════════════════════════════
export const GROWTH_TIMELINE = [
  { year: 1, label: 'Year 1', treeSize: 0.3, grassLevel: 0.15,
    skyClarity: 0.1, description: 'Saplings planted, roots taking hold' },
  { year: 3, label: 'Year 3', treeSize: 0.6, grassLevel: 0.4,
    skyClarity: 0.3, description: 'Trees growing, shade emerging' },
  { year: 5, label: 'Year 5', treeSize: 1.0, grassLevel: 0.7,
    skyClarity: 0.6, description: 'Full canopy, birds arriving, grass spreading' },
  { year: 10, label: 'Year 10', treeSize: 1.0, grassLevel: 1.0,
    skyClarity: 0.8, description: 'Mature garden, full shade, cooler environment' },
];

// ═══════════════════════════════════════════════════════════
//  TREE PLACEMENT EFFECTS
// ═══════════════════════════════════════════════════════════
export const TREE_PLACEMENT_EFFECTS = {
  'near_window': { label: 'Near Windows', effect: 'Cool airflow improves by 30%', icon: '🪟' },
  'near_wall': { label: 'Near Walls', effect: 'Wall heating reduces by 40%', icon: '🧱' },
  'front_garden': { label: 'Front Garden', effect: 'Direct sunlight blocked, shade coverage', icon: '🌤️' },
  'side_garden': { label: 'Side Garden', effect: 'Cross-ventilation improves naturally', icon: '💨' },
};

// ═══════════════════════════════════════════════════════════
//  ENERGY SCANNER APPLIANCE DATA (Enhanced)
// ═══════════════════════════════════════════════════════════
export const SCANNER_APPLIANCES = [
  { id: 'ac', name: 'Air Conditioner', icon: '❄️', watts: 1500,
    co2Daily: '1.07 kg', billMonthly: '₹2,250', heatSignature: 0.9,
    category: 'heavy', wireColor: '#ef4444', scanReveal: 'Highest energy consumer! Uses 1.5 kW continuously.' },
  { id: 'geyser', name: 'Water Heater', icon: '🔥', watts: 2000,
    co2Daily: '1.42 kg', billMonthly: '₹3,000', heatSignature: 1.0,
    category: 'heavy', wireColor: '#f97316', scanReveal: 'Consumes 2000W — the silent bill killer!' },
  { id: 'fridge', name: 'Refrigerator', icon: '🧊', watts: 150,
    co2Daily: '0.11 kg', billMonthly: '₹225', heatSignature: 0.3,
    category: 'medium', wireColor: '#fbbf24', scanReveal: 'Runs 24/7 but efficient. 150W average.' },
  { id: 'lights', name: 'All Lights', icon: '💡', watts: 300,
    co2Daily: '0.21 kg', billMonthly: '₹450', heatSignature: 0.4,
    category: 'medium', wireColor: '#fbbf24', scanReveal: 'LED lights save 80% vs incandescent.' },
  { id: 'fan', name: 'Ceiling Fan', icon: '🌀', watts: 70,
    co2Daily: '0.05 kg', billMonthly: '₹105', heatSignature: 0.1,
    category: 'low', wireColor: '#22c55e', scanReveal: 'Most efficient cooling! Only 70W.' },
  { id: 'tv', name: 'Television', icon: '📺', watts: 100,
    co2Daily: '0.07 kg', billMonthly: '₹150', heatSignature: 0.2,
    category: 'low', wireColor: '#22c55e', scanReveal: 'Moderate usage. Consider standby power.' },
];

// ═══════════════════════════════════════════════════════════
//  SOLAR vs GRID LIVE COMPARISON
// ═══════════════════════════════════════════════════════════
export const LIVE_COMPARISON = {
  grid: {
    label: 'Grid Power', icon: '🏭', color: '#ef4444',
    co2: '4.2 tons/year', bill: '₹8,400/month', pollution: 'High',
    source: 'Coal Power Plant', skyColor: '#8a6040',
  },
  solar: {
    label: 'Solar Power', icon: '☀️', color: '#f59e0b',
    co2: '0.2 tons/year', bill: '₹1,200/month', pollution: 'Near Zero',
    source: 'Rooftop Panels', skyColor: '#87CEEB',
  },
};

// ═══════════════════════════════════════════════════════════
//  BATTERY SYSTEM DATA
// ═══════════════════════════════════════════════════════════
export const BATTERY_DATA = {
  capacity: '10 kWh',
  chargeRate: 'Charges during peak sun (10 AM - 3 PM)',
  dischargeTime: 'Powers home 6 PM - 10 PM',
  savings: 'Eliminates ₹3,000/month peak charges',
  peakHours: { start: '6 PM', end: '10 PM', gridRate: '₹12/unit', solarRate: '₹0/unit' },
};

// ═══════════════════════════════════════════════════════════
//  WEATHER REACTION SYSTEM (Wind segment)
// ═══════════════════════════════════════════════════════════
export const WEATHER_SCENARIOS = [
  { id: 'clear_day', label: 'Clear Day ☀️', icon: '☀️',
    solarOutput: 95, windOutput: 25, batteryAction: 'Charging',
    skyColor: '#87CEEB', description: 'Solar strong, wind minimal',
    learning: 'Solar handles most power during clear days.' },
  { id: 'cloudy', label: 'Cloudy Weather ☁️', icon: '☁️',
    solarOutput: 35, windOutput: 65, batteryAction: 'Supporting',
    skyColor: '#9ca3af', description: 'Solar weak, wind stronger',
    learning: 'Wind compensates when clouds block sunlight.' },
  { id: 'night', label: 'Night Time 🌙', icon: '🌙',
    solarOutput: 0, windOutput: 50, batteryAction: 'Discharging',
    skyColor: '#1e1b4b', description: 'Solar inactive, wind continues',
    learning: 'Battery + wind keeps the home powered at night.' },
  { id: 'storm', label: 'Storm ⛈️', icon: '⛈️',
    solarOutput: 5, windOutput: 90, batteryAction: 'Wind dominant',
    skyColor: '#374151', description: 'Solar near zero, wind surges',
    learning: 'Storms are wind energy\'s best moment!' },
];

// ═══════════════════════════════════════════════════════════
//  FINAL HOUSE TRANSFORMATION CINEMATIC
// ═══════════════════════════════════════════════════════════
export const TRANSFORMATION_BEFORE = [
  { label: 'Polluted surroundings', icon: '🏭', color: '#ef4444' },
  { label: 'High CO₂ emissions', icon: '💨', color: '#f97316' },
  { label: 'Electricity bill ₹8,400/mo', icon: '💸', color: '#f59e0b' },
  { label: 'Overheated rooms', icon: '🌡️', color: '#ef4444' },
  { label: 'Dry barren environment', icon: '🏜️', color: '#92400e' },
  { label: '100% grid dependent', icon: '⚡', color: '#dc2626' },
];

export const TRANSFORMATION_AFTER = [
  { label: 'Green lush surroundings', icon: '🌳', color: '#22c55e' },
  { label: 'CO₂ reduced by 90%', icon: '🌿', color: '#16a34a' },
  { label: 'Bill reduced to ₹1,200/mo', icon: '💰', color: '#059669' },
  { label: 'Cooler comfortable home', icon: '❄️', color: '#06b6d4' },
  { label: 'Trees, birds, clean air', icon: '🐦', color: '#22d3ee' },
  { label: '90% renewable energy', icon: '♻️', color: '#10b981' },
];

// ═══════════════════════════════════════════════════════════
//  ENHANCED REALIZATION / TEACHER FINAL SCENE
// ═══════════════════════════════════════════════════════════
export const FINAL_TEACHER_DIALOGUE = [
  { speaker: 'narration', text: 'The family stands outside their transformed home…' },
  { speaker: 'narration', text: 'Green trees sway gently. Solar panels glow on the roof. Wind turbines spin in the distance.' },
  { speaker: 'teacher', text: '"Trees improve the environment slowly."' },
  { speaker: 'teacher', text: '"Wind energy supports renewable systems."' },
  { speaker: 'teacher', text: '"But for homes…"' },
  { speaker: 'teacher', text: '"Solar energy gives the fastest and most practical solution."' },
  { speaker: 'narration', text: 'The camera slowly zooms toward the solar panels. Golden sunlight reflects strongly.' },
  { speaker: 'teacher', text: '"In the next level, you will learn how to fully power your home using solar energy."' },
];

export const LEVEL4_TRANSITION_TEXT = 'LEVEL 4 — SOLAR REVOLUTION';

// ═══════════════════════════════════════════════════════════
//  LEARNING OUTCOMES SUMMARY
// ═══════════════════════════════════════════════════════════
export const LEARNING_OUTCOMES = [
  { icon: '🌳', title: 'Trees', points: ['Absorb CO₂ slowly (5-20 years)', 'Reduce heat by 2-4°C', 'Improve airflow naturally'] },
  { icon: '☀️', title: 'Solar', points: ['Immediate household benefits', 'Reduces bill by 70-90%', 'Cuts CO₂ by 3-5 tons/year'] },
  { icon: '🌬️', title: 'Wind', points: ['Supports solar at night/storms', 'Best in open fields', 'Backup renewable source'] },
  { icon: '♻️', title: 'Combined', points: ['Reduces pollution', 'Reduces electricity bill', 'Reduces environmental damage'] },
];
