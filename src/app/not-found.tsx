import Link from "next/link";
export default function NotFound() {
  return (
    <section className="section container error-page">
      <span className="eyebrow">PAGE NOT FOUND</span>
      <h1>Let’s get you back on track.</h1>
      <p>
        The requested page could not be found. Explore our solutions or contact
        our engineering team.
      </p>
      <Link className="button" href="/">
        Return Home
      </Link>
      <Link className="text-link" href="/contact">
        Contact Our Team
      </Link>
    </section>
  );
}
