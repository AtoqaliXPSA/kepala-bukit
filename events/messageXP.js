const User = require('../models/User');

module.exports = {
  name: 'messageCreate',
  async execute(message) {
    if (message.author.bot || !message.guild) return;

    // Cari user
    let user = await User.findOne({ userId: message.author.id });
    if (!user) {
      user = await User.create({ userId: message.author.id, xp: 0, level: 1 });
    }

    // Tambah XP
    user.xp += 1;
    const nextLevelXP = 50 + (user.level * 10);
    if (user.xp >= nextLevelXP) {
      user.level++;
      user.xp = 0;
      await message.channel.send(`🎉 ${message.author} naik ke Level **${user.level}**!`);
    }

    await user.save();
  }
};