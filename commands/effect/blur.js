const { AttachmentBuilder } = require('discord.js');
const canvacord = require('canvacord');
const axios = require('axios');

module.exports = {
  name: 'blur',
  description: 'Kaburkan avatar pengguna',
  cooldown: 5,

  async execute(message) {
    try {
      const targetUser = message.mentions.users.first() || message.author;
      const avatarURL = targetUser.displayAvatarURL({ format: 'png', size: 512 });

      // Dapatkan avatar sebagai buffer betul
      const response = await axios.get(avatarURL, { responseType: 'arraybuffer' });
      const avatarBuffer = Buffer.from(response.data); // ❗ PENTING

      const image = await canvacord.Canvas.blur(avatarBuffer);

      const attachment = new AttachmentBuilder(image, { name: 'blur.png' });
      await message.reply({ files: [attachment] });
    } catch (error) {
      console.error('❌ Error in blur command:', error);
      message.reply('⚠️ Gagal kaburkan avatar.');
    }
  }
};