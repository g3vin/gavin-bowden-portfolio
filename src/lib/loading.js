// When something is actually being waited for.
//
// Nothing here draws anything; these two decide whether a reader is genuinely
// stuck looking at an empty frame, so that ../components/DotRipple.jsx can be
// laid over the media still on its way and over nothing else. Roughly ten
// megabytes of posters and clips hang off this site — two and a half of them
// in a single event-pass recording — so on a poor connection the frames are
// empty for real, and on a good one none of this is ever seen.

import { useEffect, useState } from 'react'

// A load has to outlast this before a ripple appears. Every asset on the site
// beats it on a decent connection, which is the whole intent: a placeholder
// that flickers up for eighty milliseconds reads as a fault in the page, not
// as progress. It is also short enough that anyone who is going to wait at all
// gets told so before they start wondering.
const PATIENCE_MS = 320

// The clock every hook below shares: start() arms a PATIENCE_MS timer (once),
// settle() disarms it and clears the flag, and each is bound to the target's
// named events. Returns the cleanup, plus start for callers with their own
// trigger.
function watch(target, setPending, { starts = [], settles }) {
  let timer = 0
  const start = () => {
    if (!timer) timer = setTimeout(() => setPending(true), PATIENCE_MS)
  }
  const settle = () => {
    clearTimeout(timer)
    timer = 0
    setPending(false)
  }
  for (const event of starts) target.addEventListener(event, start)
  for (const event of settles) target.addEventListener(event, settle)
  const stop = () => {
    clearTimeout(timer)
    for (const event of starts) target.removeEventListener(event, start)
    for (const event of settles) target.removeEventListener(event, settle)
  }
  return { start, stop }
}

const IMAGE_SETTLED = ['load', 'error']

// How close a lazy image has to come before it counts as being waited for.
const NEAR_VIEWPORT = '200px'

// A still image: the figures on a project page, the preview beside the
// receipt, the thumbnail a phone gets when it opens a row.
export function useSlowImage(ref, src) {
  const [pending, setPending] = useState(false)

  // Deliberately false on the server and on the first client render. The pages
  // are prerendered (see scripts/prerender.js) and a reader with JavaScript off
  // gets that HTML and nothing else — a ripple baked into it would sit on top
  // of the picture forever, since nothing would ever run to take it away.
  useEffect(() => {
    const image = ref.current
    if (!image || !src) return

    // Already decoded, from the cache or from a previous page. Nothing to wait
    // for, and nothing should flash.
    if (image.complete) return

    const watcher = watch(image, setPending, { settles: IMAGE_SETTLED })

    // These images are loading="lazy", and one far below the fold has not been
    // asked for yet: it is not slow, it is waiting its turn, and saying so
    // would be a lie told in every unread figure on the page at once. The
    // clock starts only once the image is near enough that the browser wants
    // it — which also keeps a hundred dots per figure from animating in parts
    // of the page nobody is looking at.
    // complete covers an image that landed (or failed) before it came near.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !image.complete) watcher.start()
      },
      { rootMargin: NEAR_VIEWPORT },
    )
    observer.observe(image)

    return () => {
      watcher.stop()
      observer.disconnect()
    }
  }, [ref, src])

  return pending
}

// Anything that means the clip has nothing to show and is trying to get it.
// loadstart is included because a clip is preload="none" until it scrolls into
// view and plays itself, so the first thing that happens on a slow line is a
// fetch beginning with an empty buffer behind it.
const FETCHING = ['loadstart', 'waiting', 'stalled']

// ...and anything that means it has stopped needing to. suspend is the other
// half of preload="none": the browser opens the resource, decides it was told
// not to load it, and suspends within the same tick — comfortably inside the
// patience above, so a clip sitting quietly on its poster never shows a ripple.
const SETTLED = ['suspend', 'loadeddata', 'canplay', 'playing', 'pause', 'error']

// A clip. Two different waits, one answer: the poster arriving, which is all a
// reader sees until they press play, and the clip itself buffering afterwards.
export function useSlowVideo(ref, poster) {
  const [posterPending, setPosterPending] = useState(false)
  const [bufferPending, setBufferPending] = useState(false)

  // The poster is not lazy — the browser asks for it as soon as the page is
  // laid out — but a <video> fires no event when one arrives, so it is watched
  // through an Image() of its own. Same URL, same cache entry: the browser
  // serves both from one request rather than fetching the poster twice.
  useEffect(() => {
    if (!poster) return

    const image = new Image()
    image.src = poster
    if (image.complete) return

    const watcher = watch(image, setPosterPending, { settles: IMAGE_SETTLED })
    watcher.start()
    return watcher.stop
  }, [poster])

  // Buffering. The clips start themselves as they scroll into view, so this is
  // what covers the case the poster cannot: a reader watching a frozen frame
  // with no idea whether anything is still coming.
  useEffect(() => {
    const video = ref.current
    if (!video) return

    return watch(video, setBufferPending, { starts: FETCHING, settles: SETTLED }).stop
  }, [ref])

  return posterPending || bufferPending
}
