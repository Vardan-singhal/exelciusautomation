import Image from "./SiteImage";
import Link from "next/link";
import { contact, industries, projects, solutions } from "@/data/site";
import { pages, blogs, findBlog, findPage } from "@/lib/content";
import {
  Advantages,
  EnquiryCTA,
  PageHero,
  SectionHeading,
  SourceFAQs,
} from "./Common";
import EnquiryForm from "./EnquiryForm";
import ProjectGallery from "./ProjectGallery";
import { pageBanners } from "@/data/pageBanners";
export function RetainedContent({
  html,
  label = "Technical information & specifications",
}: {
  html: string;
  label?: string;
}) {
  return html ? (
    <section className="container retained">
      <details>
        <summary>{label}</summary>
        <div
          className="legacy-content"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </details>
    </section>
  ) : null;
}
export function SolutionPage({
  solution,
}: {
  solution: (typeof solutions)[number];
}) {
  const idx = solutions.indexOf(solution);
  const p = findPage(solution.href.slice(1))!;
  const related = pages.filter(
    (p) =>
      (solution.groups.includes(p.group) ||
        (idx === 4 &&
          ["SCADA", "Human-Machine-Interfaces"].includes(p.slug))) &&
      "/" + p.slug !== solution.href,
  );
  const relevantProjects = projects.filter((p) => p.solution === idx);
  return (
    <>
      <PageHero
        label="OUR SOLUTIONS"
        banner={pageBanners[solution.href]}
        title={p.heading}
        titleAs={/<h1\b/i.test(p.html) ? "p" : "h1"}
        text={solution.description}
      />
      <section className="section container solution-detail">
        <div className="solution-detail-image">
          <Image
            src={solution.image}
            alt={solution.title + " equipment"}
            fill
            sizes="(max-width:760px) 100vw, 45vw"
          />
        </div>
        <div>
          <SectionHeading
            label="ENGINEERED AROUND YOUR REQUIREMENTS"
            title={solution.short}
          />
          <ul className="capability-list">
            {solution.capabilities.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
          <Link href="/contact#enquiry" className="button">
            Discuss Your Project
          </Link>
        </div>
      </section>
      <section className="section container solution-content">
        <article
          className="legacy-content"
          aria-label={solution.title + " details"}
          dangerouslySetInnerHTML={{ __html: p.html }}
        />
      </section>
      <section className="section soft">
        <div className="container">
          <SectionHeading
            label="PRODUCTS & EQUIPMENT"
            title="The detail behind the solution."
          />
          <div className="product-links">
            {related.map((p) => (
              <Link key={p.slug} href={p.url}>
                <p className="display-h3">{p.heading}</p>
                <span>Explore technical details</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="section container">
        <SectionHeading
          label="APPLICATIONS"
          title="Built for demanding environments."
        />
        <div className="industry-tags">
          {industries.map((i) => (
            <span key={i}>{i}</span>
          ))}
        </div>
        {relevantProjects.length > 0 && (
          <>
            <p className="display-h2 subheading">Related project experience</p>
            <div className="related-projects">
              {relevantProjects.map((p) => (
                <Link href={"/gallery?project=" + p.id} key={p.id}>
                  <span className="eyebrow">{p.status}</span>
                  <p className="display-h3">{p.name}</p>
                  <p>{p.description}</p>
                  <span className="text-link">View Project</span>
                </Link>
              ))}
            </div>
          </>
        )}
      </section>
      <SourceFAQs slug={p.slug} />
      <EnquiryCTA />
    </>
  );
}
export function ProductPage({ slug }: { slug: string }) {
  const p = findPage(slug)!;
  const related = pages
    .filter((x) => x.group === p.group && x.slug !== p.slug)
    .slice(0, 8);
  return (
    <>
      <PageHero
        label={
          p.group === "articles-solutions"
            ? "ENGINEERING INSIGHTS"
            : "PRODUCTS & CAPABILITIES"
        }
        title={p.heading}
        titleAs={/<h1\b/i.test(p.html) ? "p" : "h1"}
      />
      <div className="container detail-layout">
        <article
          className="legacy-content"
          dangerouslySetInnerHTML={{ __html: p.html }}
        />
        <aside className="detail-aside">
          <span className="eyebrow">ENGINEERING SUPPORT</span>
          <p className="display-h2">Find the right fit for your project.</p>
          <p>
            Discuss selection, technical requirements and system integration
            with our team.
          </p>
          <Link className="button" href="/contact#enquiry">
            Discuss Your Project
          </Link>
          {findBlog(slug) && (
            <Link className="text-link" href={"/blog.php?slug=" + slug}>
              Read the related insight
            </Link>
          )}
          <p className="display-h3">Related information</p>
          {related.map((x) => (
            <Link key={x.slug} href={x.url}>
              {x.heading}
            </Link>
          ))}
        </aside>
      </div>
      <SourceFAQs slug={p.slug} />
      <EnquiryCTA />
    </>
  );
}
export function AboutPage() {
  return (
    <>
      <PageHero
        label="ABOUT EXELCIUS"
        banner={pageBanners["/about-us"]}
        title={findPage("about-us")!.heading}
        text="An industrial automation, electrical engineering and infrastructure solutions partner."
      />
      <section className="section container about-intro">
        <div>
          <SectionHeading
            label="ESTABLISHED IN 2021"
            title="Engineering the complete picture."
          />
          <p>
            Exelcius Automation specializes in engineering, consulting,
            manufacturing and the integration of automated production systems.
            We combine mechanics, electrical systems, automation,
            instrumentation and information systems for manufacturing and
            industrial processes.
          </p>
          <p>
            We involve customers throughout each project, bringing together
            technology integration, domain knowledge, customer support and
            on-site execution.
          </p>
        </div>
        <div className="about-photo">
          <Image
            src="/images/gallery-img/8.jpg"
            alt="The Exelcius Automation team"
            fill
            sizes="(max-width:760px) 100vw, 45vw"
          />
        </div>
      </section>
      <section className="section soft">
        <div className="container two-column">
          <div>
            <span className="eyebrow">OUR VISION</span>
            <p className="display-h2">
              Smart automation.
              <br />
              Sustainable infrastructure.
            </p>
            <p>
              To become a global leader in smart automation and sustainable
              infrastructure solutions, shaping the future of industries,
              tunnels, highways, and urban mobility.
            </p>
          </div>
          <div>
            <span className="eyebrow">OUR MISSION</span>
            <p className="display-h2">
              Reliable systems.
              <br />
              Long-term value.
            </p>
            <p>
              By integrating advanced automation, renewable energy, and
              intelligent monitoring systems, we help industries and governments
              build reliable, energy-efficient, and future-ready infrastructure.
            </p>
          </div>
        </div>
      </section>
      <section className="section container">
        <SectionHeading
          label="OUR LEADERSHIP"
          title="People behind the engineering."
        />
        <div className="leadership">
          <div>
            <Image
              src="/profile/image9.png"
              alt="Puneet Audichya"
              width={350}
              height={400}
            />
            <div>
              <span className="eyebrow">BUSINESS & SALES DIRECTOR</span>
              <p className="display-h3">Puneet Audichya</p>
              <p>
                Puneet leads company operations and business responsibilities
                across regions. His previous experience includes Emerson
                Process, ABB, Rockwell Automation, Honeywell and Pepperl+Fuchs
                in India.
              </p>
            </div>
          </div>
          <div>
            <Image
              src="/profile/image10.png"
              alt="Shikha Audichya"
              width={350}
              height={400}
            />
            <div>
              <span className="eyebrow">FINANCE DIRECTOR</span>
              <p className="display-h3">Shikha Audichya</p>
              <p>
                A founding team member, Shikha brings more than 15 years of
                experience. Her professional background includes Bharti Airtel,
                where she received recognition for her work.
              </p>
            </div>
          </div>
        </div>
      </section>
      <Advantages />
      <RetainedContent
        html={findPage("about-us")!.html}
        label="More about our company & capabilities"
      />
      <EnquiryCTA />
    </>
  );
}
export function ContactPage() {
  return (
    <>
      <PageHero
        label="CONTACT OUR TEAM"
        banner={pageBanners["/contact"]}
        title={findPage("contact")!.heading}
        text="Consultation, product selection or a new project — tell us what you have in mind."
      />
      <section className="section container contact-layout">
        <div>
          <span className="eyebrow">EXELCIUS AUTOMATION PRIVATE LIMITED</span>
          <p className="display-h2">Let’s find the right solution.</p>
          <p>
            Reach our team directly, or prepare an enquiry with your project
            requirements.
          </p>
          <address>
            <strong>Visit us</strong>
            <p>{contact.address}</p>
            <a href={contact.map_link} target="_blank" rel="noreferrer">
              View location on Google Maps
            </a>
            <strong>Call our team</strong>
            <a href={"tel:" + contact.phone_primary.replace(/[^+\d]/g, "")}>
              {contact.phone_primary}
            </a>
            <a href={"tel:" + contact.phone_secondary.replace(/[^+\d]/g, "")}>
              {contact.phone_secondary}
            </a>
            <strong>Email</strong>
            <a href={"mailto:" + contact.email_sales}>{contact.email_sales}</a>
            <a href={"mailto:" + contact.email_support}>
              {contact.email_support}
            </a>
            <strong>Working hours</strong>
            <p>{contact.working_hours}</p>
          </address>
        </div>
        <EnquiryForm />
      </section>
    </>
  );
}
export function BlogsPage() {
  return (
    <>
      <PageHero
        label="BLOGS"
        banner={pageBanners["/blogs"]}
        title={findPage("blogs")!.heading}
        text="Explore automation, electrical systems, infrastructure and energy."
      />
      <section className="section container">
        <div className="blog-grid">
          {[...blogs]
            .sort((a, b) => b.blog_date.localeCompare(a.blog_date) || Number(b.id) - Number(a.id))
            .map((b) => (
              <Link className="blog-card" href={"/" + b.slug} key={b.slug}>
                {b.image && (
                  <div className="blog-image">
                    <Image
                      src={b.image}
                      alt={b.title}
                      fill
                      sizes="(max-width:760px) 100vw, 33vw"
                    />
                  </div>
                )}
                <time dateTime={b.blog_date}>
                  {new Date(b.blog_date).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    timeZone: "Asia/Kolkata",
                  })}
                </time>
                <h3>{b.title}</h3>
                <span className="text-link">Read Insight</span>
              </Link>
            ))}
        </div>
      </section>
      <EnquiryCTA />
    </>
  );
}
export function BlogPage({ slug }: { slug: string }) {
  const b = findBlog(slug)!;
  return (
    <>
      <PageHero label="ENGINEERING INSIGHTS" title={b.title} />
      <article className="article container">
        <div className="article-meta">
          <span>{b.admin_name}</span>
          <time dateTime={b.blog_date}>{b.blog_date}</time>
          <Link href="/blogs">All Insights</Link>
        </div>
        {b.image && (
          <div className="article-image">
            <Image
              src={b.image}
              alt={b.title}
              fill
              sizes="(max-width:760px) 100vw, 900px"
              priority
            />
          </div>
        )}
        <div
          className="legacy-content"
          dangerouslySetInnerHTML={{ __html: b.html }}
        />
      </article>
      <EnquiryCTA />
    </>
  );
}
export function GalleryPage({
  project,
  view,
}: {
  project?: string;
  view?: string;
}) {
  const p = projects.find((p) => p.id === project);
  if (p)
    return (
      <>
        <PageHero label={p.category} title={p.name} text={p.description} />
        <section className="section container">
          <div className="project-overview">
            <div>
              <span className="eyebrow">{p.status}</span>
              <p className="display-h2">{p.client}</p>
              <p className="display-h3">Scope & supplied solutions</p>
              <ul className="capability-list">
                {p.scope.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
              {p.note && <p className="source-note">{p.note}</p>}
              <p className="source-note">Source: {p.source}.</p>
              <Link href={solutions[p.solution].href} className="text-link">
                Explore {solutions[p.solution].title}
              </Link>
            </div>
            {p.image && (
              <div className="project-detail-image">
                <Image
                  src={p.image}
                  alt={
                    p.name +
                    (p.id === "tunnel-systems"
                      ? " — indicative technical screen"
                      : p.id === "hindalco"
                        ? " — testimonial portrait"
                        : " — source photograph")
                  }
                  width={800}
                  height={650}
                />
              </div>
            )}
          </div>
          {p.gallery.length > 0 && (
            <div className="photo-grid">
              {p.gallery.map((s, i) => (
                <Image
                  key={s}
                  src={s}
                  alt={p.name + " installation photograph " + (i + 1)}
                  width={700}
                  height={600}
                />
              ))}
            </div>
          )}
          <Link href="/gallery?view=projects" className="text-link">
            View All Projects
          </Link>
        </section>
        <EnquiryCTA />
      </>
    );
  return (
    <>
      <PageHero
        label={view === "projects" ? "OUR PROJECTS" : "PROJECT GALLERY"}
        banner={
          pageBanners[
            view === "projects" ? "/gallery?view=projects" : "/gallery"
          ]
        }
        title={findPage("gallery")!.heading}
        text="Original photographs, delivered systems and project experience from our company portfolio."
      />
      <section className="section container">
        <ProjectGallery />
        {view !== "projects" && (
          <>
            <SectionHeading
              label="BEHIND THE ENGINEERING"
              title="Our people. Our workplace."
            />
            <div className="photo-grid">
              {[
                "1.jpeg",
                "2.jpeg",
                "3.jpeg",
                "4.jpeg",
                "5.jpeg",
                "6.jpeg",
                "7.jpeg",
                "8.jpg",
                "9.jpg",
                "10.jpg",
              ].map((f, i) => (
                <Image
                  key={f}
                  src={"/images/gallery-img/" + f}
                  alt={
                    [
                      "Company leadership at the office",
                      "Exelcius workspace and equipment",
                      "Engineering workstation",
                      "Team member at a workstation",
                      "Company premises",
                      "Electrical panel assembly",
                      "Control panels in the workshop",
                      "Exelcius team gathering",
                      "Company team photograph",
                      "Exelcius team at the office",
                    ][i]
                  }
                  width={700}
                  height={530}
                />
              ))}
            </div>
          </>
        )}
      </section>
      <EnquiryCTA />
    </>
  );
}
export function CareerPage() {
  return (
    <>
      <PageHero
        label="CAREERS"
        title={findPage("career")!.heading}
        text="Engineering, consulting, manufacturing and automation — work on the systems that keep industry moving."
      />
      <section className="section container two-column">
        <div>
          <SectionHeading
            label="WORK WITH EXELCIUS"
            title="Bring your engineering perspective."
          />
          <div
            className="legacy-content"
            dangerouslySetInnerHTML={{ __html: findPage("career")!.html }}
          />
        </div>
        <div className="career-contact">
          <p className="display-h2">Start a conversation with us.</p>
          <p>
            Tell us about your experience, skills and the role you are
            interested in. Attach your résumé when sending your email.
          </p>
          <a
            href={
              "mailto:" + contact.email_support + "?subject=Career%20enquiry"
            }
            className="button"
          >
            Email Your Profile
          </a>
          <p className="form-note">
            Your email application opens to prepare your message. No application
            is submitted through this frontend.
          </p>
        </div>
      </section>
    </>
  );
}
