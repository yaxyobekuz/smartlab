# Prepare textures for the lab room (run inside Blender: needs numpy + image IO).
import math
import os
import sys

import bpy
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from labroom.materials import ATLAS_PX, ATLAS_SIZE  # noqa: E402

DL = os.path.join(HERE, "downloads")
OUT = os.path.join(HERE, "build", "textures")
RNG = np.random.default_rng(20260917)


# ---------------------------------------------------------------- io + color helpers
def load(path):
    img = bpy.data.images.load(path)
    w, h = img.size
    a = np.empty(w * h * 4, np.float32)
    img.pixels.foreach_get(a)
    bpy.data.images.remove(img)
    return a.reshape(h, w, 4)  # bottom-up rows


def save(arr, name, non_color=False):
    # arr: (h, w, 3|4) float 0..1, bottom-up rows. Saved 8-bit PNG without color conversion.
    h, w = arr.shape[:2]
    if arr.ndim == 2:
        arr = np.repeat(arr[:, :, None], 3, axis=2)
    if h != w:
        side = 1 << int(round(math.log2(max(h, w))))
        arr = resize(arr, side, side)[..., :3]
        h, w = side, side
    if arr.shape[2] == 3:
        arr = np.concatenate([arr, np.ones((h, w, 1), np.float32)], axis=2)
    img = bpy.data.images.new(name, w, h, alpha=False, float_buffer=False)
    img.colorspace_settings.name = "Non-Color"
    img.pixels.foreach_set(np.clip(arr, 0, 1).astype(np.float32).ravel())
    path = os.path.join(OUT, name)
    img.filepath_raw = path
    img.file_format = "PNG"
    img.save()
    bpy.data.images.remove(img)
    print("  wrote", name, w, h)


def s2l(c):
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)


def l2s(c):
    c = np.clip(c, 0, 1)
    return np.where(c <= 0.0031308, c * 12.92, 1.055 * np.power(c, 1 / 2.4) - 0.055)


def lum(lin):
    return lin[..., 0] * 0.2126 + lin[..., 1] * 0.7152 + lin[..., 2] * 0.0722


def fft_blur(a, sx, sy=None):
    # Seamless (wrap-around) gaussian blur of a 2D array; sigmas in pixels (x=columns, y=rows).
    sy = sx if sy is None else sy
    h, w = a.shape
    fy = np.fft.fftfreq(h)[:, None]
    fx = np.fft.fftfreq(w)[None, :]
    g = np.exp(-2 * (math.pi ** 2) * ((sx * fx) ** 2 + (sy * fy) ** 2))
    return np.real(np.fft.ifft2(np.fft.fft2(a) * g)).astype(np.float32)


def resize(arr, w, h):
    img = bpy.data.images.new("tmp_resize", arr.shape[1], arr.shape[0], alpha=True, float_buffer=True)
    rgba = arr if arr.shape[2] == 4 else np.concatenate([arr, np.ones(arr.shape[:2] + (1,), np.float32)], 2)
    img.pixels.foreach_set(rgba.astype(np.float32).ravel())
    img.scale(w, h)
    out = np.empty(w * h * 4, np.float32)
    img.pixels.foreach_get(out)
    bpy.data.images.remove(img)
    return out.reshape(h, w, 4)


def adjust_albedo(src, target, saturation=1.0, tint=(1, 1, 1), variation=1.0, flatten_sigma=0.0,
                  flatten=0.0):
    # Re-grade an sRGB albedo: mean linear luminance -> target, scaled detail, tint, saturation.
    lin = s2l(src[..., :3])
    L = np.maximum(lum(lin), 1e-4)
    chroma = lin / L[..., None]
    chroma = 1 + (chroma - 1) * saturation
    if flatten_sigma > 0 and flatten > 0:
        low = fft_blur(L, flatten_sigma)
        L = L / np.maximum(low, 1e-4) * (low.mean() + (low - low.mean()) * (1 - flatten))
    m = L.mean()
    Ln = target * (1 + (L / m - 1) * variation)
    out = np.clip(Ln[..., None] * chroma * np.array(tint, np.float32), 0, 1)
    return l2s(out).astype(np.float32)


