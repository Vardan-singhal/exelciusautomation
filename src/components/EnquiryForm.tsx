"use client";
import { useState } from "react";
import { whatsapp } from "@/data/site";
import { categories } from "@/data/category-navigation.json";
import { enquiryEmail } from "@/lib/enquiry";

export default function EnquiryForm({ id = "enquiry" }: { id?: string }) {
  const [draft, setDraft] = useState("");
  return (
    <form
      id={id}
      className="enquiry-form"
      aria-labelledby={`${id}-heading`}
      onChange={() => setDraft("")}
      onSubmit={(event) => {
        event.preventDefault();
        setDraft(enquiryEmail(new FormData(event.currentTarget), window.location.href));
      }}
    >
      <span className="eyebrow">LET’S START A CONVERSATION</span>
      <p className="display-h2" id={`${id}-heading`}>Enquiry Form</p>
      <p>Share your requirements with our engineering team. Fields marked * are required.</p>
      <div className="form-grid">
        <label>
          Full Name <span>*</span>
          <input name="name" autoComplete="name" required maxLength={100} />
        </label>
        <label>
          Email <span>*</span>
          <input type="email" name="email" autoComplete="email" required maxLength={254} />
        </label>
        <label>
          Phone Number <span>*</span>
          <input type="tel" name="phone" autoComplete="tel" required maxLength={25}
            pattern={"(?=(?:[^0-9]*[0-9]){7,15}[^0-9]*$)[+0-9\\s\\(\\)\\-]+"}
            title="Enter a phone number with 7–15 digits. Spaces, +, hyphens and parentheses are allowed." />
        </label>
        <label>
          Product Name <span>*</span>
          <input name="product" required maxLength={150} placeholder="Enter the product you need" />
        </label>
        <label>
          Category Name <span>*</span>
          <select name="category" required defaultValue="">
            <option value="" disabled>Select a category</option>
            {categories.map(category => <option key={category.id} value={category.title}>{category.title}</option>)}
            <option value="Other / Need guidance">Other / Need guidance</option>
          </select>
        </label>
        <label>
          Address
          <input name="address" autoComplete="street-address" maxLength={500} />
        </label>
        <label className="full">
          Message <span>*</span>
          <textarea name="message" rows={4} required maxLength={5000} placeholder="Tell us about your requirements" />
        </label>
      </div>
      <p className="form-note">
        Prepare your enquiry, then open the email draft to review and send.
        You can also <a href={whatsapp}>enquire on WhatsApp</a>.
      </p>
      <button className="button" type="submit">Prepare Enquiry Email</button>
      {draft && (
        <div className="draft-ready" role="status">
          <strong>Your email draft is ready.</strong>
          <p>Open it in your email app, review your details and send it to our team.</p>
          <a className="button" href={draft}>Open Email Draft</a>
        </div>
      )}
    </form>
  );
}
