"use client";

/**
 * ============================================================================
 * BOOKABLE FORMATS — the actual product list
 * ============================================================================
 * Three things a promoter can buy. This is the most commercially important
 * section after the hero, so:
 *
 *   - EVERY field is visible without interaction. Nothing (description, event
 *     type, intensity, genres, duration) is hidden behind hover.
 *   - the CTA per card scrolls to the booking form and pre-selects that format
 *   - desktop gets a moderate pointer tilt (≤6°, HIGH tier only)
 *   - mobile is a scroll-snap carousel with visible arrow controls and a
 *     paging indicator — the swipe is an addition, never the only route
 *
 * Intensity is shown as a discrete 5-step meter with a word label. It is a
 * qualitative claim about the set, not a fabricated statistic.
 */

import * as React from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { formats, getMode, getText, type ShowFormat } from "@/data/presskit";
import { SectionHeader, CornerTicks } from "@/components/ui/tech-frame";
import { Button } from "@/components/ui/button";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/reveal";
import { useLocale, useMode, useQuality } from "@/components/over-emotions/frequency-provider";
import { qualityProfile } from "@/lib/webgl";
import { cn } from "@/lib/utils";
import { spring } from "@/lib/motion";

export function BookableFormats() {
  const { locale } = useLocale();
  const scrollerRef = React.useRef<HTMLDivElement>(null);
  const [page, setPage] = React.useState(0);

  /* Carousel paging for mobile. Uses scrollTo on a scroll-snap container, so
     native momentum and the scrollbar-free swipe both keep working. */
  const scrollToPage = (index: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(formats.length - 1, index));
    const child = el.children[clamped] as HTMLElement | undefined;
    child?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
    setPage(clamped);
  };

  React.useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      // Throttled to one read per frame — no layout thrash while swiping.
      frame = requestAnimationFrame(() => {
        const width = el.clientWidth || 1;
        setPage(Math.round(el.scrollLeft / width));
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section
      id="formats"
      aria-labelledby="formats-title"
      className="relative border-b border-border py-24 md:py-32"
    >
      <div className="gutter mx-auto max-w-7xl">
        <Reveal>
          <SectionHeader
            id="formats-title"
            number="04"
            title={locale === "en" ? "AVAILABLE SETS" : "SETS DISPONIBLES"}
            kicker={locale === "en" ? "WHAT YOU CAN BOOK" : "LO QUE PUEDES CONTRATAR"}
          />
        </Reveal>

        {/* ------------------------------------------------------- desktop --- */}
        <RevealGroup
          stagger={0.06}
          className="mt-12 hidden gap-4 sm:grid sm:grid-cols-2 md:mt-16"
        >
          {formats.map((format) => (
            <RevealItem key={format.id}>
              <FormatCard format={format} />
            </RevealItem>
          ))}
        </RevealGroup>

        {/* -------------------------------------------------------- mobile --- */}
        <div className="mt-10 sm:hidden">
          <div
            ref={scrollerRef}
            className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-5"
            role="group"
            aria-label="Bookable formats carousel"
          >
            {formats.map((format) => (
              <div
                key={format.id}
                className="w-[86vw] shrink-0 snap-start"
              >
                <FormatCard format={format} />
              </div>
            ))}
          </div>

          {/* Visible controls — the carousel is never swipe-only */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="plate"
                size="icon"
                onClick={() => scrollToPage(page - 1)}
                disabled={page === 0}
                aria-label="Previous format"
              >
                <ChevronLeft className="size-5" />
              </Button>
              <Button
                variant="plate"
                size="icon"
                onClick={() => scrollToPage(page + 1)}
                disabled={page === formats.length - 1}
                aria-label="Next format"
              >
                <ChevronRight className="size-5" />
              </Button>
            </div>
            <div className="flex items-center gap-2" aria-hidden="true">
              {formats.map((format, i) => (
                <span
                  key={format.id}
                  className={cn(
                    "h-[2px] transition-all duration-[var(--duration-normal)]",
                    i === page ? "w-8 bg-acid" : "w-4 bg-border-strong",
                  )}
                />
              ))}
            </div>
            <span className="label text-label-xs text-gray tabular-nums">
              {String(page + 1).padStart(2, "0")} / {String(formats.length).padStart(2, "0")}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ CARD --- */

function FormatCard({ format }: { format: ShowFormat }) {
  const { locale } = useLocale();
  const cardRef = React.useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const quality = useQuality();
  const { setModeId } = useMode();
  const tiltEnabled = qualityProfile[quality].parallax && !reduced;
  const modeAccent = getMode(format.mode).accent;

  const rotateXRaw = useMotionValue(0);
  const rotateYRaw = useMotionValue(0);
  const rotateX = useSpring(rotateXRaw, spring.soft);
  const rotateY = useSpring(rotateYRaw, spring.soft);

  const onPointerMove = (event: React.PointerEvent) => {
    if (!tiltEnabled) return;
    const el = cardRef.current;
    if (!el) return;
    const box = el.getBoundingClientRect();
    const px = (event.clientX - box.left) / box.width - 0.5;
    const py = (event.clientY - box.top) / box.height - 0.5;
    // Capped at 6° — enough to read as depth, not enough to distort the text.
    rotateYRaw.set(px * 6);
    rotateXRaw.set(-py * 6);
  };

  const resetTilt = () => {
    rotateXRaw.set(0);
    rotateYRaw.set(0);
  };

  /**
   * Booking a specific format does two things: switches the site into that
   * format's musical mode (so the whole page reflects the choice) and jumps to
   * the form, which reads the mode to preselect the format field.
   */
  const onBook = () => setModeId(format.mode);

  return (
    <motion.article
      ref={cardRef}
      onPointerMove={onPointerMove}
      onPointerLeave={resetTilt}
      style={
        tiltEnabled
          ? { rotateX, rotateY, transformPerspective: 1200 }
          : undefined
      }
      className={cn(
        "group relative flex h-full flex-col border border-border bg-charcoal/60",
        "transition-colors duration-[var(--duration-normal)]",
        "hover:border-border-strong",
        "cut-corner-lg",
      )}
    >
      {/* Mode-coloured top edge — ties the card to the frequency system */}
      <span
        aria-hidden="true"
        className="h-[3px] w-full shrink-0"
        style={{ backgroundColor: modeAccent }}
      />

      <div className="flex flex-1 flex-col gap-5 p-6">
        {/* Header */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="size-1.5 shrink-0"
              style={{ backgroundColor: modeAccent }}
            />
            <span className="label text-label-xs text-gray">
              {getText(format.eventType, locale)}
            </span>
          </div>
          <h3 className="font-display text-3xl leading-[0.95] text-bone uppercase">
            {getText(format.name, locale)}
          </h3>
          <p className="text-body-sm text-bone">{getText(format.tagline, locale)}</p>
        </div>

        <p className="text-body-sm text-bone-dim">{getText(format.description, locale)}</p>

        {/* Intensity meter — discrete steps + a word, never a fake percentage */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="label text-label-xs text-gray">{locale === "en" ? "INTENSITY" : "INTENSIDAD"}</span>
            <span className="label text-label-xs" style={{ color: modeAccent }}>
              {getText(format.intensityLabel, locale)}
            </span>
          </div>
          <div className="flex gap-1" role="img" aria-label={`Intensity ${format.intensity} of 5 — ${format.intensityLabel}`}>
            {Array.from({ length: 5 }, (_, i) => (
              <span
                key={i}
                className={cn("h-2 flex-1 border")}
                style={
                  i < format.intensity
                    ? { backgroundColor: modeAccent, borderColor: modeAccent }
                    : { borderColor: "var(--color-border-strong)" }
                }
              />
            ))}
          </div>
        </div>

        {/* Genres */}
        <div className="flex flex-col gap-2">
          <span className="label text-label-xs text-gray">{locale === "en" ? "GENRES" : "GÉNEROS"}</span>
          <ul className="flex flex-wrap gap-1.5">
            {format.genres.map((genre) => (
              <li
                key={genre}
                className="label border border-border px-2 py-1 text-label-xs text-bone-dim"
              >
                {genre}
              </li>
            ))}
          </ul>
        </div>

        {/* Duration */}
        <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
          <span className="label text-label-xs text-gray">{locale === "en" ? "DURATION" : "DURACIÓN"}</span>
          <span className="label text-label-sm text-bone tabular-nums">
            {format.duration}
          </span>
        </div>

        <Button variant="outline" className="w-full" asChild onClick={onBook}>
          <a href="#booking">
            {getText(format.cta, locale)}
            <ArrowRight
              className="size-4 transition-transform duration-[var(--duration-normal)] group-hover:translate-x-1"
              aria-hidden="true"
            />
          </a>
        </Button>
      </div>

      <CornerTicks size={14} color="border-bone-dim/30" />
    </motion.article>
  );
}

export default BookableFormats;
