const { Events } = require('discord.js');

module.exports = function setupSlashHandler(client) {
  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isCommand()) return;

    const command = client.slashCommands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: 'Error executing this slash command!', ephemeral: true });
    }
  });
};