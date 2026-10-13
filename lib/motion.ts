/**
 * ============================================================================
 * MOTION TOKENS
 * ============================================================================
 * Mirrors the duration/easing tokens in app/globals.css. Change both together.
 *
 * House rules encoded here:
 *   - entrances ease OUT, exits ease IN, exits are ~65% of entrance duration
 *   - no elastic/bouncy springs (no overshoot above 1.02)
 *   - every variant below is safe under prefers-reduced-motion because the
 *     reduced variants are provided alongside and selected by useReducedMotion
 */

import type { Transition, Variants } from "motion/react";

export const duration = {
  instant: 0.1,
  fast: 0.18,
  normal: 0.32,
  slow: 0.64,
  cinematic: 1.2,
} as const;

/** cubic-bezier arrays, consumable directly by Motion. */
export const ease = {
  out: [0.16, 1, 0.3, 1],
  inOut: [0.65, 0, 0.35, 1],
  in: [0.7, 0, 0.84, 0],
} as const;

export const spring = {
  /** Weighted, no visible overshoot. Default for layout and colour. */
  soft: { type: "spring", stiffness: 120, damping: 26, mass: 1 },
  /** Faster response for pointer-following elements. */
  snappy: { type: "spring", stiffness: 320, damping: 32, mass: 0.6 },
  /** For dial rotation — heavy, mechanical. */
  mechanical: { type: "spring", stiffness: 90, damping: 20, mass: 1.4 },
} as const satisfies Record<string, Transition>;

/** Parallax intensities, matching --parallax-* in globals.css (px). */
export const parallax = {
  subtle: 20,
  medium: 60,
  strong: 120,
} as const;

/* ------------------------------------------------------------- VARIANTS --- */

export const transitions = {
  enter: { duration: duration.slow, ease: ease.out },
  exit: { duration: duration.normal, ease: ease.in },
  quick: { duration: duration.fast, ease: ease.out },
} as const satisfies Record<string, Transition>;

/** Fade + short lift. The default entrance for text and cards. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: transitions.enter },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: transitions.enter },
};

/** Vertical mask reveal for display type — the signature headline entrance. */
export const maskReveal: Variants = {
  hidden: { y: "110%" },
  visible: {
    y: "0%",
    transition: { duration: duration.cinematic, ease: ease.out },
  },
};

/** Clip-path wipe, used on story blocks and imagery. */
export const clipReveal: Variants = {
  hidden: { clipPath: "inset(0 0 100% 0)", opacity: 0.4 },
  visible: {
    clipPath: "inset(0 0 0% 0)",
    opacity: 1,
    transition: { duration: duration.cinematic, ease: ease.out },
  },
};

/** Parent for staggered children. `staggerChildren` stays in the 30-60ms band. */
export const staggerParent = (stagger = 0.05, delayChildren = 0): Variants => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: stagger, delayChildren },
  },
});

/** Reduced-motion replacement: opacity only, near-instant. */
export const reducedVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: duration.fast } },
};

/**
 * Pick the right variant set for the current motion preference.
 * Call with the boolean from Motion's useReducedMotion().
 */
export const motionSafe = (reduced: boolean | null, variants: Variants) =>
  reduced ? reducedVariants : variants;

/** Standard whileInView config: fires once, slightly before full entry. */
export const inView = {
  once: true,
  amount: 0.25,
  margin: "0px 0px -10% 0px",
} as const;
