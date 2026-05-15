const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { wlPanelEmbed } = require('../config/embeds');
const { parseEmoji } = require('../utils/emojiHelper');
const config = require('../config/config');
const e = require('../config/emojis');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('wlset')
    .setDescription('Envia o painel de allowlist no canal atual.'),

  async execute(interaction) {
    if (!interaction.member.roles.cache.has(config.adminRole)) {
      await interaction.reply({ content: `${e.no} Você não tem permissão para usar este comando.`, ephemeral: true });
      return;
    }

    const startBtn = new ButtonBuilder()
      .setCustomId('wl_start')
      .setLabel('Fazer Allowlist')
      .setStyle(ButtonStyle.Primary);

    const codeBtn = new ButtonBuilder()
      .setCustomId('wl_code')
      .setLabel('Allowlist por Código')
      .setStyle(ButtonStyle.Secondary);

    const memoEmoji = parseEmoji(e.memo);
    const ticketEmoji = parseEmoji(e.ticket);
    if (memoEmoji) startBtn.setEmoji(memoEmoji);
    if (ticketEmoji) codeBtn.setEmoji(ticketEmoji);

    const row = new ActionRowBuilder().addComponents(startBtn, codeBtn);

    await interaction.channel.send({ embeds: [wlPanelEmbed()], components: [row] });
    await interaction.reply({ content: `${e.check} Painel de allowlist enviado.`, ephemeral: true });
  }
};
