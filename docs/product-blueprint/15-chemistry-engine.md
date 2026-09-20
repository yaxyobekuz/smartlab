# 15 — Chemistry engine, lab runtime and effects (M4 contract)

Technical contract for milestone M4 of the walkable lab (`13-chemistry-lab-room.md`). Reaction behaviour comes from `14-chemistry-reactions-draft.md`, which the chemistry teacher is still reviewing. UI text is Uzbek; this doc and code comments are English.

Code root: `client/src/lab/features/chemistry/lab-room/` (paths below are relative to it).

## 1. What M4 delivers

**Tools and actions**
- Pour (hold LMB) from bottles and containers.
- Dropper: draw up liquid, then add it drop by drop.
- Spatula: scoop 1 g of powder and tip it in.
- Tongs: pick up a single piece and drop it in.
- Gas cylinder: pass gas through a tube.
- Stirring rod.
- Thermometer.
- pH paper.
- Funnel filtering.
- Spirit lamp: light it, heat on the gauze, heat a held tube in the flame.
- Hot plate: temperature knob and stir button.
- Gas jar cover.
- Digital scale.

**Chemistry**
- A mixture engine with every reaction from doc 14.
- Each reaction has its visible effects: colour, precipitate, bubbles, foam, gas colour, steam, smoke, flames, glow, spatter, carbon column, crystals, pops and bangs.

**HUD and screens**
- Look-at label (contents · temperature).
- Pour meter.
- Reaction pop-up.
- Lab computer monitor with equation, type, observation and safety note.

**Routing**
- The room takes over `/chemistry/lab`; the old page moves to `/chemistry/lab-classic`.

Room-wide consequences (spills, spreading gas and fire, alarm, extinguisher) are **M5**. In M4, events like `gas` and `spatter` are emitted, and only local effects are drawn.

## 2. Architecture

```
chemistry/   pure JS, no React/three — runs in Node tests
  species.js      every species (mmol-based), colours, precipitate/gas visuals
  sources.js      what 1 ml / 1 g / 1 piece / 1 ml gas of each cabinet reagent adds
  mixture.js      container contents: create, mix, pour out, powders, pieces, gas, heat, dilution heat
  acidity.js      pH estimate, pH paper colour
  appearance.js   mixture → plain visual state (colours, turbidity, bed, pieces, headspace, fx)
  engine.js       stepMixture(m, dt, ctx) → events; `kit` helpers for rules; heating/boiling/settling/venting
  rules/          reaction rules, one file per group, ordered in rules/index.js
  reactionInfo.js Uzbek monitor / pop-up texts per reaction
  tests/          node:test scenarios (run command in §8)
sim/         runtime glue between the engine and the 3D room
  createLab.js    registry: containers (mixtures) + device states per simId, step(), visual(), subscribe()
  labContext.js   LabContext, useLab(), useDeviceVersion(simId)
  containers.js   capacity / heat / mouth anchors per container type
  scenarios.js    dev review scenes (?fxlab=)
  FxLab.jsx       dev bench that runs scenarios on a row of containers
effects/     reusable R3F effect components (bubbles, flames, smoke…)
equipment/, substances/   models; they read live state through simId
world/, tools/, components/   interaction, tool actions, HUD (lead engineer)
```

`simId` is the world object id (`o12`). Each model receives `simId` from `WorldObjects`, `HeldItem` or `FxLab`. Without `simId`, or without a `LabContext` (thumbnails, `?showcase=`), a model draws its static props exactly as in M3.

## 3. Chemistry core

### 3.1 Amounts and species
- All amounts are **mmol**. Liquids also carry volume in `m.volumeMl`, which is tracked explicitly as liquids are added, poured out or boiled off.
- Strong electrolytes are stored as ions (`H+`, `Cl-`, `SO4 2-`, `Cu2+`…). Concentrated acids are the same ions with very little `H2O`.
  - Use `sulfuricFraction(m)` and `nitricFraction(m)` (mass fraction 0..1) for "concentrated" thresholds: H₂SO₄ < 0.4 is dilute and > 0.7 is concentrated; HNO₃ > 0.5 gives NO₂ and < 0.35 gives NO.
