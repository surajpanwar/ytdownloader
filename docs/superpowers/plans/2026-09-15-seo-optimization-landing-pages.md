# SEO Optimization & Platform Landing Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Optimize the entire frontend for SEO (meta tags, structured data, sitemap, robots.txt) and create 5 platform-specific landing pages (YouTube, TikTok, Instagram, Twitter/X, Vimeo).

**Architecture:** Extract the inline footer into a shared component, extract the download tool into a reusable client component, create a shared landing page template, then build all 5 platform pages. Each page gets unique metadata, JSON-LD structured data, and FAQ accordions. Homepage gets full OG tags and FAQPage schema.

**Tech Stack:** Next.js 14 App Router, React 18, TypeScript, Tailwind CSS, shadcn/ui patterns, Lucide icons

**Spec:** User request (SEO optimization + 5 landing pages with structured data, FAQs, footer nav, sitemap, robots.txt)

## Global Constraints

- Do NOT change backend code, Docker/Render/Vercel config, CORS, rate limiting, cleanup logic
- Do NOT change existing dark theme colors
- Do NOT change AGENTS.md
- Do NOT change the PropellerAds script in layout.tsx
- All landing pages must be statically generated (no server-side data fetching)
- Reuse existing components (UrlForm, ResultCard, ProgressBar, RecentDownloads)
- Keep bundle size minimal — no duplicated code
- Footer links: Home | YouTube | TikTok | Instagram | Twitter/X | Vimeo | About | Privacy | Terms

---

## File Structure

### Files to Create
| File | Responsibility |
|------|---------------|
| `src/components/footer.tsx` | Shared footer with full nav links (all pages) |
| `src/components/download-tool.tsx` | Extracted client-side download tool (URL form + result + progress + recent) |
| `src/components/faq.tsx` | Reusable FAQ accordion component using `<details>`/`<summary>` |
| `src/app/download-youtube-video/page.tsx` | YouTube landing page |
| `src/app/download-tiktok-video/page.tsx` | TikTok landing page |
| `src/app/download-instagram-reel/page.tsx` | Instagram landing page |
| `src/app/download-twitter-video/page.tsx` | Twitter/X landing page |
| `src/app/download-vimeo-video/page.tsx` | Vimeo landing page |
| `src/app/sitemap.ts` | Dynamic sitemap generation |
| `src/app/robots.ts` | Robots.txt configuration |

### Files to Modify
| File | Changes |
|------|---------|
| `src/app/layout.tsx` | Update root metadata (title, description, OG tags), add `<Footer />` |
| `src/app/page.tsx` | Split: server wrapper for metadata + import DownloadTool, update footer to use shared component, add JSON-LD |
| `src/app/about/page.tsx` | Update metadata (title, description, OG), add Footer |
| `src/app/privacy-policy/page.tsx` | Update metadata, add Footer |
| `src/app/terms/page.tsx` | Update metadata, add Footer |

---

## Task 1: Extract Footer Component

**Files:**
- Create: `src/components/footer.tsx`
- Modify: `src/app/page.tsx:241-262`

**Interfaces:**
- Produces: `<Footer />` component (no props, reads nothing from state)

- [ ] **Step 1: Create `src/components/footer.tsx`**

```tsx
import Link from "next/link";

const platforms = [
  { href: "/download-youtube-video", label: "YouTube" },
  { href: "/download-tiktok-video", label: "TikTok" },
  { href: "/download-instagram-reel", label: "Instagram" },
  { href: "/download-twitter-video", label: "Twitter/X" },
  { href: "/download-vimeo-video", label: "Vimeo" },
];

const legal = [
  { href: "/about", label: "About" },
  { href: "/privacy-policy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export function Footer() {
  return (
    <footer className="mt-12 w-full border-t border-edge pt-6 text-center">
      <nav className="mb-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted">
        <Link href="/" className="hover:text-white transition-colors">
          Home
        </Link>
        <span aria-hidden="true">·</span>
        {platforms.map((p) => (
          <Link
            key={p.href}
            href={p.href}
            className="hover:text-white transition-colors"
          >
            {p.label}
          </Link>
        ))}
        <span aria-hidden="true">·</span>
        {legal.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="hover:text-white transition-colors"
          >
            {l.label}
          </Link>
        ))}
      </nav>
      <p className="mx-auto max-w-md text-xs leading-relaxed text-muted">
        Download only content you own or have permission to use. Files are
        generated on demand and removed from the server within 30 minutes.
      </p>
    </footer>
  );
}
```

