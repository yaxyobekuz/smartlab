# 16 — Room hazards: spills, fire, gas, alarm and recovery (M5 contract)

Technical contract for milestone M5 of the walkable lab (`13-chemistry-lab-room.md` § Danger). It builds on the M4 contract (`15-chemistry-engine.md`), whose conventions, ownership rules and verification commands still apply. UI text is Uzbek; this doc and code comments are English.

Code root: `client/src/lab/features/chemistry/lab-room/` (paths below are relative to it).

## 1. What M5 delivers

- Spilled liquid leaves a **puddle** on the bench or floor (tipped container, overfilled vessel, spatter, broken glass). Spilled ethanol burns; acid leaves an etched stain when it dries.
- **Fire spreads** from a burning puddle to nearby flammable puddles, and a burning puddle heats containers standing next to it.
- **Toxic gas** (Cl₂, NO₂, SO₂, NH₃, H₂S) leaves the container, spreads through the room on a 1 m grid and hazes the air. A running fume hood captures 95 % of what is released inside it; the room fan clears the air faster.
- **Alarm**: after 4 s of fire, or when the air around the player passes the irritant limit — bell + red strobe, and a warning toast.
- **Player effects**: coughing and blurred vision in gas, white flash + ringing after a bang, heat glow near fire.
- **Recovery**: extinguisher off the wall (hold LMB to spray CO₂), fume hood fan switch, room ventilation switch, "Laboratoriyani tiklash" in the Esc menu (already clears hazards through `lab.reset()`).

## 2. Architecture

```
hazards/
  hazardStore.js      room state: puddles, gas grid, fires, alarm, exposure, spray
  hazardScenarios.js  dev seeds for ?hazard=spill|fire|gas|alarm
  RoomFixtures.jsx    animates the baked room nodes: strobe, bell, fans, bracket
  GasHaze.jsx         the gas cloud in the room
  Puddles.jsx         puddle decals, wet shine, scorch marks and their flames
sim/
  spills.js           mixture → puddle (colour, flammable ml, acidity)
  LabRunner.jsx       routes engine events into the hazard store, steps it
effects/Co2Jet.jsx    the extinguisher jet
equipment/models/Extinguisher.jsx   the carried extinguisher
components/HazardOverlay.jsx        full-screen player effects
world/wallPanels.js   switches and the extinguisher bracket as wall rectangles
```

Every component is mounted with the props below, so each one can be written and reviewed on its own.

## 3. Hazard state (read-only for renderers)

`lab.hazards` — one store per lab, reset by `lab.reset()`.

| field | shape |
|---|---|
| `puddles` | live array, mutated in place |
| `devices` | `{ hoodFan, ventilation }` |
| `alarm` | `{ active, since, reason: "fire" \| "gas" \| null }` |
| `exposure` | `{ irritant 0..1.5, heat 0..1, flash 0..1, ringing 0..1, species }` — what the player is feeling now |
| `generation()` | bumps when a puddle, a switch or the alarm changes (use it to re-render React lists) |
| `now()` | hazard seconds |
| `haze(position)`, `hazeOfCell(index)` | `{ color, alpha }` for the air there |
| `concentrations(position)` | `{ Cl2, NO2, SO2, NH3g, H2S }` in mmol/m³ |
| `irritantAt(position)` | worst concentration ÷ its irritant limit (1 = coughing) |
| `fires()` | the burning puddles |

Grid exports: `ROOM { minX:-5, maxX:5, minZ:-4, maxZ:4, cell:1, height:2.5 }`, `COLS` (10), `ROWS` (8), `cellCenter(index)`, `FUME_HOOD`, `GAS_SPECIES`.

**Puddle**: `{ id, position: [x, y, z], surface: "bench" | "floor", ml, flammableMl, acidic, color: "#rrggbb", opacity 0..1, burning, warm, scorch 0..1, radius (m), bornAt }`. `radius` already follows `ml`; a puddle stays in the array while it dries and while its scorch fades.

**The jet**: `lab.activity.spray` is `{ sourceId, origin: [x, y, z], direction: [x, y, z], chargeS }` while the player holds LMB with the extinguisher, otherwise null. `lab.activity.cameraPosition` / `cameraDirection` are published every frame.

Baked room nodes that M5 animates (find them by name in the room GLB, they are not separate assets):

| node | note |
|---|---|
| `extinguisher` | on its bracket; hide it while the player carries one (`world.store.get().objects.some(o => o.typeId === "extinguisher")`) |
| `alarm_light` | red strobe lens, baked off |
| `alarm_bell` | red gong, faces −z |
| `fumehood_switch`, `ventilation_switch` | plate + rocker, face +x |
| `fumehood_light` | strip inside the hood, baked off |
| `fumehood_sash` + `glass_fumehood_sash` | sliding sash, y 0.92…1.9 |

Clone a material before changing it (`mesh.material = mesh.material.clone()` once, in an effect) — room materials are shared.

## 4. Build list

### 4.1 The safety corner and the extinguisher

