const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "for",
  "from",
  "how",
  "i",
  "if",
  "in",
  "into",
  "is",
  "it",
  "of",
  "on",
  "or",
  "s",
  "that",
  "the",
  "their",
  "them",
  "there",
  "these",
  "they",
  "this",
  "to",
  "was",
  "we",
  "what",
  "when",
  "where",
  "which",
  "who",
  "why",
  "with",
  "you",
  "your",
]);

export interface RankedCandidateInput {
  key: string;
  document_id: string;
  filename: string;
  content: string;
  page_number: number;
  chunk_index: number;
  vectorSimilarity: number;
  queryMatches: string[];
  queryRanks: number[];
  sectionHint?: string;
}

export interface RankedCandidate extends RankedCandidateInput {
  lexicalScore: number;
  fusionScore: number;
  score: number;
}

export function normalizeForSearch(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenizeForSearch(text: string): string[] {
  const normalized = normalizeForSearch(text);
  if (!normalized) return [];

  return normalized
    .split(" ")
    .map((token) => token.trim())
    .filter((token) => token.length >= 3 && !STOP_WORDS.has(token));
}

export function extractSignificantTerms(text: string, maxTerms = 8): string[] {
  const frequencies = new Map<string, number>();

  for (const token of tokenizeForSearch(text)) {
    frequencies.set(token, (frequencies.get(token) || 0) + 1);
  }

  return Array.from(frequencies.entries())
    .sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];
      return b[0].length - a[0].length;
    })
    .slice(0, maxTerms)
    .map(([token]) => token);
}

export function buildKeywordQuery(text: string, maxTerms = 8): string | null {
  const terms = extractSignificantTerms(text, maxTerms);
  if (terms.length < 2) return null;
  return terms.join(" ");
}

export function buildComparisonExpansions(query: string): string[] {
  const normalized = query.trim();
  if (!/(compare|contrast|difference|different|versus|vs\.?|between)/i.test(normalized)) {
    return [];
  }

  const parts = normalized
    .split(/\b(?:versus|vs\.?|and|between)\b/i)
    .map((part) => buildKeywordQuery(part, 5))
    .filter((part): part is string => Boolean(part));

  return dedupeQueries(parts).slice(0, 2);
}

export function dedupeQueries(queries: Array<string | null | undefined>): string[] {
  const seen = new Set<string>();
  const deduped: string[] = [];

  for (const query of queries) {
    const normalized = query?.trim();
    if (!normalized) continue;

    const key = normalizeForSearch(normalized);
    if (!key || seen.has(key)) continue;

    seen.add(key);
    deduped.push(normalized);
  }

  return deduped;
}

export function computeLexicalScore(
  content: string,
  queryTerms: string[],
  sectionHint?: string
): number {
  if (queryTerms.length === 0) return 0;

  const haystack = normalizeForSearch(content);
  const section = normalizeForSearch(sectionHint || "");

  if (!haystack) return 0;

  let matchedTerms = 0;
  let frequencyHits = 0;
  const bigramHits = new Set<string>();

  for (let i = 0; i < queryTerms.length; i += 1) {
    const term = queryTerms[i];
    const inContent = haystack.includes(term);
    const inSection = section.includes(term);

    if (inContent || inSection) {
      matchedTerms += 1;
      frequencyHits += inSection ? 2 : 1;
    }

    if (i < queryTerms.length - 1) {
      const bigram = `${term} ${queryTerms[i + 1]}`;
      if (haystack.includes(bigram) || section.includes(bigram)) {
        bigramHits.add(bigram);
      }
    }
  }

  const coverage = matchedTerms / queryTerms.length;
  const density = Math.min(1, frequencyHits / Math.max(queryTerms.length, 1));
  const phraseBoost =
    queryTerms.length > 1
      ? bigramHits.size / Math.max(1, queryTerms.length - 1)
      : 0;

  return Math.min(1, coverage * 0.55 + density * 0.25 + phraseBoost * 0.2);
}

