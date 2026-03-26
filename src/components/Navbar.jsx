import { useEffect, useRef, useState } from 'react'
import useScrollSpy from '../hooks/useScrollSpy'

const navLinks = [
  { label: 'About', href: '#about' },
  { label: 'Skills', href: '#skills' },
  { label: 'Projects', href: '#projects' },
  { label: 'Contact', href: '#contact' },
]

const NAV_SECTION_IDS = ['about', 'skills', 'projects', 'contact']

const RESUME_FILE = 'KeithFbuilds.dev - Resume.pdf'
const RESUME_HREF = `/${encodeURIComponent(RESUME_FILE)}`

function MagneticButton({ children, href, className, download }) {
  const ref = useRef(null)

  const onMove = (e) => {
    const el = ref.current
    const rect = el.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = (e.clientX - cx) * 0.3
    const dy = (e.clientY - cy) * 0.3
    el.style.transform = `translate(${dx}px, ${dy}px)`
  }

  const onLeave = () => {
    ref.current.style.transform = 'translate(0,0)'
    ref.current.style.transition = 'transform 0.5s cubic-bezier(0.16,1,0.3,1)'
  }

  const onEnter = () => {
    ref.current.style.transition = 'transform 0.1s linear'
  }

  return (
    <a
      ref={ref}
      href={href}
      className={`${className ?? ''} focus-ring`}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onMouseEnter={onEnter}
      onClick={(e) => {
        if (!href?.startsWith('#')) return
        e.preventDefault()
        const target = document.querySelector(href)
        if (target) target.scrollIntoView({ behavior: 'smooth' })
      }}
      download={download ? true : undefined}
      target={href?.startsWith('#') ? undefined : '_blank'}
      rel={href?.startsWith('#') ? undefined : 'noreferrer'}
    >
      {children}
    </a>
  )
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const activeSection = useScrollSpy(NAV_SECTION_IDS, { referenceTopPx: 120 })
  const hamburgerRef = useRef(null)
  const MOBILE_MENU_ID = 'mobile-menu'

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 60)
    }

    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!menuOpen) {
      // Return focus to hamburger when closing the menu.
      hamburgerRef.current?.focus?.()
      return
    }

    // Move focus to the first mobile link when opening.
    const firstLink = document.querySelector(`#${MOBILE_MENU_ID} a`)
    firstLink?.focus?.()
  }, [menuOpen])

  useEffect(() => {
    if (!menuOpen) return
    const onKeyDown = (e) => {
      if (e.key !== 'Escape') return
      setMenuOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [menuOpen])

  return (
    <>
      <style>{`
        .navbar {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 1000;
          padding: 24px 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: background 0.4s ease, padding 0.4s ease, backdrop-filter 0.4s ease;
        }
        .navbar.scrolled {
          padding: 16px 40px;
          background: rgba(5,10,7,0.85);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(22,193,114,0.08);
        }
        .nav-logo {
          font-family: 'JetBrains Mono', monospace;
          font-size: 14px;
          font-weight: 500;
          color: #E8F5F0;
          letter-spacing: 0.05em;
          position: relative;
        }
        .nav-logo span {
          color: #16C172;
        }
        .nav-logo::after {
          content: '_';
          color: #16C172;
          animation: blink 1.2s step-end infinite;
        }
        .nav-links {
          display: flex;
          gap: 24px;
          list-style: none;
        }
        .nav-links li {
          display: flex;
        }
        .nav-links a {
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #7A9E8C;
          padding: 8px 16px;
          border-radius: 4px;
          position: relative;
          display: inline-block;
          transition: color 0.3s ease;
        }
        .nav-links a::before {
          content: attr(data-num);
          color: #16C172;
          margin-right: 6px;
          opacity: 0.6;
          font-size: 10px;
        }
        .nav-links a:hover,
        .nav-links a.active {
          color: #E8F5F0;
        }
        .nav-links a.active::after {
          content: '';
          position: absolute;
          bottom: 4px;
          left: 50%;
          transform: translateX(-50%);
          width: 4px;
          height: 4px;
          background: #16C172;
          border-radius: 50%;
          box-shadow: 0 0 6px #16C172;
        }
        .nav-cta {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #16C172;
          border: 1px solid rgba(22,193,114,0.4);
          padding: 10px 20px;
          border-radius: 4px;
          transition: background 0.3s ease, box-shadow 0.3s ease;
          display: inline-block;
        }
        .nav-cta:hover {
          background: rgba(22,193,114,0.08);
          box-shadow: 0 0 20px rgba(22,193,114,0.15);
        }
        .hamburger {
          display: none;
          flex-direction: column;
          gap: 5px;
          padding: 4px;
        }
        .hamburger span {
          display: block;
          width: 24px;
          height: 1.5px;
          background: #E8F5F0;
          transition: transform 0.3s ease, opacity 0.3s ease;
        }
        @media (max-width: 768px) {
          .navbar { padding: 20px 24px; }
          .navbar.scrolled { padding: 14px 24px; }
          .nav-links, .nav-cta { display: none; }
          .hamburger { display: flex; }
          .mobile-menu {
            position: fixed;
            inset: 0;
            background: rgba(5,10,7,0.97);
            backdrop-filter: blur(20px);
            z-index: 999;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 32px;
            transform: translateY(-100%);
            transition: transform 0.5s cubic-bezier(0.16,1,0.3,1);
          }
          .mobile-menu.open {
            transform: translateY(0);
          }
          .mobile-menu a {
            font-family: 'Syne', sans-serif;
            font-size: 40px;
            font-weight: 800;
            color: #E8F5F0;
            transition: color 0.2s;
          }
          .mobile-menu a:hover { color: #16C172; }
        }
      `}</style>

      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-logo">
          <span>keith</span>fbuilds.dev
        </div>

        <ul className="nav-links" style={{ display: 'flex', gap: '24px', listStyle: 'none', padding: 0, margin: 0 }}>
          {navLinks.map((link, i) => (
            <li key={link.label}>
              <a
                href={link.href}
                data-num={`0${i+1}.`}
                className={`focus-ring ${activeSection === link.href.slice(1) ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault()
                  document.querySelector(link.href)?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="nav-controls" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <MagneticButton href="#contact" className="nav-cta">
            Hire Me
          </MagneticButton>
          <MagneticButton href={RESUME_HREF} className="nav-cta" download>
            Resume
          </MagneticButton>

          <button
            ref={hamburgerRef}
            type="button"
            className="hamburger focus-ring"
            aria-controls={MOBILE_MENU_ID}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>

      <div
        className={`mobile-menu ${menuOpen ? 'open' : ''}`}
        aria-hidden={!menuOpen}
        hidden={!menuOpen}
        id={MOBILE_MENU_ID}
      >
        {navLinks.map(link => (
          <a
            key={link.label}
            href={link.href}
            className="focus-ring"
            onClick={() => {
              setMenuOpen(false)
              document.querySelector(link.href)?.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            {link.label}
          </a>
        ))}
        <a
          href={RESUME_HREF}
          download
          className="focus-ring"
          onClick={() => setMenuOpen(false)}
          rel="noreferrer"
        >
          Resume
        </a>
      </div>
    </>
  )
}