const { AttachmentBuilder } = require('discord.js');

module.exports = {
  name: 'blur',
  description: 'Kaburkan avatar anda!',
  cooldown: 5,

  async execute(message) {
    try {
      const { Canvas } = await import('canvacord');
      const avatar = message.author.displayAvatarURL({ extension: 'png', size: 512 });
      const image = await Canvas.blur(avatar);

      const attachment = new AttachmentBuilder(image, { name: 'blur.png' });
      await message.channel.send({ files: [attachment] });
    } catch (err) {
      console.error('❌ Error in blur command:', err);
      message.reply('⚠️ Gagal kaburkan avatar.');
    }
  }
};