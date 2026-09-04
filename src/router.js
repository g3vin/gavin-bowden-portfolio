import { useSyncExternalStore } from 'react'

const listeners = new Set()

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

export function usePath() {
  return useSyncExternalStore(subscribe, getPath)
}

export function navigate(to) {
  if (to === getPath()) return
  window.history.pushState(null, '', to)
  listeners.forEach((onChange) => onChange())
  window.scrollTo(0, 0)
}
