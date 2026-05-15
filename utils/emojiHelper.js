function parseEmoji(emojiString) {
  if (!emojiString || typeof emojiString !== 'string') return null;

  const trimmed = emojiString.trim();
  const match = trimmed.match(/^<(a?):([a-zA-Z0-9_]+):(\d+)>$/);
  if (match) {
    return {
      animated: match[1] === 'a',
      name: match[2],
      id: match[3]
    };
  }

  return trimmed;
}

module.exports = { parseEmoji };
