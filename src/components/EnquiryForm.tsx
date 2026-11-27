"use client";
import { useState } from "react";
import { contact, solutions, whatsapp } from "@/data/site";
export default function EnquiryForm() {
  const [draft, setDraft] = useState("");
  return (
    <form
      id="enquiry"
      className="enquiry-form"
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        setDraft(
          `mailto:${contact.email_sales}?subject=${encodeURIComponent("Project enquiry — " + f.get("company"))}&body=${encodeURIComponent([...f.entries()].map(([k, v]) => `${k}: ${v}`).join("\n"))}`,
        );
      }}
    >
      <span className="eyebrow">LET’S START A CONVERSATION</span>
      <p className="display-h2">Tell us about your project.</p>
      <p>Share a few details with our engineering team.</p>
      <div className="form-grid">
        <label>
          Full name <span>*</span>
          <input name="name" autoComplete="name" required maxLength={100} />
        </label>
        <label>
          Company name <span>*</span>
          <input
            name="company"
            autoComplete="organization"
            required
            maxLength={150}
          />
        </label>
        <label>
          Work email <span>*</span>
          <input type="email" name="email" autoComplete="email" required />
        </label>
        <label>
          Phone number
          <input
            type="tel"
            name="phone"
            autoComplete="tel"
            pattern={"[+0-9\\s\\(\\)\\-]{7,20}"}
            title="Enter 7–20 characters using digits, spaces, +, - or parentheses."
          />
        </label>
        <label>
          Industry
          <input
            name="industry"
            placeholder="e.g. Manufacturing"
            maxLength={100}
          />
        </label>
        <label>
          Solution required <span>*</span>
          <select name="solution" required defaultValue="">
            <option value="" disabled>
              Select a solution
            </option>
            {solutions.map((s) => (
              <option key={s.title}>{s.title}</option>
            ))}
            <option>Other / Need guidance</option>
          </select>
        </label>
        <label className="full">
          Project description <span>*</span>
          <textarea
            name="description"
            rows={4}
            required
            minLength={15}
            maxLength={5000}
            placeholder="Your requirements, location and expected timeline"
          />
        </label>
      </div>
      <p className="form-note">
        This frontend form prepares an email draft. Nothing is sent or stored
        here. You can also <a href={whatsapp}>enquire on WhatsApp</a>.
      </p>
      <button className="button" type="submit">
        Prepare Enquiry Email
      </button>
      {draft && (
        <div className="draft-ready" role="status">
          <strong>Your email draft is ready.</strong>
          <p>
            Open it in your email app, review your details and send it to our
            team.
          </p>
          <a className="button" href={draft}>
            Open Email Draft
          </a>
        </div>
      )}
    </form>
  );
}
