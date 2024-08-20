import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/carousel.ts"),
      name: "carousel",
      fileName: (format) => `carousel.${format}.js`,
      formats: ["iife"],
    },
  },
});
