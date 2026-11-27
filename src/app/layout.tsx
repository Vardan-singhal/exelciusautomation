import type { Metadata } from "next";
import localFont from "next/font/local";
import { Suspense } from "react";
import Header from "@/components/Header";
import NavigationScroll from "@/components/NavigationScroll";
import { imageSrc } from "@/lib/image-urls.mjs";
import { Footer } from "@/components/Common";
import "./globals.css";
import "@/components/SourceHeadings.css";
export const metadata: Metadata = {
  metadataBase: new URL("https://www.exelciusautomation.com"),
  icons: { icon: { url: imageSrc("/images/favicon.ico"), type: "image/webp" } },
};
const roboto = localFont({
  src: "../assets/roboto-latin.woff2",
  weight: "300 700",
  display: "swap",
  variable: "--font-roboto",
});
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className={roboto.variable}>
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <Header />
        <main id="main-content">{children}</main>
        <Suspense fallback={null}>
          <NavigationScroll />
        </Suspense>
        <Footer />
      </body>
    </html>
  );
}
