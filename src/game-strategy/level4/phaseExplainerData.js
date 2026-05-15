// All explainer content for Level 4 phases — student-friendly language
// Each topic has 3 steps with title, desc, fact, optional quiz, and SVG id

export const EXPLAINER_TOPICS = {
  // ═══ PHASE 1: How Solar Systems Work ═══
  panel_basics: {
    name: 'Solar Panel Basics', color: '#fbbf24', steps: [
      { title: 'What is a Solar Panel?', svg: 'panel_sun',
        desc: 'A solar panel is made of special material called silicon. When sunlight hits it, the silicon creates electricity! Think of it like a magic sheet that turns sunshine into power.',
        fact: 'One solar panel can power 5 LED bulbs for 6 hours every day!' },
      { title: 'How Does It Make Electricity?', svg: 'panel_cells',
        desc: 'Inside each panel are tiny squares called "cells". When sunlight (photons) hits these cells, tiny particles called electrons start moving — and moving electrons = electricity!',
        fact: 'A single panel has 60-72 cells, each one working like a tiny battery powered by sunlight.',
        quiz: { q: 'What material are solar panels made of?', opts: ['Plastic', 'Silicon', 'Glass'], ans: 1 }},
      { title: 'Types of Solar Panels', svg: 'panel_types',
        desc: 'Monocrystalline (dark black): Best quality, makes the most electricity (20-22%). Polycrystalline (blue speckled): Cheaper but still good (15-17%). Both last 25-30 years!',
        fact: 'Solar panels lose only 0.5% power per year. After 25 years, they still give 87% of original power!' },
    ]},
  inverter_learn: {
    name: 'The Inverter', color: '#a78bfa', steps: [
      { title: 'What Does an Inverter Do?', svg: 'inverter_convert',
        desc: 'Solar panels make DC electricity (like a battery). But your home uses AC electricity (like from the plug point). The inverter changes DC into AC so your appliances can work!',
        fact: 'DC = Direct Current (flows one way, like water in a pipe). AC = Alternating Current (switches back and forth 50 times per second!).' },
      { title: 'Why is it Called the "Brain"?', svg: 'inverter_brain',
        desc: 'The inverter is smart! It tracks the sun and adjusts power to get the MAXIMUM electricity from your panels. It also protects your home if something goes wrong.',
        fact: 'Modern inverters waste only 2-3% of power. That means 97% of solar energy reaches your home!',
        quiz: { q: 'What does an inverter convert?', opts: ['AC to DC', 'DC to AC', 'Heat to light'], ans: 1 }},
      { title: 'Types of Inverters', svg: 'inverter_types',
        desc: 'String Inverter (Rs.25,000-50,000): One box for all panels — simple and cheap. Micro-inverter (Rs.8,000 each): One per panel — best if panels get shade. Hybrid (Rs.60,000-1L): Works with battery too!',
        fact: 'A hybrid inverter lets you store solar power in a battery for nighttime — no more power cuts!' },
    ]},
  net_meter: {
    name: 'Net Meter', color: '#22c55e', steps: [
      { title: 'What is a Net Meter?', svg: 'meter_spin',
        desc: 'A net meter is a special electricity meter that can count BOTH ways. When you USE electricity from the grid, it counts UP. When your solar panels SEND extra electricity back, it counts DOWN!',
        fact: 'Your meter literally runs backward when you export solar power — you EARN credits on your bill!' },
      { title: 'How Do You Save Money?', svg: 'meter_savings',
        desc: 'During the day, your panels make more power than you need. The extra goes to the grid and you get credits. At night, you use grid power but your credits reduce the bill. Result: almost FREE electricity!',
        fact: 'With PM Surya Ghar, you can get up to 300 units FREE every month. That saves Rs.2,000-3,000!',
        quiz: { q: 'What happens when your solar panels make extra electricity?', opts: ['It is wasted', 'It goes to the grid and you get credits', 'The panels stop working'], ans: 1 }},
      { title: 'Your Bill Before vs After', svg: 'meter_bill',
        desc: 'Before solar: You pay for ALL electricity from the grid (Rs.3,000-4,000/month). After solar: You only pay for nighttime usage minus your credits (Rs.200-400/month). Save Rs.40,000+ per year!',
        fact: 'Some families with big solar systems actually get NEGATIVE bills — the electricity company pays THEM!' },
    ]},
  system_types: {
    name: 'Solar System Types', color: '#60a5fa', steps: [
      { title: 'On-Grid System', svg: 'sys_ongrid',
        desc: 'Connected to the electricity grid. Cheapest option (Rs.3-4 Lakh for 5kW). Your solar power goes to the grid and you get credits. But when there is a power cut, this system also stops (for safety).',
        fact: 'On-grid is the most popular choice in India because it is the cheapest and gives the best savings.' },
      { title: 'Off-Grid System', svg: 'sys_offgrid',
        desc: 'Completely independent — no connection to the grid! Uses batteries to store power for night. Costs 40-60% more because of batteries. Perfect for remote areas with no grid power.',
        fact: 'Off-grid systems are used in villages, farms, and mountain areas where grid power does not reach.',
        quiz: { q: 'Which system is the cheapest?', opts: ['On-Grid', 'Off-Grid', 'Hybrid'], ans: 0 }},
      { title: 'Hybrid System (Best!)', svg: 'sys_hybrid',
        desc: 'The BEST of both! Connected to grid AND has batteries. Works during power cuts too. Costs more but gives you 24/7 electricity. You can use solar during the day, battery at night, and grid as backup.',
        fact: 'A hybrid system with 5kW panels + 10kWh battery can make your home almost 100% energy independent!' },
    ]},

  // ═══ PHASE 5: Smart Energy ═══
  load_shifting: {
    name: 'Load Shifting', color: '#f59e0b', steps: [
      { title: 'What is Load Shifting?', svg: 'load_clock',
        desc: 'Load shifting means using your heavy appliances (washing machine, geyser, iron) during DAYTIME (10 AM - 3 PM) when solar panels are making FREE electricity, instead of at night when you pay for grid power.',
        fact: 'Just by changing WHEN you use appliances, you can save Rs.1,500-2,000 every month without buying anything new!' },
      { title: 'Best Times for Each Appliance', svg: 'load_schedule',
        desc: 'Washing Machine at 2 PM = FREE (vs Rs.4 at 7 PM). Geyser at 11 AM = FREE (vs Rs.24 at 7 AM). Iron at noon = FREE (vs Rs.8 at evening). EV charging at noon = FREE (vs Rs.26 at night).',
        fact: 'Think of it this way: the sun is paying your electricity bill during the day, so use as much as possible then!',
        quiz: { q: 'When is the best time to run your washing machine with solar?', opts: ['6 AM', '12 PM (noon)', '9 PM'], ans: 1 }},
      { title: 'Monthly Savings', svg: 'load_savings',
        desc: 'By shifting just 3 appliances to daytime, you save Rs.1,500-2,000/month. That is Rs.18,000-24,000 per year! Combined with net metering, your bill can drop from Rs.3,500 to under Rs.200.',
        fact: 'Smart families plan their whole day around solar: cooking, washing, ironing, and charging all happen when the sun shines!' },
    ]},
  smart_sensors: {
    name: 'Smart Sensors', color: '#8b5cf6', steps: [
      { title: 'What are Smart Sensors?', svg: 'sensor_motion',
        desc: 'Smart sensors are tiny devices that automatically control your appliances. A motion sensor turns OFF lights when no one is in the room. A temperature sensor keeps your AC at the perfect setting.',
        fact: 'A simple motion sensor costs only Rs.500 and can save Rs.200-300/month by turning off lights in empty rooms!' },
      { title: 'Types of Smart Sensors', svg: 'sensor_types',
        desc: 'PIR Sensor (Rs.500/room): Detects if someone is in the room and turns lights ON/OFF automatically. Smart Thermostat (Rs.3,000): Keeps AC at 24°C automatically — every 1°C lower wastes 6% more electricity!',
        fact: 'Setting AC at 24°C instead of 20°C saves 24% electricity. That is Rs.500-800 less per month!',
        quiz: { q: 'How much electricity does each 1°C lower AC setting waste?', opts: ['2%', '6%', '10%'], ans: 1 }},
      { title: 'Smart Home Energy Savings', svg: 'sensor_savings',
        desc: 'With smart sensors, your home automatically saves energy without you doing anything! Lights turn off when you leave. AC adjusts to save power. You get alerts on your phone if something wastes electricity.',
        fact: 'A fully smart solar home can cut electricity usage by 30-40% — that means even more power to sell back to the grid!' },
    ]},
  star_rating: {
    name: 'BEE Star Ratings', color: '#fbbf24', steps: [
      { title: 'What are Star Ratings?', svg: 'star_label',
        desc: 'BEE (Bureau of Energy Efficiency) gives 1 to 5 stars to appliances. More stars = less electricity used = lower bill! Always look for the star label before buying any appliance.',
        fact: 'BEE star ratings are like report cards for appliances. 5 stars = best student, 1 star = needs improvement!' },
      { title: '1-Star vs 5-Star: The Difference', svg: 'star_compare',
        desc: 'AC (1.5 Ton): 1-star uses 1800 units/year, 5-star uses only 1000 units/year — saves Rs.6,400/year! Fan: Old fan 75W, 5-star BLDC fan only 30W — saves 60% electricity!',
        fact: 'Replacing ALL appliances with 5-star rated ones can save Rs.15,000 per year. In 25 years that is Rs.3.75 Lakh!',
        quiz: { q: 'A 5-star AC uses how much less electricity than 1-star?', opts: ['10% less', '25% less', '45% less'], ans: 2 }},
      { title: 'How to Check Before Buying', svg: 'star_howto',
        desc: 'Every appliance has a BEE label sticker. Look for: Number of stars (5 is best), yearly electricity units used, and estimated yearly cost. Compare these numbers before you buy. Always choose 5 stars!',
        fact: 'The government website (beestarlabel.com) lets you compare star ratings of all brands online before you buy!' },
    ]},
  ev_solar: {
    name: 'EV + Solar Power', color: '#22c55e', steps: [
      { title: 'What is an EV Charger?', svg: 'ev_charger',
        desc: 'An EV (Electric Vehicle) charger plugs into your car like a phone charger. Instead of filling petrol, you charge the battery with electricity. With solar panels, this electricity is completely FREE!',
        fact: 'An electric car like Tata Nexon EV can go 312 km on a single charge. That is like Chennai to Bangalore!' },
      { title: 'Cost Per Kilometer', svg: 'ev_cost',
        desc: 'Petrol car: Rs.5.50 per km. EV charged from grid: Rs.0.80 per km (85% cheaper!). EV charged from SOLAR: Rs.0 per km (completely FREE!). A family driving 15,000 km/year saves Rs.82,500!',
        fact: 'Solar + EV means FREE driving forever. No petrol pump visits, no rising fuel prices, no pollution!',
        quiz: { q: 'How much does it cost per km to drive an EV with solar power?', opts: ['Rs.0 (FREE!)', 'Rs.0.80', 'Rs.2.50'], ans: 0 }},
      { title: 'Vehicle-to-Home (V2H)', svg: 'ev_v2h',
        desc: 'The coolest part: your EV battery can also POWER YOUR HOME at night! During the day, solar charges your car. At night, your car battery sends power back to your house. Your car becomes a giant battery!',
        fact: 'A Nexon EV has a 40 kWh battery — that can power an average Indian home for 3-4 days!' },
    ]},

  // ═══ PHASE 6: Weather & Maintenance ═══
  seasonal_output: {
    name: 'Seasonal Solar Output', color: '#f59e0b', steps: [
      { title: 'Summer: Best Season!', svg: 'season_summer',
        desc: 'March to June is the BEST time for solar! Long sunny days = maximum electricity (28-30 kWh/day from 5kW). But very hot days reduce efficiency by 10-15% because panels work better when cool.',
        fact: 'India gets 300+ sunny days per year — one of the best countries in the world for solar power!' },
      { title: 'Monsoon: Less But Still Works!', svg: 'season_monsoon',
        desc: 'July to September has clouds and rain, so solar output drops 30-50%. But the rain has a bonus — it washes your panels clean for FREE! Even on cloudy days, panels make 20-40% of normal output.',
        fact: 'Modern panels can generate electricity even from diffused (scattered) light on cloudy days!',
        quiz: { q: 'What happens to solar panels during monsoon rain?', opts: ['They break', 'They get cleaned for free!', 'They stop working'], ans: 1 }},
      { title: 'Winter: Cool & Efficient', svg: 'season_winter',
        desc: 'October to February: shorter days mean less hours of sunlight, but cooler temperatures make panels MORE efficient! Overall output is good. Annual average: 1500-1800 kWh per kW installed.',
        fact: 'A 5kW system makes about 7,500-9,000 units per year — enough to power an average Indian home completely!' },
    ]},
  maintenance: {
    name: 'Panel Maintenance', color: '#22c55e', steps: [
      { title: 'Why Clean Your Panels?', svg: 'maint_dirty',
        desc: 'Dust, bird droppings, and leaves block sunlight from reaching the silicon cells. Dirty panels lose 15-25% of their power! Clean panels = more electricity = more savings.',
        fact: 'In dusty cities like Delhi, panels can lose 25% power in just 2 weeks without cleaning!' },
      { title: 'How to Clean Safely', svg: 'maint_clean',
        desc: 'Clean every 2-4 weeks. Use soft water + mild soap. NEVER use hard water (it leaves white marks). Best time: early morning when panels are cool. Use a soft cloth or gentle hose — no hard scrubbing!',
        fact: 'Robots that automatically clean solar panels exist! They cost Rs.15,000-25,000 and clean daily.',
        quiz: { q: 'How often should you clean solar panels?', opts: ['Every day', 'Every 2-4 weeks', 'Once a year'], ans: 1 }},
      { title: 'Annual Checkup', svg: 'maint_check',
        desc: 'Once a year, call a technician for a full checkup (Rs.2,000-3,000). They check wiring, connections, inverter health, and panel condition. Panels degrade only 0.5% per year — after 25 years still 87.5% power!',
        fact: 'Solar panels have NO moving parts, so they rarely break. Most problems come from loose wires or dirty connections.' },
    ]},
  monsoon_prep: {
    name: 'Monsoon Safety', color: '#3b82f6', steps: [
      { title: 'Lightning: The Big Danger', svg: 'monsoon_lightning',
        desc: 'Lightning strikes can destroy your solar system in one second! One strike = Rs.1-2 Lakh damage. But a simple lightning arrester (Rs.3,000-5,000) protects your entire system. Always install one!',
        fact: 'India has about 2,500 lightning deaths per year. A proper arrester makes your home SAFER during storms.' },
      { title: 'Protection Equipment', svg: 'monsoon_protect',
        desc: 'You need 3 things: Lightning Arrester on the roof (Rs.3-5K). Surge Protector on the inverter (Rs.2-3K). Earth Grounding with 3 copper rods (Rs.5-8K). Total: Rs.10-16K for complete storm protection.',
        fact: 'Without grounding, a lightning strike travels through wires and can damage ALL electronics in your home!',
        quiz: { q: 'What protects solar panels from lightning?', opts: ['Covering them with cloth', 'Lightning arrester + earthing', 'Turning them off'], ans: 1 }},
      { title: 'Wind & Waterproofing', svg: 'monsoon_wind',
        desc: 'Good mounting frames handle winds up to 150 km/h (IS 875 standard). All junction boxes are IP67 waterproof — completely sealed from rain. Tilt angle helps rain slide off and clean the panels naturally.',
        fact: 'Quality solar panels are tested against hailstones the size of golf balls at 80 km/h — they are incredibly tough!' },
    ]},

  // ═══ PHASE 7: Environmental Impact ═══
  co2_impact: {
    name: 'CO\u2082 & Pollution', color: '#22c55e', steps: [
      { title: 'What is CO\u2082?', svg: 'co2_what',
        desc: 'CO\u2082 (Carbon Dioxide) is a gas that traps heat in our atmosphere, like a blanket around Earth. Burning coal and petrol releases CO\u2082. Too much CO\u2082 = Earth gets hotter = climate change, floods, and droughts.',
        fact: 'India\'s electricity comes 70% from burning coal. Every unit of grid electricity releases about 0.82 kg of CO\u2082!' },
      { title: 'How Solar Prevents CO\u2082', svg: 'co2_prevent',
        desc: 'Solar panels make electricity WITHOUT burning anything — ZERO CO\u2082! A 5kW home system prevents 6,150 kg of CO\u2082 every year. That is like taking 2 cars off the road!',
        fact: 'Over 25 years, one solar home prevents 153 TONNES of CO\u2082 — that is the weight of 25 elephants!',
        quiz: { q: 'How much CO\u2082 does a 5kW solar system prevent per year?', opts: ['100 kg', '1,000 kg', '6,150 kg'], ans: 2 }},
      { title: 'Trees Equivalent', svg: 'co2_trees',
        desc: 'One 5kW solar system = planting 280 Neem trees! If 1 crore Indian homes go solar (PM Surya Ghar target), it equals India\'s entire aviation industry emissions. Solar is the fastest way to fight climate change.',
        fact: 'Your solar home inspires neighbors too! Studies show 1 solar home leads to 3-4 more installations on the same street.' },
    ]},
  community: {
    name: 'Community Solar', color: '#60a5fa', steps: [
      { title: 'What is Community Solar?', svg: 'community_what',
        desc: 'Community solar means a group of homes or an apartment complex shares one big solar system. Instead of each home installing panels, the whole building installs them together on the common rooftop.',
        fact: 'Community solar is 15-20% cheaper per person because bigger systems cost less per unit of power.' },
      { title: 'India\'s Solar Goals', svg: 'community_india',
        desc: 'India already has 100 GW (100,000 MW) of solar capacity — enough to power 100 million homes! The target is 500 GW by 2030. PM Surya Ghar aims for 1 crore solar homes by 2027.',
        fact: 'India is the 3rd largest solar power producer in the world, after China and the USA!',
        quiz: { q: 'What is India\'s solar target for 2030?', opts: ['100 GW', '300 GW', '500 GW'], ans: 2 }},
      { title: 'Your Contribution Matters', svg: 'community_impact',
        desc: 'Every solar home matters! You reduce pollution, save money, create jobs (solar industry employs 3 Lakh+ people in India), and make your neighborhood cleaner. You become part of India\'s clean energy revolution!',
        fact: 'The solar industry creates 25 jobs per MW installed — more than coal, oil, or gas combined!' },
    ]},
  future_tech: {
    name: 'Future Solar Tech', color: '#a78bfa', steps: [
      { title: 'Bifacial Panels', svg: 'future_bifacial',
        desc: 'New panels that collect sunlight from BOTH sides! The back side catches light reflected from the ground. They produce 10-30% more electricity than normal panels for almost the same price.',
        fact: 'White rooftops reflect more light to the back of bifacial panels — just painting your roof white can increase output by 15%!' },
      { title: 'Solar Roof Tiles', svg: 'future_tiles',
        desc: 'Instead of ugly panels on top of your roof, imagine your entire roof IS a solar panel! Solar tiles look like normal tiles but generate electricity. Tesla and Indian companies are making these now.',
        fact: 'Solar tiles can last 50+ years — even longer than normal roof tiles!',
        quiz: { q: 'How much more electricity do bifacial panels make?', opts: ['1-3% more', '10-30% more', '100% more'], ans: 1 }},
      { title: 'Next-Gen Batteries', svg: 'future_battery',
        desc: 'Solid-state batteries (coming 2026-2028) will store 2x more energy, charge faster, and last 20+ years. Perovskite solar cells (being tested now) can reach 30%+ efficiency and can be printed like newspapers!',
        fact: 'Imagine printing solar panels on any surface — windows, walls, even backpacks. That future is only 5-10 years away!' },
    ]},

  // ═══ PHASE 8: Total Impact ═══
  total_savings: {
    name: '25-Year Savings', color: '#22c55e', steps: [
      { title: 'Your Investment', svg: 'savings_invest',
        desc: 'A 3kW solar system costs about Rs.2,10,000. After PM Surya Ghar subsidy of Rs.78,000, you pay only Rs.1,32,000. This one-time payment gives you 25 years of almost-free electricity!',
        fact: 'That is like paying Rs.440/month for 25 years of electricity. Without solar, you would pay Rs.3,500/month!' },
      { title: 'Total Money Saved', svg: 'savings_graph',
        desc: 'Monthly savings: Rs.3,000-4,000. Yearly savings: Rs.40,000-50,000. Payback period: Just 3-4 years! After that, electricity is basically FREE for 21 more years. 25-year total savings: Rs.12-15 LAKH!',
        fact: 'Solar gives you 400-500% return on investment — that beats Fixed Deposits (60%), Gold (200%), and even the Stock Market!',
        quiz: { q: 'How long does it take for solar to pay back its cost?', opts: ['10-15 years', '3-4 years', '1 year'], ans: 1 }},
      { title: 'Money Saved vs Other Investments', svg: 'savings_roi',
        desc: 'If you invest Rs.1.32 Lakh in FD: you get Rs.2.1 Lakh in 25 years. In Gold: Rs.3.9 Lakh. In Solar: Rs.12-15 LAKH! Solar is the BEST investment a family can make. Plus you save the planet too!',
        fact: 'After the panels pay for themselves in 3-4 years, every rupee saved is pure profit!' },
    ]},
  knowledge_check: {
    name: 'Knowledge Review', color: '#a78bfa', steps: [
      { title: 'Solar Basics Review', svg: 'review_basics',
        desc: 'You have learned so much! Solar panels use silicon to convert sunlight into DC electricity. The inverter changes DC to AC for your home. Net metering lets you sell extra power back to the grid.',
        fact: 'You now know more about solar energy than 95% of adults!',
        quiz: { q: 'What converts DC from panels to AC for your home?', opts: ['Solar Panel', 'Net Meter', 'Inverter'], ans: 2 }},
      { title: 'Installation & Money Review', svg: 'review_install',
        desc: 'Panels face TRUE SOUTH at tilt angle = your latitude. Shadows reduce output by 30-50%. PM Surya Ghar gives Rs.78,000 subsidy. LiFePO4 is the best battery type. Load shifting saves Rs.1,500/month.',
        fact: 'Remember: Tilt = Latitude, always face South, avoid shadows, and use heavy appliances during daytime!',
        quiz: { q: 'Which direction should solar panels face in India?', opts: ['North', 'East', 'True South'], ans: 2 }},
      { title: 'Environment Review', svg: 'review_env',
        desc: 'One 5kW solar home prevents 6,150 kg CO\u2082/year = 280 trees planted. Over 25 years: 153 tonnes prevented. BEE 5-star appliances save Rs.15,000/year. Solar + EV = Rs.0/km driving cost!',
        fact: 'You are now a Solar Champion! Share what you learned with family and friends to make India greener!' },
    ]},
  action_plan: {
    name: '10-Step Action Plan', color: '#f59e0b', steps: [
      { title: 'Steps 1-4: Get Started', svg: 'action_start',
        desc: '1. Visit pmsuryaghar.gov.in and register. 2. Get a site survey from your DISCOM. 3. Choose a Hybrid system for best results. 4. Select an MNRE-approved solar vendor with good reviews.',
        fact: 'The whole process from registration to installation takes about 45-60 days. Start today!' },
      { title: 'Steps 5-7: Install Right', svg: 'action_install',
        desc: '5. Check your roof can handle the weight (15-18 kg per square meter). 6. Install panels facing South at your latitude angle. 7. Apply for net meter through your DISCOM portal.',
        fact: 'A good vendor handles everything — from DISCOM paperwork to net meter application. You just sign and approve!',
        quiz: { q: 'What is the first step to go solar?', opts: ['Buy panels from shop', 'Register at pmsuryaghar.gov.in', 'Call an electrician'], ans: 1 }},
      { title: 'Steps 8-10: Maximize Savings', svg: 'action_save',
        desc: '8. Claim your Rs.78,000 subsidy (it gets deposited directly to your bank!). 9. Install smart sensors and replace old appliances with 5-star rated ones. 10. Shift heavy appliances to 10 AM - 3 PM for FREE solar power!',
        fact: 'Congratulations! You now have a complete roadmap to make your home a Solar Champion home!' },
    ]},
};
