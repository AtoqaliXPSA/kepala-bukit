const { AttachmentBuilder } = require('discord.js');

module.exports = {
  name: 'blur',
  description: 'Kaburkan avatar pengguna',
  aliases: ['bl'],
  cooldown: 5,

  async execute(message, args) {
    try {
      // 🧠 Dynamic import kerana canvacord adalah ESM
      const { Canvas } = await import('canvacord');

      // 🎯 Cari user yang disebut atau fallback ke author
      let user = message.mentions.users.first() || message.author;

      // 🎨 Dapatkan avatar PNG user
      const avatar = user.displayAvatarURL({ format: 'png', size: 512 });

      // 🔄 Proses blur
      const image = await Canvas.blur(avatar);
      const attachment = new AttachmentBuilder(image, { name: 'blur.png' });

      // 🖼️ Hantar gambar blur
      await message.reply({ files: [attachment] });

    } catch (err) {
      console.error('❌ Error in blur command:', err);
      await message.reply('⚠️ Gagal kaburkan avatar.');
    }
  }
};