"use client";

/**
 * ============================================================================
 * INTRO OVERLAY — progressive, never blocking
 * ============================================================================
 */

import * as React from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Volume2, VolumeX } from "lucide-react";
import { artist, getText, intro } from "@/data/presskit";
import { useLocale, useSound } from "@/components/over-emotions/frequency-provider";
import { cn } from "@/lib/utils";
import { duration, ease } from "@/lib/motion";

const SESSION_KEY = "oe-entered";
const AUTO_DISMISS_MS = 4500;

const subscribeToNothing = () => () => {};

const hasEnteredThisSession = () => {
  // Verificación de seguridad para evitar errores en SSR
  if (typeof window === "undefined") return false;
  try {
    return window.sessionStorage.getItem(SESSION_KEY) === "true";
  } catch {
    return false;
  }
};

// EL CAMBIO CLAVE: 
// Cambiamos de `true` a `false`. Esto obliga a Next.js a incluir el Overlay
// en el primer renderizado del servidor, eliminando el parpadeo del Hero.
const enteredOnServer = () => false;

export function IntroOverlay() {
  const { setSoundEnabled } = useSound();
  const { locale } = useLocale();
  const reduced = useReducedMotion();
  
  const alreadyEntered = React.useSyncExternalStore(
    subscribeToNothing,
    hasEnteredThisSession,
    enteredOnServer,
  );
  
  const [dismissed, setDismissed] = React.useState(false);
  const firstButtonRef = React.useRef<HTMLButtonElement>(null);

  const open = !alreadyEntered && !dismissed;

  const dismiss = React.useCallback(
    (withSound: boolean) => {
      setSoundEnabled(withSound);
      try {
        window.sessionStorage.setItem(SESSION_KEY, "true");
      } catch {
        /* Storage is a nice-to-have; dismissal still works without it. */
      }
      setDismissed(true);
      // The hero waits for this before solidifying its title.
      window.dispatchEvent(new CustomEvent("oe-intro-done"));
    },
    [setSoundEnabled],
  );

  React.useEffect(() => {
    if (!open) return;

    firstButtonRef.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismiss(false);
    };
    document.addEventListener("keydown", onKey);

    const timer = window.setTimeout(() => dismiss(false), AUTO_DISMISS_MS);

    const onScroll = () => dismiss(false);
    window.addEventListener("scroll", onScroll, { passive: true, once: true });

    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(timer);
    };
  }, [open, dismiss]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="region"
          aria-label="Site intro"
          className={cn(
            "fixed inset-0 z-[var(--z-intro)] grid place-items-center bg-void",
            "px-6",
          )}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: reduced ? duration.fast : duration.slow,
            ease: ease.out,
          }}
        >
          <div className="flex w-full max-w-md flex-col items-center gap-8 text-center">
            {/* ------------------------------------------------- the symbol */}
            <motion.div
              initial={{ opacity: 0, scale: reduced ? 1 : 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: reduced ? duration.fast : duration.slow,
                ease: ease.out,
              }}
            >
              <Image
                src={intro.symbolSrc}
                alt={artist.name}
                width={artist.logos.retro.width}
                height={artist.logos.retro.height}
                priority
                className={cn("mx-auto h-auto w-[min(72vw,320px)]", !reduced && "animate-melt-in")}
              />
            </motion.div>

            {/* ------------------------------------- audio signal line ---- */}
            <div className="flex w-full flex-col items-center gap-3">
              <div className="relative h-6 w-full max-w-56 overflow-hidden">
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border-strong"
                />
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 origin-center bg-acid",
                    reduced ? "scale-x-100 opacity-60" : "animate-signal",
                  )}
                  style={{
                    boxShadow: "0 0 16px 0 rgba(212, 255, 63, 0.7)",
                  }}
                />
              </div>
              <p className="label text-label-xs text-gray">
                {getText(intro.statusText, locale)}
              </p>
            </div>

            {/* ------------------------------------------------- the choice */}
            <div className="flex w-full flex-col gap-3">
              <button
                ref={firstButtonRef}
                type="button"
                onClick={() => dismiss(true)}
                className={cn(
                  "label flex min-h-12 items-center justify-center gap-2 border border-acid bg-acid px-6 text-label-sm text-void",
                  "transition-colors duration-[var(--duration-fast)] hover:bg-bone hover:border-bone",
                  "focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-acid",
                )}
              >
                <Volume2 className="size-4" aria-hidden="true" />
                {getText(intro.soundOn, locale)}
              </button>
              <button
                type="button"
                onClick={() => dismiss(false)}
                className={cn(
                  "label flex min-h-12 items-center justify-center gap-2 border border-border-strong px-6 text-label-sm text-bone",
                  "transition-colors duration-[var(--duration-fast)] hover:border-acid hover:text-acid",
                  "focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-acid",
                )}
              >
                <VolumeX className="size-4" aria-hidden="true" />
                {getText(intro.soundOff, locale)}
              </button>
            </div>

            <p className="label text-label-xs text-gray/70">
              {getText(intro.note, locale)} — {locale === "en" ? "SCROLL OR PRESS ESC TO SKIP" : "DESLIZA O PRESIONA ESC PARA SALTAR"}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default IntroOverlay;