const { AttachmentBuilder } = require('discord.js');

module.exports = {
  name: 'wanted',
  description: '🪧 Buat gambar wanted poster daripada avatar pengguna.',
  cooldown: 5,

  async execute(message, args, client) {
    try {
      const user = message.mentions.users.first() || message.author;
      const avatar = user.displayAvatarURL({ format: 'png', size: 512 });

      // ✅ Import canvacord secara dinamik
      const canvacord = await import('canvacord');
      const image = await canvacord.Canvas.wanted(avatar);

      const attachment = new AttachmentBuilder(image, { name: 'wanted.png' });
      await message.reply({ files: [attachment] });

    } catch (err) {
      console.error('❌ Error in wanted command:', err);
      message.reply('⚠️ Ralat berlaku semasa menjana gambar "wanted".');
    }
  }
};