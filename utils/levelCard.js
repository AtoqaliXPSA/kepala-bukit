const Jimp = require('jimp');

async function generateLevelCard(username, level, xp) {
  const background = await Jimp.read('background.png');
  const font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);

  const maxXp = level * 100;
  const progress = Math.min(xp / maxXp, 1);

  background.scan(50, 180, 700 * progress, 20, function (x, y, idx) {
    this.bitmap.data[idx + 0] = 0;
    this.bitmap.data[idx + 1] = 255;
    this.bitmap.data[idx + 2] = 0;
    this.bitmap.data[idx + 3] = 255;
  });

  background.print(font, 50, 40, `Username: ${username}`);
  background.print(font, 50, 90, `Level: ${level}`);
  background.print(font, 50, 140, `XP: ${xp} / ${maxXp}`);

  return await background.getBufferAsync(Jimp.MIME_PNG);
}

module.exports = generateLevelCard;