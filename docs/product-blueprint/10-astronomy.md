# Astronomy

## Snapshot
Nothing exists yet — Astronomy is a greenfield subject in `subjects.js`, no routes, no demos (all 🆕). The web stack is a perfect fit: R3F handles orbits/planets/black-holes as GPU scenes, SVG handles star charts and transit light-curves, and Gemini already powers AI reactions we can repurpose for a night-sky Q&A tutor. **Vision:** turn `/astronomy` into a real-time planetarium + orbital sandbox where an Uzbek learner drags a slider and *watches* Kepler's second law, an eclipse, or a black hole's light-bending happen — no equations required to feel it, full equations available to prove it.

## Feature Tree

| Branch | Concrete instantiation for Astronomy | Status | Priority |
|---|---|---|---|
| Theory | "Osmon mexanikasi" lesson track: coordinate systems (alt-az vs RA/Dec), Kepler's 3 laws, stellar life cycle, cosmic distance ladder — MDX pages with inline live R3F insets | 🆕 | P0 |
| Experiment | Exoplanet Transit lab: student "observes" a dimming star, plots the light curve, and *derives* planet radius from transit depth (Δflux → R_p/R_star) | 🆕 | P0 |
| Simulation | Solar System sandbox (`SolarSystemScene.jsx`): time-warp N-body-ish 2-body orbits, add/remove planets, real orbital periods scaled | 🆕 | P0 |
| Calculator | Orbit calculator: input semi-major axis + central mass → period, velocity, escape velocity; plus "Your weight on Mars/Moon" gravity calc | 🆕 | P1 |
| Interactive Graph | HR-diagram plotter (SVG scatter): drag a star's temperature/luminosity, watch it fall on main-sequence / giants / white-dwarfs branch | 🆕 | P1 |
| Challenge | "Yulduz turkumini top" — timed constellation-ID from a rotating sky; and "Launch to orbit" delta-v puzzle with a fuel budget | 🆕 | P1 |
| Quiz | Adaptive MCQ + drag-label bank keyed to each lesson (hooks into the parallel quiz engine via a `quizId` in registry) | 🆕 | P1 |
| AI Tutor | "Kosmik Yordamchi" (Gemini): ask "nega Oy fazalari o'zgaradi?", get Uzbek explanation + a deep-link that opens the exact demo pre-set to illustrate it | 🆕 | P0 |
| Real-life Examples | GPS relativistic clock correction, why Ramadan/hilol depends on Moon phase, satellite passes over Tashkent, solar panels & solar constant | 🆕 | P2 |
| Mini Game | "Asteroid deflektor": nudge an incoming NEO with a kinetic impactor, use orbital mechanics to miss Earth | 🆕 | P2 |
| Achievements | Badges: "Birinchi tranzit", "Kepler ustasi", "72 turkum", "Qora tuynukka yaqin" — writes to the parallel gamification store via emitted events | 🆕 | P2 |
| 3D Models | GLB/procedural: textured planets, Saturn's rings, Moon (real NASA DEM), Sun with shader corona, a scale-accurate ISS model | 🆕 | P0 |

## Demo Playground

