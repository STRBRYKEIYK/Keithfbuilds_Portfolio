import useRevealOnScroll from '../hooks/useRevealOnScroll'

const RESUME_FILE = 'KeithFbuilds.dev - Resume.pdf'
const RESUME_HREF = `/${encodeURIComponent(RESUME_FILE)}`

const jumpTo = (event, id) => {
  event.preventDefault()
  document.getElementById(id)?.scrollIntoView({
    behavior: 'smooth',
    inline: 'start',
    block: 'nearest',
  })
}

export default function Hero() {
  const sectionRef = useRevealOnScroll({ threshold: 0.2, staggerMs: 110 })

  return (
    <section id="hero" className="portfolio-panel hero-panel" ref={sectionRef}>
      <div className="panel-inner hero-grid">
        <div>
          <p className="kicker reveal" data-reveal>
            Full-Stack Developer • Antipolo, Rizal PH • Remote Ready
          </p>

          <h1 className="hero-title reveal" data-reveal>
            Building enterprise web systems teams can trust every day.
          </h1>

          <p className="panel-copy reveal" data-reveal>
            BSIT graduate focused on React + TypeScript applications for operations, procurement,
            payroll, and document automation. I build fast interfaces backed by reliable business
            logic.
          </p>

          <div className="hero-actions reveal" data-reveal>
            <a href="#projects" className="btn btn-primary focus-ring" onClick={(event) => jumpTo(event, 'projects')}>
              View Selected Work
            </a>
            <a href="#contact" className="btn btn-ghost focus-ring" onClick={(event) => jumpTo(event, 'contact')}>
              Start a Conversation
            </a>
            <a href={RESUME_HREF} download className="btn btn-subtle focus-ring">
              Download Resume
            </a>
          </div>
        </div>

        <aside className="hero-card reveal" data-reveal>
          <h2>Resume Snapshot</h2>

          <ul className="resume-list">
            <li>
              <span>Primary Stack</span>
              <strong>React 18 + TypeScript + Tailwind</strong>
            </li>
            <li>
              <span>Domain Strength</span>
              <strong>POS, Procurement, Finance, Automation</strong>
            </li>
            <li>
              <span>Delivery Focus</span>
              <strong>Real-time workflows and data integrity</strong>
            </li>
          </ul>

          <div className="hero-contact-mini">
            <a href="mailto:keithfelipe024@gmail.com" className="focus-ring">
              keithfelipe024@gmail.com
            </a>
            <a href="tel:+639216054768" className="focus-ring">
              +63 921 605 4768
            </a>
            <a href="https://github.com/STRBRYKEIYK" target="_blank" rel="noreferrer" className="focus-ring">
              github.com/STRBRYKEIYK
            </a>
          </div>
        </aside>

        <figure className="hero-art-frame reveal" data-reveal>
          <img
            src="/images/art.png"
            alt="Stylized landscape artwork with mountains and sunset tones"
            className="hero-art-image"
            width="1024"
            height="197"
            loading="eager"
            decoding="async"
          />
        </figure>
      </div>
    </section>
  )
}
