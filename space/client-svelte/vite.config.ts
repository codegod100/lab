import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [sveltekit()],
  optimizeDeps: {
    include: [
      "@clockworklabs/spacetimedb-sdk",
      "./src/module_bindings/*",
      "./src/lib/*",
    ],
  },
});
