import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  metadataBase: new URL("https://scenesetu.vercel.app"),
  title: {
    default: "SceneSetu | AI-Native Content Operations & Campaign Intelligence",
    template: "%s | SceneSetu",
  },
  description:
    "Autonomous multi-platform content operations platform for entertainment and OTT media. Transforms a single creative brief into native campaigns across Instagram, YouTube, and X with deterministic quality control, Pixazo FLUX visual rendering, and closed-loop performance intelligence.",
  keywords: [
    "SceneSetu",
    "Content Operations",
    "AI Studio",
    "hoichoi Hackathon 2026",
    "Flux Schnell",
    "Gemini 2.5 Flash",
    "Multi-Platform Publishing",
    "Social Media Automation",
    "Deterministic QC",
    "Closed-Loop Marketing Intelligence",
  ],
  authors: [{ name: "SceneSetu Team" }],
  creator: "SceneSetu",
  publisher: "SceneSetu",
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/favicon.ico",
    apple: "/icon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://scenesetu.vercel.app",
    title: "SceneSetu | AI-Native Content Operations & Campaign Intelligence",
    description:
      "Autonomous multi-platform content operations engine. Transforms single briefs into verified campaigns across Instagram, YouTube, and X with closed-loop performance attribution.",
    siteName: "SceneSetu",
    images: [
      {
        url: "/pixel_icon.jpg",
        width: 1200,
        height: 630,
        alt: "SceneSetu - AI-Native Content Operations",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SceneSetu | AI-Native Content Operations Platform",
    description:
      "Transform briefs into multi-channel campaigns with deterministic QC and closed-loop intelligence.",
    images: ["/pixel_icon.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full">
      <body className="min-h-full bg-black text-white flex flex-col font-sans antialiased selection:bg-white/20">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
