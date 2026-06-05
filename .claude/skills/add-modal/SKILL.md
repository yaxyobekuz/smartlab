---
name: add-modal
description: Used when creating a new modal with ModalWrapper (opened by the name stored in Redux).
---

# Adding a modal (ModalWrapper)

## Rules

- Modals are managed in the **Redux store** (`modal.slice.js`).
- Each modal has a **unique string name** - declared as a constant inside `shared/constants/modals.js`.
- `ModalWrapper` wraps each modal component and injects the required props (`isLoading`, `setIsLoading`, `close`, `data`).

## Steps

1. **Add the modal name** - in `client/src/shared/constants/modals.js`:
   ```js
   export const MODAL = Object.freeze({
     POST_CREATE: "post:create",
     POST_DELETE: "post:delete",
     // ...
   });
   ```
2. **Create the modal body component** - `<feature>/components/modals/PostCreateModal.jsx`:
   ```jsx
   const PostCreateModal = ({ close, isLoading, setIsLoading, ...data }) => {
     const handleSubmit = async (form) => {
       setIsLoading(true);
       try {
         // mutation call
         close({ success: true });
       } finally {
         setIsLoading(false);
       }
     };
     return <form>...</form>;
   };
   export default PostCreateModal;
   ```
3. **Wire it on the page** - `<feature>/pages/PostsListPage.jsx`:
   ```jsx
   import ModalWrapper from "@/shared/components/ui/ModalWrapper";
   import { MODAL } from "@/shared/constants/modals";
   import PostCreateModal from "../components/modals/PostCreateModal";

   const PostsListPage = () => (
     <>
       {/* page content */}
       <ModalWrapper name={MODAL.POST_CREATE} title="Post qo'shish">
         <PostCreateModal />
       </ModalWrapper>
     </>
   );
   ```
4. **Open the modal** - from any button:
   ```jsx
   const { openModal } = useModal();
   <Button onClick={() => openModal(MODAL.POST_CREATE, { initialData })}>
     Qo'shish
   </Button>
   ```

## Props injected by ModalWrapper

| Prop | Description |
|---|---|
| `close(data?)` | Closes the modal, optionally passing data back |
| `isLoading` | Blocks closing and backdrop click |
| `setIsLoading(bool)` | Controls the loading state |
| `...data` | The data passed to `openModal(name, data)` |

## Avoid

- Managing the modal via `useState` on the page.
- Using `<Dialog>` or `<Drawer>` directly - always go through `ModalWrapper`.
- Writing the modal name as a hard-coded string - always use the `MODAL.X` constant.
- Re-rendering the same modal component on every page (`ModalWrapper` lives only on the page that needs that modal).
