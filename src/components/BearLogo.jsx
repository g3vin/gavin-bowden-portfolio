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

// The shortest the face is allowed to stay shut. Holding the bear keeps it shut
// for as long as you hold it; this is only the floor under a quick tap, so the
// joke registers instead of flickering past. Reduced motion does not object to
// a discrete state change, but it does object to a flutter, so that reader gets
// the shut face held longer.
const BLINK_MS = 160
const BLINK_MS_CALM = 320

// Thermal logo: the bear re-burned as a dot grid. Hold it and it shuts its
// eyes, pulling its tongue in while they are closed; let go and it opens again.
function BearLogo({ className }) {
  const [face, setFace] = useState('open')
  const timer = useRef(0)
  // When the eyes went shut, so a release can tell whether the floor above has
  // already been paid off.
  const shutAt = useRef(0)
  // The space bar repeats while held, and a keyup can arrive for a key we never
  // saw pressed (focus landing mid-hold), so the keyboard needs to remember
  // whether this button is the one being leaned on.
  const holdingKey = useRef(false)

  // Nothing here should outlive the sheet it was printed on -- the 404's bear in
  // particular can be pressed and then routed away from mid-blink.
  useEffect(() => () => clearTimeout(timer.current), [])

  const shut = () => {
    // A second press restarts the hold rather than queueing one, so a pending
    // re-open from the last tap cannot snap the eyes open under your finger.
    clearTimeout(timer.current)
    shutAt.current = Date.now()
    setFace('blink')
  }

  const release = () => {
    clearTimeout(timer.current)
    holdingKey.current = false
    const floor = prefersReducedMotion() ? BLINK_MS_CALM : BLINK_MS
    const held = Date.now() - shutAt.current
    if (held >= floor) setFace('open')
    else timer.current = setTimeout(() => setFace('open'), floor - held)
  }

  const onKeyDown = (event) => {
    if (event.key !== ' ' && event.key !== 'Enter') return
    // Held keys repeat; only the first one starts the hold, or the floor would
    // be re-armed thirty times a second and a tap would never pay it off.
    if (event.repeat || holdingKey.current) return
    holdingKey.current = true
    shut()
  }

  const onKeyUp = (event) => {
    if (event.key !== ' ' && event.key !== 'Enter') return
    if (holdingKey.current) release()
  }

  return (
    // A button because it is a thing to press, even though what it does is a
    // joke: that is what puts it in the tab order and answers the space bar.
    // The label says what pressing it does, not what the picture is -- the mark
    // itself is decoration the sheet's own heading already names.
    <button
      type="button"
      className="bear-blink"
      // Pointer events rather than mouse ones: one set of handlers covers the
      // finger, the pen and the mouse. Leaving and cancelling both count as
      // letting go -- dragging off the bear, or the browser taking the pointer
      // away for a scroll, must not leave the eyes shut for good.
      onPointerDown={shut}
      onPointerUp={release}
      onPointerLeave={release}
      onPointerCancel={release}
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
      // Tabbing away mid-hold never sends the keyup here, so blur is the last
      // word on whether the bear is still being held.
      onBlur={release}
      aria-label="Hold to shut the bear's eyes"
    >
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
