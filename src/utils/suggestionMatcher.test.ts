import { describe, expect, it } from 'vitest';
import { getBestSuggestion, getSuggestionMatches } from './suggestionMatcher';

const candidates = [
  { name: 'Milk' },
  { name: 'Oat milk' },
  { name: 'Eggs' },
  { name: 'Bread' },
  { name: 'milk' },
];

describe('suggestionMatcher', () => {
  it('returns prefix matches first', () => {
    const matches = getSuggestionMatches('mil', candidates);
    expect(matches[0]?.candidate.name).toBe('Milk');
    expect(matches.map(match => match.candidate.name)).toContain('Oat milk');
  });

  it('dedupes candidates by normalized name', () => {
    const matches = getSuggestionMatches('milk', candidates);
    const names = matches.map(match => match.candidate.name.toLowerCase());
    const unique = new Set(names);
    expect(unique.size).toBe(names.length);
  });

  it('returns empty matches for short queries', () => {
    const matches = getSuggestionMatches('m', candidates);
    expect(matches).toHaveLength(0);
  });

  it('finds fuzzy suggestions for typos', () => {
    const best = getBestSuggestion('mlk', candidates, 0.7);
    expect(best?.candidate.name.toLowerCase()).toBe('milk');
  });
});
