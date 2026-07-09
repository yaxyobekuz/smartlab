import asyncHandler from "../../../middleware/asyncHandler.js";
import ApiError from "../../../utils/ApiError.js";
import { analyzeReaction, isConfigured } from "../services/reaction.service.js";

// Ikki moddani (miqdori bilan) Gemini'ga yuboradi va reaksiya status'ini qaytaradi.
const reaction = asyncHandler(async (req, res) => {
  if (!isConfigured()) {
    throw new ApiError(503, "AI reaksiya sozlanmagan (GEMINI_API_KEY yo'q)");
  }

  const { a, b } = req.body;
  const result = await analyzeReaction({ a, b });
  res.json({ success: true, data: result });
});

export default reaction;
