import Image from "./SiteImage";
import { clients } from "@/data/home-credentials.json";
import "./HomeCredentials.css";

export default function ClientSlider() {
  return (
    <section className="section container home-clients" aria-labelledby="home-clients-heading">
      <div className="section-heading-row">
        <div className="section-heading">
          <span className="eyebrow">TRUSTED ACROSS INDUSTRY & INFRASTRUCTURE</span>
          <h3 className="section-title" id="home-clients-heading">Our Prestigious Clients</h3>
        </div>
      </div>
      <div className="home-client-viewport" tabIndex={0} role="region" aria-label="Client logos; hover or focus to pause scrolling">
        <div className="home-client-track" id="home-client-logos">
          {[false, true].map((duplicate) => (
            <ul className="home-client-group" key={String(duplicate)} aria-hidden={duplicate ? true : undefined}>
              {clients.map((client) => (
                <li key={client.src}>
                  <Image src={client.src} alt={duplicate ? "" : client.alt} width={210} height={110} />
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}
