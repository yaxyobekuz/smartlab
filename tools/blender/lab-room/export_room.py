# Encode the baked lightmap, export the raw GLB, write colliders/meta and the exterior panorama.
import json
import math
import os
import sys

import bpy
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
BUILD = os.path.join(HERE, "build")
HDRI = os.path.join(HERE, "downloads", "museumplein_4k.hdr")
EXTERIOR_EXPOSURE = 1.1


def log(*a):
    print("[export]", *a, flush=True)


def read_float_image(path):
    img = bpy.data.images.load(path, check_existing=False)
    w, h = img.size
    px = np.empty(w * h * 4, np.float32)
    img.pixels.foreach_get(px)
    bpy.data.images.remove(img)
    return px.reshape(h, w, 4)


def srgb_oetf(x):
    x = np.clip(x, 0.0, 1.0)
    return np.where(x <= 0.0031308, x * 12.92, 1.055 * np.power(x, 1 / 2.4) - 0.055)


def write_png(rgb, path):
    h, w = rgb.shape[:2]
    img = bpy.data.images.new(os.path.basename(path), w, h, alpha=False, float_buffer=False)
    img.colorspace_settings.name = "Non-Color"
    rgba = np.concatenate([rgb, np.ones((h, w, 1), np.float32)], axis=2)
    img.pixels.foreach_set(np.clip(rgba, 0, 1).astype(np.float32).ravel())
    img.filepath_raw = path
    img.file_format = "PNG"
    img.save()
    bpy.data.images.remove(img)
    log("wrote", path, w, h)


