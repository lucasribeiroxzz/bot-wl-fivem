const fs = require('fs');
const path = require('path');
const config = require('../config/config');

const FILE = path.join(__dirname, '..', 'data', 'serverState.json');

function ensureDir() {
  const dir = path.dirname(FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function loadState() {
  try {
    ensureDir();
    if (!fs.existsSync(FILE)) return { wentOnlineAt: null, lastOnline: false };
    return JSON.parse(fs.readFileSync(FILE, 'utf8'));
  } catch {
    return { wentOnlineAt: null, lastOnline: false };
  }
}

function saveState(state) {
  try {
    ensureDir();
    fs.writeFileSync(FILE, JSON.stringify(state, null, 2));
  } catch {}
}

function updateOnlineState(isOnline) {
  const state = loadState();

  if (isOnline && !state.lastOnline) {
    state.wentOnlineAt = Date.now();
  }

  if (!isOnline) {
    state.wentOnlineAt = null;
  }

  state.lastOnline = isOnline;
  saveState(state);
  return state;
}

function formatDuration(ms) {
  if (ms < 0 || !ms) return '0 mins';

  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  const parts = [];
  if (days > 0) parts.push(`${days} ${days === 1 ? 'dia' : 'dias'}`);
  if (hours > 0) parts.push(`${hours} ${hours === 1 ? 'hr' : 'hrs'}`);
  if (minutes > 0) parts.push(`${minutes} ${minutes === 1 ? 'min' : 'mins'}`);

  if (parts.length === 0) return 'menos de 1 min';
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return `${parts[0]}, ${parts[1]}`;
  return `${parts[0]}, ${parts[1]} e ${parts[2]}`;
}

function getUptime() {
  const state = loadState();
  if (!state.wentOnlineAt) return null;
  return Date.now() - state.wentOnlineAt;
}

function getNextRestart() {
  const hours = config.server.restartHours;
  if (!hours || hours.length === 0) return null;

  const now = new Date();
  const currentMs = now.getTime();

  const candidates = [];
  for (let offset = 0; offset <= 1; offset++) {
    for (const h of hours) {
      const candidate = new Date(now);
      candidate.setDate(now.getDate() + offset);
      candidate.setHours(h, 0, 0, 0);
      if (candidate.getTime() > currentMs) {
        candidates.push(candidate.getTime());
      }
    }
  }

  if (candidates.length === 0) return null;

  const nextMs = Math.min(...candidates);
  return nextMs - currentMs;
}

module.exports = { updateOnlineState, getUptime, getNextRestart, formatDuration };
