import Link from './Link'
import './SiteTitle.css'

function SiteTitle() {
  return (
    <div className="site-title">
      <Link to="/">
        <h3>gavinbowden.me</h3>
      </Link>
    </div>
  )
}

export default SiteTitle