def adjust_scalar(src, target, variation=1.0, lo=0.02, hi=1.0):
    g = src[..., 0]
    m = g.mean()
    return np.clip(target + (g - m) * variation, lo, hi).astype(np.float32)


def normal_from_height(hgt, strength):
    dx = (np.roll(hgt, -1, axis=1) - np.roll(hgt, 1, axis=1)) * 0.5 * strength
    dy = (np.roll(hgt, -1, axis=0) - np.roll(hgt, 1, axis=0)) * 0.5 * strength
    n = np.stack([-dx, -dy, np.ones_like(hgt)], axis=-1)
    n /= np.linalg.norm(n, axis=-1, keepdims=True)
    return (n * 0.5 + 0.5).astype(np.float32)


def noise(h, w, sx, sy=None):
    a = fft_blur(RNG.standard_normal((h, w)).astype(np.float32), sx, sy)
    return (a - a.mean()) / (a.std() + 1e-8)


# ---------------------------------------------------------------- photo textures
def photo_textures():
    def P(n):
        return os.path.join(DL, n)

    print("floor")
    a = load(P("grey_tiles_diffuse_2k.jpg"))
    save(adjust_albedo(a, 0.40, saturation=0.12, tint=(1.0, 1.0, 1.01), variation=0.55,
                       flatten_sigma=60, flatten=0.6), "floor_albedo.png")
    save(load(P("grey_tiles_nor_gl_2k.jpg"))[..., :3], "floor_normal.png", True)
    save(adjust_scalar(load(P("grey_tiles_rough_2k.jpg")), 0.46, 0.6), "floor_rough.png", True)

    print("wall")
    a = load(P("painted_plaster_wall_diffuse_1k.jpg"))
    save(adjust_albedo(a, 0.70, saturation=0.0, tint=(1.0, 0.975, 0.93), variation=0.35,
                       flatten_sigma=40, flatten=0.75), "wall_albedo.png")
    save(load(P("painted_plaster_wall_nor_gl_1k.jpg"))[..., :3], "wall_normal.png", True)
    save(adjust_scalar(load(P("painted_plaster_wall_rough_1k.jpg")), 0.82, 0.5), "wall_rough.png", True)

    print("ceiling")
    a = load(P("polystyrene_diffuse_1k.jpg"))
    alb = adjust_albedo(a, 0.74, saturation=0.0, tint=(1.0, 1.0, 0.99), variation=0.3, flatten_sigma=25, flatten=0.9)
    # tegular tile edges: texture repeats every 1.2 m (2 tiles); grid lines at u in {0, .5}, v in {.25, .75}
    n = alb.shape[0]
    coord = (np.arange(n) + 0.5) / n
    def edge_shade(c, lines):
        d = np.min([np.abs(((c - l + 0.5) % 1.0) - 0.5) for l in lines], axis=0) * 1.2  # meters to the grid line
        return 1.0 - 0.28 * np.exp(-((np.maximum(d - 0.012, 0.0) / 0.009) ** 2))
    shade = np.minimum(edge_shade(coord, (0.0, 0.5))[None, :], edge_shade(coord, (0.25, 0.75))[:, None])
    alb = l2s(s2l(alb) * shade[..., None]).astype(np.float32)
    save(alb, "ceiling_albedo.png")
    save(load(P("polystyrene_nor_gl_1k.jpg"))[..., :3], "ceiling_normal.png", True)
    save(adjust_scalar(load(P("polystyrene_rough_1k.jpg")), 0.9, 0.4), "ceiling_rough.png", True)

    print("ceramic tiles")
    a = load(P("long_white_tiles_diffuse_1k.jpg"))
    save(adjust_albedo(a, 0.72, saturation=0.15, tint=(1.0, 1.0, 1.0), variation=1.0), "tile_albedo.png")
    save(load(P("long_white_tiles_nor_gl_1k.jpg"))[..., :3], "tile_normal.png", True)
    save(adjust_scalar(load(P("long_white_tiles_rough_1k.jpg")), 0.2, 1.0), "tile_rough.png", True)

    print("wood")
    a = load(P("ash_veneer_diffuse_1k.jpg"))
    save(adjust_albedo(a, 0.36, saturation=0.9, variation=1.0), "wood_albedo.png")
    save(load(P("ash_veneer_nor_gl_1k.jpg"))[..., :3], "wood_normal.png", True)
    save(adjust_scalar(load(P("ash_veneer_rough_1k.jpg")), 0.45, 0.6), "wood_rough.png", True)

    print("fabric dark")
    a = load(P("poly_wool_herringbone_diffuse_1k.jpg"))
    save(adjust_albedo(a, 0.035, saturation=0.4, tint=(0.95, 0.98, 1.05), variation=1.0), "fabric_dark_albedo.png")
    save(load(P("poly_wool_herringbone_nor_gl_1k.jpg"))[..., :3], "fabric_dark_normal.png", True)
    save(adjust_scalar(load(P("poly_wool_herringbone_rough_1k.jpg")), 0.85, 0.5), "fabric_dark_rough.png", True)

    print("fabric white")
    a = load(P("stretch_poplin_diffuse_1k.jpg"))
    save(adjust_albedo(a, 0.74, saturation=0.0, tint=(1.0, 1.0, 1.0), variation=1.5), "fabric_white_albedo.png")
    save(load(P("stretch_poplin_nor_gl_1k.jpg"))[..., :3], "fabric_white_normal.png", True)
    save(adjust_scalar(load(P("stretch_poplin_rough_1k.jpg")), 0.8, 0.5), "fabric_white_rough.png", True)


