import Image from "./SiteImage";
import Link from "next/link";
import { Check, ChevronDown, Cpu, Network, Wrench } from "lucide-react";
import { industries, projects, solutions } from "@/data/site";
import testimonials from "@/data/testimonials.json";
import {
  Advantages,
  ClientLogoStrip,
  EnquiryCTA,
  SectionHeading,
} from "./Common";
import HeroMedia from "./HeroMedia";
import { SourceFAQs } from "./Common";
import { RetainedContent } from "./DetailPages";
import { findPage } from "@/lib/content";
export default function Home() {
  return (
    <>
      <HeroMedia>
        <div className="container hero-content">
          <span className="eyebrow">
            ENGINEERING POSSIBILITY. DELIVERING RELIABILITY.
          </span>
          <h1>
            Engineering intelligent
            <br /> automation for{" "}
            <em>
              industries
              <br className="desktop-break" /> & infrastructure.
            </em>
          </h1>
          <p>
            Integrated automation, electrical engineering, highway, tunnel and
            solar solutions. Designed for reliable performance.
          </p>
          <div className="hero-actions">
            <Link className="button" href="/contact#enquiry">
              Discuss Your Project
            </Link>
            <a className="button outline" href="#solutions">
              Explore Our Solutions
            </a>
          </div>
        </div>
        <div className="hero-bottom container">
          <span>INDUSTRIAL AUTOMATION & INFRASTRUCTURE SOLUTIONS</span>
          <a href="#about" aria-label="Scroll to about Exelcius">
            SCROLL TO EXPLORE <ChevronDown size={17} />
          </a>
        </div>
      </HeroMedia>
      <section className="trust-strip">
        <div className="container">
          <div>
            <strong>Established in 2021</strong>
            <span>Built on engineering expertise</span>
          </div>
          <div>
            <Cpu />
            <strong>Engineering & integration</strong>
            <span>Control. Power. Intelligence.</span>
          </div>
          <div>
            <Wrench />
            <strong>In-house manufacturing</strong>
            <span>Panels, batteries & field equipment</span>
          </div>
          <div>
            <Network />
            <strong>Industry & infrastructure</strong>
            <span>From plant floor to open highway</span>
          </div>
        </div>
      </section>
      <section className="section about-intro container" id="about">
        <div className="about-copy">
          <SectionHeading
            label="WE ARE EXELCIUS AUTOMATION"
            title="Technology, power & infrastructure. Connected."
            text="An engineering partner with the capability to see the whole system — and the expertise to make it work."
          />
          <p>
            We bring together engineering, consulting, manufacturing and system
            integration for industrial processes and infrastructure. From the
            control panel to the field, we work alongside your team through
            design, installation and commissioning.
          </p>
          <ul className="check-list">
            <li>
              <Check />
              Multidisciplinary engineering expertise
            </li>
            <li>
              <Check />
              Manufacturing and system integration
            </li>
            <li>
              <Check />
              On-site execution and technical support
            </li>
          </ul>
          <Link className="text-link" href="/about-us">
            Discover Exelcius
          </Link>
        </div>
        <div className="about-photo">
          <Image
            src="/images/gallery-img/6.jpeg"
            alt="Exelcius electrical panel assembly"
            fill
            sizes="(max-width: 760px) 100vw, 45vw"
          />
          <div className="photo-caption">
            <span>ENGINEERED TO WORK TOGETHER</span>
            <strong>
              From concept.
              <br />
              To commissioning.
            </strong>
          </div>
        </div>
      </section>
      <section className="section solutions-section" id="solutions">
        <div className="container">
          <div className="section-heading-row">
            <SectionHeading
              label="OUR CORE SOLUTIONS"
              title="Five capabilities. One engineering partner."
            />
            <p>
              Purpose-built solutions for the systems your operations depend on.
            </p>
          </div>
          <div className="solution-editorial">
            {solutions.map((s, i) => (
              <Link
                className={"solution-feature solution-" + i}
                key={s.title}
                href={s.href}
              >
                <div className="solution-image">
                  <Image
                    src={s.cardImage || s.image}
                    alt={s.cardImageAlt || s.title + " equipment and systems"}
                    style={{ objectPosition: s.cardImagePosition || "center" }}
                    fill
                    sizes={
                      i === 0
                        ? "(max-width: 760px) 100vw, 50vw"
                        : "(max-width: 760px) 100vw, 33vw"
                    }
                  />
                </div>
                <div className="solution-copy">
                  <span className="eyebrow">{s.short}</span>
                  <h3>{s.title}</h3>
                  <p>{s.description}</p>
                  <span className="text-link">Explore Solution</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="section container">
        <div className="section-heading-row">
          <SectionHeading
            label="ENGINEERING IN ACTION"
            title="Real projects. Practical impact."
          />
          <Link href="/gallery?view=projects" className="text-link">
            View All Projects
          </Link>
        </div>
        <div className="featured-projects">
          {[projects[0], projects[3]].map((p) => (
            <Link
              className="project-card"
              href={"/gallery?project=" + p.id}
              key={p.id}
            >
              <div className="project-image">
                <Image
                  src={p.image!}
                  alt={p.name + " — original project photographs"}
                  fill
                  sizes="(max-width: 760px) 100vw, 50vw"
                />
                <span>{p.status}</span>
              </div>
              <div className="project-copy">
                <span className="eyebrow">{p.category}</span>
                <h3>{p.name}</h3>
                <p>{p.description}</p>
                <span className="text-link">View Project</span>
              </div>
            </Link>
          ))}
          <Link href="/gallery?project=hindalco" className="project-wide">
            <div>
              <span className="eyebrow">INDUSTRIAL & DIGITAL SYSTEMS</span>
              <h3>Connected operations at Hindalco Industries.</h3>
              <p>
                Asset management software, energy monitoring and smelter-plant
                PLC expansion.
              </p>
              <span className="text-link">Explore the Project</span>
            </div>
            <Image
              src="/profile/image84.png"
              alt="Hindalco Industries"
              width={150}
              height={125}
            />
          </Link>
        </div>
      </section>
      <Advantages />
      <section className="section industries-section">
        <div className="container industries-layout">
          <SectionHeading
            label="INDUSTRY EXPERIENCE"
            title="Different industries. Shared engineering standards."
            text="Automation and electrical capabilities shaped around the demands of your operations."
          />
          <div className="industries-grid">
            {industries.map((i) => (
              <span key={i}>{i}</span>
            ))}
          </div>
        </div>
      </section>
      <ClientLogoStrip />
      <section className="section testimonials">
        <div className="container">
          <SectionHeading
            label="OUR CUSTOMERS’ PERSPECTIVE"
            title="Trust, built through delivery."
          />
          <div className="testimonial-grid">
            {testimonials.slice(1, 3).map((t) => (
              <figure key={t.name}>
                <span className="quote-mark">“</span>
                <blockquote>{t.text}</blockquote>
                <figcaption>
                  <Image src={t.image} alt={t.name} width={54} height={54} />
                  <div>
                    <strong>{t.name}</strong>
                    {t.roles.map((r) => (
                      <span key={r}>{r}</span>
                    ))}
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
      <RetainedContent
        html={findPage("")!.html}
        label="Explore more engineering capabilities & company information"
      />
      <SourceFAQs slug="" />
      <EnquiryCTA />
    </>
  );
}
