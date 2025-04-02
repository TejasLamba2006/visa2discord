import { Guild, MessageReaction } from "discord.js";
import { convertEmoji } from "../../ext/emojiConvert.js";
import {
  fillOut,
  emoji,
  custom_emoji,
  PARSE_MODE_NONE,
} from "../../ext/htmlGen.js";

export default class Reaction {
  rawReaction: MessageReaction;
  reaction: string;
  guild: Guild;

  constructor(reaction: MessageReaction, guild: Guild) {
    this.rawReaction = reaction;
    this.guild = guild;
    this.reaction = "";
  }

  async flow(): Promise<MessageReaction | string> {
    await this.build_reaction();
    return this.reaction;
  }

  async build_reaction(): Promise<void> {
    if (this.rawReaction.emoji.id) {
      if (this.rawReaction.emoji.animated) {
        await this.create_discord_reaction("gif");
      } else {
        await this.create_discord_reaction("png");
      }
    } else {
      await this.create_standard_emoji();
    }
  }

  async create_discord_reaction(emoji_type: string): Promise<void> {
    this.reaction = await fillOut(this.guild, custom_emoji, [
      ["EMOJI", String(this.rawReaction.emoji.id), PARSE_MODE_NONE],
      ["EMOJI_COUNT", String(this.rawReaction.count), PARSE_MODE_NONE],
      ["EMOJI_FILE", emoji_type, PARSE_MODE_NONE],
    ]);
  }

  async create_standard_emoji(): Promise<void> {
    if (!this.rawReaction.emoji.name) return;
    const react_emoji = await convertEmoji(this.rawReaction.emoji.name);
    this.reaction = await fillOut(this.guild, emoji, [
      ["EMOJI", String(react_emoji), PARSE_MODE_NONE],
      ["EMOJI_COUNT", String(this.rawReaction.count), PARSE_MODE_NONE],
    ]);
  }
}
