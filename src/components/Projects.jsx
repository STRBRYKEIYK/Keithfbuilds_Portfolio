import { useEffect, useRef, useState } from 'react'
import { FaStore, FaTruckMoving, FaMoneyCheckAlt, FaFileAlt } from 'react-icons/fa'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { RiTerminalBoxLine } from 'react-icons/ri'
import { BsCircleFill } from 'react-icons/bs'

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
    impactLabel: 'Managed',
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
    impactLabel: 'Coverage',
    icon: FaTruckMoving,
  },
  {
    num: '03',
    title: 'Finance Payroll Dept.',
    subtitle: 'Full-Stack Financial Systems',
    year: '2026',
    stack: ['React', 'TypeScript', 'State Machine', 'Data Analytics'],
    type: 'Financial Mgmt',
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
    impact: 'Complete ERP',
    impactLabel: 'Module',
    icon: FaMoneyCheckAlt,
  },
  {
    num: '04',
    title: 'Doc Automation Service',
    subtitle: 'Backend Automation & OCR',
    year: '2026',
    stack: ['Express', 'TypeScript', 'Python', 'OCR', 'API'],
    type: 'Backend Auto',
    color: '#3B82F6',
    desc: 'A robust backend service powering automated document ingestion and data extraction for enterprise workflows. Handles PDFs, images, spreadsheets, and Word documents leveraging advanced multi-provider OCR.',
    highlights: [
      'Multi-provider OCR (Tesseract, EasyOCR, Qwen-VL)',
      'Secure API endpoints for document upload & confirmation',
      'Supports PDF, Excel, Word, JPEG, PNG and more',
      'Scalable job queue with concurrent processing',
      'Automatic file validation, hashing, and audit trails',
      'Integrates with financial, payroll, and inventory systems',
    ],
    impact: 'Multi-Provider',
    impactLabel: 'OCR Engine',
    icon: FaFileAlt,
  },
]

