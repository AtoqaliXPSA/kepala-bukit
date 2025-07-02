const User = require('../../models/User');
const { Collection } = require('discord.js');

const dailyLimit = 3;
const resetTime = 24 * 60 * 60 * 1000; // 24 jam

// Cache untuk simpan transaksi harian sementara (boleh ganti dengan DB jika mahu persistent)
const payCooldown = new Collection();

module.exports = {
  name: 'pay',
  alias: ['give'],
  description: 'Hantar coins kepada pengguna lain',
  cooldown: 5,

  async execute(message, args) {
    const target = message.mentions.users.first();
    const amount = parseInt(args[1]);
    const senderId = message.author.id;

    // ❌ Validasi input
    if (!target || isNaN(amount) || amount <= 0) {
      return message.reply('Sila tag pengguna dan masukkan jumlah yang sah. Contoh: `!pay @user 100`');
    }
    if (target.bot) return message.reply('🤖 Anda tidak boleh hantar duit kepada bot!');
    if (target.id === senderId) return message.reply('Anda tidak boleh bayar kepada diri sendiri.');

    // ✅ Ambil data user
    const sender = await User.findOne({ userId: senderId }) || await new User({ userId: senderId, balance: 500 }).save();
    const receiver = await User.findOne({ userId: target.id }) || await new User({ userId: target.id, balance: 500 }).save();
    const gov = await User.findOne({ userId: 'ADMIN_ID' }) || await new User({ userId: 'ADMIN_ID', balance: 0 }).save();

    // ❌ Cek balance
    if (sender.balance < amount) {
      return message.reply(`Anda cuma ada  $${sender.balance} coins.`);
    }

    // ⏳ Semak limit harian
    const now = Date.now();
    const key = `pay_${senderId}`;

    let userData = payCooldown.get(key) || { count: 0, lastReset: now };
    if (now - userData.lastReset > resetTime) {
      userData = { count: 0, lastReset: now };
    }

    if (userData.count >= dailyLimit) {
      const nextReset = new Date(userData.lastReset + resetTime);
      const hoursLeft = Math.ceil((nextReset - now) / 3600000);
      return message.reply(`Anda hanya boleh buat **${dailyLimit} pemindahan sehari**. Cuba lagi dalam ${hoursLeft} jam.`);
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

    // ✅ Update cache
    userData.count++;
    payCooldown.set(key, userData);

    return message.reply(
      `Anda telah hantar **$${amountAfterTax} coins** kepada <@${target.id}>.\n` +
      `Tax: **$${taxAmount} coins**\n` +
      `Pemindahan hari ini:${userData.count}/${dailyLimit}`
    );
  }
};