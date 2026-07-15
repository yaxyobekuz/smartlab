# Arduino

## Snapshot
**Real state:** One production topic (`electronics/arduino` → `CircuitPage`) already ships a working Tinkercad-style 2D SVG builder wired to a from-scratch Arduino-sketch interpreter (regex C→JS transpiler on a cooperative virtual clock), with 12 pin-accurate parts, 6 runnable templates, and per-component reactive visuals. It is a *connectivity* simulator, not an *electrical* one: `ohms` is never read by the sim, `Serial` is a no-op, there's zero persistence, and templates carry Uzbek lesson text that no component renders.
**Vision (one line):** Grow the single builder into a full **Arduino subject** — a guided "learn-by-wiring" curriculum where a real Ohm's-law layer, a live Serial monitor, a sensor library, an oscilloscope graph, and goal-mode challenges turn the sandbox into a self-teaching lab that carries a beginner from first blink to WiFi/EEPROM projects.

## Feature Tree

| Branch | Concrete instantiation for Arduino | Status | Priority |
|---|---|---|---|
| **Theory** | "Pin haritasi" concept pages — GPIO vs analog, `INPUT_PULLUP`, PWM duty cycle, ADC 10-bit, `delay` vs `millis`; render the already-authored template `description` as an in-panel lesson brief | 🟡 (text exists in `templates.js`, never shown) | P1 |
| **Experiment** | The `CircuitPage` build-and-run canvas — drag Uno + parts, wire pins, write a sketch, press Run | ✅ built | P0 (maintain) |
| **Simulation** | Offline interpreter (`interpreter.js`) + union-find netlist (`netlist.js`) + RAF virtual-clock board (`board.js`) driving live visuals | ✅ built | P0 (maintain) |
| **Calculator** | "Rezistor & Ohm kalkulyatori" — LED series-R from (Vcc, Vf, I) with live 4-band color output; voltage divider; PWM duty→avg voltage; `map()` range helper | 🆕 | P1 |
| **Interactive Graph** | "Ossiloskop" — canvas time-plot of a selected pin's voltage: PWM square wave, servo 50 Hz pulse, `analogRead` trace, `millis`-driven blink | 🆕 | P1 |
| **Challenge** | "Vazifa rejimi" over `templates.js` + netlist — goals like "LEDni 2× tez miltillat", "tugma bosilганда yon", auto-checked via `board.readVisuals` / pin timing | 🆕 | P0 (hook for parallel quiz/progress engine) |
| **Quiz** | "Sxemani top / kodni to'g'rila" — spot-the-miswire (drag fix), predict-Serial-output MCQ, match-pin questions; consumes parallel quiz engine | 🆕 | P2 |
| **AI Tutor** | Gemini "Nega ishlamayapti?" — sends serialized circuit JSON + sketch + sim warnings, returns Uzbek diagnosis; reuse the AI-chemistry-reaction hook pattern | 🆕 | P1 |
| **Real-life Examples** | "Qayerda ishlatiladi" cards — each demo → real device (LDR→ko'cha chirog'i, ultrasonic→parking sensori, relay→smart rozetka, DHT→termostat) | 🆕 | P2 |
| **Mini Game** | "Debug Dash" — timed miswiring-fix runs; and a "Simon" buzzer memory game built entirely inside the sim (real tones) | 🆕 | P3 |
| **Achievements** | Badges wired to parallel gamification — "Birinchi blink", "Serial ustasi", "Sensor kolleksiyachisi", "Ohm qonuni", "12 vazifa" | 🆕 | P2 |
| **3D Models** | R3F Uno board + breadboard with explode/label/cross-section; component tour (servo internals, LDR, HC-SR04 sound cone) | 🆕 | P2 |

## Demo Playground

