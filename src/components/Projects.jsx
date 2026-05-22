import { Link } from "react-router-dom";
import { useState } from "react";
import useRevealOnScroll from "../hooks/useRevealOnScroll";
import useDraggableRail from "../hooks/useDraggableRail";
import CoverImage from "./CoverImage";
import ProjectVideoPlaceholder from "./Projects/ProjectVideoPlaceholder";
import TiltCard from "./TiltCard";
import RisoFrame from "./RisoFrame";
import MagneticButton from "./MagneticButton";
import SignatureTitle from "./SignatureTitle";
import projects from "../content/projects/index.js";

export default function Projects() {
  const sectionRef = useRevealOnScroll({ threshold: 0.2, staggerMs: 90 });
  const { ref: railRef, scrollBy } = useDraggableRail();
  const [activeSlug, setActiveSlug] = useState(projects[0]?.slug ?? "");
  const activeProject =
    projects.find((project) => project.slug === activeSlug) || projects[0];

  return (
    <section id="projects" className="portfolio-panel" ref={sectionRef}>
      <div className="panel-inner projects-panel">
        <div className="projects-head reveal" data-reveal>
          <p className="kicker">Case Index</p>
          <SignatureTitle
            as="h2"
            className="panel-title"
            text="Selected systems and product stories."
            spacing="0.06em"
            misregisterColor="cyan"
          />
          <p className="panel-copy">
            A focused index of delivery work where reliability, speed, and data
            integrity all mattered at once. Drag the rail to browse · Click to
            open the case study.
          </p>
        </div>

        <div className="projects-grid reveal" data-reveal>
          <div className="projects-rail-wrap" style={{ position: "relative" }}>
            <button
              type="button"
              className="draggable-rail-chevron prev focus-ring"
              onClick={() => scrollBy(-320)}
              aria-label="Scroll project list left"
            >
              ←
            </button>

            <div
              className="projects-list draggable-rail"
              role="listbox"
              aria-label="Project index"
              ref={railRef}
              style={{
                display: "flex",
                flexDirection: "row",
                gap: "0.6rem",
                padding: "0.4rem 0.2rem",
              }}
            >
              {projects.map((project, index) => (
                <Link
                  key={project.slug}
                  to={`/project/${project.slug}`}
                  className={`project-row focus-ring ${activeSlug === project.slug ? "active" : ""}`}
                  onMouseEnter={() => setActiveSlug(project.slug)}
                  onFocus={() => setActiveSlug(project.slug)}
                  role="option"
                  aria-selected={activeSlug === project.slug}
                  style={{ flex: "0 0 220px", scrollSnapAlign: "start" }}
                >
                  <span className="project-row-index">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="project-row-title">{project.title}</span>
                  <span className="project-row-subtitle">{project.subtitle}</span>
                  <span className="project-row-impact">{project.impact}</span>
                </Link>
              ))}
            </div>

            <button
              type="button"
              className="draggable-rail-chevron next focus-ring"
              onClick={() => scrollBy(320)}
              aria-label="Scroll project list right"
            >
              →
            </button>
          </div>

          <div className="projects-preview" aria-live="polite">
            {activeProject ? (
              <>
                <TiltCard className="projects-preview-media" maxDeg={6}>
                  <RisoFrame colors={['red', 'cyan']}>
                    <span
                      className="riso-stamp"
                      aria-hidden="true"
                    >
                      № {String(projects.findIndex((p) => p.slug === activeProject.slug) + 1).padStart(2, "0")}
                    </span>
                    {activeProject.cover ? (
                      <CoverImage
                        cover={activeProject.cover}
                        eager
                        className="projects-preview-image"
                        sizes="(min-width: 1024px) 520px, 100vw"
                      />
                    ) : (
                      <ProjectVideoPlaceholder
                        color={activeProject.color}
                        posterLabel="Case preview"
                        badgeText="Case"
                      />
                    )}
                  </RisoFrame>
                </TiltCard>

                <div className="projects-preview-body">
                  <p className="projects-preview-kicker">{activeProject.impact}</p>
                  <h3>{activeProject.title}</h3>
                  <p className="projects-preview-subtitle">
                    {activeProject.subtitle}
                  </p>
                  <p className="projects-preview-copy">{activeProject.desc}</p>

                  <div className="project-stack">
                    {activeProject.stack.map((item) => (
                      <span key={item} className="tag">
                        {item}
                      </span>
                    ))}
                  </div>

                  <div className="project-card-actions">
                    <MagneticButton
                      as={Link}
                      to={`/project/${activeProject.slug}`}
                      className="project-link focus-ring"
                    >
                      Read Case Study
                    </MagneticButton>

                    {activeProject.liveDemoUrl ? (
                      <MagneticButton
                        as="a"
                        href={activeProject.liveDemoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="project-link project-link-ghost focus-ring"
                      >
                        Open Live Demo
                      </MagneticButton>
                    ) : (
                      <span
                        className="project-link project-link-soon"
                        aria-label="Live demo coming soon"
                      >
                        Demo coming soon
                      </span>
                    )}
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
