/**
 * 
* @param {String} text The text to split
* @param {Object} [options] The options to provide
* @param {Number} [options.maxLength=2000] The maximum length of each message
* @param {RegExp} [options.regex=/\n/g] The regex used to split the text
* @param {String} [options.prepend=""] Text to prepend to each message
* @param {String} [options.append=""] Text to append to each message
* @returns {String[]} The array of messages
 */

module.exports = function splitMessageRegex(
  text,
  { maxLength = 2_000, regex = /\n/g, prepend = "", append = "" } = {}
) {
  if (text.length <= maxLength) return [text];
  const parts = [];
  let curPart = prepend;
  let chunkStartIndex = 0;

  let prevDelim = "";

  function addChunk(chunkEndIndex, nextDelim) {
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
  }

  for (const match of text.matchAll(regex)) {
    addChunk(match.index, match[0]);
  }
  addChunk(text.length - 1, "");
  parts.push(curPart + append);
  return parts;
};
