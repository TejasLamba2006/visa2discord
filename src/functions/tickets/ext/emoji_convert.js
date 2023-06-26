const emoji = require("emoji");
const fetch = require("node-fetch");
const cache = require("./cache.js");
const twemoji = require("twemoji");
const cdnFmt =
  "https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/{codepoint}.png";

async function validSrc(src) {
  try {
    const response = await fetch(src);
    return response.ok;
  } catch (error) {
    return false;
  }
}

function validCategory(char) {
  const regex =
    /[\uD800-\uDBFF][\uDC00-\uDFFF]|\p{Emoji_Presentation}|\p{Extended_Pictographic}/gu;
  return regex.test(char);
}

async function codepoint(codes) {
  if (!codes.includes("200d")) {
    return codes.filter((c) => c !== "fe0f").join("-");
  }
  return codes.join("-");
}

async function convert(char) {
  if (validCategory(char)) {
    const name = char; // You can replace it with the appropriate name for the emoji
    const src = cdnFmt.replace(
      "{codepoint}",
      await codepoint(
        [...char].map((c) =>
          `{cp:x}`.replace("{cp}", c.charCodeAt(0).toString(16))
        )
      )
    );
    if (await validSrc(src)) {
      return `<img class="emoji emoji--small" src="${src}" alt="${char}" title="${name}" aria-label="Emoji: ${name}">`;
    } else {
      return char;
    }
  } else {
    if (char.length === 1) {
      return char;
    } else {
      const shortcode = emoji.demojize(char);
      const name =
        shortcode
          .replace(/:/g, "")
          .replace(/_/g, " ")
          .replace("selector", "")
          .charAt(0)
          .toUpperCase() +
        shortcode
          .replace(/:/g, "")
          .replace(/_/g, " ")
          .replace("selector", "")
          .slice(1);
      const src = cdnFmt.replace(
        "{codepoint}",
        await codepoint(
          [...char].map((c) =>
            `{cp:x}`.replace("{cp}", c.charCodeAt(0).toString(16))
          )
        )
      );
      if (await validSrc(src)) {
        return `<img class="emoji emoji--small" src="${src}" alt="${char}" title="${name}" aria-label="Emoji: ${name}">`;
      } else {
        return char;
      }
    }
  }
}

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
  convertEmoji,
  convert,
  codepoint,
  validSrc,
  validCategory,
};
