const fs = require('fs');
const path = require('path');
const { Collection } = require('discord.js');

function loadCommands(client) {
  client.commands = new Collection();
  const commandsPath = path.join(__dirname, '..', 'commands');
  const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    try {
      const stat = fs.statSync(filePath);
      if (stat.size === 0) {
        console.warn(`[COMMANDS] Pulando arquivo vazio: ${file}`);
        continue;
      }
      delete require.cache[require.resolve(filePath)];
      const command = require(filePath);
      if (command.data && command.execute) {
        client.commands.set(command.data.name, command);
      }
    } catch (err) {
      console.warn(`[COMMANDS] Falha ao carregar ${file}: ${err.message}`);
    }
  }

  console.log(`[COMMANDS] ${client.commands.size} comandos carregados.`);
}

module.exports = { loadCommands };
