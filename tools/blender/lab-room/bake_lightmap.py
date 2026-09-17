# Create the shared lightmap UV atlas and bake DIFFUSE (direct + indirect) lighting.
import argparse
import json
import math
import os
import sys
import time

import bpy
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
BUILD = os.path.join(HERE, "build")

EMISSIVE_OFF_IN_BAKE = {"lamp_diffuser", "red_lens", "screen"}
NO_SHADOW_CAST = {"extinguisher"}


def parse():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    p = argparse.ArgumentParser()
    p.add_argument("--size", type=int, default=4096)
    p.add_argument("--samples", type=int, default=1024)
    p.add_argument("--margin", type=int, default=16)
    p.add_argument("--pack-margin", type=float, default=0.003)
    p.add_argument("--skip-uv", action="store_true", help="reuse build/room_uv.blend")
    return p.parse_args(argv)


def log(*a):
    print("[bake]", *a, flush=True)


def bake_objects():
    # Lightmap receivers: every non-glass mesh except the small 'detail_*' parts.
    return [o for o in bpy.data.objects if o.type == "MESH" and not o.name.startswith(("glass_", "detail_"))]


def detail_objects():
    return [o for o in bpy.data.objects if o.type == "MESH" and o.name.startswith("detail_")]


def proxy_detail_uvs(details, receivers):
    # Small parts reuse the lightmap texels of the nearest receiver surface (they are hidden during the bake).
    from mathutils import Vector
    from mathutils.bvhtree import BVHTree
    from mathutils.geometry import barycentric_transform
    t = time.time()
    verts, tris, tri_uv = [], [], []
    for o in receivers:
        me = o.data
        me.calc_loop_triangles()
        mw = o.matrix_world
        uvl = me.uv_layers["lightmap"].data
        wv = [mw @ v.co for v in me.vertices]
        for lt in me.loop_triangles:
            a, b, c = (wv[i] for i in lt.vertices)
            area = (b - a).cross(c - a).length / 2
            longest = max((b - a).length, (c - b).length, (a - c).length)
            if longest < 1e-6 or 2 * area / longest < 0.006:
                continue  # skip slivers (bevel strips): unstable for extrapolation
            base = len(verts)
            verts.extend((a, b, c))
            tris.append((base, base + 1, base + 2))
            tri_uv.append(tuple(Vector((uvl[li].uv[0], uvl[li].uv[1], 0.0)) for li in lt.loops))
    tree = BVHTree.FromPolygons(verts, tris, all_triangles=True)
    n = 0
    for o in details:
        me = o.data
        if "lightmap" not in me.uv_layers:
            me.uv_layers.new(name="lightmap")
        me.uv_layers["UVMap"].active_render = True
        uvl = me.uv_layers["lightmap"].data
        mw = o.matrix_world
        for poly in me.polygons:
            cen = mw @ poly.center
            loc, _nrm, idx, _dist = tree.find_nearest(cen)
            if idx is None:
                continue
            a, b, c = (verts[i] for i in tris[idx])
            ua, ub, uc = tri_uv[idx]
            nrm = (b - a).cross(c - a).normalized()
            for li in poly.loop_indices:
                p = mw @ me.vertices[me.loops[li].vertex_index].co
                p = p - nrm * nrm.dot(p - a)
                uv = barycentric_transform(p, a, b, c, ua, ub, uc)
                uvl[li].uv = (min(max(uv.x, 0.0), 1.0), min(max(uv.y, 0.0), 1.0))
                n += 1
    log("proxy lightmap UVs for %d detail loops in %.1fs" % (n, time.time() - t))


def make_lightmap_uvs(objs, pack_margin):
    t = time.time()
    for o in objs:
        me = o.data
        if "lightmap" not in me.uv_layers:
            me.uv_layers.new(name="lightmap")
        me.uv_layers["UVMap"].active_render = True
        me.uv_layers.active = me.uv_layers["lightmap"]
    import bmesh
    bpy.ops.object.select_all(action="DESELECT")
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    bpy.context.tool_settings.mesh_select_mode = (False, False, True)
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="SELECT")
    # faces with preset islands (lm_preset attribute, e.g. lab coats) keep them; the rest gets Smart UV Project
    for o in objs:
        attr = o.data.attributes.get("lm_preset")
        if attr is None:
            continue
        bm = bmesh.from_edit_mesh(o.data)
        lay = bm.faces.layers.bool.get("lm_preset")
        for f in bm.faces:
            f.select_set(not f[lay])
        bmesh.update_edit_mesh(o.data)
    bpy.ops.uv.select_all(action="SELECT")
    bpy.ops.uv.smart_project(angle_limit=math.radians(60), island_margin=0.0, area_weight=0.0,
                             correct_aspect=True, scale_to_bounds=False)
    bpy.ops.mesh.select_all(action="SELECT")
    bpy.ops.uv.select_all(action="SELECT")
    bpy.ops.uv.average_islands_scale(scale_uv=False, shear=False)
    bpy.ops.uv.pack_islands(udim_source="CLOSEST_UDIM", rotate=True, rotate_method="ANY", scale=True,
                            merge_overlap=False, margin_method="FRACTION", margin=pack_margin, pin=False,
                            shape_method="CONCAVE")
    bpy.ops.object.mode_set(mode="OBJECT")
    for o in objs:
        me = o.data
        me.uv_layers["UVMap"].active_render = True
        me.uv_layers.active = me.uv_layers["lightmap"]
    log("lightmap UVs packed in %.1fs" % (time.time() - t))


