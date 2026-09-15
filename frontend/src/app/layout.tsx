import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

import "./globals.css";
import { Toaster } from "@/components/toaster";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Grab — Video Downloader",
  description:
    "Paste a video link from YouTube, TikTok, Instagram, or 1000+ other sites, pick a format and quality, and download. Free, no sign-up.",
};

export const viewport: Viewport = {
  themeColor: "#0f0f0f",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} min-h-screen`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}