- Weak species are molecules: `NH3`, `H2O2`, `CO2(aq)`, `I2`, `Sucrose`, `Phenolphthalein`.
- Bulk liquids `H2O`, `C2H5OH` and `C3H8O3` are in `m.aq` too; they carry heat capacity and boiling behaviour.
- Solids live in `m.solids`: `{ species, form, mmol, count, suspended, startMmol, shape, coat, glow, state }`. The `form` values are:
  - `powder`: spatula heap; may be suspended.
  - `piece`: tongs piece; `count` and `shape` (chunk, ribbon, granule, wire, chip).
  - `ppt`: precipitate; starts suspended and settles over `settleS`.
  - `coat`: deposit on a piece.
  - `crystals`: silver tree.
  - `residue`: ash, MgO or FeS masses that don't pour.
- `piece.state` is free-form per rule: `{ burning, burnLeftS, molten, hot, floating }`.
- `piece.coat` is written by rules as `{ color, amount 0..1 }`.
- Headspace gas lives in `m.gas` (mmol, air implied). `gasFraction(m, id)` gives the mole fraction. `ventGas` lets light gases escape fast and heavy ones slowly; covered jars keep their gas.

### 3.2 Adding and moving material (mixture.js)
- `reagentPortion(sourceId, ml, { label })` + `mixIn(m, portion)` for liquids. `mixIn` returns `{ volumeMl, sulfuric, portionSulfuric, portionWater, heatJ, addedMl }`; pass these to the next step as `ctx.mixes`.
- `takePortion(m, ml)` pours out. Suspended solids go along; sediment goes only when the container is almost drained; pieces stay.
- `addPowder(m, sourceId, grams)`, `addPiece(m, sourceId, { state })` and `addGasMl(m, sourceId, ml, { dissolveFraction })`.
- Dilution heat of H₂SO₄ and HNO₃ is automatic inside `mixIn` (integral heat of dilution). Both "acid into water" (№ 41) and "water onto acid" (№ 40) get their temperature from it.
- `history` keeps what the student added (`{ key, label, amount, unit: ml|g|piece|gas }`) for the look-at label.

### 3.3 Rules

```js
export const silverChloride = {
  id: "silver-chloride",        // unique
  info: "agno3-hcl",            // key in reactionInfo.js, or null for silent processes (settling helpers)
  notice: 0.005,                // mmol of progress before the player is told (pop-up + monitor)
  step(m, dt, ctx, k, events) { // returns progress (mmol) this step
    const n = k.fast(Math.min(k.aq(m, "Ag+"), k.aq(m, "Cl-")), dt, 0.3);
    if (n <= k.EPS) return 0;
    k.takeAq(m, "Ag+", n); k.takeAq(m, "Cl-", n); k.addSolid(m, "AgCl", "ppt", n);
    return n;
  },
};
```

`k` (engine `kit`) provides:
- The whole mixture API, `ph`, and `EPS`.
- Rate shapes:
  - `fast(available, dt, tau)`: first order; traces finish at once.
  - `shrink(solid, dt, seconds, factor)`: surface-limited; a lone piece is gone after `seconds`.
  - `warmth(m, per)`: temperature factor.
- `heat(m, kJ/mol, mmol)`: positive means heat released.
- `evolveGas(m, id, mmol, dt, { site })`: adds gas and writes `fx.bubbles`.
- `fx(m, key, value)`, `emit(events, type, payload)`, and `state(m, ruleId, init)` for delays and phases.

**Timing** follows doc 14's "Simulyatsiya" line. Instant ionic reactions use `fast` with tau 0.2–0.4 s. "Finishes in 20 s" means `shrink(…, 20)` or `fast` with tau ≈ seconds/3.

**Heat:** use real reaction enthalpies. Vessel heat capacity and cooling come from `sim/containers.js`.

### 3.4 ctx fields (built by the runtime each step)

| field | meaning |
|---|---|
| `now` | sim seconds |
| `container` | equipment type id (`test-tube`, `beaker`…) |
| `heatW` | external heating power into the contents (lamp flame / gauze) |
| `plateC`, `plateWK` | hot plate surface temperature and contact conductance (when standing on it) |
| `coolWK` | loss to room air (from containers.js) |
| `stirring` | stirring rod or hot-plate stirrer active |
| `covered` | gas jar cover on |
| `atmosphere` | `{ O2, CO2, Cl2, H2 }` mole fractions around burning/heated contents: air = `{ O2: 0.21 }`; inside a gas jar = the jar's headspace |
| `flame` | ignition source applied this step: `"lamp"` (lamp flame or held lit lamp at the mouth), `"burning"` (a burning object), or null |
| `inFumeHood` | container stands or is held inside the fume hood |
| `mixes` | array of `mixIn` results since the previous step |

