# Smooth residual bake noise inside UV islands (OIDN leaves narrow islands noisy) and rebuild the margins.
import argparse
import math
import os
import sys
import time

import bpy
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
BUILD = os.path.join(HERE, "build")


def parse():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    p = argparse.ArgumentParser()
    p.add_argument("--src", default="lightmap_denoised.exr")
    p.add_argument("--out", default="lightmap_refined.exr")
    p.add_argument("--sigma", type=float, default=2.5, help="spatial sigma in texels")
    p.add_argument("--radius", type=int, default=7)
    p.add_argument("--normal-power", type=int, default=8)
    p.add_argument("--margin", type=int, default=16)
    p.add_argument("--reuse-guides", action="store_true")
    return p.parse_args(argv)


def log(*a):
    print("[refine]", *a, flush=True)


def read_exr(path):
    img = bpy.data.images.load(path, check_existing=False)
    w, h = img.size
    px = np.empty(w * h * 4, np.float32)
    img.pixels.foreach_get(px)
    bpy.data.images.remove(img)
    return px.reshape(h, w, 4)


def write_exr(arr, path):
    h, w = arr.shape[:2]
    img = bpy.data.images.new(os.path.basename(path), w, h, alpha=True, float_buffer=True)
    rgba = arr if arr.shape[2] == 4 else np.concatenate([arr, np.ones((h, w, 1), np.float32)], axis=2)
    img.pixels.foreach_set(rgba.astype(np.float32).ravel())
    img.filepath_raw = path
    img.file_format = "OPEN_EXR"
    img.save()
    bpy.data.images.remove(img)


def bake_guides(size):
    # world position (alpha = coverage) and geometric normal per texel, margin 0
    bpy.ops.wm.open_mainfile(filepath=os.path.join(BUILD, "room_uv.blend"))
    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    prefs = bpy.context.preferences.addons["cycles"].preferences
    prefs.compute_device_type = "METAL"
    prefs.get_devices()
    ok = False
    for d in prefs.devices:
        d.use = d.type == "METAL"
        ok = ok or d.use
    scene.cycles.device = "GPU" if ok else "CPU"
    scene.cycles.samples = 1
    objs = [o for o in bpy.data.objects if o.type == "MESH" and not o.name.startswith(("glass_", "detail_"))]
    for o in bpy.data.objects:
        if o.name.startswith(("glass_", "detail_")):
            o.hide_render = True
    guides = {}
    for kind in ("POSITION", "NORMAL"):
        img = bpy.data.images.new("guide_" + kind, size, size, alpha=True, float_buffer=True)
        for mat in bpy.data.materials:
            if not mat.use_nodes:
                continue
            nt = mat.node_tree
            out = next((n for n in nt.nodes if n.type == "OUTPUT_MATERIAL"), None)
            if out is None:
                continue
            diff = nt.nodes.new("ShaderNodeBsdfDiffuse")
            nt.links.new(diff.outputs["BSDF"], out.inputs["Surface"])
            t = nt.nodes.new("ShaderNodeTexImage")
            t.image = img
            nt.nodes.active = t
        bpy.ops.object.select_all(action="DESELECT")
        for o in objs:
            o.select_set(True)
        bpy.context.view_layer.objects.active = objs[0]
        t0 = time.time()
        bpy.ops.object.bake(type=kind, margin=0, use_clear=True, target="IMAGE_TEXTURES", normal_space="OBJECT")
        px = np.empty(size * size * 4, np.float32)
        img.pixels.foreach_get(px)
        guides[kind] = px.reshape(size, size, 4)
        log("guide", kind, "%.1fs" % (time.time() - t0))
    return guides


def filter_pass(L, nrm, C, axis, radius, sigma, power):
    H, W = C.shape
    acc = L * C[..., None]
    wsum = C.astype(np.float32)
    nx, ny, nz = nrm[..., 0], nrm[..., 1], nrm[..., 2]
    for k in range(1, radius + 1):
        gs = math.exp(-k * k / (2 * sigma * sigma))
        for sgn in (1, -1):
            lo, hi = (slice(0, (W if axis == 1 else H) - k), slice(k, (W if axis == 1 else H)))
            a, b = (lo, hi) if sgn > 0 else (hi, lo)
            d = (slice(None), a) if axis == 1 else (a, slice(None))
            s = (slice(None), b) if axis == 1 else (b, slice(None))
            dot = nx[d] * nx[s] + ny[d] * ny[s] + nz[d] * nz[s]
            np.clip(dot, 0.0, 1.0, out=dot)
            w = dot
            for _ in range(int(round(math.log2(power)))):
                w = w * w
            w *= gs
            w *= C[s]
            acc[d] += w[..., None] * L[s]
            wsum[d] += w
    out = acc / np.maximum(wsum, 1e-8)[..., None]
    return np.where(C[..., None], out, L)


def dilate(L, C, iterations):
    # fill uncovered texels ring by ring with the mean of their filled 8-neighbours
    L = np.where(C[..., None], L, 0.0).astype(np.float32)
    filled = C.copy()
    H, W = C.shape
    offs = [(-1, -1), (-1, 0), (-1, 1), (0, -1), (0, 1), (1, -1), (1, 0), (1, 1)]
    for _ in range(iterations):
        acc = np.zeros_like(L)
        cnt = np.zeros((H, W), np.float32)
        for dy, dx in offs:
            ys = slice(max(dy, 0), H + min(dy, 0))
            yd = slice(max(-dy, 0), H + min(-dy, 0))
            xs = slice(max(dx, 0), W + min(dx, 0))
            xd = slice(max(-dx, 0), W + min(-dx, 0))
            f = filled[ys, xs]
            acc[yd, xd] += L[ys, xs] * f[..., None]
            cnt[yd, xd] += f
        grow = (~filled) & (cnt > 0)
        L[grow] = acc[grow] / cnt[grow][:, None]
        filled |= grow
    return L, filled


def main():
    a = parse()
    t0 = time.time()
    src = read_exr(os.path.join(BUILD, a.src))[..., :3]
    size = src.shape[0]
    gpath = os.path.join(BUILD, "lightmap_guides.npz")
    if a.reuse_guides and os.path.exists(gpath):
        g = np.load(gpath)
        C, nrm = g["coverage"], g["normal"]
    else:
        guides = bake_guides(size)
        C = guides["POSITION"][..., 3] > 0.5
        nrm = guides["NORMAL"][..., :3] * 2.0 - 1.0
        nrm /= np.maximum(np.linalg.norm(nrm, axis=-1, keepdims=True), 1e-6)
        nrm = nrm.astype(np.float32)
        np.savez(gpath, coverage=C, normal=nrm)
    log("coverage %.4f" % C.mean())
    L = filter_pass(src, nrm, C, 1, a.radius, a.sigma, a.normal_power)
    L = filter_pass(L, nrm, C, 0, a.radius, a.sigma, a.normal_power)
    L, filled = dilate(L, C, a.margin)
    raw = read_exr(os.path.join(BUILD, "lightmap_raw.exr"))[..., :3]
    keep = (~filled) & (raw.max(axis=2) > 0)
    L[keep] = src[keep]
    write_exr(L, os.path.join(BUILD, a.out))
    log("wrote", a.out, "in %.1fs" % (time.time() - t0))


main()
