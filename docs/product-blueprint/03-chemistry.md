# Chemistry

## Snapshot
**Real state:** Smart Lab's most-built subject — 4 live pages under `/chemistry`: **Periodic table** (`periodic-table`, 118 elements from a 10.8 K-line `elements.js`, 43 ions, vendored balancer/molar-mass/empirical/solubility calculators + a native 105-equation worksheet generator), **Molecules** (`molecules`, 240-molecule PubChem 3D ball-and-stick viewer + VR), **Interactive lab bench** (`lab`, R3F 3D vessel — pour 14 elements + 11 reagents, 8 hardcoded reaction rules, Gemini AI-reaction for exactly 2 reagents), and **Atoms** (`atoms`, Bohr model, only 5 hand-typed atoms). Strong data, thin engines: the lab recognizes products against just 16 of the 240 molecules, and the calculators are a 13 K-line non-React `dangerouslySetInnerHTML` island.
**Vision:** Turn four isolated demos into one connected sandbox — *element → atom → bond → molecule → reaction → measurement* — where every dataset (`elements.js`, `moleculeLibrary.js`, `ions.js`) drives real simulations that emit gradeable results into the app's planned progress layer.

## Feature Tree

| Branch | Concrete instantiation for Chemistry | Status | Priority |
|---|---|---|---|
| **Theory** | "Konspekt" cards inside `ElementModal` (4 levels: basic/atomic/physical/history+STSE+hazards) and `MoleculeInfoPanel`; add bond-type & reaction-type primers | 🟡 | P1 |
| **Experiment** | 3D lab bench `LabBenchPage` (pour & react in vessel); new titration burette + electrolysis cell | 🟡 | P0 |
| **Simulation** | pH/indicator sim, Gas laws (PV=nRT), reaction kinetics, Le Chatelier equilibrium — all new R3F/canvas | 🆕 | P0 |
| **Calculator** | Molar mass, equation balancer, empirical formula, solubility (all exist, vendored island → port to native React); add stoichiometry/limiting-reagent | 🟡 | P1 |
| **Interactive Graph** | Periodic property heatmap overlay (electronegativity/radius/ionization already in data), titration curve, rate curve, Boyle PV plot | 🆕 | P1 |
| **Challenge** | "Neytral birikma yig'" (cation+anion from `ions.js` → balanced formula), "Mahsulotni top" (predict lab product), timed equation-balancing | 🆕 | P2 |
| **Quiz** | Structured MCQ/drag quiz per topic; wrap the existing auto-grading `Worksheet` output into the shared quiz-engine seam | 🆕 | P1 |
| **AI Tutor** | `/ai/reaction` Gemini (2 reagents → status/equation) exists; extend to N-reagent tutor + "nega bunday bo'ldi?" explanation chat | 🟡 | P1 |
| **Real-life Examples** | STSE/uses/hazards fields in `ElementModal` (level4) exist; add "kundalik hayotda" cards (rusting, batteries, soap, baking) | 🟡 | P2 |
| **Mini Game** | "Molekula yig'ish" atom-matching game, "Element bingo", "Reaksiya-reaksiya" pairs | 🆕 | P3 |
| **Achievements** | Badges: "Barcha 118 elementni ochding", "10 molekula yasading", "Titrlashni tugatding" — needs progress layer | 🆕 | P2 |
| **3D Models** | Molecule viewer (240) ✅, Bohr atom (rebuild 5→118) 🟡, lab scene ✅, new crystal-lattice/unit-cell + orbital cloud | 🟡 | P1 |

## Demo Playground

