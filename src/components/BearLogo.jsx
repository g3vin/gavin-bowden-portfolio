import { useEffect, useRef, useState } from 'react'
import {
  BEAR_ROWS,
  BEAR_ROWS_SHUT_TONGUE_IN,
  BEAR_WIDTH,
  BEAR_HEIGHT,
} from '../assets/bearDots'
import DotMatrix from './DotMatrix'
import { prefersReducedMotion } from '../lib/media'

const FACES = { open: BEAR_ROWS, blink: BEAR_ROWS_SHUT_TONGUE_IN }

// How long the eyes stay shut: the eyes shut and the tongue ducks in together,
// then both come back. Reduced motion does not object to a discrete state
// change, but it does object to a flutter, so that reader gets the blink held
// longer.
const BLINK_MS = 160
const BLINK_MS_CALM = 320

// Thermal logo: the bear re-burned as a dot grid. Click it and it blinks,
// pulling its tongue in while its eyes are shut.
function BearLogo({ className }) {
  const [face, setFace] = useState('open')
  const timer = useRef(0)

  // Nothing here should outlive the sheet it was printed on -- the 404's bear in
  // particular can be clicked and then routed away from mid-blink.
  useEffect(() => () => clearTimeout(timer.current), [])

  const play = () => {
    // A second click restarts the blink rather than queueing one, so holding
    // the mouse down on the bear does not bank a minute of faces.
    clearTimeout(timer.current)
    setFace('blink')
    timer.current = setTimeout(
      () => setFace('open'),
      prefersReducedMotion() ? BLINK_MS_CALM : BLINK_MS,
    )
  }

  return (
    // A button because it is a thing to press, even though what it does is a
    // joke: that is what puts it in the tab order and answers the space bar.
    // The label says what pressing it does, not what the picture is -- the mark
    // itself is decoration the sheet's own heading already names.
    <button type="button" className="bear-blink" onClick={play} aria-label="Make the bear blink">
      <DotMatrix
        className={className}
        rows={FACES[face]}
        width={BEAR_WIDTH}
        height={BEAR_HEIGHT}
      />
    </button>
  )
}

export default BearLogo
