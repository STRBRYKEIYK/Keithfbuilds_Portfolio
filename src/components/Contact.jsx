import { useState } from 'react'
import useRevealOnScroll from '../hooks/useRevealOnScroll'
import { FaCheckCircle } from 'react-icons/fa'

const CONTACT_LINKS = [
  {
    label: 'Email',
    value: 'keithfelipe024@gmail.com',
    href: 'mailto:keithfelipe024@gmail.com',
  },
  {
    label: 'Phone',
    value: '+63 921 605 4768',
    href: 'tel:+639216054768',
  },
  {
    label: 'Location',
    value: 'Antipolo, Rizal PH',
    href: null,
  },
  {
    label: 'GitHub',
    value: 'github.com/STRBRYKEIYK',
    href: 'https://github.com/STRBRYKEIYK',
  },
]

export default function Contact() {
  const sectionRef = useRevealOnScroll({ threshold: 0.2, staggerMs: 90 })
  const CONTACT_ENDPOINT = import.meta.env.VITE_CONTACT_ENDPOINT || '/api/contact'
  const CONTACT_ANALYTICS_ENDPOINT =
    import.meta.env.VITE_CONTACT_ANALYTICS_ENDPOINT || '/api/contact-analytics'

  const [formState, setFormState] = useState({
    name: '',
    email: '',
    message: '',
    company: '',
  })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorMsg('')
    setSending(true)

    try {
      const res = await fetch(CONTACT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formState.name,
          email: formState.email,
          message: formState.message,
          company: formState.company,
        }),
      })

      const payload = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(payload?.error || 'Unable to send message right now.')
      }

      const analyticsPayload = JSON.stringify({
        event: 'contact_submit_success',
        source: 'contact_form',
        ts: Date.now(),
      })

      if (navigator.sendBeacon) {
        navigator.sendBeacon(CONTACT_ANALYTICS_ENDPOINT, analyticsPayload)
      } else {
        fetch(CONTACT_ANALYTICS_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: analyticsPayload,
          keepalive: true,
        }).catch(() => {})
      }

      setSent(true)
      setFormState({ name: '', email: '', message: '', company: '' })
    } catch (error) {
      setErrorMsg(error.message || 'Unable to send message right now.')
    } finally {
      setSending(false)
    }
  }

  return (
    <section id="contact" className="portfolio-panel" ref={sectionRef}>
      <div className="panel-inner contact-grid">
        <div>
          <p className="kicker reveal" data-reveal>
            Contact
          </p>

          <h2 className="panel-title reveal" data-reveal>
            Let&apos;s build something useful and reliable.
          </h2>

          <p className="panel-copy reveal" data-reveal>
            Open to full-time remote roles, long-term collaborations, and product-focused freelance
            engagements.
          </p>

          <div className="contact-list reveal" data-reveal>
            {CONTACT_LINKS.map((item) => (
              <div key={item.label} className="contact-item">
                <span>{item.label}</span>
                {item.href ? (
                  <a href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
                    {item.value}
                  </a>
                ) : (
                  <strong>{item.value}</strong>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="reveal" data-reveal>
          {sent ? (
            <div className="sent-card" role="status">
              <FaCheckCircle />
              <h3>Message sent</h3>
              <p>Thanks for reaching out. I will reply as soon as possible.</p>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="sr-only" aria-hidden="true">
                <label htmlFor="contact-company">Company</label>
                <input
                  id="contact-company"
                  name="company"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={formState.company}
                  onChange={(event) =>
                    setFormState((state) => ({ ...state, company: event.target.value }))
                  }
                />
              </div>

              {errorMsg ? (
                <div className="form-error" role="alert">
                  {errorMsg}
                </div>
              ) : null}

              <label htmlFor="contact-name">Your Name</label>
              <input
                id="contact-name"
                type="text"
                required
                placeholder="John Doe"
                value={formState.name}
                onChange={(event) =>
                  setFormState((state) => ({ ...state, name: event.target.value }))
                }
              />

              <label htmlFor="contact-email">Email Address</label>
              <input
                id="contact-email"
                type="email"
                required
                placeholder="hello@company.com"
                value={formState.email}
                onChange={(event) =>
                  setFormState((state) => ({ ...state, email: event.target.value }))
                }
              />

              <label htmlFor="contact-message">Message</label>
              <textarea
                id="contact-message"
                required
                placeholder="Tell me about your project or role."
                value={formState.message}
                onChange={(event) =>
                  setFormState((state) => ({ ...state, message: event.target.value }))
                }
              />

              <button type="submit" className="btn btn-primary" disabled={sending}>
                {sending ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
