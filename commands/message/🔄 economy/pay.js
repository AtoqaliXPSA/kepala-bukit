const User = require('../../../models/User');

module.exports = {
  name: 'pay',
  alias: ['give'],
  description: 'Hantar coins kepada pengguna lain dengan cukai 3%',
  cooldown: 5,

  async execute(message, args) {
    const target = message.mentions.users.first();
    const amount = parseInt(args[1]);
    const senderId = message.author.id;

    // ❌ Validasi input
    if (!target || isNaN(amount) || amount <= 0) {
      return message.reply('`Please tag @User to give coins.`');
    }

    if (target.bot) return message.reply('🤖 You cannot sent money to bot !');
    if (target.id === senderId) return message.reply('Cannot sent money to yourself.');

    // ✅ Ambil data user
    const sender = await User.findOne({ userId: senderId }) || await new User({ userId: senderId, balance: 500 }).save();
    const receiver = await User.findOne({ userId: target.id }) || await new User({ userId: target.id, balance: 500 }).save();
    const gov = await User.findOne({ userId: 'GOV_WALLET' }) || await new User({ userId: 'GOV_WALLET', balance: 0 }).save();

    // ❌ Cek balance
    if (sender.balance < amount) {
      return message.reply(`You have only ***$${sender.balance} coins***.`);
    }

    // 💸 Kirakan cukai
    const taxRate = 0.03;
    const taxAmount = Math.floor(amount * taxRate);
    const amountAfterTax = amount - taxAmount;

    // 🔁 Update data
    sender.balance -= amount;
    receiver.balance += amountAfterTax;
    gov.balance += taxAmount;

    await sender.save();
    await receiver.save();
    await gov.save();

    // ✅ Notifikasi
    return message.reply(
      `You sent money ** $${amountAfterTax} coins** to <@${target.id}>.\n` +
      `Tax: **${taxAmount} coins**.`
    );
  }
};