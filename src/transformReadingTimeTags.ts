import { FENCED_CODE, INLINE_CODE } from './code.js';
import { DEFAULT_WORDS_PER_MINUTE } from './constants.js';
import { assertValidWordsPerMinute, calculateReadingTime } from './readingTime.js';
import { renderReadingTimeTip } from './render.js';
import type { ReadingTimeTagOptions } from './types.js';

/** `[[readingTime]]`, in any case, with optional spaces inside the brackets. */
const READING_TIME_TAG = /\[\[\s*readingtime\s*\]\]/i;

/**
 * Code is matched alongside the tag so one left-to-right pass can skip it:
 * whatever matches first at a position wins, and code is returned unchanged.
 */
const CODE_OR_TAG = new RegExp(`${FENCED_CODE.source}|${INLINE_CODE.source}|(?<tag>${READING_TIME_TAG.source})`, 'gim');

/**
 * Replaces each `[[readingTime]]` tag in Markdown source with the page's
 * reading time. Tags inside fenced code blocks and inline code are left as
 * written. The time is worked out once per call, from the whole source.
 */
export function transformReadingTimeTags(source: string, options: ReadingTimeTagOptions = {}): string {
  const { wordsPerMinute = DEFAULT_WORDS_PER_MINUTE, render = renderReadingTimeTip } = options;
  assertValidWordsPerMinute(wordsPerMinute);

  let rendered: string | undefined;
  return source.replace(CODE_OR_TAG, (match, ...args) => {
    const groups = args.at(-1) as { tag?: string };
    if (groups.tag === undefined) return match;
    rendered ??= render(calculateReadingTime(source, wordsPerMinute));
    return rendered;
  });
}
