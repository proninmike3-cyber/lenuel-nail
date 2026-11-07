#!/usr/bin/env python3
"""Vendor Lenuel Nail's Yandex Maps photos into GitHub Pages assets.

Runs only when every referenced photo is downloaded and validated;
never publishes a partially localized page.
"""
from __future__ import annotations
from io import BytesIO
from pathlib import Path
from urllib.request import Request, urlopen
import re
import sys
import time
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
HTML = ROOT / "index.html"
ASSETS = ROOT / "assets" / "photos"
SOURCE = "https://avatars.mds.yandex.net/get-altay/"
REFERER = "https://yandex.ru/maps/org/lenuel_nail/211893184711/"
PATTERN = re.compile(r'https://avatars\.mds\.yandex\.net/get-altay/[0-9]+/[a-zA-Z0-9]+/(?:XXL_height|L_height|S)')
HEADERS = {
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36",
    "Referer": REFERER,
    "Accept": "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
}

def get_photo(base: str) -> tuple[Image.Image, str]:
    last_error = ""
    for suffix in ("XXL_height", "L_height", "S"):
        url = f"{base}/{suffix}"
        for attempt in range(2):
            try:
                req = Request(url, headers=HEADERS)
                with urlopen(req, timeout=25) as response:
                    data = response.read(12 * 1024 * 1024)
                    mime = response.headers.get("Content-Type", "")
                if len(data) < 1000:
                    raise ValueError(f"image too small: {len(data)} bytes")
                image = Image.open(BytesIO(data))
                image.load()
                if image.width < 120 or image.height < 120:
                    raise ValueError(f"invalid image dimensions: {image.size}")
                return ImageOps.exif_transpose(image).convert("RGB"), f"{suffix} {image.size} {mime}"
            except Exception as exc:
                last_error = f"{url}: {exc}"
                time.sleep(1)
    raise RuntimeError(last_error)

def main() -> int:
    html = HTML.read_text(encoding="utf-8")
    matches = list(dict.fromkeys(PATTERN.findall(html)))
    groups = list(dict.fromkeys(url.rsplit("/", 1)[0] for url in matches))
    if not groups:
        print("No remote Yandex photos remain. Everything is already local.")
        return 0
    if len(groups) != 7:
        raise RuntimeError(f"Expected seven unique studio photos, found {len(groups)}: {groups}")
    names = ["hero-nails.webp", "gallery-01.webp", "gallery-02.webp", "gallery-03.webp",
             "gallery-05.webp", "gallery-06.webp", "studio.webp"]
    staged: list[tuple[Path, bytes, str, str]] = []
    for group, name in zip(groups, names):
        image, source_quality = get_photo(group)
        image.thumbnail((1600, 1600), Image.Resampling.LANCZOS)
        buf = BytesIO()
        image.save(buf, format="WEBP", quality=88, method=6)
        content = buf.getvalue()
        if len(content) < 2500:
            raise RuntimeError(f"Output for {name} is suspiciously small")
        staged.append((ASSETS / name, content, group, source_quality))
        print(f"Downloaded {name}: {source_quality}, {len(content)} bytes")
    # Only write files and replace URLs AFTER all sources succeeded.
    ASSETS.mkdir(parents=True, exist_ok=True)
    for dest, content, group, source_quality in staged:
        dest.write_bytes(content)
        html = re.sub(re.escape(group) + r"/(?:XXL_height|L_height|S)", "assets/photos/" + dest.name, html)
    if PATTERN.search(html):
        raise RuntimeError("Still found Yandex image URLs, refusing partial result")
    HTML.write_text(html, encoding="utf-8")
    print(f"Success: {len(staged)} images in assets/photos; all original image src URLs localized.")
    return 0

if __name__ == "__main__":
    sys.exit(main())
