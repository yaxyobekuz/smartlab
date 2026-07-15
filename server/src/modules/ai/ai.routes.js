import { Router } from "express";
import validate from "../../middleware/validate.js";
import { aiLimiter } from "../../middleware/rateLimiter.js";
import { chatSchema } from "./validators/chat.validator.js";
import { reactionSchema } from "./validators/reaction.validator.js";
import { explainSchema } from "./validators/explain.validator.js";
import chat from "./handlers/chat.handler.js";
import reaction from "./handlers/reaction.handler.js";
import explain from "./handlers/explain.handler.js";

// AI yordamchi public (laboratoriya kirishsiz ishlaydi), lekin rate-limit bilan.
const router = Router();

router.post("/chat", aiLimiter, validate(chatSchema), chat);
router.post("/reaction", aiLimiter, validate(reactionSchema), reaction);
router.post("/explain", aiLimiter, validate(explainSchema), explain);

export default router;
