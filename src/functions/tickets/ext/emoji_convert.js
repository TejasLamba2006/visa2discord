const twemoji = require("twemoji");
const cdnFmt =
  "https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/{codepoint}.png";


async function convertEmoji(string) {
  const regex = /<:[^:]+:(\d{16})>|([\uD800-\uDBFF][\uDC00-\uDFFF])/g;
  return string.replace(regex, (match, emojiId, defaultEmoji) => {
    if (emojiId) {
      return `<img src="https://cdn.discordapp.com/emojis/${emojiId}.png" height="20px" width="20px" />`;
    } else {
      const codepoints = twemoji.convert.toCodePoint(defaultEmoji);
      return `<img src="https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/${codepoints}.svg" height="20px" width="20px" />`;
    }
  });

}

module.exports = {
  convertEmoji
};
