export default function Footer({ onNavigate }) {
  const backToStart = (event) => {
    event.preventDefault()
    onNavigate?.('hero')
  }

  return (
    <footer className="site-footer">
      <div>
        <strong>Keith Wilhelm Felipe</strong>
        <span>Full-Stack Developer</span>
      </div>

      <p>© {new Date().getFullYear()} Built with React + Vite</p>

      <div className="footer-links">
        <a href="mailto:keithfelipe024@gmail.com" className="focus-ring">
          Email
        </a>
        <a href="https://github.com/STRBRYKEIYK" target="_blank" rel="noreferrer" className="focus-ring">
          GitHub
        </a>
        <a href="#hero" onClick={backToStart} className="focus-ring">
          Back to Start
        </a>
      </div>
    </footer>
  )
}
