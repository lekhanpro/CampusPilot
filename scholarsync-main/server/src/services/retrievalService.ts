import { GROQ_MODEL, groq } from "../config/groq.js";
import { supabaseAdmin } from "../config/supabase.js";
import { generateEmbedding } from "./embeddingService.js";
import {
  buildComparisonExpansions,
  buildKeywordQuery,
  dedupeQueries,
  extractSignificantTerms,
  rankMergedCandidates,
  selectDiverseCandidates,
  trimExcerpt,
} from "./retrievalUtils.js";

const INITIAL_VECTOR_TOP_K = parseInt(process.env.RAG_VECTOR_TOP_K || "12", 10);
const INITIAL_VECTOR_THRESHOLD = parseFloat(process.env.RAG_VECTOR_THRESHOLD || "0.24");
const FALLBACK_VECTOR_TOP_K = parseInt(process.env.RAG_VECTOR_FALLBACK_TOP_K || "24", 10);
const FALLBACK_VECTOR_THRESHOLD = parseFloat(
  process.env.RAG_VECTOR_FALLBACK_THRESHOLD || "0.12"
);
const MAX_CONTEXT_SOURCES = parseInt(process.env.RAG_CONTEXT_SOURCE_LIMIT || "6", 10);
const MAX_CONTEXT_CHARS = parseInt(process.env.RAG_CONTEXT_CHAR_BUDGET || "12000", 10);
const MAX_SOURCE_CHARS = parseInt(process.env.RAG_MAX_SOURCE_CHARS || "2200", 10);
const MIN_RESULTS_BEFORE_FALLBACK = parseInt(
  process.env.RAG_MIN_RESULTS_BEFORE_FALLBACK || "5",
  10
);

export interface ConversationMessage {
  role: string;
  content: string;
}

interface QueryPlan {
  originalQuery: string;
  standaloneQuery: string;
  retrievalQueries: string[];
}

interface ChunkMetadataRecord {
  section_hint?: string;
  start_offset?: number;
  end_offset?: number;
  page_chunk_index?: number;
  page_chunk_total?: number;
  prev_chunk_index?: number | null;
  next_chunk_index?: number | null;
  [key: string]: unknown;
}

interface RawChunkRow {
  id: string;
  document_id: string;
  content: string;
  page_number: number;
  chunk_index: number;
  metadata: ChunkMetadataRecord | null;
  similarity: number;
}

interface RetrievedChunk extends RawChunkRow {
  filename: string;
  vectorSimilarity: number;
  queryMatches: string[];
  queryRanks: number[];
  lexicalMatch: boolean;
}

export interface RetrievedSource {
  sourceId: string;
  filename: string;
  page_number: number;
  excerpt: string;
  similarity: number;
  content: string;
  document_id: string;
  chunk_index: number;
  metadata: ChunkMetadataRecord;
}

export interface PreparedRetrievalContext {
  promptContext: string;
  sources: RetrievedSource[];
  queryPlan: QueryPlan;
}

