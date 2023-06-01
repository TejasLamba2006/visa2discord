/**
 * 
  * @param {Date} timestamp wihout divding by 1000 | Timestamp to convert
 * @param {String} type | Type of timestamp 
 * @returns 
 */
module.exports = (timestamp, type) => {
  if (!timestamp)
    throw new TypeError("[visa2discord] Timestamp isn't specified");
  if (typeof timestamp !== "number")
    throw new TypeError("[visa2discord] Timestamp isn't a number.");
  if (type) {
    if (typeof type !== "string")
      throw new TypeError("[visa2discord] Type isn't a string.");
    return `<t:${Math.floor(timestamp / 1000)}${type ? `:${type}` : ""}>`;
  }
};
