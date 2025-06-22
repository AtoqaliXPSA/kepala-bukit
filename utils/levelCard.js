const Jimp = require('jimp');

module.exports = async function generateLevelCard({ username, avatarURL, level, xp, xpNeeded }) {
  const card = new Jimp(600, 200, '#1a1a1a');
  const font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
  const smallFont = await Jimp.loadFont(Jimp.FONT_SANS_16_WHITE);

  const avatar = await Jimp.read(avatarURL);
  avatar.resize(100, 100);
  card.composite(avatar, 30, 50);

  card.print(font, 150, 40, username);
  card.print(smallFont, 150, 80, `Level: ${level}`);
  card.print(smallFont, 150, 110, `XP: ${xp} / ${xpNeeded}`);

  // XP bar
  const barWidth = 300;
  const filledWidth = Math.floor((xp / xpNeeded) * barWidth);
  const barY = 150;

  card.scan(150, barY, barWidth, 20, function (x, y, idx) {
    const fill = x < 150 + filledWidth;
    this.bitmap.data[idx + 0] = fill ? 0 : 100; // R
    this.bitmap.data[idx + 1] = fill ? 255 : 100; // G
    this.bitmap.data[idx + 2] = fill ? 0 : 100; // B
    this.bitmap.data[idx + 3] = 255;
  });

  const buffer = await card.getBufferAsync(Jimp.MIME_PNG);
  return buffer;
};