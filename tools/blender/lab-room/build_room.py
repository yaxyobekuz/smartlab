# Build the chemistry lab room scene (geometry, materials, world, portals, cameras).
import json
import math
import os
import sys

import bpy
from mathutils import Vector

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
for m in [k for k in sys.modules if k.startswith("labroom")]:
    del sys.modules[m]
from labroom import geom as G  # noqa: E402
from labroom.materials import MATERIALS, atlas_uv, build_materials  # noqa: E402

BUILD = os.path.join(HERE, "build")
TEX = os.path.join(BUILD, "textures")
HDRI = os.path.join(HERE, "downloads", "museumplein_4k.hdr")
HDRI_ROTATION_DEG = 55.0      # autumn trees outside the windows; HDRI sun (az -38 deg) ends up behind the wall
HDRI_STRENGTH = 1.0

MATERIALS["glass_frosted"] = dict(color=(0.9, 0.92, 0.92), rough=0.45, alpha=0.8)

sc = G.Scene(MATERIALS)
COLLIDERS = []
ANCHORS = {}
OBJECT_INFO = {}

X0, X1, Z0, Z1, H = -5.0, 5.0, -4.0, 4.0, 3.2
WINDOW_ZC = (-2.6, 0.0, 2.6)
WIN_W, WIN_Y0, WIN_Y1 = 1.8, 0.9, 2.5
DOOR_Z0, DOOR_Z1, DOOR_H = 2.4, 3.4, 2.1


def B(mat, mn, mx, **kw):
    G.box_minmax(sc, mat, mn, mx, **kw)


def collider(name, mn, mx):
    c = [round((a + b) / 2, 4) for a, b in zip(mn, mx)]
    h = [round(abs(b - a) / 2, 4) for a, b in zip(mn, mx)]
    COLLIDERS.append({"name": name, "center": c, "half": h})


def anchor(name, position, size, **extra):
    ANCHORS[name] = {"position": [round(v, 4) for v in position], "size": [round(v, 4) for v in size], **extra}


# ============================================================ shell
def build_shell():
    wp = "wall_paint"
    G.plane_with_holes(sc, "floor_vinyl", "y", 0.0, (X0, X1), (Z0, Z1), [], flip=True)
    G.plane_with_holes(sc, "ceiling_tile", "y", H, (X0, X1), (Z0, Z1), [], flip=False)
    G.plane_with_holes(sc, wp, "z", Z0, (X0, X1), (0, H), [], flip=False)
    G.plane_with_holes(sc, wp, "z", Z1, (X0, X1), (0, H), [], flip=True)
    G.plane_with_holes(sc, wp, "x", X0, (Z0, Z1), (0, H), [(DOOR_Z0, DOOR_Z1, 0, DOOR_H)], flip=True)
    holes = [(c - WIN_W / 2, c + WIN_W / 2, WIN_Y0, WIN_Y1) for c in WINDOW_ZC]
    G.plane_with_holes(sc, wp, "x", X1, (Z0, Z1), (0, H), holes, flip=False)
    # window reveals (0.2 m wall)
    for c in WINDOW_ZC:
        z0, z1 = c - WIN_W / 2, c + WIN_W / 2
        G.plane_with_holes(sc, wp, "y", WIN_Y0, (X1, X1 + 0.2), (z0, z1), [], flip=True)
        G.plane_with_holes(sc, wp, "y", WIN_Y1, (X1, X1 + 0.2), (z0, z1), [], flip=False)
        G.plane_with_holes(sc, wp, "z", z0, (X1, X1 + 0.2), (WIN_Y0, WIN_Y1), [], flip=False)
        G.plane_with_holes(sc, wp, "z", z1, (X1, X1 + 0.2), (WIN_Y0, WIN_Y1), [], flip=True)
    # dark backing plane behind the (frosted) door vision panel
    G.plane_with_holes(sc, wp, "x", X0 - 0.3, (DOOR_Z0 - 0.1, DOOR_Z1 + 0.1), (0, DOOR_H + 0.1), [], flip=True)

    # skirting (vinyl, dark grey)
    sk, t, hgt = "laminate_gray", 0.012, 0.1
    for x0, x1 in ((X0, X1),):
        B(sk, (x0, 0, Z0), (x1, hgt, Z0 + t), skip=("-y", "-z"), bevel=0.002)
    for x0, x1 in ((X0, -3.3), (-2.3, -1.9), (3.1, X1)):
        B(sk, (x0, 0, Z1 - t), (x1, hgt, Z1), skip=("-y", "+z"), bevel=0.002)
    for z0, z1 in ((Z0 + t, -1.6), (-0.1, DOOR_Z0 - 0.05), (DOOR_Z1 + 0.05, Z1 - t)):
        B(sk, (X0, 0, z0), (X0 + t, hgt, z1), skip=("-y", "-x"), bevel=0.002)
    B(sk, (X1 - t, 0, Z0 + t), (X1, hgt, Z1 - t), skip=("-y", "+x"), bevel=0.002)

    collider("wall_front", (X0 - 0.2, 0, Z0 - 0.2), (X1 + 0.2, H, Z0))
    collider("wall_back", (X0 - 0.2, 0, Z1), (X1 + 0.2, H, Z1 + 0.2))
    collider("wall_left", (X0 - 0.2, 0, Z0 - 0.2), (X0, H, Z1 + 0.2))
    collider("wall_right", (X1, 0, Z0 - 0.2), (X1 + 0.2, H, Z1 + 0.2))


# ============================================================ ceiling
def build_ceiling():
    y = H - 0.003
    mw = "metal_white"
    mains = [0.3 + 0.6 * k for k in range(-7, 7)]            # z lines
    crosses = [0.6 * k for k in range(-8, 9)]                  # x lines
    hw = 0.012
    with G.force_kind(sc, "detail"):
        for zl in mains:
            G.quad(sc, mw, (0, y, zl), (X1 - X0 - 0.04, 2 * hw), facing="-y", uv="box")
        bounds = [Z0 + 0.02] + [v for zl in mains for v in (zl - hw, zl + hw)] + [Z1 - 0.02]
        for xl in crosses:
            for i in range(0, len(bounds), 2):
                a, b = bounds[i], bounds[i + 1]
                if b - a > 0.01:
                    G.quad(sc, mw, (xl, y, (a + b) / 2), (2 * hw, b - a), facing="-y", uv="box")
        # perimeter wall angle
        G.quad(sc, mw, (0, y, Z0 + 0.01), (X1 - X0, 0.02), facing="-y", uv="box")
        G.quad(sc, mw, (0, y, Z1 - 0.01), (X1 - X0, 0.02), facing="-y", uv="box")
        G.quad(sc, mw, (X0 + 0.01, y, 0), (0.02, Z1 - Z0 - 0.04), facing="-y", uv="box")
        G.quad(sc, mw, (X1 - 0.01, y, 0), (0.02, Z1 - Z0 - 0.04), facing="-y", uv="box")

    # LED panels 3x3 aligned with the 0.6 grid
    k = 0
    for zc in (-2.4, 0.0, 2.4):
        for xc in (-2.7, 0.3, 3.3):
            k += 1
            name = f"ceiling_light_{k}"
            fw, fh = 0.015, 0.012
            half = 0.297
            with G.force_kind(sc, "detail"):
                for (cx, cz, sx, sz) in ((xc, zc - half + fw / 2, 2 * half, fw), (xc, zc + half - fw / 2, 2 * half, fw),
                                         (xc - half + fw / 2, zc, fw, 2 * half - 2 * fw),
                                         (xc + half - fw / 2, zc, fw, 2 * half - 2 * fw)):
                    G.box(sc, mw, (cx, H - fh / 2, cz), (sx, fh, sz), bevel=0.002, skip=("+y",))
            G.quad(sc, "led_panel", (xc, H - 0.0105, zc), (2 * half - 2 * fw, 2 * half - 2 * fw), facing="-y",
                   obj=name)
            sc.O(name).origin = (xc, H - 0.0105, zc)
            OBJECT_INFO[name] = {"origin": [xc, H - 0.0105, zc], "note": "emissive LED panel (4500K)"}
    # smoke detector
    G.lathe(sc, "pvc_white", (-1.5, H - 0.003, 1.2),
            [(0.0, -0.048), (0.03, -0.048), (0.05, -0.04), (0.058, -0.025), (0.06, -0.012), (0.062, 0.0)],
            segments=32, close_top=False)
    G.cylinder(sc, "red_paint", (-1.475, H - 0.051, 1.2), 0.003, 0.004, segments=8)


# ============================================================ windows + radiators (right wall)
def build_windows():
    pvc = "pvc_white"
    for idx, c in enumerate(WINDOW_ZC, start=1):
        z0, z1 = c - WIN_W / 2, c + WIN_W / 2
        fx0, fx1 = 5.06, 5.13
        f = 0.065
        ys, ye = 0.93, WIN_Y1
        # outer frame
        B(pvc, (fx0, ys, z0), (fx1, ye, z0 + f), bevel=0.003)
        B(pvc, (fx0, ys, z1 - f), (fx1, ye, z1), bevel=0.003)
        B(pvc, (fx0, ye - f, z0 + f), (fx1, ye, z1 - f), bevel=0.003)
        B(pvc, (fx0, ys, z0 + f), (fx1, ys + f, z1 - f), bevel=0.003)
        B(pvc, (fx0, ys + f, c - 0.035), (fx1, ye - f, c + 0.035), bevel=0.003)
        glass_name = f"glass_window_{idx}"
        for (a, b) in ((z0 + f, c - 0.035), (c + 0.035, z1 - f)):
            s = 0.055
            sx0, sx1 = 5.05, 5.12
            y0, y1 = ys + f, ye - f
            B(pvc, (sx0, y0, a), (sx1, y1, a + s), bevel=0.003)
            B(pvc, (sx0, y0, b - s), (sx1, y1, b), bevel=0.003)
            B(pvc, (sx0, y1 - s, a + s), (sx1, y1, b - s), bevel=0.003)
            B(pvc, (sx0, y0, a + s), (sx1, y0 + s, b - s), bevel=0.003)
            # glazing bead
            G.quad(sc, "glass_clear", (5.09, (y0 + y1) / 2, (a + b) / 2), (b - a - 2 * s, y1 - y0 - 2 * s),
                   facing="-x", obj=glass_name, uv="box")
        sc.O(glass_name).origin = (5.09, (ys + ye) / 2, c)
        # handles on the mullion side of each sash
        for side in (-1, 1):
            hz = c + side * 0.035 + side * 0.028
            B(pvc, (5.035, 1.56, hz - 0.017), (5.05, 1.64, hz + 0.017), bevel=0.003)
            B("steel_brushed", (5.005, 1.59, hz - 0.008), (5.035, 1.61, hz + 0.008), bevel=0.002)
            B("steel_brushed", (5.005, 1.48, hz - 0.008), (5.02, 1.61, hz + 0.008), bevel=0.003)
        # interior window board
        B(pvc, (4.76, 0.9, z0 - 0.05), (5.06, 0.93, z1 + 0.05), bevel=0.003, skip=("-y",))
        # roller blind cassette (blind rolled up) on the wall above the opening
        B(pvc, (4.9, WIN_Y1 + 0.02, z0 - 0.06), (X1, WIN_Y1 + 0.12, z1 + 0.06), bevel=0.006, segments=2, skip=("+x",))
        B("plastic_black", (4.93, WIN_Y1 + 0.013, z0 - 0.04), (4.94, WIN_Y1 + 0.02, z1 + 0.04), bevel=0.002)
        G.cylinder(sc, "pvc_white", (4.905, WIN_Y1 - 0.02, c + 0.7), 0.004, 0.06, segments=8)
        G.tube(sc, "plastic_black", [(4.905, WIN_Y1 + 0.02, c + 0.7), (4.905, WIN_Y1 - 0.4, c + 0.7)], 0.0015,
               segments=4, caps=False)
        build_radiator(c)
        collider(f"radiator_{idx}", (4.76, 0, c - 0.75), (5.0, 0.93, c + 0.75))