| Demo | Status | Purpose | Learning Objective | UI | Animations | Controls | Input | Output | Result | Difficulty | Dev (days) |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **LED** | ✅ built | First output pin | `pinMode`/`digitalWrite`, current-limit resistor | SVG LED + wires on canvas | glow ramp, on/off | color picker, Run/Stop | D-pin state | lit LED SVG | "Pin HIGH = LED yonadi" | Easy | 0 (done) |
| **PWM (fade)** | ✅ built | Analog-ish output | `analogWrite` 0–255 duty→brightness | SVG LED + code | opacity fade | duty slider (live) | 0–255 value | smooth brightness | "8-bit duty = ravshanlik" | Easy | 0.5 (polish) |
| **Button** | ✅ built | Digital input + pullup | `digitalRead`, `INPUT_PULLUP` polarity | SVG push-button | press-depress | mouse/touch press | pressed bool | LED toggles | "Pullup = teskari mantiq" | Easy | 0 (done) |
| **Potentiometer** | ✅ built | Analog input | `analogRead` 0–1023 ADC | SVG knob | rotary drag | drag knob | 0–1023 | value → LED/Serial | "10-bit ADC 0–1023" | Easy | 0.5 (add graph) |
| **LDR (photoresistor)** | ✅ built | Light sensor | resistance→ADC, threshold logic | SVG cell + light slider | brightness sweep | light-level slider | 0–1023 | night-light LED | "Qorong'ida yonadi" | Easy | 0.5 (calibrate) |
| **Servo** | ✅ built | PWM angle | `Servo.write`, 50 Hz pulse | SVG servo + horn | 0–180° sweep | angle slider | 0–180 | horn rotates | "1–2 ms pulse = burchak" | Med | 0.5 (pulse graph) |
| **Buzzer** | ✅ built | Frequency out | `tone()`/`noTone`, Hz→pitch | SVG buzzer + WebAudio | pulse ring | freq buttons | Hz | audible tone | "Chastota = balandlik" | Easy | 0.5 (WebAudio) |
| **DC Motor** | ✅ built | Actuator + PWM speed | direction + duty→RPM | SVG motor | spin-rate anim | speed slider | 0–255 | spinning rotor | "Duty = tezlik" | Med | 0.5 |
| **RGB LED** | ✅ built | 3-channel PWM | color mixing on 3 PWM pins | SVG RGB dome | color blend | 3 sliders | 3×0–255 | mixed color | "R+G+B = istalgan rang" | Med | 0.5 |
| **Serial Monitor** | 🟡 stub (`board.js:104` no-op) | Debug/inspect state | `Serial.print*`, baud, reading vars | scrollable mono pane in editor footer | line append, autoscroll | clear, Serial-input box | printed strings | text log | "Dasturni ko'rish" | Med | 3 |
| **Relay** | 🆕 | Switch mains loads | digital pin drives isolated load | SVG relay + "lamp" load | click + lamp on | Run/toggle | D-pin state | lamp icon on/off | "Kichik pin → katta yuk" | Med | 2 |
| **Ultrasonic (HC-SR04)** | 🆕 | Distance sensing | trig/echo, `pulseIn`, time→cm | SVG sensor + draggable wall | expanding sound cone | drag wall distance | echo µs | cm on Serial/LCD | "Ovoz vaqti = masofa" | Hard | 4 |
| **IR Sensor** | 🆕 | Proximity/line detect | reflectance → digital HIGH/LOW | SVG IR pair + object | beam reflect flash | drag object in/out | detect bool | LED/Serial trigger | "Aks etsa = aniqlandi" | Med | 2.5 |
| **Temperature (LM35/DHT11)** | 🆕 | Env sensor + math | ADC→°C conversion formula | SVG sensor + temp slider | mercury-style bar | temperature slider | 0–1023 / DHT val | °C on LCD/Serial | "mV → °C hisob" | Med | 3 |
| **LCD 16×2** | 🆕 | Text output device | `LiquidCrystal`, `setCursor`, `print` | SVG 16×2 dot-matrix grid | char reveal, cursor blink | via sketch | string + row/col | rendered characters | "Ekranga yozish" | Hard | 5 |
| **Bluetooth (HC-05)** | 🆕 | Wireless serial | `SoftwareSerial`, RX/TX, phone control | SVG module + mock phone panel | send-bubble anim | phone buttons (send cmd) | serial bytes | pin actions from phone | "Telefondan boshqarish" | Hard | 5 |
| **WiFi (ESP8266/ESP32)** | 🆕 | Network I/O | connect, mock HTTP/web endpoint | SVG board + mock browser tab | request/response ping | "so'rov yubor" button | virtual GET | LED via web / status JSON | "Internetdan boshqarish" | Hard | 6 |
| **Motor Driver (L298N)** | 🆕 | H-bridge control | IN1/IN2 + ENA PWM, dir + speed | SVG driver + 2 motors | dual spin + reverse flip | dir toggles, speed slider | 2×dir + PWM | motors fwd/rev/stop | "H-ko'prik = yo'nalish" | Hard | 4 |
| **EEPROM** | 🆕 | Non-volatile storage | `EEPROM.read/write`, persist across "reboot" | SVG memory-cell grid | cell write flash | write/read/reset btns | addr+byte | value survives Stop→Run | "O'chsa ham saqlanadi" | Med | 3 |
| **Neopixel (WS2812)** | 🆕 | Addressable LEDs | per-pixel color on one data pin | SVG 8-LED strip | chase/rainbow anim | pattern buttons | pixel array | animated strip | "Bitta pin, ko'p rang" | Hard | 4 |
| **7-Segment** | 🆕 | Numeric display | segment mapping, digit encode | SVG 7-seg | segment light-up | via sketch | 0–9 | displayed digit | "Segment = raqam" | Med | 2.5 |

## 3D / Interactive Experiences

