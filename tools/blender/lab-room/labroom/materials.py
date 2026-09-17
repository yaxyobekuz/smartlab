# Material specs (glTF-friendly Principled BSDF node trees).
import os

import bpy

LED_4500K = (1.0, 0.89, 0.78)
LED_STRENGTH = 21.5

# atlas rects in the 1024x1024 signs atlas, pixel boxes (x0, y0, x1, y1) with y measured from the TOP
ATLAS_PX = {
    "sign_extinguisher": (0, 0, 256, 256),
    "sign_first_aid": (256, 0, 512, 256),
    "sign_eyewash": (512, 0, 768, 256),
    "sign_warning": (768, 0, 1024, 256),
    "ghs_flammable": (0, 256, 256, 512),
    "ghs_exclamation": (256, 256, 512, 512),
    "sign_goggles": (512, 256, 768, 512),
    "label_fan": (768, 256, 1024, 512),
    "display_airflow": (0, 512, 256, 640),
    "keyboard": (256, 512, 768, 663),
    "label_blanket": (768, 512, 1024, 768),
    "first_aid_front": (0, 768, 256, 1024),
    "bottle_label_a": (256, 768, 512, 896),
    "bottle_label_b": (256, 896, 512, 1024),
    "label_gas": (512, 768, 640, 832),
    "label_water": (640, 768, 768, 832),
    "sash_label": (512, 832, 768, 896),
}
ATLAS_SIZE = 1024


def atlas_uv(key):
    # UV rect (u0, v0, u1, v1) in Blender convention (v up) with a half-texel inset.
    x0, y0, x1, y1 = ATLAS_PX[key]
    s = ATLAS_SIZE
    inset = 1.5
    return ((x0 + inset) / s, 1 - (y1 - inset) / s, (x1 - inset) / s, 1 - (y0 + inset) / s)


MATERIALS = {
    # --- textured architecture
    "floor_vinyl": dict(albedo="floor_albedo.png", normal="floor_normal.png", rough_tex="floor_rough.png",
                        normal_strength=0.6, repeat=2.4),
    "wall_paint": dict(albedo="wall_albedo.png", normal="wall_normal.png", rough_tex="wall_rough.png",
                       normal_strength=0.35, repeat=2.0),
    "ceiling_tile": dict(albedo="ceiling_albedo.png", normal="ceiling_normal.png", rough_tex="ceiling_rough.png",
                         normal_strength=0.6, repeat=1.2),
    "ceramic_white": dict(albedo="tile_albedo.png", normal="tile_normal.png", rough_tex="tile_rough.png",
                          normal_strength=1.0, repeat=1.27, uv_rot90=True),
    "wood_ash": dict(albedo="wood_albedo.png", normal="wood_normal.png", rough_tex="wood_rough.png",
                     normal_strength=0.4, repeat=1.0),
    "wood_door": dict(albedo="wood_albedo.png", normal="wood_normal.png", rough_tex="wood_rough.png",
                      normal_strength=0.4, repeat=1.0, uv_rot90=True),
    "fabric_dark": dict(albedo="fabric_dark_albedo.png", normal="fabric_dark_normal.png",
                        rough_tex="fabric_dark_rough.png", normal_strength=0.8, repeat=0.27),
    "fabric_white": dict(albedo="fabric_white_albedo.png", normal="fabric_white_normal.png",
                         rough_tex="fabric_white_rough.png", normal_strength=0.8, repeat=0.29),
    # --- furniture
    "epoxy_black": dict(color=(0.028, 0.028, 0.031), rough_tex="epoxy_rough.png", repeat=1.0),
    "laminate_white": dict(color=(0.78, 0.78, 0.76), rough_tex="laminate_rough.png", repeat=0.8),
    "laminate_gray": dict(color=(0.16, 0.165, 0.17), rough=0.55),
    "steel_brushed": dict(color=(0.62, 0.62, 0.62), metal=1.0, rough_tex="steel_rough.png",
                          normal="steel_normal.png", normal_strength=0.25, repeat=0.25),
    "chrome": dict(color=(0.85, 0.85, 0.86), metal=1.0, rough=0.08),
    "metal_white": dict(color=(0.80, 0.80, 0.79), rough=0.38),
    "pvc_white": dict(color=(0.86, 0.86, 0.85), rough=0.32),
    "plastic_black": dict(color=(0.018, 0.018, 0.02), rough=0.42),
    "rubber_black": dict(color=(0.025, 0.025, 0.025), rough=0.85),
    "red_paint": dict(color=(0.50, 0.012, 0.012), rough=0.28),
    "green_plastic": dict(color=(0.01, 0.30, 0.07), rough=0.4),
    "yellow_plastic": dict(color=(0.85, 0.52, 0.01), rough=0.4),
    "amber_glass": dict(color=(0.10, 0.035, 0.006), rough=0.06),
    "signs_atlas": dict(albedo="signs_atlas.png", rough=0.45, repeat=1.0),
    # --- special (unique so the web app can swap maps / toggle emission)
    "whiteboard": dict(color=(0.86, 0.87, 0.87), rough=0.12),
    "paper_poster": dict(color=(0.82, 0.82, 0.80), rough=0.55),
    "clock_face": dict(color=(0.86, 0.86, 0.85), rough=0.35),
    "screen": dict(color=(0.006, 0.006, 0.008), rough=0.12),
    "exit_sign": dict(color=(0.02, 0.30, 0.07), rough=0.3, emit=(0.05, 1.0, 0.25), emit_strength=2.0),
    "led_panel": dict(color=(0.9, 0.9, 0.9), rough=0.5, emit=LED_4500K, emit_strength=LED_STRENGTH),
    "lamp_diffuser": dict(color=(0.85, 0.85, 0.84), rough=0.3),
    "red_lens": dict(color=(0.45, 0.01, 0.01), rough=0.15),
    # --- glass (alpha blended, never baked)
    "glass_clear": dict(color=(0.92, 0.96, 0.96), rough=0.03, alpha=0.12),
}


