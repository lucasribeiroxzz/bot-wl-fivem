const fs = require('fs');
const path = require('path');
const { Collection } = require('discord.js');

function loadModals(client) {
  client.modals = new Collection();
  const modalsPath = path.join(__dirname, '..', 'modals');
  const modalFiles = fs.readdirSync(modalsPath).filter(f => f.endsWith('.js'));

  for (const file of modalFiles) {
    const filePath = path.join(modalsPath, file);
    try {
      const stat = fs.statSync(filePath);
      if (stat.size === 0) {
        console.warn(`[MODALS] Pulando arquivo vazio: ${file}`);
        continue;
      }
      delete require.cache[require.resolve(filePath)];
      const modal = require(filePath);
      if (modal.customId && modal.execute) {
        client.modals.set(modal.customId, modal);
      }
    } catch (err) {
      console.warn(`[MODALS] Falha ao carregar ${file}: ${err.message}`);
    }
  }

  console.log(`[MODALS] ${client.modals.size} modais carregados.`);
}

module.exports = { loadModals };
