import type { ChatResponse, Document } from "../types";
import { supabase } from "../lib/supabase";

const isGitHubPages = window.location.hostname.endsWith("github.io");
const API_BASE =
  import.meta.env.VITE_API_BASE ||
  (isGitHubPages ? "https://scholarsync-dun.vercel.app/api" : "/api");

async function getAuthToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token || null;
}

export async function uploadPDF(file: File): Promise<{ document: Document }> {
  const formData = new FormData();
  formData.append("pdf", file);
  const token = await getAuthToken();
  const headers: HeadersInit = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${API_BASE}/upload`, {
    method: "POST",
    headers,
    body: formData,
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: "Upload failed" }));
    throw new Error(err.error || "Upload failed");
  }
  return response.json();
}

export async function getDocuments(): Promise<Document[]> {
  const token = await getAuthToken();
  const headers: HeadersInit = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${API_BASE}/documents`, { headers });
  if (!response.ok) throw new Error("Failed to fetch documents");
  const data = await response.json();
  return data.documents;
}

export async function deleteDocument(id: string): Promise<void> {
  const token = await getAuthToken();
  const headers: HeadersInit = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${API_BASE}/documents/${id}`, {
    method: "DELETE",
    headers,
  });
  if (!response.ok) throw new Error("Failed to delete document");
}

export async function getDocumentUrl(id: string): Promise<string> {
  const token = await getAuthToken();
  const headers: HeadersInit = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${API_BASE}/documents/${id}/url`, {
    headers,
  });
  if (!response.ok) throw new Error("Failed to fetch document URL");
  const data = await response.json();
  return data.url;
}

export async function sendChatMessage(
  query: string,
  documentIds?: string[],
  conversationHistory?: Array<{ role: string; content: string }>
): Promise<ChatResponse> {
  const token = await getAuthToken();
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers,
    body: JSON.stringify({ query, documentIds, conversationHistory }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: "Chat failed" }));
    throw new Error(err.error || "Chat failed");
  }
  return response.json();
}

export async function sendChatMessageStream(
  query: string,
  documentIds: string[] | undefined,
  conversationHistory: Array<{ role: string; content: string }>,
  onToken: (token: string) => void,
  onDone: (data: { sources: ChatResponse["sources"]; model: string }) => void
) {
  const token = await getAuthToken();
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${API_BASE}/chat/stream`, {
    method: "POST",
    headers,
    body: JSON.stringify({ query, documentIds, conversationHistory }),
  });

  if (!response.ok || !response.body) {
    const err = await response.json().catch(() => ({ error: "Chat failed" }));
    throw new Error(err.error || "Chat failed");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let index;
    while ((index = buffer.indexOf("\n\n")) !== -1) {
      const chunk = buffer.slice(0, index);
      buffer = buffer.slice(index + 2);
      if (!chunk.startsWith("data:")) continue;
      const payload = chunk.replace("data: ", "");
      const data = JSON.parse(payload);
      if (data.token) onToken(data.token);
      if (data.done) onDone({ sources: data.sources, model: data.model });
    }
  }
}
