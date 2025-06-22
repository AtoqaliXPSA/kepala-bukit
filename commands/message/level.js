const Jimp = require('jimp').default;
const path = require('path');

async function generateLevelCard(username, level, xp) {
  const bg = await Jimp.read(path.join(__dirname, '../assets/background.png'));
  const font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);

  bg.print(font, 20, 20, `User: ${username}`);
  bg.print(font, 20, 60, `Level: ${level}`);
  bg.print(font, 20, 100, `XP: ${xp}`);

  const buffer = await bg.getBufferAsync(Jimp.MIME_PNG);
  return buffer;
}

module.exports = generateLevelCard;