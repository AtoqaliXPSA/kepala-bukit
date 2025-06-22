const Jimp = require('jimp').default; // ✅ gunakan `.default`

async function generateLevelCard(username, level, xp) {
  const width = 800;
  const height = 250;

  const background = await Jimp.read('background.png'); // tukar ke laluan anda
  const font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);

  // Optional: bar XP progress
  const maxXp = level * 100; // contoh kiraan
  const progress = Math.min(xp / maxXp, 1);

  // Lukis bar progress secara manual
  background.scan(50, 180, 700 * progress, 20, function (x, y, idx) {
    this.bitmap.data[idx + 0] = 0;   // R
    this.bitmap.data[idx + 1] = 255; // G
    this.bitmap.data[idx + 2] = 0;   // B
    this.bitmap.data[idx + 3] = 255; // A
  });

  background.print(font, 50, 40, `Username: ${username}`);
  background.print(font, 50, 90, `Level: ${level}`);
  background.print(font, 50, 140, `XP: ${xp} / ${maxXp}`);

  return await background.getBufferAsync(Jimp.MIME_PNG);
}

module.exports = generateLevelCard;