# 13 — Chemistry Lab Room (walkable, realistic)

Agreed plan for rebuilding `/chemistry/lab` into a photo-realistic, walkable first-person chemistry lab. Settled in a 3-round design interview on 2026-09-17. UI text is Uzbek; this doc is English.

## How we work

- **6 milestones**, localhost review after each. Approved milestones get a **local commit only** (never pushed).
- **Testing:** each milestone is run on a real school computer (or a cheap laptop with integrated graphics); the frame rate comes from the counter in the Esc menu. Browsers: Chrome, Edge, Yandex Browser, Firefox; Safari best effort.
- **Content review:** a chemistry teacher checks all Uzbek text, substance data and reactions before they ship.
- **Pages:** the room is built at the hidden route `/chemistry/lab-3d`. After M4 it takes over `/chemistry/lab`; the old bench (unchanged) moves to `/chemistry/lab-classic`. Phones, VR headsets and browsers that can't run the room are sent to the classic page.
- **Platform:** desktop keyboard + mouse only. Actions (move, look, grab, pour, open menu) are kept input-agnostic so VR can be added later.

## Look and quality

- **Photo-realistic PBR.** Detail priority: glassware > substances & reaction effects > room > furniture.
- **Two quality tiers** (auto-detected on load, manual switch): High = full quality; Low = must stay smooth (~60 fps) on integrated graphics.
- **Assets:** room + furniture modelled in Blender (headless Python scripts kept in the repo) with **baked lighting**, exported as meshopt-compressed GLB. Glassware, containers and anything that changes (liquid level, colour, breaking) are built in code. CC0 textures (Poly Haven / ambientCG) and one CC0 interior HDRI for reflections.
- **Loading:** one load before entering (~60–100 MB on High; Low computers download the smaller Low set). No streaming while playing.

## The room

Modern school chemistry lab, ~10 × 8 m:

- **Center:** main bench (black top, white cabinets) with the lab computer at its end; a second bench behind it. Benches start stocked with equipment.
- **Left wall:** fume hood with a fan switch.
- **Back wall:** sink counter, eyewash station, waste bin, tall glass-door chemical cabinet.
- **By the door:** safety corner — fire extinguisher, fire blanket, first-aid box, alarm bell + red light.
- **Front:** teacher's desk, whiteboard, periodic table poster.
- **Right wall:** windows with daylight. Ceiling light panels. Room ventilation switch.

## Controls and screens

- **Full-screen game page** (no site header, side panels, toolbar or AI chat).
- **Start screen:** title, controls, quality, loading bar, "Kirish" (the click also locks the mouse).
- **Controls:** mouse lock; WASD walk; Shift run; mouse look; **E** substance cabinet; **left click** interact (context-sensitive: pour / use / put down); **G** drop; **1–5** or mouse wheel switch slots. Walls and benches block you; no jump/crouch. Eye height ~1.65 m, subtle head-bob.
- **HUD:** crosshair, context hints (e.g. "[LMB] Quyish"), 5-slot bar, look-at label: name · contents with amounts · temperature (e.g. "Kimyoviy stakan · 50 ml HCl + 2 g NaHCO₃ · 24 °C").
- **Esc menu (pauses):** Davom etish · Boshqaruv (key list, mouse sensitivity) · Sifat (High/Low, frame-rate counter, "Miltillash va silkinishni kamaytirish") · Laboratoriyani tiklash · Chiqish (back to the Chemistry subject page).
- **E menu (lab keeps running):** full-screen overlay styled as a real chemical cabinet — glass doors, shelves, each substance shown as its real 3D container with a printed label. 4 shelves: Suyuqliklar, Kukunlar, Qattiq moddalar, Gazlar, plus a **Jihozlar** tab and search. Hover shows name, formula and GHS hazard symbols. Drag an item into a slot, or straight onto the bench you're looking at.
- **Accessibility defaults:** flashes ≤ 3 per second; a switch to reduce flashing and camera shake.

## Equipment (20)

Every item has a real function.

| Group | Items |
|---|---|
| Containers (8) | beaker · conical (Erlenmeyer) flask · test tube · measuring cylinder · porcelain evaporating dish · crucible · glass trough (crystallizer) · gas jar with lid |
| Adding & measuring (8) | dropper · spatula · tongs · glass stirring rod · funnel with filter paper · thermometer · digital scale · pH indicator paper |
| Heating & holding (4) | spirit lamp · hot plate with magnetic stirrer · retort stand with ring, clamp and wire gauze · test tube rack with holder |

Room items (not counted): fume hood, sink, eyewash, fire extinguisher, fire blanket, alarm, waste bin.

## Substances (30) — 9 elements + 21 compounds

Four **state templates**, each = one container model + one contents renderer, customised per substance by data (colour, clarity, viscosity, grain, metallic, piece shape, gas colour):

- **Suyuqlik** → glass reagent bottle with stopper
- **Kukun** → wide-mouth jar
- **Qattiq** → wide-mouth jar with pieces
- **Gaz** → small steel gas cylinder with valve and tube

| State | Substances |
|---|---|
| Liquids (15) | distilled water H₂O · hydrochloric acid HCl · concentrated sulfuric acid H₂SO₄ · concentrated nitric acid HNO₃ · sodium hydroxide NaOH · ammonia solution NH₃·H₂O · limewater Ca(OH)₂ · hydrogen peroxide H₂O₂ · ethanol C₂H₅OH · glycerin C₃H₅(OH)₃ · phenolphthalein · copper(II) sulfate CuSO₄ · silver nitrate AgNO₃ · iron(III) chloride FeCl₃ · potassium iodide KI |
| Powders (6) | sodium bicarbonate NaHCO₃ · manganese(IV) oxide MnO₂ · potassium permanganate KMnO₄ · sulfur S · iron filings Fe · sugar C₁₂H₂₂O₁₁ |
| Solids (5) | sodium Na (under oil) · magnesium ribbon Mg · zinc granules Zn · copper wire Cu · marble chips CaCO₃ |
| Gases (4) | oxygen O₂ · hydrogen H₂ · carbon dioxide CO₂ · chlorine Cl₂ |

