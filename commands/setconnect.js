const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../config/config');
const { connectPanelEmbed } = require('../config/embeds');
const { getServerStatus } = require('../utils/fivemApi');
const { addMessage } = require('../utils/connectMessages');
const { updateOnlineState, getUptime, getNextRestart } = require('../utils/serverState');
const { parseEmoji } = require('../utils/emojiHelper');
const e = require('../config/emojis');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setconnect')
    .setDescription('Envia o painel de conexão do servidor (atualiza automaticamente).'),

  async execute(interaction) {
    if (!interaction.member.roles.cache.has(config.adminRole)) {
      await interaction.reply({ content: `${e.no} Você não tem permissão para usar este comando.`, ephemeral: true });
      return;
    }

    await interaction.deferReply({ ephemeral: true });

    const connectBtn = new ButtonBuilder()
      .setLabel('Conectar ao Servidor')
      .setStyle(ButtonStyle.Link)
      .setURL(`https://cfx.re/join/${config.server.ip}`);

    const fivemEmoji = parseEmoji(e.fivem);
    if (fivemEmoji) connectBtn.setEmoji(fivemEmoji);

    const row = new ActionRowBuilder().addComponents(connectBtn);

    const status = await getServerStatus(config.server.ip);
    updateOnlineState(status.online);
    const uptime = getUptime();
    const nextRestart = getNextRestart();
    const embed = connectPanelEmbed(status, uptime, nextRestart);

    const msg = await interaction.channel.send({ embeds: [embed], components: [row] });
    addMessage(msg.channelId, msg.id);

    await interaction.editReply({ content: `${e.check} Painel de conexão enviado.` });
  }
};
