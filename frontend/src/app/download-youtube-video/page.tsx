import type { Metadata } from "next";
import Link from "next/link";

import { DownloadTool } from "@/components/download-tool";
import { Footer } from "@/components/footer";
import { FaqAccordion, type FaqItem } from "@/components/faq";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const faqItems: FaqItem[] = [
  {
    question: "Can I download YouTube Shorts?",
    answer:
      "Yes. Paste the Shorts URL just like any regular YouTube video link. The tool detects it automatically and offers download options.",
  },
  {
    question: "What's the max quality available?",
    answer:
      "Up to 1080p Full HD, depending on the original upload quality. If the source video is 4K, 1080p is the maximum offered. Available options include 1080p, 720p, 480p, and 360p.",
  },
  {
    question: "Is there a watermark on downloads?",
    answer:
      "No. Videos are downloaded exactly as they appear on YouTube — no added watermarks, no branding, no modifications.",
  },
  {
    question: "Can I download YouTube videos as MP3?",
    answer:
      "Yes. After pasting the URL, select the MP3 or M4A format to extract audio only. Great for music, podcasts, and lectures.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

export const metadata: Metadata = {
  title: "Download YouTube Video - Free Online (No App Needed)",
  description:
    "Download any YouTube video or Shorts as MP4 or MP3. Free, fast, no watermark, no app. Supports 1080p, 720p, 480p, 360p.",
  openGraph: {
    title: "Download YouTube Video - Free Online (No App Needed)",
    description:
      "Download any YouTube video or Shorts as MP4 or MP3. Free, fast, no watermark, no app. Supports 1080p, 720p, 480p, 360p.",
    url: "https://grabvideo.app/download-youtube-video",
    siteName: "AnyVideo Downloader",
    type: "website",
  },
};

export default function DownloadYouTubePage() {
  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-xl flex-col items-center px-4 pb-16 pt-14 sm:pt-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <h1 className="mb-4 text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
        Download YouTube Videos Free
      </h1>

      <p className="mb-8 max-w-lg text-center text-[15px] leading-relaxed text-muted">
        Save any YouTube video, Short, or music clip directly to your device.
        Choose your format and quality — no software to install, no account
        needed.
      </p>

      <Link
        href="#try-now"
        className={cn(buttonVariants({ variant: "glow", size: "lg" }), "mb-10")}
      >
        Try it now
      </Link>

      <section id="try-now" className="w-full">
        <DownloadTool />
      </section>

      <div className="mt-12 w-full space-y-6 text-[15px] leading-relaxed text-muted">
        <section>
          <h2 className="mb-2 text-lg font-semibold text-white">How to Download</h2>
          <ol className="list-inside list-decimal space-y-1.5">
            <li>
              <span className="font-medium text-white">Copy the URL</span> — Open
              YouTube, find the video, and copy the link from the address bar or
              share button.
            </li>
            <li>
              <span className="font-medium text-white">Paste it here</span> —
              Paste the URL into the input field above and click the download
              button.
            </li>
            <li>
              <span className="font-medium text-white">Pick format &amp; quality</span>{" "}
              — Choose MP4, WebM, MP3, or M4A and select your preferred quality.
            </li>
          </ol>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-white">
            Supported Formats &amp; Qualities
          </h2>
          <p>
            Download as <strong className="text-white">MP4</strong> (video),{" "}
            <strong className="text-white">WebM</strong> (video),{" "}
            <strong className="text-white">MP3</strong> (audio), or{" "}
            <strong className="text-white">M4A</strong> (audio). Video quality
            options include 1080p, 720p, 480p, and 360p depending on what the
            original upload supports.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-white">
            Frequently Asked Questions
          </h2>
          <FaqAccordion items={faqItems} />
        </section>
      </div>

      <nav className="mt-8 mb-6 flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs text-muted">
        <Link href="/" className="transition-colors hover:text-white">
          Home
        </Link>
        <span aria-hidden="true" className="text-muted/30">·</span>
        <Link href="/download-tiktok-video" className="transition-colors hover:text-white">
          TikTok
        </Link>
        <span aria-hidden="true" className="text-muted/30">·</span>
        <Link href="/download-instagram-reel" className="transition-colors hover:text-white">
          Instagram
        </Link>
        <span aria-hidden="true" className="text-muted/30">·</span>
        <Link href="/download-twitter-video" className="transition-colors hover:text-white">
          Twitter/X
        </Link>
        <span aria-hidden="true" className="text-muted/30">·</span>
        <Link href="/download-vimeo-video" className="transition-colors hover:text-white">
          Vimeo
        </Link>
      </nav>

      <Footer />
    </main>
  );
}