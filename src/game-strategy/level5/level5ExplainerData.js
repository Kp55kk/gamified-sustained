// ═══════════════════════════════════════════════════════════
//  LEVEL 5 — Phase 1: Smart Appliance Evolution (Star Ratings)
//  5 topics × 3 steps = 15 steps, 15 animated SVGs
//  Student-friendly language — BEE Star Rating education
// ═══════════════════════════════════════════════════════════

export const EXPLAINER_TOPICS = {
  // ═══ TOPIC 1: What are BEE Star Ratings? ═══
  star_basics: {
    name: 'BEE Star Ratings', color: '#f59e0b', steps: [
      { title: 'What is a BEE Star Rating?', svg: 'star_label',
        desc: 'BEE stands for Bureau of Energy Efficiency. Every appliance in India gets a rating from 1 to 5 stars. More stars = less electricity used! A 5-star AC uses 30-50% LESS power than a 1-star AC for the same cooling.',
        fact: 'The BEE star label is mandatory on ACs, fridges, washing machines, fans, and LED lights sold in India!' },
      { title: 'How to Read the Star Label', svg: 'star_compare',
        desc: 'Every appliance has a colorful label with stars, yearly electricity use (in kWh), and cost. The label goes from RED (1 star = waste) to GREEN (5 stars = efficient). Always look for the number of stars AND the yearly kWh number!',
        fact: 'A 5-star fridge uses only 180 kWh/year vs a 1-star fridge at 400 kWh/year. That saves Rs.1,540/year!',
        quiz: { q: 'What does BEE stand for?', opts: ['Best Electrical Equipment', 'Bureau of Energy Efficiency', 'Basic Energy Evaluation'], ans: 1 }},
      { title: 'Why Stars Matter for Your Bill', svg: 'star_efficiency',
        desc: 'Every extra star saves 8-15% electricity! A 5-star fan uses just 28W vs a 0-star regular fan at 75W. Over a year running 12 hours/day, the 5-star fan saves Rs.1,450! Multiply by every appliance in your home — the savings are HUGE.',
        fact: 'If every home in India switched to 5-star appliances, the country would save 50 billion kWh of electricity per year — enough to power 5 crore homes!' },
    ]},

  // ═══ TOPIC 2: Energy Comparison Lab ═══
  energy_comparison: {
    name: 'Energy Comparison Lab', color: '#22c55e', steps: [
      { title: 'Old Appliances vs 5-Star Appliances', svg: 'star_meter',
        desc: 'An old fridge from 2010 uses about 700 kWh/year. A new 5-star fridge uses only 180 kWh/year — that is 74% LESS electricity! Old appliances are like leaky buckets — they waste energy constantly.',
        fact: 'Replacing one old fridge with a 5-star model saves Rs.3,640/year. In 10 years, that is Rs.36,400 — more than the fridge costs!' },
      { title: 'Side-by-Side: See the Difference', svg: 'star_old_vs_new',
        desc: 'Old AC (2008): 2,500 kWh/year = Rs.17,500/year. New 5-star Inverter AC: 1,000 kWh/year = Rs.7,000/year. That is Rs.10,500 saved EVERY year! The new AC also cools faster and runs more quietly.',
        fact: 'A 5-star inverter AC adjusts its speed automatically — it does not turn fully ON/OFF like old ACs, saving 30-50% more energy!',
        quiz: { q: 'How much less electricity does a 5-star fridge use compared to an old one?', opts: ['20% less', '50% less', '74% less'], ans: 2 }},
      { title: 'Energy Consumption Bar Chart', svg: 'energy_bar_chart',
        desc: 'Look at the energy bars: Fan (old: 75W vs 5-star: 28W), AC (old: 2500W vs 5-star: 1000W), Fridge (old: 250W vs 5-star: 80W), Washing Machine (old: 500W vs 5-star: 300W). Every appliance shows massive savings with 5-star ratings!',
        fact: 'A family with all 5-star appliances saves Rs.15,000-25,000 per year on electricity bills!' },
    ]},

  // ═══ TOPIC 3: Star Rating Deep Dive ═══
  star_analysis: {
    name: 'Star Rating Deep Dive', color: '#a78bfa', steps: [
      { title: 'How Efficiency is Calculated', svg: 'annual_savings',
        desc: 'Efficiency = Useful Energy Output / Total Energy Input × 100%. A 5-star AC has 95% efficiency — only 5% energy is wasted. A 1-star AC has 65% efficiency — 35% of electricity is just wasted as heat! Higher stars = less waste.',
        fact: 'The Indian government updates star ratings every 2 years, making them stricter. A 5-star AC from 2018 might only be 3-star today!' },
      { title: 'Annual Savings Calculator', svg: 'lifecycle_bar',
        desc: 'Calculate your savings: Old Fan (75W × 12 hrs × 365 days = 329 kWh = Rs.2,303/year). 5-Star Fan (28W × 12 hrs × 365 days = 123 kWh = Rs.858/year). Savings: 206 kWh and Rs.1,445 per fan per year!',
        fact: 'Most Indian homes have 3-4 ceiling fans. Switching all to 5-star fans saves Rs.4,335-5,780 per year!',
        quiz: { q: 'What happens to star ratings every 2 years?', opts: ['They stay the same', 'They get stricter', 'They are removed'], ans: 1 }},
      { title: 'The 10-Year Cost View', svg: 'purchase_vs_running',
        desc: 'Here is the secret: RUNNING cost is much bigger than PURCHASE cost! A cheap 1-star AC costs Rs.25,000 to buy but Rs.17,500/year to run = Rs.2,00,000 in 10 years! A 5-star AC costs Rs.45,000 but only Rs.7,000/year = Rs.1,15,000 in 10 years. The expensive AC SAVES Rs.85,000!',
        fact: 'The purchase price is only 15-25% of the total lifetime cost. The rest is your electricity bill!' },
    ]},

  // ═══ TOPIC 4: Lifecycle Cost Calculator ═══
  lifecycle_cost: {
    name: 'Lifecycle Cost Calculator', color: '#60a5fa', steps: [
      { title: 'What is Lifecycle Cost?', svg: 'label_reader',
        desc: 'Lifecycle cost = Purchase Price + Running Cost (electricity) + Maintenance over the appliance lifetime. A cheap appliance that wastes electricity is EXPENSIVE in the long run! Always calculate the TOTAL cost, not just the price tag.',
        fact: 'The lifecycle cost of a 1-star fridge over 15 years is Rs.84,000 (Rs.12,000 buy + Rs.72,000 electricity). A 5-star fridge: Rs.45,000 total (Rs.18,000 buy + Rs.27,000 electricity)!' },
      { title: 'Fridge Comparison: 15-Year Cost', svg: 'fridge_compare',
        desc: '1-Star Fridge: Buy Rs.12,000 + Electricity Rs.4,800/year × 15 = Rs.84,000 TOTAL. 5-Star Fridge: Buy Rs.18,000 + Electricity Rs.1,260/year × 15 = Rs.36,900 TOTAL. The 5-star fridge saves Rs.47,100 over its lifetime! That is like getting 2.5 free fridges!',
        fact: 'A 5-star fridge pays for its extra cost in just 1.5 years through electricity savings!',
        quiz: { q: 'Which costs more over 15 years?', opts: ['Cheap 1-star fridge', 'Expensive 5-star fridge', 'Both cost the same'], ans: 0 }},
      { title: 'AC Comparison: 10-Year Cost', svg: 'ac_compare',
        desc: '1-Star AC (1.5 ton): Buy Rs.25,000 + Rs.17,500/year × 10 = Rs.2,00,000 TOTAL. 5-Star Inverter AC: Buy Rs.45,000 + Rs.7,000/year × 10 = Rs.1,15,000 TOTAL. The 5-star AC saves Rs.85,000 in 10 years! Plus it cools better and lasts longer.',
        fact: 'Inverter ACs do not just save energy — they also cause less voltage fluctuation, protecting other electronics in your home!' },
    ]},

  // ═══ TOPIC 5: Smart Buying Guide ═══
  smart_buying: {
    name: 'Smart Buying Guide', color: '#f97316', steps: [
      { title: 'Top Picks: Washer & Fan', svg: 'washer_compare',
        desc: 'Washing Machine: Always buy front-load (uses 40% less water and energy than top-load). Look for 5-star rating and inverter motor. A 5-star washer saves Rs.2,000/year! Ceiling Fan: BEE 5-star fans use only 28-32W vs 70-75W for regular fans. BLDC motor fans are the best!',
        fact: 'A BLDC motor fan (Rs.2,500-3,500) uses only 28W. Over 10 years running 12 hrs/day, it saves Rs.14,500 compared to a regular fan!' },
      { title: 'Reading Energy Labels Like a Pro', svg: 'fan_compare',
        desc: 'When buying any appliance, check these 4 things on the BEE label: 1) Number of stars (aim for 4-5). 2) Annual energy consumption in kWh (lower is better). 3) Brand and model (compare online). 4) Year of rating (newer ratings are stricter = more reliable).',
        fact: 'You can also scan the QR code on the BEE label to verify if the rating is genuine! Fake labels do exist.',
        quiz: { q: 'What type of ceiling fan motor is most efficient?', opts: ['Induction motor', 'BLDC motor', 'Universal motor'], ans: 1 }},
      { title: 'Your Smart Buying Checklist', svg: 'buying_checklist',
        desc: 'Before buying ANY appliance: 1) Check BEE star rating (4-5 stars). 2) Compare annual kWh on labels. 3) Calculate 10-year total cost (price + electricity). 4) Choose inverter technology for AC/fridge/washer. 5) Check for government subsidies. 6) Read online reviews for real energy performance.',
        fact: 'Following this checklist can save your family Rs.15,000-25,000 every year. Over 20 years, that is Rs.3-5 Lakh saved!' },
    ]},

  // ═══════════════════════════════════════════════════════════
  //  PHASE 2: Solar Panel Lifecycle (After 25+ Years)
  //  4 topics × 3 steps = 12 steps, 12 animated SVGs
  // ═══════════════════════════════════════════════════════════

  // ═══ TOPIC 6: How Solar Panels Age ═══
  panel_aging: {
    name: 'How Panels Age', color: '#f97316', steps: [
      { title: 'The 25-Year Solar Journey', svg: 'panel_timeline',
        desc: 'Solar panels are designed to last 25-30 years! But like everything, they slowly age. Over time, tiny changes happen inside the silicon cells — UV light and weather slowly reduce how much electricity they make. This is called "degradation" and it happens at just 0.5-0.8% per year.',
        fact: 'After 25 years, a solar panel still produces about 80% of its original power! That means a 300W panel still gives you 240W — enough to power 8 LED lights.' },
      { title: 'Degradation: Year by Year', svg: 'degradation_curve',
        desc: 'Year 1: Your panel makes 300W (100%). Year 10: It makes 279W (93%). Year 20: It makes 258W (86%). Year 25: It makes 240W (80%). The decline is slow and steady — like how a battery slowly holds less charge. The first year has a slightly bigger drop (1-3%), then it stabilizes.',
        fact: 'The best solar panels today come with a 25-year warranty guaranteeing at least 80% output. Some premium panels guarantee 87%!',
        quiz: { q: 'How much power does a solar panel lose per year?', opts: ['5-10% per year', '0.5-0.8% per year', '15-20% per year'], ans: 1 }},
      { title: 'What Causes Aging?', svg: 'aging_output',
        desc: 'Three main enemies age your panels: 1) UV light causes tiny cracks in silicon cells (like skin wrinkles). 2) Heat cycling — panels expand in day heat and contract at night. 3) Moisture can seep into edges over decades. BUT — modern panels are built tough with tempered glass and sealed frames!',
        fact: 'In India\'s climate, panels degrade slightly faster (0.7-0.8%/yr) due to intense heat. But they also get more sunlight, so the total energy produced is still higher!' },
    ]},

  // ═══ TOPIC 7: Recycling Solar Panels ═══
  recycling_process: {
    name: 'Recycling Solar Panels', color: '#0ea5e9', steps: [
      { title: 'Taking Panels Apart', svg: 'recycle_steps',
        desc: 'When a panel reaches end-of-life, it goes to a recycling plant. Step 1: Remove the aluminum frame (easy — it just unclips). Step 2: Separate the glass sheet (makes up 75% of the panel!). Step 3: Heat the panel to melt the plastic laminate. Step 4: Recover the silicon cells and metal wires.',
        fact: 'The aluminum frame is 100% recyclable and can be reused immediately! It takes only 5% of the energy to recycle aluminum vs making new aluminum.' },
      { title: 'Material Recovery', svg: 'glass_recovery',
        desc: 'A typical solar panel contains: Glass (75%) — recycled into new glass products. Silicon (3-5%) — purified and reused in new panels or electronics. Silver & Copper (1%) — valuable metals recovered and sold. Aluminum (8%) — recycled infinitely. Plastic (10%) — used as fuel or recycled.',
        fact: 'The silver in one solar panel is worth Rs.500-800! A recycling plant processing 1000 panels recovers Rs.5-8 Lakh worth of silver alone.',
        quiz: { q: 'What percentage of a solar panel is recyclable?', opts: ['50-60%', '70-80%', '90-95%'], ans: 2 }},
      { title: '95% Recyclable!', svg: 'recycle_stats',
        desc: 'Modern solar panels are up to 95% recyclable by weight! Only 5% (mainly the plastic laminate) cannot be easily recycled yet. Compare this to: Smartphones (only 30% recycled), Clothes (only 12% recycled), Plastic bottles (only 29% recycled). Solar panels are one of the MOST recyclable products ever made!',
        fact: 'By 2050, India will have 78 million tonnes of solar panel waste — but if recycled properly, this becomes Rs.15,000 Crore worth of materials!' },
    ]},

  // ═══ TOPIC 8: Second-Life Applications ═══
  second_life: {
    name: 'Second-Life Panels', color: '#8b5cf6', steps: [
      { title: 'Repurposed for New Uses', svg: 'second_life_uses',
        desc: 'When panels still work at 70-80% (after 25+ years), they are too good to throw away! "Second-life" means giving them a new purpose. They can power: Water pumps for farms, Street lights in villages, Small schools and health centers, Electric fences for crops, Phone charging stations.',
        fact: 'A used 250W panel (producing 180W) can power 3 classrooms worth of lights and fans — giving education to 100+ children!' },
      { title: 'Powering Rural India', svg: 'second_life_farm',
        desc: 'Millions of Indian farms have no reliable electricity. Second-life panels are perfect because: They cost 70-80% less than new panels. They still produce enough for pumps and lights. Farmers save Rs.15,000-20,000/year on diesel. No fuel needed — just free sunlight! Used panels can serve another 10-15 years in rural areas.',
        fact: 'India has 14 Crore farms. If just 10% used second-life panels, it would save 2.8 billion liters of diesel per year!',
        quiz: { q: 'How long can second-life panels serve in rural areas?', opts: ['1-2 years', '5-7 years', '10-15 years'], ans: 2 }},
      { title: 'Community Applications', svg: 'second_life_examples',
        desc: 'Creative second-life uses happening in India right now: Solar street lights — 100+ villages lit with used panels. School power — 500+ rural schools powered by donated panels. Water purification — solar-powered UV filters for clean water. Market lighting — evening markets powered by used panels. EV charging — slow-charging stations for e-rickshaws.',
        fact: 'The Social Solar Initiative in Rajasthan has placed 10,000 second-life panels in villages — providing electricity to 50,000 families for the first time!' },
    ]},

  // ═══ TOPIC 9: Circular Solar Economy ═══
  circular_economy: {
    name: 'Circular Solar Economy', color: '#10b981', steps: [
      { title: 'Linear vs Circular Economy', svg: 'circular_flow',
        desc: 'LINEAR economy: Make → Use → Throw (creates waste). CIRCULAR economy: Make → Use → Repair/Reuse → Recycle → Make Again (zero waste!). Solar panels are perfect for circular economy because: Materials can be recovered and reused. Panels can be refurbished for second life. 95% of materials cycle back into production.',
        fact: 'If India builds a circular solar economy, it could create 1 lakh new jobs in panel recycling, refurbishment, and rural installation!' },
      { title: 'Cradle-to-Cradle Design', svg: 'cradle_to_cradle',
        desc: 'The best companies now design panels for easy recycling from Day 1! "Cradle-to-cradle" means: Using lead-free solder (safer recycling). Snap-fit frames (easy disassembly). Marking materials clearly. Designing for module reuse. This makes recycling 60% cheaper and recovers 15% more materials.',
        fact: 'Japan\'s solar recycling law requires manufacturers to take back old panels. India is developing similar rules under the E-Waste Management Rules 2022!',
        quiz: { q: 'What does cradle-to-cradle design mean?', opts: ['Making panels cheaper', 'Designing for easy recycling from Day 1', 'Using plastic instead of glass'], ans: 1 }},
      { title: 'Preventing E-Waste', svg: 'ewaste_compare',
        desc: 'Solar panels create MUCH less e-waste than other electronics: A phone lasts 2-3 years → solar panel lasts 25-40 years! Per kWh of energy, solar produces 300x less waste than coal. Solar waste is 95% recyclable vs smartphones at 30%. By choosing solar AND proper recycling, you help build a future with ZERO energy waste!',
        fact: 'India generates 32 Lakh tonnes of e-waste per year. Solar panel waste (even at peak in 2050) will be only 2.4% of that — and it is far more recyclable!' },
    ]},
};
