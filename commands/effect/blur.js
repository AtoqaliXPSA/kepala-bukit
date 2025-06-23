const Jimp = require('jimp');
const { AttachmentBuilder } = require('discord.js');

module.exports = {
  name: 'blur',
  description: 'Kaburkan avatar pengguna',
  cooldown: 5,

  async execute(message) {
    try {
      const targetUser = message.mentions.users.first() || message.author;
      const avatarURL = targetUser.displayAvatarURL({ extension: 'png', size: 512 });

      const avatar = await Jimp.read(avatarURL);
      avatar.blur(10); // nilai 10 = tahap kabur

      const buffer = await avatar.getBufferAsync(Jimp.MIME_PNG);
      const attachment = new AttachmentBuilder(buffer, { name: 'blur.png' });

      await message.reply({ files: [attachment] });
    } catch (err) {
      console.error('❌ Error in blur command:', err);
      message.reply('⚠️ Gagal kaburkan avatar.');
    }
  }
};