import { API_BASE_URL } from './config';
import { supabase } from './supabase';
import type { DocumentPickerResponse } from 'react-native-document-picker';

export interface DocumentItem {
  id: string;
  original_name: string;
  status: 'processing' | 'ready' | 'error';
}

export interface SourceItem {
  filename: string;
  page_number: number;
  excerpt: string;
  similarity: number;
}

export interface ChatResponse {
  answer: string;
  sources: SourceItem[];
  model: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  sources?: SourceItem[];
}

async function authHeader() {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchDocuments(): Promise<DocumentItem[]> {
  const response = await fetch(`${API_BASE_URL}/documents`, {
    headers: { ...(await authHeader()) },
  });
  const data = await response.json();
  return data.documents || [];
}

export async function uploadPdf(file: DocumentPickerResponse) {
  const formData = new FormData();
  formData.append('pdf', {
    uri: file.uri,
    name: file.name || 'document.pdf',
    type: file.type || 'application/pdf',
  } as any);

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    headers: { ...(await authHeader()) },
    body: formData,
  });
  if (!response.ok) throw new Error('Upload failed');
  return response.json();
}

export async function deleteDocument(id: string) {
  await fetch(`${API_BASE_URL}/documents/${id}`, {
    method: 'DELETE',
    headers: { ...(await authHeader()) },
  });
}

export async function chatQuery(query: string, documentIds?: string[]): Promise<ChatResponse> {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(await authHeader()) },
    body: JSON.stringify({ query, documentIds }),
  });
  if (!response.ok) throw new Error('Chat failed');
  return response.json();
}
