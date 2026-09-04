import Link from './Link'
import './SiteTitle.css'

function SiteTitle({ children }) {
  return (
    <div className="site-title">
      <Link to="/">
        <h3>gavinbowden.me</h3>
      </Link>
      {children}
    </div>
  )
}

export default SiteTitle
