const { EmbedBuilder } = require('discord.js');
const config = require('./config');
const e = require('./emojis');
const _c = require('../utils/_credits');

const colors = {
  primary: 0x1a1a2e,
  success: 0x2ecc71,
  error: 0xe74c3c,
  warning: 0xf39c12,
  info: 0x5865F2,
  dark: 0x0f0f17
};

const BANNER_CONNECT = 'https://i.ibb.co/gb7CDhb6/Chat-GPT-Image-13-de-mai-de-2026-01-57-39.png';
const BANNER_WL = 'https://i.ibb.co/gFVryqfC/Chat-GPT-Image-13-de-mai-de-2026-02-25-26.png';
const BANNER = BANNER_CONNECT;

function wlPanelEmbed() {
  return new EmbedBuilder()
    .setColor(colors.primary)
    .setAuthor({ name: `${config.server.name} • Sistema Oficial` })
    .setTitle(`${e.salute}  SISTEMA DE ALLOWLIST`)
    .setDescription(
      `> Clique no botão abaixo para iniciar sua **allowlist**.\n` +
      `> Após aprovação, seu passaporte será liberado na cidade.\n\u200b`
    )
    .addFields(
      {
        name: `${e.memo}  Como funciona`,
        value:
          `\`\`\`yaml\n` +
          `1. Tenha seu token em mãos (#connect)\n` +
          `2. Clique em "Fazer Allowlist"\n` +
          `3. Responda 15 perguntas de RP\n` +
          `4. Aguarde análise da staff (até 3h)\n` +
          `\`\`\``,
        inline: false
      },
      {
        name: `${e.clock}  Tempo por pergunta`,
        value: '```5 minutos```',
        inline: true
      },
      {
        name: `${e.pencil}  Perguntas`,
        value: '```15 questões```',
        inline: true
      },
      {
        name: `${e.ticket}  Passe Livre`,
        value: '```Suportado```',
        inline: true
      },
      {
        name: `${e.warning}  Observações importantes`,
        value:
          `> Caso reprove, terá que **refazer** sua allowlist.\n` +
          `> Tempo expirado em uma pergunta = reprovação automática.\n` +
          `> Apenas **uma** allowlist ativa por vez.`,
        inline: false
      }
    )
    .setImage(BANNER_WL)
    .setFooter({ text: `${config.server.name} • ${_c.credit}` })
    .setTimestamp();
}

function questionEmbed(question, current, total) {
  const filled = Math.round((current / total) * 15);
  const empty = 15 - filled;
  const bar = '▰'.repeat(filled) + '▱'.repeat(empty);
  const percent = Math.round((current / total) * 100);

  return new EmbedBuilder()
    .setColor(colors.info)
    .setAuthor({ name: `${config.server.name} • Entrevista de Allowlist` })
    .setTitle(`${e.apencil}  Pergunta ${current} de ${total}`)
    .setDescription(
      `\`\`\`ansi\n\u001b[1;36m${bar}\u001b[0m  ${percent}%\n\`\`\`\n` +
      `### ${question.question}\n\n` +
      `> ${question.description}`
    )
    .addFields(
      {
        name: `${e.clock}  Tempo limite`,
        value: '```5 minutos```',
        inline: true
      },
      {
        name: `${e.hashtag}  Progresso`,
        value: `\`\`\`${current}/${total}\`\`\``,
        inline: true
      },
      {
        name: `${e.info}  Dica`,
        value: '```Seja detalhado```',
        inline: true
      }
    )
    .setFooter({ text: `${config.server.name} • Responda no chat abaixo` })
    .setTimestamp();
}

function reviewEmbed(userData, answers, questions) {
  const embed = new EmbedBuilder()
    .setColor(colors.warning)
    .setAuthor({ name: `${config.server.name} • Análise de Allowlist` })
    .setTitle(`${e.memo}  NOVA ALLOWLIST PARA REVISÃO`)
    .setDescription(
      `> Avalie as respostas abaixo e tome uma decisão.\n` +
      `> Use os botões ao final para **aprovar** ou **reprovar**.`
    )
    .addFields(
      {
        name: `${e.greenUser}  Usuário`,
        value: `<@${userData.discordId}>`,
        inline: true
      },
      {
        name: `${e.pencil}  Nome RP`,
        value: `\`\`\`${userData.firstName} ${userData.lastName}\`\`\``,
        inline: true
      },
      {
        name: `${e.hashtag}  ID Conta`,
        value: `\`\`\`${userData.accountId}\`\`\``,
        inline: true
      },
      {
        name: `${e.ticket}  Token`,
        value: `\`\`\`${userData.token}\`\`\``,
        inline: false
      },
      {
        name: `${e.clock}  Enviado em`,
        value: `<t:${Math.floor(Date.now() / 1000)}:F>`,
        inline: false
      }
    );

  const maxFieldLen = 1000;
  for (let i = 0; i < answers.length; i++) {
    const q = questions[i].question;
    let a = answers[i];
    if (a.length > maxFieldLen) a = a.substring(0, maxFieldLen - 3) + '...';
    embed.addFields({
      name: `${e.apencil}  ${i + 1}. ${q.substring(0, 100)}`,
      value: `> ${a}`,
      inline: false
    });
  }

  embed.setFooter({ text: `${config.server.name} • Aguardando decisão da staff` }).setTimestamp();
  return embed;
}

