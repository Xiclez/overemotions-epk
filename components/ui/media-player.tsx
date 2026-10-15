"use client";

/**
 * MediaPlayer — poster tile that opens an accessible video modal.
 *
 * Accessibility / behaviour handled by Radix Dialog: Escape closes, focus is
 * trapped then restored, background scroll is locked, the dialog is labelled.
 * The video only starts on an explicit click, is never muted-autoplayed into the
 * page, and is paused + reset when the modal closes so audio can never continue
 * behind a closed overlay.
 *
 * With `src = null` (the default in this mockup) the poster is shown and the
 * modal explains that the video slot is empty — no broken <video> element.
 */

import * as React from "react";
import Image from "next/image";
import { Play, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CornerTicks } from "@/components/ui/tech-frame";
import { cn } from "@/lib/utils";

export interface MediaPlayerProps {
  /** Video source. `null` renders the "slot empty" state. */
  src?: string | null;
  poster: string;
  posterAlt: string;
  title: string;
  /** Small label rendered over the poster, e.g. "OFFICIAL VIDEO". */
  kicker?: string;
  className?: string;
  posterClassName?: string;
  /** Renders only the modal; the trigger is supplied elsewhere. */
  controlled?: { open: boolean; onOpenChange: (open: boolean) => void };
  children?: React.ReactNode;
}

export function MediaPlayer({
  src = null,
  poster,
  posterAlt,
  title,
  kicker,
  className,
  posterClassName,
  controlled,
  children,
}: MediaPlayerProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const open = controlled ? controlled.open : internalOpen;
  const setOpen = controlled ? controlled.onOpenChange : setInternalOpen;
  const videoRef = React.useRef<HTMLVideoElement>(null);

  // Never leave audio playing behind a closed modal.
  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (open) {
      void video.play().catch(() => {
        /* Autoplay refusal is fine — the visitor can press play. */
      });
    } else {
      video.pause();
      video.currentTime = 0;
    }
  }, [open]);

  return (
    <>
      {controlled ? null : children ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={cn("group block w-full text-left", className)}
          data-cursor="play"
          aria-label={`Play ${title}`}
        >
          {children}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          data-cursor="play"
          aria-label={`Play ${title}`}
          className={cn(
            "group relative block w-full overflow-hidden border border-border",
            "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acid",
            className,
          )}
        >
          <div className={cn("relative aspect-video w-full", posterClassName)}>
            <Image
              src={poster}
              alt={posterAlt}
              fill
              sizes="(max-width: 768px) 100vw, 80vw"
              className={cn(
                "object-cover",
                "transition-transform duration-[var(--duration-slow)] ease-[var(--ease-out-industrial)]",
                "group-hover:scale-[1.03]",
              )}
            />
            <span className="absolute inset-0 bg-gradient-to-t from-void via-void/20 to-transparent" />
            <span className="grain-layer" />
            <CornerTicks size={16} color="border-bone-dim/50" />

            {/* Play affordance — icon plus text, never icon-only */}
            <span className="absolute inset-0 grid place-items-center">
              <span
                className={cn(
                  "flex items-center gap-3 border border-acid bg-void/70 px-5 py-3",
                  "label text-label-sm text-acid backdrop-blur-[2px]",
                  "transition-colors duration-[var(--duration-fast)]",
                  "group-hover:bg-acid group-hover:text-void",
                )}
              >
                <Play className="size-4 fill-current" aria-hidden="true" />
                PLAY
              </span>
            </span>

            {kicker && (
              <span className="label absolute top-4 left-4 text-label-xs text-bone-dim">
                {kicker}
              </span>
            )}
          </div>
        </button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showClose={false}
          className="max-w-6xl border-border-strong bg-void p-0"
          aria-describedby={src ? undefined : "media-empty-desc"}
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <DialogTitle className="text-label-sm">{title}</DialogTitle>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close video"
              className={cn(
                "grid size-11 place-items-center border border-border-strong text-bone",
                "transition-colors hover:border-acid hover:text-acid",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acid",
              )}
            >
              <X className="size-5" />
            </button>
          </div>

          {src ? (
            <video
              ref={videoRef}
              src={src}
              poster={poster}
              controls
              playsInline
              // No autoplay attribute: playback is triggered by the open effect,
              // which the visitor initiated.
              className="aspect-video w-full bg-void"
            />
          ) : (
            <div className="relative aspect-video w-full">
              <Image
                src={poster}
                alt={posterAlt}
                fill
                sizes="90vw"
                className="object-cover opacity-60"
              />
              <div className="absolute inset-0 grid place-items-center bg-void/70 p-6 text-center">
                <div className="flex max-w-md flex-col items-center gap-4">
                  <span className="label border border-acid px-3 py-1 text-label-xs text-acid">
                    VIDEO SLOT EMPTY
                  </span>
                  <DialogDescription
                    id="media-empty-desc"
                    className="text-body-sm text-bone-dim"
                  >
                    No video file is attached yet. Drop{" "}
                    <code className="text-acid">video.mp4</code> into{" "}
                    <code className="text-acid">/public/media/</code> and set{" "}
                    <code className="text-acid">officialVideo.videoSrc</code> in{" "}
                    <code className="text-acid">data/presskit.ts</code>.
                  </DialogDescription>
                  <Button variant="outline" onClick={() => setOpen(false)}>
                    CLOSE
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default MediaPlayer;
