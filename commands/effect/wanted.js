const { AttachmentBuilder } = require('discord.js');

module.exports = {
  name: 'wanted',
  description: '🎯 Buat poster wanted dari avatar user',
  cooldown: 5,

  async execute(message) {
    try {
      const user = message.mentions.users.first() || message.author;
      const avatar = user.displayAvatarURL({ format: 'png', size: 512 });

      // ⛔️ Penting: Import ESM module secara dinamik
      const canvacord = await import('canvacord');
      const image = await canvacord.Canvas.wanted(avatar);

      const attachment = new AttachmentBuilder(image, { name: 'wanted.png' });
      await message.reply({ files: [attachment] });

    } catch (err) {
      console.error('❌ Error in wanted command:', err);
      return message.reply('⚠️ Gagal hasilkan gambar "wanted".');
    }
  }
};