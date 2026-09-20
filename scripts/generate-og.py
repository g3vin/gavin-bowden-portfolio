#!/usr/bin/env python3
"""Draw the link-preview card: the top of the home page receipt, printed wide.

The card is the same paper, the same dot-matrix bear and the same four lines the
receipt opens with, so a shared link arrives looking like the page it opens.

The paper is the page's own, all the way down: the creases and swells below are
a port of src/lib/paper.js and the surface under them -- sheen, grain,
striations, mottle -- is a port of the .sheet rule in src/styles/paper.css, so
the card is the same stock at the same colour rather than a second idea of what
receipt paper looks like.

Nothing here runs at build time -- the card is committed as public/og.png and
this script only exists to redraw it when the receipt's header changes. It needs
fonttools[woff2] for the font, rsvg-convert for the raster, and Pillow and numpy
to shrink the result and measure it:

    pip install fonttools brotli pillow numpy && brew install librsvg
    python3 scripts/generate-og.py
"""

import random

from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen

import numpy as np
from PIL import Image

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
# The grid carries blank rows above the ears, and the top dot's edge sits a
# little inside its own row. Both are measured once, as a fraction of the drawn
# width, so the header can be laid out from where the bear actually starts
# rather than from the corner of the grid it is burned into.
BEAR_INSET = (
    min(y for _, y in lit_dots(BEAR_WIDTH, BEAR_ROWS)) + 0.08
) / BEAR_WIDTH


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


# The paper.
#
# Ported from src/lib/paper.js, which is what draws the sheet the receipt is
# printed on everywhere else on the site. The card used to generate a crumple of
# its own, and every version of that read as something other than paper -- as
# veins, then as folds, then as scratches -- because it was a second, unrelated
# idea of what this stock looks like. There is only one now, and the page owns
# it: a shared link and the page it opens are creased by the same rules.
#
# A fold is not a stripe. It is a shadow on the face turning away from the light
# and a highlight on the face turning into it, meeting at a sharp crest. Each
# crease below is that cross-section swept along the sheet, faded in and out
# along its length, and nudged off-straight by a displacement map so that it
# wanders the way a real fold does.
#
# The creases go under the print, as they do on the page. The ink lies flat on
# the paper rather than riding over it, which is what the receipt does and is
# the whole point of matching it.
PAPER_SEED = 11

# paper.js lays out a pattern 400 units wide and stretches it across the sheet,
# and every crease length below is one of its lengths times this. Tying it to
# the bear's own scale -- the card draws the bear at twice the size the page
# does -- is the tempting thing and it leaves two creases on the whole card,
# because the card is a short crop of a sheet that is metres long on the page.
# Held nearer the page's own scale, the card gets the four or five folds a piece
# of receipt this size would actually have picked up.
PAPER_ZOOM = 1.35
CREASE_SPACING = 115  # pattern units; roughly one fold per this much paper
HARD_FOLD = 0.28  # the share of folds that are creases rather than handling

# The surface -- sheen, grain, striations, mottle -- is the same stock on every
# sheet, so it lives in styles/paper.css rather than in paper.js, and `surface`
# below is a port of the .sheet rule's background stack. Read that rule for why
# each layer is the strength and the size it is; this file only restates what
# has to change to print it on a card instead of on the page.
#
# Every frequency and amplitude below is the CSS's own number, unscaled, which
# is the one thing on this card drawn at the page's size: the type is printed at
# about twice the receipt's, because the card is read at thumbnail size in a
# chat list, but the tooth is not. Magnified it stops being tooth -- at 2x the
# grain reads as speckle and the formation as blotching, and the card goes from
# a sheet of paper to a photograph of one. Held at 1:1, a crop of the card and
# a crop of the receipt are the same stock under the same light.
#
# The width paper.css lays its surface out against: .receipt-paper is flex
# 0 1 400px, and the striations' period is a shade under it on purpose. The card
# is the same sheet printed wider, not a wider sheet, so the striations keep
# that proportion rather than that pixel count -- held at 397 card pixels they
# would repeat three times across and resolve into exactly the rhythm the period
# was chosen to avoid.
SHEET_WIDTH = 400

