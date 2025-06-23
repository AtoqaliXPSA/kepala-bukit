const { AttachmentBuilder } = require('discord.js');
const canvacord = require('canvacord');

module.exports = {
  name: 'blur',
  description: 'Blur avatar pengguna',
  cooldown: 5,

  async execute(message) {
    const avatar = message.author.displayAvatarURL({ format: 'png', size: 512 });

    const image = await canvacord.Canvas.blur(avatar); // 🔵 Apply blur effect

    const attachment = new AttachmentBuilder(image, { name: 'blurred.png' });

    message.reply({ files: [attachment] });
  }
};