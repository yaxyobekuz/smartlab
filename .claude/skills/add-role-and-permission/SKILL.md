---
name: add-role-and-permission
description: Used when adding a new permission or linking a role to a permission (FE + BE).
---

# Adding a role and permission

## Concept

- **Role** - `owner` is the only static value in the code base (`ROLES.OWNER = "owner"`). All other roles live in the `Role` collection and are added at runtime by an admin from the UI.
- **Permission** - a record in the DB: `{ key: "posts.create", label: "Post yaratish", group: "posts" }`.
- Permissions are attached to a role via `Role.permissions: ObjectId[]`.
- **Owner** - by code-base rule, always TRUE (super-admin).

## Adding a new permission

### Backend
1. **Add the permission key to the registry** - `server/src/constants/permissions.js`:
   ```js
   export const PERMISSIONS = Object.freeze({
     // Posts
     POSTS_READ: "posts.read",
     POSTS_CREATE: "posts.create",
     POSTS_UPDATE: "posts.update",
     POSTS_DELETE: "posts.delete",
   });
   ```
2. **Seed the DB** - `server/src/seeds/permissions.seed.js` (or via a migration):
   ```js
   await Permission.updateOne(
     { key: "posts.create" },
     { $set: { label: "Post yaratish", group: "posts" } },
     { upsert: true }
   );
   ```
3. **Use it in a route**:
   ```js
   router.post("/", requireAuth, requirePermission("posts.create"), validate(...), create);
   ```

### Frontend
1. **Add it to the registry** - `client/src/shared/constants/permissions.js`:
   ```js
   export const PERMISSIONS = Object.freeze({
     POSTS_READ: "posts.read",
     POSTS_CREATE: "posts.create",
   });
   ```
2. **Hide/show in the UI** - via `usePermissions`:
   ```jsx
   const { has } = usePermissions();
   {has(PERMISSIONS.POSTS_CREATE) && <Button>Qo'shish</Button>}
   ```
3. **Protect a route** - `<PermissionGuard required="posts.create">`.
4. **Sidebar** - the `permission` field in `<role>/navigation/sidebar.config.js`:
   ```js
   { title: "Postlar", url: "/posts", permission: "posts.read" }
   ```

## Adding a new role (dynamic)

A new role lives entirely in the DB - no code-base enum change is required.

1. **Create the role record** - insert a row into the `Role` collection (via an admin UI or seed):
   ```js
   await Role.create({ value: "manager", label: "Menejer", permissions: [...permissionIds] });
   ```
2. **Frontend panel (optional)** - if this new role needs its own UI panel:
   - copy `client/src/owner/` to `client/src/<new-role>/` and rename references inside,
   - register the routes in `app/routes.jsx`,
   - register the sidebar in `shared/components/layout/AppSidebar.jsx` (`ROLE_SIDEBAR` map),
   - add the home path to `shared/constants/roles.js` (`ROLE_HOME`).
3. **`RoleGuard`** - wrap the role's routes with `<RoleGuard roles="manager">` if you want strict role-based access. Permission-based access (`PermissionGuard`) is independent of this.

## Verification

- Backend: does `GET /api/auth/me` return the correct `permissions: string[]`?
- Frontend: does `usePermissions().has(...)` work correctly?
- Owner: every permission resolves to `true`.
