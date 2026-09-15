import type { Metadata } from "next";
import Link from "next/link";

import { DownloadTool } from "@/components/download-tool";
import { Footer } from "@/components/footer";
import { FaqAccordion, type FaqItem } from "@/components/faq";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const faqItems: FaqItem[] = [
  {
    question: "Can I download Instagram Stories?",
    answer:
      "Yes. Paste the story link and download it before it expires after 24 hours. Both image and video stories are supported.",
  },
  {
    question: "Does it work on private accounts?",
    answer:
      "No. Only public Instagram posts, Reels, and Stories can be downloaded. You never need to log in or share your credentials.",
  },
  {
    question: "What quality do I get?",
    answer:
      "Videos are downloaded in the same quality they were uploaded in, up to 1080p. Reels and feed videos typically download in HD.",
  },
  {
    question: "Is it safe?",
    answer:
      "Yes. You don't need to log in or provide any credentials. Downloads happen directly from the public URL and files are removed from our server within 30 minutes.",
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
  title: "Download Instagram Reels & Videos - Free Online",
  description:
    "Save Instagram Reels, Stories, and videos as MP4 or MP3. Free, no login needed. Works on public posts and reels.",
  openGraph: {
    title: "Download Instagram Reels & Videos - Free Online",
    description:
      "Save Instagram Reels, Stories, and videos as MP4 or MP3. Free, no login needed. Works on public posts and reels.",
    url: "https://grabvideo.app/download-instagram-reel",
    siteName: "AnyVideo Downloader",
    type: "website",
  },
};

export default function DownloadInstagramPage() {
  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-xl flex-col items-center px-4 pb-16 pt-14 sm:pt-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <h1 className="mb-4 text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
        Download Instagram Reels and Videos
      </h1>

      <p className="mb-8 max-w-lg text-center text-[15px] leading-relaxed text-muted">
        Save Instagram Reels, feed videos, and Stories as MP4 or MP3. No login,
        no app install — just paste the link and download.
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
          <h2 className="mb-2 text-lg font-semibold text-white">
            What You Can Download
          </h2>
          <ul className="list-inside list-disc space-y-1.5">
            <li>
              <span className="font-medium text-white">Reels</span> — full-length,
              original quality.
            </li>
            <li>
              <span className="font-medium text-white">Feed videos</span> — regular
              posts, IGTV, and longer videos.
            </li>
            <li>
              <span className="font-medium text-white">Stories</span> — before they
              expire after 24 hours.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-white">How to Use</h2>
          <ol className="list-inside list-decimal space-y-1.5">
            <li>
              <span className="font-medium text-white">Copy the URL</span> — On
              Instagram, tap the share icon and select &ldquo;Copy link&rdquo;.
            </li>
            <li>
              <span className="font-medium text-white">Paste it here</span> —
              Add the link to the input field above and hit Download.
            </li>
            <li>
              <span className="font-medium text-white">Pick your format</span> —
              Choose MP4 for video or MP3 for audio and save to your device.
            </li>
          </ol>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-white">No Login Needed</h2>
          <p>
            Because the tool works from the public URL alone, you never have to
            log in, provide your Instagram credentials, or authorize anything.
            Your account stays private and your data stays yours.
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