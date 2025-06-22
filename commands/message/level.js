const { AttachmentBuilder } = require('discord.js');
const generateLevelCard = require('../../utils/levelCard');
const User = require('../../models/User'); // MongoDB schema

module.exports = {
  name: 'level',
  description: 'Lihat tahap dan XP anda',
  async execute(message) {
    const userId = message.author.id;

    let userData = await User.findOne({ userId });
    if (!userData) {
      userData = await User.create({
        userId,
        balance: 0,
        lastDaily: null,
        xp: 0,
        level: 1
      });
    }

    const xp = userData.xp || 0;
    const level = userData.level || 1;
    const xpNeeded = level * 100;

    const buffer = await generateLevelCard({
      username: message.author.username,
      avatarURL: message.author.displayAvatarURL({ format: 'png', size: 256 }),
      level,
      xp,
      xpNeeded
    });

    const attachment = new AttachmentBuilder(buffer, { name: 'levelcard.png' });

    message.reply({ files: [attachment] });
  }
};