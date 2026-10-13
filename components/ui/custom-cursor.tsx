"use client";

/**
 * CustomCursor — small acid-haloed dot with a contextual label.
 *
 * Rules from the brief, all enforced here:
 *   - only on (pointer: fine); on touch the component returns null and adds no
 *     listeners at all
 *   - the native cursor is NOT hidden until this component has mounted and
 *     positioned itself: it sets html[data-cursor-ready="true"], and the
 *     `cursor: none` rule in globals.css is scoped to that attribute
 *   - disabled entirely under reduced motion and below the HIGH quality tier
 *
 * Context labels come from `data-cursor` on any ancestor of the pointer target:
 *   data-cursor="play" | "drag" | "view" | "link"
 */

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { qualityProfile } from "@/lib/webgl";
import { useQuality } from "@/components/over-emotions/frequency-provider";
import { spring } from "@/lib/motion";

type CursorKind = "default" | "link" | "play" | "drag" | "view";

const LABELS: Partial<Record<CursorKind, string>> = {
  play: "PLAY",
  drag: "DRAG",
  view: "VIEW",
};

export function CustomCursor() {
  const reduced = useReducedMotion();
  const quality = useQuality();
  const allowed = qualityProfile[quality].customCursor && !reduced;

  const [mounted, setMounted] = React.useState(false);
  const [visible, setVisible] = React.useState(false);
  const [kind, setKind] = React.useState<CursorKind>("default");
  const [pressed, setPressed] = React.useState(false);
  const dotRef = React.useRef<HTMLDivElement>(null);
  const ringRef = React.useRef<HTMLDivElement>(null);

  /* Gate on a real fine pointer at runtime, not just at build time. */
  const [finePointer, setFinePointer] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    const update = () => setFinePointer(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const active = allowed && finePointer;

  React.useEffect(() => {
    if (!active) {
      // Make sure a previously-set flag is cleared if the tier drops or the
      // visitor switches to a touch input mid-session.
      document.documentElement.removeAttribute("data-cursor-ready");
      return;
    }

    let raf = 0;
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let ringX = targetX;
    let ringY = targetY;
    let hasMoved = false;

    const resolveKind = (target: EventTarget | null): CursorKind => {
      if (!(target instanceof Element)) return "default";
      const tagged = target.closest<HTMLElement>("[data-cursor]");
      const value = tagged?.dataset.cursor as CursorKind | undefined;
      if (value) return value;
      if (target.closest("a, button, [role='button'], input, select, textarea"))
        return "link";
      return "default";
    };

    const onMove = (event: PointerEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;

      if (!hasMoved) {
        hasMoved = true;
        ringX = targetX;
        ringY = targetY;
        // Only now is it safe to hide the native cursor.
        document.documentElement.setAttribute("data-cursor-ready", "true");
        setMounted(true);
        setVisible(true);
      }

      // Dot tracks exactly; the ring trails via the rAF loop below.
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) translate(-50%, -50%)`;
      }
      setKind(resolveKind(event.target));
    };

    const loop = () => {
      raf = requestAnimationFrame(loop);
      ringX += (targetX - ringX) * 0.18;
      ringY += (targetY - ringY) * 0.18;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      }
    };
    raf = requestAnimationFrame(loop);

    const onLeave = () => setVisible(false);
    const onEnter = () => hasMoved && setVisible(true);
    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    document.addEventListener("pointerenter", onEnter);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("pointerenter", onEnter);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.documentElement.removeAttribute("data-cursor-ready");
    };
  }, [active]);

  if (!active || !mounted) return null;

  const label = LABELS[kind];
  const ringSize = label ? 72 : kind === "link" ? 44 : 28;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[var(--z-cursor)]"
      style={{ opacity: visible ? 1 : 0, transition: "opacity 180ms" }}
    >
      {/* Trailing ring / halo */}
      <div ref={ringRef} className="absolute top-0 left-0 will-change-transform">
        <motion.div
          className="grid place-items-center rounded-full border border-acid/70"
          animate={{
            width: ringSize,
            height: ringSize,
            scale: pressed ? 0.88 : 1,
            backgroundColor: label
              ? "rgba(212, 255, 63, 0.16)"
              : "rgba(212, 255, 63, 0.04)",
          }}
          transition={spring.snappy}
          style={{ boxShadow: "0 0 24px -6px rgba(212, 255, 63, 0.6)" }}
        >
          <AnimatePresence>
            {label && (
              <motion.span
                key={label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.12 }}
                className="label text-label-xs text-acid"
              >
                {label}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Exact-position dot, hidden when a label is showing */}
      <div ref={dotRef} className="absolute top-0 left-0 will-change-transform">
        <div
          className="size-1.5 rounded-full bg-acid transition-opacity duration-150"
          style={{ opacity: label ? 0 : 1 }}
        />
      </div>
    </div>
  );
}

export default CustomCursor;
