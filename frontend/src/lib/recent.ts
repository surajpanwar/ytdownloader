import type { VideoFormat, VideoQuality } from "@/lib/api";

export interface RecentItem {
  url: string;
  title: string;
  thumbnail: string;
  format: VideoFormat;
  quality: VideoQuality;
  downloadedAt: number;
}

const KEY = "yt-grab-recent";
const MAX_ITEMS = 5;

function isRecentItem(value: unknown): value is RecentItem {
  if (!value || typeof value !== "object") return false;
  const item = value as RecentItem;
  return (
    typeof item.url === "string" &&
    typeof item.title === "string" &&
    typeof item.downloadedAt === "number"
  );
}

export function loadRecent(): RecentItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isRecentItem).slice(0, MAX_ITEMS);
  } catch {
    return [];
  }
}

function persist(items: RecentItem[]): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    // storage full or unavailable; the in-memory list still works for the session
  }
}

export function saveRecent(item: RecentItem): RecentItem[] {
  const dedupeKey = `${item.url}::${item.format}::${item.quality}`;
  const items = [
    item,
    ...loadRecent().filter((r) => `${r.url}::${r.format}::${r.quality}` !== dedupeKey),
  ].slice(0, MAX_ITEMS);
  persist(items);
  return items;
}

export function clearRecent(): void {
  persist([]);
}

export function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}