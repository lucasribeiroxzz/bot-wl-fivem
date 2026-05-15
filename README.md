# Principal Bot

Bot Discord pra servidor de FiveM. Gerencia o sistema de allowlist do começo ao fim, conecta direto no banco do servidor, e mantém um painel de status do servidor sempre atualizado pros jogadores.

Fiz pra resolver um problema chato: ninguém quer ficar aprovando WL manualmente no HeidiSQL, e o pessoal sempre acaba esquecendo de atualizar o discord ID na conta. Esse bot cuida disso e ainda faz a entrevista de RP automática.

## O que ele faz

Allowlist completa via Discord. O candidato clica num botão, valida o token (vindo da sala `#connect` do servidor), responde 15 perguntas de RP num canal privado criado na hora, e o staff aprova ou reprova nos botões. Se aprovado: nick mudado pra `Nome Sobrenome [ID]`, cargo entregue, whitelist liberada no banco, DM enviada, canal apagado.

Painel de connect também — mostra status online/offline, jogadores conectados, uptime do servidor, próximo restart, e atualiza sozinho a cada 10 segundos consultando os endpoints públicos do FiveM (`/info.json`, `/dynamic.json`, `/players.json`).

Tem suporte a códigos de passe livre pra aprovação direta, sistema de logs separado, anti dupla WL (não dá pra abrir duas ao mesmo tempo nem mexer na WL alheia), e fallback de emojis pra Unicode caso você não tenha os custom configurados.

## Stack

- Node.js 18+ (precisa do fetch nativo)
- discord.js v14
- mariadb (driver oficial, com pool de conexões)
- dotenv

Sem TypeScript, sem build step, sem dependência exótica.

## Setup

```bash
git clone https://github.com/SEU_USUARIO/principal-bot.git
cd principal-bot
npm install
cp .env.example .env
```

Edita o `.env` com as credenciais. A tabela `accounts` precisa existir no banco com esses campos:

```sql
CREATE TABLE accounts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  token VARCHAR(100) UNIQUE NOT NULL,
  whitelist TINYINT(1) DEFAULT 0,
  discord VARCHAR(30) DEFAULT NULL
);
```

Se já tem a tabela do `vrp` ou de algum framework rodando, ela provavelmente já tá no esquema certo.

Depois:

```bash
npm run upload-emojis    # opcional, sobe os emojis no servidor e preenche os IDs no .env
npm run deploy           # registra os slash commands na guild
npm start
```

## Variáveis do .env

```
TOKEN                   token do bot
CLIENT_ID               id da aplicação
GUILD_ID                id do servidor discord

STAFF_ROLE              quem pode aprovar/reprovar
APPROVED_ROLE           cargo dado automaticamente ao aprovar
ADMIN_ROLE              quem pode usar /wlset e /setconnect

CATEGORY_WL             categoria onde os canais privados de WL são criados
CHANNEL_LOGS            logs internos
CHANNEL_APPROVED        anúncio público das aprovações
CHANNEL_REJECTED        anúncio público das reprovações
CHANNEL_REVIEW          onde caem as respostas pra staff revisar

SERVER_IP               IP do FiveM
SERVER_CONNECT          comando f8 completo (ex: connect 1.2.3.4)
SERVER_SLOTS            número de slots
SERVER_LOCATION         pra aparecer no painel (ex: São Paulo)
SERVER_DESCRIPTION      descrição curta no topo
RESTART_HOURS           horários separados por vírgula. ex: 00,06,12,18

DB_HOST                 host do mariadb
DB_USER                 usuário
DB_PASSWORD             senha
DB_DATABASE             nome do db
DB_PORT                 3306 normalmente
```

Os `E_*` (emojis) são opcionais. Se vazios, o bot usa Unicode.

## Comandos

| Comando | O que faz | Quem pode usar |
|---|---|---|
| `/wlset` | Manda o painel de allowlist no canal atual | `ADMIN_ROLE` |
| `/setconnect` | Manda o painel de connect com auto-update | `ADMIN_ROLE` |

## Como funciona a allowlist (fluxo)

1. Player clica em **Fazer Allowlist** no painel
2. Modal abre pedindo token, nome e sobrenome
3. Bot procura o token na tabela `accounts`
4. Se válido: salva o discord ID do player na conta, cria um canal privado `wl-username` (apenas ele e o staff veem)
5. Bot manda a primeira pergunta e edita essa mesma mensagem a cada nova pergunta — o chat fica sempre limpo
6. Cada resposta do player é apagada do chat depois de capturada (fica tudo em memória)
7. Timeout de 5 minutos por pergunta. Se estourar, WL cancelada, DM mandada, canal apagado
8. Quando termina, todas as respostas vão pro `CHANNEL_REVIEW` numa embed com botões de aprovar/reprovar
9. Player recebe DM avisando que tá em análise (prazo de até 3h)
10. Staff decide. Aprovado: `whitelist = 1`, nick mudado, cargo entregue, DM, canal apagado. Reprovado: `whitelist = 0`, DM, canal apagado.

