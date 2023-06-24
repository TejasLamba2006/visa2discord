const emoji = require('emoji');
const fetch = require('node-fetch');
const cache = require('./cache.js');

const cdnFmt = "https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/{codepoint}.png";

async function validSrc(src) {
  try {
    const response = await fetch(src);
    return response.ok;
  } catch (error) {
    return false;
  }
}

function validCategory(char) {
  // Alternative to unicodedata.category(char) === "So"
  // Check if the character is an emoji using the emoji library
  return emoji.which(char) !== undefined;
}

async function codepoint(codes) {
  if (!codes.includes("200d")) {
    return codes.filter(c => c !== "fe0f").join("-");
  }
  return codes.join("-");
}

async function convert(char) {
  if (validCategory(char)) {
    const name = char; // You can replace it with the appropriate name for the emoji
    const src = cdnFmt.replace("{codepoint}", await codepoint([...char].map(c => `{cp:x}`.replace("{cp}", c.charCodeAt(0).toString(16)))));
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
      const name = shortcode.replace(/:/g, "").replace(/_/g, " ").replace("selector", "").charAt(0).toUpperCase() + shortcode.replace(/:/g, "").replace(/_/g, " ").replace("selector", "").slice(1);
      const src = cdnFmt.replace("{codepoint}", await codepoint([...char].map(c => `{cp:x}`.replace("{cp}", c.charCodeAt(0).toString(16)))));
      if (await validSrc(src)) {
        return `<img class="emoji emoji--small" src="${src}" alt="${char}" title="${name}" aria-label="Emoji: ${name}">`;
      } else {
        return char;
      }
    }
  }
}

async function convertEmoji(string) {
  const x = [];
  for (const ch of [...string]) {
    x.push(await convert(ch));
  }
  return x.join("");
}
