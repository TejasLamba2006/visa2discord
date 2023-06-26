const { convertEmoji } = require('../../ext/emoji_convert.js');
const { fillOut, emoji, custom_emoji, PARSE_MODE_NONE } = require('../../ext/html_gen.js');
class Reaction {
  constructor(reaction, guild) {
    this.reaction = reaction;
    this.guild = guild;
  }

  async flow() {
    await this.build_reaction();
    return this.reaction;
  }

  async build_reaction() {
    if (this.reaction._emoji.id) {
      if (this.reaction._emoji.animated) {
        await this.create_discord_reaction("gif");
      } else {
        await this.create_discord_reaction("png");
      }
    } else {
      await this.create_standard_emoji();
    }
  }

  async create_discord_reaction(emoji_type) {
    this.reaction = await fillOut(this.guild, custom_emoji, [
      ["EMOJI", String(this.reaction._emoji.id), PARSE_MODE_NONE],
      ["EMOJI_COUNT", String(this.reaction.count), PARSE_MODE_NONE],
      ["EMOJI_FILE", emoji_type, PARSE_MODE_NONE]
    ]);
  }

  async create_standard_emoji() {
    const react_emoji = await convertEmoji(this.reaction.emoji.name);
    this.reaction = await fillOut(this.guild, emoji, [
      ["EMOJI", String(react_emoji), PARSE_MODE_NONE],
      ["EMOJI_COUNT", String(this.reaction.count), PARSE_MODE_NONE]
    ]);
  }
}

module.exports = {
  Reaction
};