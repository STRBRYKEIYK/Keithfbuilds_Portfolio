import { useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SEO from '../components/SEO'
import SignatureTitle from '../components/SignatureTitle'
import useLenis from '../hooks/useLenis'

export default function NotFound() {
  const navigate = useNavigate()
  useLenis()

  const handleNavigate = useCallback(
    (id) => {
      navigate(`/#${id}`)
    },
    [navigate]
  )

  return (
    <div className="portfolio-shell">
      <SEO
        title="Page not found"
        description="The page you tried to reach has moved or never existed."
        noindex
      />

      <Navbar onNavigate={handleNavigate} />

      <main id="main-content" className="not-found-page" aria-label="Page not found">
        <div className="not-found-inner">
          <p className="kicker">404</p>
          <SignatureTitle
            as="h1"
            className="not-found-title"
            text="Lost the thread."
            spacing="0.16em"
          />
          <p className="not-found-copy">
            The page you tried to reach has either moved, been renamed, or never existed.
            No harm done — head back to the portfolio.
          </p>
          <Link to="/" className="project-link focus-ring">
            Back to Portfolio
          </Link>
        </div>
      </main>

      <Footer onNavigate={handleNavigate} />
    </div>
  )
}
