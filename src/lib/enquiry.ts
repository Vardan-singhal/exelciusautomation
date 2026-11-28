import { contact } from "@/data/site";

export const enquiryFields = [
  ["name", "Full Name"],
  ["email", "Email"],
  ["phone", "Phone Number"],
  ["product", "Product Name"],
  ["category", "Category Name"],
  ["address", "Address"],
  ["message", "Message"],
] as const;

export function enquiryEmail(data: FormData, pageUrl: string) {
  const body = enquiryFields.map(([name, label]) => `${label}: ${String(data.get(name) || "").trim()}`).join("\n");
  const subject = "Product enquiry — " + String(data.get("product") || "").trim();
  return `mailto:${contact.email_sales}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body + "\n\nPage: " + pageUrl)}`;
}
