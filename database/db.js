const mariadb = require('mariadb');
const config = require('../config/config');

const pool = mariadb.createPool({
  host: config.mysql.host,
  user: config.mysql.user,
  password: config.mysql.password,
  database: config.mysql.database,
  port: config.mysql.port,
  connectionLimit: 10,
  acquireTimeout: 30000
});

async function getConnection() {
  return await pool.getConnection();
}

async function findByToken(token) {
  let conn;
  try {
    conn = await getConnection();
    const rows = await conn.query('SELECT id, token, whitelist, discord FROM accounts WHERE token = ?', [token]);
    return rows.length > 0 ? rows[0] : null;
  } finally {
    if (conn) conn.release();
  }
}

async function findByDiscord(discordId) {
  let conn;
  try {
    conn = await getConnection();
    const rows = await conn.query('SELECT id, token, whitelist, discord FROM accounts WHERE discord = ?', [discordId]);
    return rows.length > 0 ? rows[0] : null;
  } finally {
    if (conn) conn.release();
  }
}

async function updateWhitelist(accountId, value) {
  let conn;
  try {
    conn = await getConnection();
    await conn.query('UPDATE accounts SET whitelist = ? WHERE id = ?', [value, accountId]);
    return true;
  } finally {
    if (conn) conn.release();
  }
}

async function updateDiscord(accountId, discordId) {
  let conn;
  try {
    conn = await getConnection();
    await conn.query('UPDATE accounts SET discord = ? WHERE id = ?', [discordId, accountId]);
    return true;
  } finally {
    if (conn) conn.release();
  }
}

async function testConnection() {
  let conn;
  try {
    conn = await getConnection();
    await conn.query('SELECT 1');
    return true;
  } catch {
    return false;
  } finally {
    if (conn) conn.release();
  }
}

module.exports = { pool, getConnection, findByToken, findByDiscord, updateWhitelist, updateDiscord, testConnection };
