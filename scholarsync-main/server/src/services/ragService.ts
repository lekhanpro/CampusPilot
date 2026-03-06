import { supabaseAdmin, STORAGE_BUCKET } from "../config/supabase.js";
import {
  groq,
  GROQ_MODEL,
  GROQ_TEMPERATURE,
  GROQ_MAX_TOKENS,
} from "../config/groq.js";
import { parsePDFBuffer } from "./pdfService.js";
import { generateEmbeddings } from "./embeddingService.js";
import { buildDocumentChunks } from "./chunkingService.js";
import {
  prepareRetrievalContext,
  type ConversationMessage,
  type RetrievedSource,
} from "./retrievalService.js";
import { v4 as uuidv4 } from "uuid";

export interface DocumentRecord {
  id: string;
  user_id: string;
  filename: string;
  original_name: string;
  total_pages: number;
  total_chunks: number;
  status: "processing" | "ready" | "error";
  error_message?: string;
  storage_path?: string;
  created_at: string;
}

export interface ChatResponse {
  answer: string;
  sources: Array<{
    filename: string;
    page_number: number;
    excerpt: string;
    similarity: number;
  }>;
  model: string;
}

export interface IngestJob {
  id: string;
  document_id: string;
  user_id: string;
  storage_path: string;
  status: "queued" | "processing" | "completed" | "failed";
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export async function createDocumentRecord(
  userId: string,
  originalName: string,
  storagePath?: string
): Promise<DocumentRecord> {
  const docId = uuidv4();

  const { data, error } = await supabaseAdmin
    .from("documents")
    .insert({
      id: docId,
      user_id: userId,
      filename: storagePath?.split("/").pop() || originalName,
      original_name: originalName,
      status: "processing",
      storage_path: storagePath || null,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to create document record: ${error.message}`);
  }

  return data as DocumentRecord;
}

export async function processDocumentBuffer(
  docId: string,
  userId: string,
  originalName: string,
  buffer: Buffer
): Promise<DocumentRecord> {
  try {
    const parsed = await parsePDFBuffer(buffer);
    const chunks = await buildDocumentChunks(parsed.pages, originalName);

    if (chunks.length === 0) {
      throw new Error("No meaningful text chunks extracted from PDF");
    }

    await storeChunks(docId, userId, chunks);

    const { data, error } = await supabaseAdmin
      .from("documents")
      .update({
        status: "ready",
        total_pages: parsed.totalPages,
        total_chunks: chunks.length,
        error_message: null,
      })
      .eq("id", docId)
      .eq("user_id", userId)
      .select("*")
      .single();

    if (error) {
      throw new Error(`Failed to update document status: ${error.message}`);
    }

    return data as DocumentRecord;
  } catch (error: any) {
    await supabaseAdmin
      .from("documents")
      .update({
        status: "error",
        error_message: error.message,
      })
      .eq("id", docId)
      .eq("user_id", userId);
    throw error;
  }
}

async function storeChunks(
  docId: string,
  userId: string,
  chunks: Awaited<ReturnType<typeof buildDocumentChunks>>
) {
  const embeddings = await generateEmbeddings(chunks.map((chunk) => chunk.content));

  const rows = chunks.map((chunk, index) => ({
    id: uuidv4(),
    document_id: docId,
    user_id: userId,
    content: chunk.content,
    page_number: chunk.pageNumber,
    chunk_index: chunk.chunkIndex,
    metadata: chunk.metadata,
    embedding: JSON.stringify(embeddings[index]),
  }));

  for (let i = 0; i < rows.length; i += 50) {
    const batch = rows.slice(i, i + 50);
    const { error } = await supabaseAdmin.from("document_chunks").insert(batch);

    if (error) {
      throw new Error(`Failed to store chunks (batch ${i}): ${error.message}`);
    }
  }
}

export async function ragChat(
  userId: string,
  query: string,
  documentIds?: string[],
  conversationHistory?: ConversationMessage[]
): Promise<ChatResponse> {
  const retrieval = await prepareRetrievalContext(
    userId,
    query,
    documentIds,
    conversationHistory
  );

  if (retrieval.sources.length === 0) {
    return buildNoResultsResponse();
  }

  const completion = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: buildChatMessages(
      buildGroundedSystemPrompt(retrieval.promptContext),
      query,
      conversationHistory
    ),
    temperature: GROQ_TEMPERATURE,
    max_tokens: GROQ_MAX_TOKENS,
    top_p: 0.9,
  });

  const answer =
    completion.choices[0]?.message?.content ||
    "I was unable to generate a response. Please try again.";

  return {
    answer,
    sources: buildSourcesResponse(retrieval.sources),
    model: GROQ_MODEL,
  };
}

export async function ragChatStream(
  userId: string,
  query: string,
  documentIds?: string[],
  conversationHistory?: ConversationMessage[]
): Promise<{
  stream: AsyncIterable<string>;
  sourcesPromise: Promise<ChatResponse["sources"]>;
}> {
  const retrieval = await prepareRetrievalContext(
    userId,
    query,
    documentIds,
    conversationHistory
  );

  if (retrieval.sources.length === 0) {
    return {
      stream: (async function* () {
        yield buildNoResultsResponse().answer;
      })(),
      sourcesPromise: Promise.resolve([]),
    };
  }

  const response = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: buildChatMessages(
      buildGroundedSystemPrompt(retrieval.promptContext),
      query,
      conversationHistory
    ),
    temperature: GROQ_TEMPERATURE,
    max_tokens: GROQ_MAX_TOKENS,
    top_p: 0.9,
    stream: true,
  });

  let resolveSources: ((sources: ChatResponse["sources"]) => void) | undefined;
  let rejectSources: ((error: Error) => void) | undefined;
  const sourcesPromise = new Promise<ChatResponse["sources"]>((resolve, reject) => {
    resolveSources = resolve;
    rejectSources = reject;
  });

  const stream = (async function* () {
    try {
      for await (const chunk of response) {
        const token = chunk.choices[0]?.delta?.content || "";
        if (!token) continue;
        yield token;
      }

      resolveSources?.(buildSourcesResponse(retrieval.sources));
    } catch (error: any) {
      rejectSources?.(error);
      throw error;
    }
  })();

  return { stream, sourcesPromise };
}

function buildGroundedSystemPrompt(context: string): string {
  return `You are ScholarSync, an AI study assistant. Answer ONLY with evidence from the provided sources.

Rules:
1. Use only the source blocks below. If they are insufficient, say so.
2. Cite every factual claim with one or more bracketed source IDs like [S1] or [S1][S3].
3. Never cite a source ID that is not provided.
4. Prefer concise synthesis over copying long quotes.
5. If documents disagree, explain the disagreement and cite both sides.

Sources:
${context}`;
}

function buildChatMessages(
  systemPrompt: string,
  query: string,
  conversationHistory?: ConversationMessage[]
): Array<{ role: "system" | "user" | "assistant"; content: string }> {
  const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
    { role: "system", content: systemPrompt },
  ];

  if (conversationHistory?.length) {
    for (const message of conversationHistory.slice(-6)) {
      if (message.role !== "user" && message.role !== "assistant") continue;
      messages.push({ role: message.role, content: message.content });
    }
  }

  messages.push({ role: "user", content: query });
  return messages;
}

function buildSourcesResponse(sources: RetrievedSource[]): ChatResponse["sources"] {
  return sources.map((source) => ({
    filename: source.filename,
    page_number: source.page_number,
    excerpt: source.excerpt,
    similarity: source.similarity,
  }));
}

function buildNoResultsResponse(): ChatResponse {
  return {
    answer:
      "I couldn't find enough grounded evidence in your uploaded documents to answer that confidently. Try rephrasing the question or selecting the most relevant PDFs.",
    sources: [],
    model: GROQ_MODEL,
  };
}

export async function listDocuments(userId: string): Promise<DocumentRecord[]> {
  const { data, error } = await supabaseAdmin
    .from("documents")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to list documents: ${error.message}`);
  return data || [];
}

export async function deleteDocument(userId: string, docId: string): Promise<void> {
  const { data: doc } = await supabaseAdmin
    .from("documents")
    .select("storage_path")
    .eq("id", docId)
    .eq("user_id", userId)
    .single();

  const { error } = await supabaseAdmin
    .from("documents")
    .delete()
    .eq("id", docId)
    .eq("user_id", userId);
  if (error) throw new Error(`Failed to delete document: ${error.message}`);

  if (doc?.storage_path) {
    await supabaseAdmin.storage.from(STORAGE_BUCKET).remove([doc.storage_path]);
  }
}

export async function getSignedDocumentUrl(
  userId: string,
  docId: string
): Promise<string> {
  const { data: doc, error } = await supabaseAdmin
    .from("documents")
    .select("storage_path")
    .eq("id", docId)
    .eq("user_id", userId)
    .single();

  if (error || !doc?.storage_path) {
    throw new Error("Document not found");
  }

  const { data, error: urlError } = await supabaseAdmin.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(doc.storage_path, 60 * 10);

  if (urlError || !data?.signedUrl) {
    throw new Error(`Failed to create signed URL: ${urlError?.message}`);
  }

  return data.signedUrl;
}
