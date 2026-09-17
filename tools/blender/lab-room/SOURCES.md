# Third-party assets (all CC0)

Every downloaded asset is CC0 1.0 (public domain) from [Poly Haven](https://polyhaven.com/license).
`download_assets.py` fetches them into `downloads/` (git-ignored); `downloads/manifest.json` records the exact file URLs.
ambientCG was not reachable from the build machine, so nothing comes from there.

| Used for | Poly Haven asset | Files | Authors | License |
|---|---|---|---|---|
| Daylight + window view (`exterior.jpg`) | [museumplein](https://polyhaven.com/a/museumplein) | `museumplein_4k.hdr` | Greg Zaal | CC0 |
| Floor (light grey 60 cm tiles, re-graded) | [grey_tiles](https://polyhaven.com/a/grey_tiles) | diffuse / nor_gl / rough, 2K jpg | Amal Kumar | CC0 |
| Painted walls (warm white, re-graded) | [painted_plaster_wall](https://polyhaven.com/a/painted_plaster_wall) | diffuse / nor_gl / rough, 1K jpg | Amal Kumar | CC0 |
| Acoustic ceiling tiles (re-graded + tile edge shading) | [polystyrene](https://polyhaven.com/a/polystyrene) | diffuse / nor_gl / rough, 1K jpg | Dario Barresi, Dimitrios Savva | CC0 |
| Ceramic backsplash tiles | [long_white_tiles](https://polyhaven.com/a/long_white_tiles) | diffuse / nor_gl / rough, 1K jpg | Jenelle van Heerden, Sergej Majboroda | CC0 |
| Teacher's desk top, coat rail, door leaf | [ash_veneer](https://polyhaven.com/a/ash_veneer) | diffuse / nor_gl / rough, 1K jpg | Jenelle van Heerden | CC0 |
| Office chair upholstery | [poly_wool_herringbone](https://polyhaven.com/a/poly_wool_herringbone) | diffuse / nor_gl / rough, 1K jpg | colormass, Rico Cilliers | CC0 |
| Lab coats (albedo re-graded to white) | [stretch_poplin](https://polyhaven.com/a/stretch_poplin) | diffuse / nor_gl / rough, 1K jpg | colormass, Rico Cilliers | CC0 |

Download URL pattern: `https://dl.polyhaven.org/file/ph-assets/Textures/jpg/<res>/<id>/<id>_<map>_<res>.jpg`
and `https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/4k/museumplein_4k.hdr` (resolved via `https://api.polyhaven.com/files/<id>`).

Generated in-repo (no third-party source): brushed-steel roughness/normal, epoxy and laminate roughness,
and the signs atlas (safety pictograms, GHS diamonds, keyboard, fume hood display) — see `prepare_textures.py`.
All geometry is modelled procedurally by `build_room.py`.
