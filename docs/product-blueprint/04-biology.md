# Biology

## Snapshot
Biology is Smart Lab's most built-out subject: 5 live topics under `/biology` — `cell`, `cell-studio` (7 cell types), `dna`, `anatomy` (12 Z-Anatomy GLB systems, BVH picking), and `surgery` (real clipping-plane scalpel). The anatomy/surgery pair is genuinely strong; the cell/dna trio is half-built and half-facade (mock "AI o'qituvchi", flat-swatch microscope, decorative DNA with wrong base pairing, two duplicate "Hujayra" topics). **Vision:** turn the human body and the cell into one explorable, clickable, quizzable system — every organ, organelle, and base pair honest, interactive, and wired to the real Mira AI tutor and a shared progress/quiz layer.

## Feature Tree

| Branch | Concrete instantiation for Biology | Status | Priority |
|---|---|---|---|
| **Theory** | Per-topic Uzbek `about` intros already ship (anatomy systems, organelles, surgery layers). Extend into short "Nazariya" cards per organ/organelle with diagram + 3-bullet takeaway | 🟡 | P1 |
| **Experiment** | Virtual dissection (`surgery` scalpel/peel) is a real experiment; add Osmosis (potato in salt/water), Enzyme+substrate (temp/pH sliders), Photosynthesis (light/CO₂ → O₂ bubbles) | 🟡 | P0 |
| **Simulation** | Heart pumping loop, breathing lungs, action-potential firing, digestive transit, ecosystem predator-prey — all new R3F/canvas time-loops | 🆕 | P0 |
| **Calculator** | BMI, BMR/calorie, heart-rate zones, lung tidal-volume, Punnett-ratio, Hardy-Weinberg allele frequency, dilution/osmolarity | 🆕 | P1 |
| **Interactive Graph** | Action-potential voltage curve, enzyme rate vs temp/pH, population/logistic-growth curve, O₂–hemoglobin dissociation, ECG trace — Recharts/SVG bound to sim sliders | 🆕 | P1 |
| **Challenge** | "Assemble the animal cell" drag-drop, "Trace blood through the heart" path puzzle, "Order the digestive tract", timed "label the skeleton" | 🆕 | P2 |
| **Quiz** | Label-the-hotspot (click the mitochondria), complete-the-DNA-complement, drag-organ-to-body, MCQ per topic — hooks into the parallel quiz engine | 🆕 | P0 |
| **AI Tutor** | Mira SSE panel (`/ai/chat`) already inherited by `cell/dna/anatomy/surgery` via `LabWorkspace`; **cell-studio's "AI o'qituvchi" is a mock** and must be rewired to the same backend | 🟡 | P0 |
| **Real-life Examples** | Per-topic clinical cards already partial in `cells.js` (`clinicalContext`): sickle-cell → RBC, asthma → bronchi, arrhythmia → heart, diabetes → pancreas, muscular dystrophy → myofibril | 🟡 | P1 |
| **Mini Game** | "Immune defense" tower-defense (WBC vs pathogens), "Neuron rush" (fire signal before decay), "Food-web builder" | 🆕 | P2 |
| **Achievements** | "Barcha 12 tizim ko'rildi", "Hujayrani yig'ding", "DNK to'g'ri juftlashtirilди", "Skalpel ustasi" — into parallel gamification layer | 🆕 | P2 |
| **3D Models** | 12 anatomy GLBs + 4 surgery layers + 5 cell GLBs + procedural DNA/2 cells already in-repo; add heart, lungs, brain, digestive tract as dedicated interactive scenes | ✅ | P1 |

## Demo Playground

