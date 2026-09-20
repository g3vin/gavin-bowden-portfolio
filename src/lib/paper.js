// What makes a sheet of receipt paper look like paper: the creases across it and
// the torn edges top and bottom, both drawn as SVG data URIs. The surface itself — formation, grain, striations, sheen — is the same
// stock on every sheet and lives in ../styles/paper.css instead.
//
// A fold is not a stripe: it is a shadow on the face turning away from the
// light and a highlight on the face turning into it, meeting at a sharp crest.
// Each crease here is that cross-section, swept along the sheet, faded in and
// out along its length, and nudged off-straight by a displacement map so it
// wanders the way a real fold does. Everything is drawn from a seeded PRNG, so
// a given seed always produces the same sheet and different sheets on the page
// are creased differently.

// The pattern is anchored to the top of the sheet and drawn to the height the
// caller gives, so a shorter sheet crops it and one within that height is
// covered end to end without tiling — a repeat would print the same fold at a
// regular interval, which is exactly the tell being fixed here. (Past that
// height the CSS does tile it, as a safety net; see sheetStyle.)

// Width is nominal: the pattern is stretched to 100% of the sheet, and at these
// proportions the horizontal scaling is small enough not to read.
const PATTERN_WIDTH = 400

// Roughly one fold per this many pixels of paper.
const CREASE_SPACING = 115

