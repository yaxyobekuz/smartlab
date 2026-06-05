---
name: create-frontend-feature
description: Used when adding a new feature to a role panel on the frontend (FSD-based).
---

# Creating a frontend feature (FSD + role-based)

## When to use
- When adding a new page/feature to a role panel (`owner/` by default, or a cloned one such as `admin/`, `manager/`).
- Or when adding a role-independent global feature (e.g. `features/auth/`).

## Location
- Role-specific: `client/src/<role>/features/<feature>/`
- Role-independent: `client/src/features/<feature>/`

> The template ships with only `client/src/owner/` as a role panel. To create another role panel, copy `owner/` to `<new-role>/` first (see `client/CLAUDE.md`).

## Standard folder structure

```
<feature>/
├─ api/<feature>.api.js           # pure axios functions
├─ hooks/
│  ├─ use<Feature>Query.js        # TanStack Query
│  └─ use<Feature>Mutation.js     # TanStack Mutation
├─ components/
│  ├─ <Feature>Card.jsx
│  ├─ <Feature>List.jsx
│  └─ modals/
│     ├─ <Feature>CreateModal.jsx
│     └─ <Feature>EditModal.jsx
├─ pages/
│  ├─ <Feature>ListPage.jsx
│  └─ <Feature>DetailPage.jsx
├─ store/                         # optional: redux slice
├─ utils/                         # feature-specific helpers
└─ index.js                       # public API
```

## Steps

1. **Create the folder** with the structure above.
2. **API**: `api/<feature>.api.js` - only axios calls.
   ```js
   import http from "@/shared/api/http";
   export const postsAPI = {
     list: (params) => http.get("/posts", { params }),
     getById: (id) => http.get(`/posts/${id}`),
     create: (body) => http.post("/posts", body),
     update: (id, body) => http.put(`/posts/${id}`, body),
     remove: (id) => http.delete(`/posts/${id}`),
   };
   ```
3. **Query keys**: add the key to `shared/lib/query/keys.js`:
   ```js
   posts: {
     all: () => ["posts"],
     list: (p) => ["posts", "list", p],
     one: (id) => ["posts", "detail", id],
   }
   ```
4. **Hook**: `hooks/usePostsQuery.js`:
   ```js
   import { useQuery } from "@tanstack/react-query";
   import { qk } from "@/shared/lib/query/keys";
   import { postsAPI } from "../api/posts.api";

   export const usePostsQuery = (params) =>
     useQuery({
       queryKey: qk.posts.list(params),
       queryFn: () => postsAPI.list(params).then((r) => r.data.data),
     });
   ```
5. **Page** - page component (UI text in Uzbek):
   ```jsx
   const PostsListPage = () => {
     const { data = [], isLoading } = usePostsQuery();
     return <div>...</div>;
   };
   ```
6. **Public API** - `index.js`:
   ```js
   export { default as PostsListPage } from "./pages/PostsListPage";
   export { usePostsQuery } from "./hooks/usePostsQuery";
   ```
7. **Wire up the route** - inside `<role>/routes/index.jsx`.
8. **Sidebar** - add an entry to `<role>/navigation/sidebar.config.js` (with a permission if needed).

## Rules

- A page does not call axios directly - only via a hook.
- Do not use `shadcn/*` components directly on a page - go through `shared/components/ui/*`.
- Modals are managed via `ModalWrapper` + the `MODAL` constant. (See the `add-modal` skill.)
- Export only what external code needs from the public API.
- Do not import internal files of another feature - only its `index.js`.

## Avoid

- The `useEffect + axios.get` pattern (TanStack Query is in place).
- Managing modal state inside a page with `useState` (Redux + ModalWrapper is the way).
- Leaving stray `console.log` calls.
- Importing shadcn elements directly (on a page).
