import { Router } from "express";
import { chat } from "../controllers/chatController.js";
import { chatStream } from "../controllers/chatStreamController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/chat", requireAuth, chat);
router.post("/chat/stream", requireAuth, chatStream);

export default router;
