import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import type { PageContent } from "./pdfService.js";

const CHUNK_SIZE = parseInt(process.env.RAG_CHUNK_SIZE || "1100", 10);
const CHUNK_OVERLAP = parseInt(process.env.RAG_CHUNK_OVERLAP || "180", 10);
const MIN_CHUNK_CHARS = parseInt(process.env.RAG_MIN_CHUNK_CHARS || "280", 10);

const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: CHUNK_SIZE,
  chunkOverlap: CHUNK_OVERLAP,
  separators: ["\n\n", "\n", ". ", "! ", "? ", "; ", ", ", " ", ""],
});

export interface ChunkMetadata {
  original_name: string;
  page: number;
  page_chunk_index: number;
  page_chunk_total: number;
  start_offset: number;
  end_offset: number;
  char_count: number;
  extraction_method: string;
  section_hint?: string;
  prev_chunk_index?: number | null;
  next_chunk_index?: number | null;
}

export interface PreparedChunk {
  content: string;
  pageNumber: number;
  chunkIndex: number;
  metadata: ChunkMetadata;
}

interface LocalChunk {
  content: string;
  pageNumber: number;
  startOffset: number;
  endOffset: number;
  sectionHint?: string;
  extractionMethod: string;
}

export async function buildDocumentChunks(
  pages: PageContent[],
  originalName: string
): Promise<PreparedChunk[]> {
  const localChunks: LocalChunk[] = [];

  for (const page of pages) {
    const normalizedPageText = normalizePageText(page.text);
    if (normalizedPageText.length < 80) continue;

    const splitChunks = await textSplitter.splitText(normalizedPageText);
    const mergedChunks = mergeTinyChunks(splitChunks);
    let cursor = 0;

    for (const chunk of mergedChunks) {
      const content = chunk.trim();
      if (content.length < 80) continue;

      const startOffset = findChunkOffset(normalizedPageText, content, cursor);
      const endOffset = Math.min(normalizedPageText.length, startOffset + content.length);
      cursor = Math.max(0, endOffset - CHUNK_OVERLAP);

      localChunks.push({
        content,
        pageNumber: page.pageNumber,
        startOffset,
        endOffset,
        sectionHint: inferSectionHint(normalizedPageText, startOffset, content),
        extractionMethod: page.extractionMethod || "text",
      });
    }
  }

  const pageChunkTotals = new Map<number, number>();
  for (const chunk of localChunks) {
    pageChunkTotals.set(chunk.pageNumber, (pageChunkTotals.get(chunk.pageNumber) || 0) + 1);
  }

  const pageChunkIndices = new Map<number, number>();

  return localChunks.map((chunk, index) => {
    const pageChunkIndex = pageChunkIndices.get(chunk.pageNumber) || 0;
    pageChunkIndices.set(chunk.pageNumber, pageChunkIndex + 1);

    return {
      content: chunk.content,
      pageNumber: chunk.pageNumber,
      chunkIndex: index,
      metadata: {
        original_name: originalName,
        page: chunk.pageNumber,
        page_chunk_index: pageChunkIndex,
        page_chunk_total: pageChunkTotals.get(chunk.pageNumber) || 1,
        start_offset: chunk.startOffset,
        end_offset: chunk.endOffset,
        char_count: chunk.content.length,
        extraction_method: chunk.extractionMethod,
        section_hint: chunk.sectionHint,
        prev_chunk_index: index > 0 ? index - 1 : null,
        next_chunk_index: index < localChunks.length - 1 ? index + 1 : null,
      },
    };
  });
}

function normalizePageText(text: string): string {
  return text
    .replace(/\r/g, "\n")
    .replace(/[\t\f\v]+/g, " ")
    .replace(/[ ]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+\n/g, "\n")
    .trim();
}

function mergeTinyChunks(chunks: string[]): string[] {
  const merged: string[] = [];

  for (const rawChunk of chunks) {
    const chunk = rawChunk.trim();
    if (!chunk) continue;

    const previous = merged[merged.length - 1];
    if (
      previous &&
      chunk.length < MIN_CHUNK_CHARS &&
      previous.length + chunk.length + 2 <= CHUNK_SIZE + Math.floor(CHUNK_OVERLAP / 2)
    ) {
      merged[merged.length - 1] = `${previous}\n${chunk}`;
      continue;
    }

    merged.push(chunk);
  }

  return merged;
}

function findChunkOffset(pageText: string, chunk: string, cursor: number): number {
  const searchStart = Math.max(0, cursor - CHUNK_OVERLAP - 40);
  const directIndex = pageText.indexOf(chunk, searchStart);
  if (directIndex !== -1) return directIndex;

  const prefix = chunk.slice(0, Math.min(chunk.length, 80));
  const prefixIndex = pageText.indexOf(prefix, searchStart);
  if (prefixIndex !== -1) return prefixIndex;

  return Math.min(searchStart, pageText.length);
}

function inferSectionHint(
  pageText: string,
  startOffset: number,
  chunk: string
): string | undefined {
  const nearbyWindow = pageText.slice(Math.max(0, startOffset - 400), startOffset + 120);
  const lines = nearbyWindow
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  for (let i = lines.length - 1; i >= 0; i -= 1) {
    if (looksLikeSectionHeading(lines[i])) {
      return lines[i].slice(0, 120);
    }
  }

  const firstLine = chunk.split(/\n+/)[0]?.trim();
  if (firstLine && looksLikeSectionHeading(firstLine)) {
    return firstLine.slice(0, 120);
  }

  return undefined;
}

function looksLikeSectionHeading(line: string): boolean {
  if (!line || line.length > 120) return false;
  return (
    /^[A-Z][A-Z\s\-:]{4,}$/.test(line) ||
    /^\d+(?:\.\d+)*\s+[A-Z]/.test(line) ||
    /^(chapter|section|unit|lesson|topic)\s+/i.test(line)
  );
}
