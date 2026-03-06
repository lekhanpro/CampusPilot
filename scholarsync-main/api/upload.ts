import type { VercelRequest, VercelResponse } from "@vercel/node";
import multer from "multer";
import { createDocumentRecord, processDocumentBuffer } from "../server/src/services/ragService.js";
import { supabaseAdmin, STORAGE_BUCKET, getUserFromToken } from "../server/src/config/supabase.js";

// Disable Vercel's default body parser so multer can handle multipart
export const config = {
  api: {
    bodyParser: false,
  },
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
});

function runMulter(req: any, res: any): Promise<void> {
  return new Promise((resolve, reject) => {
    upload.single("pdf")(req, res, (err: any) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

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

    await runMulter(req, res);

    const file = (req as any).file;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    if (file.size > 50 * 1024 * 1024) {
      return res.status(400).json({ error: "File size must be under 50MB" });
    }

    console.log(
      `[Upload] Processing: ${file.originalname} (${(file.size / 1024).toFixed(1)}KB)`
    );

    const storagePath = `${user.id}/${Date.now()}-${file.originalname}`;
    const { error: storageError } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, file.buffer, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (storageError) {
      return res.status(500).json({ error: storageError.message });
    }

    const document = await createDocumentRecord(user.id, file.originalname, storagePath);
    await processDocumentBuffer(document.id, user.id, file.originalname, file.buffer);

    res.status(201).json({
      message: "Document processed successfully",
      document,
    });
  } catch (error: any) {
    console.error(`[Upload] Error: ${error.message}`);
    res.status(500).json({
      error: "Failed to process PDF",
      details: error.message,
    });
  }
}
