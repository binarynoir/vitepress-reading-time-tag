import { describe, expect, it } from 'vitest';
import { renderReadingTimeTip } from '../src/render.js';

describe('renderReadingTimeTip', () => {
  it('renders a tip container with plural minutes and words', () => {
    expect(renderReadingTimeTip({ minutes: 3, words: 812 })).toBe(
      '::: tip Reading Time\nReading time for this document is 3 minutes for 812 words.\n:::',
    );
  });

  it('uses singular forms for 1', () => {
    expect(renderReadingTimeTip({ minutes: 1, words: 1 })).toContain('1 minute for 1 word.');
  });

  it('uses the plural for 0 words', () => {
    expect(renderReadingTimeTip({ minutes: 1, words: 0 })).toContain('1 minute for 0 words.');
  });
});
