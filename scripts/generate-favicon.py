#!/usr/bin/env python3
"""Burn the bear's dot grid into the favicon.

The tab icon is the same grid the receipt prints (src/assets/bearDots.js),
cropped to its lit dots and centred on a square of paper, so the two can never
disagree. Writes public/favicon-dots.svg and a 180px public/favicon-dots.png
for the browsers and home screens that want a bitmap.

    python3 scripts/generate-favicon.py     # needs rsvg-convert for the PNG
"""

from bear_grid import INK, ROOT, bear_grid, lit_dots, paper_colour, rasterise

SVG = ROOT / 'public/favicon-dots.svg'
PNG = ROOT / 'public/favicon-dots.png'
PNG_SIZE = 180
MARGIN = 2


def main():
    width, _, rows = bear_grid()
    dots = lit_dots(width, rows)
    xs = [x for x, _ in dots]
    ys = [y for _, y in dots]
    left, top = min(xs), min(ys)
    w, h = max(xs) - left + 1, max(ys) - top + 1
    side = max(w, h) + 2 * MARGIN
    ox, oy = (side - w) / 2 - left, (side - h) / 2 - top

    circles = ''.join(
        f'<circle cx="{x + ox + 0.5:g}" cy="{y + oy + 0.5:g}" r="0.45"/>' for x, y in dots
    )
    SVG.write_text(
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {side} {side}">\n'
        f'<style>circle{{fill:{INK}}}</style>\n'
        f'<rect width="{side}" height="{side}" fill="{paper_colour()}"/>\n'
        f'{circles}\n</svg>\n'
    )
    print(f'wrote {SVG.relative_to(ROOT)} ({len(dots)} dots)')

    rasterise(SVG, PNG, PNG_SIZE, PNG_SIZE)
    print(f'wrote {PNG.relative_to(ROOT)}')


if __name__ == '__main__':
    main()
