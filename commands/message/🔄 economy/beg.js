const User = require('../../../models/User');

module.exports = {
  name: 'beg',
  description: 'Beg for coins with a chance of failure or success.',
  cooldown: 30,
  category: 'Economy',

  async execute(message) {
    const userId = message.author.id;

    // Find or create user
    let user = await User.findOneAndUpdate(
      { userId },
      { $setOnInsert: { balance: 0 } },
      { upsert: true, new: true }
    );

    // Failure messages (English insults)
    const failMessages = [
      "You're so broke, even charity said no.",
      "No one wants to give you a penny. Try harder!",
      "People laughed at your begging face. No coins for you.",
      "You look too desperate... They just walked away.",
      "Not even a single soul cared about you. Sad."
    ];

    // Success messages (English kind words)
    const successMessages = [ 
      "You got lucky! A generous soul helped you."
    ];

    // 10% fail chance
    if (Math.random() < 0.1) {
      const failMsg = failMessages[Math.floor(Math.random() * failMessages.length)];
      return message.channel.send(`**${failMsg}**`);
    }

    // Success
    const amount = Math.floor(Math.random() * 500) + 1;
    const successMsg = successMessages[Math.floor(Math.random() * successMessages.length)];

    user.balance += amount;
    await user.save();

    await message.channel.send(`**${successMsg}** You received **$${amount} coins!**`);
  }
};