#!/usr/bin/env python3
"""Burn each project's logo into the dot grid the receipt prints it as.

The bear at the top of every sheet is a 40x38 dot matrix (src/assets/bearDots.js).
This does the same to a per-project mark so each item receipt opens with its own
logo instead: greyscale, crop to the ink bounding box, box-filter down to fit a
40x38 box, then threshold. Every grid is that same 40x38 whatever the source's
shape -- the mark is centred inside it -- so each logo prints at exactly the
size, and on exactly the dot pitch, the bear already does.

Sources are build-time art, not site assets: keep them in src/assets/logos/ and
point each project's `logo` field at one, repo-root-relative. Only the grid is
committed; the source never ships to the browser.

    pip install pillow
    python3 scripts/generate-dots.py                     # rewrite projectDots.js
    python3 scripts/generate-dots.py --preview <image>   # eyeball one first

Marks need to be simple, high-contrast line art, like the favicon is. A
screenshot or a photograph has nothing left at 40x38 -- --preview will show you
that before you commit it.
"""

import argparse
import re
import sys
import tempfile

from PIL import Image

from bear_grid import ROOT, bear_grid, lit_dots, rasterise

PROJECTS = ROOT / 'src/data/projects.js'
OUT = ROOT / 'src/assets/projectDots.js'


# The bear's grid, and so every logo's: read from bearDots.js, not restated.
WIDTH, HEIGHT, _ = bear_grid()

# Ink is anything darker than this out of 255. High enough that antialiased
# edges on a black-on-white mark still count as ink, which is what keeps thin
# strokes from dropping out entirely once they are a third of a cell wide.
THRESHOLD = 225

# SVG sources are rasterised this wide before the box filter runs, so the
# downsample still has plenty of pixels to average over.
SVG_RASTER_WIDTH = 1024


def load_grey(path):
    """The source as greyscale on white, whatever it arrived as."""
    if path.suffix.lower() == '.svg':
        with tempfile.NamedTemporaryFile(suffix='.png') as tmp:
            rasterise(path, tmp.name, SVG_RASTER_WIDTH)
            image = Image.open(tmp.name).copy()
    else:
        image = Image.open(path)

    # Flatten onto white first: a transparent PNG converted straight to L keeps
    # whatever colour sits under alpha 0, which is usually black and would make
    # the whole background read as ink.
    if image.mode in ('RGBA', 'LA', 'P'):
        image = image.convert('RGBA')
        white = Image.new('RGBA', image.size, (255, 255, 255, 255))
        image = Image.alpha_composite(white, image)
    return image.convert('L')


def to_rows(path):
    """One source image as HEIGHT hex rows, four dots per character."""
    grey = load_grey(path)

    box = grey.point(lambda v: 255 if v < THRESHOLD else 0).getbbox()
    if box is None:
        raise SystemExit(f'{path} has no ink darker than {THRESHOLD}/255')
    mark = grey.crop(box)

    # Fit inside the 40x38 box rather than filling it, so a wide mark and a tall
    # one both print at the bear's size instead of one of them overflowing.
    scale = min(WIDTH / mark.width, HEIGHT / mark.height)
    size = (max(1, round(mark.width * scale)), max(1, round(mark.height * scale)))
    mark = mark.resize(size, Image.BOX)

    sheet = Image.new('L', (WIDTH, HEIGHT), 255)
    sheet.paste(mark, ((WIDTH - size[0]) // 2, (HEIGHT - size[1]) // 2))

    pixels = sheet.load()
    rows = []
    for y in range(HEIGHT):
        bits = ''.join('1' if pixels[x, y] < THRESHOLD else '0' for x in range(WIDTH))
        rows.append(''.join(f'{int(bits[i:i + 4], 2):x}' for i in range(0, WIDTH, 4)))
    return rows


def preview(rows):
    """The grid as text, so a mark can be judged before it is committed.

    Decoded by lit_dots, the same function the favicon and the card print from,
    so what this draws cannot disagree with what they burn.
    """
    lit = set(lit_dots(WIDTH, rows))
    for y in range(len(rows)):
        print(''.join('#' if (x, y) in lit else '.' for x in range(WIDTH)))
    print(f'{len(lit)} lit dots', file=sys.stderr)


def read_logos():
    """Every top-level `slug` in projects.js, paired with its `logo` if it has one.

    Both fields are matched at the project objects' own indentation, which is
    what keeps a nested `poster` inside a content block from being mistaken for
    one of these.
    """
    source = PROJECTS.read_text()
    fields = re.findall(r"^    (slug|logo): '([^']*)',$", source, re.MULTILINE)

    logos = []
    slug = None
    for name, value in fields:
        if name == 'slug':
            slug = value
        elif slug is None:
            raise SystemExit(f'a logo ({value}) appears before any slug')
        else:
            logos.append((slug, value))
    return logos


def render(entries):
    """projectDots.js: the slug-keyed grids, in the order projects.js lists them."""
    body = ''.join(
        f"  '{slug}': [\n"
        + ''.join(f"    '{row}',\n" for row in rows)
        + '  ],\n'
        for slug, rows in entries
    )
    body = f'\n{body}' if body else ''
    return f'''// Dot-matrix renderings of each project's logo, the marks a thermal printer
// would actually burn at the top of that project's receipt.
//
// Generated by scripts/generate-dots.py from the `logo` paths in
// ../data/projects.js -- do not edit by hand, re-run the script. Each mark is
// centred in the same {WIDTH}x{HEIGHT} grid the bear uses, so every receipt's logo prints
// at the same size and on the same dot pitch. Rows are hex, four dots per
// character, most significant bit leftmost.
//
// A project with no `logo` is absent here and falls back to the bear. The grid
// size is the bear's own, so it is read from ./bearDots.js rather than restated.

export const PROJECT_ROWS = {{{body}}}
'''


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        '--preview',
        metavar='IMAGE',
        help='print one image as text instead of writing projectDots.js',
    )
    args = parser.parse_args()

    if args.preview:
        preview(to_rows(Path(args.preview)))
        return

    entries = []
    for slug, logo in read_logos():
        path = ROOT / logo
        if not path.exists():
            raise SystemExit(f"{slug}: logo '{logo}' does not exist")
        entries.append((slug, to_rows(path)))
        print(f'{slug} <- {logo}', file=sys.stderr)

    OUT.write_text(render(entries))
    print(f'wrote {OUT.relative_to(ROOT)} ({len(entries)} logos)', file=sys.stderr)


if __name__ == '__main__':
    main()
