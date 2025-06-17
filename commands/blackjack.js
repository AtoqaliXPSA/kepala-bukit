const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { getUser, subtractBalance, addBalance } = require('../utils/blackjackHelper');

const HIT = 'blackjack_hit';
const STAND = 'blackjack_stand';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('blackjack')
    .setDescription('Mainkan Blackjack dan cuba menang!'),

  async execute(interaction) {
    const userId = interaction.user.id;
    const betAmount = 300; // Tetap

    const user = await getUser(userId);
    if (user.balance < betAmount) {
      return interaction.reply({ content: `❌ Anda perlukan sekurang-kurangnya ${betAmount} untuk bermain.`, ephemeral: true });
    }

    await subtractBalance(userId, betAmount);

    let playerCards = [drawCard(), drawCard()];
    let dealerCards = [drawCard(), drawCard()];

    const embed = new EmbedBuilder()
      .setTitle('🃏 Blackjack bet 300')
      .setColor('DarkGreen')
      .setDescription(`Kad anda: ${playerCards.join(', ')} (${handValue(playerCards)})\n\nKad dealer: ${dealerCards[0]},\n\n ❓Tekan butang di bawah untuk teruskan.`);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(HIT)
        .setLabel('Hit 🃏')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(STAND)
        .setLabel('Stand ✋')
        .setStyle(ButtonStyle.Secondary)
    );

    await interaction.reply({ embeds: [embed], components: [row] });
    const message = await interaction.fetchReply();

    const filter = (i) => i.user.id === userId;
    const collector = message.createMessageComponentCollector({ filter, time: 60000 });

    collector.on('collect', async (btn) => {
      if (btn.customId === HIT) {
        playerCards.push(drawCard());
        const playerTotal = handValue(playerCards);

        if (playerTotal > 21) {
          await btn.update({
            embeds: [
              new EmbedBuilder()
                .setTitle('💥 Anda Kalah!')
                .setColor('Red')
                .setDescription(`Kad anda: ${playerCards.join(', ')} (${playerTotal})\n\nAnda terlebih 21.`)
            ],
            components: []
          });
          collector.stop();
          return;
        }

        await btn.update({
          embeds: [
            new EmbedBuilder()
              .setTitle('🃏 Blackjack bet 300')
              .setColor('DarkGreen')
              .setDescription(`Kad anda: ${playerCards.join(', ')} (${playerTotal})\n\nKad dealer: ${dealerCards[0]}, ❓`)
          ],
          components: [row]
        });
      }

      if (btn.customId === STAND) {
        let dealerTotal = handValue(dealerCards);
        while (dealerTotal < 17) {
          dealerCards.push(drawCard());
          dealerTotal = handValue(dealerCards);
        }

        const playerTotal = handValue(playerCards);
        let result = '';
        if (dealerTotal > 21 || playerTotal > dealerTotal) {
          await addBalance(userId, betAmount * 2);
          result = `🎉 Anda menang dan dapat ${betAmount * 2}!`;
        } else if (playerTotal === dealerTotal) {
          await addBalance(userId, betAmount); // Pulang balik
          result = `⚖️ Seri. Pertaruhan anda dipulangkan.`;
        } else {
          result = `💥 Anda kalah!`;
        }

        await btn.update({
          embeds: [
            new EmbedBuilder()
              .setTitle('🎲 Keputusan Blackjack')
              .setColor('Blue')
              .setDescription(`Kad anda: ${playerCards.join(', ')} (${playerTotal})\n\nKad dealer: ${dealerCards.join(', ')} (${dealerTotal})

${result}`)
          ],
          components: []
        });

        collector.stop();
      }
    });

    collector.on('end', (collected, reason) => {
      if (reason === 'time') {
        interaction.editReply({
          content: '⏱️ Masa tamat. Sesi dibatalkan.',
          components: []
        });
      }
    });
  }
};

// Helper functions
function drawCard() {
  const cards = [2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K', 'A'];
  return cards[Math.floor(Math.random() * cards.length)];
}

function handValue(cards) {
  let value = 0;
  let aces = 0;

  for (const card of cards) {
    if (['J', 'Q', 'K'].includes(card)) {
      value += 10;
    } else if (card === 'A') {
      value += 11;
      aces++;
    } else {
      value += card;
    }
  }

  while (value > 21 && aces > 0) {
    value -= 10;
    aces--;
  }

  return value;
}
