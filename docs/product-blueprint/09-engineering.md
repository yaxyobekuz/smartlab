# Engineering

## Snapshot
Not built yet — Engineering is a **net-new subject** with zero existing topics in `subjects.js` (proposed slug `"engineering"`, title `"Muhandislik"`, color `#0891b2`, icon `Cog`). The platform already ships the exact primitives it needs: R3F/drei GLB scenes (anatomy, cells), 2D SVG builders (electronics/arduino), Gemini AI reactions (chemistry lab), and recharts. **Vision:** turn abstract statics, thermodynamics, and materials into a hands-on "build it, load it, watch it fail" sandbox where a learner drags loads onto a truss, over-stresses a beam, and watches an engine cycle turn heat into motion — every number derived from real physics, not canned animations.

## Feature Tree

| Branch | Concrete instantiation for Engineering | Status | Priority |
|---|---|---|---|
| **Theory** | Illustrated cards per topic ("Kuchlar muvozanati", "Kernel: Tension vs Compression", "Karno sikli") with inline mini-diagrams and formula callouts, MDX-driven | 🆕 | P0 |
| **Experiment** | "Virtual sinov stendi": hang calibrated weights on a physical-feeling beam/spring and read deflection/strain live (guided lab flow) | 🆕 | P1 |
| **Simulation** | Real-time solvers: truss method-of-joints, Euler–Bernoulli beam, Otto/Carnot P–V engine, Bernoulli pipe flow | 🆕 | P0 |
| **Calculator** | "Muhandis kalkulyatori": beam deflection, safety factor, gear ratio, stress = F/A, thermal efficiency, unit converter (SI↔Imperial) | 🆕 | P0 |
| **Interactive Graph** | recharts shear/moment diagrams, stress–strain curve, P–V & T–S loops, load-vs-deflection — all live-linked to demo sliders | 🟡 (recharts in stack) | P0 |
| **Challenge** | "Ko'prik quruvchi": build a truss under a budget, run the load test, survive the truck — pass/fail with cost score | 🆕 | P1 |
| **Quiz** | Concept checks ("qaysi sterjen siqilishda?", tag the free-body forces) — hooks the parallel quiz engine via a `quizId` field per topic | 🆕 | P1 |
| **AI Tutor** | Gemini "Muhandis ustoz": explains why a member failed, suggests a fix, grades free-body diagrams (reuses chemistry `useAiReaction` pattern) | 🟡 (Gemini wired) | P1 |
| **Real-life Examples** | Hotspot gallery: Golden Gate (suspension), bike gears, car engine, crane counterweight, dam pressure — each links to its demo | 🆕 | P2 |
| **Mini Game** | "Gear Rush": mesh a gear train to hit a target output RPM before the timer; "Load Balancer" stacking puzzle | 🆕 | P2 |
| **Achievements** | Badges: "Nol failure", "Safety factor > 3", "Karno chempioni", "Eng arzon ko'prik" — hooks parallel gamification via emitted events | 🆕 | P2 |
| **3D Models** | GLB library: gearbox, piston-crank, gooseneck crane, I-beam, planetary gearset — explode/label/animate (reuses drei loader pattern) | 🟡 (loader proven) | P0 |

## Demo Playground

