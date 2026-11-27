import Image from "./SiteImage";
import { ArrowUpRight } from "lucide-react";
import { certificates } from "@/data/home-credentials.json";
import "./HomeCredentials.css";

function CertificateCards({ items }: { items: typeof certificates }) {
  return (
    <div className="home-certificate-grid">
      {items.map((certificate) => (
        <a key={certificate.src} className="home-certificate" href={certificate.href} target="_blank" rel="noopener noreferrer" aria-label={`View ${certificate.alt} (PDF, opens in a new tab)`}>
          <Image src={certificate.src} alt={certificate.alt} width={300} height={425} sizes="(max-width:760px) 45vw, 23vw" />
          <span>{certificate.alt}<span>View PDF <ArrowUpRight size={16} /></span></span>
        </a>
      ))}
    </div>
  );
}

export default function CertificatesSection() {
  return (
    <section className="section home-certifications" aria-labelledby="home-certifications-heading">
      <div className="container">
        <div className="section-heading">
          <span className="eyebrow">COMPANY CREDENTIALS</span>
          <h3 className="section-title" id="home-certifications-heading">Our Certifications</h3>
        </div>
        <CertificateCards items={certificates.slice(0, 4)} />
        <details className="home-more-certificates">
          <summary>View all 13 certificates</summary>
          <CertificateCards items={certificates.slice(4)} />
        </details>
      </div>
    </section>
  );
}
