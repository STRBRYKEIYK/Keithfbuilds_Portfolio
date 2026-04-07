import useRevealOnScroll from "../hooks/useRevealOnScroll";
import Carousel from "./ui/Carousel/Carousel";

const PROJECTS = [
  {
    title: "Toolbox POS System",
    subtitle: "Full-Stack Development",
    impact: "1,000+ SKUs Managed",
    color: "#1f9a67",
    stack: ["React 18", "TypeScript", "WebSocket", "PWA", "Tailwind"],
    desc: "A modern point-of-sale and inventory management system for toolbox operations with reliable real-time synchronization.",
    highlights: [
      "Barcode scanning + real-time inventory validation",
      "PWA with full offline functionality via IndexedDB",
      "Socket.IO multi-session stock synchronization",
      "Advanced cart with session persistence and recovery",
    ],
    liveDemoUrl: "https://strbrykeiyk.github.io/Toolbox_new_demo/",
  },
  {
    title: "Procurement Dept.",
    subtitle: "Frontend Development",
    impact: "Full Supply Chain Coverage",
    color: "#f08a24",
    stack: ["React", "TypeScript", "QR/Barcode", "WebSocket", "Axios"],
    desc: "Procurement and inventory module for supplier management and purchase order workflows with strong process visibility.",
    highlights: [
      "QR/barcode generation and scanning for inventory",
      "Multi-step purchase order creation wizard",
      "Duplicate detection for inventory integrity",
      "CSV/Excel import with validation and error reporting",
    ],
  },
  {
    title: "Finance Payroll Dept.",
    subtitle: "Full-Stack Financial Systems",
    impact: "Complete ERP Module",
    color: "#1f6f53",
    stack: ["React", "TypeScript", "State Machine", "Data Analytics"],
    desc: "Financial workflow platform for vouchers, payroll, billing, loans, and expenses with end-to-end audit coverage.",
    highlights: [
      "Multi-level approval states from draft to released",
      "Three voucher types with complete lifecycle handling",
      "Dynamic KPI dashboards with chart-based analytics",
      "Payroll support with bulk period processing",
    ],
  },
  {
    title: "Doc Automation Service",
    subtitle: "Backend Automation and OCR",
    impact: "Multi-Provider OCR Engine",
    color: "#2e8c67",
    stack: ["Express", "TypeScript", "Python", "OCR", "API"],
    desc: "Document ingestion service for extracting structured data from PDFs, images, and office files across enterprise workflows.",
    highlights: [
      "Multi-provider OCR using Tesseract, EasyOCR, and Qwen-VL",
      "Secure upload endpoints with validation and audit trails",
      "Support for PDF, Excel, Word, JPEG, PNG and more",
      "Concurrent processing pipeline for scalable intake",
    ],
  },
];

export default function Projects() {
  const sectionRef = useRevealOnScroll({ threshold: 0.2, staggerMs: 90 });

  const handleProjectKeyDown = (event, url) => {
    if (!url) return;
    if (event.key !== "Enter" && event.key !== " ") return;

    event.preventDefault();
    window.open(url, "_blank", "noopener,noreferrer");
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
          count={PROJECTS.length}
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
                    {PROJECTS.map((project, index) => (
                      <div
                        key={project.title}
                        className="projects-slide"
                        aria-hidden={activeIndex !== index}
                      >
                        <article
                          className="project-card focus-ring"
                          style={{ "--project-color": project.color }}
                          tabIndex={
                            activeIndex === index && project.liveDemoUrl
                              ? 0
                              : -1
                          }
                          onKeyDown={(event) =>
                            handleProjectKeyDown(event, project.liveDemoUrl)
                          }
                          aria-label={`${project.title} ${project.impact}${project.liveDemoUrl ? ". Press Enter to open live demo." : ""}`}
                        >
                          <p>{project.impact}</p>
                          <h3>{project.title}</h3>
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

                          {project.liveDemoUrl ? (
                            <a
                              href={project.liveDemoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="project-link focus-ring"
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
                  {PROJECTS.map((project, index) => (
                    <button
                      key={project.title}
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
