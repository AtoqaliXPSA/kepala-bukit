// commands/message/work.js
const User = require('../../models/User');

module.exports = {
  name: 'work',
  description: 'Bekerja dan dapatkan gaji',
  cooldown: 10, // seconds

  async execute(message) {
    const userId = message.author.id;
    const user = await User.findOne({ userId });

    if (!user || !user.job) {
      return message.reply('Anda belum bekerja.');
    }

    const minPay = 50;
    const maxPay = 150;
    const salary = Math.floor(Math.random() * (maxPay - minPay + 1)) + minPay;

    user.balance += salary;
    await user.save();

    return message.reply(`Anda bekerja sebagai **${user.job}** dan mendapat **$${salary} coins**!`);
  }
};