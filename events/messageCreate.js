const Afk = require('../models/Afk');

module.exports = {
  name: 'messageCreate',
  async execute(message) {
    if (message.author.bot) return;

    // Remove AFK jika user type
    const afkUser = await Afk.findOne({ userId: message.author.id });
    if (afkUser) {
      await Afk.deleteOne({ userId: message.author.id });
      message.reply('🟢 Selamat datang semula! Status AFK anda telah dipadam.');
    }

    // Notify jika mention AFK user
    if (message.mentions.users.size > 0) {
      message.mentions.users.forEach(async user => {
        const afkData = await Afk.findOne({ userId: user.id });
        if (afkData) {
          const time = `<t:${Math.floor(afkData.timestamp.getTime() / 1000)}:R>`;
          message.reply(`🔕 ${user.username} sedang AFK: ${afkData.reason} (${time})`);
        }
      });
    }
  }
};