function approvedEmbed(userId) {
  return new EmbedBuilder()
    .setColor(colors.success)
    .setAuthor({ name: `${config.server.name} • Decisão Oficial` })
    .setTitle(`${e.party}  ALLOWLIST APROVADA`)
    .setDescription(
      `> Parabéns <@${userId}>, sua allowlist foi **aprovada** com sucesso.\n` +
      `> Seu passaporte foi liberado na cidade.`
    )
    .addFields(
      {
        name: `${e.fivem}  Próximos passos`,
        value:
          `\`\`\`yaml\n` +
          `1. Conecte-se ao servidor\n` +
          `2. Aproveite seu RP\n` +
          `3. Respeite as regras\n` +
          `\`\`\``,
        inline: false
      },
      {
        name: `${e.link}  Connect F8`,
        value: `\`\`\`${config.server.connect}\`\`\``,
        inline: false
      }
    )
    .setImage(BANNER_WL)
    .setFooter({ text: `${config.server.name} • Bem-vindo à cidade` })
    .setTimestamp();
}

function rejectedEmbed(userId) {
  return new EmbedBuilder()
    .setColor(colors.error)
    .setAuthor({ name: `${config.server.name} • Decisão Oficial` })
    .setTitle(`${e.cry}  ALLOWLIST REPROVADA`)
    .setDescription(
      `> <@${userId}>, infelizmente sua allowlist foi **reprovada**.\n` +
      `> Você poderá tentar novamente.`
    )
    .addFields(
      {
        name: `${e.memo}  Recomendações`,
        value:
          `\`\`\`yaml\n` +
          `1. Estude os conceitos de RP\n` +
          `2. Leia DM, RDM, VDM, MetaGaming\n` +
          `3. Refaça a allowlist com calma\n` +
          `\`\`\``,
        inline: false
      }
    )
    .setFooter({ text: `${config.server.name} • Boa sorte na próxima` })
    .setTimestamp();
}

function connectPanelEmbed(status, uptimeMs, nextRestartMs) {
  const isOnline = status?.online;
  const { formatDuration } = require('../utils/serverState');

  if (!isOnline) {
    return new EmbedBuilder()
      .setColor(colors.error)
      .setTitle(`${config.server.name} • ${config.server.location}`)
      .setURL(`https://servers.fivem.net/servers/detail/${config.server.ip}`)
      .setDescription(
        `**Bem-vindo ao ${config.server.name}**\n` +
        `${config.server.description}\n\n` +
        `Servidor em tempo real • Status, jogadores e reinícios abaixo:`
      )
      .addFields(
        {
          name: `${e.fivem}  STATUS DO SERVIDOR`,
          value: `${e.redCircle} Offline • ${config.server.name}`,
          inline: false
        },
        {
          name: `${e.grayUser}  JOGADORES ONLINE`,
          value: `\`\`\`\n0 / ${config.server.slots}\n\`\`\``,
          inline: false
        },
        {
          name: `${e.link}  CONECTAR (F8)`,
          value: `\`\`\`\n${config.server.connect}\n\`\`\``,
          inline: false
        }
      )
      .setImage(BANNER_CONNECT)
      .setFooter({ text: `${config.server.name} • Atualiza automaticamente • ${_c.credit}` })
      .setTimestamp();
  }

  const players = status.players;
  const maxPlayers = status.maxPlayers;
  const hostname = status.hostname || config.server.name;

  const uptimeText = uptimeMs ? formatDuration(uptimeMs) : 'calculando...';
  const restartText = nextRestartMs ? `in ${formatDuration(nextRestartMs)}` : 'não agendado';

  return new EmbedBuilder()
    .setColor(colors.success)
    .setTitle(`${config.server.name} • ${config.server.location}`)
    .setURL(`https://servers.fivem.net/servers/detail/${config.server.ip}`)
    .setDescription(
      `**Bem-vindo ao ${config.server.name}**\n` +
      `${config.server.description}\n\n` +
      `Servidor em tempo real • Status, jogadores e reinícios abaixo:`
    )
    .addFields(
      {
        name: `${e.fivem}  STATUS DO SERVIDOR`,
        value: `${e.greenCircle} Online • ${hostname}`,
        inline: false
      },
      {
        name: `${e.greenUser}  JOGADORES ONLINE`,
        value: `\`\`\`\n${players} / ${maxPlayers}\n\`\`\``,
        inline: false
      },
      {
        name: `${e.link}  CONECTAR (F8)`,
        value: `\`\`\`\n${config.server.connect}\n\`\`\``,
        inline: false
      },
      {
        name: `${e.move}  PRÓXIMO RESTART`,
        value: `\`\`\`\n${restartText}\n\`\`\``,
        inline: true
      },
      {
        name: `${e.clock}  UPTIME`,
        value: `\`\`\`\n${uptimeText}\n\`\`\``,
        inline: true
      }
    )
    .setImage(BANNER_CONNECT)
    .setFooter({ text: `${config.server.name} • Atualiza automaticamente • ${_c.credit}` })
    .setTimestamp();
}

