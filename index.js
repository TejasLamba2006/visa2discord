


const sleep = require('./src/functions/utilities/sleep'),
    passGen = require('./src/functions/utilities/passGen'),
    checkUpdate = require("./src/functions/private/checkUpdates"),
    AutoThreadJoiner = require("./src/functions/auto/thread"),
    discordTimestamp = require("./src/functions/utilities/timeStamp")


checkUpdate()

module.exports = {
    sleep,
    passGen,
    AutoThreadJoiner,
    discordTimestamp
};