### 3.5 Events (returned by stepMixture; the runtime adds `simId`)

- **Chemistry:**
  - `reaction { id }`: reaction info key; engine-tracked via `rule.info` and `notice`.
  - `warning { id, text? }`: safety pop-up (e.g. `water-into-acid`, `toxic-outside-hood`, `sodium-narrow`, `dangerous-mix`).
  - `gas { species, mmol }`: toxic gas left the container (M5 room haze).
- **Loud or bright moments:**
  - `pop { strength }`: H₂ test, small Na pop.
  - `bang { strength, radius }`: knockover and flash.
  - `flash { color, strength }`.
  - `spatter { radius, acid }`.
- **Container and fire changes:**
  - `shatter`: the container breaks.
  - `ignite` / `extinguish`.
  - `dry`: boiled dry.

### 3.6 fx (per step, reset each step; renderers smooth over time)

| key | value | drawn as |
|---|---|---|
| `bubbles` | `{ rate (mmol gas/s), site: bottom\|pieces\|surface\|tube, gas }` | rising bubbles in the liquid; ~60 bubbles/s per mmol/s, capped |
| `foam` | 0..1 | foam layer on the surface; 1 reaches the rim and spills over |
| `boiling` | 0..1 | agitated surface + large bubbles |
| `steam` | 0..1 | white wisps above the mouth |
| `smoke` | `{ rate 0..1, color, toxic }` | smoke column from the mouth / burning object |
| `flame` | `{ kind, intensity 0..1 }` | kinds: `lamp`, `ethanol` (pale blue, almost invisible, heat shimmer), `magnesium` (blinding white + bloom + sparks), `sulfur` (dim blue), `sulfur-oxygen` (bright violet-blue), `permanganate` (lilac-white + sparks), `sodium` (bright yellow), `hydrogen` (pale blue tip flame), `sodium-water` (small yellow) |
| `glow` | `{ color, amount 0..1 }` | contents glowing red-orange (Fe + S) |
| `spatter` | 0..1 | droplets thrown out of the mouth |
| `column` | 0..1 | black porous carbon column rising out of the beaker (1 = twice its height) |
| `char` | 0..1 | sugar darkening: white → #d9b44a → #6b3e1e → #111111 on the bed |
| `plume` | 0..1 | coloured streams spreading from crystals (liquid tint colour) |
| `schlieren` | 0..1 | wavy refraction streaks in the liquid |
| `sodiumBall` | `{ size 0..1, burning }` | molten sodium ball skating on the surface |
| `sparks` | 0..1 | sparks above the mouth |
| `flash` | 0..1 | brief light (respect reduce-flashing: ≤ 3 flashes/s, dimmed) |
| `crackle` | 0..1 | reserved for M6 sound |

### 3.7 appearance(m) output

```js
{
  volumeMl, tempC, ph,
  liquid: { color, opacity, turbidity, turbidColor, viscous },
  bed: { ml, color },          // settled precipitate and powder (visual ml, exaggerated for gels)
  floating: { ml, color },     // unwetted powder on the surface (sulfur)
  pieces: [{ species, shape, count, grams, color, coat: { color, amount } | null, glow, state }],
  crystals,                    // mmol of silver crystals (tree size)
  headspace: { color, opacity },
  fx,                          // §3.6
}
```

## 4. Lab runtime (sim/)

- `createLab()` provides:
  - `ensureContainer(simId, typeId, init)`, `container`, `mixture`, `removeContainer`.
  - `visual(simId)`: appearance, cached per step.
  - `device(simId)`, `ensureDevice`, `setDevice(simId, patch)`: bumps the version and notifies.
  - `subscribe(simId, listener)`, `version(simId)`, `step(dt, ctxFor)`, `reset`.
- `useLab()` returns the lab or null.
- `useDeviceVersion(simId)` re-renders a component when that device's discrete state changes. Read continuous values in `useFrame` through `lab.visual()` / `lab.device()`.

**Device state shapes** (read-only for models; tools write them):

