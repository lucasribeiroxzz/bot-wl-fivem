const { ChannelType, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { findByToken, findByDiscord, updateDiscord } = require('../database/db');
const { questionEmbed, reviewEmbed, dmPendingEmbed, colors } = require('../config/embeds');
const { sendLog } = require('../utils/logger');
const { hasActiveSession, setActiveSession, removeActiveSession, getActiveSession } = require('../utils/sessions');
const { setPendingReview } = require('../utils/pendingReviews');
const { parseEmoji } = require('../utils/emojiHelper');
const e = require('../config/emojis');
const questions = require('../config/questions');
const config = require('../config/config');

module.exports = {
  customId: 'wl_token_modal',
  async execute(interaction, client) {
    const userId = interaction.user.id;

    if (hasActiveSession(userId)) {
      await interaction.reply({ content: 'Você já possui uma allowlist em andamento.', ephemeral: true });
      return;
    }

    await interaction.deferReply({ ephemeral: true });

    const token = interaction.fields.getTextInputValue('wl_token').trim();
    const firstName = interaction.fields.getTextInputValue('wl_firstname').trim();
    const lastName = interaction.fields.getTextInputValue('wl_lastname').trim();

    const existing = await findByDiscord(userId);
    if (existing && existing.whitelist === 1) {
      await interaction.editReply({ content: 'Você já possui uma allowlist aprovada.' });
      await sendLog(client, 'duplicate', `<@${userId}> tentou fazer WL mas já possui uma aprovada.`);
      return;
    }

    const account = await findByToken(token);
    if (!account) {
      await interaction.editReply({ content: 'Token inválido. Verifique e tente novamente.' });
      return;
    }

    if (account.whitelist === 1) {
      await interaction.editReply({ content: 'Este token já possui allowlist aprovada.' });
      return;
    }

    await updateDiscord(account.id, userId);

    const guild = interaction.guild;

    setActiveSession(userId, {
      token,
      accountId: account.id,
      firstName,
      lastName,
      discordId: userId,
      answers: [],
      channelId: null
    });

    let wlChannel;
    try {
      wlChannel = await guild.channels.create({
        name: `wl-${interaction.user.username}`,
        type: ChannelType.GuildText,
        parent: config.categoryWL,
        permissionOverwrites: [
          {
            id: guild.id,
            deny: [PermissionFlagsBits.ViewChannel]
          },
          {
            id: userId,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory]
          },
          {
            id: config.staffRole,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory]
          }
        ]
      });
    } catch (err) {
      removeActiveSession(userId);
      await interaction.editReply({ content: 'Erro ao criar canal. Contacte um administrador.' });
      await sendLog(client, 'error', `Erro ao criar canal WL para <@${userId}>: ${err.message}`);
      return;
    }

    const session = getActiveSession(userId);
    if (session) session.channelId = wlChannel.id;

    await interaction.editReply({ content: `Sua allowlist foi iniciada! Vá para ${wlChannel}.` });
    await sendLog(client, 'open', `<@${userId}> iniciou a allowlist. Canal: ${wlChannel}.`);

    await startQuestions(wlChannel, interaction.user, client);
  }
};

async function startQuestions(channel, user, client) {
  const session = getActiveSession(user.id);
  if (!session) return;

  const welcomeEmbed = new EmbedBuilder()
    .setColor(colors.info)
    .setTitle('Allowlist Iniciada')
    .setDescription(
      `Bem-vindo <@${user.id}>!\n\n` +
      `Sua entrevista de allowlist vai começar agora.\n` +
      `Você receberá **${questions.length} perguntas**, uma por vez.\n` +
      `Responda cada uma no chat. Você tem **5 minutos** por pergunta.\n\n` +
      `Preparado? A primeira pergunta está chegando...`
    )
    .setFooter({ text: `${config.server.name} — Allowlist` })
    .setTimestamp();

  const welcomeMsg = await channel.send({ embeds: [welcomeEmbed] });
  await new Promise(r => setTimeout(r, 2500));
  try { await welcomeMsg.delete(); } catch {}

  let botMessage = null;

  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    const embed = questionEmbed(question, i + 1, questions.length);

    if (botMessage) {
      try {
        await botMessage.edit({ embeds: [embed] });
      } catch {
        botMessage = await channel.send({ embeds: [embed] });
      }
    } else {
      botMessage = await channel.send({ embeds: [embed] });
    }

    try {
      const filter = (m) => m.author.id === user.id;
      const collected = await channel.awaitMessages({
        filter,
        max: 1,
        time: 300000,
        errors: ['time']
      });

      const userMsg = collected.first();
      session.answers.push(userMsg.content);

      try { await userMsg.delete(); } catch {}

    } catch {
      removeActiveSession(user.id);

      if (botMessage) {
        try { await botMessage.delete(); } catch {}
      }

      await sendLog(client, 'timeout', `<@${user.id}> teve timeout na pergunta ${i + 1}/${questions.length}.`);

      try {
        const timeoutDm = new EmbedBuilder()
          .setColor(colors.error)
          .setTitle('Allowlist Cancelada')
          .setDescription(
            `Sua allowlist no **${config.server.name}** foi cancelada por **inatividade**.\n\n` +
            `Você não respondeu uma pergunta a tempo. Você pode tentar novamente.`
          )
          .setFooter({ text: config.server.name })
          .setTimestamp();
        await user.send({ embeds: [timeoutDm] });
      } catch {}

      setTimeout(async () => {
        try { await channel.delete(); } catch {}
      }, 3000);
      return;
    }
  }

  if (botMessage) {
    try { await botMessage.delete(); } catch {}
  }

  try {
    await user.send({ embeds: [dmPendingEmbed()] });
  } catch {}

  const reviewChannel = await client.channels.fetch(config.channels.review).catch(() => null);
  if (reviewChannel) {
    setPendingReview(session.accountId, {
      firstName: session.firstName,
      lastName: session.lastName,
      accountId: session.accountId,
      discordId: session.discordId
    });

    const review = reviewEmbed(session, session.answers, questions);

    const approveBtn = new ButtonBuilder()
      .setCustomId(`wl_approve_${user.id}_${session.accountId}_${channel.id}`)
      .setLabel('Aprovar')
      .setStyle(ButtonStyle.Success);

    const rejectBtn = new ButtonBuilder()
      .setCustomId(`wl_reject_${user.id}_${session.accountId}_${channel.id}`)
      .setLabel('Reprovar')
      .setStyle(ButtonStyle.Danger);

    const yesEmoji = parseEmoji(e.yes);
    const noEmoji = parseEmoji(e.no);
    if (yesEmoji) approveBtn.setEmoji(yesEmoji);
    if (noEmoji) rejectBtn.setEmoji(noEmoji);

    const row = new ActionRowBuilder().addComponents(approveBtn, rejectBtn);

    await reviewChannel.send({
      content: `<@&${config.staffRole}> — Nova allowlist para revisão.`,
      embeds: [review],
      components: [row]
    });
  } else {
    await sendLog(client, 'error', `Canal de revisão (${config.channels.review}) não encontrado. Verifique CHANNEL_REVIEW no .env.`);
  }

  setTimeout(async () => {
    try { await channel.delete(); } catch {}
  }, 2000);
}
