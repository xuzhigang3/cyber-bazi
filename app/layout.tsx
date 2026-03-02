import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "./LanguageContext";

export const metadata: Metadata = {
  title: {
    default: "Cyber Bazi - AI Destiny & Time Rhythm Analysis",
    template: "%s | Cyber Bazi"
  },
  description: "Experience profound self-discovery with Cyber Bazi. Traditional Four Pillars of Destiny (Bazi) analysis powered by advanced AI for precise, personalized life guidance.",
  keywords: ["Bazi", "Chinese Astrology", "AI Fortune Telling", "Four Pillars of Destiny", "八字", "算命", "赛博算命"],
  authors: [{ name: "Cyber Bazi Team" }],
  creator: "Cyber Bazi",
  metadataBase: new URL("https://cyber-bazi.kaiserxu.asia"),
  alternates: {
    canonical: "/",
    languages: {
      "zh-CN": "/?lang=zh",
      "en-US": "/?lang=en",
    },
  },
  openGraph: {
    title: "Cyber Bazi - AI Destiny Analysis",
    description: "Traditional wisdom meets modern AI. Get your personalized Bazi report instantly.",
    url: "https://cyber-bazi.kaiserxu.asia",
    siteName: "Cyber Bazi",
    images: [
      {
        url: "/og-image.png", // User would need to provide this, or I can generate one later if asked
        width: 1200,
        height: 630,
        alt: "Cyber Bazi - AI Destiny Analysis",
      },
    ],
    locale: "zh_CN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cyber Bazi - AI Destiny Analysis",
    description: "Traditional wisdom meets modern AI. Get your personalized Bazi report instantly.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

import JsonLd from "./components/JsonLd";
import Script from "next/script";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  return (
    <html lang="zh">
      <head>
        {adsenseId && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
      </head>
      <body className="font-sans antialiased bg-theme-bg text-theme-text">
        <LanguageProvider>
          <JsonLd />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
