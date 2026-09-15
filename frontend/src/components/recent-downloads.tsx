"use client";

import { History, PlayCircle } from "lucide-react";

import type { RecentItem } from "@/lib/recent";
import { timeAgo } from "@/lib/recent";

interface RecentDownloadsProps {
  items: RecentItem[];
  onSelect: (url: string) => void;
  onClear: () => void;
}

export function RecentDownloads({ items, onSelect, onClear }: RecentDownloadsProps) {
  if (items.length === 0) return null;

  return (
    <section className="mt-12 w-full">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-medium text-white">
          <History className="h-4 w-4 text-muted" aria-hidden />
          Recent downloads
        </h2>
        <button
          type="button"
          onClick={onClear}
          className="text-xs text-muted transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
        >
          Clear
        </button>
      </div>

      <ul className="space-y-2">
        {items.map((item) => (
          <li key={`${item.url}::${item.format}::${item.quality}`}>
            <button
              type="button"
              onClick={() => onSelect(item.url)}
              className="group flex w-full items-center gap-3 rounded-xl border border-edge bg-surface p-2 text-left transition-colors hover:border-accent/50 hover:bg-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
            >
              {item.thumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.thumbnail}
                  alt=""
                  className="h-12 w-16 shrink-0 rounded-md object-cover"
                  loading="lazy"
                />
              ) : (
                <span className="flex h-12 w-16 shrink-0 items-center justify-center rounded-md bg-raised">
                  <PlayCircle className="h-5 w-5 text-muted" aria-hidden />
                </span>
              )}
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm text-white">{item.title}</span>
                <span className="block text-xs text-muted">
                  {item.format.toUpperCase()} {item.quality}p
                </span>
              </span>
              <span className="shrink-0 text-xs text-muted">{timeAgo(item.downloadedAt)}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}