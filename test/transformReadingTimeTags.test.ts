import { describe, expect, it, vi } from 'vitest';
import { transformReadingTimeTags } from '../src/transformReadingTimeTags.js';

const words = (count: number) => Array.from({ length: count }, () => 'word').join(' ');
const tip = (minutes: string, wordCount: string) =>
  `::: tip Reading Time\nReading time for this document is ${minutes} for ${wordCount}.\n:::`;

describe('transformReadingTimeTags', () => {
  describe('tag transformation', () => {
    it('replaces the tag with a tip container', () => {
      expect(transformReadingTimeTags('[[readingTime]]\n\none two three')).toBe(
        `${tip('1 minute', '3 words')}\n\none two three`,
      );
    });

    it('reports minutes and words for a longer page', () => {
      const output = transformReadingTimeTags(`[[readingTime]]\n\n${words(650)}`);
      expect(output).toContain('3 minutes for 650 words.');
    });

    it('is case-insensitive', () => {
      for (const variant of ['[[readingtime]]', '[[READINGTIME]]', '[[ReadingTime]]']) {
        expect(transformReadingTimeTags(`${variant}\n\na b`)).toContain('::: tip Reading Time');
      }
    });

    it('allows spaces inside the brackets', () => {
      expect(transformReadingTimeTags('[[ readingTime ]]\n\na')).toContain('::: tip Reading Time');
    });

    it('replaces every tag, with the same figures', () => {
      const output = transformReadingTimeTags('[[readingTime]]\n\ntext here\n\n[[readingTime]]');
      expect(output.match(/for 2 words\./g)).toHaveLength(2);
    });

    it('does not count the tags themselves as words', () => {
      expect(transformReadingTimeTags('[[readingTime]]\n[[readingTime]]\n\none')).toContain('for 1 word.');
    });

    it('leaves near-misses as written', () => {
      for (const source of ['[readingTime]', '[[reading time]]', '[[readingTimes]]', '[[readingTime]', 'readingTime']) {
        expect(transformReadingTimeTags(source)).toBe(source);
      }
    });

    it('leaves a document without the tag exactly as it was', () => {
      const source = '# Title\n\nSome text.\n';
      expect(transformReadingTimeTags(source)).toBe(source);
    });

    it('handles an empty document', () => {
      expect(transformReadingTimeTags('')).toBe('');
    });
  });

  describe('options', () => {
    it('uses wordsPerMinute', () => {
      expect(transformReadingTimeTags(`[[readingTime]]\n\n${words(500)}`, { wordsPerMinute: 100 })).toContain(
        '5 minutes for 500 words.',
      );
    });

    it('uses a custom render function with the calculated values', () => {
      const render = vi.fn(({ minutes, words }) => `**${minutes} min / ${words} w**`);
      expect(transformReadingTimeTags('[[readingTime]]\n\none two', { render })).toBe('**1 min / 2 w**\n\none two');
      expect(render).toHaveBeenCalledWith({ minutes: 1, words: 2 });
    });

    it('works out the reading time once, however many tags there are', () => {
      const render = vi.fn(() => 'x');
      transformReadingTimeTags('[[readingTime]] [[readingTime]] [[readingTime]]', { render });
      expect(render).toHaveBeenCalledTimes(1);
    });

    it('does not call render when the page has no tag', () => {
      const render = vi.fn(() => 'x');
      transformReadingTimeTags('nothing here', { render });
      expect(render).not.toHaveBeenCalled();
    });

    it('rejects an invalid wordsPerMinute', () => {
      expect(() => transformReadingTimeTags('x', { wordsPerMinute: 0 })).toThrow(RangeError);
    });
  });

  describe('code preservation', () => {
    it.each([
      ['a fenced block', '```\n[[readingTime]]\n```'],
      ['a fenced block with a language', '```markdown\n[[readingTime]]\n```'],
      ['a ~~~ block', '~~~\n[[readingTime]]\n~~~'],
      ['an indented fence', '  ```\n  [[readingTime]]\n  ```'],
      ['inline code', 'Write `[[readingTime]]` to add it.'],
      ['double-backtick inline code', 'Use ``a ` [[readingTime]]`` here.'],
      ['a longer fence around a shorter one', '````md\n```\n[[readingTime]]\n```\n````'],
      ['an unclosed fence', '```\n[[readingTime]]\nstill code'],
    ])('leaves the tag inside %s untouched', (_name, source) => {
      expect(transformReadingTimeTags(source)).toBe(source);
    });

    it('transforms tags outside code while leaving tags in code', () => {
      const output = transformReadingTimeTags(
        '[[readingTime]]\n\n```\n[[readingTime]]\n```\n\n`[[readingTime]]` words',
      );
      expect(output).toContain('::: tip Reading Time');
      expect(output.match(/\[\[readingTime\]\]/g)).toHaveLength(2);
    });

    it('does not count code in the reading time', () => {
      const output = transformReadingTimeTags(`[[readingTime]]\n\ntwo words\n\n\`\`\`\n${words(1000)}\n\`\`\``);
      expect(output).toContain('for 2 words.');
    });

    it('handles CRLF line endings', () => {
      const output = transformReadingTimeTags('```\r\n[[readingTime]]\r\n```\r\n[[readingTime]]');
      expect(output).toContain('```\r\n[[readingTime]]\r\n```');
      expect(output).toContain('::: tip Reading Time');
    });

    it('is not confused by source containing NUL characters', () => {
      expect(transformReadingTimeTags('\u00000\u0000 [[readingTime]]')).toContain('::: tip Reading Time');
    });
  });

  it('handles a large document quickly', () => {
    const source = `[[readingTime]]\n\n${'Some prose here.\n\n```\ncode\n```\n\n'.repeat(3000)}`;
    const start = performance.now();
    transformReadingTimeTags(source);
    expect(performance.now() - start).toBeLessThan(2000);
  });
});
