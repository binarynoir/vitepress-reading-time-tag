import type { UserConfig } from 'vitepress';
import type { MarkdownIt } from 'markdown-it';
import { readingTimeTag } from './plugin.js';
import type { ReadingTimeTagOptions } from './types.js';

/**
 * Wraps a VitePress config with `[[readingTime]]` support, the same way
 * `withGlossary` from `markdown-it-glossary` does for tooltips.
 *
 * ```ts
 * // .vitepress/config.mts
 * import { defineConfig } from 'vitepress';
 * import { withReadingTimeTag } from '@binarynoir/vitepress-reading-time-tag/vitepress';
 *
 * export default withReadingTimeTag(defineConfig({ /* ...your config... *\/ }));
 * ```
 *
 * An existing `markdown.config` is not replaced: this wrapper installs the
 * plugin first, then calls yours with the same arguments, so it composes with
 * other `withX()` wrappers in any order.
 */
export function withReadingTimeTag(config: UserConfig, options: ReadingTimeTagOptions = {}): UserConfig {
  config.markdown ??= {};
  const existingMarkdownConfig = config.markdown.config ?? (() => {});

  config.markdown.config = (md) => {
    // VitePress 2 types this callback against `markdown-it-async`'s MarkdownIt,
    // a structural superset of plain markdown-it's; the cast bridges the two.
    readingTimeTag(md as unknown as MarkdownIt, options);
    existingMarkdownConfig(md);
  };

  return config;
}