## Chemistry

- **Curated reaction table** (~40 reactions), written by us and checked by the teacher. Offline, deterministic. No AI in the room. Drafted during M3 so review happens before M4.
- **Mixture model (simplified):** each container tracks contents, rough amounts and temperature. Every addition is checked against the rules; products replace reactants, leftovers remain, reactions can chain (NaOH + phenolphthalein → pink → + HCl → colourless). Some need conditions (heat, MnO₂ catalyst). Pairs not in the table still behave realistically (dissolve, dilute, colours blend). Products can be poured into other containers.
- **Speed:** slow reactions are sped up to finish within ~20 s (the monitor says so); short natural delays (e.g. KMnO₄ + glycerin) are kept.
- **Adding substances (realistic tools):** liquids — hold the bottle, hold left click to pour (tilt, stream, ml counter); dropper for drops. Powders — jar on the bench, spatula scoops (~1 g) and tips in. Solids — tongs pick one piece and drop it in. Gases — hold the cylinder, gas flows through the tube (bubbles through liquid or fills an empty gas jar).
- **Equipment use:** spirit lamp (click to light/put out; heat on the gauze, hold a test tube in the flame, burn Mg with tongs) · hot plate (knob Off → 50 → 100 → 200 → 300 °C, stir button) · stirring rod (hold to stir, faster dissolving) · thermometer and scale (live readings) · pH paper (click a container → colour + pH) · funnel (filter solids). Containers snap into place on hot plate, stand, scale, rack and under the funnel.
- **Physics:** left click puts an item down gently; G drops it; glass breaks when it hits the floor; explosions knock nearby things over; walking into benches doesn't knock things over.
- **Feedback:** short pop-up when a reaction happens; the lab computer monitor (read by walking up to it) shows equation, reaction type, what happened and why, and a safety note.

Representative reactions: NaOH/NH₃ + phenolphthalein → pink; CuSO₄ + excess NH₃ → deep blue; KI + FeCl₃ → brown I₂; AgNO₃ + HCl → white ppt; CuSO₄ + NaOH → blue ppt (heat → black CuO); FeCl₃ + NaOH → rust-brown ppt; limewater + CO₂ → milky; NaHCO₃ / marble + HCl → CO₂; Zn / Mg + HCl → H₂; H₂O₂ + MnO₂ → O₂; Cu + conc. HNO₃ → brown NO₂; Fe / Zn + CuSO₄ → copper deposit; Cu + AgNO₃ → silver crystals; Mg in flame → white light; ethanol / sulfur burn blue (SO₂ smoke); KMnO₄ + glycerin → delayed fire; Na + Cl₂ → yellow flame; H₂ + flame → pop; H₂ + O₂ + flame → bang; Na + water → fizz, flame, pop; sugar + conc. H₂SO₄ → carbon column; water into conc. H₂SO₄ → violent spattering; Fe + S heated → glowing FeS.

## Danger

- **Dangerous reactions are included**, with Uzbek safety warnings.
- **Room-wide consequences:** glass breaks (pieces stay until reset) · spills leave puddles (spilled ethanol can burn) · toxic gas and smoke (Cl₂, NO₂, SO₂) spread and haze the room unless the reaction is inside the fume hood · fire spreads along spilled ethanol and nearby flammables · alarm (bell + red light). No sprinklers.
- **Recovery:** fire extinguisher (take off the wall, hold to spray) · fume hood fan switch · room ventilation switch · "Laboratoriyani tiklash" in the Esc menu.
- **Effects on the player:** coughing + blurry vision in toxic gas, white flash + ringing ears after explosions, heat glow near fire, plus a safety message. No health bar, no game over. No safety goggles in v1.
- **Gamification** means game controls and feel only — no XP, points or quests.

## Sound and saving

- **Full sound** from free recordings: footsteps, glass clinks, pouring, fizzing, bubbling, flames, bangs, alarm, room hum.
- **Fresh lab every visit** (no saving).

## Technical choices

- New libraries: `@react-three/rapier` (player collisions, falling/breaking objects), `@react-three/postprocessing` (ambient occlusion and bloom on High). Everything else already exists.
- Hot simulation state lives in refs mutated per frame; HUD reads a throttled snapshot store (same pattern as `physics/engine/engineSim.js`).
- Substances, equipment and reactions each live in one data file for teacher review.

## Milestones

1. **M1 — Room + walking.** Blender room with baked lighting, full-screen page at `/chemistry/lab-3d`, start screen, pointer-lock controls, collisions, Esc menu, quality tiers, frame-rate counter.
2. **M2 — Equipment.** 20 equipment models on the benches, realistic glass.
3. **M3 — Substances + E menu.** 30 substance containers (4 templates), cabinet menu with Jihozlar tab, 5-slot bar, drag & drop, put down / drop, glass breaking. Reaction table drafted for teacher review.
4. **M4 — Chemistry.** Adding with tools, working equipment, mixture engine, reactions and effects, look-at label, monitor, pop-up. Then the room takes over `/chemistry/lab` (old page → `/chemistry/lab-classic`).
5. **M5 — Danger.** Spills, spreading gas and fire, alarm, extinguisher, fans, player screen effects.
6. **M6 — Sound + polish.** All sounds, performance fixes from school-PC results, teacher's corrections.
