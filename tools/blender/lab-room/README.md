# Chemistry lab room (M1) — Blender build pipeline

Headless Blender scripts that model the walkable school chemistry lab, bake its lighting into a lightmap and
produce the web assets in `client/public/models/lab-room/`. Plan: `docs/product-blueprint/13-chemistry-lab-room.md`.

## Requirements

- Blender 5.2 (`/opt/homebrew/bin/blender`, override with `BLENDER=`); Metal GPU is used when available.
- Node 18+ with glTF-Transform 4.5 + sharp + meshoptimizer. `node/gt.cjs` finds them in the npx cache
  (run `npx @gltf-transform/cli --version` once) or in `GLTF_TRANSFORM_NODE_MODULES`.
- Network only for the CC0 downloads (Poly Haven, see `SOURCES.md`).

## Rebuild

```bash
cd tools/blender/lab-room
./build_all.sh                                      # full quality: 4096 px, 1024 spp (~50 min on an M4)
./build_all.sh --size 512 --samples 16 --no-copy    # smoke test (~2 min)
```

| Step | Script | Output (in `build/`, git-ignored) |
|---|---|---|
| 1 | `download_assets.py` (python3) | `downloads/*.jpg`, `museumplein_4k.hdr`, `manifest.json` |
| 2 | `prepare_textures.py` | `textures/*.png` (re-graded CC0 maps, procedural maps, signs atlas) |
| 3 | `build_room.py` | `room.blend`, `colliders.json`, `room-meta.base.json` |
| 4 | `bake_lightmap.py` | `room_uv.blend`, `lightmap_raw.exr`, `lightmap_denoised.exr` |
| 5a | `refine_lightmap.py` | `lightmap_refined.exr` (+ `lightmap_guides.npz`) |
| 5b | `export_room.py` | `room_raw.glb`, `lightmap-high/low.png`, `exterior.png`, `room-meta.json` |
| 6 | `node/finalize_assets.cjs` | `out/` web assets (optimized GLB, lossless WebP lightmaps, JPEG exterior) |
| 7 | `node/inspect_glb.cjs` | contract checks (special names, TEXCOORD_1 on/off, canvas UV0 0..1) |

Review renders: `render_review.py --blend build/room.blend --out <dir>` (path traced) or
`--blend build/room_uv.blend --mode lightmap --lightmap build/lightmap-high.png --scale <lightmapScale>`
(albedo × decoded lightmap = what the web app shows for diffuse).

## How it is built

- **Coordinates.** Every layout number in `build_room.py` is three.js space (m, Y up); `labroom/geom.py` converts
  to Blender (`three (x,y,z) = blender (x,z,-y)`) when meshes are created.
- **Meshes.** Static geometry is merged per material into `static_<material>` (one primitive each). The named
  objects from the contract stay separate, origin at a useful pivot (door hinge, sash bottom edge, …; see
  `room-meta.json → objects`). Glass is `glass_*` (alpha blend, no TEXCOORD_1). All opaque surfaces are
  outward-facing and exported single-sided; glass is double-sided.
- **Lightmap UVs.** Receivers get a `lightmap` UV layer: Smart UV Project (60°) → average island scale → pack
  with rotation (margin 0.003 ≈ 12 px at 4096) ≈ 134 texels/m (7.4 mm). Parts smaller than 0.35 m (handles,
  sockets, taps, T-bars, signs, bottles…) are `detail_<material>` objects with no islands of their own: each face
  is mapped through the nearest receiver triangle and reuses its texels; they are hidden during the bake and
  joined into `static_<material>` on export. Lab coats use preset continuous islands (`lm_preset`).
- **Bake.** Cycles DIFFUSE with DIRECT+INDIRECT (no COLOR) into a 32-bit float image; materials are swapped for
  Diffuse(+Emission) during the bake (no normal maps; metals baked as diffuse). Emitters are single-sided:
  9 LED panels (4500 K) and the exit sign. Fume-hood light, alarm strobe and monitor are baked OFF. Daylight:
  `museumplein` HDRI rotated 55° (sun behind the building) with light portals in the windows. Glass and detail
  parts are invisible to rays; the extinguisher casts no shadow (it can be taken off the wall).
- **Denoise.** OIDN (compositor Denoise, HDR), then `refine_lightmap.py`: an island-aware separable blur
  (σ 2.5 texels, radius 7) guided by baked coverage + geometric normals (OIDN leaves narrow islands such as
  frames and panel edges noisy), then margins are rebuilt by 16-px dilation.
- **Encoding.** `lightmapScale` = 99.5th percentile of the baked RGB values over used texels.
  Stored as `srgb(clamp(v / lightmapScale))`, 8 bit, **lossless WebP** (lossy WebP's 4:2:0 chroma and blocking
  showed as colour fringes/banding; lossless is ~3 MB). Low tier = 2×2 box downsample of the linear bake.
- **GLB.** Blender glTF export (all UV layers), then `node/optimize_glb.cjs`: WebP textures (floor ≤ 2048, rest
  ≤ 1024), meshopt, 16-bit TEXCOORD quantization (tiled UV0 outside [0,1] stays float), int16 positions for
  `static_*` meshes only (named meshes keep float positions so node transforms stay as authored).
  No join/flatten/instance/palette/simplify, so every node/mesh name survives.

## Web usage notes

- Lightmap: `tex.flipY = false; tex.colorSpace = SRGBColorSpace; tex.channel = 1;` on every material whose
  geometry has `uv1`. With `MeshStandardMaterial` use `lightMapIntensity = lightmapScale * Math.PI` (three r155+
  treats `lightMap` as irradiance and divides by π); `room-meta.json → lightmap.threeLightMapIntensity`.
- An `envMap` on MeshStandardMaterial also adds diffuse IBL on top of the lightmap; keep `envMapIntensity` low on
  lightmapped dielectrics (metals get no lightmap diffuse and need the reflections).
- Canvas meshes (`monitor_screen`, `whiteboard_surface`, `poster_periodic_table`, `clock_face`, `sign_exit`) have
  UV0 0..1 in glTF convention (v = 0 at the top edge) → `canvasTexture.flipY = false`.
- `exterior.jpg` is already rotated to match the bake: `mapping = EquirectangularReflectionMapping`, no rotation.
