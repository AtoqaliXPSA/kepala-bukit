const User = require('../../models/User');

module.exports = {
  name: 'pay',
  alias: ['give'],
  description: 'Hantar coins kepada pengguna lain',
  cooldown: 5,

  async execute(message, args) {
    const target = message.mentions.users.first();
    const amount = parseInt(args[1]);

    // 🔍 Semakan awal
    if (!target || isNaN(amount) || amount <= 0) {
      return message.reply('Sila tag pengguna dan masukkan jumlah yang sah.\nContoh: `!pay @user 100`');
    }

    if (target.bot) return message.reply('🤖 Anda tidak boleh hantar duit kepada bot!');
    if (target.id === message.author.id) return message.reply('❌ Anda tidak boleh bayar kepada diri sendiri.');

    // ✅ Dapatkan data pengguna dari DB
    const sender = await User.findOne({ userId: message.author.id }) ||
      await new User({ userId: message.author.id, balance: 500 }).save();

    const receiver = await User.findOne({ userId: target.id }) ||
      await new User({ userId: target.id, balance: 500 }).save();

    if (sender.balance < amount) {
      return message.reply(`Duit anda tidak mencukupi. Anda cuma ada 💰 ${sender.balance} coins.`);
    }

    // 💸 Kira cukai
    const taxRate = 0.03;
    const taxAmount = Math.floor(amount * taxRate);
    const amountAfterTax = amount - taxAmount;

    // 🔁 Transaksi
    sender.balance -= amount;
    receiver.balance += amountAfterTax;

    await sender.save();
    await receiver.save();

    return message.reply(
      `Berjaya , Anda telah hantar **$${amountAfterTax} coins** kepada <@${target.id}>.\n` +
      `Tax: **$${taxAmount} coins** (3%)`
    );
  }
};