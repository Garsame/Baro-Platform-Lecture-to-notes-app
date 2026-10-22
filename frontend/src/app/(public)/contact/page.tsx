import MaterialIcon from "@/components/site/MaterialIcon";
import { getSiteContent } from "@/lib/site-content.server";
import ContactForm from "./ContactForm";
import "../home.css";
import "./contact.css";

export default async function ContactPage() {
  const { sections } = await getSiteContent();
  const c = sections.contact;
  const digits = c.whatsapp.replace(/[^\d]/g, "");

  const details = [
    c.contact_name && { icon: "person", label: "Contact", value: c.contact_name, href: null as string | null },
    c.email && { icon: "mail", label: "Email", value: c.email, href: `mailto:${c.email}` },
    c.phone && { icon: "call", label: "Phone", value: c.phone, href: `tel:${c.phone.replace(/[^\d+]/g, "")}` },
    c.whatsapp && digits && { icon: "chat", label: "WhatsApp", value: c.whatsapp, href: `https://wa.me/${digits}` },
    c.hours && { icon: "schedule", label: "Hours", value: c.hours, href: null },
  ].filter(Boolean) as { icon: string; label: string; value: string; href: string | null }[];

  return (
    <div className="home-page contact-page">
      <section className="contact-hero">
        <div className="home-wrap">
          <span className="home-eyebrow">Contact</span>
          <h1>{c.headline}</h1>
          <p className="home-lede">{c.intro}</p>
        </div>
      </section>
      <section className="home-section-tight">
        <div className="home-wrap contact-grid">
          {details.length > 0 && (
            <aside className="contact-details" aria-label="Contact details">
              {details.map((d) => (
                <div className="contact-detail" key={d.label}>
                  <span className="contact-detail-icon"><MaterialIcon name={d.icon} size={22} /></span>
                  <div>
                    <span className="contact-detail-label">{d.label}</span>
                    {d.href ? (
                      <a href={d.href} {...(d.href.startsWith("https://") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{d.value}</a>
                    ) : (
                      <span className="contact-detail-value">{d.value}</span>
                    )}
                  </div>
                </div>
              ))}
            </aside>
          )}
          <div className="contact-card"><ContactForm topics={c.topics} /></div>
        </div>
      </section>
    </div>
  );
}
