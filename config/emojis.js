require('dotenv').config();

function emoji(envKey, fallback) {
  const val = process.env[envKey];
  return val && val.trim().length > 0 ? val.trim() : fallback;
}

module.exports = {
  greenCircle: emoji('E_GREEN_CIRCLE', '🟢'),
  redCircle:   emoji('E_RED_CIRCLE',   '🔴'),
  clock:       emoji('E_CLOCK',        '⏱️'),
  link:        emoji('E_LINK',         '🔗'),
  info:        emoji('E_INFO',         'ℹ️'),
  warning:     emoji('E_WARNING',      '⚠️'),
  hashtag:     emoji('E_HASHTAG',      '#️⃣'),
  yes:         emoji('E_YES',          '✅'),
  no:          emoji('E_NO',           '❌'),
  pencil:      emoji('E_PENCIL',       '✏️'),
  ticket:      emoji('E_TICKET',       '🎫'),
  fivem:       emoji('E_FIVEM',        '🎮'),
  door:        emoji('E_DOOR',         '🚪'),
  gear:        emoji('E_GEAR',         '⚙️'),
  bell:        emoji('E_BELL',         '🔔'),
  bellhop:     emoji('E_BELLHOP',      '🛎️'),
  booster:     emoji('E_BOOSTER',      '🚀'),
  check:       emoji('E_CHECK',        '✅'),
  cross:       emoji('E_CROSS',        '❌'),
  clap:        emoji('E_CLAP',         '👏'),
  cry:         emoji('E_CRY',          '😢'),
  party:       emoji('E_PARTY',        '🎉'),
  plus:        emoji('E_PLUS',         '➕'),
  memo:        emoji('E_MEMO',         '📝'),
  apencil:     emoji('E_APENCIL',      '✏️'),
  move:        emoji('E_MOVE',         '🔄'),
  arrival:     emoji('E_ARRIVAL',      '📥'),
  departure:   emoji('E_DEPARTURE',    '📤'),
  greenUser:   emoji('E_GREEN_USER',   '👤'),
  grayUser:    emoji('E_GRAY_USER',    '👤'),
  questionRed: emoji('E_QUESTION_RED', '❓'),
  questionWhite: emoji('E_QUESTION_WHITE', '❔'),
  robot:       emoji('E_ROBOT',        '🤖'),
  salute:      emoji('E_SALUTE',       '🫡'),
  sunglasses:  emoji('E_SUNGLASSES',   '😎'),
  thumbsUp:    emoji('E_THUMBS_UP',    '👍'),
  thumbsDown:  emoji('E_THUMBS_DOWN',  '👎'),
  wave:        emoji('E_WAVE',         '👋'),
  wink:        emoji('E_WINK',         '😉'),
  handDown:    emoji('E_HAND_DOWN',    '👇'),
  number1:     emoji('E_NUMBER_1',     '1️⃣'),
  number2:     emoji('E_NUMBER_2',     '2️⃣'),
  number3:     emoji('E_NUMBER_3',     '3️⃣'),
  number4:     emoji('E_NUMBER_4',     '4️⃣')
};
