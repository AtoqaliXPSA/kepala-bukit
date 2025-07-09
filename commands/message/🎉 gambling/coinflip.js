// commands/message/fun/coinflip.js
const { AttachmentBuilder } = require('discord.js');
const Canvas = require('@napi-rs/canvas');
const path = require('path');

module.exports = {
  name: 'coinflip',
  alias: ['cf', 'flip'],
  description: 'Flip a coin and test your luck!',

  async execute(message) {
    const coinSides = ['Heads', 'Tails'];
    const chosen = coinSides[Math.floor(Math.random() * coinSides.length)];

    const canvas = Canvas.createCanvas(400, 400);
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Glow Circle
    ctx.beginPath();
    ctx.arc(200, 200, 160, 0, Math.PI * 2, true);
    ctx.fillStyle = '#00f0ff88';
    ctx.fill();

    // Coin Circle
    ctx.beginPath();
    ctx.arc(200, 200, 130, 0, Math.PI * 2, true);
    ctx.fillStyle = '#ffe066';
    ctx.fill();

    // Coin Text
    ctx.fillStyle = '#000';
    ctx.font = 'bold 48px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(chosen, 200, 200);

    // Send animation frames (simulate with image + typing)
    const flippingMsg = await message.reply('🪙 Flipping the coin...');
    setTimeout(async () => {
      const attachment = new AttachmentBuilder(await canvas.encode('png'), {
        name: 'coinflip.png',
      });
      await flippingMsg.edit({ content: `🎉 It's **${chosen}**!`, files: [attachment] });
    }, 1500);
  },
};