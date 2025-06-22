const Jimp = require('jimp');
const path = require('path');

async function generateLevelCard({ username, level, xp, maxXp, rank, avatarURL }) {
  const width = 800;
  const height = 240;

  const background = await Jimp.read(path.join(__dirname, 'background.png'));
  background.resize(width, height);

  const font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
  const avatar = await Jimp.read(avatarURL);
  avatar.resize(256, 246);

  background.composite(avatar, 50, 50);
  background.print(font, 180, 30, ` ${username}`);
  background.print(font, 180, 80, ` Level: ${level}`);
  background.print(font, 180, 130, ` XP: ${xp} / ${maxXp}`);
  background.print(font, 180, 180, ` Rank: #${rank}`);

  return await background.getBufferAsync(Jimp.MIME_PNG);
}

module.exports = generateLevelCard; // ✅ sesuai dengan cara import anda