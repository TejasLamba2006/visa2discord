/**
 * Generates a random string of the specified length.
 *
 * @param {number} Length - The length of the random string to generate.
 * @returns {string} - The generated random string.
 * @throws {TypeError} - If the length is not specified.
 */
module.exports = (Length) => {
  if (!Length) throw new TypeError("Length isn't specified");
  var length = Length,
    res = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
    value = "";
  for (var i = 0, n = res.length; i < length; ++i) {
    value += res.charAt(Math.floor(Math.random() * n));
  }
  return value;
};
