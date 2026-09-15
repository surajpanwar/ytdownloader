import type { Metadata } from "next";
import Link from "next/link";

import { DownloadTool } from "@/components/download-tool";
import { Footer } from "@/components/footer";
import { FaqAccordion, type FaqItem } from "@/components/faq";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const faqItems: FaqItem[] = [
  {
    question: "Does it support 4K?",
    answer:
      "Yes. If the Vimeo source video is available in 4K, it will be offered as a download option. The tool downloads the highest quality the uploader provides.",
  },
  {
    question: "Can I download private Vimeo videos?",
    answer:
      "No. Only publicly available Vimeo videos can be downloaded. Password-protected or private videos are not supported.",
  },
  {
    question: "What formats are available?",
    answer:
      "MP4 is the primary format. WebM may also be available depending on the source video. Choose MP3 or M4A to extract audio only.",
  },
  {
    question: "Is it free?",
    answer:
      "Yes. No account needed, no limits, completely free to use. Download as many Vimeo videos as you want.",
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
  title: "Download Vimeo Video - Free Online",
  description:
    "Download any public Vimeo video as MP4 in original quality. Free, fast, no app. Supports HD and 4K where available.",
  openGraph: {
    title: "Download Vimeo Video - Free Online",
    description:
      "Download any public Vimeo video as MP4 in original quality. Free, fast, no app. Supports HD and 4K where available.",
    url: "https://grabvideo.app/download-vimeo-video",
    siteName: "AnyVideo Downloader",
    type: "website",
  },
};

export default function DownloadVimeoPage() {
  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-xl flex-col items-center px-4 pb-16 pt-14 sm:pt-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <h1 className="mb-4 text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
        Download Vimeo Videos Free
      </h1>

      <p className="mb-8 max-w-lg text-center text-[15px] leading-relaxed text-muted">
        Save any public Vimeo video in original quality, including HD and 4K
        where available. Fast, free, and no app to install.
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
              <span className="font-medium text-white">Copy the Vimeo URL</span>{" "}
              — Open the video page and copy the link from the address bar.
            </li>
            <li>
              <span className="font-medium text-white">Paste it here</span> —
              Drop the link into the input field above and press Download.
            </li>
            <li>
              <span className="font-medium text-white">Choose your quality</span>{" "}
              — Select MP4 and the highest available quality, then save.
            </li>
          </ol>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-white">
            HD &amp; 4K Quality
          </h2>
          <p>
            Vimeo is known for high-bitrate uploads, and this tool preserves
            that. The downloader grabs the original source quality up to{" "}
            <strong className="text-white">4K</strong>, so your saved videos keep
            the crisp detail of the originals.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-white">
            Public Videos Only
          </h2>
          <p>
            Only publicly visible Vimeo videos can be downloaded. Private,
            unlisted, or password-protected videos are not accessible through
            this tool — respecting the uploader&apos;s privacy settings.
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
        <Link href="/download-twitter-video" className="transition-colors hover:text-white">
          Twitter/X
        </Link>
      </nav>

      <Footer />
    </main>
  );
}