# ---------------------------------------------------------------- procedural maps
def procedural_textures():
    print("steel (brushed)")
    n = 512
    streak = noise(n, n, 90.0, 0.6) * 0.7 + noise(n, n, 12.0, 0.5) * 0.3
    save(np.clip(0.30 + 0.045 * streak, 0, 1), "steel_rough.png", True)
    save(normal_from_height(streak * 0.02, 1.0), "steel_normal.png", True)

    print("epoxy")
    n = 1024
    r = 0.34 + 0.035 * noise(n, n, 48) + 0.015 * noise(n, n, 1.2)
    save(np.clip(r, 0, 1), "epoxy_rough.png", True)

    print("laminate")
    n = 512
    r = 0.40 + 0.02 * noise(n, n, 30) + 0.02 * noise(n, n, 1.0)
    save(np.clip(r, 0, 1), "laminate_rough.png", True)


# ---------------------------------------------------------------- signs atlas (drawn top-down)
class Canvas:
    def __init__(self, size):
        self.s = size
        self.img = np.ones((size, size, 3), np.float32)
        yy, xx = np.mgrid[0:size, 0:size].astype(np.float32)
        self.x = xx + 0.5
        self.y = yy + 0.5

    def region(self, key):
        x0, y0, x1, y1 = ATLAS_PX[key]
        return Region(self, x0, y0, x1, y1)


