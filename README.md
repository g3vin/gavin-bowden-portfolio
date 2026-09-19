# Gavin Bowden Portfolio

My portfolio site, made with React and Vite.

## Getting Started

```bash
npm install
npm run dev
```

## Scripts

- `npm run dev` – start dev server
- `npm run build` – build for production, then prerender every route (see below)
- `npm run preview` – preview production build
- `npm run lint` – run linter

## Build output

`npm run build` runs three steps: the normal Vite build, a second Vite build of
`src/entry-server.jsx` into `dist/.ssr`, and then `scripts/prerender.js`, which
renders each route to static HTML and deletes the SSR bundle.

That matters because the site is hosted on GitHub Pages, which only serves
files. Without it there is one `index.html` on disk, so every project URL is a
404 for anyone following a link, and a crawler that does reach the site finds an
empty `<div>`. After it, each route exists as a real page with its own title,
description, canonical, Open Graph tags and JSON-LD, plus `404.html`,
`sitemap.xml` and `robots.txt`.

Adding a project needs nothing here — routes come from `src/data/projects.js`
via `indexableRoutes()` in `src/lib/seo.js`. Adding a *tag* to `index.html` does:
`scripts/prerender.js` rewrites tags it knows by name, and anything it does not
know about ships the home page's version of itself on every page.

The client still boots on top and takes over navigation. It re-renders rather
than hydrating — `src/main.jsx` says why.

## Accessibility notes

Things that will quietly break if the surrounding code changes:

- The receipt prints in caps via `text-transform`, and Chrome folds that into
  the accessible name it computes from an element's text. Anything whose name
  matters — the contact rows, the project rows, the outbound links — carries an
  explicit `aria-label` in normal case, and `.visually-hidden` opts out of the
  transform.
- `src/App.jsx` moves focus to `<main>` and announces the new title on every
  route change, including back and forward. A client-side navigation is
  otherwise completely silent to a screen reader. That is what `<main>`'s
  `tabindex="-1"` is for — there is no skip link, because the header above it is
  a single link and there is no repeated block to bypass.
- The compact layout turns each project row into a disclosure button, so the
  only link to a project at that width lives in the revealed panel. That panel
  is rendered at every width and merely `hidden`, which keeps the link in the
  DOM for a crawler rendering at a phone viewport.
- The home page's preview panel is `aria-hidden` decoration that repeats the
  row beside it, so it carries no heading, no alt text and nothing focusable.
- Videos autoplay on scroll, except under `prefers-reduced-motion: reduce`.
- Under `prefers-reduced-motion: reduce` the preview's title appears whole
  instead of typing, nothing fades in, and the paper does not slide.

## The home page preview

`src/styles/paper.css` is the receipt. Beside it, `src/components/ProjectPreview.jsx`
is deliberately not paper: a big sans-serif title that types in, the description
under it, then the project's `poster`. The same card appears inside the
compact layout's tap-to-reveal.

Two sequences are mirror images of each other, split across
`ReceiptIndex.css`'s `.receipt-paper` and `.receipt-preview`: opening, the paper
slides left and the title starts typing `--preview-in` (0.3s, `ENTER_DELAY_MS`
in `ReceiptIndex.jsx`) later; closing, the card fades out before the paper
starts back to centre.

## Project data (`src/data/projects.js`)

`poster` is the picture the home page's preview card shows. A project without
one shows just its title and description.

`blocks` drives the detail page top to bottom. These are the types:

- `{ type: 'heading', text }`
- `{ type: 'text', text }`
- `{ type: 'list', items: [] }`
- `{ type: 'image', src, alt, caption? }`
- `{ type: 'gallery', images: [{ src, alt, caption? }] }`
- `{ type: 'video', src, poster?, ratio?, caption? }` — muted, looping clip; `ratio` (like `'1280 / 740'`) shapes the frame to a specific clip size.
