# Electronics

## Snapshot
Today the subject is a single topic — `electronics/arduino` → `CircuitPage`: a genuinely working 2D SVG Tinkercad-style builder wired to a from-scratch Arduino-sketch interpreter running on a virtual clock. It is a **connectivity** simulator, not a **circuit** simulator — `ohms` is never read, `Serial` is a stub, there's zero persistence, and the Uzbek lesson text already in `templates.js` is never rendered. **Vision:** grow it into the lab's flagship maker-curriculum — a real analog+digital sandbox that teaches from Ohm's law to op-amps to PCB layout, where every component behaves electrically, mistakes are explained in Uzbek, and every lesson has one interactive experience.

## Feature Tree

| Branch | Concrete instantiation for Electronics | Status | Priority |
|---|---|---|---|
| **Theory** | Render the dead `templates.js` `description` blurbs as one-line micro-lessons on load; add short concept cards ("Ohm qonuni", "Kirchhoff qonunlari", "PWM nima") inline in the right rail | 🟡 (data exists, never shown) | P1 |
| **Experiment** | The live `CircuitPage` — drop parts, drag wires, write a sketch, hit Run, watch LED/servo/motor react | ✅ built | — |
| **Simulation** | Ohm's-law layer on top of the union-find netlist: current ∝ V÷ΣR, LED brightness/burnout, short-circuit + reverse-diode detection (analog SPICE-lite) | 🆕 (netlist ✅, physics 🆕) | P0 |
| **Calculator** | `Rezistor kalkulyatori` (color→Ω & Ω→color, band logic already half-exists), LED series-R calc, voltage divider, RC time-constant τ, 555 frequency calc | 🟡 (band colors exist) | P1 |
| **Interactive Graph** | V–I curve plotter (linear R vs diode knee), RC charge/discharge exponential, transistor Iᴄ–Vᴄᴇ family, op-amp/RC Bode plot — SVG/`<canvas>` line charts driven by sim state | 🆕 | P2 |
| **Challenge** | Goal mode over `templates.js` + netlist pass-checks: "LEDni 2× tez miltillat", "3.3 V chiqar", "tugma bosilganda motor aylansin" — checker reads `board.readVisuals`/pin timing | 🆕 | P1 |
| **Quiz** | MCQ + "sxemani o'qi" + "rezistor rangini top" sets; hooks the parallel quiz engine, scored via a shared results contract | 🆕 | P2 |
| **AI Tutor** | Gemini "Nega LED yonmayapti?" debugger — feeds netlist summary + sketch + warnings, returns an Uzbek fix (reuses the chemistry Gemini pipeline) | 🆕 (infra exists) | P1 |
| **Real-life Examples** | "Bu qayerda ishlatiladi" cards: LED chiroq, telefon zaryadlovchisi (diode bridge), termostat (NTC divider), PWM motor tezligi — each links to a matching demo | 🆕 | P2 |
| **Mini Game** | `Sim ulash` — beat-the-timer wiring, or "rezistor rangini top" flashcard rush | 🆕 | P3 |
| **Achievements** | Badges: Birinchi Blink, Birinchi PWM, Rezistorni to'g'ri tanla, Nol qisqa tutashuv, 555 osilator quruvchi | 🆕 | P3 |
| **3D Models** | R3F viewers for breadboard, Uno, and discrete parts with explode/cross-section; a 3D "how a resistor is built inside" and NPN transistor doping model | 🆕 | P2 |

## Demo Playground

