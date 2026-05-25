import { Link } from "react-router-dom";
import { useState } from "react";
import useRevealOnScroll from "../hooks/useRevealOnScroll";
import CoverImage from "./CoverImage";
import ProjectVideoPlaceholder from "./Projects/ProjectVideoPlaceholder";
import TiltCard from "./TiltCard";
import RisoFrame from "./RisoFrame";
import MagneticButton from "./MagneticButton";
import SignatureTitle from "./SignatureTitle";
import projects from "../content/projects/index.js";

export default function Projects() {
  const sectionRef = useRevealOnScroll({ threshold: 0.2, staggerMs: 90 });
  const [activeSlug, setActiveSlug] = useState(projects[0]?.slug ?? "");
  const activeProject =
    projects.find((project) => project.slug === activeSlug) || projects[0];

  const activeIndex = Math.max(
    0,
    projects.findIndex((project) => project.slug === activeProject?.slug)
  );

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
            integrity all mattered at once. Hover, tap, or arrow through the
            menu to swap the preview.
          </p>
        </div>

        <div className="projects-grid reveal" data-reveal>
          <aside className="projects-menu" aria-label="Project menu">
            <div className="projects-menu-header">
              <p className="projects-menu-title">Game Menu</p>
              <p className="projects-menu-hint">Select a project to preview it.</p>
            </div>

            <div className="projects-list" role="listbox" aria-label="Project index">
              {projects.map((project, index) => (
                <button
                  key={project.slug}
                  type="button"
                  className={`project-row focus-ring ${activeSlug === project.slug ? "active" : ""}`}
                  onMouseEnter={() => setActiveSlug(project.slug)}
                  onFocus={() => setActiveSlug(project.slug)}
                  onClick={() => setActiveSlug(project.slug)}
                  role="option"
                  aria-selected={activeSlug === project.slug}
                >
                  <span className="project-row-index" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="project-row-body">
                    <span className="project-row-title">{project.title}</span>
                    <span className="project-row-subtitle">{project.subtitle}</span>
                    <span className="project-row-impact">{project.impact}</span>
                  </span>
                  <span className="project-row-arrow" aria-hidden="true">
                    {activeSlug === project.slug ? "▸" : "↗"}
                  </span>
                </button>
              ))}
            </div>

          </aside>

          <div className="projects-preview" aria-live="polite">
            {activeProject ? (
              <div key={activeProject.slug} className="projects-preview-surface">
                <TiltCard className="projects-preview-media" maxDeg={6}>
                  <RisoFrame colors={['red', 'cyan']}>
                    <span
                      className="riso-stamp"
                      aria-hidden="true"
                    >
                      № {String(activeIndex + 1).padStart(2, "0")}
                    </span>
                    {activeProject.cover ? (
                      <CoverImage
                        cover={activeProject.cover}
                        eager
                        className="projects-preview-image"
                        sizes="(min-width: 1024px) 42vw, 100vw"
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

                  <dl className="projects-preview-meta">
                    <div>
                      <dt>Client</dt>
                      <dd>{activeProject.client}</dd>
                    </div>
                    <div>
                      <dt>Year</dt>
                      <dd>{activeProject.year}</dd>
                    </div>
                    <div>
                      <dt>Role</dt>
                      <dd>{activeProject.role}</dd>
                    </div>
                  </dl>

                  <div className="project-stack">
                    {activeProject.stack.slice(0, 6).map((item) => (
                      <span key={item} className="tag">
                        {item}
                      </span>
                    ))}
                  </div>

                  {activeProject.highlights?.length ? (
                    <ul className="projects-preview-highlights">
                      {activeProject.highlights.slice(0, 3).map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : null}

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
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
