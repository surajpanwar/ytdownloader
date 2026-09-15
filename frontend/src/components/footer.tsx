import Link from "next/link";

const platforms = [
  { href: "/download-youtube-video", label: "YouTube" },
  { href: "/download-tiktok-video", label: "TikTok" },
  { href: "/download-instagram-reel", label: "Instagram" },
  { href: "/download-twitter-video", label: "Twitter/X" },
  { href: "/download-vimeo-video", label: "Vimeo" },
];

const legal = [
  { href: "/about", label: "About12" },
  { href: "/privacy-policy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export function Footer() {
  return (
    <footer className="mt-12 w-full border-t border-edge pt-6 text-center">
      <nav className="mb-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted">
        <Link href="/" className="transition-colors hover:text-white">
          Home
        </Link>
        <span aria-hidden="true" className="text-muted/30">·</span>
        {platforms.map((p) => (
          <Link
            key={p.href}
            href={p.href}
            className="transition-colors hover:text-white"
          >
            {p.label}
          </Link>
        ))}
        <span aria-hidden="true" className="text-muted/30">·</span>
        {legal.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="transition-colors hover:text-white"
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
