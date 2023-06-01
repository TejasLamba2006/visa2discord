/**
 * 
 * @param {String} text | Text to clean
 * @returns {String} | Cleaned text
 */
module.exports = (text) => {
  if (typeof text === "string")
    return text
      .replace(/`/g, "`" + String.fromCharCode(8203))
      .replace(/@/g, "@" + String.fromCharCode(8203));
  else return text;
};
