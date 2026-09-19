// Dot-matrix rendering of the site's bear, the logo a thermal printer would
// actually burn onto the paper.
//
// Generated from src/assets/bear.png: flattened onto white, converted to greyscale,
// cropped to the ink bounding box (found on a median-filtered copy so stray
// specks do not widen it), box-filtered down to fit 40x44, centred, then
// thresholded at 225/255, with the blank rows under the tongue trimmed off so
// the heading sits close beneath it. Each row is hex, four pixels per
// character, most significant bit leftmost. 40x38 grid, 435 lit dots.
// Re-run those steps if the drawing ever changes, and re-read the boxes below
// against the new grid.

export const BEAR_WIDTH = 40
export const BEAR_HEIGHT = 38

export const BEAR_ROWS = [
  '0000000000',
  '0000000000',
  '0000000000',
  '0000000000',
  '0000000000',
  '00000003f0',
  '03800007f0',
  '0fc0070638',
  '0c61fffe18',
  '1c67e03e38',
  '187e000030',
  '0c78003830',
  '0e06003838',
  '0e0603001c',
  '0c007ff80c',
  '1801f1fe06',
  '300fc00706',
  '701ec7c303',
  '603bffe383',
  '6077ffe383',
  'c067ffc183',
  'c0e7ffc183',
  'c0c7ff0183',
  'c0c3fe0183',
  'c0c1f80183',
  'c0c0000183',
  'c0e0000303',
  'c060000703',
  'c070000e03',
  'c03ffffc06',
  'c00fffe006',
  '00018cc000',
  '00018cc000',
  '00018cc000',
  '0000c0c000',
  '0000c1c000',
  '0000738000',
  '00003f0000',
]

// The other faces the bear pulls are burned into copies of the rows above
// rather than kept as hand-drawn grids of their own, so they cannot drift out
// of step with it. Each is a list of boxes to wipe, optionally with a one-dot
// line laid across a given row. The boxes come from reading the grid above.

// Both pupils, each wiped and replaced by a lash at the height it sat.
const SHUT = [
  { left: 12, right: 15, top: 12, bottom: 13, line: 13 },
  { left: 25, right: 29, top: 11, bottom: 12, line: 12 },
]

// The tongue hangs in rows 31-37, below the muzzle's bottom edge, and nothing
// else on the face reaches down there.
const TONGUE_IN = [{ left: 0, right: BEAR_WIDTH - 1, top: 31, bottom: BEAR_HEIGHT - 1 }]

function burn(rows, boxes) {
  const grid = rows.map((row) =>
    Array.from({ length: BEAR_WIDTH }, (_, x) => (parseInt(row[x >> 2], 16) >> (3 - (x & 3))) & 1),
  )

  for (const box of boxes) {
    for (let y = box.top; y <= box.bottom; y++) {
      for (let x = box.left; x <= box.right; x++) {
        grid[y][x] = y === box.line ? 1 : 0
      }
    }
  }

  // Back into the same four-dots-per-character hex the rows above are written
  // in, so each face is just another grid as far as DotMatrix is concerned.
  return grid.map((line) => {
    let hex = ''
    for (let x = 0; x < BEAR_WIDTH; x += 4) {
      hex += ((line[x] << 3) | (line[x + 1] << 2) | (line[x + 2] << 1) | line[x + 3]).toString(16)
    }
    return hex
  })
}

export const BEAR_ROWS_SHUT_TONGUE_IN = burn(BEAR_ROWS, [...SHUT, ...TONGUE_IN])
