import { AUTHOR } from '../lib/seo'
import './Footer.css'

function Footer() {
  return (
    <footer className="footer">
      <small>
        &copy; {new Date().getFullYear()} {AUTHOR}
      </small>
    </footer>
  )
}

export default Footer
