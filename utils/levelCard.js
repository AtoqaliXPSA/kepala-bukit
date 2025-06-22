const Jimp = require('jimp');
const path = require('path');

async function generateLevelCard({ username, level, xp, maxXp, rank, avatarURL }) {
  const width = 800;
  const height = 240;

  const bg = await Jimp.read('./utils/background.png');
  const avatar = await Jimp.read(avatarURL);
  const font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
  const fontBold = await Jimp.loadFont(Jimp.FONT_SANS_64_WHITE);

  // Resize background to fit
  bg.resize(width, height);

  // Resize avatar
  avatar.resize(180, 180).circle();

  // Letak avatar
  bg.composite(avatar, 20, 30);

  // Tulis nama
  bg.print(fontBold, 220, 40, username);

  // Tulis Rank dan XP
  bg.print(font, 220, 100, `Rank: #${rank.toLocaleString()}`);
  bg.print(font, 220, 140, `XP: ${xp.toLocaleString()} / ${maxXp.toLocaleString()}`);

  // Tulis Level besar
  bg.print(fontBold, 30, 210, `LVL ${level}`);

  // Bar XP
  const barX = 220;
  const barY = 190;
  const barWidth = 540;
  const barHeight = 20;

  const filledWidth = Math.floor((xp / maxXp) * barWidth);

  // Empty bar (putih)
  bg.scan(barX, barY, barWidth, barHeight, function (x, y, idx) {
    this.bitmap.data[idx + 0] = 255; // R
    this.bitmap.data[idx + 1] = 255; // G
    this.bitmap.data[idx + 2] = 255; // B
    this.bitmap.data[idx + 3] = 255; // A
  });

  // Filled bar (biru atau hijau)
  bg.scan(barX, barY, filledWidth, barHeight, function (x, y, idx) {
    this.bitmap.data[idx + 0] = 50;  // R
    this.bitmap.data[idx + 1] = 200; // G
    this.bitmap.data[idx + 2] = 255; // B
    this.bitmap.data[idx + 3] = 255; // A
  });

  return await bg.getBufferAsync(Jimp.MIME_PNG);
}

module.exports = generateLevelCard;