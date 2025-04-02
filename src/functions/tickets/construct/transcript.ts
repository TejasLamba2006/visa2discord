import { Client, Collection, Message, TextChannel } from "discord.js";
import { gatherMessages } from "./message";
import Component from "./assets/components";
import clearCache from "../ext/cache";
import { DiscordUtils } from "../ext/discordUtils";
import {
  fillOut,
  total,
  channelTopic,
  meta_data_temp,
  fancyTime,
  channelSubject,
  PARSE_MODE_NONE,
  PARSE_MODE_MARKDOWN,
} from "../ext/htmlGen";

/**
 * Data Access Object for chat transcript export.
 */
abstract class TranscriptDAO {
  /**
   * The HTML content of the chat transcript.
   * @type {string}
   */
  html!: string;
  channel: TextChannel;
  messages: Collection<string, Message> | null;
  limit: number;
  timezone: string;
  military_time: boolean;
  fancy_times: boolean;
  before?: string;
  after?: string;
  support_dev: boolean;

  /**
   * Create a new TranscriptDAO instance.
   * @param {TextChannel} channel - The channel to export the chat from.
   * @param {number|string} limit - The maximum number of messages to include in the export.
   * @param {Array<Message>|null} messages - The specific messages to include in the export. Defaults to null.
   * @param {string} timezone - The timezone information for the transcript.
   * @param {boolean} military_time - Whether to use military time format for timestamps.
   * @param {boolean} fancy_times - Whether to use fancy formatting for timestamps.
   * @param {Date|null} before - The message ID to limit messages before. Defaults to null.
   * @param {Date|null} after - The message ID to limit messages after. Defaults to null.
   * @param {boolean} support_dev - Whether to include developer support information in the transcript.
   * @param {Client|null} client - The Discord client object. Defaults to null.
   */
  constructor(
    channel: TextChannel,
    limit: number | string,
    messages: Collection<string, Message> | null,
    timezone: string,
    military_time: boolean,
    fancy_times: boolean,
    before: string | undefined,
    after: string | undefined,
    support_dev: boolean,
    client: Client | null
  ) {
    this.channel = channel;
    this.messages = messages;
    this.limit = limit ? parseInt(limit as string) : 100;
    this.timezone = timezone || "UTC";
    this.military_time = military_time;
    this.fancy_times = fancy_times;
    this.before = before;
    this.after = after;
    this.support_dev = support_dev;
  }

  /**
   * Abstract method to be implemented by subclasses for exporting the chat transcript.
   * @returns {Promise<TranscriptDAO>} A Promise that resolves to the exported chat transcript.
   */
  abstract export(): Promise<TranscriptDAO>;

  /**
   * Build and export the chat transcript.
   * @async
   * @returns {Promise<TranscriptDAO>} A Promise that resolves to the HTML content of the exported chat transcript.
   * @private
   */
  async buildTranscript(): Promise<TranscriptDAO> {
    const [messageHtml, metaData] = await gatherMessages(
      this.messages,
      this.channel.guild,
      this.timezone,
      this.military_time
    );
    await this.exportTranscript(messageHtml, metaData);
    clearCache();
    Component.menu_div_id = 0;
    return this;
  }

  async exportTranscript(messageHtml: string, metaData: any): Promise<void> {
    const guild_icon =
      this.channel.guild.icon && this.channel.guild.icon.length > 2
        ? this.channel.guild.iconURL()!
        : DiscordUtils.default_avatar;

    const time_now = new Date().toLocaleString(this.timezone, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    });
    let meta_data_html = "";
    for (const data in metaData) {
      const creation_time = metaData[data][1]?.toLocaleString();
      const joined_time = metaData[data][5]
        ? metaData[data][5]?.toLocaleString()
        : "Unknown";

      meta_data_html += await fillOut(this.channel.guild, meta_data_temp, [
        ["USER_ID", data, PARSE_MODE_NONE],
        ["USERNAME", metaData[data][0].slice(0, -5), PARSE_MODE_NONE],
        ["DISCRIMINATOR", metaData[data][0].slice(-5), PARSE_MODE_NONE],
        ["BOT", metaData[data][2], PARSE_MODE_NONE],
        ["CREATED_AT", creation_time, PARSE_MODE_NONE],
        ["JOINED_AT", joined_time, PARSE_MODE_NONE],
        ["GUILD_ICON", guild_icon, PARSE_MODE_NONE],
        ["DISCORD_ICON", DiscordUtils.logo, PARSE_MODE_NONE],
        ["MEMBER_ID", data, PARSE_MODE_NONE],
        ["USER_AVATAR", metaData[data][3], PARSE_MODE_NONE],
        ["DISPLAY", metaData[data][6], PARSE_MODE_NONE],
        ["MESSAGE_COUNT", metaData[data][4].toString(), PARSE_MODE_MARKDOWN],
      ]);
    }