| Demo | Status | Purpose | Learning Objective | UI | Animations | Controls | Input | Output | Result | Difficulty | Dev (days) |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **Acid + Base** | 🟡 (reagents pourable, no engine) | Neutralization & salt formation | Acid+base→salt+water; strong vs weak | 3D lab bench beaker + pH strip overlay | Colour shift, fizz, heat glow | Pick acid/base, drops slider | HCl/H₂SO₄/NH₃/CH₃COOH + NaOH, volume | Live pH number + indicator colour + product formula | "Mixing equal HCl+NaOH lands at pH 7" | Med | 5 |
| **Metal Reaction** | 🟡 (Na+O rule only) | Reactivity series | Rank K>Na>Ca>Mg>Zn>Fe>Cu; displacement | Bench + reactivity ladder sidebar | Bubbling H₂, flame, dissolving metal | Choose metal + solution | Metal (14 exist) + acid/salt solution | Gas rate, colour, "reacts / no reaction" verdict | "Cu won't push H₂ out of acid; Mg will" | Med | 4 |
| **Electrolysis** | 🆕 | Redox at electrodes | Ions migrate; cathode reduction/anode oxidation | R3F electrolytic cell, 2 electrodes, ion dots | Ions drift to poles, gas bubbles collect | Voltage slider, choose electrolyte | Water/CuSO₄/NaCl(aq), current | Gas volume per electrode, mass deposited | "2:1 H₂:O₂ ratio appears at the electrodes" | High | 7 |
| **Molecule Builder** | 🟡 (bench builds atom-by-atom; viewer only shows) | Composition & valence | Correct atom counts make a real molecule | Drag atoms from tray → snap bonds; 3D preview | Bond snap, wobble on invalid, success spin | Drag atoms, rotate, delete | Atoms (H,O,C,N…) | Validated formula vs `moleculeLibrary` | "2 H + 1 O locks into H₂O; 3 H fails" | High | 9 |
| **Atom Builder** | 🟡 (`AtomsPage`, 5 atoms) | Sub-atomic structure | Protons=Z, shells 2/8/8, ion vs isotope | Bohr 3D + p/n/e counters | Electrons orbit tilted shells, add/remove particle | +/- proton/neutron/electron | Any of 118 (from `elements.js` config) | Element name, charge, isotope label | "Add a proton and Li becomes Be" | Med | 5 |
| **Chemical Bonds** | 🟡 (bonds drawn in viewer) | Ionic vs covalent vs metallic | Electron transfer vs sharing | Two atoms + electron-dot animation | Electron jumps (ionic) / overlaps (covalent) | Pick 2 elements | Element pair (ΔEN from data) | Bond type verdict + partial charges | "Na→Cl transfers; H–H shares" | Med | 5 |
| **Periodic Table** | ✅ (118 el.) | Trends & classification | Groups/periods, property gradients | Existing grid + colour-by-property toggle | Cell recolour animation on toggle | Search, category filter, property dropdown | Property (EN/radius/ionization — already in data) | Heatmapped table + trend arrow | "Radius shrinks left→right, grows down" | Low–Med | 4 |
| **Gas Laws** | 🆕 | PV=nRT relationships | Boyle/Charles/Gay-Lussac | Piston cylinder + particle box (canvas) | Particles speed/compress, piston moves | Sliders: P, V, T, n | Two fixed, vary one | Live PV plot + particle speed | "Halve V → double P at fixed T" | Med | 4 |
| **pH Simulation** | 🆕 | Acidity scale & indicators | pH = -log[H⁺]; indicator ranges | pH scale slider + beaker colour + indicator picker | Colour morph across scale | Concentration slider, indicator select | Acid/base + molarity | pH value + indicator colour + [H⁺] | "Litmus, phenolphthalein flip at set pH" | Med | 5 |
| **Titration** *(added)* | 🆕 | Quantitative analysis | Endpoint, mole ratio, unknown conc. | Burette + flask R3F, drop-by-drop | Drops fall, swirl, sharp colour flip at endpoint | Tap/hold to add titrant, stir | Titrant conc/volume, analyte | Titration curve + calculated unknown molarity | "One drop past endpoint swings pH sharply" | High | 6 |
| **Flame Test / Spectra** *(added)* | 🆕 | Emission & electron energy levels | Elements emit characteristic colours/lines | Bunsen flame R3F + spectrum bar | Flame colour burst, emission-line reveal | Pick metal salt | Na/K/Ca/Cu/Li salt | Flame colour + line spectrum | "Na=yellow, Cu=green, K=lilac" | Med | 4 |
| **Reaction Kinetics** *(added)* | 🆕 | Rate factors | Temp/conc/surface/catalyst change rate | Particle collision box + rate graph | Collision frequency, product bar fills | Sliders: temp, conc, catalyst on/off | Reactant conditions | Rate curve + time-to-complete | "Raise temp → curve steepens" | Med | 5 |
| **Le Chatelier** *(added)* | 🆕 | Equilibrium shifts | Stress shifts equilibrium to relieve it | Reversible reaction beaker + balance meter | Colour/level shift toward products/reactants | Add reactant, change P/T | N₂O₄⇌NO₂ style system | Shift direction + new colour | "Heat an endothermic eqm → shifts right" | High | 5 |

## 3D / Interactive Experiences