class Region:
    # Drawing inside a pixel box using normalized coords (0..1, y down).

    def __init__(self, c, x0, y0, x1, y1):
        self.c, self.x0, self.y0, self.w, self.h = c, x0, y0, x1 - x0, y1 - y0
        self.X = (c.x[y0:y1, x0:x1] - x0) / self.w
        self.Y = (c.y[y0:y1, x0:x1] - y0) / self.h
        self.px = 1.0 / self.w

    def paint(self, sdf, color):
        # sdf in normalized units (negative inside); antialiased over ~1px.
        cov = np.clip(0.5 - sdf / self.px, 0, 1)[..., None]
        sub = self.c.img[self.y0:self.y0 + self.h, self.x0:self.x0 + self.w]
        sub[:] = sub * (1 - cov) + np.array(color, np.float32) * cov

    def fill(self, color):
        self.paint(np.full(self.X.shape, -1.0, np.float32), color)

    # SDFs (aspect-corrected: y scaled by h/w so shapes are not stretched)
    def _xy(self):
        k = self.h / self.w
        return self.X, self.Y * k, k

    def rect(self, cx, cy, hw, hh, r=0.0):
        X, Y, k = self._xy()
        dx = np.abs(X - cx) - (hw - r)
        dy = np.abs(Y - cy * k) - (hh * k - r)
        return np.hypot(np.maximum(dx, 0), np.maximum(dy, 0)) + np.minimum(np.maximum(dx, dy), 0) - r

    def circle(self, cx, cy, r):
        X, Y, k = self._xy()
        return np.hypot(X - cx, Y - cy * k) - r

    def ellipse(self, cx, cy, rx, ry):
        X, Y, k = self._xy()
        return (np.hypot((X - cx) / rx, (Y - cy * k) / (ry * k)) - 1) * min(rx, ry * k)

    def polygon(self, pts):
        X, Y, k = self._xy()
        P = [(px, py * k) for px, py in pts]
        d = np.full(X.shape, 1e9, np.float32)
        inside = np.zeros(X.shape, bool)
        for i in range(len(P)):
            ax, ay = P[i]
            bx, by = P[(i + 1) % len(P)]
            ex, ey = bx - ax, by - ay
            wx, wy = X - ax, Y - ay
            t = np.clip((wx * ex + wy * ey) / (ex * ex + ey * ey), 0, 1)
            d = np.minimum(d, np.hypot(wx - ex * t, wy - ey * t))
            cond = ((ay > Y) != (by > Y)) & (X < (bx - ax) * (Y - ay) / (by - ay + 1e-12) + ax)
            inside ^= cond
        return np.where(inside, -d, d)

    def ring(self, sdf, width):
        return np.abs(sdf) - width / 2


def union(*s):
    return np.minimum.reduce(s)


def subtract(a, b):
    return np.maximum(a, -b)


RED = (0.78, 0.06, 0.10)
GREEN = (0.0, 0.53, 0.28)
BLUE = (0.0, 0.33, 0.62)
YELLOW = (0.98, 0.78, 0.02)
WHITE = (0.97, 0.97, 0.96)
BLACK = (0.05, 0.05, 0.05)


def flame(r, cx, cy, s):
    # Three-tongue flame; (cx, cy) ~ centre of the base bulb, s = scale.
    base = r.ellipse(cx, cy + 0.08 * s, 0.1 * s, 0.09 * s)
    t1 = r.polygon([(cx - 0.1 * s, cy + 0.07 * s), (cx - 0.02 * s, cy - 0.24 * s), (cx + 0.06 * s, cy - 0.02 * s),
                    (cx + 0.1 * s, cy + 0.07 * s)])
    t2 = r.polygon([(cx - 0.1 * s, cy + 0.08 * s), (cx - 0.11 * s, cy - 0.1 * s), (cx - 0.02 * s, cy + 0.02 * s)])
    t3 = r.polygon([(cx + 0.02 * s, cy + 0.04 * s), (cx + 0.1 * s, cy - 0.13 * s), (cx + 0.1 * s, cy + 0.08 * s)])
    hole = r.ellipse(cx + 0.005 * s, cy + 0.08 * s, 0.035 * s, 0.05 * s)
    return subtract(union(base, t1, t2, t3), hole)