    const channel_creation_time = this.channel.createdAt?.toLocaleString(
      this.timezone,
      {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
      }
    );

    const raw_channel_topic = this.channel.topic;

    let channel_topic_html = "";
    if (raw_channel_topic) {
      channel_topic_html = await fillOut(this.channel.guild, channelTopic, [
        ["CHANNEL_TOPIC", raw_channel_topic],
      ]);
    }

    const limit = this.limit
      ? `. There are total ${this.limit} messages here.`
      : "";

    const subject = await fillOut(this.channel.guild, channelSubject, [
      ["LIMIT", limit, PARSE_MODE_NONE],
      ["CHANNEL_NAME", this.channel.name, PARSE_MODE_MARKDOWN],
    ]);

    let _fancy_time = "";

    if (this.fancy_times) {
      const time_format = this.military_time ? "HH:mm" : "hh:mm A";
      _fancy_time = await fillOut(this.channel.guild, fancyTime, [
        ["TIMEZONE", this.timezone, PARSE_MODE_NONE],
        ["TIME_FORMAT", time_format, PARSE_MODE_NONE],
      ]);
    }
    this.html = await fillOut(this.channel.guild, total, [
      ["SERVER_NAME", escapeHtml(this.channel.guild.name), PARSE_MODE_MARKDOWN],
      ["GUILD_ID", this.channel.guild.id, PARSE_MODE_NONE],
      ["SERVER_AVATAR_URL", guild_icon, PARSE_MODE_NONE],
      ["CHANNEL_NAME", this.channel.name, PARSE_MODE_MARKDOWN],
      ["MESSAGE_COUNT", this.messages!.size.toString(), PARSE_MODE_MARKDOWN],
      ["MESSAGES", messageHtml, PARSE_MODE_NONE],
      ["META_DATA", meta_data_html, PARSE_MODE_NONE],
      ["DATE_TIME", time_now, PARSE_MODE_MARKDOWN],
      ["SUBJECT", subject, PARSE_MODE_NONE],
      ["CHANNEL_CREATED_AT", channel_creation_time, PARSE_MODE_NONE],
      ["CHANNEL_TOPIC", channel_topic_html, PARSE_MODE_NONE],
      ["CHANNEL_ID", this.channel.id, PARSE_MODE_NONE],
      [
        "MESSAGE_PARTICIPANTS",
        Object.keys(metaData).length.toString(),
        PARSE_MODE_NONE,
      ],
      ["FANCY_TIME", _fancy_time, PARSE_MODE_NONE],
    ]);
  }
}

/**
 * Represents a chat transcript export.
 * @extends TranscriptDAO
 */
class Transcript extends TranscriptDAO {
  /**
   * Export the chat transcript.
   * @async
   * @returns {Promise<Transcript>} A Promise that resolves to the exported chat transcript.
   */
  async export(): Promise<Transcript> {
    if (!this.messages && this.limit && !(this.before || this.after)) {
      this.messages = await this.channel.messages.fetch({
        limit: this.limit,
        before: this.before,
        after: this.after,
      });
    }

    if (!this.after) {
      this.messages?.reverse();
    }

    try {
      return await super.buildTranscript();
    } catch (error) {
      this.html = "Whoops! Something went wrong...";
      console.error(error);
      console.log(
        "Please send a screenshot of the above error to https://github.com/TejasLamba2006/visa2discord"
      );
      return this;
    }
  }
}

export default Transcript;

function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, function (m) {
    return map[m];
  });
}
