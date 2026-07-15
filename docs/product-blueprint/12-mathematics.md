# Mathematics

## Snapshot
Currently **nothing exists** for Mathematics in the lab registry (`client/src/lab/data/subjects.js` has only chemistry, biology, physics, electronics). This is a greenfield subject — every demo below is 🆕. It plugs into the existing registry-driven architecture (`slug: "mathematics"`, `title: "Matematika"`, `color: "#e11d48"`, features under `client/src/lab/features/mathematics/<topic>/`), reusing the R3F/drei, recharts, SVG-canvas, and Gemini plumbing already proven in physics/chemistry.
**Vision:** turn abstract math into something you *drag, warp, and watch converge* — a visual playground where every formula has a knob and every theorem has an animation, so students build intuition before they memorize notation.

## Feature Tree

| Branch | Concrete instantiation for Mathematics | Status | Priority |
|---|---|---|---|
| Theory | "Tushuncha kartalari" — short scrollytelling panels beside each demo (definition → intuition → formula → worked example), Uzbek text, KaTeX-rendered formulas | 🆕 | P1 |
| Experiment | "Monte-Karlo maydoni" — throw N random points, estimate π by hits-in-circle; watch the estimate converge live | 🆕 | P1 |
| Simulation | "Funksiya laboratoriyasi" — the master Function Grapher: type an expression, watch it plot, animate parameters a·sin(bx+c) | 🆕 | P0 |
| Calculator | "Aqlli kalkulyator" — expression evaluator + matrix/determinant/equation-solver tabs (reuses chemistry's Calculators.jsx pattern) | 🆕 | P0 |
| Interactive Graph | "Grafik maydoni" — pan/zoom recharts+canvas plane, drag control points, live-updating tangent/area overlays | 🆕 | P0 |
| Challenge | "Grafikni top" — given a plotted curve, reconstruct its equation by tuning sliders until residual < ε; timed | 🆕 | P1 |
| Quiz | "Tezkor test" — auto-generated adaptive item bank (evaluate f(2), pick the derivative, match the transform). **Hooks into the parallel quiz engine** via a `quizGenerators/mathematics.js` question factory | 🆕 (blocked on quiz engine) | P2 |
| AI Tutor | "Matematik yordamchi" — Gemini-backed step-by-step solver; user types a problem, gets hint-ladder (not just the answer). Reuses existing Gemini hook infra from `chemistry/lab/AiReactionModal` | 🟡 (infra exists) | P1 |
| Real-life Examples | "Hayotda qayerda?" — exponential = interest/virus spread, sine = tides/sound, derivatives = speedometer, parabola = basketball arc | 🆕 | P2 |
| Mini Game | "Vektor uchishi" — pilot a ship by composing vectors to hit targets; teaches vector addition/scaling under time pressure | 🆕 | P2 |
| Achievements | "Nishonlar" — "Birinchi hosila", "π ni topding", "Fraktalga 10x zoom". **Hooks into the parallel gamification service** via emitted `math.*` events | 🆕 (blocked on gamification) | P3 |
| 3D Models | "3D sirtlar" — R3F z=f(x,y) surface mesh, 3D vectors, solids of revolution, Platonic solids | 🆕 (reuses R3F/drei) | P1 |

## Demo Playground

All demos 🆕. R3F = react-three-fiber scene; SVG/canvas noted per demo.

| Demo | Status | Purpose | Learning Objective | UI | Animations | Controls | Input | Output | Result | Difficulty | Dev (days) |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Function Grapher 🆕 | 🆕 | Plot any y=f(x) | Read shape from equation | Canvas plane + expr bar + slider rail | Param-morph (a,b,c animate) | Zoom/pan, add/remove curves, slider per param | Expression string + slider values | Multi-curve plot, intersection dots | "Changing b squeezes the wave" — sees param↔shape link | Med | 6 |
| Unit Circle / Trig 🆕 | 🆕 | Link angle→sin/cos | Trig as circle coords | SVG circle + two synced wave strips | Rotating radius, tracing dot draws sine | Drag angle, toggle sin/cos/tan, deg/rad | Angle θ | (cosθ,sinθ) point + live wave trace | "sin is just the height of the dot" | Low | 4 |
| Vectors 🆕 | 🆕 | Add/scale/dot/cross | Vectors as arrows | R3F 3D (toggle 2D) draggable arrowheads | Parallelogram sweep, projection drop | Drag heads, scalar slider, op toggle | Two vectors | Resultant arrow, dot/cross numeric | "a·b=0 means perpendicular" seen live | Med | 5 |
| Derivatives (tangent slope) 🆕 | 🆕 | Slope = rate of change | Secant→tangent limit | Grapher + moving tangent line + slope readout | Secant collapses to tangent as h→0 | Drag point x₀, h slider | f(x), x₀, h | Tangent line, slope value, f′(x) curve ghost | "The derivative is the limit of the steepness" | Med | 3 |
| Integrals (area under curve) 🆕 | 🆕 | Integral = accumulated area | Riemann → exact area | Grapher + shaded region + rectangle stack | Rectangles refine, area counter climbs | n-rectangles slider, left/right/mid, bounds | f(x), [a,b], n | Shaded area, Σ estimate vs exact | "More rectangles → true area" convergence felt | Med | 3 |
| Probability (dice/coins) 🆕 | 🆕 | Randomness → patterns | Law of large numbers | DOM dice/coins + recharts histogram | Roll animation, bars fill toward theoretical | # trials, dice count, run/reset | N trials | Frequency histogram vs expected line | "Flatten to the theoretical curve as N grows" | Low | 4 |
| Geometry constructor 🆕 | 🆕 | Compass-straightedge builds | Euclidean construction logic | SVG canvas, tool palette, snap points | Draw-in animation on each step | Point/line/circle/perp/bisect tools, drag | Click sequence | Live construction, angle/length measures | "Bisect an angle with only compass+ruler" | High | 9 |
| Matrix Transformations 🆕 | 🆕 | Matrices warp space | Linear maps visually | SVG/R3F warping grid + house/cat sprite | Identity→matrix interpolation morph | 2×2/3×3 entry inputs, det readout, preset buttons | Matrix entries | Warped grid, eigenvector arrows, det=area factor | "det is the area scale; negative = flip" | Med | 5 |
| Fractals 🆕 | 🆕 | Infinite self-similarity | Iteration & complex dynamics | WebGL fragment-shader canvas | Smooth deep-zoom, palette cycling | Zoom (scroll), Julia c-drag, iteration slider | c, zoom, maxIter | Mandelbrot/Julia render | "Zoom forever and it repeats itself" | Med | 5 |
| 3D Surface plotter 🆕 | 🆕 | Visualize z=f(x,y) | Multivariable functions | R3F mesh + orbit controls + color ramp | Wireframe→solid morph, contour drop-to-floor | Orbit, expr input, resolution, colormap | f(x,y) string, domain | Shaded 3D surface + contour map | "A 2-input function is a landscape" | Med | 5 |
| Taylor Series Approximator 🆕 | 🆕 | Polynomials fake any curve | Local approximation | Grapher: target curve + growing polynomial | Terms snap on one-by-one, error shrinks | # terms slider, center a, pick f | f(x), N terms, center | Approx curve overlay + error shading | "Add terms → polynomial hugs the curve" | Med | 3 |
| Fourier Series Builder 🆕 | 🆕 | Waves sum to any shape | Frequency decomposition | Canvas epicycles + rebuilt waveform | Rotating circles trace square/saw wave | # harmonics slider, target wave | N harmonics | Epicycle animation + reconstructed signal | "Spinning circles draw a square wave" | High | 5 |
| Complex Plane Explorer 🆕 | 🆕 | Complex numbers as points | Argand + Euler intuition | SVG Argand grid, draggable z | Multiplication = rotate+scale animation | Drag z, op (add/mult/conj/eⁱᶿ) | z₁, z₂ | Result point, modulus/arg readout | "Multiplying by i rotates 90°" | Med | 4 |
| Linear Systems Visualizer 🆕 | 🆕 | Solve = line intersection | Gaussian elimination | Grapher (2D lines / 3D planes) + step matrix | Row-reduce steps animate; lines slide | Coefficient inputs, step/next | Augmented matrix | Solution point, "no/infinite solution" states | "Solution is where the lines/planes meet" | Med | 4 |

## 3D / Interactive Experiences

| Experience | Interactions | What it teaches | Complexity |
|---|---|---|---|
| Surface Terrain (z=f(x,y)) | rotate, zoom, cross-section (slice plane), animate param, hotspots on max/min, measure height | Multivariable functions, gradients, saddle points | High |
| Solids of Revolution | rotate, animate (2D curve sweeps into 3D), cross-section disk/shell, labels for volume | Volume by integration (disk/shell method) | High |
| Vector Space Sandbox | drag arrowheads, rotate 3D, animate span sweep, labels for dot/cross, measure angle | Vectors, span, orthogonality, cross product direction | Med |
| Platonic Solids Explorer | rotate, zoom, explode (unfold to net), cross-section, labels (V-E-F), hotspots per face | Polyhedra, Euler's formula V−E+F=2 | Med |
| Matrix Space Warp | animate identity→matrix, drag basis vectors, labels for eigenvectors, measure det-as-area | Linear transformations, eigenvectors, determinant | Med |
| Parametric Curve Ribbon | animate tracing point, rotate, hotspots at t-values, measure arc length, cross-section Frenet frame | Parametric/space curves, tangent-normal-binormal | High |
| Probability Galton Board | animate falling balls, rotate 3D board, hotspots on bins, measure vs normal overlay | Binomial → normal distribution emergence | Med |
| Unit Sphere & Angles | rotate, hotspots (lat/long), animate great-circle path, measure spherical angle | 3D angles, spherical coordinates, dot product | Med |
| Fractal 3D (Mandelbulb) | rotate, deep-zoom, animate power-n morph, palette shift | Iteration in 3D, self-similarity | High |

## Roadmap (skill ladder)

| Level | Focus | Topics & Demos | Outcome |
|---|---|---|---|
| Beginner | Numbers, shapes, reading graphs | Function Grapher (linear/quadratic), Unit Circle basics, Probability (coins/dice), Geometry constructor (basic shapes), Platonic Solids | Reads a graph, plots a line, states basic probability, names/counts 3D shapes |
| Intermediate | Trig, vectors, transformations | Unit Circle (all ratios), Vectors 2D, Matrix Transformations (2×2), Complex Plane (add/mult), Linear Systems (2 unknowns), Galton board | Solves triangles, adds/scales vectors, solves 2×2 systems, understands rotations via matrices/complex numbers |
| Advanced | Calculus foundations | Derivatives (tangent), Integrals (Riemann), Taylor Series, 3D Surface plotter, Solids of Revolution, Vectors 3D | Interprets derivative as rate, integral as area, approximates functions, reasons about z=f(x,y) |
| Expert | Higher structures & modeling | Fourier Series, Fractals (Mandelbrot/Julia + Mandelbulb), Matrix 3×3 + eigenvectors, Parametric Ribbon, Monte-Carlo experiment | Decomposes signals, works with eigen-structure, builds/analyzes models, connects iteration↔complex dynamics |

## Feature Economics

| Feature | Purpose | Educational Value | Complexity | Priority | Dev Cost | Est User Engagement |
|---|---|---|---|---|---|---|
| Function Grapher + expression engine | Universal plotting substrate every other demo reuses | Very High | Med | P0 | 6 dev-days | Very High |
| Interactive Graph plane (pan/zoom/drag) | Shared canvas layer for grapher, derivatives, integrals, Taylor, systems | Very High | Med | P0 | (part of grapher; +2 days shared) | Very High |
| Derivatives (tangent slope) | Core calculus intuition, cheap on top of grapher | Very High | Low | P0 | 3 dev-days | High |
| Integrals (area under curve) | Pairs with derivatives; the "aha" of accumulation | Very High | Low | P0 | 3 dev-days | High |
| AI Tutor (Gemini step-solver) | Personalized hints; reuses existing Gemini infra; huge stickiness | High | Med | P1 | ~1 dev-week | Very High |
| Matrix Transformations | Best-in-class visual for linear algebra, highly shareable | High | Med | P1 | 5 dev-days | High |
| Probability (dice/coins + Galton) | Low-friction, addictive, teaches LLN/distributions | High | Low | P1 | 4 dev-days | High |
| 3D Surface plotter | Signature "wow" 3D piece, leverages R3F strength | High | Med | P1 | 5 dev-days | High |
| Fourier Series Builder | High-wow epicycle animation, strong shareability | Med | High | P2 | 5 dev-days | Med |
| Geometry constructor | Deep classical value but heavy build; defer | High | High | P2 | 9 dev-days | Med |
