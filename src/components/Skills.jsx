import { useEffect, useRef } from 'react'
import { FaStore, FaTruckMoving, FaMoneyCheckAlt } from 'react-icons/fa'

const SKILLS_PRIMARY = [
  { name: 'React 18', level: 95, cat: 'frontend' },
  { name: 'TypeScript', level: 88, cat: 'frontend' },
  { name: 'Tailwind CSS', level: 92, cat: 'frontend' },
  { name: 'WebSocket/Socket.IO', level: 85, cat: 'backend' },
  { name: 'REST APIs', level: 90, cat: 'backend' },
  { name: 'Node.js', level: 78, cat: 'backend' },
  { name: 'PWA / Offline-First', level: 82, cat: 'architecture' },
  { name: 'Git / GitHub', level: 90, cat: 'tools' },
]

const TECH_TAGS = [
  'React', 'TypeScript', 'Tailwind CSS', 'WebSocket', 'Socket.IO', 'PWA',
  'REST APIs', 'Node.js', 'Radix UI', 'Zod', 'Axios', 'Context API',
  'IndexedDB', 'LocalStorage', 'CSV Export', 'XLSX Export', 'PDF Gen',
  'Vite', 'Git', 'GitHub', 'Framer Motion', 'GSAP',
]

const SPECIALIZATIONS = [
  {
    title: 'POS & Inventory Systems',
    desc: 'Full-stack point-of-sale platforms with barcode scanning, 1,000+ SKU support, real-time stock validation, and offline-first PWA capabilities.',
    tags: ['React', 'WebSocket', 'PWA', 'IndexedDB'],
    icon: FaStore,
  },
  {
    title: 'Procurement & Supply Chain',
    desc: 'Enterprise procurement modules with QR/barcode integration, multi-step PO wizards, supplier management, and duplicate detection algorithms.',
    tags: ['React', 'QR/Barcode', 'Workflow', 'CSV/Excel'],
    icon: FaTruckMoving,
  },
  {
    title: 'Financial Management Systems',
    desc: 'Sophisticated payroll and financial platforms with multi-level approval workflows, dynamic dashboards, voucher management, and audit trails.',
    tags: ['State Machine', 'Dashboards', 'Excel Export', 'TypeScript'],
    icon: FaMoneyCheckAlt,
  },
]