def build_radiator(c):
    mw = "metal_white"
    L, y0, y1 = 1.4, 0.15, 0.7
    z0, z1 = c - L / 2, c + L / 2
    xf, xb = 4.83, 4.93
    # ribbed front + back panels (single strip mesh each: shallow V grooves every 50 mm)
    pitch, depth = 0.05, 0.004
    for x_face, sign in ((xf, -1), (xb, 1)):
        pts = []
        n = int(round(L / pitch))
        for i in range(n):
            u = z0 + i * pitch
            pts += [(u, 0.0), (u + 0.018, 0.0), (u + 0.025, depth), (u + 0.032, 0.0)]
        pts.append((z1, 0.0))

        def frame(u, w, t, x_face=x_face, sign=sign):
            return (x_face - sign * w, y0 + t, u)
        if sign > 0:
            pts = list(reversed(pts))
        G.strip_profile(sc, mw, pts, y1 - y0, frame=frame)
    # top grille slats + dark inside
    B("plastic_black", (xf + 0.004, y1 - 0.03, z0 + 0.01), (xb - 0.004, y1 - 0.02, z1 - 0.01), bevel=0.0,
      skip=("-y",))
    n = 46
    with G.force_kind(sc, "detail"):
        for i in range(n):
            zz = z0 + 0.02 + (L - 0.04) * (i + 0.5) / n
            B(mw, (xf + 0.004, y1 - 0.008, zz - 0.006), (xb - 0.004, y1, zz + 0.006), bevel=0.001, skip=("-y",))
    # side covers + bottom
    for zz in (z0, z1):
        B(mw, (xf - 0.002, y0 + 0.01, zz - (0.012 if zz == z0 else 0)), (xb + 0.002, y1, zz + (0.012 if zz == z1 else 0)),
          bevel=0.002)
    B(mw, (xf, y0, z0), (xb, y0 + 0.01, z1), bevel=0.0, skip=("+y",))
    # valve + pipes
    vz = z0 - 0.04
    G.cylinder(sc, "chrome", (4.9, y0 + 0.02, vz), 0.013, 0.05, segments=16)
    G.cylinder(sc, "pvc_white", (4.9, y0 + 0.08, vz), 0.024, 0.07, segments=24)
    G.tube(sc, "metal_white", [(4.9, 0.0, vz), (4.9, y0 - 0.005, vz)], 0.009, segments=12)
    G.tube(sc, "metal_white", [(4.9, y0 + 0.02, vz), (4.9, y0 + 0.02, z0 + 0.005)], 0.009, segments=12)
    G.tube(sc, "metal_white", [(4.9, 0.0, z1 + 0.04), (4.9, y0 + 0.03, z1 + 0.04), (4.9, y0 + 0.03, z1 - 0.005)],
           0.009, segments=12)
    G.cylinder(sc, "chrome", (4.9, y0 + 0.03, z1 + 0.04), 0.012, 0.03, axis="z", segments=16)


# ============================================================ front wall
def build_front_wall():
    st = "steel_brushed"
    # whiteboard
    x0, x1, y0, y1 = -0.8, 1.6, 0.9, 2.1
    zb = Z0
    B("metal_white", (x0 + 0.005, y0 + 0.005, zb), (x1 - 0.005, y1 - 0.005, zb + 0.014), bevel=0.0, skip=("-z",))
    p, d = 0.022, 0.022
    B(st, (x0, y1 - p, zb), (x1, y1, zb + d), skip=("-z",))
    B(st, (x0, y0, zb), (x1, y0 + p, zb + d), skip=("-z",))
    B(st, (x0, y0 + p, zb), (x0 + p, y1 - p, zb + d), skip=("-z",))
    B(st, (x1 - p, y0 + p, zb), (x1, y1 - p, zb + d), skip=("-z",))
    for cx in (x0 + 0.012, x1 - 0.012):
        for cy in (y0 + 0.012, y1 - 0.012):
            B("plastic_black", (cx - 0.016, cy - 0.016, zb), (cx + 0.016, cy + 0.016, zb + d + 0.003), bevel=0.004,
              skip=("-z",))
    ws = (x1 - x0 - 2 * p + 0.004, y1 - y0 - 2 * p + 0.004)
    wc = ((x0 + x1) / 2, (y0 + y1) / 2, zb + 0.016)
    G.quad(sc, "whiteboard", wc, ws, facing="+z", obj="whiteboard_surface")
    sc.O("whiteboard_surface").origin = wc
    anchor("whiteboard_surface", wc, ws)
    # marker tray
    B(st, (-0.6, 0.855, zb), (1.4, 0.87, zb + 0.075), skip=("-z",))
    B(st, (-0.6, 0.87, zb + 0.066), (1.4, 0.885, zb + 0.075), bevel=0.002)
    B(st, (-0.6, 0.87, zb), (1.4, 0.9, zb + 0.004), bevel=0.001, skip=("-z",))
    for mx, cap in ((0.95, "plastic_black"), (1.1, "red_paint")):
        G.cylinder(sc, "pvc_white", (mx, 0.879, zb + 0.035), 0.009, 0.1, axis="x", segments=16)
        G.cylinder(sc, cap, (mx + 0.065, 0.879, zb + 0.035), 0.0095, 0.03, axis="x", segments=16)
    B("rubber_black", (0.05, 0.87, zb + 0.015), (0.2, 0.89, zb + 0.06), bevel=0.003)
    B("metal_white", (0.05, 0.89, zb + 0.015), (0.2, 0.9, zb + 0.06), bevel=0.002)

    # periodic table poster in a snap frame
    pc = (3.3, 1.75)
    pw, ph = 1.4, 0.9
    fw, fd = 0.02, 0.012
    B(st, (pc[0] - pw / 2, pc[1] + ph / 2 - fw, zb), (pc[0] + pw / 2, pc[1] + ph / 2, zb + fd), skip=("-z",))
    B(st, (pc[0] - pw / 2, pc[1] - ph / 2, zb), (pc[0] + pw / 2, pc[1] - ph / 2 + fw, zb + fd), skip=("-z",))
    B(st, (pc[0] - pw / 2, pc[1] - ph / 2 + fw, zb), (pc[0] - pw / 2 + fw, pc[1] + ph / 2 - fw, zb + fd), skip=("-z",))
    B(st, (pc[0] + pw / 2 - fw, pc[1] - ph / 2 + fw, zb), (pc[0] + pw / 2, pc[1] + ph / 2 - fw, zb + fd), skip=("-z",))
    B("metal_white", (pc[0] - pw / 2 + 0.01, pc[1] - ph / 2 + 0.01, zb), (pc[0] + pw / 2 - 0.01, pc[1] + ph / 2 - 0.01, zb + 0.004),
      bevel=0.0, skip=("-z",))
    psz = (pw - 2 * fw + 0.004, ph - 2 * fw + 0.004)
    ppos = (pc[0], pc[1], zb + 0.0055)
    G.quad(sc, "paper_poster", ppos, psz, facing="+z", obj="poster_periodic_table")
    sc.O("poster_periodic_table").origin = ppos
    anchor("poster_periodic_table", ppos, psz)

    # wall clock
    cc = (-2.2, 2.5)
    G.lathe(sc, "plastic_black", (cc[0], cc[1], zb),
            [(0.148, 0.004), (0.158, 0.0), (0.166, 0.012), (0.168, 0.028), (0.163, 0.042), (0.152, 0.046),
             (0.146, 0.04), (0.146, 0.03)],
            segments=64, rot=(90, 0, 0), close_top=False, close_bottom=False)
    fpos = (cc[0], cc[1], zb + 0.03)
    G.disc(sc, "clock_face", fpos, 0.147, facing="+z", segments=64, obj="clock_face")
    sc.O("clock_face").origin = fpos
    anchor("clock_face", fpos, (0.294, 0.294))

    build_teacher_desk()
    build_office_chair(-3.2, -3.55)
    # low wall sockets (front wall behind the desk, right end)
    for sx in (-2.35, 4.4):
        socket_double(sx, 0.3, Z0, 1)
    B("pvc_white", (-2.12, 0.26, Z0), (-2.04, 0.34, Z0 + 0.012), bevel=0.003)
    B("plastic_black", (-2.1, 0.29, Z0 + 0.012), (-2.06, 0.31, Z0 + 0.014), bevel=0.0)


