import { useState } from 'react'
import Link from './Link'
import './ProjectCard.css'

function ProjectCard({ slug, title, description, poster, gif }) {
  const [playing, setPlaying] = useState(false)
  const src = playing && gif ? gif : poster

  return (
    <Link
      className="card"
      to={`/projects/${slug}`}
      onMouseEnter={() => setPlaying(true)}
      onMouseLeave={() => setPlaying(false)}
      onFocus={() => setPlaying(true)}
      onBlur={() => setPlaying(false)}
    >
      <div className="card__media-wrap">
        {src && <img className="card__media" src={src} alt="" loading="lazy" />}
      </div>
      <div className="card__body">
        <h3 className="card__title">{title}</h3>
        <p className="card__desc">{description}</p>
      </div>
    </Link>
  )
}

export default ProjectCard