export default function Projects() {
  const sectionRef = useRef(null)
  const [active, setActive] = useState(0)
  const [animating, setAnimating] = useState(false)
  const [dir, setDir] = useState(1)

  const goTo = (idx) => {
    if (animating || idx === active) return
    setDir(idx > active ? 1 : -1)
    setAnimating(true)
    setTimeout(() => {
      setActive(idx)
      setAnimating(false)
    }, 300)
  }

  const prev = () => goTo((active - 1 + PROJECTS.length) % PROJECTS.length)
  const next = () => goTo((active + 1) % PROJECTS.length)

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

  const proj = PROJECTS[active]
  const ProjIcon = proj.icon

  return (
    <>
      <style>{`
        @keyframes projSlideIn {
          from { opacity: 0; transform: translateX(${dir > 0 ? '30px' : '-30px'}); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes hlReveal {
          from { opacity: 0; transform: translateX(-8px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }

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
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 56px;
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
          font-size: clamp(32px, 4vw, 52px);
          color: #E8F5F0;
        }

        /* Nav controls */
        .proj-nav {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .scanline-btn {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border: 1px solid rgba(22,193,114,0.35);
          border-radius: 4px;
          background: rgba(22,193,114,0.04);
          color: #16C172;
          cursor: pointer;
          overflow: hidden;
          transition: border-color 0.2s, background 0.2s, color 0.2s, box-shadow 0.2s;
        }
        .scanline-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 3px,
            rgba(22,193,114,0.04) 3px,
            rgba(22,193,114,0.04) 4px
          );
          pointer-events: none;
          z-index: 1;
        }
        .scanline-btn svg { position: relative; z-index: 2; font-size: 20px; }
        .scanline-btn:hover {
          border-color: #16C172;
          background: rgba(22,193,114,0.12);
          box-shadow: 0 0 18px rgba(22,193,114,0.22), inset 0 0 16px rgba(22,193,114,0.05);
          color: #fff;
        }
        .scanline-btn:active { transform: scale(0.95); }

        .proj-counter {
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          color: #4A6B57;
          min-width: 56px;
          text-align: center;
          letter-spacing: 0.05em;
        }
        .proj-counter span { color: #16C172; }

        /* ── Main showcase ── */
        .proj-showcase {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 20px;
          align-items: stretch;
        }

        /* Left: main card */
        .proj-main-card {
          position: relative;
          border-radius: 14px;
          border: 1px solid rgba(22,193,114,0.1);
          overflow: hidden;
          background: var(--bg-card);
          min-height: 480px;
          display: flex;
          flex-direction: column;
        }

        /* Big number bg decoration */
        .proj-bg-num {
          position: absolute;
          top: -10px;
          right: 24px;
          font-family: 'Syne', sans-serif;
          font-size: 160px;
          font-weight: 800;
          line-height: 1;
          color: transparent;
          -webkit-text-stroke: 1px;
          opacity: 0.06;
          pointer-events: none;
          letter-spacing: -0.04em;
          user-select: none;
        }

        /* Scanline texture overlay */
        .proj-scanlines {
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 3px,
            rgba(22,193,114,0.012) 3px,
            rgba(22,193,114,0.012) 4px
          );
          pointer-events: none;
          z-index: 0;
        }

        .proj-main-top {
          padding: 36px 36px 28px;
          position: relative;
          z-index: 1;
          flex: 1;
        }

        .proj-badge-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }
        .proj-type-badge {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 5px 12px;
          border-radius: 3px;
          border: 1px solid;
        }
        .proj-year-badge {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          color: #4A6B57;
          letter-spacing: 0.05em;
        }
        .proj-live-dot {
          display: flex;
          align-items: center;
          gap: 5px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px;
          letter-spacing: 0.1em;
          color: #16C172;
          margin-left: auto;
          text-transform: uppercase;
        }
        .proj-live-dot svg {
          font-size: 7px;
          animation: glowPulse 2s ease-in-out infinite;
        }

        .proj-title-block {
          margin-bottom: 20px;
        }
        .proj-num-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          color: #4A6B57;
          letter-spacing: 0.08em;
          margin-bottom: 6px;
        }
        .proj-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(26px, 3vw, 36px);
          font-weight: 700;
          color: #E8F5F0;
          line-height: 1.15;
          margin-bottom: 6px;
        }
        .proj-subtitle {
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          color: #4A6B57;
        }

        .proj-desc {
          font-size: 14px;
          color: #7A9E8C;
          line-height: 1.8;
          font-weight: 300;
          margin-bottom: 24px;
          max-width: 560px;
        }

        /* Stack tags */
        .proj-stack {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
          margin-bottom: 0;
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
          transition: background 0.2s;
        }
        .stack-tag:hover { background: rgba(22,193,114,0.14); }

        /* Impact bar at bottom */
        .proj-impact-bar {
          padding: 16px 36px;
          border-top: 1px solid rgba(22,193,114,0.07);
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
          z-index: 1;
        }
        .proj-impact-text {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #4A6B57;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .proj-impact-value {
          font-family: 'Syne', sans-serif;
          font-size: 14px;
          font-weight: 700;
        }
        .proj-icon-large {
          font-size: 22px;
          opacity: 0.5;
        }

        /* ── Right panel ── */
        .proj-side-panel {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        /* Highlights card */
        .proj-highlights-card {
          flex: 1;
          background: var(--bg-card);
          border: 1px solid rgba(22,193,114,0.08);
          border-radius: 14px;
          overflow: hidden;
          position: relative;
        }
        .proj-highlights-header {
          padding: 20px 24px 16px;
          border-bottom: 1px solid rgba(22,193,114,0.07);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .proj-highlights-title {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #4A6B57;
        }
        .proj-highlights-body {
          padding: 20px 24px 24px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .highlight-item {
          display: flex;
          gap: 10px;
          align-items: flex-start;
          font-size: 12.5px;
          color: #7A9E8C;
          font-weight: 300;
          line-height: 1.5;
          animation: hlReveal 0.35s ease both;
        }
        .highlight-item::before {
          content: '▸';
          color: #16C172;
          flex-shrink: 0;
          margin-top: 1px;
          font-size: 9px;
          margin-top: 3px;
        }

        /* Thumbnail list */
        .proj-thumb-list {
          display: flex;
          gap: 10px;
        }
        .proj-thumb {
          flex: 1;
          padding: 14px 12px;
          background: var(--bg-card);
          border: 1px solid rgba(22,193,114,0.08);
          border-radius: 10px;
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s, transform 0.2s;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          position: relative;
          overflow: hidden;
        }
        .proj-thumb::before {
          content: '';
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 3px,
            rgba(22,193,114,0.025) 3px,
            rgba(22,193,114,0.025) 4px
          );
          pointer-events: none;
        }
        .proj-thumb.thumb-active {
          border-color: rgba(22,193,114,0.35);
          background: rgba(22,193,114,0.04);
          transform: translateY(-2px);
        }
        .proj-thumb:hover:not(.thumb-active) {
          border-color: rgba(22,193,114,0.2);
          transform: translateY(-2px);
        }
        .proj-thumb-icon {
          font-size: 18px;
          position: relative;
          z-index: 1;
        }
        .proj-thumb-num {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px;
          letter-spacing: 0.1em;
          position: relative;
          z-index: 1;
        }

        /* Animated content key */
        .proj-animated { animation: projSlideIn 0.32s ease both; }

        @media (max-width: 960px) {
          .proj-showcase { grid-template-columns: 1fr; }
          .proj-side-panel { flex-direction: column; }
          .proj-thumb-list { gap: 8px; }
        }
        @media (max-width: 640px) {
          .projects { padding: 100px 0; }
          .projects-inner { padding: 0 24px; }
          .projects-header { flex-direction: column; align-items: flex-start; gap: 20px; }
          .proj-main-top { padding: 28px 24px 20px; }
          .proj-impact-bar { padding: 14px 24px; }
          .proj-bg-num { font-size: 100px; }
        }
      `}</style>

      <section id="projects" className="projects" ref={sectionRef}>
        <div className="projects-inner">

          {/* Header */}
          <div className="projects-header">
            <div>
              <div className="projects-section-label reveal" data-reveal>Selected Work</div>
              <h2 className="projects-heading reveal" data-reveal>
                Enterprise Systems<br />I've Built
              </h2>
            </div>
            <div className="proj-nav reveal" data-reveal>
              <button className="scanline-btn" onClick={prev} aria-label="Previous project">
                <FiChevronLeft />
              </button>
              <span className="proj-counter">
                <span>{proj.num}</span>&nbsp;/&nbsp;{String(PROJECTS.length).padStart(2, '0')}
              </span>
              <button className="scanline-btn" onClick={next} aria-label="Next project">
                <FiChevronRight />
              </button>
            </div>
          </div>

          <div className="proj-showcase reveal" data-reveal>

            {/* ── Left: Main Feature Card ── */}
            <div
              className="proj-main-card"
              style={{ borderColor: `${proj.color}22`, boxShadow: `0 0 60px ${proj.color}0A` }}
            >
              <div className="proj-scanlines" />
              <div
                className="proj-bg-num"
                style={{ WebkitTextStrokeColor: proj.color }}
              >
                {proj.num}
              </div>

              <div className="proj-main-top">
                <div className="proj-animated" key={`badge-${active}`}>
                  <div className="proj-badge-row">
                    <span
                      className="proj-type-badge"
                      style={{
                        color: proj.color,
                        borderColor: `${proj.color}33`,
                        background: `${proj.color}0D`,
                      }}
                    >
                      {proj.type}
                    </span>
                    <span className="proj-year-badge">{proj.year}</span>
                    <span className="proj-live-dot">
                      <BsCircleFill />
                      Active
                    </span>
                  </div>

                  <div className="proj-title-block">
                    <div className="proj-num-label">Project {proj.num} of {String(PROJECTS.length).padStart(2, '0')}</div>
                    <h3 className="proj-title">{proj.title}</h3>
                    <div className="proj-subtitle">// {proj.subtitle}</div>
                  </div>

                  <p className="proj-desc">{proj.desc}</p>

                  <div className="proj-stack">
                    {proj.stack.map(s => (
                      <span key={s} className="stack-tag" style={{ color: proj.color, background: `${proj.color}0C`, borderColor: `${proj.color}25` }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div
                className="proj-impact-bar"
                style={{ borderTopColor: `${proj.color}12`, background: `${proj.color}05` }}
              >
                <div className="proj-impact-text">
                  <span>Impact:</span>
                  <span className="proj-impact-value" style={{ color: proj.color }}>
                    {proj.impact}
                  </span>
                  <span style={{ color: '#4A6B57' }}>{proj.impactLabel}</span>
                </div>
                <span className="proj-icon-large" style={{ color: proj.color }}>
                  <ProjIcon />
                </span>
              </div>
            </div>

            {/* ── Right Panel ── */}
            <div className="proj-side-panel">

              {/* Highlights */}
              <div className="proj-highlights-card" style={{ borderColor: `${proj.color}12` }}>
                <div className="proj-highlights-header">
                  <RiTerminalBoxLine style={{ color: proj.color, fontSize: 13 }} />
                  <span className="proj-highlights-title">Key Highlights</span>
                </div>
                <div className="proj-highlights-body" key={`hl-${active}`}>
                  {proj.highlights.map((h, i) => (
                    <div
                      key={i}
                      className="highlight-item"
                      style={{ animationDelay: `${i * 55}ms` }}
                    >
                      {h}
                    </div>
                  ))}
                </div>
              </div>

              {/* Thumbnail switcher */}
              <div className="proj-thumb-list">
                {PROJECTS.map((p, i) => {
                  const TIcon = p.icon
                  return (
                    <button
                      key={p.num}
                      className={`proj-thumb ${i === active ? 'thumb-active' : ''}`}
                      onClick={() => goTo(i)}
                      aria-label={`Switch to ${p.title}`}
                      style={i === active ? { borderColor: `${p.color}45`, background: `${p.color}08` } : {}}
                    >
                      <span className="proj-thumb-icon" style={{ color: i === active ? p.color : '#4A6B57' }}>
                        <TIcon />
                      </span>
                      <span
                        className="proj-thumb-num"
                        style={{ color: i === active ? p.color : '#4A6B57' }}
                      >
                        {p.num}
                      </span>
                    </button>
                  )
                })}
              </div>

            </div>
          </div>

        </div>
      </section>
    </>
  )
}