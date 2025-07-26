const User = require('../models/User');

module.exports = {
  name: 'messageXP',
  async execute(message) {
    if (!message.guild || message.author.bot) return;

    let user = await User.findOne({ userId: message.author.id });
    if (!user) {
      user = await User.create({ userId: message.author.id, xp: 0, level: 1 });
    }

    user.xp += 1;
    const requiredXP = Math.floor(50 * user.level + 100);

    if (user.xp >= requiredXP) {
      user.level++;
      user.xp = 0;
      await user.save();
      message.channel.send(`🎉 ${message.author} , up to level **${user.level}**!`);
    } else {
      await user.save();
    }
  }
};