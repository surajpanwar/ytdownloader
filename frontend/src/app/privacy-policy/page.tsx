import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — Grab",
  description: "Privacy policy for the Grab video downloader.",
};

export default function PrivacyPolicy() {
  return (
    <main className="mx-auto max-w-2xl px-4 pb-16 pt-14 sm:pt-20">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-white"
      >
        <span aria-hidden>&larr;</span> Back
      </Link>

      <h1 className="text-3xl font-semibold tracking-tight text-white">
        Privacy Policy
      </h1>
      <p className="mt-2 text-sm text-muted">
        Last updated: September 15, 2026
      </p>

      <div className="mt-8 space-y-6 text-[15px] leading-relaxed text-muted">
        <section>
          <h2 className="mb-2 text-lg font-medium text-white">Overview</h2>
          <p>
            Grab is a free, open-source video downloader. We respect your
            privacy and collect only the minimum data needed to operate the
            service.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-medium text-white">
            Information We Collect
          </h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong className="text-white">Video URLs you submit</strong> —
              used solely to fetch video metadata and generate a download.
              Deleted within 30 minutes.
            </li>
            <li>
              <strong className="text-white">Usage data</strong> — anonymous
              analytics (page views, feature usage) to help us improve the
              tool. No personally identifiable information is collected.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-medium text-white">
            Cookies &amp; Local Storage
          </h2>
          <p>
            We use browser local storage to remember your recent downloads so
            you can quickly re-download them. This data never leaves your
            device. We do not use third-party advertising or tracking cookies.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-medium text-white">
            Third-Party Services
          </h2>
          <p>
            We may display ads from third-party ad networks. These ad partners
            may use cookies or similar technologies to serve ads and measure
            their effectiveness. You can opt out of personalized advertising
            through your browser settings or the relevant ad network opt-out
            pages.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-medium text-white">
            Data Retention
          </h2>
          <p>
            Downloaded files are removed from our server within 30 minutes. We
            do not store, archive, or share video content. Server logs are
            automatically purged periodically.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-medium text-white">Your Rights</h2>
          <p>
            Because we collect virtually no personal data, there is no
            personally identifiable information to request, correct, or delete.
            If you have questions, reach out through our GitHub repository.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-medium text-white">Changes</h2>
          <p>
            We may update this policy from time to time. Changes will be posted
            on this page with an updated date. Continued use of the service
            constitutes acceptance of the revised policy.
          </p>
        </section>
      </div>
    </main>
  );
}
