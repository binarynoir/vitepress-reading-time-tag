import type { ReadingTime } from './types.js';

const pluralize = (count: number, noun: string): string => `${count} ${noun}${count === 1 ? '' : 's'}`;

/** The default `[[readingTime]]` replacement: a "Reading Time" tip container. */
export function renderReadingTimeTip({ minutes, words }: ReadingTime): string {
  return `::: tip Reading Time\nReading time for this document is ${pluralize(minutes, 'minute')} for ${pluralize(words, 'word')}.\n:::`;
}
