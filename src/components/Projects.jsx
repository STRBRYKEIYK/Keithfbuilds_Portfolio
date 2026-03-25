import { useEffect, useRef, useState } from 'react'
import { FaStore, FaTruckMoving, FaMoneyCheckAlt } from 'react-icons/fa'

const PROJECTS = [
  {
    num: '01',
    title: 'Toolbox POS System',
    subtitle: 'Full-Stack Development',
    year: '2025–2026',
    stack: ['React 18', 'TypeScript', 'WebSocket', 'PWA', 'Tailwind'],
    type: 'Enterprise Retail',
    color: '#16C172',
    desc: 'A modern, responsive point-of-sale and inventory management system built for enterprise toolbox operations. Handles 1,000+ SKUs with real-time synchronization.',
    highlights: [
      'Barcode scanning + real-time inventory validation',
      'PWA with full offline functionality via IndexedDB',
      'Socket.IO multi-session stock synchronization',
      'Advanced cart: session persistence & history recovery',
      'Role-based access control + XSS prevention',
      'CSV / XLSX / JSON export & analytics',
    ],
    impact: '1,000+ SKUs',
    icon: FaStore,
  },
  {
    num: '02',
    title: 'Procurement Dept.',
    subtitle: 'Frontend Development',
    year: '2025',
    stack: ['React', 'TypeScript', 'QR/Barcode', 'WebSocket', 'Axios'],
    type: 'Supply Chain',
    color: '#0EADD4',
    desc: 'Enterprise procurement and inventory module streamlining supplier relationships, purchase order workflows, and real-time inventory tracking with barcode/QR integration.',
    highlights: [
      'QR/barcode generation + scanning for inventory',
      'Multi-step purchase order creation wizard',
      'Duplicate detection algorithm for inventory integrity',
      'CSV/Excel import with validation + error reporting',
      'Supplier database with performance tracking',
      'Real-time WebSocket order status notifications',
    ],
    impact: 'Full Supply Chain',
    icon: FaTruckMoving,
  },
  {
    num: '03',
    title: 'Finance Payroll Dept.',
    subtitle: 'Full-Stack Financial Systems',
    year: '2026',
    stack: ['React', 'TypeScript', 'State Machine', 'Data Analytics'],
    type: 'Financial Management',
    color: '#F59E0B',
    desc: 'Sophisticated financial management platform handling vouchers, invoicing, payroll, expense tracking, employee loans, and monthly billing with comprehensive audit trails.',
    highlights: [
      'Multi-level approval: Draft → Submitted → Approved → Released',
      'Three voucher types with complete lifecycle management',
      'Dynamic dashboards: pie/bar/area charts + KPI metrics',
      'Payroll with multi-period support & bulk processing',
      'Employee loans system with 4 loan types',
      'Multi-sheet Excel exports with professional styling',
    ],
    impact: 'Complete ERP Module',
    icon: FaMoneyCheckAlt,
  },
  {
    num: '04',
    title: 'Ingestion & Document Automation Service',
    subtitle: 'Backend Automation & OCR',
    year: '2026',
    stack: ['Express', 'TypeScript', 'Python', 'OCR', 'API', 'Data Automation'],
    type: 'Backend Automation',
    color: '#3B82F6',
    desc: 'A robust backend service powering automated document ingestion and data extraction for enterprise workflows. Handles uploads of PDFs, images, spreadsheets, and Word documents, leveraging advanced OCR (Optical Character Recognition) and parsing to convert unstructured files into actionable data.',
    highlights: [
      'Multi-provider OCR (Tesseract, EasyOCR, Qwen-VL) for high-accuracy text extraction',
      'Secure API endpoints for document upload and data confirmation',
      'Supports PDF, Excel, Word, JPEG, PNG, and more',
      'Scalable job queue with concurrent processing and rate limiting',
      'Automatic file validation, hashing, and audit trails',
      'Integrates seamlessly with financial, payroll, and inventory systems',
      'Built with Express, TypeScript, and Python OCR workers',
    ],
    impact: 'Enterprise Data Automation',
    icon: FaMoneyCheckAlt,
  },
]

