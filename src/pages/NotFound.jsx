import Link from '../components/Link'
import BearLogo from '../components/BearLogo'
import Barcode from '../components/Barcode'
import { usePath } from '../router'
import { sheetStyle } from '../lib/paper'
import { printedOn } from '../lib/today'
import '../styles/paper.css'
import './NotFound.css'


// A URL can be any length, and it prints opposite its own label in the width a
// 320px slip has left over. Roughly what fits on one line there: past this the
// path is cut rather than left to wrap into a paragraph.
function shorten(path, max = 26) {
  if (path.length <= max) return path
  return `${path.slice(0, max - 1)}…`
}

function NotFound() {
  // In the browser the router's path is the URL the reader asked for. On the
  // server it is only the /404 this page is prerendered at -- the copy GitHub
  // Pages hands back for every missing URL -- so the static slip prints
  // "Unknown" rather than a path nobody requested.
  const path = usePath()
  const requested = typeof window === 'undefined' ? null : path

  return (
    <div className="notfound">
      <div className="paper notfound__paper">
        <div className="sheet notfound__slip" style={sheetStyle('not-found', 620)}>
          <BearLogo className="slip-mark notfound__logo" />

          {/* The joke a sighted reader gets from the slip. On its own it is also
              the only thing a screen reader would have announced, and it does
              not say the page is missing — so the fact goes in the heading
              below and the joke stays above it. */}
          <p className="slip-kicker" aria-hidden="true">
            uhhhhhhh
          </p>
          <h1 className="slip-title notfound__title">Page not found</h1>

          <div className="rule rule--double" aria-hidden="true" />

          <dl className="notfound__meta">
            <div className="slip-row">
              <dt>Item</dt>
              {/* Opts out of the sheet's caps: a URL has to read exactly as it
                  was typed. */}
              <dd className="notfound__path">{requested ? shorten(requested) : 'Unknown'}</dd>
            </div>
            <div className="slip-row">
              <dt>Status</dt>
              <dd>Void</dd>
            </div>
            <div className="slip-row">
              <dt>Code</dt>
              <dd>404</dd>
            </div>
            <div className="slip-row">
              <dt>Printed</dt>
              <dd>{printedOn}</dd>
            </div>
          </dl>

          <div className="rule rule--double" aria-hidden="true" />

          <p className="notfound__note">
            That page doesn&apos;t seem to exist. The link may be wrong, or it may have been
            rung up under another name.
          </p>

          <div className="rule rule--double" aria-hidden="true" />

          <Link className="slip-dotted slip-press notfound__home" to="/">
            <span aria-hidden="true">← </span>Take me back to the home page
          </Link>

          <p className="slip-thanks">No charge. Sorry about that!</p>

          <Barcode className="slip-barcode notfound__barcode" value="VOID-404" />
          <p className="slip-code">VOID-404</p>
        </div>
      </div>
    </div>
  )
}

export default NotFound
