import { Response } from "express";
import { ragChat } from "../services/ragService.js";
import { trackEvent } from "../services/analytics.js";
import type { AuthenticatedRequest } from "../middleware/auth.js";

export async function chat(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { query, documentIds, conversationHistory } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      res.status(400).json({ error: "Query is required" });
      return;
    }

    if (query.length > 5000) {
      res.status(400).json({ error: "Query must be under 5000 characters" });
      return;
    }

    console.log(`[Chat] Query: "${query.slice(0, 100)}..."`);

    const response = await ragChat(
      userId,
      query.trim(),
      documentIds,
      conversationHistory
    );

    trackEvent(userId, "chat_query", {
      query_length: query.length,
      document_ids: documentIds?.length || 0,
    });

    res.json(response);
  } catch (error: any) {
    console.error(`[Chat] Error: ${error.message}`);
    res.status(500).json({
      error: "Failed to generate response",
      details: error.message,
    });
  }
}
