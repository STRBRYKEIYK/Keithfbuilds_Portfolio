import { useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SEO from '../components/SEO'
import CaseLayout from '../components/CaseLayout'
import useLenis from '../hooks/useLenis'
import { getProjectBySlug, getNextProject } from '../content/projects/index.js'
import NotFound from './NotFound.jsx'

export default function Project() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const project = getProjectBySlug(slug)

  useLenis()

  const handleNavigate = useCallback(
    (id) => {
      navigate(`/#${id}`)
    },
    [navigate]
  )

  if (!project) return <NotFound />

  const nextProject = getNextProject(project.slug)
  const caseDescription = `${project.impact} — ${project.subtitle}. ${project.desc}`.slice(0, 200)

  return (
    <div className="portfolio-shell">
      <SEO
        title={`${project.title} — ${project.subtitle}`}
        description={caseDescription}
        image={project.ogImage}
        path={`/project/${project.slug}`}
        type="article"
      />

      <Navbar onNavigate={handleNavigate} />

      <main
        id="main-content"
        className="case-page"
        aria-label={`${project.title} case study`}
      >
        <CaseLayout project={project} nextProject={nextProject} />
      </main>

      <Footer onNavigate={handleNavigate} />
    </div>
  )
}