| Demo | Status | Purpose | Learning Objective | UI | Animations | Controls | Input | Output | Result | Difficulty | Dev (days) |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Star Map / Constellations | 🆕 | Navigable night sky from any place/time | Read the sky; find turkumlar & bright stars | R3F starfield (~9k Hipparcos stars as instanced points) + SVG constellation-line overlay + search box | Sky rotates with sidereal time; constellation art fades in on hover | Date/time slider, lat/long or "Toshkent" preset, drag-orbit, zoom, toggle lines/labels | Location, timestamp, star tap | Highlighted turkum + star card (magnitude, distance, spectral type) | "The sky at MY birthday looked like this" — self-locates a constellation unaided | Med | 9 |
| Orbital Mechanics | 🆕 | Feel how velocity shapes an orbit | Circular vs elliptical vs escape; energy tradeoff | R3F: central body + draggable spacecraft, trail line, live v/r readout | Real-time integrated trajectory, trail decays | Drag to set position, velocity-vector handle, mass slider, time-warp | Initial pos + velocity vector | Orbit shape (ellipse/parabola/hyperbola), period, apo/peri | "Too slow → I crash; a nudge → stable orbit" | Med | 8 |
| Kepler's Laws | 🆕 | Prove all 3 laws visually | Equal areas/equal time; T²∝a³ | R3F ellipse + swept-area shading + SVG side-panel bar of a³ vs T² | Planet speeds up at perihelion; equal-area wedges paint on | Eccentricity slider, a slider, "sweep area" toggle, play/pause | e, a, planet pick | Swept areas equal; T²/a³ constant readout | "The two shaded wedges are equal — 2nd law is obvious now" | Med | 7 |
| Exoplanet Transit | 🆕 | Detect a planet you can't see | Transit method; derive R_p from depth | Split view: R3F star+planet crossing (top), live SVG light-curve (bottom) | Star dims as planet occults; curve draws in real time | Planet radius, orbit inclination, period sliders; add noise toggle | R_p, i, period | Light curve + computed R_p/R_star, depth %, duration | "A 1% dip = a Jupiter — that's how Kepler found 2000+ worlds" | Med | 9 |
| Black Hole / Gravity Well | 🆕 | Show gravity as curved spacetime | Event horizon, lensing, escape velocity limit | R3F: rubber-sheet grid warp + accretion-disk shader + gravitational lensing (render-target distortion) | Grid dips with mass; background stars smear around horizon; disk swirls | Mass slider (→ Schwarzschild radius), photon-ring toggle, throw-a-probe button | Mass | r_s value, lensed image, "point of no return" ring | "Light itself bends — and past this ring nothing returns" | High | 12 |
| Moon Phases | 🆕 | Kill the "Earth's shadow" myth | Phase = geometry of Sun-Earth-Moon | R3F top-down orbit view + synced "as-seen-from-Earth" Moon disc inset | Moon orbits, terminator sweeps across disc, phase name updates | Orbit-position slider/drag, play, "show sunlight rays" toggle | Moon angle | Phase name (yangi oy…to'linoy), illuminated %, hilol date | "Phase is about angle, not shadow — I can predict tonight's Moon" | Low | 5 |
| Eclipse Simulator | 🆕 | Why eclipses are rare | Node alignment, umbra/penumbra, why not monthly | R3F Sun-Earth-Moon with tilted orbit + shadow cones; ground-view inset | Umbra cone sweeps Earth; corona appears at totality; annular vs total | Moon orbital-tilt slider, node alignment, distance (→ annular), time | Alignment, tilt | Solar/lunar eclipse type, path, "next visible from Uzbekistan" | "5° tilt is why we don't get one every month" | High | 11 |
| Telescope | 🆕 | Aperture & magnification tradeoffs | Light-gathering, resolution, why bigger = better | Canvas "eyepiece" masked circle over a deep-sky target image stack | Zoom-in blur→sharp as aperture grows; more faint stars pop in | Aperture slider, focal length, eyepiece swap, target picker (Orion, M31) | Aperture, focal length | FOV°, magnification, limiting magnitude, resolved image | "Double the aperture → I see 4× fainter galaxies" | Med | 7 |
| Scale of the Universe | 🆕 | Comprehend cosmic distances | Orders of magnitude, log scale intuition | Single continuous zoom (canvas/DOM) from atom → observable universe, log ruler | Smooth momentum zoom, objects labeled as they pass | Scroll/pinch to zoom, jump-to-scale chips, distance readout | Zoom level | Current scale (m, AU, ly, Mpc) + object at this scale | "Proxima is 4 ly — and that's basically next door" | Med | 8 |
| Rocket Launch / Orbit | 🆕 | Get to orbit, not just "up" | Why you go sideways; delta-v, staging, gravity turn | R3F Earth + rocket, HUD (altitude, velocity, apoapsis), throttle bar | Gravity-turn ascent, stage separation, orbit circularizes | Throttle, pitch, stage-drop button, launch site pick | Throttle/pitch over time | Achieved orbit or crash; apo/peri, Δv used | "Orbit = falling and missing the ground — you need horizontal speed" | High | 12 |
| Redshift / Hubble Expansion 🆕 | 🆕 | See the universe expanding | Redshift ↔ distance ↔ expansion | SVG galaxy field receding + spectrum-line shift strip | Galaxies drift apart from every point; spectral lines slide red | Hubble constant slider, pick a galaxy, "run time back to Big Bang" | H₀, distance | Recession velocity, redshift z, age-of-universe estimate | "Every galaxy runs from us → we're not the center, space itself grows" | Med | 8 |
| Spectroscopy / What Stars Are Made Of 🆕 | 🆕 | Read a star's chemistry from light | Absorption lines = elements; temp from color | Canvas spectrum bar + draggable "prism", element-line library | Dark lines appear at element wavelengths; blackbody curve shifts with T | Temperature slider, element toggles (H, He, Na…), star preset | T, composition | Spectral class (O-B-A-F-G-K-M), matched elements | "Those black lines ARE hydrogen — we know stars' recipe without touching them" | High | 9 |

## 3D / Interactive Experiences

| Experience | Interactions | What it teaches | Complexity |
|---|---|---|---|
| Textured Solar System tour | rotate, zoom, animate (orbits/spin), labels, hotspots (click planet → fact card), measure (distance in AU between two bodies) | Relative sizes, rotation vs revolution, order & spacing of planets | Med |
| The Moon up close (NASA DEM) | rotate, zoom, cross-section (interior layers), hotspots (Apollo sites, maria, craters), measure crater diameter | Surface features, tidal locking (far side), lunar geology | Med |
| Sun anatomy | rotate, cross-section (core→corona layers), animate (convection, flares via shader), labels, hotspots (sunspots) | Fusion core, radiative/convective zones, solar activity | High |
| Saturn & ring system | rotate, zoom, explode (ring bands A/B/C separate), labels, hotspots (Cassini division, shepherd moons) | Ring structure, gaps, why rings are flat | Med |
| ISS orbit walkthrough | rotate, zoom, explode (modules), animate (orbit over Earth 90-min), labels, hotspots (solar arrays, docking) | Low-Earth orbit, microgravity, international engineering | Med |
| Milky Way galaxy model | rotate, zoom, hotspots (Sun's position, Sgr A*, arms), animate (galactic rotation), measure (radius in ly) | Our place in the galaxy, spiral structure, scale | Med |
| Black hole spacetime | rotate, zoom, animate (accretion + lensing), measure (Schwarzschild radius vs mass) | Curved spacetime, event horizon, gravitational lensing | High |
| Star life-cycle stage viewer | animate (nebula→main sequence→giant→remnant), cross-section (fusion shells), labels, hotspots per stage | Stellar evolution, mass determines fate | Med |
| Constellation depth reveal | rotate, "pull apart" (3D distances so a flat pattern explodes into true depth), labels, measure (ly to each star) | Constellations are line-of-sight illusions, not physical groups | Med |

## Roadmap (skill ladder)

| Level | Focus | Topics & Demos | Outcome |
|---|---|---|---|
| Beginner | Orient in the sky & the Solar System | Moon Phases, Star Map basics, Solar System tour, Scale of the Universe (intro), "weight on other planets" calc | Names planets/phases/major constellations; explains why the Moon changes shape; grasps that space is unimaginably big |
| Intermediate | Motion & mechanics | Kepler's Laws, Orbital Mechanics sandbox, Eclipse Simulator, Telescope, orbit calculator, first badges | Predicts eclipses conceptually, explains orbits and Kepler's laws, reasons about why bigger telescopes see more |
| Advanced | Detection & measurement | Exoplanet Transit lab, Spectroscopy, HR-diagram plotter, Redshift/Hubble, Rocket-to-orbit | Derives a planet's radius from a light curve, reads a stellar spectrum, understands the distance ladder & delta-v |
| Expert | Extreme physics & synthesis | Black Hole/gravity well, stellar-evolution deep dive, asteroid-deflection mini game, capstone: "design a mission to a habitable exoplanet" using the calculators | Connects gravity, light-bending, and stellar death; completes an open-ended mission-design challenge |

## Feature Economics

| Feature | Purpose | Educational Value | Complexity | Priority | Dev Cost | Est User Engagement |
|---|---|---|---|---|---|---|
| Star Map / Constellations | Personal, exploratory hook — "find the sky over Tashkent tonight" | Very High | High | P0 | ~9 dev-days | Very High |
| Exoplanet Transit lab | Flagship "do real science" experiment — measure an unseen world | Very High | Med | P0 | ~9 dev-days | High |
| Solar System sandbox + 3D tour | Core canvas everything else hangs off; instantly impressive | High | Med | P0 | ~10 dev-days | Very High |
| Kepler's Laws demo | Turns 3 abstract laws into obvious visuals; curriculum backbone | Very High | Med | P0 | ~7 dev-days | High |
| Moon Phases | Cheapest high-impact myth-buster; culturally relevant (hilol) | High | Low | P0 | ~5 dev-days | High |
| AI "Kosmik Yordamchi" tutor | 24/7 Uzbek Q&A that deep-links to the right demo; retention driver | High | Med | P0 | ~6 dev-days | Very High |
| Black Hole / Gravity Well | Wow-factor showpiece that pulls in advanced learners & shares | Med | Very High | P1 | ~12 dev-days | Very High |
| Rocket Launch / Orbit | KSP-lite challenge loop; strong replay & mastery pull | High | Very High | P1 | ~12 dev-days | High |
| Scale of the Universe | Reframes the whole subject; memorable one-sitting experience | High | Med | P1 | ~8 dev-days | Med |
| Eclipse Simulator | Explains a rare, awe event people personally chase | High | High | P1 | ~11 dev-days | Med |
