---
name: manage-state-with-useobjectstate
description: Rules for using useObjectState instead of useState when a component holds more than one related state value.
---

# State management with `useObjectState`

## Rule

When a component stores **several related values** in state, instead of multiplying `useState` calls, use a **single `useObjectState`**. This rule applies across the entire frontend (shared, features, pages).

```js
// ❌ Don't
const [phone, setPhone] = useState("");
const [name, setName] = useState("");
const [subject, setSubject] = useState("");

// ✅ Do
const { phone, name, subject, setField } = useObjectState({
  phone: "",
  name: "",
  subject: "",
});
```

## API

`useObjectState(initial)` returns:

| Field | Description |
|---|---|
| `...state` | every key spread directly: `const { phone } = useObjectState({ phone: "" })` |
| `state` | the whole object (when needed) |
| `setField(key, value)` | update a single key |
| `setFields({ a, b })` | update several keys atomically |
| `resetState()` | reset to the initial value |

## Typical patterns

### Form inputs
```jsx
const { login, password, setField } = useObjectState({ login: "", password: "" });

<Input value={login} onChange={(e) => setField("login", e.target.value)} />
<Input value={password} onChange={(e) => setField("password", e.target.value)} />
```

The most convenient form is a single name/value-based handler:
```js
const handleChange = (e) => setField(e.target.name, e.target.value);
```

### Toggle / boolean
```jsx
const { isOpen, isLoading, setField } = useObjectState({ isOpen: false, isLoading: false });
setField("isOpen", true);
setFields({ isOpen: false, isLoading: false });
```

### Coupled filters (page+search)
```jsx
const { page, search, setFields } = useObjectState({ page: 1, search: "" });
const onSearch = (s) => setFields({ search: s, page: 1 }); // also reset the page together
```

### Reset
```jsx
const handleClose = () => { resetState(); close(); };
```

## When `useState` is allowed (exceptions)

`useState` is allowed only in the following cases - never elsewhere:

1. **A single primitive** state with nothing else: `const [open, setOpen] = useState(false)`. As soon as another state is needed, switch to `useObjectState`.
2. **Inside another hook**: in a custom hook implementation (`useObjectState` itself uses `useState`). `useObjectState` cannot be used inside `useObjectState`.
3. **Lazy init for an object** is needed: `useState(() => heavyCompute())`. If the result is an object, `useObjectState(() => ...)` is also unavailable, so this is a rare case.

> Note: even when "I'll add more soon" - start with `useObjectState` from day one. It is the last barrier before you reach for Redux.

## With TanStack Query / form libraries

- Do not store what `useQuery({ data, isLoading, ... })` returns. Use it directly.
- If you use a form library like React Hook Form or Formik - its state replaces this; `useObjectState` is unnecessary.
- This is for **local UI state only** (inputs, toggles, wizard steps, filters).

## With ModalWrapper

`ModalWrapper` injects `isLoading` and `setIsLoading` props into the body component - use those instead of adding another `useState` inside the modal. For other state values, use `useObjectState`.

## Review checklist

- [ ] Are there more than one `useState` call in the component? → migrate to `useObjectState`.
- [ ] Do related values need to be updated atomically? → `setFields`.
- [ ] Is there a resettable form? → `resetState`.
- [ ] Are state names clear? → the keys of the initial `initial` object are the single source of truth.

## Avoid

- More than 2 `useState` calls in one component (outside the 3 exceptions above).
- A separate `useState` for a boolean that you then mix with the object - keep everything in a single `useObjectState`.
- Calling `setField` 3 times in a row instead of `setFields` - it is not atomic and triggers extra renders.
