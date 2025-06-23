const { AttachmentBuilder } = require('discord.js');
const canvacord = require('canvacord');

module.exports = {
  name: 'stewie',
  description: '🍼 Letak muka Stewie Griffin atas avatar pengguna.',
  aliases: ['stewiegriffin'],
  cooldown: 5,

  async execute(message, args, client) {
    try {
      // Ambil user (mention atau diri sendiri)
      const user = message.mentions.users.first() || message.author;

      // Ambil avatar pengguna
      const avatar = user.displayAvatarURL({ format: 'png', size: 256 });

      // Proses dengan canvacord
      const image = await canvacord.Canvas.stewie(avatar);

      // Hantar imej sebagai fail
      const attachment = new AttachmentBuilder(image, { name: 'stewie.png' });
      await message.reply({ files: [attachment] });

    } catch (err) {
      console.error('❌ Error in stewie command:', err);
      message.reply('⚠️ Berlaku ralat semasa hasilkan gambar.');
    }
  }
};