- [ ] **Step 2: Replace inline footer in `src/app/page.tsx`**

Remove lines 241-262 (the inline `<footer>...</footer>`) and replace with:
```tsx
import { Footer } from "@/components/footer";
```
Add `<Footer />` at the bottom of the return, inside the `<main>` tag.

- [ ] **Step 3: Verify build passes**

Run: `cd frontend; npm run build`
Expected: Build succeeds with no errors

---

## Task 2: Extract Download Tool Component

**Files:**
- Create: `src/components/download-tool.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `UrlForm`, `ResultCard`, `ProgressBar`, `RecentDownloads` components, `validateUrl`, `startDownload`, `getStatus`, `fileUrl` from `@/lib/api`, `addRecent` from `@/lib/recent`
- Produces: `<DownloadTool />` client component (no props needed)

- [ ] **Step 1: Create `src/components/download-tool.tsx`**

Move the ENTIRE client-side logic and JSX from `page.tsx` (the state machine, all handlers, the URL form, result card, recent downloads, waking indicator, etc.) into this new file. The component should be `"use client"` and render everything the homepage currently renders EXCEPT the footer and any page-level wrapper (`<main>` tag stays in page.tsx).

The file should contain:
- All `"use client"` directive
- All state declarations (phase, url, videoInfo, taskId, etc.)
- All handlers (handleValidate, handleDownload, handleTryAgain, handleChooseDifferent, handleRecentSelect)
- All JSX: UrlForm, ResultCard, progress states, waking indicator, RecentDownloads
- Export as `export function DownloadTool()`

- [ ] **Step 2: Simplify `src/app/page.tsx` to server component**

```tsx
import type { Metadata } from "next";
import { DownloadTool } from "@/components/download-tool";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Video Downloader - Download from YouTube, TikTok, Instagram & 1000+ Sites",
  description:
    "Free online video downloader. Paste any link from YouTube, TikTok, Instagram, Twitter/X, Vimeo, Dailymotion and 1000+ sites. No app needed. Fast, free, unlimited.",
  openGraph: {
    title: "Video Downloader - Download from YouTube, TikTok, Instagram & 1000+ Sites",
    description:
      "Free online video downloader. Paste any link from YouTube, TikTok, Instagram, Twitter/X, Vimeo, Dailymotion and 1000+ sites. No app needed. Fast, free, unlimited.",
    url: "https://grabvideo.app",
    siteName: "AnyVideo Downloader",
    type: "website",
  },
};

export default function HomePage() {
  return (
    <main className="mx-auto max-w-2xl px-4 pb-16 pt-14 sm:pt-20">
      <DownloadTool />
      <Footer />
    </main>
  );
}
```

- [ ] **Step 3: Verify build passes**

Run: `cd frontend; npm run build`
Expected: Build succeeds. Homepage renders identically to before.

---

## Task 3: Create FAQ Component

**Files:**
- Create: `src/components/faq.tsx`

**Interfaces:**
- Produces: `<FaqAccordion items={FaqItem[]} />` where `FaqItem = { question: string; answer: string }`

- [ ] **Step 1: Create `src/components/faq.tsx`**

```tsx
export interface FaqItem {
  question: string;
  answer: string;
}

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <details
          key={item.question}
          className="group rounded-xl border border-edge bg-surface overflow-hidden"
        >
          <summary className="flex cursor-pointer items-center justify-between px-5 py-4 text-sm font-medium text-white select-none [&::-webkit-details-marker]:hidden">
            {item.question}
            <span className="ml-4 shrink-0 text-muted transition-transform group-open:rotate-180">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </summary>
          <div className="px-5 pb-4 text-sm leading-relaxed text-muted">
            {item.answer}
          </div>
        </details>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Verify build passes**

Run: `cd frontend; npm run build`
Expected: Build succeeds

---

## Task 4: Add JSON-LD to Homepage

**Files:**
- Modify: `src/app/page.tsx`

