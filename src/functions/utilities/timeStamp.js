/**
 * Formats a timestamp into a Discord timestamp string.
 *
 * @param {number} timestamp - The timestamp to format.
 * @param {string} [type] - The type of timestamp (optional).
 * @returns {string|undefined} - The formatted Discord timestamp string, or undefined if the type is not provided.
 * @throws {TypeError} - If the timestamp is not specified or is not a number, or if the type is not a string.
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
