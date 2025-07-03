const { checkCooldown } = require('../../utils/cooldownHelper');
const User = require('../../models/User');

module.exports = {
  name: 'beg',
  description: 'Minta sedekah dan dapatkan coins secara rawak.',
  cooldown: 30, // cooldown dalam saat

  async execute(message) {
    // Cek cooldown
    const onCooldown = await checkCooldown(message, 'beg', 30);
    if (onCooldown) return;

    const userId = message.author.id;

    // Cari atau buat user dalam DB
    let user = await User.findOne({ userId });
    if (!user) {
      user = await User.create({ userId, balance: 0, stamina: 5 });
    }

    // Senarai respon rawak
    const beggers = [
      'Orang tua di tepi jalan kasihan pada kamu.',
      'Budak kecil bagi kamu sedikit syiling.',
      'Pengemis profesional bagi tunjuk ajar.',
      'Seorang dermawan murah hati tiba-tiba muncul.',
      'Pelancong asing tertarik dan beri kamu duit.',
    ];

    const amount = Math.floor(Math.random() * 500) + 1; // 1 - 100 coins
    const reason = beggers[Math.floor(Math.random() * beggers.length)];

    user.balance += amount;
    await user.save();

    // Hantar mesej (bukan reply)
    await message.channel.send(`${reason}\nAnda menerima **$${amount} coins**!`);
  }
};