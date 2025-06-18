const {ModalBuilder, TextInputBuilder,  TextInputStyle, ActionRowBuilder, EmbedBuilder } = require('discord.js');
const User = require('../models/User');
const adminId = process.env.ADMIN_ID;

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    if (!interaction.isButton() && !interaction.isModalSubmit()) return;

    // ⛔ Hanya admin
    if (interaction.user.id !== adminId)
      return interaction.reply({ content: '❌ Admin sahaja.', flags : 64 });

    // 🔘 Bila tekan button ➕ ➖
    if (interaction.isButton()) {
      const [action, userId] = interaction.customId.split('_');
      if (!['add', 'remove'].includes(action)) return;

      const modal = new ModalBuilder()
        .setCustomId(`modal_${action}_${userId}`)
        .setTitle(action === 'add' ? 'Tambah Coins' : 'Tolak Coins');

      const input = new TextInputBuilder()
        .setCustomId('amount')
        .setLabel('Masukkan jumlah coins:')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Contoh: 100')
        .setRequired(true);

      const row = new ActionRowBuilder().addComponents(input);
      modal.addComponents(row);
      return await interaction.showModal(modal);
    }

    // 📥 Bila hantar modal
    if (interaction.isModalSubmit()) {
      const [_, action, userId] = interaction.customId.split('_');
      const amount = parseInt(interaction.fields.getTextInputValue('amount'));
      if (isNaN(amount)) {
        return interaction.reply({ content: '❌ Jumlah tidak sah.', flags : 64 });
      }

      const userData = await User.findOne({ userId });
      if (!userData) {
        return interaction.reply({ content: '❌ Data pengguna tiada.', flags : 64 });
      }

      if (action === 'add') {
        userData.balance += amount;
      } else if (action === 'remove') {
        userData.balance -= amount;
        if (userData.balance < 0) userData.balance = 0;
      }

      await userData.save();

      const embed = new EmbedBuilder()
        .setTitle('✅ Coins Dikemaskini')
        .setDescription(`**${action === 'add' ? 'Tambah' : 'Tolak'} ${amount} coins** kepada <@${userId}>.\nBaki sekarang: **${userData.balance}**`)
        .setColor(action === 'add' ? 'Green' : 'Red');

      return interaction.reply({ embeds: [embed] });
    }
  }
};