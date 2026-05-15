const SERVER_PORT = 30120;

async function fetchJson(url, timeout = 4000) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}

async function getServerStatus(ip) {
  const base = `http://${ip}:${SERVER_PORT}`;

  try {
    const [dynamic, players, info] = await Promise.all([
      fetchJson(`${base}/dynamic.json`).catch(() => null),
      fetchJson(`${base}/players.json`).catch(() => null),
      fetchJson(`${base}/info.json`).catch(() => null)
    ]);

    if (!dynamic && !players && !info) {
      return { online: false };
    }

    const playerCount = Array.isArray(players) ? players.length : (dynamic?.clients || 0);
    const maxPlayers = dynamic?.sv_maxclients || info?.vars?.sv_maxClients || 64;
    const hostname = dynamic?.hostname || info?.vars?.sv_hostname || 'Principal RP';
    const gametype = dynamic?.gametype || info?.vars?.gametype || 'Roleplay';
    const mapname = dynamic?.mapname || info?.vars?.mapname || 'Los Santos';

    const pings = Array.isArray(players)
      ? players.map(p => p.ping).filter(p => p > 0)
      : [];
    const avgPing = pings.length > 0
      ? Math.round(pings.reduce((a, b) => a + b, 0) / pings.length)
      : 0;

    return {
      online: true,
      hostname: stripColors(hostname),
      players: playerCount,
      maxPlayers,
      gametype,
      mapname,
      avgPing,
      resources: info?.resources?.length || 0,
      version: info?.server || 'desconhecido',
      playerList: Array.isArray(players) ? players : []
    };
  } catch {
    return { online: false };
  }
}

function stripColors(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/\^[0-9]/g, '');
}

module.exports = { getServerStatus };
