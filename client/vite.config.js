import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.png"],
      manifest: {
        name: "KilimoRada",
        short_name: "KilimoRada",
        description: "KilimoRada staff dashboard for extension officers and admins.",
        theme_color: "#15803D",
        background_color: "#F7F9F8",
        display: "standalone",
        start_url: "/",
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
        ],
      },
      workbox: {
        // Never cache API calls: always show live data
        navigateFallbackDenylist: [/^\/api/, /^\/apidocs/],
        runtimeCaching: [{ urlPattern: /^\/api\//, handler: "NetworkOnly" }],
      },
    }),
  ],
  server: {
    port: 5173,
    // Send /api requests to Flask so the login cookie works
    proxy: {
      "/api": "http://localhost:5555",
    },
  },
});