export function rankMergedCandidates(
  candidates: RankedCandidateInput[],
  referenceQuery: string
): RankedCandidate[] {
  const queryTerms = extractSignificantTerms(referenceQuery, 10);

  return candidates
    .map((candidate) => {
      const lexicalScore = computeLexicalScore(
        candidate.content,
        queryTerms,
        candidate.sectionHint
      );
      const fusionRaw = candidate.queryRanks.reduce(
        (total, rank) => total + 1 / (60 + rank),
        0
      );
      const fusionScore = Math.min(1, fusionRaw * 20);
      const querySupport = Math.min(1, candidate.queryMatches.length / 3);
      const score = Math.min(
        1,
        candidate.vectorSimilarity * 0.5 +
          lexicalScore * 0.3 +
          fusionScore * 0.15 +
          querySupport * 0.05
      );

      return {
        ...candidate,
        lexicalScore,
        fusionScore,
        score,
      };
    })
    .sort((a, b) => b.score - a.score);
}

export function selectDiverseCandidates(
  ranked: RankedCandidate[],
  limit: number,
  requireMultiDocumentCoverage = false
): RankedCandidate[] {
  if (ranked.length <= limit) return ranked;

  const remaining = [...ranked];
  const selected: RankedCandidate[] = [];

  if (requireMultiDocumentCoverage) {
    const seededDocs = new Set<string>();
    for (const candidate of remaining) {
      if (seededDocs.has(candidate.document_id)) continue;
      selected.push(candidate);
      seededDocs.add(candidate.document_id);
      if (selected.length >= Math.min(limit, 2)) break;
    }
  }

  while (selected.length < limit && remaining.length > 0) {
    let bestIndex = 0;
    let bestScore = Number.NEGATIVE_INFINITY;

    for (let i = 0; i < remaining.length; i += 1) {
      const candidate = remaining[i];
      const similarityPenalty = selected.length
        ? Math.max(...selected.map((item) => textOverlap(candidate.content, item.content)))
        : 0;
      const samePagePenalty = selected.some(
        (item) =>
          item.document_id === candidate.document_id &&
          item.page_number === candidate.page_number
      )
        ? 0.12
        : 0;
      const sameDocCount = selected.filter(
        (item) => item.document_id === candidate.document_id
      ).length;
      const sameDocPenalty = Math.min(0.15, sameDocCount * 0.06);
      const mmrScore =
        candidate.score * 0.78 -
        similarityPenalty * 0.14 -
        samePagePenalty -
        sameDocPenalty;

      if (mmrScore > bestScore) {
        bestScore = mmrScore;
        bestIndex = i;
      }
    }

    const [picked] = remaining.splice(bestIndex, 1);
    if (selected.some((item) => item.key === picked.key)) continue;
    selected.push(picked);
  }

  return selected;
}

export function trimExcerpt(text: string, maxLength = 180): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= maxLength) return clean;
  return `${clean.slice(0, Math.max(0, maxLength - 3)).trim()}...`;
}

export function extractCitedSourceIds(answer: string): string[] {
  const ids = new Set<string>();

  for (const match of answer.matchAll(/\bS(\d+)\b/g)) {
    ids.add(`S${match[1]}`);
  }

  return Array.from(ids);
}

export function reorderSourcesByCitation<TSource extends { sourceId: string }>(
  sources: TSource[],
  answer: string
): TSource[] {
  const citedIds = extractCitedSourceIds(answer);
  if (citedIds.length === 0) return sources;

  const sourceMap = new Map(sources.map((source) => [source.sourceId, source]));
  const citedSources = citedIds
    .map((id) => sourceMap.get(id))
    .filter((source): source is TSource => Boolean(source));

  if (citedSources.length === 0) return sources;

  const remaining = sources.filter((source) => !citedIds.includes(source.sourceId));
  return [...citedSources, ...remaining];
}

function textOverlap(left: string, right: string): number {
  const leftTerms = new Set(tokenizeForSearch(left));
  const rightTerms = new Set(tokenizeForSearch(right));

  if (leftTerms.size === 0 || rightTerms.size === 0) return 0;

  let shared = 0;
  for (const term of leftTerms) {
    if (rightTerms.has(term)) shared += 1;
  }

  return shared / Math.max(leftTerms.size, rightTerms.size);
}