function logEmbed(type, description) {
  const typeConfig = {
    open: { title: 'WL Aberta', color: colors.info },
    approved: { title: 'WL Aprovada', color: colors.success },
    rejected: { title: 'WL Reprovada', color: colors.error },
    timeout: { title: 'Timeout', color: colors.warning },
    duplicate: { title: 'Tentativa Duplicada', color: colors.error },
    error: { title: 'Erro', color: colors.error }
  };

  const cfg = typeConfig[type] || { title: 'Log', color: colors.dark };

  return new EmbedBuilder()
    .setColor(cfg.color)
    .setTitle(cfg.title)
    .setDescription(description)
    .setFooter({ text: `${config.server.name} — Logs` })
    .setTimestamp();
}

function dmPendingEmbed() {
  return new EmbedBuilder()
    .setColor(colors.info)
    .setAuthor({ name: `${config.server.name} • Análise em andamento` })
    .setTitle(`${e.bellhop}  ALLOWLIST ENVIADA`)
    .setDescription(
      `> Sua allowlist foi enviada para análise da equipe.\n` +
      `> Você receberá uma notificação assim que houver uma decisão.`
    )
    .addFields(
      {
        name: `${e.clock}  Prazo de análise`,
        value: '```Até 3 horas```',
        inline: true
      },
      {
        name: `${e.memo}  Status`,
        value: '```Em análise```',
        inline: true
      },
      {
        name: `${e.bell}  Próxima notificação`,
        value: '```Aqui na DM```',
        inline: true
      }
    )
    .setFooter({ text: `${config.server.name} • Aguarde pacientemente` })
    .setTimestamp();
}

function dmApprovedEmbed() {
  return new EmbedBuilder()
    .setColor(colors.success)
    .setAuthor({ name: `${config.server.name} • Decisão Final` })
    .setTitle(`${e.party}  ALLOWLIST APROVADA`)
    .setDescription(
      `> Sua allowlist foi **aprovada**!\n` +
      `> Seu passaporte foi liberado. Conecte-se e divirta-se.`
    )
    .addFields(
      {
        name: `${e.link}  Connect F8`,
        value: `\`\`\`${config.server.connect}\`\`\``,
        inline: false
      },
      {
        name: `${e.fivem}  Bom jogo`,
        value: '```Respeite as regras de RP```',
        inline: false
      }
    )
    .setFooter({ text: `${config.server.name} • Bem-vindo à cidade` })
    .setTimestamp();
}

function dmRejectedEmbed() {
  return new EmbedBuilder()
    .setColor(colors.error)
    .setAuthor({ name: `${config.server.name} • Decisão Final` })
    .setTitle(`${e.cry}  ALLOWLIST REPROVADA`)
    .setDescription(
      `> Sua allowlist foi **reprovada**.\n` +
      `> Revise os conceitos de RP e tente novamente quando estiver pronto.`
    )
    .addFields(
      {
        name: `${e.move}  Pode tentar de novo?`,
        value: '```Sim, a qualquer momento```',
        inline: true
      },
      {
        name: `${e.memo}  Recomendação`,
        value: '```Estude os conceitos```',
        inline: true
      }
    )
    .setFooter({ text: `${config.server.name} • Boa sorte` })
    .setTimestamp();
}

module.exports = {
  colors,
  BANNER,
  wlPanelEmbed,
  questionEmbed,
  reviewEmbed,
  approvedEmbed,
  rejectedEmbed,
  connectPanelEmbed,
  logEmbed,
  dmPendingEmbed,
  dmApprovedEmbed,
  dmRejectedEmbed
};
