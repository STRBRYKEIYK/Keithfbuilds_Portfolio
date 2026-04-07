import useRevealOnScroll from '../hooks/useRevealOnScroll'

const SKILL_METERS = [
  { name: 'React 18', level: 95 },
  { name: 'TypeScript', level: 88 },
  { name: 'Tailwind CSS', level: 92 },
  { name: 'REST API Integration', level: 90 },
  { name: 'WebSocket / Socket.IO', level: 85 },
  { name: 'Node.js', level: 78 },
  { name: 'PWA / Offline-First', level: 82 },
  { name: 'Git / GitHub', level: 90 },
]

const SPECIALIZATIONS = [
  {
    title: 'POS and Inventory Systems',
    stat: '1,000+ SKUs',
    summary:
      'Point-of-sale interfaces with stock validation, barcode workflows, and offline reliability for day-to-day operations.',
  },
  {
    title: 'Procurement and Supply Chain',
    stat: 'End-to-End',
    summary:
      'Supplier management, purchase order pipelines, and inventory transfer flows with clear process visibility.',
  },
  {
    title: 'Financial Management Platforms',
    stat: 'Multi-Level',
    summary:
      'Voucher and payroll modules designed for traceability, approvals, and analytics-driven decision support.',
  },
  {
    title: 'Document Automation Services',
    stat: 'Multi-Provider OCR',
    summary:
      'Secure ingestion pipelines for PDF/image/office docs, including extraction and downstream system integration.',
  },
]

export default function Skills() {
  const sectionRef = useRevealOnScroll({ threshold: 0.2, staggerMs: 80 })

  return (
    <section id="skills" className="portfolio-panel" ref={sectionRef}>
      <div className="panel-inner skill-layout">
        <div>
          <p className="kicker reveal" data-reveal>
            Skills
          </p>

          <h2 className="panel-title reveal" data-reveal>
            Technical depth built for real operations.
          </h2>

          <p className="panel-copy reveal" data-reveal>
            My strongest delivery area is the React + TypeScript ecosystem, with attention to data
            quality, workflow clarity, and performance under business-critical usage.
          </p>

          <div className="skill-meter-list reveal" data-reveal>
            {SKILL_METERS.map((skill) => (
              <div key={skill.name} className="skill-meter">
                <div>
                  <strong>{skill.name}</strong>
                  <span>{skill.level}%</span>
                </div>
                <div className="meter-track" aria-hidden="true">
                  <div className="meter-fill" style={{ width: `${skill.level}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="spec-grid reveal" data-reveal>
          {SPECIALIZATIONS.map((item) => (
            <article key={item.title} className="spec-card">
              <p>{item.stat}</p>
              <h3>{item.title}</h3>
              <p>{item.summary}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
