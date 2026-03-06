import { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import { ragChatStream } from "../services/ragService.js";
import { GROQ_MODEL } from "../config/groq.js";

export async function chatStream(req: AuthenticatedRequest, res: Response): Promise<void> {
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

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");

    const { stream, sourcesPromise } = await ragChatStream(
      userId,
      query.trim(),
      documentIds,
      conversationHistory
    );

    for await (const token of stream) {
      res.write(`data: ${JSON.stringify({ token })}\n\n`);
    }

    const sources = await sourcesPromise;
    res.write(
      `data: ${JSON.stringify({ done: true, sources, model: GROQ_MODEL })}\n\n`
    );
    res.end();
  } catch (error: any) {
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
}
