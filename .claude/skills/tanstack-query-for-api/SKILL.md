---
name: tanstack-query-for-api
description: Used when writing a TanStack Query hook (useQuery/useMutation) for a new API.
---

# TanStack Query rules

## Layers

```
api/<name>.api.js          # pure axios calls (return Promise)
hooks/use<Name>Query.js    # useQuery wrapper
hooks/use<Name>Mutation.js # useMutation wrapper
```

A page **always** goes through a hook; it never uses axios directly.

## Query Keys

`shared/lib/query/keys.js` — central registry:

```js
export const qk = {
  auth: {
    me: () => ["auth", "me"],
  },
  posts: {
    all: () => ["posts"],
    list: (params) => ["posts", "list", params],
    one: (id) => ["posts", "detail", id],
  },
};
```

When a new feature is added, append an entry to this registry.

## Query example

```js
// hooks/usePostsQuery.js
import { useQuery } from "@tanstack/react-query";
import { qk } from "@/shared/lib/query/keys";
import { postsAPI } from "../api/posts.api";

export const usePostsQuery = (params) =>
  useQuery({
    queryKey: qk.posts.list(params),
    queryFn: () => postsAPI.list(params).then((r) => r.data.data),
  });
```

## Mutation example

```js
// hooks/usePostCreate.js
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { qk } from "@/shared/lib/query/keys";
import { postsAPI } from "../api/posts.api";

export const usePostCreate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body) => postsAPI.create(body).then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.posts.all() });
      toast.success("Post qo'shildi");
    },
    onError: (e) => toast.error(e?.response?.data?.message || "Xatolik yuz berdi"),
  });
};
```

## Default settings (`app/query-client.js`)

- `staleTime: 5min`, `gcTime: 15min`.
- `retry: 1`, mutation `retry: false`.
- `refetchOnWindowFocus: false`, `refetchOnReconnect: true`.

These can be overridden at the feature level (per-query options).

## Rules

- The server response is `{ success, data, ... }`, so the hook returns `r.data.data`.
- For cache invalidation — always use the highest-level key (`qk.posts.all()`) so all queries in the group are refreshed.
- On a successful mutation — show a `toast` with UI text in Uzbek.
- Do not use the `useEffect`-with-fetch pattern inside `useQuery`.

## Avoid

- Calling `axios.get` outside of a hook (on a page).
- Ad-hoc query keys (`["posts-list"]`) — always go through `qk`.
- `enabled: undefined` — for a conditional query, write an explicit `enabled: Boolean(...)`.
