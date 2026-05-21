import { Link, useNavigate } from "react-router-dom";
import useRevealOnScroll from "../hooks/useRevealOnScroll";
import Carousel from "./ui/Carousel/Carousel";
import projects from "../content/projects/index.js";

export default function Projects() {
  const sectionRef = useRevealOnScroll({ threshold: 0.2, staggerMs: 90 });
  const navigate = useNavigate();

  const goToCase = (slug) => {
    navigate(`/project/${slug}`);
  };

  const handleProjectKeyDown = (event, slug) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    goToCase(slug);
  };

  return (
    <section id="projects" className="portfolio-panel" ref={sectionRef}>
      <div className="panel-inner">
        <p className="kicker reveal" data-reveal>
          Selected Work
        </p>

        <h2 className="panel-title reveal" data-reveal>
          Systems delivered for real workflows.
        </h2>

        <p className="panel-copy reveal" data-reveal>
          Representative projects where interface speed, process reliability,
          and maintainable code quality were all required at once.
        </p>

        <Carousel.Root
          count={projects.length}
          initialIndex={0}
          transitionMs={360}
          loop={false}
        >
          <Carousel.Panel>
            {({ activeIndex, count, goPrev, goNext, goTo }) => (
              <div className="projects-carousel reveal" data-reveal>
                <div className="projects-carousel-head">
                  <p className="projects-counter" aria-live="polite">
                    {String(activeIndex + 1).padStart(2, "0")} /{" "}
                    {String(count).padStart(2, "0")}
                  </p>

                  <div className="projects-controls">
                    <button
                      type="button"
                      className="projects-nav focus-ring"
                      onClick={goPrev}
                      disabled={activeIndex === 0}
                      aria-label="Previous project"
                    >
                      Prev
                    </button>

                    <button
                      type="button"
                      className="projects-nav focus-ring"
                      onClick={goNext}
                      disabled={activeIndex === count - 1}
                      aria-label="Next project"
                    >
                      Next
                    </button>
                  </div>
                </div>

                <div className="projects-viewport">
                  <div
                    className="projects-track"
                    style={{ transform: `translateX(-${activeIndex * 100}%)` }}
                  >
                    {projects.map((project, index) => (
                      <div
                        key={project.slug}
                        className="projects-slide"
                        aria-hidden={activeIndex !== index}
                      >
                        <article
                          className="project-card focus-ring"
                          style={{ "--project-color": project.color }}
                          tabIndex={activeIndex === index ? 0 : -1}
                          onKeyDown={(event) =>
                            handleProjectKeyDown(event, project.slug)
                          }
                          aria-label={`${project.title} — ${project.impact}. Press Enter to open the case study.`}
                        >
                          <p>{project.impact}</p>
                          <h3>
                            <Link
                              to={`/project/${project.slug}`}
                              className="project-card-title-link focus-ring"
                              tabIndex={activeIndex === index ? 0 : -1}
                            >
                              {project.title}
                            </Link>
                          </h3>
                          <p>{project.subtitle}</p>

                          <p>{project.desc}</p>

                          <div className="project-stack">
                            {project.stack.map((item) => (
                              <span key={item} className="tag">
                                {item}
                              </span>
                            ))}
                          </div>

                          <ul className="project-highlights">
                            {project.highlights.map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>

                          <div className="project-card-actions">
                            <Link
                              to={`/project/${project.slug}`}
                              className="project-link focus-ring"
                              tabIndex={activeIndex === index ? 0 : -1}
                            >
                              Read Case Study
                            </Link>

                            {project.liveDemoUrl ? (
                              <a
                                href={project.liveDemoUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="project-link project-link-ghost focus-ring"
                                tabIndex={activeIndex === index ? 0 : -1}
                                onClick={(event) => event.stopPropagation()}
                              >
                                Open Live Demo
                              </a>
                            ) : (
                              <span
                                className="project-link project-link-soon"
                                aria-label="Live demo coming soon"
                              >
                                Demo coming soon
                              </span>
                            )}
                          </div>
                        </article>
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  className="projects-dots"
                  role="tablist"
                  aria-label="Project picker"
                >
                  {projects.map((project, index) => (
                    <button
                      key={project.slug}
                      type="button"
                      className={`project-dot focus-ring ${activeIndex === index ? "active" : ""}`}
                      onClick={() => goTo(index)}
                      role="tab"
                      aria-selected={activeIndex === index}
                      aria-label={`View ${project.title}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </Carousel.Panel>
        </Carousel.Root>
      </div>
    </section>
  );
}
