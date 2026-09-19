import { memo } from 'react'
import { encodeCode128 } from '../lib/code128'

const BARCODE_HEIGHT = 40

// shapeRendering=crispEdges matters here: the modules land on fractional
// pixels once the bars scale to the paper width, and the resulting
// anti-aliasing is enough to give phone scanners trouble.
function Barcode({ value, className }) {
  // Not memoised: the memo() below already stops every render where `value` is
  // unchanged, so an encode here only ever runs on a value that is new anyway.
  const barcode = encodeCode128(value)

  return (
    <svg
      className={className}
      viewBox={`0 0 ${barcode.width} ${BARCODE_HEIGHT}`}
      preserveAspectRatio="none"
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
    >
      {barcode.bars.map((bar) => (
        <rect key={bar.x} x={bar.x} y="0" width={bar.w} height={BARCODE_HEIGHT} />
      ))}
    </svg>
  )
}

// Same reasoning as DotMatrix: a couple of hundred <rect> elements that the
// scroll handler's re-renders have no business walking.
export default memo(Barcode)
