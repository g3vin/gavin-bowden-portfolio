# Gavin Bowden Portfolio

My portfolio site, made with React and Vite.

## Getting Started

```bash
npm install
npm run dev
```

## Scripts

- `npm run dev` – start dev server
- `npm run build` – build for production
- `npm run preview` – preview production build
- `npm run lint` – run linter

## Project data (`src/data/projects.js`)

For the project tile, `poster` is the still shown (a gif's first
frame), `gif` is loaded only on hover.

`blocks` drives the detail page top to bottom. These are the types:

- `{ type: 'heading', text }`
- `{ type: 'text', text }`
- `{ type: 'list', items: [] }`
- `{ type: 'image', src, alt, caption? }`
- `{ type: 'gallery', images: [{ src, alt, caption? }] }`
- `{ type: 'video', src, poster?, ratio?, caption? }` — muted, looping clip; `ratio` (like `'1280 / 740'`) shapes the frame to a specific clip size.