def _bar(center, n, length, post, obj, vertical=False):
    cx, cy, cz = center
    r = 0.0065
    if abs(n.z) > 0.5:
        s = n.z
        if vertical:
            G.cylinder(sc, "steel_brushed", (cx, cy, cz + s * post), r, length, axis="y", segments=16, obj=obj)
            for dy in (-length / 2 + 0.02, length / 2 - 0.02):
                G.cylinder(sc, "steel_brushed", (cx, cy + dy, cz + s * post / 2), 0.0045, post, axis="z", segments=12, obj=obj)
        else:
            G.cylinder(sc, "steel_brushed", (cx, cy, cz + s * post), r, length, axis="x", segments=16, obj=obj)
            for dx in (-length / 2 + 0.02, length / 2 - 0.02):
                G.cylinder(sc, "steel_brushed", (cx + dx, cy, cz + s * post / 2), 0.0045, post, axis="z", segments=12, obj=obj)
    else:
        s = n.x
        if vertical:
            G.cylinder(sc, "steel_brushed", (cx + s * post, cy, cz), r, length, axis="y", segments=16, obj=obj)
            for dy in (-length / 2 + 0.02, length / 2 - 0.02):
                G.cylinder(sc, "steel_brushed", (cx + s * post / 2, cy + dy, cz), 0.0045, post, axis="x", segments=12, obj=obj)
        else:
            G.cylinder(sc, "steel_brushed", (cx + s * post, cy, cz), r, length, axis="z", segments=16, obj=obj)
            for dz in (-length / 2 + 0.02, length / 2 - 0.02):
                G.cylinder(sc, "steel_brushed", (cx + s * post / 2, cy, cz + dz), 0.0045, post, axis="x", segments=12, obj=obj)


def handle_h(center, normal):
    _bar(center, G.AXES[normal], 0.16, 0.03, None, vertical=False)


def handle_v(center, normal, length=0.16):
    _bar(center, G.AXES[normal], length, 0.03, None, vertical=True)


def build_teacher_desk():
    lam, wood = "laminate_white", "wood_ash"
    x0, x1, z0, z1, h = -3.9, -2.5, -3.2, -2.5, 0.76
    B(wood, (x0, h - 0.025, z0), (x1, h, z1), bevel=0.003)
    # drawer pedestal at the -x end (teacher's right when facing +z)
    px0, px1 = -3.88, -3.44
    B(lam, (px0, 0.03, z0 + 0.02), (px1, h - 0.025, z1 - 0.02), skip=("+y",))
    B("laminate_gray", (px0 + 0.02, 0.0, z0 + 0.06), (px1 - 0.02, 0.03, z1 - 0.06), bevel=0.0, skip=("-y", "+y", "-z", "+z"))
    fronts = [(0.55, 0.732), (0.33, 0.547), (0.035, 0.327)]
    for (a, b) in fronts:
        B(lam, (px0 + 0.002, a, z0 + 0.002), (px1 - 0.002, b, z0 + 0.02), bevel=0.002)
        handle_h(((px0 + px1) / 2, b - 0.045, z0 + 0.002), "-z")
    # end panel at +x, modesty panel toward the class
    B(lam, (x1 - 0.04, 0.0, z0 + 0.02), (x1 - 0.02, h - 0.025, z1 - 0.02), skip=("+y",))
    B(lam, (px1, 0.25, z1 - 0.04), (x1 - 0.04, h - 0.025, z1 - 0.02), skip=("+y",))
    # desk items: paper stack + pen cup + closed notebook
    B("pvc_white", (-3.1, h, -2.95), (-2.89, h + 0.018, -2.65), bevel=0.001)
    G.cylinder(sc, "plastic_black", (-2.7, h + 0.05, -3.05), 0.035, 0.1, segments=24, caps=(True, False))
    for i, (px, pz) in enumerate(((-2.705, -3.06), (-2.69, -3.04), (-2.71, -3.035))):
        G.cylinder(sc, ("red_paint", "pvc_white", "plastic_black")[i], (px, h + 0.105, pz), 0.004, 0.13,
                   segments=8, rot=(8 - 6 * i, 0, 6 * i - 5))
    B("green_plastic", (-3.6, h, -2.9), (-3.33, h + 0.012, -2.7), bevel=0.002, rot=(0, 12, 0))
    collider("teacher_desk", (x0, 0, z0), (x1, h, z1))


def build_office_chair(cx, cz):
    pb = "plastic_black"
    # 5-star base
    for i in range(5):
        a = 90 + 72 * i
        G.box(sc, pb, (cx + 0.15 * math.cos(math.radians(a)), 0.075, cz + 0.15 * math.sin(math.radians(a))),
              (0.3, 0.03, 0.045), bevel=0.008, rot=(0, -a, 0))
        ex, ez = cx + 0.29 * math.cos(math.radians(a)), cz + 0.29 * math.sin(math.radians(a))
        G.cylinder(sc, pb, (ex, 0.045, ez), 0.008, 0.04, segments=12)
        G.cylinder(sc, pb, (ex, 0.025, ez), 0.025, 0.035, axis="x", segments=16, rot=(0, -a, 0))
    G.cylinder(sc, pb, (cx, 0.08, cz), 0.04, 0.05, segments=24)
    G.cylinder(sc, "chrome", (cx, 0.26, cz), 0.014, 0.3, segments=16)
    G.cylinder(sc, pb, (cx, 0.2, cz), 0.028, 0.2, segments=24)
    G.box(sc, pb, (cx, 0.405, cz), (0.18, 0.03, 0.22), bevel=0.006)
    # seat shell + cushion
    G.box(sc, pb, (cx, 0.44, cz + 0.01), (0.46, 0.03, 0.44), bevel=0.012)
    G.box(sc, "fabric_dark", (cx, 0.485, cz + 0.02), (0.48, 0.07, 0.47), bevel=0.025, segments=3)
    # backrest (behind the seat, toward -z), leaning back
    G.box(sc, pb, (cx, 0.62, cz - 0.215), (0.06, 0.32, 0.02), bevel=0.006, rot=(-12, 0, 0), pivot=(cx, 0.45, cz - 0.215))
    G.box(sc, "fabric_dark", (cx, 0.83, cz - 0.255), (0.45, 0.46, 0.07), bevel=0.025, segments=3,
          rot=(-10, 0, 0), pivot=(cx, 0.6, cz - 0.23))
    G.box(sc, pb, (cx, 0.83, cz - 0.295), (0.42, 0.42, 0.02), bevel=0.01, rot=(-10, 0, 0), pivot=(cx, 0.6, cz - 0.23))
    # armrests
    for s in (-1, 1):
        ax = cx + s * 0.26
        G.box(sc, pb, (ax, 0.53, cz + 0.0), (0.03, 0.16, 0.05), bevel=0.008)
        G.box(sc, pb, (ax, 0.62, cz + 0.02), (0.07, 0.025, 0.25), bevel=0.01, segments=2)
        G.box(sc, pb, (cx + s * 0.2, 0.45, cz + 0.0), (0.12, 0.02, 0.05), bevel=0.005)
    collider("teacher_chair", (cx - 0.3, 0, cz - 0.32), (cx + 0.3, 1.1, cz + 0.3))


# ============================================================ benches
def socket_double(x, y, zface, s):
    # Double Schuko socket on a vertical face at z=zface, outward normal sign s (+1/-1).
    pvc = "pvc_white"
    B(pvc, (x - 0.08, y - 0.042, zface), (x + 0.08, y + 0.042, zface + s * 0.012), bevel=0.004)
    for dx in (-0.038, 0.038):
        zc = zface + s * 0.012
        G.cylinder(sc, pvc, (x + dx, y, zc + s * 0.002), 0.026, 0.004, axis="z", segments=24)
        G.cylinder(sc, "laminate_gray", (x + dx, y, zc + s * 0.0045), 0.019, 0.002, axis="z", segments=24)
        for hx in (-0.0095, 0.0095):
            G.cylinder(sc, "plastic_black", (x + dx + hx, y, zc + s * 0.0058), 0.0028, 0.001, axis="z", segments=8)
        for hy in (-0.017, 0.017):
            B("chrome", (x + dx - 0.004, y + hy - 0.001, zc + s * 0.0045), (x + dx + 0.004, y + hy + 0.001, zc + s * 0.0065),
              bevel=0.0)


def lab_tap(x, y, zface, s, lever_mat):
    # Laboratory gas/water cock with hose nozzle on a vertical face (normal sign s along z).
    ch = "chrome"
    B(ch, (x - 0.025, y - 0.025, zface), (x + 0.025, y + 0.025, zface + s * 0.006), bevel=0.003)
    G.cylinder(sc, ch, (x, y, zface + s * 0.03), 0.011, 0.05, axis="z", segments=16)
    G.cylinder(sc, ch, (x, y + 0.012, zface + s * 0.04), 0.009, 0.03, segments=16)
    G.tube(sc, ch, [(x, y - 0.005, zface + s * 0.05), (x, y - 0.03, zface + s * 0.075), (x, y - 0.065, zface + s * 0.082)],
           0.0055, segments=12)
    for i in range(3):
        G.cylinder(sc, ch, (x, y - 0.045 - i * 0.008, zface + s * 0.08), 0.0068, 0.004, segments=12)
    G.box(sc, lever_mat, (x, y + 0.035, zface + s * 0.04), (0.012, 0.05, 0.01), bevel=0.003)