export default function Skills() {
  const sectionRef = useRef(null)
  const barsRef = useRef([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('[data-reveal]').forEach((el, i) => {
              setTimeout(() => el.classList.add('visible'), i * 80)
            })
            // Animate bars
            barsRef.current.forEach((bar, i) => {
              if (bar) {
                setTimeout(() => {
                  bar.style.width = bar.dataset.level + '%'
                }, 400 + i * 80)
              }
            })
          }
        })
      },
      { threshold: 0.1 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <style>{`
        .skills {
          padding: 140px 0;
          background: var(--bg-2);
          overflow: hidden;
        }
        .skills-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 40px;
        }
        .skills-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 80px;
        }
        .skills-section-label {
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
        .skills-section-label::before {
          content: '';
          display: block;
          width: 24px;
          height: 1px;
          background: #16C172;
        }
        .skills-heading {
          font-size: clamp(36px, 4vw, 56px);
          color: #E8F5F0;
        }
        .skills-subtext {
          font-size: 15px;
          color: #4A6B57;
          max-width: 320px;
          text-align: right;
          font-family: 'JetBrains Mono', monospace;
          line-height: 1.6;
        }
        /* Ticker */
        .skills-ticker {
          overflow: hidden;
          padding: 24px 0;
          margin-bottom: 80px;
          border-top: 1px solid rgba(22,193,114,0.08);
          border-bottom: 1px solid rgba(22,193,114,0.08);
          position: relative;
        }
        .skills-ticker::before,
        .skills-ticker::after {
          content: '';
          position: absolute;
          top: 0; bottom: 0;
          width: 80px;
          z-index: 2;
          pointer-events: none;
        }
        .skills-ticker::before {
          left: 0;
          background: linear-gradient(to right, var(--bg-2), transparent);
        }
        .skills-ticker::after {
          right: 0;
          background: linear-gradient(to left, var(--bg-2), transparent);
        }
        .ticker-track {
          display: flex;
          gap: 16px;
          animation: ticker 28s linear infinite;
          width: max-content;
        }
        .ticker-tag {
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          letter-spacing: 0.08em;
          color: #4A6B57;
          white-space: nowrap;
          padding: 8px 16px;
          border: 1px solid rgba(22,193,114,0.1);
          border-radius: 3px;
          transition: color 0.2s, border-color 0.2s;
        }
        .ticker-tag:hover {
          color: #16C172;
          border-color: rgba(22,193,114,0.3);
        }
        /* Bar grid */
        .skills-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px 60px;
          margin-bottom: 80px;
        }
        .skill-bar-item {
          padding: 0 0 20px;
          border-bottom: 1px solid rgba(22,193,114,0.06);
        }
        .skill-bar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }
        .skill-bar-name {
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 500;
          color: #E8F5F0;
        }
        .skill-bar-level {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          color: #16C172;
        }
        .skill-bar-track {
          height: 3px;
          background: rgba(22,193,114,0.1);
          border-radius: 2px;
          overflow: hidden;
        }
        .skill-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #0D8A50, #16C172);
          border-radius: 2px;
          width: 0;
          transition: width 1.2s cubic-bezier(0.16,1,0.3,1);
          box-shadow: 0 0 8px rgba(22,193,114,0.4);
        }
        /* Specialization cards */
        .spec-heading {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.15em;
          color: #4A6B57;
          text-transform: uppercase;
          margin-bottom: 24px;
        }
        .spec-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        .spec-card {
          background: var(--bg-card);
          border: 1px solid rgba(22,193,114,0.08);
          border-radius: 10px;
          padding: 32px 28px;
          position: relative;
          overflow: hidden;
          transition: border-color 0.4s, transform 0.4s, box-shadow 0.4s;
        }
        .spec-card::after {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% 0%, rgba(22,193,114,0.05) 0%, transparent 60%);
          opacity: 0;
          transition: opacity 0.4s;
        }
        .spec-card:hover {
          border-color: rgba(22,193,114,0.25);
          transform: translateY(-6px);
          box-shadow: 0 20px 60px rgba(0,0,0,0.4), 0 0 40px rgba(22,193,114,0.05);
        }
        .spec-card:hover::after { opacity: 1; }
        .spec-icon {
          font-size: 32px;
          margin-bottom: 20px;
          display: block;
        }
        .spec-title {
          font-family: 'Syne', sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: #E8F5F0;
          margin-bottom: 12px;
        }
        .spec-desc {
          font-size: 13.5px;
          color: #7A9E8C;
          font-weight: 300;
          line-height: 1.7;
          margin-bottom: 20px;
        }
        .spec-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .spec-tag {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.06em;
          color: #16C172;
          background: rgba(22,193,114,0.08);
          padding: 4px 10px;
          border-radius: 3px;
        }
        @media (max-width: 900px) {
          .spec-grid { grid-template-columns: 1fr; }
          .skills-grid { grid-template-columns: 1fr; gap: 16px; }
          .skills-header { flex-direction: column; align-items: flex-start; gap: 16px; }
          .skills-subtext { text-align: left; }
        }
        @media (max-width: 768px) {
          .skills { padding: 100px 0; }
          .skills-inner { padding: 0 24px; }
        }
      `}</style>

      <section id="skills" className="skills" ref={sectionRef}>
        <div className="skills-inner">
          <div className="skills-header">
            <div>
              <div className="skills-section-label reveal" data-reveal>Technical Arsenal</div>
              <h2 className="skills-heading reveal" data-reveal>
                What I Build<br />With
              </h2>
            </div>
            <p className="skills-subtext reveal" data-reveal>
              Full-stack capabilities with deep React/TypeScript expertise across enterprise domains
            </p>
          </div>

          {/* Ticker */}
          <div className="skills-ticker">
            <div className="ticker-track">
              {[...TECH_TAGS, ...TECH_TAGS].map((tag, i) => (
                <span key={i} className="ticker-tag">{tag}</span>
              ))}
            </div>
          </div>

          {/* Skill Bars */}
          <div className="skills-grid">
            {SKILLS_PRIMARY.map((skill, i) => (
              <div key={skill.name} className="skill-bar-item reveal" data-reveal>
                <div className="skill-bar-header">
                  <span className="skill-bar-name">{skill.name}</span>
                  <span className="skill-bar-level">{skill.level}%</span>
                </div>
                <div className="skill-bar-track">
                  <div
                    className="skill-bar-fill"
                    ref={el => barsRef.current[i] = el}
                    data-level={skill.level}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Specializations */}
          <p className="spec-heading reveal" data-reveal>// Specialization Areas</p>
          <div className="spec-grid">
            {SPECIALIZATIONS.map((spec, i) => (
              <div key={spec.title} className="spec-card reveal" data-reveal style={{ transitionDelay: `${i * 100}ms` }}>
                <span
                  className="spec-icon"
                  tabIndex={0}
                  role="button"
                  aria-label={spec.title}
                  title={spec.title}
                  style={{ color: '#16C172', filter: 'drop-shadow(0 0 8px #16C17244)', transition: 'transform 0.2s, filter 0.2s', cursor: 'pointer' }}
                  onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.18) rotate(-8deg)'; e.currentTarget.style.filter = 'drop-shadow(0 0 16px #16C17299)'; }}
                  onMouseOut={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.filter = 'drop-shadow(0 0 8px #16C17244)'; }}
                  onFocus={e => { e.currentTarget.style.transform = 'scale(1.18) rotate(-8deg)'; e.currentTarget.style.filter = 'drop-shadow(0 0 16px #16C17299)'; }}
                  onBlur={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.filter = 'drop-shadow(0 0 8px #16C17244)'; }}
                >
                  {spec.icon && <spec.icon />}
                </span>
                <div className="spec-title">{spec.title}</div>
                <p className="spec-desc">{spec.desc}</p>
                <div className="spec-tags">
                  {spec.tags.map(t => <span key={t} className="spec-tag">{t}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}