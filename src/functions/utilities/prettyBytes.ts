/**
 * Formats a number of bytes into a human-readable string representation.
 *
 * @param {number} bytes - The number of bytes to format.
 * @param {Object} [options={}] - Formatting options.
 * @param {boolean} [options.bits=false] - If true, format the bytes as bits.
 * @param {boolean} [options.signed=false] - If true, include a plus sign for positive values when using the signed format.
 * @param {string} [options.locale='en'] - The locale to use for formatting. Can be 'en' (English) or 'de' (German).
 * @returns {string} The formatted byte size string.
 */

interface PrettyBytesOptions {
  bits?: boolean;
  signed?: boolean;
  locale?: "en" | "de";
}

const prettyBytes = (
  bytes: number,
  options: PrettyBytesOptions = {}
): string => {
  const { bits = false, signed = false, locale = "en" } = options;

  const units = bits
    ? ["b", "Kb", "Mb", "Gb", "Tb", "Pb", "Eb", "Zb", "Yb"]
    : ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const kilo = bits ? 1024 : 1000;
  const isNegative = signed && bytes < 0;
  const num = isNegative ? -bytes : bytes;

  if (num < 1) {
    return (isNegative ? "-" : "") + num + " " + units[0];
  }

  const exponent = Math.min(
    Math.floor(Math.log10(num) / Math.log10(kilo)),
    units.length - 1
  );
  const value = (num / Math.pow(kilo, exponent)).toFixed(2);

  const formattedValue = locale === "en" ? value : value.replace(".", ",");

  return (isNegative ? "-" : "") + formattedValue + " " + units[exponent];
};

export default prettyBytes;
