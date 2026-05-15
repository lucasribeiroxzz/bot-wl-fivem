const fs = require('fs');
const path = require('path');
const { Collection } = require('discord.js');

function loadButtons(client) {
  client.buttons = new Collection();
  const buttonsPath = path.join(__dirname, '..', 'buttons');
  const buttonFiles = fs.readdirSync(buttonsPath).filter(f => f.endsWith('.js'));

  for (const file of buttonFiles) {
    const filePath = path.join(buttonsPath, file);
    try {
      const stat = fs.statSync(filePath);
      if (stat.size === 0) {
        console.warn(`[BUTTONS] Pulando arquivo vazio: ${file}`);
        continue;
      }

      delete require.cache[require.resolve(filePath)];
      const button = require(filePath);

      if (button.customId && button.execute) {
        client.buttons.set(button.customId, button);
      }
    } catch (err) {
      console.warn(`[BUTTONS] Falha ao carregar ${file}: ${err.message}`);
    }
  }

  console.log(`[BUTTONS] ${client.buttons.size} botões carregados.`);
}

module.exports = { loadButtons };
