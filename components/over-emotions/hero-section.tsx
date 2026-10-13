"use client";

/**
 * ============================================================================
 * HERO
 * ============================================================================
 * Back to front:
 *
 *   1. the melt shader (single canvas, mode-driven, lives here for the page)
 *   2. the 2026 logo, run through an SVG displacement filter. On load it
 *      condenses out of liquid; scrolling melts it again. That is the one
 *      orchestrated motion moment. It uses mix-blend-mode: difference, so the
 *      melt passing behind shows through inverted inside the lettering.
 *   3. the information layer: role, genres, vision, CTAs, readouts
 *
 * No scroll hijacking: every value is derived from one useScroll on the section.
 */

import * as React from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import Image from "next/image";
import { ArrowDown } from "lucide-react";
import { artist, getText, hero } from "@/data/presskit";
import { MeltShader } from "@/components/ui/melt-shader";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { BookingDrawerTrigger } from "@/components/ui/booking-drawer";
import { Marquee, MarqueeItem } from "@/components/ui/marquee";
import {
  useLocale,
  useMode,
  useQuality,
} from "@/components/over-emotions/frequency-provider";
import { cn } from "@/lib/utils";
import { duration } from "@/lib/motion";
import { qualityProfile } from "@/lib/webgl";

/** Displacement (px) at full melt, and the filter's id. */
const MAX_DISPLACE = 140;
const FILTER_ID = "oe-hero-melt";