| Demo | Status | Purpose | Learning Objective | UI | Animations | Controls | Input | Output | Result | Difficulty | Dev (days) |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **Simple Machines** (lever/pulley/gear) | 🆕 | Show mechanical advantage | MA = load/effort, work conserved | R3F scene, side toolbar | lever tilts, rope pulls, gears mesh | drag fulcrum, add pulleys, pick gear teeth | effort force, arm lengths, teeth count | MA, effort needed, distance traded | "half the force, twice the distance" — energy is conserved | Beginner | 6 |
| **Gear Train Ratio** | 🆕 | Torque/speed trade in gearsets | ratio = N_out/N_in, compound trains | R3F top-down + readout HUD | synchronized meshing, RPM dial | add/remove gears, set teeth, drive RPM | input RPM, teeth per gear | output RPM, torque multiplier, direction | reversing + big ratio from small stacked gears | Beginner | 4 |
| **Pulley / Block-and-tackle** | 🆕 | Force reduction via rope segments | supporting ropes = MA | SVG 2D + weight | rope reeving animates, load lifts | add sheaves, set load, pull slider | load weight, # sheaves | effort force, rope pulled | 4-rope tackle → 1/4 effort | Beginner | 4 |
| **Truss / Bridge Load** | 🆕 | Solve statically-determinate trusses | tension vs compression, joint equilibrium | SVG canvas, node/member editor | members flash red(C)/blue(T), deflect | drag load onto joint, move supports | geometry, load magnitude | per-member axial force, reactions | "the diagonal is in compression" color-coded live | Intermediate | 9 |
| **Beam Bending** | 🆕 | Deflection & internal forces | Euler–Bernoulli, EI stiffness | R3F beam + recharts panels | beam sags in real time | slider load/position, pick section & material | load, span, E, I | max deflection, shear & moment diagrams | doubling depth → 8× stiffer (I∝h³) aha | Intermediate | 7 |
| **Column Buckling** | 🆕 | Slender members fail by buckling | Euler critical load, end conditions | R3F column + gauge | column bows then snaps at P_cr | slider axial load, pick end-fixity, length | length, E, I, fixity | P_critical, buckled shape | short strut crushes, long one buckles far sooner | Intermediate | 5 |
| **Structural Stress** (FEA-lite) | 🆕 | Visualize stress concentration | von Mises, safety factor, notches | R3F/canvas heatmap on a bracket | color field updates on load drag | drag load vector, add fillet/hole, material | load, geometry, yield strength | von Mises heatmap, max stress, SF | hole edge is the hot-spot; a fillet cools it | Advanced | 14 |
| **Hydraulic Press** (Pascal) | 🆕 | Pressure transmits force | P constant, F=P·A, area amplifies | SVG two-piston rig | fluid + pistons move, load crushes | drag small piston, resize piston areas | input force, area ratio | output force, travel distance | tiny push crushes a car — force up, distance down | Beginner | 4 |
| **Fluid Flow** (Bernoulli/Venturi) | 🆕 | Speed↔pressure in pipes | continuity + Bernoulli | canvas particle streamlines | particles speed up in throat | drag pipe radius, inlet velocity | pipe profile, flow rate | velocity, pressure gauges, streamlines | narrow throat = fast flow, low pressure | Advanced | 12 |
| **Thermodynamics Engine Cycle** | 🆕 | How heat becomes work | Otto/Carnot/Diesel, efficiency | R3F piston-crank + recharts P–V | piston strokes synced to P–V dot | pick cycle, set compression ratio, temps | cycle type, ratios, T_hot/T_cold | efficiency %, work/cycle, P–V loop area | loop area = net work; higher ratio = more efficient | Advanced | 9 |
| **CAD-lite Part Builder** | 🆕 | Parametric solid modeling | sketch→extrude, boolean ops | R3F viewport + sketch pane | extrude grows, boolean carves | draw 2D sketch, extrude/revolve, fillet, subtract | 2D profile, dimensions | 3D solid, mass, volume, STL export | your own bracket, printable in one click | Advanced | 18 |
| **3D-Print Slicer Preview** | 🆕 | Turn a model into printer layers | layer height, infill, toolpath | R3F model + layer scrubber | layer-by-layer build-up + head path | scrub layers, set height/infill %, orient | STL/GLB, slice settings | layer count, est. time/filament, G-code preview | watch it "print"; thin layers = smooth but slow | Advanced | 12 |
| **Bridge Builder Challenge** | 🆕 | Design under constraints | budget vs strength optimization | SVG editor + truck test | truck rolls, weak members snap | place members, hit "Test", pay budget | node/member layout, budget | pass/fail, cost, weakest member | cheapest bridge that survives the truck | Intermediate | 16 |

## 3D / Interactive Experiences

