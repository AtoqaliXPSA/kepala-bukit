const { AttachmentBuilder } = require('discord.js');
const generateLevelCard = require('../../../utils/levelCard');
const User = require('../../../models/User');

module.exports = {
  name: 'level',
  alias: ['xp'],
  description: 'Semak tahap XP anda',
  cooldown: 5,
  async execute(message) {
    const userData = await User.findOne({ userId: message.author.id });

    if (!userData) return message.reply('❌ Anda belum ada data XP.');

    const level = userData.level || 1;
    const xp = userData.xp || 0;
    const maxXp = level * 100;
    const rank = 1234; // Contoh, boleh kira ikut leaderboard

    const avatarURL = message.author.displayAvatarURL({ extension: 'png', size: 512 });

    const imageBuffer = await generateLevelCard({
      username: message.author.username,
      level,
      xp,
      maxXp,
      rank,
      avatarURL,
    });

    const attachment = new AttachmentBuilder(imageBuffer, { name: 'level.png' });
    message.channel.send({ files: [attachment] });
  }
};