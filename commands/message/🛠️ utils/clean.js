module.exports = {
  name: 'clean',
  alias: ['purge'],
  description: 'Padam mesej dalam channel',
  async execute(message, args) {
    // Semak jika user ada permission
    if (!message.member.permissions.has('ManageMessages')) {
      return message.reply('❌ Anda tidak ada kebenaran untuk padam mesej.');
    }

    const amount = parseInt(args[0]);

    if (isNaN(amount) || amount < 1 || amount > 100) {
      return message.reply('`Insert amount to delete message.`');
    }

    try {
      await message.channel.bulkDelete(amount + 1, true); // +1 termasuk command
      const reply = await message.channel.send(`✅ ${amount} message is deleted.`);
      setTimeout(() => reply.delete().catch(() => {}), 3000); // auto delete notifikasi
    } catch (err) {
      console.error(err);
      message.reply('Error to delete message.');
    }
  }
};