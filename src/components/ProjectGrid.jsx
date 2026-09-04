import ProjectCard from './ProjectCard'
import { projects } from '../data/projects'
import './ProjectGrid.css'

function ProjectGrid() {
  return (
    <section className="projects">
      <h2 className="projects__heading">Projects</h2>
      <div className="projects__grid">
        {projects.map((project) => (
          <ProjectCard key={project.slug} {...project} />
        ))}
      </div>
    </section>
  )
}

export default ProjectGrid
