import { useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SEO from '../components/SEO'
import SignatureTitle from '../components/SignatureTitle'
import MagneticButton from '../components/MagneticButton'
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
        <div
          className="not-found-inner"
          style={{ '--misregister-offset': '9px' }}
        >
          <p className="kicker">404 · Signal lost</p>
          <SignatureTitle
            as="h1"
            className="not-found-title"
            text="L O S T"
            spacing="0.45em"
            misregisterColor="red"
          />
          <SignatureTitle
            as="p"
            className="not-found-title"
            text="off-route"
            spacing="0.1em"
            misregisterColor="cyan"
            style={{ fontSize: 'clamp(1.4rem, 4vw, 2.6rem)', fontStyle: 'italic' }}
          />
          <p className="not-found-copy">
            The page you tried to reach has moved, changed, or never existed.
            Reset to the portfolio index — or summon the command palette with{' '}
            <kbd
              style={{
                border: '1px solid var(--ink)',
                padding: '0.06rem 0.34rem',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.78em',
                background: 'var(--paper-deep)',
              }}
            >
              ⌘K
            </kbd>{' '}
            and pick a route.
          </p>
          <MagneticButton as={Link} to="/" className="project-link focus-ring">
            Back to Portfolio →
          </MagneticButton>
        </div>
      </main>

      <Footer onNavigate={handleNavigate} />
    </div>
  )
}
