import Home from './pages/Home'
import ProjectPage from './pages/ProjectPage'
import NotFound from './pages/NotFound'
import Footer from './components/Footer'
import { getProject } from './data/projects'
import { usePath } from './router'

function Page({ path }) {
  if (path === '/') return <Home />

  const match = path.match(/^\/projects\/([^/]+)\/?$/)
  const project = match && getProject(match[1])
  if (project) return <ProjectPage project={project} />

  return <NotFound />
}

function App() {
  const path = usePath()

  return (
    <>
      <Page path={path} />
      <Footer />
    </>
  )
}

export default App
