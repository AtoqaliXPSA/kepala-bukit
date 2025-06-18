const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const blackjackHelper = require('../utils/blackjackHelper');
const MIN_BET = 1;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('blackjack')
    .setDescription('Main blackjack dengan pertaruhan!')
    .setMinValue(MIN_BET),

  async execute(interaction) {
    await interaction.deferReply();

    const userData = await economy.getUser(interaction.user.id);
    if (!userData || userData.balance < bet) {
      return interaction.reply({
        content: '❌ Anda tidak cukup coins untuk bertaruh.',
        flags : 64
      });
    }

    const game = blackjackHelper.createGame();

    const embed = blackjackHelper.createEmbed(game, interaction.user);
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder().setCustomId('hit').setLabel('🃏 Hit').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('stand').setLabel('✋ Stand').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('cancel').setLabel('❌ Cancel').setStyle(ButtonStyle.Danger),
      );

    const message = await interaction.editReply({ embeds: [embed], components: [row] });

    const filter = i => i.user.id === interaction.user.id;
    const collector = message.createMessageComponentCollector({ filter, time: 60000 });

    collector.on('collect', async i => {
      if (i.customId === 'hit') {
        blackjackHelper.playerHit(game);
        const updatedEmbed = blackjackHelper.createEmbed(game, interaction.user, true);
        await i.update({ embeds: [updatedEmbed], components: [row] });

        if (game.player.total > 21) {
          collector.stop('bust');
        }

      } else if (i.customId === 'stand') {
        blackjackHelper.dealerPlay(game);
        const resultEmbed = blackjackHelper.finalResultEmbed(game, interaction.user);
        await i.update({ embeds: [resultEmbed], components: [] });
        collector.stop();

      } else if (i.customId === 'cancel') {
        await i.update({ content: 'Permainan dibatalkan.', embeds: [], components: [] });
        collector.stop();
      }
    });

    collector.on('end', (_, reason) => {
      if (reason === 'time') {
        interaction.editReply({ content: '⏰ Masa tamat. Permainan dibatalkan.', embeds: [], components: [] });
      }
    });
  },
};