| Demo | Status | Purpose | Learning Objective | UI | Animations | Controls | Input | Output | Result | Difficulty | Dev (days) |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **Human Anatomy** | ✅ | Explore 12 body systems in 3D | Locate structures per system | R3F canvas + corner detail modal (`AnatomyPage`) | `frameloop="demand"`, tint-on-hover | rotate/pan/zoom-to-cursor, system tabs | click mesh | Uzbek label+desc | Names any clicked structure; **fix: 6 keepMaterial systems non-clickable** | Med | 4 (unlock keepMaterial + labels-on + part search) |
| **Cell Explorer** | ✅→🟡 | Compare 7 cell types + organelles | Cell diversity & function | 3-col R3F (`cell-studio`) | `<Float>`+autorotate (→demand) | select organelle, focus/dim, compare, favorite | click chip | organelle attributes/fact/clinical | Explains why plant≠neuron; **fix: click must move GLB, de-fake AI** | Med-High | 6 (hotspots+AI+dedupe) |
| **Microscope** | 🟡 | Zoom cell at real magnifications | Read a real slide | Canvas overlay + zoom slider (currently flat swatches) | focus-blur, mag step 40×→1000× | mag dial, stain toggle, focus | drag slider | rendered field-of-view | Sees organelles resolve into view — **replace color swatches with real WebGL/texture** | Med | 5 |
| **DNA Builder** | 🟡 | Build & transcribe a sequence | Complementary pairing + central dogma | R3F helix (`DnaModel`) + SVG strand editor | unzip, replicate, rung-add | type bases, transcribe/replicate toggle | ATGC input | mRNA + protein codons | Types "ATG"→auto "TAC"; **fix: real A–T/G–C, not `i%4`** | Med | 6 |
| **Genetics** | 🆕 | Punnett cross + trait outcomes | Dominant/recessive ratios | SVG 2×2/4×4 grid + baby-phenotype card | allele fill-in animation | pick parent alleles, dihybrid toggle | Aa × Aa | genotype/phenotype 3:1 | Predicts eye-color odds numerically | Med | 5 |
| **Digestive System** | 🆕 | Trace food through the tract | Order + role of organs | R3F body + animated bolus + SVG timeline | bolus travels, enzyme fizz, pH color | play/pause, click organ, speed | click organ | transit time + enzyme list | Watches bread→glucose across mouth→intestine | Med-High | 6 |
| **Respiratory System** | 🆕 | Breathe with diaphragm + gas exchange | Inhale/exhale mechanics, O₂/CO₂ swap | R3F lungs + alveoli close-up | rib expand, alveoli inflate, gas particles | breathe-rate slider, hold-breath | drag rate | tidal volume, O₂ sat graph | Feels why diaphragm drops on inhale | Med-High | 6 |
| **Heart Simulation** | 🆕 | Pump blood through 4 chambers | Cardiac cycle + circulation loop | R3F beating heart + SVG circulation loop + ECG | valve open/close, blood-flow arrows, ECG trace | BPM slider, systole/diastole step | drag BPM | flow direction + synced ECG | Sees deoxy(blue)→oxy(red) path; BPM changes ECG | High | 8 |
| **Brain Explorer** | 🟡 | Regions + functions of the brain | Lobe/region → function map | R3F brain (neurology GLB exists) + hotspots | region glow, cross-section clip | rotate, click lobe, hemisphere hide | click region | function label + example | "Bu qism nutqni boshqaradi"; **new dedicated scene atop existing GLB** | Med | 5 |
| **Ecology** | 🆕 | Predator-prey food web | Energy flow + population balance | Canvas 2D grid sim + Recharts population graph | agents move/eat/reproduce/die | sliders: grass, rabbits, foxes | drag initial pops | oscillating population curves | Sees Lotka-Volterra boom/bust emerge | Med-High | 7 |
| **Photosynthesis Lab** | 🆕 | Light+CO₂+H₂O → glucose+O₂ | Rate-limiting factors | R3F leaf/chloroplast + O₂ bubble counter + graph | bubbles rise, thylakoid glow | light/CO₂/temp sliders | drag sliders | O₂ rate + rate curve | Finds the plateau where light stops helping | Med | 5 |
| **Neuron & Action Potential** | 🆕 | Fire a nerve signal | Depolarize→repolarize threshold | R3F/2D neuron + Recharts voltage curve | Na⁺/K⁺ gates, wave down axon | stimulus slider, threshold | tap "stimulate" | −70mV→+40mV spike trace | Sub-threshold does nothing → "all-or-none" | High | 7 |
| **Immune Defense (mini-game)** | 🆕 | WBCs vs pathogens | Innate/adaptive response | Canvas 2D tower-defense | WBC chase, antibody tag, cell burst | place cells, boost, wave start | click to deploy | pathogens cleared / infection % | Learns memory cells make wave 2 easier | High | 8 |
| **Virtual Dissection** | ✅ | Peel/cut body to reveal organs | Layer depth: skin→muscle→vessel→organ | 4 GLB layers + opacity sliders + clip plane (`surgery`) | opacity peel, scalpel clip | axis/pos/flip, depth presets | drag slider | revealed layer + click detail | Cuts skin to expose muscle intact; **fix: lazy-mount layers** | High | 3 (lazy + guided reveal) |

## 3D / Interactive Experiences

