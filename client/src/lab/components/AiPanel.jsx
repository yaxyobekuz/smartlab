// Real-time AI yordamchi paneli. Backenddagi /ai/chat SSE oqimi orqali ishlaydi.
// Agent matn javob beradi, 3D sahnani boshqaradi, mavzuga o'tkazadi va kvizz tuzadi.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Send, Square, RotateCcw, Compass, MousePointerClick } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import robotHead from "@/shared/assets/icons/robot-head.svg";
import { useSceneControl } from "./sceneControl";
import { useAiChat } from "./useAiChat";

// Agentning tool chaqiruvini foydalanuvchiga tushunarli matnga aylantiradi.
const ACTION_LABEL = {
  control_scene: {
    zoom_in: "Yaqinlashtirdim 🔍",
    zoom_out: "Uzoqlashtirdim 🔭",
    reset: "Kamerani tikladim 🎥",
    pause: "Aylanishni to'xtatdim ⏸️",
    resume: "Aylanishni davom ettirdim ▶️",
  },
  navigate_topic: "Yangi mavzuga olib o'tdim 🚀",
  select_item: "Modelni tanladim ✨",
};

const actionText = (action) => {
  if (action.name === "control_scene")
    return ACTION_LABEL.control_scene[action.args?.action] || "Sahnani boshqardim";
  return ACTION_LABEL[action.name] || "Bajardim";
};

const TypingDots = () => (
  <span className="inline-flex gap-1 py-1">
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        className="size-1.5 animate-bounce rounded-full bg-current"
        style={{ animationDelay: `${i * 0.15}s` }}
      />
    ))}
  </span>
);

// Bitta test savoli - foydalanuvchi javob bersa, darhol to'g'ri/xato ko'rsatadi.
const QuizCard = ({ quiz }) => {
  const [picked, setPicked] = useState(null);
  const answered = picked !== null;
  return (
    <div className="mt-2 rounded-xl border border-primary/30 bg-primary/5 p-3">
      <p className="mb-2 text-sm font-medium">{quiz.question}</p>
      <div className="flex flex-col gap-1.5">
        {quiz.options.map((opt, i) => {
          const isCorrect = i === quiz.correctIndex;
          const isPicked = i === picked;
          return (
            <button
              key={i}
              disabled={answered}
              onClick={() => setPicked(i)}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-left text-sm transition-colors",
                !answered && "border-border bg-background hover:bg-secondary",
                answered && isCorrect && "border-emerald-300 bg-emerald-50 text-emerald-700",
                answered && isPicked && !isCorrect && "border-red-300 bg-red-50 text-red-700",
                answered && !isCorrect && !isPicked && "border-border opacity-60",
              )}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {answered && (
        <p className="mt-2 text-xs font-medium">
          {picked === quiz.correctIndex ? "Barakalla, to'g'ri! 🎉" : "Yana urinib ko'ring 💪"}
        </p>
      )}
    </div>
  );
};

const Bubble = ({ msg }) => {
  const isUser = msg.role === "user";
  return (
    <div className={cn("flex gap-2", isUser && "flex-row-reverse")}>
      {!isUser && (
        <img src={robotHead} alt="" className="size-7 shrink-0 rounded-lg bg-primary/10 p-1" />
      )}
      <div className={cn("min-w-0 max-w-[85%]", isUser && "flex flex-col items-end")}>
        {(msg.content || msg.pending) && (
          <div
            className={cn(
              "whitespace-pre-wrap break-words rounded-2xl px-3 py-2 text-sm",
              isUser
                ? "rounded-br-sm bg-primary text-primary-foreground"
                : "rounded-bl-sm bg-secondary text-foreground",
              msg.error && "bg-red-50 text-red-700",
            )}
          >
            {msg.pending && !msg.content ? <TypingDots /> : msg.content}
          </div>
        )}
        {msg.action?.ok && (
          <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-600">
            {actionText(msg.action)}
          </div>
        )}
        {msg.quiz && <QuizCard quiz={msg.quiz} />}
      </div>
    </div>
  );
};

const SUGGESTIONS = [
  { icon: Compass, label: "Bu nima?", text: "Hozir ko'rib turganim nima? Qisqacha tushuntir." },
  { icon: MousePointerClick, label: "Meni sina", text: "Joriy mavzu bo'yicha menga bitta test savoli ber." },
];

const AiPanel = () => {
  const { aiContext, runAiAction, recentActions } = useSceneControl();
  const [draft, setDraft] = useState("");
  const scrollRef = useRef(null);

  // Eng so'nggi kontekst va harakat jurnalini ref'da saqlaymiz - shunda
  // buildContext barqaror bo'ladi, lekin yuborilganda eng yangi qiymatni oladi.
  const liveRef = useRef({ aiContext, recentActions });
  useEffect(() => {
    liveRef.current = { aiContext, recentActions };
  }, [aiContext, recentActions]);

  // Har so'rovda agentga joriy kontekst + foydalanuvchi harakatlarini beramiz.
  const buildContext = useCallback(() => {
    const { aiContext: ctx, recentActions: ra } = liveRef.current;
    return { ...ctx, recentActions: [...(ra?.current || [])] };
  }, []);

  const { messages, streaming, send, stop, reset } = useAiChat({
    buildContext,
    onAction: runAiAction,
  });

  // Yangi xabar kelganda pastga aylantiramiz.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const submit = (e) => {
    e?.preventDefault();
    if (!draft.trim() || streaming) return;
    send(draft);
    setDraft("");
  };

  // Welcome'dan keyin hali yozishmagan bo'lsa - tezkor takliflarni ko'rsatamiz.
  const showSuggestions = useMemo(
    () => messages.filter((m) => m.role === "user").length === 0,
    [messages],
  );

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <img src={robotHead} alt="" className="size-8 rounded-lg bg-primary/10 p-1.5" />
        <div className="flex-1">
          <p className="text-sm font-semibold">Aqlbek - AI yordamchi</p>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <span className="size-1.5 rounded-full bg-emerald-500" /> Onlayn
          </p>
        </div>
        <button
          onClick={reset}
          title="Suhbatni tozalash"
          className="grid size-7 place-items-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          <RotateCcw size={15} />
        </button>
      </div>

      <div ref={scrollRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((m, i) => (
          <Bubble key={i} msg={m} />
        ))}

        {showSuggestions && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {SUGGESTIONS.map((s) => (
              <button
                key={s.label}
                onClick={() => send(s.text)}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs text-foreground transition-colors hover:bg-secondary"
              >
                <s.icon size={13} /> {s.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={submit} className="border-t border-border p-3">
        <div className="flex items-end gap-2 rounded-xl border border-border bg-secondary/50 px-3 py-2 focus-within:border-primary">
          <textarea
            rows={1}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) submit(e);
            }}
            placeholder="AI dan so'rang..."
            className="max-h-24 flex-1 resize-none border-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          {streaming ? (
            <button
              type="button"
              onClick={stop}
              aria-label="To'xtatish"
              className="grid size-7 shrink-0 place-items-center rounded-lg bg-red-500 text-white"
            >
              <Square size={13} />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!draft.trim()}
              aria-label="Yuborish"
              className="grid size-7 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground disabled:opacity-40"
            >
              <Send size={15} />
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default AiPanel;
