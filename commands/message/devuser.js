const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} = require('discord.js');
const User = require('../../models/User');
const adminId = process.env.ADMIN_ID;

module.exports = {
  name: 'devuser',
  description: 'Panel dev untuk tambah/tolak coins & stamina (admin sahaja)',

  async execute(message, args) {
    if (message.author.id !== adminId) {
      return message.reply('❌ Anda tiada kebenaran.');
    }

    const target = message.mentions.users.first();
    if (!target) return message.reply('❌ Sila tag user.');

    const userData = await User.findOneAndUpdate(
      { userId: target.id },
      { $setOnInsert: { userId: target.id, balance: 0, stamina: 5 } },
      { upsert: true, new: true }
    );

    const stamina = userData.stamina ?? 0;
    const maxStamina = 5;

    // 🔋 Bina stamina bar (contoh: ▓▓░░░)
    const filled = '▓'.repeat(stamina);
    const empty = '░'.repeat(maxStamina - stamina);
    const staminaBar = `${filled}${empty} (${stamina}/${maxStamina})`;

    const embed = new EmbedBuilder()
      .setTitle(`🛠️ DEV PANEL: ${target.username}`)
      .setColor('Aqua')
      .setDescription(`💰 Coins: **${userData.balance}**\n⚡ Stamina: ${staminaBar}`);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`add_coins_${target.id}`)
        .setLabel('➕ Coins')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId(`remove_coins_${target.id}`)
        .setLabel('➖ Coins')
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId(`add_stamina_${target.id}`)
        .setLabel('🔋 Tambah Stamina')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(`remove_stamina_${target.id}`)
        .setLabel('🪫 Tolak Stamina')
        .setStyle(ButtonStyle.Secondary)
    );

    await message.reply({ embeds: [embed], components: [row] });
  }
};