def build_bench(name, zc, computer=False):
    lam, ep = "laminate_white", "epoxy_black"
    x0, x1 = -1.5, 2.1
    top_y0, top_y1 = 0.865, 0.9
    zf0, zf1 = zc - 0.675, zc + 0.675
    B(ep, (x0, top_y0, zf0), (x1, top_y1, zf1), bevel=0.004)
    cx0, cx1 = x0 + 0.025, x1 - 0.025
    face_back = zc - 0.65     # -z row front plane (doors in front of it)
    face_front = zc + 0.65
    knee = [(cx0, cx0 + 0.75), (cx1 - 0.75, cx1)]
    # end panels (full depth, floor to top)
    B(lam, (cx0, 0.0, face_back - 0.02), (cx0 + 0.02, top_y0, face_front + 0.02), skip=("+y",))
    B(lam, (cx1 - 0.02, 0.0, face_back - 0.02), (cx1, top_y0, face_front + 0.02), skip=("+y",))
    # -z row carcass
    B(lam, (cx0 + 0.02, 0.1, face_back), (cx1 - 0.02, top_y0, zc - 0.01), bevel=0.0, skip=("+y", "+z"))
    # +z row carcass between kneeholes; kneeholes get a back panel
    kx0, kx1 = knee[0][1], knee[1][0]
    B(lam, (kx0, 0.1, zc + 0.01), (kx1, top_y0, face_front), bevel=0.0, skip=("+y", "-z"))
    for (a, b) in knee:
        aa, bb = max(a, cx0 + 0.02), min(b, cx1 - 0.02)
        B(lam, (aa, 0.0, zc + 0.01), (bb, top_y0, zc + 0.15), bevel=0.0, skip=("+y", "-z"))
        B(lam, (aa, 0.8, zc + 0.15), (bb, top_y0, face_front - 0.02), bevel=0.002, skip=("+y",))  # front apron rail
    # fronts
    def module(xa, xb, face, s, kind):
        gap = 0.0015
        zin, zout = face, face + s * 0.018
        za, zb = min(zin, zout), max(zin, zout)
        nrm = "+z" if s > 0 else "-z"
        if kind == "drawers":
            rows = [(0.103, 0.387), (0.39, 0.62), (0.623, 0.8)]
            for (ya, yb) in rows:
                B(lam, (xa + gap, ya, za), (xb - gap, yb, zb), bevel=0.002)
                handle_h(((xa + xb) / 2, yb - 0.045, zout), nrm)
        else:
            B(lam, (xa + gap, 0.103, za), (xb - gap, 0.8, zb), bevel=0.002)
            hx = xb - 0.045 if kind == "door_r" else xa + 0.045
            handle_v((hx, 0.68, zout), nrm)
        # top rail above modules
        B(lam, (xa + gap, 0.803, za), (xb - gap, top_y0 - 0.003, zb), bevel=0.002)

    n = 6
    w = (cx1 - cx0 - 0.04) / n
    kinds = ["drawers", "door_r", "door_l", "door_r", "door_l", "drawers"]
    for i in range(n):
        xa = cx0 + 0.02 + i * w
        module(xa, xa + w, face_back, -1, kinds[i])
    w2 = (kx1 - kx0) / 4
    kinds2 = ["drawers", "door_l", "door_r", "drawers"]
    for i in range(4):
        xa = kx0 + i * w2
        module(xa, xa + w2, face_front, 1, kinds2[i])
    # kick plates
    B("laminate_gray", (cx0 + 0.02, 0.0, face_back + 0.03), (cx1 - 0.02, 0.1, face_back + 0.05), bevel=0.0, skip=("-y",))
    B("laminate_gray", (kx0, 0.0, face_front - 0.05), (kx1, 0.1, face_front - 0.03), bevel=0.0, skip=("-y",))

    # service spine with reagent shelf
    sx0, sx1 = -1.2, 1.8
    B("laminate_gray", (sx0, top_y1, zc - 0.1), (sx1, 1.25, zc + 0.1), bevel=0.003, skip=("-y",))
    B(ep, (sx0 - 0.05, 1.25, zc - 0.13), (sx1 + 0.05, 1.275, zc + 0.13), bevel=0.003)
    for s in (-1, 1):
        zface = zc + s * 0.1
        socket_double(-0.75, 1.08, zface, s)
        socket_double(0.95 if not (computer and s > 0) else 0.9, 1.08, zface, s)
        lab_tap(-0.2, 1.12, zface, s, "yellow_plastic")
        lab_tap(0.35, 1.12, zface, s, "green_plastic")

    # stools tucked into the kneeholes
    for sx in (-1.1, 1.7):
        build_stool(sx, zc + 0.375)
        collider(f"{name}_stool_{'a' if sx < 0 else 'b'}", (sx - 0.22, 0, zc + 0.375 - 0.22), (sx + 0.22, 0.63, zc + 0.375 + 0.22))

    if computer:
        build_computer(zc)
    collider(name, (x0, 0, zf0), (x1, 1.275, zf1))
    anchor(f"{name}_top", (0.3, top_y1, zc), (x1 - x0, zf1 - zf0), note="size = [x extent, z extent]")


def build_stool(x, z):
    ch = "chrome"
    G.lathe(sc, "plastic_black", (x, 0, z),
            [(0.0, 0.57), (0.15, 0.57), (0.172, 0.578), (0.18, 0.595), (0.177, 0.612), (0.165, 0.622), (0.12, 0.626),
             (0.0, 0.628)], segments=40)
    G.cylinder(sc, "laminate_gray", (x, 0.56, z), 0.1, 0.02, segments=24)
    for i in range(4):
        a = math.radians(45 + 90 * i)
        top = (x + 0.085 * math.cos(a), 0.555, z + 0.085 * math.sin(a))
        bot = (x + 0.21 * math.cos(a), 0.025, z + 0.21 * math.sin(a))
        G.tube(sc, ch, [top, bot], 0.011, segments=12)
        G.cylinder(sc, "rubber_black", (bot[0], 0.012, bot[2]), 0.014, 0.024, segments=12)
    ring = [(x + 0.156 * math.cos(math.radians(t)), 0.28, z + 0.156 * math.sin(math.radians(t))) for t in range(0, 361, 15)]
    G.tube(sc, ch, ring, 0.0075, segments=10, caps=False)


def build_computer(zc):
    pb = "plastic_black"
    mx, mz = 1.7, zc + 0.2
    G.box(sc, pb, (mx, 0.906, mz + 0.01), (0.24, 0.012, 0.16), bevel=0.005)
    G.box(sc, pb, (mx, 1.02, mz - 0.0275), (0.07, 0.22, 0.025), bevel=0.006, rot=(-4, 0, 0))
    panel_front = mz + 0.0025
    G.box(sc, pb, (mx, 1.19, panel_front - 0.0175), (0.555, 0.335, 0.035), bevel=0.004)
    G.box(sc, pb, (mx, 1.19, panel_front - 0.04), (0.3, 0.2, 0.02), bevel=0.01)
    spos = (mx, 1.1955, panel_front + 0.0008)
    ssize = (0.527, 0.297)
    G.quad(sc, "screen", spos, ssize, facing="+z", obj="monitor_screen")
    sc.O("monitor_screen").origin = spos
    anchor("monitor_screen", spos, ssize)
    # keyboard + mouse
    kc = (1.62, 0.9, zc + 0.43)
    G.box(sc, pb, (kc[0], kc[1] + 0.009, kc[2]), (0.44, 0.018, 0.14), bevel=0.004)
    G.quad(sc, "signs_atlas", (kc[0], kc[1] + 0.0185, kc[2]), (0.43, 0.13), facing="+y", uv_rect=atlas_uv("keyboard"))
    G.lathe(sc, pb, (1.97, 0.9, zc + 0.43),
            [(0.0, 0.0), (0.028, 0.0), (0.031, 0.008), (0.028, 0.02), (0.017, 0.029), (0.0, 0.032)],
            segments=24, scale=(1.0, 1.0, 1.75))
    G.tube(sc, pb, [(1.97, 0.905, zc + 0.37), (1.95, 0.902, zc + 0.3), (1.9, 0.902, zc + 0.24), (1.78, 0.902, zc + 0.2)],
           0.0025, segments=6)


# ============================================================ left wall: fume hood, door, hooks
def build_fume_hood():
    mw, ep, st = "metal_white", "epoxy_black", "steel_brushed"
    x0, x1, z0, z1 = -5.0, -4.15, -1.6, -0.1
    # base cabinet
    B("laminate_gray", (x0, 0.0, z0 + 0.04), (x1 - 0.08, 0.1, z1 - 0.04), bevel=0.0, skip=("-y", "-x", "+y"))
    B(mw, (x0, 0.1, z0 + 0.02), (x1 - 0.05, 0.88, z1 - 0.02), bevel=0.0, skip=("-x", "+y"))
    zm = (z0 + z1) / 2
    for (a, b, hz) in ((z0 + 0.022, zm - 0.0015, zm - 0.045), (zm + 0.0015, z1 - 0.022, zm + 0.045)):
        B(mw, (x1 - 0.05, 0.103, a), (x1 - 0.032, 0.877, b), bevel=0.002)
        handle_v((x1 - 0.032, 0.72, hz), "+x", length=0.2)
    G.quad(sc, "signs_atlas", (x1 - 0.0315, 0.62, zm - 0.25), (0.12, 0.12), facing="+x", uv_rect=atlas_uv("ghs_flammable"))
    # work surface
    B(ep, (x0, 0.88, z0), (x1, 0.92, z1), bevel=0.004, skip=("-x",))
    # side walls
    for (a, b) in ((z0, z0 + 0.12), (z1 - 0.12, z1)):
        B(mw, (x0, 0.92, a), (x1, 2.4, b), bevel=0.004, skip=("-x", "-y"))
    # interior cavity liner
    cz0, cz1 = z0 + 0.12, z1 - 0.12
    B(mw, (-4.93, 0.92, cz0), (-4.91, 2.0, cz1), bevel=0.0, skip=("-y",))
    for yy in (1.0, 1.55, 1.93):
        B("plastic_black", (-4.912, yy - 0.012, cz0 + 0.1), (-4.905, yy + 0.012, cz1 - 0.1), bevel=0.002)
    B(mw, (-4.93, 2.0, cz0), (x1 - 0.05, 2.03, cz1), bevel=0.0)
    # fascia + top
    B(mw, (x1 - 0.05, 2.03, z0 + 0.12), (x1, 2.4, z1 - 0.12), bevel=0.003)
    B(mw, (x0, 2.38, z0 + 0.12), (x1 - 0.05, 2.4, z1 - 0.12), bevel=0.0, skip=("-x",))
    G.quad(sc, "signs_atlas", (x1 + 0.0048, 2.24, -0.66), (0.13, 0.065), facing="+x", uv_rect=atlas_uv("display_airflow"))
    B("plastic_black", (x1, 2.2, -0.735), (x1 + 0.004, 2.28, -0.585), bevel=0.002)
    G.quad(sc, "signs_atlas", (x1 + 0.0008, 2.315, -0.38), (0.04, 0.04), facing="+x", uv_rect=atlas_uv("label_fan"))
    # fan switch (plate + rocker)
    sw = "fumehood_switch"
    B("pvc_white", (x1, 2.2, -0.42), (x1 + 0.012, 2.28, -0.34), bevel=0.004, obj=sw)
    B("plastic_black", (x1 + 0.012, 2.222, -0.395), (x1 + 0.022, 2.258, -0.365), bevel=0.003, obj=sw,
      rot=(0, 0, 0))
    sc.O(sw).origin = (x1 + 0.012, 2.24, -0.38)
    OBJECT_INFO[sw] = {"origin": [x1 + 0.012, 2.24, -0.38], "note": "plate + rocker, faces +x"}
    anchor("fumehood_switch", (x1 + 0.012, 2.24, -0.38), (0.08, 0.08))
    # airfoil sill
    B(st, (x1 - 0.06, 0.92, z0 + 0.12), (x1 + 0.01, 0.945, z1 - 0.12), bevel=0.008, segments=2)
    # sash (frame is a named object, glass separate)
    sy0, sy1 = 1.3, 2.12
    sxa, sxb = x1 - 0.045, x1 - 0.015
    so = "fumehood_sash"
    B(st, (sxa, sy0, cz0), (sxb, sy0 + 0.045, cz1), bevel=0.004, obj=so)
    B(st, (sxa, sy0 + 0.045, cz0), (sxb, sy1, cz0 + 0.025), bevel=0.003, obj=so)
    B(st, (sxa, sy0 + 0.045, cz1 - 0.025), (sxb, sy1, cz1), bevel=0.003, obj=so)
    G.cylinder(sc, st, (x1 + 0.012, sy0 + 0.02, zm), 0.011, 0.9, axis="z", segments=16, obj=so)
    for dz in (-0.4, 0.4):
        G.cylinder(sc, st, (x1 - 0.004, sy0 + 0.02, zm + dz), 0.006, 0.03, axis="x", segments=12, obj=so)
    G.quad(sc, "signs_atlas", (sxb + 0.0006, sy0 + 0.0225, zm + 0.52), (0.1, 0.028), facing="+x",
           uv_rect=atlas_uv("sash_label"), obj=so)
    sash_origin = ((sxa + sxb) / 2, sy0, zm)
    sc.O(so).origin = sash_origin
    G.quad(sc, "glass_clear", ((sxa + sxb) / 2, (sy0 + 0.045 + sy1) / 2, zm), (cz1 - cz0 - 0.05, sy1 - sy0 - 0.045),
           facing="+x", obj="glass_fumehood_sash", uv="box")
    sc.O("glass_fumehood_sash").origin = sash_origin
    OBJECT_INFO[so] = {"origin": list(sash_origin), "note": "vertical sliding sash, origin at its bottom edge "
                       "(baked at y=1.3). Move together with glass_fumehood_sash (same origin); sensible range y 0.92..1.9"}
    OBJECT_INFO["glass_fumehood_sash"] = {"origin": list(sash_origin), "note": "glass pane of fumehood_sash"}
    # interior light strip
    lo = "fumehood_light"
    B("lamp_diffuser", (-4.42, 1.99, cz0 + 0.12), (-4.3, 2.0, cz1 - 0.12), bevel=0.003, obj=lo)
    sc.O(lo).origin = (-4.36, 1.99, zm)
    OBJECT_INFO[lo] = {"origin": [-4.36, 1.99, zm], "note": "light strip inside the hood (baked OFF)"}
    # services inside hood
    socket_double(-4.55, 1.1, cz0, 1)
    lab_tap(-4.6, 1.15, cz1, -1, "yellow_plastic")
    # exhaust duct to the ceiling
    G.cylinder(sc, st, (-4.6, 2.8, zm), 0.125, 0.8, segments=32, caps=(False, False))
    G.cylinder(sc, st, (-4.6, 2.415, zm), 0.14, 0.03, segments=32, caps=(False, True))
    collider("fume_hood", (x0, 0, z0), (x1, 2.4, z1))
    anchor("fumehood_work_surface", (-4.54, 0.92, zm), (0.78, cz1 - cz0), note="size = [x extent, z extent]")


