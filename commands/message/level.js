const { AttachmentBuilder } = require('discord.js');
const generateLevelCard = require('../../utils/levelCard'); // pastikan path betul
const User = require('../../models/User'); // anda punya model mongoose

module.exports = {
  name: 'level',
  alias: ['rank', 'xp'],
  description: 'Lihat level anda.',
  cooldown: 5,

  async execute(message, args, client) {
    try {
      const userId = message.author.id;
      let user = await User.findOne({ userId });

      // Jika tiada user dalam DB
      if (!user) {
        user = await User.create({ userId, balance: 0, lastDaily: null, xp: 0, level: 1 });
      }

      const level = user.level || 1;
      const xp = user.xp || 0;

      // ✅ Generate level card image
      const imageBuffer = await generateLevelCard(message.author.username, level, xp);

      const attachment = new AttachmentBuilder(imageBuffer, { name: 'background.png' });

      await message.channel.send({ files: [attachment] });

    } catch (err) {
      console.error(err);
      message.reply('❌ Ralat ketika menjana kad level.');
    }
  }
};