def _link(nt, a, b):
    nt.links.new(a, b)


def _img_node(nt, path, non_color, x, y, uvnode):
    img = bpy.data.images.load(path, check_existing=True)
    img.colorspace_settings.name = "Non-Color" if non_color else "sRGB"
    n = nt.nodes.new("ShaderNodeTexImage")
    n.image = img
    n.location = (x, y)
    n.interpolation = "Linear"
    _link(nt, uvnode.outputs["UV"], n.inputs["Vector"])
    return n


def build_materials(tex_dir):
    out = {}
    for name, spec in MATERIALS.items():
        mat = bpy.data.materials.get(name) or bpy.data.materials.new(name)
        mat.use_nodes = True
        nt = mat.node_tree
        nt.nodes.clear()
        outn = nt.nodes.new("ShaderNodeOutputMaterial")
        outn.location = (400, 0)
        bsdf = nt.nodes.new("ShaderNodeBsdfPrincipled")
        bsdf.location = (0, 0)
        _link(nt, bsdf.outputs["BSDF"], outn.inputs["Surface"])
        uvn = nt.nodes.new("ShaderNodeUVMap")
        uvn.uv_map = "UVMap"
        uvn.location = (-900, 0)
        col = spec.get("color", (0.8, 0.8, 0.8))
        bsdf.inputs["Base Color"].default_value = (*col, 1.0)
        if "albedo" in spec:
            n = _img_node(nt, os.path.join(tex_dir, spec["albedo"]), False, -500, 300, uvn)
            _link(nt, n.outputs["Color"], bsdf.inputs["Base Color"])
        bsdf.inputs["Metallic"].default_value = spec.get("metal", 0.0)
        bsdf.inputs["Roughness"].default_value = spec.get("rough", 0.5)
        if "rough_tex" in spec:
            n = _img_node(nt, os.path.join(tex_dir, spec["rough_tex"]), True, -500, 0, uvn)
            _link(nt, n.outputs["Color"], bsdf.inputs["Roughness"])
        if "normal" in spec:
            n = _img_node(nt, os.path.join(tex_dir, spec["normal"]), True, -500, -300, uvn)
            nm = nt.nodes.new("ShaderNodeNormalMap")
            nm.uv_map = "UVMap"
            nm.location = (-200, -300)
            nm.inputs["Strength"].default_value = spec.get("normal_strength", 1.0)
            _link(nt, n.outputs["Color"], nm.inputs["Color"])
            _link(nt, nm.outputs["Normal"], bsdf.inputs["Normal"])
        if "emit" in spec:
            bsdf.inputs["Emission Color"].default_value = (*spec["emit"], 1.0)
            bsdf.inputs["Emission Strength"].default_value = spec.get("emit_strength", 1.0)
        if "alpha" in spec:
            bsdf.inputs["Alpha"].default_value = spec["alpha"]
            bsdf.inputs["IOR"].default_value = 1.5
            mat.surface_render_method = "BLENDED"
            mat.use_backface_culling = False
        if "alpha" not in spec:
            mat.use_backface_culling = True
        mat["lab_spec"] = name
        out[name] = mat
    return out
