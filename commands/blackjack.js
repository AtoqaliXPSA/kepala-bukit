const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');

const blackjackHelper = require('../utils/blackjackHelper');
const economy = require('../utils/economy');

const MIN_BET = 1;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('blackjack')
    .setDescription('Main blackjack dengan pertaruhan!')
    .addIntegerOption(option =>
      option
        .setName('bet')
        .setDescription('Jumlah pertaruhan (min 1)')
        .setRequired(true)
        .setMinValue(MIN_BET)
    ),

  async execute(interaction) {
    await interaction.deferReply();

    // ✅ Ambil nilai pertaruhan dari user
    const bet = interaction.options.getInteger('bet');

    // ✅ Semak baki dan tolak duit
    const userData = await economy.getUser(interaction.user.id);
    if (!userData || userData.balance < bet) {
      return await interaction.editReply({
        content: '❌ Anda tidak cukup coins untuk bertaruh.',
        ephemeral: true
      });
    }

    // ✅ Tolak duit dari akaun user
    await economy.addBalance(interaction.user.id, -bet);

    // ✅ Mulakan game
    const game = blackjackHelper.createGame();
    const embed = blackjackHelper.createEmbed(game, interaction.user);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('hit')
        .setLabel('🃏 Hit')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('stand')
        .setLabel('✋ Stand')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('cancel')
        .setLabel('❌ Cancel')
        .setStyle(ButtonStyle.Danger)
    );

    const message = await interaction.editReply({
      content: `Anda telah bertaruh **${bet} coins**.`,
      embeds: [embed],
      components: [row]
    });

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
        await i.update({ content: '❌ Permainan dibatalkan.', embeds: [], components: [] });
        collector.stop();
      }
    });

    collector.on('end', async (_, reason) => {
      if (reason === 'time') {
        await interaction.editReply({
          content: '⏰ Masa tamat. Permainan dibatalkan.',
          embeds: [],
          components: []
        });
      } else if (reason === 'bust') {
        await interaction.editReply({
          content: '💥 Anda terkeluar (Bust)!',
          embeds: [],
          components: []
        });
      }
    });
  },
};