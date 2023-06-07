


const sleep = require('./src/functions/utilities/sleep'),
    passGen = require('./src/functions/utilities/passGen'),
    checkUpdate = require("./src/functions/private/checkUpdates"),
    AutoThreadJoiner = require("./src/functions/auto/thread"),
    discordTimestamp = require("./src/functions/utilities/timeStamp"),
    splitMessageRegex = require("./src/functions/utilities/splitMessageRegex"),
    cleanCode = require("./src/functions/utilities/cleanCode"),
    generateActivity = require("./src/functions/utilities/generateActivity"),
    disableButtons = require("./src/functions/utilities/disableButtons");


checkUpdate()

module.exports = {
    sleep,
    passGen,
    AutoThreadJoiner,
    discordTimestamp,
    splitMessageRegex,
    cleanCode,
    generateActivity,
    disableButtons
};
