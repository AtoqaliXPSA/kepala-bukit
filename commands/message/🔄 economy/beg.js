const { checkCooldown } = require('../../../helper/cooldownHelper');
const User = require('../../../models/User');

module.exports = {
  name: 'beg',
  description: 'Minta sedekah dan dapatkan coins secara rawak.',
  cooldown: 30, // cooldown dalam saat
  category: 'Economy',

  async execute(message) {
    const userId = message.author.id;

    // Periksa cooldown
    if (await checkCooldown(message, this.name, this.cooldown)) return;

    // Cari atau buat user dalam DB
    let user = await User.findOneAndUpdate(
      { userId },
      { $setOnInsert: { balance: 0 } },
      { upsert: true, new: true }
    );

    // Senarai respon rawak
    const beggers = [
      'Oi miskin nah duit.',
      'Kesian kau mintak sedekah nah.',
      'Alahai pengemis nahlah.',
      'Eh terkejut saya , kesiannye.',
      'Menariknya aksi awak buat.',
    ];

    const failMessages = [
      'Kerja la jangan mengemis je.',
      'Orang tengok pun kesian, tapi tak bagi apa pun.',
      'Kesian... tapi saya pun pokai bang.',
      'Takde rezeki hari ni, cuba esok ye.',
    ];

    // 10% peluang gagal
    if (Math.random() < 0.1) {
      const failMsg = failMessages[Math.floor(Math.random() * failMessages.length)];
      return message.channel.send(`${failMsg}\n**No money for you!**`);
    }

    // 1 - 500 coins
    const amount = Math.floor(Math.random() * 500) + 1;
    const reason = beggers[Math.floor(Math.random() * beggers.length)];

    // Tambah balance
    user.balance += amount;
    await user.save();

    // Hantar mesej
    await message.channel.send(`${reason}\n**You got $${amount} coins!**`);
  }
};