def build_door_zone():
    mw, st = "metal_white", "steel_brushed"
    # frame (architrave on the room side + reveal lining)
    xa = X0 + 0.015
    B(mw, (X0 - 0.2, 0.0, DOOR_Z0 - 0.05), (xa, DOOR_H + 0.05, DOOR_Z0), bevel=0.003, skip=("-y",))
    B(mw, (X0 - 0.2, 0.0, DOOR_Z1), (xa, DOOR_H + 0.05, DOOR_Z1 + 0.05), bevel=0.003, skip=("-y",))
    B(mw, (X0 - 0.2, DOOR_H, DOOR_Z0), (xa, DOOR_H + 0.05, DOOR_Z1), bevel=0.003)
    # stops
    B(mw, (-5.07, 0.0, DOOR_Z0), (-5.055, DOOR_H, DOOR_Z0 + 0.018), bevel=0.001, skip=("-y",))
    B(mw, (-5.07, 0.0, DOOR_Z1 - 0.018), (-5.055, DOOR_H, DOOR_Z1), bevel=0.001, skip=("-y",))
    B(mw, (-5.07, DOOR_H - 0.018, DOOR_Z0), (-5.055, DOOR_H, DOOR_Z1), bevel=0.001)
    # threshold plate closes the gap under the leaf
    B(st, (X0 - 0.3, 0.0, DOOR_Z0), (X0 + 0.02, 0.006, DOOR_Z1), bevel=0.002, skip=("-y",))
    # door leaf with vision panel hole
    d = "door"
    lx0, lx1 = -5.12, -5.075
    lz0, lz1 = DOOR_Z0 + 0.02, DOOR_Z1 - 0.02
    ly0, ly1 = 0.008, DOOR_H - 0.022
    vz0, vz1, vy0, vy1 = 2.72, 2.92, 1.2, 1.8
    wood = "wood_door"
    # one flush slab: no bevel where the four pieces meet
    B(wood, (lx0, ly0, lz0), (lx1, vy0, lz1), bevel=0.003, obj=d, nobevel=("+y",))
    B(wood, (lx0, vy1, lz0), (lx1, ly1, lz1), bevel=0.003, obj=d, nobevel=("-y",))
    B(wood, (lx0, vy0, lz0), (lx1, vy1, vz0), bevel=0.003, obj=d, skip=("-y", "+y"))
    B(wood, (lx0, vy0, vz1), (lx1, vy1, lz1), bevel=0.003, obj=d, skip=("-y", "+y"))
    for (a, b, c_, e) in ((vz0 - 0.02, vz0, vy0 - 0.02, vy1 + 0.02), (vz1, vz1 + 0.02, vy0 - 0.02, vy1 + 0.02)):
        B(st, (lx1, c_, a), (lx1 + 0.006, e, b), bevel=0.002, obj=d)
    for (c_, e) in ((vy0 - 0.02, vy0), (vy1, vy1 + 0.02)):
        B(st, (lx1, c_, vz0), (lx1 + 0.006, e, vz1), bevel=0.002, obj=d)
    B(st, (lx1, 0.02, lz0 + 0.03), (lx1 + 0.002, 0.26, lz1 - 0.03), bevel=0.001, obj=d)
    # lever handle on the latch side (z = DOOR_Z0 side), both faces
    hz, hy = lz0 + 0.07, 1.05
    for sgn, xf in ((1, lx1), (-1, lx0)):
        G.cylinder(sc, st, (xf + sgn * 0.005, hy, hz), 0.026, 0.01, axis="x", segments=24, obj=d)
        G.tube(sc, st, [(xf + sgn * 0.008, hy, hz), (xf + sgn * 0.055, hy, hz), (xf + sgn * 0.065, hy, hz + 0.02),
                        (xf + sgn * 0.065, hy, hz + 0.13)], 0.0095, segments=16, obj=d)
    G.cylinder(sc, st, (lx1 + 0.004, hy - 0.08, hz), 0.012, 0.008, axis="x", segments=16, obj=d)
    for hy2 in (0.25, 1.05, 1.85):
        G.cylinder(sc, st, (lx1 + 0.004, hy2, lz1 + 0.004), 0.008, 0.1, segments=12, obj=d)
    hinge = (lx1, 0.0, lz1 + 0.004)
    sc.O(d).origin = hinge
    OBJECT_INFO[d] = {"origin": list(hinge), "note": "origin on the hinge axis (rotate about +Y); opens outward (-x)"}
    OBJECT_INFO["glass_door"] = {"origin": list(hinge), "note": "frosted vision panel of door (same pivot)"}
    G.quad(sc, "glass_frosted", ((lx0 + lx1) / 2, (vy0 + vy1) / 2, (vz0 + vz1) / 2), (vz1 - vz0, vy1 - vy0),
           facing="+x", obj="glass_door", uv="box")
    sc.O("glass_door").origin = hinge
    collider("door", (X0 - 0.2, 0, DOOR_Z0), (X0, DOOR_H, DOOR_Z1))
    anchor("door", (X0, 1.05, (DOOR_Z0 + DOOR_Z1) / 2), (1.0, DOOR_H))

    # exit sign above the door
    ec = (-4.965, 2.33, (DOOR_Z0 + DOOR_Z1) / 2)
    B("pvc_white", (X0, 2.25, ec[2] - 0.19), (X0 + 0.06, 2.41, ec[2] + 0.19), bevel=0.004)
    epos = (X0 + 0.0608, 2.33, ec[2])
    esz = (0.35, 0.14)
    G.quad(sc, "exit_sign", epos, esz, facing="+x", obj="sign_exit")
    sc.O("sign_exit").origin = epos
    anchor("sign_exit", epos, esz)

    # switches next to the door (latch side)
    pvc = "pvc_white"
    B(pvc, (X0, 1.16, 2.18), (X0 + 0.01, 1.24, 2.26), bevel=0.003)
    B(pvc, (X0 + 0.01, 1.18, 2.2), (X0 + 0.016, 1.22, 2.24), bevel=0.002)
    vs = "ventilation_switch"
    B(pvc, (X0, 1.16, 2.05), (X0 + 0.01, 1.24, 2.13), bevel=0.003, obj=vs)
    B("plastic_black", (X0 + 0.01, 1.18, 2.07), (X0 + 0.017, 1.22, 2.11), bevel=0.002, obj=vs)
    sc.O(vs).origin = (X0 + 0.01, 1.2, 2.09)
    OBJECT_INFO[vs] = {"origin": [X0 + 0.01, 1.2, 2.09], "note": "plate + rocker, faces +x"}
    anchor("ventilation_switch", (X0 + 0.01, 1.2, 2.09), (0.08, 0.08))
    anchor("light_switch", (X0 + 0.01, 1.2, 2.22), (0.08, 0.08))
    G.quad(sc, "signs_atlas", (X0 + 0.0008, 1.28, 2.09), (0.04, 0.04), facing="+x", uv_rect=atlas_uv("label_fan"))
    G.quad(sc, "signs_atlas", (X0 + 0.0008, 1.62, 1.95), (0.2, 0.2), facing="+x", uv_rect=atlas_uv("sign_goggles"))

    build_coat_hooks()


