// commands/message/apply.js
const User = require('../../models/User');

module.exports = {
  name: 'apply',
  description: 'Mohon kerja',

  async execute(message) {
    const userId = message.author.id;
    const user = await User.findOne({ userId }) || await new User({ userId, balance: 0, job: null }).save();

    if (user.job) {
      return message.reply(`Anda sudah bekerja sebagai **${user.job}**. Gunakan \`!quit\` untuk berhenti.`);
    }

    const availableJobs = ['Petani', 'Nelayan', 'Penebang Pokok', 'Pemandu Grab'];
    const job = availableJobs[Math.floor(Math.random() * availableJobs.length)];

    user.job = job;
    await user.save();

    return message.reply(`Anda telah diterima bekerja sebagai **${job}**! Gunakan \`!work\` untuk mula bekerja.`);
  }
};