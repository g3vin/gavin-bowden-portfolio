import { useSyncExternalStore } from 'react'

const listeners = new Set()

// The path the prerender script is currently rendering. There is no
// window.location in Node, so useSyncExternalStore needs somewhere else to read
// the route from while the static HTML for each page is being written.
let ssrPath = '/'

export function setServerPath(path) {
  ssrPath = path
}

function subscribe(onChange) {
  listeners.add(onChange)
  window.addEventListener('popstate', onChange)
  return () => {
    listeners.delete(onChange)
    window.removeEventListener('popstate', onChange)
  }
}

function getPath() {
  return window.location.pathname
}

function getServerPath() {
  return ssrPath
}

export function usePath() {
  return useSyncExternalStore(subscribe, getPath, getServerPath)
}

export function navigate(to) {
  if (to === getPath()) return
  window.history.pushState(null, '', to)
  listeners.forEach((onChange) => onChange())
  // Instant, and never smoothed: this is a page change, not a scroll the
  // reader asked for, so animating it only delays the new page.
  window.scrollTo(0, 0)
}
