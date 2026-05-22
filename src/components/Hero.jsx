import useRevealOnScroll from "../hooks/useRevealOnScroll";
import SignatureTitle from "./SignatureTitle";
import LiveTimeChip from "./LiveTimeChip";
import PipeBracket from "./PipeBracket";
import MagneticButton from "./MagneticButton";
import RisoFrame from "./RisoFrame";

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
      <div className="panel-inner hero-shell">
        <div className="hero-meta-row reveal" data-reveal>
          <LiveTimeChip />
          <a
            href="#contact"
            className="available-chip focus-ring"
            onClick={(event) => jumpTo(event, "contact")}
          >
            Available for work -&gt;
          </a>
        </div>

        <div className="hero-header reveal" data-reveal>
          <p className="hero-eyebrow">Portfolio 2026 · Keith Wilhelm Felipe</p>

          <div className="hero-wordmark-stack" aria-label="Full-stack engineer">
            <SignatureTitle as="span" text="FULL" misregisterColor="red" spacing="0.04em" />
            <SignatureTitle as="span" text="STACK" misregisterColor="cyan" spacing="0.04em" />
            <SignatureTitle as="span" text="ENGINEER" misregisterColor="red" spacing="0.04em" />
          </div>

          <p className="hero-three-nouns-stack">
            <strong>Developer</strong> · Architect · AI-native operator
          </p>

          <p className="hero-subtitle">
            <PipeBracket>AI native systems</PipeBracket> for procurement,
            finance, and inventory teams that run every day.
          </p>
        </div>

        <div className="hero-asym-grid reveal" data-reveal>
          <p className="hero-tagline">
            I design and ship React + TypeScript platforms with real-time data,
            audit-ready workflows, and interfaces that never slow a team down.
          </p>

          <RisoFrame as="dl" className="hero-cards" colors={['red', 'cyan']}>
            <div>
              <dt>Focus</dt>
              <dd>Operational web apps and critical data flows.</dd>
            </div>
            <div>
              <dt>Systems</dt>
              <dd>POS, procurement, finance, document automation.</dd>
            </div>
            <div>
              <dt>Delivery</dt>
              <dd>Architect-led, AI-assisted, shipped fast.</dd>
            </div>
          </RisoFrame>
        </div>

        <div className="hero-actions-block reveal" data-reveal>
          <div className="hero-actions-new">
            <MagneticButton
              as="a"
              href="#projects"
              className="btn-on-dark focus-ring"
              onClick={(event) => jumpTo(event, "projects")}
            >
              View Selected Work -&gt;
            </MagneticButton>
            <MagneticButton
              as="a"
              href={RESUME_HREF}
              download
              className="btn-on-dark btn-on-dark-ghost focus-ring"
            >
              Download Resume
            </MagneticButton>
          </div>
        </div>

        <div className="hero-ticker" aria-hidden="true">
          <div className="hero-ticker-track">
            <span>
              Operational systems / realtime data / AI native workflows /
              finance automation / procurement ops /
            </span>
            <span>
              Operational systems / realtime data / AI native workflows /
              finance automation / procurement ops /
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