| Experience | Interactions | What it teaches | Complexity |
|---|---|---|---|
| **Molecule viewer** (`MoleculeModel`, 240 mols) ✅ | rotate, zoom, hover-labels, auto-rotate, VR/cardboard | 3D shape, bonds (single/double/triple), CPK colours | Low (built) |
| **Bohr atom studio** (rebuild `AtomModel` 5→118) 🟡 | rotate, add/remove particle, shell highlight, isotope/ion toggle | Nucleus vs shells, Z/N/e, ions & isotopes | Med |
| **Interactive lab bench** (`LabScene`) ✅ | pour, stir, heat, cross-mix, journal, undo | Real reactions, colour blend, exo/endothermic heat | Med (built, needs deeper engine) |
| **Crystal lattice / unit cell** 🆕 | rotate, zoom, explode, repeat-cell toggle, ion labels | Ionic solids (NaCl), metallic packing, coordination number | Med |
| **VSEPR geometry** 🆕 | rotate, show electron domains, lone-pair toggle, bond-angle measure | Molecular shape from electron repulsion (linear→octahedral) | Med |
| **Orbital cloud viewer** 🆕 | rotate, cross-section, s/p/d switch, opacity slider | Electron probability clouds beyond Bohr | High |
| **Electrolysis cell** 🆕 | rotate, animate ions, collect gas, swap electrolyte | Ion migration, redox at electrodes, gas ratios | High |
| **Periodic property heatmap** (overlay on existing table) 🆕 | hover-values, switch property, animate gradient | Periodic trends as colour fields | Low–Med |
| **Titration apparatus** 🆕 | tap-to-drop, swirl, measure volume, read curve | Endpoint detection, stoichiometric calculation | High |

## Roadmap (skill ladder)

| Level | Focus | Topics & Demos | Outcome |
|---|---|---|---|
| **Beginner** | Matter & building blocks | Periodic Table (browse + heatmap), Atom Builder, Molecule viewer, Flame Test | Reads an element card, builds an atom, names H₂O/CO₂, links colour↔element |
| **Intermediate** | Bonds & simple reactions | Chemical Bonds, Molecule Builder, Acid+Base, Metal Reaction, molar-mass calculator | Predicts ionic vs covalent, builds valid molecules, writes salt+water products |
| **Advanced** | Quantitative & dynamic | Titration, Gas Laws, pH Simulation, equation balancer + stoichiometry, Reaction Kinetics | Balances & solves limiting-reagent, reads a titration curve, explains rate factors |
| **Expert** | Systems & equilibrium | Electrolysis, Le Chatelier equilibrium, redox in lab bench, AI N-reagent tutor | Reasons about redox at electrodes, predicts equilibrium shifts, defends multi-step reactions |

## Feature Economics

| Feature | Purpose | Educational Value | Complexity | Priority | Dev Cost | Est User Engagement |
|---|---|---|---|---|---|---|
| **Lab-bench engine rebuild** (drive products off `moleculeLibrary` 240, expand reagents) | Turn demo into real sandbox | Very High | High | P0 | 8–10 days | Very High |
| **Periodic property overlay + oxidation-state fix** | Reveal trends from existing unused numeric data | High | Low–Med | P1 | 3–4 days | High |
| **Atom Builder from `elements.js` (5→118)** | Link isolated Atoms page to periodic data | High | Med | P1 | 5 days | High |
| **Molecule Builder (drag atoms → validate)** | Active construction vs passive viewing | Very High | High | P1 | 9 days | Very High |
| **pH + Titration pair** | Quantitative wet-lab reasoning | Very High | High | P0 | 11 days | High |
| **Port vendored calculators → native React** | Kill 13 K-line island, unify UX/bundle | Med (clarity) | High | P1 | 6–8 days | Med |
| **Gas Laws simulation** | Visualize PV=nRT intuition | High | Med | P1 | 4 days | High |
| **Quiz/attempt seam** (Worksheet + lab journal → typed result) | Hook into planned progress/gamification | High | Med | P1 | 6 days (shared) | High |
| **Electrolysis cell** | Redox & electrode reasoning | High | High | P2 | 7 days | Med |
| **AI N-reagent tutor** (extend `/ai/reaction`) | Explain outcomes, not just show | High | Med | P1 | 4 days | High |

---
**Grounding notes (real files):** Existing pages under `/Users/shukrullo/Desktop/smartlab/client/src/lab/features/chemistry/{periodic,molecules,lab,atoms}`; datasets at `client/src/lab/data/{elements.js (10.8K lines), moleculeLibrary.js (240), molecules.js (16 lab products), ions.js (43), reactions.js (8 rules), substances.js (14 el + 11 reagents), atoms.js (5)}`. Vendored calculator island to retire: `periodic/vendor/` + dead `periodic/utils/equationBalancer.js`. Routes are registry-driven in `client/src/lab/data/subjects.js` (`chemistry` → `periodic-table`/`molecules`/`lab`/`atoms`); all UI text Uzbek, code values English; AI via server-side Gemini.