| Demo | Status | Purpose | Learning Objective | UI | Animations | Controls | Input | Output | Result | Difficulty | Dev (days) |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **Resistors** | 🟡 (part + bands exist, ohms inert) | Teach resistance & color code | Read bands ↔ Ω; R limits current | SVG resistor + band editor + live meter | Current-density heat glow when overdriven | 4/5-band dropdowns, R slider (Ω) | Chosen Ω, applied V | I, P dissipation, band colors | "Kichik R → ko'p tok → qizib ketdi" | Med | 3 |
| **LED + Current Limiting** 🆕 | 🆕 | Why an LED needs a resistor | Vꜰ knee + series R math | LED body + inline R + ammeter badge | Brightness ramps with I; smoke puff on burnout | Resistor Ω slider, supply V | Ω, V | Brightness, mA, burnout flag | "R yo'q = kuygan LED" aha | Low | 2 |
| **Capacitors** | 🆕 | Charge storage & RC timing | τ = R·C; exponential charge | SVG cap + RC loop + voltage bar | Plates fill, needle eases on curve | R slider, C slider, charge/discharge btn | R, C, V | Vᴄ(t), τ readout | "τ da 63% ga yetadi" | Med | 4 |
| **Diodes** | 🟡 (LED is a diode visually) | One-way current & knee voltage | Forward vs reverse; ~0.7 V drop | Diode symbol + V–I graph pane | Arrow current only forward; blocked reverse | Polarity flip, V sweep | V, direction | I, "bloklangan" state | "Teskari = tok yo'q" | Med | 3 |
| **Transistors (BJT)** | 🆕 | Small current controls big current | Base current gates collector | NPN symbol + two loops + gauges | Collector lamp brightens with base I | Base R slider, Vᴄᴄ | Iʙ, Vᴄᴄ | Iᴄ, gain β readout | "Kichik Iʙ → katta Iᴄ" | High | 5 |
| **MOSFET** | 🆕 | Voltage-controlled switch for power | Vɢꜱ threshold, low-loss switching | N-MOSFET + motor/LED load | Load turns on past Vₜₕ; gate charge sweep | Gate V slider, load pick | Vɢꜱ | On/off, Iᴅ | "Vₜₕ dan oshsa ochiladi" | High | 5 |
| **555 Timer** | 🆕 | Build an oscillator/timer IC | R/C sets frequency & duty | 8-pin IC block + R1/R2/C + scope | Square-wave trace scrolls; LED blinks in sync | R1, R2, C sliders, mode (astable/mono) | R1,R2,C | f, duty %, waveform | "R,C ni o'zgartir → tezlik" | High | 6 |
| **Op Amp** | 🆕 | Ideal amplifier building block | Gain = 1+Rf/Rin; virtual short | Triangle symbol + feedback Rs + graph | Output waveform scales/clips with gain | Rf, Rin sliders, input V/wave | Rin, Rf, Vin | Vout, gain, clip flag | "Gain oshsa → chegaraga uriladi" | High | 6 |
| **Voltage Divider** 🆕 | 🆕 | Derive a reference/sensor voltage | Vout = Vin·R2/(R1+R2) | Two stacked Rs + tap node meter | Tap node fills proportionally | R1, R2 sliders (or sensor mode) | R1, R2, Vin | Vout | "Yarmi = teng R" intuition | Low | 2 |
| **RC Filter** 🆕 | 🆕 | Frequency-dependent behavior | Low/high-pass cutoff fᴄ | RC + input-freq slider + Bode plot | Bode curve + attenuated output wave | Freq slider, R, C, filter type | f, R, C | Gain(dB), phase | "Yuqori chastota kesiladi" | Med | 4 |
| **Logic Gates** 🆕 | 🆕 | Digital building blocks | AND/OR/NOT/XOR truth tables | Gate symbols + toggle inputs + LED out | Wires light on HIGH; output LED toggles | Input toggles, gate picker | Input bits | Output bit + truth row | "Truth jadvalini o'zi to'ldiradi" | Med | 3 |
| **Breadboard** | ✅ (part exists, rails decorative) | Prototyping without solder | Which holes connect internally | Existing SVG breadboard, rails made live | Highlight the connected column on hover | Hover/tap a hole | Placement | Net-highlight overlay | "Ustunlar ichdan ulangan" | Med | 3 |
| **Power Supply** | 🟡 (battery part, no supply path) | Provide & regulate voltage | V/I limits, series/parallel cells | Bench-PSU panel + rails | Needle sweeps; current-limit LED trips | V knob, current-limit knob | V, I-limit | Delivered V, I, "limit!" | "Limitga urilsa V tushadi" | Med | 3 |
| **PCB** | 🆕 | From breadboard to real board | Traces, pads, routing basics | Grid layout view of a finished blink circuit | Trace-route draw animation; copper fill | Place part, drag trace, auto-route btn | Layout | Routed board + DRC flags | "Simlar = mis yo'llar" | High | 7 |

## 3D / Interactive Experiences

