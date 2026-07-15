import { z } from "zod";

// 3D modeldagi bir qismni (yoki foydalanuvchi savolini) tushuntirish so'rovi.
export const explainSchema = z.object({
  body: z.object({
    building: z.string().max(80).default("Registon"),
    part: z.string().min(1).max(80),
    level: z
      .enum(["kids", "school", "highschool", "university", "exam", "tourist"])
      .default("tourist"),
    question: z.string().max(300).optional(),
  }),
});
