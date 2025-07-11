const { checkCooldown } = require('../../../helper/cooldownHelper');
const User = require('../../../models/User');

module.exports = {
  name: 'beg',
  description: 'Minta sedekah dan dapatkan coins secara rawak.',
  cooldown: 30, // cooldown dalam saat
  category: 'Economy',

  async execute(message) {

    const userId = message.author.id;

    // Cari atau buat user dalam DB
    let user = await User.findOne({ userId });
    if (!user) {
      user = await User.create({ userId, balance: 0, stamina: 5 });
    }

    // Senarai respon rawak
    const beggers = [
      'Oi miskin nah duit.',
      'Kesian kau mintak sedekah nah.',
      'Alahai pengemis nahlah.',
      'Eh terkejut saya , kesiannye.',
      'Menariknya aksi awak buat.',
    ];

    const fails = [
      'Kerja la jangan mengemis je.',
        'Orang tengok pun kesian, tapi tak bagi apa pun.',
        'Kesian... tapi saya pun pokai bang.',
        'Takde rezeki hari ni, cuba esok ye.',
    ];

    const isFail = Math.random() < 0.1;

    if (isFail) {
      const fails = fails[Math.floor(Math.random() * fails.length)];
      return message.channel.send(`${fails}\nNo money for you!`)
    }

    const amount = Math.floor(Math.random() * 500) + 1; // 1 - 100 coins
    const reason = beggers[Math.floor(Math.random() * beggers.length)];

    user.balance += amount;
    await user.save();

    // Hantar mesej (bukan reply)
    await message.channel.send(`${reason}\nAnda menerima **$${amount} coins**!`);
  }
};