def uv_stats(objs, size):
    # World area vs UV area -> texels per meter; also UV coverage.
    world_area = 0.0
    uv_area = 0.0
    for o in objs:
        me = o.data
        mw = o.matrix_world
        uvl = me.uv_layers["lightmap"].data
        for poly in me.polygons:
            pts = [mw @ me.vertices[i].co for i in poly.vertices]
            a = 0.0
            for k in range(1, len(pts) - 1):
                a += ((pts[k] - pts[0]).cross(pts[k + 1] - pts[0])).length / 2
            world_area += a
            uvs = [uvl[li].uv for li in poly.loop_indices]
            ua = 0.0
            for k in range(1, len(uvs) - 1):
                (x0, y0), (x1, y1), (x2, y2) = uvs[0], uvs[k], uvs[k + 1]
                ua += abs((x1 - x0) * (y2 - y0) - (x2 - x0) * (y1 - y0)) / 2
            uv_area += ua
    tpm = math.sqrt(uv_area * size * size / max(world_area, 1e-9))
    return {"world_area_m2": round(world_area, 2), "uv_coverage": round(uv_area, 4),
            "texels_per_meter": round(tpm, 1)}


def prepare_bake_materials(image):
    # Swap every material to Diffuse(+Emission) with an active bake target image node.
    for mat in bpy.data.materials:
        if not mat.use_nodes or mat.name.startswith("glass_"):
            continue
        nt = mat.node_tree
        bsdf = next((n for n in nt.nodes if n.type == "BSDF_PRINCIPLED"), None)
        out = next((n for n in nt.nodes if n.type == "OUTPUT_MATERIAL"), None)
        if not bsdf or not out:
            continue
        diff = nt.nodes.new("ShaderNodeBsdfDiffuse")
        links = bsdf.inputs["Base Color"].links
        if links:
            nt.links.new(links[0].from_socket, diff.inputs["Color"])
        else:
            diff.inputs["Color"].default_value = bsdf.inputs["Base Color"].default_value
        shader = diff.outputs["BSDF"]
        strength = bsdf.inputs["Emission Strength"].default_value
        if strength > 0 and mat.name not in EMISSIVE_OFF_IN_BAKE:
            em = nt.nodes.new("ShaderNodeEmission")
            em.inputs["Color"].default_value = bsdf.inputs["Emission Color"].default_value
            em.inputs["Strength"].default_value = strength
            add = nt.nodes.new("ShaderNodeAddShader")
            nt.links.new(shader, add.inputs[0])
            nt.links.new(em.outputs["Emission"], add.inputs[1])
            # emitters are single-sided (a panel's back must not light the ceiling right above it)
            geo = nt.nodes.new("ShaderNodeNewGeometry")
            mix = nt.nodes.new("ShaderNodeMixShader")
            nt.links.new(geo.outputs["Backfacing"], mix.inputs["Factor"])
            nt.links.new(add.outputs["Shader"], mix.inputs[1])
            nt.links.new(shader, mix.inputs[2])
            shader = mix.outputs["Shader"]
            mat.cycles.emission_sampling = "FRONT"
        nt.links.new(shader, out.inputs["Surface"])
        tgt = nt.nodes.new("ShaderNodeTexImage")
        tgt.image = image
        tgt.select = True
        nt.nodes.active = tgt


def use_gpu(scene):
    prefs = bpy.context.preferences.addons["cycles"].preferences
    prefs.compute_device_type = "METAL"
    prefs.get_devices()
    ok = False
    for d in prefs.devices:
        d.use = d.type == "METAL"
        ok = ok or d.use
    scene.cycles.device = "GPU" if ok else "CPU"
    log("device", scene.cycles.device, [d.name for d in prefs.devices if d.use])