# Every stop of the .sheet striations layer, as (pattern px, lit, alpha).
STRIATION_PERIOD = 397
STRIATIONS = (
    (0, False, 0),
    (15, False, 0),
    (17, False, 0.01),
    (19, False, 0),
    (50, True, 0),
    (52, True, 0.013),
    (54, True, 0),
    (95, False, 0),
    (98, False, 0.014),
    (101, False, 0),
    (139.5, False, 0),
    (141, False, 0.007),
    (142.5, False, 0),
    (186.5, True, 0),
    (189, True, 0.011),
    (191.5, True, 0),
    (234, False, 0),
    (236, False, 0.016),
    (238, False, 0),
    (276.5, False, 0),
    (278, False, 0.006),
    (279.5, False, 0),
    (319, True, 0),
    (321, True, 0.012),
    (323, True, 0),
    (363.5, False, 0),
    (366, False, 0.009),
    (368.5, False, 0),
    (397, False, 0),
)

# The .sheet sheen: the long edges of a receipt sit in shadow and a broad
# highlight falls across it. Stops as (share across the sheet, lit, alpha).
SHEEN = (
    (0.00, False, 0.03),
    (0.09, False, 0),
    (0.28, True, 0.045),
    (0.55, True, 0),
    (0.82, False, 0.014),
    (1.00, False, 0.032),
)

# Drawn at twice the size it is served at and shrunk back, which is what lands
# the dot-matrix type and the crease displacement on a properly filtered edge
# rather than a hard one.
SUPERSAMPLE = 2


def stop(offset, lit, opacity):
    """One gradient stop. Black is the SVG default, so only lit stops name it."""
    colour = " stop-color='#fff'" if lit else ''
    return f"<stop offset='{offset:.3f}'{colour} stop-opacity='{opacity:.3f}'/>"


def swells(rng, width, height, defs, body):
    """Broad, very faint shading: the sheet is not lying flat to begin with.

    These are the one thing not scaled off the pattern. On the page a swell runs
    220 to 520px down a receipt that is thousands long, so it is a soft patch;
    given those same pixels on a card 630 tall it is most of the sheet, and the
    card comes out with a dirty bottom edge. They are taken as the share of the
    sheet they are there instead.
    """
    for index in range(round(rng.uniform(3, 6))):
        name = f'b{index}'
        defs.append(
            f"<linearGradient id='{name}' x1='0' y1='0' x2='0' y2='1'>"
            f"{stop(0, False, 0)}"
            f"{stop(0.5, False, rng.uniform(0.016, 0.038))}"
            f"{stop(1, False, 0)}"
            f'</linearGradient>'
        )
        band = rng.uniform(0.12, 0.33) * height
        top = rng.uniform(-0.05, 0.98) * height
        body.append(
            f"<rect x='0' y='{top:.2f}' width='{width}' height='{band:.2f}' "
            f"fill='url(#{name})'/>"
        )


