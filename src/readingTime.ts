import { FENCED_CODE } from './code.js';
import { DEFAULT_WORDS_PER_MINUTE } from './constants.js';
import type { ReadingTime } from './types.js';

const FENCED_CODE_GLOBAL = new RegExp(FENCED_CODE.source, 'gm');
const FRONTMATTER = /^---\r?\n[\s\S]*?\r?\n---[ \t]*(?:\r?\n|$)/;
const READING_TIME_TAG = /\[\[\s*readingtime\s*\]\]/gi;
const CJK_CHARACTER = /[぀-ヿ㐀-䶿一-鿿豈-﫿가-힯]/gu;
const WORD = /[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu;

/** Throws unless `wordsPerMinute` is a positive, finite number. */
export function assertValidWordsPerMinute(wordsPerMinute: number): void {
  if (!Number.isFinite(wordsPerMinute) || wordsPerMinute <= 0) {
    throw new RangeError(`wordsPerMinute must be a positive number, got ${wordsPerMinute}`);
  }
}

/**
 * Counts the words a reader would read in Markdown source. Frontmatter, fenced
 * code, HTML tags and comments, link targets, bare URLs and the
 * `[[readingTime]]` tag itself are left out.
 */
export function countWords(source: string): number {
  const text = source
    .replace(FRONTMATTER, ' ')
    .replace(FENCED_CODE_GLOBAL, ' ')
    .replace(READING_TIME_TAG, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\]\([^)\n]*\)/g, ' ')
    .replace(/https?:\/\/\S+/g, ' ');

  const cjkCharacters = text.match(CJK_CHARACTER)?.length ?? 0;
  const otherWords = text.replace(CJK_CHARACTER, ' ').match(WORD)?.length ?? 0;
  return cjkCharacters + otherWords;
}

/** Estimates the reading time of Markdown source. */
export function calculateReadingTime(source: string, wordsPerMinute = DEFAULT_WORDS_PER_MINUTE): ReadingTime {
  assertValidWordsPerMinute(wordsPerMinute);
  const words = countWords(source);
  return { words, minutes: Math.max(1, Math.ceil(words / wordsPerMinute)) };
}
