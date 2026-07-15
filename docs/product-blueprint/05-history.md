# History

## Snapshot
Currently **nothing exists** — History is a brand-new subject (🆕) not yet in `subjects.js`. Proposed registry entry: `slug: "history"`, `title: "Tarix"`, `icon: "Landmark"`, `color: "#b45309"` (bronze), sitting alongside chemistry/biology/physics/electronics under the existing `/:subject/:topic` routing. **Vision:** turn history from a wall of dates into a *time machine you can fly* — zoom a living timeline from 3000 BCE to today, morph empire borders with a slider, walk 3D reconstructions of Samarqand's Registan, and argue with Amir Temur via Gemini — with a deliberate Central-Asian / Silk-Road spine so it feels local, not a Western textbook port.

## Feature Tree

| Branch | Concrete instantiation for History | Status | Priority |
|---|---|---|---|
| Theory | **"Davr o'quvchisi"** — scrollytelling era readers (Qadimgi dunyo → O'rta asrlar → Yangi davr), pinned map + artifact reveals as you scroll | 🆕 | P0 |
| Experiment | **"Radiokarbon laboratoriyasi"** — date a found artifact: adjust C-14 decay, dendrochronology rings, stratigraphy layer to estimate age vs. true value | 🆕 | P2 |
| Simulation | **"Imperiya: yuksalish va yemirilish"** — tick-based sim of an empire's area/population/stability over reigns; watch overextension collapse it | 🆕 | P1 |
| Calculator | **"Sana va davr kalkulyatori"** — Hijriy↔Milodiy↔Julian converter, "necha yil oldin", empire-lifespan, C-14 age formula | 🆕 | P2 |
| Interactive Graph | **"Qudrat egri chizig'i"** — Recharts overlay of empire territory / population / military index over centuries; scrub-linked to the timeline | 🆕 | P1 |
| Challenge | **"Vaqt chizig'ini tikla"** — drag shuffled events onto the correct timeline slot against a clock; **"Imperiyani joylashtir"** map-pin challenge | 🆕 | P1 |
| Quiz | **"Tarix sinovi"** — MCQ + map-pin + artifact-ID + "which came first" (hooks the parallel quiz engine; subject supplies question bank JSON) | 🆕 | P0 |
| AI Tutor | **"Tarix ustozi"** (Socratic Gemini tutor) + **"Tarixiy shaxs bilan suhbat"** (persona chat: Ulug'bek, Amir Temur, Kleopatra) | 🟡 (Gemini infra exists) | P0 |
| Real-life Examples | **"Bugungi izlar"** — Buyuk Ipak yo'li → zamonaviy logistika/BRI; Rim huquqi → hozirgi qonun; Ulug'bek jadvali → astronomiya | 🆕 | P2 |
| Mini Game | **"Savdo karvoni"** — run a Silk-Road caravan Samarqand→Xitoy, buy/sell goods, dodge bandits & tariffs, maximize profit | 🆕 | P1 |
| Achievements | **"Davr ustasi" nishonlari** — badges per era/region mastered, "Ipak yo'li sayyohi", streaks (hooks parallel gamification layer) | 🆕 | P2 |
| 3D Models | Registan, Misr piramidalari, Kolizey, Rosetta toshi, Tillakori — GLB viewer with hotspots | 🟡 (Sketchfab/GLB viewer exists) | P0 |

## Demo Playground

| Demo | Status | Purpose | Learning Objective | UI | Animations | Controls | Input | Output | Result | Difficulty | Dev (days) |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Interactive Timeline | 🆕 | Spatialize 5000 yrs on one axis | Sequence eras & see overlap | SVG/canvas horizontal deep-zoom, era bands + parallax | Momentum pan, level-of-detail fade-in, pin drop | Drag pan, pinch/wheel zoom, era filter chips | Zoom range, category toggles | Rendered era lanes + event pins w/ popovers | "Rim va Xan bir vaqtda yashagan" — overlap aha | Med | 8 |
| Historical Maps | 🆕 | Show borders as fluid, not fixed | Empires expand/contract over time | D3-geo + topojson world, time slider | Border morph tween between year-snapshots, empire fill spread | Year slider, play/pause, empire spotlight | Year, selected polity | Recolored choropleth + capital markers | "Chegaralar 200 yilda butkul o'zgardi" | High | 14 |
| Ancient Civilizations | 🆕 | Compare cradle cultures side by side | Contrast Mesopotamia/Egypt/Indus/China | R3F diorama cards + compare drawer | Camera orbit intro, day→night light sweep | Orbit, click-to-focus, A/B compare | Civ pick, compare pair | 3D diorama + stat panel (writing, gov, tech) | "Yozuv 4 joyda mustaqil paydo bo'ldi" | Med-High | 10 |
| Artifacts | 🟡 | Handle objects you can't touch | Read material culture as evidence | R3F GLB viewer, hotspot annotations | Auto-turntable, hotspot pulse, exploded inscription zoom | Rotate/zoom, hotspot tap, X-ray toggle | Artifact select | Labeled 3D object + provenance card | "Rosetta 3 tilda — shuning uchun kalit" | Med | 6 |
| Historical Buildings | 🆕 | Rebuild ruins in your head | See original vs. present state | R3F scene, "harobadan tiklash" slider | Layer-by-layer construction, ruins↔reconstruction crossfade | Reconstruct slider, orbit, section cut | Building pick, slider % | Morphing 3D structure + scale figure | "Registan gumbazi shunday bo'lgan" | High | 12 |
| Wars / Battles | 🆕 | Make tactics legible | Understand maneuver & terrain | Canvas/SVG battle map, phase stepper | Troop-arrow flow, unit icons advance, terrain shading | Next/prev phase, speed, side toggle | Battle pick, phase index | Animated front lines + outcome note | "Kanna: qamal bilan katta qo'shin yengildi" | Med-High | 9 |
| Trade Routes | 🆕 | Reveal connection, not isolation | Trace goods/ideas across continents | deck.gl ArcLayer over map (Silk/Incense/trans-Sahara) | Animated flowing dashes, commodity particles, node glow | Route toggle, commodity filter, era slider | Route + goods selection | Lit arcs + hub cards (Samarqand, Buxoro) | "Qog'oz Xitoydan G'arbga shu yo'ldan kelgan" | High | 11 |
| Cultural Evolution | 🆕 | Show culture as a branching tree | Writing/art/tech descend & diverge | D3 force/tree graph + glyph morph strip | Node grow, script glyph morph (cuneiform→alphabet) | Expand node, era scrub, domain filter | Domain (writing/art/faith), era | Interactive lineage graph + specimen viewer | "Alifbomiz finikiyaliklardan kelgan" | Med-High | 9 |
| 🆕 Historical Figure AI Chat | 🆕 | Empathy + primary-source voice | Interrogate a perspective directly | Chat UI + portrait, Gemini persona | Typing shimmer, portrait micro-reactions | Send, suggested prompts, era-lock | User questions | In-character grounded answers + citations | "Ulug'bekdan yulduzlar haqida so'radim" | Med | 7 |
| 🆕 Archaeology Dig | 🆕 | Teach evidence & stratigraphy | Deeper layer = older; context matters | Canvas grid, brush/trowel tool | Dirt-erase reveal, dust particles, find sparkle | Brush drag, tool switch, sift | Dig coords, tool | Uncovered artifacts by layer + dig log | "Chuqurroq qatlam = qadimroq davr" | Med | 8 |
| 🆕 Registan & Ulug'bek Rasadxonasi | 🆕 | Local pride + science-history link | Timurid architecture & astronomy | R3F Registan scene + sextant instrument | Camera fly-through, sextant angle sweep, star align | Orbit, enter madrasa, measure star altitude | Star pick, angle | 3D monument + measured star position | "Ulug'bek teleskopsiz aniq o'lchagan" | High | 12 |
| 🆕 Cause & Effect Web | 🆕 | History as causal networks | Multi-cause reasoning, not single dates | D3 node graph (causes→event→effects) | Edge trace pulse, node expand ripple | Click node, weight filter, timeline align | Event pick | Interactive cause/effect map + strength bars | "WWI'ning bitta emas, 5 sababi bor edi" | Med | 7 |

## 3D / Interactive Experiences

| Experience | Interactions | What it teaches | Complexity |
|---|---|---|---|
| Registan ansambli (Samarqand) | orbit, zoom, fly-through, enter-courtyard, hotspots (tilework, muqarnas), scale figure | Timurid architecture, symmetry, iwan/portal design, local heritage | High |
| Ulug'bek rasadxonasi + sekstant | rotate, animate arc sweep, measure star altitude, cross-section of the buried sextant | Pre-telescope astronomy, measurement precision, science under Timurids | High |
| Misr piramidasi (Giza) | zoom, cross-section (internal chambers), explode layers, hotspots, construction animate | Engineering, burial cosmology, labor & logistics scale | Med-High |
| Rim Kolizey: haroba→tiklash | reconstruct slider, orbit, section cut, labels (velarium, hypogeum) | Roman engineering, arches/concrete, spectacle politics | High |
| Buyuk Ipak yo'li globe | rotate globe, animate caravan, hotspot hubs, measure route distance | Trade networks, geography of exchange, hub cities | Med-High |
| Artefakt qutisi (Rosetta, Tillakori, Tutanxamon niqobi) | rotate, zoom, X-ray/exploded, inscription hotspots, material labels | Reading objects as evidence; conservation | Med |
| Qadimgi shahar dioramasi (Bobil ziqqurati) | orbit, day/night light, animate rituals, hotspot districts | Urbanism, religion, first cities | Med-High |
| Qal'a qamali makinasi (trebuchet/manjaniq) | assemble, animate fire, adjust counterweight, measure trajectory | Medieval siege physics, force & leverage | Med |
| Yozuv evolyutsiyasi tabletlari | rotate tablet, glyph-morph animate, hotspot signs, compare scripts | Origin & divergence of writing systems | Med |

## Roadmap (skill ladder)

| Level | Focus | Topics & Demos | Outcome |
|---|---|---|---|
| Beginner | Orientation in time & place | Interactive Timeline (browse mode), Artifacts viewer, "Davr o'quvchisi" era readers, basic Quiz | Places major eras/civilizations on a timeline and map; names key artifacts |
| Intermediate | Cause, comparison, geography | Historical Maps morph, Ancient Civilizations compare, Cause & Effect Web, "Vaqt chizig'ini tikla" challenge | Explains *why* changes happened; compares civilizations across shared axes |
| Advanced | Systems & analysis | Trade Routes flow map, Wars phase-stepper, Empire rise/fall Simulation, Qudrat graph, Radiokarbon experiment | Reasons about networks & systems; interprets evidence and dates it |
| Expert | Synthesis & perspective | Historical Figure AI debates, Registan/Ulug'bek deep-dive, "Savdo karvoni" strategy game, multi-cause essay challenge | Argues interpretations from evidence; connects past systems to the present |

## Feature Economics

| Feature | Purpose | Educational Value | Complexity | Priority | Dev Cost | Est User Engagement |
|---|---|---|---|---|---|---|
| Interactive Timeline | Backbone that links every demo by date | Very High | Med | P0 | 8 dev-days | Very High |
| Historical Maps (border morph) | Show change over time viscerally | Very High | High | P0 | 14 dev-days | Very High |
| 3D Models / Artifacts viewer | Signature "wow" + reuses GLB infra | High | Med | P0 | 6 dev-days (infra reused) | High |
| Historical Figure AI Chat | Differentiator; reuses Gemini stack | Very High | Med | P0 | 7 dev-days | Very High |
| Registan & Ulug'bek 3D | Local identity + science-history hook | High | High | P1 | 12 dev-days | High |
| Trade Routes flow map | Teaches connection/systems thinking | High | High | P1 | 11 dev-days | High |
| "Savdo karvoni" mini game | Retention/replay via strategy loop | Med | Med-High | P1 | 10 dev-days | Very High |
| Empire rise/fall Simulation | Systems literacy, counterfactual play | High | High | P1 | 12 dev-days | Med-High |
| Cause & Effect Web | Upgrades reasoning beyond memorization | High | Med | P2 | 7 dev-days | Med |
| Sana/Radiokarbon calculator+lab | Cross-links physics; concrete skill | Med | Low-Med | P2 | 6 dev-days | Med |

---

**Buildability notes (web stack):** Timeline/Wars/Cause-Web via SVG+canvas with Framer Motion; Maps/Trade via D3-geo + topojson (or deck.gl `ArcLayer` for flows) using open historical GeoJSON (Euratlas / `historical-basemaps`) baked to versioned year-snapshots; all 3D via existing R3F + GLB viewer pattern already used in biology/chemistry (rotate/zoom/hotspot/section-cut components are reusable); AI chat + tutor via the existing Gemini integration (persona = system prompt + retrieval-grounded facts, `thinkingBudget` tuned per the chemistry-reaction memory note). Registry hook: add `history` to `SUBJECTS` in `/Users/shukrullo/Desktop/smartlab/client/src/lab/data/subjects.js` with topics `timeline`, `maps`, `civilizations`, `artifacts`, `buildings`, `wars`, `trade-routes`, `culture`; per-subject code lives in `/Users/shukrullo/Desktop/smartlab/client/src/lab/features/history/`. Quiz/achievements consume the parallel quiz+gamification engines by exporting a `history` question-bank JSON and per-era badge manifest.
