import { z } from "zod";

// Bitta reaktiv: nomi, (ixtiyoriy) formulasi, miqdori va birligi.
const reagent = z.object({
  name: z.string().min(1).max(120),
  formula: z.string().max(60).optional(),
  quantity: z.number().positive().max(100000),
  unit: z.string().max(12).default("g"),
});

export const reactionSchema = z.object({
  body: z.object({
    a: reagent,
    b: reagent,
  }),
});
