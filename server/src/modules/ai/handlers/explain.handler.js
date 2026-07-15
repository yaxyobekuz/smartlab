import asyncHandler from "../../../middleware/asyncHandler.js";
import ApiError from "../../../utils/ApiError.js";
import { explainPart, isConfigured } from "../services/explain.service.js";

// 3D modeldagi tanlangan qismni Gemini orqali tushuntiradi.
const explain = asyncHandler(async (req, res) => {
  if (!isConfigured()) {
    throw new ApiError(503, "AI sozlanmagan (GEMINI_API_KEY yo'q)");
  }
  const data = await explainPart(req.body);
  res.json({ success: true, data });
});

export default explain;
