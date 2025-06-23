const { AttachmentBuilder } = require('discord.js');

module.exports = {
  name: 'blur',
  description: 'Kaburkan avatar pengguna',

  async execute(message) {
    try {
      // 🧠 Guna dynamic import untuk ESM module
      const { Canvas } = await import('canvacord');

      // 🎯 Ambil avatar user (atau user yang disebut)
      const user = message.mentions.users.first() || message.author;
      const avatarURL = user.displayAvatarURL({ format: 'png', size: 512 });

      // 🔄 Buat imej blur
      const image = await Canvas.blur(avatarURL);

      // 🖼️ Hantar sebagai attachment
      const attachment = new AttachmentBuilder(image, { name: 'blur.png' });
      await message.reply({ files: [attachment] });

    } catch (err) {
      console.error('❌ Error in blur command:', err);
      message.reply('⚠️ Gagal kaburkan avatar. Sila cuba lagi.');
    }
  }
};