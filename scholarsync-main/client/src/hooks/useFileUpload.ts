import { useState, useCallback, useEffect } from "react";
import { uploadPDF, getDocuments, deleteDocument, getDocumentUrl } from "../services/api";
import type { Document } from "../types";
import { capture } from "../lib/posthog";

export function useFileUpload() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploading, setUploading] = useState<Map<string, boolean>>(new Map());
  const [errors, setErrors] = useState<Map<string, string>>(new Map());

  const fetchDocuments = useCallback(async () => {
    try {
      const docs = await getDocuments();
      setDocuments(docs);
    } catch (err) {
      console.error("Failed to fetch documents:", err);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (documents.some((d) => d.status === "processing")) {
        fetchDocuments();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [documents, fetchDocuments]);

  const upload = useCallback(async (files: File[]) => {
    for (const file of files) {
      if (file.type !== "application/pdf") {
        setErrors((prev) => new Map(prev).set(file.name, "Only PDF files are accepted"));
        continue;
      }
      setUploading((prev) => new Map(prev).set(file.name, true));
      setErrors((prev) => { const next = new Map(prev); next.delete(file.name); return next; });
      try {
        const result = await uploadPDF(file);
        setDocuments((prev) => [result.document, ...prev]);
        capture("document_upload_client", { file_name: file.name, file_size: file.size });
      } catch (err: any) {
        setErrors((prev) => new Map(prev).set(file.name, err.message));
      } finally {
        setUploading((prev) => { const next = new Map(prev); next.delete(file.name); return next; });
      }
    }
  }, []);

  const removeDocument = useCallback(async (id: string) => {
    try {
      await deleteDocument(id);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      capture("document_delete_client", { document_id: id });
    } catch (err: any) {
      console.error("Failed to delete:", err.message);
    }
  }, []);

  return { documents, uploading, errors, upload, removeDocument, fetchDocuments, getDocumentUrl };
}