| typeId | device state |
|---|---|
| `spirit-lamp` | `{ lit, capOn, fuelMl, boost 0..2 (O₂ stream), dousing 0..1 (CO₂ stream) }` |
| `hot-plate` | `{ level 0..4 (Off/50/100/200/300 °C), setC, plateC, stir }` |
| `gas-jar` | `{ coverOn }` + container mixture |
| `digital-scale` | `{ readingG }` |
| `thermometer` | `{ readingC }` |
| `dropper` | `{ fillMl, capacityMl: 2, color, opacity }` |
| `spatula` | `{ load: null \| { grams, color, grain } }` |
| `crucible-tongs` | `{ piece: null \| { species, shape, grams, color, state: { hot, molten, burning } } }` |
| `ph-paper` | `{ strip: null \| { color, ph } }` |
| `funnel` | `{ solidsMl, solidsColor, wet 0..1 }` |
| `sub:<liquid>` | `{ remaining 0..1, capOn }` |
| `sub:<powder\|solid>` | `{ remaining 0..1, capOn }` |
| `sub:<gas>` | `{ flow 0..1 }` |

## 5. Rendering contract

**Models**
- Every model takes an optional `simId` and forwards it to its live parts.
- Glassware replaces its static `<Liquid>` with `<Contents simId vessel={{ innerProfile, capacityMl, mouthY, mouthR }} fallback={{ volumeMl, color, opacity }} />` (kit component).
- Liquid level must never rebuild geometry per frame. Build the column once, clip at the level in the shader, and scale/position a surface disc. Colours and opacity go through uniforms with ~0.3 s smoothing.
- Draw order stays inner glass 1 → contents 2 → outer glass 3.

**Effects** (`effects/`) are plain R3F components in local space:
- Geometry comes as props (origin, radius, height).
- Live parameters come through `get` (a function called once per frame) that returns the current params or null.
- Every effect has a Low-tier path (`useKit().quality === "low"`): fewer particles and no refraction passes.
- Budget: ≤ 800 instanced particles across all effects at once on Low and ≤ 3000 on High; a typical effect is 1–2 draw calls.
- Honour `lab.prefs.reduceMotion`: dim flashes and no strobe.

## 6. Ownership for parallel work

| area | owner | files |
|---|---|---|
| chemistry core, runtime, world integration, tools, HUD, monitor, routing | lead | `chemistry/{species,sources,mixture,acidity,appearance,engine}.js`, `sim/*`, `world/*`, `tools/*`, `components/*`, `LabRoomPage.jsx`, `scene/*` |
| reaction rules + reaction texts + tests | agent C | `chemistry/rules/*`, `chemistry/reactionInfo.js`, `chemistry/warningInfo.js`, `chemistry/tests/*` (add species to `species.js` only by appending, and report them) |
| effects library | agent B | `effects/*` (new) |
| contents renderer + live models | agent A | `equipment/kit/Contents*.jsx`, `equipment/kit/liquidShading.js` (new), `equipment/models/*`, `substances/templates/*` (live `remaining` / `capOn` via simId) |

Agents do not edit files outside their row; they report needed changes instead.

## 7. Conventions
- Comments are one short line, only when the reason is not obvious. No multi-line docblocks.
- User-facing text is Uzbek (reaction info, warnings); code identifiers are English.
- No new npm dependencies.
- Lint must stay clean: `npx eslint src/lab/features/chemistry/lab-room/`. React-hooks v7 rules apply:
  - no mutating hook values or props;
  - refs are read and written only in effects and callbacks;
  - `useMemo` takes an inline function;
  - no `performance.now()` in render or handlers (use `event.timeStamp`).
- Dispose of materials, geometries and textures created in `useMemo`.

## 8. Verification

**Engine tests:**

```bash
cd client && node --import ./src/lab/features/chemistry/lab-room/chemistry/tests/resolve.js --test "src/lab/features/chemistry/lab-room/chemistry/tests/*.test.js"
```

**Visual bench** (dev server on 5173, Playwright from `/Users/shukrullo/Desktop/lc-total/client/node_modules/playwright/index.mjs`, `channel: "chromium"`, args `--use-angle=metal --enable-gpu --ignore-gpu-blocklist`):

```
http://localhost:5173/chemistry/lab-3d?autostart=1&hud=0&fxlab=agno3-hcl,mg-hcl&t=4&pose=0.3,-0.1,0,-18&eye=1.12&fov=50
```

- The page sets `window.__labFx = { lab, clock, rows }` and `window.__labRoom.phase()`. Wait for phase `playing` and `__labFx`, then capture.
- `?t=` pre-runs the timeline.
- Scenario names are in `sim/scenarios.js`; `fx:*` scenarios force visuals for effect work.
- Low tier: set localStorage `LearnStuff:lab-room:settings` to `{ "quality": "low", "sensitivity": 1, "showFps": true, "reduceMotion": false }`.