| Experience | Interactions | What it teaches | Complexity |
|---|---|---|---|
| **Gearbox cutaway** | rotate, zoom, explode, animate, labels, hotspots | how a multi-stage gearbox steps torque up/down | Medium |
| **Piston–crank engine** | rotate, cross-section, animate, measure (stroke), labels | reciprocating→rotary motion, 4-stroke timing | Medium |
| **I-beam vs section shapes** | rotate, cross-section, measure, compare-toggle | why the I profile maximizes stiffness per kg (I∝h³) | Low |
| **Suspension bridge** | rotate, zoom, hotspots, animate (load), labels | cables in tension, towers in compression, load paths | Medium |
| **Planetary gearset** | rotate, explode, animate, labels, measure ratio | sun/planet/ring ratios, what's held fixed changes output | High |
| **Crane + counterweight** | rotate, animate lift, measure moments, hotspots | moment balance, tipping, why counterweights exist | Medium |
| **Truss bridge stress-color** | rotate, hotspots, animate (add load), labels | live tension/compression coloring per member | High |
| **Bearing / bolted joint** | explode, cross-section, labels, hotspots | preload, friction, fasteners, clearance fits | Medium |
| **Hydraulic cylinder** | cross-section, animate, measure, labels | Pascal's law inside a real actuator | Low |

## Roadmap (skill ladder)

| Level | Focus | Topics & Demos | Outcome |
|---|---|---|---|
| **Beginner** | Forces, machines, mechanical advantage | Simple Machines, Gear Train Ratio, Pulley, Hydraulic Press; Theory cards on forces & work | Reads a lever/gear setup and predicts effort, speed, and direction |
| **Intermediate** | Statics & structures | Truss/Bridge Load, Beam Bending, Column Buckling, Bridge Builder challenge; shear/moment graphs | Solves a simple truss, sizes a beam, and knows tension vs compression |
| **Advanced** | Materials, fluids, energy | Structural Stress (von Mises), Fluid Flow, Thermodynamics Engine Cycle; stress–strain & P–V graphs | Interprets a stress field, applies Bernoulli, and computes engine efficiency |
| **Expert** | Design & manufacturing | CAD-lite Part Builder, 3D-Print Slicer, AI-graded design challenges; safety-factor optimization | Models a custom part, checks its safety factor, and prepares it to print |

## Feature Economics

| Feature | Purpose | Educational Value | Complexity | Priority | Dev Cost | Est User Engagement |
|---|---|---|---|---|---|---|
| **Simulation solvers** (truss/beam/thermo/fluid) | Physics-real, not scripted | Very High | High | P0 | ~5 dev-weeks total | Very High |
| **Beam Bending + live graphs** | Flagship "wow" with math linkage | Very High | Med | P0 | 7 dev-days | High |
| **Simple Machines sandbox** | Low-floor entry demo | High | Low | P0 | 6 dev-days | High |
| **Muhandis kalkulyatori** | Daily-use utility, sticky | High | Low | P0 | 4 dev-days | High |
| **3D model library (GLB)** | Reuses proven loader, visual payoff | High | Med | P0 | ~8 dev-days | Med |
| **Bridge Builder Challenge** | Game-loop retention driver | High | High | P1 | 16 dev-days | Very High |
| **Structural Stress (FEA-lite)** | Signature advanced demo | Very High | Very High | P1 | 14 dev-days | Med |
| **AI Muhandis Ustoz** | Personalized feedback, grades FBDs | High | Med | P1 | ~6 dev-days | Med |
| **CAD-lite Part Builder** | Creator tool, exports STL | High | Very High | P2 | 18 dev-days | Med |
| **3D-Print Slicer Preview** | Bridges design→manufacturing | Med | High | P2 | 12 dev-days | Med |

---
**Build order (opinion):** ship P0 as a coherent first release — Simple Machines + Beam Bending + Calculator + 3D library + the shared recharts graph component — because they share one solver/graph substrate and prove the subject. Bridge Builder and FEA-lite are the retention and prestige pieces for release 2; CAD-lite + Slicer are a release-3 creator arc. Registry hook: add the `engineering` entry to `client/src/lab/data/subjects.js` with topics `simple-machines`, `structures`, `beams`, `thermo-fluids`, `cad`; each topic object gains a `quizId` and emits `achievement` events so the parallel quiz/gamification systems can bind without touching demo code.
