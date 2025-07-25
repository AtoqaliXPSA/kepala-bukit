const User = require('../models/User');

module.exports = async function xpHandler(message) {
  try {
    const user = await User.findOneAndUpdate(
      { userId: message.author.id },
      { $inc: { xp: 1 } },
      { upsert: true, new: true },
    );

    const need = Math.floor(50 * user.level + 100);
    if (user.xp >= need) {
      user.level++;
      user.xp = 0;
      await user.save();
      message.channel.send(`🎉 ${message.author} naik ke Level ${user.level}!`);
    }
  } catch (e) {
    console.error('XP Error:', e);
  }
};