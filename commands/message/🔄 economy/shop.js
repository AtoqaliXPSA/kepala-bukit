const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'shop',
  description: 'Shop KB.',
  cooldown: 5,

  async execute(message) {
    const itemsPath = path.join(__dirname, '../../../data/items.json');
    const shopItems = JSON.parse(fs.readFileSync(itemsPath, 'utf-8'));

    const list = shopItems
      .map((item, i) => `\`${item.name} — ${item.price} coins\n   *${item.description}*`)
      .join('\n');

    message.reply(`**KBSHOP:**\n${list}\n\nUse: \`djbuy <Name items>\``);
  }
};