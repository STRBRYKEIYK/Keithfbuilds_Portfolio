import useRevealOnScroll from "../hooks/useRevealOnScroll";

const TIMELINE = [
  {
    period: "Current Focus",
    title: "Enterprise Web Applications",
    detail:
      "Delivering robust systems for inventory, procurement, payroll, and finance operations with real-time behavior.",
  },
  {
    period: "Core Practice",
    title: "React + TypeScript Delivery",
    detail:
      "Building maintainable interfaces with strict typing, component architecture, and reliable API integration patterns.",
  },
  {
    period: "System Mindset",
    title: "Operational Reliability",
    detail:
      "Designing workflows that protect data quality, enable audit visibility, and support teams under daily production load.",
  },
];

const STRENGTHS = [
  "Real-time synchronization",
  "Offline-first PWA flows",
  "Multi-level approvals",
  "Financial dashboards",
  "Barcode and QR integration",
  "Workflow automation",
];

export default function About() {
  const sectionRef = useRevealOnScroll({ threshold: 0.2, staggerMs: 90 });

  return (
    <section id="about" className="portfolio-panel" ref={sectionRef}>
      <div className="panel-inner about-grid">
        <div>
          <p className="kicker reveal" data-reveal>
            About
          </p>

          <h2 className="panel-title reveal" data-reveal>
            Architect-led delivery shaped by real business constraints.
          </h2>

          <p className="panel-copy reveal" data-reveal>
            Full-stack developer specializing in React and TypeScript, focused
            on enterprise operations. I architect system structure, data
            contracts, and real-time sync logic, then leverage AI copilots
            (Claude, Gemini) to accelerate boilerplate, UI implementation, and
            tests while keeping the core logic under tight control.
          </p>

          <p className="panel-copy reveal" data-reveal>
            Recent deliveries include a 1,000+ SKU POS suite, offline-first
            field workflows, complex financial dashboards, multi-level approval
            systems, and document ingestion pipelines. I aim for premium,
            audit-ready experiences that ship fast without sacrificing
            reliability, often cutting timelines in half. BSIT graduate based in
            the Philippines.
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
  );
}
