const config = require('../config/config');
const { connectPanelEmbed } = require('../config/embeds');
const { getServerStatus } = require('./fivemApi');
const { loadMessages, removeMessage } = require('./connectMessages');
const { updateOnlineState, getUptime, getNextRestart } = require('./serverState');

const UPDATE_INTERVAL = 10000;

async function tick(client) {
  let status;
  try {
    status = await getServerStatus(config.server.ip);
  } catch {
    status = { online: false };
  }

  updateOnlineState(status.online);

  const messages = loadMessages();
  if (messages.length === 0) return;

  const uptime = getUptime();
  const nextRestart = getNextRestart();
  const embed = connectPanelEmbed(status, uptime, nextRestart);

  for (const ref of messages) {
    try {
      const channel = await client.channels.fetch(ref.channelId).catch(() => null);
      if (!channel) {
        removeMessage(ref.channelId, ref.messageId);
        continue;
      }

      const msg = await channel.messages.fetch(ref.messageId).catch(() => null);
      if (!msg) {
        removeMessage(ref.channelId, ref.messageId);
        continue;
      }

      await msg.edit({ embeds: [embed], components: msg.components });
    } catch (err) {
      if (err.code === 10008 || err.code === 10003) {
        removeMessage(ref.channelId, ref.messageId);
      }
    }
  }
}

function startConnectUpdater(client) {
  tick(client).catch(() => {});
  setInterval(() => tick(client).catch(() => {}), UPDATE_INTERVAL);
  console.log(`[CONNECT] Atualizador de status iniciado (${UPDATE_INTERVAL / 1000}s).`);
}

module.exports = { startConnectUpdater };
