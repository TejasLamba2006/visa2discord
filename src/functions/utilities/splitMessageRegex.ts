/**
 * Splits a given text into multiple parts based on a regular expression, ensuring each part's length does not exceed the maximum length.
 *
 * @param {string} text - The text to be split.
 * @param {Object} options - Additional options for splitting the message (optional).
 * @param {number} [options.maxLength=2000] - The maximum length allowed for each part.
 * @param {RegExp} [options.regex=/\n/g] - The regular expression used to match delimiters for splitting.
 * @param {string} [options.prepend=""] - The string to prepend to each part.
 * @param {string} [options.append=""] - The string to append to each part.
 * @returns {string[]} - An array of split message parts.
 * @throws {RangeError} - If a single part exceeds the length limit.
 */

interface SplitMessageOptions {
  maxLength?: number;
  regex?: RegExp;
  prepend?: string;
  append?: string;
}

const splitMessageRegex = (
  text: string,
  {
    maxLength = 2000,
    regex = /\n/g,
    prepend = "",
    append = "",
  }: SplitMessageOptions = {}
): string[] => {
  if (text.length <= maxLength) return [text];
  const parts: string[] = [];
  let curPart = prepend;
  let chunkStartIndex = 0;

  let prevDelim = "";

  const addChunk = (chunkEndIndex: number, nextDelim: string) => {
    const nextChunk = text.substring(chunkStartIndex, chunkEndIndex);
    const nextChunkLen = nextChunk.length;

    // If a single part would exceed the length limit by itself, throw an error:
    if (prepend.length + nextChunkLen + append.length > maxLength) {
      throw new RangeError(
        "[visa2discord] A single message part exceeded the length limit. This should never happen. Please report this to the developer on GitHub:"
      );
    }

    // The length of the current part if the next chunk were added to it:
    const lengthWithChunk =
      curPart.length + prevDelim.length + nextChunkLen + append.length;

    // If adding the next chunk to the current part would cause it to exceed
    // the maximum length, push the current part and reset it for next time:
    if (lengthWithChunk > maxLength) {
      parts.push(curPart + append);
      curPart = prepend + nextChunk;
    } else {
      curPart += prevDelim + nextChunk;
    }
    prevDelim = nextDelim;
    chunkStartIndex = chunkEndIndex + prevDelim.length;
  };

  for (const match of text.matchAll(regex)) {
    addChunk(match.index, match[0]);
  }
  addChunk(text.length - 1, "");
  parts.push(curPart + append);
  return parts;
};

export default splitMessageRegex;
