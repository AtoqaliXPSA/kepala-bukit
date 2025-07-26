module.exports = {
  name: 'ready',
  once: true, // run sekali sahaja
  async execute(client) {
    console.log(`🤖 Bot is online as ${client.user.tag}`);
    client.user.setPresence({
      activities: [{ name: 'over your /help 👀', type: 3 }],
      status: 'online',
    });
  }
};