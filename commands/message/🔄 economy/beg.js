const User = require('../../../models/User');

module.exports = {
  name: 'beg',
  description: 'Beg for coins with a chance of failure or success.',
  cooldown: 15,
  category: 'Economy',

  async execute(message) {
    const userId = message.author.id;

    // Cari user atau cipta
    let user = await User.findOneAndUpdate(
      { userId },
      { $setOnInsert: { balance: 0 } },
      { upsert: true, new: true }
    );

    // Mesej gagal & berjaya
    const failMessages = [
      "You're so broke, even charity said no.",
      "No one wants to give you a penny. Try harder!",
      "People laughed at your begging face. No coins for you.",
      "You look too desperate... They just walked away.",
      "Not even a single soul cared about you. Sad."
    ];

    const successMessages = [
      "You got lucky! A generous soul helped you.",
    ];

    // 10% gagal
    if (Math.random() < 0.1) {
      const fail = failMessages[Math.floor(Math.random() * failMessages.length)];
      return message.reply(`❌ **${fail}**`);
    }

    // Berjaya
    const amount = Math.floor(Math.random() * 500) + 1;
    const success = successMessages[Math.floor(Math.random() * successMessages.length)];

    await User.updateOne({ userId }, { $inc: { balance: amount } });

    return message.reply(`**${success}** You received **$${amount.toLocaleString()} coins!**`);
  }
};