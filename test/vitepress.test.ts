import MarkdownIt from 'markdown-it';
import { describe, expect, it, vi } from 'vitest';
import { withReadingTimeTag } from '../src/vitepress.js';
import type { UserConfig } from 'vitepress';

// VitePress 2 types `markdown.config` against `markdown-it-async`'s MarkdownIt,
// a structural superset of plain markdown-it's. A real `markdown-it` instance
// is fine at runtime, so this helper just bridges the two types.
type Md = InstanceType<typeof MarkdownIt>;

function runMarkdownConfig(config: UserConfig, md: Md): void {
  (config.markdown!.config as unknown as (md: Md) => void)(md);
}

const render = ({ minutes }: { minutes: number }) => `${minutes} minute read`;

describe('withReadingTimeTag', () => {
  it('adds a markdown.config when the input config has none', () => {
    const config = withReadingTimeTag({} as UserConfig, { render });
    const md = new MarkdownIt();
    runMarkdownConfig(config, md);
    expect(md.render('[[readingTime]]\n\ntext')).toContain('1 minute read');
  });

  it('does not replace an existing markdown.config: it still runs, with the same md', () => {
    const userConfig = vi.fn();
    const config = withReadingTimeTag({ markdown: { config: userConfig } } as unknown as UserConfig, { render });
    const md = new MarkdownIt();
    runMarkdownConfig(config, md);

    expect(userConfig).toHaveBeenCalledTimes(1);
    expect(userConfig).toHaveBeenCalledWith(md);
    expect(md.render('[[readingTime]]')).toContain('1 minute read');
  });

  it('installs the plugin before the existing config runs', () => {
    let renderedInsideUserConfig = '';
    const config = withReadingTimeTag(
      {
        markdown: {
          config: (instance: Md) => {
            renderedInsideUserConfig = instance.render('[[readingTime]]');
          },
        },
      } as unknown as UserConfig,
      { render },
    );
    runMarkdownConfig(config, new MarkdownIt());
    expect(renderedInsideUserConfig).toContain('1 minute read');
  });

  it('preserves other markdown options', () => {
    expect(withReadingTimeTag({ markdown: { lineNumbers: true } } as UserConfig).markdown?.lineNumbers).toBe(true);
  });

  it('passes wordsPerMinute through to the plugin', () => {
    const config = withReadingTimeTag({} as UserConfig, { render, wordsPerMinute: 1 });
    const md = new MarkdownIt();
    runMarkdownConfig(config, md);
    expect(md.render('[[readingTime]]\n\na b c')).toContain('3 minute read');
  });

  it('returns the same config object it was given', () => {
    const input = {} as UserConfig;
    expect(withReadingTimeTag(input)).toBe(input);
  });
});
