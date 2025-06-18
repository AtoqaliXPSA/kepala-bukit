function drawCard() {
  const suits = ['♠️', '♥️', '♦️', '♣️'];
  const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const suit = suits[Math.floor(Math.random() * suits.length)];
  const rank = ranks[Math.floor(Math.random() * ranks.length)];
  return { rank, suit };
}

function calculateTotal(cards) {
  let total = 0;
  let aces = 0;

  for (const card of cards) {
    if (['J', 'Q', 'K'].includes(card.rank)) total += 10;
    else if (card.rank === 'A') {
      total += 11;
      aces++;
    } else {
      total += parseInt(card.rank);
    }
  }

  while (total > 21 && aces) {
    total -= 10;
    aces--;
  }

  return total;
}

function createGame() {
  const playerCards = [drawCard(), drawCard()];
  const dealerCards = [drawCard(), drawCard()];
  return {
    player: { cards: playerCards, total: calculateTotal(playerCards) },
    dealer: { cards: dealerCards, total: calculateTotal(dealerCards) },
  };
}

function createEmbed(game, user, animate = false) {
  const cardDisplay = cards => cards.map(card => `\`${card.rank}${card.suit}\``).join(' ');

  return {
    title: '🎰 Blackjack Time!',
    description: `**${user.username}'s Kad:** ${cardDisplay(game.player.cards)}\nTotal: **${game.player.total}**\n\n**Dealer:** \`${game.dealer.cards[0].rank}${game.dealer.cards[0].suit}\` \`?\``,
    color: 0x00ff99,
    footer: { text: animate ? '🃏 Kad ditarik...' : 'Pilih tindakan anda!' },
  };
}

function playerHit(game) {
  const card = drawCard();
  game.player.cards.push(card);
  game.player.total = calculateTotal(game.player.cards);
}

function dealerPlay(game) {
  while (game.dealer.total < 17) {
    const card = drawCard();
    game.dealer.cards.push(card);
    game.dealer.total = calculateTotal(game.dealer.cards);
  }
}

function finalResultEmbed(game, user) {
  const cardDisplay = cards => cards.map(card => `\`${card.rank}${card.suit}\``).join(' ');

  const player = game.player.total;
  const dealer = game.dealer.total;

  let result = '';
  if (player > 21) result = '💥 Anda **bust**! Dealer menang.';
  else if (dealer > 21) result = '🎉 Dealer bust! Anda menang!';
  else if (player > dealer) result = '🎉 Anda menang!';
  else if (dealer > player) result = '😞 Dealer menang.';
  else result = '🤝 Seri!';

  return {
    title: '🔚 Keputusan Blackjack',
    description: `**${user.username}:** ${cardDisplay(game.player.cards)} (Total: ${player})\n**Dealer:** ${cardDisplay(game.dealer.cards)} (Total: ${dealer})\n\n**${result}**`,
    color: player > dealer ? 0x00ff00 : 0xff0000,
  };
}

module.exports = {
  createGame,
  createEmbed,
  playerHit,
  dealerPlay,
  finalResultEmbed,
};