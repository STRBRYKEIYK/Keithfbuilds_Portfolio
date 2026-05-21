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
            Open to Work →
          </a>
        </div>

        <div className="hero-stack reveal" data-reveal>
          <span className="hero-stack-line">WEB SYSTEMS</span>
          <span className="hero-stack-line">BUILT FOR</span>
          <span className="hero-stack-line">
            <PipeBracket>
              <SignatureTitle as="span" text="enterprise" spacing="0.18em" />
            </PipeBracket>
          </span>
        </div>

        <div>
          <p className="hero-tagline reveal" data-reveal>
            I architect React + TypeScript systems for operations,
            procurement, and finance — owning the data model, real-time
            sync, and approval logic.
          </p>

          <p className="three-nouns reveal" data-reveal>
            Developer<span>·</span>Architect<span>·</span>AI-Native
          </p>
        </div>

        <div className="hero-actions-new reveal" data-reveal>
          <a
            href="#projects"
            className="btn-on-dark focus-ring"
            onClick={(event) => jumpTo(event, "projects")}
          >
            View Selected Work →
          </a>
          <a
            href="#contact"
            className="btn-on-dark btn-on-dark-ghost focus-ring"
            onClick={(event) => jumpTo(event, "contact")}
          >
            Start a Conversation
          </a>
          <a
            href={RESUME_HREF}
            download
            className="btn-on-dark btn-on-dark-ghost focus-ring"
          >
            Download Resume
          </a>
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
