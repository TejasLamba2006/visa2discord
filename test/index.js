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
test.quickExport(channel).catch(console.error);
});
//login to discord with your app's token
client.login('MTEwOTA2NTQ0MjMwNTI1MzM4Ng.G7NwtR.93grAOdSgo_we0HVZ0zml88r5mlohGj5A26wlk');
//when the bot receives a message


