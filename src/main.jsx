import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// createRoot, not hydrateRoot, even though #root arrives with the page already
// rendered into it by scripts/prerender.js. Two things in this app are decided
// by the browser and cannot be known at build time — the compact layout, which
// drops the preview panel and prints an arrow on each project row, and the
// "printed" date on the receipt — so hydration would mismatch on every visit.
// The prerendered HTML is there for crawlers, link unfurlers and a no-JS
// reader; React replaces it with the identical tree as soon as it boots.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
