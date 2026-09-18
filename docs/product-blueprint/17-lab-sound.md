# 17 — Lab room sound and performance (M6)

How the walkable lab (`13-chemistry-lab-room.md`) sounds, and what it costs to load and run.
Recordings are CC0; the room can also run without them. Code root:
`client/src/lab/features/chemistry/lab-room/`.

## Graph

```
audioEngine.js   AudioContext → master gain → compressor → speakers
                 buses: world (panned events), ambience (hum, fans), ui (clicks)
samples.js       the CC0 clips: file list, per-clip gain, loader
cues.js          the same sounds synthesised from noise + oscillators — the fallback
LabSound.jsx     reads the room every frame and drives all of it
queue.js         pushSound(lab, {...}) — one-shots the runtime asks for
```

The context is built on the first frame after the player enters (a click is required by browsers),
muted while the Esc menu is open or the tab is in the background, and the volume comes from
"Ovoz balandligi" in the Esc menu (default 70 %).

Anything that fails to load falls back to the synthesised cue of the same name, so a missing or
blocked file never leaves the room silent. A clip is placed with `placeAt()`: stereo pan from the
angle to the player and `1.5 / (0.9 + d² · 0.55)` for distance.

## What plays, and from what

| sound | driven by |
|---|---|
| footsteps (4 clips) | how far the camera actually moved; faster and brighter above 2.6 m/s |
| glass clink (2 clips) | an object changing state in the world store (picked up, set down) |
| thud | the same, for anything that is not glass |
| breaking glass | the object disappearing from the store |
| pouring | `lab.activity.pour.rate`, which also raises the playback rate |
| fizzing, bubbling | `fx.bubbles.rate` summed over the containers, nearest one panned |
| boiling | `fx.boiling` |
| flame | lit lamps, container flames and burning spills, weighted by distance |
| extinguisher jet | `lab.activity.spray` |
| fans | `hazards.devices.hoodFan` / `.ventilation` |
| room hum | always, very quiet |
| alarm bell | `hazards.alarm.active` |
| pop, bang, ignition | engine events, through `lab.sounds` |
| switch and knob clicks | tool actions and wall panels, through `lab.sounds` |

## The clips

`client/public/sounds/lab/*.wav` — mono, 32 kHz, 16-bit; one-shots peak-normalised, loops
RMS-normalised with their last 0.35 s folded back over the first 0.35 s so they repeat without a
click. Every source, its freesound id and the exact cut are listed in
`client/public/sounds/lab/SOURCE.md`. Total ≈ 2.1 MB.

To replace one: cut a new mono clip with the same name, keep it short, normalise it the same way,
and add its row to SOURCE.md. Nothing in the code needs to change.

**Never layer two copies of one periodic loop** — they beat and the level pumps (the engine-sound
lesson from `/physics/engine`).

## Checking it

There is no way to hear it from a test, so measure instead: `window.__labAudio` exposes the engine
in dev, `engine.tap()` returns an analyser on the room's own output, and a headless run with
`--autoplay-policy=no-user-gesture-required` can compare the RMS of a quiet room (~0.004) with a
scene that has fire and the alarm (~0.02) or a bang (peak ~0.07).

## Performance

Measured on the developer's M4 Mac (headless Chromium, vsync off) and on a throttled link. School
machines are slower; the numbers are here as a baseline to compare against once someone runs the
room on one.

| | High | Low |
|---|---|---|
| Frame rate, room only | ~260 fps | ~430 fps |
| Frame rate, fire + gas + alarm | ~140 fps | ~460 fps |
| Draw calls at spawn | 444 | 316 |
| Triangles | 505k | 355k |
| Texture memory (mipmapped RGBA) | 343 MB | 194 MB |

**Texture budget.** `TIERS.*.textureCap` (High 2048, Low 1024) is applied to every texture the room
GLB brings in (`RoomModel`), to the printed wall surfaces (`dressSurfaces`) and to every canvas
print in the equipment kit (`kit.print`). Substance labels shrink separately through
`TIERS.*.printScale`. Shrinking is one-way: raising the quality mid-session keeps the smaller room
textures until the page reloads. The Low lightmap is its own 2048² file and is not capped again.

**Download.** The page needs ≈8.2 MB before the lab is ready: `room.glb` 4.1 MB (already meshopt +
WebP inside), `lightmap-low.webp` 1.4 MB, and ≈1.6 MB of gzipped JavaScript. Sound (2.1 MB) and the
window backdrop load after the player enters, so they never delay the start screen.

| link | first paint | ready to enter |
|---|---|---|
| unthrottled | 0.8 s | 2.5 s |
| 10 Mbps | 1.4 s | 6.8 s |
| 4 Mbps | 3.2 s | 15.1 s |

Vendor code is split in `vite.config.js` (`three`, `rapier`, `postfx`) so the 3D pages share it and
the browser fetches it in parallel; the lab's own chunk is 348 kB (120 kB gzip).

Next levers, if a school PC asks for them: halve the room's normal maps (a Blender re-bake, ≈0.5 MB
off the GLB), KTX2/Basis textures (a much larger VRAM cut, needs a re-bake and a transcoder), and
merging the meshes of the heaviest models.
