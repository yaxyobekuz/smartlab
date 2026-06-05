// Right-side AI assistant panel. Chat UI is a placeholder until the backend
// agent is wired up - input is disabled and marked "tez kunda".
import { Sparkles, Send } from "lucide-react";

const AiPanel = () => (
  <div className="flex h-full flex-col">
    <div className="flex items-center gap-2 border-b border-border px-4 py-3">
      <span className="grid size-7 place-items-center rounded-lg bg-primary/10 text-primary">
        <Sparkles size={16} />
      </span>
      <div className="flex-1">
        <p className="text-sm font-semibold">AI yordamchi</p>
        <p className="text-xs text-muted-foreground">Tez kunda</p>
      </div>
    </div>

    <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
      <Sparkles size={28} className="text-muted-foreground/50" />
      <p className="text-sm font-medium">Sun'iy intellekt yordamchisi</p>
      <p className="text-xs text-muted-foreground">
        Tez orada bu yerda model haqida savol berib, AI agentdan tushuntirish
        olishingiz mumkin bo'ladi.
      </p>
    </div>

    <div className="border-t border-border p-3">
      <div className="flex items-center gap-2 rounded-xl border border-border bg-secondary/50 px-3 py-2">
        <input
          disabled
          placeholder="AI dan so'rang..."
          className="h-auto flex-1 border-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
        />
        <button
          disabled
          aria-label="Yuborish"
          className="grid size-7 place-items-center rounded-lg bg-primary/20 text-primary/50"
        >
          <Send size={15} />
        </button>
      </div>
    </div>
  </div>
);

export default AiPanel;
