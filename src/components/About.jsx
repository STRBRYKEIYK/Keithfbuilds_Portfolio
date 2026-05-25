import useRevealOnScroll from "../hooks/useRevealOnScroll";
import SignatureTitle from "./SignatureTitle";
import TiltCard from "./TiltCard";

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
  "React & Next.js",
  "Node & PHP",
  "Offline-first PWA",
  "Multi-level approvals",
  "Financial dashboards",
  "Workflow automation",
];

export default function About() {
  const sectionRef = useRevealOnScroll({ threshold: 0.2, staggerMs: 90 });

  return (
    <section id="about" className="portfolio-panel" ref={sectionRef}>
      <div className="panel-inner about-grid">
        <div className="about-copy-stack">
          <p className="kicker reveal" data-reveal>
            About
          </p>

          <SignatureTitle
            as="h2"
            className="panel-title about-title reveal"
            text="Operating principle"
            spacing="0.06em"
            misregisterColor="red"
            data-reveal
          />

          <p className="panel-copy reveal" data-reveal>
            Full-stack developer specializing in React, Next.js, and TypeScript,
            focused on enterprise operations. I architect system structure,
            data contracts, and real-time sync logic, then leverage Claude and
            GitHub Copilot for "vibe coding"-accelerating boilerplate, UI
            implementation, and tests while keeping core logic under tight
            control.
          </p>

          <p className="about-callout reveal" data-reveal>
            I build systems where latency, approvals, and data trust decide
            revenue and retention.
          </p>

          <p className="panel-copy reveal" data-reveal>
            Recent deliveries include a 1,000+ SKU POS suite, offline-first
            field workflows, complex financial dashboards, multi-level approval
            systems, and document ingestion pipelines. I aim for premium,
            audit-ready experiences that ship fast without sacrificing
            reliability, often cutting timelines in half. BSIT graduate from
            ICCT Colleges.
          </p>

          <div className="chip-list reveal" data-reveal>
            {STRENGTHS.map((item) => (
              <span key={item} className="chip magnetic">
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="about-sticky reveal" data-reveal>
          <div className="about-timeline">
            <div className="riso-stamp about-stamp reveal" data-reveal>
              Antipolo Based
            </div>

            {TIMELINE.map((item, i) => (
              <TiltCard
                as="article"
                key={item.title}
                className="timeline-item"
                maxDeg={i === 0 ? 4 : 2}
              >
                <p>{item.period}</p>
                <h3>{item.title}</h3>
                <p>{item.detail}</p>
              </TiltCard>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
