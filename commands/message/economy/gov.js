const User = require('../../models/User');

module.exports = {
  name: 'gov',
  alias: ['govbalance', 'kerajaan'],
  description: 'Lihat baki coins dalam dompet kerajaan',

  async execute(message) {
    const gov = await User.findOne({ userId: 'GOV_WALLET' }) ||
      await new User({ userId: 'GOV_WALLET', balance: 0 }).save();

    return message.reply(`**Dompet Kerajaan** kini mempunyai ** $${gov.balance} coins**.`);
  }
};