/**
 * Generates the SVG placeholder art in /public/placeholders.
 *
 *   node scripts/generate-placeholders.mjs
 *
 * Everything it writes is a stand-in for real photography / artwork / video.
 * These files exist so the mockup ships with zero binary asset dependencies and
 * so every image slot has correct dimensions (no layout shift when real assets
 * drop in). See README > Replacing images.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "public", "placeholders");
mkdirSync(out, { recursive: true });

const C = {
  void: "#07050C",
  charcoal: "#100C18",
  bone: "#EFE9F7",
  boneDim: "#A9A0B8",
  orange: "#D4FF3F",
  blood: "#7C4DFF",
  electric: "#2BF0C4",
  magenta: "#FF4FC3",
  gray: "#7B7289",
};

/** Deterministic pseudo-random so regenerating produces identical files. */
const rng = (seed) => {
  let s = seed * 9301 + 49297;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
};

const grainFilter = (id, freq = 0.8) => `
  <filter id="${id}" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="3" seed="7" result="n"/>
    <feColorMatrix in="n" type="saturate" values="0"/>
    <feComponentTransfer><feFuncA type="linear" slope="0.55"/></feComponentTransfer>
  </filter>`;

/* -------------------------------------------------------- 1. GRAIN TILE --- */
writeFileSync(
  join(out, "grain.svg"),
  `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 180 180">
  <filter id="g">
    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" seed="3"/>
    <feColorMatrix type="saturate" values="0"/>
    <feComponentTransfer><feFuncA type="linear" slope="0.9"/></feComponentTransfer>
  </filter>
  <rect width="180" height="180" filter="url(#g)" opacity="0.5"/>
</svg>`,
);

/* 2. Brand mark lives in /public/media/brand/overemotions-mark.svg (hand-made placeholder). */

/* ------------------------------------------------- 3. NARRATIVE VISUALS --- */
/**
 * Abstract high-contrast compositions standing in for photography.
 * 4:5 portrait — the aspect the story section reserves.
 */
const storyScenes = [
  { seed: 11, accent: C.orange, label: "ARTIST", bars: 7 },
  { seed: 23, accent: C.blood, label: "INFLUENCES", bars: 14 },
  { seed: 31, accent: C.orange, label: "SHARED STAGES", bars: 10 },
  { seed: 47, accent: C.magenta, label: "DEMONS IN MY HEAD", bars: 5 },
  { seed: 59, accent: C.electric, label: "THE RETURN", bars: 9 },
];