export function HeroSection() {
  const sectionRef = React.useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { locale } = useLocale();
  const { mode } = useMode();
  const quality = useQuality();
  const profile = qualityProfile[quality];

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  /* ---- the melt: load-in solidify + scroll melt -------------------------
     `settle` goes 1 → 0 on entry; scroll adds melt back. The combined value
     drives the SVG filter imperatively, so nothing re-renders per frame. */
  const settle = useMotionValue(reduced ? 0 : 1);
  React.useEffect(() => {
    if (reduced) {
      settle.set(0);
      return;
    }
    let controls: ReturnType<typeof animate> | undefined;
    const run = () => {
      controls = animate(settle, 0, {
        duration: 2.6,
        delay: 0.15,
        ease: [0.45, 0, 0.2, 1],
      });
    };
    // If the intro overlay is up, solidify when it leaves; otherwise now.
    let introPending = false;
    try {
      introPending = window.sessionStorage.getItem("oe-entered") !== "true";
    } catch {
      introPending = false;
    }
    if (introPending) {
      window.addEventListener("oe-intro-done", run, { once: true });
    } else {
      run();
    }
    return () => {
      window.removeEventListener("oe-intro-done", run);
      controls?.stop();
    };
  }, [reduced, settle]);

  const melt = useTransform<number, number>([settle, scrollYProgress], ([st, p]) =>
    Math.min(1, st + (reduced ? 0 : p * 1.15)),
  );

  const logoRef = React.useRef<HTMLDivElement>(null);
  const displaceRef = React.useRef<SVGFEDisplacementMapElement>(null);
  const turbRef = React.useRef<SVGFETurbulenceElement>(null);

  React.useEffect(() => {
    const apply = (v: number) => {
      const eased = v * v * (3 - 2 * v);
      displaceRef.current?.setAttribute("scale", (eased * MAX_DISPLACE).toFixed(1));
      // Drips get longer as it melts: vertical frequency drops with the melt.
      turbRef.current?.setAttribute(
        "baseFrequency",
        `${(0.012 + eased * 0.004).toFixed(4)} ${(0.05 - eased * 0.042).toFixed(4)}`,
      );
      const el = logoRef.current;
      if (el) {
        // No filter at rest: zero cost once the logo has settled.
        el.style.filter = v < 0.002 ? "none" : `url(#${FILTER_ID})`;
        el.style.opacity = String(1 - eased * 0.35);
        el.style.transform = `translateY(${(eased * 4).toFixed(2)}%) scaleY(${(1 + eased * 0.12).toFixed(3)})`;
      }
    };
    apply(melt.get());
    return melt.on("change", apply);
  }, [melt]);

  const titleY = useTransform(scrollYProgress, [0, 1], ["0%", "-18%"]);
  const infoY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  // Fades out before it can drift into the marquee below.
  const infoOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);

  /* Shader speeds up slightly on scroll — quantised so the hero does not
     re-render every frame; the GPU interpolates between steps. */
  const [shaderBoost, setShaderBoost] = React.useState(0);
  React.useEffect(() => {
    const unsub = scrollYProgress.on("change", (v) => {
      const stepped = (Math.round(Math.min(v, 1) * 20) / 20) * 0.6;
      setShaderBoost((prev) => (prev === stepped ? prev : stepped));
    });
    return () => unsub();
  }, [scrollYProgress]);

  const staticLayer = reduced || !profile.parallax;

  return (
    <section
      ref={sectionRef}
      id="hero"
      aria-labelledby="hero-title"
      className="relative isolate min-h-[100svh] w-full overflow-hidden"
    >
      {/* ------------------------------------------------------ 1. SHADER --- */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <MeltShader
          mode={mode.id}
          speed={mode.shader.speed + shaderBoost}
          intensity={mode.shader.intensity}
          mouseInfluence={profile.parallax ? 0.45 : 0}
          centerDim={0.28}
          quality={quality}
          paused={Boolean(reduced)}
          className="h-full w-full"
        />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent to-void" />
      </div>

      <div className="gutter relative flex min-h-[100svh] flex-col justify-between gap-10 pt-24 pb-6 md:pt-28">
        {/* ========================================================= 2. LOGO == */}
        <svg aria-hidden="true" width="0" height="0" className="absolute">
          <filter
            id={FILTER_ID}
            x="-10%"
            y="-10%"
            width="120%"
            height="140%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              ref={turbRef}
              type="fractalNoise"
              baseFrequency="0.016 0.008"
              numOctaves={2}
              seed={7}
              result="noise"
            />
            <feDisplacementMap
              ref={displaceRef}
              in="SourceGraphic"
              in2="noise"
              scale={reduced ? 0 : MAX_DISPLACE}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </svg>

        <motion.div
          style={staticLayer ? undefined : { y: titleY }}
          className="relative flex flex-1 items-center justify-center"
        >
          <h1 id="hero-title" className="w-full" style={{ mixBlendMode: "difference" }}>
            <span className="sr-only">{artist.name}</span>
            <div
              ref={logoRef}
              className="mx-auto origin-top will-change-[filter,transform]"
              style={{ width: "min(94vw, calc(48svh * 1.7), 1080px)" }}
            >
              <Image
                src={artist.logos.hero.src}
                alt=""
                width={artist.logos.hero.width}
                height={artist.logos.hero.height}
                priority
                sizes="(max-width: 768px) 94vw, 1180px"
                className="h-auto w-full select-none"
                draggable={false}
              />
            </div>
          </h1>
        </motion.div>

        {/* ===================================================== 5. INFO ==== */}
        <motion.div
          style={staticLayer ? undefined : { y: infoY, opacity: infoOpacity }}
          className="relative z-30 flex flex-col gap-6"
        >
          {/*
            role + genres + positioning + CTAs — the ten-second read.

            This one block uses a CSS stagger rather than Motion. It is the most
            commercially important copy on the page, and a JS-driven entrance
            means it stays at opacity 0 until hydration finishes — on a slow
            connection that is a conversion cost, not a flourish. The CSS
            animation paints with the first frame, needs no JS at all, and the
            global prefers-reduced-motion rule collapses it to instant.
          */}
          <div className="flex flex-col gap-4">
            <StaggerItem index={0}>
              <div className="flex flex-wrap items-center gap-3">
                <span className="label border border-acid bg-void/40 px-2.5 py-1 text-label-xs text-acid backdrop-blur-sm">
                  {getText(artist.role, locale)}
                </span>
                <span className="label text-label-xs text-bone-dim">
                  {getText(artist.origin, locale)}
                </span>
              </div>
            </StaggerItem>

            <StaggerItem index={1}>
              <p className="label text-label-md text-bone md:text-label-lg">
                {getText(artist.genreStrip, locale)}
              </p>
            </StaggerItem>

            <StaggerItem index={2}>
              <p className="max-w-2xl text-body-md text-bone-dim md:text-body-lg">
                <span className="text-bone">“{getText(artist.positioning.line1, locale)}</span>{" "}
                {getText(artist.positioning.line2, locale)}”
              </p>
            </StaggerItem>

            {/* CTAs — one primary, one secondary. Both ≥44px. */}
            <StaggerItem index={3}>
              <div className="flex flex-col gap-3 xs:flex-row xs:items-center">
                <MagneticButton variant="primary" size="lg" asChild>
                  <a href="#formats">
                    <ArrowDown className="size-4" aria-hidden="true" />
                    {getText(hero.primaryCta, locale)}
                  </a>
                </MagneticButton>
                <BookingDrawerTrigger variant="outline" size="lg" />
              </div>
            </StaggerItem>
          </div>

          {/* readouts + scroll hint */}
          <div className="flex flex-wrap items-end justify-between gap-6 border-t border-border pt-4">
            <dl className="grid grid-cols-2 gap-x-8 gap-y-4 xs:grid-cols-4 md:gap-x-12">
              {hero.readouts.map((r, i) => (
                <div key={`${getText(r.label, locale)}-${i}`} className="flex flex-col gap-1">
                  <dt className="label text-label-xs text-gray">{getText(r.label, locale)}</dt>
                  <dd
                    className={cn(
                      "label text-label-sm tabular-nums",
                      i === 0 ? "text-acid" : "text-bone",
                    )}
                  >
                    {getText(r.value, locale)}
                  </dd>
                </div>
              ))}
            </dl>

            <a
              href="#story"
              className={cn(
                "label group flex min-h-11 items-center gap-2 text-label-xs text-gray",
                "transition-colors hover:text-acid",
              )}
            >
              {getText(hero.scrollHint, locale)}
              <ArrowDown
                className={cn(
                  "size-4",
                  !reduced &&
                  "transition-transform duration-[var(--duration-normal)] group-hover:translate-y-1",
                )}
                aria-hidden="true"
              />
            </a>
          </div>
        </motion.div>
      </div>

      {/* --------------------------------------------- transition marquee --- */}
      
      <div className="relative z-20 border-y border-border bg-void/80 py-2 backdrop-blur-sm">
        <Marquee speed="slow">
          <MarqueeItem>{getText(artist.concept, locale)}</MarqueeItem>
          <MarqueeItem>{getText(artist.genreStrip, locale)}</MarqueeItem>
          <MarqueeItem>{getText(artist.origin, locale)}</MarqueeItem>
          <MarqueeItem>{locale === "en" ? "SINCE 2010" : "DESDE 2010"}</MarqueeItem>
        </Marquee>
      </div>
    </section>
  );
}

/**
 * CSS-driven stagger child. `animate-plate-in` has fill-mode: both, so the item
 * is hidden during its delay and settled afterwards — the same choreography as a
 * Motion variant, but it paints with the first frame instead of waiting for
 * hydration, and costs no main-thread work. Reduced motion is handled globally
 * in globals.css, which collapses the animation to instant.
 */
function StaggerItem({
  children,
  index,
}: {
  children: React.ReactNode;
  index: number;
}) {
  return (
    <div
      className="animate-plate-in"
      style={{
        animationDelay: `${(0.12 + index * 0.06).toFixed(2)}s`,
        animationDuration: `${duration.slow}s`,
      }}
    >
      {children}
    </div>
  );
}

export default HeroSection;