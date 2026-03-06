import { Response } from "express";
import {
  createDocumentRecord,
  processDocumentBuffer,
  listDocuments,
  deleteDocument,
  getSignedDocumentUrl,
} from "../services/ragService.js";
import { supabaseAdmin, STORAGE_BUCKET } from "../config/supabase.js";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import { trackEvent } from "../services/analytics.js";

const MAX_DOCS_PER_USER = parseInt(process.env.MAX_DOCS_PER_USER || "200", 10);

export async function uploadPDF(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }

    const file = req.file;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (file.mimetype !== "application/pdf") {
      res.status(400).json({ error: "Only PDF files are accepted" });
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      res.status(400).json({ error: "File size must be under 50MB" });
      return;
    }

    const { count } = await supabaseAdmin
      .from("documents")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);

    if (count && count >= MAX_DOCS_PER_USER) {
      res.status(429).json({ error: "Document limit reached" });
      return;
    }

    console.log(
      `[Upload] Processing: ${file.originalname} (${(file.size / 1024).toFixed(1)}KB)`
    );

    const storagePath = `${userId}/${Date.now()}-${file.originalname}`;
    const { error: storageError } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, file.buffer, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (storageError) {
      res.status(500).json({ error: `Failed to upload to storage: ${storageError.message}` });
      return;
    }

    const document = await createDocumentRecord(userId, file.originalname, storagePath);
    const processedDocument = await processDocumentBuffer(
      document.id,
      userId,
      file.originalname,
      file.buffer
    );

    trackEvent(userId, "document_uploaded", {
      document_id: document.id,
      file_name: file.originalname,
      file_size: file.size,
    });

    res.status(201).json({
      message: "Document processed successfully",
      document: processedDocument,
    });
  } catch (error: any) {
    console.error(`[Upload] Error: ${error.message}`);
    res.status(500).json({
      error: "Failed to process PDF",
      details: error.message,
    });
  }
}

export async function getDocuments(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const documents = await listDocuments(userId);
    res.json({ documents });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function removeDocument(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    const userId = req.user?.id;
    if (!id) {
      res.status(400).json({ error: "Document ID is required" });
      return;
    }
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    await deleteDocument(userId, id);
    trackEvent(userId, "document_deleted", { document_id: id });
    res.json({ message: "Document deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getDocumentSignedUrl(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    const userId = req.user?.id;
    if (!id || !userId) {
      res.status(400).json({ error: "Document ID is required" });
      return;
    }
    const url = await getSignedDocumentUrl(userId, id);
    res.json({ url });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
