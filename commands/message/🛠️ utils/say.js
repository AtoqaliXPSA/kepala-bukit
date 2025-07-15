module.exports = {
  name: 'say',
  description: 'Bot akan ulang mesej anda',
  cooldown: 5,

  async execute(message, args) {
    const msg = args.join(' ');
    if (!msg) {
      return message.reply('`Please type message to repeat.`');
    }

    try {
      await message.delete(); // padam mesej pengguna
    } catch (err) {
      console.warn('Cannot delete message:', err.message);
    }

    await message.channel.send(msg); // hantar mesej sebagai bot
  }
};