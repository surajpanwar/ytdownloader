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
  title: {
    default: "Video Downloader - Download from YouTube, TikTok, Instagram & 1000+ Sites",
    template: "%s | AnyVideo Downloader",
  },
  description:
    "Free online video downloader. Paste any link from YouTube, TikTok, Instagram, Twitter/X, Vimeo, Dailymotion and 1000+ sites. No app needed. Fast, free, unlimited.",
  metadataBase: new URL("https://grabvideo.app"),
  openGraph: {
    title: "Video Downloader - Download from YouTube, TikTok, Instagram & 1000+ Sites",
    description:
      "Free online video downloader. Paste any link from YouTube, TikTok, Instagram, Twitter/X, Vimeo, Dailymotion and 1000+ sites. No app needed. Fast, free, unlimited.",
    url: "https://grabvideo.app",
    siteName: "AnyVideo Downloader",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Video Downloader - Download from YouTube, TikTok, Instagram & 1000+ Sites",
    description:
      "Free online video downloader. Paste any link from YouTube, TikTok, Instagram, Twitter/X, Vimeo, Dailymotion and 1000+ sites.",
  },
  robots: {
    index: true,
    follow: true,
  },
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
      <head>
        <script dangerouslySetInnerHTML={{__html: "(function(s){s.dataset.zone='11806588',s.src='https://nap5k.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))"}} />
      </head>
      <body className={`${inter.variable} min-h-screen`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}