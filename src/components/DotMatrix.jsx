// A dot grid burned as an SVG, the way the thermal printer would lay it down.
//
// Grids arrive as hex rows, four dots per character, most significant bit
// leftmost -- see src/assets/bearDots.js and src/assets/projectDots.js. Callers
// size the result in px rather than by the grid, so the dots stay in step with
// the body text's own.

import { memo } from 'react'

// Unpacking a grid is pure and the grids are module constants, so each one is
// walked once for the life of the page no matter how many sheets print it.
const cache = new Map()

function dotsFor(rows, width) {
  let dots = cache.get(rows)
  if (!dots) {
    dots = rows.flatMap((row, y) =>
      Array.from({ length: width }, (_, x) => x)
        .filter((x) => {
          const nibble = parseInt(row[x >> 2], 16)
          return (nibble >> (3 - (x & 3))) & 1
        })
        .map((x) => ({ x, y })),
    )
    cache.set(rows, dots)
  }
  return dots
}

function DotMatrix({ rows, width, height, className }) {
  return (
    <svg
      className={className}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
      focusable="false"
    >
      {dotsFor(rows, width).map((dot) => (
        <circle key={`${dot.x}-${dot.y}`} cx={dot.x + 0.5} cy={dot.y + 0.5} r={0.42} />
      ))}
    </svg>
  )
}

// Memoised on props that are all module constants in practice. The home page
// re-renders as the reader scrolls — a highlight moving down the list — and
// without this every one of those renders reconciles a few hundred <circle>
// elements that cannot have changed.
export default memo(DotMatrix)
