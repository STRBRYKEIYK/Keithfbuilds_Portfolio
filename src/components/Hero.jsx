import useRevealOnScroll from "../hooks/useRevealOnScroll";
import SignatureTitle from "./SignatureTitle";
import LiveTimeChip from "./LiveTimeChip";
import PipeBracket from "./PipeBracket";

const RESUME_FILE = "KeithFbuilds.dev - Resume.pdf";
const RESUME_HREF = `/${encodeURIComponent(RESUME_FILE)}`;

const jumpTo = (event, id) => {
  event.preventDefault();
  document.getElementById(id)?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
};

export default function Hero() {
  const sectionRef = useRevealOnScroll({ threshold: 0.2, staggerMs: 90 });

  return (
    <section id="hero" className="portfolio-panel hero-panel" ref={sectionRef}>
      <div className="panel-inner">
        <div className="hero-meta-row reveal" data-reveal>
          <LiveTimeChip />
          <a
            href="#contact"
            className="available-chip focus-ring"
            onClick={(event) => jumpTo(event, "contact")}
          >
            Available for work →
          </a>
        </div>

        <div className="hero-stack reveal" data-reveal>
          <span className="hero-stack-line">ENGINEER</span>
          <span className="hero-stack-line">ARCHITECT</span>
          <span className="hero-stack-line">
            <PipeBracket>
              <SignatureTitle as="span" text="ai-native" spacing="0.12em" />
            </PipeBracket>
          </span>
        </div>

        <div className="hero-content-grid reveal" data-reveal>
          <p className="hero-tagline">
            I architect React + TypeScript systems for operations,
            procurement, and finance — owning the data model, real-time
            sync, and approval logic.
          </p>

          <div>
            <p className="three-nouns mb-4">
              Developer<span>·</span>Architect<span>·</span>AI-Native
            </p>
            <div className="hero-actions-new">
              <a
                href="#projects"
                className="btn-on-dark focus-ring"
                onClick={(event) => jumpTo(event, "projects")}
              >
                View Selected Work →
              </a>
              <a
                href={RESUME_HREF}
                download
                className="btn-on-dark btn-on-dark-ghost focus-ring"
              >
                Download Resume
              </a>
            </div>
          </div>
        </div>

        <dl className="delivery-snapshot reveal" data-reveal>
          <div>
            <dt>Primary Stack</dt>
            <dd>React 18 · TypeScript · Tailwind</dd>
          </div>
          <div>
            <dt>Signature Systems</dt>
            <dd>1,000+ SKU POS · Procurement · Finance</dd>
          </div>
          <div>
            <dt>Delivery Approach</dt>
            <dd>Architect-led · AI-accelerated</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
