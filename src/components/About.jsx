import useRevealOnScroll from '../hooks/useRevealOnScroll'
import { FaBolt, FaBuilding, FaBullseye, FaGlobe } from 'react-icons/fa'

export default function About() {
  const sectionRef = useRevealOnScroll({ threshold: 0.15, staggerMs: 120 })

  // Use react-icons for all trait icons
  const traits = [
    { icon: <FaBolt />, label: 'Real-time Systems', desc: 'WebSocket & Socket.IO expert' },
    { icon: <FaBuilding />, label: 'Enterprise Scale', desc: 'Complex workflow architecture' },
    { icon: <FaBullseye />, label: 'TypeScript First', desc: 'Type-safe React development' },
    { icon: <FaGlobe />, label: 'Remote Native', desc: 'Built for distributed teams' },
  ]

  return (
    <>
      <style>{`
        .about {
          padding: 140px 0;
          background: var(--bg);
          overflow: hidden;
        }
        .about-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 40px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 100px;
          align-items: center;
        }
        .about-left {}
        .about-section-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #16C172;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .about-section-label::before {
          content: '';
          display: block;
          width: 24px;
          height: 1px;
          background: #16C172;
        }
        .about-heading {
          font-size: clamp(36px, 4vw, 56px);
          color: #E8F5F0;
          margin-bottom: 32px;
          line-height: 1.05;
        }
        .about-heading em {
          color: #16C172;
          font-style: normal;
        }
        .about-bio {
          font-size: 16px;
          color: #7A9E8C;
          font-weight: 300;
          line-height: 1.8;
          margin-bottom: 16px;
        }
        .about-bio strong {
          color: #E8F5F0;
          font-weight: 500;
        }
        .about-links {
          display: flex;
          gap: 16px;
          margin-top: 40px;
          flex-wrap: wrap;
        }
        .about-link {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.08em;
          color: #7A9E8C;
          text-transform: uppercase;
          transition: color 0.2s;
          padding-bottom: 4px;
          border-bottom: 1px solid rgba(122,158,140,0.3);
        }
        .about-link:hover {
          color: #16C172;
          border-bottom-color: rgba(22,193,114,0.5);
        }
        .about-right {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .trait-card {
          background: var(--bg-card);
          border: 1px solid rgba(22,193,114,0.08);
          border-radius: 8px;
          padding: 24px;
          display: flex;
          gap: 20px;
          align-items: flex-start;
          transition: border-color 0.3s, transform 0.3s, box-shadow 0.3s;
          position: relative;
          overflow: hidden;
        }
        .trait-card::before {
          content: '';
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 2px;
          background: #16C172;
          transform: scaleY(0);
          transition: transform 0.3s ease;
          transform-origin: bottom;
        }
        .trait-card:hover {
          border-color: rgba(22,193,114,0.2);
          transform: translateX(8px);
          box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        }
        .trait-card:hover::before {
          transform: scaleY(1);
        }
        .trait-icon {
          font-size: 24px;
          flex-shrink: 0;
          margin-top: 2px;
        }
        .trait-label {
          font-family: 'Syne', sans-serif;
          font-size: 15px;
          font-weight: 700;
          color: #E8F5F0;
          margin-bottom: 4px;
        }
        .trait-desc {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          color: #4A6B57;
          letter-spacing: 0.05em;
        }
        .code-tag {
          display: inline-block;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          color: #16C172;
          background: rgba(22,193,114,0.08);
          padding: 4px 10px;
          border-radius: 3px;
          margin: 4px 4px 0 0;
        }
        @media (max-width: 900px) {
          .about-inner {
            grid-template-columns: 1fr;
            gap: 60px;
          }
        }
        @media (max-width: 768px) {
          .about { padding: 100px 0; }
          .about-inner { padding: 0 24px; }
        }
      `}</style>

      <section id="about" className="about" ref={sectionRef}>
        <div className="about-inner">
          <div className="about-left">
            <div className="about-section-label reveal" data-reveal>
              Who I Am
            </div>
            <h2 className="about-heading reveal" data-reveal>
              Building systems<br />
              that <em>actually work</em>
            </h2>
            <p className="about-bio reveal" data-reveal>
              I'm a <strong>BSIT graduate from the Philippines</strong> with hands-on experience building enterprise-grade web applications. My focus is on <strong>React + TypeScript ecosystems</strong> — real-time inventory systems, procurement platforms, and financial management tools.
            </p>
            <p className="about-bio reveal" data-reveal>
              Every system I've built handles <strong>complex business logic</strong> — multi-step approval workflows, live WebSocket synchronization, barcode integrations, and audit-compliant financial operations. Not just pretty UIs — actual <strong>business-critical infrastructure</strong>.
            </p>

            <div className="reveal" data-reveal>
              <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: '24px', gap: '4px' }}>
                {['keithfbuilds.dev', 'Antipolo, Rizal PH', '+63 921 605 4768', 'Remote / WFH'].map(tag => (
                  <span key={tag} className="code-tag">{tag}</span>
                ))}
              </div>
            </div>

            <div className="about-links reveal" data-reveal>
              <a className="about-link" href="https://github.com/STRBRYKEIYK" target="_blank" rel="noreferrer">
                ↗ GitHub
              </a>
              <a className="about-link" href="mailto:keithfelipe024@gmail.com">
                ↗ Email Me
              </a>
              <a className="about-link" href="https://keithfbuilds.dev" target="_blank" rel="noreferrer">
                ↗ keithfbuilds.dev
              </a>
            </div>
          </div>

          <div className="about-right">
            {traits.map((trait, i) => (
              <div key={trait.label} className="trait-card reveal" data-reveal style={{ transitionDelay: `${i * 80}ms` }}>
                <div className="trait-icon">{trait.icon}</div>
                <div>
                  <div className="trait-label">{trait.label}</div>
                  <div className="trait-desc">{trait.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}