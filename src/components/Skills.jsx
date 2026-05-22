import useRevealOnScroll from '../hooks/useRevealOnScroll'
import SignatureTitle from './SignatureTitle'
import TiltCard from './TiltCard'

const SKILLS = [
  'React 18',
  'TypeScript',
  'Tailwind CSS',
  'REST APIs',
  'WebSocket',
  'Socket.IO',
  'Node.js',
  'PWA / Offline-First',
  'Git / GitHub',
  'GSAP',
  'Lenis',
  'Vite',
  'Postgres',
  'Supabase',
  'Cloudflare',
  'Vercel',
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

          <SignatureTitle
            as="h2"
            className="panel-title reveal"
            text="Technical range"
            spacing="0.18em"
            misregisterColor="red"
            data-reveal
          />

          <p className="panel-copy reveal" data-reveal>
            My strongest delivery area is the React + TypeScript ecosystem, with attention to data
            quality, workflow clarity, and performance under business-critical usage.
          </p>

          <p className="skills-callout reveal" data-reveal>
            Built for systems that stay reliable when traffic spikes and teams ship fast.
          </p>

          <div className="skills-marquee reveal" data-reveal aria-label="Skill stack">
            <div className="skills-marquee-track">
              {[...SKILLS, ...SKILLS].map((skill, i) => (
                <span key={`${skill}-${i}`} className="skills-marquee-chip">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="spec-grid reveal" data-reveal>
          {SPECIALIZATIONS.map((item) => (
            <TiltCard as="article" key={item.title} className="spec-card" maxDeg={5}>
              <p>{item.stat}</p>
              <h3>{item.title}</h3>
              <p>{item.summary}</p>
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  )
}