| Experience | Interactions | What it teaches | Complexity |
|---|---|---|---|
| **Breadboard cutaway (R3F)** | Rotate, zoom, cross-section, hotspots, labels | The hidden metal strips that make rows/columns one node | Med |
| **Arduino Uno explorer** | Rotate, zoom, hotspots on each pin, labels | What each header pin does (PWM~, A0–A5, 5V/GND) | Med |
| **Inside a resistor** | Explode, cross-section, labels | Carbon film/ceramic core → why bands map to Ω | Low |
| **Electron flow tube** | Animate, measure, slider (voltage) | Current = charge flow; more V → faster drift | Med |
| **NPN transistor doping model** | Rotate, explode, animate carriers | Base current opening the collector channel | High |
| **Capacitor charge visualizer** | Animate, slider, measure | Plates accumulating charge; field between them | Med |
| **555 IC internals** | Explode, hotspots, animate | Comparators + flip-flop + discharge → the timing loop | High |
| **Solder-joint macro** | Zoom, cross-section, good/bad toggle | Cold vs proper joint — real-world assembly literacy | Low |
| **Signal on a scope (R3F/canvas)** | Animate, measure, sliders | PWM duty, frequency, amplitude read off a live trace | Med |

## Roadmap (skill ladder)

| Level | Focus | Topics & Demos | Outcome |
|---|---|---|---|
| **Beginner** | What is a circuit; make something light up | Ohm's law, Resistors, LED + Current Limiting, Breadboard cutaway, Blink template + Serial monitor | Builds a resistor-limited LED, reads color codes, explains why the resistor matters |
| **Intermediate** | Analog behavior & sensors | Voltage Divider, Capacitors/RC, Diodes, Potentiometer/photoresistor analog input, PWM fade, Interactive V–I & RC graphs | Reads sensors, designs a divider for a target voltage, understands PWM dimming |
| **Advanced** | Active devices & control | BJT + MOSFET switching, 555 astable, Logic Gates, transistor motor driver, Challenge goal-mode circuits | Switches high-power loads correctly, builds an oscillator, drives a motor from a pin |
| **Expert** | Amplification & real hardware | Op Amp (gain/filters), RC/Bode filters, Power Supply regulation, PCB layout + routing, AI-tutor debugging of own designs | Designs a filtered amplifier stage and lays out a routable single-layer PCB |

## Feature Economics

| Feature | Purpose | Educational Value | Complexity | Priority | Dev Cost | Est User Engagement |
|---|---|---|---|---|---|---|
| **Serial monitor** (wire up stubbed `Serial.print*` into a pane) | Let learners inspect program state — the #1 real debugging tool | Very High | Low | **P0** | 2 dev-days | Very High |
| **Real Ohm's-law / current layer** (read `ohms`, model I, burnout, short) | Turn a connectivity sim into a circuit sim; makes resistors mean something | Very High | Med | **P0** | 4–5 dev-days | High |
| **Non-blocking miswiring diagnostics** ("LED teskari", "GND ulanmagan", "rezistor yo'q") | Convert silent failures into an in-Uzbek teacher | Very High | Med | **P1** | 3 dev-days | High |
| **Persistence + share** (localStorage autosave + JSON/URL export) | Stop wiping student work on refresh; enable sharing | High | Low | **P1** | 3 dev-days | High |
| **Touch add-a-part fallback** (tap-tile → drop at center) | Unblock phones/tablets — it's a public web app; DnD doesn't fire on touch | High | Low | **P1** | 2 dev-days | Very High |
| **Render lesson text + grow templates to ~12** | Ship the already-written pedagogy; scaffold easy→hard | High | Low | **P1** | 3 dev-days | High |
| **Challenge / goal mode** over templates + netlist checker | Progression, quiz-engine hook, replayability | Very High | Med | **P1** | 5–6 dev-days | Very High |
| **Calculators** (resistor code, LED-R, divider, RC τ, 555 f) | Fast standalone utility that pulls in casual users | High | Low | P2 | 4 dev-days | High |
| **Interactive graphs** (V–I, RC, transistor family, Bode) | Make invisible analog behavior visible | High | Med | P2 | 5 dev-days | Med |
| **AI tutor debugger** (Gemini reads netlist+sketch+warnings) | Personalized "why isn't it working" help; reuses chem Gemini infra | High | Med | P1 | 4 dev-days | High |
