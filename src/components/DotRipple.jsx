import { memo } from 'react'
import './DotRipple.css'

// A droplet lands in the middle of a dot grid, one ring travels out to the rim
// losing height as it goes, and the water is flat again before the next drop
// falls. Printed in the same round dots as everything else on the site, so a
// wait looks like the page rather than like a borrowed spinner.
//
// The animation is entirely CSS: every dot runs the same keyframes, and what
// turns them into a ring leaving the centre is a delay proportional to how far
// each one sits from it. Nothing here runs per frame in JavaScript, which is
// the point — this is what a reader gets to look at while their connection is
// already struggling.
//
// Where it is worth showing one of these at all is ../lib/loading.js's job.

// Dots from the centre to the rim. Five gives an 11x11 grid, 81 dots once the
// corners are dropped: dense enough that the ring reads as a curve rather than
// a diamond, small enough to sit inside a phone-width figure.
const RADIUS = 5

const COLUMNS = RADIUS * 2 + 1

// Three places is past the point any of these can move a dot by a visible
// amount, and they are written into the markup once per dot per ripple.
const round = (n) => Math.round(n * 1000) / 1000

// Walked once for the life of the page. The grid is a constant, so every
// ripple on the site is this same list.
const DOTS = []
for (let y = -RADIUS; y <= RADIUS; y++) {
  for (let x = -RADIUS; x <= RADIUS; x++) {
    // Normalised so the rim is 1 whatever the radius is. That is what lets the
    // CSS state the wave's speed and its falloff in one unit.
    const distance = Math.hypot(x, y) / RADIUS
    // Square grid, round ripple. The corners lie past the rim, and a wave that
    // reaches them arrives late and turns the ring into a box.
    if (distance > 1) continue
    DOTS.push({
      // Grid lines are 1-based, and they are handed to CSS already counted:
      // grid-column resolves a substituted integer reliably in a way calc() in
      // a grid line position does not.
      column: x + RADIUS + 1,
      row: y + RADIUS + 1,
      distance: round(distance),
      // How much of the wave is left by the time it arrives here. A real
      // ripple spreads its energy around an ever longer circumference, so the
      // ring dims as it travels; the exponent only slows that fade enough that
      // the outermost ring still prints rather than being notional.
      amplitude: round((1 - distance) ** 0.65),
    })
  }
}

function DotRipple({ className }) {
  return (
    // aria-hidden, with no "Loading" text: every place this is used lays it
    // over an image or a clip that already carries its own name, and none of
    // them keep a screen reader waiting — the alt text and the caption are
    // there from the first byte of HTML.
    <span
      className={className ? `ripple ${className}` : 'ripple'}
      style={{ '--ripple-columns': COLUMNS }}
      aria-hidden="true"
    >
      {DOTS.map((dot) => (
        <span
          key={`${dot.column}-${dot.row}`}
          className="ripple__dot"
          style={{
            '--x': dot.column,
            '--y': dot.row,
            '--r': dot.distance,
            '--a': dot.amplitude,
          }}
        />
      ))}
    </span>
  )
}

// Memoised for the same reason DotMatrix is: the home page re-renders on every
// scroll tick to move the highlight down the list, and a ripple waiting on a
// thumbnail there would otherwise have its 81 dots reconciled on each one.
export default memo(DotRipple)
