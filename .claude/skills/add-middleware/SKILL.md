---
name: add-middleware
description: Used when creating a new middleware on the backend.
---

# Adding a backend middleware

## Location
`server/src/middleware/<name>.js` - one middleware per file.

## Example

```js
// middleware/requireRole.js
import ApiError from "../utils/ApiError.js";

const requireRole = (...roles) => (req, _res, next) => {
  if (!req.user) return next(new ApiError(401, "Avtorizatsiyadan o'tilmagan"));
  if (!roles.includes(req.user.role)) {
    return next(new ApiError(403, "Ruxsat etilmagan"));
  }
  next();
};

export default requireRole;
```

## Async middleware

Use `asyncHandler` for middleware too:

```js
import asyncHandler from "./asyncHandler.js";

const requireAuth = asyncHandler(async (req, _res, next) => {
  // ... JWT verify
  req.user = await User.findById(payload.userId);
  next();
});
```

## Order on a route

```js
router.post(
  "/",
  requireAuth,                        // 1. JWT verify -> req.user
  requireRole("owner"),               // 2. role check (use a role value as a string)
  requirePermission("posts.create"),  // 3. permission check
  validate(createSchema),             // 4. body schema
  create,                              // 5. handler
);
```

## Rules

- Each middleware is responsible for **one task** (auth, role, permission, validate, rateLimit).
- Throw via `next(new ApiError(...))`. Never call `res.status(...).json(...)` directly.
- Attach data to `req` (`req.user`, `req.permissions`); the next handler reads it from there.
- For async work - wrap with `asyncHandler` or use `try/catch -> next(err)`.

## Avoid

- Putting business logic inside a middleware.
- Leaving `console.log` calls (use the logger - `config/logger.js`).
- Calling `res.send` (on errors call `next(error)`).