function ProjectCard({ project, index }) {
  const [expanded, setExpanded] = useState(false)
  const cardRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setTimeout(() => entry.target.classList.add('visible'), index * 150)
          }
        })
      },
      { threshold: 0.1 }
    )
    if (cardRef.current) observer.observe(cardRef.current)
    return () => observer.disconnect()
  }, [index])

  const Icon = project.icon
  return (
    <>
      <style>{`
        .project-card {
          background: var(--bg-card);
          border: 1px solid rgba(22,193,114,0.08);
          border-radius: 12px;
          overflow: hidden;
          transition: border-color 0.4s, box-shadow 0.4s, transform 0.4s;
          opacity: 0;
          transform: translateY(40px);
          transition: opacity 0.7s var(--ease-out), transform 0.7s var(--ease-out),
            border-color 0.3s, box-shadow 0.3s;
        }
        .project-card.visible {
          opacity: 1;
          transform: translateY(0);
        }
        .project-card:hover {
          border-color: rgba(22,193,114,0.2);
          box-shadow: 0 24px 80px rgba(0,0,0,0.5);
          transform: translateY(-4px);
        }
        .project-card-header {
          padding: 32px 32px 24px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          position: relative;
        }
        .project-num {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          color: #4A6B57;
          letter-spacing: 0.1em;
          margin-bottom: 8px;
        }
        .project-type-badge {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 6px 12px;
          border-radius: 3px;
          border: 1px solid;
          flex-shrink: 0;
        }
        .project-title {
          font-size: 22px;
          color: #E8F5F0;
          margin-bottom: 4px;
        }
        .project-subtitle {
          font-size: 13px;
          color: #4A6B57;
          font-family: 'JetBrains Mono', monospace;
          margin-bottom: 16px;
        }
        .project-desc {
          padding: 0 32px;
          font-size: 14px;
          color: #7A9E8C;
          line-height: 1.75;
          font-weight: 300;
          margin-bottom: 24px;
        }
        .project-stack {
          padding: 0 32px;
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 24px;
        }
        .stack-tag {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.06em;
          padding: 5px 12px;
          border-radius: 3px;
          background: rgba(22,193,114,0.07);
          color: #16C172;
          border: 1px solid rgba(22,193,114,0.15);
        }
        .project-expand-btn {
          width: 100%;
          padding: 16px 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #4A6B57;
          border-top: 1px solid rgba(22,193,114,0.06);
          transition: color 0.2s, background 0.2s;
        }
        .project-expand-btn:hover {
          color: #16C172;
          background: rgba(22,193,114,0.03);
        }
        .expand-icon {
          width: 20px;
          height: 20px;
          border: 1px solid currentColor;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          transition: transform 0.3s ease;
        }
        .expand-icon.open { transform: rotate(45deg); }
        .project-highlights {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.5s cubic-bezier(0.16,1,0.3,1);
        }
        .project-highlights.open {
          max-height: 400px;
        }
        .highlights-inner {
          padding: 24px 32px 32px;
          border-top: 1px solid rgba(22,193,114,0.06);
        }
        .highlight-item {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          margin-bottom: 10px;
          font-size: 13.5px;
          color: #7A9E8C;
          font-weight: 300;
          line-height: 1.6;
        }
        .highlight-item::before {
          content: '▸';
          color: #16C172;
          flex-shrink: 0;
          margin-top: 1px;
          font-size: 11px;
        }
        .project-impact {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-top: 16px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.1em;
          color: #4A6B57;
          text-transform: uppercase;
        }
        .project-impact strong {
          color: #16C172;
          font-size: 13px;
        }
      `}</style>

      <div ref={cardRef} className="project-card">
        <div style={{ position: 'absolute', top: 24, right: 24, fontSize: 32, color: project.color, opacity: 0.18 }}>
          {Icon && <Icon />}
        </div>
        <div className="project-card-header">
          <div>
            <div className="project-num">{project.num} / 03</div>
            <h3 className="project-title">{project.title}</h3>
            <div className="project-subtitle">// {project.subtitle}</div>
          </div>
          <div
            className="project-type-badge"
            style={{
              color: project.color,
              borderColor: `${project.color}33`,
              background: `${project.color}0D`,
            }}
          >
            {project.type}
          </div>
        </div>

        <p className="project-desc">{project.desc}</p>

        <div className="project-stack">
          {project.stack.map(s => (
            <span key={s} className="stack-tag">{s}</span>
          ))}
        </div>

        <button className="project-expand-btn" onClick={() => setExpanded(!expanded)}>
          <span>{expanded ? 'Hide Details' : 'View Highlights'}</span>
          <div className={`expand-icon ${expanded ? 'open' : ''}`}>+</div>
        </button>

        <div className={`project-highlights ${expanded ? 'open' : ''}`}>
          <div className="highlights-inner">
            {project.highlights.map((h, i) => (
              <div key={i} className="highlight-item">{h}</div>
            ))}
            <div className="project-impact">
              Impact: <strong>{project.impact}</strong>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default function Projects() {
  const sectionRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('[data-reveal]').forEach((el, i) => {
              setTimeout(() => el.classList.add('visible'), i * 100)
            })
          }
        })
      },
      { threshold: 0.05 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <style>{`
        .projects {
          padding: 140px 0;
          background: var(--bg);
        }
        .projects-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 40px;
        }
        .projects-header {
          margin-bottom: 64px;
        }
        .projects-section-label {
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
        .projects-section-label::before {
          content: '';
          display: block;
          width: 24px;
          height: 1px;
          background: #16C172;
        }
        .projects-heading {
          font-size: clamp(36px, 4vw, 56px);
          color: #E8F5F0;
          max-width: 500px;
        }
        .projects-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        @media (max-width: 1024px) {
          .projects-grid { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 640px) {
          .projects-grid { grid-template-columns: 1fr; }
          .projects { padding: 100px 0; }
          .projects-inner { padding: 0 24px; }
        }
      `}</style>

      <section id="projects" className="projects" ref={sectionRef}>
        <div className="projects-inner">
          <div className="projects-header">
            <div className="projects-section-label reveal" data-reveal>
              Selected Work
            </div>
            <h2 className="projects-heading reveal" data-reveal>
              Enterprise Systems<br />I've Built
            </h2>
          </div>

          <div className="projects-grid">
            {PROJECTS.map((project, i) => (
              <ProjectCard key={project.num} project={project} index={i} />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}