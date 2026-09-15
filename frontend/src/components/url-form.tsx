"use client";

import { useState, type FormEvent } from "react";
import { Download, Link2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface UrlFormProps {
  onSubmit: (url: string) => void;
  disabled: boolean;
}

export function UrlForm({ onSubmit, disabled }: UrlFormProps) {
  const [value, setValue] = useState("");
  const hasValue = value.trim().length > 0;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    setValue("");
    onSubmit(trimmed);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex items-center gap-1 rounded-2xl border border-edge bg-surface p-2 pl-4 shadow-lg shadow-black/30 transition-colors focus-within:border-accent/60">
        <Link2 className="h-4 w-4 shrink-0 text-muted" aria-hidden />
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Paste a YouTube link"
          inputMode="url"
          autoComplete="off"
          spellCheck={false}
          aria-label="YouTube video URL"
          className="h-10 w-full min-w-0 flex-1 border-0 bg-transparent px-3 text-[15px] text-white placeholder:text-muted/70 focus:outline-none disabled:opacity-50"
        />
        <Button
          type="submit"
          size="icon"
          variant="glow"
          disabled={disabled || !hasValue}
          aria-label="Download"
          className={cn("shrink-0", hasValue && !disabled && "animate-pulse-glow")}
        >
          <Download className="h-5 w-5" aria-hidden />
        </Button>
      </div>
    </form>
  );
}