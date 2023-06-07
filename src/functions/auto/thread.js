const Discord = require("discord.js");

/**
 * Sets up an event listener to automatically join public threads created in Discord.
 *
 * @param {Discord.Client} client - The Discord client instance.
 */
module.exports = async (client) => {
  /**
   * Event handler for the "threadCreate" event.
   *
   * @param {Discord.ThreadChannel} thread - The thread channel that was created.
   */
  client.on("threadCreate", async (thread) => {
    if (thread.type === Discord.ChannelType.PublicThread) {
      await thread
        .join()
        .catch((e) =>
          console.log(
            "[visa2discord] Auto Thread Joiner Failed with error: " + e
          )
        );
    }
  });
};
