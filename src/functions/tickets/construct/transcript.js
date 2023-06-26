const html = require('html');
const moment = require('moment-timezone');
const discord = require('discord.js');

const { gatherMessages } = require('./message');
const Component = require('./assets/components.js');
const clearCache = require('../ext/cache');
const passBot = require('../parse/mention');
const DiscordUtils = require('../ext/discord_utils');
const {
  fillOut,
  total,
  channelTopic,
  meta_data_temp,
  fancyTime,
  channelSubject,
  PARSE_MODE_NONE,
} = require('../ext/html_gen.js');

/**
 * Data Access Object for chat transcript export.
 */
class TranscriptDAO {
   /**
   * The HTML content of the chat transcript.
   * @type {string}
   */
  html;

/**
   * Create a new TranscriptDAO instance.
   * @param {Channel} channel - The channel to export the chat from.
   * @param {number|string} limit - The maximum number of messages to include in the export.
   * @param {Array<Message>|null} messages - The specific messages to include in the export. Defaults to null.
   * @param {string} timezone - The timezone information for the transcript.
   * @param {boolean} military_time - Whether to use military time format for timestamps.
   * @param {boolean} fancy_times - Whether to use fancy formatting for timestamps.
   * @param {Date|null} before - The date to limit messages before. Defaults to null.
   * @param {Date|null} after - The date to limit messages after. Defaults to null.
   * @param {boolean} support_dev - Whether to include developer support information in the transcript.
   * @param {Client|null} client - The Discord client object. Defaults to null.
   */
  constructor(
    channel,
    limit,
    messages,
    timezone,
    military_time,
    fancy_times,
    before,
    after,
    support_dev,
    client
  ) {
    this.channel = channel.channel;
    this.messages = messages;
    this.limit = limit ? parseInt(limit) : 100;
    this.timezone = timezone;
    this.military_time = military_time;
    this.fancy_times = fancy_times;
    this.before = before;
    this.after = after;
    this.support_dev = support_dev ;
    if (!this.timezone) {
      this.timezone = 'UTC'
    }
    if (client) {
      passBot(client);
    }
  }
/**
   * Build and export the chat transcript.
   * @async
   * @returns {Promise<string>} A Promise that resolves to the HTML content of the exported chat transcript.
   * @private
   */
  async buildTranscript() {
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

  async exportTranscript(messageHtml, metaData) {
    const guild_icon =
      this.channel.guild.icon &&
      this.channel.guild.icon.length > 2
        ? this.channel.guild.iconURL()
        : DiscordUtils.default_avatar;

    const time_now = new Date().toLocaleString(this.timezone, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    });
    let meta_data_html = '';
    for (const data in metaData) {
      const creation_time = metaData[data][1]?.toLocaleString();
      const joined_time = metaData[data][5]
        ? metaData[data][5]?.toLocaleString()
        : 'Unknown';

      meta_data_html += await fillOut(this.channel.guild, meta_data_temp, [
        ['USER_ID', data, PARSE_MODE_NONE],
        ['USERNAME', metaData[data][0].slice(0, -5), PARSE_MODE_NONE],
        ['DISCRIMINATOR', metaData[data][0].slice(-5), PARSE_MODE_NONE],
        ['BOT', metaData[data][2], PARSE_MODE_NONE],
        ['CREATED_AT', creation_time, PARSE_MODE_NONE],
        ['JOINED_AT', joined_time, PARSE_MODE_NONE],
        ['GUILD_ICON', guild_icon, PARSE_MODE_NONE],
        ['DISCORD_ICON', DiscordUtils.logo, PARSE_MODE_NONE],
        ['MEMBER_ID', data, PARSE_MODE_NONE],
        ['USER_AVATAR', metaData[data][3], PARSE_MODE_NONE],
        ['DISPLAY', metaData[data][6], PARSE_MODE_NONE],
        ['MESSAGE_COUNT', metaData[data][4].toString()],
      ]);
    }

    const channel_creation_time = this.channel.createdAt.toLocaleString(this.timezone, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    });

    const raw_channel_topic =
      this.channel instanceof discord.TextChannel && this.channel.topic
        ? this.channel.topic
        : '';

    let channel_topic_html = '';
    if (raw_channel_topic) {
      channel_topic_html = await fillOut(this.channel.guild, channelTopic, [
        ['CHANNEL_TOPIC', raw_channel_topic],
      ]);
    }

    const limit = this.limit ? `latest ${this.limit} messages` : 'start';

    const subject = await fillOut(this.channel.guild, channelSubject, [
      ['LIMIT', limit, PARSE_MODE_NONE],
      ['CHANNEL_NAME', this.channel.name],
      ['RAW_CHANNEL_TOPIC', raw_channel_topic],
    ]);

    let _fancy_time = '';

    if (this.fancy_times) {
      _fancy_time = await fillOut(this.channel.guild, fancyTime, [
        ['TIMEZONE', this.timezone, PARSE_MODE_NONE],
      ]);
    }
    this.html = await fillOut(this.channel.guild, total, [
      ['SERVER_NAME', escapeHtml(this.channel.guild.name)],
      ['GUILD_ID', this.channel.guild.id, PARSE_MODE_NONE],
      ['SERVER_AVATAR_URL', guild_icon, PARSE_MODE_NONE],
      ['CHANNEL_NAME', this.channel.name],
      ['MESSAGE_COUNT', this.messages.size.toString()],
      ['MESSAGES', messageHtml, PARSE_MODE_NONE],
      ['META_DATA', meta_data_html, PARSE_MODE_NONE],
      ['DATE_TIME', time_now],
      ['SUBJECT', subject, PARSE_MODE_NONE],
      ['CHANNEL_CREATED_AT', channel_creation_time, PARSE_MODE_NONE],
      ['CHANNEL_TOPIC', channel_topic_html, PARSE_MODE_NONE],
      ['CHANNEL_ID', this.channel.id, PARSE_MODE_NONE],
      ['MESSAGE_PARTICIPANTS', Object.keys(metaData).length.toString(), PARSE_MODE_NONE],
      ['FANCY_TIME', _fancy_time, PARSE_MODE_NONE],
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
  async export() {
    if (!this.messages) {
      this.messages = await this.channel.messages.fetch({
        limit: this.limit,
        before: this.before,
        after: this.after,
      });
    }

    if (!this.after) {
      this.messages.reverse();
    }

    try {
      return await super.buildTranscript();
    } catch (error) {
      this.html = 'Whoops! Something went wrong...';
      console.error(error);
      console.log(
        'Please send a screenshot of the above error to https://github.com/The-Rainbow-Studios/visa2discord'
      );
      return this;
    }
  }
}

module.exports = Transcript;

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, function (m) {
    return map[m];
  });
}



