const Jimp = require('jimp');
const path = require('path');

async function generateLevelCard(username, level, xp, rank) {
  const bg = await Jimp.read(path.join(__dirname, 'background.png'));
  const font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);

  bg.print(font, 40, 40, username);
  bg.print(font, 40, 80, `Level: ${level}`);
  bg.print(font, 40, 120, `XP: ${xp}`);
  bg.print(font, 40, 160, `Rank: ${rank}`);

  const outputPath = path.join(__dirname, 'output', `${username}_level.png`);
  await bg.writeAsync(outputPath);
  return outputPath;
}

module.exports = { generateLevelCard };