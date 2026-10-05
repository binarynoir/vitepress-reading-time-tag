/** A fenced code block, closed or (as CommonMark allows) running to the end of the document. */
export const FENCED_CODE =
  /^[ \t]*(?<fence>`{3,}(?![^\n]*`)|~{3,})[^\n]*(?:\n[\s\S]*?^[ \t]*\k<fence>[`~]*[ \t]*\r?$|[\s\S]*$)/m;

/** An inline code span, including double-backtick spans that contain a single backtick. */
export const INLINE_CODE = /(?<!`)(?<tick>`+)(?!`)[^\n]*?[^`\n]\k<tick>(?!`)/;
