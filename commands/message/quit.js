// commands/message/quit.js
const User = require('../../models/User');

module.exports = {
  name: 'quit',
  description: 'Berhenti kerja',

  async execute(message) {
    const userId = message.author.id;
    const user = await User.findOne({ userId });

    if (!user || !user.job) {
      return message.reply('Anda tidak mempunyai sebarang pekerjaan untuk berhenti.');
    }

    const oldJob = user.job;
    user.job = null;
    await user.save();

    return message.reply(`Anda telah berhenti kerja sebagai **${oldJob}**.`);
  }
};