import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getSignedDocumentUrl } from "../../../server/src/services/ragService.js";
import { getUserFromToken } from "../../../server/src/config/supabase.js";

function setCors(res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id } = req.query;
  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Document ID is required" });
  }

  try {
    const token = (req.headers.authorization || "").replace("Bearer ", "");
    const user = await getUserFromToken(token);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const url = await getSignedDocumentUrl(user.id, id);
    res.json({ url });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
