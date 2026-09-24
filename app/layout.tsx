import type { Metadata } from "next";
import { IBM_Plex_Sans, Inter, JetBrains_Mono, Manrope, Space_Grotesk } from "next/font/google";
import { prefsInitScript } from "@/lib/prefs";
import { Heartbeat } from "@/components/friends/Heartbeat";
import { GameReady } from "@/components/wants/GameReady";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });
const plex = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-plex" });
const grotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-grotesk" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || "http://localhost:3000"),
  title: { default: "Playmat", template: "%s · Playmat" },
  description: "Play any physical card game over webcam.",
  openGraph: { siteName: "Playmat", type: "website" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${manrope.variable} ${plex.variable} ${grotesk.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: prefsInitScript }} />
      </head>
      <body className="min-h-screen bg-bg font-sans text-sm text-fg antialiased">
        <Heartbeat />
        <GameReady />
        {children}
      </body>
    </html>
  );
}
