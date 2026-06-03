import Link from "next/link";
import {
  MdAdminPanelSettings,
  MdEmail,
  MdGroups,
  MdSupportAgent,
} from "react-icons/md";

const contactReasons = [
  {
    icon: MdSupportAgent,
    title: "Student support",
    description:
      "Questions about accounts, lecture processing, generated notes, or using your study dashboard.",
  },
  {
    icon: MdGroups,
    title: "Educator interest",
    description:
      "Ideas for using BaroBadi with recorded classes, course material, or student revision support.",
  },
  {
    icon: MdAdminPanelSettings,
    title: "Admin and deployment",
    description:
      "Help with system setup, monitoring, user management, and operational questions.",
  },
];

export default function ContactPage() {
  return (
    <>
      <section className="public-section public-section-soft">
        <div className="public-container">
          <div className="section-heading center">
            <span className="eyebrow">Contact us</span>
            <h1>Talk to the BaroBadi team.</h1>
            <p>
              Reach out about learning support, education partnerships, system
              setup, or feedback that can make the platform more useful for
              Somali-speaking students.
            </p>
          </div>
        </div>
      </section>

      <section className="public-section">
        <div className="public-container contact-layout">
          <div className="contact-options">
            <div className="contact-options-heading">
              <span className="eyebrow">How we can help</span>
              <h2>Choose the closest topic.</h2>
            </div>
            {contactReasons.map((item, index) => {
              const Icon = item.icon;
              return (
                <article className="contact-way" key={item.title}>
                  <span
                    className={`contact-way-icon ${
                      index === 1 ? "accent" : ""
                    }`}
                  >
                    <Icon />
                  </span>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </div>
                </article>
              );
            })}

            <article className="contact-email-line">
              <span className="contact-way-icon">
                <MdEmail />
              </span>
              <div>
                <strong>Email</strong>
                <a href="mailto:hello@barobadi.ai">hello@barobadi.ai</a>
                <p>
                  Send questions about support, setup, feedback, or classroom
                  use and the team can follow up by email.
                </p>
              </div>
            </article>
          </div>

          <div className="form-card">
            <h2>Send a message</h2>
            <p>
              Share a short note about what you need and how the team can help.
            </p>
            <form
              className="public-form"
              action="mailto:hello@barobadi.ai"
              method="post"
              encType="text/plain"
            >
              <div className="form-field">
                <label>Full Name</label>
                <input
                  name="name"
                  type="text"
                  placeholder="Your full name"
                  required
                />
              </div>
              <div className="form-field">
                <label>Email Address</label>
                <input
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div className="form-field">
                <label>Topic</label>
                <input
                  name="topic"
                  type="text"
                  placeholder="Support, partnership, or setup"
                  required
                />
              </div>
              <div className="form-field">
                <label>Message</label>
                <textarea
                  name="message"
                  placeholder="Tell us what you need help with"
                  required
                />
              </div>
              <button type="submit" className="public-btn public-btn-primary">
                Send Message
              </button>
            </form>
            <p className="auth-switch">
              Ready to study? <Link href="/sign-up">Create an account</Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
