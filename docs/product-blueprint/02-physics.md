# Physics

## Snapshot
Today Fizika ships three uneven topics: a genuine react-three-fiber **Solar system** (6 of 8 planets, orbits + clickable planets, rides `LabWorkspace` so it gets Mira AI/VR/toolbar free), a shallow **Wave & oscillation** page (3 frozen presets, decorative/fake physics, no sliders), and a **Quantum coin toss** that is just a PhET `_en` iframe bypassing all shared chrome. The through-line gap: this is *physics* yet **not one measured, manipulable number** is ever shown. Vision: turn Fizika from a preset picker into a **parameterized measurement lab** — every topic a slider-driven sim that emits live numbers (T, v, F, R, f), plots them, feeds them to Mira, and ends in a predict→reveal checkpoint.

## Feature Tree

| Branch | Concrete instantiation for Physics | Status | Priority |
|---|---|---|---|
| **Theory** | Per-topic Uzbek concept cards with KaTeX formula sheets (Nyuton qonunlari, `T=2π√(L/g)`, `1/f=1/d₀+1/dᵢ`, `V=IR`) replacing the current one-line `info` prose | 🟡 (prose only) | P1 |
| **Experiment** | Guided lab protocols with a data table: "L ni o'zgartiring, T ni yozing" → user logs 5 rows, app plots T vs √L and fits the line | 🆕 | P1 |
| **Simulation** | The Demo Playground — R3F/canvas parameterized sims (projectile, spring, circuit, lens…) driven by real slider values, not preset objects | 🟡 (solar/wave are presets) | **P0** |
| **Calculator** | Formula calculators mirroring chemistry's molar-mass tools: Kinematika (`v²=v₀²+2as`), Om qonuni, Linza tenglamasi, Mayatnik davri | 🆕 | P1 |
| **Interactive Graph** | Live synced plots beside each sim: x-t / v-t / a-t for motion, energy-bar chart (KE↔PE) for pendulum/spring, V-I line for circuits (Recharts or canvas) | 🆕 | P1 |
| **Challenge** | "Bashorat qiling → ochib ko'ring": predict pendulum T after doubling L, predict projectile range, predict measurement histogram — the shared parallel checkpoint, wired to `subjects.js` | 🆕 | P1 |
| **Quiz** | Per-topic MCQ + **numeric-answer** items graded by tolerance ("hisoblang: 45° da uzoqlik?") — needs the parallel quiz engine | 🆕 | P2 |
| **AI Tutor** | Mira panel already grounded on `cleanActiveData` numeric fields; extend so it reads live slider state ("nega davr o'zgarmadi amplituda o'zgarganda?") | ✅ solar/wave, 🟡 overall | P1 |
| **Real-life Examples** | Card strip per topic: Tacoma ko'prigi rezonansi (wave), GPS va nisbiylik (gravity), MRI magnitlari, generator↔GES, ko'zoynak linzasi | 🆕 | P2 |
| **Mini Game** | "Nishonga ur" projectile targeting (Angry-Birds style, 3 shots), "Zanjirni yop" circuit puzzle, "Rezonansni top" frequency-match | 🆕 | P2 |
| **Achievements** | Badges (Orbit ustasi, Rezonans ovchisi, 5 ta o'lchov) via the parallel gamification layer, keyed off checkpoint/quiz completion | 🆕 | P3 |
| **3D Models** | R3F scenes: solar system, motor/generator cutaway, wave field, magnetic field lines, optical bench | ✅ solar, 🟡 rest | P1 |

## Demo Playground

| Demo | Status | Purpose | Learning Objective | UI | Animations | Controls | Input | Output | Result | Difficulty | Dev (days) |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **Projectile Motion** | 🆕 | Decompose motion into x/y | Range/height depend on angle & v₀; 45° maximizes range | R3F cannon + parabola trail, ground target | Ball fires along parabola, ghost trail, apex marker | Angle, v₀, gravity, air-drag toggle sliders | θ, v₀ (m/s), g | Live range, max-height, flight-time; x-t/y-t graph | "45° otadi eng uzoqqa" seen, not told | Med | 4 |
| **Gravity (free-fall + orbit)** | 🟡 (orbit in solar) | Mass-independent fall; orbital `v=√(GM/r)` | Feather & hammer fall equal in vacuum; orbit speed vs radius | R3F drop tube (vacuum toggle) + reuse solar orbit | Two objects drop, air vs vacuum divergence | Mass, air toggle, planet-g preset (Moon/Mars/Earth) | m, g preset | Fall time, impact v, "bir vaqtda tushdi" | Vacuum equalizes fall — the aha | Med | 3 |
| **Spring Force (Hooke/SHM)** | 🆕 | F=-kx and SHM energy | Period depends on k & m, not amplitude; KE↔PE swap | R3F vertical spring + mass, energy bars | Coil stretch/compress, bouncing mass | k, mass, initial stretch, damping | k (N/m), m, x₀ | Live T, F, KE/PE bar chart | Amplitude ↑ but T same — counterintuitive | Med | 4 |
| **Momentum & Collisions** | 🆕 | Conservation of p (and KE) | Elastic vs inelastic; p in = p out | 2D canvas air-track, two carts | Carts collide, stick or bounce, vectors | m₁,m₂,v₁,v₂, elasticity slider | masses, velocities | p-before/after, KE-before/after, Δ readout | p always conserved, KE only if elastic | Med | 4 |
| **Electric Circuit (Ohm)** | 🟡 (electronics reuse) | V=IR, series/parallel | Current splits/adds by topology; R controls I | 2D SVG breadboard reusing `/electronics` offline JS sim engine | Electron flow dots, bulb brightness ∝ P | Battery V, R sliders, add resistor, series/parallel toggle | V, R values | I, total R, per-branch I, power, bulb glow | Parallel halves R, doubles I — measured | Med | 5 |
| **Lens (converging/diverging)** | 🆕 | Thin-lens `1/f=1/d₀+1/dᵢ` | Image position/size/inversion vs object distance | 2D SVG optical bench, principal rays | Rays refract, image forms/flips as object drags | Focal length, object distance, lens type | f, d₀ | dᵢ, magnification, real/virtual, upright/inverted | Cross the focal point → image flips | Med | 4 |
| **Mirror (concave/convex)** | 🆕 | Reflection & mirror equation | Concave real vs virtual; convex always virtual | 2D SVG (shares lens ray-tracer) curved mirror | Reflected rays converge, image forms | Radius/f, object distance, mirror type | R, d₀ | dᵢ, magnification, image type | Object inside f → magnifying-mirror effect | Low (post-lens) | 2 |
| **Pendulum** | 🟡 (fake in wave) | `T=2π√(L/g)`, SHM | T depends on L & g only — not mass, not amplitude | R3F pendulum (fix current fake `sin(t·f)`) + energy bars | Real θ integration, arc trail | Length, mass, g, release angle | L, m, θ₀ | **Live computed T**, angular speed, KE/PE | Longer string → slower, heavier bob → no change | Low (fix existing) | 2 |
| **Wave** | 🟡 (presets) | Amplitude/frequency/λ, superposition | A↔height, f↔pitch/speed, two waves interfere | R3F line + `bufferGeometry` (extend existing WaveModel) | Traveling wave, standing-wave nodes, beat pattern | Amplitude, frequency, λ, 2nd-wave toggle | A, f, λ | Period, wave speed `v=fλ`, node count | Two waves → standing wave / beats emerge | Med | 4 |
| **Magnetism (field lines)** | 🆕 | B-field of magnet & current wire | Field direction, compass alignment, right-hand rule | R3F bar magnet + iron-filing field lines, draggable compass | Filings snap along B, compass needle rotates | Magnet strength, flip poles, wire current | B strength, I | Field-line density, compass angle | Compass follows the field you can't see | Med | 4 |
| **Electric Motor** | 🆕 | Current + B → torque (F=BIL) | How electrical energy becomes rotation | R3F cutaway: coil, magnets, commutator | Coil spins as current flips each half-turn | Voltage, field strength, load slider | V, B | RPM, torque, direction | Reverse polarity → reverses spin | High | 6 |
| **Generator** | 🆕 | Faraday: rotation + B → EMF | Motor run backwards; `EMF ∝ dΦ/dt` | R3F loop rotating in field + AC output graph | Loop spins by hand-crank, sine EMF traces live | Crank speed, coil turns, field strength | ω, N, B | Peak EMF, frequency, live V-t sine | Spin faster → bigger, faster sine wave | High | 5 |
| **Free-fall & Air Resistance** | 🆕 | Drag → terminal velocity | Real bodies stop accelerating at v_terminal | 2D canvas skydiver + v-t graph | Speed rises then plateaus, parachute deploy | Mass, drag coeff, area, parachute button | m, Cd, A | v_terminal, live v-t curve | Parachute drops v_terminal instantly | Med | 3 |
| **Refraction & Snell's Law** | 🆕 | `n₁sinθ₁=n₂sinθ₂`, TIR | Light bends by index; total internal reflection | 2D SVG boundary, draggable incident ray | Ray bends at surface, flips to TIR past critical angle | Incidence angle, n₁, n₂ (medium presets) | θ₁, n values | Refraction angle, critical angle, TIR flag | Past critical angle → light trapped | Low | 2 |
| **Doppler Effect** | 🆕 | Moving source shifts f | Approaching = higher pitch, receding = lower | 2D canvas source + expanding wavefronts + observer | Wavefronts bunch ahead / stretch behind moving source | Source speed, direction, observer position | v_source | f_observed vs f_source, Δf | Ambulance pitch drop, visualized | Med | 3 |
| **Quantum Superposition (native)** | 🆕 (replaces PhET) | Superposition & measurement collapse | State is 50/50 until measured; stats emerge over trials | Native R3F/canvas coin in `LabWorkspace` (offline, Uzbek) | Coin spins as blur, collapses on "O'lcha", histogram fills | Toss count, bias slider, measure/reset | N tosses, P(heads) | Live heads/tails histogram vs predicted | Many trials converge to predicted distribution | Med→High | 5 |

## 3D / Interactive Experiences

| Experience | Interactions | What it teaches | Complexity |
|---|---|---|---|
| **Solar system orbit lab** (upgrade) | rotate · zoom · click-planet · **fly-to camera lerp** · self-rotation + axial tilt · hotspots · numeric labels (diameter/AU/period/g/moons) · scaled↔real toggle | Orbital periods, relative sizes/distances, why inner planets are faster | Med (extends existing) |
| **Motor ↔ Generator cutaway** | rotate · **explode** commutator/coil/magnets · cross-section · animate spin · labels · reverse-polarity toggle | Electromechanical energy conversion both directions (same machine) | High |
| **Optical bench** | drag object · drag lens/mirror · animate rays · measure dᵢ/magnification · toggle lens↔mirror | Ray tracing, real vs virtual images, focal geometry | Med |
| **Magnetic field explorer** | rotate · drag compass (hotspot) · flip poles · animate filings · measure B at point | Invisible fields have direction & strength; right-hand rule | Med |
| **Standing-wave string** | drag frequency · pluck · animate nodes/antinodes · measure λ · harmonic snap | Resonance, harmonics, `v=fλ` | Med |
| **Projectile range arena** | drag angle/velocity · fire · trail · measure range/apex · target hotspots | Vector decomposition, optimal angle | Med |
| **Pendulum + energy** (fix) | drag length/angle · release · animate arc · measure live T · energy bars | SHM, period law, KE↔PE conservation | Low–Med |
| **Circuit playground** | drag wires (SVG) · toggle switch · add components · animate electron flow · measure I/V/R | Ohm's law, series vs parallel, power | Med (reuse electronics sim) |
| **Quantum measurement chamber** | spin · press "O'lcha" · reset · animate collapse · read histogram | Superposition, probabilistic collapse, statistics from repetition | Med |

## Roadmap (skill ladder)

| Level | Focus | Topics & Demos | Outcome |
|---|---|---|---|
| **Beginner** | Observe & name | Solar system (upgraded, 8 planets + numbers), Pendulum (fixed T), Free-fall in vacuum, basic Wave | Reads a sim's numeric readout; predicts "longer string = slower"; names amplitude/frequency |
| **Intermediate** | Manipulate & measure | Projectile, Spring/Hooke, Ohm circuit, Lens & Mirror, Refraction | Runs a slider-driven experiment, records data, states the governing relationship in words |
| **Advanced** | Relate & derive | Momentum collisions, Standing waves/interference, Doppler, Magnetism, Motor | Uses formulas via the Calculator branch; passes numeric-answer quizzes within tolerance |
| **Expert** | Connect & model | Generator↔Motor duality, Orbital `v=√(GM/r)`, Quantum superposition statistics, cross-topic challenges | Explains energy conversion & conservation across systems; completes predict→reveal checkpoints with reasoning to Mira |

## Feature Economics

| Feature | Purpose | Educational Value | Complexity | Priority | Dev Cost | Est User Engagement |
|---|---|---|---|---|---|---|
| **Wave → real slider simulator + standing waves** | Convert weakest page into the flagship teachable sim | Very High | Med | **P0** | ~4 dev-days | Very High |
| **Solar-system numeric enrichment + Uranus/Neptune + fly-to** | Deliver the facts the code already promises; grounds Mira | High | Low–Med | P1 | ~3 dev-days | High |
| **Pendulum honest physics (`T=2π√(L/g)` live)** | Kill the fake `sin(t·f)`; make a real measurable law | High | Low | **P0** | ~2 dev-days | High |
| **Electric Circuit (reuse offline `/electronics` engine)** | High-yield topic at low cost via existing sim engine | Very High | Med | P1 | ~5 dev-days | Very High |
| **Projectile Motion arena + mini-game** | Iconic, gamifiable, strong intuition builder | High | Med | P1 | ~5 dev-days | Very High |
| **Optical bench (Lens + Mirror shared ray-tracer)** | Two curriculum topics from one SVG engine | High | Med | P1 | ~6 dev-days (both) | High |
| **Native Quantum Superposition (replace PhET iframe)** | Offline + Uzbek + gets Mira/VR/toolbar; removes network dependency | Med–High | Med–High | P2 | ~5 dev-days | Med |
| **Formula Calculator suite (kinematics/Ohm/lens/pendulum)** | Bridges sims to symbolic math; mirrors chemistry tools | High | Low–Med | P1 | ~4 dev-days | High |
| **Predict→Reveal checkpoint (shared, wired first in physics)** | Turns passive watching into active prediction; feeds gamification | Very High | Med | P1 | ~4 dev-days (shared component) | Very High |
| **Motor/Generator cutaway 3D** | Signature "wow" 3D model; energy-conversion capstone | High | High | P2 | ~8 dev-days (both) | High |

---
Grounded in real files: `client/src/lab/features/physics/{solar-system,wave,quantum-coin}/`, data at `client/src/lab/data/{planets.js,waves.js}`, shared chrome `client/src/lab/components/{LabWorkspace.jsx,Scene.jsx,usePausableFrame.js}` (numeric fields survive `cleanActiveData` `OMIT_FIELDS` → auto-ground Mira), registry `client/src/lab/data/subjects.js`. Circuit/quantum reuse the offline JS sim engine from `/electronics`. Quiz/checkpoint/achievements depend on the parallel engines and are marked 🆕.
