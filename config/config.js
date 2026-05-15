require('dotenv').config();

module.exports = {
  token: process.env.TOKEN,
  clientId: process.env.CLIENT_ID,
  guildId: process.env.GUILD_ID,

  staffRole: process.env.STAFF_ROLE,
  approvedRole: process.env.APPROVED_ROLE,
  adminRole: process.env.ADMIN_ROLE,

  categoryWL: process.env.CATEGORY_WL,

  channels: {
    logs: process.env.CHANNEL_LOGS,
    approved: process.env.CHANNEL_APPROVED,
    rejected: process.env.CHANNEL_REJECTED,
    review: process.env.CHANNEL_REVIEW
  },

  server: {
    name: process.env.SERVER_NAME || 'Principal RP',
    ip: process.env.SERVER_IP,
    connect: process.env.SERVER_CONNECT,
    slots: parseInt(process.env.SERVER_SLOTS) || 64,
    location: process.env.SERVER_LOCATION || 'Brasil',
    description: process.env.SERVER_DESCRIPTION || 'Servidor de Roleplay.',
    restartHours: (process.env.RESTART_HOURS || '00,06,12,18').split(',').map(h => parseInt(h.trim())).filter(n => !isNaN(n))
  },

  mysql: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: parseInt(process.env.DB_PORT) || 3306
  }
};
