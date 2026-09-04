import ProjectGrid from '../components/ProjectGrid'
import flashAscii from '../assets/cat.txt?raw'
import './Home.css'

const art = flashAscii.replace(/^\n+|\s+$/g, '')

function Home() {
  return (
    <>
      <header className="hero">
        <div className="hero-copy">
          <h2>Hi, I'm</h2>
          <h1>Gavin Bowden</h1>

          <h2>I build software and ML systems. Recently at NASA Langley.</h2>
          <h3>Hampton Roads, VA · open to onsite · US citizen</h3>

          <div>
            <button onClick={() => window.open('https://github.com/g3vin', '_blank')}>Github</button>
            <button onClick={() => window.open('https://www.linkedin.com/in/g3vin/', '_blank')}>LinkedIn</button>
            <button onClick={() => window.open('/resume.pdf', '_blank')}>Résumé</button>
            <button onClick={() => window.open('mailto:hello@gavinbowden.me', '_blank')}>Email</button>
          </div>
        </div>

        <pre className="hero-ascii" aria-hidden="true">{art}</pre>
      </header>

      <ProjectGrid />
    </>
  )
}

export default Home
