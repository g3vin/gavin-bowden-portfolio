"""The bear's dot grid, read from src/assets/bearDots.js for the scripts that
burn it into something else, plus the paper it is printed on and the one way
they all rasterise an SVG. Read here once so they cannot disagree."""

import re
import shutil
import subprocess
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BEAR = ROOT / 'src/assets/bearDots.js'
INDEX_CSS = ROOT / 'src/index.css'

INK = '#000'


def paper_colour():
    """The receipt's paper, from the one place the site declares it.

    The first --receipt-paper in index.css is the light-mode one; the second is
    inside the dark-scheme block, and art that ships as a file has no scheme.
    """
    source = INDEX_CSS.read_text()
    return re.search(r'--receipt-paper:\s*(#[0-9a-f]{3,8})', source, re.I).group(1)


def rasterise(svg, out, width, height=None):
    """An SVG -- a Path to one, or a string of markup -- as a PNG at `out`."""
    if not shutil.which('rsvg-convert'):
        raise SystemExit('rsvg-convert is not installed (brew install librsvg)')

    size = ['-w', str(width)] + (['-h', str(height)] if height else [])

    def run(source):
        subprocess.run(['rsvg-convert', *size, str(source), '-o', str(out)], check=True)

    if isinstance(svg, Path):
        run(svg)
        return
    # Markup built in memory: rsvg-convert reads files, so it gets one.
    with tempfile.NamedTemporaryFile('w', suffix='.svg') as handle:
        handle.write(svg)
        handle.flush()
        run(handle.name)


def bear_grid():
    """The grid's width, height and hex rows (the open face, BEAR_ROWS)."""
    source = BEAR.read_text()
    width = int(re.search(r'BEAR_WIDTH = (\d+)', source).group(1))
    height = int(re.search(r'BEAR_HEIGHT = (\d+)', source).group(1))
    rows = re.search(r'BEAR_ROWS = \[(.*?)\]', source, re.S).group(1)
    rows = re.findall(r"'([0-9a-f]+)'", rows)
    assert len(rows) == height, f'{len(rows)} rows for a {height}-row grid'
    return width, height, rows


def lit_dots(width, rows):
    """Every lit (x, y) in a grid of hex rows, four dots to a digit."""
    return [
        (x, y)
        for y, row in enumerate(rows)
        for x in range(width)
        if (int(row[x >> 2], 16) >> (3 - (x & 3))) & 1
    ]
