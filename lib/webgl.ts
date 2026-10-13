/**
 * ============================================================================
 * WEBGL / QUALITY TIERS
 * ============================================================================
 * Three tiers, as specified in the brief. No automatic benchmark is run — the
 * architecture simply supports the levels, and a coarse heuristic picks a
 * sensible default that can be overridden.
 *
 *   HIGH    full shader, 3D model, parallax, custom cursor
 *   MEDIUM  reduced shader, simplified model, no expensive effects
 *   LOW     static fallback, basic Motion only, no persistent WebGL
 *
 * Override for testing:  localStorage.setItem("oe-quality", "low")
 */

export type QualityTier = "high" | "medium" | "low";

export const QUALITY_STORAGE_KEY = "oe-quality";

/** Per-tier caps consumed by the shader and the 3D scene. */
export const qualityProfile: Record<
  QualityTier,
  {
    /** Hard ceiling on devicePixelRatio. */
    maxDpr: number;
    /** Number of cosine warp layers evaluated in the fragment shader. */
    shaderOctaves: number;
    /** Persistent WebGL allowed at all. */
    webgl: boolean;
    /** Render the 3D mask. */
    model3d: boolean;
    /** Simplified geometry / no shadows. */
    simplifiedModel: boolean;
    parallax: boolean;
    customCursor: boolean;
    /** Frame cap for the shader loop (0 = uncapped / rAF native). */
    fpsCap: number;
  }
> = {
  high: {
    maxDpr: 2,
    shaderOctaves: 3,
    webgl: true,
    model3d: true,
    simplifiedModel: false,
    parallax: true,
    customCursor: true,
    fpsCap: 0,
  },
  medium: {
    maxDpr: 1.5,
    shaderOctaves: 2,
    webgl: true,
    model3d: true,
    simplifiedModel: true,
    parallax: false,
    customCursor: false,
    fpsCap: 40,
  },
  low: {
    maxDpr: 1,
    shaderOctaves: 1,
    webgl: false,
    model3d: false,
    simplifiedModel: true,
    parallax: false,
    customCursor: false,
    fpsCap: 30,
  },
};

/** Server-safe check. */
export const isBrowser = () => typeof window !== "undefined";

export function prefersReducedMotion(): boolean {
  if (!isBrowser()) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function hasFinePointer(): boolean {
  if (!isBrowser()) return false;
  return window.matchMedia("(pointer: fine)").matches;
}

/** True when a WebGL2 (or WebGL1) context can actually be created. */
export function supportsWebGL(): boolean {
  if (!isBrowser()) return false;
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      canvas.getContext("webgl2") ??
        canvas.getContext("webgl") ??
        canvas.getContext("experimental-webgl"),
    );
  } catch {
    return false;
  }
}

/**
 * Coarse tier heuristic. Deliberately conservative: cheap signals only, no
 * timing loop, no canvas benchmark, runs once on mount.
 */
export function detectQualityTier(): QualityTier {
  if (!isBrowser()) return "medium";

  const override = window.localStorage.getItem(QUALITY_STORAGE_KEY);
  if (override === "high" || override === "medium" || override === "low") {
    return override;
  }

  if (prefersReducedMotion()) return "low";
  if (!supportsWebGL()) return "low";

  const cores = navigator.hardwareConcurrency ?? 4;
  // deviceMemory is Chromium-only; absence is not evidence of a weak device.
  const memory = (navigator as Navigator & { deviceMemory?: number })
    .deviceMemory;
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const narrow = window.innerWidth < 768;

  if (memory !== undefined && memory <= 2) return "low";
  if (cores <= 2) return "low";
  if (coarsePointer || narrow) return cores >= 8 ? "medium" : "medium";
  if (cores <= 4) return "medium";

  return "high";
}

/** DPR clamped to the tier ceiling. 1.5 on mobile, 2 on desktop, per the brief. */
export function resolveDpr(tier: QualityTier): number {
  if (!isBrowser()) return 1;
  const deviceCap = window.matchMedia("(pointer: coarse)").matches ? 1.5 : 2;
  return Math.min(
    window.devicePixelRatio || 1,
    qualityProfile[tier].maxDpr,
    deviceCap,
  );
}
