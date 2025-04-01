import { Guild, Client, Message, GuildBasedChannel } from "discord.js";
import Transcript from "./construct/transcript";

/**
 * Exports a transcript of messages from a channel.
 * @param {Channel} channel - The channel to export the transcript from.
 * @param {Array<Message>} [messages=null] - Optional array of specific messages to include in the transcript.
 * @param {Guild} [guild=null] - The guild associated with the channel (if available).
 * @param {Client} [client=null] - The client used for fetching messages (if available).
 * @returns {Promise<Buffer | boolean>} - A Promise that resolves to the exported transcript buffer or false if the transcript is empty.
 */
async function quickExport(
  channel: GuildBasedChannel,
  messages: Message[] | null = null,
  guild: Guild | null = null,
  client: Client | null = null
): Promise<Buffer | boolean> {
  if (guild) {
    channel.guild = guild;
  }

  const transcript = (
    await new Transcript({
      channel: channel,
      limit: null,
      messages: messages,
      timezone: "UTC",
      military_time: true,
      fancy_times: true,
      before: null,
      after: null,
      support_dev: true,
      client: client,
    }).export()
  ).html;
  if (!transcript) {
    return false;
  } else {
    return Buffer.from(transcript, "utf-8");
  }
}

/**
 * Export the chat transcript from a channel.
 *
 * @async
 * @param {Channel} channel - The channel to export the chat from.
 * @param {number|null} [limit=null] - The maximum number of messages to export. Defaults to null (export all messages).
 * @param {string} [tz_info='UTC'] - The timezone information for the transcript. Defaults to 'UTC'.
 * @param {Guild|null} [guild=null] - The guild associated with the channel. Defaults to null.
 * @param {Client|null} [client=null] - The Discord client object. Defaults to null.
 * @param {boolean} [military_time=true] - Whether to use military time format for timestamps. Defaults to true.
 * @param {boolean} [fancy_times=true] - Whether to use fancy formatting for timestamps. Defaults to true.
 * @param {Date|null} [before=null] - Limit the exported messages to those created before this date. Defaults to null.
 * @param {Date|null} [after=null] - Limit the exported messages to those created after this date. Defaults to null.
 * @param {boolean} [support_dev=true] - Whether to include developer support information in the transcript. Defaults to true.
 * @returns {Promise<TranscriptExport>} A Promise that resolves to the exported chat transcript.
 */
async function exportChat(
  channel: GuildBasedChannel,
  limit: number | null = null,
  tz_info: string = "UTC",
  guild: Guild | null = null,
  client: Client | null = null,
  military_time: boolean = true,
  fancy_times: boolean = true,
  before: Date | null = null,
  after: Date | null = null,
  support_dev: boolean = true
) {
  if (guild) {
    channel.guild = guild;
  }

  return await new Transcript({
    channel: channel,
    limit: limit,
    messages: null,
    pytz_timezone: tz_info,
    military_time: military_time,
    fancy_times: fancy_times,
    before: before,
    after: after,
    support_dev: support_dev,
    client: client,
  }).export();
}

/**
 * Export the raw chat transcript from a channel.
 *
 * @async
 * @param {Channel} channel - The channel to export the chat from.
 * @param {Array<Message>} messages - The specific messages to include in the export.
 * @param {string} [tz_info='UTC'] - The timezone information for the transcript. Defaults to 'UTC'.
 * @param {Guild|null} [guild=null] - The guild associated with the channel. Defaults to null.
 * @param {Client|null} [client=null] - The Discord client object. Defaults to null.
 * @param {boolean} [military_time=false] - Whether to use military time format for timestamps. Defaults to false.
 * @param {boolean} [fancy_times=true] - Whether to use fancy formatting for timestamps. Defaults to true.
 * @param {boolean} [support_dev=true] - Whether to include developer support information in the transcript. Defaults to true.
 * @returns {Promise<string>} A Promise that resolves to the raw HTML content of the exported chat transcript.
 */
async function rawExport(
  channel: GuildBasedChannel,
  messages: Message[],
  tz_info: string = "UTC",
  guild: Guild | null = null,
  client: Client | null = null,
  military_time: boolean = false,
  fancy_times: boolean = true,
  support_dev: boolean = true
): Promise<string> {
  if (guild) {
    channel.guild = guild;
  }

  return (
    await new Transcript({
      channel: channel,
      limit: null,
      messages: messages,
      pytz_timezone: tz_info,
      military_time: military_time,
      fancy_times: fancy_times,
      before: null,
      after: null,
      support_dev: support_dev,
      client: client,
    }).export()
  ).html;
}

export { quickExport, exportChat, rawExport, Transcript };
