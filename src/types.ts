export interface ReadingTime {
  /** Words counted in the page. Each CJK character counts as one word. */
  words: number;
  /** Estimated minutes to read, rounded up, never less than 1. */
  minutes: number;
}

export interface ReadingTimeTagOptions {
  /** Reading speed used to turn a word count into minutes. Default: 300. */
  wordsPerMinute?: number;
  /**
   * Builds the Markdown that replaces each `[[readingTime]]` tag. Default: a
   * `::: tip Reading Time` container saying "Reading time for this document is
   * 3 minutes for 812 words." The result is parsed as Markdown, so a
   * container must start at the beginning of a line.
   */
  render?: (readingTime: ReadingTime) => string;
}
