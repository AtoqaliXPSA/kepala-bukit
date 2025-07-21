const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('servers')
    .setDescription('Where bot is in server'),

  async execute(interaction) {
    const guilds = await Promise.all(
      interaction.client.guilds.cache.map(async (g) => {
        let ownerName = "Unknown";
        try {
          const owner = await g.fetchOwner();
          ownerName = owner.user.tag;
        } catch (err) {
          console.error(`Error fetch owner for ${g.name}:`, err.message);
        }

        const memberCount = g.memberCount || 0;
        const channelCount = g.channels.cache.size;
        return `\`• ${g.name} (ID: ${g.id})\n    Owner: ${ownerName} | % ${memberCount} Members | # ${channelCount} Channel\``;
      })
    );

    if (guilds.length === 0) {
      return interaction.reply('**Bot is not any servers.**');
    }

    const serverList = guilds.join('\n\n');

    if (serverList.length > 2000) {
      return interaction.reply(
        `Bot in **${guilds.length} server**, too long to show in chat.`
      );
    }

    await interaction.reply(`\`< List server this bots >\`
    \n\n${serverList}`);
  },
};