"use client";

/**
 * Marquee — CSS-transform-only infinite scroller.
 *
 * The children are duplicated once and the track translates -50%, which loops
 * seamlessly without JS and without layout work. Paused on hover (so text can
 * be read) and fully stopped under reduced motion, where it becomes a plain
 * static row.
 */

import type { ReactNode } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export function Marquee({
  children,
  speed = "normal",
  direction = "left",
  className,
  itemClassName,
  pauseOnHover = true,
}: {
  children: ReactNode;
  speed?: "normal" | "slow";
  direction?: "left" | "right";
  className?: string;
  itemClassName?: string;
  pauseOnHover?: boolean;
}) {
  const reduced = useReducedMotion();

  return (
    <div
      className={cn(
        "mask-edges-x group relative w-full overflow-hidden",
        className,
      )}
    >
      <div
        className={cn(
          "flex w-max",
          !reduced &&
            (speed === "slow" ? "animate-marquee-slow" : "animate-marquee"),
          direction === "right" && "[animation-direction:reverse]",
          pauseOnHover && "group-hover:[animation-play-state:paused]",
          reduced && "overflow-x-auto",
        )}
      >
        <div className={cn("flex shrink-0 items-center", itemClassName)}>
          {children}
        </div>
        {/* Duplicate for the seamless -50% loop. Hidden from AT. */}
        <div
          className={cn("flex shrink-0 items-center", itemClassName)}
          aria-hidden="true"
        >
          {children}
        </div>
      </div>
    </div>
  );
}

/** Standard marquee cell: label + acid separator glyph. */
export function MarqueeItem({
  children,
  separator = "✕",
}: {
  children: ReactNode;
  separator?: string;
}) {
  return (
    <span className="label flex items-center gap-6 px-6 text-label-md text-bone-dim whitespace-nowrap">
      {children}
      <span aria-hidden="true" className="text-acid">
        {separator}
      </span>
    </span>
  );
}
