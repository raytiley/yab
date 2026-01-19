import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    tailwindcss(),
    reactRouter(),
    tsconfigPaths(),
    VitePWA({
      // Use null for SSR compatibility - we'll register manually
      injectRegister: null,
      registerType: "autoUpdate",
      devOptions: {
        enabled: true,
      },
      manifest: {
        name: "RayOS",
        short_name: "RayOS",
        description: "Personal tracking and improvement tools",
        theme_color: "#00ccff",
        background_color: "#0d0d0d",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "pwa-64x64.png",
            sizes: "64x64",
            type: "image/png",
          },
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "maskable-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        // Import push notification handlers
        importScripts: ["/sw-push.js"],
        // Navigation fallback for offline support
        navigateFallback: "/offline",
        navigateFallbackDenylist: [
          /^\/api\//,
          /^\/auth\//,
        ],
        runtimeCaching: [
          // Static assets - CacheFirst
          {
            urlPattern: /\.(?:js|css|woff2?|ttf|eot)$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "static-assets",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
          // Images - CacheFirst
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "images",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
          // Blog posts pages - StaleWhileRevalidate
          {
            urlPattern: /^\/posts/,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "blog-posts",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24, // 1 day
              },
            },
          },
          // Habits pages - NetworkFirst (freshness matters)
          {
            urlPattern: /^\/habits/,
            handler: "NetworkFirst",
            options: {
              cacheName: "habits",
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60, // 1 hour
              },
              networkTimeoutSeconds: 10,
            },
          },
          // API routes - NetworkOnly
          {
            urlPattern: /^\/api\//,
            handler: "NetworkOnly",
          },
        ],
      },
    }),
  ],
  server: {
    port: 7000,
  },
});
