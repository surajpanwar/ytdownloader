import type { Metadata } from "next";
import Link from "next/link";

import { DownloadTool } from "@/components/download-tool";
import { Footer } from "@/components/footer";
import { FaqAccordion, type FaqItem } from "@/components/faq";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const faqItems: FaqItem[] = [
  {
    question: "Does it work on X (formerly Twitter)?",
    answer:
      "Yes. Whether you call it Twitter or X, the tool works with all video URLs from the platform, including posts, quote tweets, and reply videos.",
  },
  {
    question: "Can I download GIFs?",
    answer:
      "Yes. Animated GIFs from tweets are also supported — they download as MP4 files, which preserves the animation.",
  },
  {
    question: "What quality do I get?",
    answer:
      "Up to the original upload quality, typically 720p or 1080p for most Twitter/X videos.",
  },
  {
    question: "Is it free?",
    answer:
      "Yes, 100% free with no usage limits. No account, no credits, no watermark.",
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
  title: "Download Twitter/X Videos - Free Online",
  description:
    "Save any video from Twitter or X as MP4. Free online downloader, no app needed. Works on all public tweets.",
  openGraph: {
    title: "Download Twitter/X Videos - Free Online",
    description:
      "Save any video from Twitter or X as MP4. Free online downloader, no app needed. Works on all public tweets.",
    url: "https://grabvideo.app/download-twitter-video",
    siteName: "AnyVideo Downloader",
    type: "website",
  },
};

export default function DownloadTwitterPage() {
  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-xl flex-col items-center px-4 pb-16 pt-14 sm:pt-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <h1 className="mb-4 text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
        Download Twitter/X Videos Free
      </h1>

      <p className="mb-8 max-w-lg text-center text-[15px] leading-relaxed text-muted">
        Save any video from Twitter or X as MP4. Works on all public tweets —
        videos, GIFs, and clips embedded in posts.
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
          <h2 className="mb-2 text-lg font-semibold text-white">How to Use</h2>
          <ol className="list-inside list-decimal space-y-1.5">
            <li>
              <span className="font-medium text-white">Copy the tweet link</span>{" "}
              — Tap the Share button on any tweet and select &ldquo;Copy
              link&rdquo;, or copy the URL from the address bar.
            </li>
            <li>
              <span className="font-medium text-white">Paste it here</span> —
              Place the link in the input above and press Download.
            </li>
            <li>
              <span className="font-medium text-white">Save the video</span> —
              Choose MP4 for video or MP3 for audio and save to your device.
            </li>
          </ol>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-white">
            Videos &amp; GIFs Supported
          </h2>
          <p>
            The tool handles standard video posts, embedded clips, and animated
            GIFs. GIFs download as MP4 files so the animation is preserved
            exactly as it appears on the timeline.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-white">Original Quality</h2>
          <p>
            Downloads keep the original file quality, typically <strong className="text-white">720p</strong> or{" "}
            <strong className="text-white">1080p</strong> depending on what was
            uploaded. No re-encoding, no quality loss, no added watermark.
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
        <Link href="/download-youtube-video" className="transition-colors hover:text-white">
          YouTube
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
        <Link href="/download-vimeo-video" className="transition-colors hover:text-white">
          Vimeo
        </Link>
      </nav>

      <Footer />
    </main>
  );
}