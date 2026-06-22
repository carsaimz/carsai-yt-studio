// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const preset = process.env.NITRO_PRESET ?? "vercel";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
    // Use NITRO_PRESET env var so the same code builds for Vercel, Cloudflare,
    // Node server, or static — set it in vercel.json / workflow env vars.
    nitro: { preset },
  },
});