function mulberry32(a) {
  return function random() {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hashSeed(value) {
  let h = 2166136261
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

// Uniform draws in [min, max) from a seeded generator.
const ranged = (rand) => (min, max) => min + rand() * (max - min)

// `n` to `places` decimals. Every digit dropped is a byte saved in a data URI
// that ships inline in the page.
const round = (n, places) => Math.round(n * 10 ** places) / 10 ** places

// An SVG as a CSS url(). Brackets and # are the characters that break a data
// URI left unencoded; a literal %23 in the source passes through untouched.
const svgUrl = (svg) =>
  `url("data:image/svg+xml,${svg.replace(/</g, '%3C').replace(/>/g, '%3E').replace(/#/g, '%23')}")`

function paperCreases(seed, height) {
  const rand = mulberry32(hashSeed(String(seed)))
  const between = ranged(rand)

  const defs = []
  const body = []

  // One displacement map for the whole sheet: every fold on a given piece of
  // paper wanders together, because it is the paper that is bent, not the fold.
  defs.push(
    `<filter id='w' x='-25%' y='-8%' width='150%' height='116%'>` +
      `<feTurbulence type='fractalNoise' baseFrequency='0.006 0.035' numOctaves='2' seed='${Math.floor(rand() * 9999)}' result='t'/>` +
      `<feDisplacementMap in='SourceGraphic' in2='t' scale='14' xChannelSelector='R' yChannelSelector='G'/>` +
      `</filter>`,
  )

  // Broad, very faint shading: the sheet is not lying flat to begin with.
  const swells = Math.round(between(3, 6))
  for (let i = 0; i < swells; i += 1) {
    const gid = `b${i}`
    defs.push(
      `<linearGradient id='${gid}' x1='0' y1='0' x2='0' y2='1'>` +
        `<stop offset='0' stop-opacity='0'/>` +
        `<stop offset='0.5' stop-opacity='${round(between(0.016, 0.038), 3)}'/>` +
        `<stop offset='1' stop-opacity='0'/>` +
        `</linearGradient>`,
    )
    const h = between(220, 520)
    body.push(
      `<rect x='0' y='${round(between(-0.05, 0.98) * height, 3)}' width='${PATTERN_WIDTH}' height='${round(h, 3)}' fill='url(%23${gid})'/>`,
    )
  }

  const count = Math.round(height / CREASE_SPACING)
  // Roughly a quarter of the folds are hard ones; the rest are the soft creases
  // a receipt picks up in a pocket. Each one is a mountain or a valley, chosen
  // by the coin flip below: a sheet that has been folded and stuffed somewhere
  // has both, and under a single light the two shade in opposite directions.
  // Every fold on the sheet running the same way is what made the paper read as
  // corrugated rather than creased.
  for (let i = 0; i < count; i += 1) {
    const primary = rand() < 0.28
    const valley = rand() < 0.5
    const y = ((i + between(0.15, 0.85)) / count) * height
    const band = primary ? between(11, 20) : between(6, 13)
    const angle = between(-2.8, 2.8)
    const shadow = primary ? between(0.07, 0.12) : between(0.035, 0.075)
    const light = primary ? between(0.18, 0.34) : between(0.08, 0.18)
    // Where the crest sits across the band — never exactly in the middle.
    const apex = between(0.44, 0.58)

    // The cross-section of a ridge under one light: the face turning into it,
    // the crest — bare paper, not a white line, since nothing on a sheet this
    // pale can be brighter than the sheet — then the face turning away, and a
    // long soft tail behind it. The tail runs about three times the lit ramp on
    // purpose; that asymmetry is the ambient light the fold shades itself from,
    // and it is what a plain dark-to-light ramp was missing.
    const profile = [
      [0, 1, 0],
      [apex - 0.28, 1, light],
      [apex + 0.02, 0, 0],
      [apex + 0.12, 0, shadow],
      [apex + 0.34, 0, shadow * 0.42],
      [1, 0, 0],
    ]
    // Black is the SVG default for stop-color, so only the lit stops carry one.
    // On a sheet with twenty-odd folds on it that omission is real weight off
    // the data URI, which ships inline in the prerendered HTML.
    const stops = (valley ? profile.map(([o, w, a]) => [1 - o, w, a]).reverse() : profile)
      .map(
        ([o, w, a]) =>
          `<stop offset='${round(o, 3)}'${w ? " stop-color='%23fff'" : ''} stop-opacity='${round(a, 3)}'/>`,
      )
      .join('')

    const gid = `g${i}`
    defs.push(`<linearGradient id='${gid}' x1='0' y1='0' x2='0' y2='1'>${stops}</linearGradient>`)

    // Fade along the length. A fold that ran edge to edge at full strength on
    // every line is the tell that gave the old gradients away, so most of these
    // start or end somewhere in the middle of the paper.
    const bleedStart = rand() < 0.35
    const bleedEnd = rand() < 0.35
    const start = bleedStart ? 0 : between(0, 0.4)
    const end = bleedEnd ? 1 : between(0.6, 1)
    const peak = between(start + 0.15, end - 0.15)
    const mid = `m${i}`
    defs.push(
      `<linearGradient id='${mid}' x1='0' y1='0' x2='1' y2='0'>` +
        `<stop offset='${round(start, 3)}' stop-color='%23fff' stop-opacity='${bleedStart ? 1 : 0}'/>` +
        `<stop offset='${round(peak, 3)}' stop-color='%23fff' stop-opacity='1'/>` +
        `<stop offset='${round(end, 3)}' stop-color='%23fff' stop-opacity='${bleedEnd ? 1 : 0}'/>` +
        `</linearGradient>` +
        `<mask id='mk${i}'><rect x='${-PATTERN_WIDTH * 0.25}' y='0' width='${PATTERN_WIDTH * 1.5}' height='${height}' fill='url(%23${mid})'/></mask>`,
    )

    body.push(
      `<rect x='${-PATTERN_WIDTH * 0.25}' y='${round(y - band / 2, 3)}' width='${PATTERN_WIDTH * 1.5}' height='${round(band, 3)}' ` +
        `fill='url(%23${gid})' mask='url(%23mk${i})' transform='rotate(${round(angle, 3)} ${PATTERN_WIDTH / 2} ${round(y, 3)})'/>`,
    )
  }

  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='${PATTERN_WIDTH}' height='${height}' preserveAspectRatio='none'>` +
    `<defs>${defs.join('')}</defs>` +
    `<g filter='url(%23w)'>${body.join('')}</g>` +
    `</svg>`

  return svgUrl(svg)
}

// Torn edges -----------------------------------------------------------------

// A receipt roll is slit from a jumbo roll, so the paper's grain runs along the
// roll — down the length of the receipt. The top and bottom edges are therefore
// torn ACROSS the grain, where the fracture cannot follow the fibres and has to
// jump between them: it wanders, it curves, and it leaves a feathery edge. The
// serrated bar keeps the line roughly straight, so the shape here is a nearly
// flat curve that occasionally escapes the bar, roughened by a displacement map
// standing in for the fibres.
//
// Everything below is sized to be legible at the size the sheet is actually
// displayed — roughly 400px wide. Fibre-accurate roughness is sub-pixel there
// and averages out into a straight antialiased line, which reads as a border,
// not as paper. So the roughness is pitched at a few pixels: coarse enough for
// the eye to resolve at 1:1, far short of the teeth a tear bar never leaves.
const TEAR_DEPTH = 14

// Drawn past both ends so that the fibre displacement never pulls the edge in
// at x=0 or x=width, where it would notch the side of the sheet. The sides are
// slit with the grain and are clean.
const EDGE_OVERHANG = 12

// The strip's inner side is carried well past the bottom of the viewBox, which
// clips it back. Without the slack the same displacement that roughens the torn
// side also lifts the inner side, and it lifts it clear of the 1px overlap with
// the flat middle of the sheet — leaving a transparent hairline straight across
// the paper.
const INNER_BLEED = 10

// A tear curves; it does not hinge. Catmull-Rom through the points, emitted as
// cubic segments.
function smoothPath(points) {
  const ext = [points[0], ...points, points[points.length - 1]]
  let d = `M${round(points[0][0], 1)},${round(points[0][1], 1)}`
  for (let i = 1; i < ext.length - 2; i += 1) {
    const [p0, p1, p2, p3] = [ext[i - 1], ext[i], ext[i + 1], ext[i + 2]]
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]
    d += ` C${round(c1[0], 1)},${round(c1[1], 1)} ${round(c2[0], 1)},${round(c2[1], 1)} ${round(p2[0], 1)},${round(p2[1], 1)}`
  }
  return d
}

// One edge, as a mask image: opaque where the paper survived, transparent where
// it tore away. `flip` mirrors it for the bottom of the sheet.
function tearEdge(rand, flip) {
  const between = ranged(rand)
  const clamp = (y) => Math.max(0.4, Math.min(TEAR_DEPTH - 1.5, y))

  // How far the cut sits into the strip. The bar holds it close to flat.
  const base = between(2.5, 4)
  const points = []
  let x = -EDGE_OVERHANG

  // A corner sometimes tears away as the sheet is pulled off the roll: the tear
  // starts deep and is drawn back to the bar over the first stretch.
  if (rand() < 0.5) {
    const depth = between(5, 9)
    const run = between(30, 90)
    points.push([x, clamp(depth)])
    points.push([run * 0.45, clamp(depth * 0.55 + base * 0.45)])
    x = run
  }

  // Places where the tear escapes the bar and wanders before being pulled back.
  // At least one, so no edge comes out as a dead straight line.
  const escapes = Array.from({ length: 1 + Math.floor(rand() * 2) }, () => between(0.08, 0.85) * PATTERN_WIDTH)
    .sort((a, b) => a - b)

  while (x <= PATTERN_WIDTH) {
    if (escapes.length && x >= escapes[0]) {
      escapes.shift()
      const depth = between(4, 8)
      const width = between(40, 100)
      // Asymmetric: it pulls away faster than it comes back.
      points.push([x + width * 0.3, clamp(depth * between(0.75, 1))])
      points.push([x + width * 0.55, clamp(depth)])
      points.push([x + width * 0.8, clamp(base + between(0, 1.2))])
      x += width
      continue
    }
    points.push([x, clamp(base + between(-1.5, 1.5))])
    x += between(10, 26)
  }
  points.push([PATTERN_WIDTH + EDGE_OVERHANG, clamp(base + between(-1.5, 1.5))])

  const y = (v) => (flip ? TEAR_DEPTH - v : v)
  const flipped = points.map(([px, py]) => [px, y(py)])
  const inner = y(TEAR_DEPTH + INNER_BLEED)
  const d =
    `${smoothPath(flipped)} L${PATTERN_WIDTH + EDGE_OVERHANG},${inner} L${-EDGE_OVERHANG},${inner} Z`

  // The fibres. Higher frequency along the edge than across it, since the
  // fracture jumps between fibres running the other way — but coarse enough in
  // absolute terms that the roughness survives being viewed at 1:1.
  const fuzz =
    `<filter id='f' x='-10%' y='-120%' width='120%' height='340%'>` +
    `<feTurbulence type='fractalNoise' baseFrequency='0.22 0.13' numOctaves='3' seed='${Math.floor(rand() * 9999)}' result='t'/>` +
    `<feDisplacementMap in='SourceGraphic' in2='t' scale='${round(between(2.6, 3.8), 2)}' xChannelSelector='R' yChannelSelector='G'/>` +
    `</filter>`

  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='${PATTERN_WIDTH}' height='${TEAR_DEPTH}' viewBox='0 0 ${PATTERN_WIDTH} ${TEAR_DEPTH}' preserveAspectRatio='none'>` +
    `<defs>${fuzz}</defs><path d='${d}' fill='%23000' filter='url(%23f)'/></svg>`

  return svgUrl(svg)
}

// A sheet is a pure function of its seed and its height, and the sheets on a
// page are a fixed handful — but the callers are components, so an un-cached
// sheetStyle re-runs the whole pipeline (two dozen crease gradients, two torn
// edges) on every render. The home page re-renders on scroll,
// so that was the paper being redrawn from scratch several times a second to
// arrive at a string it had already built.
const sheets = new Map()

// Inline style for one sheet of paper: its creases and its two torn edges, all
// from the one seed, so a given sheet is always the same sheet and no two
// sheets on the page are alike. `height` should be a comfortable over-estimate
// of the sheet — the crease layer tiles below it as a safety net, and a sheet
// that never reaches it never repeats.
export function sheetStyle(seed, height) {
  const key = `${seed}|${height}`
  let style = sheets.get(key)
  if (!style) {
    // Edges get their own streams so that changing the crease pattern does not
    // reshuffle the tears as a side effect.
    const top = mulberry32(hashSeed(`${seed}/top`))
    const bottom = mulberry32(hashSeed(`${seed}/bottom`))
    style = {
      '--paper-creases': paperCreases(seed, height),
      '--paper-crease-height': `${height}px`,
      '--paper-tear-top': tearEdge(top, false),
      '--paper-tear-bottom': tearEdge(bottom, true),
      '--tear': `${TEAR_DEPTH}px`,
    }
    sheets.set(key, style)
  }
  return style
}