export async function prepareRetrievalContext(
  userId: string,
  query: string,
  documentIds?: string[],
  conversationHistory?: ConversationMessage[]
): Promise<PreparedRetrievalContext> {
  const queryPlan = await buildQueryPlan(query, conversationHistory);
  const initialQueries = queryPlan.retrievalQueries.slice(0, 4);

  const allRetrievedCandidates: Array<
    RawChunkRow & {
      queryText: string;
      queryRank: number;
      retrievalKind: "vector" | "lexical";
    }
  > = [];

  allRetrievedCandidates.push(
    ...(await runVectorRetrievalPass(
      userId,
      initialQueries,
      documentIds,
      INITIAL_VECTOR_TOP_K,
      INITIAL_VECTOR_THRESHOLD
    ))
  );

  let mergedCandidates = await hydrateAndMergeCandidates(userId, allRetrievedCandidates);

  if (shouldBroadenRetrieval(mergedCandidates, query, documentIds)) {
    allRetrievedCandidates.push(
      ...(await runVectorRetrievalPass(
        userId,
        initialQueries.slice(0, 2),
        documentIds,
        FALLBACK_VECTOR_TOP_K,
        FALLBACK_VECTOR_THRESHOLD
      ))
    );
    mergedCandidates = await hydrateAndMergeCandidates(userId, allRetrievedCandidates);
  }

  if (shouldRunLexicalFallback(mergedCandidates, query, documentIds)) {
    const lexicalQueries = dedupeQueries([
      queryPlan.standaloneQuery,
      buildKeywordQuery(queryPlan.standaloneQuery, 6),
      buildKeywordQuery(queryPlan.originalQuery, 6),
    ]).slice(0, 2);

    allRetrievedCandidates.push(
      ...(await runLexicalRetrievalPass(
        userId,
        lexicalQueries,
        documentIds,
        Math.min(FALLBACK_VECTOR_TOP_K, 20)
      ))
    );
    mergedCandidates = await hydrateAndMergeCandidates(userId, allRetrievedCandidates);
  }

  if (mergedCandidates.length === 0) {
    return {
      promptContext: "",
      sources: [],
      queryPlan,
    };
  }

  const ranked = rankMergedCandidates(
    mergedCandidates.map((candidate) => ({
      key: candidate.id,
      document_id: candidate.document_id,
      filename: candidate.filename,
      content: candidate.content,
      page_number: candidate.page_number,
      chunk_index: candidate.chunk_index,
      vectorSimilarity: candidate.vectorSimilarity,
      queryMatches: candidate.queryMatches,
      queryRanks: candidate.queryRanks,
      sectionHint: candidate.metadata?.section_hint,
    })),
    queryPlan.standaloneQuery
  );

  const rankedMap = new Map(ranked.map((candidate) => [candidate.key, candidate]));
  const rankedChunks = mergedCandidates
    .map((candidate) => ({
      ...candidate,
      score: rankedMap.get(candidate.id)?.score || candidate.vectorSimilarity,
    }))
    .sort((a, b) => b.score - a.score);

  const requireMultiDocumentCoverage = wantsMultiDocumentCoverage(query, documentIds);
  const selectedSeeds = selectDiverseCandidates(
    ranked,
    MAX_CONTEXT_SOURCES,
    requireMultiDocumentCoverage
  )
    .map((candidate) => rankedChunks.find((chunk) => chunk.id === candidate.key))
    .filter((candidate): candidate is RetrievedChunk & { score: number } => Boolean(candidate));

  const expandedNeighbors = await fetchAdjacentChunks(userId, selectedSeeds);
  const sources = buildSourcesFromSeeds(selectedSeeds, expandedNeighbors);

  return {
    promptContext: sources.map((source) => formatPromptSource(source)).join("\n\n---\n\n"),
    sources,
    queryPlan,
  };
}

async function buildQueryPlan(
  query: string,
  conversationHistory?: ConversationMessage[]
): Promise<QueryPlan> {
  const originalQuery = query.trim();
  let standaloneQuery = originalQuery;
  let llmExpansions: string[] = [];

  if (shouldRewriteQuery(originalQuery, conversationHistory)) {
    const rewritten = await rewriteRetrievalQuery(originalQuery, conversationHistory || []);
    standaloneQuery = rewritten.standaloneQuery || originalQuery;
    llmExpansions = rewritten.expansions;
  }

  const retrievalQueries = dedupeQueries([
    originalQuery,
    standaloneQuery !== originalQuery ? standaloneQuery : null,
    buildKeywordQuery(standaloneQuery, 7),
    ...buildComparisonExpansions(standaloneQuery),
    ...llmExpansions,
  ]).slice(0, 4);

  return {
    originalQuery,
    standaloneQuery,
    retrievalQueries,
  };
}

function shouldRewriteQuery(
  query: string,
  conversationHistory?: ConversationMessage[]
): boolean {
  if (!conversationHistory || conversationHistory.length === 0) return false;

  const trimmed = query.trim();
  const shortQuestion = trimmed.split(/\s+/).length <= 14;
  const followUpCue =
    /^(and|also|what about|how about|why|when|where|who|which|it|they|them|those|these|that|this)\b/i.test(
      trimmed
    ) || /\b(it|they|them|those|these|that|this|former|latter)\b/i.test(trimmed);

  return shortQuestion || followUpCue;
}

