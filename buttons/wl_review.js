const { updateWhitelist } = require('../database/db');
const { approvedEmbed, rejectedEmbed, dmApprovedEmbed, dmRejectedEmbed } = require('../config/embeds');
const { sendLog } = require('../utils/logger');
const { removeActiveSession } = require('../utils/sessions');
const { getPendingReview, removePendingReview } = require('../utils/pendingReviews');
const config = require('../config/config');

module.exports = {
  customId: 'wl_review',
  async execute(interaction, client) {
    const member = interaction.member;
    if (!member.roles.cache.has(config.staffRole)) {
      await interaction.reply({ content: 'Apenas staff pode realizar essa ação.', ephemeral: true });
      return;
    }

    const customId = interaction.customId;
    const parts = customId.split('_');
    const action = parts[1];
    const userId = parts[2];
    const accountId = parts[3];
    const channelId = parts[4];

    const guild = interaction.guild;
    let targetMember;
    try {
      targetMember = await guild.members.fetch(userId);
    } catch {
      targetMember = null;
    }

    const pendingData = getPendingReview(accountId);

    if (action === 'approve') {
      await updateWhitelist(accountId, 1);

      if (targetMember) {
        if (pendingData) {
          const newNick = `${pendingData.firstName} ${pendingData.lastName} [${accountId}]`;
          try {
            await targetMember.setNickname(newNick.substring(0, 32));
          } catch (err) {
            await sendLog(client, 'error', `Falha ao definir nick de <@${userId}>: ${err.message}`);
          }
        }

        if (config.approvedRole) {
          try {
            await targetMember.roles.add(config.approvedRole);
          } catch (err) {
            await sendLog(client, 'error', `Falha ao adicionar cargo aprovado a <@${userId}>: ${err.message}`);
          }
        }

        try { await targetMember.send({ embeds: [dmApprovedEmbed()] }); } catch {}
      }

      const approvedChannel = await client.channels.fetch(config.channels.approved).catch(() => null);
      if (approvedChannel) {
        await approvedChannel.send({ content: `<@${userId}>`, embeds: [approvedEmbed(userId)] });
      }

      await sendLog(client, 'approved', `<@${userId}> foi **aprovado** na WL por <@${interaction.user.id}>.`);

      await interaction.update({
        content: `Allowlist de <@${userId}> foi **aprovada** por <@${interaction.user.id}>.`,
        components: [],
        embeds: interaction.message.embeds
      });
    }

    if (action === 'reject') {
      await updateWhitelist(accountId, 0);

      if (targetMember) {
        try { await targetMember.send({ embeds: [dmRejectedEmbed()] }); } catch {}
      }

      const rejectedChannel = await client.channels.fetch(config.channels.rejected).catch(() => null);
      if (rejectedChannel) {
        await rejectedChannel.send({ content: `<@${userId}>`, embeds: [rejectedEmbed(userId)] });
      }

      await sendLog(client, 'rejected', `<@${userId}> foi **reprovado** na WL por <@${interaction.user.id}>.`);

      await interaction.update({
        content: `Allowlist de <@${userId}> foi **reprovada** por <@${interaction.user.id}>.`,
        components: [],
        embeds: interaction.message.embeds
      });
    }

    removeActiveSession(userId);
    removePendingReview(accountId);

    if (channelId && channelId !== 'null') {
      try {
        const wlChannel = await client.channels.fetch(channelId).catch(() => null);
        if (wlChannel) {
          try { await wlChannel.delete(); } catch {}
        }
      } catch {}
    }
  }
};
