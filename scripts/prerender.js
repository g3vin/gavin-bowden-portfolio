// Turns the single-page build into one real HTML file per URL.
//
// Two problems, one fix. The site is hosted on GitHub Pages, which serves files
// and nothing else: with only dist/index.html on disk, a request for
// /projects/event-pass got GitHub's own 404 page, so every deep link into the
// site — every link anyone shared, and every project URL a crawler followed —
// was broken. And a crawler that did reach index.html found an empty <div> and
// had to execute the whole app to see a word of content.
//
// So after `vite build`, this renders each route to static HTML, writes it to
// the path it is served from, and gives each page its own <head>. The client
// bundle still boots on top and takes over navigation; nothing about the app
// changes, it just is not the only way to read the page any more.
//
// Run as part of `npm run build` — see package.json.

import { mkdir, readFile, writeFile, rm } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const ssrDir = join(dist, '.ssr')

const { render, metaFor, headTags, indexableRoutes, SITE_URL } = await import(
  pathToFileURL(join(ssrDir, 'entry-server.js')).href
)

const template = await readFile(join(dist, 'index.html'), 'utf8')

// Head rewriting -------------------------------------------------------------
//
// String work on two markers this repo controls rather than a parser: the
// <title> and an <!--app-head--> comment in index.html. Every per-page tag comes
// from headTags() in seo.js -- the same list head.js applies in the browser --
// so this only has to serialise it.

const escapeText = (value) =>
  String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// An attribute is text plus the quote that would close it early.
const escapeAttr = (value) => escapeText(value).replace(/"/g, '&quot;')

const TITLE = /<title>[\s\S]*?<\/title>/
for (const marker of [TITLE, '<!--app-head-->', '<!--app-html-->']) {
  const found = typeof marker === 'string' ? template.includes(marker) : marker.test(template)
  if (!found) throw new Error(`prerender: index.html is missing ${marker}`)
}

function serialiseTag([tag, attrs, text]) {
  const attributes = Object.entries(attrs)
    .map(([name, value]) => ` ${name}="${escapeAttr(value)}"`)
    .join('')
  // JSON-LD arrives already escaped for a <script> body by headTags().
  return tag === 'script'
    ? `<script data-seo${attributes}>${text}</script>`
    : `<${tag} data-seo${attributes} />`
}

function buildPage(path) {
  const meta = metaFor(path)
  const head = headTags(meta).map(serialiseTag).join('\n    ')
  // Function replacements, so a `$&` or `$'` in the page's own text is
  // inserted as written rather than read as a replacement pattern.
  return template
    .replace(TITLE, () => `<title>${escapeText(meta.title)}</title>`)
    .replace('<!--app-head-->', () => head)
    .replace('<!--app-html-->', () => render(path))
}

// Pages ----------------------------------------------------------------------

const routes = indexableRoutes()
// Every file this build writes, as [path, contents]. Built first and written
// together below: none of the writes depend on each other.
const files = []

for (const route of routes) {
  const html = buildPage(route)

  if (route === '/') {
    files.push([join(dist, 'index.html'), html])
    continue
  }

  // Written twice, on purpose. A static host asked for /projects/event-pass
  // resolves it either from event-pass.html or from event-pass/index.html, and
  // which one it reaches for — and whether it redirects to add a trailing slash
  // on the way — is the host's business, not something worth depending on.
  // Both files exist, so both /projects/event-pass and /projects/event-pass/
  // serve the page directly, and the canonical in the head names the one
  // without the slash as the URL to index. The alternative is a 301 on every
  // project page that disagrees with that canonical.
  files.push([join(dist, `${route.slice(1)}.html`), html])
  files.push([join(dist, route.slice(1), 'index.html'), html])
}

// GitHub Pages serves 404.html for anything it cannot find, which is how a URL
// that is not a real route still reaches the app instead of GitHub's own error
// page. Rendered at a path that is deliberately not a route, so what it ships
// is the site's own 404 — and marked noindex, since a 404 body served under
// every unknown URL is exactly the soft-404 Google penalises.
files.push([join(dist, '404.html'), buildPage('/404')])

// Sitemap and robots ---------------------------------------------------------

const today = new Date().toISOString().slice(0, 10)
const sitemap =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  routes
    .map(
      (route) =>
        `  <url>\n` +
        `    <loc>${SITE_URL}${route}</loc>\n` +
        `    <lastmod>${today}</lastmod>\n` +
        `    <changefreq>monthly</changefreq>\n` +
        `    <priority>${route === '/' ? '1.0' : '0.8'}</priority>\n` +
        `  </url>`,
    )
    .join('\n') +
  `\n</urlset>\n`

files.push([join(dist, 'sitemap.xml'), sitemap])
files.push([
  join(dist, 'robots.txt'),
  `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`,
])

await Promise.all(
  files.map(async ([outPath, contents]) => {
    await mkdir(dirname(outPath), { recursive: true })
    await writeFile(outPath, contents)
  }),
)

// The SSR bundle is a build artefact, not something to deploy.
await rm(ssrDir, { recursive: true, force: true })

console.log(
  `prerendered ${routes.length} routes (${routes.length * 2 - 1} files) + 404.html, sitemap.xml, robots.txt`,
)
