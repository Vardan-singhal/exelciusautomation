import Image from "./SiteImage";
import Link from "next/link";
import ClientSlider from "./ClientSlider";
import { getSchemas } from "@/lib/content";
export function SourceFAQs({ slug }: { slug: string }) {
  const faqs = getSchemas(slug)
    .filter((s) => s["@type"] === "FAQPage")
    .flatMap((s) => s.mainEntity || []) as {
    name: string;
    acceptedAnswer: { text: string };
  }[];
  if (!faqs.length) return null;
  return (
    <section className="container retained source-faq">
      <details>
        <summary>Frequently asked questions</summary>
        <div>
          {faqs.map((q) => (
            <details key={q.name}>
              <summary>{q.name}</summary>
              <p>{q.acceptedAnswer.text}</p>
            </details>
          ))}
        </div>
      </details>
    </section>
  );
}
import {
  Cable,
  CircuitBoard,
  Cog,
  Factory,
  Handshake,
  Headset,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";
import {
  advantages,
  contact,
  phone,
  solutions,
  whatsapp,
} from "@/data/site";
export function SectionHeading({
  label,
  title,
  text,
  as: Title = "p",
}: {
  label: string;
  title: string;
  text?: string;
  as?: "h2" | "h3" | "p";
}) {
  return (
    <div className="section-heading">
      <span className="eyebrow">{label}</span>
      <Title className="section-title">{title}</Title>
      {text && <p>{text}</p>}
    </div>
  );
}
export function EnquiryCTA() {
  return (
    <section className="enquiry-cta">
      <div className="container cta-inner">
        <div>
          <span className="eyebrow">LET’S ENGINEER WHAT’S NEXT</span>
          <p className="display-h2 cta-heading">
            Have an engineering or
            <br /> automation project in mind?
          </p>
          <p>
            Let’s discuss your requirements and identify the right solution for
            your project.
          </p>
        </div>
        <div className="cta-actions">
          <Link className="button light" href="/contact#enquiry">
            Discuss Your Project
          </Link>
          <a className="text-link" href={`tel:${phone}`}>
            Talk to Our Team
          </a>
        </div>
      </div>
    </section>
  );
}
export function ClientLogoStrip() {
  return <ClientSlider />;
}
export function Advantages() {
  const icons = [CircuitBoard, Cable, Factory, Cog, Headset, Handshake];
  return (
    <section className="section why">
      <div className="container">
        <SectionHeading
          label="THE EXELCIUS APPROACH"
          title="A partner from concept to commissioning."
        />
        <div className="advantages">
          {advantages.map(([title, text], i) => {
            const Icon = icons[i];
            return (
              <div key={title}>
                <Icon size={28} strokeWidth={1.4} />
                <p className="display-h3">{title}</p>
                <p>{text}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
export function Footer() {
  return (
    <>
      <footer className="footer">
        <div className="container footer-grid">
          <div className="footer-company">
            <Link href="/" aria-label="Exelcius Automation home">
              <Image
                src="/images/logo/logo.webp"
                alt="Exelcius Automation"
                width={100}
                height={76}
              />
            </Link>
            <p>
              Industrial automation, electrical engineering and infrastructure
              solutions. From engineering to on-site execution.
            </p>
            <div className="socials">
              <a href={contact.linkedin_url} target="_blank" rel="noreferrer">
                LinkedIn
              </a>
              <a href={contact.facebook_url} target="_blank" rel="noreferrer">
                Facebook
              </a>
            </div>
          </div>
          <div>
            <h3>Quick Link</h3>
            <Link href="/about-us">About Us</Link>
            <Link href="/gallery?view=projects">Our Projects</Link>
            <Link href="/gallery">Gallery</Link>
            <Link href="/blogs">Insights</Link>
            <Link href="/career">Careers</Link>
            <Link href="/contact">Contact</Link>
          </div>
          <div>
            <h3>Products</h3>
            {solutions.map((s) => (
              <Link key={s.href} href={s.href}>
                {s.title}
              </Link>
            ))}
          </div>
          <div className="footer-contact">
            <h3>contact us</h3>
            <a href={`tel:${phone}`}>
              <Phone size={15} />
              {contact.phone_primary}
            </a>
            <a href={"mailto:" + contact.email_sales}>
              <Mail size={15} />
              {contact.email_sales}
            </a>
            <p>
              <MapPin size={17} />
              {contact.address}
            </p>
            <a href={whatsapp} target="_blank" rel="noreferrer">
              <MessageCircle size={16} />
              WhatsApp our team
            </a>
            <span>{contact.working_hours}</span>
            <h3 className="footer-enquiry-heading">Enquiry Form</h3>
            <Link href="/contact#enquiry">Discuss Your Project</Link>
          </div>
        </div>
        <div className="container footer-bottom">
          <span>
            © {new Date().getFullYear()} Exelcius Automation Private Limited.
          </span>
          <span>Engineering. Integration. Execution.</span>
          <Link href="/sitemap.html">Sitemap</Link>
        </div>
      </footer>
      <a
        href={whatsapp}
        className="floating-whatsapp"
        aria-label="Enquire on WhatsApp"
        target="_blank"
        rel="noreferrer"
      >
        <MessageCircle size={25} />
      </a>
      <div className="mobile-conversion">
        <a href={`tel:${phone}`}>
          <Phone size={17} />
          Call
        </a>
        <a href={whatsapp}>
          <MessageCircle size={18} />
          WhatsApp
        </a>
        <Link href="/contact#enquiry">Discuss Your Project</Link>
      </div>
    </>
  );
}
export function PageHero({
  label,
  title,
  text,
  image,
  banner,
  titleAs: Title = "h1",
}: {
  label: string;
  title: string;
  text?: string;
  image?: string;
  banner?: string;
  titleAs?: "h1" | "p";
}) {
  if (banner)
    return (
      <section className="page-hero page-hero-banner">
        <Image
          src={banner}
          alt=""
          width={2170}
          height={725}
          sizes="100vw"
          preload
        />
        <div className="page-banner-copy">
          <div className="container">
            <div className="breadcrumbs">
              <Link href="/">Home</Link>
              <span>/</span>
              <span>{label}</span>
            </div>
            <div className="page-banner-accessible-copy">
              <span className="eyebrow">{label}</span>
              <Title className="page-hero-title">{title}</Title>
              {text && <p>{text}</p>}
            </div>
          </div>
        </div>
      </section>
    );
  return (
    <section className={"page-hero" + (image ? " has-image" : "")}>
      {image && <Image src={image} alt="" fill sizes="100vw" priority />}
      <div className="container">
        <div className="breadcrumbs">
          <Link href="/">Home</Link>
          <span>/</span>
          <span>{label}</span>
        </div>
        <span className="eyebrow">{label}</span>
        <Title className="page-hero-title">{title}</Title>
        {text && <p>{text}</p>}
      </div>
    </section>
  );
}
