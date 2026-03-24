import { useEffect, useRef, useState } from "react";
import {
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaGithub,
  FaCheckCircle,
} from "react-icons/fa";

export default function Contact() {
  const sectionRef = useRef(null);
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll("[data-reveal]").forEach((el, i) => {
              setTimeout(() => el.classList.add("visible"), i * 100);
            });
          }
        });
      },
      { threshold: 0.1 },
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
    }, 1800);
  };

  const links = [
    {
      label: "Email",
      value: "keithfelipe024@gmail.com",
      href: "mailto:keithfelipe024@gmail.com",
      icon: <FaEnvelope />,
    },
    {
      label: "Phone",
      value: "+63 921 605 4768",
      href: "tel:+639216054768",
      icon: <FaPhoneAlt />,
    },
    {
      label: "Location",
      value: "Antipolo, Rizal PH",
      href: null,
      icon: <FaMapMarkerAlt />,
    },
    {
      label: "Github",
      value: "STRBRYKEIYK",
      href: "https://github.com/STRBRYKEIYK",
      icon: <FaGithub />,
    },
  ];

  return (
    <>
      <style>{`
        .contact {
          padding: 140px 0;
          background: var(--bg-2);
          overflow: hidden;
          position: relative;
        }
        .contact::before {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 800px;
          height: 400px;
          background: radial-gradient(ellipse, rgba(22,193,114,0.04) 0%, transparent 70%);
          pointer-events: none;
        }
        .contact-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 40px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
        }
        .contact-left {}
        .contact-section-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #16C172;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .contact-section-label::before {
          content: '';
          display: block;
          width: 24px;
          height: 1px;
          background: #16C172;
        }
        .contact-heading {
          font-size: clamp(36px, 4vw, 56px);
          color: #E8F5F0;
          margin-bottom: 24px;
          line-height: 1.05;
        }
        .contact-heading em {
          color: #16C172;
          font-style: normal;
        }
        .contact-desc {
          font-size: 15px;
          color: #7A9E8C;
          font-weight: 300;
          line-height: 1.8;
          margin-bottom: 48px;
        }
        .contact-links {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .contact-link-row {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px 0;
          border-bottom: 1px solid rgba(22,193,114,0.06);
        }
        .contact-link-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #4A6B57;
          width: 70px;
          flex-shrink: 0;
        }
        .contact-link-value {
          font-size: 14px;
          color: #7A9E8C;
          transition: color 0.2s;
          flex: 1;
        }
        a.contact-link-value:hover { color: #16C172; }
        .contact-link-arrow {
          color: #4A6B57;
          font-size: 12px;
          opacity: 0;
          transition: opacity 0.2s, transform 0.2s;
        }
        a:hover .contact-link-arrow {
          opacity: 1;
          transform: translateX(4px);
        }
        /* Form */
        .contact-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .form-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #4A6B57;
        }
        .form-input,
        .form-textarea {
          background: rgba(22,193,114,0.03);
          border: 1px solid rgba(22,193,114,0.1);
          border-radius: 6px;
          padding: 14px 18px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          color: #E8F5F0;
          outline: none;
          transition: border-color 0.3s, box-shadow 0.3s;
          width: 100%;
        }
        .form-input:focus,
        .form-textarea:focus {
          border-color: rgba(22,193,114,0.4);
          box-shadow: 0 0 0 3px rgba(22,193,114,0.06);
        }
        .form-input::placeholder,
        .form-textarea::placeholder {
          color: #4A6B57;
        }
        .form-textarea {
          resize: vertical;
          min-height: 120px;
        }
        .form-submit {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: #16C172;
          color: #050A07;
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 16px 32px;
          border-radius: 6px;
          width: 100%;
          transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
          margin-top: 8px;
        }
        .form-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(22,193,114,0.3);
        }
        .form-submit:disabled {
          opacity: 0.6;
        }
        .sent-msg {
          text-align: center;
          padding: 32px;
          background: rgba(22,193,114,0.05);
          border: 1px solid rgba(22,193,114,0.2);
          border-radius: 8px;
        }
        .sent-icon {
          font-size: 36px;
          margin-bottom: 12px;
        }
        .sent-title {
          font-family: 'Syne', sans-serif;
          font-size: 20px;
          color: #16C172;
          margin-bottom: 8px;
        }
        .sent-sub {
          font-size: 13px;
          color: #7A9E8C;
        }
        @media (max-width: 900px) {
          .contact-inner {
            grid-template-columns: 1fr;
            gap: 60px;
          }
        }
        @media (max-width: 768px) {
          .contact { padding: 100px 0; }
          .contact-inner { padding: 0 24px; }
        }
      `}</style>

      <section id="contact" className="contact" ref={sectionRef}>
        <div className="contact-inner">
          <div className="contact-left">
            <div className="contact-section-label reveal" data-reveal>
              Get In Touch
            </div>
            <h2 className="contact-heading reveal" data-reveal>
              Let's build
              <br />
              something <em>great</em>
            </h2>
            <p className="contact-desc reveal" data-reveal>
              I'm open to remote full-time roles, freelance projects, and
              long-term collaborations. If you need a developer who ships
              enterprise-quality work — let's talk.
            </p>

            <div className="contact-links">
              {links.map((link, i) => (
                <div
                  key={link.label}
                  className="reveal"
                  data-reveal
                  style={{ transitionDelay: `${i * 80}ms` }}
                >
                  {link.href ? (
                    <a
                      href={link.href}
                      className="contact-link-row"
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      <span style={{ fontSize: 18, color: "#16C172" }}>
                        {link.icon}
                      </span>
                      <span className="contact-link-label">{link.label}</span>
                      <span className="contact-link-value">{link.value}</span>
                      <span className="contact-link-arrow">→</span>
                    </a>
                  ) : (
                    <div
                      className="contact-link-row"
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      <span style={{ fontSize: 18, color: "#16C172" }}>
                        {link.icon}
                      </span>
                      <span className="contact-link-label">{link.label}</span>
                      <span className="contact-link-value">{link.value}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div
            className="reveal"
            data-reveal
            style={{ transitionDelay: "200ms" }}
          >
            {sent ? (
              <div className="sent-msg">
                <div className="sent-icon">
                  <FaCheckCircle color="#16C172" />
                </div>
                <div className="sent-title">Message Sent!</div>
                <p className="sent-sub">
                  Thanks for reaching out. I'll get back to you soon.
                </p>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Your Name</label>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="John Doe"
                    required
                    value={formState.name}
                    onChange={(e) =>
                      setFormState((s) => ({ ...s, name: e.target.value }))
                    }
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    className="form-input"
                    type="email"
                    placeholder="hello@company.com"
                    required
                    value={formState.email}
                    onChange={(e) =>
                      setFormState((s) => ({ ...s, email: e.target.value }))
                    }
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Message</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Tell me about your project or opportunity..."
                    required
                    value={formState.message}
                    onChange={(e) =>
                      setFormState((s) => ({ ...s, message: e.target.value }))
                    }
                  />
                </div>
                <button
                  className="form-submit"
                  type="submit"
                  disabled={sending}
                >
                  {sending ? "Sending..." : "Send Message →"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