async function rewriteRetrievalQuery(
  query: string,
  conversationHistory: ConversationMessage[]
): Promise<{ standaloneQuery?: string; expansions: string[] }> {
  try {
    const recentHistory = conversationHistory.slice(-6);
    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      temperature: 0,
      max_tokens: 180,
      messages: [
        {
          role: "system",
          content:
            "Rewrite follow-up questions for retrieval. Return compact JSON only with keys standaloneQuery and expansions. expansions must be an array of up to 2 short search queries.",
        },
        {
          role: "user",
          content: JSON.stringify({
            conversation: recentHistory,
            question: query,
          }),
        },
      ],
    });

    const content = completion.choices[0]?.message?.content || "";
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) {
      return { standaloneQuery: query, expansions: [] };
    }

    const parsed = JSON.parse(match[0]) as {
      standaloneQuery?: string;
      expansions?: string[];
    };

    return {
      standaloneQuery: parsed.standaloneQuery?.trim() || query,
      expansions: dedupeQueries(parsed.expansions || []).slice(0, 2),
    };
  } catch (error: any) {
    console.warn(`[RAG] Query rewrite fallback: ${error.message}`);
    return { standaloneQuery: query, expansions: [] };
  }
}

async function runVectorRetrievalPass(
  userId: string,
  queries: string[],
  documentIds: string[] | undefined,
  topK: number,
  threshold: number
): Promise<Array<RawChunkRow & { queryText: string; queryRank: number; retrievalKind: "vector" }>> {
  const results: Array<
    RawChunkRow & { queryText: string; queryRank: number; retrievalKind: "vector" }
  > = [];

  for (const query of queries) {
    const embedding = await generateEmbedding(query);
    const { data, error } = await supabaseAdmin.rpc("match_documents", {
      query_embedding: JSON.stringify(embedding),
      match_threshold: threshold,
      match_count: topK,
      filter_document_ids: documentIds || null,
      filter_user_id: userId,
    });

    if (error) {
      throw new Error(`Vector search failed: ${error.message}`);
    }

    for (const [index, row] of ((data || []) as RawChunkRow[]).entries()) {
      results.push({
        ...row,
        similarity: Number(row.similarity || 0),
        queryText: query,
        queryRank: index + 1,
        retrievalKind: "vector",
      });
    }
  }

  return results;
}

async function runLexicalRetrievalPass(
  userId: string,
  queries: string[],
  documentIds: string[] | undefined,
  limit: number
): Promise<Array<RawChunkRow & { queryText: string; queryRank: number; retrievalKind: "lexical" }>> {
  const results: Array<
    RawChunkRow & { queryText: string; queryRank: number; retrievalKind: "lexical" }
  > = [];

  for (const query of queries) {
    const keywords = extractSignificantTerms(query, 4).slice(0, 4);
    if (keywords.length === 0) continue;

    let request = supabaseAdmin
      .from("document_chunks")
      .select("id, document_id, content, page_number, chunk_index, metadata")
      .eq("user_id", userId)
      .limit(limit);

    if (documentIds && documentIds.length > 0) {
      request = request.in("document_id", documentIds);
    }

    const filter = keywords
      .map((keyword) => `content.ilike.%${keyword.replace(/[^a-z0-9]/gi, "")}%`)
      .join(",");

    const { data, error } = await request.or(filter);
    if (error) {
      throw new Error(`Lexical fallback failed: ${error.message}`);
    }

    const rows = (data || []) as Omit<RawChunkRow, "similarity">[];
    rows
      .map((row) => ({
        ...row,
        similarity: 0,
      }))
      .sort((a, b) => b.content.length - a.content.length)
      .forEach((row, index) => {
        results.push({
          ...row,
          queryText: query,
          queryRank: index + 1,
          retrievalKind: "lexical",
        });
      });
  }

  return results;
}

