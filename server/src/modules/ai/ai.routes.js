import { Router } from "express";
import validate from "../../middleware/validate.js";
import { aiLimiter } from "../../middleware/rateLimiter.js";
import { chatSchema } from "./validators/chat.validator.js";
import chat from "./handlers/chat.handler.js";

// AI yordamchi public (laboratoriya kirishsiz ishlaydi), lekin rate-limit bilan.
const router = Router();

router.post("/chat", aiLimiter, validate(chatSchema), chat);

export default router;
