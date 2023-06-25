const Discord = require('discord.js');
const Transcript = require('./construct/transcript.js');

async function quickExport(channel, messages = null, guild = null, bot = null) {
  if (guild) {
    channel.guild = guild;
  }

  const transcript = (await new Transcript({
    channel: channel,
    limit: null,
    messages: messages,
    timezone: 'UTC',
    military_time: true,
    fancy_times: true,
    before: null,
    after: null,
    support_dev: true,
    bot: bot
  }).export()).html;
  if (!transcript) {
    return;
  }
  const transcriptEmbed = new Discord.EmbedBuilder()
    .setDescription(`**Transcript Name:** transcript-${channel.name}\n\n`)
    .setColor('#5865F2');

  const transcriptFile = new Discord.AttachmentBuilder(
    Buffer.from(transcript, 'utf-8'),
    {name: `transcript-${channel.name}.html`}
  );

  return channel.send({ embeds: [transcriptEmbed], files: [transcriptFile] });
}

async function exportChat(
  channel,
  limit = null,
  tz_info = 'UTC',
  guild = null,
  bot = null,
  military_time = true,
  fancy_times = true,
  before = null,
  after = null,
  support_dev = true
) {
  if (guild) {
    channel.guild = guild;
  }

  return (await new Transcript({
    channel: channel,
    limit: limit,
    messages: null,
    pytz_timezone: tz_info,
    military_time: military_time,
    fancy_times: fancy_times,
    before: before,
    after: after,
    support_dev: support_dev,
    bot: bot
  }).export());
}

async function rawExport(
  channel,
  messages,
  tz_info = 'UTC',
  guild = null,
  bot = null,
  military_time = false,
  fancy_times = true,
  support_dev = true
) {
  if (guild) {
    channel.guild = guild;
  }

  return (await new Transcript({
    channel: channel,
    limit: null,
    messages: messages,
    pytz_timezone: tz_info,
    military_time: military_time,
    fancy_times: fancy_times,
    before: null,
    after: null,
    support_dev: support_dev,
    bot: bot
  }).export()).html;
}

async function quickLink(channel, message) {
  const embed = new discord.MessageEmbed()
    .setTitle('Transcript Link')
    .setDescription(`[Click here to view the transcript](${message.attachments[0].url})`)
    .setColor('#5865F2');

  return channel.send({ embeds: [embed] });
}

function generateLink(message) {
  return `https://mahto.id/chat-exporter?url=${message.attachments[0].url}`;
}

module.exports = {
  quickExport,
  exportChat,
  rawExport,
  quickLink,
  generateLink,
  Transcript
};
