"use client";

import Link from "next/link";
import { useState } from "react";
import { apiUrl } from "@/lib/api";
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
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorText, setErrorText] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");
    setErrorText("");

    try {
      const res = await fetch(apiUrl("/api/v1/contact/"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, topic, message }),
      });

      if (!res.ok) {
        throw new Error("Failed to send message. Please try again later.");
      }

      setSubmitStatus("success");
      setName("");
      setEmail("");
      setTopic("");
      setMessage("");
    } catch (err: any) {
      setSubmitStatus("error");
      setErrorText(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
            {submitStatus === "success" ? (
              <div 
                style={{
                  padding: "2.5rem 1.5rem",
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "1.2rem",
                  animation: "fadeIn 0.4s ease-out forwards"
                }}
              >
                <div
                  style={{
                    width: "72px",
                    height: "72px",
                    borderRadius: "50%",
                    background: "rgba(16, 185, 129, 0.15)",
                    color: "#10b981",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "2rem",
                    fontWeight: "bold",
                    boxShadow: "0 8px 20px rgba(16, 185, 129, 0.1)"
                  }}
                >
                  ✓
                </div>
                <h2 style={{ fontSize: "1.8rem", margin: 0 }}>Message Sent!</h2>
                <p style={{ color: "var(--public-muted)", lineHeight: 1.6, margin: 0 }}>
                  Thank you for reaching out. Your message has been saved in our system and forwarded to the BaroBadi team. We will get back to you by email shortly.
                </p>
                <button 
                  type="button" 
                  onClick={() => setSubmitStatus("idle")} 
                  className="public-btn public-btn-primary"
                  style={{ marginTop: "1rem", width: "auto", paddingInline: "2rem" }}
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <>
                <h2>Send a message</h2>
                <p>
                  Share a short note about what you need and how the team can help.
                </p>
                <form className="public-form" onSubmit={handleSubmit}>
                  {submitStatus === "error" && (
                    <div className="alert alert-error" style={{ marginBottom: "1rem" }}>
                      {errorText}
                    </div>
                  )}

                  <div className="form-field">
                    <label>Full Name</label>
                    <input
                      name="name"
                      type="text"
                      placeholder="Your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label>Email Address</label>
                    <input
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label>Topic</label>
                    <input
                      name="topic"
                      type="text"
                      placeholder="Support, partnership, or setup"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label>Message</label>
                    <textarea
                      name="message"
                      placeholder="Tell us what you need help with"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="public-btn public-btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </button>
                </form>
              </>
            )}
            <p className="auth-switch">
              Ready to study? <Link href="/sign-up">Create an account</Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
