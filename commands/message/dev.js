const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');
const os = require('os');
const moment = require('moment');
const User = require('../../models/User');
const ms = require('ms');
const { exec } = require('child_process');

module.exports = {
  name: 'dev',
  description: 'Dev panel untuk ADMIN sahaja',
  async execute(message, args) {
    if (message.author.id !== process.env.ADMIN_ID) {
      return message.reply('❌ Anda tidak dibenarkan guna command ini.');
    }

    const embed = new EmbedBuilder()
      .setTitle('🛠️ Dev Panel')
      .addFields(
        { name: '***📊 Status Bot***', value: 'Klik untuk dapat status', inline: true },
        { name: '***🚀 Auto Deploy***', value: 'Klik untuk deploy semua commands', inline: true }
      )
      .setColor('Blue')
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('status')
        .setLabel('Status Bot')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('deploy')
        .setLabel('Auto Deploy')
        .setStyle(ButtonStyle.Danger)
    );

    const sent = await message.channel.send({ embeds: [embed], components: [row] });

    const filter = i => i.user.id === message.author.id;
    const collector = sent.createMessageComponentCollector({ filter, time: 30000 });

    collector.on('collect', async i => {
      await i.deferUpdate();

      if (i.customId === 'status') {
        const uptime = moment.duration(process.uptime(), 'seconds').humanize();
        const memoryUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);

        const statusEmbed = new EmbedBuilder()
          .setTitle('📊 Bot Status')
          .addFields(
            { name: 'Uptime', value: uptime, inline: true },
            { name: 'Ping', value: `${Math.round(i.client.ws.ping)}ms`, inline: true },
            { name: 'RAM', value: `${memoryUsage} MB`, inline: true },
            { name: 'Platform', value: os.platform(), inline: true },
            { name: 'CPU', value: os.cpus()[0].model, inline: false }
          )
          .setColor('Green')
          .setFooter({ text: 'Bot Info' })
          .setTimestamp();

        try {
          await i.user.send({ embeds: [statusEmbed] });
          await sent.react('✅');
        } catch {
          await sent.react('❌');
        }
      }

      // ✅ Command: add / remove
      const action = subCommand.toLowerCase();
      const mention = message.mentions.users.first();
      const amount = parseInt(args[2]);

      if (!['add', 'remove'].includes(action)) {
        return message.reply('❌ Arahan tidak sah. Guna `add` atau `remove`.\nContoh: `!dev add @user 1000`');
      }

      if (!mention || isNaN(amount)) {
        return message.reply('❌ Sila mention pengguna dan masukkan jumlah.\nContoh: `!dev add @user 1000`');
      }

      let userData = await User.findOne({ userId: mention.id });
      if (!userData) {
        userData = await User.create({ userId: mention.id });
      }

      if (action === 'add') {
        userData.balance += amount;
      } else if (action === 'remove') {
        userData.balance = Math.max(0, userData.balance - amount);
      }

      await userData.save();

      const embed = new EmbedBuilder()
        .setTitle('✅ Operasi Berjaya')
        .setColor(action === 'add' ? 'Green' : 'Red')
        .setDescription(`**${action === 'add' ? 'Tambah' : 'Tolak'}** RM${amount} untuk ${mention.tag}`)
        .addFields({ name: '💰 Baki Baru', value: `${userData.balance}`, inline: true })
        .setFooter({ text: `Diminta oleh ${message.author.tag}` });

      await message.reply({ embeds: [embed] });
      }
      };

      if (i.customId === 'deploy') {
        exec('node reset.js', (err, stdout, stderr) => {
          if (err) {
            console.error(stderr);
            return message.channel.send('❌ Ralat semasa deploy.');
          }
          console.log(stdout);
          sent.react('🚀');
          message.channel.send('✅ Reset telah dijalankan melalui `reset.js`.');
        });
      }
    });

    collector.on('end', () => {
      sent.edit({ components: [] }).catch(() => {});
    });
  }
};