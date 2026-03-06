import { Router } from "express";
import multer from "multer";
import { uploadPDF, getDocuments, removeDocument, getDocumentSignedUrl } from "../controllers/uploadController.js";
import { requireAuth } from "../middleware/auth.js";

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

const router = Router();

router.post("/upload", requireAuth, upload.single("pdf"), uploadPDF);
router.get("/documents", requireAuth, getDocuments);
router.get("/documents/:id/url", requireAuth, getDocumentSignedUrl);
router.delete("/documents/:id", requireAuth, removeDocument);

export default router;
