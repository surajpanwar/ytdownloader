import type { Metadata } from "next";
import Link from "next/link";

import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Terms of Service - AnyVideo Downloader",
  description: "Terms of Service for AnyVideo Downloader, a free video downloader for 1000+ platforms.",
  openGraph: {
    title: "Terms of Service - AnyVideo Downloader",
    description: "Terms of Service for AnyVideo Downloader, a free video downloader for 1000+ platforms.",
    url: "https://grabvideo.app/terms",
    siteName: "AnyVideo Downloader",
    type: "website",
  },
};

export default function Terms() {
  return (
    <main className="mx-auto max-w-2xl px-4 pb-16 pt-14 sm:pt-20">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-white"
      >
        <span aria-hidden>&larr;</span> Back
      </Link>

      <h1 className="text-3xl font-semibold tracking-tight text-white">
        Terms of Service
      </h1>
      <p className="mt-2 text-sm text-muted">
        Last updated: September 15, 2026
      </p>

      <div className="mt-8 space-y-6 text-[15px] leading-relaxed text-muted">
        <section>
          <h2 className="mb-2 text-lg font-medium text-white">
            Acceptance of Terms
          </h2>
          <p>
            By using Grab, you agree to these terms. If you do not agree, do
            not use the service.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-medium text-white">
            Service Description
          </h2>
          <p>
            Grab is a free tool that allows you to download publicly available
            video and audio content from supported platforms. The service is
            provided as-is without charge.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-medium text-white">
            User Responsibility
          </h2>
          <p>
            You are solely responsible for ensuring that your use of Grab
            complies with applicable laws and the terms of service of the
            platforms from which you download content. You should only download
            content you own or have explicit permission to download.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-medium text-white">
            No Warranty
          </h2>
          <p>
            Grab is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo;
            without warranties of any kind, whether express or implied,
            including but not limited to implied warranties of merchantability,
            fitness for a particular purpose, and noninfringement. We do not
            warrant that the service will be uninterrupted, error-free, or free
            of viruses or other harmful components.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-medium text-white">
            Limitation of Liability
          </h2>
          <p>
            In no event shall Grab, its maintainers, or contributors be liable
            for any indirect, incidental, special, consequential, or punitive
            damages, including but not limited to loss of data, loss of
            content, or service interruptions, arising from your use of or
            inability to use the service.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-medium text-white">
            Intellectual Property
          </h2>
          <p>
            Grab does not claim ownership of any content downloaded through the
            service. All intellectual property rights in downloaded content
            remain with their respective owners.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-medium text-white">Termination</h2>
          <p>
            We reserve the right to restrict or terminate access to the service
            at any time, for any reason, without prior notice.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-medium text-white">Changes</h2>
          <p>
            We may modify these terms at any time. Updated terms will be posted
            on this page. Your continued use of the service constitutes
            acceptance of the revised terms.
          </p>
        </section>
      </div>

      <Footer />
    </main>
  );
}
