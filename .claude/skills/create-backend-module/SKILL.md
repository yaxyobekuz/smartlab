---
name: create-backend-module
description: Used when adding a new module (handler/service/route/validator) on the backend server.
---

# Creating a backend module (handler-based)

## When to use
- When adding a new module (e.g. `posts`, `categories`, `comments`) under `server/src/modules/<name>/`.
- When adding a new endpoint to an existing module.

## Standard structure

```
modules/<name>/
├─ handlers/
│  ├─ list.handler.js         # GET / (list)
│  ├─ getById.handler.js      # GET /:id
│  ├─ create.handler.js       # POST /
│  ├─ update.handler.js       # PUT /:id
│  └─ remove.handler.js       # DELETE /:id
├─ services/<name>.service.js # business logic (DB-aware)
├─ validators/                # zod schemas (one per endpoint)
│  ├─ create.validator.js
│  └─ update.validator.js
└─ <name>.routes.js           # router assembly
```

## Steps

1. **Create the module folders.**
2. **Service** - business logic and DB:
   ```js
   // services/posts.service.js
   import Post from "../../../models/post.model.js";
   import ApiError from "../../../utils/ApiError.js";

   export const list = async ({ page = 1, limit = 20 }) => {
     const skip = (page - 1) * limit;
     const [items, total] = await Promise.all([
       Post.find().skip(skip).limit(limit),
       Post.countDocuments(),
     ]);
     return { items, total, page, limit };
   };

   export const create = async (body) => {
     if (await Post.exists({ slug: body.slug })) {
       throw new ApiError(409, "Bunday post mavjud");
     }
     return Post.create(body);
   };
   ```
3. **Validator** - zod schema:
   ```js
   // validators/create.validator.js
   import { z } from "zod";
   export const createSchema = z.object({
     body: z.object({
       title: z.string().min(2),
       slug: z.string().min(2),
       content: z.string().min(1),
     }),
   });
   ```
4. **Handler** - one file per endpoint:
   ```js
   // handlers/create.handler.js
   import asyncHandler from "../../../middleware/asyncHandler.js";
   import * as service from "../services/posts.service.js";

   const create = asyncHandler(async (req, res) => {
     const data = await service.create(req.body);
     res.status(201).json({ success: true, data, message: "Post qo'shildi" });
   });

   export default create;
   ```
5. **Routes** - wire up the endpoints:
   ```js
   // posts.routes.js
   import { Router } from "express";
   import requireAuth from "../../middleware/auth.js";
   import requirePermission from "../../middleware/requirePermission.js";
   import validate from "../../middleware/validate.js";
   import list from "./handlers/list.handler.js";
   import create from "./handlers/create.handler.js";
   import { createSchema } from "./validators/create.validator.js";

   const router = Router();
   router.get("/", requireAuth, requirePermission("posts.read"), list);
   router.post("/", requireAuth, requirePermission("posts.create"), validate(createSchema), create);
   export default router;
   ```
6. **Mount it on the main router** - in `routes/index.js`:
   ```js
   import postsRouter from "../modules/posts/posts.routes.js";
   router.use("/posts", postsRouter);
   ```
7. **Permission seed** - add the new permission keys to the DB (`posts.read`, `posts.create`, ...).

## Rules

- **Handlers** contain NO business logic - they are just the req/res bridge. Logic lives in the `service`.
- The **service** works directly with the model and throws `ApiError` on errors.
- Every handler is wrapped with `asyncHandler` (no try/catch).
- Validation is done via the `validate(schema)` middleware, so the handler receives a clean body.
- Responses always have the shape `{ success, data, message?, meta? }`.

## Avoid

- Stuffing all CRUD into a single `posts.controller.js` file.
- Writing `try/catch` inside a handler (`asyncHandler` is in place).
- Skipping the service and using the model directly inside a handler.
- `res.status(500).json(...)` - let `errorHandler` do that; throw `ApiError` instead.