**Interfaces:**
- No new interfaces

- [ ] **Step 1: Add JSON-LD script tags to homepage**

In `src/app/page.tsx`, add a `<script>` tag with `type="application/ld+json"` inside the `<main>` (or before the closing `</main>`). The JSON-LD should contain both `WebApplication` and `FAQPage` schemas.

Update the page to include:

```tsx
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      name: "AnyVideo Downloader",
      url: "https://grabvideo.app",
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
```

Render it as:
```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
/>
```

- [ ] **Step 2: Update page H1**

Add `<h1 className="mb-8 text-center text-3xl font-bold tracking-tight text-white">Download Any Video</h1>` at the top of the homepage content (before `<DownloadTool />`).

- [ ] **Step 3: Verify build passes**

Run: `cd frontend; npm run build`
Expected: Build succeeds

---

## Task 5: Create Landing Page Template & YouTube Page

**Files:**
- Create: `src/app/download-youtube-video/page.tsx`

**Interfaces:**
- Consumes: `DownloadTool`, `Footer`, `FaqAccordion` components
- Produces: Static landing page with metadata, JSON-LD, content, FAQ, embedded tool

- [ ] **Step 1: Create YouTube landing page**

```tsx
import type { Metadata } from "next";
import { DownloadTool } from "@/components/download-tool";
import { Footer } from "@/components/footer";
import { FaqAccordion, type FaqItem } from "@/components/faq";

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

export default function DownloadYouTubePage() {
  return (
    <main className="mx-auto max-w-2xl px-4 pb-16 pt-14 sm:pt-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <h1 className="mb-4 text-center text-3xl font-bold tracking-tight text-white">
        Download YouTube Videos Free
      </h1>

      <p className="mb-8 text-center text-sm leading-relaxed text-muted">
        Save any YouTube video, Short, or music clip directly to your device.
        Choose your format and quality — no software to install, no account
        needed.
      </p>

      <div className="mb-10 space-y-4 text-sm leading-relaxed text-muted">
        <h2 className="text-lg font-semibold text-white">How to Download</h2>
        <ol className="list-inside list-decimal space-y-2">
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

        <h2 className="pt-2 text-lg font-semibold text-white">
          Supported Formats &amp; Qualities
        </h2>
        <p>
          Download as <strong className="text-white">MP4</strong> (video),
          <strong className="text-white"> WebM</strong> (video),
          <strong className="text-white"> MP3</strong> (audio), or
          <strong className="text-white"> M4A</strong> (audio). Video quality
          options include 1080p, 720p, 480p, and 360p depending on what the
          original upload supports.
        </p>
      </div>

      <div id="try-now" className="mb-12">
        <DownloadTool />
      </div>

      <section className="mb-12">
        <h2 className="mb-4 text-lg font-semibold text-white">
          Frequently Asked Questions
        </h2>
        <FaqAccordion items={faqItems} />
      </section>

      <nav className="mb-6 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-muted">
        <a href="/" className="hover:text-white transition-colors">
          Home
        </a>
        <span aria-hidden="true">·</span>
        <a href="/download-tiktok-video" className="hover:text-white transition-colors">
          TikTok
        </a>
        <span aria-hidden="true">·</span>
        <a href="/download-instagram-reel" className="hover:text-white transition-colors">
          Instagram
        </a>
        <span aria-hidden="true">·</span>
        <a href="/download-twitter-video" className="hover:text-white transition-colors">
          Twitter/X
        </a>
        <span aria-hidden="true">·</span>
        <a href="/download-vimeo-video" className="hover:text-white transition-colors">
          Vimeo
        </a>
      </nav>

      <Footer />
    </main>
  );
}
```

- [ ] **Step 2: Verify build passes**

Run: `cd frontend; npm run build`
Expected: YouTube page is statically generated

---

## Task 6: Create TikTok Landing Page

**Files:**
- Create: `src/app/download-tiktok-video/page.tsx`

**Interfaces:**
- Same as Task 5 (consumes DownloadTool, Footer, FaqAccordion)

- [ ] **Step 1: Create TikTok landing page**

