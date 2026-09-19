import Link from './Link'
import { SITE_HOST } from '../lib/seo'
import './SiteTitle.css'

// The masthead. Deliberately not a heading: it sits above the <h1> on every
// page, and an <h3> here would put the document's first heading at level 3 and
// then jump back up to 1 — which is exactly the outline a screen reader reads
// out when someone asks it for the page's headings.
//
// The back arrow is positioned out of flow (see SiteTitle.css) so it never
// shifts where "gavinbowden.me" itself sits — the name stays centred on every
// page, project pages included.
function SiteTitle({ isHome, isProjectPage }) {
  return (
    <header className="site-title">
      <Link
        to="/"
        aria-current={isHome ? 'page' : undefined}
        className="site-title__link"
      >
        {isProjectPage && (
          <span className="site-title__back" aria-hidden="true">
            ←
          </span>
        )}
        <span className="site-title__name">{SITE_HOST}</span>
        <span className="visually-hidden"> — home</span>
      </Link>
    </header>
  )
}

export default SiteTitle
