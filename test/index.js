const { discordTimestamp } = require('../index')
const time = Date.now(); // Current time
const type = 'f'; // type of timestamp

const timestamp = discordTimestamp(time, type);
console.log('Discord timestamp:', timestamp);