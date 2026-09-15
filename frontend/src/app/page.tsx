import type { Metadata } from "next";

import { DownloadTool } from "@/components/download-tool";
import { Footer } from "@/components/footer";

const APP_URL = "https://grabvideo.app";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      name: "AnyVideo Downloader",
      url: APP_URL,
      description:
        "Free online video downloader. Paste any link from YouTube, TikTok, Instagram, Twitter/X, Vimeo, Dailymotion and 1000+ sites.",
      applicationCategory: "UtilityApplication",
      operatingSystem: "Web",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Is this video downloader free?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes, 100% free. No signup, no app install, no limits.",
          },
        },
        {
          "@type": "Question",
          name: "Which websites are supported?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "YouTube, TikTok, Instagram, Twitter/X, Vimeo, Dailymotion, Facebook, Reddit, and 1000+ other sites.",
          },
        },
        {
          "@type": "Question",
          name: "Do I need to install anything?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No. Just paste the video URL and download directly in your browser.",
          },
        },
        {
          "@type": "Question",
          name: "Is it safe to use?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Videos download directly to your device. We don't store or track any files.",
          },
        },
        {
          "@type": "Question",
          name: "What formats are available?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "MP4, MP3, WebM, and M4A in qualities up to 1080p.",
          },
        },
      ],
    },
  ],
};

export const metadata: Metadata = {
  title: "Video Downloader - Download from YouTube, TikTok, Instagram & 1000+ Sites",
  description:
    "Free online video downloader. Paste any link from YouTube, TikTok, Instagram, Twitter/X, Vimeo, Dailymotion and 1000+ sites. No app needed. Fast, free, unlimited.",
  openGraph: {
    title: "Video Downloader - Download from YouTube, TikTok, Instagram & 1000+ Sites",
    description:
      "Free online video downloader. Paste any link from YouTube, TikTok, Instagram, Twitter/X, Vimeo, Dailymotion and 1000+ sites. No app needed. Fast, free, unlimited.",
    url: APP_URL,
    siteName: "AnyVideo Downloader",
    type: "website",
  },
};

export default function HomePage() {
  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-xl flex-col items-center px-4 pb-16 pt-14 sm:pt-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="w-full text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          Download Any Video
        </h1>
        <p className="mx-auto mt-3 max-w-md text-balance text-[15px] leading-relaxed text-muted">
          Paste a link, pick a format and quality, and it&apos;s yours. Free, no sign-up.
        </p>
      </section>

      <DownloadTool />

      <Footer />
    </main>
  );
}