1. `equipment/models/Extinguisher.jsx` — replace the rough placeholder with a real 5 kg CO₂ extinguisher: Ø156 mm red cylinder (bottom centre at y = 0, total height ≈ 0.53 m), brass valve with a squeeze lever and pin, pressure gauge, black hose and horn. Kit materials only (`useKit()`), `BlobShadow` at the base, geometry merged and disposed. It must read well both on the wall and in the hand, and must not cost more than ~8 draw calls.
2. `effects/Co2Jet.jsx` — `<Co2Jet lab={lab} />`, already mounted in `tools/ToolEffects.jsx`. Reads `lab.activity.spray` each frame: a widening white cone of cold gas from `origin` along `direction`, ~2 m long, with swirling puffs, a short-lived frost haze where it lands, and a faint blue-white light. Nothing when `spray` is null; stops when `chargeS` reaches 0. Low tier: fewer particles, no light.
3. `hazards/RoomFixtures.jsx` — `<RoomFixtures lab={lab} world={world} enabled />`. Animates the baked nodes listed above: hide the wall extinguisher while carried; strobe `alarm_light` (red emissive + a small point light, ≤ 3 flashes/s, steady glow when `lab.prefs.reduceMotion`); rock `alarm_bell` slightly while the alarm rings; flip the switch rockers and light `fumehood_light` when `devices.hoodFan` is on. Everything reads `lab.hazards` in `useFrame`; no React state per frame.

### 4.2 The room and the player

1. `hazards/Puddles.jsx` — `<Puddles lab={lab} />`. One instanced decal mesh for every puddle (bench tops at y ≈ 0.9015, floor at y ≈ 0.003): an elliptical wet patch in the puddle's own colour and opacity, a darker rim, a specular sheen that dries as `ml` falls, a brown-grey scorch under `scorch`, and a pale etched ring for `acidic` ones once they dry. Burning puddles get a low, wide flame (reuse `effects/Flame.jsx` with the `ethanol` kind) plus heat shimmer. Puddles appear and vanish smoothly. Budget: one draw call for all decals, ≤ 4 flames at once.
2. `hazards/GasHaze.jsx` — `<GasHaze lab={lab} />`. The room air: sample the gas grid each frame and draw the cloud where it is. Suggested approach — a single box mesh over the room with a shader that samples a 10×8 data texture written each frame (one `texture.needsUpdate`, no geometry churn), tinted by `hazeOfCell` colour, alpha capped so the room stays playable (≈ 0.55). Heavier gases sit lower. The fume hood interior is a separate, denser cell group: when the sash is down and the fan is on, the gas is visibly held inside it. Low tier: a coarse billboard stack instead of the box shader is fine.
3. `components/HazardOverlay.jsx` — `<HazardOverlay lab={lab} />`, a DOM overlay over the canvas (Tailwind, `pointer-events-none`). Drives from `lab.hazards.exposure` at ~10 Hz (no per-frame React state):
   - `irritant` → tinted vignette in the gas's own colour, growing blur, a coughing caption in Uzbek naming the gas and telling the student what to do ("Xloridan yo'tal — mo'rili shkafni yoqing va uzoqlashing");
   - `flash` → white full-screen flash that fades over ~0.5 s;
   - `ringing` → a soft ring-shaped muffling vignette that fades over several seconds;
   - `heat` → warm orange edge glow;
   - `alarm.active` → slow red pulse on the screen edges plus a fixed banner ("Yong'in signali" / "Havoda zaharli gaz").
   Honour `lab.prefs.reduceMotion`: no strobe, no shake, halve the blur. Nothing renders when every value is 0.

## 5. Conventions and verification

Same as doc 15 § 7–8. In particular: no new npm dependencies; one-line comments; Uzbek UI text; dispose what `useMemo` creates; `npx eslint src/lab/features/chemistry/lab-room` must stay clean; `node --import ./src/lab/features/chemistry/lab-room/chemistry/tests/resolve.js --test "src/lab/features/chemistry/lab-room/chemistry/tests/*.test.js"` must stay green.

Hazard review scenes (dev server on 5173):

```
http://localhost:5173/chemistry/lab-3d?autostart=1&hazard=fire&pose=0.3,0.6,0,-12&eye=1.65
http://localhost:5173/chemistry/lab-3d?autostart=1&hazard=gas&pose=0.3,1.2,0,-4
http://localhost:5173/chemistry/lab-3d?autostart=1&hazard=alarm&pose=-3.6,2.6,-60,6
http://localhost:5173/chemistry/lab-3d?autostart=1&hazard=spill&pose=0.3,0.2,0,-30&eye=1.3
```

`?hazard=` seeds `hazards/hazardScenarios.js` once the room is ready. `window.__labRoom` exposes `{ world, lab, input, aimAt }` for scripted checks — e.g. `__labRoom.lab.hazards.exposure.irritant = 1.2` to test the overlay, or `__labRoom.lab.activity.spray = { origin: [...], direction: [...], chargeS: 9 }` to test the jet without holding the mouse.
