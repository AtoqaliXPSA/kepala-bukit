const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../models/User'); // Pastikan model MongoDB disediakan

module.exports = {
  data: new SlashCommandBuilder()
    .setName('coinflip')
    .setDescription('Flip syiling dan cuba nasib anda!')
    .addStringOption(option =>
      option.setName('pilihan')
        .setDescription('Pilih antara heads atau tails')
        .setMinValue(1)
        .setRequired(true)
        .addChoices(
          { name: 'Heads', value: 'head' },
          { name: 'Tails', value: 'tail' },
        ))
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('Jumlah duit untuk dipertaruh')
        .setRequired(true)),

  async execute(interaction) {
    const userId = interaction.user.id;
    const pilihan = interaction.options.getString('pilihan')|| 1;
    const amount = interaction.options.getInteger('amount');

    // Dapatkan data user
    let user = await User.findOne({ userId });
    if (!user) user = await User.create({ userId, balance: 0 });

    if (amount <= 0 || isNaN(amount)) {
      return interaction.reply({ content: '❌ Nilai pertaruhan tidak sah.', ephemeral: true });
    }

    if (user.balance < amount) {
      return interaction.reply({ content: `❌ Anda tidak cukup duit! Baki: ${user.balance}`, ephemeral: true });
    }

    const flippingEmbed = new EmbedBuilder()
      .setTitle('🪙 Coinflip')
      .setDescription('Syiling sedang dilambung...')
      .setColor('Yellow')
      .setFooter({ text: `Pilihan anda: ${pilihan}` });

    await interaction.reply({ embeds: [flippingEmbed] });
    const reply = await interaction.fetchReply();

    // Tunggu 2 saat untuk simulasi flipping
    await new Promise(res => setTimeout(res, 2000));

    const hasil = Math.random() < 0.5 ? 'heads' : 'tails';

    let resultEmbed = new EmbedBuilder()
      .setTitle('🪙 Keputusan Coinflip')
      .addFields(
        { name: 'Pilihan anda', value: pilihan, inline: true },
        { name: 'Hasil coinflip', value: hasil, inline: true },
      )
      .setFooter({ text: `Diminta oleh ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
      .setTimestamp();

    if (pilihan === hasil) {
      const winnings = amount * 2;
      user.balance += winnings;
      resultEmbed.setColor('Green').setDescription(`🎉 Anda menang! ${winnings} coins!`);
    } else {
      user.balance -= amount;
      resultEmbed.setColor('Red').setDescription(`😢 Anda kalah! ${amount} coins.`);
    }

    await user.save();
    await interaction.editReply({ embeds: [resultEmbed] });
  }
};