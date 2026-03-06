import type { VercelRequest, VercelResponse } from "@vercel/node";
import { ragChat } from "../server/src/services/ragService.js";
import { getUserFromToken } from "../server/src/config/supabase.js";

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
    const { query, documentIds, conversationHistory } = req.body;
    const token = (req.headers.authorization || "").replace("Bearer ", "");
    const user = await getUserFromToken(token);

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return res.status(400).json({ error: "Query is required" });
    }

    if (query.length > 5000) {
      return res.status(400).json({ error: "Query must be under 5000 characters" });
    }

    console.log(`[Chat] Query: "${query.slice(0, 100)}..."`);

    const response = await ragChat(
      user.id,
      query.trim(),
      documentIds,
      conversationHistory
    );

    res.json(response);
  } catch (error: any) {
    console.error(`[Chat] Error: ${error.message}`);
    res.status(500).json({
      error: "Failed to generate response",
      details: error.message,
    });
  }
}
