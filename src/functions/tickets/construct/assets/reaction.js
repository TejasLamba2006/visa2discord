const { convert_emoji } = require('../../ext/emoji_convert.js');
const { fill_out, emoji, custom_emoji, PARSE_MODE_NONE } = require('../../ext/html_gen.js');

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
    if (":" in String(this.reaction.emoji)) {
      const emoji_animated = /&lt;a:.*:.*&gt;/;
      if (emoji_animated.test(String(this.reaction.emoji))) {
        await this.create_discord_reaction("gif");
      } else {
        await this.create_discord_reaction("png");
      }
    } else {
      await this.create_standard_emoji();
    }
  }

  async create_discord_reaction(emoji_type) {
    const pattern = /:.*:(\d*)/;
    const emoji_id = String(this.reaction.emoji).match(pattern)[1];
    this.reaction = await fill_out(this.guild, custom_emoji, [
      ["EMOJI", String(emoji_id), PARSE_MODE_NONE],
      ["EMOJI_COUNT", String(this.reaction.count), PARSE_MODE_NONE],
      ["EMOJI_FILE", emoji_type, PARSE_MODE_NONE]
    ]);
  }

  async create_standard_emoji() {
    const react_emoji = await convert_emoji(this.reaction.emoji);
    this.reaction = await fill_out(this.guild, emoji, [
      ["EMOJI", String(react_emoji), PARSE_MODE_NONE],
      ["EMOJI_COUNT", String(this.reaction.count), PARSE_MODE_NONE]
    ]);
  }
}

module.exports = {
  Reaction
};