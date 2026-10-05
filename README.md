# vitepress-reading-time-tag

[![npm version](https://img.shields.io/npm/v/@binarynoir/vitepress-reading-time-tag.svg)](https://www.npmjs.com/package/@binarynoir/vitepress-reading-time-tag)
[![CI](https://github.com/binarynoir/vitepress-reading-time-tag/actions/workflows/ci.yml/badge.svg)](https://github.com/binarynoir/vitepress-reading-time-tag/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/@binarynoir/vitepress-reading-time-tag.svg)](LICENSE)

A [VitePress 2](https://vitepress.dev) plugin that turns `[[readingTime]]` into
a tip block showing how long the page takes to read. The figure is calculated
at build time from the page's own Markdown, so there is no component to
register, no stylesheet, and nothing extra shipped to the browser.

## What this does

```md
# Deploying the API

[[readingTime]]

Start by ...
```

renders as VitePress's `tip` block:

> **Reading Time**
> Reading time for this document is 3 minutes for 705 words.

## Install

```sh
npm install @binarynoir/vitepress-reading-time-tag
```

## Usage

```ts
// .vitepress/config.mts
import { defineConfig } from 'vitepress';
import { withReadingTimeTag } from '@binarynoir/vitepress-reading-time-tag/vitepress';

export default withReadingTimeTag(
  defineConfig({
    // ...your normal config
  }),
);
```

Then put `[[readingTime]]` on its own line in any page. Case doesn't matter,
and spaces inside the brackets are fine (`[[ readingTime ]]`).

`withReadingTimeTag` will not clobber a `markdown.config` you already have,
including one set by another `withX()` wrapper. It installs its own first, then
calls yours with the same arguments.

### Plain markdown-it

```ts
import MarkdownIt from 'markdown-it';
import { readingTimeTag } from '@binarynoir/vitepress-reading-time-tag';

const md = new MarkdownIt().use(readingTimeTag, {
  render: ({ minutes }) => `About ${minutes} min read`,
});
```

The default output uses `::: tip` container syntax, which VitePress provides. In
a bare markdown-it setup, pass your own `render`.

## How the time is worked out

Words are counted from the page's Markdown, then divided by `wordsPerMinute` and
**rounded up**, so a page never reads "0 minutes". These are left out of the count:

- frontmatter and fenced code blocks
- HTML tags and comments (their text is still counted)
- link targets and bare URLs (link text is still counted)
- the `[[readingTime]]` tag itself

Each CJK character counts as one word. Inline code counts as ordinary words.

## Options

Both `readingTimeTag(md, options)` and `withReadingTimeTag(config, options)` take:

| Option           | Default               | Description                                                                                                                                       |
| ---------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `wordsPerMinute` | `300`                 | Reading speed. Must be a positive number; anything else throws when the plugin is registered.                                                     |
| `render`         | a `::: tip` container | `({ minutes, words }) => string`. Returns the Markdown that replaces each tag, so it can be any Markdown. A container must start at a line start. |

```ts
withReadingTimeTag(config, {
  wordsPerMinute: 238,
  render: ({ minutes }) => `::: info\n${minutes} min read\n:::`,
});
```

## Code is left alone

A tag inside a fenced block (` ``` ` or `~~~`, including unclosed ones) or inline
code is never replaced, so you can document the syntax itself:

```md
Write `[[readingTime]]` to add the block.
```

Indented (four-space) code blocks are not detected; use a fenced block.

## API

```ts
import { calculateReadingTime, transformReadingTimeTags } from '@binarynoir/vitepress-reading-time-tag';

calculateReadingTime(source: string, wordsPerMinute?: number): { words: number; minutes: number }
transformReadingTimeTags(source: string, options?: ReadingTimeTagOptions): string
```

`calculateReadingTime` is useful on its own, for instance to show a reading time
in a custom layout. `countWords` and `renderReadingTimeTip` are exported too.

## Differences from the VuePress version

The original plugin emitted `{{ $page.readingTime.minutes }}` and relied on
VuePress's reading-time plugin to fill it in. VitePress has no `$page`, so this
package does the counting itself. Wording also changed: "3 minutes" and "1 word"
instead of "3 minute(s)" and "1 word(s)", and minutes are whole numbers.

## Releasing

Releases are tag-triggered. From a clean `main` that's in sync with
`origin/main`:

```sh
npm run release:patch   # or release:minor / release:major
```

This runs typecheck/lint/test/build locally, then `npm version <bump>` and
`git push --follow-tags`. Pushing the tag triggers
[`.github/workflows/release.yml`](.github/workflows/release.yml), which re-runs
the checks, publishes to npm, and creates a GitHub release.

## License

MIT
