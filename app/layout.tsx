import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import FloatingBackground from "../components/FloatingBackground";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk", display: "swap" });

export const metadata: Metadata = {
  title: "Unique Income Plan | Better Life",
  description: "A premium financial empowerment ecosystem — 5 income types, 10 ranks, starting at just $3.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <head>
        <link
          href="https://api.fontshare.com/v2/css?f[]=satoshi@900,700,500,300,400&f[]=clash-display@200,400,700,500,600,300&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased selection:bg-[#D4AF37] selection:text-black">
        <FloatingBackground />
        <SmoothScroll>
          <main className="flex-1">{children}</main>
        </SmoothScroll>
      </body>
    </html>
  );
}
