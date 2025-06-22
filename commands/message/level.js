const { AttachmentBuilder } = require('discord.js');
const generateLevelCard = require('../../utils/levelCard');

// Simpanan contoh, nanti boleh sambung MongoDB
const userData = {
  level: 5,
  xp: 120,
  xpNeeded: 200,
};

module.exports = {
  name: 'level',
  description: 'Tunjuk level kamu',
  async execute(message) {
    const buffer = await generateLevelCard({
      username: message.author.username,
      avatarURL: message.author.displayAvatarURL({ extension: 'png', size: 128 }),
      level: userData.level,
      xp: userData.xp,
      xpNeeded: userData.xpNeeded,
    });

    const attachment = new AttachmentBuilder(buffer, { name: 'levelcard.png' });
    message.channel.send({ files: [attachment] });
  },
};