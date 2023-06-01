/**
 * 
 * @param {Number} time | Time to sleep
 * @returns {Promise<object>}
 */
module.exports = async (time) => {
  if (!time) throw new TypeError("[visa2discord] Time isn't specified");
  return new Promise((resolve) => setTimeout(resolve, time));
};