storyScenes.forEach((s, i) => {
  const r = rng(s.seed);
  const w = 800;
  const h = 1000;
  const beams = Array.from({ length: s.bars }, () => {
    const x = r() * w;
    const bw = 8 + r() * 46;
    const op = 0.08 + r() * 0.3;
    return `<rect x="${x.toFixed(0)}" y="0" width="${bw.toFixed(0)}" height="${h}" fill="${s.accent}" opacity="${op.toFixed(2)}"/>`;
  }).join("\n    ");

  writeFileSync(
    join(out, `story-0${i + 1}.svg`),
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  ${grainFilter(`gr${i}`)}
  <rect width="${w}" height="${h}" fill="${C.void}"/>
  <g>
    ${beams}
  </g>
  <ellipse cx="${w / 2}" cy="${h * 0.42}" rx="${w * 0.34}" ry="${h * 0.3}" fill="${s.accent}" opacity="0.14"/>
  <!-- abstract figure mass -->
  <path d="M${w * 0.5} ${h * 0.2} L${w * 0.66} ${h * 0.42} L${w * 0.62} ${h * 0.78} L${w * 0.38} ${h * 0.78} L${w * 0.34} ${h * 0.42} Z" fill="${C.void}" opacity="0.9"/>
  <path d="M${w * 0.42} ${h * 0.3} L${w * 0.58} ${h * 0.3} L${w * 0.58} ${h * 0.4} L${w * 0.42} ${h * 0.4} Z" fill="${s.accent}" opacity="0.55"/>
  <rect width="${w}" height="${h}" filter="url(#gr${i})" opacity="0.35" style="mix-blend-mode:overlay"/>
  <rect x="1" y="1" width="${w - 2}" height="${h - 2}" fill="none" stroke="${C.boneDim}" stroke-width="2" opacity="0.35"/>
  <text x="32" y="${h - 34}" fill="${C.boneDim}" font-family="Arial Narrow, Arial, sans-serif" font-size="26" letter-spacing="6">PLACEHOLDER / ${s.label}</text>
</svg>`,
  );
});

/* ------------------------------------------------------ 4. TRACK ARTWORK --- */
/** 1000×1000 square covers. Geometric, one accent each. */
const artAccents = [
  C.orange,
  C.blood,
  C.orange,
  C.magenta,
  C.blood,
  C.magenta,
  C.electric,
  C.electric,
  C.orange,
  C.blood,
];

artAccents.forEach((accent, i) => {
  const n = String(i + 1).padStart(2, "0");
  const r = rng(101 + i * 7);
  const size = 1000;
  const shapes = Array.from({ length: 5 }, (_, k) => {
    const cx = 150 + r() * 700;
    const cy = 150 + r() * 700;
    const rad = 60 + r() * 320;
    return k % 2 === 0
      ? `<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${rad.toFixed(0)}" fill="none" stroke="${accent}" stroke-width="${(2 + r() * 8).toFixed(1)}" opacity="${(0.25 + r() * 0.5).toFixed(2)}"/>`
      : `<rect x="${(cx - rad / 2).toFixed(0)}" y="${(cy - rad / 2).toFixed(0)}" width="${rad.toFixed(0)}" height="${rad.toFixed(0)}" fill="${accent}" opacity="${(0.08 + r() * 0.2).toFixed(2)}" transform="rotate(${(r() * 45).toFixed(1)} ${cx.toFixed(0)} ${cy.toFixed(0)})"/>`;
  }).join("\n  ");

  writeFileSync(
    join(out, `art-${n}.svg`),
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  ${grainFilter(`ga${i}`, 1.1)}
  <rect width="${size}" height="${size}" fill="${C.charcoal}"/>
  <rect width="${size}" height="${size}" fill="${C.void}" opacity="0.6"/>
  ${shapes}
  <path d="M0 ${size} L${size} 0" stroke="${accent}" stroke-width="1.5" opacity="0.4"/>
  <rect width="${size}" height="${size}" filter="url(#ga${i})" opacity="0.4" style="mix-blend-mode:overlay"/>
  <text x="48" y="${size - 56}" fill="${C.bone}" font-family="Arial Narrow, Arial, sans-serif" font-size="46" letter-spacing="10" opacity="0.8">ART ${n}</text>
  <text x="48" y="${size - 110}" fill="${accent}" font-family="Arial Narrow, Arial, sans-serif" font-size="30" letter-spacing="8">PLACEHOLDER</text>
</svg>`,
  );
});

/* ------------------------------------------------------- 5. LIVE ARCHIVE --- */
/** 3:2 landscape performance stand-ins, treated black / red / dark blue. */
const liveScenes = [
  { seed: 201, accent: C.bone, tint: C.void, label: "FESTIVAL" },
  { seed: 211, accent: C.blood, tint: "#100426", label: "DJ BOOTH" },
  { seed: 223, accent: C.electric, tint: "#031A18", label: "CROWD" },
  { seed: 233, accent: C.orange, tint: "#14190A", label: "PERFORMANCE" },
  { seed: 241, accent: C.orange, tint: "#111508", label: "CLUB" },
  { seed: 251, accent: C.magenta, tint: "#1E0619", label: "BOOTH" },
  { seed: 263, accent: C.electric, tint: "#031A18", label: "OPEN AIR" },
  { seed: 271, accent: C.blood, tint: "#100426", label: "LIVE" },
];

liveScenes.forEach((s, i) => {
  const r = rng(s.seed);
  const w = 1200;
  const h = 800;
  const crowd = Array.from({ length: 46 }, () => {
    const x = r() * w;
    const bh = 60 + r() * 220;
    const bw = 10 + r() * 26;
    return `<rect x="${x.toFixed(0)}" y="${(h - bh).toFixed(0)}" width="${bw.toFixed(0)}" height="${bh.toFixed(0)}" fill="${C.void}" opacity="0.85"/>`;
  }).join("\n    ");
  const beams = Array.from({ length: 6 }, () => {
    const x = r() * w;
    return `<path d="M${x.toFixed(0)} 0 L${(x + 40 + r() * 120).toFixed(0)} ${h} L${(x - 40 - r() * 120).toFixed(0)} ${h} Z" fill="${s.accent}" opacity="${(0.05 + r() * 0.14).toFixed(2)}"/>`;
  }).join("\n    ");

  writeFileSync(
    join(out, `live-0${i + 1}.svg`),
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  ${grainFilter(`gl${i}`, 0.7)}
  <rect width="${w}" height="${h}" fill="${s.tint}"/>
  <ellipse cx="${w / 2}" cy="${h * 0.25}" rx="${w * 0.45}" ry="${h * 0.35}" fill="${s.accent}" opacity="0.2"/>
  <g>
    ${beams}
  </g>
  <g>
    ${crowd}
  </g>
  <rect y="${h * 0.72}" width="${w}" height="${h * 0.28}" fill="${C.void}" opacity="0.65"/>
  <rect width="${w}" height="${h}" filter="url(#gl${i})" opacity="0.42" style="mix-blend-mode:overlay"/>
  <text x="36" y="52" fill="${C.boneDim}" font-family="Arial Narrow, Arial, sans-serif" font-size="24" letter-spacing="7">PLACEHOLDER / ${s.label}</text>
</svg>`,
  );
});

