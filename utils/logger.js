const config = require('../config/config');
const { logEmbed } = require('../config/embeds');

async function sendLog(client, type, description) {
  try {
    const channel = await client.channels.fetch(config.channels.logs);
    if (!channel) return;
    await channel.send({ embeds: [logEmbed(type, description)] });
  } catch (err) {
    console.error('[LOG ERROR]', err.message);
  }
}

module.exports = { sendLog };
