const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  EmbedBuilder,
  ButtonStyle,
  Events
} = require('discord.js');
const User = require('../models/User');
const adminId = process.env.ADMIN_ID;

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isButton() && !interaction.isModalSubmit()) return;

    // ⛔ Hanya admin
    if (interaction.user.id !== adminId) {
      return interaction.reply({ content: '❌ Admin sahaja.', ephemeral: true });
    }

    // ==========================
    // 🔘 Handle Button Tekan
    // ==========================
    if (interaction.isButton()) {
      const [action, type, userId] = interaction.customId.split('_');
      if (!['add', 'remove'].includes(action) || !['coins', 'stamina'].includes(type)) return;

      const modal = new ModalBuilder()
        .setCustomId(`modal_${action}_${type}_${userId}`)
        .setTitle(`${action === 'add' ? 'Tambah' : 'Tolak'} ${type === 'coins' ? 'Coins' : 'Stamina'}`);

      const input = new TextInputBuilder()
        .setCustomId('amount')
        .setLabel(`Masukkan jumlah ${type === 'coins' ? 'coins' : 'stamina'}:`)
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Contoh: 100')
        .setRequired(true);

      const row = new ActionRowBuilder().addComponents(input);
      modal.addComponents(row);

      // ❗ Jangan reply lagi selepas showModal
      return await interaction.showModal(modal);
    }

    // ==========================
    // 📝 Handle Modal Submit
    // ==========================
    if (interaction.isModalSubmit()) {
      const [_, action, type, userId] = interaction.customId.split('_');
      const amount = parseInt(interaction.fields.getTextInputValue('amount'));
      if (isNaN(amount)) {
        return interaction.reply({ content: '❌ Jumlah tidak sah.', flags: 64 });
      }

      const userData = await User.findOne({ userId });
      if (!userData) {
        return interaction.reply({ content: '❌ Data pengguna tiada.', flags: 64 });
      }

      if (type === 'coins') {
        if (action === 'add') {
          userData.balance += amount;
        } else {
          userData.balance -= amount;
          if (userData.balance < 0) userData.balance = 0;
        }
      } else if (type === 'stamina') {
        if (action === 'add') {
          userData.stamina += amount;
        } else {
          userData.stamina -= amount;
          if (userData.stamina < 0) userData.stamina = 0;
        }
      }

      await userData.save();

      const embed = new EmbedBuilder()
        .setTitle(`✅ ${type === 'coins' ? 'Coins' : 'Stamina'} Dikemaskini`)
        .setDescription(`**${action === 'add' ? 'Tambah' : 'Tolak'} ${amount} ${type}** kepada <@${userId}>.\n` +
          `Baki sekarang: ${type === 'coins' ? `💰 **${userData.balance}**` : `⚡ **${userData.stamina}**`}`)
        .setColor(action === 'add' ? 'Green' : 'Red');

      return interaction.reply({ embeds: [embed] });
    }
  }
};