| Experience | Interactions | What it teaches | Complexity |
|---|---|---|---|
| **12-system anatomy explorer** (✅ built) | rotate · zoom-to-cursor · pan · hotspots · labels(add) · isolate(add) | Where every muscle/vessel/nerve/bone/organ sits | Med (mostly exists; unlock keepMaterial + labels) |
| **Layered virtual dissection** (✅ built) | cross-section (real clip plane) · opacity-peel · click-detail · animate(add reveal) | Anatomical depth ordering, surgical sightlines | High (exists; add lazy-mount + narration) |
| **7-cell comparison studio** (✅ built) | rotate · focus/dim · compare-2 · hotspots(add) · measure(scale bar add) | Structure↔function across cell types | Med-High |
| **DNA build & transcribe** (🟡→build) | rotate helix · unzip animate · click-base · edit-sequence · labels | Complementary pairing + central dogma | Med |
| **Beating heart + circulation** (🆕) | animate cycle · cross-section chambers · flow arrows · labels · ECG sync | Cardiac cycle, systemic/pulmonary loops | High |
| **Breathing lungs + alveoli** (🆕) | animate breath · zoom to alveolus · gas-particle exchange · measure volume | Ventilation mechanics + gas diffusion | Med-High |
| **Brain region map** (🟡→build) | rotate · cross-section · hotspots per lobe · hemisphere-hide · labels | Functional localization | Med |
| **Neuron signal fire** (🆕) | stimulate · animate wave · zoom to gates · graph-linked | Threshold & all-or-none firing | High |
| **Digestive transit** (🆕) | play bolus · click-organ · timeline scrub · pH/enzyme callouts | Sequential digestion + chemistry | Med-High |

## Roadmap (skill ladder)

| Level | Focus | Topics & Demos | Outcome |
|---|---|---|---|
| **Beginner** | Cell & body basics | Cell Explorer (animal/plant), simple `cell` view, Human Anatomy (myology/skeleton), Microscope | Names organelles and major body systems; reads a slide |
| **Intermediate** | Systems & molecules | Heart, Respiratory, Digestive, DNA Builder (pairing+transcription), Brain Explorer | Explains how a body system works and how DNA codes protein |
| **Advanced** | Mechanisms & genetics | Neuron/Action Potential, Photosynthesis Lab, Genetics (Punnett/dihybrid), Enzyme experiment, Virtual Dissection | Predicts inheritance ratios; reasons about rate-limiting factors and signaling |
| **Expert** | Systems thinking | Ecology (predator-prey), Immune Defense, cross-topic Challenges, Hardy-Weinberg calculator | Models populations & feedback loops; connects molecular→organism→ecosystem |

## Feature Economics

| Feature | Purpose | Educational Value | Complexity | Priority | Dev Cost | Est User Engagement |
|---|---|---|---|---|---|---|
| **De-fake cell-studio (real AI + honest clicks + dedupe)** | Make flagship page truthful | Very High | Med | P0 | ~6 dev-days | Very High |
| **Unlock 6 non-clickable anatomy systems** (`keepMaterial` sets `userData.detail`) | Double interactive anatomy library cheaply | High | Low | P0 | ~2 dev-days | High |
| **Quiz + hotspot-labeling engine hook** | Turn viewing into testable learning | Very High | Med | P0 | ~7 dev-days | Very High |
| **Heart Simulation** | Signature system demo | High | High | P1 | ~8 dev-days | Very High |
| **DNA Builder (true pairing + transcription)** | Fix scientifically-wrong page into a lesson | High | Med | P1 | ~6 dev-days | High |
| **Genetics / Punnett** | High-curriculum, low-3D cost | High | Med | P1 | ~5 dev-days | High |
| **Asset diet (compress 57MB+54MB cells, lazy surgery layers, demand loop)** | Make pages usable on mobile | Med | Med | P0 | ~3 dev-days | High (retention) |
| **Respiratory + Digestive systems** | Complete the "body systems" set | High | Med-High | P1 | ~12 dev-days (both) | High |
| **Neuron & Action Potential** | Best "aha" for signaling | High | High | P2 | ~7 dev-days | Med-High |
| **Ecology predator-prey** | Systems-thinking capstone, cheap 2D | Med-High | Med-High | P2 | ~7 dev-days | Med-High |

Key files to build from: `/Users/shukrullo/Desktop/smartlab/client/src/lab/features/biology/` (pages) and `/Users/shukrullo/Desktop/smartlab/client/src/lab/data/` (`cell.js`, `anatomy.js`, `anatomyMaterials.js`, `surgery.js`) plus `cell-studio/data/cells.js`; the duplicate twin-topic wiring is `subjects.js` lines 45–76; the real AI panel to reuse lives in `client/src/lab/components/` (`LabWorkspace.jsx`, `AiPanel.jsx`, `useAiChat.js`).
