"use client";

/**
 * ============================================================================
 * MELT SHADER — the psychedelic background
 * ============================================================================
 * One raw three.js WebGLRenderer driving one full-bleed quad. Mounted once and
 * never remounted: switching set (psytrance / psytech) only pushes new targets
 * into uniforms, which are interpolated on the GPU so palettes crossfade.
 *
 * The look is a three-level domain-warped fbm (q -> w -> f): the field folds
 * into itself, which reads as liquid / wax / oil rather than noise. On top:
 *   - an iridescent cosine palette whose hue follows the warp (oil-slick),
 *     bounded per mode so it melts within one colour family instead of
 *     exploding through the whole rainbow
 *   - a luminance mask so most of the field stays dark and the colour lives
 *     in the folds
 *   - "tracers": thin contour lines with a slight chromatic split
 *   - thin-film iridescence only on the brightest crests
 *   - slow breathing, a gentle vortex, and a downward drift (the melt)
 *
 * Performance: the field is smooth, so it renders below device resolution
 * (RENDER_SCALE) and is upscaled by CSS; the grain overlay hides the softness.
 * Lifecycle: ResizeObserver sizing, DPR caps by tier, rAF cancelled and all
 * GPU objects disposed on unmount, paused off-screen / hidden tab, reduced
 * motion freezes the clock on one composed frame.
 */

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { cn } from "@/lib/utils";
import {
  qualityProfile,
  resolveDpr,
  supportsWebGL,
  type QualityTier,
} from "@/lib/webgl";
import { hexToRgb } from "@/lib/utils";

export type ShaderMode = "psytrance" | "psytech";

/** Fraction of the (DPR-capped) resolution the field is rendered at. */
const RENDER_SCALE: Record<QualityTier, number> = { high: 0.7, medium: 0.55, low: 0.5 };

export interface MeltShaderProps {
  mode?: ShaderMode;
  /** Time multiplier. 1 = the mode's natural tempo. */
  speed?: number;
  /** Warp amplitude multiplier. */
  intensity?: number;
  /** 0-1. How much the pointer bends the field. 0 disables pointer tracking. */
  mouseInfluence?: number;
  /** 0-1. Darkens the centre so overlaid display type stays legible. */
  centerDim?: number;
  /** Render quality tier. Controls octave count and DPR ceiling. */
  quality?: QualityTier;
  /** Freeze the clock (reduced motion). Still renders one composed frame. */
  paused?: boolean;
  className?: string;
}

/* --------------------------------------------------------- MODE PALETTES --- */
/**
 * Cosine palette  colour(t) = a + b * cos(2π (c t + d))  per mode, plus the
 * field's character. Tuned so each mode stays inside one family:
 *   psytrance  ultraviolet / magenta / electric blue, euphoric and liquid
 *   psytech    aqua / acid green / periwinkle, tighter and more metallic
 */
interface ModeLook {
  base: [number, number, number];
  a: [number, number, number];
  b: [number, number, number];
  c: [number, number, number];
  d: [number, number, number];
  warp: number;
  contour: number;
  drip: number;
  hueSpread: number;
  /** CSS fallback colours (no WebGL / before first frame). */
  fallback: [string, string, string];
}

const MODE_LOOK: Record<ShaderMode, ModeLook> = {
  psytrance: {
    base: [0.03, 0.01, 0.055],
    a: [0.5, 0.22, 0.6],
    b: [0.48, 0.24, 0.4],
    c: [1.0, 1.0, 1.0],
    d: [0.45, 0.75, 0.05],
    warp: 1.0,
    contour: 0.8,
    drip: 1.0,
    hueSpread: 0.62,
    fallback: ["#08030F", "#7C2BD9", "#E0359E"],
  },
  psytech: {
    base: [0.006, 0.022, 0.03],
    a: [0.17, 0.52, 0.52],
    b: [0.2, 0.42, 0.46],
    c: [1.0, 1.0, 1.0],
    d: [0.55, 0.15, 0.35],
    warp: 0.85,
    contour: 1.0,
    drip: 0.7,
    hueSpread: 0.75,
    fallback: ["#020A0C", "#1BB89A", "#6AE03A"],
  },
};

/* -------------------------------------------------------------- SHADERS --- */

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
precision highp float;

uniform float u_time;
uniform vec2  u_resolution;
uniform vec2  u_mouse;
uniform float u_mouseInfluence;
uniform float u_speed;
uniform float u_intensity;
uniform float u_warp;
uniform float u_centerDim;
uniform float u_contour;
uniform float u_drip;
uniform float u_hueSpread;
uniform int   u_octaves;
uniform vec3  u_base;
uniform vec3  u_palA;
uniform vec3  u_palB;
uniform vec3  u_palC;
uniform vec3  u_palD;

