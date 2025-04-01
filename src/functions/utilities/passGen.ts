/**
 * Generates a random string of the specified length.
 *
 * @param {number} Length - The length of the random string to generate.
 * @returns {string} - The generated random string.
 * @throws {TypeError} - If the length is not specified.
 */
const passGen = (Length: number): string => {
  if (!Length) throw new TypeError("Length isn't specified");
  const res = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let value = "";
  for (let i = 0, n = res.length; i < Length; ++i) {
    value += res.charAt(Math.floor(Math.random() * n));
  }
  return value;
};

export default passGen;