Same structure as YouTube page with:
- Title: "Download TikTok Video Without Watermark - Free Online"
- Description: "Save any TikTok video without the watermark. Free online tool, no app needed. Download as MP4 in original quality."
- H1: "Download TikTok Videos Without Watermark"
- OG URL: `https://grabvideo.app/download-tiktok-video`
- Content explaining no-watermark feature, how to use, supported formats
- FAQ items:
  1. "Does it really remove the watermark?" → "Yes. TikTok videos are downloaded without the floating watermark overlay, giving you a clean copy."
  2. "Can I download TikTok sounds?" → "Currently, the tool downloads full videos with audio. To extract just the audio, download as MP4 then convert, or select MP3 format if available."
  3. "Is it free?" → "Yes, completely free. No account, no credits, no hidden fees."
  4. "Does it work on private accounts?" → "No. The tool can only download videos from public TikTok accounts. Private or restricted content cannot be accessed."

- [ ] **Step 2: Verify build passes**

Run: `cd frontend; npm run build`

---

## Task 7: Create Instagram Landing Page

**Files:**
- Create: `src/app/download-instagram-reel/page.tsx`

**Interfaces:**
- Same as Task 5

- [ ] **Step 1: Create Instagram landing page**

Same structure with:
- Title: "Download Instagram Reels & Videos - Free Online"
- Description: "Save Instagram Reels, Stories, and videos as MP4 or MP3. Free, no login needed. Works on public posts and reels."
- H1: "Download Instagram Reels and Videos"
- OG URL: `https://grabvideo.app/download-instagram-reel`
- Content explaining supported types (Reels, Posts, Stories), how to use
- FAQ items:
  1. "Can I download Instagram Stories?" → "Yes. Paste the story link and download it before it expires after 24 hours."
  2. "Does it work on private accounts?" → "No. Only public Instagram posts, Reels, and Stories can be downloaded."
  3. "What quality do I get?" → "Videos are downloaded in the same quality they were uploaded in, up to 1080p."
  4. "Is it safe?" → "Yes. You don't need to log in or provide any credentials. Downloads happen directly from the public URL."

- [ ] **Step 2: Verify build passes**

---

## Task 8: Create Twitter/X Landing Page

**Files:**
- Create: `src/app/download-twitter-video/page.tsx`

**Interfaces:**
- Same as Task 5

- [ ] **Step 1: Create Twitter/X landing page**

Same structure with:
- Title: "Download Twitter/X Videos - Free Online"
- Description: "Save any video from Twitter or X as MP4. Free online downloader, no app needed. Works on all public tweets."
- H1: "Download Twitter/X Videos Free"
- OG URL: `https://grabvideo.app/download-twitter-video`
- Content explaining how to use, supported formats
- FAQ items:
  1. "Does it work on X (formerly Twitter)?" → "Yes. Whether you call it Twitter or X, the tool works with all video URLs from the platform."
  2. "Can I download GIFs?" → "Yes. Animated GIFs from tweets are also supported — they download as MP4 files which preserves the animation."
  3. "What quality?" → "Up to the original upload quality, typically 720p or 1080p for most Twitter videos."
  4. "Is it free?" → "Yes, 100% free with no usage limits."

- [ ] **Step 2: Verify build passes**

---

## Task 9: Create Vimeo Landing Page

**Files:**
- Create: `src/app/download-vimeo-video/page.tsx`

**Interfaces:**
- Same as Task 5

- [ ] **Step 1: Create Vimeo landing page**

Same structure with:
- Title: "Download Vimeo Video - Free Online"
- Description: "Download any public Vimeo video as MP4 in original quality. Free, fast, no app. Supports HD and 4K where available."
- H1: "Download Vimeo Videos Free"
- OG URL: `https://grabvideo.app/download-vimeo-video`
- Content explaining how to use, quality options
- FAQ items:
  1. "Does it support 4K?" → "Yes. If the Vimeo source video is available in 4K, it will be offered as a download option when supported."
  2. "Can I download private Vimeo videos?" → "No. Only publicly available Vimeo videos can be downloaded. Password-protected or private videos are not supported."
  3. "What formats?" → "MP4 is the primary format. WebM may also be available depending on the source."
  4. "Is it free?" → "Yes. No account needed, no limits, completely free to use."

- [ ] **Step 2: Verify build passes**