def folds(rng, width, height, zoom, defs, body):
    """Every crease across the sheet, as paper.js draws them."""
    count = max(2, round(height / (CREASE_SPACING * zoom)))
    bleed = width * 0.25

    for index in range(count):
        hard = rng.random() < HARD_FOLD
        valley = rng.random() < 0.5
        y = ((index + rng.uniform(0.15, 0.85)) / count) * height
        band = rng.uniform(11, 20) if hard else rng.uniform(6, 13)
        band *= zoom
        angle = rng.uniform(-2.8, 2.8)
        shadow = rng.uniform(0.07, 0.12) if hard else rng.uniform(0.035, 0.075)
        light = rng.uniform(0.18, 0.34) if hard else rng.uniform(0.08, 0.18)
        # Where the crest sits across the band -- never exactly in the middle.
        apex = rng.uniform(0.44, 0.58)

        # The cross-section of a ridge under one light: the face turning into
        # it, the crest -- bare paper, not a white line, since nothing on a
        # sheet this pale can be brighter than the sheet -- then the face
        # turning away, and a long soft tail behind it. The tail runs about
        # three times the lit ramp on purpose; that asymmetry is the ambient
        # light the fold shades itself from.
        profile = [
            (0.0, True, 0.0),
            (apex - 0.28, True, light),
            (apex + 0.02, False, 0.0),
            (apex + 0.12, False, shadow),
            (apex + 0.34, False, shadow * 0.42),
            (1.0, False, 0.0),
        ]
        if valley:
            profile = [(1.0 - o, w, a) for o, w, a in reversed(profile)]

        shade = f'g{index}'
        defs.append(
            f"<linearGradient id='{shade}' x1='0' y1='0' x2='0' y2='1'>"
            + ''.join(stop(*s) for s in profile)
            + '</linearGradient>'
        )

        # Fade along the length. A fold running edge to edge at full strength is
        # the tell that gives drawn-on creases away, so most of these start or
        # end somewhere in the middle of the paper.
        starts_off = rng.random() < 0.35
        ends_off = rng.random() < 0.35
        start = 0.0 if starts_off else rng.uniform(0, 0.4)
        end = 1.0 if ends_off else rng.uniform(0.6, 1.0)
        peak = rng.uniform(start + 0.15, end - 0.15)
        length = f'm{index}'
        defs.append(
            f"<linearGradient id='{length}' x1='0' y1='0' x2='1' y2='0'>"
            f"{stop(start, True, 1 if starts_off else 0)}"
            f"{stop(peak, True, 1)}"
            f"{stop(end, True, 1 if ends_off else 0)}"
            f'</linearGradient>'
            f"<mask id='k{index}'><rect x='{-bleed:.1f}' y='0' "
            f"width='{width + 2 * bleed:.1f}' height='{height}' "
            f"fill='url(#{length})'/></mask>"
        )

        body.append(
            f"<rect x='{-bleed:.1f}' y='{y - band / 2:.2f}' "
            f"width='{width + 2 * bleed:.1f}' height='{band:.2f}' "
            f"fill='url(#{shade})' mask='url(#k{index})' "
            f"transform='rotate({angle:.2f} {width / 2:.1f} {y:.2f})'/>"
        )


def split_noise(name, frequency, octaves, seed, shadow, shadow_alpha, light_alpha):
    """One of the surface's two noise layers, exactly as paper.css builds it.

    A single turbulence split two ways -- dark where the noise runs high, light
    where it runs low -- because paper reads as both denser and thinner than its
    average, not only darker. The three-entry transfer tables hold each half at
    zero across the half of the range the other one owns, since overlapping
    translucent black and white do not cancel, they compound.

    The alpha comes from one channel, as turbulence writes independent noise
    into all four and letting colour through is what makes grain read as
    compression artefacting; and sRGB interpolation is named rather than left to
    the linearRGB default, which moves the midpoint.
    """
    red, green, blue = shadow
    return (
        f"<filter id='{name}' x='0' y='0' width='100%' height='100%' "
        f"color-interpolation-filters='sRGB'>"
        f"<feTurbulence type='fractalNoise' baseFrequency='{frequency:.5f}' "
        f"numOctaves='{octaves}' seed='{seed}' result='n'/>"
        f"<feColorMatrix in='n' type='matrix' result='k' values='"
        f"0 0 0 0 {red} 0 0 0 0 {green} 0 0 0 0 {blue} 1 0 0 0 0'/>"
        f"<feComponentTransfer in='k' result='d'>"
        f"<feFuncA type='table' tableValues='0 0 {shadow_alpha}'/>"
        f"</feComponentTransfer>"
        f"<feColorMatrix in='n' type='matrix' result='v' values='"
        f"0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 1 0 0 0 0'/>"
        f"<feComponentTransfer in='v' result='l'>"
        f"<feFuncA type='table' tableValues='{light_alpha} 0 0'/>"
        f"</feComponentTransfer>"
        f"<feMerge><feMergeNode in='d'/><feMergeNode in='l'/></feMerge>"
        f"</filter>"
    )


