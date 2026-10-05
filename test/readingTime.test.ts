import { describe, expect, it } from 'vitest';
import { assertValidWordsPerMinute, calculateReadingTime, countWords } from '../src/readingTime.js';

const words = (count: number) => Array.from({ length: count }, () => 'word').join(' ');

describe('countWords', () => {
  it('counts plain words', () => {
    expect(countWords('one two  three\nfour')).toBe(4);
  });

  it('returns 0 for empty or whitespace-only text', () => {
    expect(countWords('')).toBe(0);
    expect(countWords(' \n\t ')).toBe(0);
  });

  it('counts hyphenated words and contractions as one word', () => {
    expect(countWords("well-known don't it’s")).toBe(3);
  });

  it('counts numbers and accented words', () => {
    expect(countWords('version 2 café naïve')).toBe(4);
  });

  it('counts each CJK character as a word', () => {
    expect(countWords('你好世界')).toBe(4);
    expect(countWords('hello 你好')).toBe(3);
  });

  it('ignores fenced code, including unclosed fences', () => {
    expect(countWords('a b\n\n```js\nconst x = 1;\n```\n\nc')).toBe(3);
    expect(countWords('a b\n\n```\nunclosed code here')).toBe(2);
  });

  it('ignores frontmatter', () => {
    expect(countWords('---\ntitle: Some Long Title Here\n---\n\nbody text')).toBe(2);
  });

  it('ignores HTML tags and comments but keeps their text', () => {
    expect(countWords('<div class="x">hello</div> <!-- hidden words -->')).toBe(1);
  });

  it('ignores link targets and bare URLs but keeps link text', () => {
    expect(countWords('[the docs](https://example.com/very/long/path) and https://example.com/x')).toBe(3);
  });

  it('does not count the [[readingTime]] tag', () => {
    expect(countWords('[[readingTime]] one two [[ READINGTIME ]]')).toBe(2);
  });

  it('counts inline code as words', () => {
    expect(countWords('call `foo` now')).toBe(3);
  });
});

describe('calculateReadingTime', () => {
  it('rounds minutes up', () => {
    expect(calculateReadingTime(words(301))).toEqual({ words: 301, minutes: 2 });
    expect(calculateReadingTime(words(300))).toEqual({ words: 300, minutes: 1 });
  });

  it('reports at least one minute, even for an empty page', () => {
    expect(calculateReadingTime('')).toEqual({ words: 0, minutes: 1 });
    expect(calculateReadingTime('hi')).toEqual({ words: 1, minutes: 1 });
  });

  it('uses the given reading speed', () => {
    expect(calculateReadingTime(words(500), 100).minutes).toBe(5);
  });

  it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY])('rejects wordsPerMinute of %s', (value) => {
    expect(() => calculateReadingTime('x', value)).toThrow(RangeError);
  });
});

describe('assertValidWordsPerMinute', () => {
  it('accepts positive finite numbers, including fractions', () => {
    expect(() => assertValidWordsPerMinute(0.5)).not.toThrow();
    expect(() => assertValidWordsPerMinute(250)).not.toThrow();
  });
});
