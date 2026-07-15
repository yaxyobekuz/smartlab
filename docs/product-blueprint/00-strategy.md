# Smart Lab — Product Audit & Expansion Blueprint

> **Council synthesis:** Claude (Opus 4.8) + Gemini 3 Flash. ChatGPT/`codex` was unavailable this run (no OpenAI key/CLI), so this is a two-voice council. Gemini's contributions are attributed inline.

---

## 0. Reality check (read this first)

The brief describes Smart Lab as a **"Flutter Mobile App"** with a Quiz System, User Profiles, Progress Tracking, Categories and a History subject already implemented. **The actual codebase is a different — and in several ways more advanced — product.** This blueprint is written for what *actually exists*, so the estimates and hooks are real.

| Brief says | Codebase reality |
|---|---|
| Flutter mobile app | **React 19 + Vite + Three.js** web app (`smartlab-client`), public 3D laboratory |
| Auth / Profiles / Progress implemented | Server template has JWT auth/roles, but the **lab client is public** — no accounts-gated learning, no profiles in the lab yet |
| Quiz System implemented | **No quiz engine** in the lab client |
| Categories / Progress Tracking | Not present in the lab client |
| History subject | **Not present** (4 real subjects: chemistry, biology, physics, electronics) |
| "Lessons" + "3D Laboratory" | Real, and genuinely strong: **~17 working interactive experiences** across 4 subjects |

**What actually exists (verified in code):**

| Subject | Real, working experiences |
|---|---|
| **Chemistry** (`Kimyo`) | Periodic table (118 elements, 10k-line dataset, equation + molar-mass calculators), Molecule builder (3D), Atom builder (orbitals), **AI-driven 3D lab bench** (pour substances → Gemini computes the reaction) |
| **Biology** (`Biologiya`) | Cell explorer, Cell Studio (7 cell types + microscope + compare), DNA double-helix, **3D anatomy** (muscle/vascular/nerve/joint/organ systems, Z-Anatomy models), **Surgery** (peel layers / scalpel-cut to organs) |
| **Physics** (`Fizika`) | 3D solar system, Wave + pendulum simulator, Quantum coin-toss (PhET-style superposition/measurement) |
| **Electronics** (`Elektron mehanika`) | **Tinkercad-style 2D circuit builder** + an **offline JavaScript Arduino simulator** (write code, run live) |

This is a strong foundation. The gap is **not** more demos — it's the connective tissue that turns demos into *learning*: a reason to act (missions), a memory (persistence), a feedback loop (Socratic AI), and a reason to return (mastery-based progression).

---

## 1. The strategic thesis

> **Gemini (council):** *"You have the tools (simulators), but you lack the 'Why.' Building an Arduino circuit is a toy; building an Arduino circuit to prevent a 3D reactor core from overheating is a game."*

Smart Lab today is a **collection of excellent sandboxes**. Sandboxes have a known weakness (PhET's problem): **low retention** — students poke for 90 seconds and leave. Guided tutorials (Labster's model) fix retention but kill **replayability**. The winning move is the middle path:

**The single highest-leverage build is a `Quest Engine`** — a data-driven mission layer that gives every existing simulator a goal, a win-condition, and a payoff. Everything else in this blueprint (quizzes, gamification, AI tutor, progress) plugs into it.

The four load-bearing systems, in build order:

| # | System | One-liner | Why it's the spine |
|---|---|---|---|
| 1 | **Lab Notebook** (persistence) | Save/restore the state of any simulator (a circuit, a molecule, a dissection) | Nothing else matters if work evaporates on refresh. Prereq for everything. |
| 2 | **Quest Engine** (missions) | JSON-defined scenarios with win-conditions checked against live simulator state | Converts sandboxes → games. The "why." |
| 3 | **Socratic AI layer** | Reads the live 3D/sim state, gives *hints not answers* | Turns failure into learning. You already have the Gemini plumbing. |
| 4 | **Mastery progression** (gamification) | XP/streaks/achievements tied to *discovery and manipulation*, not logins | The reason to come back tomorrow. |

---

