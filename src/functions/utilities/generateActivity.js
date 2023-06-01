const fetch = require("node-fetch").default;
const defaultActivity = {
  betrayalio: "773336526917861400",
  chess: "832012586023256104",
  checkers: "832013003968348200",
  doodlecrew: "878067389634314250",
  lettertile: "879863686565621790",
  spellcast: "852509694341283871",
  wordsnacks: "879863976006127627",
  watchtogether: "880218394199220334",
  ocho: "832025144389533716",
  sketchheads: "902271654783242291",
  youtube: "755600276941176913",
  fishing: "814288819477020702",
  poker: "755827207812677713",
  betrayal: "773336526917861400",
  chessdev: "832012774040141894",
  fishingdev: "814288473319471104",
  pokerdev: "755827207812677713",
  letterleague: "879863686565621790",
  watch: "880218832743055411",
};

/** 
 * @param {object} client - Discord Client
  * @param {object} channel - Discord Channel Object
  * @param {object} options - Options
  * @param {string} options.custom - Custom Activity ID
  * @param {string} options.name - Activity Name
  * @returns {Promise<object>} - Discord Invite Object
  * 
  * @example
  * const { generateActivity } = require('visa2discord')
  * generateActivity(client, channel, { custom: "814288819477020702" }).then(invite => console.log(invite))
  * generateActivity(client, channel, { name: "fishing" }).then(invite => console.log(invite))
  */
module.exports = function (client, channel, { custom: id, name: name }) {
  if (!client.token)
    throw new Error(
      "[visa2discord] Discord Client is not ready or passed object isn't a Discord Client"
    );
  if (!channel || !channel.id)
    throw new Error("[visa2discord] You must provide a Discord channel object");
  if (!id && !name)
    throw new Error(
      "[visa2discord] You must provide an activity name or custom ID. Activity name includes \n" +
        Object.keys(defaultActivity).join("\n")
    );
  if (!id) {
    id = defaultActivity[name];
    if (!id)
      throw new Error(
        "[visa2discord] Invalid activity name. Activity name should be one of the following \n" +
          Object.keys(defaultActivity).join("\n")
      );
  }
  if (id.length !== 18)
    throw new Error("[visa2discord] custom ID is invalid. Length should be 18");
  fetch(`https://discord.com/api/v10/channels/${channel.id}/invites`, {
    method: "POST",
    body: JSON.stringify({
      max_age: 86400,
      max_uses: 0,
      target_application_id: id,
      target_type: 2,
      temporary: false,
      validate: null,
    }),
    headers: {
      Authorization: `Bot ${client.token}`,
      "Content-Type": "application/json",
    },
  })
    .then((res) => res.json())
    .then((invite) => {
      if(invite.code === 10003) throw new Error("[visa2discord] Error recieved from Discord API: " + invite.message + "\n It can be because of the following coditions: \n 1. The bot is not in the server \n 2. The bot doesn't have access to the channel \n 3. The bot doesn't have permissions to create invites \n 4. The bot is not verified \n 5. The bot is not a bot account \n 6. The bot is not a member of the server")
      if(invite.code === 0 && invite.message === "401: Unauthorized") throw new Error("[visa2discord] Error recieved from Discord API: " + invite.message + "\n It can be because of the following coditions: \n 1. The bot token is invalid \n 2. The bot is not a bot account.")
      if(invite.code === 50035) throw new Error("[visa2discord] Error recieved from Discord API: " + invite.message + "\n It can be because of the following coditions: \n 1. The activity ID is invalid \n 2. The activity ID is not a valid activity ID")
      return invite;
    })
    .catch((e) => {
      console.log(e);
    });
};