/* ---------------------------------------------------- 6. SHOWREEL POSTER --- */
writeFileSync(
  join(out, "showreel-poster.svg"),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080">
  ${grainFilter("gs", 0.6)}
  <rect width="1920" height="1080" fill="${C.void}"/>
  <ellipse cx="960" cy="420" rx="820" ry="520" fill="${C.blood}" opacity="0.22"/>
  <ellipse cx="960" cy="380" rx="420" ry="300" fill="${C.orange}" opacity="0.16"/>
  <path d="M760 240 L1160 240 L1120 700 L960 900 L800 700 Z" fill="${C.void}" opacity="0.92"/>
  <path d="M830 400 L930 400 L900 500 L830 470 Z" fill="${C.orange}" opacity="0.85"/>
  <path d="M1090 400 L990 400 L1020 500 L1090 470 Z" fill="${C.orange}" opacity="0.85"/>
  <g stroke="${C.orange}" stroke-width="3" opacity="0.7">
    <path d="M900 600 L900 680 M940 600 L940 700 M980 600 L980 700 M1020 600 L1020 680"/>
    <path d="M870 590 L1050 590"/>
  </g>
  <g stroke="${C.boneDim}" stroke-width="2" opacity="0.3">
    <path d="M120 120 L200 120 M120 120 L120 200"/>
    <path d="M1800 120 L1720 120 M1800 120 L1800 200"/>
    <path d="M120 960 L200 960 M120 960 L120 880"/>
    <path d="M1800 960 L1720 960 M1800 960 L1800 880"/>
  </g>
  <rect width="1920" height="1080" filter="url(#gs)" opacity="0.4" style="mix-blend-mode:overlay"/>
  <text x="128" y="1010" fill="${C.boneDim}" font-family="Arial Narrow, Arial, sans-serif" font-size="30" letter-spacing="10">PLACEHOLDER POSTER / DROP showreel.mp4 IN /public/media</text>
</svg>`,
);

/* ------------------------------------------------------- 7. PRESS PHOTO ---- */
/** Square portrait stand-in used by the booking drawer + credibility block. */
writeFileSync(
  join(out, "portrait.svg"),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 900" width="900" height="900">
  ${grainFilter("gp", 0.8)}
  <rect width="900" height="900" fill="${C.charcoal}"/>
  <ellipse cx="450" cy="360" rx="330" ry="330" fill="${C.blood}" opacity="0.25"/>
  <path d="M320 200 L580 200 L560 560 L450 700 L340 560 Z" fill="${C.void}" opacity="0.95"/>
  <path d="M360 320 L430 320 L410 400 L360 380 Z" fill="${C.orange}"/>
  <path d="M540 320 L470 320 L490 400 L540 380 Z" fill="${C.orange}"/>
  <g stroke="${C.orange}" stroke-width="3">
    <path d="M400 470 L400 540 M430 470 L430 560 M470 470 L470 560 M500 470 L500 540"/>
    <path d="M375 460 L525 460"/>
  </g>
  <rect width="900" height="900" filter="url(#gp)" opacity="0.4" style="mix-blend-mode:overlay"/>
  <text x="40" y="850" fill="${C.boneDim}" font-family="Arial Narrow, Arial, sans-serif" font-size="26" letter-spacing="7">PLACEHOLDER PORTRAIT</text>
</svg>`,
);

console.log("Placeholders written to public/placeholders");
