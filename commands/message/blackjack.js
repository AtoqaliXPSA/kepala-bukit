const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');

const blackjackHelper = require('./utils/blackjackHelper');
const economy = require('../utils/economy');

const MIN_BET = 1;

module.exports = {
  name: 'blackjack',
  description: 'Main Blackjack dengan pertaruhan!',
  async execute(message, args) {
    const bet = parseInt(args[0]);

    if (isNaN(bet) || bet < MIN_BET) {
      return message.reply(`❌ Masukkan jumlah pertaruhan yang sah. Contoh: \`!blackjack 50\``);
    }

    const userData = await economy.getUser(message.author.id);
    if (!userData || userData.balance < bet) {
      return message.reply('❌ Anda tidak cukup coins untuk bertaruh.');
    }

    // tolak duit
    await economy.addBalance(message.author.id, -bet);

    // mula game
    const game = blackjackHelper.createGame();
    const embed = blackjackHelper.createEmbed(game, message.author);

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

    const sentMsg = await message.channel.send({
      content: `💰 Anda telah bertaruh **${bet} coins**.`,
      embeds: [embed],
      components: [row]
    });

    const filter = i => i.user.id === message.author.id;
    const collector = sentMsg.createMessageComponentCollector({ filter, time: 60000 });

    collector.on('collect', async i => {
      if (i.customId === 'hit') {
        blackjackHelper.playerHit(game);
        const updatedEmbed = blackjackHelper.createEmbed(game, message.author, true);
        await i.update({ embeds: [updatedEmbed], components: [row] });

        if (game.player.total > 21) {
          collector.stop('bust');
        }

      } else if (i.customId === 'stand') {
        blackjackHelper.dealerPlay(game);
        const resultEmbed = blackjackHelper.finalResultEmbed(game, message.author);
        await i.update({ embeds: [resultEmbed], components: [] });
        collector.stop();

      } else if (i.customId === 'cancel') {
        await i.update({ content: '❌ Permainan dibatalkan.', embeds: [], components: [] });
        collector.stop();
      }
    });

    collector.on('end', async (_, reason) => {
      if (reason === 'time') {
        await sentMsg.edit({
          content: '⏰ Masa tamat. Permainan dibatalkan.',
          embeds: [],
          components: []
        });
      } else if (reason === 'bust') {
        await sentMsg.edit({
          content: '💥 Anda terkeluar (Bust)!',
          embeds: [],
          components: []
        });
      }
    });
  }
};