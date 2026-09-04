import { useEffect } from 'react'
import ContentBlocks from '../components/ContentBlocks'
import './ProjectPage.css'

function ProjectPage({ project }) {
  const { title, summary, year, role, stack, links, blocks } = project

  useEffect(() => {
    document.title = `${title} · Gavin Bowden`
    return () => {
      document.title = 'Gavin Bowden'
    }
  }, [title])

  return (
    <article className="project">
      <h1 className="project__title">{title}</h1>
      <p className="project__summary">{summary}</p>

      <dl className="project__meta">
        <div>
          <dt>Year</dt>
          <dd>{year}</dd>
        </div>
        <div>
          <dt>Role</dt>
          <dd>{role}</dd>
        </div>
        <div>
          <dt>Stack</dt>
          <dd>{stack.join(' · ')}</dd>
        </div>
      </dl>

      {links.length > 0 && (
        <div className="project__links">
          {links.map((link) => (
            <a key={link.href} href={link.href} target="_blank" rel="noreferrer">
              {link.label} ↗
            </a>
          ))}
        </div>
      )}

      <ContentBlocks blocks={blocks} />
    </article>
  )
}

export default ProjectPage