async function hydrateAndMergeCandidates(
  userId: string,
  rawCandidates: Array<
    RawChunkRow & {
      queryText: string;
      queryRank: number;
      retrievalKind: "vector" | "lexical";
    }
  >
): Promise<RetrievedChunk[]> {
  if (rawCandidates.length === 0) return [];

  const documentNames = await fetchDocumentNames(
    userId,
    Array.from(new Set(rawCandidates.map((candidate) => candidate.document_id)))
  );

  const merged = new Map<string, RetrievedChunk>();

  for (const candidate of rawCandidates) {
    const key = candidate.id;
    const existing = merged.get(key);
    const metadata = normalizeMetadata(candidate.metadata);

    if (!existing) {
      merged.set(key, {
        ...candidate,
        metadata,
        filename: documentNames.get(candidate.document_id) || "Unknown file",
        vectorSimilarity: candidate.retrievalKind === "vector" ? candidate.similarity : 0,
        queryMatches: [candidate.queryText],
        queryRanks: [candidate.queryRank],
        lexicalMatch: candidate.retrievalKind === "lexical",
      });
      continue;
    }

    existing.vectorSimilarity = Math.max(
      existing.vectorSimilarity,
      candidate.retrievalKind === "vector" ? candidate.similarity : 0
    );
    if (!existing.queryMatches.includes(candidate.queryText)) {
      existing.queryMatches.push(candidate.queryText);
    }
    existing.queryRanks.push(candidate.queryRank);
    existing.lexicalMatch = existing.lexicalMatch || candidate.retrievalKind === "lexical";
  }

  return Array.from(merged.values());
}

async function fetchDocumentNames(
  userId: string,
  documentIds: string[]
): Promise<Map<string, string>> {
  const { data, error } = await supabaseAdmin
    .from("documents")
    .select("id, original_name")
    .eq("user_id", userId)
    .in("id", documentIds);

  if (error) {
    throw new Error(`Failed to fetch documents: ${error.message}`);
  }

  return new Map((data || []).map((row: any) => [row.id, row.original_name]));
}

function normalizeMetadata(metadata: ChunkMetadataRecord | null): ChunkMetadataRecord {
  if (!metadata || typeof metadata !== "object") return {};
  return metadata;
}

function shouldBroadenRetrieval(
  candidates: RetrievedChunk[],
  query: string,
  documentIds?: string[]
): boolean {
  const uniqueDocuments = new Set(candidates.map((candidate) => candidate.document_id));
  return (
    candidates.length < MIN_RESULTS_BEFORE_FALLBACK ||
    (wantsMultiDocumentCoverage(query, documentIds) && uniqueDocuments.size < 2)
  );
}

function shouldRunLexicalFallback(
  candidates: RetrievedChunk[],
  query: string,
  documentIds?: string[]
): boolean {
  if (candidates.length < MIN_RESULTS_BEFORE_FALLBACK) return true;

  const lowScoring = candidates.every((candidate) => candidate.vectorSimilarity < 0.35);
  const uniqueDocuments = new Set(candidates.map((candidate) => candidate.document_id));
  return lowScoring || (wantsMultiDocumentCoverage(query, documentIds) && uniqueDocuments.size < 2);
}

function wantsMultiDocumentCoverage(query: string, documentIds?: string[]): boolean {
  if ((documentIds?.length || 0) <= 1) return false;
  return /(compare|contrast|difference|different|across|between|both|all|multiple)/i.test(query);
}

async function fetchAdjacentChunks(
  userId: string,
  seeds: Array<RetrievedChunk & { score: number }>
): Promise<Map<string, RawChunkRow[]>> {
  const grouped = new Map<string, { documentId: string; pageNumber: number; indexes: Set<number> }>();

  for (const seed of seeds.slice(0, 4)) {
    const metadata = normalizeMetadata(seed.metadata);
    const indexes = new Set<number>();

    const prevIndex =
      typeof metadata.prev_chunk_index === "number"
        ? metadata.prev_chunk_index
        : seed.chunk_index - 1;
    const nextIndex =
      typeof metadata.next_chunk_index === "number"
        ? metadata.next_chunk_index
        : seed.chunk_index + 1;

    indexes.add(prevIndex);
    indexes.add(nextIndex);

    const groupKey = `${seed.document_id}:${seed.page_number}`;
    const existing = grouped.get(groupKey) || {
      documentId: seed.document_id,
      pageNumber: seed.page_number,
      indexes: new Set<number>(),
    };

    for (const index of indexes) {
      if (index >= 0) existing.indexes.add(index);
    }

    grouped.set(groupKey, existing);
  }

  const neighborMap = new Map<string, RawChunkRow[]>();

  for (const [groupKey, group] of grouped.entries()) {
    if (group.indexes.size === 0) continue;

    const { data, error } = await supabaseAdmin
      .from("document_chunks")
      .select("id, document_id, content, page_number, chunk_index, metadata")
      .eq("user_id", userId)
      .eq("document_id", group.documentId)
      .eq("page_number", group.pageNumber)
      .in("chunk_index", Array.from(group.indexes));

    if (error) {
      throw new Error(`Failed to fetch adjacent chunks: ${error.message}`);
    }

    neighborMap.set(
      groupKey,
      ((data || []) as Omit<RawChunkRow, "similarity">[]).map((row) => ({
        ...row,
        similarity: 0,
        metadata: normalizeMetadata(row.metadata),
      }))
    );
  }

  return neighborMap;
}

