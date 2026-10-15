"use client";

/**
 * MobileBookingBar — fixed conversion bar in the thumb zone.
 *
 * Mobile priority order from the brief is speed, clarity, booking, video,
 * genres, contact — so on phones the two things a booker needs are pinned to the
 * bottom of the screen rather than left somewhere up the scroll.
 *
 * Appears only below `sm`, only after the hero has scrolled past (so it never
 * covers the hero CTAs), and hides itself while the booking section is on screen
 * (the form is right there — a duplicate bar would just cover it).
 */

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Music2 } from "lucide-react";
import { dossier, getText } from "@/data/presskit";
import { useDossier, useLocale } from "@/components/over-emotions/frequency-provider";
import { cn } from "@/lib/utils";
import { duration, ease } from "@/lib/motion";

export function MobileBookingBar() {
  const { locale } = useLocale();
  const { setDossierOpen } = useDossier();
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const hero = document.getElementById("hero");
    const bookingSection = document.getElementById("booking");
    if (!hero) return;

    let heroVisible = true;
    let bookingVisible = false;

    const update = () => setVisible(!heroVisible && !bookingVisible);

    const heroObserver = new IntersectionObserver(
      (entries) => {
        heroVisible = (entries[0]?.intersectionRatio ?? 0) > 0.25;
        update();
      },
      { threshold: [0, 0.25, 0.5] },
    );
    heroObserver.observe(hero);

    let bookingObserver: IntersectionObserver | undefined;
    if (bookingSection) {
      bookingObserver = new IntersectionObserver(
        (entries) => {
          bookingVisible = entries[0]?.isIntersecting ?? false;
          update();
        },
        { threshold: 0.15 },
      );
      bookingObserver.observe(bookingSection);
    }

    return () => {
      heroObserver.disconnect();
      bookingObserver?.disconnect();
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: "110%" }}
          animate={{ y: 0 }}
          exit={{ y: "110%" }}
          transition={{ duration: duration.normal, ease: ease.out }}
          className={cn(
            "fixed inset-x-0 bottom-0 z-[var(--z-sticky)] sm:hidden",
            "border-t border-border-strong bg-void/95 backdrop-blur-md",
          )}
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div className="gutter flex items-center gap-2 py-3">
            <a
              href="#music"
              className={cn(
                "label flex min-h-12 flex-1 items-center justify-center gap-2 border border-border-strong px-3 text-label-xs text-bone",
                "transition-colors hover:border-acid hover:text-acid",
              )}
            >
              <Music2 className="size-4" aria-hidden="true" />
              {locale === "en" ? "MUSIC" : "MÚSICA"}
            </a>
            <button
              type="button"
              onClick={() => setDossierOpen(true)}
              className={cn(
                "label flex min-h-12 flex-[1.4] items-center justify-center border border-acid bg-acid px-3 text-label-xs text-void",
                "transition-colors active:bg-bone active:border-bone",
              )}
            >
              {getText(dossier.triggerLabel, locale)}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default MobileBookingBar;
