const { Client, GatewayIntentBits, Partials } = require('discord.js');
const config = require('./config/config');
const { loadCommands } = require('./handlers/commandHandler');
const { loadEvents } = require('./handlers/eventHandler');
const { loadButtons } = require('./handlers/buttonHandler');
const { loadModals } = require('./handlers/modalHandler');
const _credits = require('./utils/_credits');

_credits.verify();

console.log('\x1b[35m╔══════════════════════════════════════════════════╗\x1b[0m');
console.log('\x1b[35m║\x1b[0m  \x1b[1;36mPrincipal RP — Sistema de Allowlist\x1b[0m            \x1b[35m║\x1b[0m');
console.log('\x1b[35m║\x1b[0m  \x1b[1;31m' + _credits.credit + '\x1b[0m                       \x1b[35m║\x1b[0m');
console.log('\x1b[35m╚══════════════════════════════════════════════════╝\x1b[0m\n');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ],
  partials: [
    Partials.Channel,
    Partials.Message,
    Partials.GuildMember
  ]
});

loadCommands(client);
loadEvents(client);
loadButtons(client);
loadModals(client);

client.login(config.token);

process.on('unhandledRejection', (err) => {
  console.error('[UNHANDLED]', err);
});

process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT]', err);
});
