"use client";

import * as React from "react";
import { useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight, Volume2, VolumeX } from "lucide-react";
import { archive, getMode, getText } from "@/data/presskit";
import { SectionHeader } from "@/components/ui/tech-frame";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { useLocale } from "@/components/over-emotions/frequency-provider";
import { cn } from "@/lib/utils";

export function LiveArchive() {
  const { locale } = useLocale();
  return (
    <section
      id="archive"
      aria-labelledby="archive-title"
      className="relative border-b border-border"
    >
      <div className="gutter mx-auto max-w-7xl pt-24 md:pt-32">
        <Reveal>
          <SectionHeader
            id="archive-title"
            number="06"
            title={locale === "en" ? "LIVE ARCHIVE" : "ARCHIVO EN VIVO"}
            kicker={locale === "en" ? "STAGES / CROWDS / BOOTHS" : "ESCENARIOS / PÚBLICO / CABINAS"}
          />
        </Reveal>
        <p className="label mt-4 text-label-xs text-gray">
          {locale === "en" ? "VIDEOS COMING SOON — PLACEHOLDER FRAMES" : "VIDEOS PRÓXIMAMENTE — CUADROS DE EJEMPLO"}
        </p>
      </div>

      <SnapCarousel />
    </section>
  );
}

/* -------------------------------------------------- CAROUSEL UNIFICADO ------ */

function SnapCarousel() {
  const { locale } = useLocale();
  const scrollerRef = React.useRef<HTMLUListElement>(null);
  const [page, setPage] = React.useState(0);
  const [unmutedId, setUnmutedId] = React.useState<string | null>(null);
  const reduced = useReducedMotion();

  const go = (next: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(archive.length - 1, next));
    const child = el.children[clamped] as HTMLElement | undefined;
    child?.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
      inline: "center",
      block: "nearest",
    });
    setPage(clamped);
  };

  React.useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const first = el.children[0] as HTMLElement | undefined;
        const step = first ? first.offsetWidth + 16 : el.clientWidth;
        setPage(Math.round(el.scrollLeft / step));
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  // Efecto para controlar qué video está desmuteado
  React.useEffect(() => {
    archive.forEach((item) => {
      const videoEl = document.getElementById(`vid-${item.id}`) as HTMLVideoElement | null;
      if (videoEl) {
        videoEl.muted = unmutedId !== item.id;
      }
    });
  }, [unmutedId]);

  // NUEVO: Escuchar si MusicLab empieza a reproducir para mutear videos
  React.useEffect(() => {
    const muteVideos = () => setUnmutedId(null);
    window.addEventListener("force-pause-videos", muteVideos);
    return () => window.removeEventListener("force-pause-videos", muteVideos);
  }, []);

  const toggleSound = (id: string) => {
    if (unmutedId === id) {
      setUnmutedId(null);
    } else {
      setUnmutedId(id);
      // NUEVO: Disparamos evento para pausar MusicLab
      window.dispatchEvent(new CustomEvent("force-pause-audio"));
    }
  };

  return (
    <div className="py-10">
      <ul
        ref={scrollerRef}
        className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 md:px-12"
      >
        {archive.map((item, i) => (
          <li
            key={item.id}
            className="w-[82vw] shrink-0 snap-center sm:w-[60vw] md:w-[40vw]"
          >
            <figure 
              className="group relative aspect-[4/3] w-full cursor-pointer overflow-hidden border border-border"
              onClick={() => item.video && toggleSound(item.id)}
            >
              {item.video ? (
                <video
                  id={`vid-${item.id}`}
                  src={item.video}
                  poster={item.poster}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className={cn(
                    "absolute inset-0 h-full w-full object-cover transition-all duration-[var(--duration-slow)]",
                    unmutedId === item.id
                      ? "saturate-100 contrast-100"
                      : "saturate-[0.5] contrast-[1.1] group-hover:saturate-[0.8]"
                  )}
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.poster}
                  alt={item.imageAlt}
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                />
              )}
              <div className="grain-layer pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-t from-void via-transparent to-transparent pointer-events-none" />
              
              <span
                aria-hidden="true"
                className="absolute top-0 left-0 h-1 w-14 pointer-events-none"
                style={{ backgroundColor: getMode(item.mode).accent }}
              />

              {item.video && (
              <button
                className={cn(
                  "absolute top-4 right-4 z-10 grid size-10 place-items-center rounded-full backdrop-blur-sm transition-colors",
                  unmutedId === item.id
                    ? "bg-acid text-void"
                    : "bg-void/60 text-bone hover:bg-acid hover:text-void"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSound(item.id);
                }}
                aria-label={unmutedId === item.id ? "Silenciar video" : "Activar sonido"}
              >
                {unmutedId === item.id ? (
                  <Volume2 className="size-5" />
                ) : (
                  <VolumeX className="size-5" />
                )}
              </button>
              )}

              <figcaption className="absolute inset-x-0 bottom-0 flex flex-col gap-0.5 p-4 pointer-events-none">
                <span className="label text-label-sm text-bone">
                  {getText(item.venue, locale)}
                </span>
                <span className="label text-label-xs text-bone-dim">
                  {getText(item.city, locale)} — {getText(item.date, locale)}
                </span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>

      <div className="gutter mx-auto mt-4 flex max-w-7xl items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant="plate"
            size="icon"
            onClick={() => go(page - 1)}
            disabled={page === 0}
            aria-label="Previous video"
          >
            <ChevronLeft className="size-5" />
          </Button>
          <Button
            variant="plate"
            size="icon"
            onClick={() => go(page + 1)}
            disabled={page === archive.length - 1}
            aria-label="Next video"
          >
            <ChevronRight className="size-5" />
          </Button>
        </div>
        <span className="label text-label-xs text-gray tabular-nums">
          {String(page + 1).padStart(2, "0")} /{" "}
          {String(archive.length).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
}

export default LiveArchive;