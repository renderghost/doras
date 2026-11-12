import { describe, expect, it } from 'vitest';
import { initialsFor } from '../src/avatar/initials.ts';

describe('initialsFor', () => {
  it.each([
    ['Sam Rivera', 'SR'],
    ['sam', 'S'],
    ['Jo Ann van der Berg', 'JB'],
    ['Élodie Durand', 'ÉD'],
    ['山田 太郎', '山太'],
    ['さくら', 'さ'],
    ['رنا خليل', 'رخ'],
    ['🌻 Sunny', '🌻S'],
    ['👩🏽‍🍳 Chef', '👩🏽‍🍳C'],
    ['   ', ''],
  ])('%s → %s', (name, initials) => {
    expect(initialsFor(name)).toBe(initials);
  });
});
