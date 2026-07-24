// Path module
import path from "path";

// Vite
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // maplibre-gl web worker'i Vite pre-bundle'da buzilib, GeoJSON qatlamlari yuklanmaydi.
  optimizeDeps: {
    exclude: ["maplibre-gl"],
  },
});
