import type { Metadata } from "next";
import Link from "next/link";

import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "About - Free Video Downloader for 1000+ Platforms",
  description:
    "Learn how our free video downloader works. Supports YouTube, TikTok, Instagram, Twitter/X, Vimeo, Dailymotion and 1000+ other sites.",
  openGraph: {
    title: "About - Free Video Downloader for 1000+ Platforms",
    description:
      "Learn how our free video downloader works. Supports YouTube, TikTok, Instagram, Twitter/X, Vimeo, Dailymotion and 1000+ other sites.",
    url: "https://grabvideo.app/about",
    siteName: "AnyVideo Downloader",
    type: "website",
  },
};

const FAQ = [
  {
    q: "Is this video downloader free?",
    a: "Yes. Completely free to use with no sign-up required and no limits.",
  },
  {
    q: "What video formats are supported?",
    a: "MP4, WebM, and M4A for video, as well as MP3 and M4A for audio-only downloads.",
  },
  {
    q: "What sites can I download from?",
    a: "YouTube, TikTok, Instagram, Twitter / X, Vimeo, Dailymotion, and over 1,000 other sites powered by yt-dlp.",
  },
  {
    q: "Are downloaded files stored on your server?",
    a: "Files are generated on demand and automatically deleted within 30 minutes. We do not keep copies of your downloads.",
  },
  {
    q: "Is it legal to download videos?",
    a: "Legality depends on your jurisdiction and the content. You should only download content you own or have explicit permission to use. The tool itself is legal and responsibility for how it is used lies with you.",
  },
  {
    q: "The download is slow or failed. What should I do?",
    a: "The free backend may take up to a minute to wake up after inactivity. If a download fails, try again or select a lower quality. Persistent issues can be reported on our GitHub repository.",
  },
];

export default function About() {
  return (
    <main className="mx-auto max-w-2xl px-4 pb-16 pt-14 sm:pt-20">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-white"
      >
        <span aria-hidden>&larr;</span> Back
      </Link>

      <h1 className="text-3xl font-semibold tracking-tight text-white">
        About AnyVideo Downloader
      </h1>

      <div className="mt-8 space-y-6 text-[15px] leading-relaxed text-muted">
        <section>
          <p>
            AnyVideo Downloader is a free, open-source video downloader. Paste a
            link from YouTube, TikTok, Instagram, or any of 1,000+ supported
            sites, pick a format and quality, and download — no sign-up, no
            waiting.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-medium text-white">
            Supported Platforms
          </h2>
          <p>
            We support over 1,000 sites including YouTube, TikTok, Instagram,
            Twitter / X, Vimeo, Dailymotion, Twitch, Reddit, Facebook, and many
            more. The full list is powered by{" "}
            <a
              href="https://github.com/yt-dlp/yt-dlp"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-bright underline underline-offset-2 transition-colors hover:text-accent"
            >
              yt-dlp
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-medium text-white">Features</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Download video in MP4 or WebM</li>
            <li>Extract audio as MP3 or M4A</li>
            <li>Choose quality from 360p up to 1080p</li>
            <li>Preview video info before downloading</li>
            <li>Recent download history stored locally</li>
            <li>No account or sign-up required</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-medium text-white">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {FAQ.map((item) => (
              <div key={item.q}>
                <h3 className="font-medium text-white">{item.q}</h3>
                <p className="mt-1">{item.a}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}