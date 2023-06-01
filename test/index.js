const { generateActivity } = require('../index')
let client = {
    token: null
}
client.token = "MTEwNzM0NDIyNDgzMzI0MTIwMA.GCYEgV.bv8Cn4L9iygHzrBoqL01X3Umu2eEJFY2WCyvJY"
let channel = {
    id: "1107261921184469063"
}
generateActivity(client, channel, { custom: "814288819477020702" })