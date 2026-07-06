import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // Project pages are served from https://ravinduyas.github.io/<repo>/,
  // so assets must be requested from that sub-path.
  base: "/whale-watching-booking-engine/",
  plugins: [react()],
});
