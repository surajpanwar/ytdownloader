"use client";

import { CheckCircle2, Clock, Download, Loader2, PlayCircle, RotateCcw, Save } from "lucide-react";

import { fileUrl, type VideoFormat, type VideoQuality } from "@/lib/api";
import { cn, formatDuration } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/progress-bar";

export type DownloadPhase = "info" | "downloading" | "downloaded" | "failed";

const FORMATS: { value: VideoFormat; label: string }[] = [
  { value: "mp4", label: "MP4" },
  { value: "webm", label: "WebM" },
  { value: "mp3", label: "MP3" },
  { value: "m4a", label: "M4A" },
];

const QUALITIES: { value: VideoQuality; label: string }[] = [
  { value: "1080", label: "1080p" },
  { value: "720", label: "720p" },
  { value: "480", label: "480p" },
  { value: "360", label: "360p" },
];

interface SegmentedProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
  ariaLabel: string;
}

function Segmented<T extends string>({ options, value, onChange, disabled, ariaLabel }: SegmentedProps<T>) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="grid gap-1"
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          disabled={disabled}
          onClick={() => onChange(option.value)}
          aria-pressed={value === option.value}
          className={cn(
            "h-9 rounded-lg border text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60",
            value === option.value
              ? "border-accent bg-accent/15 text-white"
              : "border-edge bg-transparent text-muted hover:border-accent/40 hover:text-white",
            disabled && "cursor-not-allowed opacity-40"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

interface ResultCardProps {
  title: string;
  thumbnail: string;
  channel: string;
  duration: number;
  format: VideoFormat;
  quality: VideoQuality;
  onFormatChange: (format: VideoFormat) => void;
  onQualityChange: (quality: VideoQuality) => void;
  phase: DownloadPhase;
  progress: number;
  error: string | null;
  onDownload: () => void;
  onReset: () => void;
  savedFile?: { taskId: string; filename?: string } | null;
  site?: string;
}

export function ResultCard({
  title,
  thumbnail,
  channel,
  duration,
  format,
  quality,
  onFormatChange,
  onQualityChange,
  phase,
  progress,
  error,
  onDownload,
  onReset,
  savedFile,
  site,
}: ResultCardProps) {
  const isAudio = format === "mp3" || format === "m4a";
  const durationLabel = formatDuration(duration);

  return (
    <section className="animate-fade-up overflow-hidden rounded-2xl border border-edge bg-surface shadow-lg shadow-black/30">
      <div className="relative aspect-video w-full bg-black">
        {thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnail}
            alt={title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <PlayCircle className="h-12 w-12 text-muted" aria-hidden />
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        {durationLabel && (
          <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-md bg-black/70 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
            <Clock className="h-3 w-3" aria-hidden />
            {durationLabel}
          </span>
        )}
      </div>

      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-2">
          <h3 className="line-clamp-2 flex-1 text-base font-semibold leading-snug text-white">{title}</h3>
          {site && (
            <span className="shrink-0 rounded-md bg-accent/20 px-2 py-0.5 text-xs font-medium text-accent-bright">
              {site}
            </span>
          )}
        </div>
        <p className="mt-1 truncate text-sm text-muted">{channel}</p>

        <div className="mt-5 space-y-4">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted">Format</p>
            <Segmented
              options={FORMATS}
              value={format}
              onChange={onFormatChange}
              disabled={phase === "downloading"}
              ariaLabel="Output format"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <p className="text-xs font-medium text-muted">Quality</p>
              {isAudio && <p className="text-xs text-muted/70">Not used for audio</p>}
            </div>
            <Segmented
              options={QUALITIES}
              value={quality}
              onChange={onQualityChange}
              disabled={isAudio || phase === "downloading"}
              ariaLabel="Video quality"
            />
          </div>
        </div>

        <div className="mt-5">
          {phase === "info" && (
            <Button variant="glow" size="lg" className="w-full" onClick={onDownload}>
              <Download className="h-5 w-5" aria-hidden />
              Download
            </Button>
          )}

          {phase === "downloading" && (
            <div className="space-y-3 rounded-xl border border-edge bg-raised p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-white">
                  <Loader2 className="h-4 w-4 animate-spin text-accent-bright" aria-hidden />
                  {progress > 0 ? "Downloading" : "Preparing the download"}
                </span>
                <span className="font-medium tabular-nums text-accent-bright">{Math.round(progress)}%</span>
              </div>
              <ProgressBar value={progress} />
            </div>
          )}

          {phase === "downloaded" && savedFile && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
                <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />
                <span className="truncate font-medium">Download ready</span>
              </div>
              <Button asChild variant="success" size="lg" className="w-full">
                <a href={fileUrl(savedFile.taskId)} rel="noopener">
                  <Save className="h-5 w-5" aria-hidden />
                  Save file
                </a>
              </Button>
              {savedFile.filename && (
                <p className="truncate text-center text-xs text-muted">{savedFile.filename}</p>
              )}
              <Button variant="subtle" className="w-full" onClick={onReset}>
                Download another video
              </Button>
            </div>
          )}

          {phase === "failed" && error && (
            <div className="space-y-3">
              <p className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
                {error}
              </p>
              <div className="flex gap-2">
                <Button className="flex-1" onClick={onDownload}>
                  <RotateCcw className="h-4 w-4" aria-hidden />
                  Try again
                </Button>
                <Button variant="subtle" className="flex-1" onClick={onReset}>
                  Choose a different video
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}