| Experience | Interactions | What it teaches | Complexity |
|---|---|---|---|
| **Uno board explode & tour** | rotate, zoom, explode, labels, hotspots | ATmega328, USB, voltage reg, digital/analog headers, PWM (~) pins | Med |
| **Breadboard cross-section** | rotate, cross-section, hotspots, labels | internal bus strips, power rails, which holes are connected | Med |
| **PWM waveform lab (3D)** | animate, drag duty, measure, labels | duty cycle → average voltage → LED brightness link | Med |
| **Servo internals** | explode, animate, cross-section, labels | motor + gears + pot feedback → why pulse width sets angle | Med |
| **Ultrasonic sound cone** | animate, measure, drag target, hotspots | trig chirp → echo travel time → distance math (t·343/2) | High |
| **LED current & electron flow** | animate, cross-section, measure, labels | forward voltage, current direction, why a resistor is mandatory | Med |
| **ADC quantization visual** | drag input, animate, measure | continuous voltage → 0–1023 steps, 10-bit resolution | Med |
| **LCD pixel matrix zoom** | zoom, animate, hotspots | 5×8 char cells → dot-matrix rendering of text | Med |
| **Sensor gallery walk-through** | rotate, hotspots, labels, swap parts | LDR/IR/DHT/HC-SR04 real bodies + pinouts side by side | Low–Med |

## Roadmap (skill ladder)

| Level | Focus | Topics & Demos | Outcome |
|---|---|---|---|
| **Beginner** | Outputs & the loop | Blink LED, PWM fade, RGB, buzzer, Serial "Hello"; Ohm/resistor calculator; render lesson briefs | Wires a first circuit, understands `setup`/`loop`, `pinMode`/`digitalWrite`, reads the Serial monitor |
| **Intermediate** | Inputs & sensing | Button+pullup, potentiometer, LDR night-light, servo sweep, temperature→°C; oscilloscope graph | Reads digital/analog inputs, uses `map()`, replaces `delay` with `millis`, plots a signal |
| **Advanced** | Devices & protocols | Ultrasonic, IR line-follow, LCD, motor driver (L298N), relay, EEPROM save | Combines sensor→logic→actuator, drives libraries, persists state, debugs via Serial |
| **Expert** | Connected & creative | Bluetooth phone control, WiFi web endpoint, Neopixel patterns, multi-sensor project; goal-mode challenges + AI tutor | Builds a full connected project, passes timed challenges, explains and fixes own bugs |

## Feature Economics

| Feature | Purpose | Educational Value | Complexity | Priority | Dev Cost | Est User Engagement |
|---|---|---|---|---|---|---|
| **Serial monitor** (wire up `board.js:104` stub → editor-footer pane) | The #1 real debugging tool; lets learners see program state | Very High | Med | P0 | 3 dev-days | Very High |
| **Ohm's-law layer** (make `ohms` real: current ∝ V÷ΣR, brightness/burnout) | Turns the resistor from placebo into the lesson it's meant to teach | Very High | Med | P1 | 4 dev-days | High |
| **Miswiring diagnostics** (reuse `netReachesGnd`/`arduinoPinOf` → Uzbek hints) | "LED teskari", "GND yo'q", "rezistor yo'q" — sandbox becomes teacher | Very High | Low–Med | P1 | 2 dev-days | Very High |
| **Persistence + share** (localStorage autosave + URL/JSON export) | Refresh currently wipes all work — kills retention | High | Low | P1 | 2 dev-days | High |
| **Touch add-a-part** (tap-to-add fallback for `Palette.jsx` DnD) | On phones/tablets you literally can't place a part today — hard blocker for a public web app | High | Low–Med | P1 | 2 dev-days | High |
| **Challenge / goal mode** (checker over `templates.js` + `readVisuals`) | Anchors the parallel quiz/progress engine; adds objective + reward loop | Very High | Med | P0 | 5 dev-days | Very High |
| **Sensor library expansion** (HC-SR04, DHT/LM35, IR, LCD, relay) | Unlocks Advanced tier; the demos beginners most want | High | Med–High | P2 | 3 dev-weeks | High |
| **Oscilloscope graph** (canvas pin-voltage trace) | Makes invisible PWM/servo/ADC signals visible and intuitive | High | Med | P1 | 3 dev-days | Med–High |
| **AI tutor** (Gemini over circuit JSON + sketch + warnings) | On-demand "why won't it work?" in Uzbek; scales help without a teacher | High | Med | P1 | 4 dev-days | High |
| **Render lesson briefs** (surface dead `description` + concept pages) | Zero-content-cost: text already authored, just never shown | Med–High | Low | P1 | 1 dev-day | Med |
| **Code editor upgrade** (syntax highlight + line-pinned errors) | Lowers the friction of writing/fixing sketches | Med | Low–Med | P2 | 3 dev-days | Med |
