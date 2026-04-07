import useRevealOnScroll from '../hooks/useRevealOnScroll'

const TIMELINE = [
  {
    period: 'Current Focus',
    title: 'Enterprise Web Applications',
    detail:
      'Delivering robust systems for inventory, procurement, payroll, and finance operations with real-time behavior.',
  },
  {
    period: 'Core Practice',
    title: 'React + TypeScript Delivery',
    detail:
      'Building maintainable interfaces with strict typing, component architecture, and reliable API integration patterns.',
  },
  {
    period: 'System Mindset',
    title: 'Operational Reliability',
    detail:
      'Designing workflows that protect data quality, enable audit visibility, and support teams under daily production load.',
  },
]

const STRENGTHS = [
  'Real-time synchronization',
  'Workflow automation',
  'Barcode and QR integration',
  'Approval state transitions',
  'Dashboard and reporting UX',
  'Cross-team communication',
]

export default function About() {
  const sectionRef = useRevealOnScroll({ threshold: 0.2, staggerMs: 90 })

  return (
    <section id="about" className="portfolio-panel" ref={sectionRef}>
      <div className="panel-inner about-grid">
        <div>
          <p className="kicker reveal" data-reveal>
            About
          </p>

          <h2 className="panel-title reveal" data-reveal>
            Professional profile shaped by real business constraints.
          </h2>

          <p className="panel-copy reveal" data-reveal>
            I am a BSIT graduate from the Philippines with hands-on experience building systems for
            real operations teams. My work goes beyond visual polish and focuses on predictable,
            maintainable outcomes in production.
          </p>

          <p className="panel-copy reveal" data-reveal>
            Recent deliveries include modules for supplier workflows, stock management, payroll
            processing, financial approvals, and document ingestion. I enjoy projects where clear
            structure, speed, and reliability matter at the same time.
          </p>

          <div className="chip-list reveal" data-reveal>
            {STRENGTHS.map((item) => (
              <span key={item} className="chip">
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="about-timeline reveal" data-reveal>
          {TIMELINE.map((item) => (
            <article key={item.title} className="timeline-item">
              <p>{item.period}</p>
              <h3>{item.title}</h3>
              <p>{item.detail}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
