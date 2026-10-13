"use client";

/**
 * Reveal / RevealGroup — the standard scroll entrance wrappers.
 *
 * Deliberately boring: one entrance language for the whole site (fade + short
 * lift, or a clip-path wipe for imagery). "A different effect on every element"
 * is explicitly out of scope, so section code should reach for this rather than
 * hand-rolling variants.
 */

import { motion, useReducedMotion, type Variants } from "motion/react";
import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { clipReveal, fadeUp, inView, reducedVariants } from "@/lib/motion";

type RevealKind = "fade-up" | "clip" | "fade";

const KINDS: Record<RevealKind, Variants> = {
  "fade-up": fadeUp,
  clip: clipReveal,
  fade: { hidden: { opacity: 0 }, visible: { opacity: 1 } },
};

export function Reveal({
  children,
  kind = "fade-up",
  delay = 0,
  className,
  as = "div",
  once = true,
}: {
  children: ReactNode;
  kind?: RevealKind;
  delay?: number;
  className?: string;
  as?: ElementType;
  once?: boolean;
}) {
  const reduced = useReducedMotion();
  const MotionTag = motion[as as keyof typeof motion] as typeof motion.div;
  const variants = reduced ? reducedVariants : KINDS[kind];

  return (
    <MotionTag
      className={cn(className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ ...inView, once }}
      variants={variants}
      transition={{ delay: reduced ? 0 : delay }}
    >
      {children}
    </MotionTag>
  );
}

/** Parent that staggers direct <RevealItem> children. */
export function RevealGroup({
  children,
  stagger = 0.05,
  delay = 0,
  className,
  as = "div",
}: {
  children: ReactNode;
  stagger?: number;
  delay?: number;
  className?: string;
  as?: ElementType;
}) {
  const reduced = useReducedMotion();
  const MotionTag = motion[as as keyof typeof motion] as typeof motion.div;

  return (
    <MotionTag
      className={cn(className)}
      initial="hidden"
      whileInView="visible"
      viewport={inView}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: reduced ? 0 : stagger,
            delayChildren: reduced ? 0 : delay,
          },
        },
      }}
    >
      {children}
    </MotionTag>
  );
}

export function RevealItem({
  children,
  className,
  kind = "fade-up",
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  kind?: RevealKind;
  as?: ElementType;
}) {
  const reduced = useReducedMotion();
  const MotionTag = motion[as as keyof typeof motion] as typeof motion.div;
  return (
    <MotionTag
      className={cn(className)}
      variants={reduced ? reducedVariants : KINDS[kind]}
    >
      {children}
    </MotionTag>
  );
}