def surface(width, height, defs, body):
    """The stock itself, under the creases: what .sheet paints on every sheet.

    Bottom to top, which is the reverse of the order paper.css lists them in:
    mottle, striations, grain, sheen. The creases the caller draws go over all
    four, as they do on the page, and the print goes over those.

    paper.css tiles the two noise layers and fades each tile to nothing at its
    top and bottom so the joins cannot show. Nothing tiles here -- the card is
    one rect and both layers cover it in a single pass -- so the fades come off
    with the seams, and the card gets the middle of a sheet rather than a
    sheet's worth of edges.
    """
    # Formation: fibre clumping in the base sheet showing through the coating as
    # soft cloudiness. The largest feature by far, and the one the eye actually
    # reads as paper. Its shadow half lifts a little blue rather than dropping
    # to flat black -- a neutral shadow on an optically brightened sheet goes
    # muddy, and the shading has to belong to the same stock as the paper.
    defs.append(
        split_noise('mottle', 0.008, 5, 17, (0, 0.03, 0.12), 0.045, 0.05)
    )
    body.append(f"<rect width='{width}' height='{height}' filter='url(#mottle)'/>")

    # The machine direction runs down the roll, so coating and calender streaks
    # run down the receipt, never across it.
    period = width * STRIATION_PERIOD / SHEET_WIDTH
    defs.append(
        f"<linearGradient id='streaks' x1='0' y1='0' x2='1' y2='0'>"
        + ''.join(
            stop(x / STRIATION_PERIOD, lit, alpha) for x, lit, alpha in STRIATIONS
        )
        + f"</linearGradient>"
        f"<pattern id='striations' patternUnits='userSpaceOnUse' "
        f"width='{period:.2f}' height='{height}'>"
        f"<rect width='{period:.2f}' height='{height}' fill='url(#streaks)'/>"
        f"</pattern>"
    )
    body.append(f"<rect width='{width}' height='{height}' fill='url(#striations)'/>")

    # The coating's micro-texture. Faint: a thermal sheet is precoated and
    # calendered, so it is smooth, and sandy grain at any real strength is the
    # tell that it is not paper.
    defs.append(split_noise('grain', 0.16, 4, 5, (0, 0, 0), 0.05, 0.045))
    body.append(f"<rect width='{width}' height='{height}' filter='url(#grain)'/>")

    # A receipt curls off the roll and the coated surface is satin rather than
    # matte, so the long edges sit in shadow and a broad highlight falls across
    # the sheet.
    defs.append(
        f"<linearGradient id='sheen' x1='0' y1='0' x2='1' y2='0'>"
        + ''.join(stop(*s) for s in SHEEN)
        + f"</linearGradient>"
    )
    body.append(f"<rect width='{width}' height='{height}' fill='url(#sheen)'/>")


def paper(width, height):
    """The sheet the card is printed on: its surface, then its creases."""
    rng = random.Random(PAPER_SEED)
    zoom = PAPER_ZOOM
    defs, stock, body = [], [], []

    surface(width, height, defs, stock)

    # One displacement map for the whole sheet: every fold on a given piece of
    # paper wanders together, because it is the paper that is bent, not the fold.
    defs.append(
        f"<filter id='wander' x='-25%' y='-8%' width='150%' height='116%'>"
        f"<feTurbulence type='fractalNoise' "
        f"baseFrequency='{0.006 / zoom:.5f} {0.035 / zoom:.4f}' numOctaves='2' "
        f"seed='{rng.randrange(9999)}' result='t'/>"
        f"<feDisplacementMap in='SourceGraphic' in2='t' scale='{14 * zoom:.1f}' "
        f"xChannelSelector='R' yChannelSelector='G'/></filter>"
    )

    swells(rng, width, height, defs, body)
    folds(rng, width, height, zoom, defs, body)

    return (
        ''.join(defs),
        f"<rect width='{width}' height='{height}' fill='{paper_colour()}'/>"
        + ''.join(stock)
        + f"<g filter='url(#wander)'>{''.join(body)}</g>",
    )