---

## Task 10: Update Existing Pages Metadata & Footer

**Files:**
- Modify: `src/app/about/page.tsx`
- Modify: `src/app/privacy-policy/page.tsx`
- Modify: `src/app/terms/page.tsx`

**Interfaces:**
- Consumes: `Footer` component

- [ ] **Step 1: Update About page**

Update metadata:
```tsx
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
```
Add `import { Footer } from "@/components/footer";` and `<Footer />` at the bottom of the `<main>`.

- [ ] **Step 2: Update Privacy Policy page**

Update metadata:
```tsx
export const metadata: Metadata = {
  title: "Privacy Policy - AnyVideo Downloader",
  description: "Privacy Policy for AnyVideo Downloader. Learn how we handle your data.",
  openGraph: {
    title: "Privacy Policy - AnyVideo Downloader",
    url: "https://grabvideo.app/privacy-policy",
    siteName: "AnyVideo Downloader",
    type: "website",
  },
};
```
Add Footer.

- [ ] **Step 3: Update Terms page**

Update metadata:
```tsx
export const metadata: Metadata = {
  title: "Terms of Service - AnyVideo Downloader",
  description: "Terms of Service for AnyVideo Downloader.",
  openGraph: {
    title: "Terms of Service - AnyVideo Downloader",
    url: "https://grabvideo.app/terms",
    siteName: "AnyVideo Downloader",
    type: "website",
  },
};
```
Add Footer.

- [ ] **Step 4: Verify build passes**

Run: `cd frontend; npm run build`

---

## Task 11: Update Root Layout Metadata & Add OG Tags

**Files:**
- Modify: `src/app/layout.tsx`

**Interfaces:**
- No new interfaces

- [ ] **Step 1: Update root layout metadata**

Replace the existing metadata object with:

```tsx
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
```

Remove the `viewport` export if present (it's handled differently in Next.js 14 — viewport should be a separate export, not inside metadata). If it exists, keep it as:
```tsx
export const viewport = {
  themeColor: "#0f0f0f",
};
```

- [ ] **Step 2: Verify build passes**

Run: `cd frontend; npm run build`

---

## Task 12: Create Sitemap & Robots.txt

**Files:**
- Create: `src/app/sitemap.ts`
- Create: `src/app/robots.ts`

**Interfaces:**
- No new interfaces

- [ ] **Step 1: Create `src/app/sitemap.ts`**

```tsx
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://grabvideo.app";

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/download-youtube-video`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/download-tiktok-video`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/download-instagram-reel`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/download-twitter-video`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/download-vimeo-video`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.1,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.1,
    },
  ];
}
```

- [ ] **Step 2: Create `src/app/robots.ts`**

```tsx
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    sitemap: "https://grabvideo.app/sitemap.xml",
  };
}
```

- [ ] **Step 3: Verify build passes**

Run: `cd frontend; npm run build`
Expected: Sitemap and robots.txt are generated

---

## Task 13: Final Build & Typecheck Verification

**Files:**
- No new files

- [ ] **Step 1: Run typecheck**

Run: `cd frontend; npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 2: Run full build**

Run: `cd frontend; npm run build`
Expected: Build succeeds, all pages statically generated. Check output for:
- `/` — Static
- `/download-youtube-video` — Static
- `/download-tiktok-video` — Static
- `/download-instagram-reel` — Static
- `/download-twitter-video` — Static
- `/download-vimeo-video` — Static
- `/about` — Static
- `/privacy-policy` — Static
- `/terms` — Static
- `/_not-found` — Static

- [ ] **Step 3: Verify sitemap and robots.txt exist in build output**

Check `.next/sitemap.xml` and `.next/robots.txt` exist.

- [ ] **Step 4: Commit all changes**

```bash
git add -A
git commit -m "feat: add SEO optimization and platform-specific landing pages

- Extract footer into shared component with full navigation
- Extract download tool into reusable client component
- Add FAQ accordion component
- Add meta tags, Open Graph, and JSON-LD structured data to all pages
- Create 5 platform landing pages (YouTube, TikTok, Instagram, Twitter/X, Vimeo)
- Add sitemap.ts and robots.ts
- Update root layout with template title and metadataBase"
```
