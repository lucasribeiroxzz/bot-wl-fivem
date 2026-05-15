const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'data', 'connectMessages.json');

function ensureDir() {
  const dir = path.dirname(FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function loadMessages() {
  try {
    ensureDir();
    if (!fs.existsSync(FILE)) return [];
    const raw = fs.readFileSync(FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveMessages(arr) {
  try {
    ensureDir();
    fs.writeFileSync(FILE, JSON.stringify(arr, null, 2));
  } catch {}
}

function addMessage(channelId, messageId) {
  const arr = loadMessages();
  const exists = arr.find(m => m.channelId === channelId && m.messageId === messageId);
  if (!exists) {
    arr.push({ channelId, messageId });
    saveMessages(arr);
  }
}

function removeMessage(channelId, messageId) {
  const arr = loadMessages().filter(m => !(m.channelId === channelId && m.messageId === messageId));
  saveMessages(arr);
}

module.exports = { loadMessages, addMessage, removeMessage };