def encode_lightmap():
    raw = read_float_image(os.path.join(BUILD, "lightmap_raw.exr"))[..., :3]
    refined = os.path.join(BUILD, "lightmap_refined.exr")
    src = refined if os.path.exists(refined) else os.path.join(BUILD, "lightmap_denoised.exr")
    log("lightmap source", os.path.basename(src))
    den = read_float_image(src)[..., :3]
    den = np.maximum(den, 0.0)
    used = raw.max(axis=2) > 0
    vals = den[used].ravel()
    scale = float(np.percentile(vals, 99.5))
    log("lightmap: used %.3f, p50 %.3f, p99.5 (scale) %.4f, max %.2f" % (used.mean(), np.percentile(vals, 50), scale,
                                                                          den.max()))
    # unused texels: fill with the mean so mip levels do not pull island edges to black
    fill = den[used].mean(axis=0)
    den[~used] = fill
    size = den.shape[0]
    write_png(srgb_oetf(den / scale), os.path.join(BUILD, "lightmap-high.png"))
    low = den.reshape(size // 2, 2, size // 2, 2, 3).mean(axis=(1, 3))
    write_png(srgb_oetf(low / scale), os.path.join(BUILD, "lightmap-low.png"))
    return scale, size


def exterior_panorama(rotation_deg):
    # Tone-mapped equirect matching the bake: sample(d) = hdri(R_z(rot) * d) -> column shift.
    hdr = read_float_image(HDRI)[..., :3]
    h, w = hdr.shape[:2]
    shift = int(round(rotation_deg / 360.0 * w))
    hdr = np.roll(hdr, shift, axis=1)
    small = hdr.reshape(h // 2, 2, w // 2, 2, 3).mean(axis=(1, 3))
    x = small * EXTERIOR_EXPOSURE
    # ACES fitted (Narkowicz) keeps sky detail while preserving saturation reasonably
    a, b, c, d, e = 2.51, 0.03, 2.43, 0.59, 0.14
    y = np.clip((x * (a * x + b)) / (x * (c * x + d) + e), 0, 1)
    out = srgb_oetf(y)
    img = bpy.data.images.new("exterior", w // 2, h // 2, alpha=False, float_buffer=False)
    img.colorspace_settings.name = "Non-Color"
    rgba = np.concatenate([out, np.ones((h // 2, w // 2, 1), np.float32)], axis=2)
    img.pixels.foreach_set(rgba.astype(np.float32).ravel())
    path = os.path.join(BUILD, "exterior.png")
    img.filepath_raw = path
    img.file_format = "PNG"
    img.save()
    log("wrote", path)


def join_details():
    for det in [o for o in bpy.data.objects if o.name.startswith("detail_")]:
        mat = det.name[len("detail_"):]
        target = bpy.data.objects.get("static_" + mat)
        if target is None:
            det.name = "static_" + mat
            det.data.name = det.name
            continue
        bpy.ops.object.select_all(action="DESELECT")
        det.select_set(True)
        target.select_set(True)
        bpy.context.view_layer.objects.active = target
        bpy.ops.object.join()
    log("joined detail meshes")


def export_glb():
    for o in list(bpy.data.objects):
        if o.type != "MESH":
            bpy.data.objects.remove(o, do_unlink=True)
    for o in bpy.data.objects:
        me = o.data
        if "UVMap" in me.uv_layers:
            me.uv_layers["UVMap"].active_render = True
            me.uv_layers.active = me.uv_layers["UVMap"]
        if o.name.startswith("glass_"):
            assert len(me.uv_layers) == 1, o.name
        else:
            assert list(me.uv_layers.keys()) == ["UVMap", "lightmap"], (o.name, me.uv_layers.keys())
    for mat in bpy.data.materials:
        # all opaque surfaces are verified outward-facing -> single-sided in glTF; glass stays double-sided
        mat.use_backface_culling = not mat.name.startswith("glass_")
    path = os.path.join(BUILD, "room_raw.glb")
    bpy.ops.export_scene.gltf(filepath=path, export_format="GLB", export_texcoords=True, export_normals=True,
                              export_tangents=False, export_materials="EXPORT", export_image_format="AUTO",
                              export_yup=True, export_apply=False, export_cameras=False, export_lights=False,
                              export_extras=False, export_animations=False, use_selection=False,
                              export_vertex_color="NONE", export_attributes=False)
    log("exported", path, os.path.getsize(path))


def main():
    bpy.ops.wm.open_mainfile(filepath=os.path.join(BUILD, "room_uv.blend"))
    scale, size = encode_lightmap()
    with open(os.path.join(BUILD, "room-meta.base.json")) as fh:
        meta = json.load(fh)
    exterior_panorama(meta.get("hdriRotationDeg", 0.0))
    join_details()
    export_glb()
    stats = {}
    stats_path = os.path.join(BUILD, "bake_stats.json")
    if os.path.exists(stats_path):
        with open(stats_path) as fh:
            stats = json.load(fh)
    out = {
        "lightmapScale": round(scale, 5),
        "spawn": meta["spawn"],
        "anchors": meta["anchors"],
        "lightmap": {
            "high": "lightmap-high.webp", "low": "lightmap-low.webp", "uvChannel": 1, "colorSpace": "srgb",
            "flipY": False, "decode": "linear = srgbToLinear(texel) * lightmapScale",
            "threeLightMapIntensity": round(scale * math.pi, 5),
            "note": "Baked Cycles DIFFUSE (direct+indirect, no color): final diffuse = albedo * decoded value. "
                    "three.js MeshStandardMaterial divides lightMap by PI, hence threeLightMapIntensity = scale*PI.",
            "texelsPerMeterHigh": stats.get("texels_per_meter"),
            "bakeSamples": stats.get("samples"),
        },
        "exterior": {"file": "exterior.jpg", "projection": "equirectangular", "note":
                     "Already rotated to match the bake; use as-is with EquirectangularReflectionMapping."},
        "objects": meta.get("objects", {}),
        "coordinates": "three.js meters, Y up; room interior x[-5,5] z[-4,4] y[0,3.2]",
    }
    with open(os.path.join(BUILD, "room-meta.json"), "w") as fh:
        json.dump(out, fh, indent=1)
    log("lightmapScale", scale)


main()
