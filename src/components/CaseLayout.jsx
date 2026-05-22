import { Link } from 'react-router-dom'
import SignatureTitle from './SignatureTitle'
import CoverImage from './CoverImage'
import ProjectVideoPlaceholder from './Projects/ProjectVideoPlaceholder'
import RisoFrame from './RisoFrame'
import TiltCard from './TiltCard'
import MagneticButton from './MagneticButton'

/**
 * Reusable case-study layout used by the /project/[slug] route.
 *
 * Design references (from the May 2026 award-portfolio research):
 *  - SignatureTitle as the recurring identity move (Andreas Antonsson)
 *  - Fixed 4-column metadata strip: Client · Year · Role · Stack (Code by Jesse)
 *  - Four narrative sections: Story / Why / How / What (Valentin Gassend)
 *  - "Next project" link at the bottom (Andreas Antonsson)
 */
export default function CaseLayout({ project, nextProject }) {
  if (!project) return null

  return (
    <article
      className="case-article"
      style={{ '--project-color': project.color }}
    >
      <header className="case-hero">
        <div className="case-hero-text">
          <p className="kicker">Case Study</p>
          <SignatureTitle
            as="h1"
            className="case-title"
            text={project.title}
            spacing="0.2em"
            misregisterColor="red"
          />
          <p className="case-subtitle">{project.subtitle}</p>
          <p className="case-impact">{project.impact}</p>
        </div>

        <TiltCard className="case-hero-media" maxDeg={5}>
          <RisoFrame colors={['red', 'cyan']}>
            {project.cover ? (
              <CoverImage cover={project.cover} eager className="case-cover-img" />
            ) : (
              <ProjectVideoPlaceholder
                color={project.color}
                posterLabel="Case preview"
                badgeText="Case"
              />
            )}
          </RisoFrame>
        </TiltCard>
      </header>

      <div className="case-meta-rail">
        <dl className="case-meta">
          <div>
            <dt>Client</dt>
            <dd>{project.client}</dd>
          </div>
          <div>
            <dt>Year</dt>
            <dd>{project.year}</dd>
          </div>
          <div>
            <dt>Role</dt>
            <dd>{project.role}</dd>
          </div>
          <div>
            <dt>Stack</dt>
            <dd>{project.stack.join(' / ')}</dd>
          </div>
        </dl>

        <div className="case-cta">
          {project.liveDemoUrl ? (
            <MagneticButton
              as="a"
              href={project.liveDemoUrl}
              target="_blank"
              rel="noreferrer"
              className="project-link focus-ring"
            >
              Open Live Demo →
            </MagneticButton>
          ) : (
            <span className="project-link project-link-soon">Demo coming soon</span>
          )}

          {project.repoUrl ? (
            <MagneticButton
              as="a"
              href={project.repoUrl}
              target="_blank"
              rel="noreferrer"
              className="project-link project-link-ghost focus-ring"
            >
              View Repository →
            </MagneticButton>
          ) : null}
        </div>
      </div>

      <div className="case-body">
        <section className="case-section">
          <h2>Story</h2>
          <p>{project.story}</p>
        </section>

        <section className="case-section">
          <h2>Why</h2>
          <p>{project.why}</p>
        </section>

        <section className="case-section">
          <h2>How</h2>
          <p>{project.how}</p>
        </section>

        <section className="case-section">
          <h2>What</h2>
          <p>{project.what}</p>
          {project.highlights && project.highlights.length > 0 ? (
            <ul className="case-highlights">
              {project.highlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}
        </section>
      </div>

      {project.collaborators && project.collaborators.length > 0 ? (
        <section className="case-section">
          <h2>Credits</h2>
          <ul className="case-credits">
            {project.collaborators.map((c) => (
              <li key={c.name}>
                {c.url ? (
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noreferrer"
                    className="focus-ring"
                  >
                    {c.name}
                  </a>
                ) : (
                  c.name
                )}
                {c.role ? <span> — {c.role}</span> : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {nextProject ? (
        <nav className="case-next" aria-label="Next project">
          <Link to={`/project/${nextProject.slug}`} className="focus-ring">
            <span>Next project</span>
            <strong>{nextProject.title}</strong>
          </Link>
        </nav>
      ) : null}
    </article>
  )
}