def coat_mesh(zh, seed):
    # Lab coat hanging from a wall hook by its collar loop (hook tip ~ x -4.93, y 1.75).
    import random
    import bmesh as _bm
    rnd = random.Random(seed)
    hook_y = 1.745
    # (dy below hook, half width along z, front/back depth, fold amplitude)
    stations = [(0.0, 0.03, 0.03, 0.0), (0.03, 0.075, 0.05, 0.002), (0.08, 0.13, 0.07, 0.004),
                (0.15, 0.19, 0.09, 0.008), (0.22, 0.215, 0.105, 0.012), (0.35, 0.225, 0.11, 0.016),
                (0.5, 0.23, 0.108, 0.02), (0.65, 0.237, 0.1, 0.024), (0.8, 0.245, 0.092, 0.028),
                (0.93, 0.252, 0.085, 0.03), (1.0, 0.255, 0.08, 0.03)]
    ring_n = 36
    ph = [rnd.uniform(0, 6.28) for _ in range(3)]
    bm = _bm.new()
    rings = []
    for dy, wz, dx, amp in stations:
        xb = -4.992 + 0.035 * max(0.0, 1.0 - dy / 0.35) ** 1.5
        ring = []
        for i in range(ring_n):
            t = 2 * math.pi * i / ring_n
            ct, st_ = math.cos(t), math.sin(t)
            zz = wz * ct
            # rounded-rectangle-ish section: flat back against the wall, fuller front
            depth = dx * (0.5 + 0.5 * math.copysign(abs(st_) ** 0.7, st_))
            u = zz / max(wz, 1e-4)
            folds = amp * (math.sin(3.2 * math.pi * u + ph[0] + dy * 2.0) * 0.65 + math.sin(7.0 * math.pi * u + ph[1]) * 0.35)
            front = max(st_, 0.0)
            x = xb + depth + folds * front
            # front opening: right panel overlaps left by a few mm below the lapels
            if dy > 0.12 and 0.0 < u < 0.12 and st_ > 0:
                x += 0.006
            ring.append(bm.verts.new((x, hook_y - dy, zh + zz)))
        rings.append(ring)
    lm = bm.loops.layers.uv.new("lightmap")
    flag = bm.faces.layers.int.new("lm_preset")
    arc = []
    for ring in rings:
        acc_len = [0.0]
        for i in range(ring_n):
            acc_len.append(acc_len[-1] + (ring[(i + 1) % ring_n].co - ring[i].co).length)
        arc.append(acc_len)
    ys = [st[0] for st in stations]
    for k in range(len(rings) - 1):
        for i in range(ring_n):
            j = (i + 1) % ring_n
            f = bm.faces.new((rings[k][i], rings[k + 1][i], rings[k + 1][j], rings[k][j]))
            uvs = ((arc[k][i], -ys[k]), (arc[k + 1][i], -ys[k + 1]), (arc[k + 1][i + 1], -ys[k + 1]),
                   (arc[k][i + 1], -ys[k]))
            for loop, uv in zip(f.loops, uvs):
                loop[lm].uv = uv
            f[flag] = 1
    bm.faces.new(rings[0])  # winding above is outward by construction (front center normal = +x)
    bm.normal_update()
    G._emit_mixed_smooth(sc, bm, "fabric_white", None, True, angle=70.0)
    # sleeves hang from the shoulders, slightly forward
    for s_ in (-1, 1):
        path = [(-4.955, hook_y - 0.17, zh + s_ * 0.175), (-4.93, hook_y - 0.3, zh + s_ * 0.2),
                (-4.915, hook_y - 0.5, zh + s_ * 0.205), (-4.912, hook_y - 0.7, zh + s_ * 0.2),
                (-4.915, hook_y - 0.8, zh + s_ * 0.195)]
        G.tube(sc, "fabric_white", path, 0.052, segments=16, caps=True, lm_preset=True)
        G.tube(sc, "fabric_white", [(-4.915, hook_y - 0.79, zh + s_ * 0.195), (-4.915, hook_y - 0.83, zh + s_ * 0.195)],
               0.047, segments=16, caps=True, lm_preset=True)
    # collar + lapels
    G.tube(sc, "fabric_white", [(-4.975, hook_y - 0.045, zh - 0.085), (-4.945, hook_y - 0.012, zh - 0.035),
                                (-4.94, hook_y - 0.005, zh), (-4.945, hook_y - 0.012, zh + 0.035),
                                (-4.975, hook_y - 0.045, zh + 0.085)], 0.016, segments=10)
    for s_ in (-1, 1):
        G.box(sc, "fabric_white", (-4.9, hook_y - 0.2, zh + s_ * 0.05), (0.006, 0.2, 0.07), bevel=0.002,
              rot=(s_ * 18, 0, 0))
    # patch pockets
    for (pdy, pz, pw, phh) in ((0.62, -0.12, 0.15, 0.17), (0.62, 0.12, 0.15, 0.17), (0.32, 0.11, 0.1, 0.11)):
        G.box(sc, "fabric_white", (-4.992 + 0.108 + 0.004, hook_y - pdy, zh + pz), (0.006, phh, pw), bevel=0.002)


def build_coat_hooks():
    B("wood_ash", (X0, 1.69, 0.35), (X0 + 0.02, 1.78, 1.65), bevel=0.003, skip=("-x",))
    for zh in (0.55, 0.95, 1.35):
        G.cylinder(sc, "steel_brushed", (X0 + 0.024, 1.735, zh), 0.014, 0.008, axis="x", segments=16)
        G.tube(sc, "steel_brushed", [(X0 + 0.02, 1.735, zh), (X0 + 0.06, 1.735, zh), (X0 + 0.075, 1.75, zh),
                                     (X0 + 0.078, 1.775, zh)], 0.005, segments=10)
    coat_mesh(0.55, 1)
    coat_mesh(0.95, 2)
    collider("lab_coats", (X0, 0.7, 0.3), (X0 + 0.16, 1.8, 1.6))


# ============================================================ back wall
def build_back_wall():
    build_safety_corner()
    build_chem_cabinet()
    build_sink_counter()
    # ventilation grille
    mw = "metal_white"
    gx0, gx1, gy0, gy1 = 0.7, 1.3, 2.65, 2.95
    zf = Z1
    fw = 0.03
    B(mw, (gx0, gy1 - fw, zf - 0.015), (gx1, gy1, zf), skip=("+z",))
    B(mw, (gx0, gy0, zf - 0.015), (gx1, gy0 + fw, zf), skip=("+z",))
    B(mw, (gx0, gy0 + fw, zf - 0.015), (gx0 + fw, gy1 - fw, zf), skip=("+z",))
    B(mw, (gx1 - fw, gy0 + fw, zf - 0.015), (gx1, gy1 - fw, zf), skip=("+z",))
    G.quad(sc, "plastic_black", ((gx0 + gx1) / 2, (gy0 + gy1) / 2, zf - 0.001), (gx1 - gx0 - 0.04, gy1 - gy0 - 0.04),
           facing="-z", uv="box")
    n = 8
    for i in range(n):
        yy = gy0 + fw + (gy1 - gy0 - 2 * fw) * (i + 0.5) / n
        G.box(sc, mw, ((gx0 + gx1) / 2, yy, zf - 0.012), (gx1 - gx0 - 2 * fw, 0.03, 0.002), bevel=0.0005,
              rot=(-40, 0, 0))


def build_safety_corner():
    zw = Z1
    # extinguisher bracket (static) + extinguisher (named)
    ex, ez = -4.6, zw - 0.095
    B("steel_brushed", (ex - 0.03, 0.62, zw - 0.006), (ex + 0.03, 1.08, zw), bevel=0.002, skip=("+z",))
    B("steel_brushed", (ex - 0.045, 0.645, ez - 0.07), (ex + 0.045, 0.655, zw - 0.006), bevel=0.002)
    ring = [(ex + 0.084 * math.cos(math.radians(t)), 0.95, ez + 0.084 * math.sin(math.radians(t))) for t in range(0, 361, 15)]
    G.tube(sc, "steel_brushed", ring, 0.004, segments=8, caps=False)
    o = "extinguisher"
    by = 0.655
    G.lathe(sc, "red_paint", (ex, by, ez),
            [(0.0, 0.0), (0.072, 0.0), (0.08, 0.012), (0.081, 0.36), (0.074, 0.405), (0.05, 0.44), (0.026, 0.455),
             (0.024, 0.47)], segments=40, obj=o, close_top=True)
    G.cylinder(sc, "plastic_black", (ex, by + 0.495, ez), 0.025, 0.05, segments=24, obj=o)
    G.box(sc, "plastic_black", (ex, by + 0.53, ez - 0.03), (0.02, 0.018, 0.08), bevel=0.004, obj=o)
    G.cylinder(sc, "chrome", (ex + 0.04, by + 0.5, ez), 0.008, 0.04, axis="x", segments=12, obj=o)
    G.cylinder(sc, "chrome", (ex - 0.03, by + 0.49, ez), 0.012, 0.02, axis="x", segments=12, obj=o)
    G.cyl_label(sc, "signs_atlas", (ex, by, ez), 0.0815, 0.13, 0.3, 60, 120, atlas_uv("sign_extinguisher"), segments=6,
                obj=o)
    sc.O(o).origin = (ex, by, ez)
    OBJECT_INFO[o] = {"origin": [ex, by, ez], "note": "origin at the bottom centre; bracket is static"}
    anchor("extinguisher", (ex, by + 0.265, ez), (0.16, 0.53))
    G.quad(sc, "signs_atlas", (ex, 1.42, zw - 0.001), (0.2, 0.2), facing="-z", uv_rect=atlas_uv("sign_extinguisher"))

    # fire blanket case
    bx = -4.15
    B("red_paint", (bx - 0.13, 1.34, zw - 0.075), (bx + 0.13, 1.66, zw), bevel=0.006, skip=("+z",))
    G.quad(sc, "signs_atlas", (bx, 1.53, zw - 0.0758), (0.15, 0.15), facing="-z", uv_rect=atlas_uv("label_blanket"))
    for dx in (-0.07, 0.07):
        B("plastic_black", (bx + dx - 0.015, 1.27, zw - 0.05), (bx + dx + 0.015, 1.345, zw - 0.042), bevel=0.002)
    anchor("fire_blanket", (bx, 1.5, zw - 0.075), (0.26, 0.32))

    # first aid box + sign
    fx = -3.75
    B("pvc_white", (fx - 0.17, 1.46, zw - 0.13), (fx + 0.17, 1.74, zw), bevel=0.008, segments=2, skip=("+z",))
    G.quad(sc, "signs_atlas", (fx, 1.6, zw - 0.1315), (0.26, 0.22), facing="-z", uv_rect=atlas_uv("first_aid_front"))
    B("plastic_black", (fx - 0.08, 1.74, zw - 0.09), (fx + 0.08, 1.75, zw - 0.07), bevel=0.003)
    G.quad(sc, "signs_atlas", (fx, 1.94, zw - 0.001), (0.2, 0.2), facing="-z", uv_rect=atlas_uv("sign_first_aid"))
    anchor("first_aid_box", (fx, 1.6, zw - 0.13), (0.34, 0.28))

    # alarm bell (named gong on a static back box) + strobe (named)
    ax_, ay = -4.5, 2.4
    B("red_paint", (ax_ - 0.05, ay - 0.05, zw - 0.045), (ax_ + 0.05, ay + 0.05, zw), bevel=0.008, segments=2,
      skip=("+z",))
    ab = "alarm_bell"
    G.lathe(sc, "red_paint", (ax_, ay, zw - 0.05),
            [(0.078, 0.0), (0.077, 0.006), (0.073, 0.015), (0.063, 0.025), (0.047, 0.032), (0.026, 0.036),
             (0.0, 0.037)], segments=64, rot=(-90, 0, 0), obj=ab, close_bottom=True)
    G.cylinder(sc, "chrome", (ax_, ay - 0.068, zw - 0.06), 0.006, 0.024, axis="z", segments=12, obj=ab)
    G.box(sc, "red_paint", (ax_, ay - 0.062, zw - 0.047), (0.022, 0.03, 0.008), bevel=0.002, obj=ab)
    sc.O(ab).origin = (ax_, ay, zw - 0.05)
    OBJECT_INFO[ab] = {"origin": [ax_, ay, zw - 0.05], "note": "red gong faces -z; back box is static"}
    anchor("alarm_bell", (ax_, ay, zw - 0.087), (0.16, 0.16))
    lx, ly = -4.15, 2.42
    B("pvc_white", (lx - 0.05, ly - 0.05, zw - 0.03), (lx + 0.05, ly + 0.05, zw), bevel=0.004, skip=("+z",))
    al = "alarm_light"
    G.lathe(sc, "red_lens", (lx, ly, zw - 0.03),
            [(0.038, 0.0), (0.038, 0.04), (0.034, 0.058), (0.022, 0.068), (0.0, 0.07)], segments=32, rot=(-90, 0, 0),
            obj=al, close_bottom=True)
    sc.O(al).origin = (lx, ly, zw - 0.03)
    OBJECT_INFO[al] = {"origin": [lx, ly, zw - 0.03], "note": "red strobe lens (baked OFF)"}
    anchor("alarm_light", (lx, ly, zw - 0.065), (0.08, 0.08))


