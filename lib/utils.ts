import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge has to be taught about this project's custom type scale.
 *
 * Out of the box it sees `text-display-xl` / `text-label-sm` / `text-body-md`,
 * fails to recognise them as font sizes, and files them under text-COLOUR — so
 * `cn("text-display-xl", "text-bone")` would silently drop the font size and the
 * headline would render at body size. Registering the scale in the `font-size`
 * group fixes that.
 *
 * If you add a size token to @theme in globals.css, add it here too.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "display-sm",
            "display-md",
            "display-lg",
            "display-xl",
            "label-xs",
            "label-sm",
            "label-md",
            "label-lg",
            "body-sm",
            "body-md",
            "body-lg",
          ],
        },
      ],
    },
  },
});

/** shadcn/ui-standard class combiner. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Clamp a number into a range. */
export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/** Linear interpolation. */
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** #RRGGBB → [r, g, b] normalised 0-1, for GLSL uniforms. */
export function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  const int = Number.parseInt(full, 16);
  return [
    ((int >> 16) & 255) / 255,
    ((int >> 8) & 255) / 255,
    (int & 255) / 255,
  ];
}

/** Beats per minute → seconds per beat. Used to tie animation tempo to BPM. */
export const bpmToSeconds = (bpm: number) => 60 / bpm;

/** Zero-padded section index, e.g. 3 → "03". */
export const pad2 = (n: number) => String(n).padStart(2, "0");
