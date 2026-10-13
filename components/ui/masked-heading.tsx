"use client";

/**
 * MaskedHeading — the signature display-type entrance.
 *
 * Each line sits inside an overflow-clipped box and slides up from below it, so
 * the type appears to be revealed by a vertical mask rather than fading in.
 * Lines stagger. Under reduced motion the mask is skipped entirely and the text
 * simply fades, which keeps the content instantly readable.
 */

import { motion, useReducedMotion } from "motion/react";
import type { JSX, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { duration, ease, inView } from "@/lib/motion";

/** Restricted to intrinsic elements: a heading tag, never an arbitrary component. */
type HeadingTag = Extract<keyof JSX.IntrinsicElements, "h1" | "h2" | "h3" | "div">;

export interface MaskedHeadingProps {
  /** One entry per visual line. Lines are never wrapped automatically. */
  lines: ReactNode[];
  as?: HeadingTag;
  className?: string;
  lineClassName?: string;
  /** Seconds between line reveals. */
  stagger?: number;
  delay?: number;
  /** Fire on scroll into view (default) or immediately on mount. */
  trigger?: "inView" | "mount";
}

export function MaskedHeading({
  lines,
  as: Tag = "h2",
  className,
  lineClassName,
  stagger = 0.08,
  delay = 0,
  trigger = "inView",
}: MaskedHeadingProps) {
  const reduced = useReducedMotion();

  const animationProps =
    trigger === "mount"
      ? { animate: "visible" as const }
      : { whileInView: "visible" as const, viewport: inView };

  return (
    <Tag className={cn("font-display", className)}>
      <motion.span
        className="block"
        initial="hidden"
        {...animationProps}
        variants={{
          hidden: {},
          visible: {
            transition: { staggerChildren: reduced ? 0 : stagger, delayChildren: delay },
          },
        }}
      >
        {lines.map((line, i) => (
          <span
            key={i}
            // The clip box. Must be block + overflow-hidden for the mask to work.
            className={cn("block overflow-hidden pb-[0.06em]", lineClassName)}
          >
            <motion.span
              className="block will-change-transform"
              variants={
                reduced
                  ? {
                      hidden: { opacity: 0 },
                      visible: {
                        opacity: 1,
                        transition: { duration: duration.fast },
                      },
                    }
                  : {
                      hidden: { y: "108%" },
                      visible: {
                        y: "0%",
                        transition: {
                          duration: duration.cinematic,
                          ease: ease.out,
                        },
                      },
                    }
              }
            >
              {line}
            </motion.span>
          </span>
        ))}
      </motion.span>
    </Tag>
  );
}

export default MaskedHeading;