def bottle(x, y, z, r, h, kind, label_key=None):
    body = "amber_glass" if kind == "amber" else "pvc_white"
    prof = [(0.0, 0.0), (r * 0.92, 0.0), (r, 0.01), (r, h * 0.68), (r * 0.8, h * 0.78), (r * 0.42, h * 0.86),
            (r * 0.38, h * 0.9)]
    G.lathe(sc, body, (x, y, z), prof, segments=20)
    cap = "plastic_black" if kind == "amber" else ("red_paint" if label_key == "bottle_label_a" else "green_plastic")
    G.cylinder(sc, cap, (x, y + h * 0.95, z), r * 0.45, h * 0.1, segments=16)
    if label_key:
        G.cyl_label(sc, "signs_atlas", (x, y, z), r + 0.0008, h * 0.2, h * 0.55, 40, 140, atlas_uv(label_key), segments=6)


def build_chem_cabinet():
    mw = "metal_white"
    x0, x1, z0, z1 = -3.3, -2.3, 3.55, 4.0
    zb0 = z0 + 0.02
    B("laminate_gray", (x0 + 0.02, 0.0, zb0 + 0.03), (x1 - 0.02, 0.08, z1), bevel=0.0, skip=("-y", "+z", "+y"))
    B(mw, (x0, 0.0, zb0), (x0 + 0.02, 2.0, z1), bevel=0.002, skip=("-y", "+z"))
    B(mw, (x1 - 0.02, 0.0, zb0), (x1, 2.0, z1), bevel=0.002, skip=("-y", "+z"))
    B(mw, (x0 + 0.02, 1.98, zb0), (x1 - 0.02, 2.0, z1), bevel=0.002, skip=("+z",))
    B(mw, (x0 + 0.02, 0.08, zb0), (x1 - 0.02, 0.1, z1), bevel=0.0, skip=("+z",))
    B(mw, (x0 + 0.02, 0.1, z1 - 0.015), (x1 - 0.02, 1.98, z1), bevel=0.0, skip=("+z",))
    shelves = (0.5, 0.9, 1.3, 1.65)
    for sy in shelves:
        B(mw, (x0 + 0.02, sy - 0.02, zb0 + 0.03), (x1 - 0.02, sy, z1 - 0.015), bevel=0.002)
    # doors: frames + glass
    fz0, fz1 = z0, zb0
    xm = (x0 + x1) / 2
    for (a, b) in ((x0 + 0.002, xm - 0.002), (xm + 0.002, x1 - 0.002)):
        p = 0.045
        B(mw, (a, 0.1, fz0), (a + p, 1.975, fz1), bevel=0.003)
        B(mw, (b - p, 0.1, fz0), (b, 1.975, fz1), bevel=0.003)
        B(mw, (a + p, 0.1, fz0), (b - p, 0.1 + p, fz1), bevel=0.003)
        B(mw, (a + p, 1.975 - p, fz0), (b - p, 1.975, fz1), bevel=0.003)
        G.quad(sc, "glass_clear", ((a + b) / 2, (0.1 + 1.975) / 2, (fz0 + fz1) / 2), (b - a - 2 * p, 1.875 - 2 * p),
               facing="-z", obj="glass_chem_cabinet", uv="box")
    sc.O("glass_chem_cabinet").origin = (xm, 1.0, (fz0 + fz1) / 2)
    handle_v((xm - 0.03, 1.05, fz0), "-z", length=0.2)
    handle_v((xm + 0.03, 1.05, fz0), "-z", length=0.2)
    G.cylinder(sc, "chrome", (xm + 0.03, 0.9, fz0 - 0.004), 0.009, 0.008, axis="z", segments=16)
    # stickers on the glass
    G.quad(sc, "signs_atlas", (xm - 0.25, 1.72, fz0 + 0.0065), (0.13, 0.13), facing="-z", uv_rect=atlas_uv("ghs_flammable"))
    G.quad(sc, "signs_atlas", (xm + 0.25, 1.72, fz0 + 0.0065), (0.15, 0.15), facing="-z", uv_rect=atlas_uv("sign_warning"))
    # decorative reagent bottles
    rows = {
        0.1: [(-3.2, 0.06, 0.26, "amber", "bottle_label_a"), (-3.05, 0.06, 0.26, "amber", "bottle_label_b"),
              (-2.62, 0.055, 0.22, "white", "bottle_label_b"), (-2.45, 0.055, 0.22, "white", None)],
        0.5: [(-3.2, 0.035, 0.16, "amber", "bottle_label_a"), (-3.11, 0.035, 0.16, "amber", "bottle_label_b"),
              (-3.02, 0.03, 0.13, "amber", None), (-2.85, 0.042, 0.19, "white", "bottle_label_a"),
              (-2.72, 0.042, 0.19, "white", "bottle_label_b"), (-2.5, 0.035, 0.16, "amber", "bottle_label_a")],
        0.9: [(-3.18, 0.042, 0.19, "white", "bottle_label_b"), (-3.06, 0.042, 0.19, "white", None),
              (-2.9, 0.035, 0.16, "amber", "bottle_label_a"), (-2.8, 0.035, 0.16, "amber", "bottle_label_b"),
              (-2.7, 0.03, 0.13, "amber", "bottle_label_a"), (-2.46, 0.045, 0.2, "white", "bottle_label_a")],
        1.3: [(-3.18, 0.03, 0.13, "amber", "bottle_label_b"), (-3.09, 0.03, 0.13, "amber", "bottle_label_a"),
              (-2.95, 0.03, 0.13, "amber", None), (-2.6, 0.04, 0.17, "white", "bottle_label_b")],
    }
    for sy, items in rows.items():
        for (bx, r, h, kind, lab) in items:
            bottle(bx, sy, 3.8, r, h, kind, lab)
    collider("chem_cabinet", (x0, 0, z0), (x1, 2.0, z1))
    anchor("chem_cabinet", (xm, 1.0, z0), (1.0, 2.0))


