import { z } from "zod";

const message = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().max(4000),
});

const item = z.object({
  id: z.string(),
  name: z.string(),
});

export const chatSchema = z.object({
  body: z.object({
    history: z.array(message).min(1).max(30),
    context: z
      .object({
        subject: z.string().optional(),
        topic: z.string().optional(),
        title: z.string().optional(),
        activeItem: z.string().optional(),
        items: z.array(item).max(60).optional(),
        recentActions: z.array(z.string().max(200)).max(20).optional(),
      })
      .optional(),
  }),
});
