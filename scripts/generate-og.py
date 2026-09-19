#!/usr/bin/env python3
"""Draw the link-preview card: the top of the home page receipt, printed wide.

The card is the same paper, the same dot-matrix bear and the same four lines the
receipt opens with, so a shared link arrives looking like the page it opens.

Nothing here runs at build time — the card is committed as public/og.png and
this script only exists to redraw it when the receipt's header changes. It
needs fonttools[woff2] for the font, rsvg-convert for the raster and Pillow
to pack the result down:

    pip install fonttools brotli pillow && brew install librsvg
    python3 scripts/generate-og.py
"""

from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen

from bear_grid import INK, ROOT, bear_grid, lit_dots, paper_colour, rasterise

FONT = ROOT / 'src/assets/fonts/doto-subset.woff2'
OUT_PNG = ROOT / 'public/og.png'

# Facebook, iMessage, Slack and X all crop toward 1.91:1, so the card is drawn
# at the size they all agree on.
W, H = 1200, 630

# The receipt's own settings, from src/styles/paper.css.
WGHT, ROND = 900, 30
ADVANCE = 0.6  # Doto is monospaced: every glyph advances 600/1000 em.


def load_font():
    """Doto frozen at the weight and roundness the receipt prints at."""
    font = TTFont(FONT)
    return instantiateVariableFont(font, {'wght': WGHT, 'ROND': ROND}, inplace=True)


def text_path(font, text, size, letter_spacing, cx, baseline):
    """One line of dot-matrix type as a single SVG path, centred on cx.

    CSS letter-spacing adds its space after every glyph, the last one included,
    so that trailing gap is left out of the width the line is centred by —
    otherwise every line would sit half a space left of centre.
    """
    cmap = font.getBestCmap()
    glyphs = font.getGlyphSet()
    step = (ADVANCE + letter_spacing) * size
    width = step * len(text) - letter_spacing * size
    x = cx - width / 2
    scale = size / font['head'].unitsPerEm

    parts = []
    for char in text:
        name = cmap.get(ord(char))
        if name is None:
            raise SystemExit(f'{char!r} is not in the font subset')
        pen = SVGPathPen(glyphs)
        glyphs[name].draw(pen)
        d = pen.getCommands()
        if d:
            # The glyph's own y axis points up and the page's points down, hence
            # the negative scale about the baseline.
            parts.append(
                f'<g transform="translate({x:.2f} {baseline:.2f}) '
                f'scale({scale:.5f} {-scale:.5f})"><path d="{d}"/></g>'
            )
        x += step
    return ''.join(parts)


BEAR_WIDTH, BEAR_HEIGHT, BEAR_ROWS = bear_grid()
BEAR_ASPECT = BEAR_HEIGHT / BEAR_WIDTH


def bear_dots(size, cx, top):
    """The bear, re-burned as the dot grid the receipt prints it as."""
    cell = size / BEAR_WIDTH
    left = cx - size / 2
    return ''.join(
        f'<circle cx="{left + (x + 0.5) * cell:.2f}" '
        f'cy="{top + (y + 0.5) * cell:.2f}" r="{cell * 0.42:.2f}"/>'
        for x, y in lit_dots(BEAR_WIDTH, BEAR_ROWS)
    )


def rule(cx, y, width):
    """The receipt's double rule: a hairline, a 3px gap, another hairline."""
    x1, x2 = cx - width / 2, cx + width / 2
    line = (
        f'<path d="M{x1:.1f} %s H{x2:.1f}" stroke="{INK}" stroke-width="2" '
        f'opacity="0.75"/>'
    )
    return (line % f'{y:.1f}') + (line % f'{y + 7:.1f}')


def build():
    font = load_font()
    cx = W / 2

    # Sizes are the receipt's own, scaled by eye rather than by one factor: the
    # card is read at thumbnail size in a chat list, so the name carries more of
    # it here than it does on the page.
    bear_size = 180
    greeting_size, greeting_ls = 23, 0.22
    name_size, name_ls = 62, 0.06
    tagline_size, tagline_ls = 23, 0.04

    bear_height = bear_size * BEAR_ASPECT
    # Measured from the top of the bear to the lower rule, so the whole header
    # sits centred in the card rather than the text alone.
    block = bear_height + 26 + greeting_size + 22 + name_size + 26 + tagline_size + 38 + 7

    y = (H - block) / 2
    bear_svg = bear_dots(bear_size, cx, y)
    y += bear_height + 26 + greeting_size

    greeting = text_path(font, "HI, I'M", greeting_size, greeting_ls, cx, y)
    y += 22 + name_size
    name = text_path(font, 'GAVIN BOWDEN', name_size, name_ls, cx, y)
    y += 26 + tagline_size
    tagline = text_path(
        font,
        'I BUILD SOFTWARE AND ML SYSTEMS. RECENTLY AT NASA LANGLEY.',
        tagline_size,
        tagline_ls,
        cx,
        y,
    )
    y += 38

    # Paper grain and creases, the same two ideas as .sheet: fine noise over the
    # whole sheet, then a few soft folds with a lit crest.
    creases = ''.join(
        f'<rect x="-100" y="{cy - band / 2:.0f}" width="{W + 200}" height="{band}" '
        f'fill="url(#crease)" transform="rotate({angle} {cx} {cy})" opacity="{op}"/>'
        for cy, band, angle, op in (
            (84, 26, -1.6, 0.8),
            (318, 18, 1.1, 0.5),
            (474, 24, -0.8, 0.7),
            (572, 16, 1.9, 0.45),
        )
    )

    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">
  <defs>
    <filter id="grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch"/>
    </filter>
    <linearGradient id="crease" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#000" stop-opacity="0"/>
      <stop offset="0.47" stop-color="#000" stop-opacity="0.035"/>
      <stop offset="0.5" stop-color="#fff" stop-opacity="0.16"/>
      <stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="vignette" cx="0.5" cy="0.5" r="0.75">
      <stop offset="0.55" stop-color="#000" stop-opacity="0"/>
      <stop offset="1" stop-color="#000" stop-opacity="0.07"/>
    </radialGradient>
  </defs>

  <g>
    <rect width="{W}" height="{H}" fill="{paper_colour()}"/>
    <rect width="{W}" height="{H}" filter="url(#grain)" opacity="0.4"/>
    {creases}
    <rect width="{W}" height="{H}" fill="url(#vignette)"/>

    <g fill="{INK}">
      {bear_svg}
      <g opacity="0.8">{greeting}</g>
      {name}
      {tagline}
    </g>
    {rule(cx, y, 880)}
  </g>
</svg>
'''
    # The SVG is a step on the way, not an output: the PNG is what gets served,
    # and this script is the source anything else would be edited from.
    rasterise(svg, OUT_PNG, W, H)

    # The paper grain is per-pixel noise, which is the worst case for PNG: true
    # colour costs well over a megabyte of card that is, in the end, grey. A
    # palette holds the whole thing, and unscraped card bytes are card bytes a
    # chat client may decide not to fetch.
    from PIL import Image

    image = Image.open(OUT_PNG).convert('RGB')
    image.quantize(colors=64, dither=Image.Dither.FLOYDSTEINBERG).save(
        OUT_PNG, optimize=True
    )
    print(f'wrote {OUT_PNG.relative_to(ROOT)} ({OUT_PNG.stat().st_size // 1024} KB)')


if __name__ == '__main__':
    build()
