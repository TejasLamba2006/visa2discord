//make a simple discord.js client
const Discord = require('discord.js');
const client = new Discord.Client({
    intents: [
        Discord.GatewayIntentBits.Guilds,
        Discord.GatewayIntentBits.GuildMembers,
        Discord.GatewayIntentBits.GuildModeration,
        Discord.GatewayIntentBits.GuildEmojisAndStickers,
        Discord.GatewayIntentBits.GuildWebhooks,
        Discord.GatewayIntentBits.GuildInvites,
        Discord.GatewayIntentBits.GuildVoiceStates,
        Discord.GatewayIntentBits.GuildMessages,
        Discord.GatewayIntentBits.DirectMessages,
        Discord.GatewayIntentBits.MessageContent,
        Discord.GatewayIntentBits.AutoModerationConfiguration,
        Discord.GatewayIntentBits.AutoModerationExecution,
      ]
});
client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);
    const test = require('../src/functions/tickets/main.js');
    const channel = await client.channels.fetch('1114518171467141161');
    const allMessages  = new Discord.Collection();
  let messages = await channel.messages.fetch({ limit: 100, cache: false,
    force: true, });

  allMessages.concat(messages);
  //concat doesnt do anytthing do something else
 // console.log(allMessages)
  while (messages.size === 100) {
    const lastMessageId = messages.lastKey();
    messages = await channel.messages.fetch({ limit: 100, before: lastMessageId, cache: false,
        force: true, });
    allMessages.concat(messages);
  }

test.quickExport(channel, messages).catch(console.error);
});
//login to discord with your app's token
client.login('');
//when the bot receives a message


