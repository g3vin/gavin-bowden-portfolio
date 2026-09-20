// The colour a picture's own edges are, so the frame around it can be that
// colour too.
//
// A figure declared `fit: 'contain'` is a diagram, a plot or an app screenshot
// rather than a desktop capture: it keeps its own shape inside the window's
// 16/9 frame, and what is left over at the sides was painting as the Mac
// window's grey. A white plate floating in a grey window reads as a picture
// that came out wrong. Filled with the colour of the pixels the bars run
// alongside, the same picture reads as one that fills the window.
//
// The colour is read off the picture itself rather than written beside it in
// ../data/projects.js, so a picture that gets swapped or recropped brings its
// own background with it and nothing has to be kept in step by hand.

import { useEffect, useState } from 'react'

// How many points along an edge are read. Enough to catch a chart axis, a
// heading rule or a drop shadow reaching the border; few enough that the whole
// measurement is a single small canvas.
const SAMPLES = 16

// How far a sample may sit from the middle of its edge, per channel, and still
// count as the same colour. A JPEG's ringing moves a flat white by two or
// three on its own, so the tolerance is above that and well below any real
// content.
const TOLERANCE = 8

// And how many of the samples have to agree before the edge counts as one
// colour. Not all of them: a screenshot of an app window carries a highlight
// along its top pixel row and a slightly darker one at the bottom, which is
// one sample out of sixteen each and not what the bar beside it should be. A
// chart axis or a photograph running out to the border misses this by a mile.
const AGREEMENT = 0.75

// Two edges this close are the same colour to a reader, and one flat fill
// beats a seam drawn down the middle of the frame.
const SAME = 3

// The one colour a run of samples is, or null if it is not one colour at all:
// something in the picture reaches its own edge there, and no single fill
// beside it would be right.
//
// The middle sample per channel rather than the average, so the odd bright row
// at the top of a screenshot neither decides the colour nor disqualifies it —
// it is simply outvoted.
function edgeColour(data) {
  const channels = [[], [], []]

  for (let i = 0; i < data.length; i += 4) {
    // A picture that is transparent at its edge has nothing to match: the page
    // already shows through it, which is what the frame would be painting.
    if (data[i + 3] !== 255) return null
    for (let channel = 0; channel < 3; channel += 1) {
      channels[channel].push(data[i + channel])
    }
  }

  const middle = channels.map((values) => {
    const sorted = [...values].sort((a, b) => a - b)
    return sorted[sorted.length >> 1]
  })

  const samples = channels[0].length
  let agreed = 0
  for (let sample = 0; sample < samples; sample += 1) {
    const matches = middle.every(
      (value, channel) => Math.abs(channels[channel][sample] - value) <= TOLERANCE,
    )
    if (matches) agreed += 1
  }

  return agreed >= samples * AGREEMENT ? middle : null
}

// One edge of the picture, squeezed to SAMPLES pixels: the outermost column or
// row, scaled down by the browser rather than walked over a pixel at a time.
function readEdge(image, side) {
  const width = image.naturalWidth
  const height = image.naturalHeight
  const vertical = side === 'left' || side === 'right'

  const canvas = document.createElement('canvas')
  canvas.width = vertical ? 1 : SAMPLES
  canvas.height = vertical ? SAMPLES : 1
  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) return null

  context.drawImage(
    image,
    side === 'right' ? width - 1 : 0,
    side === 'bottom' ? height - 1 : 0,
    vertical ? 1 : width,
    vertical ? height : 1,
    0,
    0,
    canvas.width,
    canvas.height,
  )

  try {
    return edgeColour(context.getImageData(0, 0, canvas.width, canvas.height).data)
  } catch {
    // A picture served from another origin taints the canvas and getImageData
    // throws. Every figure here is our own, but a frame with no fill is the
    // old behaviour rather than a broken page.
    return null
  }
}

const css = ([red, green, blue]) => `rgb(${red} ${green} ${blue})`

const near = (one, other) =>
  one.every((value, channel) => Math.abs(value - other[channel]) <= SAME)

// What the frame should paint behind this picture, or null to leave it alone:
// the picture already fills the frame, or its edges are busy enough that any
// one colour beside them would be a guess.
function readFill(image) {
  const boxWidth = image.clientWidth
  const boxHeight = image.clientHeight
  if (!boxWidth || !boxHeight) return null
  if (!image.naturalWidth || !image.naturalHeight) return null

  // Which way round the picture falls short of the frame, and by enough to
  // leave a bar worth filling — under a per cent is a rounding error.
  const short = image.naturalWidth / image.naturalHeight / (boxWidth / boxHeight)
  if (short > 0.99 && short < 1.01) return null

  const pillarboxed = short < 1
  const sides = pillarboxed ? ['left', 'right'] : ['top', 'bottom']
  const [first, second] = sides.map((side) => readEdge(image, side))
  if (!first || !second) return null
  if (near(first, second)) return css(first)

  // The two edges differ — the light side of an app window against its shadowed
  // side, say. Each bar takes the colour of the edge it runs alongside, and the
  // hard stop between them falls under the middle of the picture, which covers
  // it: the picture is centred, so the bars are the same width.
  return `linear-gradient(to ${pillarboxed ? 'right' : 'bottom'}, ${css(first)} 50%, ${css(second)} 50%)`
}

// Nothing on the server and nothing on the first client render, like the
// loading hooks next door: the pages are prerendered, and a reader with no
// JavaScript gets the frames exactly as they were before any of this.
export function useEdgeFill(ref, src, enabled) {
  const [fill, setFill] = useState(null)

  useEffect(() => {
    const image = ref.current
    if (!enabled || !image || !src) {
      setFill(null)
      return undefined
    }

    let live = true
    // naturalWidth is 0 on a picture that failed, so readFill answers null and
    // the alt text sits on the plain frame.
    const read = () => {
      if (live) setFill(readFill(image))
    }

    if (image.complete) {
      read()
      return () => {
        live = false
      }
    }

    setFill(null)
    image.addEventListener('load', read, { once: true })
    return () => {
      live = false
      image.removeEventListener('load', read)
    }
  }, [ref, src, enabled])

  return fill
}
