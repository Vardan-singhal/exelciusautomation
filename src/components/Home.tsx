import Image from "./SiteImage";
import Link from "next/link";
import { EnquiryButton } from "./EnquiryProvider";
import { ChevronDown, Cpu, Network, Wrench } from "lucide-react";
import { solutions } from "@/data/site";
import home from "@/data/home-content.json";
import testimonials from "@/data/testimonials.json";
import { blogs } from "@/lib/content";
import { ClientLogoStrip, EnquiryCTA, SourceFAQs } from "./Common";
import HeroMedia from "./HeroMedia";
import CertificatesSection from "./CertificatesSection";

export default function Home() {
  const latestBlogs = [...blogs].sort((a, b) => b.blog_date.localeCompare(a.blog_date) || Number(b.id) - Number(a.id)).slice(0, 8);
  return (
    <>
      <HeroMedia>
        <div className="container hero-content">
          <span className="eyebrow">
            ENGINEERING POSSIBILITY. DELIVERING RELIABILITY.
          </span>
          <h1>{home.primary}</h1>
          <p>
            Integrated automation, electrical engineering, highway, tunnel and
            solar solutions. Designed for reliable performance.
          </p>
          <div className="hero-actions">
            <EnquiryButton className="button">
              Discuss Your Project
            </EnquiryButton>
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
          <span className="eyebrow">WE ARE EXELCIUS AUTOMATION</span>
          <p className="display-h2">Technology, power &amp; infrastructure. Connected.</p>
          <p>{home.introduction}</p>
          <ul className="source-introduction-points">{home.introductionPoints.map(point => <li key={point}>{point}</li>)}</ul>
          <p>We bring together engineering, consulting, manufacturing and system integration for industrial processes and infrastructure. From the control panel to the field, we work alongside your team through design, installation and commissioning.</p>
          <Link className="text-link" href="/about-us">Discover Exelcius</Link>
        </div>
        <div className="about-photo">
          <Image src="/images/gallery-img/6.jpeg" alt="Exelcius electrical panel assembly" fill sizes="(max-width:760px) 100vw,45vw" />
          <div className="photo-caption"><span>ENGINEERED TO WORK TOGETHER</span><strong>From concept.<br />To commissioning.</strong></div>
        </div>
      </section>
      <section className="section industries-section">
        <div className="container">
          <div className="section-heading"><span className="eyebrow">INDUSTRY EXPERIENCE</span><h2>Our Focused Industries</h2></div>
          <div className="source-industry-grid">
            {home.industries.map((industry) => (
              <article key={industry.title}>
                <Image src={industry.src} alt={industry.alt} width={600} height={350} sizes="(max-width:760px) 100vw,33vw" />
                <h3>{industry.title}</h3>
                <details><summary>Industry applications</summary><h4>{industry.detailTitle}</h4><p>{industry.description}</p></details>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="section solutions-section" id="solutions">
        <div className="container">
          <div className="section-heading-row"><div className="section-heading"><span className="eyebrow">OUR CORE SOLUTIONS</span><h3 className="section-title">Our Main Leading Services</h3></div><p>Purpose-built solutions for the systems your operations depend on.</p></div>
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
                  <p className="display-h3">{s.title}</p>
                  <p>{s.description}</p>
                  <span className="text-link">Explore Solution</span>
                </div>
              </Link>
            ))}
          </div>


          <div className="source-services">
            {home.services.map((service) => (
              <details key={service.title}><summary><h4>{service.title}</h4></summary><Image src={service.src} alt={service.alt} width={755} height={397} sizes="(max-width:760px) 100vw,33vw" /><p>{service.description}</p></details>
            ))}
          </div>
        </div>
      </section>
      <section className="section container source-partners">
        <div className="section-heading"><span className="eyebrow">TECHNOLOGY &amp; EQUIPMENT</span><h3 className="section-title">Our Trusted Partners</h3></div>
        <div className="source-partner-logos" tabIndex={0} role="region" aria-label="Trusted partner logos; hover or focus to pause scrolling">
          <div className="source-partner-track">
            {[false, true].map((duplicate) => (
              <div className="source-partner-group" key={String(duplicate)} aria-hidden={duplicate ? true : undefined}>
                {home.partners.map((partner) => <Image key={partner.src} src={partner.src} alt={duplicate ? "" : partner.alt} width={210} height={110} />)}
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="section why">
        <div className="container">
          <div className="section-heading"><span className="eyebrow">THE EXELCIUS APPROACH</span><h3 className="section-title">Why to Choose Exelcius Automation</h3></div>
          <div className="advantages source-advantages">{home.advantages.map((advantage) => <div key={advantage.title}><h4>{advantage.title}</h4><p>{advantage.description}</p></div>)}</div>
        </div>
      </section>
      <section className="section container">
        <div className="section-heading-row"><div className="section-heading"><span className="eyebrow">ENGINEERING KNOWLEDGE</span><h3 className="section-title">Our Blogs</h3></div><Link href="/blogs" className="text-link">View All Blogs</Link></div>
        <div className="blog-grid source-home-blogs" tabIndex={0} aria-label="Latest blogs; scroll to explore all eight posts">{latestBlogs.map((blog) => (
          <Link className="blog-card" href={"/" + blog.slug} key={blog.slug}>
            <div className="blog-image"><Image src={blog.image} alt={blog.title} fill sizes="(max-width:760px) 100vw,33vw" /></div>
            <time dateTime={blog.blog_date}>{blog.blog_date}</time><h4>{blog.title}</h4><p>{(home.blogExcerpts as Record<string, string>)[blog.slug]}</p><span className="text-link">Read Blog</span>
          </Link>
        ))}</div>
      </section>
      <section className="home-delivered-projects" aria-labelledby="delivered-projects-heading">
        <div className="container">
          <h3 id="delivered-projects-heading">Major Delivered Projects</h3>
          <div className="delivered-project-list" dangerouslySetInnerHTML={{ __html: home.projectHtml }} />
        </div>
      </section>
      <CertificatesSection />
      <section className="section testimonials">
        <div className="container">
          <div className="section-heading"><span className="eyebrow">OUR CUSTOMERS&rsquo; PERSPECTIVE</span><h2>What Our Clients Say<span className="source-heading-line">About Our Solar Solutions</span></h2></div>
          <div className="testimonial-grid">
            {testimonials.map((testimonial) => (
              <figure key={testimonial.name}><span className="quote-mark">&ldquo;</span><blockquote>{testimonial.text}</blockquote><figcaption><Image src={testimonial.image} alt={testimonial.name} width={54} height={54} /><div><strong>{testimonial.name}</strong>{testimonial.roles.map((role) => <span key={role}>{role}</span>)}</div></figcaption></figure>
            ))}
          </div>
        </div>
      </section>
      <ClientLogoStrip />
      <SourceFAQs slug="" />
      <EnquiryCTA />
    </>
  );
}
