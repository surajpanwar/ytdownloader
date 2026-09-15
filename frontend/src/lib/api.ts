export type VideoFormat = "mp4" | "mp3" | "webm" | "m4a";
export type VideoQuality = "1080" | "720" | "480" | "360";

export const AUDIO_FORMATS: VideoFormat[] = ["mp3", "m4a"];

export interface VideoInfo {
  valid: boolean;
  title?: string;
  thumbnail?: string;
  duration?: number | null;
  channel?: string;
  webpageUrl?: string;
  site?: string;
}

export type DownloadStatusValue = "pending" | "downloading" | "completed" | "failed";

export interface DownloadStatus {
  taskId: string;
  status: DownloadStatusValue;
  progress: number;
  filename?: string | null;
  error?: string | null;
}

export interface StartDownloadResult {
  taskId: string;
}

interface ErrorPayload {
  error?: { code?: string; message?: string; requestId?: string };
  detail?: string;
}

const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/+$/, "");

export function apiBase(): string {
  return API_BASE;
}

export function fileUrl(taskId: string): string {
  return `${API_BASE}/api/download/${taskId}/file`;
}

function extractMessage(data: unknown, status: number): string {
  const payload = data as ErrorPayload;
  if (payload?.error?.message) return payload.error.message;
  if (typeof payload?.detail === "string" && payload.detail) return payload.detail;
  return `The backend returned ${status}. Try again in a moment.`;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    });
  } catch {
    throw new Error(
      "Couldn't reach the backend. On the free Render tier the server may be asleep — give it a few seconds and try again."
    );
  }

  const data: unknown = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(extractMessage(data, res.status));
  }
  return data as T;
}

export function validateUrl(url: string): Promise<VideoInfo> {
  return request<VideoInfo>("/api/validate", {
    method: "POST",
    body: JSON.stringify({ url }),
  });
}

export function startDownload(url: string, format: VideoFormat, quality: VideoQuality): Promise<StartDownloadResult> {
  return request<StartDownloadResult>("/api/download", {
    method: "POST",
    body: JSON.stringify({ url, format, quality }),
  });
}

export function getStatus(taskId: string): Promise<DownloadStatus> {
  return request<DownloadStatus>(`/api/download/${taskId}/status`);
}