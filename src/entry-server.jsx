// The build-time entry. Vite bundles this separately (`vite build --ssr`) so
// that Node can import the app without having to parse JSX or CSS itself;
// scripts/prerender.js then calls render() once per route.

import { renderToStaticMarkup } from 'react-dom/server'
import App from './App'
import { setServerPath } from './router'

export { metaFor, headTags, indexableRoutes, SITE_URL } from './lib/seo'

export function render(path) {
  setServerPath(path)
  // Static, not renderToString: the client re-renders from scratch rather than
  // hydrating (see main.jsx), so the hydration markers would be dead weight in
  // every page's HTML.
  return renderToStaticMarkup(<App />)
}
