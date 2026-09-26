import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "SceneSetu | AI-Native Content Operations Platform",
  description:
    "AI-Native Content Operations & Intelligence Platform (hoichoi Hackathon'26 - Problem 3). Turn one content brief into platform-native campaigns with deterministic QC and closed-loop feedback.",
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