def draw_atlas():
    c = Canvas(ATLAS_SIZE)
    c.img[:] = 0.9

    r = c.region("sign_extinguisher")
    r.fill(RED)
    r.paint(r.ring(r.rect(0.5, 0.5, 0.43, 0.43, 0.03), 0.02), WHITE)
    body = union(r.rect(0.42, 0.6, 0.11, 0.26, 0.05), r.rect(0.42, 0.3, 0.04, 0.06),
                 r.rect(0.52, 0.27, 0.1, 0.025), r.rect(0.34, 0.29, 0.04, 0.02))
    r.paint(body, WHITE)
    r.paint(flame(r, 0.72, 0.62, 1.3), WHITE)

    r = c.region("sign_first_aid")
    r.fill(GREEN)
    r.paint(r.ring(r.rect(0.5, 0.5, 0.43, 0.43, 0.03), 0.02), WHITE)
    r.paint(union(r.rect(0.5, 0.5, 0.26, 0.09), r.rect(0.5, 0.5, 0.09, 0.26)), WHITE)

    r = c.region("sign_eyewash")
    r.fill(GREEN)
    r.paint(r.ring(r.rect(0.5, 0.5, 0.43, 0.43, 0.03), 0.02), WHITE)
    r.paint(r.ellipse(0.5, 0.62, 0.26, 0.13), WHITE)
    r.paint(r.circle(0.5, 0.62, 0.075), GREEN)
    r.paint(r.circle(0.5, 0.62, 0.035), WHITE)
    for dx in (-0.14, 0.0, 0.14):
        r.paint(union(r.circle(0.5 + dx, 0.36, 0.035),
                      r.polygon([(0.5 + dx - 0.034, 0.35), (0.5 + dx, 0.26), (0.5 + dx + 0.034, 0.35)])), WHITE)
    r.paint(r.rect(0.5, 0.2, 0.2, 0.025, 0.02), WHITE)

    r = c.region("sign_warning")
    r.fill(WHITE)
    tri = r.polygon([(0.5, 0.1), (0.93, 0.86), (0.07, 0.86)])
    r.paint(tri - 0.0, BLACK)
    r.paint(r.polygon([(0.5, 0.22), (0.83, 0.8), (0.17, 0.8)]), YELLOW)
    r.paint(union(r.rect(0.5, 0.5, 0.035, 0.14, 0.03), r.circle(0.5, 0.72, 0.042)), BLACK)

    for key, sym in (("ghs_flammable", "flame"), ("ghs_exclamation", "excl")):
        r = c.region(key)
        r.fill(WHITE)
        dia = r.polygon([(0.5, 0.05), (0.95, 0.5), (0.5, 0.95), (0.05, 0.5)])
        r.paint(dia, RED)
        r.paint(r.polygon([(0.5, 0.14), (0.86, 0.5), (0.5, 0.86), (0.14, 0.5)]), WHITE)
        if sym == "flame":
            r.paint(flame(r, 0.5, 0.52, 1.6), BLACK)
            r.paint(r.rect(0.5, 0.7, 0.14, 0.02), BLACK)
        else:
            r.paint(union(r.rect(0.5, 0.44, 0.035, 0.15, 0.03), r.circle(0.5, 0.68, 0.045)), BLACK)

    r = c.region("sign_goggles")
    r.fill(WHITE)
    r.paint(r.circle(0.5, 0.5, 0.45), BLUE)
    g = union(r.rect(0.35, 0.52, 0.13, 0.09, 0.07), r.rect(0.65, 0.52, 0.13, 0.09, 0.07),
              r.rect(0.5, 0.47, 0.3, 0.025))
    r.paint(g, WHITE)
    r.paint(union(r.rect(0.35, 0.53, 0.08, 0.045, 0.04), r.rect(0.65, 0.53, 0.08, 0.045, 0.04)), BLUE)

    r = c.region("label_fan")
    r.fill(WHITE)
    r.paint(r.ring(r.circle(0.5, 0.5, 0.36), 0.035), BLACK)
    X, Y, k = r._xy()
    ang = np.arctan2(Y - 0.5 * k, X - 0.5)
    rad = np.hypot(X - 0.5, Y - 0.5 * k)
    petal = np.cos(3 * ang) * 0.12 + 0.12
    r.paint((rad - petal) * 0.8, BLACK)
    r.paint(r.circle(0.5, 0.5, 0.05), WHITE)

    r = c.region("display_airflow")
    r.fill((0.02, 0.025, 0.02))
    seg_on = (0.2, 1.0, 0.35)
    seg_off = (0.04, 0.08, 0.05)

    def seven(cx, digit):
        segs = {"a": (cx, 0.22, 0.07, 0.022), "g": (cx, 0.5, 0.07, 0.022), "d": (cx, 0.78, 0.07, 0.022),
                "f": (cx - 0.075, 0.36, 0.018, 0.12), "b": (cx + 0.075, 0.36, 0.018, 0.12),
                "e": (cx - 0.075, 0.64, 0.018, 0.12), "c": (cx + 0.075, 0.64, 0.018, 0.12)}
        on = {"0": "abcdef", "5": "afgcd", "4": "fgbc"}[digit]
        for s, (x, y, hw, hh) in segs.items():
            r.paint(r.rect(x, y, hw, hh, 0.01), seg_on if s in on else seg_off)

    seven(0.22, "0")
    r.paint(r.circle(0.33, 0.78, 0.02), seg_on)
    seven(0.45, "5")
    for i in range(5):
        r.paint(r.rect(0.66 + i * 0.06, 0.62 - i * 0.07, 0.02, 0.05 + i * 0.07), seg_on if i < 3 else seg_off)

    r = c.region("keyboard")
    r.fill((0.035, 0.035, 0.04))
    rows = [(0.16, 14, 0), (0.33, 14, 0.02), (0.5, 13, 0.035), (0.67, 12, 0.05)]
    for ry, count, off in rows:
        kw = 0.62 / 14
        for i in range(count):
            r.paint(r.rect(0.04 + off + kw * (i + 0.5), ry, kw * 0.42, 0.065, 0.006), (0.09, 0.09, 0.095))
    r.paint(r.rect(0.3, 0.84, 0.13, 0.065, 0.006), (0.09, 0.09, 0.095))
    for i in range(4):
        for j in range(3):
            r.paint(r.rect(0.74 + i * 0.05, 0.25 + j * 0.2, 0.021, 0.065, 0.006), (0.09, 0.09, 0.095))

    r = c.region("label_blanket")
    r.fill(WHITE)
    r.paint(r.ring(r.rect(0.5, 0.5, 0.42, 0.42, 0.03), 0.04), RED)
    r.paint(r.rect(0.44, 0.58, 0.2, 0.2, 0.02), RED)
    r.paint(flame(r, 0.66, 0.38, 1.2), RED)

    r = c.region("first_aid_front")
    r.fill(WHITE)
    r.paint(r.rect(0.5, 0.5, 0.3, 0.3, 0.04), GREEN)
    r.paint(union(r.rect(0.5, 0.5, 0.2, 0.065), r.rect(0.5, 0.5, 0.065, 0.2)), WHITE)

    for key, stripe in (("bottle_label_a", RED), ("bottle_label_b", BLUE)):
        r = c.region(key)
        r.fill((0.93, 0.92, 0.88))
        r.paint(r.rect(0.5, 0.12, 0.5, 0.07), stripe)
        for i, wdt in enumerate((0.3, 0.22, 0.26)):
            r.paint(r.rect(0.12 + wdt, 0.36 + i * 0.13, wdt, 0.022), (0.2, 0.2, 0.2))
        r.paint(r.polygon([(0.8, 0.45), (0.9, 0.62), (0.8, 0.79), (0.7, 0.62)]), RED)
        r.paint(r.polygon([(0.8, 0.5), (0.87, 0.62), (0.8, 0.74), (0.73, 0.62)]), WHITE)

    for key, col in (("label_gas", YELLOW), ("label_water", GREEN)):
        r = c.region(key)
        r.fill(col)

    r = c.region("sash_label")
    r.fill(YELLOW)
    for i in range(6):
        r.paint(r.polygon([(0.05 + i * 0.17, 1.0), (0.13 + i * 0.17, 0.0), (0.2 + i * 0.17, 0.0),
                           (0.12 + i * 0.17, 1.0)]), BLACK)
    return c.img


def main():
    os.makedirs(OUT, exist_ok=True)
    photo_textures()
    procedural_textures()
    print("signs atlas")
    img = draw_atlas()
    save(np.flipud(img).copy(), "signs_atlas.png")


main()
