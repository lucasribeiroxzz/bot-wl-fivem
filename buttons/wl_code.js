const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const { hasActiveSession } = require('../utils/sessions');
const { sendLog } = require('../utils/logger');

module.exports = {
  customId: 'wl_code',
  async execute(interaction, client) {
    if (hasActiveSession(interaction.user.id)) {
      await interaction.reply({ content: 'Você já possui uma allowlist em andamento.', ephemeral: true });
      await sendLog(client, 'duplicate', `<@${interaction.user.id}> tentou usar código com WL ativa.`);
      return;
    }

    const modal = new ModalBuilder()
      .setCustomId('wl_code_modal')
      .setTitle('Allowlist por Código - Principal');

    const tokenInput = new TextInputBuilder()
      .setCustomId('wl_token')
      .setLabel('Token')
      .setPlaceholder('Cole seu token aqui')
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
      .setMaxLength(100);

    const codeInput = new TextInputBuilder()
      .setCustomId('wl_code_value')
      .setLabel('Código de Passe Livre')
      .setPlaceholder('Cole seu código aqui')
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
      .setMaxLength(50);

    modal.addComponents(
      new ActionRowBuilder().addComponents(tokenInput),
      new ActionRowBuilder().addComponents(codeInput)
    );

    await interaction.showModal(modal);
  }
};
