import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // Relative base so the operator app works wherever it's hosted
  // (its own subdomain, a /operator/ sub-path, or a static file server).
  base: "./",
  plugins: [react()],
});
