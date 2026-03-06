import type { VercelRequest, VercelResponse } from "@vercel/node";
import { ragChatStream } from "../server/src/services/ragService.js";
import { getUserFromToken } from "../server/src/config/supabase.js";

export const config = {
  api: { bodyParser: true },
};

function setCors(res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const token = (req.headers.authorization || "").replace("Bearer ", "");
    const user = await getUserFromToken(token);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { query, documentIds, conversationHistory } = req.body;
    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return res.status(400).json({ error: "Query is required" });
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");

    const { sources, stream } = await ragChatStream(
      user.id,
      query.trim(),
      documentIds,
      conversationHistory
    );

    for await (const tokenChunk of stream) {
      res.write(`data: ${JSON.stringify({ token: tokenChunk })}\n\n`);
    }
    res.write(
      `data: ${JSON.stringify({ done: true, sources, model: "llama-3.3-70b-versatile" })}\n\n`
    );
    res.end();
  } catch (error: any) {
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
}
