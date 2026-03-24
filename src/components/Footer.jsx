import { FaEnvelope, FaGithub, FaArrowUp } from 'react-icons/fa'

export default function Footer() {
  return (
    <>
      <style>{`
        .footer {
          background: var(--bg);
          border-top: 1px solid rgba(22,193,114,0.08);
          padding: 40px 0;
        }
        .footer-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
        }
        .footer-logo {
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          color: #4A6B57;
        }
        .footer-logo span { color: #16C172; }
        .footer-copy {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          color: #4A6B57;
          letter-spacing: 0.06em;
        }
        .footer-links {
          display: flex;
          gap: 24px;
        }
        .footer-links a {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #4A6B57;
          transition: color 0.2s;
        }
        .footer-links a:hover { color: #16C172; }
        @media (max-width: 600px) {
          .footer-inner { flex-direction: column; align-items: flex-start; }
          .footer-inner { padding: 0 24px; }
        }
      `}</style>
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-logo">
            <span>keith</span>fbuilds.dev
          </div>
          <div className="footer-copy">
            © {new Date().getFullYear()} Keith Wilhelm Felipe — Built with Vite + React
          </div>
          <div className="footer-links">
            <a href="mailto:keithfelipe024@gmail.com" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <FaEnvelope style={{ color: '#16C172' }} /> Email
            </a>
            <a href="https://github.com/STRBRYKEIYK/" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <FaGithub style={{ color: '#16C172' }} /> GitHub
            </a>
            <a href="#about" onClick={e => { e.preventDefault(); document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }) }} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <FaArrowUp style={{ color: '#16C172' }} /> Back to Top
            </a>
          </div>
        </div>
      </footer>
    </>
  )
}