def measure(path):
    """What the finished card is, rather than what it was meant to be."""
    colour = np.asarray(Image.open(path).convert('RGB'), dtype=np.float32)
    luma = colour.mean(axis=2)
    ink = luma < 200
    # Only paper well clear of the type: next to a letter these numbers are
    # really measuring the letter.
    clear = ~ink
    for _ in range(6):
        clear[1:] &= clear[:-1]
        clear[:-1] &= clear[1:]
        clear[:, 1:] &= clear[:, :-1]
        clear[:, :-1] &= clear[:, 1:]
    paper_px = luma[clear]
    mode = int(np.bincount(paper_px.astype(int)).argmax())
    print(
        f'paper {mode} against the receipt\'s {paper_colour()}, '
        f'creases reaching {int(paper_px.min())}, '
        f'spread {np.percentile(paper_px, 99) - np.percentile(paper_px, 1):.1f} levels, '
        f'blown highlights {int((colour.reshape(-1, 3) == 255).all(axis=1).sum())}'
    )


def build():
    font = load_font()
    cx = W / 2

    # Sizes are the receipt's own, scaled by eye rather than by one factor: the
    # card is read at thumbnail size in a chat list, so the name carries more of
    # it here than it does on the page. The tagline is the line that sets how
    # large the rest can be -- at 57 characters it reaches the card's edges
    # first -- so everything is sized around the biggest it can be and still
    # keep a margin.
    bear_size = 246
    greeting_size, greeting_ls = 30, 0.22
    name_size, name_ls = 85, 0.06
    tagline_size, tagline_ls = 29, 0.04
    rule_width = 1064

    bear_height = bear_size * BEAR_ASPECT
    inset = bear_size * BEAR_INSET
    # Measured from the top of the bear's ears to the tagline's baseline: the
    # ink, not the grid the bear is burned into. The grid's blank top rows are
    # worth thirty pixels here, and counting them hangs the whole header low
    # enough that the gap above the bear is half again the gap under the
    # tagline. Taking them off lands the two gaps on each other.
    block = (
        bear_height
        - inset
        + 30
        + greeting_size
        + 26
        + name_size
        + 34
        + 7
        + 34
        + tagline_size
    )

    y = (H - block) / 2 - inset
    bear_svg = bear_dots(bear_size, cx, y)
    y += bear_height + 30 + greeting_size

    greeting = text_path(font, "HI, I'M", greeting_size, greeting_ls, cx, y)
    y += 26 + name_size
    name = text_path(font, 'GAVIN BOWDEN', name_size, name_ls, cx, y)
    # The rule sits between the name and what the name is claiming, which is
    # where the receipt puts a rule everywhere else: under a heading, above the
    # lines it covers.
    y += 34
    divider = rule(cx, y, rule_width)
    y += 7 + 34 + tagline_size
    tagline = text_path(
        font,
        'I BUILD SOFTWARE AND ML SYSTEMS. RECENTLY AT NASA LANGLEY.',
        tagline_size,
        tagline_ls,
        cx,
        y,
    )

    defs, sheet = paper(W, H)
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">
  <defs>{defs}</defs>
  {sheet}
  <g fill="{INK}">
    {bear_svg}
    <g opacity="0.8">{greeting}</g>
    {name}
    {tagline}
  </g>
  {divider}
</svg>
'''
    # The SVG is a step on the way, not an output: the PNG is what gets served,
    # and this script is the source anything else would be edited from.
    rasterise(svg, OUT_PNG, W * SUPERSAMPLE, H * SUPERSAMPLE)
    image = Image.open(OUT_PNG).convert('RGB').resize((W, H), Image.LANCZOS)

    # The paper grain is per-pixel noise, which is the worst case for PNG: true
    # colour costs well over a megabyte of card that is, in the end, grey. A
    # palette holds the whole thing, and unscraped card bytes are card bytes a
    # chat client may decide not to fetch.
    image.quantize(colors=64, dither=Image.Dither.FLOYDSTEINBERG).save(
        OUT_PNG, optimize=True
    )
    print(f'wrote {OUT_PNG.relative_to(ROOT)} ({OUT_PNG.stat().st_size // 1024} KB)')
    measure(OUT_PNG)


if __name__ == '__main__':
    build()
