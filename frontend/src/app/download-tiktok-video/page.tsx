import type { Metadata } from "next";
import Link from "next/link";

import { DownloadTool } from "@/components/download-tool";
import { Footer } from "@/components/footer";
import { FaqAccordion, type FaqItem } from "@/components/faq";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const faqItems: FaqItem[] = [
  {
    question: "Does it really remove the watermark?",
    answer:
      "Yes. TikTok videos are downloaded without the floating watermark overlay, giving you a clean copy of the original video.",
  },
  {
    question: "Can I download TikTok sounds?",
    answer:
      "Yes. Select the MP3 or M4A format to extract just the audio track. This works for any TikTok video including those posted to TikTok Sounds.",
  },
  {
    question: "Is it free?",
    answer:
      "Yes, completely free. No account, no credits, no hidden fees. Download as many videos as you like.",
  },
  {
    question: "Does it work on private accounts?",
    answer:
      "No. The tool can only access videos from public TikTok accounts. Private or restricted content cannot be downloaded.",
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
  title: "Download TikTok Video Without Watermark - Free Online",
  description:
    "Save any TikTok video without the watermark. Free online tool, no app needed. Download as MP4 in original quality.",
  openGraph: {
    title: "Download TikTok Video Without Watermark - Free Online",
    description:
      "Save any TikTok video without the watermark. Free online tool, no app needed. Download as MP4 in original quality.",
    url: "https://grabvideo.app/download-tiktok-video",
    siteName: "AnyVideo Downloader",
    type: "website",
  },
};

export default function DownloadTikTokPage() {
  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-xl flex-col items-center px-4 pb-16 pt-14 sm:pt-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <h1 className="mb-4 text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
        Download TikTok Videos Without Watermark
      </h1>

      <p className="mb-8 max-w-lg text-center text-[15px] leading-relaxed text-muted">
        Save any TikTok video with the watermark removed. Works with regular
        videos, Shorts-style clips, and music videos. No app, no login, and
        completely free.
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
            No Watermark, Every Time
          </h2>
          <p>
            Unlike manually recording or ripping TikTok videos, this tool
            downloads the original source file with the watermark overlay
            removed. You get a clean MP4 you can keep, edit, or re-share — the
            same quality the creator uploaded.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-white">How to Use</h2>
          <ol className="list-inside list-decimal space-y-1.5">
            <li>
              <span className="font-medium text-white">Copy the link</span> —
              Open TikTok, tap the Share button, and select &ldquo;Copy
              link&rdquo;.
            </li>
            <li>
              <span className="font-medium text-white">Paste it here</span> —
              Drop the URL into the input field above and press Download.
            </li>
            <li>
              <span className="font-medium text-white">Save the video</span> —
              Pick MP4 or MP3 and download. Done in seconds.
            </li>
          </ol>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-white">Supported Formats</h2>
          <p>
            Videos download as <strong className="text-white">MP4</strong> in
            original quality. Choose <strong className="text-white">MP3</strong>{" "}
            or <strong className="text-white">M4A</strong> to extract audio only.
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