def build_sink_counter():
    lam, ep = "laminate_white", "epoxy_black"
    x0, x1 = -1.9, 3.1
    zf, zw = 3.42, Z1
    B("laminate_gray", (x0, 0.0, zf + 0.05), (x1, 0.1, zw), bevel=0.0, skip=("-y", "+z", "+y"))
    B(lam, (x0, 0.1, zf), (x1, 0.87, zw), bevel=0.0, skip=("+z", "+y"))
    # fronts: 8 modules
    n = 8
    w = (x1 - x0) / n
    kinds = ["drawers", "door_l", "door_r", "door_l", "door_r", "door_l", "door_r", "drawers"]
    for i in range(n):
        xa, xb = x0 + i * w, x0 + (i + 1) * w
        gap = 0.0015
        za, zb = zf - 0.018, zf
        if kinds[i] == "drawers":
            for (ya, yb) in ((0.103, 0.387), (0.39, 0.62), (0.623, 0.867)):
                B(lam, (xa + gap, ya, za), (xb - gap, yb, zb), bevel=0.002)
                handle_h(((xa + xb) / 2, yb - 0.045, za), "-z")
        else:
            B(lam, (xa + gap, 0.103, za), (xb - gap, 0.867, zb), bevel=0.002)
            hx = xb - 0.045 if kinds[i] == "door_r" else xa + 0.045
            handle_v((hx, 0.74, za), "-z")
    B("laminate_gray", (x0, 0.0, zf + 0.03), (x1, 0.1, zf + 0.05), bevel=0.0, skip=("-y",))
    # epoxy top with sink cut-out
    sx0, sx1, sz0, sz1 = 0.35, 0.85, 3.5, 3.9
    ty0, ty1 = 0.87, 0.9
    tz0 = zf - 0.03
    B(ep, (x0, ty0, tz0), (sx0, ty1, zw), bevel=0.004, skip=("+z",))
    B(ep, (sx1, ty0, tz0), (x1, ty1, zw), bevel=0.004, skip=("+z",))
    B(ep, (sx0, ty0, tz0), (sx1, ty1, sz0), bevel=0.004, skip=("-x", "+x"))
    B(ep, (sx0, ty0, sz1), (sx1, ty1, zw), bevel=0.004, skip=("-x", "+x", "+z"))
    # bowl (inward facing)
    B(ep, (sx0, 0.62, sz0), (sx1, ty0, sz1), bevel=0.0, skip=("+y",), flip=True)
    G.cylinder(sc, "steel_brushed", (0.6, 0.6215, 3.7), 0.035, 0.003, segments=24)
    G.cylinder(sc, "plastic_black", (0.6, 0.6235, 3.7), 0.02, 0.002, segments=16)
    anchor("sink", (0.6, ty1, 3.7), (sx1 - sx0, sz1 - sz0), note="bowl 0.25 m deep; size = [x extent, z extent]",
           bottomY=0.62, faucetOutlet=[0.6, 1.2, 3.69])
    # gooseneck faucet
    ch = "chrome"
    fz = 3.93
    G.cylinder(sc, ch, (0.6, 0.915, fz), 0.028, 0.03, segments=24)
    path = [(0.6, 0.93, fz), (0.6, 1.24, fz)] + G.arc_points((0.6, 1.24, fz - 0.12), 0.12, 0, 180, 12, plane="zy")[1:] + \
        [(0.6, 1.2, fz - 0.24)]
    G.tube(sc, ch, path, 0.012, segments=16)
    G.cylinder(sc, ch, (0.6, 1.195, fz - 0.24), 0.014, 0.02, segments=16)
    for s in (-1, 1):
        G.cylinder(sc, ch, (0.6 + s * 0.09, 0.925, fz), 0.02, 0.05, segments=16)
        G.box(sc, ch, (0.6 + s * 0.14, 0.95, fz), (0.1, 0.012, 0.018), bevel=0.004, rot=(0, 0, s * 12))
    # backsplash tiles
    B("ceramic_white", (x0, ty1, zw - 0.008), (x1, 1.5, zw), bevel=0.002, skip=("+z", "-y"))
    # pegboard drying rack
    pvc = "pvc_white"
    B(pvc, (-1.5, 1.1, zw - 0.04), (-0.5, 1.7, zw - 0.028), bevel=0.003)
    for px in (-1.4, -1.2, -1.0, -0.8, -0.6):
        for py in (1.2, 1.38, 1.56):
            G.tube(sc, pvc, [(px, py, zw - 0.04), (px, py + 0.035, zw - 0.16)], 0.005, segments=8)
    B(pvc, (-1.52, 1.06, zw - 0.1), (-0.48, 1.1, zw - 0.008), bevel=0.003)
    # paper towel dispenser
    B(pvc, (1.36, 1.14, zw - 0.128), (1.64, 1.48, zw - 0.008), bevel=0.012, segments=2)
    B("plastic_black", (1.44, 1.3, zw - 0.131), (1.56, 1.36, zw - 0.127), bevel=0.001)
    B("plastic_black", (1.4, 1.135, zw - 0.1), (1.6, 1.145, zw - 0.03), bevel=0.001)
    B(pvc, (1.43, 1.1, zw - 0.075), (1.57, 1.14, zw - 0.074), bevel=0.0)
    # eyewash (deck mounted) + sign
    gx, gz = 2.8, 3.82
    G.cylinder(sc, "steel_brushed", (gx, 0.905, gz), 0.045, 0.01, segments=24)
    G.cylinder(sc, "green_plastic", (gx, 1.03, gz), 0.022, 0.24, segments=20)
    G.tube(sc, "green_plastic", [(gx, 1.13, gz), (gx, 1.16, gz - 0.03), (gx, 1.165, gz - 0.2)], 0.02, segments=16)
    G.tube(sc, "green_plastic", [(gx - 0.09, 1.165, gz - 0.2), (gx + 0.09, 1.165, gz - 0.2)], 0.016, segments=16)
    for s in (-1, 1):
        G.cylinder(sc, "green_plastic", (gx + s * 0.09, 1.19, gz - 0.2), 0.02, 0.05, segments=16)
        G.lathe(sc, "yellow_plastic", (gx + s * 0.09, 1.212, gz - 0.2),
                [(0.0, 0.0), (0.032, 0.0), (0.034, 0.012), (0.026, 0.02), (0.0, 0.022)], segments=24)
    G.box(sc, "yellow_plastic", (gx, 1.06, gz - 0.035), (0.09, 0.07, 0.006), bevel=0.003)
    G.quad(sc, "signs_atlas", (gx, 1.72, zw - 0.001), (0.22, 0.22), facing="-z", uv_rect=atlas_uv("sign_eyewash"))
    anchor("eyewash", (gx, 1.2, gz - 0.2), (0.25, 0.1))
    collider("sink_counter", (x0, 0, tz0), (x1, 0.9, zw))

    # step waste bin
    wx, wz = 3.5, 3.7
    G.cylinder(sc, "plastic_black", (wx, 0.015, wz), 0.158, 0.03, segments=40, caps=(False, True))
    G.lathe(sc, "steel_brushed", (wx, 0.03, wz), [(0.152, 0.0), (0.16, 0.39)], segments=40,
            close_top=False, close_bottom=False)
    G.lathe(sc, "steel_brushed", (wx, 0.42, wz),
            [(0.164, 0.0), (0.165, 0.012), (0.15, 0.03), (0.1, 0.045), (0.0, 0.05)], segments=40, close_bottom=True)
    G.box(sc, "plastic_black", (wx, 0.02, wz - 0.175), (0.12, 0.02, 0.07), bevel=0.006)
    G.box(sc, "plastic_black", (wx, 0.425, wz + 0.165), (0.08, 0.03, 0.03), bevel=0.006)
    collider("waste_bin", (wx - 0.17, 0, wz - 0.21), (wx + 0.17, 0.48, wz + 0.17))
    anchor("waste_bin", (wx, 0.48, wz), (0.33, 0.33))


# ============================================================ blender scene assembly
def assemble():
    for ob in list(bpy.data.objects):
        bpy.data.objects.remove(ob, do_unlink=True)
    mats = build_materials(TEX)
    col = bpy.context.scene.collection
    room = bpy.data.collections.new("room")
    col.children.link(room)
    stats = {}
    for name, acc in list(sc.static.items()):
        if not acc.faces:
            continue
        ob = G.to_blender(acc, mats, room)
        ob["lab_static"] = True
        stats[acc.name] = acc.tri_count()
    for name, acc in list(sc.detail.items()):
        if not acc.faces:
            continue
        ob = G.to_blender(acc, mats, room)
        ob["lab_detail"] = True
        stats[acc.name] = acc.tri_count()
    for name, acc in sc.objects.items():
        ob = G.to_blender(acc, mats, room)
        ob["lab_special"] = True
        if name.startswith("glass_"):
            ob["lab_glass"] = True
        stats[acc.name] = acc.tri_count()
    total = sum(stats.values())
    print("objects:", len(stats), "triangles (approx):", total)
    for k, v in sorted(stats.items(), key=lambda kv: -kv[1])[:20]:
        print("  ", k, v)
    return stats


def setup_world_and_lights():
    scene = bpy.context.scene
    world = bpy.data.worlds.new("lab_world")
    scene.world = world
    world.use_nodes = True
    nt = world.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputWorld")
    bg = nt.nodes.new("ShaderNodeBackground")
    env = nt.nodes.new("ShaderNodeTexEnvironment")
    mapping = nt.nodes.new("ShaderNodeMapping")
    texco = nt.nodes.new("ShaderNodeTexCoord")
    env.image = bpy.data.images.load(HDRI, check_existing=True)
    mapping.inputs["Rotation"].default_value = (0, 0, math.radians(HDRI_ROTATION_DEG))
    nt.links.new(texco.outputs["Generated"], mapping.inputs["Vector"])
    nt.links.new(mapping.outputs["Vector"], env.inputs["Vector"])
    nt.links.new(env.outputs["Color"], bg.inputs["Color"])
    bg.inputs["Strength"].default_value = HDRI_STRENGTH
    nt.links.new(bg.outputs["Background"], out.inputs["Surface"])
    world["hdri_rotation_deg"] = HDRI_ROTATION_DEG

    lights = bpy.data.collections.new("portals")
    scene.collection.children.link(lights)
    for i, c in enumerate(WINDOW_ZC, start=1):
        ld = bpy.data.lights.new(f"portal_{i}", "AREA")
        ld.shape = "RECTANGLE"
        ld.size = WIN_Y1 - WIN_Y0
        ld.size_y = WIN_W
        ld.cycles.is_portal = True
        ob = bpy.data.objects.new(f"portal_{i}", ld)
        ob.location = (X1 + 0.2, -c, (WIN_Y0 + WIN_Y1) / 2)
        ob.rotation_euler = (0, math.radians(90), 0)
        lights.objects.link(ob)


def add_cameras():
    cams = {
        "cam_spawn": ((-3.9, 1.65, 2.2), (0.3, 1.0, -1.15)),
        "cam_windows": ((-0.2, 1.65, 0.25), (5.0, 1.2, 1.2)),
        "cam_fumehood": ((1.6, 1.65, -3.3), (-5.0, 1.1, 1.0)),
        "cam_back": ((2.5, 1.65, -0.2), (-1.5, 1.2, 4.0)),
        "cam_front": ((-1.2, 1.65, 2.9), (0.5, 1.3, -4.0)),
        "cam_overview": ((4.6, 2.9, 3.7), (-2.0, 0.6, -2.0)),
    }
    col = bpy.data.collections.new("cameras")
    bpy.context.scene.collection.children.link(col)
    for name, (p, t) in cams.items():
        cd = bpy.data.cameras.new(name)
        cd.lens = 18
        cd.sensor_width = 36
        ob = bpy.data.objects.new(name, cd)
        bp = Vector((p[0], -p[2], p[1]))
        bt = Vector((t[0], -t[2], t[1]))
        ob.location = bp
        ob.rotation_euler = (bt - bp).to_track_quat("-Z", "Y").to_euler()
        col.objects.link(ob)
    bpy.context.scene.camera = bpy.data.objects["cam_spawn"]


def main():
    os.makedirs(BUILD, exist_ok=True)
    build_shell()
    build_ceiling()
    build_windows()
    build_front_wall()
    build_bench("bench_1", -1.15, computer=True)
    build_bench("bench_2", 1.35, computer=False)
    build_fume_hood()
    build_door_zone()
    build_back_wall()
    assemble()
    setup_world_and_lights()
    add_cameras()
    with open(os.path.join(BUILD, "colliders.json"), "w") as fh:
        json.dump({"boxes": COLLIDERS}, fh, indent=1)
    meta = {"spawn": {"position": [-3.9, 0, 2.2], "lookAt": [0.3, 1.0, -1.15]}, "anchors": ANCHORS,
            "objects": OBJECT_INFO, "hdriRotationDeg": HDRI_ROTATION_DEG}
    with open(os.path.join(BUILD, "room-meta.base.json"), "w") as fh:
        json.dump(meta, fh, indent=1)
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(BUILD, "room.blend"), compress=True)
    print("saved", os.path.join(BUILD, "room.blend"))


main()
