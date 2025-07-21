const User = require('../../../models/User');

module.exports = {
  name: 'horserace',
  alias: ['race', 'horse'],
  description: 'Race horse!',
  cooldown: 15,

  async execute(message, args) {
    const userId = message.author.id;
    let user = await User.findOne({ userId });
    if (!user) user = await User.create({ userId, balance: 0 });

    const bet = parseInt(args[1]);
    const horseChoice = parseInt(args[0]);

    if (!horseChoice || isNaN(bet) || bet <= 0)
      return message.reply('`Please choose horse (1-4) and bet amount.`');
    if (horseChoice < 1 || horseChoice > 4)
      return message.reply('Please choose horse **1 - 4**.');
    if (user.balance < bet)
      return message.reply('Your balance is insufficient.');

    const horses = [
      { icon: '🐎', name: 'Thunder', progress: 0 },
      { icon: '🏇', name: 'Shadow',  progress: 0 },
      { icon: '🐴', name: 'Blaze',   progress: 0 },
      { icon: '🦄', name: 'Rainbow', progress: 0 },
    ];

    const trackLength = 20;
    const sleep = ms => new Promise(res => setTimeout(res, ms));
    const raceMsg = await message.channel.send('🏁 **Bersedia untuk perlumbaan kuda!**');

    // Countdown
    for (let i = 3; i > 0; i--) {
      await raceMsg.edit(`🏁 **Race start in... ${i}**`);
      await sleep(1000);
    }
    await raceMsg.edit('🚦 **GO!GO!GO!**');

    let raceOver = false;
    while (!raceOver) {
      for (const horse of horses) {
        horse.progress += Math.floor(Math.random() * 3); // 0-2 langkah
        if (horse.progress >= trackLength) {
          horse.progress = trackLength;
          raceOver = true;
        }
      }

      const topLine = '**Track Horse**\n' + '🏁';
      const bottomLine = '🏁';

      const raceTrack = horses.map((h, i) => {
        const track = ' '.repeat(trackLength - h.progress);
        const dash = '━'.repeat(h.progress);
        return `${h.name.padEnd(8)} |${dash} ${h.icon} ${track}`;
      }).join('\n');

      await raceMsg.edit(`${topLine}\n${raceTrack}\n${bottomLine}`);
      await sleep(800);
    }

    // Tentukan pemenang
    const maxProgress = Math.max(...horses.map(h => h.progress));
    const winners = horses
      .map((h, i) => (h.progress === maxProgress ? i : null))
      .filter(i => i !== null);
    const winnerIndex = winners[Math.floor(Math.random() * winners.length)];
    const winner = horses[winnerIndex];

    let result = `\n**The winner:** ${winner.icon} ${winner.name}\n`;
    if (horseChoice - 1 === winnerIndex) {
      const prize = bet * 2;
      user.balance += prize;
      result += `You Win! **$${prize}** coins.`;
    } else {
      user.balance -= bet;
      result += `You lose **${bet}** coins.`;
    }

    await user.save();
    await raceMsg.edit(`${raceMsg.content}\n\n**Race End!**\n${result}`);
  }
};
