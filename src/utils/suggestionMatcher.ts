export type SuggestionCandidate = {
  name: string;
  quantity?: number;
  unit?: string;
  source?: 'list' | 'history' | 'staple';
};

export type SuggestionMatch = {
  candidate: SuggestionCandidate;
  score: number;
  reason: 'exact' | 'prefix' | 'includes' | 'fuzzy';
};

const normalize = (value: string) => value.trim().toLowerCase();

const levenshtein = (a: string, b: string) => {
  const matrix = Array.from({ length: a.length + 1 }, () =>
    new Array(b.length + 1).fill(0)
  );

  for (let i = 0; i <= a.length; i += 1) {
    matrix[i][0] = i;
  }
  for (let j = 0; j <= b.length; j += 1) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[a.length][b.length];
};

const scoreCandidate = (query: string, candidate: string): SuggestionMatch => {
  const normalizedQuery = normalize(query);
  const normalizedCandidate = normalize(candidate);

  if (!normalizedQuery || !normalizedCandidate) {
    return { candidate: { name: candidate }, score: 0, reason: 'fuzzy' };
  }

  if (normalizedQuery === normalizedCandidate) {
    return { candidate: { name: candidate }, score: 1, reason: 'exact' };
  }

  if (normalizedCandidate.startsWith(normalizedQuery)) {
    return { candidate: { name: candidate }, score: 0.95, reason: 'prefix' };
  }

  if (normalizedCandidate.includes(normalizedQuery)) {
    return { candidate: { name: candidate }, score: 0.85, reason: 'includes' };
  }

  const distance = levenshtein(normalizedQuery, normalizedCandidate);
  const maxLength = Math.max(normalizedQuery.length, normalizedCandidate.length);
  const similarity = maxLength === 0 ? 0 : 1 - distance / maxLength;

  return {
    candidate: { name: candidate },
    score: similarity,
    reason: 'fuzzy',
  };
};

export const getSuggestionMatches = (
  query: string,
  candidates: SuggestionCandidate[],
  options?: {
    limit?: number;
    minScore?: number;
  }
) => {
  const limit = options?.limit ?? 5;
  const minScore = options?.minScore ?? 0.6;
  const normalizedQuery = normalize(query);
  if (normalizedQuery.length < 2) {
    return [];
  }

  const seen = new Set<string>();
  const matches: SuggestionMatch[] = [];

  candidates.forEach(candidate => {
    const name = candidate.name.trim();
    const normalizedName = normalize(name);
    if (!normalizedName || seen.has(normalizedName)) {
      return;
    }

    seen.add(normalizedName);
    const scored = scoreCandidate(normalizedQuery, name);
    if (scored.score >= minScore) {
      matches.push({
        candidate,
        score: scored.score,
        reason: scored.reason,
      });
    }
  });

  return matches
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
};

export const getBestSuggestion = (
  query: string,
  candidates: SuggestionCandidate[],
  minScore = 0.75
) => {
  const matches = getSuggestionMatches(query, candidates, { limit: 1, minScore });
  return matches[0] ?? null;
};
