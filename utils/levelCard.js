const { createCanvas, loadImage, registerFont } = require('canvas');
const path = require('path');

registerFont(path.join(__dirname, '../fonts/Poppins-Bold.ttf'), { family: 'Poppins' });

async function generateLevelCard({ username, avatarURL, level, xp, xpNeeded }) {
  const canvas = createCanvas(800, 250);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#111';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const avatar = await loadImage(avatarURL);
  ctx.save();
  ctx.beginPath();
  ctx.arc(125, 125, 75, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(avatar, 50, 50, 150, 150);
  ctx.restore();

  ctx.fillStyle = '#0f0';
  ctx.font = '28px Poppins';
  ctx.fillText(username, 230, 80);

  ctx.font = '22px Poppins';
  ctx.fillText(`Level: ${level}`, 230, 120);
  ctx.fillText(`XP: ${xp} / ${xpNeeded}`, 230, 160);

  const barWidth = 400;
  const progress = Math.min(xp / xpNeeded, 1);
  ctx.fillStyle = '#333';
  ctx.fillRect(230, 180, barWidth, 20);
  ctx.fillStyle = '#0f0';
  ctx.fillRect(230, 180, barWidth * progress, 20);

  return canvas.toBuffer('image/png');
}

module.exports = generateLevelCard;