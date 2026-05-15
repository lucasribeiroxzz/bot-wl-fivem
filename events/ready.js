const { ActivityType } = require('discord.js');
const config = require('../config/config');
const { testConnection } = require('../database/db');
const { startConnectUpdater } = require('../utils/connectUpdater');
const _credits = require('../utils/_credits');

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    _credits.verify();
    console.log(`[BOT] ${client.user.tag} online.`);

    const statuses = [
      { name: _credits.statusCredit, type: ActivityType.Playing },
      { name: `Sistema de Allowlist • ${_credits.credit}`, type: ActivityType.Watching },
      { name: `${config.server.name} • by ${_credits.author} ❤️`, type: ActivityType.Playing }
    ];

    let i = 0;
    const setStatus = () => {
      const s = statuses[i % statuses.length];
      client.user.setActivity(s.name, { type: s.type });
      i++;
    };
    setStatus();
    setInterval(setStatus, 30000);

    const dbOk = await testConnection();
    console.log(dbOk ? '[DATABASE] MariaDB conectado.' : '[DATABASE] Falha na conexão MariaDB.');

    startConnectUpdater(client);
  }
};
