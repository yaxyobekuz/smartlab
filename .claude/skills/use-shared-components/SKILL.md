---
name: use-shared-components
description: Used when building any page/feature in the client panel - pages and features must consume only shared/components/ui (and guards/layout); shadcn primitives stay encapsulated inside shared and must never be imported from feature/page code.
---

# Using shared components in the client panel

This skill defines where pages and features in `client/` may - and **may not** - pull UI components from. Core idea: **shadcn is an internal "primitive" layer**; it is enriched only inside `shared/` and exposed to the outside world via `shared/components/ui/*` (and `guards/`, `layout/`).

## Core rules (strict)

1. A page or feature **must never** import from `@/shared/components/shadcn/*`.
2. Every UI element a page needs comes from `@/shared/components/ui/*` (or `guards/`, `layout/` if applicable).
3. If `shared/components/ui/` does not yet have the wrapper you need - create the wrapper inside `shared/` first, then use it on the page. Reaching directly for a shadcn primitive "just this once" violates the rule.
4. Editing a `shadcn/*` file is reserved for changes to the official primitive behavior (default variants, default classes). Project-specific logic (permission, redux, mask, locale, etc.) **never** goes inside `shadcn/` - it belongs in the `ui/` wrapper.

## Why this rule?

- shadcn is an external layer that can be upgraded or swapped later. If every page imports it directly, each upgrade touches hundreds of files.
- The wrapper layer (`ui/`) lets us add global behavior in one place: input phone masks, modal open/close via Redux, and so on.
- Page code stays readable: it shows **business logic only**, not low-level shadcn variants or `cn()` calls.

## Available shared components (quick map)

Layers inside `@/shared/components/`:

| Layer | Path | Examples | Importable from pages |
|---|---|---|---|
| **ui** | `shared/components/ui/*` | `Button`, `Card`, `Badge`, `Field`, `Input` (and `InputField`/`InputPwd`/`InputTel`/`InputOtp`/`InputGroup`), `Select`/`SelectField`/`SelectSearch`/`SelectAllUsers`, `List`, `Pagination`, `Tabs`/`TabsButtons`/`TabsLinks`, `Tooltip`, `Switch`, `StepBars`, `BottomNavbar`, `AnimatedCounter`, `ModalWrapper` | ✅ yes |
| **guards** | `shared/components/guards/*` | `AuthGuard`, `GuestGuard`, `RoleGuard`, `PermissionGuard` | ✅ yes (route/section protection) |
| **layout** | `shared/components/layout/*` | `AppHeader`, `AppSidebar`, `BackHeader`, `BugReport` | ✅ yes (mostly in layout files) |
| **bg** | `shared/components/bg/*` | `MainBackgroundPatterns` | ✅ yes |
| **shadcn** | `shared/components/shadcn/*` | `button`, `dialog`, `dropdown-menu`, `select`, `sidebar`, `sonner`, ... | ❌ **NO** - only inside `ui/` |

## Correct vs incorrect imports

```jsx
// ❌ wrong - page uses shadcn directly
import { Button } from "@/shared/components/shadcn/button";
import { Dialog } from "@/shared/components/shadcn/dialog";

// ✅ correct - page goes through shared/ui
import Button from "@/shared/components/ui/button/Button";
import ModalWrapper from "@/shared/components/ui/modal/ModalWrapper";
```

The `@/components/*` alias is equivalent to `@/shared/components/*` - match whichever style the existing code in the project uses.

## When a new UI element is needed - the right route

Say a page needs `Accordion`, but `shared/components/ui/` does not have it yet. Steps:

1. **Check the shadcn primitive** - `shared/components/shadcn/accordion.jsx`. If missing, install it via the shadcn CLI (it lands inside `shadcn/`).
2. **Create the wrapper** - `shared/components/ui/accordion/Accordion.jsx`:
   ```jsx
   import { Accordion as AccordionRoot, AccordionItem, AccordionTrigger, AccordionContent }
     from "@/shared/components/shadcn/accordion";

   const Accordion = ({ items = [], ...props }) => (
     <AccordionRoot type="single" collapsible {...props}>
       {items.map((it) => (
         <AccordionItem key={it.id} value={it.id}>
           <AccordionTrigger>{it.title}</AccordionTrigger>
           <AccordionContent>{it.content}</AccordionContent>
         </AccordionItem>
       ))}
     </AccordionRoot>
   );

   export default Accordion;
   ```
3. **Import the wrapper from the page**:
   ```jsx
   import Accordion from "@/shared/components/ui/accordion/Accordion";
   ```

The wrapper layer is where icons, default styles, internal state, `useTranslation` calls, and so on live - they stay inside this file so the page remains clean.

## Modals - a special case

A modal is **never** written directly via `shadcn/dialog` or `shadcn/drawer`. Everything goes through `ModalWrapper`:

```jsx
import ModalWrapper from "@/shared/components/ui/modal/ModalWrapper";
import { MODAL } from "@/shared/constants/modals";
import PostCreateModal from "../components/modals/PostCreateModal";

<ModalWrapper name={MODAL.POST_CREATE} title="Post qo'shish">
  <PostCreateModal />
</ModalWrapper>
```

Details - `.claude/skills/add-modal/SKILL.md`.

## Buttons - a special case

A page uses `shared/components/ui/button/Button`, not `shared/components/shadcn/button`. The wrapper leaves room for future global behavior (style presets, disabled handling, etc.) - bypassing it loses that consistency.

```jsx
import Button from "@/shared/components/ui/button/Button";

<Button onClick={handleSave}>Saqlash</Button>
```

## Input/Select family

`Input` and `Select` come in several flavors - pick the right one:

| Purpose | Component |
|---|---|
| Plain text input | `Input` |
| Full field with label + error + hint | `InputField` |
| Password (with show/hide) | `InputPwd` |
| Phone number (with mask) | `InputTel` |
| OTP code | `InputOtp` |
| Grouped input (prefix/suffix) | `InputGroup` |
| Plain select | `Select` |
| Select-field with label + error | `SelectField` |
| Searchable select | `SelectSearch` |
| User picker | `SelectAllUsers` |

If you need something from underneath `shadcn/select`, build a new wrapper - never surface shadcn directly on a page.

## Guards - at the page level

To protect a page or an entire route:

```jsx
import RoleGuard from "@/shared/components/guards/RoleGuard";
import PermissionGuard from "@/shared/components/guards/PermissionGuard";

<RoleGuard roles="owner">
  <PermissionGuard required="posts.create">
    <PostsCreatePage />
  </PermissionGuard>
</RoleGuard>
```

## Quick checklist (before opening a PR)

- [ ] No feature/page file imports `from "@/shared/components/shadcn/..."`.
- [ ] Any new UI element lives in `shared/components/ui/<name>/<Name>.jsx`.
- [ ] `Button` comes from the wrapper, `Modal` goes through `ModalWrapper`, and the right input variant is used.
- [ ] UI text is Uzbek; code values (`role`, query key, modal name, route) are English.

## When may I edit the shadcn file itself?

Only when the **official primitive behavior** changes (default variants, default classes). Project-specific logic (redux, permission, mask, locale) **never** belongs inside `shadcn/` - its home is the `ui/` wrapper.
