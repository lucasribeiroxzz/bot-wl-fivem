const fs = require('fs');
const path = require('path');

function loadEvents(client) {
  const eventsPath = path.join(__dirname, '..', 'events');
  const eventFiles = fs.readdirSync(eventsPath).filter(f => f.endsWith('.js'));
  let loaded = 0;

  for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    try {
      const stat = fs.statSync(filePath);
      if (stat.size === 0) {
        console.warn(`[EVENTS] Pulando arquivo vazio: ${file}`);
        continue;
      }
      delete require.cache[require.resolve(filePath)];
      const event = require(filePath);
      if (!event.name || !event.execute) continue;
      if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
      } else {
        client.on(event.name, (...args) => event.execute(...args, client));
      }
      loaded++;
    } catch (err) {
      console.warn(`[EVENTS] Falha ao carregar ${file}: ${err.message}`);
    }
  }

  console.log(`[EVENTS] ${loaded} eventos carregados.`);
}

module.exports = { loadEvents };
