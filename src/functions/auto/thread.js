const Discord = require("discord.js");
/**
 * 
 * @param {Object} client | Discord client object
 */
module.exports = async (client) => {
  client.on("threadCreate", async (thread) => {
    if (thread.type === Discord.ChannelType.PublicThread) {
      await thread
        .join()
        .catch((e) =>
          console.log(
            `[visa2discord] Auto Thread Joiner Failed with error: ${e}`
          )
        );
    }
  });
};
