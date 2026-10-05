import type { MarkdownIt, StateCore } from 'markdown-it';
import { assertValidWordsPerMinute } from './readingTime.js';
import { transformReadingTimeTags } from './transformReadingTimeTags.js';
import type { ReadingTimeTagOptions } from './types.js';

/**
 * A markdown-it plugin that replaces `[[readingTime]]` with a tip block
 * stating the page's estimated reading time.
 *
 * ```ts
 * import MarkdownIt from 'markdown-it';
 * import { readingTimeTag } from '@binarynoir/vitepress-reading-time-tag';
 *
 * const md = new MarkdownIt().use(readingTimeTag, { wordsPerMinute: 250 });
 * ```
 *
 * Runs before markdown-it's `normalize` rule, on the raw source, so the
 * generated `::: tip` container is parsed as ordinary Markdown. The default
 * output needs the container syntax VitePress provides; with plain markdown-it,
 * pass your own `render`.
 */
export function readingTimeTag(md: MarkdownIt, options: ReadingTimeTagOptions = {}): void {
  if (options.wordsPerMinute !== undefined) assertValidWordsPerMinute(options.wordsPerMinute);

  md.core.ruler.before('normalize', 'reading_time_tag', (state: StateCore) => {
    state.src = transformReadingTimeTags(state.src, options);
  });
}
