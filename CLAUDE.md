# Template - Client + Server starter

A clean, role-ready monorepo template: **React (Vite) + Express + MongoDB**. Clone, rename, then build your own admin/owner panel on top of it.

## Project structure (monorepo)

```
template/
├─ client/          # Frontend: Vite + React 19 + Redux Toolkit + TanStack Query + shadcn/ui
├─ server/          # Backend: Node.js + Express + MongoDB (Mongoose) + Agenda
├─ CLAUDE.md        # General rules (this file)
└─ .claude/
   └─ skills/       # Local skills for Claude (Code)
```

- Frontend and backend rules are separate: `client/CLAUDE.md`, `server/CLAUDE.md`.
- Skills: `.claude/skills/<skill-id>/SKILL.md`.

## Core rules (strict)

1. **Language:** all user-facing text - **in Uzbek**. Code values (id, role value, query key, route, file name) - **in English**.
2. **Comments:** comments in code - a single very short line, only when WHY is not obvious. Never write multi-line docstrings.
3. **shadcn**: `client/src/shared/components/shadcn/*` is wrapped only inside `shared/`; pages/features do not use it directly.
4. **Modal**: only via `ModalWrapper`; the modal name comes from a constant in `shared/constants/modals.js`.
5. **API**: via TanStack Query. A page never calls `axios` directly - every feature works through `api/*.api.js` + `hooks/use*`.
6. **Role system**: 1 static role (`owner`) + dynamic roles in the DB + dynamic permissions.
7. **Owner - super-admin**: automatically has all permissions.
8. **Auth**: JWT access (15min, body) + refresh (7 days, httpOnly secure cookie). Refresh token is never stored in localStorage.

## Role/permission concept

- `owner` is the only hard-coded static role (`ROLES.OWNER = "owner"`).
- Other roles live in the `Role` collection - they can be added/removed by an admin at runtime.
- `permission` - DB record, `{ key: "users.read", label: "Foydalanuvchilarni ko'rish" }`.
- Permissions are attached to a role (`Role.permissions: ObjectId[]`).
- Backend protection: `requireAuth` -> `requireRole(...)` or `requirePermission("users.read")`.
- Frontend protection: `<RoleGuard roles="owner">` and `<PermissionGuard required="users.read">`.

## What's included (template scaffold)

- **Auth**: login (username/phone + password), refresh-token rotation, logout, `/auth/me`.
- **Users**: list, get-by-id, update, soft-delete (owner-only edits).
- **Roles + Permissions**: 1 static `owner` role + DB-driven roles/permissions, seedable via `npm run seed:permissions`.
- **Activity logs**: every POST/PATCH/PUT/DELETE is auto-logged with sanitized body.
- **Owner panel** (`client/src/owner/`): layout + sidebar + an empty `DashboardPage`. Add features under `owner/features/`.
- **Adding more panels**: copy `client/src/owner/` to `client/src/<new-role>/`, change the route paths, then register the new role's sidebar in `shared/components/layout/AppSidebar.jsx`.

## Skills (`.claude/skills/`)

| ID | When to use |
|---|---|
| `create-frontend-feature` | When adding a new feature to a role panel (owner or a cloned one) |
| `create-backend-module` | When adding a new module under `server/src/modules/<name>/` |
| `add-modal` | When creating a new modal with ModalWrapper |
| `tanstack-query-for-api` | When writing a new query/mutation hook |
| `add-role-and-permission` | When adding a new permission, a new dynamic role, or linking them |
| `add-middleware` | When writing a new middleware on the backend |
| `manage-state-with-useobjectstate` | When a FE component has more than 1 state |
| `uz-translation-rules` | When UI text vs code value separation is needed |
| `use-shared-components` | When building any client page/feature - pages must import from `shared/components/ui/*`, never from `shadcn/*` |

Each skill is described in detail in its `.claude/skills/<id>/SKILL.md` file.

## Initial workflow

1. `cd server && cp .env.example .env && npm install && npm run seed:permissions && npm run seed:owner && npm run dev` - backend on port 5000.
2. `cd client && cp .env.example .env && npm install && npm run dev` - frontend on port 5173.
3. Default owner login (from `seed:owner`): `owner` / `owner123`.
4. Log in on the frontend → automatically redirected to `/owner/dashboard`.