varying vec2 vUv;

mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

const mat2 OCT = mat2(0.80, 0.60, -0.60, 0.80);

float fbm(vec2 p) {
  float amp = 0.5;
  float sum = 0.0;
  for (int i = 0; i < 6; i++) {
    if (i >= u_octaves) break;
    sum += amp * noise(p);
    p = OCT * p * 2.03 + vec2(1.7, 9.2);
    amp *= 0.5;
  }
  return sum;
}

vec3 palette(float t) {
  return u_palA + u_palB * cos(6.28318 * (u_palC * t + u_palD));
}

void main() {
  vec2 uv = vUv;
  float aspect = u_resolution.x / max(u_resolution.y, 1.0);
  vec2 p = (uv - 0.5) * vec2(aspect, 1.0);
  float t = u_time * u_speed;

  // Breathing: the whole field inhales and exhales very slowly.
  p *= 1.0 + 0.05 * sin(t * 0.31);

  // Pointer: a local liquid swirl around the cursor.
  vec2 m = (u_mouse - 0.5) * vec2(aspect, 1.0);
  vec2 dm = p - m;
  p = m + rot(u_mouseInfluence * 1.4 * exp(-dot(dm, dm) * 5.0)) * dm;

  // Slow vortex, stronger near the centre.
  float r = length(p);
  p = rot(0.5 * u_warp * sin(t * 0.06) / (0.7 + r * 1.6)) * p;

  // Melt: stretch vertically and let the field slide downward like wax.
  p *= vec2(1.05, 1.05 * (1.0 - 0.3 * u_drip));
  p.y += t * 0.045 * u_drip;

  // Three-level domain warp.
  vec2 q = vec2(
    fbm(p + vec2(0.0, t * 0.11)),
    fbm(p + vec2(5.2, 1.3) - vec2(t * 0.08, 0.0))
  );
  vec2 w = vec2(
    fbm(p + 3.8 * u_warp * q + vec2(1.7, 9.2) + t * 0.13),
    fbm(p + 3.8 * u_warp * q + vec2(8.3, 2.8) - t * 0.10)
  );
  float f = fbm(p + 3.4 * u_warp * w + vec2(t * 0.04, -t * 0.02));

  // Iridescent hue, oil-slick style: phase driven by the warp itself.
  float hue = (f * 1.35 + length(q) * 0.55 + w.x * 0.45) * u_hueSpread + 0.14 * sin(t * 0.045);
  vec3 iri = palette(hue);

  // Luminance mask: most of the field stays dark, colour lives in the folds.
  float lum = smoothstep(0.16, 0.88, f * f * 1.6 + 0.4 * w.y);
  vec3 col = mix(u_base, iri, lum * 0.9 * u_intensity);

  // Depth: deep valleys sink back toward the base.
  col *= 0.5 + 0.7 * smoothstep(0.15, 0.95, length(w));

  // Tracers: liquid contour lines with a chromatic split, like visual trails.
  float ph = f * 4.0 - t * 0.06;
  vec3 tr = vec3(
    smoothstep(0.11, 0.0, abs(fract(ph + 0.035) - 0.5)),
    smoothstep(0.11, 0.0, abs(fract(ph) - 0.5)),
    smoothstep(0.11, 0.0, abs(fract(ph - 0.035) - 0.5))
  );
  col += palette(hue + 0.33) * tr * u_contour * (0.08 + 0.42 * lum);

  // Thin-film iridescence only on the crests: the oil-slick rainbow.
  float crest = smoothstep(0.62, 1.0, lum);
  col += palette(fract(f * 2.6 + w.y)) * crest * 0.22 * u_intensity;

  // Soft sheen on the crests.
  col += vec3(1.0) * pow(lum, 5.0) * 0.12;

  // Vignette + centre dim for legibility of overlaid type.
  float d = length((uv - 0.5) * vec2(1.2, 1.0));
  col *= 1.0 - smoothstep(0.35, 0.95, d) * 0.8;
  col *= 1.0 - u_centerDim * (1.0 - smoothstep(0.0, 0.6, d));

  float dither = fract(sin(dot(uv * u_resolution, vec2(12.9898, 78.233))) * 43758.5453);
  col += (dither - 0.5) * 0.012;

  gl_FragColor = vec4(max(col, 0.0), 1.0);
}
`;

/* ------------------------------------------------------------ COMPONENT --- */

const v3 = (x: [number, number, number]) => new THREE.Vector3(x[0], x[1], x[2]);

/** Tier → fbm octaves. More octaves = finer detail in the folds. */
const OCTAVES: Record<QualityTier, number> = { high: 5, medium: 4, low: 3 };

export function MeltShader({
  mode = "psytrance",
  speed = 1,
  intensity = 1,
  mouseInfluence = 0.35,
  centerDim = 0.35,
  quality = "high",
  paused = false,
  className,
}: MeltShaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasReady, setCanvasReady] = useState(false);

  const look = MODE_LOOK[mode];
  const targetsRef = useRef({
    base: v3(look.base),
    a: v3(look.a),
    b: v3(look.b),
    c: v3(look.c),
    d: v3(look.d),
    warp: look.warp,
    contour: look.contour,
    drip: look.drip,
    hueSpread: look.hueSpread,
    speed,
    intensity,
    mouseInfluence,
    centerDim,
  });
  const pausedRef = useRef(paused);

  /* Keep animation targets in sync without touching the WebGL context. */
  useEffect(() => {
    const l = MODE_LOOK[mode];
    const t = targetsRef.current;
    t.base.set(...l.base);
    t.a.set(...l.a);
    t.b.set(...l.b);
    t.c.set(...l.c);
    t.d.set(...l.d);
    t.warp = l.warp;
    t.contour = l.contour;
    t.drip = l.drip;
    t.hueSpread = l.hueSpread;
    t.speed = speed;
    t.intensity = intensity;
    t.mouseInfluence = mouseInfluence;
    t.centerDim = centerDim;
  }, [mode, speed, intensity, mouseInfluence, centerDim]);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    setCanvasReady(false);

    const profile = qualityProfile[quality];
    if (!profile.webgl || !supportsWebGL()) {
      container.dataset.shaderFallback = "true";
      return;
    }

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: false,
        alpha: false,
        powerPreference: "high-performance",
        stencil: false,
        depth: false,
      });
    } catch {
      container.dataset.shaderFallback = "true";
      return;
    }

    delete container.dataset.shaderFallback;

    const onContextLost = (event: Event) => {
      event.preventDefault();
      container.dataset.shaderFallback = "true";
      setCanvasReady(false);
    };
    const onContextRestored = () => {
      delete container.dataset.shaderFallback;
    };
    canvas.addEventListener("webglcontextlost", onContextLost);
    canvas.addEventListener("webglcontextrestored", onContextRestored);

    renderer.setClearColor(0x07050c, 1);

    const scene = new THREE.Scene();
    const camera = new THREE.Camera();
    const geometry = new THREE.PlaneGeometry(2, 2);

    const t0 = targetsRef.current;
    const uniforms: Record<string, THREE.IUniform> = {
      u_time: { value: 0 },
      u_resolution: { value: new THREE.Vector2(1, 1) },
      u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
      u_mouseInfluence: { value: t0.mouseInfluence },
      u_speed: { value: t0.speed },
      u_intensity: { value: t0.intensity },
      u_warp: { value: t0.warp },
      u_centerDim: { value: t0.centerDim },
      u_contour: { value: t0.contour },
      u_drip: { value: t0.drip },
      u_hueSpread: { value: t0.hueSpread },
      u_octaves: { value: OCTAVES[quality] },
      u_base: { value: t0.base.clone() },
      u_palA: { value: t0.a.clone() },
      u_palB: { value: t0.b.clone() },
      u_palC: { value: t0.c.clone() },
      u_palD: { value: t0.d.clone() },
    };

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      depthTest: false,
      depthWrite: false,
    });

    const quad = new THREE.Mesh(geometry, material);
    quad.frustumCulled = false;
    scene.add(quad);

    /* ------------------------------------------------------------ sizing --- */
    const applySize = (width: number, height: number) => {
      if (width === 0 || height === 0) return;
      const dpr = resolveDpr(quality) * RENDER_SCALE[quality];
      renderer.setPixelRatio(dpr);
      renderer.setSize(width, height, false);
      (uniforms.u_resolution.value as THREE.Vector2).set(width * dpr, height * dpr);
    };

    const rect = container.getBoundingClientRect();
    applySize(rect.width, rect.height);

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      applySize(entry.contentRect.width, entry.contentRect.height);
    });
    resizeObserver.observe(container);

    /* ---------------------------------------------------------- pointer --- */
    const pointerTarget = new THREE.Vector2(0.5, 0.5);
    const finePointer = window.matchMedia("(pointer: fine)").matches;

    const onPointerMove = (event: PointerEvent) => {
      const box = container.getBoundingClientRect();
      pointerTarget.set(
        (event.clientX - box.left) / Math.max(box.width, 1),
        1 - (event.clientY - box.top) / Math.max(box.height, 1),
      );
    };
    if (finePointer && t0.mouseInfluence > 0) {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
    }

    /* ------------------------------------------------- visibility gating --- */
    let inViewport = true;
    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        inViewport = entries[0]?.isIntersecting ?? true;
      },
      { rootMargin: "120px" },
    );
    intersectionObserver.observe(container);

    let documentVisible = document.visibilityState !== "hidden";
    const onVisibility = () => {
      documentVisible = document.visibilityState !== "hidden";
      lastFrame = performance.now();
    };
    document.addEventListener("visibilitychange", onVisibility);

    /* ------------------------------------------------------------- loop --- */
    let frame = 0;
    let lastFrame = performance.now();
    // Start mid-flow so the first frame is already a composed melt.
    let elapsed = 18;
    const frameBudget = profile.fpsCap > 0 ? 1000 / profile.fpsCap : 0;
    let accumulator = 0;
    let hasRenderedOnce = false;

    const smooth = (uniform: THREE.IUniform, target: number, k: number) => {
      uniform.value += (target - (uniform.value as number)) * k;
    };

    const render = (now: number) => {
      frame = requestAnimationFrame(render);

      const delta = Math.min(now - lastFrame, 100);
      lastFrame = now;

      const active = inViewport && documentVisible;
      if (!active && hasRenderedOnce) return;

      if (frameBudget > 0) {
        accumulator += delta;
        if (accumulator < frameBudget && hasRenderedOnce) return;
        accumulator = 0;
      }

      const t = targetsRef.current;
      if (!pausedRef.current) elapsed += delta / 1000;
      uniforms.u_time.value = elapsed;

      // Slow k = palettes melt into each other over ~1s when the set changes.
      const k = Math.min(1, (delta / 1000) * 1.6);
      (uniforms.u_base.value as THREE.Vector3).lerp(t.base, k);
      (uniforms.u_palA.value as THREE.Vector3).lerp(t.a, k);
      (uniforms.u_palB.value as THREE.Vector3).lerp(t.b, k);
      (uniforms.u_palC.value as THREE.Vector3).lerp(t.c, k);
      (uniforms.u_palD.value as THREE.Vector3).lerp(t.d, k);
      smooth(uniforms.u_warp, t.warp, k);
      smooth(uniforms.u_contour, t.contour, k);
      smooth(uniforms.u_drip, t.drip, k);
      smooth(uniforms.u_hueSpread, t.hueSpread, k);
      smooth(uniforms.u_speed, t.speed, k);
      smooth(uniforms.u_intensity, t.intensity, k);
      smooth(uniforms.u_centerDim, t.centerDim, k);
      smooth(uniforms.u_mouseInfluence, finePointer ? t.mouseInfluence : 0, k);
      (uniforms.u_mouse.value as THREE.Vector2).lerp(pointerTarget, k * 0.8);

      renderer.render(scene, camera);

      if (!hasRenderedOnce) setCanvasReady(true);
      hasRenderedOnce = true;
    };

    frame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      canvas.removeEventListener("webglcontextrestored", onContextRestored);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
    // Context is created once per tier; mode/speed changes flow through targetsRef.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quality]);

  const [fbBase, fbA, fbB] = look.fallback;

  return (
    <div
      ref={containerRef}
      className={cn("relative isolate overflow-hidden bg-void", className)}
      aria-hidden="true"
    >
      {/* CSS fallback — painted underneath for no-WebGL and before first frame. */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(70% 60% at 30% 25%, ${hexToCss(fbA, 0.38)} 0%, transparent 60%),
            radial-gradient(60% 55% at 75% 70%, ${hexToCss(fbB, 0.3)} 0%, transparent 62%),
            radial-gradient(50% 40% at 55% 45%, ${hexToCss(fbA, 0.18)} 0%, transparent 70%),
            ${fbBase}
          `,
          transition: "background 900ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 block h-full w-full"
        style={{ opacity: canvasReady ? 1 : 0, transition: "opacity 400ms ease-out" }}
      />
      <div className="grain-layer" />
    </div>
  );
}

/** Small helper for the CSS fallback gradients. */
function hexToCss(hex: string, alpha: number) {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${alpha})`;
}

export default MeltShader;
