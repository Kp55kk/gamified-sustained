import { readFileSync, writeFileSync } from 'fs';

const file = 'src/game-strategy/level4/Level4.jsx';
let content = readFileSync(file, 'utf8');

// Corrupted UTF-8 sequences from PowerShell Set-Content double-encoding
const replacements = [
  // Em dash
  [/\u00C3\u00A2\u00C2\u0080\u00C2\u0094/g, '\u2014'],
  [/\u00C3\u00A2\u00C2\u0080\u00C2\u0093/g, '\u2013'],
  [/â€"/g, '\u2014'],
  [/â€"/g, '\u2014'],
  [/â€˜/g, '\u2018'],
  [/â€™/g, '\u2019'],
  [/â€œ/g, '\u201C'],
  [/â€\u009D/g, '\u201D'],
  // Arrows
  [/â†'/g, '\u2192'],
  [/â†\u0090/g, '\u2190'],
  [/â‡'/g, '\u21D2'],
  // Check/Cross
  [/âœ…/g, '\u2705'],
  [/âœ"/g, '\u2714'],
  [/â\u009D\u008C/g, '\u274C'],
  // Stars & Sparkles
  [/â­/g, '\u2B50'],
  [/âœ¨/g, '\u2728'],
  // Sun & Weather
  [/â˜€ï¸/g, '\u2600\uFE0F'],
  [/â˜€/g, '\u2600'],
  [/âš¡/g, '\u26A1'],
  [/â›…/g, '\u26C5'],
  [/â˜\u0081/g, '\u2601'],
  [/â˜\u0081ï¸/g, '\u2601\uFE0F'],
  // Currency
  [/â‚¹/g, '\u20B9'],
  // Subscript
  [/â‚‚/g, '\u2082'],
  // Box drawing / decorative
  [/â•â•â•/g, '\u2550\u2550\u2550'],
  [/â•/g, '\u2550'],
  [/â"€â"€â"€/g, '\u2500\u2500\u2500'],
  [/â"€/g, '\u2500'],
  // Degree
  [/Â°/g, '\u00B0'],
  [/Â²/g, '\u00B2'],
  // Warning/Shield
  [/â\u009A\u00A0ï¸/g, '\u26A0\uFE0F'],
  [/â\u009A\u00A0/g, '\u26A0'],
  // Timer/Clock  
  [/â±ï¸/g, '\u23F1\uFE0F'],
  [/â±/g, '\u23F1'],
  [/â°/g, '\u23F0'],
  // Arrows (up/down)
  [/â¬†ï¸/g, '\u2B06\uFE0F'],
  [/â¬‡ï¸/g, '\u2B07\uFE0F'],
  // Gear
  [/âš™ï¸/g, '\u2699\uFE0F'],
  // Misc garbled emoji prefixes - catch remaining Ã¢ sequences
  [/ðŸ"‹/g, '\uD83D\uDD0B'], // 🔋
  [/ðŸ"Œ/g, '\uD83D\uDD0C'], // 🔌
  [/ðŸ"Š/g, '\uD83D\uDCCA'], // 📊
  [/ðŸ"š/g, '\uD83D\uDCDA'], // 📚
  [/ðŸ"„/g, '\uD83D\uDD04'], // 🔄
  [/ðŸ\u0094/g, '\uD83D\uDD14'], // 🔔
  [/ðŸ /g, '\uD83C\uDFE0'], // 🏠
  [/ðŸ›ï¸/g, '\uD83C\uDFDB\uFE0F'], // 🏛️
  [/ðŸ—ï¸/g, '\uD83C\uDFD7\uFE0F'], // 🏗️
  [/ðŸ˜ï¸/g, '\uD83C\uDFD8\uFE0F'], // 🏘️
  [/ðŸ¦/g, '\uD83C\uDFE6'], // 🏦
  [/ðŸ'°/g, '\uD83D\uDCB0'], // 💰
  [/ðŸ'¡/g, '\uD83D\uDCA1'], // 💡
  [/ðŸ'ª/g, '\uD83D\uDCAA'], // 💪
  [/ðŸŽ¯/g, '\uD83C\uDFAF'], // 🎯
  [/ðŸŽ‰/g, '\uD83C\uDF89'], // 🎉
  [/ðŸ"/g, '\uD83D\uDCD0'], // 📐
  [/ðŸ§¹/g, '\uD83E\uDDF9'], // 🧹
  [/ðŸ§ /g, '\uD83E\uDDE0'], // 🧠
  [/ðŸ¤–/g, '\uD83E\uDD16'], // 🤖
  [/ðŸš—/g, '\uD83D\uDE97'], // 🚗
  [/ðŸš€/g, '\uD83D\uDE80'], // 🚀
  [/ðŸŒ¤ï¸/g, '\uD83C\uDF24\uFE0F'], // 🌤️
  [/ðŸŒ§ï¸/g, '\uD83C\uDF27\uFE0F'], // 🌧️
  [/ðŸŒ/g, '\uD83C\uDF0D'], // 🌍
  [/ðŸŒ³/g, '\uD83C\uDF33'], // 🌳
  [/ðŸŒ¿/g, '\uD83C\uDF3F'], // 🌿
  [/ðŸŒ¬ï¸/g, '\uD83C\uDF2C\uFE0F'], // 🌬️
  [/ðŸ—"ï¸/g, '\uD83D\uDCC5'], // 📅 (actually calendar)
  [/ðŸ"\u008D/g, '\uD83D\uDCCD'], // 📍
  [/ðŸ"\u0088/g, '\uD83D\uDCC8'], // 📈
  [/ðŸ"\u008B/g, '\uD83D\uDCCB'], // 📋
  [/ðŸ"\u0085/g, '\uD83D\uDCC5'], // 📅
  [/ðŸ"\u0089/g, '\uD83D\uDCC9'], // 📉
  [/ðŸ"\u008C/g, '\uD83D\uDCCC'], // 📌
  [/ðŸ"\u0011/g, '\uD83D\uDCD1'], // 📑
  [/ðŸ\u0093/g, '\uD83D\uDCD3'], // 📓
  [/ðŸ\u0091/g, '\uD83D\uDC51'], // 👑
  [/ðŸ\u008F†/g, '\uD83C\uDFC6'], // 🏆
  [/ðŸ\u008F\u0086/g, '\uD83C\uDFC6'], // 🏆
  [/ðŸª\u009F/g, '\uD83E\uDE9F'], // 🪟 (window)
  [/ðŸª\u009C/g, '\uD83E\uDE9C'], // ladder
  [/ðŸª™/g, '\uD83E\uDE99'], // 🪙
  [/ðŸ\u009B¡ï¸/g, '\uD83D\uDEE1\uFE0F'], // 🛡️
  [/ðŸ\u009B\u008Fï¸/g, '\uD83D\uDECF\uFE0F'], // 🛏️
  [/ðŸ\u009B\u008B/g, '\uD83D\uDECB'], // 🛋
  [/ðŸ\u009Bï¸/g, '\uD83D\uDECF\uFE0F'],
  [/ðŸ\u009A¿/g, '\uD83D\uDEBF'], // 🚿
  [/ðŸ³/g, '\uD83C\uDF73'], // 🍳
  [/ðŸ\u0093±/g, '\uD83D\uDCF1'], // 📱
  [/ðŸ\u0093¡/g, '\uD83D\uDCE1'], // 📡
  [/ðŸ\u0093\u0085/g, '\uD83D\uDCC5'], // 📅
  [/ðŸ\u0093\u008C/g, '\uD83D\uDCCC'], // 📌
  [/â\u009E¡ï¸/g, '\u27A1\uFE0F'], // ➡️
  [/ðŸ\u0092\u00A1/g, '\uD83D\uDCA1'], // 💡
  [/ðŸ\u0093/g, '\uD83D\uDCD3'],
  [/ðŸ§'â€ðŸŽ"/g, '\uD83E\uDDD1\u200D\uD83C\uDF93'], // 🧑‍🎓
  // Remaining Â prefix (leftover from latin1 interpretation)
  [/Ã—/g, '\u00D7'], // ×
  [/Ã\u0097/g, '\u00D7'],
];

let count = 0;
for (const [pattern, replacement] of replacements) {
  const matches = content.match(pattern);
  if (matches) {
    count += matches.length;
    content = content.replace(pattern, replacement);
  }
}

writeFileSync(file, content, 'utf8');
console.log(`Fixed ${count} garbled sequences in Level4.jsx`);

// Verify no remaining garbled sequences
const remaining = content.match(/[Ã¢Â][€˜™""¹‚±°²\u0080-\u009F]/g);
if (remaining) {
  console.log(`WARNING: ${remaining.length} possible remaining garbled chars`);
  // Show unique patterns
  const unique = [...new Set(remaining)];
  console.log('Unique patterns:', unique.slice(0, 20));
} else {
  console.log('No remaining garbled patterns detected!');
}
