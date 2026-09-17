# Render review images of the lab room.
import argparse
import math
import os
import sys

import bpy


def args():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    p = argparse.ArgumentParser()
    p.add_argument("--blend", required=True)
    p.add_argument("--out", required=True)
    p.add_argument("--mode", default="pathtraced")
    p.add_argument("--cams", default="cam_spawn,cam_windows,cam_fumehood,cam_back,cam_front,cam_overview")
    p.add_argument("--samples", type=int, default=128)
    p.add_argument("--res", default="1280x720")
    p.add_argument("--lightmap", default="")
    p.add_argument("--scale", type=float, default=1.0)
    p.add_argument("--exposure", type=float, default=0.0)
    p.add_argument("--view", default="Khronos PBR Neutral")
    return p.parse_args(argv)


def use_gpu(scene):
    try:
        prefs = bpy.context.preferences.addons["cycles"].preferences
        prefs.compute_device_type = "METAL"
        prefs.get_devices()
        ok = False
        for d in prefs.devices:
            d.use = d.type == "METAL"
            ok = ok or d.use
        scene.cycles.device = "GPU" if ok else "CPU"
    except Exception as e:  # noqa: BLE001
        print("GPU setup failed:", e)
        scene.cycles.device = "CPU"


def to_lightmap_preview(lightmap_path, scale):
    # Replace every non-glass material by emission = albedo * (sRGB-decoded lightmap * scale).
    img = bpy.data.images.load(lightmap_path, check_existing=True)
    img.colorspace_settings.name = "sRGB"
    for mat in bpy.data.materials:
        if not mat.use_nodes:
            continue
        nt = mat.node_tree
        bsdf = next((n for n in nt.nodes if n.type == "BSDF_PRINCIPLED"), None)
        out = next((n for n in nt.nodes if n.type == "OUTPUT_MATERIAL"), None)
        if not bsdf or not out:
            continue
        if bsdf.inputs["Alpha"].default_value < 0.999:
            continue  # glass keeps its shader
        base_link = bsdf.inputs["Base Color"].links
        uvn = nt.nodes.new("ShaderNodeUVMap")
        uvn.uv_map = "lightmap"
        lm = nt.nodes.new("ShaderNodeTexImage")
        lm.image = img
        lm.interpolation = "Linear"
        nt.links.new(uvn.outputs["UV"], lm.inputs["Vector"])
        mul = nt.nodes.new("ShaderNodeMix")
        mul.data_type = "RGBA"
        mul.blend_type = "MULTIPLY"
        mul.inputs["Factor"].default_value = 1.0
        if base_link:
            nt.links.new(base_link[0].from_socket, mul.inputs["A"])
        else:
            mul.inputs["A"].default_value = bsdf.inputs["Base Color"].default_value
        sc = nt.nodes.new("ShaderNodeMix")
        sc.data_type = "RGBA"
        sc.blend_type = "MULTIPLY"
        sc.inputs["Factor"].default_value = 1.0
        nt.links.new(lm.outputs["Color"], sc.inputs["A"])
        sc.inputs["B"].default_value = (scale, scale, scale, 1.0)
        nt.links.new(sc.outputs["Result"], mul.inputs["B"])
        metal = bsdf.inputs["Metallic"].default_value
        emis = nt.nodes.new("ShaderNodeEmission")
        nt.links.new(mul.outputs["Result"], emis.inputs["Color"])
        emis.inputs["Strength"].default_value = 1.0 - 0.75 * metal
        add = nt.nodes.new("ShaderNodeAddShader")
        nt.links.new(emis.outputs["Emission"], add.inputs[0])
        e2 = nt.nodes.new("ShaderNodeEmission")
        e2.inputs["Color"].default_value = bsdf.inputs["Emission Color"].default_value
        e2.inputs["Strength"].default_value = bsdf.inputs["Emission Strength"].default_value
        nt.links.new(e2.outputs["Emission"], add.inputs[1])
        nt.links.new(add.outputs["Shader"], out.inputs["Surface"])
    for ob in bpy.data.objects:
        if ob.type == "LIGHT":
            ob.hide_render = True


def single_sided_emitters():
    # same as the bake: emitters light only their front side
    for mat in bpy.data.materials:
        if not mat.use_nodes:
            continue
        nt = mat.node_tree
        bsdf = next((n for n in nt.nodes if n.type == "BSDF_PRINCIPLED"), None)
        out = next((n for n in nt.nodes if n.type == "OUTPUT_MATERIAL"), None)
        if not bsdf or not out or bsdf.inputs["Emission Strength"].default_value <= 0:
            continue
        back = nt.nodes.new("ShaderNodeBsdfDiffuse")
        back.inputs["Color"].default_value = bsdf.inputs["Base Color"].default_value
        geo = nt.nodes.new("ShaderNodeNewGeometry")
        mix = nt.nodes.new("ShaderNodeMixShader")
        nt.links.new(geo.outputs["Backfacing"], mix.inputs["Factor"])
        nt.links.new(bsdf.outputs["BSDF"], mix.inputs[1])
        nt.links.new(back.outputs["BSDF"], mix.inputs[2])
        nt.links.new(mix.outputs["Shader"], out.inputs["Surface"])
        mat.cycles.emission_sampling = "FRONT"


def main():
    a = args()
    bpy.ops.wm.open_mainfile(filepath=a.blend)
    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    use_gpu(scene)
    w, h = (int(v) for v in a.res.split("x"))
    scene.render.resolution_x, scene.render.resolution_y = w, h
    scene.render.resolution_percentage = 100
    scene.cycles.samples = a.samples
    scene.cycles.use_adaptive_sampling = True
    scene.cycles.use_denoising = True
    scene.cycles.max_bounces = 8
    scene.cycles.diffuse_bounces = 4
    scene.cycles.glossy_bounces = 3
    scene.cycles.transmission_bounces = 4
    scene.cycles.sample_clamp_indirect = 6.0
    try:
        scene.view_settings.view_transform = a.view
    except TypeError:
        scene.view_settings.view_transform = "AgX"
    scene.view_settings.exposure = a.exposure
    scene.render.image_settings.file_format = "JPEG"
    scene.render.image_settings.quality = 90
    if a.mode == "lightmap":
        to_lightmap_preview(os.path.abspath(a.lightmap), a.scale)
    else:
        single_sided_emitters()
        for ob in bpy.data.objects:
            if ob.name.startswith("detail_"):
                ob.hide_render = False
        scene.cycles.samples = min(a.samples, 32)
        scene.cycles.max_bounces = 4
    os.makedirs(a.out, exist_ok=True)
    for cam in a.cams.split(","):
        scene.camera = bpy.data.objects[cam]
        scene.render.filepath = os.path.join(os.path.abspath(a.out), f"{a.mode}_{cam}.jpg")
        bpy.ops.render.render(write_still=True)
        print("rendered", scene.render.filepath)


main()
