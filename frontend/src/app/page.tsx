"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  getStatus,
  startDownload,
  validateUrl,
  type VideoFormat,
  type VideoInfo,
  type VideoQuality,
} from "@/lib/api";
import { clearRecent, loadRecent, saveRecent, type RecentItem } from "@/lib/recent";
import { UrlForm } from "@/components/url-form";
import { ResultCard, type DownloadPhase } from "@/components/result-card";
import { RecentDownloads } from "@/components/recent-downloads";

type Phase = "idle" | "validating" | DownloadPhase;

export default function Home() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [info, setInfo] = useState<VideoInfo | null>(null);
  const [url, setUrl] = useState("");
  const [format, setFormat] = useState<VideoFormat>("mp4");
  const [quality, setQuality] = useState<VideoQuality>("720");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [waking, setWaking] = useState(false);
  const [savedFile, setSavedFile] = useState<{ taskId: string; filename?: string } | null>(null);
  const [recent, setRecent] = useState<RecentItem[]>([]);

  const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wakeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setRecent(loadRecent());
    return () => {
      if (pollTimer.current) clearTimeout(pollTimer.current);
      if (wakeTimer.current) clearTimeout(wakeTimer.current);
    };
  }, []);

  const stopPolling = useCallback(() => {
    if (pollTimer.current) {
      clearTimeout(pollTimer.current);
      pollTimer.current = null;
    }
  }, []);

  const handleValidate = useCallback(
    async (targetUrl: string) => {
      setPhase("validating");
      setError(null);
      setWaking(false);
      setSavedFile(null);
      stopPolling();
      if (wakeTimer.current) clearTimeout(wakeTimer.current);
      wakeTimer.current = setTimeout(() => setWaking(true), 5000);

      try {
        const data = await validateUrl(targetUrl);
        if (wakeTimer.current) clearTimeout(wakeTimer.current);
        if (!data.valid || !data.title) {
          throw new Error("We couldn't find that video. Check the link and try again.");
        }
        setInfo(data);
        setUrl(targetUrl);
        setProgress(0);
        setPhase("info");
      } catch (err) {
        if (wakeTimer.current) clearTimeout(wakeTimer.current);
        setWaking(false);
        setInfo(null);
        setPhase("idle");
        setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      }
    },
    [stopPolling]
  );

  const handleDownload = useCallback(async () => {
    if (!info || !url) return;
    setPhase("downloading");
    setError(null);
    setProgress(0);

    try {
      const { taskId } = await startDownload(url, format, quality);

      const poll = async () => {
        let status;
        try {
          status = await getStatus(taskId);
        } catch {
          pollTimer.current = setTimeout(poll, 2000);
          return;
        }

        setProgress(status.progress);

        if (status.status === "completed") {
          setSavedFile({ taskId, filename: status.filename ?? undefined });
          setPhase("downloaded");
          setProgress(100);
          if (info) {
            setRecent(
              saveRecent({
                url,
                title: info.title ?? "Untitled",
                thumbnail: info.thumbnail ?? "",
                format,
                quality,
                downloadedAt: Date.now(),
              })
            );
          }
          toast.success("Download ready");
          return;
        }

        if (status.status === "failed") {
          setPhase("failed");
          setError(status.error ?? "The download failed. Try again or pick a lower quality.");
          return;
        }

        pollTimer.current = setTimeout(poll, 2000);
      };

      await poll();
    } catch (err) {
      setPhase("failed");
      setError(err instanceof Error ? err.message : "The download failed. Please try again.");
    }
  }, [info, url, format, quality]);

  const handleReset = useCallback(() => {
    stopPolling();
    setInfo(null);
    setUrl("");
    setSavedFile(null);
    setError(null);
    setProgress(0);
    setPhase("idle");
  }, [stopPolling]);

  const handleClearRecent = useCallback(() => {
    clearRecent();
    setRecent([]);
  }, []);

  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-xl flex-col items-center px-4 pb-16 pt-14 sm:pt-20">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_60%_45%_at_50%_-10%,rgba(59,130,246,0.16),transparent)]"
      />

      <section className="w-full text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          Download any video.
        </h1>
        <p className="mx-auto mt-3 max-w-md text-balance text-[15px] leading-relaxed text-muted">
          Paste a link, pick a format and quality, and it&apos;s yours. Free, no sign-up.
        </p>
      </section>

      <div className="mt-8 w-full">
        <UrlForm onSubmit={handleValidate} disabled={phase === "validating" || phase === "downloading"} />
        <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-muted/60">
          <span>YouTube</span>
          <span className="text-muted/30">·</span>
          <span>TikTok</span>
          <span className="text-muted/30">·</span>
          <span>Instagram</span>
          <span className="text-muted/30">·</span>
          <span>Twitter / X</span>
          <span className="text-muted/30">·</span>
          <span>Vimeo</span>
          <span className="text-muted/30">·</span>
          <span>Dailymotion</span>
          <span className="text-muted/30">·</span>
          <span className="text-accent-bright/80">and 1000+ more</span>
        </div>
      </div>

      <div aria-live="polite">
        {phase === "validating" && (
          <div className="mt-5 flex w-full items-start gap-3 rounded-xl border border-edge bg-surface px-4 py-3">
            <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-accent-bright" aria-hidden />
            <div className="text-sm">
              {waking ? (
                <>
                  <p className="font-medium text-white">Waking up the server…</p>
                  <p className="mt-1 leading-relaxed text-muted">
                    The free backend sleeps after inactivity, so the first request can take up to a
                    minute to wake it. It stays awake for a while after that.
                  </p>
                </>
              ) : (
                <p className="text-muted">Looking up the video…</p>
              )}
            </div>
          </div>
        )}

        {phase !== "failed" && phase !== "downloading" && error && (
          <div className="mt-5 max-w-xl rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
            {error}
          </div>
        )}
      </div>

      {info && (
        <div className="mt-8 w-full">
          <ResultCard
            title={info.title ?? "Untitled"}
            thumbnail={info.thumbnail ?? ""}
            channel={info.channel ?? ""}
            duration={info.duration ?? 0}
            format={format}
            quality={quality}
            onFormatChange={setFormat}
            onQualityChange={setQuality}
            phase={phase === "idle" || phase === "validating" ? "info" : phase}
            progress={progress}
            error={phase === "failed" ? error : null}
            onDownload={handleDownload}
            onReset={handleReset}
            savedFile={savedFile}
            site={info.site}
          />
        </div>
      )}

      <RecentDownloads items={recent} onSelect={handleValidate} onClear={handleClearRecent} />

      <footer className="mt-12 w-full border-t border-edge pt-6 text-center">
        <p className="mx-auto max-w-md text-xs leading-relaxed text-muted">
          Download only content you own or have permission to use. Files are generated on demand
          and removed from the server within 30 minutes.
        </p>
      </footer>
    </main>
  );
}