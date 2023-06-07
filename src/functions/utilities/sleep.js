/**
 * Asynchronously waits for the specified amount of time.
 *
 * @param {number} time - The time to wait in milliseconds.
 * @returns {Promise<void>} - A promise that resolves after the specified time.
 * @throws {TypeError} - If the time is not specified.
 */
module.exports = async (time) => {
  if (!time) throw new TypeError("[visa2discord] Time isn't specified");
  return new Promise((resolve) => setTimeout(resolve, time));
};
