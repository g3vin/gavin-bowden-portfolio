import { useEffect, useMemo, useRef } from 'react'
import Home from './pages/Home'
import ProjectPage from './pages/ProjectPage'
import NotFound from './pages/NotFound'
import Footer from './components/Footer'
import SiteTitle from './components/SiteTitle'
import { isProjectPath, routeFor } from './data/projects'
import { usePath } from './router'
import { metaFor } from './lib/seo'
import { applyMeta } from './lib/head'

function Page({ path }) {
  const route = routeFor(path)
  if (route.page === 'home') return <Home />
  // Keyed on the slug so Next-project remounts the page rather than re-using
  // it. Without the key React keeps the same DOM nodes and only swaps the text,
  // and a CSS entry animation runs when its element is CREATED -- so the head's
  // summary and details slip stayed at the end of a sequence that had already
  // played, while the title (JS-driven, and keyed on its own text) retyped
  // beside them. navigate() already puts the new page at the top, so nothing
  // depends on the old nodes surviving.
  if (route.page === 'project')
    return <ProjectPage key={route.project.slug} project={route.project} />
  return <NotFound />
}

function App() {
  const path = usePath()
  const isProjectPage = isProjectPath(path)
  // Memoised on the path, not rebuilt each render: metaFor assembles a whole
  // JSON-LD graph, and a fresh object every render is also a fresh dependency
  // for the effect below — which would rewrite every meta tag in the head, and
  // re-serialise that graph into the DOM, on renders that changed no metadata.
  const meta = useMemo(() => metaFor(path), [path])

  const mainRef = useRef(null)
  // Announced after the route changes. Held in a ref-fed live region rather
  // than rendered from state, because a live region that mounts with its text
  // already in it is not announced — the text has to arrive after it exists.
  const announcerRef = useRef(null)

  // The path whose metadata is in the head. Undefined until the first effect
  // decides whether the head arrived correct already.
  const appliedPath = useRef(undefined)

  useEffect(() => {
    // A prerendered page already carries the right <head> for the URL that was
    // loaded, so applying it again on mount would re-create every tag
    // identically and re-serialise the whole JSON-LD graph for nothing. Decided
    // by the prerender's own data-seo tags rather than assumed, so `npm run
    // dev` -- which serves the bare index.html template -- still gets a head.
    if (appliedPath.current === undefined && document.head.querySelector('[data-seo]')) {
      appliedPath.current = path
    }
    // Compared by path rather than a first-render flag, for the same reason the
    // announcer below is: StrictMode runs every effect twice on mount.
    if (appliedPath.current === path) return
    appliedPath.current = path
    applyMeta(meta)
  }, [path, meta])

  // The path this component last announced. Compared rather than a
  // first-render flag, because StrictMode runs every effect twice on mount and
  // a flag would announce a navigation that never happened.
  const announcedPath = useRef(path)

  useEffect(() => {
    // A client-side navigation changes the whole page without moving focus or
    // making a sound, so a screen reader would simply keep reading the old one.
    // This covers the back and forward buttons as well as a link: a popstate is
    // just as silent as a pushState, and the browser announces neither.
    if (announcedPath.current === path) return
    announcedPath.current = path

    // preventScroll, because where the page should be sitting is already
    // decided elsewhere — navigate() puts a new page at the top, and the
    // browser restores the old position on back. Focusing without this would
    // overrule both.
    mainRef.current?.focus({ preventScroll: true })

    const announcer = announcerRef.current
    if (!announcer) return
    announcer.textContent = ''
    // A frame's delay: the region has to be seen empty before the new text
    // lands in it, or assistive tech treats the change as initial content.
    const frame = requestAnimationFrame(() => {
      announcer.textContent = `${meta.title}. Navigated.`
    })
    return () => cancelAnimationFrame(frame)
  }, [path, meta.title])

  return (
    <>
      <SiteTitle isHome={path === '/'} isProjectPage={isProjectPage} />

      {/* tabIndex -1 so the route-change handler above can put focus here.
          It is not in the tab order: -1 is programmatic focus only. */}
      <main ref={mainRef} tabIndex={-1}>
        <Page path={path} />
      </main>

      <Footer />

      <div
        ref={announcerRef}
        className="visually-hidden"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      />
    </>
  )
}

export default App
