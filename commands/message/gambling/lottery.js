const User = require('../../../models/User');
const Ticket = require('../../../models/LotteryTicket');

module.exports = {
  name: 'buylottery',
  alias: ['lottery', 'bl'],
  description: 'Beli tiket loteri dengan harga $1,000 setiap satu.',
  cooldown: 5,

  async execute(message, args) {
    const userId = message.author.id;
    const user = await User.findOne({ userId }) || await new User({ userId, balance: 0 }).save();

    const ticketPrice = 1000;
    const amount = parseInt(args[0]) || 1;

    const totalCost = ticketPrice * amount;

    if (user.balance < totalCost) {
      return message.reply(`Anda perlukan $${totalCost} untuk beli ${amount} tiket.`);
    }

    user.balance -= totalCost;
    await user.save();

    const ticket = await Ticket.findOne({ userId }) || new Ticket({ userId, count: 0 });
    ticket.count += amount;
    await ticket.save();

    return message.channel.send(`Anda telah membeli **${amount} tiket** untuk $${totalCost}.`);
  }
};