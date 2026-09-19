import { useCallback, useEffect, useLayoutEffect, useSyncExternalStore } from 'react'

// A layout effect in the browser, a plain (never-run) effect on the server,
// where React would otherwise warn that a layout effect does nothing.
export const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

// One MediaQueryList per query, reused by every reader instead of rebuilt on
// each render and store check.
const lists = new Map()
function mediaList(query) {
  let list = lists.get(query)
  if (!list) lists.set(query, (list = window.matchMedia(query)))
  return list
}

// Whether the reader has asked for less motion. Read at the moment of use --
// from an effect or a handler -- so it always reflects the current setting.
export const prefersReducedMotion = () => mediaList('(prefers-reduced-motion: reduce)').matches

// Whether a media query matches, kept current as it changes. False on the
// server, where there is no viewport to ask.
export function useMediaQuery(query) {
  const subscribe = useCallback(
    (onChange) => {
      const mq = mediaList(query)
      mq.addEventListener('change', onChange)
      return () => mq.removeEventListener('change', onChange)
    },
    [query],
  )
  return useSyncExternalStore(
    subscribe,
    () => mediaList(query).matches,
    () => false,
  )
}