def denoise_exr(src_path, dst_path, size):
    # OIDN via the compositor (Image -> Denoise -> File Output).
    scene = bpy.data.scenes.new("denoise")
    img = bpy.data.images.load(src_path, check_existing=False)
    tree = bpy.data.node_groups.new("denoise_tree", "CompositorNodeTree")
    scene.compositing_node_group = tree
    n_img = tree.nodes.new("CompositorNodeImage")
    n_img.image = img
    n_dn = tree.nodes.new("CompositorNodeDenoise")
    n_dn.inputs["HDR"].default_value = True
    try:
        n_dn.inputs["Quality"].default_value = "High"
    except Exception as e:  # noqa: BLE001
        log("denoise quality enum:", e)
    tree.links.new(n_img.outputs["Image"], n_dn.inputs["Image"])
    fo = tree.nodes.new("CompositorNodeOutputFile")
    fo.directory = os.path.dirname(dst_path)
    fo.file_name = "lightmap_denoised_"
    fo.format.media_type = "IMAGE"
    fo.format.file_format = "OPEN_EXR"
    fo.format.color_depth = "32"
    fo.format.exr_codec = "ZIP"
    fo.file_output_items.new("RGBA", "Image")
    tree.links.new(n_dn.outputs["Image"], fo.inputs["Image"])
    cam = bpy.data.cameras.new("denoise_cam")
    co = bpy.data.objects.new("denoise_cam", cam)
    scene.collection.objects.link(co)
    scene.camera = co
    scene.render.engine = "BLENDER_WORKBENCH"
    scene.render.resolution_x = size
    scene.render.resolution_y = size
    scene.render.resolution_percentage = 100
    scene.render.use_compositing = True
    scene.render.use_sequencer = False
    with bpy.context.temp_override(scene=scene):
        bpy.ops.render.render(write_still=False, scene=scene.name)
    produced = os.path.join(os.path.dirname(dst_path), "lightmap_denoised_Image.exr")
    os.replace(produced, dst_path)
    log("denoised ->", dst_path)


def main():
    a = parse()
    os.makedirs(BUILD, exist_ok=True)
    uv_blend = os.path.join(BUILD, "room_uv.blend")
    if a.skip_uv and os.path.exists(uv_blend):
        bpy.ops.wm.open_mainfile(filepath=uv_blend)
        objs = bake_objects()
    else:
        bpy.ops.wm.open_mainfile(filepath=os.path.join(BUILD, "room.blend"))
        objs = bake_objects()
        make_lightmap_uvs(objs, a.pack_margin)
        proxy_detail_uvs(detail_objects(), objs)
        bpy.ops.wm.save_as_mainfile(filepath=uv_blend, compress=True)
        log("saved", uv_blend)
    stats = uv_stats(objs, a.size)
    log("uv stats", stats)

    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    use_gpu(scene)
    scene.cycles.samples = a.samples
    scene.cycles.use_denoising = False
    scene.cycles.max_bounces = 8
    scene.cycles.diffuse_bounces = 6
    scene.cycles.glossy_bounces = 0
    scene.cycles.transmission_bounces = 0
    scene.cycles.transparent_max_bounces = 4
    scene.cycles.sample_clamp_direct = 0.0
    scene.cycles.sample_clamp_indirect = 0.0
    scene.cycles.use_light_tree = True
    scene.cycles.caustics_reflective = False
    scene.cycles.caustics_refractive = False
    scene.render.bake.margin = a.margin

    for o in bpy.data.objects:
        if o.name.startswith(("glass_", "detail_")):
            o.hide_render = True
        if o.name in NO_SHADOW_CAST:
            o.visible_shadow = False

    img = bpy.data.images.new("lightmap_raw", a.size, a.size, alpha=False, float_buffer=True)
    try:
        img.colorspace_settings.name = "Linear Rec.709"
    except TypeError:
        pass
    prepare_bake_materials(img)

    bpy.ops.object.select_all(action="DESELECT")
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    log("baking %d objects at %d px, %d samples" % (len(objs), a.size, a.samples))
    t = time.time()
    bpy.ops.object.bake(type="DIFFUSE", pass_filter={"DIRECT", "INDIRECT"}, margin=a.margin, margin_type="EXTEND",
                        use_clear=True, target="IMAGE_TEXTURES", use_selected_to_active=False)
    bake_s = time.time() - t
    log("bake done in %.1fs" % bake_s)
    stale = ["lightmap_refined.exr"] + ([] if a.skip_uv else ["lightmap_guides.npz"])
    for f in stale:
        if os.path.exists(os.path.join(BUILD, f)):
            os.remove(os.path.join(BUILD, f))
    raw = os.path.join(BUILD, "lightmap_raw.exr")
    img.filepath_raw = raw
    img.file_format = "OPEN_EXR"
    img.save()
    px = np.empty(a.size * a.size * 4, np.float32)
    img.pixels.foreach_get(px)
    px = px.reshape(a.size, a.size, 4)[..., :3]
    used = px.max(axis=2) > 0
    log("raw stats: used %.3f, mean %.3f, p50 %.3f, p99.5 %.3f, max %.2f" % (
        used.mean(), px[used].mean(), np.percentile(px[used], 50), np.percentile(px[used], 99.5), px.max()))

    den = os.path.join(BUILD, "lightmap_denoised.exr")
    denoise_exr(raw, den, a.size)
    stats.update({"size": a.size, "samples": a.samples, "bake_seconds": round(bake_s, 1),
                  "objects": len(objs)})
    with open(os.path.join(BUILD, "bake_stats.json"), "w") as fh:
        json.dump(stats, fh, indent=1)


main()
