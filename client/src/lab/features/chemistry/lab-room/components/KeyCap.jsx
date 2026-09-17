const KeyCap = ({ children }) => (
  <kbd className="inline-flex h-7 min-w-7 items-center justify-center rounded-md border border-white/20 border-b-white/35 bg-white/10 px-2 font-sans text-xs font-semibold text-white shadow-[inset_0_-2px_0_rgba(0,0,0,0.35)]">
    {children}
  </kbd>
);

export default KeyCap;
