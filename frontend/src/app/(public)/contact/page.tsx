import type { Metadata } from "next";
import { FaWhatsapp } from "react-icons/fa6";
import MaterialIcon from "@/components/site/MaterialIcon";
import { getSiteContent } from "@/lib/site-content.server";
import ContactForm from "./ContactForm";
import CopyButton from "./CopyButton";
import "../home.css";
import "./contact.css";

export const metadata: Metadata = { title: "Contact" };

export default async function ContactPage() {
  const { sections } = await getSiteContent();
  const c = sections.contact;

  const cards = [
    c.contact_name && { icon: <MaterialIcon name="support_agent" size={22} />, k: "Contact", v: c.contact_name, copy: false },
    c.email && { icon: <MaterialIcon name="mail" size={22} />, k: "Email", v: c.email, copy: true },
    c.phone && { icon: <MaterialIcon name="call" size={22} />, k: "Phone", v: c.phone, copy: true },
    c.whatsapp && { icon: <FaWhatsapp aria-hidden="true" />, k: "WhatsApp", v: c.whatsapp, copy: true },
    c.hours && { icon: <MaterialIcon name="schedule" size={22} />, k: "Office hours", v: c.hours, copy: false },
  ].filter(Boolean) as { icon: React.ReactNode; k: string; v: string; copy: boolean }[];

  return (
    <div className="home-page contact-page">
      <section className="contact-hero ruled">
        <div className="home-wrap">
          <span className="home-eyebrow">Contact</span>
          <h1>{c.headline}</h1>
          <p className="home-lede">{c.intro}</p>
        </div>
      </section>
      <div className="home-wrap contact-grid">
        {cards.length > 0 && (
          <div className="contact-cards">
            {cards.map((card) => (
              <div className="ccard" key={card.k}>
                <span className="ic">{card.icon}</span>
                <div><div className="k">{card.k}</div><div className="v">{card.v}</div></div>
                {card.copy && <CopyButton text={card.v} />}
              </div>
            ))}
          </div>
        )}
        <div className="form-card"><ContactForm topics={c.topics} /></div>
      </div>
    </div>
  );
}