## 2. Task 7 — Learning Flow (the pedagogical engine)

The brief asks to replace `Read → Quiz` with `Discover → Watch → Explore → Interact → Experiment → Observe → Challenge → Quiz → Reflection → Reward → Revision`. That list is good but long; the research-backed backbone that makes it *work* is **O.P.V.S.** — a prediction-first loop (Gemini's framing, aligned with PhET/ICAP research):

> **Gemini (council):** *Observe → Predict → Verify → Synthesize. The UI pauses and the user MUST commit to a prediction before acting.* The "commit a bet" step is the single most important pedagogical mechanic — it converts passive watching into a stake.

**The Smart Lab lesson loop** (maps the brief's stages onto O.P.V.S.):

| Stage | O.P.V.S. phase | What happens | UI surface |
|---|---|---|---|
| **Discover / Watch** | Observe | A 3D scene is *already running* — a cell dividing, a circuit half-built, planets orbiting. No instructions, just a hook. | Autoplay scene + one-line provocation |
| **Explore** | Observe | Free rotate/zoom/poke. Curiosity before instruction. | Orbit controls, hotspots |
| **Predict** | **Predict** | Scene pauses. "If you double the voltage, the LED will: [brighter / burn out / no change]." User **must** commit. | Prediction modal (records the bet) |
| **Interact / Experiment** | Verify | User performs the action in the live sim. | The simulator itself |
| **Observe (result)** | Verify | Cascading visual + data reaction. See §3 principle. | Particle/shader feedback + data readout |
| **Reflection** | Synthesize | AI explains *why* the prediction was right/wrong, referencing the actual sim state. | Socratic AI panel |
| **Challenge** | (Quest) | A mission using the concept under a constraint/timer. | Quest Engine |
| **Quiz** | (Check) | 2–4 questions, ideally auto-generated from the lesson. | Quiz engine |
| **Reward** | — | XP + a discovery lights up on the Atlas. | Toast + Atlas |
| **Revision** | — | Spaced-repetition resurfaces weak concepts as micro-quests. | SRS scheduler |

**Rule:** a lesson is not "done" until the student has made at least one *prediction they got wrong* and understood why. Frictionless success teaches nothing.

---

## 3. What makes a demo *sticky* (design law)

> **Gemini (council) — the Variable Interdependency Principle:** *"A toy has isolated buttons. A sticky simulator has cascading consequences... If it doesn't 'break' when pushed to limits, it's not a real simulator."*

Codify this as a **demo acceptance checklist** — no demo ships without all five:

| # | Law | Concretely |
|---|---|---|
| 1 | **Every action has a consequence** | A control change triggers *both* a visual reaction (particles/shader/animation) *and* a readable data mutation. |
| 2 | **It can break** | Push a variable to the limit and something fails visibly (LED burns out, beaker cracks, cell lyses, orbit decays). Failure states are the best teachers. |
| 3 | **Numbers are always visible** | Live readouts (voltage, pH, °C, frequency, force). Qualitative + quantitative together. |
| 4 | **Reversible / scrubbable** | The student can rewind and retry instantly (see Time-Travel Scrubbing, §7). |
| 5 | **One aha per demo** | Each demo targets exactly one measurable "oh, THAT's why" moment. If you can't name it, cut the demo. |

---

## 4. Task 5 — AI Features (you already have the Gemini pipeline)

You already ship AI reactions in the chemistry bench, so the plumbing exists. Prioritize the three with real pedagogical value (Gemini's picks, which match the research), then layer the rest.

| AI feature | What it does | Pedagogical value | Priority | Complexity | Engagement |
|---|---|---|---|---|---|
| **Socratic Debugger** ⭐ | On a broken sim, gives a *hint not an answer*: "I see electrons stopping at the capacitor — what does that say about its charge?" | Very High | P0 | Med (reads sim state → Gemini) | Very High |
| **Natural-language Inspect** ⭐ | Click any 3D object → ask "why is this glowing / what is this?" → context-aware answer from the scene graph | Very High | P0 | Med | Very High |
| **Procedural Problem/Quest Generator** ⭐ | "Make a cell with broken mitochondria; ask the student to diagnose the symptoms." Feeds the Quest Engine infinite content | High | P1 | Med–High | High |
| **AI Quiz Generator** | Auto-builds 2–4 questions from a lesson's objectives + the student's actual mistakes | High | P1 | Med | High |
| **Flashcard Generator** | Turns keywords/objectives into an SRS deck | Med | P2 | Low | Med |
| **AI Tutor (chat)** | Persistent tutor with lesson context; scoped, not open-ended | High | P1 | Med | High |
| **Homework Helper** | Camera/text problem → guided steps (never just the answer) | Med | P2 | Med | High |
| **Camera Scanner / Image Recognition** | Point at a resistor / leaf / rock → identify + link to a demo | Med | P3 | High | High |
| **Voice Teacher** | TTS narration + voice Q&A for the Observe phase | Med | P3 | Med | Med |
| **"Explain Like I'm 10"** | One-tap re-explanation at a lower reading level | Med | P2 | Low | Med |
| **Exam Mode** | AI assembles a timed mixed-topic assessment from mastered skills | Med | P2 | Med | Med |

**Guardrail:** every AI feature must be *state-aware* (reads the live simulator) and *hint-biased* (Socratic, never spoon-feeds). An AI that gives answers trains dependence; an AI that asks the next question trains thinking.

---

## 5. Task 6 — Gamification (Proof of Mastery, not Duolingo fluff)

> **Gemini (council):** *"Avoid 'XP for logging in' — that's fluff. Science students value Status and Discovery. Leaderboards for 'number of quizzes finished' backfire — they encourage guessing, not learning."*

**Design principle:** reward *discovery and manipulation*, not *attendance*. Tie every currency to a learning act.

| Mechanic | Smart Lab instantiation | Tied to | Backfire risk if… |
|---|---|---|---|
| **XP** | Earned per prediction made (win or lose), demo completed, mission solved | Active manipulation time | …given for logins/video-watching |
| **Coins** | Spend on cosmetic lab skins, avatar gear, extra AI hints | Spending sink only | …buys correct answers |
| **Levels** | "Junior Chemist → Lead Researcher" per subject | Cumulative mastery | …purely time-based |
| **Achievements / Badges** | "Balanced 50 equations", "Diagnosed 10 cells", "Zero-error dissection" | Specific skills | …participation trophies |
| **Atlas of Discovery** ⭐ | A dark map of every reaction/quantum state/organ that **lights up** as you discover it | Discovery | (none — this is the star) |
| **Daily / Weekly / Monthly missions** | "Today: find a reaction that produces gas." Rotated by the Procedural Generator | Doing science | …busywork with no concept |
| **Research Streaks** | Consecutive days of *active experimentation* (not app-open) | Manipulation time | …streak-anxiety; make it forgiving (freeze tokens) |
| **Leaderboard** | Ranked by *unique discoveries* and *mission mastery*, never by quiz volume | Discovery/mastery | …ranked by speed/quantity → gaming |
| **Unlockables** | New reagents, rare 3D models, advanced tools gated behind mastery | Mastery | …behind paywall only |
| **Avatar** | A lab-coat character that visibly gears up as you level | Progression | (cosmetic — safe) |
| **Collections** | Collect elements, organelles, particles, historical artifacts | Discovery | (safe) |

**The Atlas of Discovery is the centerpiece** — it's Pokédex-for-science and directly answers "why come back": to fill in the dark map.

---

## 6. Task 8 — Database content structure

Your server is **MongoDB (Mongoose)** — schema below is Mongo-flavored. Content is currently a static registry (`lab/data/subjects.js`); the migration path is to move that registry into these collections so lessons/demos/quests are data, not code.

### `Lesson`
```jsonc
{
  "_id": "ObjectId",
  "slug": "acid-base-titration",          // english, URL-safe
  "subject": "chemistry",                  // ref Subject.slug
  "title": "Kislota va asos",              // UZBEK (user-facing)
  "subtitle": "pH va neytrallanish",       // UZBEK
  "description": "…",                       // UZBEK
  "difficulty": "intermediate",            // beginner|intermediate|advanced|expert
  "estimatedMinutes": 12,
  "learningObjectives": ["…", "…"],        // UZBEK, 2–5
  "keywords": ["pH", "titration", "neutralization"], // english
  "assets3d": [{ "id": "beaker", "url": "/models/beaker.glb", "kind": "procedural|glb" }],
  "requiredAnimations": ["pour", "colorShift", "gasEvolve"],
  "demoId": "ObjectId",                     // ref Demo (the playground)
  "quizId": "ObjectId",                     // ref Quiz
  "questIds": ["ObjectId"],                 // ref Quest[]
  "achievementIds": ["ObjectId"],           // ref Achievement[]
  "prerequisites": ["lesson-slug"],         // skill-graph edges
  "order": 3
}
```

### `Demo` (the interactive playground config)
```jsonc
{
  "_id": "ObjectId",
  "slug": "ph-simulation",
  "engine": "r3f|svg|canvas",              // which renderer
  "purpose": "…",
  "controls": [{ "id": "concentration", "type": "slider", "min": 0, "max": 14, "unit": "pH" }],
  "state": { "…live sim schema…" },
  "winConditionSchema": { "…hooks for Quest Engine…" },
  "aha": "Strong acid + strong base → neutral, exothermic"
}
```

### `Quest` (the missing "why" layer)
```jsonc
{
  "_id": "ObjectId",
  "slug": "cool-the-reactor",
  "title": "Reaktorni sovuting",           // UZBEK
  "scenario": "…",                          // UZBEK narrative
  "usesDemos": ["circuit-builder", "chem-bench"], // cross-domain!
  "winCondition": { "and": [                 // evaluated against live sim state
    { "path": "reactor.temp", "op": "<", "value": 50 },
    { "path": "circuit.complete", "op": "==", "value": true }
  ]},
  "hints": ["socratic-1", "socratic-2"],     // fed to Socratic AI
  "reward": { "xp": 120, "unlocks": ["coolant-reagent"], "atlas": ["endothermic-cooling"] },
  "difficulty": "advanced"
}
```

### `Quiz`, `Achievement`, `UserProgress`
```jsonc
// Quiz
{ "_id":"…","lessonId":"…","questions":[{ "q":"…","type":"mcq|numeric|hotspot","options":["…"],"answer":"…","explanation":"…" }] }
// Achievement
{ "_id":"…","key":"balanced-50-equations","title":"…","criteria":{ "metric":"equationsBalanced","gte":50 },"icon":"…","xp":200 }
// UserProgress (per user)
{ "userId":"…","lessonStates":{ "acid-base": { "status":"mastered","predictions":12,"lastSeen":"…" } },
  "xp":3400,"level":{ "chemistry":5 },"streak":{ "count":9,"freezes":2 },
  "atlas":["endothermic-cooling","…"],"notebook":[{ "demo":"circuit-builder","savedState":{…},"name":"my-blinker" }] }
```

**Every field the brief asked for is present** (title, subtitle, description, difficulty, estimated time, learning objectives, keywords, 3D assets, required animations, demoId, quizId, achievementId) — plus the Quest/Notebook/Atlas hooks that make them matter.

---

## 7. Killer features competitors don't have (build these to win)

> Gemini flagged all three; they're genuine differentiators because they exploit what a *unified web engine* can do that siloed tools can't.

| Feature | What it is | Why it's a moat | Complexity | Priority |
|---|---|---|---|---|
| **Cross-Domain Synthesis** ⭐ | A physics wave sim generates a frequency that *triggers* a chemistry reaction; a circuit's voltage drives heat in the bench | No competitor connects the silos — this is only possible because it's one engine. It's also the Quest Engine's superpower. | High | P1 |
| **Time-Travel Scrubbing** ⭐ | A timeline slider (GSAP/keyframed sim state) rewinds a 3D explosion / cell division / circuit failure to see *exactly where* it went wrong | Debugging-by-rewind is how experts actually learn; nobody offers it | Med–High | P1 |
| **Pair Research (co-op lab)** | Two students in the same live lab bench (WebSockets / Yjs CRDT) | Tinkercad has co-CAD; nobody has co-*experiment* | High | P2 |

---

## 8. Task 10 — Premium / future features

| Feature | Value prop | Segment | Complexity | Priority | Engagement |
|---|---|---|---|---|---|
| **Teacher Dashboard** | Assign quests, see class mastery heatmap, spot misconceptions | B2B schools | Med | P1 (first monetization) | High |
| **Homework Assignment** | Push a quest/quiz to a class with due dates | Teachers | Med | P1 | High |
| **School Dashboard** | Multi-class admin, licensing, rostering (Google Classroom sync) | B2B | High | P2 | Med |
| **Offline Labs** | PWA + cached procedural sims (no server needed) | Low-connectivity (fits UZ market) | Med | P2 | High |
| **Live Classroom** | Teacher drives a sim, students follow in real time | Teachers | High | P3 | High |
| **Collaborative Experiments** | Pair Research productized (see §7) | All | High | P2 | Very High |
| **AR Mode** | WebXR: place a molecule/heart on your desk | Consumer wow | High | P3 | High |
| **VR Laboratory** | WebXR immersive bench | Premium | Very High | P3 | Med |
| **Cloud Laboratory** | Heavy sims (CFD, molecular dynamics) run server-side, streamed | Advanced | Very High | P4 | Med |
| **Remote Arduino / Remote Robot** | Drive *real* hardware over the web from the sim UI | Wow / labs | Very High | P4 | Very High |

**Monetization order:** Teacher Dashboard + Homework (B2B recurring) → School licensing → consumer premium (AR/offline). Avoid VR/remote-hardware until the core loop retains.

---

## 9. Traps to avoid (Gemini, endorsed)

| Trap | Why it kills you | Do instead |
|---|---|---|
| **The Video Trap** | If a student watches YouTube, they're not touching your engine — you lose your only advantage | Micro-animations *inside* the sim, never embedded lectures |
| **The LMS / Standardized-Test Trap** | Khan Academy owns generic courseware; you can't out-LMS them | Own the *interactive experiment*. Quizzes serve the sim, not vice-versa |
| **The Heavy-Asset Trap** | A 100MB `.glb` that loads in 30s = student gone | **Procedural Three.js geometry + shaders first**; GLBs only where anatomy demands it; lazy-load, compress (Draco/meshopt) |
| **Feature-sprawl before retention** | 11 subjects with no reason to return = churn at scale | Nail the loop (Notebook→Quest→AI→Mastery) on 4 subjects, *then* expand |
| **Gamification cargo-culting** | XP-for-login trains attendance, not learning | Reward discovery/manipulation only (§5) |

---

## 10. The 90-day sequence (small team)

> Gemini's sequence, refined to your codebase:

| Window | Ship | Detail |
|---|---|---|
| **Days 1–30** | **Persistence & Profiles + Lab Notebook** | Wire the lab client to the existing JWT auth; add `UserProgress`; let any sim serialize/restore its state. Nothing else works without this. |
| **Days 31–60** | **Quest Engine + first 5 missions** | JSON win-condition evaluator reading live sim state; author 5 flagship quests (1 per subject + 1 cross-domain). Add the **Atlas of Discovery** shell. |
| **Days 61–90** | **Socratic AI layer + Quiz + XP/Streaks** | Reuse the Gemini pipeline to read sim state → hints. AI Quiz Generator. Turn on XP, streaks, achievements. |
| **Day 90+** | **O.P.V.S. retrofit + first new subject** | Add the Predict-gate to existing demos; ship **Astronomy** or **Mathematics** (highest reuse of existing physics/3D code). |

---

*The grounded feature audit (Task 1) is in [`01-audit.md`](./01-audit.md). Per-subject deep-dives (Feature Tree · Demo Playground · 3D Experiences · Roadmap · Feature Economics) are in the numbered sibling files `02`–`12`, one per subject. Start from [`README.md`](./README.md).*
