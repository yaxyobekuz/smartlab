"""
OldMapsOnline linkidagi pozitsiya uchun OSM tayllarini yuklab,
bitta katta harita rasmiga birlashtiradi.

Link: https://www.oldmapsonline.org/en#position=5.6698/41.34/68.69
  -> zoom=5.6698, lat=41.34, lon=68.69 (Buxoro / Markaziy Osiyo)

Ishlatish:
  python3 scripts/fetch_oldmaps_area.py
  python3 scripts/fetch_oldmaps_area.py --zoom 7 --lat 41.34 --lon 68.69 --span 4

Chiqish: harita_bukhara.png
"""

import argparse
import math
import io
import time

import requests
from PIL import Image

TILE_SIZE = 256
# OSM foydalanish shartlariga ko'ra User-Agent majburiy.
HEADERS = {"User-Agent": "smartlab-history-map/1.0 (educational lab)"}
TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png"


def deg2tile(lat_deg, lon_deg, zoom):
    """Lat/lon -> kasrli tayl koordinatasi."""
    lat_rad = math.radians(lat_deg)
    n = 2.0 ** zoom
    x = (lon_deg + 180.0) / 360.0 * n
    y = (1.0 - math.asinh(math.tan(lat_rad)) / math.pi) / 2.0 * n
    return x, y


def fetch_tile(z, x, y, retries=3):
    url = TILE_URL.format(z=z, x=x, y=y)
    for attempt in range(retries):
        try:
            r = requests.get(url, headers=HEADERS, timeout=15)
            r.raise_for_status()
            return Image.open(io.BytesIO(r.content)).convert("RGBA")
        except Exception as e:
            if attempt == retries - 1:
                print(f"  tayl {z}/{x}/{y} yuklanmadi: {e}")
                return Image.new("RGBA", (TILE_SIZE, TILE_SIZE), (230, 230, 230, 255))
            time.sleep(1)


def build_map(lat, lon, zoom, span, out):
    z = int(round(zoom))
    cx, cy = deg2tile(lat, lon, z)

    # Markaz atrofidan span x span taylli maydon.
    half = span // 2
    x0 = int(math.floor(cx)) - half
    y0 = int(math.floor(cy)) - half
    max_tile = 2 ** z

    canvas = Image.new("RGBA", (span * TILE_SIZE, span * TILE_SIZE))
    print(f"zoom={z}, markaz tayl=({cx:.1f},{cy:.1f}), {span}x{span} tayl yuklanmoqda...")

    for dy in range(span):
        for dx in range(span):
            tx = (x0 + dx) % max_tile
            ty = y0 + dy
            if ty < 0 or ty >= max_tile:
                continue
            tile = fetch_tile(z, tx, ty)
            canvas.paste(tile, (dx * TILE_SIZE, dy * TILE_SIZE))
            time.sleep(0.1)  # server yukini kamaytirish

    canvas.convert("RGB").save(out, "PNG")
    print(f"Saqlandi: {out}  ({canvas.width}x{canvas.height}px)")


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--lat", type=float, default=41.34)
    p.add_argument("--lon", type=float, default=68.69)
    p.add_argument("--zoom", type=float, default=5.6698)
    p.add_argument("--span", type=int, default=6, help="tomon bo'yicha tayllar soni")
    p.add_argument("--out", default="harita_bukhara.png")
    args = p.parse_args()
    build_map(args.lat, args.lon, args.zoom, args.span, args.out)
