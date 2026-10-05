import MarkdownIt from 'markdown-it';
import { describe, expect, it } from 'vitest';
import { readingTimeTag } from '../src/plugin.js';

const plainRender = ({ minutes, words }: { minutes: number; words: number }) => `${minutes} min, ${words} words`;

describe('readingTimeTag', () => {
  it('registers a core rule before normalize', () => {
    const md = new MarkdownIt().use(readingTimeTag);
    const rules = (md.core.ruler as unknown as { __rules__: { name: string }[] }).__rules__.map((rule) => rule.name);
    expect(rules.indexOf('reading_time_tag')).toBe(rules.indexOf('normalize') - 1);
  });

  it('renders the replacement as Markdown', () => {
    const html = new MarkdownIt()
      .use(readingTimeTag, { render: plainRender })
      .render('[[readingTime]]\n\none two three');
    expect(html).toBe('<p>1 min, 3 words</p>\n<p>one two three</p>\n');
  });

  it('keeps tags in code as literal text', () => {
    const html = new MarkdownIt().use(readingTimeTag, { render: plainRender }).render('Use `[[readingTime]]`.');
    expect(html).toBe('<p>Use <code>[[readingTime]]</code>.</p>\n');
  });

  it('applies wordsPerMinute', () => {
    const html = new MarkdownIt()
      .use(readingTimeTag, { render: plainRender, wordsPerMinute: 1 })
      .render('[[readingTime]]\n\none two three');
    expect(html).toContain('3 min, 3 words');
  });

  it('fails fast at registration for an invalid wordsPerMinute', () => {
    expect(() => new MarkdownIt().use(readingTimeTag, { wordsPerMinute: -5 })).toThrow(RangeError);
  });

  it('leaves unrelated Markdown untouched', () => {
    const source = '# Hi\n\nPlain text.\n';
    expect(new MarkdownIt().use(readingTimeTag).render(source)).toBe(new MarkdownIt().render(source));
  });
});
