const activeSessions = new Map();

function hasActiveSession(userId) {
  return activeSessions.has(userId);
}

function setActiveSession(userId, data) {
  activeSessions.set(userId, data);
}

function removeActiveSession(userId) {
  activeSessions.delete(userId);
}

function getActiveSession(userId) {
  return activeSessions.get(userId);
}

module.exports = { hasActiveSession, setActiveSession, removeActiveSession, getActiveSession };
