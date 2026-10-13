// eslint-config-next 16 ships native flat configs, so no FlatCompat wrapper.
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "next-env.d.ts",
      // Build-time asset generator (plain Node ESM, not part of the app bundle)
      "scripts/**",
      // Vendored Claude Code skill tooling — not project source
      ".claude/**",
    ],
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    rules: {
      // React Three Fiber puts dozens of three.js-only props on <mesh>,
      // <meshStandardMaterial> etc. that eslint-plugin-react cannot know about.
      "react/no-unknown-property": "off",
    },
  },
];

export default eslintConfig;
