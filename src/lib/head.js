// Client-side half of the metadata story. The prerendered HTML already carries
// the right <head> for whichever URL was loaded; this keeps it correct after a
// client-side navigation, so a tab title, a canonical, or a link someone copies
// mid-visit still describes the page they are actually on.

import { headTags } from './seo'

export function applyMeta(meta) {
  document.title = meta.title

  // Replaced wholesale rather than patched: every per-page tag carries
  // data-seo, both in the prerendered HTML and here, so a tag the new page does
  // not have -- a canonical, a robots hint, a stale JSON-LD graph -- goes too.
  document.head.querySelectorAll('[data-seo]').forEach((el) => el.remove())
  for (const [tag, attrs, text] of headTags(meta)) {
    const el = document.createElement(tag)
    el.dataset.seo = ''
    for (const [name, value] of Object.entries(attrs)) el.setAttribute(name, value)
    if (text) el.textContent = text
    document.head.appendChild(el)
  }
}
