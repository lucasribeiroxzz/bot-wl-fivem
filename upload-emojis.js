const fs = require('fs');
const path = require('path');
require('dotenv').config();

const TOKEN = process.env.TOKEN;
const GUILD_ID = process.env.GUILD_ID;
const EMOTES_DIR = path.join(__dirname, 'emotes');
const ENV_PATH = path.join(__dirname, '.env');

if (!TOKEN || !GUILD_ID) {
  console.error('[ERRO] TOKEN ou GUILD_ID não definidos no .env');
  process.exit(1);
}

const NAME_TO_ENV = {
  'fivem':           'E_FIVEM',
  'green_circle':    'E_GREEN_CIRCLE',
  'red_circle':      'E_RED_CIRCLE',
  'clock':           'E_CLOCK',
  'link':            'E_LINK',
  'info':            'E_INFO',
  'warning':         'E_WARNING',
  'hashtag':         'E_HASHTAG',
  'yes':             'E_YES',
  'no':              'E_NO',
  'pencil':          'E_PENCIL',
  'ticket':          'E_TICKET',
  'door':            'E_DOOR',
  'gear':            'E_GEAR',
  'bell':            'E_BELL',
  'bellhop':         'E_BELLHOP',
  'booster':         'E_BOOSTER',
  'check':           'E_CHECK',
  'cross_mark':      'E_CROSS',
  'clap':            'E_CLAP',
  'cry':             'E_CRY',
  'party':           'E_PARTY',
  'plus':            'E_PLUS',
  'memo':            'E_MEMO',
  'apencil':         'E_APENCIL',
  'move':            'E_MOVE',
  'arrival':         'E_ARRIVAL',
  'departure':       'E_DEPARTURE',
  'green_user':      'E_GREEN_USER',
  'gray_user':       'E_GRAY_USER',
  'question_red':    'E_QUESTION_RED',
  'question_white':  'E_QUESTION_WHITE',
  'robot':           'E_ROBOT',
  'salute':          'E_SALUTE',
  'sunglasses':      'E_SUNGLASSES',
  'thumbs_up':       'E_THUMBS_UP',
  'thumbs_down':     'E_THUMBS_DOWN',
  'wave':            'E_WAVE',
  'wink':            'E_WINK',
  'hand_down':       'E_HAND_DOWN',
  'number1':         'E_NUMBER_1',
  'number2':         'E_NUMBER_2',
  'number3':         'E_NUMBER_3',
  'number4':         'E_NUMBER_4'
};

const HEADERS = {
  'Authorization': `Bot ${TOKEN}`,
  'Content-Type': 'application/json'
};

async function listExistingEmojis() {
  const res = await fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/emojis`, { headers: HEADERS });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Falha ao listar emojis: ${res.status} ${text}`);
  }
  return await res.json();
}

async function uploadEmoji(name, filePath) {
  const ext = path.extname(filePath).slice(1).toLowerCase();
  const mime = ext === 'gif' ? 'image/gif' : 'image/png';
  const data = fs.readFileSync(filePath);
  const base64 = `data:${mime};base64,${data.toString('base64')}`;

  const res = await fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/emojis`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({ name, image: base64 })
  });

  if (res.status === 429) {
    const body = await res.json();
    const wait = Math.ceil((body.retry_after || 1) * 1000);
    console.log(`  [RATE LIMIT] Aguardando ${wait}ms...`);
    await sleep(wait);
    return uploadEmoji(name, filePath);
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }

  return await res.json();
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function updateEnv(updates) {
  let content = fs.readFileSync(ENV_PATH, 'utf8');
  for (const [key, value] of Object.entries(updates)) {
    const regex = new RegExp(`^${key}=.*$`, 'm');
    if (regex.test(content)) {
      content = content.replace(regex, `${key}=${value}`);
    } else {
      content += `\n${key}=${value}`;
    }
  }
  fs.writeFileSync(ENV_PATH, content);
}

(async () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  UPLOAD AUTOMÁTICO DE EMOJIS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (!fs.existsSync(EMOTES_DIR)) {
    console.error(`[ERRO] Pasta emotes/ não encontrada em ${EMOTES_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(EMOTES_DIR).filter(f => /\.(png|gif)$/i.test(f));
  console.log(`[INFO] ${files.length} arquivos de emoji encontrados.\n`);

  let existing = [];
  try {
    existing = await listExistingEmojis();
    console.log(`[INFO] ${existing.length} emojis já existem no servidor.\n`);
  } catch (err) {
    console.error('[ERRO]', err.message);
    process.exit(1);
  }

  const envUpdates = {};
  let staticCount = existing.filter(e => !e.animated).length;
  let animatedCount = existing.filter(e => e.animated).length;
  const STATIC_LIMIT = 50;
  const ANIMATED_LIMIT = 50;

  let uploaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const file of files) {
    const baseName = path.basename(file, path.extname(file)).toLowerCase();
    const ext = path.extname(file).slice(1).toLowerCase();
    const isAnimated = ext === 'gif';
    const filePath = path.join(EMOTES_DIR, file);
    const envKey = NAME_TO_ENV[baseName];

    if (!envKey) {
      console.log(`[SKIP] ${file} — não mapeado no script`);
      skipped++;
      continue;
    }

    const exists = existing.find(e => e.name === baseName);
    if (exists) {
      const tag = exists.animated ? `<a:${exists.name}:${exists.id}>` : `<:${exists.name}:${exists.id}>`;
      envUpdates[envKey] = tag;
      console.log(`[EXISTE] ${file} → ${tag}`);
      skipped++;
      continue;
    }

    if (isAnimated && animatedCount >= ANIMATED_LIMIT) {
      console.log(`[LIMITE] ${file} — slot de animados cheio (${ANIMATED_LIMIT})`);
      failed++;
      continue;
    }
    if (!isAnimated && staticCount >= STATIC_LIMIT) {
      console.log(`[LIMITE] ${file} — slot de estáticos cheio (${STATIC_LIMIT})`);
      failed++;
      continue;
    }

    try {
      console.log(`[UPLOAD] ${file}...`);
      const result = await uploadEmoji(baseName, filePath);
      const tag = result.animated ? `<a:${result.name}:${result.id}>` : `<:${result.name}:${result.id}>`;
      envUpdates[envKey] = tag;
      console.log(`  → ${tag}`);
      uploaded++;
      if (isAnimated) animatedCount++; else staticCount++;
      await sleep(1500);
    } catch (err) {
      console.error(`  [FALHA] ${file}: ${err.message}`);
      failed++;
    }
  }

  if (Object.keys(envUpdates).length > 0) {
    updateEnv(envUpdates);
    console.log(`\n[OK] ${Object.keys(envUpdates).length} variáveis atualizadas no .env`);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  RESUMO');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  Upload novos:    ${uploaded}`);
  console.log(`  Já existiam:     ${skipped}`);
  console.log(`  Falhas:          ${failed}`);
  console.log(`  Estáticos:       ${staticCount}/${STATIC_LIMIT}`);
  console.log(`  Animados:        ${animatedCount}/${ANIMATED_LIMIT}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('[FINALIZADO] Agora rode: npm start');
})();
