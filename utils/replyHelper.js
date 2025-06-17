const { MessageFlags } = require('discord.js');

    module.exports = {
      reply(interaction, options) {
        return interaction.reply(options);
      },
      ephemeral(interaction, options) {
        if (typeof options === 'string') {
          options = { content: options };
        }
        // Guna flags untuk buat mesej ephemeral
        return interaction.reply({
          ...options,
          flags: 1 << 6 // Discord.MessageFlags.Ephemeral
        });
      },

  // Dalam helpers/replyHelper.js
  async edit(interaction, options) {
    return interaction.editReply(options);
  }

  
};
