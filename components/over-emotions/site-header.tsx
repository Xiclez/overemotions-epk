"use client";

/**
 * SiteHeader — minimal, fixed, and out of the way.
 *
 * Desktop: wordmark, inline anchors, sound toggle, BOOKING DOSSIER.
 * Mobile:  wordmark + dossier button only; the anchors move into a sheet so the
 *          header never competes with the hero for space.
 *
 * A thin acid scroll-progress line sits along the bottom edge — the only
 * always-visible motion on the page.
 */

import * as React from "react";
import Image from "next/image";
import { Menu, Volume2, VolumeX, X } from "lucide-react";
import { AnimatePresence, motion, useScroll, useSpring } from "motion/react";
import { artist, getText, navItems } from "@/data/presskit";
import { Button } from "@/components/ui/button";
import { BookingDrawerTrigger } from "@/components/ui/booking-drawer";
import { useLocale, useSound } from "@/components/over-emotions/frequency-provider";
import { cn } from "@/lib/utils";
import { duration, ease } from "@/lib/motion";

export function SiteHeader() {
  const { soundEnabled, toggleSound } = useSound();
  const { locale, toggleLocale } = useLocale();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  
  // NUEVO: Estado para el prompt de sonido
  const [showUnmutePrompt, setShowUnmutePrompt] = React.useState(false);

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 30,
    restDelta: 0.001,
  });

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile sheet on Escape, and lock the page behind it.
  React.useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [menuOpen]);

  // NUEVO: Escuchar el evento que viene desde MusicLab para mostrar el tooltip
  React.useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const handlePrompt = () => {
      setShowUnmutePrompt(true);
      clearTimeout(timeoutId);
      // Se esconde solo después de 4 segundos
      timeoutId = setTimeout(() => setShowUnmutePrompt(false), 4000); 
    };
    window.addEventListener("prompt-unmute", handlePrompt);
    return () => {
      window.removeEventListener("prompt-unmute", handlePrompt);
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <>
      <a
        href="#hero"
        className={cn(
          "sr-only focus:not-sr-only",
          "focus:fixed focus:top-3 focus:left-3 focus:z-[var(--z-modal)]",
          "focus:label focus:border focus:border-acid focus:bg-void focus:px-4 focus:py-2 focus:text-label-xs focus:text-acid",
        )}
      >
        {locale === "en" ? "SKIP TO CONTENT" : "SALTAR AL CONTENIDO"}
      </a>

      <header
        className={cn(
          "fixed inset-x-0 top-0 z-[var(--z-header)] max-w-full overflow-x-clip",
          "transition-colors duration-[var(--duration-normal)]",
          scrolled
            ? "border-b border-border bg-void/85 backdrop-blur-md"
            : "border-b border-transparent bg-transparent",
        )}
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="gutter flex h-16 w-full min-w-0 items-center justify-between gap-2 xs:gap-4 md:h-20">
          {/* ------------------------------------------------------ wordmark */}
          <a
            href="#hero"
            className="group flex min-w-0 items-center gap-2 xs:gap-3"
            aria-label={`${artist.name} — home`}
          >
            {/* Retro logo — the small-format mark */}
            <Image
              src={artist.logos.retro.src}
              alt={artist.name}
              width={artist.logos.retro.width}
              height={artist.logos.retro.height}
              className="h-5 w-auto shrink-0 transition-opacity duration-[var(--duration-normal)] group-hover:opacity-80 md:h-6"
              priority
            />
          </a>

          {/* --------------------------------------------------- desktop nav */}
          <nav
            aria-label="Sections"
            className="hidden items-center gap-1 md:flex"
          >
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={cn(
                  "label flex min-h-11 items-center px-3 text-label-xs text-muted-foreground",
                  "transition-colors duration-[var(--duration-fast)] hover:text-acid",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acid",
                )}
              >
                {getText(item.label, locale)}
              </a>
            ))}
          </nav>

          {/* ------------------------------------------------------ controls */}
          <div className="flex shrink-0 items-center gap-1 xs:gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleLocale}
              aria-label={
                locale === "en"
                  ? "Cambiar a español"
                  : "Switch to English"
              }
              className="size-10 border-border-strong text-bone hover:border-acid xs:size-11"
            >
              <span className="text-label-xs uppercase">{locale === "en" ? "ES" : "EN"}</span>
            </Button>

            {/* NUEVO: Contenedor relativo para el botón de volumen y su tooltip */}
            <div className="relative flex">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  toggleSound();
                  setShowUnmutePrompt(false); // Ocultar si el usuario da clic
                }}
                aria-pressed={soundEnabled}
                aria-label={
                  soundEnabled
                    ? locale === "en"
                      ? "Mute site audio"
                      : "Silenciar audio del sitio"
                    : locale === "en"
                      ? "Enable site audio"
                      : "Activar audio del sitio"
                }
                className="size-10 border-border-strong text-bone hover:border-acid xs:size-11"
              >
                {soundEnabled ? (
                  <Volume2 className="size-4 text-acid" />
                ) : (
                  <VolumeX className="size-4" />
                )}
              </Button>

              {/* Tooltip Animado */}
              <AnimatePresence>
                {showUnmutePrompt && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 top-14 w-max max-w-[200px] border border-acid bg-void p-2.5 text-label-xs text-acid shadow-2xl"
                  >
                    <span className="absolute -top-1.5 right-4 flex size-3">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-acid opacity-75"></span>
                      <span className="relative inline-flex size-3 rounded-full bg-acid"></span>
                    </span>
                    {locale === "en" ? "CLICK TO UNMUTE AUDIO" : "CLIC PARA ACTIVAR SONIDO"}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <BookingDrawerTrigger
              variant="primary"
              className="hidden sm:inline-flex"
            />

            <Button
              variant="ghost"
              size="icon"
              className="size-10 border-border-strong text-bone xs:size-11 md:hidden"
              onClick={() => setMenuOpen(true)}
              aria-label={locale === "en" ? "Open navigation" : "Abrir navegación"}
              aria-expanded={menuOpen}
            >
              <Menu className="size-5" />
            </Button>
          </div>
        </div>

        {/* -------------------------------------------- scroll progress line */}
        <motion.div
          aria-hidden="true"
          className="h-[2px] origin-left bg-acid"
          style={{ scaleX: progress }}
        />
      </header>

      {/* ------------------------------------------------------ mobile sheet */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-[var(--z-modal)] md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: duration.fast }}
          >
            <button
              type="button"
              aria-label="Close navigation"
              className="absolute inset-0 bg-void/90 backdrop-blur-sm"
              onClick={() => setMenuOpen(false)}
            />
            <motion.nav
              aria-label="Sections"
              className={cn(
                "absolute inset-x-0 top-0 border-b border-border-strong bg-charcoal",
                "gutter pt-[max(1rem,env(safe-area-inset-top))] pb-6",
              )}
              initial={{ y: "-100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-100%" }}
              transition={{ duration: duration.normal, ease: ease.out }}
            >
              <div className="flex items-center justify-between pb-4">
                <span className="label text-label-xs text-acid">
                  {locale === "en" ? "NAVIGATION" : "NAVEGACIÓN"}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMenuOpen(false)}
                  aria-label={locale === "en" ? "Close navigation" : "Cerrar navegación"}
                  className="border-border-strong text-bone"
                >
                  <X className="size-5" />
                </Button>
              </div>
              <ul className="flex flex-col">
                {navItems.map((item) => (
                  <li key={item.id} className="border-t border-border">
                    <a
                      href={`#${item.id}`}
                      onClick={() => setMenuOpen(false)}
                      className="font-display flex min-h-14 items-center text-3xl text-bone uppercase transition-colors hover:text-acid"
                    >
                      {getText(item.label, locale)}
                    </a>
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <BookingDrawerTrigger
                  variant="primary"
                  size="lg"
                  className="w-full"
                />
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default SiteHeader;