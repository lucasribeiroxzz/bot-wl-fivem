const { findByToken, updateDiscord, updateWhitelist } = require('../database/db');
const { approvedEmbed, dmApprovedEmbed } = require('../config/embeds');
const { sendLog } = require('../utils/logger');
const { hasActiveSession } = require('../utils/sessions');
const config = require('../config/config');

const VALID_CODES = new Set(['PRINCIPAL2024', 'VIPPASS', 'FREEPASS']);

module.exports = {
  customId: 'wl_code_modal',
  async execute(interaction, client) {
    const userId = interaction.user.id;

    if (hasActiveSession(userId)) {
      await interaction.reply({ content: 'Você já possui uma allowlist em andamento.', ephemeral: true });
      return;
    }

    await interaction.deferReply({ ephemeral: true });

    const token = interaction.fields.getTextInputValue('wl_token').trim();
    const code = interaction.fields.getTextInputValue('wl_code_value').trim().toUpperCase();

    if (!VALID_CODES.has(code)) {
      await interaction.editReply({ content: 'Código inválido.' });
      return;
    }

    const account = await findByToken(token);
    if (!account) {
      await interaction.editReply({ content: 'Token inválido.' });
      return;
    }

    if (account.whitelist === 1) {
      await interaction.editReply({ content: 'Este token já possui allowlist aprovada.' });
      return;
    }

    await updateDiscord(account.id, userId);
    await updateWhitelist(account.id, 1);

    try { await interaction.user.send({ embeds: [dmApprovedEmbed()] }); } catch {}

    const approvedChannel = await client.channels.fetch(config.channels.approved).catch(() => null);
    if (approvedChannel) {
      await approvedChannel.send({ content: `<@${userId}>`, embeds: [approvedEmbed(userId)] });
    }

    await interaction.editReply({ content: 'Seu código foi validado e sua allowlist foi aprovada automaticamente!' });
    await sendLog(client, 'approved', `<@${userId}> aprovado automaticamente via código de passe livre.`);
  }
};
