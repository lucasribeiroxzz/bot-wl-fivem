const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const { hasActiveSession } = require('../utils/sessions');
const { sendLog } = require('../utils/logger');

module.exports = {
  customId: 'wl_start',
  async execute(interaction, client) {
    if (hasActiveSession(interaction.user.id)) {
      await interaction.reply({ content: 'Você já possui uma allowlist em andamento.', ephemeral: true });
      await sendLog(client, 'duplicate', `<@${interaction.user.id}> tentou iniciar uma WL duplicada.`);
      return;
    }

    const modal = new ModalBuilder()
      .setCustomId('wl_token_modal')
      .setTitle('Allowlist - Principal');

    const tokenInput = new TextInputBuilder()
      .setCustomId('wl_token')
      .setLabel('Token')
      .setPlaceholder('Cole seu token aqui')
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
      .setMaxLength(100);

    const firstNameInput = new TextInputBuilder()
      .setCustomId('wl_firstname')
      .setLabel('Nome do Personagem')
      .setPlaceholder('Ex: Lucas')
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
      .setMaxLength(30);

    const lastNameInput = new TextInputBuilder()
      .setCustomId('wl_lastname')
      .setLabel('Sobrenome do Personagem')
      .setPlaceholder('Ex: Ribeiro')
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
      .setMaxLength(30);

    modal.addComponents(
      new ActionRowBuilder().addComponents(tokenInput),
      new ActionRowBuilder().addComponents(firstNameInput),
      new ActionRowBuilder().addComponents(lastNameInput)
    );

    await interaction.showModal(modal);
  }
};
