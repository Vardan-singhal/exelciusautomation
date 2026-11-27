import Home from "@/components/Home";
import { getMetadata, getCanonical, getSchemas, jsonLd } from "@/lib/content";
export const metadata = getMetadata("");
export default function Page() {
  return (
    <>
      <link rel="canonical" href={getCanonical("")} />
      {getSchemas("").map((s, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(s) }}
        />
      ))}
      <Home />
    </>
  );
}
