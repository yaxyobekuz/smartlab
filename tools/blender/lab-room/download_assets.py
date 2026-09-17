#!/usr/bin/env python3
# Download the CC0 Poly Haven textures + HDRI used by the lab room into downloads/.
import hashlib
import json
import os
import sys
import time
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "downloads")

# id -> (resolution, maps). Map keys are Poly Haven file-API keys.
TEXTURES = {
    "grey_tiles": ("2k", ["Diffuse", "nor_gl", "Rough"]),
    "painted_plaster_wall": ("1k", ["Diffuse", "nor_gl", "Rough"]),
    "polystyrene": ("1k", ["Diffuse", "nor_gl", "Rough"]),
    "long_white_tiles": ("1k", ["Diffuse", "nor_gl", "Rough"]),
    "ash_veneer": ("1k", ["Diffuse", "nor_gl", "Rough"]),
    "poly_wool_herringbone": ("1k", ["Diffuse", "nor_gl", "Rough"]),
    "stretch_poplin": ("1k", ["Diffuse", "nor_gl", "Rough"]),
}
HDRIS = {
    "museumplein": ("4k", "hdr"),
}
API = "https://api.polyhaven.com"
UA = {"User-Agent": "smartlab-lab-room-build/1.0"}


def fetch_json(url):
    for attempt in range(4):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60) as r:
                return json.loads(r.read().decode("utf-8"))
        except Exception as e:  # noqa: BLE001
            print("  retry", url, e)
            time.sleep(2 + attempt * 3)
    raise RuntimeError("failed " + url)


def md5(path):
    h = hashlib.md5()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def download(url, dest, expected_md5=None):
    if os.path.exists(dest) and (expected_md5 is None or md5(dest) == expected_md5):
        print("  ok (cached)", os.path.basename(dest))
        return
    tmp = dest + ".part"
    for attempt in range(4):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=300) as r, open(tmp, "wb") as f:
                while True:
                    chunk = r.read(1 << 20)
                    if not chunk:
                        break
                    f.write(chunk)
            if expected_md5 and md5(tmp) != expected_md5:
                raise RuntimeError("md5 mismatch")
            os.replace(tmp, dest)
            print("  downloaded", os.path.basename(dest), os.path.getsize(dest))
            return
        except Exception as e:  # noqa: BLE001
            print("  retry", url, e)
            time.sleep(2 + attempt * 3)
    raise RuntimeError("failed " + url)


def main():
    os.makedirs(OUT, exist_ok=True)
    manifest = {"textures": {}, "hdris": {}}
    for asset_id, (res, maps) in TEXTURES.items():
        print(asset_id)
        files = fetch_json(f"{API}/files/{asset_id}")
        info = fetch_json(f"{API}/info/{asset_id}")
        entry = {"url": f"https://polyhaven.com/a/{asset_id}", "license": "CC0", "resolution": res,
                 "dimensions_mm": info.get("dimensions"), "authors": info.get("authors"), "maps": {}}
        for m in maps:
            f = files[m][res]["jpg"]
            dest = os.path.join(OUT, f"{asset_id}_{m.lower()}_{res}.jpg")
            download(f["url"], dest, f.get("md5"))
            entry["maps"][m] = {"file": os.path.basename(dest), "url": f["url"]}
        manifest["textures"][asset_id] = entry
    for asset_id, (res, fmt) in HDRIS.items():
        print(asset_id)
        files = fetch_json(f"{API}/files/{asset_id}")
        info = fetch_json(f"{API}/info/{asset_id}")
        f = files["hdri"][res][fmt]
        dest = os.path.join(OUT, f"{asset_id}_{res}.{fmt}")
        download(f["url"], dest, f.get("md5"))
        manifest["hdris"][asset_id] = {"url": f"https://polyhaven.com/a/{asset_id}", "license": "CC0",
                                        "file": os.path.basename(dest), "download": f["url"],
                                        "authors": info.get("authors")}
    with open(os.path.join(OUT, "manifest.json"), "w") as fh:
        json.dump(manifest, fh, indent=2)
    print("done ->", OUT)


if __name__ == "__main__":
    sys.exit(main())
