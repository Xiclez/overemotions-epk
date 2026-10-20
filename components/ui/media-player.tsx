"use client";

/**
 * MediaPlayer — poster tile that opens an accessible video modal.
 *
 * Accessibility / behaviour handled by Radix Dialog: Escape closes, focus is
 * trapped then restored, background scroll is locked, the dialog is labelled.
 * The full video (with audio) only starts on an explicit click, and unmounts
 * with the modal so audio can never continue behind a closed overlay.
 *
 * Optional `highlights` render a strip of silent looping thumbnails under the
 * (static) poster. Clicking one opens the player at that highlight's `start`
 * and pauses at its `end`; clicking the poster plays from the beginning.
 * Thumbnails only loop while on screen, and never with reduced motion.
 *
 * With `src = null` (the default in this mockup) the poster is shown and the
 * modal explains that the video slot is empty — no broken <video> element.
 */

import * as React from "react";
import Image from "next/image";
import { Play, X } from "lucide-react";
import { useReducedMotion } from "motion/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CornerTicks } from "@/components/ui/tech-frame";
import { cn } from "@/lib/utils";

export interface MediaHighlight {
  id: string;
  /** Segment of the full video, in seconds. */
  start: number;
  end: number;
  /** Short silent clip of the segment, looped as the thumbnail. */
  clip: string;
  label: string;
}

export interface MediaPlayerProps {
  /** Video source. `null` renders the "slot empty" state. */
  src?: string | null;
  poster: string;
  posterAlt: string;
  title: string;
  /** Small label rendered over the poster, e.g. "OFFICIAL VIDEO". */
  kicker?: string;
  /** Clickable highlight thumbnails rendered under the poster. */
  highlights?: MediaHighlight[];
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
  highlights,
  className,
  posterClassName,
  controlled,
  children,
}: MediaPlayerProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const open = controlled ? controlled.open : internalOpen;
  const setOpen = controlled ? controlled.onOpenChange : setInternalOpen;
  // Highlight being played; null plays the full video from the start.
  const [segment, setSegment] = React.useState<MediaHighlight | null>(null);

  const play = (highlight: MediaHighlight | null) => {
    setSegment(highlight);
    setOpen(true);
  };

  return (
    <>
      {controlled ? null : children ? (
        <button
          type="button"
          onClick={() => play(null)}
          className={cn("group block w-full text-left", className)}
          data-cursor="play"
          aria-label={`Play ${title}`}
        >
          {children}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => play(null)}
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

      {highlights && highlights.length > 0 && (
        <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {highlights.map((h) => (
            <li key={h.id}>
              <button
                type="button"
                onClick={() => play(h)}
                data-cursor="play"
                aria-label={`Play ${title} — ${h.label} (${formatTime(h.start)})`}
                className={cn(
                  "group relative block aspect-video w-full overflow-hidden border border-border",
                  "transition-colors hover:border-acid",
                  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acid",
                )}
              >
                <ClipLoop src={h.clip} paused={open} />
                <span className="absolute inset-0 bg-gradient-to-t from-void/90 via-transparent to-transparent" />
                <span className="absolute inset-x-2 bottom-2 flex items-end justify-between gap-2">
                  <span className="label truncate text-label-xs text-bone">{h.label}</span>
                  <span className="label shrink-0 text-label-xs text-acid tabular-nums">
                    {formatTime(h.start)}
                  </span>
                </span>
                <span className="absolute inset-0 grid place-items-center opacity-0 transition-opacity duration-[var(--duration-fast)] group-hover:opacity-100 group-focus-visible:opacity-100">
                  <Play className="size-6 fill-acid text-acid" aria-hidden="true" />
                </span>
              </button>
            </li>
          ))}
        </ul>
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
            <ModalVideo key={segment?.id ?? "full"} src={src} poster={poster} segment={segment} />
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

/**
 * The modal's <video>. It mounts when the dialog opens (the visitor's click),
 * seeks to the segment start, plays, and pauses once at the segment end — the
 * controls stay free to keep watching. Unmounting with the dialog stops audio.
 */
function ModalVideo({
  src,
  poster,
  segment,
}: {
  src: string;
  poster: string;
  segment: MediaHighlight | null;
}) {
  const ref = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const start = segment?.start ?? 0;
    const begin = () => {
      if (Math.abs(video.currentTime - start) > 0.5) video.currentTime = start;
      void video.play().catch(() => {
        /* Autoplay refusal is fine — the visitor can press play. */
      });
    };
    const stopAtEnd = () => {
      if (segment && video.currentTime >= segment.end) {
        video.pause();
        video.removeEventListener("timeupdate", stopAtEnd);
      }
    };
    if (video.readyState >= 1) begin();
    else video.addEventListener("loadedmetadata", begin, { once: true });
    video.addEventListener("timeupdate", stopAtEnd);
    return () => {
      video.removeEventListener("loadedmetadata", begin);
      video.removeEventListener("timeupdate", stopAtEnd);
      video.pause();
    };
  }, [segment]);

  return (
    <video
      ref={ref}
      // The #t fragment lets the browser start loading at the segment directly.
      src={segment ? `${src}#t=${segment.start}` : src}
      poster={poster}
      controls
      playsInline
      // No autoplay attribute: playback starts from the effect above, which
      // only runs because the visitor opened the player.
      className="aspect-video w-full bg-void"
    />
  );
}

/** Silent looping thumbnail clip. Plays only while on screen and not paused. */
function ClipLoop({ src, paused }: { src: string; paused: boolean }) {
  const ref = React.useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      threshold: 0.25,
    });
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (visible && !paused && !reduced) {
      void video.play().catch(() => {
        /* Autoplay refused (e.g. data saver) — the first frame stays visible. */
      });
    } else {
      video.pause();
    }
  }, [visible, paused, reduced]);

  return (
    <video
      ref={ref}
      // #t=0.1 makes browsers paint a first frame even before it plays.
      src={`${src}#t=0.1`}
      muted
      loop
      playsInline
      preload="metadata"
      aria-hidden="true"
      tabIndex={-1}
      className="absolute inset-0 h-full w-full object-cover transition-transform duration-[var(--duration-slow)] ease-[var(--ease-out-industrial)] group-hover:scale-[1.05]"
    />
  );
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default MediaPlayer;
