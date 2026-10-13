import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Placeholder art is shipped as SVG in /public/placeholders so that the
    // mockup has zero binary asset dependencies. Replace with real JPG/WebP
    // photography before production (see README > Replacing images).
    dangerouslyAllowSVG: true,
    contentDispositionType: "inline",
    // SVG placeholders are never rasterised, so the optimizer is a no-op here.
    // Remove this once real raster photography lands.
    unoptimized: true,
  },
  // three.js ships untranspiled ESM examples; keep the transpile hint explicit
  // so future GLB loaders / postprocessing additions do not break the build.
  transpilePackages: ["three"],
};

export default nextConfig;