O player nunca vê as próprias respostas depois que envia — vai tudo direto pro canal de revisão da staff.

### Códigos de passe livre

Configurados em `modals/wl_code_modal.js`, dá pra editar a lista de códigos válidos. Quando o player usa um código válido + token, a WL é aprovada na hora, sem entrevista.

## Painel de connect

Atualiza a cada 10 segundos consultando os endpoints públicos do FiveM. Mostra:

- Status online/offline (cor da embed muda)
- Hostname real do servidor
- Jogadores online / slots
- Connect F8
- Próximo restart (calculado pelos `RESTART_HOURS`)
- Uptime (persiste em `data/serverState.json`, sobrevive a restart do bot)

> Por que 10s e não 2s? Discord rate limit pra edição de mensagem é ~5/5s por canal. Em 2s vai bater rate limit eterno. 10s é o que servidores grandes usam e ainda parece "tempo real".

## Estrutura

```
buttons/        handlers dos botões (start wl, código, aprovar, reprovar)
commands/       slash commands (/wlset, /setconnect)
config/         config.js, embeds.js, questions.js, emojis.js
database/       pool mariadb + queries (findByToken, updateWhitelist, etc)
emotes/         arquivos png/gif pra subir no servidor
events/         ready, interactionCreate
handlers/       carregadores automáticos de comandos/eventos/botões/modais
modals/         handlers dos modais (token, código)
utils/          fivemApi, logger, sessions, pendingReviews, serverState, connectUpdater
data/           gerado em runtime, ignorado pelo git
```

Cada coisa no seu lugar, sem barriga.

## Upload dos emojis

`npm run upload-emojis` roda um script que:

- Lê todos os PNG/GIF da pasta `emotes/`
- Faz upload no servidor configurado em `GUILD_ID`
- Pega os IDs que o Discord retorna
- Escreve direto nas variáveis `E_*` do `.env`
- Aguarda 1.5s entre cada upload (anti rate limit)
- Se o emoji já existe com aquele nome, só lê o ID em vez de duplicar
- Se algum slot estiver cheio (50 estáticos / 50 animados num server sem boost), avisa e pula

Precisa que o bot tenha permissão **Gerenciar Emojis e Stickers** no servidor.

## Tabela `accounts`

```sql
CREATE TABLE accounts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  token VARCHAR(100) UNIQUE NOT NULL,
  whitelist TINYINT(1) DEFAULT 0,
  discord VARCHAR(30) DEFAULT NULL
);
```

O token é gerado pelo seu script de FiveM quando o player entra na sala de connect — o bot só consome. Se você não tem isso ainda, dá pra adaptar fácil pra gerar tokens aleatórios via resource e mostrar no F8 do player.

## Logs

Tudo importante vai pro `CHANNEL_LOGS`:

- Abertura de WL
- Aprovação
- Reprovação
- Timeout (player não respondeu uma pergunta a tempo)
- Tentativa de WL duplicada
- Erros internos

Embed colorida por tipo, com timestamp e menção do player envolvido.

## Personalizando

**Perguntas:** edita `config/questions.js`. Pode adicionar, remover ou reescrever. O bot usa `length` do array, então o progresso `X/Y` se ajusta sozinho.

**Banner:** as URLs estão em `config/embeds.js` no topo (`BANNER_WL` e `BANNER_CONNECT`). Pode trocar por qualquer imagem hospedada (recomendo imgbb ou imgur).

**Cores:** também no `config/embeds.js`, objeto `colors`. Use decimal ou hex.

**Embeds:** todas centralizadas em `config/embeds.js`. Cada função retorna um `EmbedBuilder`, então é fácil refatorar sem caçar string pelo projeto.

## Problemas comuns

**"Token inválido"** — verifica se a tabela `accounts` tem o token cadastrado e se a coluna não tá em outro nome.

**Bot não responde aos botões** — esqueceu de rodar `npm run deploy`. Os slash commands precisam estar registrados na guild.

**Painel de connect mostra offline com servidor ligado** — verifica se os endpoints do FiveM estão expostos. Tenta abrir `http://SEU_IP:30120/info.json` no navegador. Se não abrir, o servidor tá com `sv_endpointPrivacy` true ou firewall bloqueando.

**Emoji não aparece nos botões** — só funciona com emojis de servidores onde o bot está presente. Subir os emojis no próprio servidor da cidade resolve.

**Bot trava ao iniciar** — verifica logs do `mariadb`. Provavelmente credenciais erradas no `.env` ou o usuário do banco não tem permissão remota.

## Roadmap

Coisas que pretendo adicionar quando der tempo:

- Comando `/wlinfo @user` pra staff ver o status da WL de alguém
- Sistema de banimento via Discord (kick + remoção da whitelist)
- Painel de stats (quantas WLs aprovadas/reprovadas no mês)
- Webhook pro Discord avisar quando o servidor cair

## Licença

MIT. Pode usar à vontade no seu servidor, modificar, redistribuir. Só não tira os créditos da fonte.

---

Feito por **Lucas Ribeiro**.