function buildSourcesFromSeeds(
  seeds: Array<RetrievedChunk & { score: number }>,
  neighbors: Map<string, RawChunkRow[]>
): RetrievedSource[] {
  const sources: RetrievedSource[] = [];
  let remainingChars = MAX_CONTEXT_CHARS;

  for (const seed of seeds) {
    if (sources.length >= MAX_CONTEXT_SOURCES || remainingChars < 300) break;

    const sourceId = `S${sources.length + 1}`;
    const neighborKey = `${seed.document_id}:${seed.page_number}`;
    const adjacent = neighbors.get(neighborKey) || [];
    const expandedContent = buildExpandedContent(
      seed,
      adjacent,
      Math.min(MAX_SOURCE_CHARS, remainingChars)
    );
    const content = expandedContent.trim();
    if (content.length < 120) continue;

    sources.push({
      sourceId,
      filename: seed.filename,
      page_number: seed.page_number,
      excerpt: trimExcerpt(content, 220),
      similarity: Math.round(seed.score * 100) / 100,
      content,
      document_id: seed.document_id,
      chunk_index: seed.chunk_index,
      metadata: normalizeMetadata(seed.metadata),
    });
    remainingChars -= content.length;
  }

  return sources;
}

function buildExpandedContent(
  seed: RetrievedChunk & { score: number },
  adjacent: RawChunkRow[],
  budget: number
): string {
  const parts: Array<{ order: number; text: string }> = [];
  const seedText = seed.content.trim();
  const metadata = normalizeMetadata(seed.metadata);
  const previous = adjacent.find((chunk) => chunk.chunk_index === seed.chunk_index - 1);
  const next = adjacent.find((chunk) => chunk.chunk_index === seed.chunk_index + 1);

  if (previous && shouldIncludePrevious(seedText, metadata)) {
    parts.push({ order: previous.chunk_index, text: previous.content.trim() });
  }

  parts.push({ order: seed.chunk_index, text: seedText });

  if (next && shouldIncludeNext(seedText, metadata)) {
    parts.push({ order: next.chunk_index, text: next.content.trim() });
  }

  const ordered = parts
    .sort((a, b) => a.order - b.order)
    .map((part) => part.text)
    .filter(Boolean);

  const combined = ordered.join("\n\n").replace(/\s+\n/g, "\n").trim();
  if (combined.length <= budget) return combined;

  if (seedText.length >= budget) {
    return seedText.slice(0, budget).trim();
  }

  return [seedText, next?.content.trim(), previous?.content.trim()]
    .filter(Boolean)
    .join("\n\n")
    .slice(0, budget)
    .trim();
}

function shouldIncludePrevious(seedText: string, metadata: ChunkMetadataRecord): boolean {
  const startOffset = typeof metadata.start_offset === "number" ? metadata.start_offset : 0;
  return startOffset > 80 || !/^[A-Z0-9(\[\"']/.test(seedText);
}

function shouldIncludeNext(seedText: string, metadata: ChunkMetadataRecord): boolean {
  const pageChunkIndex = typeof metadata.page_chunk_index === "number" ? metadata.page_chunk_index : 0;
  const pageChunkTotal = typeof metadata.page_chunk_total === "number" ? metadata.page_chunk_total : 1;
  return !/[.!?][\]"')]*$/.test(seedText) || pageChunkIndex < pageChunkTotal - 1;
}

function formatPromptSource(source: RetrievedSource): string {
  const sectionHint = source.metadata.section_hint
    ? ` | section: ${String(source.metadata.section_hint)}`
    : "";

  return `[${source.sourceId}] ${source.filename} | page ${source.page_number}${sectionHint}\n${source.content}`;
}
