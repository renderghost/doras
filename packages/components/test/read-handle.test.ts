import { describe, expect, it } from 'vitest';
import { readHandle } from '../src/handle-field/read-handle.ts';

describe('readHandle', () => {
  it('reads a plain handle, in lower case', () => {
    expect(readHandle('Sam.Bsky.Social')).toEqual({
      kind: 'handle',
      handle: 'sam.bsky.social',
      fixes: [],
    });
  });

  it('drops a leading @ silently', () => {
    expect(readHandle('  @sam.bsky.social ')).toEqual({
      kind: 'handle',
      handle: 'sam.bsky.social',
      fixes: [],
    });
  });

  it('reads an email-style handle', () => {
    expect(readHandle('sam@bsky.social')).toEqual({
      kind: 'handle',
      handle: 'sam.bsky.social',
      fixes: [{ type: 'at-sign' }],
    });
  });

  it('corrects common slips in the ending, naming the provider', () => {
    expect(readHandle('sam.bsky.app')).toEqual({
      kind: 'handle',
      handle: 'sam.bsky.social',
      fixes: [{ type: 'ending', ending: 'bsky.app', correct: 'bsky.social', provider: 'Bluesky' }],
    });
  });

  it('corrects an email-style handle with a slip, in both ways', () => {
    expect(readHandle('rae@blacksky.community').fixes).toEqual([
      { type: 'at-sign' },
      {
        type: 'ending',
        ending: 'blacksky.community',
        correct: 'blacksky.app',
        provider: 'Blacksky',
      },
    ]);
  });

  it('takes the handle from a profile link', () => {
    expect(readHandle('https://bsky.app/profile/sam.bsky.social')).toEqual({
      kind: 'handle',
      handle: 'sam.bsky.social',
      fixes: [{ type: 'link' }],
    });
  });

  it('leaves a real email address alone', () => {
    expect(readHandle('sam@example.com')).toEqual({
      kind: 'email',
      handle: 'sam@example.com',
      fixes: [],
    });
  });

  it('treats text without a dot as a partial handle or a name', () => {
    expect(readHandle('Sam')).toEqual({ kind: 'partial', handle: 'sam', fixes: [] });
  });

  it('reads nothing from nothing', () => {
    expect(readHandle('  @ ')).toEqual({ kind: 'empty', handle: '', fixes: [] });
  });

  it('accepts a custom set of providers', () => {
    const domains = {
      endings: { 'example.org': 'Example' },
      slips: { 'example.com': 'example.org' },
    };
    expect(readHandle('jo.example.com', domains).handle).toBe('jo.example.org');
  });

  it('handles long handles of up to 253 characters', () => {
    const long = `${'a'.repeat(240)}.bsky.social`;
    expect(readHandle(long).handle).toBe(long);
  });
});
