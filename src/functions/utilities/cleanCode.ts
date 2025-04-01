/**
 * Sanitizes the input text by escaping backticks and at signs.
 *
 * @param {string} text - The text to be sanitized.
 * @returns {string} - The sanitized text.
 */
const cleanCode = (text: string): string => {
  if (typeof text === "string") {
    return text
      .replace(/`/g, "`" + String.fromCharCode(8203))
      .replace(/@/g, "@" + String.fromCharCode(8203));
  } else {
    return text;
  }
};

export default cleanCode;
